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
