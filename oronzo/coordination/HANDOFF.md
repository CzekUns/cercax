# ORONZO · Handoff operativo permanente
_Adattamento del modello multi-agente persistente deliberato il 12/11/2026. Questo file è il punto d'ingresso per chat nuove e automazioni._

## Alla PRIMA operazione di OGNI esecuzione
1. Leggere su **ultimo `main`**: `GAME-VISION-v02.md`, `ROADMAP.md`, `TASKS.json`, `STATE.json`, `HANDOFF.md`, `QA.md`; quindi `registry.json` e i file `10b-orchestrator/{IDENTITY,RUN,NEXT,HANDOFF}.md` come contratto legacy e storico.
2. Identificare il proprio **owner esatto** e UN SOLO task: l'automazione oraria è `AUTOMATION-R13` e ha `R13-MATCH-ATLAS`; la chat R13-TER possiede #79. Non assumere alcuna proprietà di file di altri agenti.
3. Controllare LIVE main SHA, branch/HEAD/PR/CI/deploy e confrontarli con lo snapshot `STATE.json`. Se divergono, lo stato live prevale: non ripartire da una bozza superata.
4. Se la propria PR è già aperta, leggere la PR/branch e il file `oronzo/coordination/worklogs/<TASK-ID>.md` **sul branch**. Riprendere l'ultimo elemento verificato; non aprire un altro task.
5. Realizzare la massima tranche concreta possibile, senza report sostitutivi. Registrare nella PR e nel proprio worklog *esattamente* quali asset/ID/moduli sono stati prodotti e testati; ogni indice è riprendibile. Commit/push nel branch della PR, senza force-push.
6. Se la run termina a metà, lasciare un handoff leggibile con l'**esatto prossimo file/ID**, comando per riprendere, problemi e screenshot/test. La successiva esecuzione riparte lì, senza nuova pianificazione.
7. Alla consegna, passare a `WAIT_REVIEW`, chiedere audit, approvazione artistica ove richiesta e integrazione. Soltanto il coordinatore aggiorna le copie **su main** di `TASKS.json`/`STATE.json`/`HANDOFF.md` quando cambia un gate o l'owner.

## Trasferimento dei lavori / ripresa senza chat precedente
- Nuova chat o nuova automazione: usare il testo precedente come prompt di ripresa; nessuna memoria della chat è necessaria se branch, worklog, task e PR sono aggiornati.
- `WORKING`: riprendi il proprio worklog. `WAIT_REVIEW`: non cambiare scope; correggi solo su richiesta. `BLOCKED`: registra causa e attesa. `DEPLOYED`: non rifare il lavoro.
- Issue e PR sono il dettaglio operativo e le prove; i file di coordinamento sono **assegnazioni e stato**, non un secondo sistema di sviluppo.
- Non lasciare numeri di test e release presunti: distinguere sempre demo isolata, Chromium HTTP nel gioco, telefono Android fisico e Pages SUCCESS.

## Ownership attuale e conflitti da evitare
- **R13-TER (#79):** esclusiva sui PNG ritratti, maschere, `portrait-r13.js`; la PR ha già test Chromium, ma il gate artistico è in revisione.
- **AUTOMATION-R13:** incarico esclusivo `R13-MATCH-ATLAS` sotto `oronzo/assets/players/r13-match/**`; non modificare `oronzo/assets/players/r13/**`, `portrait-r13.js`, `sections.js`, `career-r03.js` senza nuovo incarico.
- **AGENT-05:** renderer campo/camera soltanto dopo le dipendenze.
- PR #75 e altre idee narrative sono in pausa.

## Orchestratore 10-bis
Interviene per decisioni del proprietario, modifica priorità/owner, dipendenze, blocchi, conflitti, QA/merge e rilascio. **Non ripianifica automaticamente ogni ora.** Gli autori implementano; 00 può auditare; 10-bis coordina e verifica. Le eccezioni di merge automatico già consentite al worker valgono esclusivamente per le **proprie** PR, se ogni gate pertinente è verde e non viene violato un owner.

## Handoff di ciascuna run: campi minimi
```text
TASK_ID / OWNER / BRANCH / PR / HEAD
COMPLETATO: asset o funzioni, ID e file esatti
VERIFICATO: strumenti, comandi, risultati e screenshot
NON FATTO: parti incomplete e motivo
PROSSIMO: esatto file/ID e prima operazione riproducibile
MAIN / PAGES: SHA e verifica SUCCESS oppure NO
```
