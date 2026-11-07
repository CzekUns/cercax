# ORONZO — Match View / Agente 5

Canvas 2D a **640 × 360**, proporzioni 16:9, JavaScript ESM senza librerie esterne e con sprite in pixel art. Riceve i fatti dal `MatchSnapshotV1` dell'Agente 6, non calcola le azioni calcistiche. Un renderer indipendente dai tick mostra 22 giocatori, palla, azioni e intermezzi.

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

`render()` preserva `snapshot.t`, risultato, possesso e statistiche. L'interpolazione collega giocatori per **ID**, non per ordine in array. `facing` accetta N/NE/E/SE/S/SW/W/NW, i nomi estesi inglesi, **+1 = E / -1 = W** (convenzione motore Agente 6), radianti espliciti `{radians}`, o vettore `{x,y}`; come fallback si usano `vx/vy`. Nessun calcolo di collisione, possesso o fuori gioco. `energy` arriva dal motore su **0..100** e diventa **0..1** nel renderer; la fixture usa anch'essa 0..100. Il valore 1 del motore rappresenta l'1%, non il 100%. I nuovi `kickoff`/`halftime` e i cambi fase sono scene cut senza interpolazione di posizioni e palla. `action` si mappa a `idle/run/kick/tackle/keeper` e usa la sequenza/fps documentata dal manifest degli sprite.

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