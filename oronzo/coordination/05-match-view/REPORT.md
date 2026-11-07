# RAPPORTO AGENTE 05 — Match View, due camere — ciclo R02 (v0.2)

**Identità:** ORONZO-AGENT-05  
**Stato aggiornato R04:** PR_OPEN / HOLD — gate browser con atlas reali non superato (NON merged)  
**Branch:** `agent/oronzo-movements-r02` — creato dall'ultimo `main` verificato (inizio ciclo `c9f52a1c2f60733a6ae1e0b63180fa4b5d0f9697`)  
**PR:** https://github.com/CzekUns/cercax/pull/28  
**Issue originale:** https://github.com/CzekUns/cercax/issues/7 · **Epic v0.2:** https://github.com/CzekUns/cercax/issues/25  
**PR precedente:** #15 MERGED, commit di merge `9dc68d21c6700d856104a1d3820b4dab1a00f83f`. **Cambio modulo fisico:** PR #24 MERGED, commit `61dab9f8eb482706b295e9d885cd64545e315b23`.  
**HEAD codice verificato prima dell'aggiornamento report:** `a52a0003ed6c8b8f30432ee09a8824b58da0807a`.  
**Data:** 2026-11-07, Europe/Rome.


## ADDENDUM R04 — correzioni e verifica browser, 7 novembre 2026

**Identità invariata:** ORONZO-AGENT-05. **PR unica:** https://github.com/CzekUns/cercax/pull/28. **Branch:** agent/oronzo-movements-r02. **Gate:** HOLD; no merge, nessun R03.
**Audit obbligatorio letto:** PR #36, oronzo/coordination/coerentizzatore/REPORT-R04.md. L'audit Work 00 ha eseguito e riportato **34 PASS / 0 FAIL** sulla suite match-view precedente. Il NEXT su main chiede esplicitamente il gate visivo Chromium e screenshot; non assegna nuove funzionalità.

### Correzione realmente eseguita

- **Bug di replay osservato in Chromium, corretto:** un overlay GOAL rimaneva visibile tornando a uno snapshot precedente (rewind), anche quando la camera e la palla erano tornate all'inizio. In oronzo/systems/match-view/match-view.js, se `normalized.t < previous.t`, si puliscono ora `overlay`, `frameStates` e `animationTime` prima del nuovo rendering. La camera già eseguiva hard cut al rewind; ora il messaggio visivo non resta fuori contesto.
- Aggiunto `oronzo/systems/match-view/camera-r04.test.mjs`, tre regressioni per overlay dopo replay, cambio full/TV con snapshot e score immutati, pausa camera+palla. I tre test sono stati **eseguiti sulla copia locale compatibile e passano**.

### Harness per il gate con asset reali

- Nuovo `oronzo/systems/match-view/browser-qa.html`: pagina ES module autonoma con camera FULL e TV, 22 sprite, 9 scene controllabili (kickoff, angoli, partita, ripresa gol, intervallo, pausa, replay e secondo tempo). Consuma manifest e PNG reali in browser quando accessibili; restituisce `assetState`, numero di sprite reali disegnati, presenza della palla, score e source integrity, zoom, pausa, replay e canvas contenuto nel viewport.
- Nuovo `oronzo/systems/match-view/browser-qa-playwright.py`: avvia un piccolo server HTTP dalla root, usa Chromium, cattura screenshot per 640×360 / 800×360 / 844×390 in entrambe le camere, 9 casi ciascuna (**54 schermate**); crea `results.json` e hash SHA-256. Il gate standard richiede `assetState=ready` E `allRealSprites=true`; l'opzione `--allow-fallback` è esclusivamente diagnostica.
- Corretto CSS della pagina QA: il campo 16:9 entra interamente nello schermo anche su 844×390; l'etichetta scenario coincide con lo scenario realmente fotografato. La partita rapida, i runtime HTML, il motore e gli asset degli altri agenti **non sono stati modificati**.
- `README.md` aggiornato con comandi di esecuzione, criteri, dipendenze e blocchi.

### Test eseguiti in questo ciclo: distinguere prove e limiti

| Verifica | Esito osservato | Livello di evidenza |
|---|---|---|
| Audit Work 00 PR #36, suite camera sul suo snapshot combinato | **34/34 PASS** | Eseguita da Work 00, non ripetuta sul nuovo HEAD da Agente 05 |
| `node --test *.test.mjs` in copia locale ricostruita | **15/15 PASS**, inclusi **3 nuovi test R04** | Runtime Node 22.16; la copia locale non è SHA-identica a tutti i file GitHub di PR #28: non attribuire questi 15 test al checkout remoto integrale |
| Chromium 144 Playwright, pagina in memoria + sorgenti locali compatibili, scenario camera | **54/54 PASS** per posizioni/score/ball/pause/replay (3 viewport × 2 viste × 9 casi) | **Sprite fallback: realSprites=0**. Test geometrico/DOM, non verifica PNG definitivi; screenshot locali prodotti |
| Contenimento CSS canvas QA nei viewport 640×360, 800×360, 844×390 | **3/3 PASS**, bounding rect interamente nel viewport e 16:9 | Chromium Playwright, layout senza caricare gli asset |
| QA automatica HTTP con `browser-qa-playwright.py` per atlas reali | **BLOCKED / FAIL** all'apertura: `Page.goto: net::ERR_BLOCKED_BY_ADMINISTRATOR` su `http://127.0.0.1:.../oronzo/systems/match-view/browser-qa.html`; **0 screenshot con PNG reali** | Limite di navigazione imposto all'ambiente; nessun PASS inventato |
| Manifest e file atlas su main | 5 azioni dichiarate, 8 direzioni × 4 frame; PNG e mask esistono | Verifica dei metadati GitHub, **non** della qualità grafica in browser |

Il pacchetto diagnostico temporaneo della sessione comprende screenshot **di fallback**, log Node e JSON, ed è stato consegnato nella conversazione come artefatto. Non è stato aggiunto come PNG alla PR perché non documenta un PASS artistico.

### Esecuzione richiesta per chiudere il gate (orchestratore / QA grafica)

Da checkout della branch PR #28, in un ambiente dove Chromium può navigare localhost e caricare i PNG:

    python3 -m pip install playwright
    python3 oronzo/systems/match-view/browser-qa-playwright.py --browser /usr/bin/chromium --output /tmp/oronzo-r04
    node --test oronzo/systems/match-view/*.test.mjs

Esaminare le 54 schermate e `results.json`: in FULL il campo deve essere intero, in TV la palla deve restare nella vista, senza frame vuoti durante pan/kickoff/intervallo e con 22 figure dal manifest vero quando 11v11. Verificare palette/animazioni e frame rate su Android landscape. In assenza di PNG o accesso browser, **mantieni HOLD**. L'API della camera resta `setCameraMode('full'|'broadcast')`; l'integrazione del selettore nel runtime è di Agente 03 quando autorizzato.

### Commit R04 e confini

- `a927fbf9675219d8e5bc7f249ae7a44a96455593` — correzione replay overlay.
- `490fa7f5e89b2a4cc5a2efcb61898c28cfd34e9e` — pagina QA browser iniziale.
- `303eeed9dbb63a71004a3755f740ee3d91a5ee3f` — runner Playwright.
- `fbdb5d4aab11d6db0adbea2a27c56e06d74a16d3` — regressioni Node R04.
- `20c86fc7ac89aa0eb2e1de5d8d1f94847d922e23`, `cb0e54cf186f8c3a4bcd8971f82b1bb8094cdc8a`, `cda390354a1a6ad7c6a83deb80d9182fd7e3bfb7` — miglioramenti viewport e gate.
- `8058b7559f2074992cfb0e3d124f90f0d0a3bd63` — documentazione di QA e limiti.

**Proposta allo stesso orchestratore 10:** 1) rieseguire i 54 casi browser con gli asset reali in ambiente non bloccato; 2) verificare frame, colori e leggibilità 22 giocatori con Agente 01; 3) rieseguire la suite Node completa sul nuovo HEAD e decidere il merge solo dopo il gate. Nessun nuovo ramo, nessuna modifica a NEXT, nessun merge eseguito.

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