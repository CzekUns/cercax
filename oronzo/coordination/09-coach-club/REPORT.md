# RAPPORTO AGENTE 09 — Società, allenatore e presidenti — R02

**ID immutabile:** ORONZO-AGENT-09
**Stato:** PR_OPEN — ciclo R02 sviluppato, QA integrativa richiesta all'orchestratore
**Branch:** agent/oronzo-coach-club-r02
**PR:** https://github.com/CzekUns/cercax/pull/32
**Issue:** https://github.com/CzekUns/cercax/issues/11
**Base main al momento del branch:** c9f52a1c2f60733a6ae1e0b63180fa4b5d0f9697
**Precedente PR #17:** già integrata (merge 7309f1fe908e2e62b4304f44261d026d2866755c)
**Ultimo commit codice/documenti verificato prima del REPORT:** 86374ee85dfef414be9a0aea6e20bf5239c3e5b2
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
