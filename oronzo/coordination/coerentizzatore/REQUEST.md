# ORONZO — COERENTIZZATORE 00 · PROSSIMO GATE R08B PR #43, DOPO FIX03

**Stato: `WAIT_FOR_03` — non eseguire ancora.** La verifica indipendente [R08](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r08/oronzo/coordination/coerentizzatore/REPORT-R08.md) ha dato **NEEDS CHANGES / NO MERGE** sulla PR #43 (HEAD auditato `8977305d78d1ddf161ac72b38b41973fe4311db4`). R08 ha verificato 97/97 test carriera, 22/22 renderer, 6/6 Chromium HTTP vero con percorso dalla prima gara al salvataggio/reload, ma quattro problemi UI: rosa 12/16 senza schede/Allenamento, classifica 12/16, pulsanti realmente visibili 33–34px e controlli 29–34px a 360h, game over senza nuova carriera. **Nessun merge autorizzato o realizzato.**

**Dopo che l'Agente 03 aggiorna LA STESSA PR #43:** confrontare HEAD reale, REPORT03 e NEXT03 aggiornato; ripetere in Chromium HTTP reale **640×360, 800×360, 844×390** desktop+touch le verifiche mirate e controllo regressioni:
1. Rosa e schede giocatori tramite API reali `getRosterPlayer/getTrainingPlayer`, accessibilità sedicesimo giocatore e sezione Allenamento consultabile (non assegnare PASS ad allenamento attivo se manca suo contratto).
2. Classifica con tutte le 16 righe del sistema, scroll touch per posizioni 13–16; nessuna squadra mancante.
3. Target controlli ≥44px **effettivamente visibili** dopo clipping antenati, hit-test al centro e gesture reali senza scroll automatico; niente CTA nascoste a 360px.
4. Da Coach09 morale 0 → `gameOver`, nuova carriera senza refresh, vecchi salvataggi non cancellati e vecchio coach non riattivato.
5. End-to-end reale UI (1979 avatar → 20 offerte → stampa 5Q → engine06 → stampa 2Q → classifica/morale → save/reload), dati geografici QA dichiaratamente sintetici, ramo produzione senza catalogo rifiuta firma atomicamente. Almeno le suite Node flow/career/coach e renderer22. Documentare limitazioni (Android fisico/hosting non testati; eventuale 404 opzionale).

**Rapporto R08B** in branch documentale dedicato, con SHA, asset HTTP, screenshot, test PASS/FAIL. Se qualsiasi punto critico fallisce, **NO MERGE** e fix owner 03 puntuali. Se tutto passa, **merge #43 soltanto dietro esplicita autorizzazione dell'utente nella chat 00**, e verifica main dopo merge. Nessuna review altre PR, nessuna modifica al codice del 03.

---

## ARCHIVIO — REQUEST precedenti
# ORONZO — REQUEST ATTUALE 00 · ESEGUIRE AUDIT R07B PR #33

**Stato: `READY` (7 novembre 2026).** Il 03 ha aggiornato la **stessa PR #33**, nuovo HEAD verificato `1e41c8716798612863aa0fc2327c6ee09deeb82d` (prima `c38be80c392939d042dd998e6d1bf655c259804d`). Il suo REPORT sul branch dichiara due fix R07-1/R07-2 con 6/6 test Chromium e screenshot, ma non ha potuto verificare HTTP reale; il precedente [REPORT-R07](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r07/oronzo/coordination/coerentizzatore/REPORT-R07.md) riproduceva due difetti in Chromium 149 via HTTP statico. **Incarico: verificare autonomamente R07B ora.**

1. Rileggere HEAD reale #33 e REPORT03. Ricostruire browser Chromium con veri HTML/CSS/JS/10 PNG **via server HTTP** dove possibile. Ripetere almeno 640×360, 800×360, 844×390 in desktop+touch; testare senza auto-scroll centrale il tasto CARICA PARTITA (44px visibili, hit corretto, clic funzionante, hint visibile), e dopo 5 Q stampa toast ancora presente con tap immediato su PROSSIMA GIORNATA (niente coperture, navigazione corretta) oltre a presidente e UMORE TIFOSI. Prove grafiche personalmente, senza fidarsi di screenshot già presenti. Regredire 8 avatar, 20 offerte, 5 Q, menu, switch camera demo, 10 PNG, console. Non dichiarare Android fisico testato.
2. Consegnare `oronzo/coordination/coerentizzatore/REPORT-R07B.md` in branch documentale separato, con risultati, SHA e screenshot/limitazioni, e non modificare codice 03.
3. **Se fallisce un qualsiasi gate: NO MERGE**, segnala file/selettore/condizione esatti. **Se passa: merge #33 solo dietro autorizzazione esplicita dell'utente** e verifica main dopo merge. Non iniziare runtime del 03 e non toccare altre PR.

---

## ARCHIVIO — REQUEST R07B PRE-CONSEGNA
# ORONZO — REQUEST ATTUALE COERENTIZZATORE 00 · R07B DOPO FIX AGENTE 03

**STATO: `WAIT_FOR_03` — NON avviare review ora.** L'audit [R07](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r07/oronzo/coordination/coerentizzatore/REPORT-R07.md) della sola PR #33 (HEAD `c38be80c392939d042dd998e6d1bf655c259804d`) ha dato **NEEDS CHANGES / NO MERGE**. Il NEXT03 su main ora assegna **R07-1 clipping CARICA PARTITA a 360px** e **R07-2 toast che copre/intercetta touch**. Gli altri test funzionali/asset/HTTP/Chromium sono passati nel gate R07.

**Dopo che il 03 ha modificato la stessa #33**, controllare HEAD aggiornato e REPORT03, verificare le sole due correzioni e regressioni in **Chromium reale con file PNG/HTML/CSS/JS via HTTP** alle risoluzioni 640×360, 800×360, 844×390 in emulazione touch:
- pulsanti Nuova/Carica interi e realmente tappabili (hit-test centro senza auto-scroll), testo e hint non tagliati;
- tap immediato dopo 5 risposte per PROSSIMA GIORNATA e menu funzionanti, toast senza occlusioni e senza intercettazioni;
- nessuna regressione su 8 avatar, 20 offerte/scroll, navigazione, 5 domande, full/TV demo, asset e console.
Creare `REPORT-R07B.md` con prove, screenshot e SHA. Se uno dei gate fallisce, **no merge** e fix precisi al 03. Se tutti PASS, **solo con autorizzazione esplicita dell'utente in quella chat**, può mergiare #33 e verificare main. Non modificare altre PR. Dopo gate R07B e merge #33 il 10 attiva runtime R03 del 03 in nuova PR: prima partita 1979 su smartphone, con modello geografico sintetico *solo se etichettato demo*.

---

## ARCHIVIO — richieste prima di R07B
# ORONZO — REQUEST ATTUALE AGENTE 00: R07 · GATE KIT UI #33 PER PRIMO PLAYTEST

**Stato: READY · 7 novembre 2026.** **Unico obiettivo:** collaudare la [PR #33](https://github.com/CzekUns/cercax/pull/33) di Agente 03 ed esprimere giudizio sulla qualità e riusabilità del kit UI 1979 per **il primo playtest mobile**. PR #39 e #38 sono già **MERGED** (`cf4a8bc0046cc73cf9995f9dafb9a39a94c15626` e `12fe01ff53a8a366dfa35271aa21cb3244ee2c10`); [R06B](https://github.com/CzekUns/cercax/blob/audit/oronzo-r06b-gate/oronzo/coordination/coerentizzatore/REPORT-R06B.md) documenta **97/97 Node PASS su main**. Non riaprire R06 e non riesaminare tutte le PR.

## Procedura e gate #33
1. Leggere main attuale `PROTOCOL.md`, `GAME-VISION-v02.md`, `10-orchestrator/CONTRACT-v02.md`, `03-ui/NEXT.md`, il REPORT 03 sulla PR #33, `oronzo/assets/ui/INTEGRATION-R02.md`, manifest, codice della demo e screenshot QA. Verificare HEAD live di #33 (ultimo noto `c38be80c392939d042dd998e6d1bf655c259804d`) e diff/ambito esclusivamente `oronzo/assets/ui/` + REPORT03.
2. Lanciare i test del kit: `node --check oronzo/assets/ui/demo-v02.js`, `python oronzo/assets/ui/qa/check_assets.py`, `python oronzo/assets/ui/qa/run_browser_r04.py` o equivalente Chromium reale. Caricare CSS, JS e PNG reali in browser tramite **HTTP statico reale se disponibile**, e controllare effettiva decodifica delle immagini; se l'ambiente blocca HTTP distinguere i test `route.fulfill` dal test di deploy non eseguito. Verificare desktop/mobile emulato e touch, soprattutto risoluzioni **640×360, 800×360, 844×390**.
3. Verificare attraverso screenshot e DOM: 8 avatar con 4 parametri dinamici, 20 offerte scrollabili, schermata presidente, 5 domande, hub, rosa/allenamento, area partita e switch camera nella sola demo; bottoni e hit area ≥44px dove appropriato; testo 8–9px davvero leggibile, contrasto, assenza di clipping, toast sovrapposti, risposte al touch, errori console; kit coerente 1990–95. **Esplicitare** che placeholder 22 marker, numeri e testo demo NON sono gioco vero. Se arte illeggibile o incompletezza critica, nominare i file/selector da correggere a 03 su stessa #33.
4. Controllare schema manifest, ID DOM `data-action` e API `OronzoUIKitV02.createApp(root,{data,onIntent})` per uso da **nuovo runtime 03**: aggiornamenti dinamici senza dati hard-coded; il kit deve poter visualizzare `getStateForUI` dal vero 07, ma **non** attribuire a #33 integrazione già funzionante.
5. **Nessun gate secondario** su PR #28/#29/#12/#31/#35. Le telecamere e sprite definitivi sono miglioramenti post-primo-playtest; primo UI runtime può usare solo asset già presenti su main, senza dire che #28/#29 sono integrate. Prima release demo può usare `tests/qa-geography.mjs` solo con etichetta esplicita **“Demo tecnica — località sintetiche”** e senza affermazioni su ISTAT; normale gioco senza dataset restituisce `geography_required`.
6. Rapporto [`oronzo/coordination/coerentizzatore/REPORT-R07.md`](./REPORT-R07.md), branch audit separato, con SHA #33, prove reali, screenshot/risorse testate, risultati e blocchi. Se un gate fallisce, **NO MERGE**, richiedere puntuale fix 03 sulla PR #33. Se tutto PASS, **merge #33 soltanto se l'utente autorizza esplicitamente nella chat 00** (nuovo mandato, il R06B non vale); dopo merge, verificare main e conservare il report nel ramo audit. Non avviare da te sviluppo del runtime.

## Fase immediatamente successiva dopo MERGE #33
L'Agente 10 attiverà il **NEXT R03 runtime del 03** su branch NUOVO da main, con scope esteso a `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html`, `oronzo/assets/ui/` per integration-only e proprio REPORT. Il 03 consuma `oronzo/app/flow/controller.js` e motore 06/renderer 05 presenti su main, non implementa nuove regole. Obiettivo: **prima partita 1979 sul telefono con risultato, morale, classifica e salvataggio**, non una demo con pulsanti finti.

---

## ARCHIVIO — richieste precedenti, completate o superate
# ORONZO — PREPARAZIONE GATE R06B DOPO CONSEGNA FIX 07 · SOLO #38/#39

**Stato: `WAIT_FOR_07`, non eseguire ora.** Su main il NEXT 07 contiene il fix R06-1/2/3 richiesto dopo [R06](https://github.com/CzekUns/cercax/blob/audit/oronzo-r06-38-39/oronzo/coordination/coerentizzatore/REPORT-R06.md). L'ultimo CI [run 42381672625](https://github.com/CzekUns/cercax/actions/runs/42381672625) certifica **91 PASS suite** ma **un test E2E FAIL** per geografia mancante, e wiring API 09 non completo. Non dichiarare attualmente gate verde.

**Quando il 07 avrà modificato la PR #38**: leggere HEAD live #38 e #39, REPORT07 aggiornato e contratto `MORALE-R03.md` del 09; checkout/sandbox combinata main+#39+#38; eseguire suite Node flow, career, coach e demo completa; creare/eseguire E2E con **vere** API 09/Copy04/Match06 e dati geografici verificabili di test, non stub. Controllare no-region path `geography_required` senza mutazione, offerta e risposta stampa con effetto applicato una sola volta, saldo e morale in save/load, game-over, due stagioni, legacy 1985, motore goal e avanzamento.
**Se fallisce:** niente merge; owner e correzione puntuale. **Se tutto passa:** rapporto R06B con test/SHA, e **solo se l'utente conferisce nuova autorizzazione specifica**, merge nell'ordine dipendenze **#39 poi #38**, uno per volta, verificando main e regressioni dopo ogni passaggio. Non lavorare su #28/#29/#31/#33/#35/cutscene, nessun nuovo round.

---

## ARCHIVIO — audit R06 originale
# ORONZO — REQUEST ATTUALE AGENTE 00 · AUDIT R06 MIRATO PR #38 + #39

**Stato: READY per attivazione su chat Agente 00, 7 novembre 2026.** Le PR precedenti #30 e #32 sono già MERGED e non vanno riesaminate come incarico a sé. In questa sessione **nessun merge autorizzato automaticamente**. Nuove PR su GitHub:
- [#38](https://github.com/CzekUns/cercax/pull/38) — 07 game-flow 1979, HEAD verificato `94538ae97b3f7423a7d1e691a2e493524556142f`, **OPEN**.
- [#39](https://github.com/CzekUns/cercax/pull/39) — 09 CoachV2/morale/offerte/stampa, HEAD verificato `80df15139d37c4ee36103001d6a24528037daed4`, **OPEN**.

## Obiettivo del controllo
Certificare o respingere la **compatibilità reale fra #38 e #39**, prima del loro merge e del mandato UI 03. Non usare solo le verifiche V8 isolate dichiarate dai due autori. Non allargare review a tutte le PR.

1. Leggere entrambi i REPORT e le due documentazioni `oronzo/app/flow/README.md` e `oronzo/systems/coach-club/MORALE-R03.md`. Rileggere HEAD attuali all'avvio; il main potrebbe essere avanzato. Preparare checkout/sandbox combinato main + #38 + #39, byte e dipendenze verificati.
2. Eseguire **Node nativo** completo: `node --test oronzo/app/flow/tests/*.mjs`; `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js`; ed esecuzione reale `node oronzo/app/flow/demo-r03.mjs`. Eseguire anche test end-to-end mirato del **controller reale + Coach09 reale + Copy04 reale + Match06 reale**, non uno stub; se l'ambiente impedisce tale prova indicare con precisione cosa manca.
3. **Gate P0 funzionale:** in `newGame`, `coach.morale` inizializzato tramite il nuovo CoachV2 e `traits/origin` coerenti con `previewOfferMorale`; venti offerte visibili; `acceptOffer` usa `previewOfferMorale` e `applyOfferEffect` con firma/contract effettivi e applica UNA SOLA VOLTA il delta; `answerOpeningPress` e `answerPostMatchPress` usano `applyPressEffect` reale con `eventId` persistente e NON lasciano `awaiting_agent09` se i moduli sono disponibili. Verificare `gameOver` a morale zero, ricaricamento, doppio clic/retry, cash/ledger 1979, save legacy 1985, due stagioni.
4. **Rischio già documentato:** il 09 dice in #39 che gli applier non vengono agganciati automaticamente dal controller #38: serve wiring da 07 o consumer esplicito, con test che dimostri esecuzione effettiva. Il 07 mantiene i callback opzionali e lo status `awaiting_agent09`. Non considerare una semplice firma di callback, stub test o demo con dati sintetici come integrazione funzionante; classificare il problema con owner e file/linea. Non implementare tu il codice di 07 o 09.
5. Verificare che l'interfaccia flow headless per il 03 sia reale e ben definita (incluso portiere, chiamata 1×15min, eventi goal e salvataggi); segnalare se la prova HTML/Android resta non eseguita, senza pretendere che i test Node la sostituiscano.
6. Pubblicare rapporto **`oronzo/coordination/coerentizzatore/REPORT-R06.md`** su ramo documentale separato, distinguendo PASS/FAIL testati, SHA, blocchi esatti e owner. **NON effettuare merge #38/#39** in questo audit; 10 riassegna eventuale fix mirato al 07 o 09, poi autorizza un gate merge se verde.

**Priorità:** rapidità nel raggiungere primo playtest utente; niente round generale né verifica arti/cutscene che non tocchino il flusso dati del 1979.

---

## ARCHIVIO — incarichi R05 precedenti, chiusi
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
