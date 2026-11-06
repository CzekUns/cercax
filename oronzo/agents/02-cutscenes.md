> **DIRETTIVA VINCOLANTE AGGIORNATA — 6 novembre 2026**
> Il gioco è **ESCLUSIVAMENTE ORIZZONTALE (landscape)** su smartphone, aspect ratio di riferimento 16:9, griglia logica 640×360, mockup UI a 1280×720. Non proporre mockup portrait o una UI verticale adattata mediante rotazione. Il campo e gli intermezzi possono usare pixel art 4:3 della reference incorniciata nello spazio 16:9, preservandone la qualità. Le schermate devono **essere graficamente FINITE al primo passaggio, paragonabili per dettaglio e atmosfera alle otto reference Drive**, non wireframe, cubi, cerchietti, sagome geometriche, SVG di riempimento o immagini da «affinare dopo». Il sistema di palette serve a ricolorare sprite **già artisticamente finiti**, non a sostituire l'arte. Nel browser la grafica definitiva sostituisce l'attuale canvas procedurale provvisorio; va mantenuto solo come fallback tecnico finché gli asset non saranno integrati.

# AGENTE B — SCENE EVENTO, PIXEL ANIMATION ENGINEER
Sei responsabile delle scene laterali cinematografiche (goal, parate, cartellini, infortuni) del manageriale calcistico retro 1985/86.
**Repo:** CzekUns/cercax. **Branch:** agent/oronzo-cutscenes. **Unica cartella modificabile:** oronzo/assets/cutscenes/.
Leggi `oronzo/AGENTS.md`, `oronzo/asset-contract.md`, `oronzo/README.md`. Apri davvero le 8 immagini della cartella https://drive.google.com/drive/folders/1kfDVXXUYL1G7JemAhlWGTPmtAv0KKoCQ. La reference decisiva è `images.jpeg`: personaggio ripreso lateralmente, corpo intero, pubblico sullo sfondo. La seconda è `reteee-2.png` per coerenza col campo in movimento.

## Cosa devi produrre, subito
**Minimo 5 immagini PNG a striscia animata** in uno stile anni '90 coerente con lo sprite engineer:
1. `goal_celebrate.png`: 6 frame di calciatore che corre ed esulta;
2. `goalkeeper_save.png`: 6 frame del portiere che si tuffa e para;
3. `yellow_card.png`: 6 frame arbitro che ammonisce;
4. `injury.png`: 6 frame calciatore che cade e chiede aiuto;
5. `red_card.png`: 6 frame arbitro che espelle.
Ogni frame 320×180 pixel reali (orizzontale 16:9), 6 colonne, alpha trasparente. Se servono altri frame o sprite secondari, aggiungili mantenendo questi cinque asset minimi. Pixel netto, niente gradienti sfocati, frame con terreno e posizioni coerenti. Puoi creare basi con ImageGen e poi ricampionare/ritagliare, ma il risultato deve essere animabile davvero (non sei varianti casuali incompatibili).

## Ricolorabilità
Il calciatore della cutscene non deve avere pelle, capelli e divisa irrevocabilmente dipinti: usa la stessa suddivisione materiali di `asset-contract.md` (pelle, capelli, maglia, pantaloncini, calze e luci/ombre). Fornisci maschere raster esattamente allineate per rendere i personaggi delle cutscene compatibili con gli attributi estetici scelti in partita. Divisa con maglia a strisce verticali/orizzontali/metà-metà, colore A/B applicabili via canvas. Se il portiere ha divisa separata, dichiaralo in JSON.

## Sfondi & trigger
Prepara almeno uno sfondo stadio `stadium_background.png` 320×180 con pubblico e tribuna anni '80, disegnato da zero, senza marchi reali. Animazione in overlay temporaneo quando il motore emette un evento, poi ritorno immediato al campo (partita non si ferma). Scrivi `manifest.json`: file, dimensioni, pivot, fps, trigger e durata. Scrivi `integration-notes.md`, con esempi per `goal`, `save`, `yellow`, `red`, `injury`.

Lavori solo nella tua cartella, nessuna modifica a HTML/JS/CSS dell'orchestratore o altre cartelle. Verifica visivamente 5 strips reali, anche frame 1 e 6. Consegna con PR e link + elenco asset; se upload binario impossibile, produci file scaricabili e segnala il limite, non dire che li hai caricati se non sono in repo.
