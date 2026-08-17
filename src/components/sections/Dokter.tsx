import { useEffect, useMemo, useState } from "react";
import type { Dokter, Jadwal } from "../../lib/types";
import { gambarPertama, sortByHari } from "../../lib/utils";

type DokterWithPoli = Dokter & { jadwal?: Jadwal[] };

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

const SOCIAL_ICONS = {
  facebook:
    "M22 12a10 10 0 10-11.6 9.9V15h-2.5v-3h2.5V9.8c0-2.5 1.5-3.8 3.7-3.8 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 3h-2.3v6.9A10 10 0 0022 12z",
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.8.1 1.2 0 1.8.3 2.2.4.5.2.9.5 1.3.9.4.4.7.8.9 1.3.1.4.3 1 .4 2.2 0 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c0 1.2-.3 1.8-.4 2.2-.2.5-.5.9-.9 1.3-.4.4-.8.7-1.3.9-.4.1-1 .3-2.2.4-1.2 0-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2 0-1.8-.3-2.2-.4a3.5 3.5 0 01-1.3-.9 3.5 3.5 0 01-.9-1.3c-.1-.4-.3-1-.4-2.2 0-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c0-1.2.3-1.8.4-2.2.2-.5.5-.9.9-1.3.4-.4.8-.7 1.3-.9.4-.1 1-.3 2.2-.4 1.2-.1 1.6-.1 4.8-.1zm0 5.1a4.7 4.7 0 100 9.4 4.7 4.7 0 000-9.4zm0 7.7a3 3 0 110-6 3 3 0 010 6zm6-7.9a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z",
  twitter:
    "M22 5.8c-.8.4-1.6.6-2.5.7.9-.5 1.6-1.4 1.9-2.4-.8.5-1.7.9-2.7 1.1A4.2 4.2 0 0011.4 9c0 .3 0 .7.1 1A12 12 0 013 4.6a4.2 4.2 0 001.3 5.6c-.7 0-1.3-.2-1.9-.5v.1a4.2 4.2 0 003.4 4.1c-.6.2-1.3.2-1.9.1a4.2 4.2 0 003.9 2.9A8.4 8.4 0 012 18.6a12 12 0 006.5 1.9c7.8 0 12-6.4 12-12v-.5c.8-.6 1.5-1.3 2.1-2.2z",
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

function socialsOf(dokter: Dokter) {
  return (
    [
      { key: "facebook", url: dokter.facebook },
      { key: "instagram", url: dokter.instagram },
      { key: "twitter", url: dokter.twitter },
    ] as const
  ).filter((s) => s.url && s.url !== "-");
}

function nextPraktikDay(hariList: string[], todayIdx: number): string | null {
  const idxs = hariList.map((h) => HARI_ORDER.indexOf(h)).filter((i) => i >= 0);
  for (let off = 1; off <= 7; off++) {
    const t = (todayIdx + off) % 7;
    if (idxs.includes(t)) return HARI_ORDER[t];
  }
  return null;
}

export default function DokterSection({
  items,
  jadwal,
  poliklinikList,
}: {
  items: Dokter[];
  jadwal: Jadwal[];
  poliklinikList: { id: number; nama: string }[];
}) {
  const [filterPoli, setFilterPoli] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  // Dihitung setelah mount agar SSR dan client identik (hindari hydration mismatch).
  const [todayIdx, setTodayIdx] = useState<number | null>(null);

  useEffect(() => {
    setTodayIdx((new Date().getDay() + 6) % 7);
  }, []);

  const jadwalByDokter = useMemo(() => {
    const map = new Map<number, Jadwal[]>();
    for (const j of jadwal) {
      const arr = map.get(j.dokterid) ?? [];
      arr.push(j);
      map.set(j.dokterid, arr);
    }
    return map;
  }, [jadwal]);

  const dokterWithJadwal: DokterWithPoli[] = useMemo(() => {
    return items
      .filter((d) => d.status !== false)
      .map((d) => ({ ...d, jadwal: sortByHari(jadwalByDokter.get(d.id) ?? []) }));
  }, [items, jadwalByDokter]);

  const poliCount = useMemo(() => {
    const map = new Map<number, number>();
    for (const d of dokterWithJadwal) {
      if (d.poliklinikid != null) {
        map.set(d.poliklinikid, (map.get(d.poliklinikid) ?? 0) + 1);
      }
    }
    return map;
  }, [dokterWithJadwal]);

  const todayCount = useMemo(() => {
    if (todayIdx == null) return 0;
    const hari = HARI_ORDER[todayIdx];
    return dokterWithJadwal.filter((d) => d.jadwal?.some((j) => j.hari === hari)).length;
  }, [dokterWithJadwal, todayIdx]);

  const filtered = useMemo(() => {
    let arr = dokterWithJadwal;
    if (filterPoli !== "all") arr = arr.filter((d) => d.poliklinikid === filterPoli);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (d) => d.nama.toLowerCase().includes(q) || d.spesialist?.toLowerCase().includes(q)
      );
    }
    return arr;
  }, [dokterWithJadwal, filterPoli, search]);

  if (items.length === 0) return null;

  const activePoli = poliklinikList.find((p) => p.id === filterPoli);
  const headingTitle = activePoli
    ? `Spesialis ${activePoli.nama.replace(/^Klinik\s+/i, "")}`
    : "Tim Dokter Spesialis";
  const polisWithDoctors = poliklinikList.filter((p) => (poliCount.get(p.id) ?? 0) > 0);
  const [spotlight, ...rest] = filtered;

  return (
    <section id="dokter" className="section bg-canvas relative overflow-hidden">
      <div className="absolute top-20 -right-24 w-96 h-96 rounded-full bg-prima-soft blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-10 -left-24 w-96 h-96 rounded-full bg-teal/5 blur-3xl pointer-events-none" />

      <div className="wrap relative grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-10 items-start">
        <aside data-reveal className="lg:sticky lg:top-24 flex flex-col gap-5">
          <div>
            <div className="eyebrow mb-3 inline-flex">Tim Medis</div>
            <h2 className="text-[clamp(26px,3vw,38px)] font-extrabold leading-tight tracking-tight text-balance">
              {headingTitle}
            </h2>
            <p className="mt-3 text-muted text-[15px] leading-relaxed">
              {dokterWithJadwal.length} dokter berpengalaman dengan keahlian spesifik di
              setiap bidang, siap melayani Anda.
            </p>
          </div>

          {todayCount > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal/10 border border-teal/20 text-teal-d text-[13px] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal" />
              </span>
              {todayCount} dokter praktik hari ini
            </div>
          )}

          <div className="relative">
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
              placeholder="Cari nama dokter / spesialis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-line shadow-sm outline-none text-ink placeholder:text-muted-d text-[14.5px] focus:border-prima focus:ring-4 focus:ring-prima/10 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-canvas hover:bg-prima-soft hover:text-prima text-muted flex items-center justify-center transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-3.5 h-3.5"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {polisWithDoctors.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-d px-1">
                Spesialisasi
              </span>
              <FilterChip
                active={filterPoli === "all"}
                onClick={() => setFilterPoli("all")}
                count={dokterWithJadwal.length}
              >
                Semua
              </FilterChip>
              {polisWithDoctors.map((p) => (
                <FilterChip
                  key={p.id}
                  active={filterPoli === p.id}
                  onClick={() => setFilterPoli(p.id)}
                  count={poliCount.get(p.id) ?? 0}
                >
                  {p.nama.replace(/^Klinik\s+/i, "")}
                </FilterChip>
              ))}
            </div>
          )}
        </aside>

        <div data-reveal>
          {spotlight && (
            <SpotlightCard
              dokter={spotlight}
              img={gambarPertama(spotlight.potourl)}
              todayIdx={todayIdx}
            />
          )}

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {rest.map((d, i) => (
              <DokterCard
                key={d.id}
                dokter={d}
                img={gambarPertama(d.potourl)}
                todayIdx={todayIdx}
                index={i + 2}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center bg-prima-soft/70">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="w-9 h-9 text-prima"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-ink mb-1">Dokter tidak ditemukan</h3>
              <p className="text-muted max-w-sm mx-auto mb-5">
                Coba ubah kata kunci pencarian atau pilih kategori spesialisasi lain.
              </p>
              <button
                onClick={() => {
                  setFilterPoli("all");
                  setSearch("");
                }}
                className="btn btn-outline"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="w-4 h-4"
                >
                  <path d="M3 12a9 9 0 0115.5-6.36L21 8M21 3v5h-5M21 12a9 9 0 01-15.5 6.36L3 16M3 21v-5h5" />
                </svg>
                Reset Pencarian
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SpotlightCard({
  dokter,
  img,
  todayIdx,
}: {
  dokter: DokterWithPoli;
  img: string;
  todayIdx: number | null;
}) {
  const jadwalDokter = dokter.jadwal ?? [];
  const isToday =
    todayIdx != null && jadwalDokter.some((j) => j.hari === HARI_ORDER[todayIdx]);
  const socials = socialsOf(dokter);

  return (
    <article className="group relative mb-5 flex flex-col sm:flex-row rounded-3xl bg-white border border-prima/20 shadow-[var(--sh-card)] hover:shadow-[var(--sh-card-hover)] transition-all duration-500 overflow-hidden">
      <div className="relative sm:w-[250px] sm:flex-shrink-0 aspect-[16/10] sm:aspect-auto sm:min-h-[320px] bg-prima-tint overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={dokter.nama}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-prima via-prima-l to-prima-d flex items-center justify-center">
            <span className="text-6xl font-extrabold text-white/90 tracking-tight">
              {initialsOf(dokter.nama)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
      </div>

      <div className="flex-1 p-6 sm:p-7 flex flex-col">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-soft text-coral-d text-[11px] font-bold">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4-6.2-4.6-6.2 4.6 2.4-7.4L2 9.4h7.6z" />
            </svg>
            Dokter Sorotan
          </span>
          {dokter.poliklinik?.nama && (
            <span className="chip bg-prima-soft text-prima-d">
              {dokter.poliklinik.nama.replace(/^Klinik\s+/i, "")}
            </span>
          )}
          {isToday && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal text-white text-[11px] font-bold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Praktik Hari Ini
            </span>
          )}
        </div>

        <h3 className="mt-3 text-[20px] sm:text-[24px] font-extrabold leading-tight text-ink">
          {dokter.nama}
        </h3>
        {dokter.spesialist && (
          <p className="mt-1 text-[14px] font-semibold text-prima">{dokter.spesialist}</p>
        )}

        {jadwalDokter.length > 0 && (
          <div className="mt-4 grid grid-cols-2 xl:grid-cols-3 gap-1.5 max-w-lg">
            {jadwalDokter.map((j) => (
              <div
                key={j.id}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border ${
                  todayIdx != null && j.hari === HARI_ORDER[todayIdx]
                    ? "bg-teal/10 border-teal/30"
                    : "bg-canvas border-transparent"
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                  {j.hari}
                </span>
                <span className="text-[11px] font-semibold text-muted tabular-nums">
                  {j.jamMulai}–{j.jamSelesai}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1.5">
            {socials.map((s) => (
              <a
                key={s.key}
                href={s.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                aria-label={s.key}
                className="w-9 h-9 rounded-full bg-canvas hover:bg-prima hover:text-white text-ink-soft flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d={SOCIAL_ICONS[s.key]} />
                </svg>
              </a>
            ))}
          </div>
          <a
            href="/kontak"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-prima hover:bg-prima-d text-white text-[13px] font-bold transition-colors shadow-lg shadow-prima/25"
          >
            Buat Janji
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="w-4 h-4"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

function DokterCard({
  dokter,
  img,
  todayIdx,
  index,
}: {
  dokter: DokterWithPoli;
  img: string;
  todayIdx: number | null;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const jadwalDokter = dokter.jadwal ?? [];
  const isToday =
    todayIdx != null && jadwalDokter.some((j) => j.hari === HARI_ORDER[todayIdx]);
  const nextDay =
    !isToday && todayIdx != null
      ? nextPraktikDay(jadwalDokter.map((j) => j.hari), todayIdx)
      : null;
  const socials = socialsOf(dokter);

  return (
    <article className="group relative flex flex-col rounded-3xl bg-white border border-line shadow-[var(--sh-card)] hover:shadow-[var(--sh-card-hover)] hover:-translate-y-1.5 hover:border-prima/25 transition-all duration-500">
      <div className="relative mx-3 mt-3">
        <div className="relative aspect-[4/5] overflow-hidden bg-prima-tint">
          {img ? (
            <img
              src={img}
              alt={dokter.nama}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-prima via-prima-l to-prima-d flex items-end justify-center pb-7">
              <span className="text-5xl font-extrabold text-white/90 tracking-tight">
                {initialsOf(dokter.nama)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
        </div>

        <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur text-[11px] font-extrabold text-prima-d flex items-center justify-center shadow-md border border-white/50">
          {String(index).padStart(2, "0")}
        </span>

        {(isToday || nextDay) && (
          <span
            className={`absolute -bottom-3.5 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap shadow-lg border ${
              isToday ? "bg-teal text-white border-white/30" : "bg-white text-ink-soft border-line"
            }`}
          >
            {isToday ? (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                Praktik Hari Ini
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-coral" />
                Jadwal {HARI_SHORT[nextDay!] ?? nextDay}
              </>
            )}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col text-left px-5 pb-5 pt-6">
        {dokter.poliklinik?.nama && (
          <span className="self-start chip bg-prima-soft text-prima-d mb-2">
            {dokter.poliklinik.nama.replace(/^Klinik\s+/i, "")}
          </span>
        )}
        <h3 className="font-extrabold text-[16px] leading-snug text-ink">{dokter.nama}</h3>
        {dokter.spesialist && (
          <p className="mt-0.5 text-[13px] font-semibold text-prima leading-snug">
            {dokter.spesialist}
          </p>
        )}

        {jadwalDokter.length > 0 && (
          <>
            <div className="mt-4 mb-2 flex flex-wrap gap-1.5">
              {jadwalDokter.map((j) => (
                <span
                  key={j.id}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                    todayIdx != null && j.hari === HARI_ORDER[todayIdx]
                      ? "bg-teal text-white"
                      : "bg-canvas text-ink-soft"
                  }`}
                >
                  {HARI_SHORT[j.hari] ?? j.hari.slice(0, 3)}
                </span>
              ))}
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="self-start inline-flex items-center gap-1 text-[11.5px] font-bold text-prima hover:text-prima-d transition-colors"
            >
              {open ? "Sembunyikan jam praktik" : "Lihat jam praktik"}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {open && (
              <ul className="mt-3 w-full space-y-1.5">
                {jadwalDokter.map((j) => (
                  <li
                    key={j.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-canvas/80"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          todayIdx != null && j.hari === HARI_ORDER[todayIdx]
                            ? "bg-teal"
                            : "bg-coral"
                        }`}
                      />
                      {j.hari}
                    </span>
                    <span className="text-[11px] font-semibold text-muted tabular-nums">
                      {j.jamMulai}–{j.jamSelesai}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <div className="mt-auto w-full pt-4 border-t border-line-2 flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {socials.map((s) => (
              <a
                key={s.key}
                href={s.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                aria-label={s.key}
                className="w-8 h-8 rounded-full bg-canvas hover:bg-prima hover:text-white text-ink-soft flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d={SOCIAL_ICONS[s.key]} />
                </svg>
              </a>
            ))}
          </div>
          <a
            href="/kontak"
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

function FilterChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-left transition-all border ${
        active
          ? "bg-gradient-to-r from-prima to-prima-d text-white border-transparent shadow-md shadow-prima/25"
          : "bg-white text-ink-soft border-line hover:border-prima/40 hover:text-prima"
      }`}
    >
      <span className="truncate">{children}</span>
      <span
        className={`text-[11px] font-bold rounded-full min-w-5 px-1.5 py-0.5 flex-shrink-0 ${
          active ? "bg-white/20 text-white" : "bg-canvas text-muted-d"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
