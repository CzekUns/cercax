# ORONZO · Agente 09 · Contratto morale R03 (proposta bilanciamento)

**Scope**: solo CoachV2, effetti persistenti di offerte e risposte stampa. Nessuna partita, calendario, economia o modifica alla UI. Le formule sotto sono **ipotesi iniziali per QA**, modificabili dopo playtest; la visione approvata richiede morale 0 = game over, ma non ha fissato tutte le soglie.

## Import ed integrazione con Agente 07 PR #38

```js
import {
  createCoach, previewOfferMorale, applyOfferEffect,
  applyPressEffect, applyCoachMoraleEvent
} from '../../systems/coach-club/index.js';

// Agente 07: controller.acceptOffer(state, offerId, options)
const offerOptions = { previewOfferMorale, applyOfferEffect, press: pressCatalog };
// Agente 07: controller.answerOpeningPress / answerPostMatchPress
const pressOptions = { press: pressCatalog, applyPressEffect };
```

- `createCoach(raw)` restituisce una nuova struttura persistibile: `origin:{municipalityId,regionId,macroRegion}` (se non disponibile rimane `null`), `traits:{luck,leadership,selfEsteem,patience}`, `morale`, `moraleEvents`, `gameOver`, `relationships:{board,squad,fans,media,playerTrustById}`. Conserva `employmentHistory`, `hiredSeason`, `contract.until`, `presidentId` ed eventuali campi di carriera; i save 1985 privi di morale sono importabili con baseline provvisoria 50.
- `previewOfferMorale(coach,offer,club,settings?)` è **pura**; l'offerta è esattamente OfferV1 dell'07 con `id,clubId,coachWageITL,advertisedPrestige`. Il club ha `id,regionId,macroRegion`; il coach ha `origin.regionId,origin.macroRegion`. Se località, ID club o stipendio mancano, lancia un errore nominativo. Non simulare distanze.
- Restituisce **esattamente** `{baseDistanceCost,selfEsteemMultiplier,finalMoraleDelta,reasons}`. Le ragioni sono codici: `same_region`, `other_region_same_macro`, `other_macroregion`, `self_esteem_low_pay`, `wealthy_local_offer`.
- `applyOfferEffect({eventId,kind,semanticEffects,offer,coach,club})` è compatibile con il callback sincrono di `controller.recordEffect`: restituisce `{accepted:true,coach,event,gameOver}`. La chiave di 07 è `offer-morale:<offer.id>`. Ricalcola la preview prima dell'addebito; se la preview trasmessa differisce, lancia `offer_preview_mismatch`. EventID e ID offerta sono entrambi deduplicati sul coach salvato.
- `applyPressEffect({eventId,kind:'press',semanticEffects,coach,club})` consuma direttamente gli effetti di Copy04: `coachMorale, supportersTrust, mediaReputation, presidentTrust` (ognuno intero -3..3). Traduce rispettivamente in morale coach, fans, media e board; inoltre un'alta leadership concede un punto squad se l'effetto tifosi è positivo. Nessun testo narrativo o evento partita è inventato.
- `applyCoachMoraleEvent(coach,{eventId,reason,moraleDelta,relationships,sourceId?,date?})` è l'API generica per scelte del presidente/rapporti, da usare solo quando l'agente competente ha attestato l'evento. Le uniche relazioni persistite direttamente sono board, squad, fans, media; le relazioni singolo giocatore sono preservate, ma non mutate dalle conferenze.
- Gli applicatori ritornano `accepted:false,reason:'already_applied'|'source_already_applied'|'game_over'` senza cambiare punti in caso di replay. In caso di successo, **salvare l'intero result.coach** con `moraleEvents` e lo storico `effectTransactions` del 07 nello stesso salvataggio. `morale=0` fissa `gameOver:{eventId,reason:'morale_zero',date}`; anche dopo reload non si applicano recuperi o nuovi eventi.

## Parametri di bilanciamento provvisori

`OFFER_MORALE_BALANCE` (sovrascrivibile via quarto argomento preview o `balance` nell'applicatore) prevede costo 0 stessa regione, 1 altra regione nella stessa macro, 3 macro diversa. Le distanze sono alternative, non additive. Stipendio atteso = 14.000 + 250 × prestigio (valori **simulativi**, non retribuzioni storiche). Autostima oltre 50 e compenso sotto le attese moltiplicano fino a 2× il costo, arrotondato al punto più vicino; offerta locale di stipendio almeno 1,75× l'atteso dà +2. Clamp morale 0..100.

Nelle risposte press: pazienza >=80 riduce di 1 una perdita morale; fortuna >=90 mitiga di 1 la perdita reputazionale nei media; leadership >=80 converte una risposta favorevole ai tifosi in +1 spogliatoio. Soglie configurabili, nessuna causalità storica rivendicata. Autostima influisce sull'ingaggio. Questi effetti sono proposte e richiedono playtest, non sono formule imposte dall'utente.

## Gate, stato ed esclusioni

- Test isolati: `node --test oronzo/systems/coach-club/morale-r03.test.js` (vedi REPORT per esito effettivo). La suite integrale Coach09/Career07 e l'interfaccia del 03 richiedono ulteriore gate su checkout unificato PR #38 + questa PR.
- Nessuna mutazione dei ledger `finance` o `board`, nessuna modifica a `periodOf`, `settledWeeks`, `absoluteWeek`; i gate R04 rimangono nei moduli esistenti.
- Non sono implementati shout permanenti, papponeria estesa, biglietti, acquisti o simulazione partite. Game-over è già rilevabile da flow07, ma la UI del 03 deve ancora renderlo.
- L'integrazione delle 20 offerte e delle conferenze nel controller **non avviene automaticamente** con il merge di questo modulo: 07 deve passare le quattro funzioni sopra nei callback; nelle sessioni prive di callback il suo controller registra ancora `awaiting_agent09`.
