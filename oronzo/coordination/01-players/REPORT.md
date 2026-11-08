# RAPPORTO AGENTE 01 — Pixel Art e Sprite — ciclo R02 (visione v0.2)

**ID:** `ORONZO-AGENT-01`  
**Stato:** `PR_OPEN` — attende gate artistico dell'orchestratore  
**Branch:** `agent/oronzo-players-r02`  
**PR:** https://github.com/CzekUns/cercax/pull/29  
**Issue originaria:** https://github.com/CzekUns/cercax/issues/1  
**Epic v0.2:** https://github.com/CzekUns/cercax/issues/25  
**Lavoro precedente:** PR #6, **effettivamente mergiata** (SHA indicato da NEXT: `3585b39596e6aa879c69e2136f8f22e2ca1ea102`).
**Main di partenza ciclo:** `c9f52a1c2f60733a6ae1e0b63180fa4b5d0f9697`.  
**Commit asset verificato:** `989439d89e6f83ba0a65b413939ba912f490ed79`.  
**Data:** 7 novembre 2026. `NEXT.md` su main: `READY` → ciclo R02 autorizzato.

## Realizzato

Tutto il codice e le immagini sono in `oronzo/assets/players/`, ad eccezione di questo rapporto autorizzato.

1. **Asset R02 — correzioni mirate, niente ripartenza da zero.** Rigenerati con `sprite-factory.js` i cinque atlas `idle.png`, `run.png`, `kick.png`, `tackle.png`, `keeper.png` e le rispettive cinque `*-mask.png`; dettagli aggiunti a contorni del viso, riflessi dei capelli, cuciture e scollo maglia, fascia calze e punte scarpe. Modificati rispettivamente 249, 220, 260, 222 e 200 indici pixel rispetto alle vecchie azioni, con relativi mask aggiornati. Pixel-art senza antialias.
2. **Contratto invariato**: 256×128 per atlas, 32×32 per cella, 8 direzioni (N, NE, E, SE, S, SW, W, NW), 4 fotogrammi, pivot (16,29), 9 materiali indexed con quattro gradazioni. In `manifest.json` incremento non distruttivo a `version:1.1.0` e `artRevision:R02-1979-fullfield`, vecchi mapping identici.
3. **`team-looks.js`**: `OronzoTeamLooks.KITS` con kit casa (crema/blu verticale), trasferta (rosso/amaranto, tinta unita), portiere casa (oro/scuro) e portiere trasferta (turchese/blu); `appearance(team,index,keeper)` produce skin/hair per 22 persone, `roster()` restituisce 11+11 e 2 portieri. È catalogo **solo grafico di QA**, non identità/cognomi/rosa persistenti del gioco.
4. **`match-22-demo.html`**: demo 16:9 separata, 22 sprite con palette indipendenti caricati tramite `palette.js`; pausa, reset, scelta delle cinque azioni e delle otto direzioni. Proiezione di squadra, oscillazione e pallone sono fixture **visual-only**; non producono risultati, tattiche o dati di `MatchSnapshotV1`.
5. **`match-22-preview-640.png` e `match-22-preview-844x390.png`**: prove raster originali dal vero generatore indicizzato, su campo completo 11v11. A 844×390 il 16:9 è letterboxed in 844, senza stretch né taglio porte. Sono **render offline**, non screenshot di browser.
6. **`qa-atlas.test.mjs`**, eseguibile con `node --test oronzo/assets/players/qa-atlas.test.mjs`, test Node senza dipendenze; aggiornate `integration-notes.md` e `qa-report-r02.json`.

## Verifiche eseguite realmente

- **55.841/55.841 assert PASS, 0 FAIL** in isolate JavaScript V8: PNG rigenerati, signature/Indexed PNG 8-bit, alpha zero, 10 mask / atlas, 160 pose distinte su 8×4, manifest/pivot, materiali, 22 look, ricolorazione con il vero `palette.js` e alpha preservata. Questo è un test **V8 isolato con canvas mock**, non Chromium.
- **10/10 file PNG** scaricati da GitHub PR R02 come base64 dopo il commit e confrontati **byte-per-byte** con l'output del generatore del branch: PASS.
- **2/2 preview PNG** lette dal branch e validate per firma PNG e dimensioni esatte (640×360 e 844×390).
- Ricolorazione verificata su **1.642 pixel di materiale `shirt`** dell'azione `run`: `solid` 1642 A/0 B; `vertical` 929/713; `horizontal` 805/837; `halves` 960/682; nessun pixel fuori dai quattro livelli previsti.
- Corretto un difetto di scelta palette emerso durante QA: il colore secondario ospite troppo vicino al crema di casa è stato sostituito con amaranto. Distanza euclidea RGB **minima fra tutte le coppie home/away = 156**, soglia del test 150.
- Ispezionata l'anteprima renderizzata full-field 22 giocatori; 11 casa, 11 trasferta, 2 portieri. Il giudizio **finale** di dettaglio/leggibilità al telefono resta dell'orchestratore.

**Non eseguiti in questa sessione**: `node --test` con Node reale; avvio Chromium/Android del demo HTML; screenshot browser 640×360 / 844×390; smoke end-to-end con renderer Agente 05 e doppia camera. Non dichiaro testati questi punti.

## Integrazione e API

- Il renderer dell'**Agente 05** in `oronzo/systems/match-view/asset-adapter.js` importa `manifest.json` e le PNG materiali da `../../assets/players/`. L'interfaccia è **backward compatible**: stessi nomi, indici, `actions`, posizioni e pivot; non toccare i suoi file.
- `OronzoPalette.prepare(action, appearance, basePath)` continua a restituire canvas ricolorato con cache; `OronzoPalette.draw(ctx,atlas,direction,frame,xGround,yGround,scale)` usa pivot ai piedi. Per i quattro kit e i capelli/pelle si può generare `appearance` tramite `OronzoTeamLooks.appearance(team,slot,isKeeper)`.
- In gioco definitivo, il look deve essere **persistente per PlayerV1/id reale** da Agente 08 e non ricalcolato per l'indice di formazione della demo; è un handoff preciso per 05/08/10. Nessun nuovo schema richiesto al motore.
- L'Agente 05 è owner di **zoom della camera televisiva, projection e fedeltà snapshot**; Agente 06 dei movimenti e delle azioni; l'Agente 01 non muove giocatori in partita. Non modificato `oronzo/game.js`, `index.html`, `ui.css`, `partita-rapida.html`, root CercaX né file degli altri agenti.
- Fallback se atlas manca continua nel renderer 05. Il file `match-22-demo.html` invece segnala esplicitamente un errore di caricamento, non simula il match.

## Mancante / problemi

- Gate di QA visiva **su telefono reale** a 640×360 e 844×390. Le preview aiutano ma non lo sostituiscono.
- `qa-atlas.test.mjs` non è stato eseguito da CLI Node; l'orchestratore può riprodurlo senza installazioni.
- Branch R02 era **15 commit dietro a main** al confronto precedente all'apertura della PR #29; il diff rimane nel perimetro, ma va riesaminato il `mergeable_state` al momento del gate. Non ho rebasato né fatto merge autonomamente.
- La qualità è migliorata entro il limite fisso di 32×32. Necessario giudizio umano/artistico su proporzioni e differenziazione a distanza; non attribuisco la qualità definitiva senza QA visuale.

## Proposta prossimo ciclo (solo dopo QA, nuova autorizzazione NEXT)

1. Verificare demo/browser reale ai due viewport e catturare screenshot; correggere eventuali difetti di resa emersi con la vista televisiva dell'Agente 05.
2. Test asset con l'adapter 05 in full e TV, assicurando 22 sprite visibili, lettura degli ordini reali da snapshot e direzione coerente, senza alterare l'engine.
3. Applicare soltanto ulteriori rifiniture **specificamente richieste dalla revisione artistica** e aggiornare le preview.

**Nessun merge effettuato.**

---

## R10 — Verifica conclusiva richiesta l'8 novembre 2026 — HEAD asset 0b4cab48

**Stato gate: HOLD_BROWSER / PR_OPEN.** Non ho aperto una nuova PR, non ho modificato 05 né effettuato merge. Il controllo PNG è PASS, il gate Chromium/Android non è PASS a causa di un blocco del browser in questo ambiente. Le evidenze offline seguenti NON sono screenshot browser.

### Correzione concreta effettuata nella PR #29

- Commit di correzione asset: `0b4cab48eb57a463d6fcc158d9e0525ecfbfc77a`, parent `01c5deca71d6f7e304217c48525732cf914c4fbc`.
- Controllo indipendente del vecchio atlas: **17 frame** avevano pixel di silhouette al bordo esterno della cella 32×32 (8 `run` frame 3 in tutte le direzioni, 8 `keeper` frame 1, 1 `kick` direzione E frame 2). Ciò implica margine trasparente assente e rischio di clipping.
- Modificato esclusivamente `oronzo/assets/players/sprite-factory.js`: head offset +1 pixel solo negli estremi di corsa/portiere, clamp orizzontale della scarpa nei tiri. Rigenerati `run.png`, `run-mask.png`, `kick.png`, `kick-mask.png`, `keeper.png`, `keeper-mask.png` senza cambiare payload del manifest, indici materiali o pivot.
- **Dopo fix: 0/160 frame con pixel opachi di silhouette sul bordo; 160/160 frame distinti per direzione+azione, 8 direzioni × 4 per azione, 5 azioni.** La maschera ha esattamente gli stessi indici raster della PNG principale (palette RGB differente).
- Aggiunto test regressione bordi in `qa-atlas.test.mjs`: `R10 crop gate: all 160 opaque silhouettes keep a transparent 1px frame border`. Aggiornato `integration-notes.md`.
- Rigenerate due anteprime con i PNG nuovi: `match-22-preview-640.png` (640×360) e `match-22-preview-844x390.png` (844×390): 11+11 e 2 portieri con due kit, capelli e pelle diversi. **Raster offline** con i pixel effettivi, non screenshot del runtime.

### Test effettivamente eseguiti ora

1. **GitHub readback post-commit:** 10/10 atlas+mask PNG scaricati da branch #29 in base64, confrontati **byte per byte** all'output del `sprite-factory.js` recuperato dal medesimo branch: 10/10 PASS. `ball.png` resta l'asset originale 16×16 su main.
2. **Ispezione raster indipendente in JavaScript V8:** parsing della firma PNG reale, indexed 8bpp, filtro e pixel; mask indices invariati e trasparenza palette index 0; 32 pose per ciascuna delle 5 azioni, 4 hash distinti in ogni direzione, >100 pixel visibili per cella: PASS. Test confine: prima 17 frame al bordo, dopo 0; alpha di bordo trasparente.
3. **Compatibilità statica con PR #28 HEAD `9c00a3298c0083e3836154a1cb1ff22529bf6366`: 15/15 controlli PASS** sul contratto di `asset-adapter.js` / `match-view.js`: asset URL `../../assets/players/`, manifest frame, ID mask RGB red/24 green/64, pivot `(16,29)`, 5 action, 8 direction, passaggio `player.appearance` al renderer, presenza FULL/BROADCAST. È **solo verifica statica di API**, non prova grafica FULL/TV.
4. **Preview visive reali file:** i due PNG offline sono stati rigenerati e osservati; 22 soggetti visibili, due divise distinguibili e portieri separati nella composizione. La review artistica su device fisico non è sostituita da tale preview.
5. **Node su questo nuovo HEAD: NON ESEGUITO.** Nel precedente audit R04 indipendente, Node `node --test oronzo/assets/players/qa-atlas.test.mjs` passava 4/4 prima della nuova asserzione di margine; per R10 il nuovo test è stato verificato con la logica equivalente su dati PNG in V8, NON via Node CLI.

### Blocco Chromium/HTTP effettivamente riprodotto

- Ambiente locale: `git version 2.47.3`, Node `v22.16.0`, `python3` 3.13.5, `/usr/bin/chromium` presente, Python Playwright importabile.
- `git ls-remote https://github.com/CzekUns/cercax.git HEAD`: `fatal: unable to access ... Could not resolve host: github.com`. Non è quindi stato possibile ottenere qui un checkout integrale da rete; i file PNG/sorgenti sono stati verificati tramite il connettore GitHub, per SHA e base64.
- Server locale di controllo `python3 -m http.server 8764 --bind 127.0.0.1 --directory /mnt/data/oronzo-r02-review`; `curl -I http://127.0.0.1:8764/index.html` → **HTTP/1.0 200 OK**.
- Chromium via `playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox','--disable-dev-shm-usage'])` si avvia, ma `page.goto('http://127.0.0.1:8764/index.html')` fallisce **`net::ERR_BLOCKED_BY_ADMINISTRATOR`**. Identico errore tentando `http://localhost:8764/index.html` e `file:///mnt/data/oronzo-r02-review/index.html`.
- Anche con flag `--no-proxy-server` la navigazione risulta bloccata. La versione Playwright bundled senza path esplicito indica `Executable doesn't exist` per `chromium_headless_shell-1200`.
- Poiché **anche la pagina HTTP di controllo** è bloccata, il runtime autentico della demo #29 e l'harness FULL/TV #28 **non sono stati aperti in Chromium**. **Screenshot Chromium reali: 0**. `assetState=ready`, Network PNG caricati, animazioni e crop in browser: **NON VERIFICATI**. Nessun claim PASS del gate browser.

### Integrazione consigliata ad Agente 05 e 10

- La PR #28 include già `oronzo/systems/match-view/browser-qa-playwright.py` e `browser-qa.html`, predisposti per 3 viewport × FULL/TV × 9 scenari (54 prove). Il test richiede espressamente `assetState='ready'`, `allRealSprites=true` e `realSprites=22` senza fallback; lo script è del 05, qui solo letto.
- Provare la camera subito con **PNG già su main** (non aspettare il merge #29), poi ripetere il gate su checkout combinato con #29 HEAD qui verificato, preservando motore e renderer. In `match-view.js`, `kitFor(player)` consente override `player.appearance`; per look persistenti il 05/08 devono fornire skin/hair/kit collegati all'ID reale (non index demo).
- Prima del merge è necessaria una sessione con Chromium HTTP navigabile: screenshot veri a 640×360 e 844×390 su idle/run/kick/tackle/keeper, otto direzioni, due squadre, portieri e TV/FULL, Network 200 PNG e `assetState=ready`. Test da riprodurre: `node --test oronzo/assets/players/qa-atlas.test.mjs` e `python oronzo/systems/match-view/browser-qa-playwright.py --browser /usr/bin/chromium` dal checkout combinato.

**Esito complessivo R10:** `ASSET_PASS / BROWSER_BLOCKED / ART_GATE_HOLD`. Correzione concreta committata, test PNG verificati; richiesto audit indipendente in ambiente con Chrome senza blocco. **Nessun merge eseguito.**
