# RAPPORTO AGENTE 06 — Motore calcistico e tattiche — correzioni R01 P1

**Stato:** PR_OPEN · `FIX_REQUESTED` su `NEXT.md` di main, correzioni pubblicate e in attesa di QA dell'orchestratore.  
**Identità:** `ORONZO-AGENT-06`  
**Branch:** `agent/oronzo-match-engine`  
**PR:** https://github.com/CzekUns/cercax/pull/18  
**Issue:** https://github.com/CzekUns/cercax/issues/8  
**Audit:** https://github.com/CzekUns/cercax/pull/19  
**Commit codice verificato:** `28b88574efeb291ba5a85f97c6d1430533d567b4` (precedenti fix `b4712ed5`, `9b777741`).  
**Data:** 7 novembre 2026 · revisione dell'Agente 6.

## Realizzato

Tutti gli interventi sono nel branch della PR #18, senza creare una PR concorrente né alterare il runtime.

1. **ORZ-P1-001 — facing.** In `systems/match-engine/movement.js` e `match-engine.js` la proprietà `facing` è ora un **angolo in radianti**, non un segno: E=0, S=π/2, W=π, N=−π/2. L'orientamento iniziale e il cambio campo sono espliciti; in corsa deriva da `atan2(vy*68,vx*105)`, a riposo si conserva l'angolo precedente. La vista #15 usa `resolveFacing()` che già accetta radianti. Test specifico di orientamento iniziale, movimento, inversione a t=2700 e pausa.
2. **ORZ-P1-003 — PlayerV1.** `actions.js` usa ora `technical.decisions` per i passaggi. `rng.js` esporta `conditionFactor(player)` con modificatori graduati da `status.fitness` e `status.health`, usati nelle velocità, energia e decisioni di passaggio, contrasto e tiro/parata. Corretto il calcolo iniziale di `energy` affinché non sia NaN. Attributi letti dalla copia dell'input: nessuna mutazione della rosa di carriera. **Non è stato usato `effectiveAbility()`:** evita un doppio modificatore già condizionato; eventuale integrazione tramite DI da concordare con Agente 8.
3. **ORZ-P1-004 — feed cambi.** `match-engine.js` conserva gli eventi prodotti da `command()` in `pendingCommandEvents`, consegnandoli una sola volta al successivo `step()`. Il feed **autorevole** resta `getEventsSince(lastId)`: ID univoci crescenti, nessuna perdita fra uno `command()` e lo step successivo. `commands.js` richiede corrispondenza di ruolo GK e aggiunge `substitution.detail.goalkeeper`, `outId`, `inId`, necessari alla vista per aggiornare il portiere.
4. **ORZ-P1-005 — assist.** `actions.js` traccia l'ultimo passaggio effettivamente ricevuto dal futuro marcatore. Il gol può contenere `goal.detail.assistId` solo se ricezione valida, stesso team, entro 20 secondi, senza nuovo passaggio, cambio possesso o ripresa. Gol senza assist omettono il campo. `career-stats.js` della PR #16 interpreta questo payload senza modifiche.
5. **Documentazione/test.** Aggiornati `systems/match-engine/README.md` e `integration-notes.md`; aggiunto `tests/integration-p1.test.mjs` con **5 test regressione**. Nessuna modifica agli agenti 5, 8 o ai file `oronzo/game.js`, `oronzo/index.html`, `oronzo/ui.css`.

## Verifiche riproducibili

- **Esecuzione JavaScript in questa chat:** riuniti i file ESM del branch in un ambiente V8 con import/export adattati a un unico modulo e un runner `test/assert` compatibile: **17/17 test passati** (12 preesistenti + 5 P1 nuovi). Include seed, clock, pausa, partizionamento dt, punteggio = eventi goal, tattiche, cambi/GK, cursor ID, decisioni/fitness/salute, orientamento e assist.
- **Campione aggiuntivo, 40 seed:** 182 gol con 164 assist validamente collegati a precedenti passaggi, **18 gol senza assist**; per ogni assist verificato un evento `pass` precedente dallo stesso giocatore verso il marcatore. Questo è **un smoke test**, non una taratura storica dei risultati.
- **Decisioni:** variando solo `technical.decisions` 0→100 per la casa, su 8 seed 8/8 hanno prodotto feed eventi diversi entro t=1800. Fitness/salute 0/1→100 modificano l'energia iniziale e le posizioni dopo 120 s; energia iniziale finita per tutti i 22.
- **Smoke incrociato con codice effettivo PR #15 e #16:** `resolveFacing(0,π,−π/2,π/2)` → E/W/N/S; `recordMatch` dell'Agente 8 accredita 1 assist dal payload `goal.detail.assistId` in una partita seed=0, con conteggio gol equivalente agli eventi goal. Codice esterno valutato separatamente nel runner con polyfill locale `structuredClone`.
- **Limitazione ambiente test:** non è stato eseguito letteralmente `node --test` su un checkout Git locale in questa ripresa; l'ambiente Node locale non riesce a risolvere `github.com` per il clone. I test `node:test` sono salvati nella PR per esecuzione dell'orchestratore/CI. Non dichiarare QA Node/CI né QA smartphone completata.
- **Verifica perimetro su confronto GitHub `main...agent/oronzo-match-engine`:** solo `oronzo/systems/match-engine/**` e questo `REPORT.md`; nessuna modifica ai file root o agli altri agenti. La branch è attualmente dietro `main` di 21 commit, ma le differenze rilevate erano circoscritte alla propria directory; non rebase/merge automatico.

Da eseguire sul checkout completo:
```bash
cd oronzo/systems/match-engine
node --test
node cli-demo.mjs 10
```

## Integrazione, dipendenze e divergenze

- **Agente 5 / PR #15:** ora `facing` numerico significa radianti. Usare `getEventsSince(lastId)` come feed per il renderer, non soltanto `snapshot.events`. Al cambio del portiere leggere `substitution.detail.goalkeeper` e aggiornare `setKeepers()`. Il reset dell'interpolazione a `kickoff`/intervallo (ORZ-P1-002) e normalizzazione `energy` 0–100 verso 0–1 (ORZ-P2-001) **spettano ancora all'Agente 5**, non alla PR #18.
- **Agente 8 / PR #16:** le decisioni sono `technical.decisions`, non `mental.decisions`. Per gli assist leggere `goal.detail.assistId` se presente; i gol senza assist lo omettono. `effectiveAbility` deve essere concordata prima dell'uso per evitare fattori fitness/health applicati due volte.
- **Orchestratore:** preparare MatchInputV1 e calendario, mantenere il cursore eventi per partita e integrare l'API `createMatch / step / snapshot / getEventsSince / command`. Non sono stati toccati gioco principale, classifica o asset.

## Mancante / problemi noti

- Le simulazioni usano tick di 1 s e modelli semplificati per offside, fisica, rigori, calci piazzati, falli e riprese; non sono ancora una riproduzione normativa completa del 1985/86.
- Una sostituzione ha effetto immediato anziché attendere una sospensione di gioco (comportamento già documentato).
- Il campione di 40 seed non sostituisce il confronto con vere distribuzioni calcistiche; eventuale frequenza gol da ribilanciare dopo l'audit complessivo.
- Il renderer #15 e il modulo attributi #16 non sono stati modificati né uniti qui.
- PR #18 **ancora in review**; nessun merge fatto.

## Proposta per il ciclo successivo (solo se l'orchestratore autorizza tramite NEXT)

1. Eseguire `node --test` su una checkout comune delle PR #15/#16/#18 e uno smoke di interazione reale con GK sostituito, assist e halftime senza teletrasporti grafici.
2. Concordare integrazione dei modificatori con `effectiveAbility` tramite dependency injection per evitare il doppio conteggio.
3. Solo dopo merge e nuovo `NEXT=READY`, migliorare set piece, rigori e bilanciamento del numero di tiri/gol su campioni più ampi.
