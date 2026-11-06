# ORONZO · Copy & Comedy Pack (1985–86)

Pacchetto **originale** per il Campanile, squadra di provincia immaginaria. È separato dal motore e non altera risultati o calciomercato. Il giocatore è l'allenatore; presidente, direttore sportivo e stampa agiscono secondo le rispettive responsabilità.

## Materiali consegnati

| File | Contenuto |
| --- | --- |
| characters.json | 16 persone ricorrenti, carattere, difetto, obiettivo, relazioni e voce |
| events.json | 57 eventi condizionali, due scelte, peso, cooldown ed effetti |
| microcopy.json | 144 messaggi in 14 categorie, con canale e vincoli UI |
| dialogues.json | 26 scene, 52 varianti, battute di 2–5 turni |
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
Ogni elemento ha ID stabile, name, role, voice, strength, flaw, goal, relations e lines. Le relazioni puntano ad altri ID esistenti. Il campo rosterBinding indica un possibile ruolo canonico (captain, star_striker, reserve_goalkeeper), **non** un ID effettivo del motore. Il motore attuale genera nomi casuali: prima di mostrare Franco Moro, Dario Lenzi o Giorgio Piras come giocatori in rosa, l'orchestratore deve associare il ruolo a un giocatore reale o rendere il dialogo generico. Non rinominare salvataggi esistenti.

### Eventi
Ogni evento contiene id, speakerId, channel, title, body, variants, triggers, weight, cooldownWeeks, oncePerSeason, tags e due choices. Ogni choice contiene id, label, target, effects, futureEffects.

I target sono all, starters, reserves e strikers (ATT titolari). Effects: delta interi da -3 a +3 applicabili ai singoli giocatori su morale, confidence, fatigue, health e luck, con limite 0–100. Il motore di contenuti copia gli oggetti modificati, senza cambiare lo stato passato come argomento. Nessuna scelta scrive direttamente reti, gol, punti o lesioni.

FutureEffects resta **inerte**: clubCash, presidentTrust, boardPressure, administration, pressRelation, supportersTrust, agentRelation, facilityTrust, scoutingPriority e youthTrust sono solo hook per future funzionalità. Tutte le scelte possiedono anche effetti applicabili subito.

Trigger riconosciuti: weekMin, weekMax, trainingDone, teamMoraleBelow/Above, teamFatigueBelow/Above, teamConfidenceBelow/Above, teamHealthBelow, teamLuckBelow, teamCharacterAbove, standingsPositionAbove/Below e lastResult. Le medie team* vengono dai titolari (fallback: tutti i giocatori). Above e Below sono stretti. StandingsPosition si ricava dalla classifica già presente nel motore. LastResult è win, draw o loss **solo se fornito dall'integratore**: game.js al momento non lo conserva. Le condizioni non riconosciute non attivano eventi.

CooldownWeeks vale settimane di gioco, non secondi. Il sistema memorizza la settimana in cui un evento viene presentato; un evento chiuso senza scelta non torna subito. OncePerSeason è azzerato esclusivamente al cambio stagione. Gli eventi usano pesi relativi e disincentivano due tag uguali consecutivi.

### Microcopy e dialoghi
Microcopy: id, channel, category, text, weight, cooldownWeeks, tags, when. Limiti: notice 110, ticker 65, headline 55, subhead 140, commentary 110. Alcuni titoli della categoria result richiedono lastResult, per non annunciare risultati mai avvenuti.

Dialogues: id, scene, weight, cooldownWeeks, variants. Ogni variante ha id, when e da 2 a 5 lines con speakerId e text (max 180). Una condizione specifica prevale sul fallback vuoto.

## API per orchestratore

Importare da ./content/narrative-engine.js: makeMemory, deriveMetrics, selectEvent, applyChoice, selectMicrocopy, selectDialogue, resetSeason. Caricare i quattro file JSON dal percorso ./content/.

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

Il motore principale non importa ancora questo pacchetto: l'integrazione compete all'orchestratore. I sistemi finanziario, relazionale e mercato vero non esistono ancora; gli effetti futuri restano soltanto documentati. La demo usa dati simulati e non garantisce parità visiva con gli asset che stanno preparando gli altri agenti.
