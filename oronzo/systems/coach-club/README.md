# ORONZO · Coach, Club & Board Engine (Agente 9)

Sistema ESM autonomo per una carriera calcistica ambientata nel 1985–86. L'utente è l'allenatore: seleziona formazione, tattica, preparazione e richieste di mercato, ma soltanto la dirigenza può approvare e perfezionare i contratti. Il motore non è ancora collegato al prototipo monolitico. Nessun pacchetto npm o backend richiesto.

## Esecuzione

Nella directory di questo modulo, lanciare: **node --test** (14 test), oppure **npm test**. Per la demo HTML servire la root del repository con **python3 -m http.server 8000**, poi aprire http://localhost:8000/oronzo/systems/coach-club/coach-club-demo.html in landscape 16:9. La demo è diagnostica, non grafica finale.

## API pubbliche

- coach-model.js: createCoach, updateRelationship, recordCoachReputation, chooseTrainingPlan.
- coach-actions.js: prepareMatchday, coachCommand, changeCoachTactics. Producono lineup e comandi CoachCommandV1 che il match engine deve accettare/rifiutare.
- club.js: createClub, applyTrust, registerStaffDecision. Stato ClubV1 esteso con board, finance, market.
- finance.js: initializeFinances, weeklyPayroll, book, settleWeek, financialHealth.
- presidents.js: validatePresident, presidentRoster, loadPresidents, presidentBehavior.
- negotiations.js: requestTransfer, reviewTransfer, negotiateWithSeller, finalizeTransfer, requestSale, decideSale, finalizeSale.
- board.js: reviewMatch, conveneBoard, answerBoardRequest, resolvePromises, applyClubEvent, endClubWeek.
- index.js: re-export per l'orchestratore.

Le azioni con esiti condizionali restituiscono un oggetto con accepted, reason e stato aggiornato. Tutte le funzioni restituenti nuovi stati usano copie serializzabili e lasciano immutati gli input. Il seme è esplicito; nessuna scelta societaria usa Math.random.

## Bilancio e trattative

- budget e finance.cash rappresentano la **cassa disponibile in lire nominali intere (ITL)**. wageBudget rappresenta un **tetto salariale settimanale**, non denaro depositato.
- player.contract.weeklyWage è lo stipendio settimanale in lire, estensione di PlayerV1; valore mancante = 0. Sponsor, trasferte e bonus sono parametri del gioco, non listini storici verificati.
- Ogni settimana si incassano sponsor ed eventuali entrate documentate, si pagano arretrati, stipendi, trasferta e premi. Gli oneri obbligatori non pagati diventano arrears: la cassa non scende sotto zero. Spese discrezionali superiori alla cassa vengono rifiutate.
- Il mister avvia una richiesta, il direttore sportivo e il presidente la valutano, poi si negozia con il club cedente. L'acquisto modifica rosa e cassa **solo** al perfezionamento, con nuovo controllo di liquidità e monte stipendi. Le cessioni richiedono approvazione e offerta reale.
- Promesse del presidente restano pledged finché il chiamante non attesta un contributo esterno; a scadenza possono diventare broken, con conseguenze su fiducia e morale.

## Comportamento presidenziale

presidentBehavior(profile, state, seed) è puro e deterministico. Calcola probabilità e scelte di approvazione mercato, ingerenza tattica, dichiarazioni stampa, ultimatum, promesse e rischio esonero a partire dai sette tratti di PresidentProfileV1, fiducia, sconfitte e necessità finanziarie. Non cambia i punteggi.

L'agente 4 possiede nomi e testi ufficiali in oronzo/content/presidents.json. loadPresidents riceve una funzione fetchJson che restituisce i dati, in forma di array o oggetto con presidents/profiles; se il file manca o non supera la validazione, usa 8 archetipi locali **sintetici TEST**, dichiarati fallback non canonico. La demo visualizza sempre la provenienza.

## Regole di partita

prepareMatchday richiede 11 titolari unici, capitano in campo, portiere, calciatori idonei, panchina entro rules.maxBench. Il valore di default della demo (5) **non rivendica accuratezza storica**. Ordini, cambi e urla sono comandi in uscita; regole 1985 e numero di sostituzioni devono essere impostati dal ruleset storico verificato dall'orchestratore.

reviewMatch accetta soltanto snapshot del match engine con phase=fulltime, t>=5400, score valido e ID partita non già contabilizzato; così il board registra un risultato già generato dal motore. Gli esoneri sono notificati nello stato board.status=sacked e nell'esito dismissed, ma soltanto la carriera governa le offerte e il cambio squadra.

## Funzionalità e limiti

**Implementate:** cassa e arretrati, sponsor/trasferte/stipendi, personale societario elementare, mister e comandi, mercato mediato con rifiuti e contro-verifiche, presidenti a otto archetipi, fiducia e possibile esonero, riunioni e risposte, promesse, eventi con whitelist/cooldown, demo locale e 14 test.

**Da integrare nel gioco globale:** match engine, carriera, contenuti originali dell'agente 4, allenamento dell'agente 8 e interfaccia pixel-art dell'agente 3. Da ampliare in futuro: durate/rinnovi dei contratti, cessioni con aste multi-club, staff completo, dati economici d'epoca verificati.
