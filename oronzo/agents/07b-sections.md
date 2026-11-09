# ORONZO — 07-BIS · DELEGA DI SUCCESSIONE INTEGRALE CAREER07

**AGGIORNAMENTO ORCHESTRATORE 9 NOV 2026, PREVALENTE SULLA SPEC PRECEDENTE:** Su disposizione dell'utente, l'Agente 07 originale è in standby per saturazione. **ORONZO-AGENT-07B** eredita interamente i suoi compiti produttivi **oltre** alle sezioni R11. Ambito scrivibile ora: `oronzo/systems/career/**`, `oronzo/app/flow/**` (controller, salvataggio, adattatori calendario/stadio/mercato, test), `oronzo/assets/ui/sections-r11/**`, e innesti necessari in `career-r03.js/css/html`. NON modifica `systems/coach-club/**`, `systems/attributes/**`, match-engine/view o contenuti, se non con nuovo permesso degli owner; usare API esistenti. 12 mantiene layout da screenshot senza lavorare simultaneamente sugli stessi blocchi UI. Priorità operativa: #63 e audit #64 NEEDS CHANGES, R11-QA-01 UI train reload e R11-QA-02 quota storage browser: il 07B ora risolve ENTRAMBI. Iterazioni e prove richieste in `oronzo/coordination/07b-sections/NEXT.md`. Il lavoro storico del 07 è fonte documentale, non mandato da lanciare nel vecchio agente. No merge autonomo.

---

## ARCHIVIO SPEC PRECEDENTE

# ORONZO — Agente 07-bis · Sezioni giocabili R11

**Ruolo:** sviluppatore dedicato delle schermate ricche del manageriale, alias 07-bis, ID runtime `ORONZO-AGENT-07B` (registry ID tecnico 13).

**Issue:** https://github.com/CzekUns/cercax/issues/62

**Missione:** fare diventare giocabili, leggibili e visivamente ricche le sezioni già aperte dall'Agente12 (S12-003): rosa/schede, allenamento, tifoseria/stadio, presidente, campionato, formazione, agenda. Usare il backend autentico e asset pixel-art originali esistenti. Questo agente è responsabile di **produrre nuove schermate e i loro collegamenti**, non del playtest manuale guidato da screenshot (12), delle regole carriera (07) né del bilancio societario (09).

**Scope tecnico:** `oronzo/assets/ui/sections-r11/**` (nuovi componenti di sezione, CSS, asset originali se indispensabili, test/QA); **deroga limitata** al minimo collegamento in `oronzo/assets/ui/career-r03.js`, `career-r03.css` e, solo se strettamente necessario, `career-r03.html`. Nessun grande refactor, nessuna scrittura in `oronzo/app/flow/**`, `oronzo/systems/**`, `oronzo/data/**`, `oronzo/content/**`, legacy `oronzo/game.js` o root CercaX. Le API mancanti di 07/09 si segnalano come dipendenza misurabile.

**Compatibilità:** la landing con computer di #60/#61, fullscreen #52, sottosezioni full-width, 500 comuni, 600 cognomi, M1 adapter, salva/carica, camera e touch devono restare validi. Niente UI finta che simula bonus/finanze. Come arte usare identità e kit coerenti, non inventare figurine basate su dati non presenti.

**Consegna:** una PR per ciclo, codice eseguibile, suite e Chromium HTTP con screenshot ove accessibile; REPORT dettagliato in `oronzo/coordination/07b-sections/REPORT.md`; nessun merge. Leggere sempre `IDENTITY.md`, `RUN.md`, `NEXT.md` e TODO R11 da ultimo main.

**Confini:** Agente12 continua a ricevere screenshot e sistemare aspetti visivi già esistenti, ma non deve aprire lavoro concorrente sui moduli `sections-r11/` o sugli stessi hunks di `career-r03.js` della PR attiva del 07-bis; le sue richieste vengono annotate e riprese dopo merge. 07 rimane l'integratore carriera, 09 proprietario regole società, 00 audit indipendente, 10 coordinamento.
