# RAPPORTO AGENTE 03 — UI Art Director — ciclo 01

**Stato:** PR_OPEN (NEXT.md su main: `WAIT_REVIEW`; nessun ciclo 02 autorizzato)
**Identificatore:** `ORONZO-AGENT-03`
**Branch:** `agent/oronzo-ui`
**PR:** https://github.com/CzekUns/cercax/pull/5
**Issue:** https://github.com/CzekUns/cercax/issues/3
**Commit arte verificato:** `f87fafe9a9330c6ae9e802da5a979ccd7e776deb`
**Main consultato:** `3e611f64d2f7c5129ec3cb912223a1fd87e33ee9`
**Data:** 7 novembre 2026 (Europe/Rome)

## Realizzato

Consegna precedente ripresa senza ripartire da zero: 8 mockup PNG 1280×720 in `oronzo/assets/ui/`:
`coach-select.png`, `office-home.png`, `squad-roster.png`, `tactics.png`, `match-hud.png`, `training.png`, `press.png`, `result.png`.

Ulteriori asset: `components.png`, `button-normal.png`, `button-selected.png`, `button-disabled.png`; file di interfaccia `design-tokens.json`, `manifest.json`, `integration-notes.md`, `gallery.html`; 6 immagini di prova in `qa/` per rosa e partita a 640×360, 800×360 e 844×390.

**In questa ripresa:** verifica dello stato GitHub, dei contratti, del materiale esistente e creazione di questo rapporto. Nessuna immagine modificata: `NEXT.md` è `WAIT_REVIEW`, review/commenti PR non richiedono correzioni. Nessun merge.

## Verifiche eseguite (reali)

1. **GitHub/contratti**: letti su main `PROTOCOL.md`, `IDENTITY.md`, `RUN.md`, `NEXT.md`, issue #3, `03-ui.md`, `AGENTS.md`, `asset-contract.md`; PR #5 verificata **open**, non merged. Non risultano review formali, commenti PR o thread con fix richiesti al momento della verifica.
2. **Scope PR**: `list_pr_changed_filenames(#5)` ha restituito **22 file; 22/22 sotto `oronzo/assets/ui/`** prima dell'aggiunta di `REPORT.md`. Il report è l'unica eccezione aggiunta, autorizzata da PROTOCOL.
3. **PNG reali**: letti con Pillow su byte della consegna già montati in `/mnt/data/oronzo_ui`; tutti gli **8 mockup sono RGB 1280×720**. Confronto dei quattro pixel di ogni blocco 2×2: **100% dei blocchi uniformi per ciascuna delle otto immagini**, coerente con esportazione nearest-neighbor 640×360. Le SHA1 in formato Git blob calcolate sui byte locali coincidono con quelle usate nella pubblicazione precedente (es. `coach-select: ef5a2743fb9951d4bb82aa73006438d13852df5c`, `match-hud: d0f9c91e48ad3501e7e34ea23b53e1950fddcbad`).
4. **Componenti/alpha**: `components.png` 1280×720 con alpha comprendente 0 e 255; `button-{normal,selected,disabled}.png` **176×44 e opachi** (alpha 255); sono bitmap di sfondo, non overlay a trasparenza. Esistenza e dimensione confermate.
5. **Prove landscape**: file PNG `qa/match-hud-{640x360,800x360,844x390}.png` e `qa/squad-roster-{640x360,800x360,844x390}.png` aperti tramite Pillow, ciascuno con le dimensioni dichiarate.
6. **JSON e galleria**: parsing `manifest.json` e `design-tokens.json` riuscito; **8 voci schermata** in entrambi; tutti gli 8 percorsi schermata del manifest esistono; `gallery.html` cita tutti gli 8 nomi PNG. `frameCount=1`, `fps=0`, `pivot=[0,0]`: corretti per mockup statici, non per animazioni.
7. **Verifica visiva**: aperti direttamente e osservati almeno `coach-select.png`, `office-home.png`, `match-hud.png` e `components.png` in questa ripresa. Stessa palette/cornice/nav, 8 ritratti selezionabili nella selezione, campo grande a sinistra e pannello ordini a destra nel mockup partita.

**Test NON eseguiti**: browser/DOM touch, misurazione reale di target ≥44 CSS px, Android fisico, responsive effettivo, intercettazione eventi JavaScript, runtime match, overlay con contenuti live. Le prove `qa/` sono render bitmap/letterboxing, NON screenshot end-to-end di una UI HTML eseguita su tre viewport.

## Integrazione / API per orchestratore

- `manifest.json`: lookup schermate statiche `screens[].id/png/size/frames/fps/pivot`, canvas logico `640×360`; `uiAtlas=components.png`.
- `design-tokens.json`: `palette`, `grid`, `components`, `componentAtlas.rectsLogical` e `colorsAsCssVariables`, tra cui `--or-blue`, `--or-navy`, `--or-gold`, `--or-lime`, `--or-rim`.
- `integration-notes.md`: mapping orientativo verso `.game`, `.top`, `#home`, `#squadTable`, `#tactics`, `#pitch`, `#match`, `.bottom-nav`; l'orchestratore possiede `oronzo/index.html`, `oronzo/ui.css`, `oronzo/game.js`. **Non usare i PNG di mockup come unico livello cliccabile**: menu, testi, statistiche e comandi devono essere DOM/canvas interattivi senza valori illustrativi fissati.
- Dipendenza **agente 1** per sprite giocatori definitivi e palette divise; **agente 2** per cutscene; **agente 5** per movimenti/vista match; **agente 6** per eventi della simulazione. Il coordinamento di camere/overlay, caricamento degli asset e fallback canvas spetta all'orchestratore.

## Mancante / problemi aperti

- `WAIT_REVIEW`: ancora nessuna approvazione ufficiale o richiesta esplicita di fix. Non è autorizzato sviluppare una seconda iterazione, toccare runtime o correggere autonomamente asset fuori dallo scope.
- I mockup contengono testi, numeri, nomi, barra score e icone illustrativi impressi nel bitmap: usarli **solo come reference visiva**; servono sfondi/elementi ritagliati e dati dinamici reali per l'HTML.
- `button-*.png` opachi: integrarli come sfondo/9-slice, **non** come layer trasparente sopra il gioco.
- Il touch minimo di 44 CSS px è **dichiarato nel design**, ma **non collaudato in runtime**.
- Nessuna prova Android fisico; font locali suggeriti ma non distribuiti.
- Il precedente prototipo aveva una vista match `320×440` verticale: da riallineare a camera landscape da parte dell'orchestratore e/o agente 5 (verificare stato corrente prima di modificare).
- La PR resta aperta fino a QA/decisione dell'orchestratore; nessun merge è stato fatto da questo agente.

## Proposta prossimo ciclo (NON autorizzata fino a NEXT = READY/FIX_REQUESTED)

1. Estrarre gli sfondi senza testi statici e dichiarare hotspot/layout responsive parametrico per ogni vista, preservando l'art direction.
2. Produrre prova runtime HTML touch a 640×360 / 800×360 / 844×390 con target realmente misurati; intervento solo nel perimetro `oronzo/assets/ui/` e sotto consenso dell'orchestratore.
3. Consolidare l'atlante 9-slice/contrasti e l'integrazione con agenti 1, 2, 5 senza riscrivere il core.

**Gate:** attendere QA e istruzioni su `oronzo/coordination/03-ui/NEXT.md` su main.