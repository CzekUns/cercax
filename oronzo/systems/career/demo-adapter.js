/** DEMO/TEST-ONLY result provider; replace with Agent 6 engine in the integrated game. */
import { seededRandom } from './league.js';
export function demoMatchResult(fixture, state) {
  const rng = seededRandom(`${state.seed}:${fixture.id}:EXTERNAL_DEMO_RESULT`);
  const home = state.clubs.find(c => c.id === fixture.homeId);
  const away = state.clubs.find(c => c.id === fixture.awayId);
  const rating = club => club.players.reduce((acc, p) => acc + p.technical.shooting + p.technical.passing, 0) / (club.players.length * 2);
  const attackingChance = (own, opponent, advantage) => Math.max(0.06, Math.min(0.47, 0.21 + (rating(own) - rating(opponent)) / 250 + advantage));
  const events = []; let homeGoals = 0, awayGoals = 0;
  for (let minute = 4; minute < 90; minute += 5) {
    const team = rng() < 0.52 ? home : away, defender = team === home ? away : home;
    if (rng() >= attackingChance(team, defender, team === home ? 0.025 : 0)) continue;
    const forwards = team.players.filter(p => p.positions.includes('FW'));
    const scorer = forwards[Math.floor(rng() * forwards.length)];
    if (team === home) homeGoals++; else awayGoals++;
    events.push({ id: `${fixture.id}:goal:${events.length + 1}`, type: 'goal', t: minute * 60,
      teamId: team.id, playerId: scorer.id });
  }
  return { fixtureId: fixture.id, homeId: home.id, awayId: away.id,
    score: { home: homeGoals, away: awayGoals }, events };
}
