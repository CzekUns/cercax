const zero = () => ({ appearances: 0, starts: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, injuries: 0 });
const add = (a, b) => { for (const key of Object.keys(zero())) a[key] += b[key]; };
export function createCareerRecord(player) {
  return { playerId: String(typeof player === 'object' ? player.id : player), seasons: {}, total: zero(), processedMatches: [] };
}
export function recordMatch(record, match) {
  if (String(match.playerId) !== record.playerId) throw new Error('Player mismatch');
  if (match.id == null || match.seasonId == null) throw new Error('match.id and seasonId required');
  const key = `${match.seasonId}:${match.id}`;
  if (record.processedMatches.includes(key)) return { record, applied: false };
  const next = structuredClone(record);
  const seasonId = String(match.seasonId);
  const season = next.seasons[seasonId] || { ...zero(), development: null };
  const delta = zero();
  const minutes = Number(match.minutes ?? 0);
  if (!Number.isFinite(minutes) || minutes < 0 || minutes > 130) throw new RangeError('Invalid minutes');
  if (minutes > 0) { delta.appearances = 1; delta.starts = match.started ? 1 : 0; delta.minutes = minutes; }
  const events = Array.isArray(match.events) ? match.events : [];
  const matchEvents = events.filter(e => e && (e.playerId === record.playerId || e.detail?.assistId === record.playerId));
  const eventKeys = new Set();
  let assistsFromGoals = 0, assistsFromExplicitEvents = 0;
  for (const e of matchEvents) {
    if (e.id != null && eventKeys.has(String(e.id))) continue;
    if (e.id != null) eventKeys.add(String(e.id));
    if (e.type === 'goal') {
      if (e.playerId === record.playerId && !e.detail?.ownGoal) delta.goals++;
      if (e.detail?.assistId === record.playerId) assistsFromGoals++;
    }
    if (e.type === 'assist' && e.playerId === record.playerId) assistsFromExplicitEvents++;
    if (e.type === 'card' && e.playerId === record.playerId) {
      const color = String(e.detail?.color || '').toLowerCase();
      if (color === 'yellow') delta.yellowCards++;
      if (color === 'red') delta.redCards++;
    }
    if (e.type === 'injury' && e.playerId === record.playerId) delta.injuries++;
  }
  delta.assists = Math.max(assistsFromGoals, assistsFromExplicitEvents);
  add(season, delta);
  add(next.total, delta);
  next.seasons[seasonId] = season;
  next.processedMatches.push(key);
  return { record: next, applied: true, delta };
}
export function recordSeasonSnapshot(record, seasonId, player) {
  if (String(player.id) !== record.playerId) throw new Error('Player mismatch');
  const next = structuredClone(record);
  const season = next.seasons[String(seasonId)] || { ...zero(), development: null };
  season.development = { age: player.age, technical: { ...player.technical }, physical: { ...player.physical }, mental: { ...player.mental } };
  next.seasons[String(seasonId)] = season;
  return next;
}

