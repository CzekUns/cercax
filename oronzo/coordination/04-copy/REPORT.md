# RAPPORTO AGENTE 04 — Copy, conferenze e media — ciclo R02 v0.2

**Identità:** `ORONZO-AGENT-04`  
**Stato:** DELIVERED — in attesa di revisione orchestratore, NESSUN MERGE  
**Branch:** `agent/oronzo-copy-r02`  
**PR:** inserita nel corpo e nella descrizione dopo apertura  
**Origine:** ultimo `main` al momento della creazione, `c9f52a1c2f60733a6ae1e0b63180fa4b5d0f9697`  
**Precedente PR #13:** integrata, commit di merge `065dc4ee7e59e26612b14c471b9c2be99f43cad1`.  
**Data:** 7 novembre 2026

## Realizzato

- `oronzo/content/press-opening.json`: **37 domande**, 30 universali, 3 risposte ciascuna; selezione seeded di **5** domande non ripetute e con temi distinti.
- `oronzo/content/press-postmatch.json`: **32 domande** post-gara (9 universali, 5 su ciascun risultato, altre su fatti reali); 3 risposte ciascuna, 2 domande per gara, almeno una legata all'esito.
- `oronzo/content/press-media.json`: **12 archetipi di giornalisti** (di cui i due già canonici Raffaele Corsi e Piero Masi) e **8 emittenti televisive private immaginarie**; nomi dei cronisti deterministici da pool e seed.
- `oronzo/content/individual-shouts.json`: **80 battute** italiane originali di incoraggiamento/rimprovero a singoli giocatori, con situazione, tono e intensità; nessuna variante regionale non verificata pubblicata.
- `oronzo/content/press-kit.js`: funzioni `seedHash`, `seededRng`, `seededShuffle`, `buildPressRoster`, `matchesPressContext`, `selectConferenceQuestions`, `createPressConference`, `answerPressConference`, `pickIndividualShout`. Sessioni serializzabili, risposta ammessa una volta e ID di transazione per prevenire doppi effetti. Nessuna mutazione di match, cassa, morale o relazioni reali.
- `oronzo/content/press-demo.html`: demo landscape 16:9 che mostra tre risposte, speaker/emittenti e variazioni **simulate** dei quattro indicatori, con sessione locale recuperabile al reload.
- `oronzo/content/validate-press.mjs`: QA riproducibile su dati e 400 sessioni seeded.
- `oronzo/content/PRESS-R02.md`: contratto API, formati, necessità di dati reali e punti d'integrazione per 03/06/07/09.
- `oronzo/content/PRESS-R02-QA.md`: evidenze dei test e limiti.
- `oronzo/content/README.md`: avviso di prevalenza della visione v0.2 con inizio nel **1979**, riferimento al nuovo contratto.

**Nessuna modifica ai file narrativi canonici precedenti.** Confrontati blob SHA su main e branch per `characters.json`, `presidents.json`, `events.json`, `dialogues.json`, `microcopy.json`, `narrative-engine.js`, `validate.mjs`: 7/7 invariati.

## Verifiche

- Parse JSON dei 4 nuovi archivi e moduli riletti da GitHub: PASS.
- Logica reale del validatore eseguita in V8 con le sorgenti GitHub, sostituendo soltanto I/O Node e assert: **`ORONZO PRESS R02: OK`, 4.772 assert PASS**.
- **100** conferenze iniziali seeded: 5 domande non ripetute, argomenti differenti, reporter distinti, stesse domande col medesimo seed, risposte registrate senza doppio effetto dopo caricamento.
- **300** postpartita seeded: 100 win, 100 draw e 100 loss; 2 domande ciascuno, minimo una domanda pertinente all'esito; nessun quesito contraddittorio. Rifiutato postmatch senza `matchFinal:true` e senza `matchId` coerente.
- Nomi dei giornalisti unici, due ID canonici conservati, emittenti valide, cooldown esclusione shouts, limite caratteri/delta e blocco dialetti senza verifica: PASS.
- Controllo sintattico dello script della demo via V8: PASS.

**Non eseguiti:** `node oronzo/content/validate-press.mjs` su un clone locale (rete container non disponibile), QA visuale/touch su telefono ed E2E runtime. La demo è separata dal gioco e **non** può essere presentata come feature già integrata. La verifica via V8 è vera esecuzione del codice, non un test Node su filesystem.

## Integrazione e dipendenze

- **07 Carriera/game-flow:** genera `createPressConference` UNA volta dopo ingaggio e presidente persistenti (`phase:"opening"`, `careerSeed`, `sessionKey:"start"`), salva ID e sessione con risposte. Dopo ogni `fulltime`, conferenza `postmatch` con `context.matchFinal:true`, `result` dedotto dal risultato reale e `sessionKey===context.matchId`. Non rigenerare al reload. Salva `effectTransactionId` per non duplicare l'applicazione.
- **09 Società, coach, tifosi, stampa:** solo 09 applica i delta dichiarativi `coachMorale`, `supportersTrust`, `mediaReputation`, `presidentTrust` con clamp e ledger idempotente; il morale coach a zero implica GAME OVER secondo v0.2. Non assumere identità tra `presidentTrust` e `boardTrust`.
- **03 UI runtime:** visualizza le cinque domande e due postpartita, con reporter/emittente realmente assegnati e tre opzioni. Non estrae domande sul client a ogni render né applica effetti.
- **06 Motore partita:** restituisce fatti veri (gol, cartellini, infortuni, tiri, andamento) necessari al contesto post e ordini individuali. Efficacia dei richiami dipende dal motore e dagli attributi, non dai testi.

Il contratto puntuale è in [PRESS-R02.md](../../content/PRESS-R02.md). Per l'Agente 09 la relazione con gli otto presidenti precedenti rimane gestita dai medesimi ID: non è stato modificato `presidents.json`.

## Mancante / problemi

- Non integrati UI, carriera, morale e partita nel runtime: scope riservati agli altri agenti nei NEXT successivi.
- Emittenti e giornalisti sono fittizi ma i nomi non sono stati sottoposti a clearance di marchio per l'uso commerciale.
- Localizzazioni napoletana, romana e siciliana sono **in revisione**, non disponibili come battute pubblicate; nessuna parola dialettale è stata inventata.
- Importazione economica e conto morale effettivo restano dell'Agente 09.

## Proposta prossimo ciclo (solo se autorizzato)

1. QA UX reale in landscape 16:9 con i componenti definitivi di Agente 03, ritoccare lunghezze e ritmo.
2. Primi dialetti solo con fonte e revisione competente documentata.
3. QA integrato con 07/09 su ledger di risposte, reload, morale zero e conseguenze durature.

**Nessun merge autonomo.**
