# ORONZO · CENTRO DI COORDINAMENTO DEGLI AGENTI

> **Nuovo centro operativo R13 — 12 novembre 2026:** per task attivi, owner esclusivi e ripresa tra chat/automazioni leggere **[ROADMAP.md](ROADMAP.md) · [TASKS.json](TASKS.json) · [STATE.json](STATE.json) · [HANDOFF.md](HANDOFF.md) · [QA.md](QA.md)**, poi la PR/branch dell'owner e il suo [worklog](worklogs/). Questo strato **integra**, senza sostituire, \`registry.json\`, il protocollo esistente e i file agenti. I documenti storici R11 non rappresentano uno stato live. Le istruzioni nuove esplicite del proprietario prevalgono; nessun autore deve modificare due scope concorrenti.


**Questa cartella su `main` è la fonte di verità per lo stato dei lavori e i prossimi incarichi.**
L'orchestratore supervisiona, prova e integra le PR, aggiorna `NEXT.md`; ciascun agente esegue soltanto il proprio ambito e pubblica `REPORT.md` con prove e limiti.

## Agenti
| # | Agente | Issue | Spazio permanente |
|---|---|---|---|
| 1 | Sprite e pixel art dei calciatori | [#1](https://github.com/CzekUns/cercax/issues/1) | [01-players](01-players/) |
| 2 | Cutscene gol, parate ed eventi | [#2](https://github.com/CzekUns/cercax/issues/2) | [02-cutscenes](02-cutscenes/) |
| 3 | Interfaccia grafica coerente | [#3](https://github.com/CzekUns/cercax/issues/3) | [03-ui](03-ui/) |
| 4 | Copy, personaggi e comicità | [#4](https://github.com/CzekUns/cercax/issues/4) | [04-copy](04-copy/) |
| 5 | Movimenti e visualizzazione della partita | [#7](https://github.com/CzekUns/cercax/issues/7) | [05-match-view](05-match-view/) |
| 6 | Motore calcistico e tattiche | [#8](https://github.com/CzekUns/cercax/issues/8) | [06-match-engine](06-match-engine/) |
| 7 | Modalità carriera e campionati | [#9](https://github.com/CzekUns/cercax/issues/9) | [07-career](07-career/) |
| 8 | Attributi, carattere e allenamenti | [#10](https://github.com/CzekUns/cercax/issues/10) | [08-attributes](08-attributes/) |
| 9 | Allenatore, società e presidenti | [#11](https://github.com/CzekUns/cercax/issues/11) | [09-coach-club](09-coach-club/) |
| 10 | Orchestratore (governance, NEXT, review/merge) | [#25](https://github.com/CzekUns/cercax/issues/25) | [10-orchestrator](10-orchestrator/) |
| 11 | UI mobile M01 (storico) / F01 fullscreen in revisione | [#47](https://github.com/CzekUns/cercax/issues/47) | [11-mobile-ui](11-mobile-ui/) |
| 12 | Correzioni UI guidate dal playtest, schermata per schermata | [#54](https://github.com/CzekUns/cercax/issues/54) | [12-ui-tuning](12-ui-tuning/) |


> **Nuovo flusso per le correzioni UI (8 novembre 2026):** [HANDOFF12](12-ui-tuning/HANDOFF.md) · [Registro per schermata](12-ui-tuning/SCREEN-NOTES.md) · [RUN12](12-ui-tuning/RUN.md). Il proprietario ha **scartato il Layout Studio** e annoterà modifiche visive tramite screenshot e istruzioni; Agente12 modifica il codice della singola schermata nel proprio branch, senza sviluppare un editor. Agente11 conserva soltanto la storia e gli incarichi espliciti; nessun lavoro concorrente negli stessi file.

## Regole
1. Ogni agente usa *sempre lo stesso prompt di riavvio*, salvato nel proprio `RUN.md`. Non occorre riscriverlo a ogni ciclo.
2. Leggere `NEXT.md` su **main** prima di iniziare. Lo modifica SOLO l'orchestratore, dopo revisione, test e decisione sul merge.
3. Gli agenti lavorano solo nel proprio scope tecnico e scrivono il proprio `REPORT.md` nella rispettiva cartella. Niente commit su file root CercaX, `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `NEXT.md` o cartelle altrui.
4. Ogni PR contiene nel corpo un resoconto ed include `REPORT.md` con verifiche. Avvisare nell'issue con il link alla PR. L'orchestratore può leggere anche report su un **branch non ancora mergiato**.
5. Prima di riprendere dopo un merge: rileggere lo stato di `main`, aggiornare codice/contratti e aprire un **nuovo branch di ciclo**, p.es. `agent/oronzo-players-r02` (non sottobranch con `/` del branch originale). Le PR si propongono verso `main`. Mai continuare a partire da una base vecchia.
6. Una PR mergeable **non è automaticamente approvata**. Verificare anche contenuti, contratti, compilazione, asset e funzionamento su mobile.
7. Nessun agente può fare merge della propria PR. Solo l'orchestratore, dopo QA; può chiederne correzioni.
8. Il rapporto GitHub è una forma di comunicazione consultabile: le chat non si avvisano direttamente né lavorano autonomamente tra un turno e l'altro.

Consulta [PROTOCOL.md](PROTOCOL.md) e [registry.json](registry.json) per dettagli.

## Coerentizzatore (chat ChatGPT Work, revisore di riserva)
L'orchestrazione quotidiana resta in questa chat e in [ORCHESTRATOR.md](ORCHESTRATOR.md), il **registro persistente** del progetto. Il [Coerentizzatore](coerentizzatore/README.md) è una chat Work da usare **solo quando serve un audit incrociato difficile**, mai per controlli quotidiani. Il prompt permanente è [coerentizzatore/RUN.md](coerentizzatore/RUN.md); gli incarichi si attivano in [coerentizzatore/REQUEST.md](coerentizzatore/REQUEST.md) e partono in stato `STANDBY`. Può depositare un rapporto senza toccare codice o effettuare merge; la responsabilità di valutare e integrare resta all'orchestratore principale.
