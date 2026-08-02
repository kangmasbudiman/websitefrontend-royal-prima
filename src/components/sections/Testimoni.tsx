import { useEffect, useState } from "react";
import type { Testimoni as TestimoniType } from "../../lib/types";

export default function TestimoniSection({ items }: { items: TestimoniType[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 7000);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;
  const cur = items[i];

  return (
    <section className="section bg-ink text-white relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-prima/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-teal/20 blur-3xl pointer-events-none" />

      <div className="wrap relative">
        <div data-reveal className="mb-10 text-center max-w-2xl mx-auto">
          <div className="eyebrow mb-3 justify-center inline-flex">Kata Mereka</div>
          <h2 className="text-[clamp(28px,3.6vw,44px)] font-extrabold leading-tight tracking-tight text-balance text-white">
            Cerita pasien kami
          </h2>
        </div>

        <div data-reveal>
          <div className="max-w-3xl mx-auto text-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-prima-l mx-auto mb-5 opacity-60">
              <path d="M9.2 4C5.2 4 2 7.2 2 11.2 2 15 4.9 18 8.6 18c.3 0 .6 0 .9-.1-.4 1.6-1.7 2.8-3.4 3.3-.4.1-.6.5-.5.9.1.4.5.6.9.5C9.9 21.7 12 18.7 12 14.2V11c0-3.9-1.3-7-2.8-7zm12 0c-4 0-7.2 3.2-7.2 7.2 0 3.8 2.9 6.8 6.6 6.8.3 0 .6 0 .9-.1-.4 1.6-1.7 2.8-3.4 3.3-.4.1-.6.5-.5.9.1.4.5.6.9.5 3.4-.9 5.5-3.9 5.5-8.4V11c0-3.9-1.3-7-2.8-7z" />
            </svg>
            <div
              className="font-serif italic text-balance text-[clamp(20px,2.4vw,30px)] leading-snug mb-6 strip-html [&_p]:!mb-0 text-white/95"
              dangerouslySetInnerHTML={{ __html: cur.testimoni ?? "" }}
            />
            <div>
              <div className="font-bold text-lg">{cur.nama_pasien}</div>
              {cur.pekerjaan && (
                <div className="text-prima-l text-sm">{cur.pekerjaan}</div>
              )}
            </div>

            {items.length > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setI(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === i ? "w-10 bg-coral" : "w-4 bg-white/30"
                    }`}
                    aria-label={`slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
