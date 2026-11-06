// Seeded PRNG: explicit state, stable across browsers and Node.
export function createRng(seed) {
  let s = 2166136261 >>> 0;
  for (const ch of String(seed ?? 0)) {
    s ^= ch.charCodeAt(0);
    s = Math.imul(s, 16777619) >>> 0;
  }
  return {
    next() {
      s = (s + 0x6D2B79F5) >>> 0;
      let x = s;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    },
    getState() { return s; },
  };
}
export const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
export const meters = (a, b) => Math.hypot((a.x-b.x)*105, (a.y-b.y)*68);
export const stat = (p, group, field, fallback=50) =>
  clamp(Number(p[group]?.[field] ?? fallback) || 0, 0, 100);
