export function normalize(text: string): string {
  let t = text.toLowerCase()
  t = t.normalize("NFKD")
  t = t.replace(/[\u0300-\u036f]/g, "")
  t = t.replace(/4/g, "a").replace(/3/g, "e").replace(/1/g, "i").replace(/0/g, "o").replace(/5/g, "s")
  t = t.replace(/@/g, "a").replace(/\$/g, "s").replace(/7/g, "t").replace(/8/g, "b")
  t = t.replace(/[^a-z0-9\s-]/g, " ")
  t = t.replace(/\s+/g, " ").trim()
  return t
}
