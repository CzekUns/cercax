# ORONZO — UI Art Director · Consegna separata

Questa directory non modifica `oronzo/index.html`, `oronzo/ui.css`, `oronzo/game.js`.

## Arte e riferimento
Otto reference Google Drive osservate (screenshot di International Soccer Challenge, Franco Baresi's World Cup Kick Off, formazione, rosa, campo, intermezzo). Asset artistici ricreati in un'unica palette; NON copiare o redistribuire gli originali. Ritratti e scena d'ufficio sono rielaborazioni di illustrazioni originali generate per questa consegna. Il display resta 16:9 esclusivamente landscape.

## File
Cinque obbligatori: coach-select.png, office-home.png, squad-roster.png, tactics.png, match-hud.png. Extra: training.png, press.png, result.png, components.png, button-normal.png, button-selected.png, button-disabled.png. Tutti i mockup sono 1280×720: pixel logic 640×360 con nearest-neighbor 2×. 

## Integrazione HTML (task orchestratore)
La parte grafica su HTML va ricostruita con livelli DOM separati anziché trasformare i mockup in uno screenshot cliccabile. Mockup per QA/visione; `components.png` è atlas di pannelli/bottoni riutilizzabili senza testi statici. Per pulsanti precisi usare button-*.png come `border-image` o, meglio, nove-slice. Font suggerito Pixelify Sans/Press Start 2P, entrambi OFL 1.1. **Non rendere testo/statistiche leggibili nelle immagini di produzione: sono esempi del mockup.**

Mappatura prototipo corrente:
- `.game`: 16/9 viewport, fixed logical app size scaled with CSS `min(100vw / 640,100dvh / 360)`; `overflow:hidden`. Paesaggio richiesto. Attenzione a Android safe areas e letterboxing proporzionale.
- `.top`: barra ORONZO, logo/crest decorativi, testo e #weekLabel via DOM.
- `.view#home`, `.desk`, `.desk-object`, `.notice`, `#overview`: office-home, scrivania illustrata in backdrop, sette grandi tasti sezioni su overlay HTML.
- `#squad`, `.roster`, `#squadTable`: squad-roster, intestazione fissa e `overflow-y:auto` nella tabella, `.chosen` giallo, indicatori morale e fortuna a DOM.
- `#tactics`, `.chalk`, `.chalk-player`, `.form-grid`, `.control`: tactics, campo 16:9 panoramico in area sinistra e controlli a destra; moduli/slider renderizzati DOM.
- `#match`, `.match-top`, `.match-pitch`, `#pitch`, `.match-actions`, `.match-coach`, `.cutscene`: match-hud, campo più grande possibile a sinistra, HUD destra; usa asset giocatori dell'agente A quando presenti. `#pitch` nel prototipo è 320×440 portrait: l'orchestratore deve modificare la camera per match orizzontale, altrimenti non rispetta il contratto.
- `#training`, `.training-grid`: training, azioni ricche in 2 colonne; `#trainingReport` aggiornabile.
- `.bottom-nav`: tabs a fondo 5×, minimo hit target 44×44 CSS px anche su schermi piccoli.

## CSS seme
```css
:root { --or-blue:#073CD3; --or-gold:#FFDA36; --or-dark:#061144; --or-rim:#A9C8F1; }
.oronzo-stage { aspect-ratio:16/9; width:min(100vw, 177.7778dvh); height:min(100dvh, 56.25vw); overflow:hidden; margin:auto; background:var(--or-dark); position:relative; image-rendering:pixelated; }
.oronzo-stage, .oronzo-stage * { box-sizing:border-box; }
.oronzo-button { min-height:44px; border:3px solid #C4D9FF; border-bottom-color:#061144; border-right-color:#061144; background:var(--or-blue); color:#FFF7D0; border-radius:0; touch-action:manipulation; }
.oronzo-button[aria-pressed="true"] { background:var(--or-gold); color:var(--or-dark); border-top-color:#FFF6A0; border-left-color:#FFF6A0; }
.oronzo-stage .pix { image-rendering:pixelated; }
@media (orientation:portrait) { .oronzo-stage { display:none; } .rotate-notice { display:block; } }
```

## QA
Mockup originali validati a 1280×720 e in scala logica 640×360. A 800×360 e 844×390, mantenere canvas 16:9 letterboxed e usare zone tasto a overlay (touch >=44 CSS pixels); viste di verifica in `qa/`. Ritratti caricaturali originali non basati su persone reali. Limiti: le stringhe sono esempi illustrativi non locali data-binding, e i bitmap dei mockup non sono una UI click-through. L'orchestratore deve implementare overlay interattivi e ridisegno campo.
