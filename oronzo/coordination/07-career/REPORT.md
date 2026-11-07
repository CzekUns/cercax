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
