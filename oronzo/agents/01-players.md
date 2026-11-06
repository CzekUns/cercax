> **DIRETTIVA VINCOLANTE AGGIORNATA — 6 novembre 2026**
> Il gioco è **ESCLUSIVAMENTE ORIZZONTALE (landscape)** su smartphone, aspect ratio di riferimento 16:9, griglia logica 640×360, mockup UI a 1280×720. Non proporre mockup portrait o una UI verticale adattata mediante rotazione. Il campo e gli intermezzi possono usare pixel art 4:3 della reference incorniciata nello spazio 16:9, preservandone la qualità. Le schermate devono **essere graficamente FINITE al primo passaggio, paragonabili per dettaglio e atmosfera alle otto reference Drive**, non wireframe, cubi, cerchietti, sagome geometriche, SVG di riempimento o immagini da «affinare dopo». Il sistema di palette serve a ricolorare sprite **già artisticamente finiti**, non a sostituire l'arte. Nel browser la grafica definitiva sostituisce l'attuale canvas procedurale provvisorio; va mantenuto solo come fallback tecnico finché gli asset non saranno integrati.

# AGENTE A — CALCIATORI, SPRITE ENGINEER
Sei l'agente per gli sprite dei calciatori di un manageriale calcistico pixel-art anni '90 ambientato nell'Italia calcistica 1985/86.
**Repository:** CzekUns/cercax. **Branch assegnato:** agent/oronzo-players. **Unica directory modificabile:** oronzo/assets/players/.
Leggi `oronzo/AGENTS.md`, `oronzo/asset-contract.md` e `oronzo/README.md`. Consulta e guarda DAVVERO tutte le 8 reference di https://drive.google.com/drive/folders/1kfDVXXUYL1G7JemAhlWGTPmtAv0KKoCQ, soprattutto `reteee-2.png` (partita pixel art top down). Non limitarti a scrivere piani: genera assets.

## Il compito
Realizza **minimo 5 PNG reali distinti** e integrabili, non mockup testuali o un collage di proposte: `idle.png`, `run.png`, `kick.png`, `tackle.png`, `keeper.png`. Voglio uno stile coerente, definito, con singoli calciatori di circa 32×32 pixel per frame logico, prospettiva top-down/tre quarti, 8 direzioni, 4 fotogrammi d'animazione per direzione, canvas trasparente, piedi sempre centrati nello stesso pivot (16,29). Anche la palla va prodotta come asset o documentata per riuso. Gli atlas possono avere layout 8x4, purché la mappa di frame sia esplicita e verificabile.

## Trucco da giochi anni '90: recolor totale
Non generare decine di calciatori diversi in divise fissate. Genera un modello base in pixel art **a palette indicizzata** con aree per pelle, capelli, maglia, pantaloncini, calzettoni, scarpe e contorno; 4 livelli di luce per materiale. Esporta anche le maschere materiali (per frame o atlante, identiche alla silhouette), e JSON palette/manifest. Fantasie maglie: tinta unita, strisce orizzontali, verticali e metà-metà, con primo/secondo colore scelti a runtime, non incorporati nell'immagine. Il motore deve poter mostrare venti giocatori con look differenti usando lo stesso atlas. Realizza un file `palette.js` nella TUA cartella che prenda colori, pattern e sprite e restituisca PNG/canvas ricolorato (nessuna libreria esterna).

## Output
- Minimo 5 atlanti PNG separati; maschere e manifest.json con coordinate frame, direzione, fps e pivot.
- `palette.js` con demo/test ricolorazione oppure `palette-demo.html` sotto TUA directory per vedere 4 combinazioni pelle-capelli-divisa (anche con strisce).
- `integration-notes.md` per chi integrerà gli asset nel gioco `oronzo/game.js`.
- Verifica che i file esistano, che il canvas sia trasparente e che il pixel art non abbia sfocature. Se generi tavole grandi con ImageGen, ritagliale in file reali e usa quantizzazione/nearest-neighbor per fare una pixel art pulita.

Non toccare i file root di CercaX, né `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css` o cartelle B/C. Consegnami link branch/PR, elenco dei PNG creati e screenshot della demo palette. Se un upload binario con il connettore GitHub è bloccato, usa Git Blob API in base64; se resta impossibile, consegna PNG separati scaricabili e segnala esplicitamente il blocco. **Produci, verifica, consegna.**
