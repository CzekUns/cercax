> **DIRETTIVA VINCOLANTE AGGIORNATA — 6 novembre 2026**
> Il gioco è **ESCLUSIVAMENTE ORIZZONTALE (landscape)** su smartphone, aspect ratio di riferimento 16:9, griglia logica 640×360, mockup UI a 1280×720. Non proporre mockup portrait o una UI verticale adattata mediante rotazione. Il campo e gli intermezzi possono usare pixel art 4:3 della reference incorniciata nello spazio 16:9, preservandone la qualità. Le schermate devono **essere graficamente FINITE al primo passaggio, paragonabili per dettaglio e atmosfera alle otto reference Drive**, non wireframe, cubi, cerchietti, sagome geometriche, SVG di riempimento o immagini da «affinare dopo». Il sistema di palette serve a ricolorare sprite **già artisticamente finiti**, non a sostituire l'arte. Nel browser la grafica definitiva sostituisce l'attuale canvas procedurale provvisorio; va mantenuto solo come fallback tecnico finché gli asset non saranno integrati.

# Istruzioni di coordinamento Oronzo
1. Perimetro assoluto: `oronzo/**`. Non modificare i file CercaX alla root.
2. Branch separati: `agent/oronzo-players`, `agent/oronzo-cutscenes`, `agent/oronzo-ui`. Non lavorare su main per gli asset.
3. Ogni agente scrive soltanto nella propria cartella: `oronzo/assets/players`, `oronzo/assets/cutscenes`, `oronzo/assets/ui`; il proprio prompt è in `oronzo/agents/` ed è gestito dall'orchestratore.
4. Nessun agente sovrascrive `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css` o la cartella di altri agenti. Per suggerimenti di integrazione, crea `integration-notes.md` nella propria cartella.
5. Tutte le immagini vanno consegnate come file PNG separati (non un solo collage), oltre a sprite atlas quando previsti. Dimensioni precise, pixel art a bordi netti (no antialiasing), sfondo trasparente se richiesto. Verificare crop, trasparenza e dimensioni.
6. La recolorabilità ha precedenza sulla varietà di divise precotte. Usa palette indicizzate, maschere materiali e livelli/regioni per fantasia della maglia.
7. Ogni set consegna un `manifest.json` che dichiari file, dimensioni dei frame, pivot, numero di frame, fps suggeriti e mapping palette.
8. Minimo cinque immagini originali distinte per agente; niente screenshot ripubblicati e niente marchi reali.
9. Prima di PR: ispeziona visivamente ogni PNG e verifica percorso/file. Le bozze non passano per definitive.
10. Integrare il prima possibile, privilegiando la demo sul browser smartphone. La fase match deve restare giocabile anche se gli asset falliscono: fallback canvas.
