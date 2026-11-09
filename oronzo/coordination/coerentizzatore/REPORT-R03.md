# ORONZO — R03 prematuro, verifica preliminare

**Stato: PREMATURE / integrazione non completata.** Verifica del 7 novembre 2026 sul commit main `8d370b07cdba94319312af4cce3345f16f170fcf`.

L'incarico utente R03 richiede di fermarsi se l'integrazione dell'agente 10 non è completata. Questa condizione è verificata. Il presente documento registra il gate di arresto, senza formulare un verdetto finale sul gioco v0.2.

## Prove verificabili

| Fonte al commit esaminato | Evidenza |
|---|---|
| [10-orchestrator/NEXT.md](https://github.com/CzekUns/cercax/blob/8d370b07cdba94319312af4cce3345f16f170fcf/oronzo/coordination/10-orchestrator/NEXT.md) | Stato WORKING. Dichiara che l'integrazione completa non è ancora sviluppata e che manca la UI completa Nuova partita → campionato |
| [10-orchestrator/PLAN.md](https://github.com/CzekUns/cercax/blob/8d370b07cdba94319312af4cce3345f16f170fcf/oronzo/coordination/10-orchestrator/PLAN.md) | Il loop avatar → ingaggio → presidente → cinque domande → hub → partita → postmatch → morale → save/load è ancora la milestone M1 da realizzare |
| [index.html](https://github.com/CzekUns/cercax/blob/8d370b07cdba94319312af4cce3345f16f170fcf/oronzo/index.html) | Ingresso del prototipo, intestazione STAGIONE 1985/86, script game.js e link separato a partita-rapida.html |
| [partita-rapida.html](https://github.com/CzekUns/cercax/blob/8d370b07cdba94319312af4cce3345f16f170fcf/oronzo/partita-rapida.html) | Crea input sintetico con makeFixture, importa engine/view e clock della partita rapida. Il percorso letto non registra risultati nella carriera |
| [ORCHESTRATOR.md](https://github.com/CzekUns/cercax/blob/8d370b07cdba94319312af4cce3345f16f170fcf/oronzo/coordination/ORCHESTRATOR.md) | La sezione NUOVA VISIONE UTENTE v0.2 dichiara esplicitamente ancora assente la sequenza completa e distingue il contratto proposto dall'implementazione |

Letti RUN, PROTOCOL, GAME-VISION-v02, PLAN, NEXT, memoria orchestratore, REQUEST corrente e rapporti R01/R02. Il REQUEST su main riporta ancora COMPLETED_R02. La richiesta diretta dell'utente autorizza il controllo R03, il cui limite di arresto è applicato qui. Le annotazioni storiche dei rapporti precedenti non vengono ripresentate come difetti attuali.

## Stato delle prove richieste

| Prova | Esito in questa sessione |
|---|---|
| Creazione carriera v0.2 fino alla prima partita | NON ESEGUITA, gate di integrazione non superato |
| Save/load durante la stagione sul runtime v0.2 | NON ESEGUITA |
| Seconda stagione sul runtime v0.2 | NON ESEGUITA |
| Cambio modulo e coordinate effettive | NON RIESEGUITA, stop preliminare. La PR #24 è documentata come integrata, senza certificazione di questa sessione |
| Morale e game over a zero | NON ESEGUITA |
| Risultati, classifiche, bilanci e storico integrati | NON ESEGUITA |

Nessuna suite runtime o browser avviata. Il controllo documentale e l'ispezione statica dei due ingressi confermano la condizione di arresto. Nessuna classificazione P0/P1/P2 né conclusione definitiva sulla coerenza dell'implementazione finale.

R03 potrà essere rieseguito su nuovo incarico quando l'agente 10 avrà consegnato il percorso integrato su main, con commit e ingresso eseguibile per le prove richieste.
