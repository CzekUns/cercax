# NEXT — AGENTE 03 · ART DIREZIONE UI · VISIONE v0.2
**Stato:** `WAIT_REVIEW` — PR R02 consegnata, revisione/merge affidati a Work 00 su mandato R04.
**Lavoro precedente:** PR #5 MERGIATA (ad84dd134b98d5fde8017af3da5e6e7b1b21e63e).
**Fonte:** [visione v0.2](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/GAME-VISION-v02.md), [epic #25](https://github.com/CzekUns/cercax/issues/25).
**Branch:** `agent/oronzo-ui-r02`.
**Scope:** `oronzo/assets/ui/` e proprio REPORT.

## Task
1. Progetta/realizza come **asset HTML componibili** (non mockup statici incollati) i pannelli landscape 16:9 e i ritratti/caricature originali degli avatar allenatore, con luogo natale e 4 statistiche resi come testo dinamico, non bitmap. Interfaccia 640×360, 800×360, 844×390.
2. Priorità alle schermate del flusso: Nuova/Carica partita; scelta avatar; 20 ingaggi con indicatori morale/costo; presentazione presidente; conferenza iniziale 5 domande; hub con data 1979 e menu Campionato/Rosa/Tifoseria/Ufficio presidente; prepartita; vista match con switch full campo/TV.
3. Esporta texture/pannelli/tasti/ritratti con manifest degli hotspot touch e aree dinamiche separate; demo HTML in tua directory e istruzioni da usare nel successivo ciclo d'integrazione runtime a carico dello stesso agente 03.
4. Evita nomi reali di squadre/loghi/marchi; leggibilità prima di decoro.

## Proprietà del futuro runtime (PRENOTATA, NON ANCORA AUTORIZZATA IN QUESTO CICLO)
Dopo merge della PR UI corrente e dopo risoluzione/merge R02 di 07+09, il 03 riceverà una nuova iterazione **separata** per implementare e collegare il runtime di interfaccia: `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html`. Consumer dei moduli degli altri agenti e del controller di carriera fornito dal 07 sotto `oronzo/app/flow/`. Nessun altro agente, incluso il 10, modifica questi file. Aggiornare IDENTIY/RUN/NEXT e autorizzare esplicitamente questo scope prima della PR. Nel ciclo R02 attuale rimani **solo in `oronzo/assets/ui/`**.

## Gate
Non modificare `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css` o sistemi di gameplay. Lo scopo è artwork e kit di UI, non logica. Testa dimensioni e demo, REPORT concreto, PR verso main senza merge.

## Controllo orchestratore — ripresa parallela del 7 novembre 2026
Il branch `agent/oronzo-ui-r02` è **identico a main** (0 commit nuovi) e il REPORT leggibile riguarda il ciclo 01. **Stato READY confermato solo per il kit UI** in `oronzo/assets/ui/`. Al termine aprire PR con screenshot, manifest dinamico e report aggiornato. **NON autorizzato ora** scrivere `index.html`, `game.js`, `ui.css` e `partita-rapida.html`: il ciclo runtime sarà assegnato DOPO merge del kit UI e fix R02 degli agenti 07+09, con un nuovo NEXT esplicito e PR separata.

## R04 — CONSEGNA IN REVISIONE WORK 00
**PR:** [#33](https://github.com/CzekUns/cercax/pull/33). **Stato di merge:** NON confermato. Rapporto R02 presente sul branch della PR; testi precedenti READY sono archivio del lavoro autorizzato, non un invito a iniziare un altro ciclo.
**Gate di accettazione:** Gate kit: demo Chromium 640×360/800×360/844×390, hotspot e asset; non autorizzare runtime HTML finché R02 07/09 e questo kit non sono mergiati.
**Regola:** attendere review Work 00 e riassegnazione da Agente 10; solo correzioni sulla PR corrente se richieste, niente R03 autonomo.
