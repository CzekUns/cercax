# RAPPORTO ORONZO-AGENT-09 — R03 · Morale del mister, offerte e conseguenze stampa

**Stato:** PR_OPEN / CONSEGNATO PER REVISIONE, NON MERGIATO
**Branch:** `agent/oronzo-coach-club-r03-morale`
**Pull Request:** https://github.com/CzekUns/cercax/pull/39
**Issue:** https://github.com/CzekUns/cercax/issues/11
**Base main verificata:** `dcec6acc931c440597c3c28a6bd9f7d24d9bb94e`
**Data:** 7 novembre 2026
**Nessun merge effettuato.**

## Realizzato

Il precedente ciclo R02 è stato integrato tramite PR #32. Il NEXT su main autorizza il nuovo R03 e richiede solo morale/ingaggi/conferenze, senza papponeria, ticketing o shouts.

- `oronzo/systems/coach-club/coach-model.js`: `createCoach` conserva i dati di carriera, origine e quattro tratti V2 `luck,leadership,selfEsteem,patience`; aggiunge morale persistente, gameOver terminale, `moraleEvents`, relazioni `board/squad/fans/media/playerTrustById`. Default legacy di schema a 50, non una formula definitiva di bilanciamento. Un vecchio save 1985 non cambia stagione né contratto.
- `oronzo/systems/coach-club/morale.js` (nuovo): `previewOfferMorale` pura; `applyOfferEffect` per ID offerta/evento; `applyPressEffect` per gli effetti dichiarativi di Copy04; `applyCoachMoraleEvent` generica per eventi societari verificati. Un `eventId` o `sourceId` già contabilizzato non modifica di nuovo il coach dopo ricaricamento. Morale 0 imposta `gameOver:{eventId,reason:'morale_zero',date}` e impedisce nuovi cambiamenti nello stesso save.
- `oronzo/systems/coach-club/index.js`: export pubblico delle API R03.
- `oronzo/systems/coach-club/morale-r03.test.js` (nuovo): nove test nativi Node.
- `oronzo/systems/coach-club/MORALE-R03.md` (nuovo): contratto di import, callback e parametri per il 07.
- Questo `REPORT.md` è l'unico documento modificato fuori dallo scope tecnico dell'Agente 09.

## Bilanciamento R03: proposta, non scelta definitiva utente

Stessa regione costo 0; altra regione nella stessa macro costo 1; altra macro costo 3 (alternativi); autostima alta/ingaggio sottopagato moltiplica il costo fino a 2×; offerta molto ricca nella regione di origine può dare +2. Stipendio atteso simulativo `14000 + 250*advertisedPrestige` lire, soglia ricchezza `1.75×`. Nella stampa: pazienza >=80 mitiga una perdita di morale di 1; fortuna >=90 mitiga un danno media di 1; leadership >=80 favorisce il gruppo (+1) se la risposta aumenta la fiducia dei tifosi. Parametri esportati da `OFFER_MORALE_BALANCE` e sovrascrivibili. Nessuna di queste soglie pretende fondamento storico o approvazione definitiva.

## Verifiche realmente eseguite

- Container locale, **Node v22.16.0**: `node --test morale-r03.test.js` — **9 test passati, 0 falliti**. Casi: preservazione avatar/contratto/vecchi save; purezza preview; seed riproducibile; regioni e cachet; differenze tra avatar; errori per geografia/contratto; stessa offerta una sola volta dopo JSON save/reload; morale zero/game over e recuperi vietati; press ripetuta e clamp relazioni; eventi non supportati respinti.
- **Confronto dei file realmente pubblicati:** FNV-1a a 32 bit calcolato sul testo dei sorgenti nel container e letto dal branch GitHub, coincidente per `morale.js=95ba6b54`, `coach-model.js=f5f885cc`, `morale-r03.test.js=a592189c`. Il test Node è stato eseguito su questi identici contenuti.
- GitHub `compare main...branch`: inizialmente **5 file cambiati** e **0 commit indietro** rispetto alla base; file tutti `oronzo/systems/coach-club/`. Il presente REPORT è la sesta modifica consentita.
- **NON eseguiti**: `node --test` dell'intera cartella preesistente (41 test), suite combinata Career07 PR #38 + Coach09, browser/Android, flow e salvataggio end-to-end. Blocco: da questo container `git ls-remote https://github.com/CzekUns/cercax.git HEAD` restituisce `Could not resolve host: github.com`. I test nuovi isolati **non equivalgono** al gate di integrazione.

## Contratto pubblico per Agente 07

Importare da `oronzo/systems/coach-club/index.js`:

1. `createCoach(raw) -> coach`: inizializzare **all'avvio nuova carriera** nel flow perché il controller PR #38 preserva attualmente origin/traits ma lascia `coach.morale` non assegnato finché non si inietta 09. Preservare `coach.moraleEvents`, `coach.gameOver` e `coach.relationships` dopo save/load.
2. `previewOfferMorale(coach,offer,club,settings?) -> {baseDistanceCost,selfEsteemMultiplier,finalMoraleDelta,reasons}` (pura). L'input `offer` è l'OfferV1 di `oronzo/systems/career/offers-r03.js`: `id,clubId,coachWageITL,advertisedPrestige`; `club` fornisce `id,regionId,macroRegion`, `coach.origin` fornisce `regionId,macroRegion`. Dati mancanti: eccezione esplicita, nessuna regione o retribuzione inventata.
3. `applyOfferEffect({eventId,kind:'initial_offer',semanticEffects:{preview},offer,coach,club}) -> {accepted,coach,reason?,event?,gameOver?}`: usare come callback del controller 07 `acceptOffer(state,id,{previewOfferMorale,applyOfferEffect,press})`. Deduplica l'ID evento `offer-morale:<offer.id>` e `sourceId:'offer:'+offer.id`; la preview ricalcolata deve coincidere.
4. `applyPressEffect({eventId,kind:'press',semanticEffects,coach,club}) -> {accepted,coach,reason?,event?,gameOver?}`: usare in `answerOpeningPress/answerPostMatchPress(state,q,a,{press,applyPressEffect})`. Copy04 fornisce `coachMorale, supportersTrust, mediaReputation, presidentTrust`, interi -3..3; 09 mappa a morale/fans/media/board. Nessun testo della 04 viene alterato.
5. `applyCoachMoraleEvent(coach,{eventId,reason,moraleDelta,relationships,sourceId?,date?})`: interfaccia generica idempotente per decisioni certificate, senza creare punteggi/risultati. Conservare il `result.coach` in modo atomico con i `flow.effectTransactions` di 07.

Il controller PR #38 registra ancora `awaiting_agent09` se i callback non sono iniettati: **questa PR da sola non modifica il flow né la UI**. La UI 03 potrà leggere `coach.morale`, `coach.gameOver` e `relationships` soltanto dopo collegamento di 07.

## Limiti e rischi per la review

- La scelta del costo è una proposta; playtest dopo integrazione 07/03.
- Il `gameOver` blocca nel singolo save, non impedisce al giocatore di caricare un salvataggio precedente (regola di prodotto da definire).
- La ledger dei nuovi eventi di morale vive nel coach e **non tocca** i domini temporali/ledger di paghe, board e due stagioni del gate R04; assenza di regressione sul codice vecchio riscontrabile staticamente dai file cambiati, non attestata da un Node combinato.
- R03 NON implementa papponeria estesa, mercato, prezzo biglietti, shouts permanenti o reportistica media storica.
- Possibile review cross-module PR #38: inizializzazione CoachV2 nel flow, stato `gameOver`, entrambe le PR su un checkout e test Node completi.

## Proposta prossimo ciclo (soggetta ad Agente 10)

1. Priorità P0: agenti 07/09 eseguano test combinato sul merge virtuale PR #38 + #39, verificando cash/ledger vecchi e due stagioni.
2. Collegamento 03 alla presentazione di morale, preview e game over dopo approvazione del controller 07.
3. Solo con NEXT nuovo: relazioni con presidente, papponeria, tifosi e shouts permanenti.
