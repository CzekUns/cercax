# ORONZO — Career Mode (Agent 7)

Independent, browser-first JavaScript ES module career/competition system. **Status: working vertical slice, not wired into `oronzo/game.js`.** No dependencies or server. `career-demo.html` runs in **landscape 16:9** and can simulate one or many **complete** seasons via the clearly labelled *demo-only* result provider. The integrated game **must use the real Agent 6 engine** for match results.

## Play / test

From the repository root: `python3 -m http.server 8000`, then open `http://localhost:8000/oronzo/systems/career/career-demo.html`. Some browsers block module imports from `file://`; use a local server or GitHub Pages. In `oronzo/systems/career/`, run `node --test tests/*.test.mjs` (Node 18+; tested Node 22). No `npm install` required. Demo lets you simulate a week, simulate the rest of the season, roll to a new season, look at all six tables, get fired, renew, get a new job, export/import and reset (with confirmation).

## Public API

```js
import { newCareer, getUpcomingFixture, registerResult, advanceWeek,
  finishSeason, getStandings, fixturesForWeek, addVacancy, applyJobOffer,
  applyBoardDecision } from './career.js';
import { serialize, deserialize, createSaveManager } from './save.js';
import { topScorers, standings, generateSchedule } from './league.js';

const state = newCareer({ coachName: 'Mister Bianchi' }, 1985);
const upcoming = getUpcomingFixture(state); // null when unemployed / no match
// Your real Agent 6 runner must deliver the result and ALL goal events:
registerResult(state, {
  fixtureId: upcoming.id,
  homeId: upcoming.homeId, awayId: upcoming.awayId,
  score: {home: 1, away: 0},
  events: [{id: 'match:goal:1', type: 'goal', t: 2400,
    teamId: upcoming.homeId, playerId: '...valid player id...'}]
});
// Register other fixtures from the engine/background results provider.
if (fixturesForWeek(state).every(f => f.result)) advanceWeek(state);
// After final week, state.phase === 'seasonComplete':
// finishSeason(state, { onRollover(clubs, snapshot) { /* Agent 8 hook */ } });
const saves = createSaveManager(localStorage);
saves.save(state); const recovered = saves.load()?.state;
const exportedJSON = serialize(state); const importedState = deserialize(exportedJSON);
```

Functions mutate the passed state and return it. `registerResult` rejects duplicate results, mismatched fixtures, invented/unaccounted goals, unknown scorers and out-of-turn fixtures. `advanceWeek` refuses to skip unplayed league games. `getStandings` is derived from the recorded fixture histories. `topScorers` counts only valid recorded goal events (not own goals).

## Default world (original, imaginary clubs)

| Division | Representative groups | Clubs in the demo |
| --- | ---: | ---: |
| Serie A | 1 | 16 |
| Serie B | 1 | 20 |
| Serie C1 | 1 of the historically multiple groups | 18 |
| Serie C2 | 1 of the historically multiple groups | 18 |
| Campionato Interregionale | 1 of the historically multiple groups | 16 |
| Promozione | 1 fictional regional group | 16 |

Total: **104 clubs with 16 unique, persistent players each (1,664)**. Promozione's `PROM-01` is the deliberately struggling starting club. Fixtures use seeded two-legged round robins; teams in 16-team leagues play 30 games, 18-team leagues 34, B 38. A global `week` counter runs 1–38; clubs with finished competitions have no further matches. The same club and player IDs persist after promotions, demotions and season rollovers. Players age by one year, and statistics separate lifetime and current-season goals. Transfers, retirement, physical progression, injuries, bonuses, finances and staffing are Agent 8/9 ownership; `onRollover` can inject player evolution from Agent 8.

## Historical fidelity / conscious abstractions

Confirmed 1985–86 facts:
- **2 points per win**, 1 for a draw (examples: Serie A and C2).
- Promozione was the **sixth tier**, highest regional competition; "Eccellenza" is an anachronism for this starting year.
- Serie A 16 clubs; Serie B 20; Serie C1 and C2 had multiple groups of 18. Interregionale had 12 groups of 16. Regionally managed Promozione rules and qualifying play-offs differed by committee and circumstances.
- Different categories had different promotions/relegations, and some title/qualification ties could require spareggio or classifica avulsa.

This **vertical slice deliberately models one representative group per tier**. `exchangeCount` defaults to **one promotion / one relegation per adjacent modeled boundary** so every league remains balanced over unlimited consecutive seasons; this is a game abstraction, **NOT historical promotion/relegation quotas**. The bottom Promozione has no playable lower level, and A no higher level. `leagueSizes`, `exchangeCount`, `rulesByDivision` and `tieBreakers` can be overridden in `newCareer` config. Demo standings default to points → goal difference → goals for → ID to guarantee deterministic ranking, **NOT a claim of historical tie-break correctness**. `headToHead` is implemented as a mini-league of tied teams once their mutual fixtures finish. Mandatory play-offs, extra-group quotas, geographic realignment, and repechage remain **planned / external rules-provider integrations**, not simulated here. Historical rules must be resolved per division/year before claiming fidelity.

Research references:
- [Serie A 1985–86](https://it.wikipedia.org/wiki/Serie_A_1985-1986)
- [Serie B 1985–86](https://it.wikipedia.org/wiki/Serie_B_1985-1986)
- [Serie C2 1985–86](https://it.wikipedia.org/wiki/Serie_C2_1985-1986)
- [Campionato Interregionale 1985–86](https://it.wikipedia.org/wiki/Campionato_Interregionale_1985-1986)
- [Promozione 1985–86](https://it.wikipedia.org/wiki/Promozione_1985-1986)
- [LND: storia del Campionato Interregionale](https://oldseried.lnd.it/it/seried-organizzazione/la-storia)

## Employment, board and reputation

Reputation is updated with results and season objective measurements; job offers come **only from known vacant clubs** and check reputation requirements by tier. Contract expiration and offer acceptance work without a club; advancing weeks never requires employment. `applyBoardDecision(state, {type:'dismiss'|'renew'|'retain', clubId, until?})` is an **input from Agent 9**; this subsystem never derives sackings or renewals from boardTrust or fabricates financial decisions. The demo has explicit test buttons that imitate Agent 9 decisions. `addVacancy(state, clubId)` exposes board-controlled openings.

## Save resilience

`serialize/deserialize`: version-2 JSON envelope, explicit schema, integrity checksum, cloned import and narrow v1-career migration. A completely different older `oronzo_v01` prototype save is not misidentified as a career save. `createSaveManager(localStorage)` alternates `:A` / `:B` slots, verifies the write before changing `:active`, recovers the previous slot if active is corrupt, and keeps an older save untouched if browser storage throws a quota error. JSON download/import allows offline transfer to another phone. The localStorage prototype is browser/device local and can still disappear if the browser clears site data: export backups regularly. No cloud sync or cryptographic tamper protection.

## Known limits

The demo provider (`demo-adapter.js`) uses deterministic seeded chance to produce artificial matches **solely to exercise season orchestration**. These scores are not match-engine outcomes. No live match pause/resume UI here (owned by Agents 5/6). No simultaneous multi-group national federation model, formal playoff fixtures or transfers yet. The agent owns this directory only; the orchestrator is responsible for wiring production match, board, attributes, art and copy modules.
