# ORONZO · Agente 09 — Interfaccia gestionale R10

## Stato, ownership e limiti

Codice ESM senza renderer. Solo Agent09 possiede: morale persistente, relazioni, stato economico Club, governabilità dei presidenti, incassi stadio e trust dei calciatori dopo Engine06. Career07 resta fonte del calendario/mercato, della partita verificata, dei salvataggi e dell'applicazione atomica del risultato; Agent12 realizza gli schermi. Il gioco sul `main` **non acquista queste funzioni solo perché questa PR è aperta**. Importare dal barrel `oronzo/systems/coach-club/index.js` o dai singoli moduli omonimi.

Le formule quantitative sono bilanciamento **proposto** e parametrizzabile in `MANAGEMENT_BALANCE`: non prezzi storici italiani certificati, non calendari storici ricostruiti e non informazioni fittizie presentate come fatti.

## Inizializzazione

`initializeManagement(club,president) -> club` crea su una **copia** il ledger `management:{version:1,ticketChanges:[],stadiumSettlements:[],requests:[],shouts:{}}`, più `boardTraits:{papponeria,spendingWillingness,fanAttachment}` e `supporters:{approval}`. La papponeria, se non già persistita, si deriva una sola volta dai tratti *originali* del profilo canonico, non da un presidente di test. `presidentMatchesClub` garantisce che `president.id === club.presidentId`. Non rigenera le proprietà di un club già salvato. `createClub` preserva esplicitamente `stadium`, `supporters`, `boardTraits`, `management` al caricamento.

Lo stadio deve essere passato da Career07 con parametri espliciti: `club.stadium={capacity:integer>0,condition:integer(0..100),ticketPriceITL:integer>=0}`. La capacità **non viene inventata**: senza input le API stadio lanciano `stadium_data_required`. Il bilancio è quello autentico `finance.cash`, non una seconda cassa.

Ogni API gestisce una **copia immutabile** e restituisce `{accepted,club,coach?,reason?,...}`. Salvataggio: sostituire `state.clubs[index]` con `result.club` e `state.coach` con `result.coach` **nella stessa transazione**. Se un callback fallisce, non fare commit parziale dello stato. La carriera migra ledger temporali legacy: la guard `periodLedgerError` rifiuta l'uso misto di `{week}` vecchio con `{week,absoluteWeek,seasonYear}` moderno.

## Percorso A: stadio e biglietti

1. `recommendTicketPrice(club,president,balance?) -> number`: proposta deterministica in ITL; considera papponeria e i risultati **già attestati** in `club.board.results`.
2. `presidentTicketFloor(club,president,balance?) -> number`: prezzo minimo richiesto dal presidente; un prezzo inferiore restituisce `president_refuses_low_price` da `setTicketPrice`.
3. `setTicketPrice(club,president,{eventId,priceITL,period,balance?}) -> {accepted,club,was,priceITL}`: al massimo una modifica per chiave di periodo, salvo nuova settimana; eventi duplicati respinti. Non accredita entrate fittizie.
4. Dopo la partita casalinga, **solo dopo** `reviewMatch` autentico e risultato finale: `settleHomeAttendance(club,coach,president,{fixture,period,balance?}) -> {accepted,club,coach,settlement}`. `fixture={id,homeId,awayId,result:{score:{home,away}}}`; il `matchId` deve apparire in `club.board.results` e `club.board.lastMatchIds`, con `result` e `periodKey` coerenti. Il calcolo deterministico utilizza: capienza vera fornita, condizione stadio, approvazione tifosi, ultimi cinque risultati e prezzo rispetto al riferimento di bilanciamento. Non crea goal, fixture o risultati. Il ricavo è `attendance * ticketPriceITL`, intero sicuro, contabilizzato tramite `finance.book({type:'income',note:'tickets:'+fixture.id,...period})`; aggiorna supporters approval, club.boardTrust e `applyCoachMoraleEvent` una volta per `stadium:<fixture.id>`. Ledgers di incasso + morale devono essere salvati insieme.

Un secondo processamento dello stesso `fixture.id`, anche dopo save/load o stagione successiva, restituisce `already_settled` e non riaccredita la cassa. Una partita in trasferta o senza review da Board09 è respinta.

## Percorso B: richieste e decisioni presidenziali

- `coachPresidentCompatibility(coach,profile) -> score(0..100)`: combina leadership/pazienza/autostima con autoritarismo/pazienza/vanità reali del presidente. È una proposta di bilanciamento testabile.
- `submitPresidentRequest(club,coach,profile,{requestId,kind,amountITL,period})` registra una richiesta `pending`; non spende soldi. `kind`: `stadium_repair`, `training_facilities` oppure `market_mandate`. ID stabile richiesto.
- `decidePresidentRequest(club,coach,profile,{requestId,period,balance?})` calcola una scelta deterministica e motivata: `unpaid_liabilities`, `insufficient_cash`, `payroll_or_mandate_reserve`, `president_policy_rejects` oppure `approved`; usa cassa, payroll settimanale, spesa già autorizzata, papponeria, propensione alla spesa, attaccamento allo stadio, fiducia board e compatibilità caratteriale. `stadium_repair` paga davvero con `finance.book` e migliora `stadium.condition`/approvazione tifosi; `training_facilities` paga ed espone `management.trainingQuality` per futuro adapter07/08. `market_mandate` **non inventa cash**: riserva un massimale e diventa `spent` solo dopo un trasferimento realmente perfezionato. Tutti gli esiti influiscono su boardTrust/coach morale/relationships mediante evento idempotente.

Se la richiesta è già risolta, il retry restituisce `already_decided` e non addebita di nuovo. Non si promettono investimenti senza verificarne cassa e conseguenze.

## Mercato: guardia temporale stretta da Career07

`requestTransferInWindow`, `reviewTransferInWindow`, `negotiateTransferInWindow`, `finalizeTransferInWindow`; analoghi `requestSaleInWindow`, `decideSaleInWindow`, `finalizeSaleInWindow`. Usano le API originarie di `negotiations.js`, non una seconda lista di calciatori. L'input obbligatorio è

```js
const period={week:1,absoluteWeek:1,seasonYear:1979};
const window={source:'career-07',id:'stable-window-id',open:true,seasonYear:1979};
```

Career07 deve autenticare l'oggetto `window` dal **proprio** calendario/flow; 09 non può attestare la provenienza di un input JS costruito da altri. Fino a questo adapter, mancanza di fonte/finestra aperta/periodo stagionale coerente blocca l'azione (`career07_market_window_required`, `market_window_closed` ecc.). Le date del 1979 **non vengono indovinate**. Comprare richiede anche una `market_mandate` del presidente approvata e non spesa. Al perfezionamento di un giocatore proveniente da un altro club, `finalizeTransferInWindow` esige `sellerRelease:{source:'career-07',confirmed:true,playerId,sellerClubId}` con ID coerenti: senza conferma restituisce `career07_seller_release_required` e non crea un doppione in rosa. Career07 **deve rimuovere il calciatore dal club cedente nella stessa transazione di save**; 09 non può mutare il club cedente da una funzione che riceve il solo club acquirente. `finalizeTransfer`/`finalizeSale` ora propagano `{week,absoluteWeek,seasonYear}` a `finance.book`, evitando il bug di pagamenti nel dominio temporale legacy dopo il rollover. La spesa è effettiva solo dopo la firma, il giocatore entra nella rosa una volta, e il contratto `weeklyWage` entra nel payroll verificato.

## Trust permanente dei comandi individuali Engine06 / PR35 / Career07 PR56

`persistShout({key,coach,club,event}) -> {accepted,duplicate?,club,coach,playerTrust?}` è esattamente il callback richiesto da `journalM1Shouts` e `reconcileM1Shouts` in `oronzo/app/flow/m1-contract.js` della PR #56. `key=fixtureId+':'+String(event.id)`. Evento **autorevole** di Engine06:

```js
{
  id:7,type:'coach_shout',teamId:'club-id',playerId:'player-id',
  detail:{accepted:true,temporaryOwner:'match-engine-06',
    persistentOwner:'coach-club-09',temporaryEffect:{modifier:.04,startedAt:0,expiresAt:150},
    persistentSuggestion:{playerTrustDelta:2,coachMoraleDelta:0}}
}
```

Valida chiave, squadra, calciatore e provenance; applica soltanto `persistentSuggestion` con clamp su `player.relationships.coachTrust`, mirror `player.relationshipWithCoach` e `coach.relationships.playerTrustById`. Il bonus `temporaryEffect` rimane **esclusivamente** del MatchEngine06. Ledger `club.management.shouts[key]`, evento morale `shout:<key>`, replay uguale ack `{accepted:true,duplicate:true}` (compatibile con il reconciler di 07), replay discordante eccezione `conflicting_shout_replay`. Serve il PlayerV2 normalizzato da 08; se `coachTrust` assente, fallisce `missing_player_coach_trust`. L'08 non deve riapplicare il temporaneo.

## QA e confini

`node --test oronzo/systems/coach-club/management-r10.test.js` e suite preesistente `node --test oronzo/systems/coach-club/*.test.js`. La suite R10 copre i due verticali completi, replay, JSON save/load, due stagioni, salary rollover, vincoli mercato e shout. Il `REPORT` specifica cosa è stato **realmente** eseguito in un Node locale e cosa attende merge virtuale delle PR #31/#35/#56. Nessuna modifica a UI, Engine06, dati o calendario Career07. Non considerare la PR utilizzabile dal giocatore fino al collegamento adapter07 e UI12.
