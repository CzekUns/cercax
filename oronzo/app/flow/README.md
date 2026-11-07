# ORONZO R03 — Career Game Flow (headless ESM)

**Owner:** ORONZO-AGENT-07. **Scope:** `oronzo/app/flow/` plus `oronzo/systems/career/`. **Runtime UI is owned by 03**, not implemented here.

## What is actually available

- `newGame({seed,avatar,municipalityCatalog?,leagueSizes?,playerVisualById?,clubVisualKitsById?})` creates a **1979** season and a *persisted* unemployed coach, four chosen coach traits, canonical 09 financial/board club structures, 20 initial offers and a per-event seeded world. Previous `newCareer()` calls still default to 1985 for compatibility; `newCareer({startYear:1979})` is supported.
- `listInitialOffers(state)` returns 20 distinct, stable, salaried offers (first choice Promozione/Interregionale, expanding to all leagues only for reduced QA fixtures with fewer than 20 low-tier clubs). `acceptOffer(state,id,{previewOfferMorale?,applyOfferEffect?,press?})` signs once, updates club and contract, and starts the opening conference when Copy04 catalogs are supplied. The real Agent09 offer preview and morale applier run in the same detached state transaction. Failure never partially commits the contract.
- `answerOpeningPress`, `answerPostMatchPress` use the **actual exported Copy04** `createPressConference/answerPressConference` API, five opening and two postmatch questions, with stable session IDs. Questions/answers are serialized. Duplicate answers are refused. By default, semantic effects are **applied immediately** via the real Agent09 `applyPressEffect` and persisted with matching `coach.moraleEvents[]` and `flow.effectTransactions[eventId]` entries (`status:'applied'`) in the same state mutation. A replay cannot add duplicate morale/relationship deltas.
- `getRosterPlayer`, `getTrainingPlayer` consume the *same* `player.visual` and `club.visualKits` properties and return identical `playerId`/kit projections. The caller can inject the canonical source maps when creating the game. Absent canonical visuals yield `appearance:null` and status `awaiting_canonical_visual_data_from_08_01`, not random skin/hair/kit.
- `prepareMatch(state,{xi?,bench?,captainId?})` checks Agent09's `prepareMatchday`, fields exactly **one starting GK**, constructs a real MatchInputV1 and calls **Match Engine 06** `createMatch`. It returns the engine handle to the caller, which must retain it only in memory. `tickMatch(engine,realSeconds,{speed?})` uses **six simulated seconds per real second at 1×** (5400/6 = 900s = 15 real minutes), while Engine06's direct `advanceRealSeconds` is still on the older 60× scale. 03 must call `tickMatch` for R03 timing, not the older engine timer.
- `consumeMatchResult(state,engine,{press?})` rejects any match not truly at `phase:'fulltime',t:5400`; it takes `snapshot().score` and **`getEventsSince(0)`** from the genuine 06 engine and calls Career `registerResult`, validating every goal and unique fixture. It creates a real postmatch press session when the Copy04 catalogs are provided.
- `advanceMatchday(state,{presidentCatalog,simulateFixture?})` atomically generates **only other clubs'** results via an explicitly labelled deterministic provider (`uncontrolled-fixtures.js`), records those goals separately as `deterministic_uncontrolled_fixture_v1`, and uses **real Agent09** `conveneBoard`, `reviewMatch` and `endClubWeek` with `{week,absoluteWeek,seasonYear}`; all 24/104 club copies are replaced after settlement. Calls Career `advanceWeek` only after every fixture is registered. A second call during the same controlled-match phase is rejected. If Agent09 dismisses the coach, Career `applyBoardDecision` leaves the simulation continuing through `unemployed`. `takeCareerOffer` can accept a subsequently available real vacancy via the existing Career offer API.
- `rolloverSeason` calls the real Career `finishSeason`, retaining club/roster/kit/visual identities, promotions, salaries and president IDs. `saveGame`, `loadGame`, `exportGame`, `importGame` preserve checksum and existing dual-slot rollback. `loadGame` falls back read-only to old `oronzo.career.v2` slot so **1985 legacy careers are not redated**.

## UI contract for Agent03

```js
import {
  newGame,listInitialOffers,acceptOffer,getStateForUI,
  answerOpeningPress,getRosterPlayer,getTrainingPlayer,
  prepareMatch,tickMatch,consumeMatchResult,answerPostMatchPress,
  advanceMatchday,rolloverSeason,saveGame,loadGame
} from './oronzo/app/flow/controller.js';
```

**State stages:** `offers` → `opening_press` → `hub` → `pre_match` → `postmatch_press` → `postmatch_ready` → `hub` or `season_complete` or `unemployed`. New employment from vacancy returns to `hub`. All transitions require a non-game-over coach. `getStateForUI(state)` is a detached JSON projection. It exposes current game date, category, next fixture, coach, press state, club, offers, and `pendingEffectTransactions` to expose any pending entries inherited from old saves or explicitly isolated tests; regular R06 gameplay applies events immediately.

**Matchday replay protection:** UI should always submit `advanceMatchday(state,{presidentCatalog,expectedAbsoluteWeek:state.absoluteWeek})`. The controller returns `stale_week_action` on a repeated click from an older week; `expectedAbsoluteWeek` is required when unemployed, where the stage remains `unemployed` across valid advancements. This is a domain check in addition to Agent09's accounting deduplication.

**Important:** `saveGame` intentionally **rejects** `pre_match`/`match_live` (no Engine06 mid-match serialization). Save before preparing the match or after it is completed. Resume from a prepared fixture requires re-preparing from the saved prior hub, not resuming at an unverified tick. 03 must not store an engine object in Career JSON.

## Real data gate for first release

No municipality or surname catalog is generated here. The research automation owns `data/oronzo-world-research`; that reviewed PR was **not present** during R03. Without input, `world.mode === 'demo'` and all names are synthetic. `world.js:validatedMunicipalities(catalog)` requires 100 unique six-digit ISTAT codes, approved `datasetId/version/reviewStatus`, valid source/URL/publisher/license, region and three-way macroregion, province, population and reference year. The importer preserves the exact source IDs/metadata in the save and deterministic mappings to clubs. **A supplied "approved" flag is a contract assertion, not an external fact-check**; review source/rights before declaring M1. Sicilia and Sardegna are explicitly categorized as `south` for the three-way UI grouping. Current sources do not establish historical 1979 borders/teams. 104 teams may reuse municipalities when the reviewed set contains 100 entries. Expansion to 500 does not require rewriting old assignments.

Calendar starts at configurable `1979-08-01` **as a gameplay assumption**, not an attested historical Promozione fixture date. `week` remains the season round; `absoluteWeek` is monotonic for finance/board; `gameDate` persists and advances seven days per round. Existing 1985 saves remain unchanged. Stipends are fictional balancing ITL values.

## Cross-agent dependencies and merge gate

**09 / HARD DEPENDENCY:** The flow imports `createCoach`, `previewOfferMorale`, `applyOfferEffect` and `applyPressEffect` directly from `../../systems/coach-club/index.js` as delivered by **PR #39** (`agent/oronzo-coach-club-r03-morale`). The #38 branch deliberately does not modify Agent09 source. **Merge order if approved: #39 before #38.** Until the files from #39 are present in one checkout, `controller.js` cannot be imported standalone against main and Node/CI must use a combined checkout. `newGame()` uses real CoachV2 with numeric morale, relationships, events and gameOver. `acceptOffer()` and every press answer apply the actual 09 transaction immediately, preserving its event ID and coach ledger. No secondary formulas are implemented in 07. `morale=0` persists `gameOver` and all subsequent gameplay transitions fail with `GAME_OVER`. No user-facing gameplay should use the isolated-test mode.

**04:** import actual `press-opening.json`, `press-postmatch.json`, `press-media.json`, `presidents.json` from the repository. The flow never writes copy/dialogue.

**06:** one real match-engine handle per coach fixture; `getEventsSince(0)` is authoritative. Other games use a separate deterministic simulator, marked as such in `flow.resultSources`. This is not a live engine simulation of every fixture. **Individual shouts remain out of scope** until 06/08 contract gate.

**08/01/03:** supply validated player.visual and club.visualKits through the input maps; renderers read IDs, not new random appearances. No asset/UI editing here.

## Running after checkout

```sh
cd oronzo/app/flow
node --test tests/*.mjs
node demo-r03.mjs

# Regression suite on merged main:
cd ../../..
node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js
```

The demo imports `tests/qa-geography.mjs`: **100 entirely SYNTHETIC QA places**, clearly labelled `world.mode:'qa_fixture'` and `datasetStatus:'synthetic_test_only'`. It uses the real Coach09 morale, Copy04 press, Match06 engine and 09 finance when checked out with PR #39. This is not a verified ISTAT municipality catalog. The scripted non-controlled scores are synthetic and are labelled. Browser, Android and visual QA are not covered by these Node tests.

## R06 geography/morale safety gate

Normal `newGame({avatar})` accepts a fictional demo world and generates 20 offers, but **cannot accept an offer** until the coach and destination club both have an explicit `regionId` and canonical `macroRegion`. `acceptOffer` returns `{accepted:false,reason:'geography_required',messageKey:'oronzo.geography_required',missing:[...],worldStatus}` with the **entire state unchanged**. Do not fabricate an ISTAT municipality or club region to bypass it. Coach input macroregion aliases `nord/centro/sud` normalize strictly to `north/centre/south`, with no geographic inference. The product decision on what to do before the research dataset is available belongs to the orchestrator.

For **unit-test isolation only**, `newGame({effectsMode:'isolated_test'})` permits old R03 scenarios to keep `awaiting_agent09` entries; the default is `effectsMode:'integrated'`. Never expose this switch in public UI or treat its events as applied. The explicitly synthetic `tests/qa-geography.mjs` fixture is valid for reproducible tests/demo; it is never represented as approved national reference data even though it exercises the importer shape. With QA fixtures `world.mode === 'qa_fixture'`.

R06 integration test `tests/morale-r06.e2e.test.mjs` consumes real Coach09 from #39, real Copy04 and Match06, verifies offer and seven press events, retries, fulltime goal log, board/payroll, save/load, game-over, historical 1985 loads, and two-season rollover. This test is the **required gate**; test presence alone is not evidence of a passed Node run.
