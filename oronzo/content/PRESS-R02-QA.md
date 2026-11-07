# ORONZO · Copy R02 — QA stampa e conferenze

**Identità:** ORONZO-AGENT-04  
**Data:** 7 novembre 2026  
**Branch:** `agent/oronzo-copy-r02`  
**Visione:** v0.2, inizio carriera **1979**, landscape 16:9

## Consegna verificata sul branch GitHub

| Contenuto | Totale | Minimo NEXT |
| --- | ---: | ---: |
| Domande apertura | **37**, di cui **30** senza condizioni | 30 |
| Risposte apertura | **111** (3 per domanda) | ≥90 |
| Domande postpartita | **32**, di cui **5** per ciascuna vittoria/pareggio/sconfitta | 20 |
| Risposte postpartita | **96** (3 per domanda) | ≥60 |
| Giornalisti | **12** (10 archetipi generativi, 2 nomi canonici) | 12 |
| TV locali fittizie | **8** | 8 |
| Battute individuali | **80** in italiano standard, 10 contesti, due intenti | richieste, senza numero minimo |
| Varianti dialettali pubblicate | **0** (coda di revisione non pronta) | solo verificate |

La banca comprende complessivamente **69 domande e 207 risposte**. Ogni scelta reca quattro delta `coachMorale`, `supportersTrust`, `mediaReputation`, `presidentTrust`, **interi compresi tra −3 e +3**. Tutti i valori sono dichiarativi e **non applicati al runtime**.

## Test effettuati realmente

1. Riletti via connettore GitHub dal branch i quattro nuovi JSON, il JS `press-kit.js` e il validatore `validate-press.mjs`; effettuato parsing JSON senza errori.
2. Eseguita in V8 la logica effettiva del validatore `validate-press.mjs` con `readFileSync` sostituito da lettura dei medesimi contenuti GitHub e `assert.ok` equivalente: **`ORONZO PRESS R02: OK`**, **4.772 assert passati**.
3. Lo stress test comprende **100** sessioni di presentazione e **300** sessioni postpartita seeded (100 per vittoria, pareggio, sconfitta), tutte con risultati identici a seed uguale. Apertura: sempre 5 ID e temi diversi. Post: sempre 2 ID diversi e almeno una domanda dell'esito reale.
4. Verificato che il generatore rispetti i due nomi canonici `raffaele_corsi` / `piero_masi`, costruisca 12 nomi non duplicati e assegni emittenti esistenti.
5. Verificato rifiuto delle condizioni sconosciute, finestra postmatch non autorizzata prima di `matchFinal===true`, e rifiuto `sessionKey` diversa da `matchId`.
6. Testata serializzazione JSON, scelta di una risposta, poi secondo invio sulla sessione serializzata: `already_answered`, nessun doppio delta. Conferenza e contesto non vengono mutati da `answerPressConference`.
7. Verificato per gli shouts determinismo di scelta e possibilità di escludere una battuta appena usata. Tutte le 80 frasi rientrano nei 110 caratteri del canale di gioco e sono in italiano.
8. Compilato sintatticamente il modulo JavaScript della demo `press-demo.html` nel runtime V8 (rimuovendo solo l'import ESM prima di costruire l'AsyncFunction): **PASS**.
9. Confrontati uno per uno con `main` gli SHA blob di `characters.json`, `presidents.json`, `events.json`, `dialogues.json`, `microcopy.json`, `narrative-engine.js`, `validate.mjs`: **sette su sette invariati**. Non vengono cancellati personaggi, presidenti o storie precedenti.

## Revisione editoriale

- Nessun nome di emittente reale inserito volutamente. I nomi fittizi **non sono garantiti disponibili come marchi**: verifica giuridica prima del rilascio commerciale.
- Giornalisti vari per carattere, domande tecniche e di provincia, non soltanto provocazioni continue. Risposte talvolta normali o serie.
- Non vengono usate battute, personaggi, sigle riconoscibili da opere protette. Nessuna parola inventata è descritta come autentico dialetto.
- Il filtro anacronismi deve cercare parole intere: il sottotesto `var` di `trovare` non costituisce la sigla VAR. Nei testi delle nuove banche non sono stati intenzionalmente inseriti VAR, smartphone, social network o eventi posteriori al 1979.

## Mancante / limitazioni dichiarate

- **Non eseguito** `node oronzo/content/validate-press.mjs` su una checkout locale: il repository pubblico non è scaricabile dal runtime container disponibile. Il test effettivo è stato V8 con sorgenti lette da GitHub e sostituzione delle sole API I/O Node.
- **Non eseguito** test visivo reale su smartphone né E2E browser. La demo HTML è un harness di contenuto in landscape, non la grafica definitiva.
- La presenza di una conferenza nel menu del gioco non è implementata qui. Manca il wiring 07→03; la logica coach morale/fiducia/tifosi/stampa sarà dell'Agente 09.
- Il postpartita non può essere aperto senza `matchFinal` e `matchId` reali; l'eventuale assenza di dati impedisce la sessione anziché raccontare fatti mai accaduti.
- Il costo di morale zero e il GAME OVER non vengono gestiti da copy, ma sono richiesti nella futura integrazione Agente 09.
- I dialetti sono **bloccati** per la revisione lessicale e dei parlanti competenti; `individual-shouts.json` contiene però tutti i testi italiani usabili da subito.

## Procedure di verifica per l'orchestratore

    node oronzo/content/validate-press.mjs
    node oronzo/content/validate.mjs
    python3 -m http.server 8000

Aprire `http://localhost:8000/oronzo/content/press-demo.html` in orizzontale. Per una prova completa, dopo l'integrazione la carriera dovrà memorizzare la sessione e gli ID delle transazioni e non rigenerare domanda/stampa dopo un load.

**Esito:** strutture JSON, API di selezione, determinismo, idempotenza e test editoriale di base **PASS** nel runtime JS; QA manuale e integrazione runtime **DA FARE**.
