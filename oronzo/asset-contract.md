> **DIRETTIVA VINCOLANTE AGGIORNATA — 6 novembre 2026**
> Il gioco è **ESCLUSIVAMENTE ORIZZONTALE (landscape)** su smartphone, aspect ratio di riferimento 16:9, griglia logica 640×360, mockup UI a 1280×720. Non proporre mockup portrait o una UI verticale adattata mediante rotazione. Il campo e gli intermezzi possono usare pixel art 4:3 della reference incorniciata nello spazio 16:9, preservandone la qualità. Le schermate devono **essere graficamente FINITE al primo passaggio, paragonabili per dettaglio e atmosfera alle otto reference Drive**, non wireframe, cubi, cerchietti, sagome geometriche, SVG di riempimento o immagini da «affinare dopo». Il sistema di palette serve a ricolorare sprite **già artisticamente finiti**, non a sostituire l'arte. Nel browser la grafica definitiva sostituisce l'attuale canvas procedurale provvisorio; va mantenuto solo come fallback tecnico finché gli asset non saranno integrati.

# CONTRATTO ASSET v0.1 — firme comuni A/B/C
## Sorgenti
La cartella Drive `Reference immagini` contiene 8 reference: `reteee-2.png` (campo match), `images.jpeg` (intermezzi laterali), altre 6 (UI). Il gioco usa pixel art originale, non copie dei pixel dei vecchi videogiochi.

## Palette e ricolorazione (tecnica anni '90)
Separare **materiali** dalla loro tinta. Un pixel non è solo un colore RGB: è una coppia `materiale + livello di ombra` con eventuale `pattern`.
Materiali: `skin`, `hair`, `shirt`, `shorts`, `socks`, `boots`, `outline` e `transparent`.
Tutte le superfici colorabili hanno una scala fissa di quattro gradazioni (`shade 0=luce` ... `shade 3=ombra`), senza gradienti antialias.
Esportare **sprite colore neutro** + **maschera dei materiali**, oppure file indexed `.png` con lookup palette documentato. Il renderer usa un oggetto `appearance` per mappare ogni categoria ai quattro colori finali, senza alterare ombre/contorni. In browser si pre-renderizza in canvas offscreen e si mette in cache per `baseSprite|skin|hair|shirt|shorts|socks|pattern`. In alternativa GPU/WebGL solo in fase successiva.

### Maglie a fantasie ricolorabili
Per maglie tinta unita, strisce verticali/orizzontali e metà-metà, aggiungere un secondo colore `shirtB` selezionato dal pattern nel sistema di coordinate del torace, non da pixel già dipinti. In una versione evoluta: maschera `shirt` con `shirtPatternUV` o regioni A/B. Pantaloncini e calzettoni indipendenti.

## A — Giocatori nella partita
- Celle fisse: `32×32` pixel reali, sfondo trasparente, pivot in basso al centro `(16,29)`.
- Direzioni: 8 (N, NE, E, SE, S, SW, W, NW), ordine esplicito in manifest; ogni animazione 4 frame per direzione (8 colonne ×4 righe oppure trasposto con manifest).
- Minimo 5 atlas immagini: `idle.png`, `run.png`, `kick.png`, `tackle.png`, `keeper.png`. Export almeno una maschera materiali corrispondente.
- Numeri in maglia non dipinti fissi; overlay a runtime se la scala lo consente.

## B — Scene evento
- Side-view pixel art in coerenza con `images.jpeg`. Canvas logico `320×180` (landscape), calciatore circa 65–90 px d'altezza, scena separata dal match.
- Minimo 5 strisce PNG con 6 frame `320×180` (totale `1920×180` ciascuna), nomi `goal_celebrate`, `goalkeeper_save`, `yellow_card`, `injury`, `red_card`. Destinare un file extra agli sfondi se serve.
- Sfondi stadio/tifosi indipendenti, ogni personaggio ricolorabile mediante materiali A; no divisa/viso fissati negli sprite.
- Trigger: evento, frame e durata definibili da JSON; il motore partita resta vivo mentre appare la scena.

## C — UI
- Logica LANDSCAPE 640×360 (esportare concept a 1280×720 via nearest-neighbor). Su telefoni di differenti dimensioni adattare tutti i pannelli, conservando un campo visibile e spazio ai comandi: non basta ruotare una immagine statica.
- Minimo cinque mockup diversi: `coach-select`, `office-home`, `squad-roster`, `tactics`, `match-hud`.
- Un unico design system: palette (codici HEX), bordi 2/3px bevel, font pixel liberamente riutilizzabile, scala 8px, componenti ritagliati senza testo per HTML.
- Layout calcistico anni 1990–95 ma touch comodo oggi; visivamente ispirato alle reference blu International Soccer Challenge e formazione, senza copiarne titoli/marchi.

## QA obbligatoria
PNG reali, non link a immagini temporanee; niente layer bruciati in un'unica immagine se serve ricolorazione o UI viva; alpha pulito; `image-rendering:pixelated`; screenshot prove landscape 640×360, 800×360 e 844×390; verifica presenza di cinque immagini distinte per agente. Ogni agent documenta i test e i limiti.
