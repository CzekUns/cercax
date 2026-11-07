# ORONZO — COERENTIZZATORE 00 · REPORT-R06
Data: 7 novembre 2026
**Verdetto: FIX_REQUESTED / NO MERGE.**

## Mandato
Audit mirato esclusivamente alle PR #38 e #39, REQUEST.md letto da main. Nessun merge autorizzato e nessun file di gioco modificato.

## HEAD e scope
- [PR #38](https://github.com/CzekUns/cercax/pull/38), Agent07: `94538ae97b3f7423a7d1e691a2e493524556142f` (OPEN).
- [PR #39](https://github.com/CzekUns/cercax/pull/39), Agent09: `80df15139d37c4ee36103001d6a24528037daed4` (OPEN).
- Base rilevata all'avvio: `dcec6acc931c440597c3c28a6bd9f7d24d9bb94e`.
- #38 modifica solo flow/career e REPORT07; #39 solo coach-club e REPORT09. Nessuna sovrapposizione di file.
- Checkout CI: `origin/main` più directory #38 e #39 dai due SHA esatti, senza stub dei moduli di produzione.

## Test eseguiti davvero
GitHub Actions [run 42381672625](https://github.com/CzekUns/cercax/actions/runs/42381672625), Node 22.23.4.
1. `node --test oronzo/app/flow/tests/*.mjs`: **5 PASS / 0 FAIL**.
2. `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js`: **86 PASS / 0 FAIL**, incluso test cross-module R04 104 club, 2 stagioni, 76 periodi, save/load ed esonero.
3. `node oronzo/app/flow/demo-r03.mjs`: **PASS**, anno 1979, match reale 1–2, avanzamento al 1979-08-08, saveSequence 1; demo dichiara esplicitamente `coachMorale: Agent09 effect API pending`, geografia sintetica e nessuna verifica dei veri effetti.
4. Prova aggiuntiva `newGame` + 20 offerte + `acceptOffer` con i **veri** `previewOfferMorale` e `applyOfferEffect` esportati da Coach09: **FAIL**, `TypeError: club_region_required required` in `morale.js:30`, `previewOfferMorale:53`, invocata da `controller.js:186`. Riproduzione: `newGame({avatar:{id:'r06',traits:{luck:40,leadership:80,selfEsteem:50,patience:80},origin:{regionId:'campania',macroRegion:'sud'}}})`, poi `acceptOffer(s,s.flow.initialOffers[0].id,{previewOfferMorale,applyOfferEffect})`. Il test non fornisce un catalogo di comuni verificato, quindi dimostra che il percorso di default privo di geografia non è compatibile con il callback 09; **non** prova un difetto con catalogo geografico completo.

## Difetti e responsabilità
### P0 R06-1 — Wiring degli applier non automatico, Owner: 07
`oronzo/app/flow/controller.js`, funzioni `acceptOffer`, `answerPress`, `recordEffect` (circa linee 75–110, 180–200). Gli effetti 09 sono usati solo quando un chiamante passa esplicitamente `previewOfferMorale`, `applyOfferEffect` o `applyPressEffect`; in assenza, `recordEffect` persiste `status:'awaiting_agent09'`. La demo stessa segnala il collegamento morale mancante. **Correzione Agent07:** creare un adapter/consumer esplicito con le vere API esportate dal 09, e test Node che certifichi per offerte e risposte stampa `effectStatus:'applied'`, `moraleEvents`, persistenza e assenza doppio delta al retry; non accettare uno stub. L'Agente 09 ha già consegnato il contratto callback; coinvolgerlo solo se emerge una incompatibilità della sua API reale.

### P0 R06-2 — Geografia obbligatoria assente nel percorso di default, Owner: 07
`controller.js:newGame/acceptOffer`, `world.js`, `morale.js:location/checkOffer`. In modalità demo senza catalogo verificato, `club.regionId` non è disponibile e `previewOfferMorale` rifiuta con `club_region_required`. **Correzione Agent07:** dichiarare/prevalidare il requisito di dataset geografico nel flow prima dell'offerta, oppure gestire esplicitamente la modalità senza geografia con una scelta approvata dal prodotto, senza inventare regioni. Testare sia il catalogo valido sia l'assenza di catalogo e preservare l'atomicità della firma. **Non** chiedere ad Agent09 di eliminare la validazione dei dati geografici: è un vincolo documentato.

### P1 R06-3 — Gate end-to-end reale incompleto, Owner: 07
Il demo prova Match06 e Copy04 in un flusso senza effetti Coach09. Non è stato certificato un ciclo unico con coach 09 + 20 offerte + 5 domande Copy04 + match 06 + conferenza postpartita + morale + save/reload + retry + game-over. **Correzione Agent07:** test E2E su moduli reali, anche su due stagioni, usando cataloghi reali/fixture verificate, inclusi `gameOver` a zero, cash/ledger 1979 e save legacy 1985; non usare solo callback simulati. L'Agente 09 può aggiungere un test cross-module solo se l'API pubblica non copre il contratto.

## Gate secondari e limiti
- Controller `newGame` dichiara `START_YEAR=1979`, `MATCH_SIM_SECONDS_PER_REAL_SECOND=6` (900 s reali per 5400 s simulati a 1×); la demo usa `createMatch` reale e registra score reale. Questo **non** prova il ritmo su telefono.
- I test 86 PASS certificano regressioni di career/coach, incluso save legacy e rollover, ma non sostituiscono la prova integrata con morale.
- Nessuna prova browser/Android, nessuna UI 03 verificata; non richiesto audit delle altre PR.
- Non è stato eseguito un E2E positivo con catalogo verificato, né il test di stampa con `applyPressEffect` in un flusso completo; classificati NON VERIFICATI, non PASS.
- `coach.morale` non è stato certificato come campo numerico nel caso R06 fallito perché l'asserzione precedente è passata; la failure è avvenuta successivamente durante la preview dell'offerta.

## Decisione
**FIX_REQUESTED, NO MERGE #38/#39.** I 91 test standard sono verdi, ma la compatibilità end-to-end non supera il gate funzionale. Richiedere ad **Agente 07** il wiring effettivo, la gestione dei dati geografici e un test E2E reale; ad **Agente 09** solo eventuali correzioni API dimostrate da quel test. Ripetere il gate Node completo dopo fix, senza ampliare l'audit ad altre PR.
