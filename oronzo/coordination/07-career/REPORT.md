# RAPPORTO AGENTE 07 — Carriera e campionati — ciclo 01, revisione della PR

**Identità:** `ORONZO-AGENT-07`  
**Stato:** `PR_OPEN` — `WAIT_REVIEW` su `main`; nessun merge autorizzato.  
**Branch:** `agent/oronzo-career`  
**PR:** https://github.com/CzekUns/cercax/pull/14  
**Issue:** https://github.com/CzekUns/cercax/issues/9  
**Data:** 7 novembre 2026 (Europe/Rome)  
**Head originario verificato:** `b424faebcdfab088d3814e30120cc2370cec2fad`  
**Commit dei test e della correzione verificati:** `bd13be7ef064bf662b4d1292c8e805a7d17cc40a`, `0a4afb8da0eca1a8db18de478727af9824247a6c`

## Realizzato

- **Già consegnato nella PR:** `oronzo/systems/career/career.js` per stagione, registrazione risultati, promozioni/retrocessioni, cambio panchina e rollover; `league.js` per calendari/classifiche; `progression.js` per reputazione/offerte/contratti; `save.js` per salvataggio; `demo-adapter.js`, `career-demo.html`, `tests/career.test.mjs`, `README.md`, `integration-notes.md`, `package.json`.
- **Correzione puntuale 7 novembre, solo in PR #14:** `save.js` ora sceglie uno slot non valido prima di sovrascrivere l'unica copia recuperabile. Se lo slot attivo è corrotto, la copia integra rimane protetta durante un nuovo tentativo di scrittura; se entrambi gli slot sono integri ma il puntatore manca, rimpiazza quello con sequenza inferiore.
- **Test di regressione aggiunto:** `tests/career.test.mjs`, scenario attivo `B` corrotto, backup `A` integro, scrittura `B` interrotta. Prima della correzione il recupero restituiva `null`; dopo la correzione resta leggibile `A`.
- Nessun nuovo ciclo o seconda PR, nessun cambio ad altri moduli o ai file dell'orchestratore.

## Verifiche

1. Letti su `main`: `oronzo/coordination/PROTOCOL.md`, `07-career/{IDENTITY,RUN,NEXT}.md`, `oronzo/AGENTS.md`, `oronzo/engine-contract.md`, la specifica agente 07, la issue #9, lo stato live di PR #14 e le note dell'orchestratore.
2. **GitHub:** PR #14 aperta e non mergiata, base `main`, nessuna review submission/thread/commento con richieste di fix. HEAD precedente `b424fae` (2 commit). Verificati i blob SHA di **tutti e 10** i file estratti dal pacchetto già consegnato contro i blob della PR su GitHub: corrispondenza esatta.
3. **Node.js v22.16.0:** nella directory `oronzo/systems/career/`, eseguito `node --test tests/*.test.mjs` dopo la correzione: **11 test superati, 0 falliti**, inclusi calendario, due stagioni, esonero/offerte, checksum/migrazione, quota storage e nuovo caso di recupero.
4. **Riproduzione del bug prima del fix:** lo slot `B` corrotto con `:active=B`, `A` valido; simulata scrittura parziale interrotta su `A` → `load()` restituiva `null`. Dopo la patch il test conserva `A`. Il guasto parziale è simulato per stressare un provider di storage non atomico; non si afferma che `localStorage.setItem` del browser produca normalmente scritture parziali.
5. **Smoke completo a dimensioni predefinite con provider DEMO:** 104 società, 1.664 ID calciatore unici, **1.712 partite registrate** nella stagione 1985-86; round-trip `serialize/deserialize` riuscito; `finishSeason` ha prodotto 1986-87 con 6 campionati e 104 club persistenti. Stringa di salvataggio dopo la prima stagione: 1.844.618 caratteri (indicazione di dimensione, non misura quota reale dispositivo).
6. **Browser demo:** tentato Playwright/Chromium headless su server locale per avvio, giornata, refresh, rollover, esonero e nuova offerta; il browser ha bloccato la navigazione con `net::ERR_BLOCKED_BY_ADMINISTRATOR` prima di caricare la pagina. **Test visivo browser NON eseguito**, da ripetere su browser/smartphone autorizzato.
7. I blob SHA pubblicati per i due file corretti sono `save.js`: `3d38981a5d97e1bfd33f07484be95c2d5e97110b`; `tests/career.test.mjs`: `4ebd51a9d25fd58310f1e026116413055f9b092e`. Corrispondono ai file testati localmente.

## Integrazione / dipendenze

- **Agente 6:** deve fornire i veri risultati partita, `score` e l'insieme degli eventi `goal` raccolti dai tick. L'API `registerResult(state,{fixtureId,homeId,awayId,score,events})` rifiuta punteggi senza eventi-gol corrispondenti. `demo-adapter.js` è un provider fittizio per dimostrazione/test, non per il runtime.
- **Agente 9:** deve chiamare `applyBoardDecision(state,{type:'dismiss'|'renew'|'retain',clubId,...})` e comunicare posti vacanti tramite `addVacancy(state,clubId)`. Il modulo carriera non decide autonomamente esoneri o bilanci.
- **Agente 8:** collegare progressione degli attributi, salute, contratti e mercato tramite il callback `finishSeason(state,{onRollover(clubs,snapshot)})`.
- **Orchestratore:** collegare questi moduli a `oronzo/game.js`, gestire checkpoint delle partite in corso separatamente e verificare UI landscape smartphone. Gli export principali sono `newCareer`, `fixturesForWeek`, `getUpcomingFixture`, `registerResult`, `advanceWeek`, `finishSeason`, `getStandings`, `addVacancy`, `applyJobOffer`; da `save.js`: `serialize`, `deserialize`, `createSaveManager`.
- Il conteggio di partite e i risultati del demo **non provano** l'integrazione con il motore calcistico reale.

## Mancante / problemi

- Storicamente è **una semplificazione dichiarata**: un girone rappresentativo per ogni categoria, scambio parametrico 1 promossa/1 retrocessa per confine, non quote o spareggi reali del 1985-86; Eccellenza non utilizzata.
- Misurare su dispositivi reali il limite `localStorage`: un salvataggio con 104 società e 1.664 giocatori è voluminoso e mantiene due copie. Nessun cloud backup; esportazione JSON disponibile.
- Smoke browser bloccato dall'ambiente, quindi non esiste prova visiva di funzionamento su smartphone per questa iterazione.
- `WAIT_REVIEW`: nessuna approvazione/merge, nessun incarico `READY`; non aggiungo nuove funzionalità senza `NEXT.md` aggiornato.

## Proposta prossimo ciclo (da autorizzare)

1. Dopo QA e merge dell'orchestratore, sviluppare un adattatore di torneo che supporti più gironi e quote/promozioni storiche per divisione/anno, senza inventare criteri.
2. Verificare budget di spazio e strategie di compattazione dei salvataggi su Android/iOS reali, con test dei rollback dopo interruzioni.
3. Con l'orchestratore, validare il mapping degli eventi reali dell'Agente 6 e i callback di Agenti 8/9 in test d'integrazione tra moduli.

**Nessun merge eseguito.**
