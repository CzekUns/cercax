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
