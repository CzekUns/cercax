# RAPPORTO AGENTE 02 — Cutscene ed eventi — ciclo 01

**Stato:** PR_OPEN / WAIT_REVIEW (nessun fix richiesto)  
**Identità:** `ORONZO-AGENT-02`  
**Branch:** `agent/oronzo-cutscenes`  
**PR:** https://github.com/CzekUns/cercax/pull/12 (aperta, **draft**, NON merged)  
**Issue:** https://github.com/CzekUns/cercax/issues/2  
**Commit di consegna verificato prima di questo report:** `d2c58d2c786b56b80d11686409288b04a98f0658`  
**Data verifica:** 2026-11-07 (Europe/Rome)  
**NEXT su main:** `WAIT_REVIEW`; orchestratore non ha ancora approvato, mergiato o autorizzato ciclo 02.

## Realizzato nel ciclo 01

- 5 sprite strip **PNG RGBA 1920×180**, 6 fotogrammi **320×180** ciascuno: `goal_celebrate.png`, `goalkeeper_save.png`, `yellow_card.png`, `red_card.png`, `injury.png`. 30 slot di frame.
- 10 maschere raster, una `*_materials.png` e una `*_shades.png` per ciascuna sequenza, allineate 1:1 con l'alpha dei PNG. Codici `material ID` e livelli di ombra 0–3 in `manifest.json`.
- Sfondi riutilizzabili, separati dai calciatori: `stadium_background.png` e `stadium_goal_background.png`, 320×180.
- `manifest.json` definisce 5 eventi `goal`, `save`, `yellow`, `red`, `injury`, frame size, pivot, fps, durata, palette indicizzate e ruoli.
- `cutscene-player.js`: modulo JavaScript ESM che esporta `OronzoCutscenePlayer`; disegna i sei frame sopra lo sfondo e applica colori dinamici `skin`, `hair`, `shirt`, `shirtB`, `shorts`, `socks` e pattern `solid`, `vertical`, `horizontal`, `halves`. Cache degli atlas per combinazioni colori.
- `demo.html` autonoma per selezione evento, playback, step, velocità, loop e ricolorazione; `integration-notes.md` spiega gli hook che l'orchestratore dovrà inserire in `oronzo/game.js`.
- `generate_assets.py` generatore deterministico, `qa_assets.py` controllo strutturale, `qa_overview.png` tavola d'ispezione dei frame.
- Le **24 modifiche originarie** del branch riguardano soltanto `oronzo/assets/cutscenes/`. Questo report è l'**unica eccezione di scope autorizzata** dal protocollo.

## Verifiche realmente eseguite (ripresa 7 novembre)

1. `python qa_assets.py` nella cartella cutscene: **PASS**, stampa `ALL 5 CUTSCENES VALIDATED`. Controlla dimensioni, formato RGBA, cinque scene, maschere allineate all'alpha, livelli ombra entro 0–3, sei frame non vuoti per ciascuna scena, sfondi 320×180.
2. `node --check cutscene-player.js`: **PASS** (nessun errore di sintassi). Estratto il codice ESM di `demo.html` e testato con `node --check --input-type=module`: **PASS**.
3. Controllo aggiuntivo con Pillow su tutti i sei slot di ogni scena: **PASS**. I materiali usati sono sottoinsieme degli ID dichiarati dal manifest, le strisce hanno dimensioni 1920×180 e ogni fotogramma contiene pixel non trasparenti.
4. `git hash-object` su tutti e **24** i file locali della precedente consegna: gli SHA risultanti coincidono con i blob GitHub già pubblicati nella PR (controllo dei byte, non soltanto dei nomi). Diff GitHub `main...agent/oronzo-cutscenes`: 24 percorsi originari, tutti sotto `oronzo/assets/cutscenes/`; compare al momento della verifica: **1 commit ahead / 33 behind main**, senza cambiamenti esterni nel diff.
5. Controllo fotogrammi **unici**: `goal` 6/6; `save` 6/6; `injury` 6/6; `yellow` 5/6; `red` 5/6. Le scene dei cartellini tengono intenzionalmente l'ultima posa per due slot; sono comunque sei frame, di cui cinque stati visivi distinti.
6. Tentativo di screenshot della demo in Chromium headless locale via HTTP su porta 8895, finestra 640×360: **NON COMPLETATO**, comando in timeout dopo ~35 s e **nessuno screenshot** generato. Il log include errori D-Bus; non è dimostrato che l'animazione JS funzioni sul browser. **Non** segnare questo test come PASS.
7. PR REST attuale: `state=open`, `draft=true`, `merged=false`; nessuna review o commento con richieste di fix esaminati; issue #2 ancora aperta. Nessun merge effettuato.

## Integrazione e API

- Import ESM: `import { OronzoCutscenePlayer } from './assets/cutscenes/cutscene-player.js';` oppure `import(...)` dinamico perché `oronzo/game.js` usa un IIFE classico.
- Costruttore `new OronzoCutscenePlayer(canvas, { onComplete })`; `await instance.init()`; `await instance.play(type, {appearance, pattern, loop, speed})`; `instance.stop()`, `instance.renderFrame(index)`.
- Trigger JSON: `goal`, `save`, `yellow`, `red`, `injury`; player canvas di destinazione 320×180 con CSS `image-rendering: pixelated`; non fermare timer o simulazione match durante overlay.
- **Dipendenza orchestratore:** aggiunta overlay e hook reali in `oronzo/index.html`/`oronzo/game.js` dopo merge e QA, fuori dal perimetro dell'agente 2.
- **Dipendenze agenti 05/06/08:** eventi semanticamente attendibili dal motore, identità di marcatore/portiere/ammonito/infortunato e `appearance` coerente; queste interfacce non sono ancora integrate nella partita.
- **Dipendenza agente 01:** una tabella comune per i colori di pelle/capelli/divise tra sprite match e cutscene, altrimenti differenti sfumature fra viste.

## Mancante / problemi e limiti

- Nessuna approvazione artistica o QA di gameplay dal coordinatore. La grafica procedurale attuale, pur essendo raster reale e material-masked, è più semplificata rispetto a `images.jpeg`; non dichiararla equivalente alla reference.
- La demo non è ancora validata in un browser smartphone reale, e mancano screenshot affidabili nei formati landscape di accettazione `640×360`, `800×360`, `844×390`.
- Sei fotogrammi per evento sono presenti; giallo e rosso hanno però due fotogrammi finali identici per posa trattenuta, dettaglio da valutare in QA estetica.
- Nessun trigger cutscene è stato collegato a `oronzo/game.js` (file riservato all'orchestratore); il simulatore non riproduce quindi queste sequenze da solo.
- Branch creato su base precedente: al controllo, `main` avanzato di 33 commit rispetto all'antenato comune. **Non è stato effettuato rebase/merge** senza autorizzazione, perché `NEXT.md` impone `WAIT_REVIEW`. Il diff specifico resta confinato ai soli 24 asset più il report.
- Nessuna correzione al codice richiesta nelle review GitHub consultate; in questo ciclo di ripresa non sono stati modificati asset o script, soltanto redatto il report.

## Proposta prossimo ciclo (solo previa autorizzazione dell'orchestratore)

1. Priorità **QA browser/visiva**: eseguire in browser reale le cinque animazioni, ricolorazione e viewport 640×360, 800×360, 844×390, con screenshot e verifica della fluidità/leggibilità.
2. Se richiesto dalla review: perfezionare i frame dei cartellini e le silhouette/ombre del giocatore rispetto alla reference, preservando gli stessi material ID e path degli asset.
3. Solo dopo merge e nuovo `NEXT.md=READY`: coordinare l'API colori/trigger con gli agenti 01, 05 e 06; preparare integrazione senza modificare il runtime dell'orchestratore direttamente.

**Conclusione:** consegna verificabile, PR **draft in attesa di revisione**. Nessun merge, nessuna iterazione nuova avviata.
