export function normalizePhone(input: string): string {
  let cleaned = input.replace(/\s+/g, "");
  if (cleaned.startsWith("+33")) return cleaned;
  if (cleaned.startsWith("0033")) return "+33" + cleaned.slice(4);
  if (cleaned.startsWith("0")) return "+33" + cleaned.slice(1);
  if (/^\d+$/.test(cleaned)) return "+33" + cleaned;
  return cleaned;
}
