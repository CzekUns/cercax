# AGENTE 7 — GAME MODE, CARRIERA E CAMPIONATI

Repository: `CzekUns/cercax`
Branch ESCLUSIVO: `agent/oronzo-career`
Issue: https://github.com/CzekUns/cercax/issues/9
Directory ESCLUSIVA scrivibile: `oronzo/systems/career/`

Prima di operare leggi davvero `oronzo/AGENTS.md`, `oronzo/README.md`, `oronzo/engine-contract.md`, `oronzo/game.js` (sola lettura), l'issue assegnata e i file degli altri agenti solo se utili alla compatibilità. Il progetto è un manageriale calcistico del 1985, smartphone **esclusivamente orizzontale 16:9**, grafica pixel art 1990–95 (NON cubetti provvisori come prodotto finale). Gli altri agenti producono sprite, scene e UI: non duplicare il loro lavoro né copiare asset di giochi/film. Implementa **codice eseguibile con test**, non soltanto descrizioni o storyboard. JavaScript ESM nativo senza backend né librerie obbligatorie. **Lavora unicamente nella directory assegnata**; non modificare `oronzo/game.js`, `oronzo/index.html`, `oronzo/ui.css` o i file root CercaX. L'orchestratore integrerà la tua PR. Se devi richiedere modifiche ad altri moduli, scrivile in `integration-notes.md`.


## MISSIONE OPERATIVA
Costruisci la modalità principale: un mister di provincia nel 1985 che parte da una società malmessa in Promozione e può avanzare negli anni fino alle categorie professionistiche. **No menu finti**: servono giornate, campionati, stagioni e decisioni persistenti.

### Consegne obbligatorie
1. `career.js` API `newCareer(config,seed)`, `getUpcomingFixture(state)`, `registerResult(state,matchResult)`, `advanceWeek(state)`, `finishSeason(state)`, `applyJobOffer(state,offerId)`, `serialize/deserialize` con migrazione/versione. Nessuna decisione sull'esito sportivo: arriva dall'agente 6.
2. `league.js` generatore calendario girone all'italiana casa/trasferta (nessuna gara doppia/collisione giornata), classifiche con tie-break parametrizzabili, tabelle marcatori/risultati, promozioni e retrocessioni con mapping leghe documentato.
3. `progression.js`: reputazione del mister, obiettivi stagionali, offerte di nuove panchine, rinnovi/rotti contratti in risposta ai risultati e ai feedback dell'agente 9. Consenti di perdere il lavoro senza finire la partita (nuova offerta o attesa).
4. `save.js`: archiviazione locale con schema/versione, import/export JSON (file in demo o metodo puro), prove di recupero, nessuna cancellazione involontaria. Separare dati persistenti da dati di una singola partita.
5. `career-demo.html`, `README.md`, `integration-notes.md`, test per stagione completa, standings, doppie partite, cambio mister, promozione/retrocessione e salvataggio/ricarica.

### Accuratezza
Per la stagione 1985–86, NON chiamare la categoria iniziale Eccellenza (introdotta dopo); partenza Promozione. Usa girone fittizio e squadre originali per il prototipo, con regole storiche documentate/parametrizzate e progressione dal sistema di allora: Promozione, Interregionale, C2, C1, B, A. Riserve se l'esatta struttura non è verificata, senza inventare punteggi e limiti. Obiettivi, bilanci e board trust vengono dall'agente 9, non vanno duplicati.

## CONSEGNA VINCOLANTE
Metti il codice effettivamente funzionante nella directory assegnata sul tuo branch, testalo, indica i comandi eseguiti, prepara una PR verso `main` e fornisci il link. Non limitarti a studi, testi o schemi; non dichiarare completate funzionalità solo abbozzate. Il runtime `oronzo/game.js` rimane all'orchestratore.
