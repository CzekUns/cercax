# NEXT — ORONZO AGENTE 5 · MOVIMENTI E RENDERING

**Stato:** `READY` per ciclo R02, dopo completamento PR precedente.
**PR precedente:** [#15](https://github.com/CzekUns/cercax/pull/15), MERGIATA su main commit `9dc68d21c6700d856104a1d3820b4dab1a00f83f`.
**Fix concluso:** ORZ-P1-009, `resolveFacing` accetta ogni numero come radianti, come il motore; verificati in V8 E/W/N/S, ±1 come diagonali e hard cut all'intervallo. Bug originale R01/P1 lato renderer risolto come correzione puntuale dell'orchestratore, ora su main.

## Prossimo ciclo autorizzato
Riparti dall'ultimo `main` in branch `agent/oronzo-movements-r02`. Non riscrivere la PR precedente:
1. Esamina il runtime già integrato in `oronzo/partita-rapida.html` (sola lettura). Verifica nella tua directory la qualità dei movimenti dei 22 calciatori, allineamento tra sprite e palla, 8 orientazioni, cambio campo, animazioni e caricamento asset reali.
2. Aggiungi nei soli `oronzo/systems/match-view/` correzioni e test, se effettivamente necessarie, per movimenti troppo bruschi, sovrapposizioni, animazioni di giocatori che scattano e casi limite pause/velocità.
3. Prepara QA browser Android/Chromium su landscape 640×360, 800×360, 844×390, se disponibile; non spacciarla per completata se non eseguita. Documenta regressioni e risultati nel tuo `REPORT.md`, poi PR verso main. Non modificare il motore o l'HTML integratore.
**Nessun merge autonomo** e niente nuova sessione Coerentizzatore su R01.
