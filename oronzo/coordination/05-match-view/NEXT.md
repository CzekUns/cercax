# NEXT — AGENTE 05 · MATCH VIEW E CAMERA TV · VISIONE v0.2
**Stato:** `WAIT_REVIEW` — gate di revisione R04 ancora aperto.
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
