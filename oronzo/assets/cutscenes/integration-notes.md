# ORONZO — Agente 2 / Cutscene (integrazione)

Cartella **solo** `oronzo/assets/cutscenes/`. Nessun cambiamento all'entry di CercaX o a `oronzo/game.js` in questa PR. Asset originali, risoluzione logica 320×180, strisce da 6 frame (1920×180), PNG RGBA con pixel art a bordi duri.

## Integrazione consigliata con il gioco (orchestratore)

```html
<!-- Dentro la view della partita, sopra #pitch; non dentro il canvas del campo -->
<div id="cutsceneLayer" hidden>
  <canvas id="cutsceneCanvas" width="320" height="180"></canvas>
</div>
<style>
  #cutsceneLayer { position:absolute; inset:0; z-index:20; display:grid; place-items:center; pointer-events:none; background:#081322ba; }
  #cutsceneLayer[hidden] { display:none; }
  #cutsceneCanvas { width:min(100%, 160vh); max-height:100%; aspect-ratio:16/9; object-fit:contain; image-rendering:pixelated; }
</style>
```

```js
import {OronzoCutscenePlayer} from './assets/cutscenes/cutscene-player.js';
const cutsceneLayer=document.getElementById('cutsceneLayer');
const cutscene=new OronzoCutscenePlayer(document.getElementById('cutsceneCanvas'), {
  onComplete: () => { cutsceneLayer.hidden=true; }
});
await cutscene.init();
function showCutscene(type, appearance={}) {
  cutsceneLayer.hidden=false;
  cutscene.play(type, {appearance, pattern:'solid',loop:false}).catch(error => {
    console.warn('Cutscene fallback:',error);
    cutsceneLayer.hidden=true; // la partita resta utilizzabile
  });
}
// Hooks semantici del game loop, da usare senza fermare il cronometro:
// EVENTO:                             TRIGGER:
// gol:                                showCutscene('goal', appearanceOfScorer)
// parata:                             showCutscene('save', appearanceOfKeeper)
// ammonizione:                        showCutscene('yellow', appearanceOfBookedPlayer)
// espulsione:                         showCutscene('red', appearanceOfSentOffPlayer)
// infortunio:                         showCutscene('injury', appearanceOfInjuredPlayer)
```

**Nota per `game.js` esistente:** l'entry attuale è un IIFE JS classico (non un `type="module"`). Non incollare un `import` statico dentro l'IIFE. L'orchestratore può usare `import('./assets/cutscenes/cutscene-player.js')` in modo dinamico, aggiungendo il canvas sopra il campo e lasciando intatto il ciclo di simulazione. Gli hook dei gol già passano dalla funzione `scene(title, detail)`; lì è possibile chiamare `showCutscene('goal')`. Le altre scene richiedono trigger futuri nel motore: **non** sono già collegate nel simulatore.

## Material masks

Per ogni `<evento>.png` ci sono `<evento>_materials.png` e `<evento>_shades.png`, entrambi 1920×180 a livelli di grigio, **allineati pixel per pixel**. Il valore R dei pixel della maschera materiali indica `material ID` da `manifest.json`. Il valore R della maschera ombre indica lo shade `0,1,2,3`. Materiale 0 = pixel trasparente. Ogni materiale ha una scala predefinita di quattro colori; `appearance` può sovrascrivere `skin`, `hair`, `shirt`, `shirtB`, `shorts`, `socks` con codici HEX. Il renderer usa la scala 1.26× / 1× / .73× / .48× sul colore selezionato per rispettare le ombre, senza interpolazione tra pixel.

`refereeShirt`, `refereeShorts`, `refereeSocks` sono **materiali distinti** perché due personaggi compaiono assieme. Il portiere usa il set verde di default in `manifest.json` (`defaultAppearance`). Le fantasie `vertical`, `horizontal`, `halves` operano sul materiale `shirt` relativo al bbox del torso, con `shirtB` come tinta secondaria; sono modificabili senza ridipingere i PNG.

## Specifiche esatte

| Trigger | Sprite | Sfondo | FPS | Durata |
|---|---|---|---:|---:|
| goal | `goal_celebrate.png` | `stadium_background.png` | 10 | 600 ms |
| save | `goalkeeper_save.png` | `stadium_goal_background.png` | 10 | 600 ms |
| yellow | `yellow_card.png` | `stadium_background.png` | 8 | 750 ms |
| red | `red_card.png` | `stadium_background.png` | 8 | 750 ms |
| injury | `injury.png` | `stadium_background.png` | 8 | 750 ms |

Il giocatore è alto circa 90–100 pixel. Sfondo e personaggi separati e riusabili. Ogni scena ha pivot e coverage in `manifest.json`. Animazioni non cicliche in produzione; la demo consente il loop per ispezione.

## Anteprima & QA

Aprire `demo.html` da GitHub Pages **dopo il merge**, oppure in locale servire la cartella via `python -m http.server 8000` dalla root del repo e aprire `http://localhost:8000/oronzo/assets/cutscenes/demo.html`.

Eseguire `python oronzo/assets/cutscenes/qa_assets.py`. Il controllo verifica dimensioni (1920×180), alpha esatto, palette materiali, 30 frame non vuoti, mask/alpha identici e ricostruzione visiva dei pixel dalle palette. Il `qa_overview.png` è un contact sheet estratto da **frame 1, 3 e 6** per ciascuna scena.

### Limiti dichiarati

- I 30 frame sono keyframe originali. Fra i frame non esiste interpolazione scheletrica o motion blur (fedele al periodo), quindi le azioni sono volutamente brevi.
- L'illustrazione è sprite art originale realizzata con tecnica procedurale: la precisione delle maschere e la continuità delle parti sono elevate; **la complessità pittorica delle figure non raggiunge ancora completamente** la ricchezza della fotografia digitalizzata `images.jpeg` di riferimento. L'asset non è un placeholder geometrico, ma resta soggetto ad approvazione artistica.
- Le animazioni sono integrate nella **demo autonoma** e pronte come modulo JS: non si modifica `oronzo/game.js` perché fuori dal perimetro dell'agente; l'orchestratore deve inserire i trigger.
