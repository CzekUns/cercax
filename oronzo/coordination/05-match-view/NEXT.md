# ORONZO — AGENTE 05 · PRIORITÀ M1: CAMERA FULL/TV, PR #28

**STATO: `P0_CAMERA_VISUAL_GATE` — 8 novembre 2026.** [Roadmap aggiornata R10](../10-orchestrator/ROADMAP-R10-ACCELERAZIONE.md). Sviluppo renderer camera TV è **già presente nella PR #28 OPEN**; non ricreare la funzione né aprire branch nuovo. Primo compito: eseguire **browser Chromium HTTP vero** sul checkout della #28 con **22 PNG reali** (`assetState=ready`, `allRealSprites=true`) e verificare FULL/BROADCAST sullo stesso snapshot: palla dentro la vista, pan/zoom, kickoff/intervallo, resize 640×360/800×360/844×390, canvas16:9, nessuna alterazione score/coordinate. Consegna screenshot + REPORT/commit nella stessa PR e chiedi audit00. Se la QA mostra un difetto, correggilo **solo nel proprio scope match-view**. Coordinati con Agente01/#29 per arte ma **non attendere il merge #29 per testare gli atlas reali di main**. Nessun merge e nessuna modifica UI R03.

---

## ARCHIVIO — NEXT PRECEDENTI

# NEXT — AGENTE 05 · MATCH VIEW E CAMERA TV · VISIONE v0.2
**Stato:** `WAIT_REVIEW` — prevale la direttiva R05 in fondo al documento; lavoro R02 nella PR esistente.
**PR precedente:** #15 MERGIATA, correzione `facing` in radianti e gestione snapshot.
**Fonte:** [vision v0.2](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/GAME-VISION-v02.md), [epic #25](https://github.com/CzekUns/cercax/issues/25).
**Branch:** `agent/oronzo-movements-r02` dall'ultimo main.
**Scope:** `oronzo/systems/match-view/` e proprio REPORT.

## Attività
1. Fai QA dei 22 sprite effettivi, interpolazione, palla, animazioni, riposizionamento fisico dopo cambio modulo (PR #24), portieri, intervallo, pausa e velocità. Leggi come esempio `oronzo/partita-rapida.html` ma non modificarlo.
2. Implementa in renderer API `cameraMode: 'full'|'broadcast'` oppure `setCameraMode(mode)`: full campo identica all'esistente, TV con zoom e scrolling sul pallone, smoothing e clamp ai bordi del campo; su gol, ripartenze e cambio campo non lasciare inquadrature vuote. La camera è solo visiva e non altera il motore.
3. Test deterministici su stessi snapshot in due camere, viewport landscape 640×360 / 800×360 / 844×390, pan/zoom e regressioni di scala. Demo nel proprio scope, documenta hookup UI all'agente 10.
4. Identifica miglioramenti di movimento (scatti/collisioni visive) senza modificare la simulazione.

## Accettazione
A parità di snapshot, punteggio/coordinate/decisioni identici in entrambi i modi; tracking fluido, palla e giocatori visibili; test reali e REPORT. Niente HTML root, motore o asset degli altri agenti. PR senza merge.

## Controllo orchestratore — ripresa parallela del 7 novembre 2026
Non è ancora verificabile il branch `agent/oronzo-movements-r02` nel confronto con main (404); non risultano nuova PR o REPORT R02. **Stato READY**: confermare il ramo base main, sviluppare camera TV/follow-ball solo nella propria directory, verificare su snapshot identici le due viste e consegnare test/demo/REPORT. Non modificare la pagina partita rapida, che nel futuro ciclo è di proprietà UI 03.

## R04 — CONSEGNA IN REVISIONE WORK 00
**PR:** [#28](https://github.com/CzekUns/cercax/pull/28). **Stato di merge:** NON confermato. Rapporto R02 presente sul branch della PR; testi precedenti READY sono archivio del lavoro autorizzato, non un invito a iniziare un altro ciclo.
**Gate di accettazione:** QA camera full/broadcast su stessi snapshot; unit test Node e compatibilità motore, browser richiesto se disponibile.
**Regola:** attendere review Work 00 e riassegnazione da Agente 10; solo correzioni sulla PR corrente se richieste, niente R03 autonomo.


## AGENTE 10 — RISULTATO R04 E PROSSIMO PASSO (7 novembre 2026)
**PR #28, esito R04: HOLD per gate browser.** La suite camera 34/34 Node sullo snapshot combinato è risultata verde; la visuale TV è un renderer che non altera gli snapshot. **Mancano prova visiva reale in browser con asset**, 22 giocatori, inquadratura palla e transition kickoff/intervallo/ripartenza; Work 00 non aveva Chromium eseguibile.
**Azione ammessa sulla stessa PR #28:** browser QA riproducibile con 640×360/800×360/844×390, campo full/TV, presenza palla e giocatori, pan senza viewport vuoti, pausa, cambio campo, nessun repaint errato né modifica score; screenshot e limitazioni nel REPORT. Collaborare con 03/01 senza modificare HTML runtime degli altri. No merge prima del gate visivo.


## DIRETTIVA ATTUALE — DISPATCH R05 (7 NOVEMBRE 2026)
**PR #28: HOLD per QA browser con PNG veri.** HEAD `9c00a3298c0083e3836154a1cb1ff22529bf6366` aggiunge strumenti browser. Il REPORT R04 dichiara 54/54 scenari geometrici Chromium su **sprite fallback (realSprites=0)** e `ERR_BLOCKED_BY_ADMINISTRATOR` nel tentativo HTTP con atlanti. Questa evidenza NON prova la resa della camera con i 22 sprite veri.
**Azione immediata:** provare su ambiente dove gli asset sono realmente serviti, rieseguire `python3 oronzo/systems/match-view/browser-qa-playwright.py --browser /usr/bin/chromium --output /tmp/oronzo-r05` e `node --test oronzo/systems/match-view/*.test.mjs` sul vero checkout PR. Acquisire `results.json` e 54 screenshot; gate `assetState=ready` e `allRealSprites=true` + full/TV con palla dentro l'inquadratura, no pan vuoto, no alterazioni score, a 640×360/800×360/844×390. Se ambiente impedisce HTTP, chiedere a 00 gate alternativo **documentato** e restare HOLD, niente falsa validazione. Collaborare con 01/03 usando gli hook documentati; no codice UI root.
