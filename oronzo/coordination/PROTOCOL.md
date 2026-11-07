# Protocollo di lavoro ORONZO: revisione → merge → nuova iterazione

## Documenti per ogni agente
- `IDENTITY.md` (orchestratore): identifica l'agente senza ambiguità, indica issue, branch originale, spec e spazio di codice.
- `RUN.md` (orchestratore): PROMPT PERMANENTE. Incollalo ogni volta nella stessa chat per far riprendere il lavoro.
- `NEXT.md` (orchestratore, su `main`): piano corrente, gate di revisione e criteri di accettazione. Gli agenti NON possono modificarlo.
- `REPORT.md` (agente, sul proprio branch): rapporto concreto dell'ultima iterazione; viene introdotto/aggiornato nella sua PR. Se assente, significa che l'agente non ha ancora pubblicato rapporto, non che il lavoro sia terminato.

## Stati di NEXT.md
- `WAIT_REVIEW`: c'è una PR aperta da verificare. L'agente può correggere la PR su richiesta, ma non iniziare una nuova iterazione indipendente.
- `FIX_REQUESTED`: correzioni esplicite su PR corrente, i criteri sono in NEXT.md o commento di review.
- `READY`: il ciclo precedente è stato integrato/chiuso e il nuovo incarico è pronto. Partire dall'ultimo `main` e dal successivo branch -rNN.
- `WORKING`: primo incarico non ancora consegnato; proseguire nello scope, poi aprire PR.
- `BLOCKED`: dipendenza o problema non risolto; descrivere il blocco, non inventare soluzioni.

## Passi dell'agente
1. Identifica precisamente il tuo ID e leggi, nel ramo `main`, `IDENTITY.md`, `RUN.md`, `NEXT.md` e il file `oronzo/agents/NN-*.md` indicato.
2. Consulta issue, stato dell'eventuale PR, contratto del proprio sistema, AGENTS.md, codice già integrato. Non assumere che la tua vecchia branch sia aggiornata.
3. Se `WAIT_REVIEW`, produci un report stato / correggi soltanto su richiesta; **non aprire un altro lavoro concorrente**. Se `FIX_REQUESTED`, correggi il branch della PR e aggiorna il rapporto. Se `READY`, crea un branch di nuova iterazione **dall'ultimo main** e realizza i task di NEXT. Se `WORKING`, completa la consegna attuale.
4. Esegui test reali, verifica png e formati (quando applicabile), fornisci demo e screenshot se possibili. Se qualcosa non riesce, scrivi l'errore esatto.
5. Crea/aggiorna `oronzo/coordination/<tuo-slug>/REPORT.md` nel tuo branch, con modello seguente. Questa è l'unica eccezione al perimetro tecnico assegnato.
6. Crea/aggiorna la PR e riporta il link nell'issue. Non fare merge. Nel report specifica le dipendenze dagli altri agenti, i nomi dei file, l'API pubblica e i passi d'integrazione.
7. Aspetta la revisione/merge dell'orchestratore; al comando successivo **rileggi NEXT.md su main** prima di altro lavoro.

## Modello per REPORT.md
```markdown
# RAPPORTO AGENTE NN — [titolo] — ciclo NN
Stato: PR_OPEN | FIX_NEEDED | BLOCKED | DELIVERED (non scrivere MERGED: è compito orchestratore)
Branch: ...
PR: ...
Commit verificato: ...
Data/ora: ...
## Realizzato
- File concreti, percorsi, funzioni e risultati effettivi.
## Verifiche
- Comandi/test eseguiti e risultati osservati (pass/fail); asset verificati e screenshot.
## Integrazione
- API/export/manifest da collegare; dipendenze, divergenze dai contratti e breaking changes.
## Mancante / problemi
- Limiti, bug, feature non fatte, eventuali conflitti.
## Proposta prossimo ciclo
- 1–3 task ordinati per priorità; l'orchestratore decide cosa autorizzare.
```
Non dichiarare mai eseguiti test non eseguiti. Se il merge fallisce o una PR ha conflitti, il report lo indica e rimane aperta fino a risoluzione.

## Passi dell'orchestratore
A. Legge i 9 REPORT.md, le issue e le PR; controlla file changed e perimetri; verifica test e demo, conflitti, qualità visiva, contratti e collisioni fra agenti.
B. Chiede modifiche quando necessarie; merge SOLO dopo esito positivo e conflitti risolti, senza cancellare lavoro altrui.
C. Dopo il merge, aggiorna esclusivamente su `main` il `NEXT.md` dell'agente con SHA mergiato, ciò che è stato verificato, i bug residui, nuove attività e criteri di accettazione.
D. La chat dell'agente, richiamata con lo stesso testo di `RUN.md`, riparte dal nuovo `main`. Nessun avanzamento automatico non avviato.

## Revisione Work su richiesta: COERENTIZZATORE
Coerentizzatore non è un decimo agente di produzione: è un revisore ausiliario isolato. L'orchestratore mantiene la memoria operativa in `oronzo/coordination/ORCHESTRATOR.md`. Prima di attivare Work, l'orchestratore imposta un singolo incarico in `coerentizzatore/REQUEST.md` indicando PR, commit, criteri e confini del controllo. Work riceve il proprio prompt fisso `coerentizzatore/RUN.md` e produce un rapporto verificabile; NON fa merge, NON modifica NEXT, NON integra il runtime o il codice degli agenti. Uno stato `STANDBY` significa non utilizzare Work. Le chat operano solo su richiesta, senza reporting automatico fra chat.

## AGENTE 10 — ORCHESTRATORE DI REGOLE E DELEGHE (mandato rettificato)
L'utente ha identificato la chat di orchestrazione come **ORONZO-AGENT-10**. La memoria operativa e il prompt di ripresa sono in `10-orchestrator/IDENTITY.md`, `RUN.md`, `NEXT.md`, `PLAN.md` e `CONTRACT-v02.md`. I **nove agenti di produzione** 01–09 conservano i loro ID e scope, mentre Coerentizzatore resta revisore ausiliario. La specifica prodotto v0.2 (1979 e morale) è `GAME-VISION-v02.md`. Le chat non sono processi avviabili tramite un commit; serve richiesta esplicita alle chat o un'automazione configurata. Gli stati WAIT_REVIEW/BLOCKED e i gate R02 non si saltano per la nuova visione.

### Confine vincolante del mandato dell'Agente 10
Agente 10 **non è integratore del runtime né sviluppatore**. Riceve regole dall'utente, le inserisce nei file di coordinamento e negli incarichi appropriati, verifica le consegne, coordina merge dopo gate. Tutto il codice e gli asset sono delegati agli agenti produttivi. Future eccezioni di scope per 03 (UI runtime) e 07 (flow/adapter) richiedono autorizzazione nei loro NEXT e apertura di PR separate; gli altri non possono toccare questi file. La correzione prevale su precedenti istruzioni che nominano 10 come integratore.
