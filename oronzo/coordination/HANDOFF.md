# ORONZO · Handoff persistente SOLO PER AUTOMAZIONI

> Questo protocollo regola i **worker orari e altre automazioni**. Non è un nuovo protocollo per agenti avviati manualmente in chat. I loro `RUN.md`, `NEXT.md`, PR e competenze rimangono quelli esistenti; nessun task manuale va inserito o governato qui.

## All'inizio di ogni esecuzione automatica
1. Leggere su ultimo `main`: `oronzo/coordination/{ROADMAP.md,TASKS.json,STATE.json,HANDOFF.md,QA.md}` e `GAME-VISION-v02.md`. Non assumere aggiornato lo snapshot; confrontare con GitHub in tempo reale.
2. Selezionare **solo il task attivo con il proprio identificatore di automazione**, al momento `AUTOMATION-R13` → `R13-MATCH-ATLAS`. Se lo stato non consente lavoro, registrarne la causa, senza inventare un task.
3. Aprire lo **stesso branch/PR della run precedente**, non iniziarne altri. Leggere il worklog del task dal branch; in mancanza cercarlo su `main` come scheletro iniziale.
4. Prima di modificare file, controllare la lista dei file cambiati dalle PR attive dei lavoratori manuali. Evitare sovrascritture: questo sistema non blocca, riassegna o dirige i loro incarichi.
5. Produrre una tranche sostanziale con asset/codice reali, test e screenshot quando pertinenti. Salvare i commit e aggiornare il **solo worklog del proprio task** sul proprio branch.
6. Annotare checkpoint atomico: ultimi asset/frame verificati, prossimi non verificati, test PASS/FAIL/non eseguiti, HEAD, PR, errori riproducibili.
7. Alla chiusura: PR unica, QA, eventualmente merge se espressamente autorizzato e testato; Pages SUCCESS per dichiarare PLAYABLE. Attendere un nuovo task dal proprietario/coordinatore prima di iniziare un'altra funzione.

## Esempio di continuità
Un'esecuzione produce 120 frame su 750 e registra nel worklog gli identificatori **esatti** dei 120 verificati, non un generico «16%». La successiva legge il worklog sul branch e lavora dal primo frame ancora incompleto.

## Chi decide cosa fare
L'automazione **esegue**, il proprietario o chi coordina le automazioni **assegna/cambia priorità** aggiornando `TASKS.json` e `STATE.json` su `main`. Non occorre ripianificare ogni ora.

Questo sistema **non modifica l'orchestrazione dei manuali**: l'Agente 10-bis può continuare il proprio coordinamento degli agenti da chat; il nuovo registro serve unicamente alle automazioni. I file di un agente manuale vengono consultati dal worker soltanto come dipendenza informativa/conflitto.

## Schema minimo checkpoint worklog
```text
AUTOMATION_ID / TASK_ID / BRANCH / PR / HEAD
COMPLETATO: file reali e ID esatti
VERIFICATO: comandi, pass/fail, screenshot
NON FATTO: elementi restanti e ragione
PROSSIMO: esatto ID/file e prima operazione
MAIN / PAGES: SHA e successo verificato oppure NO
```
