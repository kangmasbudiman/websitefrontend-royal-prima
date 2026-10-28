import { useEffect, useMemo, useState } from "react";
import type { Dokter, Jadwal } from "../../lib/types";
import { gambarPertama, waUrl } from "../../lib/utils";

const HARI_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const HARI_SHORT: Record<string, string> = {
  Senin: "Sen",
  Selasa: "Sel",
  Rabu: "Rab",
  Kamis: "Kam",
  Jumat: "Jum",
  Sabtu: "Sab",
  Minggu: "Min",
};

function initialsOf(nama: string) {
  return nama
    .replace(/,.*$/, "")
    .split(" ")
    .filter((w) => w.length > 2 && !/^sp[./]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

// Index hari ini (Senin=0 … Minggu=6) berdasarkan zona waktu Asia/Jakarta.
function hariIndexJakarta(base = new Date()): number {
  const name = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    timeZone: "Asia/Jakarta",
  }).format(base);
  const i = HARI_ORDER.indexOf(name);
  return i >= 0 ? i : 0;
}

const fmtTanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Jakarta",
});

// Tanggal (minggu berjalan) untuk hari ke-i, mis. "28 Okt".
function dateLabelForIdx(i: number, base: Date): string {
  const diff = i - hariIndexJakarta(base);
  return fmtTanggal.format(new Date(base.getTime() + diff * 86400000));
}

// "08:00:00" → menit sejak tengah malam.
function minutesOf(t: string | null | undefined): number {
  if (!t) return -1;
  const [h, m] = t.split(":");
  return (parseInt(h ?? "0", 10) || 0) * 60 + (parseInt(m ?? "0", 10) || 0);
}

const jam = (t: string | null | undefined) => t?.slice(0, 5) ?? "";

type Entry = { dokter: Dokter; sesi: Jadwal[] };

export default function JadwalDokter({
  items,
  jadwal,
  waPhone,
  todayHari,
}: {
  items: Dokter[];
  jadwal: Jadwal[];
  waPhone?: string | null;
  /** Hari ini menurut server (Asia/Jakarta) — nilai awal agar SSR & hydration konsisten. */
  todayHari?: string | null;
}) {
  const initialIdx = todayHari ? Math.max(0, HARI_ORDER.indexOf(todayHari)) : 0;
  const [todayIdx, setTodayIdx] = useState(initialIdx);
  const [selected, setSelected] = useState(HARI_ORDER[initialIdx]);
  const [query, setQuery] = useState("");
  const [nowMin, setNowMin] = useState<number | null>(null);

  // Koreksi jam & tanggal dari sisi client (zona Asia/Jakarta), sinkron tiap 30 detik.
  useEffect(() => {
    const tick = () => {
      const base = new Date();
      setTodayIdx(hariIndexJakarta(base));
      const t = new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: "Asia/Jakarta",
      }).format(base);
      const [h, m] = t.split(":").map((v) => parseInt(v, 10) || 0);
      setNowMin(h * 60 + m);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const jadwalByDokter = useMemo(() => {
    const map = new Map<number, Jadwal[]>();
    for (const j of jadwal) {
      const arr = map.get(j.dokterid) ?? [];
      arr.push(j);
      map.set(j.dokterid, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => minutesOf(a.jamMulai) - minutesOf(b.jamMulai));
    return map;
  }, [jadwal]);

  // Map hari → daftar dokter yang praktik hari itu (beserta seluruh sesinya).
  const byDay = useMemo(() => {
    const map = new Map<string, Entry[]>();
    const aktif = items.filter((d) => d.status !== false);
    for (const d of aktif) {
      const sesi = jadwalByDokter.get(d.id) ?? [];
      if (sesi.length === 0) continue;
      for (const j of sesi) {
        const arr = map.get(j.hari) ?? [];
        let entry = arr.find((e) => e.dokter.id === d.id);
        if (!entry) {
          entry = { dokter: d, sesi };
          arr.push(entry);
          map.set(j.hari, arr);
        }
      }
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const pa = a.dokter.poliklinik?.nama ?? "zzz";
        const pb = b.dokter.poliklinik?.nama ?? "zzz";
        if (pa !== pb) return pa.localeCompare(pb);
        return a.dokter.nama.localeCompare(b.dokter.nama);
      });
    }
    return map;
  }, [items, jadwalByDokter]);

  const selIdx = Math.max(0, HARI_ORDER.indexOf(selected));
  const isToday = selIdx === todayIdx;
  const dayEntries = byDay.get(selected) ?? [];

  const filtered = useMemo(() => {
    if (!query.trim()) return dayEntries;
    const q = query.toLowerCase();
    return dayEntries.filter(
      (e) =>
        e.dokter.nama.toLowerCase().includes(q) ||
        e.dokter.spesialist?.toLowerCase().includes(q) ||
        e.dokter.poliklinik?.nama?.toLowerCase().includes(q)
    );
  }, [dayEntries, query]);

  // Kartu dikelompokkan per poliklinik agar mudah dipindai.
  const groups = useMemo(() => {
    const m = new Map<string, Entry[]>();
    for (const e of filtered) {
      const k = e.dokter.poliklinik?.nama ?? "Lainnya";
      const arr = m.get(k) ?? [];
      arr.push(e);
      m.set(k, arr);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const nextDayWithData = useMemo(() => {
    for (let off = 1; off <= 7; off++) {
      const i = (selIdx + off) % 7;
      if ((byDay.get(HARI_ORDER[i])?.length ?? 0) > 0) return HARI_ORDER[i];
    }
    return null;
  }, [selIdx, byDay]);

  const totalDokter = byDay.get(selected)?.length ?? 0;
  const totalSesi = dayEntries.reduce((n, e) => n + e.sesi.filter((j) => j.hari === selected).length, 0);
  const todayLabel = `${HARI_ORDER[todayIdx]}, ${dateLabelForIdx(todayIdx, new Date())}`;

  return (
    <section id="jadwal-lengkap" className="bg-paper">
      {/* Pencarian */}
      <div className="wrap pt-8">
        <div className="relative max-w-md">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-d pointer-events-none">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="w-[18px] h-[18px]"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="Cari dokter di hari terpilih..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-line shadow-sm outline-none text-ink placeholder:text-muted-d text-[14px] focus:border-prima focus:ring-4 focus:ring-prima/10 transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-canvas hover:bg-prima-soft hover:text-prima text-muted flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Baris tab hari — sticky di bawah navbar */}
      <div className="sticky top-[68px] z-30 mt-6 bg-paper/95 backdrop-blur border-y border-line">
        <div className="wrap py-3">
          <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {HARI_ORDER.map((h, i) => {
              const count = byDay.get(h)?.length ?? 0;
              const active = h === selected;
              const isTodayTab = i === todayIdx;
              return (
                <button
                  key={h}
                  onClick={() => setSelected(h)}
                  aria-pressed={active}
                  className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-bold transition-all border ${
                    active
                      ? "bg-gradient-to-r from-prima to-prima-d text-white border-transparent shadow-md shadow-prima/25"
                      : "bg-white text-ink-soft border-line hover:border-prima/40 hover:text-prima"
                  }`}
                >
                  {isTodayTab && (
                    <span
                      className={`relative flex h-1.5 w-1.5 flex-shrink-0 ${
                        active ? "" : ""
                      }`}
                    >
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal" />
                    </span>
                  )}
                  <span className="sm:hidden">{HARI_SHORT[h] ?? h.slice(0, 3)}</span>
                  <span className="hidden sm:inline">{h}</span>
                  <span
                    className={`text-[11px] font-extrabold rounded-full min-w-5 px-1.5 py-0.5 ${
                      active ? "bg-white/20 text-white" : isTodayTab ? "bg-teal/10 text-teal-d" : "bg-canvas text-muted-d"
                    }`}
                  >
                    {count}
                  </span>
                  {isTodayTab && (
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                        active ? "bg-white/20 text-white" : "bg-teal text-white"
                      }`}
                    >
                      Hari ini
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="wrap py-10 md:py-12">
        <div key={selected} className="jd-in">
        {/* Ringkasan hari terpilih */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <h2 className="text-[22px] md:text-[26px] font-extrabold tracking-tight text-ink">
            Praktik Hari {selected}
          </h2>
          <span className="chip bg-prima-soft text-prima-d">{dateLabelForIdx(selIdx, new Date())}</span>
          {isToday && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal text-white text-[11px] font-bold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Hari ini · {todayLabel}
            </span>
          )}
          {totalDokter > 0 && (
            <span className="ml-auto text-[13px] font-semibold text-muted">
              {totalDokter} dokter · {totalSesi} sesi praktik
            </span>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center bg-prima-soft/70 rounded-full">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="w-9 h-9 text-prima"
              >
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-ink mb-1">
              {query ? "Dokter tidak ditemukan" : `Belum ada jadwal praktik hari ${selected}`}
            </h3>
            <p className="text-muted max-w-sm mx-auto mb-6">
              {query
                ? "Coba kata kunci lain atau pilih hari yang berbeda."
                : nextDayWithData
                  ? `Jadwal praktik tersedia hari ${nextDayWithData}. Silakan pilih hari lain di tab atas.`
                  : "Silakan hubungi resepsionis untuk informasi jadwal terbaru."}
            </p>
            {query ? (
              <button onClick={() => setQuery("")} className="btn btn-outline">
                Reset Pencarian
              </button>
            ) : nextDayWithData ? (
              <button onClick={() => setSelected(nextDayWithData)} className="btn btn-prima">
                Lihat Jadwal {nextDayWithData}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {groups.map(([poli, entries]) => (
              <div key={poli}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-[15px] font-extrabold text-ink">{poli.replace(/^Klinik\s+/i, "")}</h3>
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-[11px] font-bold text-muted-d">
                    {entries.length} dokter
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {entries.map((e) => (
                    <DokterJadwalCard
                      key={e.dokter.id}
                      entry={e}
                      hari={selected}
                      isToday={isToday}
                      todayIdx={todayIdx}
                      nowMin={nowMin}
                      waPhone={waPhone}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        </div>

        <p className="mt-10 text-center text-[12.5px] text-muted-d">
          Jadwal dapat berubah sewaktu-waktu. Untuk kepastian, silakan hubungi resepsionis sebelum datang.
        </p>
      </div>
    </section>
  );
}

function DokterJadwalCard({
  entry,
  hari,
  isToday,
  todayIdx,
  nowMin,
  waPhone,
}: {
  entry: Entry;
  hari: string;
  isToday: boolean;
  todayIdx: number;
  nowMin: number | null;
  waPhone?: string | null;
}) {
  const { dokter, sesi } = entry;
  const img = gambarPertama(dokter.potourl);
  const sesiHariIni = sesi.filter((j) => j.hari === hari);
  const hariLain = sesi.filter((j) => j.hari !== hari);
  const live = sesiHariIni.find(
    (j) => isToday && nowMin != null && nowMin >= minutesOf(j.jamMulai) && nowMin < minutesOf(j.jamSelesai)
  );
  const akanDatang =
    !live && isToday && nowMin != null && sesiHariIni.some((j) => minutesOf(j.jamMulai) > nowMin);
  const waHref =
    waUrl(
      waPhone,
      `Halo RS Royal Prima Jambi, saya ingin membuat janji temu dengan ${dokter.nama} (${hari}, ${sesiHariIni
        .map((j) => jam(j.jamMulai))
        .join(" & ")}).`
    ) || "#kontak";

  return (
    <article className="group relative flex gap-4 rounded-3xl bg-white border border-line shadow-[var(--sh-card)] hover:shadow-[var(--sh-card-hover)] hover:border-prima/25 hover:-translate-y-1 transition-all duration-500 p-4 sm:p-5">
      {/* Foto */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
        <div className="w-full h-full rounded-2xl overflow-hidden bg-prima-tint ring-1 ring-inset ring-black/5">
          {img ? (
            <img
              src={img}
              alt={dokter.nama}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-prima via-prima-l to-prima-d flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white/90 tracking-tight">
                {initialsOf(dokter.nama)}
              </span>
            </div>
          )}
        </div>
        {live && (
          <span className="absolute -top-1.5 -right-1.5 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-teal text-white text-[9px] font-extrabold uppercase tracking-wide shadow-lg shadow-teal/40">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            Live
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-extrabold text-[15.5px] leading-snug text-ink truncate">{dokter.nama}</h4>
            {dokter.spesialist && (
              <p className="text-[12.5px] font-semibold text-prima leading-snug truncate">{dokter.spesialist}</p>
            )}
          </div>
          {dokter.poliklinik?.nama && (
            <span className="flex-shrink-0 chip bg-prima-soft text-prima-d max-w-[45%] overflow-hidden">
              <span className="truncate">{dokter.poliklinik.nama.replace(/^Klinik\s+/i, "")}</span>
            </span>
          )}
        </div>

        {/* Sesi praktik hari terpilih */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {sesiHariIni.map((j) => {
            const isLive =
              isToday && nowMin != null && nowMin >= minutesOf(j.jamMulai) && nowMin < minutesOf(j.jamSelesai);
            return (
              <span
                key={j.id}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold tabular-nums ${
                  isLive
                    ? "bg-teal/10 text-teal-d ring-1 ring-teal/30"
                    : "bg-prima-soft text-prima-d"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3 h-3">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" strokeLinecap="round" />
                </svg>
                {jam(j.jamMulai)}–{jam(j.jamSelesai)}
              </span>
            );
          })}
        </div>

        {/* Status */}
        {live ? (
          <span className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-teal-d">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal" />
            </span>
            Sedang praktik sekarang
          </span>
        ) : akanDatang ? (
          <span className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-coral">
            <span className="w-1.5 h-1.5 rounded-full bg-coral" />
            Mulai pukul {jam(sesiHariIni.find((j) => minutesOf(j.jamMulai) > (nowMin ?? -1))?.jamMulai)}
          </span>
        ) : isToday && sesiHariIni.length > 0 ? (
          <span className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-d">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-d" />
            Praktik selesai untuk hari ini
          </span>
        ) : null}

        {/* Hari praktik lainnya */}
        {hariLain.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-d mr-1">Juga praktik:</span>
            {hariLain.map((j) => (
              <span
                key={j.id}
                className={`px-1.5 py-0.5 rounded-md text-[10.5px] font-bold ${
                  j.hari === HARI_ORDER[todayIdx] ? "bg-teal/10 text-teal-d" : "bg-canvas text-ink-soft"
                }`}
              >
                {HARI_SHORT[j.hari] ?? j.hari.slice(0, 3)} {jam(j.jamMulai)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center justify-end">
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[12.5px] font-bold text-prima hover:text-prima-d transition-colors group/cta"
          >
            Buat Janji
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="w-3.5 h-3.5 transition-transform group-hover/cta:translate-x-0.5"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
