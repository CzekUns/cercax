# ORONZO — AGENTE 07 · PR #56 CONSEGNATA, IN ATTESA AUDIT

**STATO: `WAIT_REVIEW_R10_PR56` — 9 novembre 2026.** La nuova [PR #56](https://github.com/CzekUns/cercax/pull/56) è **OPEN**, HEAD `b27af7ced642b436e5317a7384589c77bc789617`, branch `agent/oronzo-career-m1-r10`, adapter PlayerV2, catalogo 600 cognomi, allenamento, commands06 e ledgers, contratto UI per12. A differenza del precedente stato D01 (che riguardava la #53), **questo è sviluppo nuovo dell'Agente 07**. Test nativi mirati 8/8 passati riportati dall'autore, ma **manca il gate combinato E2E/Node e Chromium** e PR dipendenti #31/#35/#53 non sono su main. Niente secondo branch concorrente.

**Azione attuale:** su #56 correggere soltanto problemi dimostrati dall'audit00, mantenere il contratto `M1-AGENT12-CONTRACT.md`, preservare idempotenza e save. Il port di fiducia permanente `pending_agent09_player_trust` deve essere completato da09/07 con contratto e test, non inventare delta. Dopo PASS + merge autorizzato delle PR dipendenti, chiedere smoke-test di M1 con origini/cognomi/shouts/training su due stagioni e Android. Nessuna estensione libera del codice, no UI, no merge autonomo.

**Altro gate indipendente:** [PR #53](https://github.com/CzekUns/cercax/pull/53) import 500 comuni **PASS tecnico dall'audit00 nella PR #55**, ma ancora OPEN e non integrata; non confondere report PASS con merge. Le due PR **non toccano lo stesso `controller.js`** (#53 modifica UI R03 e `world.js`; #56 modifica `controller.js` e adapter): verificare comunque l'interazione runtime con un checkout combinato prima del merge finale.

---

## ARCHIVIO ISTRUZIONI 07 PRECEDENTI

# ORONZO — AGENTE 07 · D01 REALIZZATO DIRETTAMENTE / ATTESA QA

**STATO: `DIRECT_IMPL_WAIT_QA_D01` — 8 novembre 2026.** L'utente ha richiesto esecuzione diretta. [PR #53](https://github.com/CzekUns/cercax/pull/53), branch `feature/oronzo-municipalities-d01-direct`, importa 500 comuni da snapshot [PR #40](https://github.com/CzekUns/cercax/pull/40) commit `0cc7eead7c5e971cff0e2d08e4bb2febc1df884b` (file blob `7bcf0d6e24932817b880e164d7c3d5869d6e1d85`), schemaV2 con provincia e anno demografico `null` e origine attuale **NON 1979**. Collegati world.js e career-r03.js/ UI per nuove carriere, 500 scelte; dati QA sintetici separati. Sorgenti CC BY 4.0, attribuzione ISTAT/RP92 nel gioco e README.

**Risultati verificati da questa chat:** 500 codici ISTAT distinti / 19 fonti, `validatedMunicipalities` invocato sul catalogo reale: 500 PASS, parse V8 JS world e UI PASS. **Node test nuovo scritto ma non eseguito con checkout, nessun browser HTTP/Chrome/Android eseguito**, e nessun audit storico 1979. Non chiamare la PR #53 "passata" o "già integrata" prima del gate. Il valore `reviewStatus:approved` abilita il campione contemporaneo, **non afferma certificazione storica o approvazione indipendente della PR**.

**NON aprire una seconda PR D01 né modificare in parallelo world/flow/JS UI della PR #53.** Attendiamo revisione00. Eventuali bug di dati/flow saranno assegnati sul branch esistente. R06/#38 già MERGED. PR ricerca #40 ancora OPEN e può proseguire senza essere mergiata automaticamente.

---

## ARCHIVIO — NEXT precedenti
# ORONZO — AGENTE 07 · D01 IMPORTAZIONE COMUNI REALI M1 (NUOVO CICLO)

**STATO: `READY_DATA_D01` — 8 novembre 2026. Nuovo mandato esplicito dell'utente: «Aggiungi le località registrate».** Precedente PR #38 già MERGED su main, quindi gli incarichi R06 archiviati nel seguito di questo documento non sono più attivi. **Nuovo branch dall'ultimo main**: `agent/oronzo-07-municipalities-d01`, **nuova PR unica dati/mondo**; NO MERGE.

## Fonte esatta, validazione prima dell'import
- [PR di ricerca #40](https://github.com/CzekUns/cercax/pull/40), branch `data/oronzo-world-research`, snapshot iniziale verificato dall'Agente10 HEAD `0cc7eead7c5e971cff0e2d08e4bb2febc1df884b`, blob `oronzo/data/research/municipalities.json` `7bcf0d6e24932817b880e164d7c3d5869d6e1d85`. **500 record / 500 codici ISTAT unici**, 19 regioni rappresentate nella raccolta e19 sourceId; separato dai **500 cognomi** che non rientrano in questo incarico. L'automazione aggiorna #40: documentare SHA dello snapshot effettivamente importato ed evitare race con modifiche successive.
- Metadati incompleti **su tutti i 500 comuni**: `provinceCode` assente e `populationReferenceYear:null`. `sourceSnapshotYear:2026` **non equivale all'anno demografico**; `historical1979:false`. I record NON sono già idonei per `validatedMunicipalities` in `oronzo/systems/career/world.js`. **Non inventare province, anni demografici o geografia 1979, non cambiare in massa `reviewStatus` in approved senza review.**
- Leggi `oronzo/data/research/{municipalities.json,sources.json,STATUS.md}` dal branch ricerca, contratti `world.js`, `controller.js`, test `qa-geography.mjs`, dati/QA esistenti, e roadmap `GAME-VISION-v02.md`. Esegui validazione per codici ISTAT/nome/regione/alias/macroregione/fonte/licenza, duplicati e tracciabilità. La fonte è RP92/comuni-italiani derivata da ISTAT, **CC BY 4.0**, con attribuzione ISTAT/RP92 da rendere visibile e documentare. Non attribuire ai 500 comuni una classifica nazionale o un'accuratezza per il1979.
- Verifica `provinceCode` da fonte affidabile per ogni record prima di usarlo, oppure motiva un aggiornamento compatibile del validator che tratti la provincia assente **esplicitamente come ignota** se i sistemi consumer lo permettono, senza assegnare valori falsi. `populationReferenceYear:null` deve restare *ignoto*: aggiornare schema/import e consumers in modo conservativo se necessario, con test e compatibilità dei cataloghi già approvati. Separare verifica del comune contemporaneo da verifica dei dati demografici e dalla storia del1979. Se un dato obbligatorio non è verificabile, lascia quel record fuori dall'import con rapporto esatto; non inserire fixture travestite da ISTAT. Obiettivo: importare il maggior numero possibile fino a **500**, indicando esplicitamente quante sono effettivamente validate; minimo M1 100 **solo se davvero complete e revisionate**.

## Integrazione tecnica richiesta
1. Crea un artefatto persistente e versionato per il catalogo validato dentro `oronzo/data/world/` (oppure un path documentato equivalente), contenente ID ISTAT stabili a6 cifre, nomi, regione/macroregione normalizzate al contratto `north/centre/south`, eventuale provincia verificata, fonti/licenze e provenienza, distinguendo campi non noti. Evita la duplicazione fragile con il branch di ricerca e fornisci istruzioni di aggiornamento quando #40 cresce.
2. Integra il caricamento del catalogo tramite **API di flusso 07** (non modificarne il comportamento se dati non approvati) per `newGame` e la scelta dell'origine mister, collegando correttamente nomi/regioni ai club senza inventare club storici veri: `Sportiva [comune]` rimane squadra di fantasia. Esponi un'interfaccia documentata utilizzabile da UI11, senza alterare i vecchi salvataggi o rigenerare mondo/20 offerte a reload.
3. **Modalità normale deve usare dati reali approvati**; modalità `qa_fixture` sintetica resta separata ed esplicitamente etichettata, mai fallback invisibile. Senza catalogo valido permane `geography_required` e nessuna mutazione. Mantieni snapshot storicizzato/versionato nel save, con migration conservativa e distinzione geografica corrente vs 1979.
4. **Scope autorizzato esclusivo per D01:** `oronzo/systems/career/`, `oronzo/app/flow/`, `oronzo/data/world/` (nuova), test pertinenti e `oronzo/coordination/07-career/REPORT.md`. **Non modificare HTML, JS o CSS della UI**: la scelta mobile dei comuni verrà collegata dall'11 dopo la tua API. Non toccare `oronzo/data/research/` sul ramo automazione, né codice/rapporti 08, 09, 05 o 06.
5. Esegui test Node nativi, validazione end-to-end `newGame→origine reale→20 offerte→firma→save/reload→match→advance` con dati davvero importati, storicità e salvataggi precedenti, duplicate ID, province/anni null, licenze, `geography_required`, no synthetic fallback, stabilità seed. Aggiungi harness/test riproducibili; browser solo se pertinente. **Non dichiarare PASS per test non eseguiti.**
6. Consegna **PR di dati/flow non mergiata** e REPORT D01 con SHA snapshot #40 usato, numero esatto record importati/scartati, schema, fonti/licenze, caveat1979, test reali e contratto UI per l'11. Chiedi audit00 dopo consegna; **nessun merge automatico**. Se il gate metadati blocca l'import, documenta blocker verificabile e soluzione conservativa, non inventare valori.

**Dipendenza UI:** ORONZO-AGENT-11 sta ricevendo in parallelo il compito F01 di pulsante fullscreen. Non modificare i suoi file `oronzo/assets/ui/career-r03.*`. L'integrazione UI delle località verrà autorizzata in un successivo NEXT11 dopo la consegna D01; l'utente ha richiesto entrambe le funzionalità, questa separazione serve a non introdurre conflitti.

---

## ARCHIVIO ISTRUZIONI PRECEDENTI

# ORONZO — AGENTE 07 · CORREZIONE PUNTUALE R06 — SOLO PR #38

**Stato attuale: `FIX_REQUESTED`.** Audit indipendente [R06](https://github.com/CzekUns/cercax/blob/audit/oronzo-r06-38-39/oronzo/coordination/coerentizzatore/REPORT-R06.md) su PR [#38](https://github.com/CzekUns/cercax/pull/38) (HEAD osservato `94538ae97b3f7423a7d1e691a2e493524556142f`) e [#39](https://github.com/CzekUns/cercax/pull/39) (HEAD `80df15139d37c4ee36103001d6a24528037daed4`) con [GitHub Actions 42381672625](https://github.com/CzekUns/cercax/actions/runs/42381672625): **91/91 test di suite PASS**, ma **un test d'integrazione con vere API Coach09 FAIL** (`club_region_required`). Nessun merge. Il presente incarico prevale su tutti i precedenti READY, WAIT_REVIEW e divieti storici elencati sotto.

**Scope consentito:** modifica **solo** `oronzo/app/flow/`, `oronzo/systems/career/` quando strettamente indispensabile, e `oronzo/coordination/07-career/REPORT.md`. Resta sulla **PR #38** e branch esistente `agent/oronzo-career-r03-flow`; NON aprire altra PR, NON toccare `oronzo/systems/coach-club/` del 09 o codice altri agenti, NON fare merge.

## Fix R06-1 / P0 — Morale funzionante nel flusso normale
- Integra effettivamente **Coach09 R03 reale** nel consumer/adapter del flow, assicurando nell'avvio della carriera `createCoach` V2 con `morale` numerico, `origin`, `traits`, `relationships`, `gameOver` persistenti. Usa `previewOfferMorale` e `applyOfferEffect` durante **accettazione delle 20 offerte**, `applyPressEffect` per **tutte le 5 risposte iniziali e le 2 postpartita**. I callback opzionali che lasciano `awaiting_agent09` possono restare SOLO per isolamento di test con modalità esplicita: il percorso di gioco effettivo deve usare le API 09 oppure dare **errore chiaro** se il modulo non è disponibile; non fingere gli effetti come applicati.
- Contratto esatto: `oronzo/systems/coach-club/MORALE-R03.md` nella #39; non reinventare la formula. Se serve un import ESM diretto che dipenda dagli export non ancora mergiati del 09, documenta **ordine di merge #39 prima di #38**, verifica **checkout combinato** e non sostituire export inesistenti con stub. Non cambiare API del 09 se non dimostri un suo bug e lo segnali al 10.
- Verifica `effectStatus:'applied'`, eventi `moraleEvents`, `coach.morale` modificato e rispettivo ledger `flow.effectTransactions` persistito nello **stesso** commit/save; retry, doppio clic e reload non applicano due volte. `morale=0` → `gameOver` persistito e flusso bloccato con comportamento verificabile.

## Fix R06-2 / P0 — Regione del club assente in demo senza catalogo
- **Riproduzione R06:** `newGame({avatar:{id:'r06',traits:{luck:40,leadership:80,selfEsteem:50,patience:80},origin:{regionId:'campania',macroRegion:'sud'}}})` senza catalogo comuni, poi `acceptOffer(...,{previewOfferMorale,applyOfferEffect})` → `club_region_required` in `morale.js:30` via `controller.js:186`.
- Risolvi **nel flow 07**, con validazione anticipata della geografia e gestione controllata del caso `club.regionId`/macroregione assenti **prima** di registrare un contratto o addebitare morale. Se l'utente non ha ancora i **100 comuni verificati** M1, non inventare dati di produzione né una regione casuale e **non** chiedere al 09 di rimuovere la validazione.
- Comportamento prescritto per la modalità normale: rispondere/sollevare una condizione esplicita `geography_required` (testo localizzabile) e **nessuna mutazione** di stato/club/offerta/coaching/effect ledger, invece di lasciare propagare un oscuro `club_region_required`; segnalare dipendenza dai dati. Per **solo QA** puoi utilizzare fixture con dati geografici tracciati/controllabili e distintamente etichettate come test, senza spacciare una fixture sintetica per un catalogo ISTAT approvato. Qualsiasi compromesso per giocare senza geografia va sottoposto al 10, non assunto come regola definitiva.
- Testa preflight senza catalogo, presenza catalogo con regione nota, errori atomici ed eventuali legacy import; non sovrascrivere i 20 ingaggi già generati su un save.

## Fix R06-3 / P1 — Un solo percorso E2E reale (nessuno stub)
- Test integrato GitHub Actions/Node usando **codice completo #38 + #39**, moduli reali Copy04, Match06, Career07 e Coach09: 1979 → avatar CoachV2 → 20 offerte → firma singola e morale → 5 risposte stampa e relativi effetti → partita reale fino `fulltime` ed eventi goal coerenti → due risposte postpartita → effetti/relazioni → liquidazioni/board → save/load → retry idempotenti → prossimo turno. Includi game over a morale 0, almeno una verifica rollover/due stagioni e salvataggi 1985 retrocompatibili; distingui test che richiedono geografia fixture da prova su dataset M1 reale.
- Rilancia `node --test oronzo/app/flow/tests/*.mjs`, `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js` e `node oronzo/app/flow/demo-r03.mjs` su checkout combinato se possibile; se impossibile non dichiarare suite PASS, documenta gate mancante. **91 PASS isolati non bastano** se il nuovo caso E2E fallisce.
- Aggiorna REPORT e **stessa #38** con commit, file modificati, evidence test realmente svolti e dipendenze residue. Poi richiedi al **00 una review R06B** di #38 aggiornato e #39 invariato. 09 rimane `WAIT_REVIEW`, salvo bug proprio dimostrato.

**Priorità:** chiudere il singolo blocco che separa il controller dal playtest dell'utente; niente nuovi moduli societari, cutscene, grafica o round generale.

---

## ARCHIVIO PRE-R06 — REQUISITI/CICLI GIA' CONSEGNATI
# ORONZO — AGENTE 07 · NEXT ATTUALE: PRIMA CARRIERA GIOCABILE, 1979 (ciclo mirato R03)

**Stato: `WAIT_REVIEW` — R03 consegnato, in attesa audit #38+#39.
**Precedente gate superato:** [PR #30](https://github.com/CzekUns/cercax/pull/30) MERGED `aab48f0be77f022dbb7d915ab44187037d96b5f0`, [PR #32](https://github.com/CzekUns/cercax/pull/32) MERGED `5b1dcd7c71435709d8b2c62d5455720b73691eb8`. Fix R05-1 del cross-test presente su main (`r02-cross.test.mjs`, blob `586e6856910196965172e9488ff3bee8b839ee74`). Il precedente ciclo di correzione è **CONCLUSO**: vecchie direttive `FIX_REQUESTED`, `WAIT_REVIEW` e divieti R03 erano validi *prima* dei merge e non si applicano più.
**Repository:** `CzekUns/cercax`, branch di partenza obbligatorio: **ultimo `main`**, **nuovo branch** consigliato `agent/oronzo-career-r03-flow`, **nuova PR dedicata** (non riaprire la #30).
**Proprietà di codice autorizzata SOLO per questo incarico:** `oronzo/systems/career/`, `oronzo/app/flow/` e `oronzo/coordination/07-career/REPORT.md`; vedi deroga esplicita al tuo IDENTITY e al RUN. Qualsiasi altro file richiede prima un nuovo mandato. In particolare **non** modificare `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html`, `oronzo/systems/coach-club/`, `oronzo/systems/match-engine/` o asset altrui.

## Obiettivo immediato
Produrre il **controller dati della prima carriera 1979 realmente utilizzabile**, indipendente dai menu, con API ESM chiare e test riproducibili. Il 03 collegherà la UI in una PR distinta **quando il suo kit sarà approvato**. Il prodotto finale deve poter seguire *Nuova partita → scelta mister → venti offerte iniziali → ingaggio → presidente/squadra → conferenza iniziale (5 domande) → hub/calendario → prepartita → partita/risultato reale → postpartita → paghe/relazioni → save/load → prossima giornata*, senza sostituire gli eventi reali con risultati fittizi spacciati per gameplay.

### Passo A — mondo, anno e persistenza
1. Rendere **1979** l'avvio per una **nuova carriera v0.2**, mantenendo i salvataggi storici 1985–86 esistenti (non retrodatare i save). Impostare data e stagione in modo coerente, ID, calendario, classifica, `week` stagionale e `absoluteWeek` monotono con contratto economico `{week,absoluteWeek,seasonYear}`. Promozione coerente col 1979; non introdurre “Eccellenza”.
2. Un modello seed-stabile di mondo di gioco e club, con importatore per **100 comuni italiani verificati** (M1) dalla futura PR `data/oronzo-world-research` della revisione oraria. Il contratto importa ID, fonte/licenza, regione/macroregione e anno; **non generare ora un finto dataset di 100 comuni verificati**. Se la PR dati non è ancora pronta, prevedere fixture demo chiaramente etichettata e un gate che impedisca di dichiarare M1 completata.
3. Conservare ID canonici dei club, presidenti, calciatori, `player.visual` (tratti come carnagione/capelli/barba/baffi, se disponibili), `club.visualKits` e kit associato; evitare rigenerazioni in save/load, cambi squadra e avanzamento anno. Per visual legacy mancanti adottare default stabiliti da 08/01, senza pretendere di implementare grafica nel 07.

### Passo B — offerte e onboarding
4. Consentire selezione dell'avatar coach con 4 attributi (fortuna, leadership, autostima, pazienza), città d'origine e ID persistente; i **dati/funzioni di morale appartengono al 09**. Lato 07 preparare input/output documentati e preservare le scelte senza creare una seconda formula morale.
5. Generare esattamente **20 offerte iniziali** riproducibili da seed, di 20 club distinti e disponibili, con ID, categoria, località, cachet/condizioni, presidente e contesto; lista immutabile al reload prima della scelta. L'ingaggio singolo è idempotente e cambia club/contratto/stato una volta. La valutazione e l'applicazione di morale devono chiamare l'API 09 quando disponibile; **se manca, dichiarare la dipendenza bloccata**, senza valori arbitrari o pretendere che la morale sia già integrata.

### Passo C — API di game-flow consumabili da 03
6. Implementare in `oronzo/app/flow/` un'interfaccia semplice, testabile ed esplicitamente documentata: `newGame`, `loadGame`, `listInitialOffers`, `acceptOffer`, `getStateForUI`, `getRosterPlayer`, `getTrainingPlayer`, `prepareMatch`, `consumeMatchResult`, `answerOpeningPress`, `answerPostMatchPress`, `advanceMatchday`, `saveGame` (nomi/shape finali da esporre nel REPORT). I metodi non devono inventare cambi di morale/stampa/finanze: 04 fornisce contenuti, 09 applica gli effetti **una volta sola**.
7. La composizione dei dati deve esporre le schermate **Rosa e Allenamento** con la *stessa* identità di `playerId` e il kit corrente, secondo `AppearanceV1` nel `CONTRACT-v02.md`; nessuna generazione separata per UI o cutscene. Esportare dati e interfacce verso 03; non creare HTML.
8. Usare **Match Engine 06** quale autorità sui risultati della partita giocata: adapter fixture/rose, conversione snapshot + eventi `goal` in `registerResult` (score coerente). Per gli incontri non controllati dal mister, progettare un provider simulativo deterministico esplicitamente documentato e separato; mai chiamare giocata una gara con esito artificiale 0–0 della fixture di test. Mantenere avanzamento solo se ogni risultato del turno è valido. Non alterare engine né camera (05). L'1× della versione finale deve rappresentare **90 minuti simulati in circa 15 minuti reali**; il controller può esporre velocità/tempo, senza cambiare di nascosto la scala attuale dell'engine.
9. **Ordini individuali temporaneamente fuori dal gate R03** finché #31/08 + #35/06 non sono compatibili sul contratto shout; il flusso base può avere formazione, tattiche e partita. Non duplicare bonus temporanei/persistenti. La cutscene 02 è overlay opzionale, non gate per il ciclo dati.

## Verifiche obbligatorie / limiti
- Eseguire **Node nativo** dei test propri, Career e Coach-Club su main aggiornato e contro il nuovo adapter; assicurarsi che gli ex 77 test continuino a passare. Test di 20 offerte deterministiche, accettazione una sola volta, ID persistenti, nuovi save 1979 e salvataggi legacy 1985, payroll una sola volta/periodo, due stagioni/reload, campionato senza risultati duplicati, salvataggio con personaggi/kit stabili.
- Scenario automatico **end-to-end del controller** con seed fisso; reportare separatamente lo scenario realmente completo e gli hook bloccati da API 09, #31/#35 o dataset. Falsi mock/stub sono ammessi SOLO nei test unitari e dichiarati, mai per dichiarare gioco pronto.
- Non introdurre regressioni in finanza/presidenza né in save recovery V1/V2 già validati. Se nuovo formato save necessario, schema/versioning e migrazione conservativa. Documentare cronologia 1979 senza far passare il vecchio demo 1985 per nuova carriera.
- Scrivere `oronzo/coordination/07-career/REPORT.md` nel **nuovo branch**, con file, commit, test PASS/FAIL realmente svolti, API per il 03, dipendenze residue per 09 e gate. Aprire **una sola PR** dedicata a `main`, non mergiare. Se la prima tranche non copre tutto, dare un controller verticale funzionante e riferire chiaramente ciò che resta.

## Dipendenze e confini
- **09:** valuta/applica morale e rapporti, presidenti, finanze, game over a morale 0. Il 07 espone e consuma API 09; non riscrive formule di 09.
- **03:** UI 16:9, navigazione, interazioni e rendering; PR runtime separata in seguito, non deve bloccare i test headless del 07.
- **06/08:** loro ownership di match engine e PlayerV2. Ordini shouts avanzati differiti finché il loro contratto non è verificato.
- **01/02/05:** sprites, cutscene, camera; nessuno di questi modifica la persistenza di calciatori da 07.
- **Dati world M1:** l'automazione oraria è unica responsabile della ricerca. Il 07 ne predispone importazione ma **non** crea dataset non verificati.

**Priorità all'esecuzione:** partire da un loop minimo verificabile (1979, 20 ingaggi, scelta squadra, giornata/save/load), consolidare contratti, poi collegare ulteriori passaggi nei confini descritti. Nessun round generale necessario.

---

## ARCHIVIO — ISTRUZIONI DEL CICLO R02/R05 GIÀ COMPLETATO
Il testo seguente appartiene al periodo **anteriore ai merge #30/#32**; qualsiasi divieto R03 o stato di bugfix elencato qui è **storico e superato** dal NEXT READY sopra.

# NEXT — ORONZO AGENTE 7 · CORREZIONI DA AUDIT R02

**Stato:** `WAIT_REVIEW` — fix R05-1 consegnato nella PR #30, in attesa QA combinata.
**Incarico:** secondo ciclo, correzioni e test di compatibilità documentate dal Coerentizzatore.
**Origine:** [Rapporto Work R02](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/coerentizzatore/REPORT-R02.md), mergeto su main commit `7212806be066c971a5479df162a2e60816fb1fcd`.
**Precedente PR:** #14, merge `bb9e3847`.
**Scope modificabile:** `oronzo/systems/career/` e il tuo `REPORT.md`.

## Azioni autorizzate
Riparti dall'ultimo `main` in un nuovo branch di ciclo `agent/oronzo-career-r02`. Implementa e testa:
1. **R02-1: migra e assegna ad ogni club un `presidentId` canonico fra quelli del catalogo copy, con assegnazione deterministica per seed e stabile attraverso save/load e cambio stagione. Per >8 club documenta riuso di profili/istanze; non riassegnare a ogni avvio.**
2. **R02-2: mantieni obiettivo canonico persistito e aggiungi mapping esplicito compatibile con il board; le soglie della carriera non devono essere alterate dal fallback.**
3. **R02-3: assegna contratti ITL con `weeklyWage` non nullo e realistico per divisione/giocatore, verifica wageBudget e persistenza/migrazione delle rose esistenti.**
4. **R02-4: porta un `absoluteWeek` persistente attraverso le stagioni, sufficiente a distinguere i retry e garantire deduplicazione settimane tra stagione 1 e 2.**
5. **R02-5: preserva `employmentHistory`, `hiredSeason` e stato contrattuale del mister; evita round-trip perdenti tramite createCoach e schema coerente con agente 9.**

## Coordinamento
L'altro agente (07/09) lavora su API/contratto complementari. Non modificare il suo codice. Se serve un adapter condiviso, documenta precisamente input/output e proprietà dello stato in `integration-notes.md`; il runner centrale sarà costruito dall'orchestratore. Il catalogo `oronzo/content/presidents.json` è autorevole e già su main; non duplicare i presidenti.

## Verifica/accettazione
- Test nativi Node; includere almeno un test incrociato con **due stagioni** e salvataggio/ricarica.
- Presidenti stabili con ID esistente; board e testi dello stesso presidente; obiettivi equivalenti; payroll > 0 per club con contratti, niente spese negative; settimane del secondo anno accettate una volta sola; esonero senza TypeError dopo save/load.
- Conserva le API precedenti dove possibile, segnala breaking changes.
- Scrivi `oronzo/coordination/07-career/REPORT.md` sul branch, apri PR a main, **non fare merge**.


---

## DIRETTIVA DI PRODOTTO v0.2 — DA ESEGUIRE SOLO DOPO MERGE DEL FIX R02
Fonte [visione 1979](../GAME-VISION-v02.md) e [epic #25](https://github.com/CzekUns/cercax/issues/25). **La priorità immediata rimane integralmente R02-1..R02-5 descritta sopra:** non allargare la PR `agent/oronzo-career-r02` con sistemi geografici o offerte prima che i 5 fix siano verificati e mergiati. La vecchia data 1985/86 è superata come visione di gioco; non cambiare storicità nel branch di bugfix.

**Futuro ciclo R03, da autorizzare con nuovo NEXT dopo merge R02:**
1. Parametrizza data reale d'inizio carriera nel **1979**, giornata e calendari, specificando la categoria storica della Promozione. Non chiamarla Eccellenza nel 1979 salvo scelta esplicitamente alternativa.
2. Crea import del mondo da **100 comuni italiani verificati per M1** (espandibili a **500** dopo il primo rilascio) con metadati verificabili (ISTAT/anno, fonte/licenza, regione, macroregione Nord/Centro/Sud, trattamento isole) e assegnazione deterministica alle squadre.
3. Genera **20 offerte di ingaggio iniziali** riproducibili per seed, cachet e società, persistendo lista e scelta; fornisci input geografico/economico al sistema morale agente 09, senza calcolare dentro career costi morali.
4. Calendario, classifica, transizioni, rosa e presidente persistenti; salvare stato RNG e data assoluta, test due stagioni e load senza rigenerazione delle offerte.

**Proprietà confine:** agente 07 possiede club/dati geografici, offerte e save; agente 09 possiede impatto sul morale e compatibilità caratteri; agente 10 collegherà i due sistemi alle schermate. Nessun lavoro su R03 finché non autorizzato.

### Fonti candidate per il futuro R03 (non implementazione e non prova di licenza)
- [ISTAT — codici e denominazioni dei comuni/regioni](https://www.istat.it/classificazione/codici-dei-comuni-delle-province-e-delle-regioni/).
- [ISTAT — bilancio demografico per comune e CSV](https://demo.istat.it/app/?i=P02&l=it).
- [ISTAT — serie censuaria anche storica 1951–2011](https://www.istat.it/statistiche-per-temi/censimenti/popolazione-e-abitazioni/risultati/): verificare anno e confini di riferimento prima di classificare i «500 comuni meno popolati» per un gioco ambientato nel 1979.


## PROPRIETÀ FUTURA AGENTE 07 — ADAPTER GAME-FLOW (non ancora autorizzata)
Dopo merge e verifica dei cinque fix R02, un ciclo ulteriore sarà assegnato allo stesso agente 07 per assemblare stato/avanzamento carriera e salvataggi collegando le API degli agenti 04,06,08,09 dentro `oronzo/app/flow/`. È il proprietario del **flusso dati di carriera**: Nuova/Carica, offerta, presidente, conferenza, calendario, prepartita, match, postpartita, morale, game-over, persistenza. Il 03, in ciclo distinto, realizza i menu e il collegamento UI. Non toccare `index.html`, `game.js`, `ui.css` o `partita-rapida.html`. Agente 10 scrive solo le regole e verifica le consegne. **Ora eseguire SOLO R02 e non sviluppare il bridge in anticipo.**

## Controllo orchestratore — ripresa parallela del 7 novembre 2026
**PRIORITÀ MASSIMA — FIX R02 NON CONSEGNATI.** Il branch `agent/oronzo-career-r02` è identico a main (0 commit nuovi); il REPORT su main riguarda solo il ciclo 01. Procedere *esclusivamente* ai cinque fix R02 del presente NEXT e test incrociati con 09: `presidentId` canonico, `seasonObjective` coerente, `contract.weeklyWage` non nullo, `absoluteWeek` oltre 2 stagioni, `employmentHistory`/`hiredSeason`/contratto dopo save/load ed esonero. Pubblicare PR R02 e REPORT con esito Node, fixture 2 stagioni e API di frontiera. **VIETATO partire ora con `oronzo/app/flow/`**: solo dopo verifica e merge delle PR R02 di 07 **e** 09 l'orchestratore autorizzerà in un nuovo NEXT il ciclo adapter/ingaggi/1979.

## R04 — CONSEGNA IN REVISIONE WORK 00
**PR:** [#30](https://github.com/CzekUns/cercax/pull/30). **Stato di merge:** NON confermato. Rapporto R02 presente sul branch della PR; testi precedenti READY sono archivio del lavoro autorizzato, non un invito a iniziare un altro ciclo.
**Gate di accettazione:** GATE P0: cinque fix R02 con 09 in checkout unificato; Node due stagioni, save/load, presidente/obiettivi/paghe/absoluteWeek/history. Dopo merge nuovo ciclo adapter solo con NEXT separato.
**Regola:** attendere review Work 00 e riassegnazione da Agente 10; solo correzioni sulla PR corrente se richieste, niente R03 autonomo.


## AGENTE 10 — RISULTATO R04 E PROSSIMO PASSO (7 novembre 2026)
**PR #30**, stesso branch `agent/oronzo-career-r02`. **Priorità P0, NON MERGIARE ora.** Audit Work 00: [REPORT-R04](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r04/oronzo/coordination/coerentizzatore/REPORT-R04.md), difetto **R04-1** riprodotto. Il salvataggio V1 con `finance.settledWeeks:[1]` può essere ricaricato, calcolare `absoluteWeek:1` e pagare **una seconda volta** perché l'09 usa la chiave `a:1`. In prova il saldo è sceso da 9.234.000 a 8.748.000 ITL per pagamento duplicato 486.000.
**Correzioni assegnate a 07:**
1. In `oronzo/systems/career/compat.js` e migrazione/salvataggi V1/V2, mappare con tracciabilità la versione del registro finanziario e del board: `settledWeeks`, `transactions`, verbali, promesse, cooldown, scadenze. La conversione dev'essere *una volta sola*, deterministica, persistita, senza cancellare lo storico.
2. Recuperare la stagione originaria quando documentata da save/stato; dove `week` legacy non identifica univocamente la stagione, segnalare **non migrabile automaticamente** e bloccare la ricontabilizzazione anziché indovinare. Coordinare col 09 una sola chiave periodo.
3. Estendere i test su envelope V1/V2 con checksum valido e dati reali su due stagioni, retry stesso periodo prima/dopo reload, meeting, promesse e pagamento senza doppio addebito. Test API con `{week:seasonWeek,absoluteWeek,seasonYear}`, non sostituire semplicemente il numero assoluto dentro `week`.
4. Aggiornare `REPORT.md` e la **PR #30 esistente** con SHA, test Node su branch combinato con #32, esiti PASS/FAIL e limiti. Niente nuova PR R03, nessun `oronzo/app/flow/` adesso.
**Prossimo ciclo PREPARATO ma NON AUTORIZZATO:** dopo merge e suite verde #30+#32, 07 avrà in `oronzo/app/flow/` il game-flow e l'import del mondo. Per MVP sono sufficienti **100 comuni verificati** raccolti dalla revisione oraria su `data/oronzo-world-research`; 500 comuni restano fase successiva. Importare fonte/provenienza/ID, non fare ricerca duplicata e non presentare i 100 come ranking certo senza prova.


## DIRETTIVA ATTUALE — DISPATCH R05 (7 NOVEMBRE 2026)
**Correzioni R04 consegnate nella stessa PR #30; attendere gate indipendente Work 00 R05.** HEAD osservato `f098b5474801171f55e451889eca8c65653000f3`: `migratePeriodLedgers`/schema del periodo v2, envelope legacy V1/V2 e test su 104 club/2 stagioni documentati nel REPORT. L'Agente 09 ha aggiornato #32. Prima di nuovo lavoro devono passare **insieme** su checkout Node completo, incluso `period-r04.test.js`, test anti-doppio pagamento payroll, test di migrazione indefinita, finance/board/coach storia, due stagioni/reload. Se 00 richiede correzione, **aggiornare questa PR #30**, non altra. **Niente game-flow su questo ramo.**

**ITERAZIONE FUTURA PREPARATA — NON AUTORIZZATA ORA:** dopo merge reali #30+#32 e test Node sul main, nuovo NEXT e PR distinta del 07 per `oronzo/app/flow/` + moduli career: inizio **1979** (Promozione storica), 20 offerte deterministiche, avatar e dati presidente veri da 09/04, mondo importabile M1 **100 comuni verificati** dalla PR ricerca dell'automazione (espansione 500 successiva), squadre/rosa/partite/classifiche/save persistenti, interfacce di comando/eventi verso 03 e input del motore 06. Controller no HTML/CSS/UI; nessun codice 03. Contratto #31/#35 sugli shout va chiuso prima dell'integrazione degli ordini, senza duplicare gli effetti 09. Risultato: primo loop dati testabile senza schermate.

## DIRETTIVA PUNTUALE POST-R05 — UNICO FIX R05-1 (7 novembre 2026)

**Stato operativo: `FIX_REQUESTED` — PR #30 esistente.** La [revisione R05, PR #37](https://github.com/CzekUns/cercax/pull/37), ha eseguito l'intera suite Node dei due HEAD #30/#32: **76 PASS / 1 FAIL**. I difetti R04 di ledger V1/V2, anti-doppio stipendio e test payroll 09 sono **superati**: non riaprirli senza regressioni nuove. Lo **unico errore residuo** è un test obsoleto dell'Agente 07, non un nuovo bug produttivo dimostrato.

**File esclusivo da correggere:** `oronzo/systems/career/tests/r02-cross.test.mjs`, test “R02 career + real Agent09 finance: two seasons, salary, saved absolute weeks and retries”, soprattutto righe 16–45 sul HEAD `f098b5474801171f55e451889eca8c65653000f3`.

1. Sostituire `const period = s.absoluteWeek` usato come parametro `{week:period}` con `{week:s.week, absoluteWeek:s.absoluteWeek, seasonYear:s.seasonYear}` passato in ogni `settleWeek` e retry.
2. Registrare `allKeys` come valori numerici `absoluteWeek`; controllare `settledWeeks` come `'a:'+period.absoluteWeek` anziché numeri legacy.
3. Aggiornare le verifiche sul rollover: su un ledger moderno la chiamata con solo `week` deve restituire `period_migration_required`; la nuova settimana con i tre campi dev'essere accettata una volta e rifiutata al retry.
4. Mantenere INTEGRI test su contratti reali, paghe, 104 club/2 stagioni dove previsti, save/load, nessun doppio addebito. I casi legacy restano nella suite di migrazione dedicata; non abbassare il guard del 09 per far passare il test.
5. Eseguire `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js` sui moduli combinati #30+#32 **se tecnicamente possibile**; non dichiarare PASS per prove non eseguite. Aggiornare `oronzo/coordination/07-career/REPORT.md` e **la stessa PR #30**, con commit, file e pass/fail. **Non creare un'altra PR e non iniziare game-flow R03.**

**Gate successivo:** dopo la consegna del fix, il revisore 00 può testare soltanto il nuovo HEAD di #30 con #32 invariata e procedere al merge condizionato **solo con nuova autorizzazione esplicita dell'utente**. 09 attende; non richiedere all'intera squadra un nuovo round.

## PASSAGGIO DI CONSEGNA R05-1 — IN ATTESA REVIEW (7 novembre 2026)

**Stato attuale: `WAIT_REVIEW`.** L'Agente 07 ha pubblicato nella [PR #30](https://github.com/CzekUns/cercax/pull/30) la correzione mirata a `oronzo/systems/career/tests/r02-cross.test.mjs`; HEAD osservato `1fb92d5c249270dced1e18414ef70c022bf68722`, SHA test `586e6856910196965172e9488ff3bee8b839ee74`. Il REPORT del branch dichiara **2/2 PASS V8** sui moduli 07/09, `node --check` PASS sul file del test; **la suite Node combinata completa non è stata ancora rieseguita sul nuovo HEAD**. 
**Azione:** nessuna modifica ulteriore del 07 salvo esito di review negativo. Il Coerentizzatore 00 deve verificare su HEAD reali #30+#32 il comando `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js`; se supera interamente e non si aprono altri P0/P1, può raccomandare merge / eseguire i due merge **solo con autorizzazione esplicita utente per l'incarico mirato**. Dopo merge e test su main, 10 potrà autorizzare separatamente il nuovo ciclo `oronzo/app/flow/`. Non iniziare ora nuovi moduli o il filone identità visiva.

## STATO AGENTE 07 — CONSEGNA R03 E AUDIT R06 (7 novembre 2026)
**PR #38 OPEN, HEAD `94538ae97b3f7423a7d1e691a2e493524556142f`, lavoro R03 CONSEGNATO**, non più READY da iniziare. Controller 1979/20 offerte/partita headless pubblicato; test Node combinati dichiarati **non eseguiti** nel REPORT. La PR #39 del 09 è stata consegnata (HEAD `80df15139d37c4ee36103001d6a24528037daed4`). Il 09 segnala che per rendere reali gli effetti degli ingaggi e delle conferenze il controller 07 deve collegare `createCoach`, `previewOfferMorale`, `applyOfferEffect`, `applyPressEffect`, invece di mantenere `awaiting_agent09` nei normali percorsi.
**Stato operativo attuale: `WAIT_REVIEW`**. Attendere rapporto indipendente R06 del 00 su #38+#39, poi eseguire eventuali correzioni SOLO nella stessa PR #38 e nel proprio REPORT, senza nuova PR né modifica a codice 09. Non dichiarare gioco/browser pronto prima del gate. L'identità visiva condivisa resta requisito da preservare, non deve interrompere l'eventuale fix P0 di integrazione.
