> **DIRETTIVA VINCOLANTE AGGIORNATA — 6 novembre 2026**
> Il gioco è **ESCLUSIVAMENTE ORIZZONTALE (landscape)** su smartphone, aspect ratio di riferimento 16:9, griglia logica 640×360, mockup UI a 1280×720. Non proporre mockup portrait o una UI verticale adattata mediante rotazione. Il campo e gli intermezzi possono usare pixel art 4:3 della reference incorniciata nello spazio 16:9, preservandone la qualità. Le schermate devono **essere graficamente FINITE al primo passaggio, paragonabili per dettaglio e atmosfera alle otto reference Drive**, non wireframe, cubi, cerchietti, sagome geometriche, SVG di riempimento o immagini da «affinare dopo». Il sistema di palette serve a ricolorare sprite **già artisticamente finiti**, non a sostituire l'arte. Nel browser la grafica definitiva sostituisce l'attuale canvas procedurale provvisorio; va mantenuto solo come fallback tecnico finché gli asset non saranno integrati.

# ORONZO — Manageriale calcistico retro (alpha)
Progetto **autonomo** dentro `CzekUns/cercax/oronzo/`. Non alterare CercaX.

## Demo
- Entry: `oronzo/index.html`
- JS: `oronzo/game.js`; CSS: `oronzo/ui.css`.
- Repository con GitHub Pages abilitato. URL atteso: `https://czekuns.github.io/cercax/oronzo/` (il deploy va verificato dal browser).
- Prototipo giocabile: hub retro, rosa e cambi, tattica, allenamenti, campo 2D, partita simulata ~90 secondi a 1x, pause e accelerazione, classifica salvata localmente; grafica provvisoria programmata su canvas. Non è ancora un motore calcistico definitivo.

## Vision
Italia calcistica di provincia, metà anni Ottanta; atmosfera videogiochi 1990–1995; tono comico della provincia italiana con meccaniche gestionali solide. L'utente è l'allenatore, non un direttore sportivo onnipotente. Il giocatore osserva la partita ma dà ordini ed effettua cambi; personalità, morale, fortuna, salute e tattiche influiscono sulla simulazione.

## Reference grafiche dell'utente
Drive: [Oronzo / Reference immagini](https://drive.google.com/drive/folders/1kfDVXXUYL1G7JemAhlWGTPmtAv0KKoCQ), otto immagini da esaminare realmente.
- `reteee-2.png`: vista match top-down 320×240, pixel art calcistica.
- `images.jpeg`: intermezzo laterale con calciatore e folla; modello per sequenze gol, espulsione, infortunio.
- `62707-InternationalSoccerChallenge.jpg`, `mqdefault.jpg`, `images.png`, `images (3).jpeg`, `images (4).jpeg`, `images (5).jpeg`: direzione di menu blu, cornici in rilievo, tattiche in campo, liste, indicatori ed emblemi.
Usare solo come **riferimenti**, non redistribuire immagini protette.

## Collaborazione
Tre agenti grafici parallelizzati con file separati, richieste in `oronzo/agents/`.
- A: `oronzo/assets/players/`
- B: `oronzo/assets/cutscenes/`
- C: `oronzo/assets/ui/`
Orchestratore: `index.html`, `ui.css`, `game.js`, verifica/integratore.
Leggere `oronzo/AGENTS.md` e `oronzo/asset-contract.md`. Consegnare i propri file in branch dedicato, PR da integrare solo dopo QA.

## Copyright
Titolo ORONZO solo interno; no nome commerciale Pro Evolution Soccer, nomi/volti/voce riconoscibili di Banfi, testi e asset dei film senza diritti. Personaggi e marchi originali.

## Agente Copy & Narrative (D)
Quarto agente indipendente: `agent/oronzo-copy` → `oronzo/content/`. Incarico: `oronzo/agents/04-copy.md`; vincoli: `oronzo/narrative-contract.md`. Produce personaggi ricorrenti, eventi condizionali, microcopy, dialoghi e note per integrare l'umorismo originale ispirato alla commedia italiana degli anni Ottanta e al managerial humour di Theme Hospital, senza copiare opere protette. L'orchestratore resta responsabile dell'integrazione nel motore.
