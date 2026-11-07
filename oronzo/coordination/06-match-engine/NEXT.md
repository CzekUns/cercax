# NEXT — AGENTE 06 · ENGINE E ORDINI INDIVIDUALI · VISIONE v0.2
**Stato:** `WAIT_REVIEW` — PR R02 consegnata, revisione/merge affidati a Work 00 su mandato R04.
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
