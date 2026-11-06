export function seedNumber(value = 1) {
  const s = String(value);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function createRng(seed = 1) {
  let state = seedNumber(seed);
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const clamp = (n, low = 0, high = 100) => Math.max(low, Math.min(high, Number.isFinite(Number(n)) ? Number(n) : low));
export const range = (rng, a, b) => a + (b - a) * rng();
export const pick = (rng, options) => options[Math.floor(rng() * options.length)];
export const triangular = (rng) => (rng() + rng() + rng()) / 3;

