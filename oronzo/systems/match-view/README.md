# ORONZO — Match View / Agente 5

## R10 — QA PNG autentici e camera TV (8 novembre 2026)

La PR #28 conserva la API `view.setCameraMode('full'|'broadcast')`. R10 corregge anche una regressione individuata **nelle immagini Chromium**: quando `config.appearances` è omesso, `kitFor()` passava `{}` e `asset-adapter.drawPlayer()` ignorava i kit di default, mostrando due squadre con la stessa maglia. Ora `resolvePlayerAppearance({team,isKeeper,appearance})` unisce i default casa/trasferta/portiere con gli override individuali senza perderli. Tre nuovi test Node coprono colori distinti, GK e override parziali.

**PNG autentici verificati:** i 5 atlas, le 5 maschere e la palla sono stati rigenerati con `oronzo/assets/players/sprite-factory.js` *già su main*; i rispettivi **11 SHA Git blob coincidono esattamente** con `oronzo/assets/players/qa-report.json`. La prova Chromium ha renderizzato realmente questi PNG (mai fallback) per 22 giocatori in entrambe le camere.

**Evidenze R10:** [QA-R10-REAL-PNG.json](QA-R10-REAL-PNG.json) registra le 54 prove, gli hash di sei screenshot campione, gli SHA Git di tutti gli asset e l'esito di Node. Tre viewport (640×360, 800×360, 844×390), due modalità e nove scenari (opening, corners, running, restart, halftime, paused, replay, late): **54/54 PASS** per caricamento PNG, `assetState=ready`, `allRealSprites=true`, palla visibile, snapshot e score invariati, aspect ratio/contain, pausa e replay. La pausa genera due passaggi di rendering (44 draw call) di 22 attori, non 44 giocatori distinti.

**Distinzione obbligatoria HTTP/browser:** il server locale risponde HTTP 200 con i PNG originali, ma il Chromium amministrato di questo ambiente rifiuta ogni navigazione URL con `net::ERR_BLOCKED_BY_ADMINISTRATOR` perché la policy `URLBlocklist:["*"]` è gestita. Non è stata modificata né elusa la policy. Il controllo grafico alternativo **usa davvero Chromium e le immagini PNG originali**, tramite `page.set_content` e `data:image/png`, non la navigazione HTTP. Per riprodurlo su checkout PR:

```bash
python3 oronzo/systems/match-view/browser-qa-offline.py --browser /usr/bin/chromium --output /tmp/oronzo-r10-offline
node --test oronzo/systems/match-view/*.test.mjs
```

Per il gate **HTTP vero** in un host senza blocco, usare lo script preesistente:

```bash
python3 oronzo/systems/match-view/browser-qa-playwright.py --browser /usr/bin/chromium --output /tmp/oronzo-r10-http
```

Non dichiarare superato il gate HTTP se lo script restituisce `ERR_BLOCKED_BY_ADMINISTRATOR`. Le screenshot offline sono prove reali della resa Canvas/PNG e sono separate dal gate di navigazione HTTP. Il selettore nel runtime principale resta di competenza dell'Agente 12; questa PR aggiorna solo il renderer e la QA.


Canvas 2D a **640 × 360**, proporzioni 16:9, JavaScript ESM senza librerie esterne e con sprite in pixel art. Riceve i fatti dal `MatchSnapshotV1` dell'Agente 6, non calcola le azioni calcistiche. Un renderer indipendente dai tick mostra 22 giocatori, palla, azioni e intermezzi.

## Ciclo R02 — doppia camera v0.2

La PR del secondo ciclo aggiunge il **solo rendering** della camera TV e lascia intatta la simulazione dell'Agente 6. Il campo e gli sprite sono disegnati sempre nelle coordinate originali `640×360`; un transform Canvas viene applicato solo mentre si disegna il mondo di gioco.

- `cameraMode: 'full' | 'broadcast'` nella config di `createMatchView`; default `full` come nella partita rapida attuale.
- `view.setCameraMode('broadcast')` e `view.setCameraMode('full')` cambiano vista a partita in corso senza chiamare il motore. `view.cameraMode` e `view.getCameraState()` consentono controlli e test. `cameraZoom` è 2 per default (pixel-art nearest neighbor); `cameraHalfLifeMs` è 190.
- `camera.js` esporta funzioni pure `followCamera`, `cameraTransform`, `ballWorldPosition`, `worldToScreen`, `fitLandscapeViewport` e `validateCameraMode`. Camera vincolata all'area video: nessuna inquadratura vuota, pallone sempre nella finestra ritagliata.
- Il tracking usa **solo** `snapshot.ball` dopo l'interpolazione; il renderer non modifica `snapshot.players`, la palla, gli ordini, il punteggio o il seed. Kickoff/intervallo/rewind sono tagli immediati per evitare un pan impossibile.
- Etichette tecniche e cutscene sono disegnate fuori dalla trasformazione, in coordinate schermo. La modalità TV può tagliare alcuni giocatori lontani dalla palla: è l'effetto previsto dello zoom.
- **v0.2:** il parametro visivo `simSecondsPerRealSecond` predefinito è **6**, coerente con `quick-match-clock.js` (90 minuti in ~15 minuti reali a 1×), non il valore storico 60. Le velocità 1/2/4/8 moltiplicano soltanto il runner.
- `match-view-demo.html` espone il pulsante FULL/TV. Per provarla da `main` dopo il merge basta servire la directory via HTTP; nessuna modifica a `partita-rapida.html` è inclusa in questo branch.

### QA del secondo ciclo

`node --test oronzo/systems/match-view/*.test.mjs` esegue anche `camera.test.mjs` e `camera-integration.test.mjs` (12 prove nuove). I test coprono tutte le estremità del campo, pan smussato, restart, pausa, stessa fonte di 22 snapshot su due viste, viewport 640×360/800×360/844×390, commutazione runtime e dati simulativi invariati. Il controllo geometrico di `fitLandscapeViewport` è separato dalla prova visiva device.

**Limite QA:** per questo ciclo i test Node del nuovo renderer sono stati eseguiti su un checkout di lavoro con il codice camera e una copia compatibile del renderer precedente; non è stato possibile acquisire uno screenshot con Chromium (`net::ERR_BLOCKED_BY_ADMINISTRATOR` sul server locale). L'integrazione nel runtime di partita rapida e la verifica grafica manuale degli sprite reali su Android competono ai cicli successivi.

## Eseguire la demo

Dalla root della repository:

```sh
python3 -m http.server 8000
```

Aprire `http://localhost:8000/oronzo/systems/match-view/match-view-demo.html` e ruotare lo smartphone in orizzontale. Funzionano pausa, ripresa, riavvio, velocità **1× / 2× / 4× / 8×**. Il feed `fixture.js` usa **22 giocatori** e azioni *preprogrammate soltanto per collaudare l'animazione*. Gol e risultato fittizi sono proprietà del feed di test, mai generati dalla vista.

Gli atlas dei colleghi devono prima arrivare su `main` nelle cartelle `oronzo/assets/players/` e `oronzo/assets/cutscenes/`. In loro assenza la demo rimane eseguibile e scrive **FALLBACK ASSET** sul campo, distinguendo nettamente la grafica provvisoria. La demo non è ancora inserita nel runtime `oronzo/game.js`.

## API

```js
import {createMatchView} from './systems/match-view/match-view.js';
const view = createMatchView(document.querySelector('#pitch'), {
  config: {
    homeTeamId: 'club-home', awayTeamId: 'club-away',
    keeperIds: ['home-1','away-1'],
    appearances: {
      home: {shirt:'#e7e3d4',shirtB:'#30539d',pattern:'vertical',shorts:'#243977'},
      away: {shirt:'#b6384a',shorts:'#f2e9df'},
      homeKeeper: {shirt:'#d3b24b'}, awayKeeper:{shirt:'#5c9b85'}
    }
  }
});
await view.ready;                 // non obbligatorio; mostra fallback fino al caricamento
view.render(snapshotFromEngine); // 1 chiamata per ogni snapshot MatchSnapshotV1
view.setSpeed(2);                 // deve seguire la velocità del runner
view.setPaused(true);            // mantiene immobile il frame durante la pausa
view.selectPlayer('home-8');
view.resize();                   // buffer sempre 640×360, CSS responsive
view.destroy();                  // annulla RAF e rilascia cache
```

### Bridge consigliato per gli eventi del motore (FIX ORZ-P1-004)

`createEngineViewBridge(engine, view, {keeperIds,initialEventId})` usa **una sola chiamata** a
`getEventsSince(cursor)` per ogni `sync()`; sovrascrive `snapshot.events` con il feed autorevole
per non perdere gli eventi `command()` cancellati dallo `step()` successivo. Mantiene un cursore
numerico monotono, evita consegne duplicate, e sostituisce l'ID portiere in `setKeepers()`
quando riceve `substitution` con `detail.outId`/`detail.inId`. `sync()` **non chiama**
`engine.step()`/`advanceRealSeconds()` e non altera il punteggio. Per rigiocare una partita
chiamare `bridge.reset(0, [nuoviGK])`. Esempio in `integration-notes.md`.

`render()` preserva `snapshot.t`, risultato, possesso e statistiche. L'interpolazione collega giocatori per **ID**, non per ordine in array. `facing` accetta N/NE/E/SE/S/SW/W/NW, i nomi estesi inglesi, **numeri in radianti** (E=0, S=π/2, W=π, N=−π/2), radianti espliciti `{radians}`, o vettore `{x,y}`; come fallback si usano `vx/vy`. Nessun calcolo di collisione, possesso o fuori gioco. `energy` arriva dal motore su **0..100** e diventa **0..1** nel renderer; la fixture usa anch'essa 0..100. Il valore 1 del motore rappresenta l'1%, non il 100%. I nuovi `kickoff`/`halftime` e i cambi fase sono scene cut senza interpolazione di posizioni e palla. `action` si mappa a `idle/run/kick/tackle/keeper` e usa la sequenza/fps documentata dal manifest degli sprite.

`createMatchView(canvas,{assetLoader,config})` accetta un loader opzionale `{loadJson(url),loadImage(url)}`; utile per test/offline e per l'integrazione. `config.clock`, `requestFrame`, `cancelFrame` permettono test deterministici. `onWarning` raccoglie fallimenti non fatali degli asset.

## Files

- `interpolation.js`: normalizzazione, coordinate 0..1, direzione e interpolatore indipendente dal motore.
- `asset-adapter.js`: carica i manifest, atlas/mask dell'Agente 1, ricolora le uniformi con cache; mostra la palla PNG; visualizza strisce/bkg cutscene dell'Agente 2.
- `match-view.js`: campo pixelated 16:9, proiezione delle posizioni, frame delle animazioni, indicatori, selezione, eventi con cooldown.
- `fixture.js`, `match-view-demo.html`: feed dimostrativo e pannello di prova landscape.
- `match-view.test.mjs`, `asset-adapter.test.mjs`, `compatibility.test.mjs`: test nativi + regressioni per gli ID dell'audit R01.
- `integration-notes.md`: passaggio operativo all'orchestratore.

## Test eseguiti

```sh
node --test oronzo/systems/match-view/*.test.mjs
```

Non serve `npm install`. La demo è servita con HTTP statico perché i browser applicano restrizioni CORS ai moduli e a `fetch()` di `file://`.

Verificato in locale con Node 22.16.0: **22 test passati / 0 falliti** (`node --test *.test.mjs` dalla directory). Il test del bridge usa una fixture che riproduce il comportamento osservato nel motore di PR #18; **il vero runner completo e il browser smartphone non sono ancora stati integrati né testati**.

## Limiti dichiarati

- **Visual-only:** accelerazione, corsa, contrasti e smarcamento si vedono se il motore emette i relativi spostamenti e `action`; non c'è una IA calcistica duplicata qui.
- Asset A/B presenti sui rispettivi branch al momento dello sviluppo; una PR indipendente non può materialmente includerli fuori dalla propria directory. Fino al merge, fallback tecnico.
- Sprite `32 × 32` ancorati al pivot `(16,29)`, atlas direzioni 8 e 4 frame. Le 5 azioni condivise sono reali. Tackle, shot e save one-shot mantengono l'ultimo frame finché lo snapshot del motore non cambia azione.
- Cutscene: ricostruzione tramite strip, background e maschere degli asset dell'Agente 2; l'overlay non interrompe gli snapshot. In assenza delle immagini, titolo testuale di emergenza.
- Full-field: l'intero terreno è sempre visibile; nessun pan che tagli una porta. Interpolazione lineare a fine corsa per non inventare traiettorie, durata ancorata al tempo calcistico/velocità del runner.
## R04 — QA browser riproducibile e gate ancora aperto

Nuovo harness esclusivamente nella directory dell'Agente 05:
- **browser-qa.html**: scenario UI FULL/TV, 22 giocatori e palla, 9 casi (kickoff, angoli, ripresa gol, intervallo, pausa, replay), carica i veri manifest/PNG quando la pagina è servita via HTTP. Espone window.ORONZO_MATCH_VIEW_QA.run(scenario,mode), che verifica numero sprite realmente disegnati, ball screen bounds, score e viewport.
- **browser-qa-playwright.py**: avvia server HTTP temporaneo da root, usa Chromium, salva screenshot e results.json con SHA-256, 3 viewport × 2 camere × 9 scenari = 54 prove. Senza --allow-fallback FALLISCE se assetState non è ready o se gli atlas non disegnano i 22 sprite.
- **camera-r04.test.mjs**: tre nuovi test Node, incluso fix overlay vecchio gol dopo rewind. match-view.js ora cancella overlay e frame state quando il tempo della partita torna indietro.

### Esecuzione dalla root del repository

    python3 -m pip install playwright
    python3 oronzo/systems/match-view/browser-qa-playwright.py --browser /usr/bin/chromium --output /tmp/oronzo-r04
    node --test oronzo/systems/match-view/*.test.mjs

Esaminare gli screenshot prodotti e il JSON. Il browser Playwright va installato se non si indica un Chromium di sistema. L'opzione --allow-fallback è soltanto diagnostica: non supera il gate visivo degli asset.

### Verificato e non verificato in R04

- Il report Work 00 R04 certifica 34/34 test Node sul branch PR #28 precedente (non ripetuti integralmente in questa chat).
- Su copia locale compatibile: tre test di regressione nuovi 3/3 e suite locale ricostruita 15/15. Browser Chromium 144 tramite pagina in memoria: 54/54 scenari geometrici con fallback tecnico (realSprites=0) e screenshot; controllo CSS della pagina QA a 640×360, 800×360 e 844×390 3/3.
- Tentativo di caricare la pagina via HTTP con asset originali: Page.goto: net::ERR_BLOCKED_BY_ADMINISTRATOR, zero screenshot con PNG reali. Perciò rimangono NON VERIFICATI qualità finale, palette e animazioni degli atlas in browser reale e su Android. L'orchestratore deve mantenere HOLD per il gate artistico.
- Nessun intervento in oronzo/partita-rapida.html o nei moduli degli altri agenti.
