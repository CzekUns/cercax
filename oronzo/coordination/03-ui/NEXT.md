# ORONZO — AGENTE 03 · HANDOFF COMPLETATO ALL'AGENTE 11

**STATO ATTUALE: `HOLD_NEW_UI_WORK` — 8 novembre 2026.** La PR #43 è MERGED (`241068d383a67c0be8513a2ef9b74b37eea58155`), dopo PASS indipendente R08B; anche la PR #33 è MERGED. **Non iniziare ulteriori cicli di UI mobile**: l'utente ha creato **ORONZO-AGENT-11** come nuovo responsabile dei lavori UI. Documenti operativi: `oronzo/coordination/11-mobile-ui/IDENTITY.md`, `RUN.md`, `NEXT.md`; issue #47. Tu conservi ID, documentazione e storia; nessun lavoro concorrente senza nuovo mandato dell'Agente10.

---

## ARCHIVIO — NEXT precedenti del 03
# ORONZO — AGENTE 03 · R08 CORREZIONI CONSEGNATE, ATTESA GATE R08B

**Stato attuale: `WAIT_REVIEW_R08B`, 8 novembre 2026.** PR #43 **OPEN**, nuovo HEAD verificato `4d00fb5bb6f05465eec30e1b8d997865579d47d8`; [REPORT-R08](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r08/oronzo/coordination/coerentizzatore/REPORT-R08.md) P1/P2 R08-1/2/3/4 corretti dall'autore. Nuovo REPORT03 dichiara 97/97 test flow, 22/22 renderer, 6/6 Chromium 3 viewport × mouse/touch, ma **non costituisce validazione indipendente R08B** (il browser autore usa `route.fulfill`/storage shim, non HTTP/localStorage veri). Il 00 deve testare il nuovo HEAD personalmente, come da `coerentizzatore/REQUEST.md` aggiornato.

**Prossimo intervento 03:** nessun altro cambiamento salvo nuovi fix richiesti dal 00. Rimani sulla stessa PR #43 e non mergiare. Dopo gate positivo e merge autorizzato, Agente 10 deciderà prossimo ciclo e test Android reale; il QA Chromium touch non equivale a smartphone fisico.

---

## ARCHIVIO — FIX R08 CONSEGNATI
# ORONZO — AGENTE 03 · CORREZIONI R08-1 / R08-2 / R08-3 / R08-4 · SOLO PR #43

**STATO CORRENTE: `FIX_REQUESTED`, 8 novembre 2026.** Il Coerentizzatore 00 ha consegnato [REPORT-R08](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r08/oronzo/coordination/coerentizzatore/REPORT-R08.md) nella [PR #44](https://github.com/CzekUns/cercax/pull/44): gate **NEEDS CHANGES / NO MERGE** per [PR #43](https://github.com/CzekUns/cercax/pull/43), HEAD osservato `8977305d78d1ddf161ac72b38b41973fe4311db4`. **Conservare il vertical slice che funziona**: 97/97 flow+career+coach, 22/22 match-view, 6/6 percorsi browser Chromium via HTTP con save/reload reali. Questi PASS riguardano l'HEAD auditato, non future modifiche.

**Owner unico 03.** Intervenire soltanto nello **stesso branch/PR #43** `agent/oronzo-ui-r03-runtime`, senza aprire altra PR, senza fare merge, senza modificare moduli dei colleghi 07/09/06/05/08. File ammessi: `oronzo/assets/ui/career-r03.js`, `career-r03.css`, HTML/asset/test UI strettamente necessari nello stesso scope + `oronzo/coordination/03-ui/REPORT.md`. Non creare un nuovo sistema di allenamento né inventare valori.

## R08-1 P1 — Rosa completa, scheda reale e navigazione Allenamento
- `renderHub()` attualmente fa `club.players.slice(0,12)` sui **16** giocatori. Visualizzare TUTTI i giocatori in lista/paginazione scorrevole, senza tagliarli; prova selezione del **16°** e coerenza tra ID, nome e club.
- Rendere le righe pulsanti/tap accessibili. Scheda giocatore con dati reali tramite `getRosterPlayer(state,id)` e `getTrainingPlayer(state,id)` importati dal flow07, usando valori effettivamente disponibili (attributi, condizioni e fiducia SOLO se esposti), fallback dichiarato `dato non disponibile` anziché sintetico.
- Aggiungere sezione **Allenamento** navigabile dall'hub e ritorno alla Rosa. Finché non esiste un contratto per modificare allenamenti, la schermata è **consultazione dei dati**, con azioni che richiedono motore disattivate ed etichettate come non disponibili; non creare nel client effetti su forma/attributi/morale. Se il NEXT originario richiede allenamento attivo, segnalare dipendenza e non millantare completamento delle azioni.

## R08-2 P2 — Classifica 16/16
- Eliminare `rows.slice(0,12)` nel ramo Campionato di `renderHub()`; mostrare **tutte** le posizioni restituite dall'API `getStandings` della carriera, con scroll/tabelle leggibili e squadra allenata sempre trovabile anche in posizione 13–16.
- Test DOM: numero righe DOM = numero record sorgente; ultima riga e posizione 13–16 raggiungibili con swipe touch senza cambiare ordinamento/risultati.

## R08-3 P2 — Touch realmente 44px, no clipping a 360px
- Correggere `career-r03.css` e layout `renderAvatar/renderMatch`: CTA INDIETRO/20 OFFERTE e TERMINA GARA (QA) nominalmente 44px ma soltanto **33–34px visibili** a 640×360 e 800×360.
- Riservare spazio alle CTA, rendere scrollabile **solo** il corpo informativo o comprimere decorazioni; select oggi **34px** e righe rosa **29/34px** devono avere target effettivo **almeno 44px** nelle tre risoluzioni **640×360, 800×360, 844×390**.
- Aggiornare script QA: **intersezione del rettangolo con tutti gli antenati overflow**, non sola altezza del bounding box né tolleranza attuale 39px. Controllare `elementFromPoint` al centro e `touchscreen.tap` senza scroll automatico Playwright, nessun overlay che ostruisca azioni, screenshot.

## R08-4 P2 — Nuova carriera dopo GAME OVER
- `renderGameover/render` e `interact/home`: aggiungere pulsante **NUOVA CARRIERA** o equivalente con vera azione reset del runtime 03, distruggendo/disassociando vista MatchView/engine in memoria e lo stato coach terminato, riportando alla selezione partita/allenatore **senza refresh**.
- **Non** guarire o riutilizzare il coach a morale 0; la nuova carriera deve partire tramite normale `newGame`. Il **salvataggio precedente resta intatto** fino a scelta esplicita dell'utente; non cancellare chiavi o sovrascriverle silenziosamente. Test con evento reale Agent09 `morale=0`, pulsante nuova carriera e caricamento del precedente salvataggio.

## QA e consegna
1. Test su **runtime R03 reale, via Chromium/HTTP statico** dove possibile, 3 viewport × desktop/touch. Dalle 20 offerte alla prima gara e al save/reload, più 4 regressioni; non sostituire risultati engine con stub, non usare soltanto demo UI.
2. Ripetere `node --test oronzo/app/flow/tests/*.mjs oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js`, `node --test oronzo/systems/match-view/*.test.mjs`, test UI, screenshot e prove hit-test; riportare PASS solo se rieseguiti sul nuovo HEAD. Non nascondere il 404 opzionale `assets/cutscenes/manifest.json` se rimane, né dichiarare Android fisico o hosting pubblico verificati.
3. Mantenere accessibili 1985 legacy e partita rapida, banner permanente **DEMO TECNICA — LOCALITÀ SINTETICHE** nella modalità QA, errori `geography_required` e save idempotente.
4. Aggiornare REPORT03 con diff/commit, risultati verificati e limiti; pubblicare **solo sulla PR #43**, senza merge. Poi richiedere al 00 audit **R08B**, esclusivamente i quattro fix e regressioni.
**Nessun nuovo round generale, nessuna dipendenza da completamento PR grafica/cutscene per questo gate.**

---

## ARCHIVIO — NEXT precedenti superseded da R08
# ORONZO — AGENTE 03 · NEXT ATTUALE R03 — PRIMA PARTITA GIOCABILE SU TELEFONO

**STATO: `READY` — nuovo incarico AUTORIZZATO dall'Agente 10, 7 novembre 2026.**

**Gate soddisfatti:** [PR #33](https://github.com/CzekUns/cercax/pull/33) (kit UI R02) MERGED `c019d511af89eb54851b3743fba598254d59707f`, [R07B](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r07b/oronzo/coordination/coerentizzatore/REPORT-R07B.md) PASS Chromium reale HTTP, 6/6 desktop+touch × 2 prima/dopo merge. [PR #39](https://github.com/CzekUns/cercax/pull/39) morale e [PR #38](https://github.com/CzekUns/cercax/pull/38) career flow MERGED; gate [R06B](https://github.com/CzekUns/cercax/blob/audit/oronzo-r06b-gate/oronzo/coordination/coerentizzatore/REPORT-R06B.md): 97/97 test Node su main e demo 1979 PASS. Nessuna delle due suite prova che la UI runtime ora esista: proprio questo è l'incarico R03.

**Git:** partire da **ULTIMO `main`**, nuovo branch `agent/oronzo-ui-r03-runtime`, aprire **nuova PR** (NON riaprire #33), **NON merge**. Identità sempre **ORONZO-AGENT-03**, come da IDENTITY/RUN aggiornati. **Scope autorizzato**: `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, opzionale `oronzo/partita-rapida.html` se serve senza rompere la partita rapida preesistente; `oronzo/assets/ui/` per componenti/asset/QA del kit, eventuali test/bridge UI isolati in `oronzo/app/ui/` di proprietà 03, e `oronzo/coordination/03-ui/REPORT.md`. **Non modificare** `oronzo/app/flow/`, `oronzo/systems/`, `oronzo/content/`, `oronzo/data/` o file di altri agenti. Se scopri un difetto contrattuale con flow 07, descrivilo e chiedi correzione owner; nessun bypass nella UI.

## Risultato che l'utente deve poter provare

Un **vertical slice veramente giocabile** nel browser del telefono in landscape 16:9: `Nuova partita` → selezione allenatore/avatar (quattro tratti e origine) → **20 offerte reali**, con preview morale 09 → ingaggio → **cinque risposte** stampa Copy04 con effetti reali → hub data 1979 (Campionato/Rosa/Allenamento/Tifoseria/Ufficio presidente) → formazione valida **11 giocatori, di cui esattamente un portiere**, panchina e capitano → gara 11 contro 11 con vero Engine06 e visualizzazione MatchView05 disponibile su main → risultato/goal coerenti con eventi reali → **due risposte postpartita**, variazioni morale e rapporti → classifica/finanze aggiornate `advanceMatchday` una volta → save/load persistenti, successiva giornata. A morale zero mostrare GAME OVER e disabilitare azioni; schermata carica salvataggio usabile. Priorità di consegna: tutto questo percorso deve essere navigabile con touch e con dati realmente derivati dallo stato, non solo 8 schermate decorative.

## I contratti da consumare, senza duplicare simulazione
1. Importare la **vera API ES module** `oronzo/app/flow/controller.js` come riportato in [README flow](https://github.com/CzekUns/cercax/blob/main/oronzo/app/flow/README.md): `newGame`, `loadGame/saveGame`, `listInitialOffers/acceptOffer`, `getStateForUI/getRosterPlayer/getTrainingPlayer`, `answerOpeningPress/answerPostMatchPress`, `prepareMatch/tickMatch/consumeMatchResult`, `advanceMatchday/rolloverSeason`. Non ricreare nel vecchio `game.js` liste di 8 squadre, random risultato, week/payroll, morale o ricostruzione di club. UI adatta il `stage` reale con mapping documentato e non mostra "operazioni riuscite" se l'API rifiuta.
2. Usare kit già mergiato `oronzo/assets/ui/demo-v02.*` come **componenti e grafica**, attraverso `OronzoUIKitV02.createApp(root,{data,onIntent})` o mediante estrazione controllata di componenti; `onIntent` deve invocare realmente i comandi 07. Intercettare/neutralizzare tutti i callback demo che altrimenti muterebbero statistiche fittizie o mostrerebbero un falso load/save; date, nomi, presidente, costi, line-up e scoreboard sono **DOM dinamico** letti da `getStateForUI`. Preservare 10 PNG, leggibilità, tasto Carica 44px effettivi e status non coprente risolti in R07B.
3. Il match usa `prepareMatch` (ritorna engine) → `tickMatch(engine,elapsedRealSeconds,{speed})` (non chiamare direttamente `advanceRealSeconds`; **1× = 900 secondi reali per 5400 simulati ≈15 minuti**, con 2/4/8× opzionali testati) → snapshot/eventi `MatchView05` → `consumeMatchResult` **solo fulltime**. Non creare score, gol, assist o effetti come fallback. Camera FULL o TV **solo se implementata realmente nel renderer disponibile**, non basta zoom CSS di demo. Se sprite/atlas definitivi PR #28/#29 non sono su main, distinguere visivamente `asset provvisorio` in QA e non affermare averli integrati.
4. Copia reale dalle risorse `oronzo/content/press-opening.json`, `press-postmatch.json`, `press-media.json`, `presidents.json` senza inventare copy; i test runtime possono usare `fetch` statico con gestione errori HTTP e JSON. Evitare duplicazioni evento, assicurare `expectedAbsoluteWeek` nel pulsante di avanzamento, bloccare doppio tap in attesa di transazione e conservare morale/club/save.
5. **Save/load**: usare API 07; non serializzare l'engine in corso. Il flow rifiuta save `pre_match/match_live`: UI salva PRIMA di preparare la gara o DOPO fulltime, e al riavvio spiega la regola. Non sovrascrivere vecchi slot legacy 1985 senza backup/esplicita procedura. Test reload browser, stato data/coach/morale/rapporti/classifica e deduplica eventi.
6. **Geografia/identità:** la produzione M1 attende 100 comuni e 500 cognomi verificati (ora raccolta ricerca separata, non ancora disponibile). Senza catalogo valido `acceptOffer` deve mostrare l'errore esplicito `geography_required` senza firma/mutazione. **Per il solo primo playtest personale** predisporre una modalità test deliberatamente separata, etichetta persistente e visibile **“DEMO TECNICA — LOCALITÀ SINTETICHE”**, usando la fixture già disponibile `oronzo/app/flow/tests/qa-geography.mjs` o un adapter separato che preservi esattamente provenance `qaFixture:true`, `synthetic_test_only`. Non esporre in modo ambiguo come comune reale né attribuire dati fittizi a ISTAT. L'avatar deve avere origine coerente con il catalogo; niente inferenze di regione. Nomi/luoghi di prova non sono dati della release; no ripopolamento casuale di identità già persistenti.
7. **Regressioni/compatibilità:** il sito corrente mostra un prototipo legacy 1985 e `partita-rapida.html`; preservare una via sicura di accesso alla partita rapida precedente o migrare compatibilmente la navigazione, senza cancellare in silenzio il legacy e senza rompere i suoi salvataggi. Se per primo playtest la nuova UI richiede hosting separato, documentare entrypoint verificato e lasciare sito attuale stabile fino al gate.

## Prove richieste e consegna
- **Obbligatorio:** test su **vero nuovo runtime HTML e sue API 07/09/06** (non soltanto `demo-v02.html`). Scenario automatico Playwright/Chromium: scelta avatar e 20 offerte reali → effetti 5 Q → partita Engine06 da kickoff a fulltime → post 2 Q → risultato, classifica, morale, save → reload/ripartenza; test doppio tap e `geography_required` su avvio normale senza dataset. No test con `effectsMode:'isolated_test'` in UI.
- Browser **640×360 / 800×360 / 844×390**, desktop + touch, immagini **reali**, niente CTA tagliate, tap di centro senza auto-scroll, zero overlay toast, zero JS error, cambio orientamento e leggibilità. Server statico HTTP reale dove possibile; altrimenti descrivere il limite. **Android fisico NON dichiarato testato** senza prova sull'apparecchio dell'utente.
- Rilanciare regressioni `node --test oronzo/app/flow/tests/*.mjs` e `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js` su checkout contenente tutte le dipendenze; documentare effettivamente PASS/FAIL, non inventare 97/97 nuovi senza rerun. Confermare JSON asset e font via HTTP.
- Mostrare uno **URL di prova effettivamente raggiungibile** soltanto se verificato; altrimenti consegnare procedura di avvio locale e segnalare l'assenza di preview pubblicata. Non utilizzare un finto link. L'utente vuole testare da Android.
- Aggiornare `oronzo/coordination/03-ui/REPORT.md` nel nuovo branch, con SHA dei file, test misurati, screenshot, limiti, rischio dati sintetici e nuova PR a `main`, **mai merge autonomo**. Se manca un pezzo, consegnare un percorso verticale parziale reale + bug tracciato, non sostituirlo con fake.

**Gate seguente:** revisione indipendente 00 su PR 03 runtime (R08) e autorizzazione merge specifica. **Non coinvolgere 01/02/05/06/07/08/09 in un round generale ora**; la finalizzazione della grafica partita e shout seguirà separatamente al primo playtest.

---

## ARCHIVIO — R07B chiuso e direttive precedenti
# ORONZO — AGENTE 03 · STATO POST CORREZIONI R07

**Stato attuale: `WAIT_REVIEW_R07B` (7 novembre 2026).** La PR #33 (`agent/oronzo-ui-r02`) è ancora **OPEN**, HEAD verificato `1e41c8716798612863aa0fc2327c6ee09deeb82d`. Il REPORT03 sul branch documenta fix R07-1 e R07-2 e QA proprietario **6/6 desktop+touch Chromium** a 640×360, 800×360, 844×390 con 10 PNG reali via `route.fulfill`, non HTTP live; Android fisico NON testato. **Non modificare nuovamente il kit in assenza di richiesta del 00.**

**Azione unica:** il Coerentizzatore 00 deve eseguire audit indipendente R07B su HEAD attuale #33, provando HTTP statico reale, clipping, touch e toast, senza affidarsi alle sole asserzioni/screenshot dell'autore. Se manca un gate, correggere solo la #33 secondo difetti esatti; nessun merge autonomo. Solo dopo gate PASS e merge autorizzato, Agente 10 emetterà NEXT R03 runtime e nuovo branch per il primo playtest mobile.

---

## ARCHIVIO — FIX R07 CONSEGNATO
# ORONZO — AGENTE 03 · FIX R07-1 / R07-2, STESSA PR #33

**STATO ATTUALE: `FIX_REQUESTED` (7 novembre 2026)**. Il Coerentizzatore 00 ha completato [REPORT-R07](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r07/oronzo/coordination/coerentizzatore/REPORT-R07.md) sulla **PR #33 OPEN**, HEAD osservato `c38be80c392939d042dd998e6d1bf655c259804d`. Nessun merge. Questo blocco prevale sui precedenti WAIT_REVIEW/READY riportati di seguito.

**Scope:** esclusivamente `oronzo/assets/ui/` e `oronzo/coordination/03-ui/REPORT.md`, nella **stessa PR #33** `agent/oronzo-ui-r02`. Non creare nuova PR, non cambiare main, `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html` o codice gameplay. Il nuovo runtime mobile sarà autorizzato SOLO dopo superamento gate e merge #33.

## R07-1 P1 — tasto CARICA PARTITA tagliato a 360px
- In `oronzo/assets/ui/demo-v02.js` `renderEntry()`, CSS `demo-v02.css` layout `.panel`, `.news`, `.v-stack`, `.hint-line`: a 640×360 e 800×360 il pulsante ha height DOM 44px ma area realmente visibile ~21px, per clipping `overflow:hidden`; al centro il touch intercetta il pannello anziché il bottone. A 844×390 la CTA è visibile ma la didascalia sotto viene tagliata.
- Correggere layout con spazio riservato alle **due** CTA Nuova/Carica, mantenendo almeno 44×44 px realmente visibili/toccabili e testo leggibile, senza scroll invisibile. Le decorazioni possono adattarsi alla risoluzione.
- Test in Chromium **reale** a 640×360, 800×360 e 844×390, desktop e touch: no clipping su antenati, `document.elementFromPoint` al centro CTA identifica bottone/figlio, `page.touchscreen.tap` sul centro (NO locator automatic scroll) attiva la risposta corretta a tutte e tre.

## R07-2 P2 — toast che occlude e intercetta CTA
- In `demo-v02.css` `.toast` e `demo-v02.js` `notify()`, dopo 5 risposte stampa il toast copre la CTA PROSSIMA GIORNATA nell'hub, il menu presidente e/o valori UMORE TIFOSI. In viewport 640×360 toast x=160,y=266,w=320,h=46; CTA y=254,h=44; centro CTA intercettato da `#ui-toast`; la navigazione resta ferma su hub. Riprodotto anche a 800×360 e 844×390.
- Preferire uno **slot status dedicato** con altezza riservata e testo adattivo; in alternativa posizione fuori da controlli/indicatori. `pointer-events:none` da solo non basta (testo comunque coperto). Mantenere il fix R04 `changeScreen()` che cancella toast vecchi.
- Test Chromium: percorso Nuova → offerte → conferenza 5 risposte rapide → hub; tap immediato sul **centro reale** PROSSIMA GIORNATA, senza attendere 2400ms e senza scroll automatico, deve navigare alla schermata prepartita; nessun contenuto o CTA occlusi nelle tre risoluzioni. Ripetere test su menu presidente e indicatori.

## Deliverable e QA
1. Modificare **solo** le due regressioni e, se necessario, script QA e screenshot nella stessa PR #33. Esportare screenshot 640×360, 800×360, 844×390 dopo fix, con 10 PNG veri caricati su HTTP statico quando possibile. Nessun dato demo spacciato per gameplay.
2. Rilanciare `node --check oronzo/assets/ui/demo-v02.js`, `python oronzo/assets/ui/qa/check_assets.py`, `python oronzo/assets/ui/qa/run_browser_r04.py` e test aggiuntivi di hit-testing, clipping e toast; distinguere prove realmente eseguite da quelle impossibili.
3. Aggiornare `oronzo/coordination/03-ui/REPORT.md` con SHA, file modificati, riscontri e limiti, e aggiornare **solo PR #33**. **NON MERGIARE**. Richiedere review **R07B** del Coerentizzatore 00, limitata ai due difetti e regressioni, prima di un'eventuale autorizzazione merge.

---

## ARCHIVIO — direttive pre-R07, superate
# ORONZO — AGENTE 03 · NEXT ATTUALE R07: REVISONE FINALE KIT UI #33

**Stato attuale: `WAIT_REVIEW_R07` — PR #33 ancora OPEN.** Le PR **#39 e #38** sono MERGED e il gate R06B 97/97 PASS su main; il controller carriera 1979 è pronto per essere collegato alla UI. **Non** ripartire da R02 e non riscrivere logica 07/09.

**Prima azione:** lasciare al Coerentizzatore 00 la review mirata R07 sulla **stessa PR #33** (HEAD noto `c38be80c392939d042dd998e6d1bf655c259804d`) secondo `coerentizzatore/REQUEST.md`. Se il 00 chiede correzioni di leggibilità, browser/touch, manifest o asset, aggiorna **solo #33** e `oronzo/assets/ui/` + REPORT03; **nessun merge autonomo**. Non aprire in contemporanea una PR runtime che dipende da un kit non approvato.

## R03 — INCARICO PRONTO PER PLAYTEST, SI ATTIVA SOLO DOPO MERGE #33

Una volta che **#33 è realmente MERGED**, l'Agente 10 autorizzerà un **nuovo NEXT** e un **nuovo branch da main** `agent/oronzo-ui-r03-runtime`. *Non è ancora un incarico di implementazione attivo in questo NEXT R07.* Il suo output richiesto sarà una **partita realmente giocabile via browser mobile**, non l'ennesima demo con dati hardcoded:

- Integrazione runtime `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css` e, se necessario, `oronzo/partita-rapida.html`, consumando il kit #33 e `oronzo/app/flow/controller.js` **reale** su main. Il 03 presenta dati e invia intent, senza modificare regole di 07/09/06. UI 16:9 landscape e touch.
- Flusso prima partita: Nuova/Carica → avatar/4 tratti → **20 offerte vere dal controller** → selezione e anteprima morale da 09 → 5 domande iniziali Copy04 → hub 1979, Rosa/Allenamento con stesso `playerId` e kit persistente (mostrare stato “asset non disponibile” se mancano `player.visual`, non inventare) → formazione da 11 con portiere → match realmente simulato Engine06 via `prepareMatch/tickMatch/consumeMatchResult` a **1× = ~15 minuti** → 2 risposte postpartita → club/finanze/risultato/classifica → save/load e prossima giornata. Esclusi shout 06/08 avanzati finché non verificati.
- **Non attribuire dati demo/placeholder alla produzione.** Per playtest personale è ammissibile esporre solo in versione test una modalità ben distinta **“Demo tecnica — località sintetiche”** usando le fixture `oronzo/app/flow/tests/qa-geography.mjs` già etichettate `synthetic_test_only`, senza usare quelle località come dati ISTAT. Nella modalità normale, se manca catalogo regionale approvato, mostrare `geography_required` con messaggio leggibile e nessun ingaggio non valido. Non cambiare contratti 07/09 per aggirarlo. La produzione M1 aspetta i 100 comuni/500 cognomi verificati, ma questo **non deve impedire un playtest tecnico dichiaratamente demo**.
- Solo rendering, interazioni e orchestrazione UI. Per il match usare soltanto il motore autorevole 06 e la vista esistente disponibile su main, senza creare gol casuali o promettere le due camere / sprite PR #28/#29 prima dei rispettivi merge. Mostrare chiaramente la disponibilità reale di camera FULL/TV. Cutscene #12 non gate.
- Test Node esistenti sempre verdi, QA browser Chromium a 640×360, 800×360, 844×390 e touch; static server HTTP reale o dichiarare blocco; scenario automatizzato **sul runtime HTML vero**, non soltanto demo Kit: dall'avatar al match fulltime, effetti morale e salvataggio. Fornire URL verificato di preview giocabile e istruzioni Android; se hosting non disponibile segnalarlo senza inventare URL. Non dichiarare test Android fisico prima che l'utente lo esegua.

**Obiettivo di orchestrazione:** superato R07, autorizzare senza nuovi round generali il R03 runtime del 03. Tutte le altre PR (28/29/12/31/35) seguono propri gate e non devono ritardare **il test funzionale**.

---

## ARCHIVIO — R02 e direttive pre-R07
# NEXT — AGENTE 03 · ART DIREZIONE UI · VISIONE v0.2
**Stato:** `WAIT_REVIEW` — prevale la direttiva R05 in fondo al documento; lavoro R02 nella PR esistente.
**Lavoro precedente:** PR #5 MERGIATA (ad84dd134b98d5fde8017af3da5e6e7b1b21e63e).
**Fonte:** [visione v0.2](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/GAME-VISION-v02.md), [epic #25](https://github.com/CzekUns/cercax/issues/25).
**Branch:** `agent/oronzo-ui-r02`.
**Scope:** `oronzo/assets/ui/` e proprio REPORT.

## Task
1. Progetta/realizza come **asset HTML componibili** (non mockup statici incollati) i pannelli landscape 16:9 e i ritratti/caricature originali degli avatar allenatore, con luogo natale e 4 statistiche resi come testo dinamico, non bitmap. Interfaccia 640×360, 800×360, 844×390.
2. Priorità alle schermate del flusso: Nuova/Carica partita; scelta avatar; 20 ingaggi con indicatori morale/costo; presentazione presidente; conferenza iniziale 5 domande; hub con data 1979 e menu Campionato/Rosa/Tifoseria/Ufficio presidente; prepartita; vista match con switch full campo/TV.
3. Esporta texture/pannelli/tasti/ritratti con manifest degli hotspot touch e aree dinamiche separate; demo HTML in tua directory e istruzioni da usare nel successivo ciclo d'integrazione runtime a carico dello stesso agente 03.
4. Evita nomi reali di squadre/loghi/marchi; leggibilità prima di decoro.

## Proprietà del futuro runtime (PRENOTATA, NON ANCORA AUTORIZZATA IN QUESTO CICLO)
Dopo merge della PR UI corrente e dopo risoluzione/merge R02 di 07+09, il 03 riceverà una nuova iterazione **separata** per implementare e collegare il runtime di interfaccia: `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html`. Consumer dei moduli degli altri agenti e del controller di carriera fornito dal 07 sotto `oronzo/app/flow/`. Nessun altro agente, incluso il 10, modifica questi file. Aggiornare IDENTIY/RUN/NEXT e autorizzare esplicitamente questo scope prima della PR. Nel ciclo R02 attuale rimani **solo in `oronzo/assets/ui/`**.

## Gate
Non modificare `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css` o sistemi di gameplay. Lo scopo è artwork e kit di UI, non logica. Testa dimensioni e demo, REPORT concreto, PR verso main senza merge.

## Controllo orchestratore — ripresa parallela del 7 novembre 2026
Il branch `agent/oronzo-ui-r02` è **identico a main** (0 commit nuovi) e il REPORT leggibile riguarda il ciclo 01. **Stato READY confermato solo per il kit UI** in `oronzo/assets/ui/`. Al termine aprire PR con screenshot, manifest dinamico e report aggiornato. **NON autorizzato ora** scrivere `index.html`, `game.js`, `ui.css` e `partita-rapida.html`: il ciclo runtime sarà assegnato DOPO merge del kit UI e fix R02 degli agenti 07+09, con un nuovo NEXT esplicito e PR separata.

## R04 — CONSEGNA IN REVISIONE WORK 00
**PR:** [#33](https://github.com/CzekUns/cercax/pull/33). **Stato di merge:** NON confermato. Rapporto R02 presente sul branch della PR; testi precedenti READY sono archivio del lavoro autorizzato, non un invito a iniziare un altro ciclo.
**Gate di accettazione:** Gate kit: demo Chromium 640×360/800×360/844×390, hotspot e asset; non autorizzare runtime HTML finché R02 07/09 e questo kit non sono mergiati.
**Regola:** attendere review Work 00 e riassegnazione da Agente 10; solo correzioni sulla PR corrente se richieste, niente R03 autonomo.


## AGENTE 10 — RISULTATO R04 E PROSSIMO PASSO (7 novembre 2026)
**PR #33, esito R04: HOLD per gate browser.** QA statica/sintassi/asset sullo snapshot combinato è passata; **Work 00 non disponeva di eseguibile Chromium** e il tentativo d'installazione è fallito. I test browser dichiarati dall'agente con `page.set_content` sono utili ma non provano il deploy/hosting o il touch Android.
**Azione ammessa sulla PR #33 corrente:** fornire test browser ripetibile in ambiente Chromium realmente disponibile, con screenshot/autovalidazione delle schermate e interazioni 640×360/800×360/844×390, 8 avatar e 4 tratti dinamici, 20 offerte, 5 Q, hub, scroll e pulsanti almeno 44 px, nessun errore console, URL/asset HTTP veri ove possibile; documentare eventuale blocco e non millantare PASS. Controllare l'arte e leggibilità.
**NON autorizzare ancora** `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html`: il futuro runtime UI avrà NEXT separato **solo dopo** #33 approvata/mergiata, R02 07/09 superato, adapter 07 contrattualizzato e contratto #31/#35 compatibile (prima di integrare gli shouts). I 100 comuni e 500 cognomi sono contenuti dinamici da ricevere, non numeri incisi nelle bitmap; non confondere la demo con gioco già integrato.


## DIRETTIVA ATTUALE — DISPATCH R05 (7 NOVEMBRE 2026)
**PR #33: integrare solo prove del kit art, NON il runtime.** Nel REPORT aggiornato è documentato Chromium 144 reale con touch emulato e asset CSS/JS/PNG caricati tramite `page.route(...).fulfill(...)` (HEAD `c38be80c392939d042dd998e6d1bf655c259804d`), screenshot e test 640×360/800×360/844×390. Il QA con richieste intercettate NON certifica HTTP/deploy reale né Android fisico. **Priorità immediata:** fornire giudizio di leggibilità sulle didascalie 8–9px, screenshot e riproduzione accessibile; se possibile verificare URL realmente serviti/GitHub Pages/touch fisico, altrimenti segnalare limite. Solo dopo review Work 00 e superamento del gate artistico/browser, chiedere merge PR #33.

**PROSSIMA ITERAZIONE PREPARATA — NON AUTORIZZATA:** distinta PR su `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html`: navigazione nuova/carica→avatar→20 ingaggi→presidente→5 Q→hub→rosa/allenamento→prepartita→11v11 full/TV→2 Q postmatch→save/load, dati reali dal controller 07, no demo placeholder, nessun doppio event apply; landscape 16:9 e touch, QA Android/browser. Avvio esclusivo con nuovo NEXT **dopo** merge #33, #30+#32, adapter 07 stabile e contratto #31+#35 risolto. Non iniziare ora.
