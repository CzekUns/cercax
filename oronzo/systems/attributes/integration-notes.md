# Note di integrazione — Agente 8

**Ambito:** `oronzo/systems/attributes/`. Nessun file del runtime è stato modificato e nessuna integrazione diretta è stata dichiarata.

1. **Agente 7 — carriera.** Generare una rosa una sola volta (`generateSquad({seed,teamId,teamLevel})`) e salvare i PlayerV1. Ricaricare lo stato anziché rigenerare ogni apertura. A settimana conclusa applicare `applyTrainingWeek` esattamente una volta; a fine stagione salvare `recordSeasonSnapshot` e invocare una volta `advanceSeason`. Gli ID non cambiano con l'età.
2. **Agente 6 — motore partita.** Passare i PlayerV1 dentro `ClubV1`. Inserire `effectiveAbility(player,{skill,pressure,teamAction,tacticalDemand,requiresInstruction,leaderAura,allyId})` nelle decisioni reali di passaggio, tiro, contrasto, parata e scatto. Iniettare RNG deterministico; usare `resolveAction` solo sulla specifica azione che il motore intende risolvere. Fortuna modifica solo marginalmente la probabilità. Mai accreditare automaticamente un gol per `success`.
3. **Motore → carriera.** Al fischio finale raccogliere minuti di gioco effettivi ed eventi del motore; invocarli su `applyMatchLoad` e `recordMatch`. `recordMatch` è idempotente a chiave `seasonId:matchId`. Per un infortunio di gara chiamare `applyObservedInjury` solo se esiste un evento `injury` emesso dal motore. Per assist: utilizzare `goal.detail.assistId` oppure un evento `assist`; se entrambi sono presenti non si raddoppiano le statistiche.
4. **Agente 9 — allenatore.** Fornire i parametri `coachQuality`, `intensity` e `plan`; `adherence` incorpora disciplina, squadra, carattere e difficoltà dell'ordine. I modificatori sociali del mister e del presidente restano esclusivamente nell'agente 9. Gli stati di morale e rapporti aggiornati vanno mantenuti su PlayerV1.
5. **Migrazione.** `importLegacyPlayers(saved.players,'campanile')` converte le proprietà semplificate e mantiene le originali in parallelo. Lo scoring di `oronzo/game.js` non viene toccato: per rendere *misurabili in partita* le nuove differenze, l'orchestratore deve sostituirlo o collegarlo al motore Agente 6.

**Verifica integrazione proposta:** 22 in campo/11+11, 2 portieri per rosa, stessa azione con tiratore riposato vs stanco e confronto delle probabilità, nessun gol generato dal modulo attributi, infortuni attribuiti solo a eventi reali o sedute di allenamento, rosa persistente oltre la fine stagione, nessun doppio conteggio in caso di retry.

Nessuna dipendenza npm obbligatoria. ESM browser e `node:test`. UI interattiva autonoma in `demo.html` (smartphone orizzontale 16:9).

