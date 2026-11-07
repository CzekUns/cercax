// Shared deterministic helpers (ESM, no dependencies).
export const clamp = (value, min=0, max=100) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
export const integer = (value, name='value') => {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(name + ' must be a non-negative safe integer');
  return value;
};
export const copy = value => JSON.parse(JSON.stringify(value));
export function rngFromSeed(seed=1) {
  let x = (typeof seed === 'number' ? seed : Array.from(String(seed)).reduce((a,c) => Math.imul(a ^ c.charCodeAt(0), 16777619), 2166136261)) >>> 0;
  return () => { x += 0x6D2B79F5; let t=x; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; };
}
export function uniqueIds(items, label='items') {
  if (!Array.isArray(items) || new Set(items.map(x=>x.id)).size !== items.length || items.some(x=>!x || !x.id))
    throw new Error(label + ' must contain unique nonempty ids');
}
export const acceptance = (chance, rng) => rng() < clamp(chance,0,1);
export const validTrust = n => Math.round(clamp(n));
