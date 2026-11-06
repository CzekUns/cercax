# ORONZO — CODA DI REVISIONE DELL'ORCHESTRATORE

Registro iniziale del 7 novembre 2026. **Non equivale ad approvazione tecnica né a merge.**
La verifica dei metadati GitHub (endpoint REST diretto) riporta `mergeable_state=clean` per le PR sottostanti al momento della consultazione. Gli stati possono cambiare.

| Priorità | PR | Agente | Stato QA | Merge |
|---|---|---|---|---|
| 1 | [#6](https://github.com/CzekUns/cercax/pull/6) | 01 · Sprite | DA REVISIONARE: palette, atlanti, mask, manifest, uso nel gioco | NO |
| 2 | [#12](https://github.com/CzekUns/cercax/pull/12) | 02 · Cutscene | DA REVISIONARE: animation 6 frame, maschere, trigger, compatibilità sprite | NO |
| 3 | [#5](https://github.com/CzekUns/cercax/pull/5) | 03 · UI | DA REVISIONARE: layout landscape 1280×720, componenti, leggibilità | NO |
| 4 | [#13](https://github.com/CzekUns/cercax/pull/13) | 04 · Copy | DA REVISIONARE: conteggi, JSON, originalità, presidenti, integrabilità | NO |

Gli agenti 05–09 sono in fase di primo sviluppo: issue #7, #8, #9, #10, #11 e branch dedicati. Non risultava una PR nel primo controllo effettuato per il coordinamento.

## Procedura
1. Rivedere in ogni PR **tutti i file modificati** e controllare che rispettino l'ambito consentito.
2. Eseguire test riportati nel README/delle demo, controllare immagini (non basta che esistano PNG), affidabilità di JS/JSON e uso reale delle API.
3. Marcare **APPROVATA** soltanto con esito riproducibile e qualità sufficiente; in caso contrario scrivere fix e lasciare la PR aperta.
4. Fare merge con HEAD SHA controllato, evitare di chiudere altre PR per errore.
5. Registrare per ogni agente in `NEXT.md` lo SHA mergiato, le limitazioni rimaste e il prossimo blocco pronto. Non avviare automaticamente chat senza intervento utente/automazione configurata.
6. Dopo il merge delle PR grafiche/narrative, valutare l'integrazione nel runtime `oronzo/game.js`. **Asset su main ≠ asset già usati nel browser**.

## Verifiche incrociate fondamentali
- Animazioni con ricolorazione compatibile tra sprite 01 e cutscene 02.
- UI 03 con viewport 16:9, componenti utilizzabili e gioco tattico sempre accessibile.
- Copy 04 con schema presidenti del motore società 09; eventuali differenze chiaramente documentate.
- Motore 06 genera snapshot, eventi e risultato; renderer 05 mostra ESATTAMENTE gli stessi fatti.
- Attributi 08 hanno effetto nella simulazione 06; carriera 07 e società 09 persistono senza duplicare stato.
