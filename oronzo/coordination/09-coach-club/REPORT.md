# RAPPORTO ORONZO-AGENT-09 — R10 · Gestionale profondo v0.2

**Stato:** PR_OPEN · FIX R10-W2-01 CONSEGNATO · NUOVO AUDIT RICHIESTO · NON MERGED
**Repository:** CzekUns/cercax
**Branch:** `agent/oronzo-coach-club-r10-management`
**Pull Request:** https://github.com/CzekUns/cercax/pull/57
**Base:** `e7c37fa838e08bf352fa43e943b314d7856155c3` (main verificato al checkout)
**Issue storica:** https://github.com/CzekUns/cercax/issues/11
**Data:** 9 novembre 2026, Europe/Rome

## Fix P0 R10-W2-01 — SyntaxError in PR #57 (9 novembre 2026)

**Origine:** audit indipendente [PR #58, REPORT-R10-WAVE2.md](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r10-wave2/oronzo/coordination/coerentizzatore/REPORT-R10-WAVE2.md). **PR corretta:** [#57](https://github.com/CzekUns/cercax/pull/57), branch invariato `agent/oronzo-coach-club-r10-management`; nessun merge.

### Codice corretto e pubblicato

- `oronzo/systems/coach-club/presidents.js:44`: eliminato un token letterale `\\n` fuori stringa da `presidentBehavior`, ora esiste un vero ritorno a capo JS. Commit `7c5afbc740da7aa6fbcde3f30a6c62dd984627ef`.
- `oronzo/systems/coach-club/negotiations.js:29,81`: eliminati altri due `\\n` letterali fuori stringa da `reviewTransfer` e `decideSale`, invariata la logica papponeria. Commit `a2df6eb216debea547f9592f8c96fe485c1cb0bd`.
- Creato `oronzo/systems/coach-club/syntax-r10.test.js`: test di regressione Node che esegue `node --check` nativo su entrambi i file, poi importa `./index.js` dell'Agente09 e `../../app/flow/controller.js` reale dell'Agente07. Commit `3b5cccf4f0ea8b0af051db9dd08fdc9ed2adecee`. Questo test è ora sulla PR, **non è stato eseguito fino in fondo** in questo container privo di checkout: serve eseguirlo nel gate Git combinato.

### Verifiche eseguite e risultati osservati

1. Sorgenti riletti **dalla PR #57 dopo l'update**, confrontati con i file locali usando `git hash-object`. Hash autentici coincidenti: `presidents.js=2406941e21f4c0051bfdb5a6633a6b72efdbb487`; `negotiations.js=e92375131e83fb64fba2f4b5b767ed0d75451e09`. Cercate tutte le sequenze testuali `\\n` in entrambi i file: **0** dopo la correzione.
2. **Node v22.16.0**, file byte-identici ai due blob GitHub: `node --check presidents.js` **PASS** e `node --check negotiations.js` **PASS**. Validati anche i blob originali di `core.js=fb4b00debfc66ab870b41880a67d1264939a725e`, `period.js=48b8cfa889d2650e71e5d63d5c78ddb1b2c9ff20`, `finance.js=88c0469e685d013df33503036b5bc66f051d6b18`.
3. **Node nativo**, `node --test targeted-fix.test.mjs` su quelle **cinque copie autentiche**, fixture di prova esterna alla PR: **7/7 PASS, 0 FAIL**. Verificati import funzionante, policy mercato con papponeria, `reviewTransfer` deterministico, `decideSale` persistente e idempotente, presidente canonico, payroll e settlement `a:1` (1979) / `a:40` (1980) con save/load e zero doppi addebiti. Questo non è il checkout completo: test mirati sui blob 09 con hash comprovati.
4. **V8 Code Mode, non Node**: caricati i veri 11 sorgenti GitHub della PR #57, inclusa la versione completa di `management-r10.test.js`. Eseguiti i **17/17 test gestionali PASS, 0 FAIL** mediante loader ESM in V8 e sostituto `structuredClone` per oggetti JSON; nessuna stub delle regole 09. È un ulteriore controllo sui blob autentici, ma **non** sostituisce `node --test` su checkout.
5. **Cross 06/07/08/09 in V8**, fonti PR #35 (`orders.js`), #31 (`player-model.js`), #56 (`m1-contract.js`), #57 (`shouts-r10.js`): generato `persistentSuggestion` reale dal 06 per PlayerV2 normalizzato 08, `journalM1Shouts` ha registrato **1 pending**, `reconcileM1Shouts` con `persistShout` 09 ha applicato **1** aggiornamento `coachTrust:50→52`. Dopo serializzazione JSON, un nuovo reconcile ha applicato **0** effetti; nuovo journal ha registrato **0** duplicati. Il modificatore temporaneo dell'Engine06 è rimasto intatto e non è stato aggiunto ai dati permanenti. **Cross-firma e replay PASS in V8**, **non ancora test combinato Node sull'albero Git autentico**.

**Limitazione verificabile:** il container non può clonare la repository (`git ls-remote https://github.com/CzekUns/cercax.git HEAD` → `Could not resolve host: github.com`). Quindi `node --test oronzo/systems/coach-club/*.test.js`, la nuova `syntax-r10.test.js` fino all'import di Career07 e lo smoke ESM dell'HTML autentico **non sono stati eseguiti su checkout Git** in questa sessione. Non attribuire a questi ultimi un PASS. Richiesto all'auditor00 un re-run combinato con HEAD aggiornato della #57 e degli agenti #31/#35/#56. Il diverso blocco R10-W2-02 nella PR #56 (giornate senza partita) appartiene al 07.

### API e perimetro

Nessuna firma modificata: `presidentBehavior`, `reviewTransfer`, `decideSale`, `persistShout({key,event,coach,club})` rimangono identici; sono cambiati solo i tre separatori di riga e il test anti-regressione. Solo scope `oronzo/systems/coach-club/` e questo REPORT. PR aperta, **mai mergiata**. Il nuovo HEAD va verificato dalla PR dopo questo aggiornamento documentale.

---

## Implementazione reale — R10

- **`management-r10.js`**, nuovo: `initializeManagement` conserva profilo canonico e proprietà gestionali di club, `boardTraits.papponeria`, spendingWillingness e fanAttachment. Parametri derivati una sola volta dai sette tratti autentici del profilo di Copy04 (quando non forniti e salvati dalla carriera), con validazione 0–100. `coachPresidentCompatibility` usa leadership, autostima, pazienza del mister contro carattere del presidente. `recommendTicketPrice` e `presidentTicketFloor` dipendono concretamente da papponeria e ultimi risultati autentici. `setTicketPrice` salva una sola scelta per periodo e il presidente può rifiutare un prezzo troppo basso. `settleHomeAttendance` esige fixture casalinga effettiva registrata via `reviewMatch`, ricostruisce affluenza da capienza/condizione/tifosi/risultati/prezzo, accredita entrate via `finance.book`, aggiorna approvazione tifosi, fiducia del board e morale coach tramite `applyCoachMoraleEvent`, con ledger `fixtureId` idempotente.
- **Percorso B:** `submitPresidentRequest` registra richieste `pending` senza addebiti anticipati; `decidePresidentRequest` valuta cassa, arretrati, riserva per salari settimanali e altri mandati mercato, compatibilità caratteriale, disponibilità alla spesa, attaccamento sportivo e papponeria. Motivazioni codificate `approved`, `unpaid_liabilities`, `insufficient_cash`, `payroll_or_mandate_reserve`, `president_policy_rejects`. Spesa reale se `stadium_repair` o `training_facilities`; l'ultimo salva `management.trainingQuality`, che attende adapter con 07/08. Un `market_mandate` è un'autorizzazione **non contante** e viene consumato solo all'acquisto firmato. Effetti del giudizio persistono in relazioni, board e morale mister.
- **`market-r10.js`**, nuovo: `requestTransferInWindow`, `reviewTransferInWindow`, `negotiateTransferInWindow`, `finalizeTransferInWindow` e corrispondenti API per vendite; falliscono senza oggetto finestra autentica consegnato da 07, senza stagione compatibile, con mercato chiuso o senza mandato del presidente. Si riutilizzano `negotiations.js` e i veri controlli di prezzo e salario.
- **`shouts-r10.js`**, nuovo: `persistShout({key,coach,club,event})` interpreta soltanto `persistentSuggestion` di un autentico evento `coach_shout` del 06, firmato `temporaryOwner:'match-engine-06'` / `persistentOwner:'coach-club-09'`. Modifica una volta `player.relationships.coachTrust`, mirror `relationshipWithCoach`, `coach.relationships.playerTrustById` e morale se dichiarato, senza riprodurre i 150 secondi di bonus del motore. Il ledger `club.management.shouts[key]` persiste; replay identici ricevono ack true/no-op, replay contraddittori errore.
- **`club.js`**: `createClub` ora conserva senza azzeramenti `stadium`, `supporters`, `boardTraits`, `management` da vecchi e nuovi salvataggi.
- **`negotiations.js`**: acquisti/vendite propagano `{week,absoluteWeek,seasonYear}` a `book`; mercato esistente ora riceve `papponeria` anche nella policy di approvazione e nelle cessioni, con V1 invariato quando assente.
- **`presidents.js`**: `presidentBehavior` modula chance mercato con papponeria quando presente (senza alterare i precedenti V1 che ne sono privi).
- **`index.js`**: re-export delle nuove API. **`MANAGEMENT-R10.md`**: contratto esatto per 07, 12, 06, 08.

**Scope verificato:** nove file di codice, documentazione e test, tutti in `oronzo/systems/coach-club/`, più questo REPORT. Nessun `NEXT.md`, `RUN.md`, UI, Engine06, Attributes08, Career07 o file di root toccato.

## Percorsi effettivamente esercitati

**A:** scelta 3.500 ITL → prova casalinga `fixture.id` verificata in `club.board.results/lastMatchIds` → affluenza calcolata nel limite della capienza → `finance.book` accredita esattamente biglietti × affluenza → variazioni `supporters.approval`, `boardTrust` e `coach.morale` → JSON save/load → stesso match respinto `already_settled`.

**B:** richiesta `stadium_repair` da 100.000 ITL → approvazione motivata di presidente canonico con spesa reale → diminuzione esatta di `finance.cash`, incremento stadio/tifosi/rapporto board/morale → JSON save/load → retry `already_decided`. Provati rifiuti per papponeria elevata, debiti e liquidità; nessun denaro creato da semplici promesse.

**Mercato e shout:** mandato presidenziale prima di richiesta, guard finestra 07 aperta/chiusa/stagione sbagliata, dirigente/presidente negoziano un calciatore, bonifico via `book`, contratto/paga verificati, cessione con incasso solo se compratore accetta. Verificato anche il rifiuto `career07_seller_release_required` prima della firma e l'accettazione dopo asserzione di rilascio dal 07. Shout del 06 con trust +2 aggiornato una volta; i temporanei non vengono toccati.

## Verifiche realmente eseguite

- **Node v22.16.0**, dalla directory locale `/mnt/data/oronzo-r10-local`: `node --test management-r10.test.js` → **17 test PASS, 0 FAIL**, osservati il 9 novembre 2026. I test coprono i due verticali, compatibilità/papponeria, prezzo minimo, fallimenti dati non autorevoli, replay, salvataggio/ricaricamento, due stagioni assolute `a:1` / `a:40`, stipendi/arretrati, guard dei registri legacy, acquisto/vendita con finestre, eventi individuali del 06 e game over.
- Verifica che il codice testato corrisponde a quanto pubblicato: `git hash-object` dei cinque file nuovi locali **uguale** ai blob SHA GitHub letti dal branch:
  `management-r10.js=55d9936c46fe80c07963ca66c78d78159e21cf20`;
  `market-r10.js=b60da93b13481809af93c57fcd02550f6b9de974`;
  `shouts-r10.js=70fb78ee415ce4f69453762ff40e2a5627482300`;
  `management-r10.test.js=12bb129aa2fdfe1c7693869ccec46afd3a079470`;
  `MANAGEMENT-R10.md=1a9809dc98a017d03b2fc7b9415c5a5106a97bb1`.
- **Limite dell'ambiente:** impossibile clonare la repository dal container (`git ls-remote https://github.com/CzekUns/cercax.git HEAD` → `Could not resolve host: github.com`). I 17 test sono stati rieseguiti dopo la correzione sellerRelease (17 PASS/0 FAIL) e sono Node **reale su nuovi file identici** e copie locali dei moduli esistenti: `finance/period/core/negotiations` ricopiano le API e logiche del main, mentre `coach-model/presidents/morale` sono un harness ridotto per gli import. Sono dunque **test di modulo con dipendenze locali**, non la suite autentica del checkout intero. I nuovi test sono committed e potranno essere rieseguiti dal revisore sul vero sorgente GitHub.
- **Non eseguiti**: `node --test oronzo/systems/coach-club/*.test.js` della checkout reale con R03+R10, unificazione #31/#35/#56 e Chromium HTTP. Nessuna affermazione di disponibilità immediata nella UI.

## Dipendenze precise di integrazione

1. **07 / PR #56 (OPEN):** passare `persistShout` come callback a `journalM1Shouts/reconcileM1Shouts`. Il port usa `key=fixtureId:eventId`, restituisce `{accepted:true,coach,club}`, salva i due oggetti atomici. **Non** riapplicare un effetto temporaneo Engine06 già gestito. In `advanceMatchday`, dopo autentico `reviewMatch`, 07 deve chiamare `settleHomeAttendance` una volta per fixture casalinga, persistendo stato. 07 deve fornire `club.stadium` con capienza, condizione, prezzo iniziale **espliciti** (09 non inventa stadi), e autentici oggetti `marketWindow:{source:'career-07',id,open,seasonYear}` basati sul proprio calendario. `trainingQuality` per 08 richiede un successivo adapter documentato.
2. **06 / PR #35 (OPEN):** emettere come già previsto `coach_shout` con `temporaryOwner,persistentOwner,persistentSuggestion`; il bonus temporaneo resta esclusivo 06. Eventi privi di provenance sono respinti.
3. **08 / PR #31 (OPEN):** mantenere `player.relationships.coachTrust`, mirror `relationshipWithCoach`, e i contratti con `weeklyWage`. 09 aggiorna trust tramite 07 una sola volta.
4. **12 UI:** dopo merge e collegamento 07, leggere `stadium/supporters/boardTraits/finance/management.requests` e chiamare le API; niente pannelli UI finti o modifica del codice UI da 09.

## Rischi e missing

- Il **calendario mercato 1979** è di proprietà 07 e non è attestato: guardia chiusa fino all'oggetto finestra verificato; **nessuna data arbitraria**.
- Stadio iniziale non esiste nei club legacy: `stadium_data_required` impedisce incassi inventati. Capacità e condizione devono arrivare da dataset/configurazione confermata di gioco; non vanno presentate come stadi reali.
- Le formule di affluenza, prezzi, autorità del presidente, morale e costo lavori sono assunzioni iniziali di bilanciamento, documentate ed esposte in `MANAGEMENT_BALANCE`, **non valori definitivi approvati dal proprietario**.
- Nessuna UI, calendario, testo satirico nuovo, match/goal o stato di realizzazione del gioco proclamato. Le PR #31, #35, #56 hanno gate indipendenti prima della compatibilità integrata.

## Proposta di prossimo ciclo (soggetto ad Agente 10)

1. Cross-suite Node su checkout virtuale con le PR #31/#35/#56; test forte `coach_shout` reale → reconcile/reload → trust persistente una volta, e due stagioni con mercato e biglietti.
2. Integrare con 07 calendario/finestre autentici e dati di stadio espliciti, senza scorciatoie dal 09.
3. Affidare a 12 l'UI STADIO e UFFICIO PRESIDENTE con anteprime/reazioni/trasparenza su cash e cause.
