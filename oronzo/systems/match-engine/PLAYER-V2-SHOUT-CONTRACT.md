# ORONZO — Contratto API R10: PlayerV2 dell'08, shouts del 06 e ledger 09

**Proprietario:** Agente 06. **PR:** #35. **Input PlayerV2 effettivo:** PR #31 dell'Agente 08. **Consumer:** flow07 e Coach09. I dati di esempio non sono dati personali o anagrafiche verificate.

## Input canonico

- 08: PlayerV2 in `ClubV1.players`: `id`, `teamId`, `positions`, `origin:{comune,regione,macroregione}|null`, `relationships.coachTrust` in [0,100], `mental.character/composure/discipline/suscettibilita/impulsivita`, eventualmente `temporaryEffects` e `coachInteractionIds`.
- 09: CoachV2 con `origin` (forma italiana oppure `{regionId,macroRegion}`) e `traits.leadership`. 07 deve fornire i valori dal save persistente, non inventare province, città o trust.
- 06: `createMatch` fa una copia e crea `matchContext.origin={regionId,macroRegion}|null` e `matchContext.coachTrust=0..100|null`. Le macroregioni `Nord|Centro|Sud` diventano `north|centre|south`. Zero trust è un valore valido; `origin:null` è veramente ignoto. L'origine PlayerV2 prevale sul payload legacy `playerOrigin`, e il trust annidato prevale sul payload `playerTrust`.

## Comando e toni verso 07

```js
import {createIndividualShoutCommand} from './orders.js';
const order=createIndividualShoutCommand({
  teamId:club.id, player:club.players[9], coach, tone:'gentle', utteranceId:'copy-01'
});
const response=match.command(order);
if(!response.accepted) console.log(response.reason);
```

Il comando risultante è `{type:'shout',teamId,payload:{targetPlayerId,tone,coachOrigin,coachTraits,playerOrigin?,utteranceId?}}`. Le coppie canoniche sono `encourage ⇔ gentle` (incoraggiamento) e `harsh ⇔ hard` (rimprovero). Il motore accetta entrambe e normalizza `detail.tone` a `encourage|harsh`, lasciando `detail.attributesTone` come `gentle|hard`. Gli ordini di squadra legacy restano separati.

Il target deve essere in campo nella stessa squadra; infortunio, tone errato, bench e cooldown (120 secondi per giocatore) producono `accepted:false` con `reason`. Un ordine non accettato non consuma RNG né genera evento. La durata iniziale di bilanciamento è 150 secondi simulati.

## Proprietà degli effetti: MAI duplicare

- **Temporaneo, soltanto 06:** un evento `coach_shout` per ordine accettato e un `player.personalShout` per target; il nuovo sostituisce il precedente, non lo somma. Il fattore modifica movimento e decisioni calcistiche, non lo score direttamente. `snapshot.players[].individualInstruction` è una vista opzionale read-only fino alla scadenza, non un secondo bonus.
- **Nessun secondo effetto 08:** non richiamare `08.applyShout()` per un `coach_shout` risolto da 06; produrrebbe 180 secondi aggiuntivi e mutazioni di `mental.morale`, `confidence` e `coachTrust`. Il motore ignora `PlayerV2.temporaryEffects` nella fisica ed esclude `effectiveAbility()` dall'applicazione di questo bonus. Per contesti fuori partita l'08 resta proprietario delle proprie API.
- **Permanente, soltanto 09:** l'evento contiene un solo `detail.persistentSuggestion:{playerTrustDelta,coachMoraleDelta}`. `temporaryOwner:'match-engine-06'` e `persistentOwner:'coach-club-09'` identificano il dominio. `coachMoraleDelta` attuale è 0 e non va interpretato come gameplay già implementato.

## Idempotenza, serializzazione e salvataggi

```js
import {collectCoachEffects} from './coach-effects.js';
const {effects,appliedEventIds}=collectCoachEffects(
  match.getEventsSince(lastEventId),career.appliedEventIds,{matchId:fixture.id});
// 09: applica i delta una volta e persiste rapporti e appliedEventIds atomicamente.
```

`effects[].eventId` è `matchId:event.id` univoco fra gare. Ripresentare lo stesso evento in due snapshot, ripetere il retry o serializzare/deserializzare JSON non produce un secondo delta se il ledger è conservato. Il callback 09 non deve invocare anche `08.applyShout()`; 07 non deve trattare la vista `individualInstruction` come un evento. Il bridge non muta coach, player, input o save.

**Limite:** sono verificati JSON roundtrip di PlayerV2, eventi e ledger. `snapshot()` non contiene lo stato completo del simulatore (RNG, palla in volo, cooldown); non è un formato di ripresa di partita a metà gara. Il recupero di match live richiederebbe un ciclo e un contratto aggiuntivi.

## Gate test e integrazione

`node --test` esegue test vecchi e `tests/r10-contract.test.mjs`. Il nuovo `tests/r10-cross-08.test.mjs` richiede un checkout combinato PR #31 + #35 (altrimenti è SKIP); verifica la vera factory PlayerV2, preview tonale solo in lettura, trust 0/100, regione/macro/altro, 100 partite reali 08, 10 replay e ledger JSON idempotente. `npm run qa` mantiene 100 seed sintetici. Eseguire QA Node su checkout combinato e review indipendente 00 prima del merge. Il 06 non modifica UI/07/08/09 e non effettua merge.
