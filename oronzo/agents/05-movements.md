# AGENTE 5 — MOVIMENTI PARTITA E MATCH VISUAL ENGINEER

Repository: `CzekUns/cercax`
Branch ESCLUSIVO: `agent/oronzo-movements`
Issue: https://github.com/CzekUns/cercax/issues/7
Directory ESCLUSIVA scrivibile: `oronzo/systems/match-view/`

Prima di operare leggi davvero `oronzo/AGENTS.md`, `oronzo/README.md`, `oronzo/engine-contract.md`, `oronzo/game.js` (sola lettura), l'issue assegnata e i file degli altri agenti solo se utili alla compatibilità. Il progetto è un manageriale calcistico del 1985, smartphone **esclusivamente orizzontale 16:9**, grafica pixel art 1990–95 (NON cubetti provvisori come prodotto finale). Gli altri agenti producono sprite, scene e UI: non duplicare il loro lavoro né copiare asset di giochi/film. Implementa **codice eseguibile con test**, non soltanto descrizioni o storyboard. JavaScript ESM nativo senza backend né librerie obbligatorie. **Lavora unicamente nella directory assegnata**; non modificare `oronzo/game.js`, `oronzo/index.html`, `oronzo/ui.css` o i file root CercaX. L'orchestratore integrerà la tua PR. Se devi richiedere modifiche ad altri moduli, scrivile in `integration-notes.md`.


## MISSIONE OPERATIVA
La tua responsabilità è fare **vedere una partita vera** dal punto di vista del manager: 22 calciatori che corrono, si smarcano, passano e tirano sul campo, visualizzati con gli sprite dei colleghi. I movimenti e gli eventi sportivi arrivano in un `MatchSnapshotV1` **prodotto dall'agente 6**: tu non decidi possesso, fuorigioco, gol, danni, o vincitore. Sei responsabile della regia della scena, non del motore tattico.

### Consegne software obbligatorie
1. `match-view.js`: classe/funzioni `createMatchView(canvas,{assetLoader,config})`, `render(snapshot)`, `destroy()`; supporto render pixel-perfect in canvas con campo intero orizzontale, senza SVG generici, canvas logico 640×360.
2. `interpolation.js`: transizioni e facing fra snapshot per evitare teletrasporti, velocità coerente col ritmo, tasso di rendering indipendente dai tick del motore; pause e velocità 1×/2×/4×/8× non devono sballare il frame.
3. `asset-adapter.js`: legge `oronzo/assets/players/manifest.json` e set palette (quando disponibili) per sprite ricolorati e azioni `idle,run,kick,tackle,keeper`; gestione fallimento risorse separata, senza spacciare il fallback come grafica definitiva. Integrazione scene di `oronzo/assets/cutscenes/` tramite eventi come `goal/save/card/injury` con overlay senza bloccare il simulatore.
4. `match-view-demo.html`: demo landscape autonoma con feed **fixture** di snapshot e almeno 22 giocatori, pallone, movimento e pulsante pausa/velocità. Specificare esplicitamente che la fixture serve a testare la rappresentazione e non è logica di partita.
5. `README.md`, `integration-notes.md` e test su posizioni 0..1, sprite orientation, overlay trigger/cooldown, interpolation, resize e no sprite missing fatal crash.

### Specifiche visive
Field in 16:9 sempre visibile con controlli a lato; indicatori discreti di palla e selezione, score e cronaca lasciati all'UI già assegnata. Sprite pixel art rifiniti come `reteee-2.png`; non fare omini geometrici definitivi. Usa `image-rendering:pixelated`, cache colori e nearest neighbor; gestisci scala su schermi 640×360 e 844×390. Nessuna modifica al motore di simulazione.

## CONSEGNA VINCOLANTE
Metti il codice effettivamente funzionante nella directory assegnata sul tuo branch, testalo, indica i comandi eseguiti, prepara una PR verso `main` e fornisci il link. Non limitarti a studi, testi o schemi; non dichiarare completate funzionalità solo abbozzate. Il runtime `oronzo/game.js` rimane all'orchestratore.
