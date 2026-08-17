import { useEffect, useRef, useState } from "react";
import type { InfoCard, Slider, Statistik } from "../../lib/types";
import { gambarPertama } from "../../lib/utils";

const AUTOPLAY_MS = 7000;

// Placeholder slides — pakai stock photo sementara.
// Untuk kembali pakai gambar dari database, set USE_DB_SLIDES = true.
const USE_DB_SLIDES = false;

const PLACEHOLDER_SLIDES = [
  {
    image:
      "https://tsavaawnubadqgzcqakd.supabase.co/storage/v1/object/public/default/compres.png1751976916076",
    title: "RS Royal Prima Jambi",
    subtitle: "Rumah sakit terpadu dengan layanan dokter spesialis & fasilitas modern.",
    caption: "Tampak Depan RS",
    accent: "from-prima-d/85",
  },
  {
    image:
      "https://tsavaawnubadqgzcqakd.supabase.co/storage/v1/object/public/default/CTScan%20(1).png1752055952638",
    title: "CT-Scan 16 Slide",
    subtitle: "Teknologi pencitraan medis untuk diagnosis cepat & akurat.",
    caption: "Fasilitas CT-Scan",
    accent: "from-ink/80",
  },
  {
    image:
      "https://tsavaawnubadqgzcqakd.supabase.co/storage/v1/object/public/default/vip.jpg1752209161899",
    title: "Rawat Inap Kelas VIP",
    subtitle: "Kenyamanan setara hotel dengan pelayanan medis personal.",
    caption: "Ruang Rawat Inap VIP",
    accent: "from-prima-d/85",
  },
  {
    image:
      "https://tsavaawnubadqgzcqakd.supabase.co/storage/v1/object/public/default/igd24jam%20(1).png1752029573459",
    title: "IGD 24 Jam",
    subtitle: "Tim gawat darurat siaga penuh tanpa henti.",
    caption: "Unit Gawat Darurat",
    accent: "from-coral-d/80",
  },
];

const DEFAULT_STATS = [
  { ikon: "dokter", value: "30+", label: "Dokter Spesialis" },
  { ikon: "poliklinik", value: "20+", label: "Poliklinik" },
  { ikon: "igd", value: "24/7", label: "IGD Siaga" },
  { ikon: "tahun", value: "15+", label: "Tahun Pengalaman" },
];

// Ikon stroke 24x24 per key "ikon" dari tabel statistik
const STAT_ICONS: Record<string, string> = {
  dokter:
    "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4.4 0-8 1.8-8 4v3h16v-3c0-2.2-3.6-4-8-4z",
  poliklinik:
    "M4 21V8l8-5 8 5v13M4 21h16M9.5 10h.01M14.5 10h.01M9.5 13.5h.01M14.5 13.5h.01M10 21v-4h4v4",
  igd: "M3.5 12H7l2.5-6.5L14 18l2-6h4.5",
  tahun:
    "M7 2.5v3M17 2.5v3M3.5 9.5h17M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V6A1.5 1.5 0 0 1 5 4.5z",
  pasien:
    "M12 20.5S3.5 15.5 3.5 9.4C3.5 6.5 5.7 4.5 8 4.5c1.7 0 3.2 1 4 2.4.8-1.4 2.3-2.4 4-2.4 2.3 0 4.5 2 4.5 4.9 0 6.1-8.5 11.1-8.5 11.1z",
};

function StatIcon({ name, className }: { name: string | null; className?: string }) {
  const d = (name && STAT_ICONS[name]) || "M12 5v14M5 12h14";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export default function HeroSlider({
  items,
  info,
  stats,
}: {
  items: Slider[];
  info?: InfoCard | null;
  stats?: Statistik[] | null;
}) {
  const slides = USE_DB_SLIDES
    ? items.map((s, i) => ({
        ...s,
        caption: s.title ?? `Slide ${i + 1}`,
        accent: "from-prima-d/85",
      }))
    : PLACEHOLDER_SLIDES.map((p, idx) => ({
        id: 1000 + idx,
        created_at: new Date().toISOString(),
        title: p.title,
        subtitle: p.subtitle,
        image: JSON.stringify([p.image]),
        caption: p.caption,
        accent: p.accent,
      }));

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const len = slides.length;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const go = (next: number) => {
    if (len <= 1) return;
    setI(((next % len) + len) % len);
  };

  useEffect(() => {
    if (len <= 1 || paused) return;
    timerRef.current = setTimeout(() => go(i + 1), AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [i, len, paused]);

  useEffect(() => {
    if (len <= 1 || paused || !progressRef.current) return;
    const el = progressRef.current;
    el.style.transition = "none";
    el.style.width = "0%";
    void el.offsetWidth;
    el.style.transition = `width ${AUTOPLAY_MS}ms linear`;
    el.style.width = "100%";
  }, [i, len, paused]);

  const STATS =
    stats && stats.length > 0
      ? stats.map((s) => ({ ikon: s.ikon, value: s.nilai, label: s.label }))
      : DEFAULT_STATS;

  const emergencyPhone = info?.emergency_phone ?? "119";
  const receptionPhone = info?.hp ?? null;
  const current = slides[i];

  return (
    <section
      className="relative bg-ink text-white overflow-hidden"
      onMouseEnter={() => len > 1 && setPaused(true)}
      onMouseLeave={() => len > 1 && setPaused(false)}
    >
      {/* === BACKGROUND CAROUSEL === */}
      <div className="absolute inset-0">
        {slides.map((s, idx) => {
          const src = gambarPertama(s.image);
          if (!src) return null;
          const isActive = idx === i;
          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${
                isActive ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              <div className={`absolute inset-0 ${isActive ? "hero-kenburns" : ""}`}>
                <img
                  src={src}
                  alt={s.title ?? ""}
                  className="w-full h-full object-cover"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>
          );
        })}

        {/* Layered overlays for depth + text legibility */}
        <div className={`absolute inset-0 bg-gradient-to-br ${current?.accent ?? "from-prima-d/85"} via-ink/40 to-transparent transition-all duration-[1400ms]`} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* === CONTENT === */}
      <div className="relative z-10 min-h-[92vh] lg:min-h-[880px] flex flex-col">
        {/* Top: Brand + caption */}
        <div className="wrap pt-6 lg:pt-8 flex items-center justify-between gap-4">
          <div className="hero-stagger-1 flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-xl shadow-black/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5 text-prima">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="absolute -inset-1.5 rounded-full border border-white/25" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-teal font-bold leading-tight">
                Royal Prima
              </div>
              <div className="text-sm text-white font-semibold leading-tight">
                Hospital Jambi
              </div>
            </div>
          </div>

          {current?.caption && (
            <div className="hero-stagger-2 hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/12 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
              {current.caption}
            </div>
          )}
        </div>

        {/* Middle: Title block */}
        <div className="flex-1 flex items-center">
          <div className="wrap w-full">
            <div className="max-w-3xl">
              <div className="hero-stagger-2 mb-5">
                <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[12px] font-semibold tracking-wide">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-coral" />
                  </span>
                  TRUSTED HEALTHCARE IN JAMBI SINCE 2008
                </span>
              </div>

              {/* Animated title — keyed so it re-mounts per slide */}
              <h1
                key={`title-${i}`}
                className="hero-title-fade text-[clamp(42px,7vw,86px)] font-extrabold leading-[0.98] tracking-tight text-balance drop-shadow-2xl"
              >
                {current?.title ?? "Pelayanan kesehatan terpadu"}
              </h1>

              <p
                key={`sub-${i}`}
                className="hero-sub-fade mt-5 text-lg lg:text-xl text-white/85 leading-relaxed max-w-xl drop-shadow-lg"
              >
                {current?.subtitle}
              </p>

              <div className="hero-stagger-5 mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="/kontak"
                  className="group relative overflow-hidden inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-coral hover:bg-coral-d text-white shadow-2xl shadow-coral/40 transition-all hover:-translate-y-0.5"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center relative">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M7 2v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zm12 6v11H5V8h14z" />
                    </svg>
                  </span>
                  <span className="relative">
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-white/80 font-bold leading-none mb-0.5">
                      Mulai Sekarang
                    </span>
                    <span className="block text-base font-extrabold leading-tight">
                      Buat Janji Temu
                    </span>
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:translate-x-1 transition-transform relative">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>

                <a
                  href="/#dokter"
                  className="group inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 text-white backdrop-blur-md transition-all hover:-translate-y-0.5"
                >
                  <span className="w-9 h-9 rounded-xl bg-white/15 group-hover:bg-teal group-hover:text-white flex items-center justify-center transition">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 21s-7-4.5-9.5-9C.5 9 2.5 5 6 5c2 0 3.5 1 4.5 2.5h3C14.5 6 16 5 18 5c3.5 0 5.5 4 3.5 7-2.5 4.5-9.5 9-9.5 9z" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-white/70 font-bold leading-none mb-0.5">
                      Tim Medis
                    </span>
                    <span className="block text-base font-extrabold leading-tight">
                      Lihat Dokter & Layanan
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Stats + Controls + Emergency */}
        <div className="wrap pb-6 lg:pb-8">
          <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-end">
            {/* Stats strip */}
            <div className="hero-stagger-5 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/15 max-w-3xl">
              {STATS.map((s) => (
                <div key={s.label} className="group/stat bg-ink/30 backdrop-blur-md px-5 py-4 relative overflow-hidden">
                  <StatIcon
                    name={s.ikon}
                    className="w-5 h-5 text-teal mb-2 transition-transform duration-300 group-hover/stat:scale-110"
                  />
                  <div className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-none">
                    {s.value}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/65 font-semibold">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Controls cluster */}
            <div className="flex items-center gap-3">
              {len > 1 && (
                <>
                  <button
                    onClick={() => go(i - 1)}
                    aria-label="Sebelumnya"
                    className="w-12 h-12 rounded-full bg-white/12 backdrop-blur-md border border-white/25 hover:bg-white hover:text-ink hover:-translate-x-0.5 flex items-center justify-center transition-all"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M19 12H5M11 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => go(i + 1)}
                    aria-label="Berikutnya"
                    className="w-12 h-12 rounded-full bg-white/12 backdrop-blur-md border border-white/25 hover:bg-white hover:text-ink hover:translate-x-0.5 flex items-center justify-center transition-all"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                  <div className="px-4 py-2.5 rounded-full bg-white/12 backdrop-blur-md border border-white/25 font-mono text-sm">
                    <span className="font-bold text-base">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-white/55 mx-1">/</span>
                    <span className="text-white/70">{String(len).padStart(2, "0")}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom row: thumbnail nav + progress + emergency */}
          <div className="mt-5 grid lg:grid-cols-[auto_1fr_auto] gap-4 items-center">
            {/* Thumbnails */}
            {len > 1 && (
              <div className="hidden md:flex items-center gap-2">
                {slides.map((s, idx) => {
                  const src = gambarPertama(s.image);
                  return (
                    <button
                      key={s.id}
                      onClick={() => go(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className={`relative w-16 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === i
                          ? "border-coral scale-105 shadow-lg shadow-coral/30"
                          : "border-white/25 hover:border-white/60 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {src ? (
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="block w-full h-full bg-white/15" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Progress bar */}
            {len > 1 && (
              <div className="relative h-1 rounded-full bg-white/15 overflow-hidden">
                <div
                  ref={progressRef}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-coral to-coral-d rounded-full"
                  style={{ width: "0%" }}
                />
              </div>
            )}

            {/* Emergency badge */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-coral/15 border border-coral/40 backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-coral" />
              </span>
              <div className="leading-none">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/70 font-bold">
                  IGD 24 Jam
                </div>
                <a href={`tel:${emergencyPhone}`} className="text-sm font-extrabold tracking-tight hover:text-coral transition">
                  {emergencyPhone}
                </a>
              </div>
              {receptionPhone && receptionPhone !== emergencyPhone && (
                <>
                  <span className="w-px h-7 bg-white/20" />
                  <div className="leading-none">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-white/70 font-bold">
                      Resepsionis
                    </div>
                    <a href={`tel:${receptionPhone}`} className="text-sm font-extrabold tracking-tight hover:text-teal transition">
                      {receptionPhone}
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dot indicators */}
      {len > 1 && (
        <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => go(idx)}
              aria-label={`slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-8 bg-coral" : "w-3 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
