# ORONZO — ORONZO-AGENT-07 · Fix R06-1 / R06-2 / R06-3
**Stato:** FIX_DELIVERED · PR #38 aperta, **NO MERGE**.  
**Branch:** `agent/oronzo-career-r03-flow`  
**Audit di riferimento:** [REPORT-R06 — Coerentizzatore 00](https://github.com/CzekUns/cercax/blob/audit/oronzo-r06-38-39/oronzo/coordination/coerentizzatore/REPORT-R06.md)  
**Dipendenza obbligatoria:** [PR #39 — Coach09 Morale R03](https://github.com/CzekUns/cercax/pull/39), HEAD audit `80df15139d37c4ee36103001d6a24528037daed4`.  
**Data:** 7 novembre 2026 (Europe/Rome).
**Commits R06 nel branch #38:** geografia `740dfaa1b36d0e5c057172d7988d67558a4dc1e1`; consumer morale `a1e39f17c7fd9a9554f16e383541c27795861a7a` e guard origine `1d61f326d9f5145b481706e2bcc09cb66c0accd3`; fixture QA `fa9ceea384cebde726fbd7bb9d4a9367078ecab9`; test E2E iniziale `c14a0e011889452e08d3597474b279592a360adc`, stabilizzazione test `51a3cc03abbbb6eaa7a9672406b649176f3f8068`, guard record origine `88f23d0402ad24cb94b979ec89605c15c1397fa2`; documentazione `12225de0bac9d5e514461136ea9e22c0934c361b`.

## Correzioni eseguite
1. **R06-1 — integrazione reale morale 09.** `oronzo/app/flow/controller.js` importa direttamente `previewOfferMorale`, `applyOfferEffect`, `applyPressEffect` e `createCoach` da `../../systems/coach-club/index.js` (export della PR #39); usa i metodi 09 senza formula parallela in 07. `newGame` inizializza il CoachV2 (morale numerico, `origin`, quattro tratti, `moraleEvents`, relazioni, `gameOver`). `acceptOffer` valuta offerta e applica mora **in una bozza atomica** insieme a contratto, scelta e conferenza; `answerOpeningPress` e `answerPostMatchPress` persistono risposta e gli effetti 09 **nella stessa mutazione di stato**, registrando `flow.effectTransactions[eventId].status='applied'` e `coach.moraleEvents[eventId]`. Duplicati non ricalcolano gli effetti dopo save/load. `morale=0` e `gameOver` bloccano le transizioni con `GAME_OVER`, salvo salvataggio di recupero. La sola modalità `effectsMode:'isolated_test'` (esplicita, vietata in UI) conserva comportamento `awaiting_agent09` per test R03 legacy.
2. **R06-2 — geografia non inventata.** Se `club.regionId`, `club.macroRegion`, `coach.origin.regionId` o `coach.origin.macroRegion` mancano/non sono conformi, `acceptOffer` risponde `{accepted:false,reason:'geography_required',messageKey:'oronzo.geography_required',missing:[...]}` **prima di qualunque mutazione**. Nessun comune/club reale inventato; scelta 20 offerte rimane stabile anche se bloccata. Alias dichiarati `nord/centro/sud` diventano `north/centre/south`; se `municipalityId` è presente in un catalogo importato, regione/macroregione devono concordare col record. `world.js` marca esplicitamente `qaFixture:true` con `world.mode='qa_fixture'` e `datasetStatus='synthetic_test_only'`, senza chiamare verificati 100 record fittizi.
3. **R06-3 — test integrato reale aggiunto.** `oronzo/app/flow/tests/morale-r06.e2e.test.mjs` (5 test nativi Node da eseguire su checkout #38+#39) importa direttamente gli **API 09 reali**, i 4 JSON/SDK 04 reali, Match06 e sistemi Career07. Casi: preflight assenza geografia e immutabilità, fixture QA 100 record e conflitto origine, ingaggio/pagamento morale + cinque conferenze opening + partita engine fulltime + due conferenze post + board/finanza + save/load/retry, game-over persistito, due stagioni con rollover e import 1985 legacy. `tests/qa-geography.mjs` è un generatore **sintetico dichiarato**, non dataset ISTAT. La CLI `demo-r03.mjs` ora usa il medesimo input sintetico e gli effetti veri di 09, senza stampa di `pending` spacciata per risultato.

## File modificati, solo scope Agente 07
- `oronzo/app/flow/controller.js` — wiring 09, transazioni atomiche, guard geografia/città.
- `oronzo/app/flow/tests/morale-r06.e2e.test.mjs` — **nuovo**, test senza stub di produzione.
- `oronzo/app/flow/tests/qa-geography.mjs` — **nuovo**, esclusivamente QA.
- `oronzo/app/flow/tests/flow-r03.test.mjs` — isolamento R03 esplicito.
- `oronzo/app/flow/demo-r03.mjs` — demo morale reale + fixture sintetica.
- `oronzo/app/flow/README.md` — API, gate 09, sequenza merge e dati.
- `oronzo/systems/career/world.js` — status dataset sintetico.
- Questo `oronzo/coordination/07-career/REPORT.md`.
**Nessun file nel perimetro 09**, nessun Next/Identity/asset/HTML root modificato. **Nessuna nuova PR.**

## Verifiche eseguite DAVVERO
- **Sorgenti GitHub su JavaScript V8, R06 morale reale / 04 reale:** scaricati 17 moduli effettivi #38/#39/main. Flusso 1979 seed 91 con 20 offerte, QA 100 comuni fittizi, primo ingaggio fuori macro con `previewOfferMorale` reale: **`effectStatus:'applied'`, delta −3**, `moraleEvents` 1. Cinque risposte reali Copy04 e due postpartita: **8 transazioni di morale `applied`**, `moraleEvents` 8, morale salvato **54**, risultato e log registrati e recuperati da serialize/deserialize. Retry della firma: `already_accepted`, stato identico. Assenza dataset: `geography_required` senza mutare lo stato/ledger. **LIMITAZIONE CRITICA:** in **questa** verifica V8, i moduli 09 di *morale e coach* e i moduli 04 press sono REALI; invece il **Match Engine 06 e il 09 board/finance sono fixture stub espliciti** per isolamento, quindi NON equivale a test E2E nativo con 04+06+07+09 completi.
- **Parsing sintattico V8** su `controller.js`, `demo-r03.mjs`, `flow-r03.test.mjs`, `qa-geography.mjs`, `morale-r06.e2e.test.mjs`: **5/5 PASS** dopo rimozione superficiale di import/export ESM per il controllo sintattico, **non** `node --check`/test eseguito con Node.
- **Gate R06 antecedente dell'Agente 00, non eseguito in questa sessione:** run GitHub Actions `42381672625`, **91/91 PASS** sui due HEAD PRECEDENTI, più un E2E reale FAIL (`club_region_required`). Il codice attuale corregge il caso ma **non** si riutilizza quel 91/91 come prova dei nuovi commit.
- **Suite native Node post-fix NON eseguite:** GitHub dal container continua a fallire `Could not resolve host: github.com`; i test nuovi pubblicati su GitHub non sono stati eseguiti in questa sessione su checkout completo #38+#39. Il gate R06B resta OBBLIGATORIO: `node --test oronzo/app/flow/tests/*.mjs`, `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js`, `node oronzo/app/flow/demo-r03.mjs`, con **tutti i file reali**. Nessuna QA Android/browser.
- L'assenza del dataset italiano M1 verificato impedisce ancora un ingaggio normale nel mondo di default: il blocco `geography_required` è VOLUTO dall'incarico e richiede decisione prodotto/dati dell'orchestratore, non va eliminato dal 07.

## Contratto, merge order e richiesta al Revisore 00
- **PR #39 prima di #38** (solo se autorizzato dall'orchestratore): il nuovo import ESM diretto richiede gli export di `oronzo/systems/coach-club/index.js` presenti nella PR #39, non ancora in `main`. Eseguire QA su checkout combinato, evitando CI isolata di #38 contro vecchio main.
- Il gioco usa solo le formule `previewOfferMorale/applyOfferEffect/applyPressEffect` del 09; `effectTransactionId` è persistito insieme a `coach.moraleEvents`, e il game-over 0 è terminale. Il 03 deve presentare `geography_required` con testo locale e non esporre `isolated_test`.
- **Richiesta:** audit **R06B** sull'HEAD aggiornato della stessa PR #38 e sull'HEAD invariato #39. Eseguire i nuovi 5 test e i 91 baseline, demo, ispezionare eventuali nuovi P0; **nessun merge da parte del 07**.

---

# RAPPORTO ORONZO-AGENT-07 — R03 · primo flow dati 1979

**Stato:** PR_OPEN / DELIVERED FOR QA, NO MERGE
**Pull Request:** https://github.com/CzekUns/cercax/pull/38
**Branch:** `agent/oronzo-career-r03-flow`
**Issue:** https://github.com/CzekUns/cercax/issues/9
**Base main originale verificata:** `dcec6acc931c440597c3c28a6bd9f7d24d9bb94e`
**Commit codice iniziale:** `644948bc21eb8617528bea4efa7bee5161935c4a`  
**Fix idempotenza/UI:** `abd35f578dee9ab3ff0101c6a1bb75996290d999` (controller), `305bbe4d9eab2a131faa56c1c76db36be2d83b1c` (test), `a6cb502d6199942bce59fdeb70133ee19e809078` (demo), `6387d49c15e5e94a6b856e7b5127edcb24b1e35c` (README)
**Data:** 7 novembre 2026 (Europe/Rome)

## Implementazione autorizzata — 1979, solo dati/controller
- `oronzo/systems/career/career.js`: aggiunto parametro `startYear`; il nuovo controller usa 1979, mentre la precedente API `newCareer()` mantiene il comportamento del 1985 e i relativi save non vengono retrodatati.
- `oronzo/systems/career/world.js` (nuovo): import controllato di 100+ comuni da dataset versionato, sorgenti/licenze, ID a 6 cifre, regione, macro Nord/Centro/Sud (Sicilia/Sardegna a Sud), anno/popolazione, assegnazione deterministica club; se dataset non fornito il mondo è dichiaratamente `demo`. Nessuna ricerca/comune fittizio spacciato per verificato, nessuna modifica alla PR dell'automazione.
- `oronzo/systems/career/offers-r03.js` (nuovo): esattamente 20 offerte distinte, seme deterministico, contratti allenatore in lire come bilanciamento simulativo, preferenza iniziale Promozione/Interregionale quando disponibili, ID e stipendi persistiti, accettazione singola idempotente.
- `oronzo/systems/career/uncontrolled-fixtures.js` (nuovo): simulazione sintetica *separata ed etichettata* per soli incontri non gestiti dal mister; gli incontri giocati richiedono fatti e risultato dal vero Engine06.
- `oronzo/app/flow/controller.js` (nuovo): API ESM `newGame`, `loadGame`, `saveGame`, `listInitialOffers`, `acceptOffer`, `getStateForUI`, `getRosterPlayer`, `getTrainingPlayer`, `prepareMatch`, `tickMatch`, `consumeMatchResult`, `answerOpeningPress`, `answerPostMatchPress`, `advanceMatchday`, `rolloverSeason`, `takeCareerOffer`, `exportGame/importGame`. Controller senza HTML/CSS/renderer; il 03 riceve solo proiezioni stabili.
- Ingresso avatar scelto esplicitamente con `avatarId`, `origin`, `traits.{luck,leadership,selfEsteem,patience}`, persistenza senza formula di morale 07. Identità giocatore/kit dalla sorgente passata dai proprietari 08/01 con `playerVisualById` e `clubVisualKitsById`; Rosa e Allenamento usano lo stesso `playerId` e lo stesso visual/kit, oppure `appearance:null` se non disponibili.
- Chiamate reali previste a Copy04 per 5 domande iniziali e 2 postpartita; risposte idempotenti e `effectTransactionId` serializzato, effetti semantici pendenti finché 09 non fornisce l'applicatore. Collegamento a `prepareMatchday`, `conveneBoard`, `reviewMatch`, `endClubWeek` di 09 con periodo completo `{week,absoluteWeek,seasonYear}` e sostituzione del club restituito. MatchInput/handle da `createMatch` di 06, risultato accettato SOLO a fulltime e con eventi `goal` verificati da Career.
- `tickMatch` applica 6 secondi simulati/1 reale a 1× = 5.400/6 = 900 secondi (15 minuti). Non cambia di nascosto il timer nativo di Engine06, ancora 60×.
- Save dual-slot + checksum esistente; fallback read-only della vecchia chiave `oronzo.career.v2` e preservazione del 1985. `saveGame` blocca `pre_match` perché 06 non ha snapshot/restore di una partita in corso. Giornata e club in stato atomico; competizioni/graduatorie/migrazione V1/V2 esistenti rimangono nel modulo Career.
- File QA/documenti: `oronzo/app/flow/{tests/flow-r03.test.mjs,demo-r03.mjs,package.json,README.md}`; nessun file degli altri agenti modificato.

## Prove realmente osservate in questa sessione
1. **JavaScript V8, codici originali di Career07 letti da blob GitHub** più controller/world/offers/simulator da blob di lavoro e *stub dichiarati* per Coach09, Copy04 e MatchEngine06: sequenza **PASS** (inizio 1979, 20 offerte uniche e deterministiche, una sola accettazione, 5 risposte, match 1–0 di fixture, 2 risposte post, 1 periodo pagato, advanceWeek a 2, save/import integro). Questa è una prova del controller, **NON** esecuzione autentica end-to-end di 04/06/09.
2. **Actual Match Engine06**: codice `rng.js`, `movement.js`, `commands.js`, `actions.js`, `match-engine.js` letto dall'ultimo main e caricato in ambiente V8. Con formazione di prova a **un GK** per squadra, `createMatch` seguito da `step(5400)`: **PASS**, `fulltime` a t=5400, risultato **1–1**, 2 eventi goal nel feed autorevole, 1.556 eventi totali. La prova utilizza club fixture, non l'adapter R03/Coach09 completo.
3. **World importer reale**: `world.js` + `league.js` da SHA GitHub, **PASS** con 100 record **sintetici di test**, 104 club e 100 ID località unici, assegnazione identica a seed fissato; catalogo da 99 record respinto con `WORLD_M1_GATE`. Questa verifica **non** prova che comuni o licenze del dataset reale siano verificati.
4. **Copy04 reale, contenuti reali:** caricati `press-kit.js`, `press-opening.json`, `press-postmatch.json`, `press-media.json` dal main. `createPressConference` ha prodotto **5 domande opening**, e **2 postmatch** per ciascuno degli esiti `win/draw/loss`, tutti con i contesti richiesti; cinque risposte scelte con `answerPressConference` hanno completato la sessione. **PASS V8** senza contenuti inventati; non è una prova completa controller+09 morale.
5. **Regressione mirata V8 post-commit** su `controller.js` esatto blob `c02b7b2c60e01bdb5252d40fa2d13f336a4e837c`: caricamento/parsing di **21 export PASS**; chiamata `advanceMatchday` con token vecchio → `stale_week_action`, senza token nello stato disoccupato → `expected_week_required_when_unemployed`, con stato `hub` non pronto → `postmatch_press_not_completed`. Il controllo `expectedAbsoluteWeek` serve alla UI 03 per prevenire doppio avanzamento anche quando il mister è senza club.
6. **Codice di test nativo Node consegnato ma NON eseguito**: `oronzo/app/flow/tests/flow-r03.test.mjs` contiene test su 1979 vs vecchio 1985, 20 offerte, import M1, visual/kit, due stagioni, mercato/press/engine, rollback e test game-over. `oronzo/app/flow/demo-r03.mjs` è runnable da una checkout completa. **Non si dichiara Node PASS**.
7. **Blocco ambiente Node:** `git ls-remote https://github.com/CzekUns/cercax.git HEAD` da container restituisce `Could not resolve host: github.com`; il checkout integrale su cui eseguire `node --test oronzo/app/flow/tests/*.mjs oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js` non è stato disponibile. I 77 test preesistenti furono attestati dal revisore R05B sui merge, non rieseguiti qui. QA browser/smartphone non eseguita.

## Confini API e dipendenze
- **03 UI:** usa `getStateForUI` e proiezioni `getRosterPlayer/getTrainingPlayer`, chiama `tickMatch` e non il timer 60×; rende le 20 offerte, 5/2 domande, roster, partita e history. 07 non crea HTML/CSS né sostituisce `game.js`.
- **09 morale:** attualmente non esistono gli hook CoachV2 `previewOfferMorale`, `applyOfferEffect`, `applyPressEffect` nel main; il 07 espone l'iniezione e memorizza transazioni `awaiting_agent09`. **Il morale non varia e non è funzionalmente integrato** in questo R03. `coach.gameOver`/morale=0 se forniti da 09 bloccano l'avanzamento.
- **04:** `press-kit.js` e i tre JSON reali devono essere passati al controller, non copiati in Career. Le sessioni restano persistite. **06:** Engine 06 è autorevole sulla partita del mister; altri esiti sono simulati da provider dichiarato. **08:** identità visual e kit sono importati/copiati, non generati dal 07. Shouts 06/08 restano esclusi in attesa del gate.
- **Dati ricerca:** la PR `data/oronzo-world-research` non risultava disponibile nella verifica iniziale; non sono stati importati 100 comuni reali e non si dichiara il gate M1 superato. I 500 cognomi competono all'08 e al worker.
- **Limite storico:** `1979-08-01` è data parametrica di *gioco* e non la data documentata della prima giornata di Promozione 1979. In R03 il modello rimane a un girone rappresentativo per categoria; quote e spareggi storici non sono attestati.

## Prossimi gate per Agente 10
1. Eseguire su checkout Node unico la suite originale Career + Coach-Club e la nuova `flow-r03.test.mjs` e demo; correggere nel medesimo branch qualunque test concreto che fallisca prima del merge.
2. Collegare l'API morale univoca da 09 (preview, applicazione atomica con eventId, game-over), e inserire/validare i dati geografici reali dopo review del worker.
3. UI 03 e QA Android 16:9 con passo 15 minuti e field camera; ordini individuali solo dopo contratto 06/08.

**Nessun merge autonomo e nessuna modifica a NEXT/IDENTITY/RUN o ad altri agenti.**

---

## Archivio del rapporto precedente (R05/R04/R02, registrato su main prima di R03)

# ORONZO — AGENTE 07 · correzione mirata R05-1
**Identità:** ORONZO-AGENT-07  
**Stato:** FIX_DELIVERED / PR_OPEN, senza merge  
**PR:** https://github.com/CzekUns/cercax/pull/30 · **Branch:** `agent/oronzo-career-r02`  
**Audit R05:** https://github.com/CzekUns/cercax/pull/37 · **NEXT:** `FIX_REQUESTED`  
**Data:** 7 novembre 2026 (Europe/Rome)  
**Commit codice R05:** `cd35d8838e46bdb1b4496523b39608b7a73af237`  
**SHA blob del test aggiornato:** `586e6856910196965172e9488ff3bee8b839ee74`  
**Agente 09 / PR #32 verificato per il test:** HEAD `89bb4944e6c6fc78ad9164c8e0d899355ec9d67f`.

## Realizzato — solo R05-1
- **Unico file sorgente cambiato:** `oronzo/systems/career/tests/r02-cross.test.mjs`. Tutti i file produttivi rimangono invariati.
- Nel test "R02 career + real Agent09 finance: two seasons, salary, saved absolute weeks and retries" il parametro `period` ora è esattamente `{week:s.week,absoluteWeek:s.absoluteWeek,seasonYear:s.seasonYear}`, inviato a ogni `settleWeek` e retry. `allKeys` raccoglie numeri `absoluteWeek`; `settledWeeks` conserva chiavi `a:N`.
- Dopo rollover, un `settleWeek(club,{week:s.week})` su ledger già assoluto verifica `period_migration_required`. Una simulazione su **copia immutabile restituita** accetta il periodo nuovo con tutti e tre i campi, conferma stipendio positivo e corretto, ultima chiave `a:N`, poi rifiuta il retry con `week_already_settled`. Il club originale rimane da contabilizzare nel normale loop della seconda stagione, così non si crea un pagamento anticipato duplicato.
- Conservati i controlli esistenti su contratti reali, importi pagati, due stagioni, save/load a ogni giornata, unicità settimane, saldo decrescente, 12 pagamenti del club verificato, history di due stagioni, normalizzazione mister ed esonero dopo reload. **Nessun allentamento al guard societario o alla migrazione V1/V2.**

## Test effettuati e limiti verificati
1. **Esecuzione reale del test R02-cross in runtime JavaScript V8** con **11 file ESM effettivi e attuali** delle PR #30 e #32 recuperati tramite GitHub, caricati con un piccolo loader di verifica: **2 PASS / 0 FAIL**. Sono stati esercitati veri `newCareer`, `initializeFinances`, `weeklyPayroll`, `settleWeek`, `serialize/deserialize`, `finishSeason`, `createCoach` e `applyBoardDecision`. È una verifica V8 con assert/test adattati, **non** l'esecuzione nativa `node --test`.
2. **Node.js v22.16.0 reale:** `node --check r02-cross.test.mjs` **PASS** su file locale byte-identico al blob remoto `586e6856910196965172e9488ff3bee8b839ee74` (verificato con `git hash-object`).
3. Il checkout combinato integrale per `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js` **non è stato eseguito in questa sessione**: `git ls-remote https://github.com/CzekUns/cercax.git` dal container fallisce con `Could not resolve host: github.com`. Non attribuire 77/77 PASS finché Coerentizzatore o CI non lo rieseguono. La precedente R05 indipendente, su HEAD anteriori, documentava **76 PASS / 1 FAIL** limitato a questo test; non è un esito della suite dopo il nuovo commit.
4. Nessun test browser/Android: questa iterazione riguarda solo la suite dei moduli, non l'UI.

## API e dipendenze
- Contratto Agent07 → Agent09: passare l'intero `{week,absoluteWeek,seasonYear}` per ogni transazione o riunione; usare il `result.club` restituito da Agent09 e mantenere periodi deduplicati. La prova rappresenta la nuova convenzione e verifica esplicitamente il rifiuto del vecchio `week` isolato.
- Agente 09: nessun file modificato. Il suo HEAD #32 attuale rimane la dipendenza per il gate unificato.
- Gli envelope V1/V2 ambigui restano gestiti dalle regressioni dedicate R04; nessuna modifica al comportamento di migrazione o salvataggio.

## Prossima attività raccomandata (solo orchestratore / revisore 00)
Eseguire sull'HEAD appena pubblicato di #30 con #32 invariata la **suite Node combinata completa**, verificare verde il gate e decidere separatamente ogni merge soltanto con autorizzazione esplicita. Nessun lavoro R03 o `oronzo/app/flow/` avviato.

---

# ORONZO — RAPPORTO AGENTE 07 · correzioni R04 su PR #30
**ID:** `ORONZO-AGENT-07`  
**Stato:** `FIX_DELIVERED / PR_OPEN` — in revisione, **nessun merge effettuato**.  
**Branch:** `agent/oronzo-career-r02`  
**PR:** https://github.com/CzekUns/cercax/pull/30  
**Audit:** https://github.com/CzekUns/cercax/pull/36  
**Data:** 7 novembre 2026, Europe/Rome  
**Commit codice R04:** `99e4831f4de804b8671631a38a2e8fa10959502e`  
**Commit R02 precedente:** `19d9600aeb3dc45d38db2760fd865de1b2da6a20`.

## Correzioni effettive R04
- `oronzo/systems/career/period-migration.js` **nuovo:** converte in modo deterministico i ledger finanziari e societari V1/V2 verificabili in chiavi canoniche `a:absoluteWeek`; migrazione atomica di TUTTI i club, tracciabile, idempotente. Preserva `finance.periodMigration.originalSettledWeeks` e `legacyPeriod` delle transazioni/verbali/promesse/eventi; nessun ricalcolo di cassa, arretrati o compensi.
- `compat.js`: esegue la conversione prima di vecchi fallback sul conteggio settimane. Usa la cronologia documentata da `state.history`, `seasonYear`, metadati origine sui record o, solo se verificato, `finance/board.periodMigration.legacySeasonYear`. Le annotazioni `trust/staff` prive di anno restano intatte perché il modulo 09 non le usa per deduplicazione.
- `career.js`: le nuove partite portano `periodLedgerSchemaVersion:2` e mantengono `week` stagionale distinto da `absoluteWeek`.
- `save.js`: il checksum degli envelope V1/V2 è verificato **prima** della conversione. `serialize` ricontrolla i ledger; `createSaveManager` non sovrascrive uno slot legacy la cui data d'origine è ambigua: emette `PERIOD_MIGRATION_AMBIGUOUS`, lasciando intatti i dati di A/B e il puntatore.
- Test nuovi `tests/period-migration-r04.test.mjs`, `tests/r04-save.test.mjs`, `tests/r04-board-cross.test.mjs`. Documentazione aggiunta a `README.md` e `integration-notes.md`.
- **Nessun file** fuori `oronzo/systems/career/` e questo REPORT modificato. Né R03, né 1979, né `oronzo/app/flow/`. Dati 100 comuni/500 cognomi restano al worker di ricerca, senza duplicati.

## Verifiche eseguite, risultati reali
- **Node 22.16.0**, checkout di lavoro isolato che combina i sorgenti GitHub dell'attuale PR #30 e i moduli `coach-club` della PR #32. `cd oronzo/systems/career && node --test tests/*.mjs`: **27 PASS, 0 FAIL** (10 baseline dalla prima copia, 10 prove `period-migration-r04`, 4 `r04-save`, 3 `r04-board-cross`). L'intera suite separata dell'Agente 09 non è stata rieseguita in questo ambiente, né le 8 prove R02 antecedenti non presenti nella copia isolata.
- **Caso R04-1 reale, stipendio 486.000 ITL:** `settleWeek({week:1})` porta cash da 9.720.000 a 9.234.000; un envelope V1 o V2 con checksum valido viene importato, `settledWeeks:[1]` migra in `['a:1']`; retry con `{week:1,absoluteWeek:1,seasonYear:1985}` risponde `week_already_settled`, cash **rimane 9.234.000**. Anche riunione `conveneBoard` duplicata viene rifiutata.
- Due stagioni con `save/load` a ogni settimana, salari e presidenti persistenti, promesse oltre il cambio anno, cooldown e storico mister: **PASS** nei test di regressione R04 con API autentiche dell'Agente 09.
- **Smoke indipendente ampliato:** 104 club, 2 stagioni, **76 periodi assoluti distinti**, **7.904 liquidazioni stipendiali** (104×76), rifiuto di retry di pagamento e meeting su tutti i club, salvataggio a ogni periodo, presidenti/contratti stabili ed esonero dopo secondo anno: **PASS**. Eseguito con file QA temporaneo `smoke-104.mjs` fuori repo, risultati 0-0 sintetici. Il primo tentativo terminava con un esonero chiesto su contratto già scaduto; aggiunta esplicita nella fixture di una scadenza 1989, poi prova PASS. Non è correzione al gioco.
- Blob GitHub dei 7 file modificati confrontati con `git hash-object` locale: **SHA identici**. Per le API 09 si usano `core.js` `fb4b00d`, `period.js` `48b8cfa`, `finance.js` `88c0469`, `board.js` `b290042`, `club.js` `987147b`, `presidents.js` `52276a7`, `objectives.js` `48fdc92` dal branch PR #32.
- Il test combinato **completo** `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js` in una checkout completa dei due HEAD e la QA visiva su Android/browser **NON sono stati eseguiti**: restano al gate dell'orchestratore/Coerentizzatore. I 27 test sono ripetibili nel checkout dei moduli interessati.

## Integrazione / contratto tra agenti
- Agente 07 fornisce `migratePeriodLedgers(state)` e stato migrato con `absoluteWeek`, `periodLedgerSchemaVersion:2`. Un chiamante deve fornire ad Agente 09 sempre **l'oggetto** `{week:state.week,absoluteWeek:state.absoluteWeek,seasonYear:state.seasonYear}` e usare `state.clubs[index]=result.club`; **non** sovrascrivere `week` con la settimana assoluta.
- PR #32 Agente 09 esegue `periodLedgerError` prima di paghe e board, quindi un ledger non migrato restituisce `period_migration_required` senza effetto. Con record migrati il retry è rifiutato nello stesso dominio `a:N`. Il fix R04-2 sul test payroll a importi reali è stato consegnato separatamente dall'Agente 09; non modificato da 07.
- I profili presidenti rimangono proprietà dell'Agente 04, gli effetti finanziari del 09. Nessun codice runtime collegato; partite di test `0-0` sintetiche, non attribuite all'engine 06.

## Residui e richieste di revisione
- Nel save della seconda stagione con settimane numeriche senza **anno originario dimostrabile**, la migrazione è intenzionalmente **impossibile in automatico**: lancia `PERIOD_MIGRATION_AMBIGUOUS` e conserva gli slot. Un recupero manuale futuro richiederebbe documentazione reale delle date, non una supposizione.
- L'ultimo gate pre-merge è la suite Node completa su HEAD aggiornati #30+#32, inclusi i test Agent09 `compat-r02.test.js`/`period-r04.test.js`, e controllo live di regressioni. Non esiste una prova UI carriera completa.
- Nessun lavoro sull'import dei comuni/cognomi in questo ciclo; MVP prevede 100/500 da research automation **dopo** review dataset.

## Proposta prossimo passo (non autorizzazione R03)
1. Orchestratore/00 esegue checkout unificato #30 + #32 all'ultimo HEAD, suite completa e controlli contabili/board; corregge eventuali regressioni provate.
2. Solo dopo due PR integrate e NEXT specifico, autorizzare flow e nuovi dati del mondo 1979.

---

## Archivio del rapporto R02 precedente (stato e dipendenze fotografati prima di R04)

# RAPPORTO AGENTE 07 — Carriera e campionati — R02
**Identità:** ORONZO-AGENT-07  
**Stato:** DELIVERED / PR aperta, non mergiata  
**Branch:** `agent/oronzo-career-r02`  
**PR:** https://github.com/CzekUns/cercax/pull/30  
**Commit R02 iniziale:** `990faa012f7aa09c428b31a1b21d1658eb4aae13`  
**Base main verificata:** `c9f52a1c2f60733a6ae1e0b63180fa4b5d0f9697`  
**Data:** 7 novembre 2026 (Europe/Rome)

## Realizzato
- **R02-1 presidente:** `compat.js` assegna ID canonici dal catalogo copy, seed/club deterministici, persistenza anche dopo cambio stagione e import vecchi ID `president:*`. Più club riusano lo stesso archetipo, l'istanza è identificata dal club.
- **R02-2 obiettivi:** canonici `promotion|top_half|safety|avoid_last|development` compatibili con Agent09. Mapping dei legacy alias, soglie identiche a prima e `development` senza valutazione fittizia.
- **R02-3 salari:** ogni nuovo calciatore ha `contract.weeklyWage>0` intero in ITL, monte salari entro `wageBudget`; migrazione idempotente che preserva i contratti esistenti, senza creare depositi sulla cassa esistente. Importi di bilanciamento gioco, non fonte salariale storica.
- **R02-4 settimane:** `absoluteWeek` incrementale, anche al rollover; `week` stagionale preservata. Chiave univoca da passare ai ledger del board e finanze.
- **R02-5 coach:** campi `employmentHistory`, `hiredSeason`, `contract.until` persistiti e normalizzati nei legacy save. Evitato TypeError su dismiss; il vero `createCoach` dell'Agente09 deve mantenere questi campi o distrugge la cronologia prima che la carriera la riceva.
- **File toccati:** `oronzo/systems/career/{compat.js,career.js,progression.js,save.js,tests/r02.test.mjs,README.md,integration-notes.md}` e questo REPORT. **Nessun altro modulo modificato**.

## Verifiche realmente eseguite
- Node v22.16.0: `cd oronzo/systems/career && node --test tests/*.test.mjs`: **19 passati / 0 falliti** (11 test precedenti, 6 nuove prove R02, 2 test incrociati con i moduli reali di Agent09), incluse 2 stagioni consecutive con save/load, promozioni e status mister, 104 club con stipendi e cap.
- Sorgenti `career.js`, `progression.js`, `save.js`, `compat.js`, `tests/r02.test.mjs` confrontati con SHA blob GitHub e repository locale.
- Test locale letto catalogo ridotto a soli 8 ID; tali otto ID sono stati verificati contro il catalogo **reale** `oronzo/content/presidents.json` su main. Una volta in checkout GitHub, `tests/r02.test.mjs` legge automaticamente il JSON reale.
- **Test incrociati eseguiti:** `tests/r02-cross.test.mjs` importa `finance.js` e `coach-model.js` originali di Agent09, con SHA verificati `618e77e63ef152d7c0959634f73b30351f6a56ab` e `019d33728b9e99696c9c661947640fdc884461da` (core `fb4b00debfc66ab870b41880a67d1264939a725e`). Due stagioni/12 periodi, paghe contabilizzate una volta, retry esclusi dopo save/load e rollover, guardia all'esonero dopo `createCoach`. **Non eseguiti:** QA Android/browser, riunioni/presidents con board completo e prova integrata dopo i fix di Agent09; la factory attuale è ancora lossy.

## Integrazione / dipendenze
- Agent09: profilo/ID presidente identico per board/testi, obiettivi canonici, trasmissione di `absoluteWeek` a salari/riunioni/promesse, factory `createCoach` che preserva storia e scadenza. Usare `result.club` di finance/board, senza ri-inizializzare la cassa a ogni load.
- Agent04: unica fonte dei profili presidente, nessun catalogo narrativo duplicato nel career.
- Agent06: score ed eventi goal per `registerResult` (il provider della demo rimane di test).
- Agent08: conservazione `contract.weeklyWage` e ID dei giocatori.
- Proprietà futura `oronzo/app/flow/` e avvio nel 1979 sono **NON AUTORIZZATI** in questo ciclo.

## Mancante / problemi
- Cross-09 end-to-end R02: bloccato dall'aggiornamento del modulo 09; compatibilità del lato career documentata in `integration-notes.md`.
- Migrazione di carriera esistente non può recuperare cronologia già distrutta da factory esterne; normale importazione di v2 mantiene i campi esistenti.
- Wages ITL sono parametri fittizi dichiarati; vecchia cassa con poca liquidità può creare arretrati, non vengono inventate entrate.
- Nessuna verifica visiva telefono; calendario v0.2 e 500 comuni/20 offerte rinviati a R03.

## Proposta prossimo ciclo
1. Gate incrociato dopo PR Agent09: due stagioni, stessa identità presidente, payroll unico per assoluta settimana, esonero/reingaggio con load.
2. Dopo il merge e nuovo NEXT, mondo 1979, base geografica documentata e 20 offerte seed-stabili.
3. Adapter `oronzo/app/flow/` solo dopo autorizzazione separata.

**Nessun merge effettuato.**
