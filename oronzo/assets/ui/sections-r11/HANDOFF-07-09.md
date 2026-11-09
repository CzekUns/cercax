# ORONZO 07-bis · R11-01 · Handoff backend Stadio e Tifoseria

**Owner dati/transazioni:** Agente 07 (Career07) con API 09 (CoachClub). **Owner UI:** 07-bis. **Stato:** blocco parziale reale.

## Dati consumati dalla nuova UI

La vista legge lo stato persistito di club e mister:
- club.stadium = {capacity: integer > 0, condition: integer 0..100, ticketPriceITL: integer >= 0}. La creazione Career07 su main non fornisce questa struttura.
- club.supporters.approval soltanto se effettivamente persistito; altrimenti «non disponibile».
- club.finance.cash dal libro contabile autentico; club.management.stadiumSettlements[] solo dopo liquidazione 09 attestata e identificata da fixtureId.
- ui.coach.relationships.fans e ui.coach.relationships.media come proiezione reale di getStateForUI.
- ui.press come archivio di domande e risposte effettivamente presenti, senza articoli generati come fatti.

Senza club.stadium la UI mostra l'assenza di dati e nessun prezzo/incasso/capienza fittizio.

## Adapter richiesto a Career07 — firma di handoff proposta

1. All'inizializzazione della carriera associare uno stadio **solo** con dati esplicitamente autorizzati, o con parametri di gameplay apertamente qualificati come sintetici. Persistere attraverso newGame, createClub, saveGame, loadGame; non riempire retroattivamente i vecchi save con numeri inventati.

2. Esporre un port transazionale per il prezzo, firma proposta:
   changeCareerTicketPrice(state,{clubId,priceITL,eventId,expectedAbsoluteWeek})
   Deve controllare: clubId coerente con il mister, expectedAbsoluteWeek corrente, stage hub, stadium valido, presidente canonico. Costruire period={week:state.week,absoluteWeek:state.absoluteWeek,seasonYear:state.seasonYear} dall'autorevole Career07; chiamare setTicketPrice(club,president,{eventId,priceITL,period}) del 09; restituire {accepted,reason?,club?}. Scrivere club sullo stato **solo** dopo accepted:true, nella stessa transazione del save; nessun incasso dalla mera modifica del prezzo. Doppio evento/periodo deve essere respinto dal ledger 09.

3. Solo dopo risultato autentico Engine06 e review 09, per gara casalinga verificata, applicare settleHomeAttendance(club,coach,president,{fixture,period}), con fixture={id,homeId,awayId,result:{score:{home,away}}} e riferimenti coerenti con board.results/lastMatchIds. Persistenza atomica di result.club e result.coach, inclusi finance, ledger, supporters, fiducia e morale. Retry, save/load e stagione successiva non devono riaccreditare la stessa fixture. Trasferta e match non recensito non devono generare incasso.

4. Le richieste di manutenzione stadio vanno esposte solo dopo adapter autenticato per submitPresidentRequest e decidePresidentRequest. L'agente UI non esegue direttamente funzioni 09 e non inventa delibere.

## Gate UI successivo

Quando l'adapter esiste, la UI può aggiungere input biglietto e un comando di commit chiamando solo Career07, mostrando i risultati persistiti. QA: casa/trasferta, rigetto prezzo dal presidente, doppio click/eventId, save/reload, due stagioni, errore di una transazione senza modifiche parziali.

**Fino ad allora:** Stadio = scheda visiva e dati reali in lettura; Tifosi e Giornali consumano già le proiezioni persistite.
