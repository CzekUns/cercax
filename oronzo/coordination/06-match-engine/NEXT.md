# NEXT — AGENTE 06 · ENGINE E ORDINI INDIVIDUALI · VISIONE v0.2
**Stato:** `FIX_REQUESTED` — prevale la direttiva R05 in fondo al documento; lavoro R02 nella PR esistente.
**PR precedente:** #18 MERGIATA; fix fisico riallineamento modulo PR #24 già su main.
**Fonte:** [visione v0.2](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/GAME-VISION-v02.md), [epic #25](https://github.com/CzekUns/cercax/issues/25).
**Branch:** `agent/oronzo-match-engine-r02` dall'ultimo main.
**Scope:** `oronzo/systems/match-engine/` e proprio REPORT.

## Attività
1. Prima 100 seed di QA e metriche: risultati, tiri, possesso, passaggi, falli, infortuni, fuorigioco, sostituzioni, 22 sprite e fulltime; includere i cambi modulo durante la gara dopo PR #24, garantire che i giocatori recuperino gli ancoraggi senza teleport e che score=eventi goal.
2. Estendi `CoachCommandV1` `{type:'shout',teamId,payload:{targetPlayerId,tone:'encourage'|'harsh',...}}` in modo che accetti/rifiuti con motivazione, emetta un evento riproducibile e abbia influenza temporanea e graduata sulla prestazione del singolo (non una rete predefinita). Attributi/affinità regionali arrivano come dati, non duplicare i generatori dell'agente 08.
3. Isola un bridge di output effetti verso l'agente 09 (saldo morale coach e rapporti persistenti gestiti FUORI dal match engine). Evita doppi effetti se più snapshot contengono lo stesso evento. Test eventi/cooldown/tone a seed fisso.
4. Preserva 1× circa 15 minuti nella pagina integratrice esistente, senza implementare il clock nel motore.

## Accettazione
ESM e API precedenti compatibili, 100 seed e test regressione, partita deterministica, zero duplicazioni effetti, REPORT e PR senza merge. Mai modificare match-view o root HTML.

## Controllo orchestratore — ripresa parallela del 7 novembre 2026
Il branch `agent/oronzo-match-engine-r02` è **1 commit avanti** con modifiche in `actions.js`, `commands.js`, `movement.js` e nuovi `coach-effects.js`, `orders.js`, tutti nella directory del motore. Non risultano nuova PR né REPORT R02; **nessuna approvazione** concessa. Completare test 100 seed e regression dei comandi individuali, garantire eventi/risultati deterministici, poi pubblicare PR e REPORT. Rapporto morale persistente spetta a 09, UI a 03.

## R04 — CONSEGNA IN REVISIONE WORK 00
**PR:** [#35](https://github.com/CzekUns/cercax/pull/35). **Stato di merge:** NON confermato. Rapporto R02 presente sul branch della PR; testi precedenti READY sono archivio del lavoro autorizzato, non un invito a iniziare un altro ciclo.
**Gate di accettazione:** QA 100 seed e test input shout/deduplica; potenziale incompatibilità origine/tono/doppio effetto con 08. Non accettare bridge senza adapter.
**Regola:** attendere review Work 00 e riassegnazione da Agente 10; solo correzioni sulla PR corrente se richieste, niente R03 autonomo.


## AGENTE 10 — RISULTATO R04 E PROSSIMO PASSO (7 novembre 2026)
**PR #35**, stesso branch `agent/oronzo-match-engine-r02`. **Priorità P1 dopo #30/#32**. R04 **R04-3/4** riproduce `affinity:'unknown'` per due campani provenienti dalla forma PlayerV2 dell'08; cambiando trust da 0 a 100 il modificatore rimane identico (prova 0,05235). Il tono `encourage` non è ammesso dall'API `08.applyShout`.
**Correzioni del 06, coordinate con 08 e 09:**
1. Adattare l'input match a leggere **anche** `player.origin={comune,regione,macroregione}` e `player.relationships.coachTrust` prodotti davvero dall'08. Non basta normalizzare un `payload.playerOrigin` che viene scartato quando `player.origin` ha priorità. Concordare una rappresentazione normalizzata e una mappa esplicita `encourage/harsh ↔ gentle/hard`; niente parser dialettali nel motore.
2. Il **motore 06 è l'unico produttore dell'effetto TEMPORANEO in partita** (`personalShout`, durata/evento); non invocare `08.applyShout` come secondo bonus nella stessa partita. Eventi `coach_shout` univoci con `matchId:eventId` e output `persistentSuggestion`; 09 applicherà i delta permanenti una sola volta e persisterà il ledger con lo stato.
3. Aggiungere test reali con PlayerV2 generato da 08: stessa regione > stessa macro > diversa, trust 0/100 cambia risposta, toni mappati, duplicazione snapshot/reload senza doppio effetto, 100 seed/regressione calcio.
4. Scrivere REPORT e aggiornare PR #35; **nessun merge** prima della compatibilità verificata con #31. Non modificare i file 08/09 né runtime UI.


## DIRETTIVA ATTUALE — DISPATCH R05 (7 NOVEMBRE 2026)
**Iniziare ORA sulla PR #35 esistente, insieme all'08** (nessun nuovo branch/PR). R04-3/4 sono ancora aperti sull'HEAD `11e9901285f16ce3119c945fd22890a9c3e70fff`. Dati **canonici dell'08**: `player.origin={comune,regione,macroregione}`, `player.relationships.coachTrust`; normalizzarli in ingresso partita **prima di createMatch**, perché il parametro `player.origin` prevale su `payload.playerOrigin`. Tonalità engine `encourage|harsh`: adapter dichiarato verso `gentle|hard` di 08, senza doppia logica. Il 06 possiede il bonus temporaneo unico per evento `coach_shout` e lo propone in `persistentSuggestion`; il 09 possiede esclusivamente la contabilizzazione duratura con ID `matchId:eventId`. Vietato invocare anche `08.applyShout` applicando un secondo bonus. Test reali con giocatori 08 della stessa regione/macro/altre, trust 0/100, toni, seed e doppio snapshot/reload, includendo regressione 100 seed. Aggiornare REPORT e PR #35, solo nel tuo scope. Non attendere i dati comuni/cognomi completi per questo fix.
