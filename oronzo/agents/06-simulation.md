# AGENTE 6 — FOOTBALL SIMULATION & TACTICS ENGINEER

Repository: `CzekUns/cercax`
Branch ESCLUSIVO: `agent/oronzo-match-engine`
Issue: https://github.com/CzekUns/cercax/issues/8
Directory ESCLUSIVA scrivibile: `oronzo/systems/match-engine/`

Prima di operare leggi davvero `oronzo/AGENTS.md`, `oronzo/README.md`, `oronzo/engine-contract.md`, `oronzo/game.js` (sola lettura), l'issue assegnata e i file degli altri agenti solo se utili alla compatibilità. Il progetto è un manageriale calcistico del 1985, smartphone **esclusivamente orizzontale 16:9**, grafica pixel art 1990–95 (NON cubetti provvisori come prodotto finale). Gli altri agenti producono sprite, scene e UI: non duplicare il loro lavoro né copiare asset di giochi/film. Implementa **codice eseguibile con test**, non soltanto descrizioni o storyboard. JavaScript ESM nativo senza backend né librerie obbligatorie. **Lavora unicamente nella directory assegnata**; non modificare `oronzo/game.js`, `oronzo/index.html`, `oronzo/ui.css` o i file root CercaX. L'orchestratore integrerà la tua PR. Se devi richiedere modifiche ad altri moduli, scrivile in `integration-notes.md`.


## MISSIONE OPERATIVA
Realizza la parte fondamentale di un gestionale **calcisticamente credibile**, indipendente dalla grafica: partita che scorre da 0 a 5400 secondi simulati, ~90 secondi reali al ritmo standard di visualizzazione, aggiornata a tick deterministici. Deve **produrre** posizioni, palla, statistiche, eventi, gol e risultato. L'agente 5 renderizza i tuoi output, senza decidere le azioni.

### Consegne software obbligatorie
1. `match-engine.js`: API `createMatch(input)` → `step(dt,commands?)` / `snapshot()` / `getEventsSince(lastEventId)`, `isFinished()`; stesso seed + input + comandi = stessi risultati. No `Math.random()` non controllato. Local PRNG seed. Nessuna dipendenza da DOM.
2. `movement.js`: posizionamento delle linee tattiche, pressing, ripiegamento, occupazione spazi, transizioni e smarcamenti in coordinate normate [0,1], collisioni semplificate ma sensate, movimento verso palla e porta, direzione di attacco e cambio campo all'intervallo. **Tutti i 22 giocatori** devono avere posizioni aggiornate; niente animazione ripetitiva fine a se stessa.
3. `actions.js`: possesso, passaggio, intercetto, contrasto, dribbling, tiro, parata, rimessa/angolo, falli e cartellini, fuorigioco se modellato, assenze/infortuni con probabilità calibrate. Il punteggio cambia **solo** per un evento goal coerente con tiro e posizione.
4. `commands.js`: sostituzioni e cambi tattici eseguibili **durante** la partita, con validazione del ruleset 1985/86. Il motore espone motivi di rifiuto e le azioni influenzano l'andamento, non soltanto testi.
5. `demo.html` o `cli-demo.mjs`, `README.md`, `integration-notes.md`, test seed deterministici, score-event consistency, rigore time/pause, limite sostituzioni parametrico, verifica tactical sensitivity su campione di seed.

### Priorità tecnica
Una partita completa riproducibile, con 11 contro 11 e punteggio coerente, viene prima della complessità estrema. Non inventare regole storiche: parametrizza quelle non verificate (es. limiti cambi, punti vittoria). Stats reali dal contratto PlayerV1, niente 'bonus della sfortuna' deterministico. Input `MatchInputV1`, output `MatchSnapshotV1`. Non produrre solo palline che rimbalzano: gestisci effettivamente i principi base di calcio tattico.

## CONSEGNA VINCOLANTE
Metti il codice effettivamente funzionante nella directory assegnata sul tuo branch, testalo, indica i comandi eseguiti, prepara una PR verso `main` e fornisci il link. Non limitarti a studi, testi o schemi; non dichiarare completate funzionalità solo abbozzate. Il runtime `oronzo/game.js` rimane all'orchestratore.
