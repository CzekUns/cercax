# RAPPORTO AGENTE 09 — Società, allenatore e presidenti — R02

**ID immutabile:** ORONZO-AGENT-09
**Stato:** PR_OPEN — fix R04-1/R04-2 consegnati; gate Node combinato con migrazione dell'Agente 07 ancora aperto
**Branch:** agent/oronzo-coach-club-r02
**PR:** https://github.com/CzekUns/cercax/pull/32
**Issue:** https://github.com/CzekUns/cercax/issues/11
**Base main al momento del branch:** c9f52a1c2f60733a6ae1e0b63180fa4b5d0f9697
**Precedente PR #17:** già integrata (merge 7309f1fe908e2e62b4304f44261d026d2866755c)
**Ultimo commit codice/documenti verificato prima dell'aggiornamento R04 del REPORT:** f199d0080b9523c4a9638fa60bb568761273acfe
**Data:** 7 novembre 2026 (Europe/Rome)
**Merge di questo ciclo:** NON eseguito

## Realizzato — i cinque fix dell'audit R02

1. **R02-1 Presidente canonico.** `presidents.js` espone `resolveClubPresident(club,catalog)` e `presidentMatchesClub(club,profile)`. `createClub(data,{presidentCatalog})` valida la presenza dell'ID nel catalogo di Copy 04; `reviewMatch`, `conveneBoard`, `reviewTransfer`, `decideSale` rifiutano profili diversi da `club.presidentId` (`president_mismatch`), senza alterare board o mercato. `answerBoardRequest` ricontrolla il presidente nel verbale. Il club non riassegna presidenti arbitrariamente; assegnazione seed-stabile e migrazione `president:*` competono all'Agente 07.
2. **R02-2 Obiettivi.** Nuovo `objectives.js` con mapper esplicito `topHalf -> top_half`, `avoidRelegation -> avoid_last`, `survival -> safety`, `title -> promotion` e spellings legacy validi. `reviewMatch` mappa l'obiettivo prima di calcolare le variazioni, mentre `createClub` preserva la stringa originale nel salvataggio Career per non rompere `seasonAssessment`. Obiettivi sconosciuti: `RangeError`, senza fallback `safety`.
3. **R02-3 Paghe.** `finance.js:weeklyPayroll` ora richiede `player.contract.weeklyWage` presente per **ogni** calciatore e somma con controllo degli interi sicuri. Zero è valido soltanto se contrattualizzato esplicitamente. `createClub` valuta il payroll sui dati in ingresso prima del clone, rispetta `wageBudget`; `settleWeek` mantiene stipendi, trasferte e bonus non pagati come arretrati senza cassa negativa. La generazione delle paghe per tutti i club di Career resta dell'Agente 07.
4. **R02-4 Periodi dopo rollover.** Nuovo `period.js` (`periodOf`, `samePeriod`, `ledgerEntry`) supporta `absoluteWeek` monotono o chiavi `seasonYear+week`; mantiene il vecchio `week` come compatibilità limitata V1. `settleWeek`, `endClubWeek`, `conveneBoard`, `answerBoardRequest`, `resolvePromises`, `applyClubEvent` usano chiavi stabili e impediscono doppie esecuzioni dello stesso periodo. Le promesse scadono con `dueAbsoluteWeek`, anche al confine stagione; eventi oncePerSeason distinguono la nuova stagione.
5. **R02-5 Cronologia mister.** `createCoach` preserva `employmentHistory`, `hiredSeason`, `contract.until`, ulteriori campi carriera e `contract:null` dopo esonero; sui vecchi oggetti inizializza `employmentHistory:[]`. Il campo `expiresSeason` non viene creato come seconda scadenza fittizia.

## File/API consegnati

- `oronzo/systems/coach-club/{period.js,objectives.js}` — due nuovi moduli.
- `oronzo/systems/coach-club/{presidents.js,club.js,board.js,finance.js,negotiations.js,coach-model.js,index.js}` — API aggiornate e re-export.
- `oronzo/systems/coach-club/compat-r02.test.js` — nove test aggiuntivi, inclusi catalogo reale e integrazione Career 07 multi-stagione.
- `oronzo/systems/coach-club/{README.md,integration-notes.md}` — limiti, proprietà e passi dell'adapter.
- Unica eccezione allo scope tecnico: questo `oronzo/coordination/09-coach-club/REPORT.md`.

## Verifiche effettivamente eseguite

- **Runtime JS V8**, caricati i file ES modules esatti dal branch GitHub e valutati con un loader di verifica degli import: `coach-club.test.js` + `finance-validation.test.js` = **23/23 passati**; `compat-r02.test.js` + `career.js`, `league.js`, `progression.js`, `save.js` da main + `content/presidents.json` originale = **9/9 passati** (totale **32/32**, errori 0). Il caso cross-module genera una carriera reale ridotta a due squadre per divisione, contabilizza una stagione, registra le partite tramite API di Career, esegue `finishSeason`, salva/carica con `serialize/deserialize`, ripete la settimana 1 del secondo anno e conclude con `applyBoardDecision('dismiss')` senza TypeError. L'adapter salariale/ID nel **test** è esplicito e non viene usato nel runtime.
- **Node v22.16.0**, comando `node --test check.test.js` nella copia locale `/mnt/data/oronzo-agent09-r02-node`: **4 test passati, 0 falliti** per `period.js`, `objectives.js` e `coach-model.js` con `core.js`. Blob locali verificati con `git hash-object` e identici ai blob GitHub: `core.js=fb4b00debfc66ab870b41880a67d1264939a725e`, `period.js=c9a747d1228d1d81b39b7ebc68a3d254baf88918`, `objectives.js=48fdc923ccd625421cac3c6c6be79b67ae8bc36d`, `coach-model.js=7f2c24b3ab75e4629afd05c77517d90c5689540a`.
- **NON eseguito**: `node --test` dell'intero repository/check-out completo, né browser Android. Il container non può clonare `github.com` (`Could not resolve host: github.com`). I nove test di `compat-r02.test.js` sono comunque registrati come suite nativa `node:test` nel repository, ripetibili da CI o checkout completa; l'esecuzione nel nostro ambiente è stata in V8, distinta da Node. I test della demo grafica non rientrano nel gate R02.

## Integrazione e dipendenze

- **Agente 07** deve creare/persistire `presidentId` canonici presenti nel catalogo, inizializzare o migrare `contract.weeklyWage` interi prima di passare le rose a 09, produrre `absoluteWeek` persistente e migrare vecchi registri `settledWeeks` numerici. I valori salariali e il numero di settimane vanno adattati al vero calendario della carriera; non passare a 09 due modalità temporali differenti per la stessa giornata.
- **Obiettivi in salvataggio:** conservare `topHalf`/`avoidRelegation` usati da Career 07; 09 traduce internamente in `top_half`/`avoid_last`. L'agente 07 dovrà validare anche i propri obiettivi, perché non va sostituita globalmente la stringa con la forma del board.
- **Aggiornamenti di stato:** le API 09 restituiscono nuove copie (`result.club`/`result.coach`); Career 07 muta lo stato, quindi il runner deve reinserire la copia prima del save. Per esonero, passare `reviewMatch().dismissed` a `applyBoardDecision` di 07.
- **Agente 04:** catalogo originale `oronzo/content/presidents.json` letto su main: 8 profili canonici validi. Il catalogo è di Copy 04, non duplicato in 09.
- **Agente 03:** deve leggere dati persistiti e costruire UI; R02 è solo modulo e demo diagnostica, non è collegato alla pagina partita né a `oronzo/game.js`.

## Problemi/limitazioni residue

- La carriera attualmente integrata su main può ancora fornire `president:*` non canonici e roster senza contratti finché l'Agente 07 non completerà il proprio ciclo R02; l'integrazione runtime è un gate condiviso, **non risolta unilateralmente da 09**.
- I vecchi record idempotenti con solo `week` vanno migrati da Career prima di essere usati con `absoluteWeek`, altrimenti non è possibile disambiguare la stagione originaria. Le promesse con data assoluta richiedono `absoluteWeek` anche alla risoluzione.
- Cambi di contratto senza `weeklyWage` generano un errore intenzionale per evitare calciatori pagati zero senza contratto; è una modifica di validazione al confine API.
- Le funzioni V2 1979/morale/avatar/papponeria sono **non implementate** perché esplicitamente rinviate dal NEXT a un ciclo successivo al merge R02.

## Proposta prossimo ciclo — non avviata

1. QA insieme a 07 su carriera completa con 24+ club, ID canonici, salari salvati e tutte le settimane di due anni, inclusa migrazione V1.
2. Dopo merge e nuovo NEXT READY: CoachV2 con morale e costo geografico degli ingaggi, papponeria e relazioni con stampa/tifosi, senza duplicare salvataggi o eventi.
3. Verifica sul browser Android landscape del flusso prodotto assemblato da 07/03 dopo gli appositi gate.

**Nessun merge autonomo eseguito; PR R02 in consegna all'orchestratore.**

## Aggiornamento R04 — correzioni richieste dall'Agente 10 (7 novembre 2026)

**Audit di riferimento:** PR #36, `oronzo/coordination/coerentizzatore/REPORT-R04.md`; difetti R04-1 (payroll duplicato con `settledWeeks:[1]`→`a:1`) e R04-2 (aspettativa 1.600 ITL obsoleta). Questo è un aggiornamento **della PR #32 esistente**, senza R03 né merge.

### Modifiche concrete

- **`period.js`**: nuovi export `periodDomain(key)`, `periodLedgerError(club,period)`. Tutti i record finanziari e societari con valenza di periodo devono usare **un solo dominio** (`absoluteWeek`/chiavi `a:N`, oppure anno+settimana/`s:YYYY:w:N`, oppure legacy numerico). Un record legacy/misto/impossibile da datare causa `period_migration_required`, senza convertire a intuito le settimane; `samePeriod` rimane il comparatore esatto. Il gate include `settledWeeks`, transazioni, risultati, meeting/media/eventi/dismissal, promesse e cooldown.
- **`finance.js`**: `settleWeek` verifica il dominio prima di incassare sponsor o addebitare paghe; restituisce `accepted:false,reason:'period_migration_required'` senza mutazioni. `book` blocca con errore esplicito una contabilizzazione positiva nel dominio misto, lasciando i rifiuti per fondi insufficienti no-op. `initializeFinances` ora conserva `finance.cash` salvato, lo valida e sincronizza `budget` a quello stato (non rigenera il budget iniziale); preserva `arrears`, `settledWeeks` e transazioni.
- **`board.js`**: gli ingressi `reviewMatch`, `conveneBoard`, `answerBoardRequest`, `applyClubEvent` verificano il ledger prima di aggiungere risultati, verbali o eventi. `resolvePromises` lancia un errore di migrazione prima di accreditare una promessa legacy non databile; `endClubWeek` eredita il rifiuto di `settleWeek`.
- **`compat-r02.test.js`**: rimosso l'adapter di test che assegnava artificiosamente stipendi a 100 lire e ID presidente uniformi. Il test ora usa **i contratti e i presidenti realmente prodotti dal branch R02 dell'Agente 07**, ricava `contractPayroll` dai giocatori e lo confronta con `weeklyPayroll`. Nessun cambio gameplay finalizzato a soddisfare la vecchia asserzione da 1.600 ITL.
- **`period-r04.test.js` (nuovo)**: 9 regressioni native `node:test` per replay stipendio legacy, verbali/eventi/promesse, dominio misto, migrazione di prova interamente tracciata, saldo e storico preservati, envelope V1/V2 con checksum e **104 club x due stagioni** con save/load, 76 periodi, presidenti stabili, retry, cassa non negativa ed esonero.
- **`README.md` / `integration-notes.md`**: documentato il contratto dati esatto richiesto a 07 per la migrazione, i rifiuti e i test.

### Verifiche nuove effettivamente eseguite

1. **Node v22.16.0 reale**, comando `cd /mnt/data/oronzo-r04-node && node --test verify-r04.test.js`: **10 PASS / 0 FAIL**. I tre moduli di produzione del test locale sono **SHA-identici** ai blob GitHub della PR #32: `core.js=fb4b00debfc66ab870b41880a67d1264939a725e`, `period.js=48b8cfa889d2650e71e5d63d5c78ddb1b2c9ff20`, `finance.js=88c0469e685d013df33503036b5bc66f051d6b18`. Verificati con `git hash-object`; compresi `node --check` sui tre moduli. `verify-r04.test.js` è una fixture locale mirata, NON spacciata per la suite GitHub completa.
2. **Runtime JS V8** con import ESM risolti sui sorgenti reali scaricati dalle PR #30/#32: `coach-club.test.js` **14/14**, `finance-validation.test.js` **9/9**, `compat-r02.test.js` **9/9**, `period-r04.test.js` **9/9**: **totale 41/41, zero fallimenti**. Lo scenario esteso in `period-r04.test.js` è stato rieseguito dopo il commit.
3. **Cross-module V8 indipendente**: `newCareer({},42)`, **104 club**, **2 stagioni**, **76 periodi distinti**, contabilizzazione del monte salari una sola volta per ogni club/periodo, deduplica meeting, save/load di tutte le finanze a ogni giornata, ID presidente invariati, cassa/arretrati mai negativi e `applyBoardDecision({type:'dismiss'})` dopo il salvataggio senza TypeError. Le partite usano esiti artificiali 0-0 validati da Career, **NON** il Match Engine 06. Test della logica modulare, **NON** prova di runtime/UI Android.
4. **Non eseguito**: comando Node nativo della suite **combinata completa** `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js` in una checkout unica dei due branch (il container non risolve `github.com` per il clone). Questo gate rimane da verificare all'integrazione CI/revisore, senza dichiararlo PASS. Non eseguita QA grafica/Android.

### Esito e vincoli per l'integrazione

- **R04-1 è bloccato in sicurezza dal lato 09**: un save pagato con `settledWeeks:[1]` non può pagare di nuovo con `absoluteWeek:1`, e non subisce perdita di cassa quando rifiutato. Il rifiuto è **`period_migration_required`**, quindi non equivale alla migrazione riuscita.
- **R04-2 è corretto nei test**: lo stipendio atteso proviene dalla rosa e dal contratto reale dell'Agente 07.
- **Pendenza P0 esterna:** Agente 07, PR #30, deve ancora convertire in modo verificabile `settledWeeks`, transazioni, verbali, promesse, eventi, date/cooldown e vecchi envelope V1/V2 senza inventare la stagione originaria. In assenza di dati affidabili il nuovo guard rifiuta, non accetta né paga una seconda volta. Non modificato un solo file di 07.
- **Compatibilità:** per ogni chiamata 07 deve passare `{week:state.week,absoluteWeek:state.absoluteWeek,seasonYear:state.seasonYear}` e scrivere nuovamente `state.clubs[index]=result.club`. Un caller che usa il vecchio solo `week` all'interno di un ledger già modernizzato verrà bloccato. `book`/ `resolvePromises` possono ora lanciare `period_migration_required` a fronte di dati legacy: controllare e mostrare un messaggio di conversione necessaria; non catturarlo e proseguire.
- **Gate merge ancora aperto**: prova Node completa dopo la migrazione 07 e verifica dei due HEAD più recenti da parte del Coerentizzatore/Agente 10. Nessun merge da 09; nessun sviluppo CoachV2/morale/papponeria/shouts R03.

### Commit R04 principali

- `0ef2472622821cc0b6cb7b16fea1b8d01f90b987` — `period.js`.
- `e3a168119858b590136e159351c953eaee261ee0` e `a2477654fe23a5123cb6a23f4f10a81111c33d92` — `finance.js`.
- `ae186c027e676c19456723c8acb4eb00bfbb4d4e` — `board.js`.
- `c79f1b8d7ffa0f957d58b25c942109d03b8a0370` — `compat-r02.test.js`.
- `48bb27d8832736b9596e044860076ffef31755ec` e `1148b60596e5e2cd39cd5793fe1a34feb6982e69` — `period-r04.test.js`.
- `74dec758fa23c276404f0259862c50e6cc80a3ea`, `01560111691ab26b074bf111ee9cd3939096232c`, `f199d0080b9523c4a9638fa60bb568761273acfe` — documenti.

**R04: correzioni di Agente 09 consegnate, PR #32 aperta per review. Migrazione storica 07 e QA Node combinata da completare prima del merge.**
