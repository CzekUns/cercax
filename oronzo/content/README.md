# ORONZO · Copy & Comedy Pack (1985–86)

Pacchetto **originale** per il Campanile, squadra di provincia immaginaria. È separato dal motore e non altera risultati o calciomercato. Il giocatore è l'allenatore; presidente, direttore sportivo e stampa agiscono secondo le rispettive responsabilità.

## Materiali consegnati

| File | Contenuto |
| --- | --- |
| characters.json | 23 persone ricorrenti, comprese le 8 figure presidenziali |
| presidents.json | 8 presidenti originali compatibili PresidentProfileV1 con trigger narrativi | 
| events.json | 73 eventi; 20 associati a uno specifico presidente |
| microcopy.json | 144 messaggi in 14 categorie, con canale e vincoli UI |
| dialogues.json | 42 scene, 84 varianti; 22 scene collegate a presidenti |
| narrative-engine.js | ESM standalone: trigger, pesi, cooldown, varianti, applicazione delta |
| demo.html | Mini-demo interattiva orizzontale, senza modifiche a game.js |
| validate.mjs | Controlli ripetibili in Node.js |
| qa.md | QA, conteggi, rischi residui |

Per testare dalla radice della repository:

    node oronzo/content/validate.mjs
    python3 -m http.server 8000

Aprire http://localhost:8000/oronzo/content/demo.html. La demo carica i JSON via percorsi relativi; con file:// il browser può bloccare il caricamento. In formato 16:9 si possono cambiare morale, fatica, salute, fiducia e giornata e vedere immediatamente gli effetti delle scelte.

## Contratti JSON

### Personaggi
Ogni elemento ha ID stabile, name, role, voice, strength, flaw, goal, relations e lines. Le sette nuove figure dei presidenti sono state aggiunte senza eliminare i sedici personaggi preesistenti. Le relazioni puntano ad altri ID esistenti. Il campo rosterBinding indica un possibile ruolo canonico (captain, star_striker, reserve_goalkeeper), **non** un ID effettivo del motore. Il motore attuale genera nomi casuali: prima di mostrare Franco Moro, Dario Lenzi o Giorgio Piras come giocatori in rosa, l'orchestratore deve associare il ruolo a un giocatore reale o rendere il dialogo generico. Non rinominare salvataggi esistenti.

### Eventi
Ogni evento contiene id, speakerId, channel, title, body, variants, triggers, weight, cooldownWeeks, oncePerSeason, tags e due choices. Ogni choice contiene id, label, target, effects, futureEffects.

I target sono all, starters, reserves e strikers (ATT titolari). Effects: delta interi da -3 a +3 applicabili ai singoli giocatori su morale, confidence, fatigue, health e luck, con limite 0–100. Il motore di contenuti copia gli oggetti modificati, senza cambiare lo stato passato come argomento. Nessuna scelta scrive direttamente reti, gol, punti o lesioni.

FutureEffects resta **inerte**: clubCash, presidentTrust, boardPressure, administration, pressRelation, supportersTrust, agentRelation, facilityTrust, scoutingPriority e youthTrust sono solo hook per future funzionalità. Tutte le scelte possiedono anche effetti applicabili subito.

Trigger riconosciuti: weekMin, weekMax, trainingDone, teamMoraleBelow/Above, teamFatigueBelow/Above, teamConfidenceBelow/Above, teamHealthBelow, teamLuckBelow, teamCharacterAbove, standingsPositionAbove/Below, lastResult, lossStreakMin, clubCashBelow, boardTrustBelow, marketRequest, derbyWeek e cupWeek. Le medie team* vengono dai titolari (fallback: tutti i giocatori). Above e Below sono stretti. StandingsPosition si ricava dalla classifica già presente nel motore. LastResult è win, draw o loss **solo se fornito dall'integratore**: game.js al momento non lo conserva. Le condizioni non riconosciute non attivano eventi.

CooldownWeeks vale settimane di gioco, non secondi. Il sistema memorizza la settimana in cui un evento viene presentato; un evento chiuso senza scelta non torna subito. OncePerSeason è azzerato esclusivamente al cambio stagione. Gli eventi usano pesi relativi e disincentivano due tag uguali consecutivi.

### Microcopy e dialoghi
Microcopy: id, channel, category, text, weight, cooldownWeeks, tags, when. Limiti: notice 110, ticker 65, headline 55, subhead 140, commentary 110. Alcuni titoli della categoria result richiedono lastResult, per non annunciare risultati mai avvenuti.

Dialogues: id, scene, weight, cooldownWeeks, variants; nelle scene presidenziali anche presidentId e linkedEventId. Ogni variante ha id, when e da 2 a 5 lines con speakerId e text (max 180). Una condizione specifica prevale sul fallback vuoto.

## Galleria di presidenti: contratto con l'Agente 9

Il file presidents.json ha l'involucro `{schemaVersion:1,contract:"PresidentProfileV1",season:"1985-86",presidents:[...]}`. Ogni elemento espone i campi obbligatori `id,name,archetype,clubFlavor,traits,voice,goal,background` di [engine-contract.md](../engine-contract.md), oltre a `privateContradiction,coachRelationship,relations,lines,behaviorTriggers` (metadati narrativi extra accettati dalla funzione `validatePresident` dell'Agente 9).

I sette tratti `authoritarianism,frugality,vanity,patience,interference,ambition,riskTolerance` sono **interi 0..100** con distribuzioni originali e differenziate. L'Agente 9 deve caricare i profili, non dedurre le personalità dai dialoghi. Il suo `loadPresidents(fetchJson)` accetta un oggetto contenente `presidents`, senza dipendenza da questi file a compile-time.

Gli otto ID stabili corrispondono ai personaggi canonici: `gaetano_venturi`, `leandro_berti`, `vittorio_sella`, `arturo_milani`, `rinaldo_pavesi`, `silvano_righi`, `ernesto_valcavi`, `beatrice_orlandi`. Il profilo Venturi riusa il personaggio già consegnato; gli altri sette sono aggiunti a characters.json. Non inserire automaticamente tutti e otto i presidenti nella stessa società: **ogni club possiede un solo presidentId**.

Eventi e dialoghi hanno `presidentId` solo quando si applicano a quel presidente. `activePresidentId(state)` cerca l'ID in `state.club.presidentId`, `state.currentClub.presidentId` o `state.presidentId`. Se manca, le scene con presidentId **non scattano**, impedendo che il presidente sbagliato parli nel club sbagliato. Anche sei dialoghi e quattro eventi originali di Venturi sono stati protetti con questo filtro; i loro ID e testi sono rimasti immutati.

Ogni profilo fornisce almeno due `behaviorTriggers`, ognuno con `eventId` valido e un `when` rispecchiato dalle condizioni dell'evento. Sono **riferimenti narrativi**, non istruzioni eseguibili per il `presidentBehavior` dell'Agente 9: solo il suo codice prende decisioni finanziarie, gestisce la fiducia e stabilisce conseguenze della società.

### Stato di contesto necessario

Le nuove condizioni vengono lette da `state.narrativeContext`: `lossStreak` (intero), `marketRequest`, `derbyWeek` e `cupWeek` (booleani). Le ultime tre devono essere passate dal calendario, dalle richieste del mister e dalla competizione **reali**; non vanno inventate per mostrare una gag. `boardTrust` usa `state.club.boardTrust` oppure `state.narrativeContext.boardTrust`. `clubCash` usa `state.club.finance.cash` (in lire nominali) oppure `state.narrativeContext.clubCash`. Per scenari economici senza stato valido il trigger non scatta. `lossStreakMin` non viene indovinato dai risultati mancanti: l'integratore calcola la serie reale e la trasmette.

La demo aggiunge un selettore per gli otto presidenti e controlli per sconfitte consecutive, mercato, derby, coppa e cassa. I dati sono **simulati**, non una partita realmente giocata.

### Distinzione finanziaria importante

La vecchia etichetta `futureEffects.clubCash` nei 57 eventi originali indica un **delta narrativo astratto**, non lire: **NON** convertirla in `expense` o `sponsorIncome` senza importi e giustificativi validi. Gli effetti `presidentTrust`, `boardPressure`, `scoutingPriority` ecc. rimangono altrettanto `deferred`; un adattatore dell'orchestratore e dell'Agente 9 deve applicare solo chiavi approvate con validazione. Il codice copy non aggiorna `ClubV1` né forza una trattativa di mercato.

## API per orchestratore

Importare da ./content/narrative-engine.js: makeMemory, deriveMetrics, selectEvent, applyChoice, selectMicrocopy, selectDialogue, resetSeason. Caricare i cinque file JSON dal percorso ./content/.

Flusso suggerito:
1. In fase gestionale, scegliere un evento con selectEvent(events, S, memory); restituisce event, text e metrics oppure null.
2. Mostrare titolo, body/variante e due pulsanti; non premere automaticamente una scelta.
3. Dopo il click applicare applyChoice(S, chosenChoice) e usare lo state restituito. Applied descrive i delta immediati; deferred elenca gli hook non implementati.
4. Salva memory insieme alla carriera e riutilizzala al prossimo avvio. Chiamare resetSeason(memory) solo a inizio nuova stagione.
5. Per ambientazione leggera usare selectMicrocopy(catalog, category, S, memory). Per dialoghi usare selectDialogue(catalog, scene, S, memory).

Non introdurre eventi a scelta nella simulazione in corso: applicarli prima o dopo il match, per evitare effetti al volo sulla forza della squadra. Se cooldown e condizioni esauriscono le alternative, il selettore restituisce null anziché ripetere la stessa gag. Non usare il copy per forzare il risultato calcistico.

## Originalità e periodo storico

La commedia nasce da contraddizioni gestionali e caratteri ricorrenti. Le fonti su Theme Hospital sono state usate soltanto come riferimento al metodo della comicità ambientale: [pagina EA](https://www.ea.com/games/theme/theme-hospital) e [ricostruzione della produzione](https://www.gamesradar.com/the-making-of-theme-hospital-the-legendary-sim-that-paved-the-way-for-two-point-hospital/). Nessuna battuta, scena o personaggio è riprodotto. Theme Hospital (1997) non viene collocato nell'Italia del 1985.

Telefonate dal fisso, radioline, giornali, gettoni, fogli cartacei, municipio, bar, magazzino e pullman rendono il contesto plausibile; non sono usati cellulari, social network o VAR.

### Due anomalie già presenti nel motore, da passare all'orchestratore

- **Punteggio:** game.js assegna 3 punti per vittoria, mentre nella stagione 1985–86 ne spettavano 2. Il cambiamento italiano arrivò nel 1994. [Treccani](https://www.treccani.it/enciclopedia/calcio-la-storia-del-calcio_%28Enciclopedia-dello-Sport%29/).
- **Sostituzioni:** game.js consente 5 cambi. Il limite nel calcio italiano dell'epoca era generalmente 2; verificare il regolamento della competizione dilettantistica scelta. [Treccani](https://www.treccani.it/enciclopedia/calcio-la-storia-del-calcio_%28Enciclopedia-dello-Sport%29/), [Guerin Sportivo](https://www.guerinsportivo.it/amp/news/calcio/2022/07/10-5551524/la_serie_a_dei_15_sostituti).

**Queste anomalie non sono state modificate:** il perimetro è esclusivamente oronzo/content/.

## Limiti attuali

Il motore principale non importa ancora questo pacchetto: l'integrazione compete all'orchestratore. Nel vecchio game.js i sistemi finanziario, relazionale e di mercato non sono ancora integrati; gli effetti futuri restano soltanto documentati. L'Agente 9 sviluppa questi sistemi separatamente nella PR #17. La demo usa dati simulati e non garantisce parità visiva con gli asset che stanno preparando gli altri agenti.
