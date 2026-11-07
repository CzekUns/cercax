# RAPPORTO AGENTE 05 — Match View, due camere — ciclo R02 (v0.2)

**Identità:** ORONZO-AGENT-05  
**Stato:** PR_OPEN / DELIVERED per revisione (NON merged)  
**Branch:** `agent/oronzo-movements-r02` — creato dall'ultimo `main` verificato (inizio ciclo `c9f52a1c2f60733a6ae1e0b63180fa4b5d0f9697`)  
**PR:** https://github.com/CzekUns/cercax/pull/28  
**Issue originale:** https://github.com/CzekUns/cercax/issues/7 · **Epic v0.2:** https://github.com/CzekUns/cercax/issues/25  
**PR precedente:** #15 MERGED, commit di merge `9dc68d21c6700d856104a1d3820b4dab1a00f83f`. **Cambio modulo fisico:** PR #24 MERGED, commit `61dab9f8eb482706b295e9d885cd64545e315b23`.  
**HEAD codice verificato prima dell'aggiornamento report:** `a52a0003ed6c8b8f30432ee09a8824b58da0807a`.  
**Data:** 2026-11-07, Europe/Rome.

## Realizzato

1. `oronzo/systems/match-view/camera.js` (nuovo): camera autonoma e deterministica con modalità `full` e `broadcast`, zoom TV 2×, pan con half-life 190 ms, crop sicuro agli estremi, tracking sulla posizione della palla interpolata, hard cut su nuova ripresa, funzioni pure `initialCamera`, `followCamera`, `cameraTransform`, `worldToScreen`, `ballWorldPosition`, `fitLandscapeViewport`, `validateCameraMode`.
2. `match-view.js`: `config.cameraMode` / `cameraZoom` / `cameraHalfLifeMs` e API `view.setCameraMode(mode)`, `view.cameraMode`, `view.getCameraState()`. Render del mondo dentro `ctx.save/clip/translate/scale/restore`; notifiche tecniche e cutscene rimangono fisse in coordinate schermo. Il renderer usa sempre le stesse coordinate di `MatchSnapshotV1` in entrambe le viste. Nessuna logica di partita aggiunta.
3. `match-view-demo.html`: pulsante locale CAMERА FULL/TV, feed fixture 22 giocatori, velocità 1× allineata a v0.2 (6 secondi simulati/secondo reale = partita di circa 15 minuti).
4. `camera.test.mjs` (nuovo, 8 casi) e `camera-integration.test.mjs` (nuovo, 4 casi): edge/clamp, pan, teleport/restart, pausa, identità della proiezione completa, snapshot equivalenti, cambio camera, viewport 640×360/800×360/844×390.
5. `README.md` e `integration-notes.md`: nuove API, contratti e snippet da passare a UI Agente 03; nessun file runtime o motore modificato.

## Verifiche riproducibili e perimetro reale

- **Eseguito in locale, Node v22.16.0:** `cd /mnt/data/agent5-r02/oronzo/systems/match-view && node --test *.test.mjs` → **24 passed, 0 failed**. Tale cartella contiene i 12 test originali recuperati dalla precedente copia di lavoro e **12 test nuovi di R02**; il vecchio interpolatore locale è stato allineato al fix `kickoff/halftime` di main. Non si attribuiscono a questa esecuzione i 10 test aggiuntivi `compatibility.test.mjs` presenti soltanto sul main attuale. Verifica ulteriore richiesta all'orchestratore: suite completa sul branch GitHub del ciclo.
- **Eseguito:** `node --check camera.js`, `node --check camera.test.mjs`, `node --check camera-integration.test.mjs`, `node --check match-view.js` → nessun errore sintattico nella copia locale.
- **Asset reali verificati come manifest e file su main:** i 5 atlas di Agente 01 `idle/run/kick/tackle/keeper` dichiarano ciascuno 8 direzioni × 4 frame = **32 rettangoli**, atlanti 256×128, celle 32×32 e pivot (16,29). Presenti i PNG e le 5 maschere; il pallone è `ball.png` 16×16. Questo **non verifica la leggibilità artistica effettiva di ogni sprite su Android**.
- **Tentata verifica browser:** Chromium/Playwright headless con viewport 844×390 sul server HTTP locale fallita con `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Nessuno screenshot catturato, nessun test grafico con PNG reali dichiarato completato.
- **Separazione della simulazione:** gli unit test di camera applicano soltanto proiezione; gli integration test sulla fixture confermano 22 ID e stessi snapshot, risultato, possesso, palla e azioni indipendentemente dalla camera. Il modulo non chiama `engine.step()` né altera gli ordini.

## API e integrazione

`createMatchView(canvas,{assetLoader,config:{cameraMode:'full'|'broadcast',cameraZoom:2,cameraHalfLifeMs:190,simSecondsPerRealSecond:6,...}})`.

Espone `render(snapshot)`, `setCameraMode(mode)`, `cameraMode`, `getCameraState()`, `setPaused`, `setSpeed`, `resize`, `setKeepers`, `getKeeperIds`, `destroy`; il bridge `createEngineViewBridge(engine,view,...)` già integrato resta invariato.

**Agente 03:** aggiungere il selettore touch nel futuro ciclo runtime autorizzato, chiamando esclusivamente `view.setCameraMode(mode)`, senza riavviare la partita. Snippet completo in `integration-notes.md`.  
**Agente 06:** mantiene decisioni, movimento fisico e riposizionamento da modulo tattico (#24); view proietta i loro snapshot senza generare movimenti. Se compaiono compenetrazioni o teletrasporti nei dati fisici, correggere a monte o comunicare `kickoff`/hard-cut.  
**Agente 01:** QA artistica dei 22 sprite sul campo; l'Agente 05 usa atlas e palette senza duplicarli.  
**Agente 02:** le cutscene restano soggette a gate artistico e non sono sostituite/mergeate da questa PR.  
**Agente 10:** revisione, eventuale merge; nessun intervento autonomo su `main` o `NEXT.md`.

## Mancante / problemi

- Necessaria prova live effettiva su browser Android (pixel-art, 22 sprite, frame rate, touch, panoramica TV) con asset e feed engine reali; blocco del browser locale documentato sopra.
- In modalità TV **non** possono essere visibili contemporaneamente tutti i 22 giocatori: è il comportamento naturale dello zoom. In full sì, salvo espulsioni.
- Scatti visivi potenziali da verificare: arrotondamento a pixel interi alle velocità basse; passaggi fra animazioni `run` e `idle` molto frequenti; compenetrazioni dei giocatori vicini se già sovrapposti nello snapshot (non devono essere risolte falsando le coordinate). Nessun bug fisico del motore attribuito senza prova.
- Le screenshot QA 800×360 e 844×390 restano da acquisire; i test automatici sono geometrici e mock Canvas.

## Proposta prossimo ciclo (solo su NEXT autorizzato)

1. QA integrata su telefono e replay del runner effettivo, misurando player draw e frequenza frame nelle due camere.
2. Se emergono scatti dal feed, ottimizzare la rappresentazione `run/idle` e il pivot senza introdurre fisica artificiale.
3. Introdurre preset zoom/opzioni UI soltanto dopo verifica ergonomica e delega all'Agente 03.

**Nessun merge eseguito.**