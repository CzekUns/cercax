/** Competition logic only. Results are supplied by a match provider, never invented here. */
export const DIVISIONS = Object.freeze([
  { id: 'A', name: 'Serie A', clubs: 16 },
  { id: 'B', name: 'Serie B', clubs: 20 },
  { id: 'C1', name: 'Serie C1', clubs: 18 },
  { id: 'C2', name: 'Serie C2', clubs: 18 },
  { id: 'INTER', name: 'Interregionale', clubs: 16 },
  { id: 'PROM', name: 'Promozione', clubs: 16 }
]);
// Historical two-point system; other values are SIMPLIFIED one-group demo defaults.
export const DEFAULT_RULES = Object.freeze({ winPoints: 2, drawPoints: 1,
  tieBreakers: ['points', 'goalDifference', 'goalsFor', 'id'], exchangesPerBoundary: 1 });

function hash(value) {
  let h = 2166136261;
  for (const char of String(value)) { h ^= char.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function seededRandom(seed) {
  let state = hash(seed) || 1;
  return () => { state = (state + 0x6d2b79f5) >>> 0; let x = state;
    x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
export function shuffle(items, seed) {
  const list = [...items], rng = seededRandom(seed);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1)); [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/** Berger circle method. A fixture ID is stable across save/load. */
export function generateSchedule(clubIds, { season = 1985, divisionId = 'PROM', seed = 1 } = {}) {
  if (!Array.isArray(clubIds) || clubIds.length < 2 || new Set(clubIds).size !== clubIds.length) {
    throw new Error('League needs at least two distinct clubs');
  }
  let rotation = shuffle(clubIds, `${seed}:${season}:${divisionId}`);
  if (rotation.length % 2) rotation.push(null);
  const size = rotation.length, firstLeg = [];
  for (let round = 0; round < size - 1; round++) {
    const fixtures = [];
    for (let i = 0; i < size / 2; i++) {
      const left = rotation[i], right = rotation[size - 1 - i];
      if (left === null || right === null) continue;
      const reverse = ((round + i) % 2) === 1;
      const homeId = reverse ? right : left, awayId = reverse ? left : right;
      fixtures.push({ id: `${season}:${divisionId}:${round + 1}:${i + 1}`, divisionId,
        round: round + 1, homeId, awayId, result: null });
    }
    firstLeg.push(...fixtures);
    rotation = [rotation[0], rotation[size - 1], ...rotation.slice(1, size - 1)];
  }
  const secondLeg = firstLeg.map(f => ({ id: `${season}:${divisionId}:${f.round + size - 1}:${f.id.split(':').at(-1)}`,
    divisionId, round: f.round + size - 1, homeId: f.awayId, awayId: f.homeId, result: null }));
  return [...firstLeg, ...secondLeg];
}

export function standings(league) {
  const rules = { ...DEFAULT_RULES, ...league.rules };
  const byId = new Map(league.clubIds.map(id => [id, {
    clubId: id, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
  }]));
  for (const fixture of league.fixtures) {
    if (!fixture.result) continue;
    const h = byId.get(fixture.homeId), a = byId.get(fixture.awayId);
    if (!h || !a) throw new Error('Fixture refers to a club outside its league');
    const { home, away } = fixture.result.score;
    h.played++; a.played++; h.goalsFor += home; h.goalsAgainst += away;
    a.goalsFor += away; a.goalsAgainst += home;
    if (home > away) { h.won++; a.lost++; h.points += rules.winPoints; }
    else if (home < away) { a.won++; h.lost++; a.points += rules.winPoints; }
    else { h.drawn++; a.drawn++; h.points += rules.drawPoints; a.points += rules.drawPoints; }
  }
  for (const entry of byId.values()) entry.goalDifference = entry.goalsFor - entry.goalsAgainst;
  const rows = [...byId.values()];
  // A head-to-head mini-table is meaningful only when ALL fixtures among tied clubs are played.
  const mini = new Map();
  const groups = new Map();
  for (const row of rows) groups.set(row.points, [...(groups.get(row.points) || []), row.clubId]);
  for (const tied of groups.values()) {
    if (tied.length < 2) continue;
    const relevant = league.fixtures.filter(f => tied.includes(f.homeId) && tied.includes(f.awayId));
    if (relevant.some(f => !f.result)) continue;
    for (const id of tied) mini.set(id, 0);
    for (const f of relevant) {
      const { home, away } = f.result.score;
      if (home > away) mini.set(f.homeId, mini.get(f.homeId) + rules.winPoints);
      else if (away > home) mini.set(f.awayId, mini.get(f.awayId) + rules.winPoints);
      else { mini.set(f.homeId, mini.get(f.homeId) + rules.drawPoints);
        mini.set(f.awayId, mini.get(f.awayId) + rules.drawPoints); }
    }
  }
  rows.sort((a, b) => {
    for (const key of rules.tieBreakers) {
      if (key === 'id') return a.clubId.localeCompare(b.clubId);
      const diff = key === 'headToHead' ? ((mini.get(b.clubId) || 0) - (mini.get(a.clubId) || 0))
        : ((b[key] || 0) - (a[key] || 0));
      if (diff) return diff;
    }
    return a.clubId.localeCompare(b.clubId);
  });
  return rows.map((row, i) => ({ ...row, position: i + 1 }));
}

export function topScorers(league, clubs, limit = 20) {
  const players = new Map(clubs.flatMap(c => c.players.map(p => [p.id, { playerId: p.id, clubId: c.id, name: p.name, goals: 0 }])));
  for (const f of league.fixtures) for (const e of (f.result?.events || [])) {
    if (e.type === 'goal' && !e.detail?.ownGoal && players.has(e.playerId)) players.get(e.playerId).goals++;
  }
  return [...players.values()].filter(p => p.goals).sort((a, b) => b.goals - a.goals || a.playerId.localeCompare(b.playerId)).slice(0, limit);
}

/** Atomic exchanges between adjacent *representative* tiers, not 1985 national quotas. */
export function promotionRelegation(leagues, divisionOrder, count = 1) {
  if (!Number.isInteger(count) || count < 0) throw new Error('Invalid exchange count');
  const moves = [];
  for (let upper = 0; upper < divisionOrder.length - 1; upper++) {
    const top = leagues[divisionOrder[upper]], bottom = leagues[divisionOrder[upper + 1]];
    const promoted = standings(bottom).slice(0, count);
    const relegated = standings(top).slice(-count);
    if (promoted.length !== count || relegated.length !== count) throw new Error('Not enough clubs for exchange');
    for (const row of promoted) moves.push({ clubId: row.clubId, from: bottom.id, to: top.id, kind: 'promotion' });
    for (const row of relegated) moves.push({ clubId: row.clubId, from: top.id, to: bottom.id, kind: 'relegation' });
  }
  return moves;
}
