# COERENTIZZATORE — AUDIT R02 COMPLETATO

**Stato:** `COMPLETED_R02` — rapporto completato e mergiato in [PR #20](https://github.com/CzekUns/cercax/pull/20). Nessun audit aggiuntivo autorizzato.
**Conclusione:** cinque difetti P1 confermati e assegnati ad agenti 7 e 9 nei rispettivi NEXT. Il Coerentizzatore si ferma; non ripete l'audit.
**Priorità:** integrazione carriera + società + presidenti, moduli già su main, non revisionare tutta ORONZO.

## Ambito preciso: tre moduli su main
- **Carriera / agente 7**: PR #14 MERGIATA, commit `bb9e384796fdd8fd7ad8b7f200cc5902511442e1`, `oronzo/systems/career/`.
- **Società / agente 9**: PR #17 MERGIATA, commit `7309f1fe908e2e62b4304f44261d026d2866755c`, `oronzo/systems/coach-club/`.
- **Copy e catalogo presidenti / agente 4**: PR #13 MERGIATA, commit `065dc4ee7e59e26612b14c471b9c2be99f43cad1`, `oronzo/content/`.

## Domanda
**Possono i tre moduli funzionare insieme durante una carriera di due stagioni, conservando club/presidente/allenatore/finanze e testi coerenti, senza perdere dati o assegnare il presidente sbagliato?**

Verifica prioritariamente:
1. **Identità dei club e presidenti:** `president:{club.id}` generato dalla carriera contro gli ID canonici di `content/presidents.json`; caricamento dei presidenti nel modulo `coach-club/presidents.js`; mapping deterministico/stabile dopo salvataggio e nuovo anno. Non attribuire automaticamente il medesimo presidente a ogni club.
2. **Obiettivi societari:** Carriera usa `avoidRelegation|topHalf`, board usa `avoid_last|top_half`. Valuta se il fallback impone obiettivi sbagliati, e raccomanda un adapter o normalizzazione di una sola fonte, con test.
3. **Stato mutabile vs copie:** società restituisce nuovo ClubV1 mentre carriera modifica il proprio stato; verifica che cassa, budget, fiducia ed esonero sopravvivano a `advanceWeek`, `finishSeason`, `serialize/deserialize` senza perdere aggiornamenti; il mister propone mercato ma la società delibera.
4. **Contratti e salari:** Career PlayerV1 potrebbe non avere `contract.weeklyWage`. Verifica coerenza tra roster, payroll e salvataggio, e un caso di transazione senza fondi.
5. Esegui test mirati (Node/JS quando possibile) e indica **al massimo 5 P0/P1** dimostrati, con file, linee e fix consigliati per agenti 4/7/9 o orchestratore.

## Output limitato
Rapporto R02 in `oronzo/coordination/coerentizzatore/REPORT-R02.md` in PR documentale separata oppure in chat se GitHub non scrivibile: SHA, massimo 5 problemi P0/P1, test effettivi pass/fail/non eseguiti, tabella di interfaccia e un **ordine di integrazione** ragionato. Non cambiare codice, `NEXT.md`, `ORCHESTRATOR.md` o `REVIEW-QUEUE.md`; non fare merge, non convocare agenti o creare lavori non richiesti. Nessun altro audit in questa sessione.

## Contesto aggiuntivo: partita
Le PR #15 (match-view) e #18 (motore) restano aperte. L'orchestratore ha già trovato un problema specifico in `resolveFacing`: il renderer interpreta `±1` come vecchi segni E/W, ma il motore emette radianti; è stato assegnato **direttamente all'agente 5** senza sprecare Work. Non riesaminare #15/#18 in questo audit R02, salvo che emerga una dipendenza strettamente necessaria alla carriera.
