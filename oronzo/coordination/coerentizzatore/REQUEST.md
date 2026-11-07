> **AGGIORNAMENTO COORDINAMENTO (7 NOVEMBRE 2026):** l'R04 in questo file è storico e COMPLETATO. Rapporto [PR #36](https://github.com/CzekUns/cercax/pull/36), unico merge produttivo #34. Correzioni assegnate nei NEXT 07/09/06/08, browser gate 01/03/05. Nessuna autorizzazione permanente di merge per 00; attendere PR aggiornate e nuovo mandato. Prima release **100 comuni + 500 cognomi**, raccolta tramite automazione oraria (fuori dall'R04).

# COERENTIZZATORE / CHAT WORK 00 — AUDIT R04 E MERGE CONDIZIONATI
**Stato:** `COMPLETED_R04` · audit eseguito in [PR #36](https://github.com/CzekUns/cercax/pull/36) il 7 novembre 2026; **NON RIATTIVARE R04 automaticamente**. Delega straordinaria ai merge scaduta. Nuovo audit soltanto su REQUEST successivo con HEAD nuove PR.
**Autorità di merge:** **delegata eccezionalmente dall'utente alla chat Work 00**, **SOLO** per PR specifiche che abbiano superato QA e gate. Non è un permesso di merge in blocco. Per questo audit R04 tale autorizzazione puntuale prevale sul divieto generale di merge del vecchio RUN/PROTOCOL; chiudi il permesso alla conclusione della sessione.
**Repository:** `CzekUns/cercax`. Main è fonte del prodotto. **Visone:** `oronzo/coordination/GAME-VISION-v02.md` (1979), `10-orchestrator/CONTRACT-v02.md`, `PROTOCOL.md`, `registry.json`, issue #25 e #26.
**Scope Work 00:** revisionare/testare e, se superano tutti i gate, fare merge tecnico mirato. **NON** implementare codice del gioco, NON cambiare file NEXT di agenti, NON modificare file fuori `oronzo/coordination/coerentizzatore/` (salvo operazione GitHub di merge di PR già validate), NON creare nuove feature. I bug richiedono `FIX_REQUESTED` e ritorno all'orchestratore 10.

## Baseline: 10 PR aperte al controllo dell'Agente 10
| Priorità | PR | Agente | HEAD osservato | Gate |
| --- | --- | --- | --- | --- |
| P0 | #30 | 07 Career | `19d9600aeb3dc45d38db2760fd865de1b2da6a20` | cinque fix R02 e test incrociati |
| P0 | #32 | 09 Coach-club | `d604243eb300ca65b2f5c56beba8fde3f799a174` | cinque fix R02 e test incrociati |
| P1 | #33 | 03 UI kit | `a472423738a586dc7a6484706a2ac34f24502ec7` | Chromium + art/hotspot QA |
| P1 | #28 | 05 Camera | `c326e33e8cb51825f2f18557f0903b011d70332b` | 2 camere, stessa simulazione |
| P1 | #35 | 06 Engine | `11e9901285f16ce3119c945fd22890a9c3e70fff` | regressione 100 seed, shout |
| P1 | #31 | 08 Attributi | `979cde10412d0b67aab616653616205e444de8fa` | modello, geografia, bridge effetti |
| P1 | #34 | 04 Dialoghi | `b74c376f1045e8b95c3cb4c5c21258a7df33087d` | test selector, testi/lunghezze, semantica |
| P1 | #29 | 01 Sprite | `01c5deca71d6f7e304217c48525732cf914c4fbc` | arte, atlas, leggibilità |
| HOLD | #12 | 02 Cutscene | `7ec2e1f8625b828c819f41301577567a1e39d828` | DRAFT, art/browser QA non superati |
| NO MERGE | #27 | Coerentizzatore | `90f4f73f1a8cc9c1b31c6d5d85631a4d2142906b` | audit R03 preliminare superato dai fatti, non codice; non mergiare |

*La tabella è uno snapshot, non sostituisce la verifica live degli HEAD al momento del merge.*

## Procedura obbligatoria in ordine
1. **RILEGGI LO STATO LIVE**: PR/diff/REPORT/HEAD/mergeable/CI del repository, perimetri e i NEXT su main. Se un HEAD cambia durante la review, riesamina i file interessati. Non fidarti dei vecchi report su main che descrivono il ciclo 01.
2. **GATE P0 #30 + #32 INSIEME**: esegui **DAVVERO** i test nativi Node sui due HEAD in una checkout / sandbox integrata, col catalogo reale `oronzo/content/presidents.json`. Non fidarti soltanto dei test separati dichiarati (07 dichiara 19/19 Node, 09 dichiara 32/32 V8 e 4/4 Node parziali). Verifica tutte e cinque le incompatibilità:
   - `presidentId` canonico e stabile per club su due stagioni e salvataggi, profilazione giusta per board/testi e nessun presidente arbitrariamente riassegnato;
   - `seasonObjective` preservato nella forma Career e interpretato correttamente da Board, incluse alias e unknown;
   - contratti e `weeklyWage` > 0 per club generati, `wageBudget` e `settleWeek`, arretrati non negativi, rifiuto importi negativi e safe integer, nessun reset denaro durante roundtrip;
   - `absoluteWeek` usata realmente nelle chiamate finanziarie/board; settimana 1 della stagione 2 contabilizzata, retry della stessa settimana respinto; migrazione da salvataggi V1, inclusi ledger legacy `week`;
   - `createCoach`/factory + esonero/rinnovo e salvataggi: `employmentHistory`, `hiredSeason`, `contract.until` preservati senza TypeError.
   - Testa due stagioni complete, serializzazione e reload, 104 club, pagamenti e caso presidente mismatch. **ATTENZIONE:** `07/tests/r02-cross.test.mjs` fa uso di `settleWeek({week:period})` in qualche caso: per dimostrare l'API nuova di 09 serve almeno un test con `{week:seasonWeek, absoluteWeek, seasonYear}`, non bastano due numeri assoluti passati nel campo `week`.
   - Se e solo se **tutto passa**, mergia **#30 poi #32**, aggiornando baselines e rilanciando test dopo il primo merge e dopo il secondo. Non autorizzare ancora il 07 a fare `oronzo/app/flow/`: tale NEXT è gestito da 10.
3. **GATE ALTRE PR**: testa nativamente sul codice realmente combinato e valùta scope/file changed. Le PR #28 camera, #35 engine, #31 player, #34 stampa, #33 UI e #29 sprite hanno scope distinti ma potrebbero avere incompatibilità di API, rendering e semantica. Verifica riproducibilità, non limitarti a patch+report. Per #33, screenshot e test Chromium sulla demo reale; i 22 marker e le schermate sono *solo demo* e non dimostrano un gioco integrato. Per #29 usa atlas e preview e applica gate artistico; non dichiarare approvazione visuale definitiva da test su PNG.
4. **POTENZIALE P1 PRECISO FRA #31 E #35**: l'Agente 08 normalizza `origin:{comune,regione,macroregione}` con valori italiani e usa toni `gentle/hard` (`gentile/duro`); l'Agente 06 legge `regionId,macroRegion` (e minuscoli `north/centre/south` in contratto) e accetta `encourage/harsh`. Senza **adapter esplicito e test** l'affinità regionale può diventare `unknown`. In più `08.applyShout()` modifica morale/coachTrust calciatore e assegna bonus temporaneo 180s, mentre `06` aggiunge `personalShout` 150s e `persistentSuggestion` con `collectCoachEffects()`. **Non applicare entrambi i bonus/delta al medesimo evento**. Definisci un solo flusso di eventi e doppia applicazione respinta dopo reload. Se la difformità è bloccante per merge combinato, lascia #31/#35 in FIX_REQUESTED e specifica owner e adattatore richiesto, senza scriverlo tu.
5. **DATI/PERSISTENZA E STILE**: #31 contiene solo un esempio di **20 cognomi comuni**, non i 5.000 rari e verificati: pipeline può essere mergeabile, ma dichiarare dataset finale **NON CONSEGNATO**. #34 ha 37 domande iniziali/32 postmatch e 80 battute italiane, ma il committente sta ancora discutendo lo **stile narrativo**: fare QA tecnica/editoriale di esempi e non considerare il tono artistico definitivamente approvato. Niente dialetti inventati e niente dettagli post-1979 anacronistici. #12 è ancora DRAFT: **NON MERGIARE** senza gate artistico richiesto e browser QA.
6. **UN MERGE ALLA VOLTA**: ogni PR mergeata richiede righe di test/CI e confronto HEAD attuale, nessun file fuori scope, nessun conflitto, niente breaking silenziosi, prova del gate. Dopo ogni merge rilegge main e revisiona la prossima PR. Se fallisce: lascia aperta e assegna `FIX_REQUESTED` nel rapporto con bug riproducibile. Nessun merge in blocco per urgenza.
7. **NON autorizzare autonomamente i nuovi cicli 07/03** e non scrivere i loro NEXT: SOLO Agente 10 deve trasformare gli esiti di merge nei nuovi incarichi. Agente 07 adapter game-flow in `oronzo/app/flow/` solo dopo #30+#32; agente 03 runtime HTML solo dopo #33 e gate 07/09. Le PR R02 non comprendono il runtime finale e non rendono la carriera già giocabile.

## Esito richiesto alla chat Work 00
- Scrivi `oronzo/coordination/coerentizzatore/REPORT-R04.md` con HEAD/SHA verificati, comandi e risultati effettivi, difetti P0/P1 con file/riga, elenco **MERGED / FIX_REQUESTED / HOLD** delle dieci PR, SHA merge e ciò che rimane incompleto.
- Se non puoi testare/mergiare per limitazioni strumenti, dichiara precisamente quali; **non simulare** il merge. Non scavalcare i gate. Consegna link del report ed eventuale PR documentale separata, senza auto-mergiare il rapporto.
- Alla fine la delega eccezionale ai merge Work 00 **si estingue**; il resto torna al protocollo ordinario e all'Agente 10.
