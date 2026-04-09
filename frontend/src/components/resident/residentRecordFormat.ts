export function formatDate(dateStr: string | undefined | null): string {
  if (dateStr == null || dateStr === "") return "\u2014";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export function dashIfEmpty(value: string | null | undefined): string {
  if (value == null || String(value).trim() === "") return "\u2014";
  return value;
}

export function fmtNum(n: number | null | undefined, digits = 1): string {
  if (n == null || Number.isNaN(n)) return "\u2014";
  return Number.isInteger(n) ? String(n) : n.toFixed(digits);
}

export function fmtBool(b: boolean | null | undefined): string {
  if (b == null) return "\u2014";
  return b ? "Yes" : "No";
}

export function clip(text: string | null | undefined, max = 120): string {
  if (text == null || text === "") return "\u2014";
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}\u2026`;
}
