# ORONZO R03 — Career Game Flow (headless ESM)

**Owner:** ORONZO-AGENT-07. **Scope:** `oronzo/app/flow/` plus `oronzo/systems/career/`. **Runtime UI is owned by 03**, not implemented here.

## What is actually available

- `newGame({seed,avatar,municipalityCatalog?,leagueSizes?,playerVisualById?,clubVisualKitsById?})` creates a **1979** season and a *persisted* unemployed coach, four chosen coach traits, canonical 09 financial/board club structures, 20 initial offers and a per-event seeded world. Previous `newCareer()` calls still default to 1985 for compatibility; `newCareer({startYear:1979})` is supported.
- `listInitialOffers(state)` returns 20 distinct, stable, salaried offers (first choice Promozione/Interregionale, expanding to all leagues only for reduced QA fixtures with fewer than 20 low-tier clubs). `acceptOffer(state,id,{previewOfferMorale?,applyOfferEffect?,press?})` signs once, updates club and contract, and starts the opening conference when Copy04 catalogs are supplied. Failed effect handlers never partially commit the contract.
- `answerOpeningPress`, `answerPostMatchPress` use the **actual exported Copy04** `createPressConference/answerPressConference` API, five opening and two postmatch questions, with stable session IDs. Questions/answers are serialized. Duplicate answers are refused. Semantic effects are kept in `flow.effectTransactions[eventId]`, status `awaiting_agent09`, unless a separately injected Agent09 effect adapter confirms the change; **no morale, trust or money is invented** in this module.
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

**State stages:** `offers` → `opening_press` → `hub` → `pre_match` → `postmatch_press` → `postmatch_ready` → `hub` or `season_complete` or `unemployed`. New employment from vacancy returns to `hub`. All transitions require a non-game-over coach. `getStateForUI(state)` is a detached JSON projection. It exposes current game date, category, next fixture, coach, press state, club, offers, and `pendingEffectTransactions` to show the pending Agent09 integration honestly.

**Important:** `saveGame` intentionally **rejects** `pre_match`/`match_live` (no Engine06 mid-match serialization). Save before preparing the match or after it is completed. Resume from a prepared fixture requires re-preparing from the saved prior hub, not resuming at an unverified tick. 03 must not store an engine object in Career JSON.

## Real data gate for first release

No municipality or surname catalog is generated here. The research automation owns `data/oronzo-world-research`; that reviewed PR was **not present** during R03. Without input, `world.mode === 'demo'` and all names are synthetic. `world.js:validatedMunicipalities(catalog)` requires 100 unique six-digit ISTAT codes, approved `datasetId/version/reviewStatus`, valid source/URL/publisher/license, region and three-way macroregion, province, population and reference year. The importer preserves the exact source IDs/metadata in the save and deterministic mappings to clubs. **A supplied "approved" flag is a contract assertion, not an external fact-check**; review source/rights before declaring M1. Sicilia and Sardegna are explicitly categorized as `south` for the three-way UI grouping. Current sources do not establish historical 1979 borders/teams. 104 teams may reuse municipalities when the reviewed set contains 100 entries. Expansion to 500 does not require rewriting old assignments.

Calendar starts at configurable `1979-08-01` **as a gameplay assumption**, not an attested historical Promozione fixture date. `week` remains the season round; `absoluteWeek` is monotonic for finance/board; `gameDate` persists and advances seven days per round. Existing 1985 saves remain unchanged. Stipends are fictional balancing ITL values.

## Backend dependencies not supplied by 07

**09:** currently owns finance/board and the CoachV1 factory but has not delivered the V2 `previewOfferMorale`, offer-effect or press-effect appliers. The flow accepts them as injected functions and keeps unhandled semantic transactions pending, never applying fictitious effects. Exact callback contract: `({eventId,kind,semanticEffects,coach,club,offer?}) => {accepted:true,coach,club?}`, returning a detached updated coach/club; the caller must ensure persistence of `eventId`. The game-over rule on `coach.gameOver`/`coach.morale===0` is enforced when supplied by 09. **No claim** of morale integration until 09 delivers those callbacks and QA.

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

The first scenario uses a reduced 24-club fixture, but the actual 04 press API, actual 06 match-engine, and actual 09 finances when executed from a complete checkout. The scripted non-controlled scores are synthetic and are labelled. Browser, Android and visual QA are not covered by these Node tests.
