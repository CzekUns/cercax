# ORONZO — R12 single-dispatch report (Agente esecutivo straordinario)
Repository `CzekUns/cercax`, branch `agent/oronzo-r12-single-completion-20261110`, PR #70 (draft, no merge).

## Baseline, provenance, and exclusions
- Baseline real `main`: `1b54d76e62f6d8a6bc2fc8b8d77dfe0b8ef0f06f`. R11 PR #63 and #66 already merged; reused rather than reimplemented.
- PR #12 Agent02 stayed OPEN/DRAFT; 24 original blobs (PNG strips/masks/backgrounds, manifest and provenance/source) were copied into R12 by their exact same-repo SHA without merging #12. Art approval not presumed.
- Original editor remains developer-only, no root CercaX modules changed. Only ORONZO paths plus dedicated `.github/workflows/oronzo-r12-qa.yml` changed.
- PR #69 independent R11 audit was read as baseline evidence, NOT an independent R12 audit.
- All modifications are tentative until PR #70 CI and Agent00 review. No merge.

## Concrete changes
1. **A random career seed:** `systems/career/seed-r12.js`; each actual click NUOVA PARTITA generates 53 random bits via `crypto.getRandomValues`, stores seed and rngState through existing Career07, with explicit reproducible `?seed=1979` QA override. Stable offer/roster RNG used thereafter.
2. **B player appearance:** `systems/attributes/visual-r12.js`; playerId+seed canonical appearance (skin, hair, hairstyle, facial hair/color and face variant), clubId+seed kits (home/away/keeper, shirt patterns, shorts/socks). Missing-only old-save migration, no overwrite of existing player visuals or geography. `match-view/player-details-r12.js` draws facial-hair/hair pixels over the original Agent01 masked PNG in ROSA and match, with independent per-player kit map.
3. **C origin:** `systems/attributes/world-origins-r12.js` converts approved contemporary municipality records to PlayerV2 `{comune,regione,macroregione}`, integrated at creation. Historical 1979 birthplace is **fictional gameplay origin**, not a verified biographical claim. Existing saved origins never rewritten. Engine06 regional affinity continues to own tactical effects.
4. **D president:** `systems/coach-club/president-traits-r12.js` implements persistent idempotent modifiers of luck/leadership/selfEsteem/patience from 09 president archetype. Base traits remain immutable. Bonus replaced when hiring/changing president and cleared on unemployment. Influences training, shout leadership, genuine press outcome and coach prep. First president page displays `base + modifier = effective`.
5. **E provincial serial:** `content/career-narrative-r12.js` records one seeded story per week/appointment, based on real match score, board trust/cash, current president and club; eight wholly fictional broadcaster/reporter pairs, original satirical text, live GIORNALI display and one idempotent player decision using Coach09 `applyClubEvent` and save ledger. Repeated longer arcs, broader press variants and multi-character plot lines remain partial.
6. **F individual shouts:** `content/shouts-r12.js` selects among the 80 existing Italian Copy04 utterances by actual match events, minute/tone/player and seed; rendered upon accepted Engine06 order, utterance ID is passed through and recorded with event. Geographic affinity mechanics remain Engine06. **Zero dialect variants released**: original `regionalReviewQueue` is unverified, so no invented dialect attestation.
7. **G cutscenes:** all 24 PR12 draft cutscene assets are available at their expected runtime URLs, and inherited `match-view.js` maps real Engine06 goal/save/yellow/red/injury to those scenes. 5 masks plus original backgrounds present. Scene player face details, art gate and Android visual timing are **not independently certified**.
8. **H world data:** existing approved `data/world/municipalities-m1.json` has **500** contemporary municipalities, 19 region keys (Lombardia not in current 500), and 19 CC BY 4.0 sources from RP92 with pinned metadata; no fictional 1979 population. Existing `attributes/data/bergamo-2021-m1.js` has **600** unique municipal surnames, Comune di Bergamo 2021, CC0 1.0, pinned SHA, limited to `frequency >10` in source. No unverified 5,000-cognome expansion was added. Needs a reusable licensed dataset with 4,400 additional **distinct verified Italian** surnames and compatible stable IDs, plus national/regional provenance. Onomaverse CC BY 4.0 world-surname dataset is a research candidate only; its coverage for Italy and overlap are not yet verified. Never claim national rarity rank.
9. **I long career:** native test runs authentic Engine06 full 90 minutes accelerated by test clock, through 38 weekly steps per season, five continuous standard seasons, proper season rollover and real serialize/deserialize checkpoints. Does not fabricate fixture outcomes. Additional career branches (dismissal, long unemployment, new employer and game over) still need dedicated deterministic tests.
10. **L/M UI and balance:** reused R11 management and TV/FULL renderer; player appearance and broadcaster choices integrated into live DOM, 80 utterances and modifiers tied to Engine06/Coach09. Full mobile-device/physical touch, quantitative one-variable-at-a-time sweep for **all** physical/mental stats, and art polish remain open.

## Evidence / commands actually executed by GitHub Actions
Workflow: `.github/workflows/oronzo-r12-qa.yml`; source code and logs reproducible through PR #70 check list. Exact commands:
- `node --check` on R12 JS module list and UI script.
- `node --test oronzo/app/flow/tests/r12-integration.test.mjs`
- `node --test oronzo/app/flow/tests/r11-integration.test.mjs oronzo/app/flow/tests/m1-contract.test.mjs oronzo/assets/ui/sections-r11/sections-r11.test.mjs`
- `python3 -m http.server 8123 --bind 127.0.0.1` then `node oronzo/assets/ui/qa/r12-browser.mjs` (Playwright Chromium HTTP, 640x360, 800x360, 844x390 and 960x400; saved screenshots/JSON if reached).
- CI run **42770403895**, HEAD **82be5e949571233920b87b5f5a730aaae29902c0**: native syntax PASS; R12 **four of six tests PASS** including **five full 1979–84 seasons in 233,013ms**, seed/replay and president modifier; two failed due QA-only incorrect GK shirt comparison and one-region town fixture. R11 regression PASS. Chromium timed out waiting for `#qa-mode` on the entry screen (QA checkbox exists only after AVATAR). These 3 test mistakes were corrected in subsequent commits. This first run is a **FAIL**, never described as an R12 green build.
- Later CI HEAD(s) include corrected tests, actual 500-town national geography test, original live narrative + Coach09 effects, 80 original shouts, pixel-art hair/beard, cutscene asset presence + 5 event-mapping assertions, regional Engine06 fixed-RNG differential and five-season regression. **Record real latest CI status from GitHub before calling any of these PASS**.
- Chromium simulated touch/viewport is NOT a physical Android device. Real time at 1x is implemented as ~15 minutes, but no device-time measurement is certified here.

## Matrix v0.2 (as implemented, not inflated)
| Mission | Status | Unfinished / blocking requirement |
| --- | --- | --- |
| A random seeded careers | COMPLETE, pending final CI | verify browser reload across all four viewports |
| B visuals, persistent | PARTIAL | PNG cosmetology in cutscenes, art review and real Chromium |
| C sourced geographic origins | PARTIAL | national diversity and 1979 origins unverified; exact engine differential rerun |
| D president traits and transitions | PARTIAL | actual new-employer change and self-esteem adjustment sensitivity |
| E original provincial narrative | PARTIAL | extended evolving narrative branches and presentation polish |
| F regional shouts | PARTIAL | 80 real Italian utterances wired; zero linguistically reviewed dialects |
| G real-event cutscenes | PARTIAL | original art approval and on-screen timing / trigger checks still needed |
| H municipalities/surnames | PARTIAL | 500 municipalities, 600 verified surnames; 4,400 missing and Lombardia coverage |
| I 5-season, unemployment, dismissal | PARTIAL | 5-season PASS on older HEAD; dismissal/new club/game over path not end-to-end proven |
| L 4-viewports & original UI | PARTIAL | physical Android landscape, accessibility and long-scroll screenshots |
| M full balance / determinism | PARTIAL | complete one-factor sweep across attributes unproven |

## Final independent audit needed
Agente 00 must independently check PR #70's latest exact HEAD (re-query it), all written files and original PNG assets, run Node native and Chromium HTTP on the merged-in-memory R11 main + PR70 (NOT merge PR70), verify game complete and dismissals, economic idempotence and provenance. Mark each module PASS / NEEDS CHANGES / NON CERTIFICATO. Require art gate Agent02 separately. Agent 10-bis coordinates, user alone approves any merge.


## Verifica esecutiva R12-BIS — 10 novembre 2026, PR #70
- **Correzione reale A:** la fixture nazionale di `r12-integration.test.mjs` ora seleziona il comune natale del mister direttamente da `municipalities-m1.json`, controllandone ID, regione e macroregione. La validazione in `controller.newGame` resta obbligatoria; la vecchia fixture QA fittizia `000001` non viene spacciata per comune del catalogo nazionale.
- **Correzione reale B:** `sections-r11/sections.js` conserva il renderer delle notizie R12 e delle sole risposte realmente registrate, ma ripristina il testo regressivo `Nessuna conferenza registrata.` per l'archivio vuoto.
- **Evidenza CI dell'HEAD funzionale `be3b29bb8546bdae7554ac8f7f31835dfad6a4e4`:** GitHub Actions run [42903632012](https://github.com/CzekUns/cercax/actions/runs/42903632012), stato **SUCCESS**. `node --check` PASS; suite R12 **9/9 PASS** con cinque stagioni complete; regressione R11/contratti/sezioni **33/33 PASS**; Chromium HTTP reale **52/52 PASS**, quattro viewport 640×360 / 800×360 / 844×390 / 960×400; 0 errori rilevati. Immagini e log negli artifact di workflow.
- **Stato:** codice #70 verificato sul ramo PR. La compatibilità con PR #72 e il deployment pubblico richiedono gate successivi prima del rilascio. Playtest su Android fisico e rifiniture artistiche delle cutscene non certificati. PR #12 resta separata.
- Questa appendice aggiorna il REPORT senza rivendicare un merge; le prove riferite alla commit funzionale precedente restano esatte e tracciabili.
