# RAPPORTO ORONZO-AGENT-08 — Chiusura PlayerV2 / Cognomi M1 (R10)

**Stato:** PR_OPEN · DELIVERED per il perimetro 08; **NO MERGE**.  
**Branch:** `agent/oronzo-attributes-r02` · **PR:** https://github.com/CzekUns/cercax/pull/31  
**Issue storica:** https://github.com/CzekUns/cercax/issues/10 · **Data:** 8 novembre 2026  
**Istruzioni:** `NEXT.md` su ultimo main + `ROADMAP-R10-ACCELERAZIONE.md`.  
**Dipendenze non mergiate alla verifica:** Agente 06 PR #35 (HEAD verificato `8b6cf071cf40ff9fb42ab00f1739d9af0c72c5f3`); raccolta PR #40 (HEAD congelato `0b9eedd4070c10beb164e929d4740354663bf86d`). 

## A. Compatibilità completata con comandi individuali Agente 06

- **PlayerV2 canonico:** `origin:{comune,regione,macroregione}|null`; `relationships.coachTrust` 0–100 (zero conservato); `mental.pazzia,spericolatezza,coraggio,suscettibilita,impulsivita`; `surnameId`, `surname`, `surnameSourceId`. `relationshipWithCoach` è alias di compatibilità, scritto in modo consistente ma non autorevole. Vecchi save senza origine restano `null`.
- **`oronzo/systems/attributes/player-engine-bridge.js`**: `toMatchEngineOrigin(origin,{allowRegionalOnly})`, `toMatchEnginePlayer(player)`, `normalizeShoutTone(tone)`, `toIndividualShoutCommand({teamId,player,coachOrigin,coachLeadership,tone,utteranceId,t})`, `playerTrustForCoach`. Adatta origine italiana a `regionId/macroRegion` e toni `gentle→encourage`, `hard→harsh` preservando i nomi originali; region-only CoachV2 consentito senza inventare il comune, PlayerV2 non localizzabile rimane ignoto. `toMatchEnginePlayer` non muta il giocatore originale.
- **Contratto condiviso #35:** il motore di 06 legge ora direttamente `origin.regione/macroregione` e `relationships.coachTrust` tramite `normalizePlayerMatchContext`, e offre `createIndividualShoutCommand`. L'adapter 08 è una proiezione compatibile, non una seconda fonte dati. Usare **un solo** costruttore comando per evento; 06 decide prestazione/ordine ed emette `coach_shout`. La PR #35 calcola un bonus temporaneo esclusivo di **150 secondi simulati** e applica cooldown. 
- **Evitato doppio effetto:** `personality.effectiveAbility` non considera più il precedente `temporaryEffects.kind='coach-shout'` da 180s. `toMatchEnginePlayer` filtra effetti legacy di quel tipo, e 06 azzera `personalShout` al nuovo match. `applyShout` nel modulo 08 è ora ammesso **solo** con `scope:'standalone-demo'`; agisce esclusivamente sulla demo locale e non aggiunge effetto temporaneo. Chi lo chiama per evento di partita riceve errore, impedendo riapplicazioni implicite.
- **Persistenza:** 09 è unico owner del `persistentSuggestion` tramite `collectCoachEffects(events,appliedIds,{matchId})` di 06 con chiave persistita atomicamente `matchId:event.id`; non sommare delta dai metodi 08. Il valore aggiornato della fiducia deve essere sincronizzato nello stato PlayerV2 che 07 salva. 08 non modifica il morale dell'allenatore né crea eventi sportivi.

## B. Snapshot cognomi M1 integrato e usato realmente

- **Esattamente 600 cognomi** presi dallo snapshot della **PR di ricerca #40**, 600 ID univoci e 600 nomi distinti dopo normalizzazione NFC/casefold con spazi preservati. Frequenze pubblicate nel campione **11–16** (Bergamo città, residenti con cittadinanza italiana **2021**). Nessun `nationalRank` valorizzato; **NON** ranking nazionale né etimologia o frequenza dell'Italia 1979.
- **Sorgente:** Comune di Bergamo, [dataset 4pqu-7zkd](https://www.dati.lombardia.it/d/4pqu-7zkd), open data Lombardia. Licenza specifica del dataset **CC0 1.0**, riportata in `oronzo/data/research/sources.json` del #40 e verificata sulla scheda pubblica del dataset. Lo snapshot locale M1 è pubblicato come **`oronzo/systems/attributes/data/bergamo-2021-m1.js`**, con metadati/attribution/versione/sha dell'origine. **SHA del blob JSON sorgente:** `de098d57f1ce47be4cd07ecfb64ba213a6835663`.
- **`surnames.js`:** `loadVerifiedSurnameSnapshot(records,metadata)` valida il catalogo versionato (sorgente CC0, anno, SHA, record, unicità di nome e ID, frequenza >10) e costruisce `BUILTIN_SURNAME_CATALOG` da 600 nomi. Mantiene ID canonici anche con apostrofi e spazi (es. `it-surname-d'avanzo`, `it-surname-de feudis`). `chooseSurname` restituisce anche `id`; il vecchio import CSV resta disponibile.
- **`generator.js`:** per default `generatePlayer`, `generateSquad`, `generatePlayers`, `generateLeague` utilizzano `BUILTIN_SURNAME_CATALOG` **offline**; non più solo i 20 comuni cognomi della fixture. I singoli player persistono `surnameId`, `surnameSourceId`, `surname`, `name`, `id`; salvataggio/caricamento non deve generare di nuovo il roster. Il record di prova dei 20 cognomi Wikipedia rimane una fixture documentata e distinta.
- **`demo.js`:** usa ora il catalogo interno di 600 senza fetch esterne. `data/SOURCES.md` documenta licenza, origine, scope e i limiti.
- Il branch #40 **non è stato modificato**; nessuna frequenza inventata, nessuna datazione 1979 dedotta, nessun tentativo di sostituire la raccolta oraria.

## Test eseguiti e risultati osservati

**Ambiente realmente usato:** runtime JavaScript V8 con contenuti JS scaricati direttamente dai branch GitHub, import/export ESM convertiti **solo in memoria** in binding locali e adattatore alle asserzioni Node. È esecuzione reale delle funzioni e dei test, **non** `node --test` nativo e **non** browser Chromium. Il container ha Node v22.16.0 ma la connessione Git remota fallisce con `Could not resolve host: github.com`. Non attribuire a questa verifica una CI non avviata.

1. **43/43 test 08 PASS**: 15 regressione R01 + 17 R02 + 11 nuovi M1. Inizialmente un controllo rifiutava ID corretti con spazi/apostrofi e due verifiche fallivano per alias fiducia non allineato: **difetti corretti**, suite ripetuta completamente fino a **43 PASS / 0 FAIL**. Regole su origine ignota, 0 di fiducia, 20 regioni, 600 ID/cognomi, importazione snapshot, collisioni, generazione seed, ruoli, due/15 squadre, JSON reload, trattamento dei 180s legacy e distinzione dei toni.
2. **6/6 prove incrociate PASS con codice effettivo PR #35**: caricati in V8 i veri moduli 06 `rng.js, orders.js, movement.js, commands.js, actions.js, match-engine.js, fixtures.js, coach-effects.js` e i moduli 08. Testata gara 11v11 con rose 08 (22 per squadra); risposta `encourage` 150s, stessa regione > stessa macroregione > altra, fiducia `0` e `100`, harsh/gentle, evento `coach_shout`, score non cambiato dall'ordine, scadenza 150s, ledger 09 con retry/reload deduplicato; nessuna propagazione del vecchio bonus 180s.
3. **Test Node incrociato riproducibile**: nuovo `oronzo/systems/attributes/tests/pr35-integration.test.mjs`, che esegue 3 scenari con i moduli reali del 06 **quando le due PR sono nello stesso checkout**; in assenza degli export #35 dichiara `SKIP`, anziché un falso successo.
4. Comandi di prova su checkout con entrambe le PR: `node --test oronzo/systems/attributes/tests/*.test.js` e `node --test oronzo/systems/attributes/tests/pr35-integration.test.mjs`. **Non verificati nativamente qui**. Non eseguito Chromium HTTP/schermate: QA finale al runner/UI 03/07 e revisore 00.

## File e API consegnate

- Nuovi: `data/bergamo-2021-m1.js` (600 righe JSON serializzate in JS ESM), `player-engine-bridge.js`, `tests/attributes-m1.test.js`, `tests/pr35-integration.test.mjs`.
- Modificati nella stessa PR: `player-model.js`, `generator.js`, `surnames.js`, `personality.js`, `player-traits.js`, `demo.js`, `tests/attributes-r02.test.js`, `README.md`, `data/SOURCES.md`, `integration-notes.md`. Gli altri file già consegnati in R02 restano parte della PR.
- Nessun file di `oronzo/data/research/`, `oronzo/systems/match-engine/`, `oronzo/app/flow/` o `NEXT.md` è stato toccato. Eccezione di scope: soltanto il presente `oronzo/coordination/08-attributes/REPORT.md`.

## Dipendenze / limiti residui

- **06/#35:** API adeguate sui rispettivi branch, ma entrambe le PR devono essere revisionate e integrate dall'orchestratore. Le 6 prove incrociate V8 non dimostrano che il runtime principale usa i nuovi adapter.
- **07:** salva/ricarica i PlayerV2 reali una volta sola, fornisce comuni verificati e origini corrette (gli attuali `DEMO_ORIGINS` sono esempi). Caricamento legacy non fabbrica il comune.
- **09:** aggiorna rapporti e morale mister atomicamente una sola volta tramite ledger del 06; deve sincronizzare la fiducia aggiornata sul PlayerV2 persistente e non richiamare `applyShout` di 08 nel flusso reale.
- **03/00:** verifiche UI, 44px, Android/Chromium e percorso end-to-end non svolte in questo incarico. I 600 cognomi sono realmente disponibili nel generatore ma il runtime M1 potrà usarli soltanto dopo integrazione 07/03.
- Il dataset 2021 non garantisce origine etimologica italiana né la distribuzione nazionale: per ora appartiene al catalogo di residenti con cittadinanza italiana di Bergamo. Obiettivo 5.000 rinviato.

## Prossimi passi raccomandati all'orchestratore

1. Verificare `node --test` nativo su checkout di PR #31 + #35 e controllare gli eventi/shout e persistente 09 con matchId univoco; solo dopo decidere merge.
2. Collegare un solo costruttore di ordine individuale nel flow 07 e verificare che `playerTrustById` e `relationships.coachTrust` siano sincronizzati dopo save/load.
3. Eseguire smoke browser Chromium HTTP per generazione e schede con 600 cognomi, senza ridisegnare o rigenerare un giocatore salvato.

**Consegna: PR #31 aperta, nessun merge autonomo, nessun nuovo branch e nessuna modifica a PR #40.**
