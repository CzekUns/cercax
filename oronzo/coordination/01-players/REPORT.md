# RAPPORTO AGENTE 01 — Sprite calciatori — ciclo 01

**ID:** `ORONZO-AGENT-01`  
**Stato:** `PR_OPEN` / `WAIT_REVIEW` (non approvata né mergiata)  
**Branch:** `agent/oronzo-players`  
**PR:** https://github.com/CzekUns/cercax/pull/6  
**Issue:** https://github.com/CzekUns/cercax/issues/1  
**Commit verificato prima del presente rapporto:** `c456f65ecf3e81050bffa56705ebdb2e713e603a`  
**Data della verifica:** 7 novembre 2026  
**Documento di controllo:** `oronzo/coordination/01-players/NEXT.md` su `main`, stato `WAIT_REVIEW`; nessun fix autorizzato/assegnato.

## Realizzato

Il ciclo precedente ha pubblicato nel percorso esclusivo `oronzo/assets/players/`:

- **5 atlanti PNG**: `idle.png`, `run.png`, `kick.png`, `tackle.png`, `keeper.png`, ciascuno `256×128`, 8 direzioni × 4 frame, celle `32×32`, pivot `(16,29)`.
- **5 maschere materiali** allineate pixel per pixel: `idle-mask.png`, `run-mask.png`, `kick-mask.png`, `tackle-mask.png`, `keeper-mask.png`. Palette indicizzata (pelle, capelli, maglia, pantaloncini, calzettoni, scarpe, contorno, guanti, ombra), quattro gradazioni.
- **`ball.png`** `16×16` e **`palette-preview.png`** `640×360` (anteprima renderizzata, *non* screenshot di Chromium).
- **`manifest.json`** con coordinate di 160 frame, FPS, pivot, direzioni e mapping materiali.
- **`palette.js`**: API `OronzoPalette.load(action, basePath)`, `prepare(action, appearance, basePath)`, `recolorAtlas(source, action, appearance)`, `draw(ctx, atlas, direction, frame, pivotX, pivotY, scale)`, `frameRect(direction, frame)`, `clear()`. Varianti `solid`, `vertical`, `horizontal`, `halves`; caching di atlas ricolorati.
- **`palette-demo.html`** demo 16:9 e **`sprite-factory.js`** sorgente di rigenerazione PNG; `integration-notes.md` e `qa-report.json`.

**Nella ripresa del 7 novembre** non ho cambiato gli asset: il gate `WAIT_REVIEW` non consente nuove funzionalità né correzioni non richieste. Ho svolto QA supplementare e creato il presente rapporto, eccezione autorizzata al perimetro.

## Verifiche — eseguite realmente

### QA sorgente/manifest (7 novembre)

- Ho caricato **`sprite-factory.js`, `manifest.json`, `palette.js` direttamente dal branch della PR #6** ed eseguito una suite ad hoc in un isolate JavaScript V8, non in un browser reale.
- **1.788 assert / 1.788 superati / 0 falliti**: firma e struttura PNG rigenerati, palette indicizzata a 8 bit, filtro raster, trasparenza index 0, geometria `256×128` (pallone `16×16`), identità indice-pixel delle coppie atlas/maschera, indirizzamento frame, pivot, 4 frame distinti per ogni direzione e per ognuna delle 5 animazioni, metadati del manifest, `frameRect`, offset di `draw`, ripristino del flag `imageSmoothingEnabled`.
- Ho poi letto **tutti gli 11 PNG binari dal branch GitHub tramite `fetch_file` con `encoding=base64`** e li ho confrontati **byte per byte** con quelli rigenerati dal generatore sul branch: **11/11 coincidenti**, nessuna discrepanza. La preview composita non è inclusa in questi 11 binari funzionali.

### QA ricolorazione (7 novembre)

- Ho decodificato in memoria i PNG di `run` e `run-mask`, fornito al modulo `palette.js` un canvas simulato sufficiente a eseguire realmente `recolorAtlas`, e verificato **1.642 pixel di maglia** con la stessa palette per quattro pattern.
- Risultati: `solid` **1642 A / 0 B**, `vertical` **929 A / 713 B**, `horizontal` **805 A / 837 B**, `halves` **960 A / 682 B**; **0 pixel con colori estranei** alla coppia prevista per il materiale e il livello di ombra.
- Superati: **cache hit**, mantenimento alpha per tutti i pixel, conservazione della trasparenza, indipendenza dei colori della pelle dal pattern, canvas distinti per pattern diversi.
- Si tratta di **test raster in V8 con canvas simulato**; non equivalgono a una prova Chromium, a uno screenshot o alla verifica visiva sul cellulare.

### GitHub / stato di integrazione

- Issue #1 letta; unico commento visibile è il messaggio di coordinamento permanente, **nessuna richiesta di fix**.
- PR #6: **aperta, non mergiata**, senza review/commenti inline al controllo. Il confronto con `main` mostrava 18 file del pacchetto iniziale, tutti in `oronzo/assets/players/`, prima dell'aggiunta di questo REPORT.
- Il branch di PR al momento della verifica risultava **43 commit indietro** rispetto a `main`, ma il confronto su file non esponeva modifiche esterne al perimetro. Non ho fatto rebase né merge automatico.
- Reference Drive: **otto immagini osservate durante il ciclo iniziale**, riferimento match principale `reteee-2.png`. La conformità artistica definitiva è ancora soggetta a QA dell'orchestratore.

## Integrazione

L'**Agente 05**, PR https://github.com/CzekUns/cercax/pull/15, prepara il renderer della partita 22 giocatori e può consumare questi atlanti tramite manifest/palette; l'**Agente 06**, PR https://github.com/CzekUns/cercax/pull/18, produce i fatti di partita. L'orchestratore resta proprietario del wiring verso `oronzo/game.js`. Nessun file di tali agenti è stato modificato.

L'uso corrente previsto è:

```js
const atlas = await OronzoPalette.prepare("run", {
  skin: "#BC8151", hair: "#302015",
  shirt: "#304A97", shirtB: "#F4F4E9",
  shorts: "#F1EFEA", socks: "#F6F6F1",
  boots: "#161921", pattern: "vertical"
}, "assets/players/");
OronzoPalette.draw(ctx, atlas, "SE", 2, x, y, 2);
```

Disegno in coordinate del **pivot a terra**, non dell'angolo alto sinistro. `image-rendering: pixelated` e `ctx.imageSmoothingEnabled=false` sono necessari. Il renderer deve mantenere un fallback quando gli asset non caricano.

## Mancante / problemi

1. **QA browser non eseguita**: non esistono qui screenshot verificati in Chromium alle viste **640×360, 800×360, 844×390**. La precedente `palette-preview.png` è una preview raster, non una cattura del DOM/browser.
2. **Qualità artistica da accettare**: le dimensioni e il pixel-perfect sono verificati, ma la somiglianza qualitativa con le reference resta giudizio dell'orchestratore su partita reale.
3. **Non integrato nel runtime del gioco**: `game.js`, il renderer della PR #15 e gli effetti effettivi degli input di gara non sono stati testati come end-to-end in questa sessione.
4. **Branch non sincronizzato con l'ultimo main** alla verifica, ma nessuna correzione autorizzata o conflitto reale provato. Rilevare e gestire eventuale rebase solo se richiesto.

## Proposta prossimo ciclo (solo previa decisione orchestratore)

1. Eseguire QA *reale* della demo/browser alle tre risoluzioni landscape e fotografare gli esiti; validare resa rispetto a `reteee-2.png`.
2. Eseguire smoke con Agente 05 dopo integrazione autorizzata, verificando skin/pattern, pivot e animazione 22 giocatori.
3. Solo dopo un eventuale `READY` su `NEXT.md`: migliorare le pose più deboli secondo feedback artistico concreto, senza rigenerare da zero gli atlanti accettati.

**Nessun merge effettuato.** Il presente `REPORT.md` è pubblicato unicamente sul branch corrente della PR #6.
