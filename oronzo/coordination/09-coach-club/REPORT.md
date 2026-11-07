# RAPPORTO AGENTE 09 — Allenatore, società e presidenti — ciclo 01 / correzione R03

**ID:** `ORONZO-AGENT-09`  
**Stato:** `PR_OPEN` — correzione richiesta `ORZ-P1-008` consegnata; attende nuova QA dell'orchestratore  
**Branch:** `agent/oronzo-coach-club`  
**PR:** https://github.com/CzekUns/cercax/pull/17  
**Issue:** https://github.com/CzekUns/cercax/issues/11  
**Commit verificato prima del REPORT:** `032a1f7e33d9a120151e334fbbf6cb4127cc999b`  
**Data:** 7 novembre 2026 (Europe/Rome)  
**Merge:** NON eseguito

## Realizzato

### Prima consegna (già nella PR)
- `oronzo/systems/coach-club/coach-model.js`: `createCoach`, relazioni, reputazione, training plan.
- `coach-actions.js`: `prepareMatchday`, `coachCommand`, tattica e convocazioni senza simulare gol.
- `club.js`, `finance.js`: `createClub`, fiducia, staff, cassa in lire, sponsor, salari, trasferte, bonus, arretrati.
- `presidents.js`: `presidentBehavior(profile,state,seed)` deterministico, otto fixture di test con archetipi diversi e caricamento JSON del copy.
- `negotiations.js`: richiesta coach → approvazione DS/presidente → trattativa venditore → firma societaria, più cessioni autorizzate.
- `board.js`: risposta a risultati *forniti* dal motore, fiducia, possibile esonero, interferenze negoziabili, promesse, cooldown eventi.
- `coach-club-demo.html`, `README.md`, `integration-notes.md`, `coach-club.test.js`: demo diagnostica landscape, documentazione e 14 casi base.

### Correzione ORZ-P1-008 richiesta dal NEXT.md del 7 novembre
- `oronzo/systems/coach-club/finance.js`: validazione esplicita e centralizzata di tutti i flussi monetari, controllo dei **totali** (cassa, arretrati, payroll) entro `Number.MAX_SAFE_INTEGER`. I valori vengono validati **prima** del clone JSON, perché `JSON.stringify(NaN|Infinity)` converte in `null`; ciò impedisce l'accettazione involontaria di input non finiti. `book()` rigetta entrate/spese negative e gli overflow; `settleWeek()` verifica bonus, altre entrate, sponsor, trasferte, saldo e salari, con invarianti di cassa.
- `finance-validation.test.js`: **9 nuovi test** di regressione, con input negativi, null, booleani, frazioni, NaN, Infinity, stringhe, overflow, inizializzazione, contabilizzazione settimanale e arretrati.
- `README.md`: numero dei test aggiornato a 23 e descritte le verifiche di sicurezza monetaria.
- `integration-notes.md`: differenze puntuali fra Club/Coach del nostro modulo e la PR carriera #14 e dipendenza dal catalogo copy #13.
- **Precisazione tecnica sulla segnalazione:** già nella versione precedente `core.js:integer()` vietava `value<0`, e `finance.js:book()` la chiamava: l'esempio `amount:-100` non riproduceva l'aumento della cassa nel codice effettivo. Il fix affronta comunque il controllo dei totali e un caso reale nuovo di validazione prima del clone JSON.

## Verifiche effettivamente eseguite

1. **Node v22.16.0**, copia locale dei file `core.js`, `finance.js`, `finance-validation.test.js` identica ai blob GitHub (verificata con `git hash-object`):
   - comando `node --test /mnt/data/oronzo-agent09-check/finance-validation.test.js`
   - **9 passati / 0 falliti**; include mantenimento spese obbligatorie e arretrati.
   - SHA blob verificati: `core.js` `fb4b00debfc66ab870b41880a67d1264939a725e`, `finance.js` `618e77e63ef152d7c0959634f73b30351f6a56ab`, `finance-validation.test.js` `0e3cb0c84975ab314025af1f2cbc2597f63c59a9`.
2. **Runtime JavaScript V8 isolato (non CLI Node):** caricati i moduli effettivi dal branch GitHub, eseguite nuovamente le **14 prove esistenti** da `coach-club.test.js`: **14 passate / 0 fallite**, dopo modifica di `finance.js`.
3. Prima della correzione della validazione pre-JSON, un tentativo della suite mirata ha rilevato **8 pass/1 fail** su NaN di inizializzazione. Dopo il fix sono passati tutti i nove casi; non nascondo quel test fallito iniziale.
4. `node --check /mnt/data/oronzo-agent09-check/finance.js`: sintassi corretta.
5. **Non eseguito:** `node --test` dell'intera directory in una checkout Git locale integrata, perché il clone GitHub non era raggiungibile dall'ambiente container. Non è stato fatto uno smoke test grafico su smartphone né l'innesto in `oronzo/game.js`.

## Integrazione e dipendenze

- **Carriera / agente 7, PR #14**: `oronzo/systems/career/career.js` genera `seasonObjective:'avoidRelegation'|'topHalf'`, mentre `board.js` usa `'avoid_last'|'top_half'`. Senza adattatore si applica il fallback `safety`; l'orchestratore deve scegliere una mappa concordata. La carriera usa presidentId `president:${club.id}`, non gli ID dell'agente copy, e genera giocatori senza `contract.weeklyWage`. Collegare salari e mappatura profili prima di bilanci credibili.
- **Carriera / agente 7** usa operazioni che mutano lo stato; le nostre API restituiscono **nuove copie** di ClubV1/CoachV1, quindi il chiamante deve reimmettere `result.club` nello stato carriera; `applyBoardDecision({type:'dismiss'})` è l'hook per `reviewMatch().dismissed`.
- **Copy / agente 4, PR #13**: `oronzo/content/presidents.json` risultava **assente** al controllo di questa iterazione; solo otto fixture TEST disponibili. Il caricatore è predisposto ma i profili definitivi non sono stati verificati.
- **Match engine / agente 6** deve essere l'unica fonte per gol, risultati e comandi `CoachCommandV1`; questa PR non lo collega e non modifica match o grafica.
- **Attributes / agente 8** rimane responsabile degli effetti degli allenamenti, salute e stanchezza; per le spese serve un salario settimanale per giocatore e criteri storici parametrizzati.
- Tutti gli importi sono lire **di simulazione parametrica**, non prezzi e stipendi d'archivio 1985 verificati.

## Mancante / problemi

- La PR #17 è aperta, **non approvata né mergiata**; code QA, integrazione runtime e verifica completa Node restano all'orchestratore.
- I limiti della prima iterazione (contratti pluriennali, economie storiche, staff avanzato, grafica finale) sono **non implementati** e non sono stati avviati perché `NEXT.md` è `FIX_REQUESTED`.
- Compatibilità inter-agent sopra richiede intervento di coordinamento; non sono stati modificati altri agenti o `main`.

## Proposta prossimo ciclo (non autorizzata finché NEXT non è READY)

1. Integrare nei test dell'orchestratore la compatibilità schema `career.js`↔`coach-club/` (obiettivi, salari, stato immutabile, ID presidenti) con adattatori concordati.
2. Testare `loadPresidents` contro `presidents.json` reale non appena l'agente 4 lo consegna e conservarne gli ID persistenti.
3. Dopo QA e merge, sviluppare rinnovi e contratti multi-stagione con salari/sponsor più plausibili, solo su nuovo NEXT.

**Nessun merge eseguito. REPORT redatto nel branch della PR #17.**
