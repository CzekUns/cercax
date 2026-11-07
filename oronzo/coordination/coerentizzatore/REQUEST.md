# ORONZO — INTEGRAZIONE MIRATA SUCCESSIVA A R05-1 · SOLO PR #30 E #32

**Incarico attuale pronto per la chat 00, NON avviato automaticamente.** Leggere `coerentizzatore/RUN.md`, `PROTOCOL.md`, `10-orchestrator/CONTRACT-v02.md`, `10-orchestrator/DISPATCH-R05.md` e il report R05 nella [PR #37](https://github.com/CzekUns/cercax/pull/37). Il nuovo requisito di identità visiva è **solo documentale** e non fa parte di questa verifica.

1. **Ripartire dal difetto unico R05-1:** PR #30 HEAD osservato `1fb92d5c249270dced1e18414ef70c022bf68722` (nuovo `r02-cross.test.mjs`, report 2/2 V8, Node completo non eseguito). PR #32 HEAD osservato `89bb4944e6c6fc78ad9164c8e0d899355ec9d67f` (invariato). **Rileggere entrambi gli HEAD live**.
2. Preparare checkout reale/sandbox verificata con file di main + entrambe le PR e catalogo presidenti. **Eseguire realmente** `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js`; verificare che il precedente 76 PASS/1 FAIL sia ora interamente verde. Confermare schema `{week,absoluteWeek,seasonYear}`, chiavi `a:N`, V1/V2, idempotenza contabile, rollover e 104 club/due stagioni con i casi della suite.
3. Controllare diff, HEAD, assenza regressioni/conflitti, nessun scope estraneo. Se fallisce, **nessun merge** e riferire esattamente caso/owner; non chiedere nuovo round generale.
4. Se **tutto è verde** e l'utente **autorizza esplicitamente merge nella chat 00 corrente**, mergiare **soltanto** #30 e #32 **una alla volta**, usando `expected_head_sha`, verificando main e rieseguendo i test pertinenti dopo i merge. Nessuna deroga indefinita: l'autorizzazione precedente R05 è conclusa.
5. Documentare esiti e SHA nel rapporto mirato `REPORT-R05B.md` su branch documentale separato; non mergiare il proprio report. **Non controllare altre PR, non avviare R03, non scrivere codice.**

---

## Archivio incarico R05 originale (concluso)

# ORONZO — RICHIESTA ATTUALE COERENTIZZATORE 00 · AUDIT R05

**Stato:** `READY` — incarico preparato il 7 novembre 2026 dall'Agente 10, **non equivale ad avvio della chat Work 00**.
**Ambito:** verifica P0 **PR #30 e #32** dopo le correzioni R04; solo se gate verde valutare l'integrazione in main con eventuale autorizzazione utente specifica R05. **Non usare il vecchio mandato di merge R04**, esaurito.
**Riferimenti:** `coerentizzatore/RUN.md`, `10-orchestrator/DISPATCH-R05.md`, `PROTOCOL.md`, `GAME-VISION-v02.md`, `10-orchestrator/CONTRACT-v02.md`, `registry.json`, audit [PR #36](https://github.com/CzekUns/cercax/pull/36) `REPORT-R04.md`.

## Verifica primaria obbligatoria (P0)
- PR **#30** Agente 07, HEAD osservato **`f098b5474801171f55e451889eca8c65653000f3`**.
- PR **#32** Agente 09, HEAD osservato **`89bb4944e6c6fc78ad9164c8e0d899355ec9d67f`**.
Gli HEAD sono snapshot: **rileggerli live** prima di ogni test e merge. I branch sono distinti: costruire una **checkout/sandbox che combini esattamente le due PR** con main e nessun mock dei file Career/Coach-Club. Non confondere il report dell'agente con test indipendenti.

1. Eseguire Node **davvero**: `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js`. Controllare la precedente asserzione fissa 1600 (R04-2) contro stipendi reali, test del modulo `period-r04.test.js` e catalogo veri presidenti.
2. Riprodurre il bug R04-1 con save legacy `settledWeeks:[1]`, conversione una tantum a `a:1`, eventi/ledger/meeting/promesse in stagioni differenti. Verificare **nessun doppio pagamento** e **nessuna perdita storica**, incluso envelope V1/V2 con checksum; quando la stagione è ambigua il sistema rifiuta in sicurezza.
3. Eseguire smoke 104 club × **due stagioni** con `{week:seasonWeek,absoluteWeek,seasonYear}`, save/load frequenti, 76 periodi o numero effettivo, idempotenza payroll e board, finanze/arretrati, presidente canonico, obiettivi, esonero e contract.history. Distinguere risultati 0–0 sintetici da gare Match Engine reali.
4. Controllare che ogni PR modifichi solo il proprio scope e REPORT, che le API abbiano contratti compatibili e che il merge su main non reintroduca test rotti; rieseguire almeno suite interessate dopo ogni eventuale merge. No modifiche al codice di gioco da 00.
5. Se la suite è VERDE e non emergono P0/P1, classificare **READY_FOR_MERGE**. Se un difetto resta, **FIX_REQUESTED** con caso riproducibile e proprietario 07/09; bloccare adapter 07.

## Controllo secondario di fattibilità, senza diluire il P0
- **#33 UI 03**, HEAD osservato `c38be80c392939d042dd998e6d1bf655c259804d`: ora porta QA Chromium 144 con `page.route`, emulazione touch, otto screenshot reali; questo prova DOM/caricamento asset intercettati ma NON il sito GitHub Pages né il telefono fisico. Valutare art/readability 8–9px e rimanenti gate. Non attribuire a 00 prove non eseguite.
- **#28 camera 05**, HEAD `9c00a3298c0083e3836154a1cb1ff22529bf6366`: test browser con PNG reali bloccato dal sandbox, fallback realSprites=0; HOLD finché non dimostrato. **#29 sprite 01** resta gate artistico/Chrome. **#12 cutscene** OPEN/DRAFT HOLD.
- **#31 Attributes 08** e **#35 Engine 06**: finché i rispettivi HEAD restano quelli dell'audit R04 (rispettivamente `979cde1` e `11e9901`), **FIX_REQUESTED**, non fare merge; richiesti mapping `regione/macroregione/coachTrust`/toni e un unico effetto temporaneo con ledger persistente.
- **#34 Copy 04** già MERGED `b8976cb2b0129de9ee6537e1d624abce9ff1402f`, nessuna nuova review necessaria.

## Merge (ATTENZIONE: autorizzazione distinta)
L'utente ha autorizzato i merge di Work 00 **solo nel precedente audit R04**, che è concluso. Questo REQUEST R05 **non conferisce da solo un permesso di merge**. Se l'utente, quando attiva Work 00, autorizza esplicitamente nuovi merge, 00 può effettuarli **solo** per PR verificate con test reali, un merge alla volta, con `expected_head_sha`, dopo verifica CI/diff/arte, e controlli successivi su main. Altrimenti 00 presenta i risultati e SHA raccomandati **senza fare merge**.

## Consegna
Creare `oronzo/coordination/coerentizzatore/REPORT-R05.md` nel proprio branch audit, PR **solo report**, senza auto-merge. Includere elenco HEAD esaminati, comandi realmente eseguiti, PASS/FAIL, diff/integrazione, link e SHA di eventuali merge autorizzati, blocchi, e una decisione se 10 può **autorizzare** il nuovo ciclo di 07. Non editare NEXT/registry/contratti/gioco. Non aprire R03. Lo stile dialoghi rimane in discussione, 100 comuni/500 cognomi M1 sono raccolti dall'automazione oraria e non certificati finché non disponibili.

**Priorità pratica: terminare il gate #30/#32 prima di ogni audit esteso sulle altre PR.**
