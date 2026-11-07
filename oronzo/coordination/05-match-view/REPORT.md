# RAPPORTO AGENTE 05 — Match Movement & Visual Engineer — ciclo R01 (correzioni)

**Stato:** PR_OPEN — correzioni di `FIX_REQUESTED` consegnate, **in attesa di QA e decisione orchestratore** (non MERGED).
**Identità:** `ORONZO-AGENT-05`
**Branch:** `agent/oronzo-movements`
**PR:** https://github.com/CzekUns/cercax/pull/15
**Issue:** https://github.com/CzekUns/cercax/issues/7
**Commit verificato del codice prima del presente rapporto:** `90cbe2899b60edc1b821df8c033786661219e370`
**Data/ora dell'esecuzione test locale:** 2026-11-07 07:45 CET (Europe/Rome).
**Istruzioni su main:** `oronzo/coordination/05-match-view/NEXT.md` = `FIX_REQUESTED`.

## Realizzato

Ho ripreso la PR #15 esistente dopo aver letto PROTOCOL.md, IDENTITY.md, RUN.md, NEXT.md, issue #7, audit R01 del Coerentizzatore, i contratti e gli snapshot dell'Agente 6. Non ho creato un secondo ciclo né una seconda PR.

1. **ORZ-P1-001 / facing** — `oronzo/systems/match-view/interpolation.js`: `resolveFacing(1) = E`, `resolveFacing(-1) = W`, anche con `vx=vy=0`. Per otto direzioni si accettano stringhe e vettori `{x,y}`; un angolo di un radiante si esprime esplicitamente con `{radians:1}`. La convenzione ±1 è quella documentata nell'HEAD di #18.
2. **ORZ-P1-002 / intervallo e restart** — `interpolation.js`: nuovo `kickoff` o `halftime`, cambio di `phase` o rewind annullano il blend; posizioni dei portieri e palla passano al nuovo snapshot senza attraversare il campo. Negli altri tick l'interpolazione resta attiva, con pausa e velocità 1/2/4/8 indipendenti dal tempo calcistico.
3. **ORZ-P1-004 / eventi persistenti e GK** — `match-view.js`: nuovo export `createEngineViewBridge(engine,view,{initialEventId,keeperIds})`. `sync(now?)` chiama `getEventsSince(cursor)` una volta, usa il log autorevole al posto degli eventi momentanei dello snapshot, aggiorna il cursore numerico e sostituisce `keeperIds` su `substitution.detail.{outId,inId}`. Anche `render()` diretto recepisce una sostituzione che gli sia effettivamente consegnata. Nuova introspezione `getKeeperIds()`, metodo `bridge.reset()` per replay. **Il bridge non avanza il match e non modifica il punteggio**.
4. **ORZ-P2-001 / energia** — `normalizeEnergy()` converte il contratto 0..100 dell'engine in frazione 0..1 per la vista. `fixture.js` ora emette energia percentuale (0..100), coerente con l'Agente 6; `1` vale 1%, non piena energia.
5. **Regressione** — nuovo `compatibility.test.mjs`, 10 test mirati su cardinali, ±1, entrambi i portieri all'intervallo, palla dopo gol, cambi fase, blend ordinario, energia, evento di sostituzione perso nel tick ma recuperato dal log, deduplica e `setKeepers`.
6. **Handoff aggiornato** — `README.md` e `integration-notes.md`: API e codice copiabile per collegare il bridge al runner di #18, rispettando i confini degli agenti.

**File del ciclo correttivo:** `interpolation.js`, `match-view.js`, `fixture.js`, `compatibility.test.mjs`, `README.md`, `integration-notes.md`, tutti in `oronzo/systems/match-view/`, oltre a questo `REPORT.md` nella sola cartella di coordinamento consentita. I precedenti `asset-adapter.js`, demo e altri test restano intatti.

## Verifiche

- **Eseguito realmente** nel container locale, Node `v22.16.0`: `cd /mnt/data/agent5-r01-fix/oronzo/systems/match-view && node --test *.test.mjs` — **22 passati, 0 falliti**, a fronte di 12 test precedenti più 10 regressioni. Ultima ripetizione alle 07:45 CET del 7 novembre 2026.
- **Eseguito** `node --check interpolation.js` e `node --check match-view.js` — nessun errore di sintassi.
- **Verificato su GitHub** che la PR #15 è aperta e che la diff rispetto a main, prima dell'aggiunta del presente report, contiene esclusivamente i dieci file di `oronzo/systems/match-view/` (9 del ciclo originale più `compatibility.test.mjs`).
- **Non effettuato:** test DOM completo con asset PNG reali integrati, screenshot smartphone landscape, suite combinata reale di #15 + #18 + #16 dopo i fix. Il test di integrazione del bridge usa una fixture che rappresenta il comportamento osservato dal Coerentizzatore, non il codice engine collegato direttamente.
- Il campo GitHub sintetico `mergeable` è noto essere incoerente con REST per questa repository (vedi REVIEW-QUEUE). Nessuna decisione QA/merge deriva da tale campo.

## Integrazione e dipendenze

**API pubblica:** `createMatchView(canvas,{assetLoader,config})` → `render(snapshot)`, `drawAt`, `setPaused`, `setSpeed`, `setKeepers`, `getKeeperIds`, `resize`, `destroy`. `createEngineViewBridge(engine,view,{keeperIds,initialEventId})` → `sync(now?)`, `reset(lastId,keeperIds)`, `lastEventId`, `keeperIds`. `SnapshotInterpolator`, `resolveFacing`, `normalizeEnergy`.

- **Agente 6 / PR #18:** motore rimane autorità unica per posizioni, phase, score, azioni, eventi e sostituzioni. Il runner deve avanzare il motore, poi chiamare `bridge.sync()` (e subito dopo un comando accettato) e sincronizzare pausa/velocità su motore e vista. `getEventsSince` deve restituire ID interi crescenti e `substitution.detail.outId/inId`; è il formato verificato su #18. Gli altri bug engine dell'audit (ORZ-P1-003 e 005) sono **fuori dallo scope** Agente 5.
- **Agente 1 / PR #6:** sprite atlas, maschere, manifest, palette e pallone non ancora integrati per la QA reale.
- **Agente 2 / PR #12:** cutscene e manifest da includere prima della QA visiva.
- **Agente 8 / PR #16:** PlayerV1 per il match engine; il renderer consuma solo snapshot e non deve leggere direttamente i valori del giocatore.
- **Orchestratore:** unica autorità per modifica di `oronzo/game.js`, runner, UI e merge. Nessun intervento fuori `match-view/` è stato effettuato, salvo questo report autorizzato.

## Mancante / problemi

- La PR non è ancora integrata. Verificare l'effettivo collegamento a `getEventsSince` sul runner ufficiale e la sostituzione reale di un GK.
- Il renderer segue la semantica `facing=±1` di #18, che rappresenta E/W; direzioni diagonalmente accurate richiedono che il motore emetta vettori o stringhe esplicite nelle versioni future.
- I test automatici verificano l'interpolazione logica, non la resa grafica effettiva su dispositivi. Il fallback è unicamente tecnico.
- Codice engine #18, fix degli attributi e assist non modificati: rimangono dipendenze di QA incrociata.
- PR rispetto a main può risultare behind perché main ha ricevuto modifiche di coordinamento; nessun merge/rebase eseguito dall'agente in questa iterazione.

## Proposta prossimo ciclo (solo dopo autorizzazione orchestratore)

1. **QA integrata** con #18/#16: replay continuo del feed numerico, kickoff post-gol/intervallo, sostituzione GK, verificare che 22 sprite e pallone siano nei limiti e nessun goal sia aggiunto dalla vista.
2. **QA visiva landscape** con gli atlas e cutscene #6/#12 effettivamente integrati: 640×360, 800×360, 844×390, controllo palette, direzioni, cooldown, frame e fallback.
3. **Ottimizzazione mirata** su profiler browser (cache, frame budget e gestione animazioni one-shot) solo dopo che i test d'integrazione abbiano evidenziato colli di bottiglia.

**Nessun merge richiesto né eseguito.**
