import { useMemo, useState } from "react";
import type { Dokter, Jadwal } from "../../lib/types";
import { gambarPertama, sortByHari } from "../../lib/utils";

type DokterWithPoli = Dokter & { jadwal?: Jadwal[] };

const HARI_ICON = "M7 2v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7z";

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

  const filtered = useMemo(() => {
    let arr = dokterWithJadwal;
    if (filterPoli !== "all") arr = arr.filter((d) => d.poliklinikid === filterPoli);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (d) =>
          d.nama.toLowerCase().includes(q) ||
          d.spesialist?.toLowerCase().includes(q)
      );
    }
    return arr;
  }, [dokterWithJadwal, filterPoli, search]);

  if (items.length === 0) return null;

  const activePoli = poliklinikList.find((p) => p.id === filterPoli);
  const headingTitle = activePoli
    ? `Spesialis ${activePoli.nama.replace(/^Klinik\s+/i, "")}`
    : "Tim Dokter Spesialis";

  return (
    <section id="dokter" className="section bg-paper relative overflow-hidden">
      <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-prima-soft blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-20 -left-20 w-96 h-96 rounded-full bg-teal/5 blur-3xl pointer-events-none" />

      <div className="wrap relative">
        <div data-reveal className="mb-10 max-w-2xl mx-auto text-center">
          <div className="eyebrow mb-3 justify-center inline-flex">Tim Medis</div>
          <h2 className="text-[clamp(28px,3.6vw,44px)] font-extrabold leading-tight tracking-tight text-balance inline-flex items-center gap-3 flex-wrap justify-center">
            {headingTitle}
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-prima-soft text-prima">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M19 8h-2V7a4 4 0 00-8 0v1H7a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-9a2 2 0 00-2-2zm-8-1a2 2 0 014 0v1h-4V7zm-1 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
              </svg>
            </span>
          </h2>
          <p className="mt-3 text-muted text-[16px] leading-relaxed">
            Dokter-dokter berpengalaman dengan keahlian spesifik di setiap bidang, siap memberikan pelayanan kesehatan terbaik untuk Anda.
          </p>
        </div>

        <div data-reveal className="mb-6">
          <div className="flex justify-center">
            <div className="relative w-full max-w-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-prima/10 via-teal/10 to-prima/10 rounded-2xl blur-md opacity-60" />
              <div className="relative flex items-center bg-white rounded-2xl shadow-lg shadow-prima/5 border border-line">
                <div className="pl-5 pr-3 py-3 text-prima">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </div>
                <input
                  type="search"
                  placeholder="Cari nama dokter atau spesialisasi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 py-4 pr-3 bg-transparent outline-none text-ink placeholder:text-muted-d text-[15px]"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Hapus pencarian"
                    className="mr-3 w-7 h-7 rounded-full bg-canvas hover:bg-prima-soft hover:text-prima text-muted flex items-center justify-center transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {poliklinikList.length > 0 && (
          <div data-reveal className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
              <FilterChip active={filterPoli === "all"} onClick={() => setFilterPoli("all")} icon="grid">
                Semua
              </FilterChip>
              {poliklinikList.map((p) => (
                <FilterChip key={p.id} active={filterPoli === p.id} onClick={() => setFilterPoli(p.id)}>
                  {p.nama.replace(/^Klinik\s+/i, "")}
                </FilterChip>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-prima-tint text-prima-d text-sm font-semibold border border-prima/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prima opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-prima" />
            </span>
            Menampilkan {filtered.length} dari {dokterWithJadwal.length} dokter
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((d, i) => {
            const img = gambarPertama(d.potourl);
            return (
              <div key={d.id} data-reveal data-reveal-delay={(i % 3) * 100}>
                <DokterCard dokter={d} img={img} />
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-prima-soft to-teal/10 flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-prima">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </div>
            </div>
            <h3 className="font-bold text-lg text-ink mb-1">Dokter tidak ditemukan</h3>
            <p className="text-muted max-w-sm mx-auto mb-5">
              Coba ubah kata kunci pencarian atau pilih kategori spesialisasi lain.
            </p>
            <button
              onClick={() => { setFilterPoli("all"); setSearch(""); }}
              className="btn btn-outline"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                <path d="M3 12a9 9 0 0115.5-6.36L21 8M21 3v5h-5M21 12a9 9 0 01-15.5 6.36L3 16M3 21v-5h5" />
              </svg>
              Reset Pencarian
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function DokterCard({ dokter, img }: { dokter: DokterWithPoli; img: string }) {
  const [open, setOpen] = useState(false);
  const socials = [
    { key: "facebook", url: dokter.facebook, icon: "M22 12a10 10 0 10-11.6 9.9V15h-2.5v-3h2.5V9.8c0-2.5 1.5-3.8 3.7-3.8 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 3h-2.3v6.9A10 10 0 0022 12z" },
    { key: "instagram", url: dokter.instagram, icon: "M12 2.2c3.2 0 3.6 0 4.8.1 1.2 0 1.8.3 2.2.4.5.2.9.5 1.3.9.4.4.7.8.9 1.3.1.4.3 1 .4 2.2 0 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c0 1.2-.3 1.8-.4 2.2-.2.5-.5.9-.9 1.3-.4.4-.8.7-1.3.9-.4.1-1 .3-2.2.4-1.2 0-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2 0-1.8-.3-2.2-.4a3.5 3.5 0 01-1.3-.9 3.5 3.5 0 01-.9-1.3c-.1-.4-.3-1-.4-2.2 0-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c0-1.2.3-1.8.4-2.2.2-.5.5-.9.9-1.3.4-.4.8-.7 1.3-.9.4-.1 1-.3 2.2-.4 1.2-.1 1.6-.1 4.8-.1zm0 5.1a4.7 4.7 0 100 9.4 4.7 4.7 0 000-9.4zm0 7.7a3 3 0 110-6 3 3 0 010 6zm6-7.9a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z" },
    { key: "twitter", url: dokter.twitter, icon: "M22 5.8c-.8.4-1.6.6-2.5.7.9-.5 1.6-1.4 1.9-2.4-.8.5-1.7.9-2.7 1.1A4.2 4.2 0 0011.4 9c0 .3 0 .7.1 1A12 12 0 013 4.6a4.2 4.2 0 001.3 5.6c-.7 0-1.3-.2-1.9-.5v.1a4.2 4.2 0 003.4 4.1c-.6.2-1.3.2-1.9.1a4.2 4.2 0 003.9 2.9A8.4 8.4 0 012 18.6a12 12 0 006.5 1.9c7.8 0 12-6.4 12-12v-.5c.8-.6 1.5-1.3 2.1-2.2z" },
  ].filter((s) => s.url && s.url !== "-");

  const initials = dokter.nama.split(" ").slice(0, 2).map((w) => w[0] ?? "").join("");
  const hasJadwal = (dokter.jadwal?.length ?? 0) > 0;

  return (
    <article className="group relative card card-hover overflow-hidden h-full flex flex-col">
      <div className="aspect-[4/5] bg-prima-tint relative overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={dokter.nama}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-prima via-prima-l to-prima-d text-white">
            <span className="text-6xl font-bold tracking-tight">{initials}</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent pointer-events-none" />

        {dokter.poliklinik?.nama && (
          <div className="absolute top-3 left-3">
            <span className="chip bg-white/95 backdrop-blur-md shadow-md border border-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-teal" />
              {dokter.poliklinik.nama.replace(/^Klinik\s+/i, "")}
            </span>
          </div>
        )}

        {hasJadwal && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal/95 text-white text-[10px] font-bold uppercase tracking-wider shadow-md backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              Available
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg leading-tight drop-shadow-sm">{dokter.nama}</h3>
          {dokter.spesialist && (
            <p className="text-xs text-white/85 mt-0.5 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-coral">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4-6.2-4.6-6.2 4.6 2.4-7.4L2 9.4h7.6z" />
              </svg>
              {dokter.spesialist}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {hasJadwal && (
          <>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center justify-between w-full text-sm font-semibold text-ink-soft hover:text-prima transition-colors py-1"
              aria-expanded={open}
            >
              <span className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-prima-soft flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-prima">
                    <path d={HARI_ICON} />
                  </svg>
                </span>
                Jadwal Praktik
                <span className="text-[10px] font-bold text-prima bg-prima-soft px-1.5 py-0.5 rounded-full">
                  {dokter.jadwal!.length}
                </span>
              </span>
              <span className={`transition-transform inline-flex w-6 h-6 rounded-full bg-canvas group-hover:bg-prima-soft items-center justify-center ${open ? "rotate-180" : ""}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>

            {open && (
              <ul className="mt-3 space-y-1.5">
                {dokter.jadwal!.map((j) => (
                  <li
                    key={j.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-gradient-to-r from-canvas to-transparent border border-line-2 hover:border-prima/30 hover:bg-prima-tint transition-all"
                  >
                    <span className="flex items-center gap-2 font-semibold text-ink-soft text-xs uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-coral" />
                      {j.hari}
                    </span>
                    <span className="text-muted font-mono text-xs flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {j.jamMulai} – {j.jamSelesai}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {socials.length > 0 && (
          <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-line-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-d font-bold">
              Connect
            </span>
            <div className="flex gap-1.5">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.key}
                  className="w-8 h-8 rounded-full bg-canvas hover:bg-prima hover:text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: "grid";
}) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
        active
          ? "bg-prima text-white border-prima shadow-md shadow-prima/30"
          : "bg-white text-ink-soft border-line hover:border-prima/40 hover:bg-prima-tint hover:text-prima"
      }`}
    >
      {icon === "grid" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className={`w-3.5 h-3.5 ${active ? "text-white" : "text-prima"}`}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      )}
      {children}
    </button>
  );
}
