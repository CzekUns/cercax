# ORONZO 1979 · Roadmap operativa condivisa
_Stato iniziale: 12 novembre 2026. Fonte canonica dei requisiti: `GAME-VISION-v02.md`; questa roadmap ordina solo il lavoro corrente._

## Decisione del proprietario
Priorità assoluta alla grafica R13, sezione per sezione. Risultato di qualità verificabile nel gioco pubblico, non nuove idee a ogni esecuzione. Le chat esecutive e l'automazione oraria usano **gli stessi task e lo stesso handoff GitHub**.

## Corsie e sequenza
1. **R13-A · Figurine raster:** PR #77 è su main. PR #79 è l'unico intervento aperto di rifinitura anatomica/artistica per barba, mento, spalle, maglie e varietà dei volti. Owner esclusivo della PR #79: R13-TER. Gate: confronto visivo con lo screenshot di Ennio Robetti + test veri della scheda, salvataggio, divise; nessun merge automatico di lavoro altrui.
2. **R13-B1 · Asset sprite partita:** owner esclusivo AUTOMATION-R13 in una **nuova directory isolata** `oronzo/assets/players/r13-match/`; produrre PNG/WebP realmente illustrati (non forme Canvas/SVG), modularità e varianti di posa/kit. Non toccare gli asset/renderer della PR #79; riprendere sempre stesso task/PR dalle esecuzioni precedenti. La consegna asset può procedere in parallelo alla sola revisione di #79 perché i file non si sovrappongono.
3. **R13-B2 · Wiring sprite nel match:** owner AGENT-05 soltanto dopo B1 e compatibilità grafica con A. Riutilizzo DNA PlayerV2, 22 giocatori/portieri, kit, test HTTP in-game; eventuale intervento in `career-r03.js` richiede delega esplicita del 07-bis.
4. **R13-C · Campo:** owner AGENT-05, successivo a B2. Dimensioni, proiezione, area di rigore, porte/rete, texture erba, scala calciatori e minimappa, senza alterare il motore.
5. **R13-D · Camera FULL e TV zoom:** owner AGENT-05 dopo C. Seguimento pallone, limiti, zoom e visibilità, stessa partita/match engine, 1× circa 15 minuti reali.
6. **Backlog R12 e altri moduli:** in pausa finché R13 non è completata o il proprietario cambia priorità. La PR #75 resta separata e non deve essere ripresa automaticamente.

## Regola di avanzamento
Ogni task ha **un solo owner, scope esclusivo, branch/PR persistenti, definizione di completamento e log riprendibile**. I file `TASKS.json` e `STATE.json` sono snapshot dell'orchestratore su `main`: per l'avanzamento fra esecuzioni non mergiate, leggere anche la **PR attiva** e il relativo `worklogs/<task-id>.md` nel branch dell'owner.

Una tranche è finita soltanto quando sono registrati: file reali, test, prova visiva, PR/HEAD, eventuale merge, Pages SUCCESS. `PR OPEN` e `TEST PASS` non significano `PLAYABLE`. Non duplicare R11/R12 già mergiati.
