# RAPPORTO AGENTE 04 — Copy, personaggi e comicità — ciclo 01 (correzione PR #13)

**Identità:** `ORONZO-AGENT-04`  
**Stato:** DELIVERED — correzione FIX_REQUESTED consegnata su PR aperta, QA/merge a cura dell'orchestratore  
**Branch:** `agent/oronzo-copy`  
**PR:** https://github.com/CzekUns/cercax/pull/13  
**Issue:** https://github.com/CzekUns/cercax/issues/4  
**Commit verificato prima di questo rapporto:** `6f0815073d33adf57e395a82fc5b4b794c6ed6e4`  
**Data:** 7 novembre 2026

## Realizzato

La PR originale esisteva con 16 personaggi, 57 eventi, 144 microtesti e 26 dialoghi. L'orchestratore ha richiesto il fix [ORZ-P1-006](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/REVIEW-QUEUE.md): mancavano otto presidenti canonici. Ho eseguito **la correzione nello stesso branch e nella stessa PR**, senza riniziare il pacchetto.

- **`oronzo/content/presidents.json` (NUOVO):** otto presidenti originali (Venturi, Berti, Sella, Milani, Pavesi, Righi, Valcavi, Orlandi), tutti con i sette tratti interi 0..100 del contratto `PresidentProfileV1`, biografia, background, archetipo, obiettivo, difetto privato, rapporto col mister, voce, almeno tre battute e due `behaviorTriggers` che puntano a eventi validi.
- **`oronzo/content/characters.json`:** da 16 a **23** persone, preservando il precedente Gaetano Venturi e aggiungendo altri sette presidenti, con `relations` e `presidentProfileId`.
- **`oronzo/content/events.json`:** da 57 a **73** eventi, 16 nuovi (due per presidente), per un totale di **20** con `presidentId` (inclusi quattro eventi Venturi originari ora correttamente circoscritti). Triggers basati su sconfitte, budget, fiducia, mercato, derby, coppa o settimana; due scelte ciascuno.
- **`oronzo/content/dialogues.json`:** da 26 a **42** scene e da 52 a **84** varianti. Sedici scene nuove (due per presidente), **22** con `presidentId` dopo aver protetto anche sei scene originali Venturi. `linkedEventId` collega quelle nuove ai rispettivi eventi.
- **`oronzo/content/narrative-engine.js`:** esporta ora `activePresidentId(state)`, ricava il presidente del club, filtra gli eventi/dialoghi con `presidentId` e legge nuovi trigger via contesto esplicito. Non applica soldi, risultati o decisioni societarie.
- **`oronzo/content/demo.html`:** selettore degli otto presidenti, modalità eventi presidenziali e controlli di scenario (serie sconfitte, richieste di mercato, derby, coppa, cassa), sempre in layout orizzontale.
- **`oronzo/content/validate.mjs`:** verifica completezza PresidentProfileV1, unicità e riferimenti degli hook, 2+ eventi/dialoghi per presidente, isolamento, condizioni e limiti.
- **`oronzo/content/README.md`, `qa.md`:** documentazione e QA aggiornate.
- **`oronzo/content/microcopy.json`:** invariato, 144 testi validati.

## Verifiche realmente effettuate

- Accesso e lettura diretta dei dati dal branch GitHub, parsing con `JSON.parse` dei 5 archivi: **PASS**.
- Test delle API del selettore in V8 su dati reali: trigger, random singolo, cooldown, immutabilità dello stato originale, classifica non modificata, speaker validi, tutti i presidenti isolati: **PASS**.
- Logica integrale di `validate.mjs` eseguita in V8 con sostituzione delle sole funzioni Node di lettura file (gli stessi contenuti del branch): **`ORONZO COPY: OK`**, output **23 personaggi, 8 presidenti, 20 eventi presidenti, 22 dialoghi presidenti, 73 eventi, 144 microtesti, 42 dialoghi, 84 varianti**.
- Parsing sintattico JavaScript del modulo ESM e dello script della demo tramite AsyncFunction: **PASS**.
- Verificati `presidentId` coerente con profilo del club, ID e relazioni univoci, `traits` 0..100, limiti di testo e nessun riferimento inter-presidenziale errato: **PASS**.
- Verifica confronto con `main` dopo correzione: file cambiati limitati a `oronzo/content/` (prima dell'aggiunta del presente rapporto). Il branch discende da un precedente main ed è ora dietro a main di altri commit; l'orchestratore dovrà confermare mergeability corrente prima del merge.

**NON eseguiti:** comando `node oronzo/content/validate.mjs` su checkout reale, test E2E browser/touch su telefono, import diretto dal branch #17. Nessuno di questi è dichiarato passato; procedure ripetibili indicate in README.

## Integrazione — contratti, API, dipendenze

**Agente 9:** PR https://github.com/CzekUns/cercax/pull/17 espone `loadPresidents(fetchJson)`, `validatePresident`, `presidentBehavior(profile,state,seed)`. `presidents.json` fornisce il campo `presidents` accettato dal loader e tutti i tratti `PresidentProfileV1`. I campi editoriali extra non sono funzioni e non alterano il comportamento autonomamente. Il codice di Agente 9 rimane di sua esclusiva proprietà. La PR #17 ha un'altra correzione finanziaria richiesta (importi negativi); non ho interferito.

**Orchestratore/Carriera:** scegliere un `ClubV1.presidentId` reale per ogni club. Il `narrative-engine` lo legge da `state.club.presidentId`, `state.currentClub.presidentId` oppure `state.presidentId`; senza identificatore gli eventi specifici non scattano. Alimentare `state.narrativeContext` con `lossStreak`, `marketRequest`, `derbyWeek`, `cupWeek` veri; fiducia e cassa dal club oppure da contesto esplicito. Tutte le condizioni sono documentate in README.

**Effetti:** `applyChoice` modifica solo attributi dei giocatori esistenti, con delta piccoli; `futureEffects` rimangono `deferred`, non vengono applicati né interpretati come importi in lire. Per eventuale conversione a `ClubEventV1` serve adattatore con whitelist, autorizzazione e unità economiche definite. Nessuna scelta compra giocatori al posto del direttore sportivo, nessuna scelta garantisce gol o altera una partita.

**Rosa:** i tre personaggi giocatori canonici del primo ciclo vanno legati a `PlayerV1` persistenti e alla formazione reale prima di mostrarli nel gioco.

## Mancante / problemi

- Mancano ancora integrazione nel `game.js` e QA visuale su smartphone: spettano all'orchestratore.
- Lo stato dell'alpha non include `ClubV1`/narrativeContext; gli eventi dei presidenti sono progettati per il modulo società e per l'orchestrazione successiva.
- La cassa della PR #17 usa lire nominali; il vecchio `futureEffects.clubCash` è un delta astratto, incompatibile direttamente senza mapping. Nessun effetto finanziario automatico è stato aggiunto.
- Regole 1985 del vecchio `game.js` (tre punti per vittoria, cinque cambi) restano da confermare/correggere nel layer di competizione, fuori perimetro dell'agente 4.
- Non sono state copiate battute/personaggi protetti; corrette le occorrenze storicamente incoerenti di «Tre punti» nel primo ciclo.

## Proposta prossimo ciclo (solo dopo approvazione/merge orchestratore)

1. Insieme ad Agente 9, validare un adapter `PresidentProfileV1`/`ClubEventV1` con fixture realistiche di cassa in lire e fiducia, senza toccare direttamente il suo motore.
2. Rendere i nomi dei personaggi-calciatori coerenti con gli ID persistenti della carriera, evitando dialoghi riferiti a calciatori inesistenti.
3. Eseguire prova in browser landscape con l'UI definitiva e ottimizzare i microtesti realmente troppo lunghi.

**Nessun merge eseguito.** Lo stato resta sotto revisione dell'orchestratore.
