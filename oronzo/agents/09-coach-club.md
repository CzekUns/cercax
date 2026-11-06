# AGENTE 9 — ALLENATORE, SOCIETÀ, DIRETTORI SPORTIVI E PRESIDENTI

Repository: `CzekUns/cercax`
Branch ESCLUSIVO: `agent/oronzo-coach-club`
Issue: https://github.com/CzekUns/cercax/issues/11
Directory ESCLUSIVA scrivibile: `oronzo/systems/coach-club/`

Prima di operare leggi davvero `oronzo/AGENTS.md`, `oronzo/README.md`, `oronzo/engine-contract.md`, `oronzo/game.js` (sola lettura), l'issue assegnata e i file degli altri agenti solo se utili alla compatibilità. Il progetto è un manageriale calcistico del 1985, smartphone **esclusivamente orizzontale 16:9**, grafica pixel art 1990–95 (NON cubetti provvisori come prodotto finale). Gli altri agenti producono sprite, scene e UI: non duplicare il loro lavoro né copiare asset di giochi/film. Implementa **codice eseguibile con test**, non soltanto descrizioni o storyboard. JavaScript ESM nativo senza backend né librerie obbligatorie. **Lavora unicamente nella directory assegnata**; non modificare `oronzo/game.js`, `oronzo/index.html`, `oronzo/ui.css` o i file root CercaX. L'orchestratore integrerà la tua PR. Se devi richiedere modifiche ad altri moduli, scrivile in `integration-notes.md`.


## MISSIONE OPERATIVA
Costruisci la vita reale del mister fuori e dentro la panchina, e rendi la società un attore indipendente. Il giocatore NON è proprietario della squadra né direttore sportivo: propone gli acquisti, persuade, allena, gestisce rapporti e tattiche, ma il presidente e il direttore sportivo possono accettare o rifiutare secondo **personalità, risultati e vincoli economici**.

### Consegne obbligatorie
1. `coach-actions.js` e `coach-model.js`: selezione allenatore estetica, reputazione e fiducia costruite nel tempo, richieste tecniche, convocazioni, panchina, preparazione partita, urla/indicazioni che entrano nel comando `CoachCommandV1`. No bonus magici nella skin.
2. `club.js` e `finance.js`: bilancio, stipendi, costi trasferte, premi gara, spese, sponsor realistici parametrizzati, budget limitato e vincoli; mai denaro infinito. Dirigenza con obiettivi e richieste, mediazione dei trasferimenti, possibili rifiuti, negoziazioni/risposte coerenti.
3. `board.js`: fiducia per risultati/obiettivi, esoneri possibili, pressione, promesse e pazienza, interventi del presidente, affidabilità verso staff, eventi che influenzano morale/finanze entro limiti ragionevoli.
4. `presidents.js`: motore di comportamenti basato su **otto o più** archetipi `PresidentProfileV1`: presidente gerarchico e cerimonioso, affarista di famiglia, imprenditore improvvisato, avaro, megalomane, ex giocatore, uomo di relazioni, filantropo vanitoso ecc. Il COPRITER (agente 4) produce nomi, caratteri, testi in `oronzo/content/presidents.json`; tu NON devi riscrivere i suoi personaggi. Prevedi dati di esempio locali per test e carica quelli del copy alla consegna; se non esistono, fallback chiaramente indicato. Variare davvero probabilità di cambiare mister, finanziare il mercato, interferire con formazioni e comunicare con la stampa.
5. `coach-club-demo.html`, `README.md`, `integration-notes.md` e test: un presidente avaro non compra sempre, un presidente impulsivo reagisce diversamente a serie negative, l'allenatore può rifiutare/negoziare, budget non negativo se vincolo scelto, fiducia ed effetti persistono, nessun presidente cambia arbitrariamente un risultato.

### Distingui estetica e logica
Il catalogo comico dei presidenti è scritto dall'agente 4 (commedia italiana anni '80, archetipi «megadirettore» e «zio faccendiere» come suggestioni, **nessuna riproduzione** dei personaggi cinematografici). Qui realizzi gli ALGORITMI che rendono diversi questi presidenti nel mondo di gioco. L'interazione dirigente/mister è un sistema serio, i dialoghi dell'agente 4 danno personalità e umorismo. Rispetta storia 1985 e niente mercati da manager onnipotente.

## CONSEGNA VINCOLANTE
Metti il codice effettivamente funzionante nella directory assegnata sul tuo branch, testalo, indica i comandi eseguiti, prepara una PR verso `main` e fornisci il link. Non limitarti a studi, testi o schemi; non dichiarare completate funzionalità solo abbozzate. Il runtime `oronzo/game.js` rimane all'orchestratore.
