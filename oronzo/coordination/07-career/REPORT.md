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
