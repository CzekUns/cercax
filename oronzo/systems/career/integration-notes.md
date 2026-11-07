# Agent 7 — Integration Notes for the Orchestrator

**Scope created:** `oronzo/systems/career/` only. **Do not merge this as a change to `game.js` without explicit integration.** Native ESM; `package.json` declares `type:module` for Node tests but browser modules load directly.

1. Create `newCareer(config, seed)` at new-game creation, or `createSaveManager(localStorage).load()?.state` to resume. The returned state is mutable, serializable, deterministic and isolated from a running match.
2. At the start of a week, `getUpcomingFixture(state)` identifies the human-controlled fixture; read home/away clubs via `state.clubs.find(c => c.id === fixture.homeId)`. Club `players` use PlayerV1 keys. Select XI/bench and tactics via Agent 8/9, pass them into `MatchInputV1` of Agent 6. Pass `seed` derived from `state.seed`, `seasonYear` and `fixture.id` to the real engine for reproducibility.
3. Collect **all** `goal` events over every engine tick (individual MatchSnapshot `events` contain only the current tick). After full time, call `registerResult(state, {fixtureId,homeId,awayId,score:finalSnapshot.score,events:collectedEvents})`. Events use `{id, type, t, teamId, playerId, detail?}`. Never pass an arbitrary score: the registrar requires goal event counts equal the final score. The career retains goal events only to keep mobile storage bounded; keep the entire match timeline separately in Agent 6 if needed. Both XI pools must originate from their clubs. Register other fixtures from a background match-engine runner; `demo-adapter.js` must not be imported into production.
4. Once every league's current-week fixtures have results, call `advanceWeek(state,{boardDecision, vacancyClubIds})`, where `boardDecision` is an Agent 9 authorized decision for the **current** club. `addVacancy` explicitly receives clubs hiring; no manufactured vacancies. A coach with `clubId:null` may keep advancing, reading offers and `applyJobOffer`. Notify Agent 9 about accepted offers, renewal, dismissal and contract expiration via the state log (or orchestrator event forwarding).
5. `state.phase==='seasonComplete'` means all fixtures are finished. Call `finishSeason(state, {onRollover(clubs, seasonRecord) { ... }})` to snapshot tables, move clubs, keep rosters/IDs, advance the year and generate another calendar. Agent 8 should receive the rollover hook for fatigue/injury updates, skill development, retirements, academy intake, contract aging and player mobility; Agent 9 can update `seasonObjective`, budget, boardTrust, staff and presidents. Neither agent should modify recorded match outcomes.
6. Render `getStandings(state, divisionId)`, `topScorers(state.leagues[divisionId],state.clubs)`, `state.offers`, `state.history` and fixtures. All modules are independent of viewport; the standalone dashboard demo is landscape and uses only native HTML/CSS.
7. Save after each finalized result, week, job offer and season transition. The **running match** is not included in career JSON: Agent 6 must own a separate resumable match checkpoint if interrupted before fulltime. Import verifies the JSON and must require user confirmation before replacing the active career.

### Historical architecture still needed

Historical real-world competition groups, quotas, bonus decisions, classifica avulsa and spareggi cannot be reproduced by the default one-group-per-tier abstraction. Implement a federation `rulesProvider(seasonYear, region, divisionId)` and optional multi-group grouping before claiming historical completeness. `exchangeCount` is currently a uniform balanced representative-tier shortcut, not 1985 rules. In particular, the historical Interregionale was 12 groups of 16 (LND), the demo models only one. Promozione-to-lower-tier relegation is not modeled because Prima Categoria is not included.

### Compatibility QA checklist

- Match engine score and event log remain authoritative, including own goals.
- No hard-coded import path to Agents 5, 6, 8, 9; use orchestration.
- Calendar never duplicates a fixture and each player is owned by exactly one club.
- A dismissal does not end the game; job offers require board-declared vacancies.
- Save/load tested under partial-write corruption and quota exceptions; locally exporting backups is recommended.
- No file outside `oronzo/systems/career/` touched by this PR.

## Agent 07 R02 — integration contract (cross-module)

**Scope:** career-only compatibility fixes. No production runner or browser UI was integrated. The v0.2 world (1979/municipalities/20 initial offers) is gated until a future NEXT.

1. **Catalog & president:** `club.presidentId` is an ID from the eight profiles of `oronzo/content/presidents.json`, assigned deterministically from `seed:club.id` once and stored. The eight **profiles/archetypes** are reused among 104 clubs; `club.id` is the unique office/club identity. `PRESIDENT_PROFILE_IDS` contains **only canonical IDs** and never duplicates PresidentProfile content. Agent09 must resolve `profile=presidents.find(p=>p.id===club.presidentId)` from the copy catalog, reject mismatched profiles in `conveneBoard` and `reviewMatch`; copy/journalist texts must resolve the exact same profile. `newCareer({ presidentIds })` supports injecting the actual catalog ID set if it changes (the set is saved).
2. **Objectives:** Persist exactly `promotion|top_half|safety|avoid_last|development` in `club.seasonObjective`. `canonicalObjective` explicitly migrates `title|topHalf|survival|avoidRelegation`; unknown inputs throw, no safety fallback. Existing thresholds in `seasonAssessment`: promotion=1st, top_half=top ceil(n/2), safety/avoid_last=not last. Development returns `fulfilled:null`, since no sports threshold was authorized; Agent09's board remains owner of its actual assessment.
3. **Wage economy:** New players get `player.contract.weeklyWage`, safe integer ITL, deterministic by player ID and seed. Game-only weekly bases PROM 32k, INTER 65k, C2 100k, C1 180k, B 320k, A 600k; NOT historically verified salaries. Every starting roster's `weeklyPayroll<=wageBudget`. Legacy missing wages migrated **once**, old negotiated wages preserved and only old cap expanded when essential; don't add funds to pre-existing `finance.cash` on load. Agent09 processes accounts/arrears with `settleWeek`, not career.
4. **Absolute weeks:** `state.week` is relative fixture round (reset 1 on season rollover). `state.absoluteWeek` starts 1, increases once in `advanceWeek` and once again in `finishSeason` (off-season distinct period); NEVER resets. Capture `const period = state.absoluteWeek` **before** advancing; pass `{week: period}` to Agent09 `settleWeek/endClubWeek`, `conveneBoard`, `resolvePromises`, `reviewMatch`, `applyClubEvent` and financial/board event deduplication. Retry same period with same ID. Legacy saves missing an absolute counter are migrated with a 60-slot band per `seasonIndex` (max league rounds 46); historical weekly ledger data absent from older saves cannot be reconstructed.
5. **CoachV1 history:** Career keeps `coach.employmentHistory[]`, `coach.hiredSeason`, `coach.contract.until`. `normalizeCareerCoach` recovers missing fields in old saves and converts Agent09 `expiresSeason` when needed; it prevents a crash on subsequent `applyBoardDecision`. **Agent09 must update `createCoach` to PRESERVE existing fields**; no module can reconstruct history already destroyed by another factory. Replacement `state.coach = createCoach(state.coach)` is **not safe** on the current main until Agent09 R02 ships.

**Adapter outline**, not runtime code:
```js
const period = state.absoluteWeek;
const club = state.clubs.find(c=>c.id===state.coach.clubId);
const profile = presidents.find(p=>p.id===club.presidentId);
if (!profile) throw Error('Missing canonical president');
const settled = endClubWeek(club, { week: period }); // Agent09, AFTER once-only createClub
if (settled.accepted) state.clubs[state.clubs.findIndex(c=>c.id===club.id)] = settled.club;
// Only once all results in the season round have been submitted by Agent06:
advanceWeek(state);
// Finish season via finishSeason(state) after state.phase === 'seasonComplete'.
```
Agent09 helpers use immutable club copies; always replace the returned club by ID. Don't call `createClub` again on a club with persisted `finance`, because that factory initializes cash. Agent08 player evolution must preserve `contract.weeklyWage`. Event/scores are solely from Agent06; `demo-adapter.js` is not production.

**QA:** `node --test tests/*.test.mjs` covers deterministic president catalog IDs, objectives and thresholds, 104 payrolls, legacy v2 import, two season rollovers and coach reassignment. Full cross-run against Agent09 and Android UI remain gate checks, not claimed as completed by Agent07.
