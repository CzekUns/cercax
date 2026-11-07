import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DIVISIONS } from '../league.js';
import { newCareer, fixturesForWeek, registerResult, advanceWeek, finishSeason,
  applyBoardDecision, addVacancy, applyJobOffer } from '../career.js';
import { canonicalObjective, PRESIDENT_PROFILE_IDS, WEEKLY_WAGE_BASE_ITL,
  normalizeCareerCompatibility } from '../compat.js';
import { seasonAssessment } from '../progression.js';
import { serialize, deserialize, validateCareer } from '../save.js';

const fixturePath = new URL('../../../content/presidents.json', import.meta.url);
const catalog = JSON.parse(readFileSync(fixturePath, 'utf8'));
const ids = new Set(catalog.presidents.map(profile => profile.id));
const sizes = Object.fromEntries(DIVISIONS.map(d => [d.id, 4]));
const make = seed => newCareer({ leagueSizes: sizes }, seed);
function completeWeek(s) {
  for (const f of fixturesForWeek(s)) registerResult(s, { fixtureId: f.id,
    score: { home: 0, away: 0 }, events: [] });
  advanceWeek(s);
}
function completeSeason(s) { while (s.phase === 'inSeason') completeWeek(s); }
const digest = text => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
};
function legacyEnvelope(state) {
  const data = JSON.stringify(state);
  return JSON.stringify({ kind: 'ORONZO_CAREER', version: state.schemaVersion,
    sequence: 0, checksum: digest(data), data: state });
}

test('R02-1: every club uses a catalog profile, deterministic reuse and 2-season save', () => {
  assert.deepEqual(PRESIDENT_PROFILE_IDS, catalog.presidents.map(p => p.id));
  const a = make(23), b = make(23);
  assert.deepEqual(a.clubs.map(c => c.presidentId), b.clubs.map(c => c.presidentId));
  assert.ok(a.clubs.every(c => ids.has(c.presidentId)));
  assert.ok(new Set(a.clubs.map(c => c.presidentId)).size <= catalog.presidents.length);
  assert.equal(new Set(a.clubs.map(c => c.id)).size, 24);
  const before = a.clubs.map(c => [c.id, c.presidentId]);
  completeSeason(a); finishSeason(a);
  const once = deserialize(serialize(a));
  completeSeason(once); finishSeason(once);
  assert.deepEqual(once.clubs.map(c => [c.id, c.presidentId]), before);
});

test('R02-2: canonical board objective, legacy aliases and assessment thresholds', () => {
  assert.equal(canonicalObjective('topHalf'), 'top_half');
  assert.equal(canonicalObjective('avoidRelegation'), 'avoid_last');
  assert.equal(canonicalObjective('survival'), 'safety');
  assert.throws(() => canonicalObjective('not_an_objective'), /Unknown season objective/);
  const state = make(10);
  assert.equal(state.clubs.find(c => c.id === 'PROM-01').seasonObjective, 'avoid_last');
  assert.ok(state.clubs.filter(c => c.id !== 'PROM-01').every(c => c.seasonObjective === 'top_half'));
  const table = Array.from({ length: 4 }, (_, i) => ({ clubId: 'team' + (i + 1), position: i + 1 }));
  assert.deepEqual(seasonAssessment(null, table, 'team3', 'topHalf'),
    seasonAssessment(null, table, 'team3', 'top_half'));
  assert.equal(seasonAssessment(null, table, 'team3', 'top_half').fulfilled, false);
  assert.equal(seasonAssessment(null, table, 'team3', 'avoid_last').fulfilled, true);
  assert.equal(seasonAssessment(null, table, 'team4', 'avoid_last').fulfilled, false);
  assert.equal(seasonAssessment(null, table, 'team4', 'development').fulfilled, null);
});

test('R02-3: nonzero integer salaries, deterministic payroll and cap with 104 clubs', () => {
  const s = newCareer({}, 42);
  assert.equal(s.clubs.length, 104);
  assert.equal(Object.keys(WEEKLY_WAGE_BASE_ITL).length, 6);
  for (const club of s.clubs) {
    const payroll = club.players.reduce((sum, p) => {
      assert.ok(Number.isSafeInteger(p.contract.weeklyWage) && p.contract.weeklyWage > 0);
      return sum + p.contract.weeklyWage;
    }, 0);
    assert.ok(payroll > 0 && payroll <= club.wageBudget);
    assert.ok(club.budget >= payroll * 10);
  }
  assert.deepEqual(s, newCareer({}, 42));
  assert.deepEqual(deserialize(serialize(s)), s);
});

test('R02-1,2,3,4,5: migrate old v2 without reassigning existing contracts', () => {
  const old = make(5);
  for (const club of old.clubs) {
    club.presidentId = 'president:' + club.id;
    club.seasonObjective = club.id === 'PROM-01' ? 'avoidRelegation' : 'topHalf';
    club.wageBudget = 100;
    for (const [i, player] of club.players.entries()) {
      if (i === 0) player.contract = { weeklyWage: 89000, expiresSeason: '1986-87' };
      else delete player.contract;
    }
  }
  delete old.absoluteWeek;
  delete old.presidentCatalogIds;
  delete old.coach.employmentHistory;
  delete old.coach.hiredSeason;
  const result = deserialize(legacyEnvelope(old));
  assert.equal(result.absoluteWeek, 1);
  assert.deepEqual(result.coach.employmentHistory, []);
  assert.equal(result.coach.hiredSeason, 1985);
  assert.ok(result.clubs.every(c => ids.has(c.presidentId)));
  assert.equal(result.clubs.find(c => c.id === 'PROM-01').seasonObjective, 'avoid_last');
  assert.equal(result.clubs.find(c => c.id === 'A-01').seasonObjective, 'top_half');
  assert.equal(result.clubs[0].players[0].contract.weeklyWage, 89000);
  assert.ok(result.clubs.every(c => c.players.reduce((v, p) => v + p.contract.weeklyWage, 0) <= c.wageBudget));
  const twice = deserialize(serialize(result));
  assert.deepEqual(result, twice);
  assert.throws(() => { result.clubs[1].presidentId = 'invented-id';
    normalizeCareerCompatibility(result); }, /Unknown persisted presidentId/);
});

test('R02-4: absoluteWeek remains unique across rollover and reload', () => {
  let s = make(80);
  const recorded = [];
  for (let year = 0; year < 2; year++) {
    while (s.phase === 'inSeason') {
      recorded.push(s.absoluteWeek);
      completeWeek(s);
      s = deserialize(serialize(s));
    }
    const end = s.absoluteWeek;
    finishSeason(s);
    assert.ok(s.absoluteWeek > end);
    s = deserialize(serialize(s));
  }
  assert.equal(new Set(recorded).size, 12);
  for (let i = 1; i < recorded.length; i++) assert.ok(recorded[i] > recorded[i - 1]);
  assert.equal(s.seasonYear, 1987);
});

test('R02-5: legacy coach missing career fields survives save and dismissal, then rehire', () => {
  const base = make(53), oldClub = base.coach.clubId;
  delete base.coach.employmentHistory;
  delete base.coach.hiredSeason;
  base.coach.contract = { weeklyWage: 20000, expiresSeason: '1985-86' };
  const state = deserialize(legacyEnvelope(base));
  assert.equal(state.coach.contract.until, 1986);
  applyBoardDecision(state, { type: 'dismiss', clubId: oldClub });
  assert.equal(state.coach.employmentHistory[0].clubId, oldClub);
  const after = deserialize(serialize(state));
  addVacancy(after, 'PROM-02');
  const offer = after.offers.find(o => o.clubId === 'PROM-02');
  applyJobOffer(after, offer.id);
  assert.equal(after.coach.clubId, 'PROM-02');
  assert.equal(after.coach.hiredSeason, 1985);
  assert.equal(after.coach.employmentHistory[0].reason, 'dismissed');
  validateCareer(after);
});
