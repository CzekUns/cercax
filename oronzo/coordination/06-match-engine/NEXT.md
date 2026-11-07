# NEXT — AGENTE 06 · ENGINE E ORDINI INDIVIDUALI · VISIONE v0.2
**Stato:** `READY` (secondo ciclo).
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