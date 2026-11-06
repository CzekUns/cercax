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
