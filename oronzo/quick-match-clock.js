/** ORONZO · Partita rapida tempo visivo (indipendente dal motore calcistico).
 * A 1×, sei secondi simulati passano per secondo reale: una partita dura ~15 minuti.
 * L'accelerazione è applicata SOLO dal runner, non due volte da advanceRealSeconds().
 */
export const QUICK_MATCH_SIM_SECONDS_PER_REAL_SECOND = 6;
export const QUICK_MATCH_SPEEDS = Object.freeze([1, 2, 4, 8]);
export function quickMatchSimDelta(realSeconds, speed=1) {
  if(!Number.isFinite(realSeconds) || realSeconds < 0) throw new RangeError('invalid real-time delta');
  if(!QUICK_MATCH_SPEEDS.includes(speed)) throw new RangeError('invalid speed');
  return realSeconds * QUICK_MATCH_SIM_SECONDS_PER_REAL_SECOND * speed;
}
export function quickMatchDurationMinutes(speed=1) {
  if(!QUICK_MATCH_SPEEDS.includes(speed)) throw new RangeError('invalid speed');
  return Number((5400 / QUICK_MATCH_SIM_SECONDS_PER_REAL_SECOND / speed / 60).toFixed(2));
}
