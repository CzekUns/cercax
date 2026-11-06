import test from 'node:test';
import assert from 'node:assert/strict';
import { DIVISIONS, generateSchedule, standings, promotionRelegation } from '../league.js';
import { newCareer, getUpcomingFixture, registerResult, advanceWeek, finishSeason,
  addVacancy, applyJobOffer, getStandings, applyBoardDecision, fixturesForWeek } from '../career.js';
import { demoMatchResult } from '../demo-adapter.js';
import { createSaveManager, serialize, deserialize, validateCareer } from '../save.js';
const sizes = Object.fromEntries(DIVISIONS.map(d => [d.id, 4]));
const small = seed => newCareer({ coachName: 'Mister Test', leagueSizes: sizes }, seed);
const completeWeek = state => {
  for (const f of fixturesForWeek(state)) registerResult(state, demoMatchResult(f, state));
  advanceWeek(state);
};
const completeSeason = state => { while (state.phase === 'inSeason') completeWeek(state); };

test('1985 seeded clubs, player IDs, all divisions and reproducibility', () => {
  const a = small(42), b = small(42);
  assert.deepEqual(a, b);
  assert.equal(a.clubs.length, 24);
  assert.equal(a.clubs[0].players.length, 16);
  assert.equal(a.leagues.PROM.rules.winPoints, 2);
  assert.equal(a.coach.clubId, 'PROM-01');
  assert.ok(a.clubs.every(c => c.players.every(p => p.teamId === c.id)));
  validateCareer(a);
});
test('calendar covers each directed pair once without daily collisions', () => {
  for (const n of [3, 4, 5, 6, 18]) {
    const teams = Array.from({ length: n }, (_, i) => `team-${i}`);
    const fixtures = generateSchedule(teams, { seed: 3, season: 1985, divisionId: 'X' });
    assert.equal(fixtures.length, n * (n - 1));
    const pairs = fixtures.map(f => `${f.homeId}>${f.awayId}`);
    assert.equal(new Set(pairs).size, pairs.length);
    const rounds = new Set(fixtures.map(f => f.round));
    assert.equal(rounds.size, (n % 2 ? n : n - 1) * 2);
    for (const round of rounds) {
      const daily = fixtures.filter(f => f.round === round).flatMap(f => [f.homeId, f.awayId]);
      assert.equal(daily.length, new Set(daily).size);
    }
  }
});
test('standings calculate 2 point win, 1 point draw, goal difference', () => {
  const league = { id: 'X', clubIds: ['A', 'B', 'C'], rules: { winPoints: 2, drawPoints: 1 },
    fixtures: [
      { homeId: 'A', awayId: 'B', result: { score: { home: 2, away: 1 } } },
      { homeId: 'B', awayId: 'C', result: { score: { home: 0, away: 0 } } },
      { homeId: 'C', awayId: 'A', result: { score: { home: 1, away: 1 } } }
    ] };
  const result = standings(league);
  assert.deepEqual(result.map(r => [r.clubId, r.points]), [['A', 3], ['C', 2], ['B', 1]]);
  assert.equal(result[0].goalDifference, 1);
});
test('reject duplicated result, non-goal score, wrong round, invalid scorer', () => {
  const state = small(9), match = getUpcomingFixture(state);
  assert.ok(match);
  assert.throws(() => advanceWeek(state), /EVERY fixture/);
  const fake = demoMatchResult(match, state);
  assert.throws(() => registerResult(state, { ...fake, score: { home: 9, away: 0 } }), /goal events/);
  const bad = { ...fake, score: { home: 1, away: 0 }, events: [{ type: 'goal', teamId: match.homeId, playerId: 'stranger' }] };
  assert.throws(() => registerResult(state, bad), /goalscorer/);
  registerResult(state, { ...fake, events: [...fake.events, { type: 'pass', id: 'extra:pass', teamId: match.homeId }] });
  const played = state.leagues.PROM.fixtures.find(f => f.id === match.id);
  assert.ok(played.result.events.every(event => event.type === 'goal'));
  assert.throws(() => registerResult(state, fake), /already played/);
  const later = state.leagues.PROM.fixtures.find(f => f.round === 2);
  assert.throws(() => registerResult(state, demoMatchResult(later, state)), /current week/);
});
test('full 1985-86 season across six divisions, movement and second season persistence', () => {
  const state = small(1985);
  const player = state.clubs.find(c => c.id === 'PROM-01').players[0];
  const age = player.age;
  completeSeason(state);
  assert.equal(state.week, 7);
  for (const division of DIVISIONS) {
    const table = getStandings(state, division.id);
    assert.equal(table.length, 4);
    assert.ok(table.every(r => r.played === 6));
    assert.equal(table.reduce((a, r) => a + r.won, 0), table.reduce((a, r) => a + r.lost, 0));
  }
  const snap = structuredClone(state);
  const moves = promotionRelegation(state.leagues, DIVISIONS.map(d => d.id));
  assert.equal(moves.length, 10);
  assert.throws(() => registerResult(state, { fixtureId: 'whatever' }), /Season is not/);
  finishSeason(state);
  assert.equal(state.seasonYear, 1986);
  assert.equal(state.history.length, 1);
  assert.deepEqual(state.history[0].movement, moves);
  assert.equal(state.clubs.find(c => c.id === 'PROM-01').players[0].age, age + 1);
  assert.equal(state.clubs.find(c => c.id === 'PROM-01').players[0].id, player.id);
  assert.ok(state.clubs.every(c => c.players.every(p => p.teamId === c.id)));
  assert.ok(moves.every(m => state.clubs.find(c => c.id === m.clubId).divisionId === m.to));
  assert.equal(snap.history.length, 0);
  completeSeason(state);
  finishSeason(state);
  assert.equal(state.seasonYear, 1987);
  assert.equal(state.history.length, 2);
});
test('dismissed coach can advance unemployed, receive vacancy, accept new job', () => {
  const s = small(100);
  const old = s.coach.clubId;
  applyBoardDecision(s, { type: 'dismiss', clubId: old });
  assert.equal(s.coach.clubId, null);
  assert.equal(getUpcomingFixture(s), null);
  completeWeek(s);
  addVacancy(s, 'PROM-02');
  const offer = s.offers.find(o => o.clubId === 'PROM-02');
  assert.ok(offer);
  applyJobOffer(s, offer.id);
  assert.equal(s.coach.clubId, 'PROM-02');
  assert.equal(s.coach.employmentHistory[0].reason, 'dismissed');
  assert.throws(() => applyJobOffer(s, offer.id), /missing or expired/);
  assert.ok(getUpcomingFixture(s));
});
test('explicit renewals and contract expiry are supported', () => {
  const s = small(5);
  applyBoardDecision(s, { type: 'renew', clubId: s.coach.clubId, until: 1988 });
  completeSeason(s); finishSeason(s);
  assert.equal(s.coach.contract.until, 1988);
  assert.equal(s.coach.clubId, 'PROM-01');
  completeSeason(s); finishSeason(s);
  assert.equal(s.coach.clubId, 'PROM-01');
  completeSeason(s); finishSeason(s);
  assert.equal(s.coach.clubId, null);
  assert.equal(s.coach.employmentHistory.at(-1).reason, 'contractExpired');
});
test('save/import/export recover active slot and older backup after corruption', () => {
  const s = small(77), map = new Map();
  const storage = { getItem: key => map.get(key) ?? null, setItem: (key, value) => { map.set(key, value); }, removeItem: key => { map.delete(key); } };
  const manager = createSaveManager(storage, 'career-test');
  manager.save(s);
  completeWeek(s);
  manager.save(s);
  let loaded = manager.load();
  assert.equal(loaded.state.week, 2);
  assert.equal(loaded.recovered, false);
  map.set('career-test:B', '{broken');
  loaded = manager.load();
  assert.equal(loaded.recovered, true);
  assert.equal(loaded.state.week, 1);
  const exported = manager.export(s);
  assert.equal(manager.import(exported).week, 2);
  assert.throws(() => deserialize(exported.replace('Mister Test', 'Someone Else')), /checksum/);
  assert.deepEqual(deserialize(serialize(s)), s);
});
test('storage quota failure never destroys previous save', () => {
  const map = new Map(), s = small(11);
  let fail = false;
  const storage = { getItem: k => map.get(k) ?? null,
    setItem: (k, v) => { if (fail) throw new Error('QuotaExceeded'); map.set(k, v); } };
  const manager = createSaveManager(storage, 'quota');
  manager.save(s);
  completeWeek(s); fail = true;
  assert.throws(() => manager.save(s), /QuotaExceeded/);
  assert.equal(manager.load().state.week, 1);
});
test('V1 known career shape migration and unknown schema refusal', () => {
  const state = small(81), legacy = structuredClone(state);
  legacy.schemaVersion = 1; delete legacy.history; delete legacy.offers; delete legacy.vacancies;
  const raw = serialize(state);
  assert.throws(() => deserialize(JSON.stringify({ ...JSON.parse(raw), version: 88 })), /Unknown save/);
  // Genuine V1 migration: checksum for the old data shape.
  const digest = text => {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16).padStart(8, '0');
  };
  const older = JSON.parse(raw);
  older.version = 1; older.data = legacy; older.checksum = digest(JSON.stringify(legacy));
  assert.equal(deserialize(older).schemaVersion, 2);
  assert.deepEqual(deserialize(older).offers, []);
  assert.throws(() => deserialize({ ...older, checksum: 'deadbeef' }), /checksum mismatch/);
});
