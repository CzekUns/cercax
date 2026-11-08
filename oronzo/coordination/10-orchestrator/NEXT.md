# ORONZO — AGENTE 10 · ACCELERAZIONE M1 DOPO GAP ANALYSIS R10

**STATO: `ORCHESTRATE_M1_CRITICAL_PATH` — 8 novembre 2026.** Priorità corrente del proprietario: capire ciò che manca rispetto a [GAME-VISION-v02](../GAME-VISION-v02.md) e **accelerare verso M1 realmente giocabile**. Audit e piano eseguibile in **[ROADMAP-R10-ACCELERAZIONE.md](ROADMAP-R10-ACCELERAZIONE.md)** (questa è la fonte operativa aggiornata rispetto ai vecchi elenchi R02/PLAN).

**Subito:** (1) revisionare su runtime HTTP le PR #52 fullscreen e #53 comuni, non mergiare senza PASS e consenso utente; (2) sbloccare #28 camera TV con asset PNG veri, aiutando 05/01 con il gate browser; (3) chiudere collisione #31+#35 per shouts/player origin/trust con 06/08; (4) importare dal branch #40 **almeno500 dei 600 cognomi distinti** documentati, con fonte e stabilità salvataggi. Poi collegare realmente via07/12 TV, comandi durante gara e allenamento. **Stadio/prezzi/papponeria/mercato** sono tranche successiva P1, cutscene P2, espansione cognomi5000 P3.

**Disciplina:** lavori già in PR sulla **stessa PR**, ciascuna con proprio owner e tests; non duplicare branch. 12 corregge UI da screenshot; non costruire Layout Editor. 11 standby, 03 storico. Gate finale M1 originale: comune+cognome fonte, offerte→presidente→stampa→hub→partita FULL/TV + ordini reali→post→save/reload→2 stagioni, telefono Android. Non dichiarare pronto se camera/ordini esistono solo su branch/API.

**Nessuna autorizzazione automatica ai merge conferita da questa pianificazione.** L'utente deve approvare ogni integrazione. Agente10 resta owner roadmap/merge, non codice prodotto.

---

## ARCHIVIO STORICO — NEXT PRECEDENTI

# NEXT — ORONZO AGENTE 10 · SOLO ORCHESTRAZIONE
**Stato:** `WORKING` (coordinamento attivo; non sviluppo del gioco).
**Specifica utente:** [GAME-VISION-v02.md](../GAME-VISION-v02.md) · [Google Drive](https://docs.google.com/document/d/1k52clWWRcD3CMvD_HsX1ke7zdiVAY_AHp2MT9KfDEG0/edit).
**Epic:** [#25](https://github.com/CzekUns/cercax/issues/25) · **integrazione delegata:** [#26](https://github.com/CzekUns/cercax/issues/26).

## Prossimi passi del coordinatore (SOLO governance)
1. Sorvegliare REPORT/PR degli agenti e verificare incarichi, dipendenze e stato effettivo. Distinguere READY da una sessione realmente attiva.
2. **Prima priorità:** agenti 07 e 09 devono chiudere, testare e consegnare i fix R02 su ID presidente, obiettivi, stipendi, settimane assolute e persistenza mister. Non aprire ora nuova integrazione che presupponga moduli non corretti.
3. Agente 03 consegna prima kit UI dinamico nel suo scope attuale `oronzo/assets/ui/`. Dopo merge del ciclo artistico e dopo gate R02, autorizza un ciclo separato per la **UI runtime** (`index.html`, `game.js`, `ui.css`, `partita-rapida.html`), che sarà di sua esclusiva competenza. La UI consuma gli adapter, non duplica la logica.
4. Agente 07, dopo merge R02, riceve un nuovo ciclo per il **game-flow e gli adapter** in `oronzo/app/flow/` oltre alla propria career, con nuovo campo di proprietà esplicitato in contratto/IDENTITY/NEXT. Non farlo partire prematuramente.
5. Invia a 04,05,06,08,09 i requisiti necessari alla carriera morale/1979/società/telecamera/ordini; verifica compatibilità degli schemi, documenta cause dei rifiuti e richiedi correzioni prima del merge.
6. Valuta il primo percorso completo Nuova/Carica→avatar→20 ingaggi→presidente→rosa→5 domande→hub→match→stampa→morale→save/load usando i test e screenshot consegnati dagli agenti. Se manca una prova, segna il gate come aperto.
7. Aggiorna issue, NEXT, registro e stato delle PR. **Non scrivere codice del gioco**.

## Stato riscontrato
Partita rapida separata disponibile, PR #24 integrata; PR #12 cutscene in draft; cinque P1 R02 non ancora confermati come risolti nell'ultimo controllo; visione v0.2 documentata ma non implementata completamente. Evita affermazioni di avvio automatico dei nove agenti.

## Riscontro LIVE dopo riavvio degli agenti (7 novembre 2026)
- NEXT 01–09 aggiornati con situazione dei branch e criteri attesi; non si è modificato codice di gioco.
- **P0 bloccante:** 07 R02 branch senza diff proprio, 09 R02 6 commit su sei file ma REPORT/PR e cross-test ancora assenti. Lavoro 09 in corso, niente merge; il 07 deve consegnare campo salario, presidentId, obiettivi, absoluteWeek e coach coerenti con le API dell'09.
- 04 e 06 hanno un primo commit di secondo ciclo e nessuna PR; 01,03,08 sono senza commit propri ai primi confronti; 05 branch R02 ancora non risolto via compare; 02 WAIT_REVIEW su PR #12 draft. PR #27 R03 non costituisce QA integrata.
- **Prossimo passaggio** dopo le due PR 07/09: leggere diff/REPORT, verificare test realmente eseguiti su due stagioni, eventuale review/merge; SOLO allora autorizzare il nuovo NEXT 07 per adapter `oronzo/app/flow/`. Il NEXT 03 per il runtime resta sospeso sino ai merge R02 e kit UI art. L'Agente 10 non scrive codice.

## Mandato di audit R04 a Work 00 — 7 novembre 2026
**Stato PR:** otto nuove PR R02 aperte: #30 (07), #32 (09), #33 (03), #28 (05), #35 (06), #31 (08), #34 (04), #29 (01). #12 cutscenes ancora DRAFT; #27 R03 prematuro da non mergiare.
**Consegnati:** i nove REPORT del ciclo corrente/precedente sono leggibili sui branch PR; nuovi REPORT R02 disponibili per agenti 01,03–09. R02 #30 dichiara 19/19 Node; #32 32/32 V8 + Node parziale; servono test cross reali sui due HEAD combinati.
**Decisione di governance:** tutti gli otto agenti con R02 consegnata sono stati portati a `WAIT_REVIEW`; Work 00 ha incarico specifico in `coerentizzatore/REQUEST.md` per l'audit R04 e **merge condizionati** concessi eccezionalmente dall'utente. Agente 10 non scrive codice né esegue merge durante questa delega. 
**Due rischi P1 da verificare:** 06 usa `origin.regionId/macroRegion` e `encourage/harsh`; 08 produce `origin.regione/macroregione` e `gentle/hard`. Le modifiche temporanee e persistenti agli effetti `shout` non vanno applicate due volte; test espressi e mapping necessari prima di collegare. #31 ha 20 cognomi demo, NON 5000 verificati; UI #33 contiene mock data, non il ciclo carriera giocabile.
**Ramo futuro 07 `oronzo/app/flow/`:** autorizzare NEXT nuovo solo DOPO #30+#32 entrambi mergiati e test sul main. **Ramo futuro 03 runtime:** autorizzare NEXT nuovo solo DOPO #33 + R02 07/09 e adapter 07 disponibile o stabilmente contrattualizzato. La direzione stile dialoghi è ancora in discussione, non definitiva.


## Decisione e audit R04 verificati — 7 novembre 2026
- [#36](https://github.com/CzekUns/cercax/pull/36) audit R04: 50 PASS/1 FAIL su suite 07+09 combinata, doppio pagamento di ledger V1 riprodotto (R04-1), fixture 09 payroll obsoleta (R04-2), incompatibilità schemi ordini 06/08 (R04-3/4); gate browser HOLD #28/#29/#33, #12 DRAFT.
- [#34](https://github.com/CzekUns/cercax/pull/34) **MERGED**: commit `b8976cb2b0129de9ee6537e1d624abce9ff1402f`. Cinque file content su main verificati SHA uguali al branch; tono creativo ancora in discussione. 04 è BLOCKED per nuova scrittura editoriale fino a conferma stile, ma codice stampa disponibile ai consumer.
- **NEXT aggiornati:** 07/09/06/08 `FIX_REQUESTED` sulle PR esistenti; 01/03/05/02 `WAIT_REVIEW/HOLD` per browser/arte; 04 `BLOCKED` dopo merge tecnico. Nessun merge nuovo o patch codice di gioco da 10.
- **Direttiva M1 utente:** 100 comuni e 500 cognomi verificati bastano al primo rilascio; finalità estesa 500/5000. Automazione oraria ORONZO attiva con prompt già comprensivo di raccolta nel branch dati; branch/PR research non ancora verificata disponibile al controllo. 07/08 integrano solo quando il batch è realmente acquisito e validato.
- **GATE** autorizzazione ciclo 07 `oronzo/app/flow/`: subordinata al merge #30 + #32 e suite green Node sulla nuova main, con contratto 06/08 R04-3/4 verificato prima di collegare gli ordini individuali. **GATE** 03 runtime: subordinato a #33 (browser+art) mergeato, API/adapter 07 affidabili e #31/#35 compatibili e approvati per usare gli shouts nel gioco. Preparare istruzioni future, non abilitare nel NEXT corrente.
- Prossimo controllo: nuovi HEAD #30/#32 con test V1/V2 e #31/#35 con eventId/tone/origin, poi browser QA. R04 Work 00 è concluso; nessun permesso di merge permanente.

## DISPATCH R05 — STATO ATTUALE DOPO LE ULTIME CONSEGNE (7 novembre 2026)
**Fonte da leggere per prima:** [`DISPATCH-R05.md`](DISPATCH-R05.md), che prevale sui vecchi stati storici sopra. L'Agente 10 fa **solo regole, NEXT, contratti, issue e audit dei deliverable**. Nessuna programmazione gioco o merge da 10.
- **Azione 1: attivare 00 (chat Work)** con `coerentizzatore/REQUEST.md` aggiornato a R05, inizialmente SOLO verifica/QA combinata #30+#32. Gli HEAD osservati `f098b547` (07) e `89bb4944` (09) contengono fix R04 nuovi: `migratePeriodLedgers`, `period_migration_required`, nuova suite payroll. R05 deve verificare realmente Node, V1/V2, 104 club e due stagioni. Il permesso speciale R04 ai merge è scaduto: nuovo merge da 00 solo su nuovo permesso espresso dell'utente nella chat.
- **Azione 2 parallela:** agenti **06 #35 e 08 #31**, rimasti sui precedenti HEAD `11e9901`, `979cde1`: `FIX_REQUESTED` R04-3/4 su origine/fiducia/toni e singolo effetto shout. Aggiornare le proprie PR, non aprirne altre.
- **Azione 3 QA:** 01 sprite #29 HOLD; 05 camera #28 ha 54/54 Chromium SOLO fallback senza sprite reali, gate PNG/browser HOLD; 03 UI #33 ha test Chromium 144 con asset intercettati e screenshot veri, ma hosting HTTP/Android e leggibilità da valutare; 02 #12 cutscene DRAFT, gate artistico. 04 #34 MERGED e contenuti creativi R03 congelati in attesa di scelte utente.
- **Sblocco 07 R03:** prima #30+#32 validati/mergiati, tests combinati sul main verdi. Successivamente emettere **NUOVO NEXT READY** per `oronzo/app/flow/` e ciclo 1979/20 offerte/100 comuni con adapter dati (non codice 03). Non anticipare.
- **Sblocco 03 R03:** prima #33 approvata e mergiata, adapter 07 disponibile e schema #31/#35 coerente; poi **NUOVO NEXT READY** per `index.html`, `game.js`, `ui.css`, `partita-rapida.html` in PR separata. Non anticipare.
- **M1 dati:** automazione oraria raccoglie **100 comuni + 500 cognomi verificati**, non duplicare ricerche, non chiamarli disponibili se non vi è PR dati importata.
- **Nessuna sessione riattivata automaticamente** dall'aggiornamento dei documenti: per partire gli agenti devono ricevere richiesta utente o automazione effettivamente abilitata. Il primo prompt va alla chat 00, mentre 06/08 possono lavorare in parallelo.

## NUOVO STATO PREVALENTE — POST-MERGE R05B (7 novembre 2026)
**Gate 07+09 R02 superato:** GitHub ha confermato #30 merged `aab48f0be77f022dbb7d915ab44187037d96b5f0` e #32 merged `5b1dcd7c71435709d8b2c62d5455720b73691eb8`. Il 07 è `READY` per **R03 carriera 1979/20 offerte/flow headless** nel nuovo `oronzo/app/flow/`, il 09 è `READY` per **morale coach, valutazione idempotente 20 offerte e game over**. NEXT completi sui rispettivi path; apriranno nuove PR da ultimo main. Primo obiettivo dimostrabile: onboarding + giornata/save/load API, senza schermate finte. **03 runtime ancora HOLD** finché UI #33 non è validata e l'adapter 07 esiste. Shouts 06/08 e cutscene non bloccano il core se esclusi temporaneamente; nessuna convocazione generale. L'automazione raccoglie 100 comuni/500 cognomi, non confondere con dataset già approvati. Agente 10 non ha scritto codice di gioco, non ha mergiato.

## DECISIONE ATTUALE — R06B VERDE, AVVIO GATE UI R07 (7 novembre 2026)

**Verifica GitHub:** #39 MERGED `cf4a8bc0046cc73cf9995f9dafb9a39a94c15626`; #38 MERGED `12fe01ff53a8a366dfa35271aa21cb3244ee2c10`; [R06B](https://github.com/CzekUns/cercax/blob/audit/oronzo-r06b-gate/oronzo/coordination/coerentizzatore/REPORT-R06B.md) certifica `97/97 PASS` e demo reale 1979 su main. Il **blocco maggiore non è più back-end**; è una **UI realmente collegata e provabile sul telefono**.

**Prossima singola azione autorizzata:** chiedere all'Agente 00 **gate R07 della sola PR #33** kit UI 03, come da `coerentizzatore/REQUEST.md` aggiornato. Review Chromium, asset reali, touch emulato, leggibilità, 3 viewport, manifest e autonomia dei dati visivi. **Nessun merge da Agente 10 e nessun merge #33 senza incarico esplicito della chat 00**. Se R07 verde + #33 mergiata, 10 autorizza il **nuovo ciclo runtime 03** (non toccare 07/09): interfaccia reale `index.html/game.js/ui.css` con flow 1979, press, morale, Engine06, classifica e save per primo playtest mobile.

**Decisione prodotto per playtest personale:** è ammessa modalità **demo tecnica dichiarata** con fixture geografica sintetica già presente nei test 07, e label visibile `Demo tecnica — località sintetiche`; nessuna rivendicazione di dati ISTAT o lancio pubblico prima del dataset verificato. La modalità ordinaria in assenza dataset deve mostrare `geography_required`, senza mutare stato. I 314 cognomi forniti dall'utente restano candidati non verificati nel branch di ricerca; non bloccare playtest tecnico sull'assenza di 500 certificati.

#28/#29 (telecamera/sprite rifiniti), #31/#35 (shouts) e #12 (cutscene) restano percorsi separati, non gate per il **primo test funzionale**, pur essendo requisiti del gioco completo. Obiettivo prova: **Nuova → 20 offerte → ingaggio → 5 Q → hub → formazione → partita vera → 2 Q → classifica/morale → save/load**.

## INCARICO ATTUALE RUNTIME R03 03 (post audit R07B, 7 novembre 2026)

**R07B PASS:** [rapporto](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r07b/oronzo/coordination/coerentizzatore/REPORT-R07B.md). **PR #33 MERGED** `c019d511af89eb54851b3743fba598254d59707f`; #38 e #39 già MERGED e 97/97 Node R06B. È stato aggiornato `03-ui/IDENTITY.md`, `RUN.md` e soprattutto **`03-ui/NEXT.md` con stato READY**, autorizzando ciclo R03 di **UI runtime** su branch nuovo `agent/oronzo-ui-r03-runtime`. Consegna: browser giocabile dal 1979 alla prima partita e al salvataggio, con dati veri dei sistemi e modalità demo geografia sintetica chiaramente visibile soltanto per QA personale. Testabile 3 risoluzioni con touch. Non dichiarare pubblicazione Android o hosting prima di verifica.

**Azione per utente:** inoltrare alla chat Agente 03 prompt di ripresa nuovo NEXT; attendere sua PR e REPORT prima di attivare audit 00 R08. Gli altri agenti/PR seguono i gate propri e non sono prerequisito bloccante per **primo playtest funzionale**.

## AGENTE 10 — STATO ATTUALE R08: PR #43 FIX_REQUESTED (8 novembre 2026)

Coerentizzatore 00 ha consegnato [REPORT-R08](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r08/oronzo/coordination/coerentizzatore/REPORT-R08.md) sulla [PR #43](https://github.com/CzekUns/cercax/pull/43), HEAD `8977305d78d1ddf161ac72b38b41973fe4311db4`. Esito **NEEDS CHANGES / NO MERGE**: 97/97 suite flow/career/coach + 22/22 renderer + 6/6 Chromium veri percorso partita/salvataggio PASS, con difetti di prodotto **R08-1 rosa completa/schede/Allenamento**, **R08-2 classifica completa 16/16**, **R08-3 touch realmente 44px senza clipping**, **R08-4 nuova carriera dopo gameOver senza refresh**.

**Prossima azione unica:** AGENTE 03 deve lavorare sulla stessa PR #43 come da `03-ui/NEXT.md` aggiornato, senza toccare engine o altri agenti, poi Coerentizzatore 00 gate R08B mirato (REQUEST già predisposto `WAIT_FOR_03`). Solo dopo gate PASS e autorizzazione esplicita utente potrà essere mergiata la PR #43. Non dichiarare ancora un URL pubblico o Android fisico verificato. L'automazione dati 100 comuni/500 cognomi è separata e non blocca la demo tecnica con banner sintetico.

## NUOVO CICLO ORONZO — AGENTE 11 SUCCEDE AL 03 PER UI MOBILE (8 novembre 2026)

L'utente ha scelto di creare **ORONZO-AGENT-11** al posto di 03 per il lavoro UI nuovo. **Issue [#47](https://github.com/CzekUns/cercax/issues/47)**. 03 resta ID storico con PR #33/#43 MERGED, in HOLD per nuovi cicli; 11 ha `IDENTITY/RUN/NEXT` propri in `oronzo/coordination/11-mobile-ui/`, registrato in `registry.json`. Deve leggere **integralmente** tutti i documenti/rapporti dell'03 prima di intervenire.

**M01 attivo e circoscritto:** eliminare letterbox laterale della carriera 1979 in landscape, CSS minimo in `oronzo/assets/ui/career-r03.css`, preservare proporzioni canvas, font e 44px touch, QA viewport 640×360, 800×360, 844×390 e ultrawide, confronto screenshot prima/dopo e regressioni. Nuovo branch `agent/oronzo-11-mobile-m01`, nuova PR, non merge. No incarichi paralleli a 03.

**Futuro fuori M01:** validare/inserire camera che segue pallone (owner 05 PR #28) come default, collegare comandi mister esistenti di 06 su UI (in NEXT distinto), poi Layout Studio privato di sviluppo, mai esposto ai giocatori. Agente10 coordina, Agente00 revisione.

## STATO CORRENTE — AGENTE 11 M01 PR #48 IN AUDIT (8 novembre 2026)

Consegna M01 completata da ORONZO-AGENT-11: [PR #48](https://github.com/CzekUns/cercax/pull/48), HEAD osservato `6e72486607405d06d9a5ba8cac8d00a002ea5da8`, OPEN/NOT MERGED. Diff runtime **solo otto righe CSS** in `oronzo/assets/ui/career-r03.css` per larghezza landscape e safe-area. REPORT dell'autore: 97/97 flow/career/coach, 22/22 renderer, Chromium HTTP 8 prima+8 dopo in quattro viewport mouse/touch e 48 screenshot; verifica indipendente NON ancora conclusa. Dimensioni stage dichiarate 640→640 (640×360), 640→800 (800×360), 693→844 (844×390), 711→960 (960×400); campo 16:9 NON ingrandito/stirato.

Il coordinatore ha impostato `coerentizzatore/REQUEST.md` a **READY R09-M01** per audit esclusivo PR #48, e `11-mobile-ui/NEXT.md` a **WAIT_REVIEW_M01**, postato commento di handoff sulla PR. **Azione seguente:** inoltrare il prompt audit a 00, esaminare suo REPORT-R09-M01; nessun merge senza autorizzazione esplicita dell'utente e non avviare nuovi cicli. Android fisico ancora da provare. Camera, comandi mister e Layout Studio privato NON attivati.

## AGGIORNAMENTO R09-M01 — FIX RICHIESTO A 11 / PR #48 (8 novembre 2026)

[REPORT-R09-M01](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r09-m01/oronzo/coordination/coerentizzatore/REPORT-R09-M01.md) in PR #49: **NEEDS CHANGES / NO MERGE** per R09-M01-1. HEAD PR #48 auditato `6e72486607405d06d9a5ba8cac8d00a002ea5da8`, ancora OPEN. Con safe-area left24/right12/bottom16, la CTA finale partita ha 42px visibili (<44px) a 640×360, 800×360 e 960×400, mouse+touch; 844×390 PASS. Altri gate: 97/97 Node flow+career+coach, 22/22 renderer, 16/16 Chromium standard, campo/font/flow/save integri.

**Owner 11**: NEXT11 ora `FIX_REQUESTED`, correzione puntuale solo `career-r03.css` sulla **stessa PR #48** e QA safe area su quattro viewport, senza merge. Commento dettagliato pubblicato sulla PR.

**Audit dopo fix**: `coerentizzatore/REQUEST.md` predisposto a `WAIT_FOR_11_FIX` per **R09B-M01**, da eseguire **in chat Work realmente distinta da quella che ha realizzato M01**, perché l'autore del rapporto R09 ha dichiarato di aver precedentemente sviluppato M01. Review indipendente sul nuovo HEAD e nuove prove; merge solo dopo PASS e nuova autorizzazione dell'utente. Android fisico ancora non verificato. Nessun avvio M02/M03/M04.

## R09B-M01 NO MERGE / R09B-M01-2 CONFERENZA AGENTE11 (8 novembre 2026)

[Report revisore R09B-M01](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r09b-m01-20261108/oronzo/coordination/coerentizzatore/REPORT-R09B-M01.md) su PR #48 HEAD `58c7c65506f74f012b17b099583e96ee380f8db5`: **NON CERTIFICATO, NO MERGE**. Analisi dei blob/patch valida, ma solo fixture CSS in Chromium: niente checkout, HTTP del gioco o Node 97+22 indipendenti. 44px TERMINA GARA sul gioco non certificato; l'11 dichiara 16/16 pass.

Il nuovo **R09B-M01-2** del NEXT11 (`FIX_REQUESTED`) chiede verifica nella UI reale della terza risposta della terza conferenza iniziale: autore ha misurato 39,15625px/44 a 640×360 con left24/right12/bottom16. **Se riprodotto**, fix CSS esclusivamente sulla **stessa PR #48**, mantenendo TERMINA GARA ≥44px, piena larghezza, safe area e ogni regressione. Non è provato che il difetto sia preesistente sul main; è preesistente solo rispetto all'ultimo fix R09 sul branch.

La REQUEST del Coerentizzatore 00 è `WAIT_FOR_11_R09B_M01_2` per audit R09C **su vero checkout e vero Chromium HTTP** in chat Work distinta da implementatore11. Non ripetere una fixture dichiarandola evidenza del runtime. Nessun merge e nessun avvio M02, camera, comandi mister o Layout Studio.

## M01 COMPLETATO E MERGIATO SU MAIN — AGENTE11 / PR #48 (8 novembre 2026)

**Decisione autorizzata dall'utente:** merge esclusivamente [PR #48](https://github.com/CzekUns/cercax/pull/48), HEAD indipendentemente approvato R09C `8c82cd0aa1cd856c8afc2964acae4ff57f5da93d`. **MERGED** su `main` con commit `1bb8815b967dc4171fc644713918ad97f1cd95fb`. La [PR #51](https://github.com/CzekUns/cercax/pull/51) rimane documentale OPEN, non mergiata.

**Audit**: [REPORT-R09C-M01](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r09c-m01/oronzo/coordination/coerentizzatore/REPORT-R09C-M01.md) PASS indipendente su checkout Git reale + Chromium HTTP, 119/119 Node, 16/16 percorsi, 336/336 risposte +42 test lunghi, CTA TERMINA GARA ≥44px, nessuna regressione nell'ambito del test.

**Post-merge statico verificato da Agente10:** GitHub PR merged true; `oronzo/assets/ui/career-r03.css` su main blob `0f3569d37c07f2153a4bf8ca28149ded60f2956e`, identico allo stesso file su HEAD auditato; `career-r03.js` e `career-r03.html` invariati. **Non rieseguite regressioni Node/browser post-merge** nel container dell'Agente10 perché `git ls-remote` non raggiunge GitHub (DNS `Could not resolve host: github.com`). Non spacciare queste verifiche statiche per run E2E. Stato NEXT11 `MERGED_WAIT_ANDROID`, REQUEST00 `STANDBY_POST_MERGE`.

**Prossimo:** test fisico Android landscape con barre browser e cutout, CTA/campo/conferenza e save/load. Dopo valutare separatamente la PR #28 camera 05, UI comandi coach e Layout Studio privato di sviluppo. Nessuna nuova fase assegnata fino a decisione utente.

## D01 COMUNI REALI + F01 SCHERMO INTERO — NUOVA RICHIESTA UTENTE (8 novembre 2026)

**Richiesta espressa:** «Aggiungi le località registrate e metti un tasto per schermo intero». L'Agente10 è soltanto orchestratore (`implementationAllowed:false` nel registro) e ha aggiornato i NEXT degli owner, senza dichiarare implementazione completata.

**DATI:** [PR #40](https://github.com/CzekUns/cercax/pull/40) ancora OPEN, branch `data/oronzo-world-research` HEAD `0cc7eead7c5e971cff0e2d08e4bb2febc1df884b`. Validato conteggio JSON: **500 record e500 ID ISTAT unici**, 19 regioni nel campione,500/500 senza `provinceCode`, 500/500 con `populationReferenceYear:null`, storico 1979 non certificato. Fonte RP92/ISTAT CC BY 4.0 e attribuzione. Il validator `oronzo/systems/career/world.js` non accetta ora catalogo perché richiede province e anno di popolazione reali. Assegnato `07/D01` **import/versioning/metadata/flow senza inventare valori** su nuova PR, nessun merge PR40; 500 target, 100 minimo M1 solo dopo validazione. **UI località F02** assegnabile a11 dopo che il contratto07 sia rivisto/mergiato: non confondere database di ricerca con località già giocabili.

**FULLSCREEN:** assegnato `11/F01` su nuova PR indipendente a partire dal nuovo main, solo `career-r03.html/.css/.js` + QA/REPORT. Pulsante nativo Fullscreen API, cambio stato e fallback, test vero gioco Chromium; niente "finto fullscreen" CSS, no Layout Studio. Incari paralleli ma senza file runtime sovrapposti; M01 PR48 già MERGED.

**Revisione:** 00 WAIT_NEW_PR_D01_F01 con gate distinti, no merge senza successiva autorizzazione utente. Attenzione all'automazione oraria che continua ad aggiornare #40; registrare snapshot SHA prima di importare.

## Implementazione diretta su richiesta utente — PR #52 e #53 (8 novembre 2026)

L'utente ha contestato la semplice delega dei lavori e chiesto esecuzione diretta. Eccezione operativa puntuale alla regola di orchestrazione senza coding, limitata a **F01 fullscreen** e **D01 comuni reali**; nessuna estensione agli altri sistemi.
- [PR #52](https://github.com/CzekUns/cercax/pull/52), branch `feature/oronzo-fullscreen-f01-direct`, implementa vero toggle Fullscreen API con fallback e target nav≥44, anche durante match; parse JS e prova isolata con evento click/denial/unsupported eseguiti. Non eseguito Chromium vero né Node119.
- [PR #53](https://github.com/CzekUns/cercax/pull/53), branch `feature/oronzo-municipalities-d01-direct`, snapshot500 comuni da ricerca #40 commit `0cc7eead7c5e971cff0e2d08e4bb2febc1df884b`, 19 fonti, campo provincia/anno demografico null, non1979; world.js V2, UI500 selezioni, QA sintetica separata, 20 offerte con geografia vera del catalogo, attribuzione CC BY. Sintassi JS e originale `validatedMunicipalities` sul JSON 500 passati in V8; non Node/Chromium reali. reviewStatus approva uso del campione contemporaneo, non storicità né audit esterno.
- **Entrambe le PR aperte, NESSUN MERGE.** REQUEST00 aggiornata per audit distinti; NEXT07/11 marcati DIRECT_IMPL_WAIT_QA per impedire PR doppie. Browser reale, Android fisico e suite119 ancora da verificare prima di merge. PR ricerca #40 resta open e preservata.

## AGENTE 12 — UI PLAYTEST FIXER / NIENTE LAYOUT EDITOR (8 novembre 2026)

Su richiesta del proprietario, creata [issue #54](https://github.com/CzekUns/cercax/issues/54) e documentazione permanente [HANDOFF12](../12-ui-tuning/HANDOFF.md), [RUN12](../12-ui-tuning/RUN.md), [NEXT12](../12-ui-tuning/NEXT.md), [registro SCREEN-NOTES](../12-ui-tuning/SCREEN-NOTES.md), [IDENTITY12](../12-ui-tuning/IDENTITY.md), specifica `oronzo/agents/12-ui-tuning.md`; aggiornato `registry.json` con agente12. Richiesta esplicita: **niente Layout Editor**; utente fotografa/testa ogni schermata e descrive spostamenti desiderati, 12 registra e applica CSS/layout mirato in una PR UI dedicata. Non implementare modifiche ipotetiche in anticipo.

**Handoff autoritativo:** 03=storico; 11=M01 storico e PR #52 fullscreen diretto in audit; 12=owner degli interventi UI richiesti durante playtest. Mantenere no-concurrent-write su `career-r03.css/html/js`; PR #52 e #53 sono OPEN al momento dell'handoff, da verificare live in 12. M01 PR #48 MERGED e audit R09C PASS. Nessun merge implicito per #52/#53 o modifiche di12. Agente00 rivede i cicli di12, Agente10 coordina.
