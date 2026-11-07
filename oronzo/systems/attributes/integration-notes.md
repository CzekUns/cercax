# Note di integrazione — Agente 8

**Ambito:** `oronzo/systems/attributes/`. Nessun file del runtime è stato modificato e nessuna integrazione diretta è stata dichiarata.

1. **Agente 7 — carriera.** Generare una rosa una sola volta (`generateSquad({seed,teamId,teamLevel})`) e salvare i PlayerV1. Ricaricare lo stato anziché rigenerare ogni apertura. A settimana conclusa applicare `applyTrainingWeek` esattamente una volta; a fine stagione salvare `recordSeasonSnapshot` e invocare una volta `advanceSeason`. Gli ID non cambiano con l'età.
2. **Agente 6 — motore partita.** Passare i PlayerV1 dentro `ClubV1`. Inserire `effectiveAbility(player,{skill,pressure,teamAction,tacticalDemand,requiresInstruction,leaderAura,allyId})` nelle decisioni reali di passaggio, tiro, contrasto, parata e scatto. Iniettare RNG deterministico; usare `resolveAction` solo sulla specifica azione che il motore intende risolvere. Fortuna modifica solo marginalmente la probabilità. Mai accreditare automaticamente un gol per `success`.
3. **Motore → carriera.** Al fischio finale raccogliere minuti di gioco effettivi ed eventi del motore; invocarli su `applyMatchLoad` e `recordMatch`. `recordMatch` è idempotente a chiave `seasonId:matchId`. Per un infortunio di gara chiamare `applyObservedInjury` solo se esiste un evento `injury` emesso dal motore. Per assist: utilizzare `goal.detail.assistId` oppure un evento `assist`; se entrambi sono presenti non si raddoppiano le statistiche.
4. **Agente 9 — allenatore.** Fornire i parametri `coachQuality`, `intensity` e `plan`; `adherence` incorpora disciplina, squadra, carattere e difficoltà dell'ordine. I modificatori sociali del mister e del presidente restano esclusivamente nell'agente 9. Gli stati di morale e rapporti aggiornati vanno mantenuti su PlayerV1.
5. **Migrazione.** `importLegacyPlayers(saved.players,'campanile')` converte le proprietà semplificate e mantiene le originali in parallelo. Lo scoring di `oronzo/game.js` non viene toccato: per rendere *misurabili in partita* le nuove differenze, l'orchestratore deve sostituirlo o collegarlo al motore Agente 6.

**Verifica integrazione proposta:** 22 in campo/11+11, 2 portieri per rosa, stessa azione con tiratore riposato vs stanco e confronto delle probabilità, nessun gol generato dal modulo attributi, infortuni attribuiti solo a eventi reali o sedute di allenamento, rosa persistente oltre la fine stagione, nessun doppio conteggio in caso di retry.

Nessuna dipendenza npm obbligatoria. ESM browser e `node:test`. UI interattiva autonoma in `demo.html` (smartphone orizzontale 16:9).


## Adattatori v0.2 — da realizzare negli altri moduli (NO runtime collegato in questa PR)

**06 match-engine:** ricevere `PlayerV1.mental.pazzia/spericolatezza/coraggio/suscettibilita/impulsivita` (0–100), leggere `analyzeDisposition` per propensione alle azioni rischiose, senza ricalcolare bonus duplicati rispetto a `effectiveAbility`. Gli ordini di tono passano per `applyShout` **una sola volta per `eventId`**, aggiornano l'oggetto calciatore nel successivo stato persistito, e valutano `effectiveAbility(player,{skill,t:matchTimeSeconds,...})` solo durante la finestra temporanea. Esempio `temporaryEffects: [{id,kind:'coach-shout',bonus,expiresAt}]` con `expiresAt` tempo match simulato, non wall-clock. L'engine mantiene responsabilità di snapshot, transizioni e probabilità finali. Stampa/lessico dei rimproveri spetta al 04.

**09 coach/club:** fornire `coachLeadership`, `coachOrigin`, `tone`; il campo `relationships.coachTrust` è la fiducia DEL CALCIATORE nel mister, distinta da morale coach/currency e board trust. `previewShout` calcola delta previsionali senza mutare; `applyShout` restituisce i nuovi dati e l'ID applicato, conservabili nel save. Niente game over nel modulo 08.

**07 carriera/dataset comuni:** passare ai generatori `origins` dal dataset verificato dei comuni, es. `[{comune:'...',regione:'...'}]`; il modulo valida la macroregione ma non può verificare che ogni comune sia effettivamente nella regione: 07 deve fornire record affidabili. Salvare `origin`, `surname`, `surnameSourceId`, `coachInteractionIds`, `temporaryEffects` insieme a PlayerV1 e NON rigenerarli a load. Il campione demo usa capoluoghi autentici, non è il dataset dei ~500 piccoli comuni della carriera.

**Nome/rarità:** l'ordinamento meno frequente si applica **dentro una sola sorgente e popolazione**; non combinare ranking locale 2026 con un ipotetico ranking nazionale 1979. `surname-sample.csv` contiene 20 cognomi COMUNI: sostituirlo con sorgente autorizzata e verificata prima di dichiarare il target 5000.

**Compatibilità:** le API v1 restano e i salvataggi legacy si normalizzano; `origin:null` significa dati ignoti, non fallback casuale. QA di runtime e salvataggi integrati ancora da eseguire nell'owner rispettivo.
