import test from 'node:test';
import assert from 'node:assert/strict';
import { DIVISIONS } from '../league.js';
import { newCareer, fixturesForWeek, registerResult, advanceWeek, finishSeason, applyBoardDecision } from '../career.js';
import { serialize, deserialize } from '../save.js';
import { initializeFinances, weeklyPayroll, settleWeek } from '../../coach-club/finance.js';
import { createCoach } from '../../coach-club/coach-model.js';
import { normalizeCareerCoach } from '../compat.js';

const sizes = Object.fromEntries(DIVISIONS.map(d => [d.id, 4]));
function scorelessRound(state) {
  for (const f of fixturesForWeek(state)) registerResult(state, { fixtureId: f.id, score: { home: 0, away: 0 }, events: [] });
  advanceWeek(state);
}

test('R02 career + real Agent09 finance: two seasons, salary, saved absolute weeks and retries', () => {
  let s = newCareer({ leagueSizes: sizes }, 70);
  s.clubs = s.clubs.map(c => initializeFinances(c)); // initial factory once ONLY
  const initial = s.clubs[0].finance.cash;
  const allKeys = [];
  for (let season = 0; season < 2; season++) {
    while (s.phase === 'inSeason') {
      const period = { week: s.week, absoluteWeek: s.absoluteWeek, seasonYear: s.seasonYear };
      allKeys.push(period.absoluteWeek);
      for (const [i, club] of s.clubs.entries()) {
        assert.ok(weeklyPayroll(club) > 0);
        const settled = settleWeek(club, period);
        assert.equal(settled.accepted, true);
        assert.equal(settled.paidWages, weeklyPayroll(club));
        assert.equal(settleWeek(settled.club, period).reason, 'week_already_settled');
        assert.equal(settled.club.finance.settledWeeks.at(-1), `a:${period.absoluteWeek}`);
        s.clubs[i] = settled.club;
      }
      scorelessRound(s);
      s = deserialize(serialize(s));
    }
    const ending = s.absoluteWeek;
    finishSeason(s);
    assert.ok(s.absoluteWeek > ending);
    s = deserialize(serialize(s));
    if (season === 0) {
      // The first period of season 2 is genuinely new, despite season-week 1 repeating.
      // Test it on the returned immutable copy; the normal loop below settles the
      // original club exactly once during season 2.
      const nextPeriod = { week: s.week, absoluteWeek: s.absoluteWeek, seasonYear: s.seasonYear };
      const club = s.clubs[0];
      assert.equal(settleWeek(club, { week: s.week }).reason, 'period_migration_required');
      const next = settleWeek(club, nextPeriod);
      assert.equal(next.accepted, true);
      assert.equal(next.paidWages, weeklyPayroll(club));
      assert.equal(next.club.finance.settledWeeks.at(-1), `a:${nextPeriod.absoluteWeek}`);
      assert.equal(settleWeek(next.club, nextPeriod).reason, 'week_already_settled');
      assert.equal(club.finance.settledWeeks.includes(`a:${nextPeriod.absoluteWeek}`), false);
    }
  }
  assert.equal(new Set(allKeys).size, allKeys.length);
  assert.equal(allKeys.length, 12);
  assert.ok(s.clubs[0].finance.cash < initial);
  assert.equal(s.clubs[0].finance.settledWeeks.length, 12);
  assert.equal(s.history.length, 2);
});

test('R02 career guard survives Agent09 createCoach normalization then dismissal and reload', () => {
  const s = newCareer({leagueSizes:sizes}, 54);
  const clubId = s.coach.clubId;
  s.coach = createCoach(s.coach); // current Agent09 factory drops career extension fields
  normalizeCareerCoach(s.coach, s.seasonYear); // Agent07 backwards-safety guard
  const restored = deserialize(serialize(s));
  applyBoardDecision(restored, {type:'dismiss',clubId});
  assert.equal(restored.coach.employmentHistory.at(-1).reason, 'dismissed');
  assert.equal(restored.coach.clubId, null);
  // Not a history-preservation claim: Agent09 must preserve input fields itself.
});
