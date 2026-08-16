// Field gambar di schema RS Prima Jambi disimpan sebagai JSON-stringified array,
// contoh: '[\"https://...\",\"https://...\"]'. Helper ini parse ke array of URL.

export function parseGambar(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean) as string[];
    if (typeof parsed === "string") return [parsed];
  } catch {
    if (raw.startsWith("http")) return [raw];
  }
  return [];
}

export function gambarPertama(raw: string | null | undefined, fallback = ""): string {
  const arr = parseGambar(raw);
  return arr[0] ?? fallback;
}

export function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const HARI_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
export function sortByHari<T extends { hari: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => HARI_ORDER.indexOf(a.hari) - HARI_ORDER.indexOf(b.hari)
  );
}

export function rawHtml(html: string | null | undefined): string {
  return html ?? "";
}

// Validate a URL/string from the database. Returns the value if it looks like a
// real link (http(s), mailto:, tel:, or absolute path / anchor), else fallback.
export function safeUrl(value: string | null | undefined, fallback = "#"): string {
  if (!value) return fallback;
  const v = value.trim();
  if (!v) return fallback;
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
  if (v.startsWith("/") || v.startsWith("#")) return v;
  return fallback;
}

// Convert a Google Maps embed URL (the kind used in <iframe src>) into a
// clickable navigation URL. Embed URLs go to the embed API and don't render
// when opened directly, so we extract coords or fall back to an address search.
export function mapsNavUrl(
  embedOrUrl: string | null | undefined,
  fallbackAddress?: string | null
): string {
  if (!embedOrUrl) {
    return fallbackAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress)}`
      : "#";
  }
  if (!embedOrUrl.includes("/embed") && !embedOrUrl.includes("pb=")) {
    return embedOrUrl;
  }
  const m = embedOrUrl.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/);
  if (m) {
    const [, lng, lat] = m;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  if (fallbackAddress) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress)}`;
  }
  return "https://www.google.com/maps";
}
