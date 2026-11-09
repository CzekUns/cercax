# Oronzo / Agent A — integration notes

Created for issue #1, 2026-11-06. Scope: only `oronzo/assets/players/`.

## Files
Five authentic 256x128 indexed PNG action atlases: `idle.png`, `run.png`, `kick.png`, `tackle.png`, `keeper.png`.
Matching masks `*-mask.png`, 16x16 `ball.png`, generator, manifest, recolorer and landscape demo.

## Geometry
8 columns follow N NE E SE S SW W NW; 4 rows follow frames 0 1 2 3.
Cells are exactly 32x32; pivot=(16,29) at the feet. Never crop per-frame bounding boxes
when rendering. No filtering: CSS `image-rendering:pixelated`, Canvas `imageSmoothingEnabled=false`.

## Browser integration (for orchestrator)
Load `oronzo/assets/players/palette.js` after DOM. Do NOT replace the existing match fallback until ready.
```js
const atlas = await OronzoPalette.prepare("run", {
  skin:"#BC8151", hair:"#302015", shirt:"#304A97", shirtB:"#F4F4E9",
  shorts:"#F1EFEA", socks:"#F6F6F1", boots:"#161921", pattern:"vertical"
}, "assets/players/");
OronzoPalette.draw(ctx, atlas, "SE", 2, playerScreenX, playerScreenY, 2);
```
The path is relative to `oronzo/index.html` when called from that page.
Memoize the prepared atlas per team/player appearance; `prepare` caches.
For animation: `Math.floor(elapsedSeconds*manifest.actions.run.fps)%4`.
Outlines, skin, hair, shorts, socks and shoes shade independently; match pixels use mask RGB
red=24*(materialId+1), green=64*shade. Default sprite is indexed palette, mask is equally aligned.
`shirtB` and `pattern` select solid, vertical, horizontal or halves in torso coordinates.
The back number must be a separate overlay, never painted onto atlas textures.

## Known limitations
- 32x32 is the hard limit for faces and sleeve detailing; do not stretch with bilinear filtering.
- The five animation sequences share one character build, not five visually unrelated people.
- Keeper has glove material 7; game can set `gloves` independently of kit.
- Torso pattern UV is computed procedurally from action/direction/frame, not a separate UV bitmap.
- Ref issue explicitly assigns merge/integration to the orchestrator; no main game files were changed.


## Agente 01 — R02, 1979 / QA FULL CAMPO 22 giocatori

- Nuovo branch: `agent/oronzo-players-r02`, partenza da `main` **dopo merge di PR #6**. PR di questo ciclo da linkare nel REPORT.
- I 10 PNG dei cinque atlas e delle cinque maschere sono rigenerati con `sprite-factory.js`: micro-rifiniture di viso/capelli, cuciture/colletto, fascia dei calzettoni, tacche delle scarpe. **Nessuna variazione a geometria, FPS, ordine direzioni, pivot (16,29), dimensioni 256×128, maschera indexed o ID materiale**.
- `manifest.json` conserva le vecchie API/azioni `idle/run/kick/tackle/keeper`; `version=1.1.0`, `artRevision=R02-1979-fullfield`, nuovi metadati di sola annotazione `visualQA`. Lettori v1 possono ignorarli.
- `team-looks.js` è un **catalogo visuale opzionale**, non dati della carriera. `OronzoTeamLooks.appearance('home'|'away', index, keeper)` restituisce i colori `skin/hair/shirt/shirtB/shorts/socks/boots/gloves` e il `pattern`. `roster()` crea 22 look per la demo; l'ID è solo demo. In gioco reale, 05/08 devono fornire apparenza persistente basata sull'identità canonica del calciatore (mai ricrearla al cambio formazione).
- `match-22-demo.html` carica direttamente `palette.js` e `team-looks.js`, usa i cinque atlanti, mostra sempre **11 contro 11**, quattro palette (due squadre e due portieri), otto direzioni e cambi di animazione. **È solo demo visuale**: nessun gol, tattica, movimento del motore o camera televisiva implementato. Per provarla servire la directory via HTTP locale: `python3 -m http.server 8000` dalla root, poi `http://localhost:8000/oronzo/assets/players/match-22-demo.html` in landscape.
- Le prove `match-22-preview-640.png` (640×360) e `match-22-preview-844x390.png` (844×390, letterbox 16:9 e nearest-neighbor) sono **render offline con i veri indici degli atlas**, NON screenshot del browser. La seconda vista preserva il campo intero con bande laterali, senza distorsione.
- `qa-atlas.test.mjs` è eseguibile con `node --test oronzo/assets/players/qa-atlas.test.mjs`. Senza dipendenze esterne: confronta PNG byte-for-byte con il generatore, maschere, frame, materiali e 22 look. I test V8 del REPORT sono realmente eseguiti in questa sessione; **il test Node/Chromium resta da riprodurre da parte dell'integratore se non esplicitamente registrato come eseguito**.

### Hand-off concreto ad Agente 05 (renderer)

La PR #15 ha creato `oronzo/systems/match-view/asset-adapter.js`, che carica `../../assets/players/manifest.json` e ricolora l'atlante via maschera RGB materiale+shade. Lo schema resta compatibile. Per i test con 22 giocatori:
```js
// Esempio per asset-adapter.drawPlayer (solo call-site di Agente 05; non modificato qui)
const kit = OronzoTeamLooks.appearance(team, rosterIndex, isKeeper);
adapter.drawPlayer(ctx, {
  x: screenX, y: screenY, action: 'run', direction: 'SE', frame: 1,
  appearance: kit, team, isKeeper
});
```
In runtime definitivo, `appearance` deve provenire da PlayerV1 persistente/asset team canonici; `team-looks.js` non è sorgente di verità della carriera. Agente 05 scala e proietta le coordinate dallo snapshot: Agente 01 **non cambia** le posizioni del motore né `match-view.js`. Il fallback del renderer resta valido quando PNG/mask non caricano; evitare di rimpiazzare uno sprite finito con segnaposto a caricamento riuscito. Numeri di maglia eventualmente come overlay a runtime.

### Hand-off ad Agente 10 (QA/gate)

Verificare **a schermo** le due squadre e i portieri in **640×360** e **844×390**; contestualizzare scala 1:1 su dispositivo reale, colori contro sfondo verde, direzioni e fotogrammi, nessun ritaglio, nessuna sovrapposizione sistematica. Catturare screenshot reali del browser prima del gate: le due preview renderizzate non sono equivalenti. La **camera televisiva** appartiene esclusivamente ad Agente 05.

## R10 — 8 novembre 2026: border crop e QA browser

- Correzione puntuale su sprite-factory.js: tutti i pixel visibili entro la cella con un margine trasparente di 1px. In run frame 3 e keeper frame 1 testa abbassata di 1px, in kick piede orizzontale limitato. Nessuna modifica a mapping, pivot, materiali o API.
- Test crop nel file qa-atlas.test.mjs. Controllo V8 sul sorgente aggiornato: 160/160 frame senza pixel di silhouette al bordo; per tutte le 8 direzioni 4 frame distinti.
- Anteprime match-22-preview-640.png e match-22-preview-844x390.png rigenerate sui PNG corretti: **raster offline, non screenshot Chromium**.
- Demo agente 01: servire la root del checkout reale con `python3 -m http.server 8000`, aprire http://127.0.0.1:8000/oronzo/assets/players/match-22-demo.html. Verificare `window.__ORONZO_22_QA__.ready===true`, 22 attori, 5 azioni, 8 direzioni, PNG e rete. Catturare viewport 640x360 e 844x390.
- Camera Agente 05, PR #28: file browser-qa-playwright.py e browser-qa.html (54 scenari FULL/BROADCAST). Far girare su checkout combinato PR #28 + PR #29 con assets reali, e verificare assetState='ready', realSprites=22, punteggi invariati. Prima di merge PR #29 la camera può essere provata con i PNG già su main.
- Ambiente attuale agente 01: un server HTTP locale restituisce 200 tramite curl, ma Chromium via Playwright blocca sia http://127.0.0.1 sia file:// con net::ERR_BLOCKED_BY_ADMINISTRATOR. Il checkout Git completo non è stato ottenuto (git ls-remote: Could not resolve host: github.com). Niente screenshot browser reali, gate Chromium/Android ancora HOLD.
