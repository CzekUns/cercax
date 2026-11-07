# NEXT — AGENTE 01 · SPRITE CALCIATORI · VISIONE v0.2
**Stato:** `READY` — nuovo ciclo dall'ultimo main.
**Lavoro precedente:** PR #6 MERGIATA (3585b39596e6aa879c69e2136f8f22e2ca1ea102).
**Nuova fonte di verità:** [specifica utente v0.2](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/GAME-VISION-v02.md), [epic #25](https://github.com/CzekUns/cercax/issues/25).
**Branch di ciclo:** `agent/oronzo-players-r02`.
**Scope esclusivo:** `oronzo/assets/players/` e proprio `coordination/01-players/REPORT.md`.

## Task assegnati
1. Da main, porta a qualità definitiva gli sprite 22 sprite **sul campo, 11 contro 11**, due squadre, con palette divisa realmente distinte, capelli/pelle e palette indicizzata. Demo verificabile sui 22 calciatori a 640×360 e 844×390. Mantieni tutte le otto direzioni e le azioni del manifest.
2. QA artistica: proporzioni, dettagli, visibilità alla scala reale, differenze tra squadra, pose duplicate; correzioni mirate e prova PNG trasparenza/atlas con script.
3. Documento di integrazione da fornire all'agente 05 e al 10 con formati, pivot, dimensioni, mapping palette e fallback.

## Gate
Non implementare gli avatar allenatore o le schermate menu: proprietà agente 03. Non cambiare motore, renderer, HTML, CSS root. Modifica solo i file in scope, REPORT test reali, PR verso main e stop. Nessun merge autonomo.