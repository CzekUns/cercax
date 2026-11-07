# ORONZO · Coach, Club & Board Engine (Agente 9)

Sistema ESM autonomo per una carriera calcistica ambientata nel 1985–86. L'utente è l'allenatore: seleziona formazione, tattica, preparazione e richieste di mercato, ma soltanto la dirigenza può approvare e perfezionare i contratti. Il motore non è ancora collegato al prototipo monolitico. Nessun pacchetto npm o backend richiesto.

## Esecuzione

Nella directory di questo modulo, lanciare: **node --test** (41 test), oppure **npm test**. Per la demo HTML servire la root del repository con **python3 -m http.server 8000**, poi aprire http://localhost:8000/oronzo/systems/coach-club/coach-club-demo.html in landscape 16:9. La demo è diagnostica, non grafica finale.

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
- player.contract.weeklyWage è lo stipendio settimanale in lire, estensione di PlayerV1; valore mancante: errore esplicito. Uno stipendio pari a zero deve essere dichiarato nel contratto. Sponsor, trasferte e bonus sono parametri del gioco, non listini storici verificati.
- La validazione finanziaria rifiuta importi negativi, null, non interi, NaN/Infinity e somme oltre Number.MAX_SAFE_INTEGER. Controlla i valori **prima** della serializzazione JSON, impedendo che NaN/Infinity vengano convertiti a null. Test in finance-validation.test.js.
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

**Implementate:** cassa e arretrati, sponsor/trasferte/stipendi, personale societario elementare, mister e comandi, mercato mediato con rifiuti e contro-verifiche, presidenti a otto archetipi, fiducia e possibile esonero, riunioni e risposte, promesse, eventi con whitelist/cooldown, demo locale e 41 test (14 base, 9 finanziari, 9 R02 e 9 regressioni R04).

**Da integrare nel gioco globale:** match engine, carriera, contenuti originali dell'agente 4, allenamento dell'agente 8 e interfaccia pixel-art dell'agente 3. Da ampliare in futuro: durate/rinnovi dei contratti, cessioni con aste multi-club, staff completo, dati economici d'epoca verificati.


## R02 compatibility gate

Canonical president: resolveClubPresident(club,catalog) resolves only the persisted club.presidentId. Board meetings, match review and market decisions refuse profiles whose id differs. createClub(data,{presidentCatalog,...}) validates that the ID exists, but does not generate or reassign it.

Career objectives: normalizeSeasonObjective maps topHalf -> top_half, avoidRelegation -> avoid_last, survival -> safety and title -> promotion. The original career string remains in club.seasonObjective for career.seasonAssessment. Unknown values cause RangeError instead of silent safety fallback.

Wages: weeklyPayroll requires explicit player.contract.weeklyWage for every player. Zero is permitted only when explicitly saved, e.g. amateur. Missing values and unsafe totals are rejected; mandatory unpaid costs still become arrears.

Periods: pass {week,absoluteWeek,seasonYear} consistently. AbsoluteWeek must increase across seasons, even when local week resets. Settlements use keys like a:1 and a:39; meetings and promises persist these keys. Legacy bare week is supported for V1 only; mixing namespaces inside a save requires migration by Career 07.

Coach: createCoach preserves employmentHistory, hiredSeason, contract.until and all extra career fields, including null contract after dismissal.

compat-r02.test.js covers original president catalog and two seasons through real Career 07 modules, save/load and dismissal. The R04-adjusted cross-module test now uses real wages and canonical president IDs generated by Career 07 R02; it no longer injects a fixed 1,600 ITL payroll.

The 1979 CoachV2/morale/papponeria features belong to a later authorized cycle after R02 merge.


## R04 — Protezione anti-doppio pagamento dopo migrazione (gate P0)

`periodOf({week,absoluteWeek,seasonYear})` sceglie un dominio persistente per ogni partita: `a:N` quando è presente `absoluteWeek`, `s:YYYY:w:N` come alternativa, oppure `N` numerico soltanto per la compatibilità V1. **Non mescolare questi tre domini nello stesso ledger.** `periodDomain(key)` e `periodLedgerError(club,period)` verificano registri di pagamenti, transazioni, partite, verbali, promesse ed eventi prima di modificare lo stato.

Se il save contiene `settledWeeks:[1]` e il nuovo chiamante usa `absoluteWeek:1`, `settleWeek` restituisce `{accepted:false,reason:'period_migration_required',club}` senza addebitare di nuovo. Lo stesso gate protegge riunioni, risposte, partite ed eventi. `book()` e `resolvePromises()` lanciano `Error('period_migration_required')` se non possono contabilizzare in sicurezza: i consumer devono interrompere la transazione e mostrare la necessità di migrazione. Una spesa respinta per fondi insufficienti resta una risposta no-op anche senza periodo esplicito.

L'Agente 07, proprietario di save/calendario, deve migrare **atomically e una sola volta** tutti i periodi legacy tracciabili nello stesso dominio. Quando la stagione originaria non è attestabile, l'Agente 9 non inventa una chiave né azzera gli storici. Per nuovi salvataggi usare `{week,absoluteWeek,seasonYear}` in ogni API e conservare il risultato `result.club`.

`initializeFinances` preserva ora `finance.cash` del save esistente e riallinea `budget` al saldo effettivo: non ricostituisce denaro dal budget iniziale dopo reload. I nuovi test `period-r04.test.js` coprono replay V1/V2, migrazione esplicita di prova, Board/Eventi, cassa e arretrati, più 104 club per due stagioni con salvataggio/ricarica. Il test `compat-r02.test.js` prende `weeklyPayroll` dai contratti reali di Career 07.

Il modulo e la demo non equivalgono ancora a un runtime di carriera integrato. CoachV2, morale e papponeria R03 non sono implementati in questa PR.
