# ORONZO R02 — Kit UI dinamico / istruzioni integratore

**Autore:** `ORONZO-AGENT-03`. **Stato:** demo grafica autonoma, **non** runtime carriera. **Specifica:** `GAME-VISION-v02.md`, `03-ui/NEXT.md` su main, 7 novembre 2026.

## Apertura e file

Aprire `demo-v02.html` da server statico, insieme a `demo-v02.css`, `demo-v02.js`, alle texture e ai tre atlanti. La demo funziona anche senza rete (font di sistema). Gli elementi visivi sono separati da testo e dati. Le otto grandi schermate del ciclo R01 restano reference artistiche e non sono usate come screenshot cliccabili.

La demo offre le otto viste `entry`, `avatar`, `offers`, `president`, `press`, `hub`, `prematch`, `match`. Barra superiore, pannelli, area scrollabile e tab inferiori restano nel DOM. Le immagini non contengono città, statistiche, morale, badge salariali o risultati.

`ui-v02-manifest.json` è il contratto machine-readable per texture, cella e griglia degli atlanti, aree dinamiche e hotspot semantici; i pulsanti DOM si individuano tramite `[data-action][data-value]`. Non sono coordinate pixel fisse perché le zone cambiano larghezza al letterboxing. Bottone/nav hanno almeno 44 CSS px di altezza (testato via Chromium ai viewport richiesti). I punti sul campo di 17×17 pixel sono **marcatori dimostrativi non cliccabili**, perciò non sono target touch.

## Asset compositabili

- `coaches-atlas.png` contiene 8 ritratti originali 4 colonne × 2 righe, cella 104×128 px, senza testi. `background-position`: `-104×(index%4) px`, `-128×floor(index/4) px`.
- `presidents-atlas.png`: 4 profili 2×2, stessa cella e formula con 2 colonne.
- `journalists-atlas.png`: 6 profili 3×2, stessa cella e formula con 3 colonne.
- `navy-noise.png`, `panel-noise.png`: tile 96×96, colori/texture; `btn-{blue,gold,disabled}-v02.png` sono background 164×44 **senza testo**. `office-desk-v02.png` è un'illustrazione decorativa; `pitch-textless.png` è campo 496×272 senza giocatori/pallone/HUD.
- Tutte le etichette reali devono rimanere testo HTML (accessibile e traducibile). Non copiare gli esempi di logo/emittenti dall'immagine di partenza: nella demo l'emittente è inventata **Tele Campanile**.

## API demo (proposta di integrazione, non contratto gameplay)

```js
const ui = window.OronzoUIKitV02.createApp(document.querySelector('#oronzo-ui'), {
  data: {
    coaches: [ {id,name,city,region,macro,stats:[fortune,leadership,confidence,patience]}, ... ],
    clubs: [ [name, region, macro, pay], ... ],
    presidents: [ {name,traits:[spending,attachment,papponeria],line}, ... ],
    questions: [ {q, answers:[a,b,c]}, ... ]
  },
  onIntent(intent) {
    // {type, value, screen, selectedCoach, selectedOffer, camera}
    // Tradurre l'intenzione in una chiamata al flow del 07 / sistema del 09 o 06.
    // return false per impedire il comportamento puramente dimostrativo.
  }
});
ui.navigate('avatar');
ui.setData({coaches: newCoaches});
ui.destroy();
```

Nella pagina autonoma l'istanza esiste come `window.oronzoUIDemo`. Il `getPreview()` calcola solo il costo territoriale *illustrativo*: 0 stessa regione, -1 cambio regione in macroregione, -3 cambio macroregione. Il bonus remunerazione e il moltiplicatore di autostima dipendono da regole definitive **non approvate** e vanno sostituiti con API del 07/09. `fanMood` mostrato in demo alla risposta stampa non è salvataggio: è stato temporaneo e non va duplicato nel futuro runtime.

## Collegamenti reali da delegare / nessuna simulazione falsa

| Vista UI | Producer dei dati | Integrazione futura |
|---|---|---|
| Nuova/Carica + 20 offerte | 07 career/flow, 09 coach | nuove carriere con seed, `load`/`save`; presentare esattamente 20 offerte persistite |
| Avatar 4 tratti + morale, patria | 09 coach-club | validazione e game over 0 su stato ufficiale; nessun valore hardcoded nel runtime |
| Presidenti e rapporti | 09 coach-club | ID canonico e bonus/malus persistenti |
| Conferenza 5 domande | 04 narrative, 09 relazioni, 07 flow | domande random seed-safe e effetti idempotenti |
| Hub / fiducia / data | 07 flow + 09 coach + 08 attributes | derivare indicatori e data reali del salvataggio dal 1979 |
| Prepartita | 07 + 06 + 08 | dati rosa 11+bench, avversari e modifiche formazione autentiche |
| Match TV/full | 05 match-view, 06 match-engine | cambiare **solo proiezione** dello stesso snapshot; mai aggiornare logica partita in UI |

**Non è autorizzato in R02 modificare:** `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html` oppure `oronzo/app/flow/`. Questi consumer passeranno ai rispettivi owner dopo NEXT dedicato.

## QA e limiti

`qa/run_browser_qa.py` usa Playwright + Chromium; il sandbox corrente blocca `file://` e `127.0.0.1`, pertanto il test usa `page.set_content()` con HTML, CSS, JS e PNG base64 di identici byte locali. Questo **esegue gli handler JS e verifica il DOM in Chromium**, ma non prova HTTP static hosting, GitHub Pages o Android fisico. Screenshot in `qa/`, dimensioni 640×360, 800×360 e 844×390.

Test reale eseguito: caricamento senza JS error; 8 ritratti selezionabili e statistiche aggiornate; 20 offerte DOM con selezione e preview; scelta presidente; 5 risposte conferenza; hub; campo con 22 marker; cambio full/TV senza perdita marker; bottone nav ≥44px; viewport ratio 16:9 centrato. Il browser non verifica la giocabilità del calcio, che non fa parte di questa demo.

**Dati fittizi:** nomi di allenatori, presidenti, città immaginarie, società, paghe e valori di tratti sono mock data; non appartengono all'archivio storico certificato 1979 e non vanno importati nel mondo persistente.
