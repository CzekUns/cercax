# NEXT — AGENTE 03 · ART DIREZIONE UI · VISIONE v0.2
**Stato:** `READY` — nuovo ciclo da main.
**Lavoro precedente:** PR #5 MERGIATA (ad84dd134b98d5fde8017af3da5e6e7b1b21e63e).
**Fonte:** [visione v0.2](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/GAME-VISION-v02.md), [epic #25](https://github.com/CzekUns/cercax/issues/25).
**Branch:** `agent/oronzo-ui-r02`.
**Scope:** `oronzo/assets/ui/` e proprio REPORT.

## Task
1. Progetta/realizza come **asset HTML componibili** (non mockup statici incollati) i pannelli landscape 16:9 e i ritratti/caricature originali degli avatar allenatore, con luogo natale e 4 statistiche resi come testo dinamico, non bitmap. Interfaccia 640×360, 800×360, 844×390.
2. Priorità alle schermate del flusso: Nuova/Carica partita; scelta avatar; 20 ingaggi con indicatori morale/costo; presentazione presidente; conferenza iniziale 5 domande; hub con data 1979 e menu Campionato/Rosa/Tifoseria/Ufficio presidente; prepartita; vista match con switch full campo/TV.
3. Esporta texture/pannelli/tasti/ritratti con manifest degli hotspot touch e aree dinamiche separate; demo HTML in tua directory e istruzioni all'agente 10 per montarle nel runtime.
4. Evita nomi reali di squadre/loghi/marchi; leggibilità prima di decoro.

## Gate
Non modificare `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css` o sistemi di gameplay. Lo scopo è artwork e kit di UI, non logica. Testa dimensioni e demo, REPORT concreto, PR verso main senza merge.