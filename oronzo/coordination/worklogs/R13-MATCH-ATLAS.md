# Worklog persistente dell'AUTOMAZIONE — R13-MATCH-ATLAS

**Worker orario:** `AUTOMATION-R13` · **stato:** `WORKING — upload binario verificato, atlante artistico ancora assente` · **branch:** `automation/oronzo-r13-match-atlas`.

## 2026-11-13 · Primo checkpoint GitHub persistente: trasporto binario

- Branch GitHub creato dalla base `aeaabdf5705d6e3825396746482b9b12b882b6a7`.
- Diagnostico **NON ARTISTICO** salvato: `oronzo/assets/players/r13-match/_qa/transfer-smoke.png` (8×8 RGBA, 98 byte).
- SHA256 `6d4e5d6de58d74d598e41f7b55d26b4e85676b048fa424f0bf81ae5f20fa5243`; Git blob `9f384241c5931c0e12e2d362167e1b5570b039dd` restituito identico da GitHub dopo invio Base64.
- Procedura di upload e controllo degli SHA in `oronzo/assets/players/r13-match/_qa/README.md`.
- Archivi grafici delle esecuzioni precedenti noti per descrizione: `r13-match-prototype.zip` (idle), `r13-match-checkpoint-v2.zip` (layer/maschere), `r13-match-run11-local.zip` (12 frame corsa); **byte non disponibili in questa esecuzione**. Non spacciarli per recuperati.
- Arte: ultimo frame **approvato nessuno**. `run-right-04.png` dei precedenti run segnalato FAIL per artefatti colorati. **Nessun nuovo sprite prodotto o integrato**.
- Test: Git blob originale contro GitHub PASS, prova upload binario PASS. Node/Chromium sprite partita **NON eseguiti**. GitHub Pages: NON aggiornato da questo branch.

## Prossimo passo obbligatorio della stessa automazione
1. Rileggere la PR e il worklog **su questo branch**, poi cercare in ambiente della run gli archivi sopracitati; verificare fisicamente i PNG e non assumere che il loro vecchio path sandbox sia montato.
2. Caricare i **veri** frame/layer recuperati usando `mcp__GitHub__create_blob` con `encoding:"base64"`, confrontare l'hash Git blob; `create_tree → create_commit → update_ref` con HEAD corrente.
3. Per frame bocciati (artefatti rossi/gialli), mantenerli sotto `_drafts/` e marcati FAIL; non inserirli nell'atlante approvato. Correggere prima la qualità reale.
4. Aggiornare questo checkpoint con **ID esatti dei frame verificati, primo frame da fare e prove visive**, in una sola PR persistente. Non passare al campo o alla telecamera.

**Distinzione manuali:** la PR grafica manuale #79 rimane fuori scope; non toccare i suoi file e non governarla con TASKS.json.

## 2026-11-13 · Run 11 · recupero binari reali

- Archivi **fisicamente recuperati** e ispezionati in questa run: `r13-match-prototype.zip` (5 membri), `r13-match-checkpoint-v2.zip` (12 membri), `r13-match-run11-local.zip` (14 membri). L'archivio idle contiene PNG 63×118 e maschere L; quello corsa contiene 12 PNG RGBA 112×160. Non equiparare i prototipi a sprite definitivi.
- **3 file PNG autentici importati in GitHub**, tutti sotto `oronzo/assets/players/r13-match/_drafts/`: `idle-front-torso-kit-mask.png` (208 byte, blob `68786dbd629d68a7d98ccc958bb1970d26cb8876`), `idle-front-legs-kit-mask.png` (161 byte, `43eed74d45f06277e5df413be2dfbaf6846ba966`), `idle-front-head-kit-mask.png` (104 byte, `10ab15127d252805cdf6d9c90e2dd8f63a139753`). Confronto SHA Git locale/connector: **PASS 3/3**. PNG reali preesistenti, non generati da primitive in questa run.
- Nuovo commit `53c6495069a1109d7ad6250e3021bb3618392537` sul branch persistente; PR draft **#82**, non mergiata. Nessun file degli agenti manuali modificato.
- QA: decodifica Pillow e dimensioni maschere **PASS**; maschere non certificate per la ricolorazione finale. Il contatto idle mostra tre varianti cromatiche ma il portiere non ha disegno autonomo. Corsa `run-right-04.png` già segnalata **FAIL** per artefatti. Node/Chromium **non eseguiti**; MAIN **NO**; PAGES **NO**.
- Ultimo elemento realmente trasferito: `_drafts/idle-front-head-kit-mask.png`. Ultimo frame artistico approvato: **nessuno**. Prossimo ID: `_drafts/idle-front-home-assembled.png` con bytes veri e hash; successivamente layer illustrati testa/busto/gambe, poi valutazione artistica della corsa senza promuovere frame difettosi.
- HEAD del commit di questa run: `53c6495069a1109d7ad6250e3021bb3618392537`. Se altre run intervengono, rileggere l'HEAD live prima di ulteriori scritture.

## 2026-11-13 · Run 12 · primo PNG illustrato trasferito

- Checkpoint di partenza live: `7e0d9ab41edbf561a48626e75227f5d75268f64b`; task `WORKING` da `TASKS.json` su main, PR #82 Draft.
- Recuperati fisicamente in /mnt/data i tre ZIP precedenti; verificata con Pillow la composizione `idle-front-home-assembled.png` 63×118 RGBA. Ispezione visiva locale effettuata. Convertita a PNG indicizzato ottimizzato (48 colori, alpha) da 1.678 byte per il trasferimento; resta **DRAFT**, non asset approvato, e la perdita cromatica richiede review.
- Nuovo file GitHub: `oronzo/assets/players/r13-match/_drafts/idle-front-home-assembled.png`; Git blob SHA locale `795355ca096f3321e151fb3b019a36dbbad4b401` = SHA restituito da `create_blob(base64)`: **PASS**. Commit asset `a80c966c3dbf523929521afc8b2bea3f6e9d2ab4` pubblicato con update_ref expected_sha e force=false: **PASS**.
- Frame illustrati approvati: **0**. Ultimo draft importato: `idle-front-home-assembled.png`. Prossimo ID: `_drafts/idle-front-head.png`, poi `idle-front-torso.png`, `idle-front-legs.png`; ispezione estetica prima di promuovere; `run-right-04.png` resta FAIL per artefatti.
- QA: Pillow PNG/dimensioni/alpha PASS locale, SHA blob PASS; Node/Chromium **NON eseguiti**; kit e portiere non certificati. MAIN NO, PAGES NO. Nessuna modifica ai file della PR manuale #79. PR #82 resta Draft.

## 2026-11-13 · Run 13 · tre layer illustrati idle trasferiti

- Ripreso HEAD live `94ce52b5bfde4ae7a5911bd27e307a4ef13dc76f` e PR #82 Draft; task WORKING, scope invariato. Archivi ZIP precedenti presenti fisicamente in /mnt/data e verificati: checkpoint-v2 include layer 63×118 RGBA con bbox non vuoti.
- Importati come **DRAFT**, da artwork raster precedente e ridotti a PNG indicizzati 32 colori con alpha (ottimizzazione con perdita cromatica): `_drafts/idle-front-head.png` 482 B, blob `3112cf8b64b36251c3bb60c17b81a2d914e2284a`; `_drafts/idle-front-torso.png` 854 B, blob `12829709aebd61fe8af1bf6334bdd5ab9d2baf89`; `_drafts/idle-front-legs.png` 660 B, blob `1d2d3338e1e5fa38a7f05a5db41a0fdde91e77ee`. SHA Git blob locali uguali ai tre SHA restituiti dal connettore: PASS 3/3.
- Commit asset `2e4e2d7562b0038d55f1e2bcda018f01c7dd775c`, update_ref expected_sha e force=false PASS. I layer sono ritagli della medesima illustrazione, non anatomie animate autonome. **Frame approvati 0**; non promuovere a atlas senza review artistica. La quantizzazione altera il colore, richiede confronto visivo con originali.
- Test Pillow: lettura originali RGBA, bbox non vuoti, dimensioni 63×118 PASS; Git blob SHA PASS. Test Node/Chromium e integrazione partita NON eseguiti. MAIN NO, PAGES NO. PR #79 non modificata.
- Ultimo draft importato: `_drafts/idle-front-legs.png`. Primo mancante: variante illustrata `_drafts/idle-front-away-assembled.png`, poi `_drafts/idle-front-keeper-assembled.png`, quindi pulizia frame corsa `run-right-04.png` FAIL; verificare palette/pivot e qualità prima della promozione.
- HEAD asset verificato prima dell'aggiornamento di questo worklog: `2e4e2d7562b0038d55f1e2bcda018f01c7dd775c`; rileggere HEAD live nella prossima run.

## 2026-11-13 · Run 14 · variante away idle importata

- TASKS.json main: `R13-MATCH-ATLAS`, owner `AUTOMATION-R13`, status `WORKING`, PR #82 Draft; nessuna modifica ai manuali.
- Archivi originali recuperati fisicamente: `r13-match-prototype.zip`, `r13-match-checkpoint-v2.zip`, `r13-match-run11-local.zip`. Variante `idle-front-away-assembled.png` letta da checkpoint-v2, originale RGBA 63×118, ricodificata in PNG indicizzato 48 colori con trasparenza, 1587 byte. La quantizzazione è con perdita: **DRAFT, non certificata esteticamente**.
- GitHub: `_drafts/idle-front-away-assembled.png` caricato con `create_blob(base64)`, Git blob locale `1c489c2705a920080b46b6c30f3b83134352e6a6` uguale al restituito, PASS. Commit asset `029b5c6d58d5fbac62e9734536568ce559b5eaf3`, `update_ref` expected_sha precedente e force=false PASS.
- Test: Pillow PNG/dimensioni/trasparenza PASS; hash blob PASS; Node/Chromium NON eseguiti; qualità artistica/kit FAIL non certificati; `run-right-04.png` ancora FAIL. Asset approvati: 0. MAIN NO, PAGES NO.
- Ultimo draft importato `_drafts/idle-front-away-assembled.png`; **prossimo ID** `_drafts/idle-front-keeper-assembled.png`, quindi valutazione dei frame di corsa. Nessun merge.


## 2026-11-13 · Run 15 · portiere idle importato

- TASKS.json su main: owner AUTOMATION-R13, task R13-MATCH-ATLAS WORKING; PR #82 Draft, branch esistente; HEAD iniziale `bf1c9eaa53598175d20be9c68d72ab8c6d647af4`.
- ZIP `r13-match-checkpoint-v2.zip` realmente presente in `/mnt/data`; estratto `idle-front-keeper-assembled.png` originale RGBA 63×118 (6715 byte), ricodificato in PNG indicizzato a 48 colori con trasparenza (1645 byte). Quantizzazione con perdita: materiale **DRAFT**, non approvato artisticamente; il portiere non ha ancora disegno anatomico indipendente.
- Nuovo file: `oronzo/assets/players/r13-match/_drafts/idle-front-keeper-assembled.png`; Git blob locale `dcaf4d67f55e6f7490b0cb38a67b6c6f80be6d19` = SHA restituito da create_blob(base64), PASS. Commit asset `fb105e5b659fc249e0ac9af38250d3ebcfec3b17`; update_ref con expected_sha, force=false PASS.
- QA Pillow: PNG originale RGBA 63×118 PASS; PNG indicizzato con trasparenza PASS; SHA Git blob PASS. Node/Chromium NON eseguiti. Corsa `run-right-04.png` FAIL estetico pregresso. Frame approvati 0; MAIN NO; PAGES NO. PR #79 non toccata.
- Ultimo draft: `_drafts/idle-front-keeper-assembled.png`. **Primo mancante:** revisione e correzione artistica `run-right-04.png`, poi layer indipendenti di corsa e verifica dei 12 frame prima di promuoverli; nessun merge.


## 2026-11-13 · Run 16 · audit reale dei 12 frame corsa (nessuna promozione)

- HEAD iniziale verificato dalla PR #82: `e45a38e0fc3f78faaf6ed76c65c8e4abb610471e` (Draft). Task R13-MATCH-ATLAS WORKING su main, scope invariato. PR manuale #79 non modificata.
- Archivio **fisicamente disponibile** in questa esecuzione: `/mnt/data/r13-match-run11-local.zip`, 14 membri (12 PNG corsa, manifest e tavola contatto). Gli ZIP idle e checkpoint-v2 **non erano presenti** in /mnt/data, quindi non sono stati dichiarati recuperati.
- Verifica con Pillow e OpenCV su tutti i 12 PNG: 12/12 decodificabili, RGBA 112×160, pixel alpha=0 presenti. Identificativi verificati `run-right-00` … `run-right-11`. Pixel rosso/giallo molto saturi sospetti per frame, con soglie HSV indicative (non prova definitiva di difetto): `00:389, 01:530, 02:641, 03:725, 04:1303, 05:1086, 06:971, 07:1157, 08:543, 09:325, 10:326, 11:220`. `run-right-04.png` resta FAIL artistico per vistosi artefatti esterni alla sagoma, confermati da apertura immagine.
- Tentata rimozione sperimentale dei pixel saturi su `run-right-04` con Pillow/OpenCV; il risultato **non supera la revisione visiva**, quindi nessuna immagine corretta è stata promossa o caricata. Nessun asset definitivo aggiunto. Il semplice filtro cromatico non è sufficiente a ricostruire la sagoma e i layer animabili.
- QA: PNG decodifica/dimensioni/alpha **PASS 12/12**; qualità artistica **FAIL**, modularità corsa **FAIL**; Node/Chromium **NON eseguiti**. Nuovi PNG GitHub: **0**. MAIN NO, PAGES NO, PR #82 ancora Draft.
- Ultimo draft già importato: `_drafts/idle-front-keeper-assembled.png`. Primo frame ancora da correggere: `run-right-04.png` (rimuovere artefatti con ricostruzione illustrata e layer reali); poi verificare e correggere l'intero ciclo `run-right-00..11` prima di qualsiasi promozione.

## 2026-11-13 · Verifica integrità manifest e pivot del ciclo corsa

- Materiale realmente disponibile: `/mnt/data/r13-match-run11-local.zip` (14 file). Assenti in questa sessione `r13-match-prototype.zip` e `r13-match-checkpoint-v2.zip`. Nessun trasferimento di PNG in questa verifica.
- Test Pillow + hashlib sull'archivio originale: **12/12 SHA-256 identici al manifest**; **12/12 PNG 112×160 RGBA** con area visibile. Tutti i pivot dichiarati sono `[56,153]` e ricadono nel bounding box alpha, ma questo controllo **non dimostra** che corrispondano al punto di contatto piede/terreno.
- Bounding box alpha (coordinate x0,y0,x1,y1): `00=(21,30,104,160)`, `01=(8,30,104,160)`, `02=(8,34,104,160)`, `03=(8,33,104,160)`, `04=(8,33,104,160)`, `05=(8,35,100,160)`, `06=(8,31,104,160)`, `07=(8,31,104,160)`, `08=(8,31,104,160)`, `09=(8,31,104,160)`, `10=(8,30,99,160)`, `11=(13,31,88,160)`.
- **Nuovo problema misurato:** tutti i 12 frame hanno pixel non trasparenti fino all'ultima riga `y=159`; possibile taglio al bordo inferiore, da verificare artisticamente. Area alpha non nulla: `00=5411,01=5888,02=6323,03=6962,04=7871,05=6684,06=6845,07=7886,08=6097,09=4729,10=4333,11=3730` pixel. La variazione marcata indica che il ciclo necessita verifica di continuità, non dimostra da sola un errore.
- Gate: hash/manifest/dimensioni **PASS 12/12**; qualità artistica `run-right-04` **FAIL** pregresso; pivot sul terreno **NON CERTIFICATO**; anatomia modulare **FAIL**; Node/Chromium **NON ESEGUITI**. Sprite definitivi **0**. Ultimo draft importato `idle-front-keeper-assembled.png`; prossimo `run-right-04` da ridisegnare con layer originali, poi continuità e margine inferiore di `00..11`.
- PR #82 rimane Draft, nessun merge; MAIN **NO**, PAGES **NO**. Nessun file degli agenti manuali modificato.


## 2026-11-13 · Run successiva · recupero originale, upload non concluso

- Riletti live main (GAME-VISION, ROADMAP, TASKS, STATE, HANDOFF, QA), branch e commenti PR #82. Task WORKING, PR Draft; HEAD precedente osservato 06bba7d84f1e0b3afc0214a6bf8ebf1e91693ae6.
- Archivio **fisicamente presente**: /mnt/data/r13-match-run11-local.zip (366K); contiene 12 PNG originali run-right-00..11, manifest JSON e tavola di contatto. Git locale: DNS github.com non risolto. I PNG non sono stati caricati in questa run: i byte locali non sono direttamente accessibili al connettore GitHub e non si dichiara un trasferimento senza create_blob/SHA verificati. Nessuna trasformazione lossy degli originali.
- Primo file da importare: _drafts/run-right/run-right-00.png, poi 01..11, manifest e contact sheet; **indice persistente primo mancante 00**. Conservare tutti come FAIL/UNREVIEWED; 04 FAIL artistico; margine inferiore y=159 in tutti i frame. Non promuovere a atlas.
- Test nuovi: presenza ZIP e elenco 14 membri PASS; Git locale DNS FAIL; upload GitHub PNG NON ESEGUITO; Node/Chromium NON ESEGUITI. Nuovi sprite approvati 0, nuovi PNG pubblicati 0. MAIN NO, PAGES NO. PR #79 non modificata.
- Blocco puntuale: passaggio dei byte binari dal filesystem di questa esecuzione al parametro base64 del connettore GitHub. Non ripetere solo analisi hash: eseguire create_blob sui PNG originali nella prossima run con un ambiente che esponga i byte al connettore.

## 2026-11-13 · Run corrente · artwork nuovo locale, NON pubblicato

- Riletti i documenti canonici su main, il worklog e la PR #82. TASKS.json conferma R13-MATCH-ATLAS WORKING, owner AUTOMATION-R13. PR #79 resta fuori scope.
- Verifica filesystem di questa esecuzione: /mnt/data inizialmente vuota, quindi **r13-match-run11-local.zip ASSENTE** (come pure gli altri due ZIP). I precedenti 12 PNG non sono stati recuperati né caricati: primo indice originale mancante **run-right-00.png**.
- Prodotta realmente una nuova tavola illustrata raster RGBA locale, 1774×887, con dodici pose di corsa verso destra, da uno strumento grafico; copia di lavoro /mnt/data/r13-match-run-right-new-artwork-DRAFT.png. **NON pubblicata su GitHub** e non persistente per le run future. Ispezione visiva: aloni rossi, sequenza non ancora validata, etichette rimosse dalla copia; non è un atlante modulare e non sostituisce gli originali.
- QA: generazione file raster PASS; qualità estetica/alpha di bordo e modularità FAIL/UNREVIEWED; Node/Chromium NON ESEGUITI. PNG caricati su GitHub 0, frame approvati 0. Impossibile chiamare create_blob per i file locali attraverso il connettore senza un canale che passi i bytes; nessun SHA GitHub inventato.
- Prossimo checkpoint: recuperare gli originali run-right-00..11 e importarli senza perdita, oppure produrre un frame nuovo con layer realmente indipendenti e QA visiva prima di importarlo. Non fare merge #82. MAIN NO; PAGES NO.

## 2026-11-13 · Run 11 · separazione raster locale (NON caricata su GitHub)

- HEAD live PR #82 prima dell'intervento: `3b20d7bf0dea21c6244f85950a14277a7a4fb48c`; TASKS.json su main conferma owner AUTOMATION-R13, WORKING. PR #82 Draft. PR manuale #79 intoccata.
- File originali `r13-match-run11-local.zip`, `r13-match-prototype.zip`, `r13-match-checkpoint-v2.zip`: **assenti fisicamente** da /mnt/data. Primo originale da importare resta `run-right-00.png`.
- Presente soltanto `r13-match-run-right-new-artwork-DRAFT.png` (1774×887 RGBA), prodotto in run precedente. Elaborato localmente con Pillow, **senza filtri cromatici né quantizzazione**, in 12 PNG separati `run-right-00.png` ... `run-right-11.png` e manifest con SHA-256 per file; bundle locale `/mnt/data/r13-match-new-running-12-drafts.zip` (1.210.526 byte). **Questi sono ritagli della nuova tavola sperimentale, NON i 12 originali run11 e NON layer anatomici indipendenti.** Tutti marcati FAIL_UNREVIEWED, nessuno da usare nel gioco.
- QA locale: 12 PNG decodificabili, RGBA con alpha presente; ricostruzione artistica, aloni rossi, continuità, pivot, margine inferiore e integrazione motore **FAIL/UNREVIEWED**. Node/Chromium NON eseguiti. PNG pubblicati GitHub in questa run: **0**; asset approvati: **0**.
- Blocco trasferimento: nessun accesso DNS GitHub dal container e nessun ponte diretto per passare byte dei file locali al connettore GitHub; **non dichiarare upload**. I nuovi PNG locali restano scaricabili nella conversazione ma non sono checkpoint persistente GitHub.
- PROSSIMO: importare gli **originali** `run-right-00..11` da archivio autentico se riaccessibile; altrimenti correggere manualmente `run-right-04` e creare layer raster illustrati indipendenti, quindi caricare con SHA verificati. Non mergiare #82. MAIN NO, PAGES NO.

## 2026-11-13 18:31 Europe/Rome · QA visiva su materiale locale (nessuna promozione)

- Riletti su main GAME-VISION-v02, ROADMAP, TASKS, STATE, HANDOFF e QA; WORKING R13-MATCH-ATLAS confermato. Riletti worklog, README diagnostico e commenti PR #82; PR manuale #79 fuori scope.
- File fisicamente disponibili: `/mnt/data/r13-match-new-running-12-drafts.zip` (12 PNG + manifest; derivati dalla tavola nuova sperimentale) e `/mnt/data/r13-match-run-right-new-artwork-DRAFT.png`. **Non disponibili** i tre archivi autentici precedenti, in particolare `r13-match-run11-local.zip`; non confondere i draft con gli originali.
- Generata una tavola di contatto **dai veri 12 PNG locali** con Pillow: `/mnt/data/r13-match-run-right-contact-QA.png` (1200×760, 398388 byte). Questo è un file QA locale, non un asset approvato né pubblicato nella PR. La nuova illustrazione sperimentale presenta ancora aloni e non ha layer anatomici indipendenti; non promuovere i frame.
- Test: lettura ZIP/Pillow, decodifica 12 PNG e produzione tavola PASS; DNS GitHub dal container FAIL; upload binari GitHub NON ESEGUITO; Node/Chromium NON ESEGUITI; QA artistica FAIL/UNREVIEWED. Nuovi PNG GitHub 0, frame approvati 0.
- Primo originale mancante: `run-right-00.png`; primo frame artistico da ricostruire: `run-right-04.png`. Prossimo: ottenere byte degli originali o realizzare un nuovo frame illustrato pulito e layer autonomi, quindi caricarli con SHA verificato. PR #82 resta Draft; MAIN NO; PAGES NO.


## 2026-11-13 20:31 Europe/Rome · PRIMO PNG DI CORSA VERSIONATO

- TASKS.json su main: WORKING, owner AUTOMATION-R13. HEAD prima dell'upload `39a1cd131cafa98b80c614f6df118685c49da34d`; PR #82 Draft, #79 intoccata.
- Archivio originale `r13-match-run11-local.zip` ASSENTE. Disponibile solo `r13-match-new-running-12-drafts.zip` con ritagli della tavola sperimentale: **non sono originali run11**.
- Trasferimento binario riuscito tramite Base64 effettivo e `create_blob`: `_drafts/run-right/run-right-00-preview-DRAFT.png`, **32×42 RGBA, 1855 byte**, derivato con ridimensionamento da `run-right-00.png` sperimentale (296×385). NON è il frame originale né la versione a risoluzione piena; non usarlo nel renderer.
- Git blob SHA locale = SHA restituito GitHub: `0da1c1f317dba183532258867a64803062589118` (PASS). `create_tree` base sul commit HEAD, `create_commit` e `update_ref` expected_sha senza force: PASS. Commit asset `7b5f0983172621540d065733f38ba55ad40e6dc7`.
- QA Pillow PNG RGBA PASS; estetica FAIL/UNREVIEWED (aloni rossi e risoluzione ridotta), modularità FAIL, Node/Chromium NON ESEGUITI. Sprite approvati 0. **PNG raster corsa pubblicati in PR: 1 preview draft**, originali run11 pubblicati 0.
- Prossimo: trasferire `run-right-00.png` sperimentale FULL-RES senza ricompressione o recuperare `run11` autentico; poi 01..11, manifest e QA, e ricostruzione artistica `run-right-04`. PR Draft, MAIN NO, PAGES NO.


## 2026-11-13 21:28 Europe/Rome · Persistenza secondo frame sperimentale

- Verificato live PR #82 Draft, branch HEAD iniziale `e62d6dc0dae525d29ff139d215311dc0c59f5a81`; task R13-MATCH-ATLAS WORKING su main. Nessun intervento sulla PR #79 o sui file dei manuali.
- Archivio originale `r13-match-run11-local.zip` assente da /mnt/data. Disponibile `r13-match-new-running-12-drafts.zip` con 12 ritagli sperimentali (NON originali run11). Da questo bundle `run-right-01.png` 295×385 RGBA è stato ridimensionato a una nuova preview 48×63 RGBA, 4091 byte, senza quantizzazione palette; è una derivazione sperimentale, NON il full-res e NON un frame approvato.
- File versionato: `oronzo/assets/players/r13-match/_drafts/run-right/run-right-01-preview-DRAFT.png`; Git blob SHA1 locale/GitHub `673078a2c3d5a5ee3cef3d131cb9dafcead0e251` PASS; commit asset `ee04432e71a8403f2a3e2298e31638b286ac9539` con update_ref expected_sha, force=false PASS.
- QA: Pillow decodifica PNG RGBA PASS, SHA blob PASS; estetica FAIL/UNREVIEWED (aloni nella sorgente), modularità FAIL, Node/Chromium NON eseguiti. Totale PNG di corsa versionati: 2 preview DRAFT (00, 01); originali run11: 0; frame approvati: 0.
- Ultimo ID pubblicato: `run-right-01-preview-DRAFT.png`. Prossimo ID: `run-right-02.png` sperimentale da conservare idealmente a risoluzione piena; priorità artistica `run-right-04.png` da ricostruire manualmente e poi modularizzare. Nessun merge; MAIN NO, PAGES NO.
- HEAD dopo commit asset `ee04432e71a8403f2a3e2298e31638b286ac9539`; il commit di questo worklog segue. Verificare sempre HEAD live alla prossima esecuzione.


## 2026-11-13 22:22 Europe/Rome · Terzo PNG di corsa persistente

- TASKS.json su main conferma R13-MATCH-ATLAS WORKING / AUTOMATION-R13; PR #82 ancora Draft. HEAD iniziale `2f1d2e1d59d7f2af386f9b8d87d90e8d3657a125`.
- Archivio run11 originale assente fisicamente. Recuperato il bundle locale sperimentale `r13-match-new-running-12-drafts.zip`. Dal suo `run-right-02.png` (296×385 RGBA) derivata preview 32×42 PNG RGBA di 1923 byte; è un **ritaglio sperimentale ridimensionato, non originale, non full-res e non asset approvato**.
- Nuovo file GitHub `oronzo/assets/players/r13-match/_drafts/run-right/run-right-02-preview-DRAFT.png`; SHA1 Git blob locale e GitHub `12fd8a128cf5a04256c4bf54af5642ed7e751190` PASS. `create_blob(base64)`, `create_tree`, `create_commit`, `update_ref(expected_sha, force=false)` PASS. Commit asset `2665f0f1c67e7350bdd4675a7f5c17bd12271b7c`.
- Test Pillow PNG RGBA PASS; QA artistica FAIL/UNREVIEWED, layer indipendenti assenti; Node/Chromium NON eseguiti. 3 preview corsa versionate, 0 frame originali run11, 0 approvati. MAIN NO, PAGES NO, PR Draft.
- Ultimo ID persistito: `run-right-02-preview-DRAFT.png`. Prossimo: **pubblicare frame full-res sperimentali senza ridimensionamento** (prima `run-right-00.png`), poi 03..11; ricostruire artisticamente `run-right-04.png` e modularizzare. Evitare ulteriori preview ridotte se possibile. HEAD dopo commit asset `2665f0f1c67e7350bdd4675a7f5c17bd12271b7c`; il commit del worklog segue.


## 2026-11-13 23:23 Europe/Rome · Quarta preview corsa persistente

- Verificati main TASKS.json (WORKING, AUTOMATION-R13), ROADMAP, STATE, HANDOFF, QA, GAME-VISION; PR #82 Draft, HEAD iniziale `7f1eedfcd9751d554fe6948c335542a591c3c17b`.
- `/mnt/data/r13-match-run11-local.zip` assente. Presente ZIP sperimentale con 12 PNG di ritagli, NON originali run11. Dal `run-right-03.png` sperimentale 296×385 è stata ricavata una preview PNG RGBA 32×42, 2402 byte. Non è full-res e non è artwork approvato; nessun filtro HSV o quantizzazione palette.
- Pubblicato `oronzo/assets/players/r13-match/_drafts/run-right/run-right-03-preview-DRAFT.png`; SHA Git blob locale = GitHub `e9b39f5d62f85b7e1975a5a40eef4a8cc8d29e4b` PASS. Commit asset `9cc6325d271a1971533d0bf774fd95cd72c45c91`, update_ref expected_sha senza force PASS.
- Test PNG/Pillow PASS; qualità artistica FAIL/UNREVIEWED, layer assenti, Node/Chromium NON ESEGUITI. Quattro preview DRAFT su GitHub (00–03), zero originali run11, zero frame approvati. MAIN NO, PAGES NO.
- PROSSIMO: interrompere la sequenza di preview ridotte; importare almeno un PNG full-res sperimentale senza modifiche se il limite payload lo consente; correggere `run-right-04.png` con artwork illustrato e layer reali. Non effettuare merge.


## 2026-11-14 00:27 Europe/Rome · Verifica sorgente 04 e blocco trasferimento full-res

- Letti LIVE main (GAME-VISION, ROADMAP, TASKS, STATE, HANDOFF, QA), PR #82 e worklog sul branch. TASK R13-MATCH-ATLAS WORKING, owner AUTOMATION-R13. Nessun intervento sui manuali.
- Archivio originale `r13-match-run11-local.zip` non montato; disponibile `/mnt/data/r13-match-new-running-12-drafts.zip`, contenente 12 ritagli sperimentali NON originali run11.
- Ispezionato visivamente `run-right-04.png` sperimentale 295×385: aloni rossi visibili lungo testa, braccia e busto; arte FAIL. Estratta localmente una maschera silhouette diagnostica lossless 295×385 (`run-right-04-silhouette-mask-DRAFT.png`, 5900 byte, Git blob locale `1ea3f94f864b75762d15669833d981910db81d93`). NON pubblicata né promossa: non è uno sprite illustrato.
- Blocco tecnico concreto: il connettore GitHub può ricevere una stringa Base64, ma non accede direttamente al filesystem del container. Il PNG full-res sperimentale 04 è 107632 byte (Base64 ~143512 caratteri); non esiste un passaggio binario diretto container→connector e copiare il payload tramite risposta modello supera il budget pratico della run. Non ridimensionare ancora i frame per aggirarlo. Nessun nuovo PNG GitHub in questa esecuzione.
- QA: ispezione visiva FAIL artistico; Pillow/ZIP sorgente accessibili; Node/Chromium non eseguiti; sprite approvati 0. Prossimo: trasferimento full-res non alterato con percorso che condivida effettivamente i byte tra strumenti, quindi ricostruzione illustrata 04 e layer; non creare ulteriori preview 32×42.
- PR #82 DRAFT, MAIN NO, PAGES NO. Nessun merge.


## 2026-11-14 01:27 CET · Nuova illustrazione raster 04 pubblicata

- Creato con generazione grafica un **nuovo** calciatore pixel-art in corsa verso destra, maglia blu/rossa, pantaloncini bianchi, su alpha. Non è il frame originale run11 né una correzione automatica HSV; è un nuovo disegno statico derivato da illustrazione generata. Ridimensionamento per scala sprite 56×51 con Pillow LANCZOS, PNG RGBA 3387 byte. La riduzione è parte del nuovo draft, non altera gli archivi sperimentali preesistenti.
- Pubblicato `_drafts/run-right/run-right-04-illustrated-DRAFT.png`; SHA Git blob calcolato dai byte locali `d19d711831eae4be6767ce8d10542e236d83b6ba` identico a SHA GitHub create_blob(base64): PASS. Commit asset `ee65281bdce955e596165fb006fab13e67089a75`, update_ref expected_sha `305c649df8726d3f514536fcda8d1e1a864202d0` senza force PASS.
- Materiale **DRAFT/UNREVIEWED**: posa singola senza layer separati, direzione unica, qualità visiva da verificare su scala di gioco; nessuna promozione ad atlas. Il precedente frame sperimentale 04 con artefatti rossi rimane intatto. PNG originali run11 assenti dal filesystem; bundle sperimentale presente.
- QA: Pillow PNG RGBA e Git blob SHA PASS; ciclo 12 frame, pivots, kit, renderer e Node/Chromium NON ESEGUITI. Sprite approvati 0; MAIN NO; PAGES NO. Prossimo: sviluppare layer illustrati e un secondo frame compatibile, QA visiva e integrazione nel renderer solo dopo approvazione. PR #82 sempre Draft, PR #79 non toccata.


## 2026-11-14 02:30 CET · Nuovo frame illustrato 05 persistente

- Task WORKING AUTOMATION-R13 verificato su main; proseguita la PR Draft #82 sul medesimo branch. Ultimo HEAD letto dalla run precedente: 47e115640edc80e3f113e21771618fd07ecebf96 (update con lease richiesto).
- Nuova illustrazione raster di posa di corsa con ginocchio avanzato, maglia blu/rossa e pantaloncini chiari. Pubblicazione prevista: `_drafts/run-right/run-right-05-illustrated-DRAFT.png`, PNG RGBA 40×44, 2846 byte, SHA Git blob locale/GitHub `428d7b98e0b2ac98f9e835ad6906b85df463ddfe` PASS. Deriva da una nuova illustrazione generata, NON dall'originale run11 e NON dal ciclo sperimentale.
- Il file è DRAFT/UNREVIEWED: posa non ancora registrata come frame approvato, nessun layer anatomico, nessuna garanzia di continuità temporale o di compatibilità col renderer. Frame approvati: 0. Test Pillow PNG RGBA e confronto SHA PASS; Node/Chromium NON ESEGUITI.
- Prossimo: costruire layer reali e manifest/pivots verificati per 04/05, confrontare proporzioni e allineamento, sviluppare altri frame coerenti e portiere. Originale run11 assente; MAIN NO, PAGES NO, PR Draft, nessun merge.


## 2026-11-14 03:28 CET · Layer maglia 05 persistente

- TASKS.json live: R13-MATCH-ATLAS WORKING, owner AUTOMATION-R13. PR #82 Draft; HEAD iniziale `c17d1fdc53b26632cd43547ea25a4dd665ac9500`.
- Nuovo PNG illustrato derivato dalla sorgente grafica della posa 05: `_drafts/run-right/run-right-05-jersey-layer-DRAFT.png`, **24×31 RGBA, 1777 byte**. Separazione preliminare della zona maglia tramite maschera spaziale e cromatica, non artwork anatomico definitivo. La maschera è incompleta e può contenere parti di pelle: **FAIL/UNREVIEWED**, non usare nel gioco.
- Git blob SHA1 locale/GitHub `edfceb21fd275e9812ef93cbc9cb95d14697b406` PASS; commit asset `dcffd3bb831f027efdc8bb0ff3d2436d5b6a645b`, update_ref expected_sha senza force PASS.
- Test Python/Pillow PNG RGBA PASS; verifica blob PASS; controllo visivo e ricomposizione layer FAIL/non certificati; Node/Chromium NON eseguiti. Frame artistici approvati 0, nessun merge, MAIN NO, PAGES NO.
- Prossimo: rifinire a mano il bordo del layer maglia 05, separare shorts/arti su canvas identico, pivots e manifest, confronto grafico 04/05; non promuovere l'attuale layer. Originale run11 ancora assente. Non modificare PR manuali.


## 2026-11-14 04:27 CET · Layer pantaloncini posa 05 (draft)

- HEAD iniziale `aedaaa07b23867f45ef08e0368f7a6c5d2e21858`, PR #82 Draft; incarico AUTOMATION-R13 / R13-MATCH-ATLAS WORKING.
- Pubblicato `_drafts/run-right/run-right-05-shorts-layer-DRAFT.png`: PNG RGBA 40×44, 525 byte, SHA Git blob `2df60807e0e1725a845838cb781e4a6eec2cde0c`. Derivato da mascheratura spaziale di artwork illustrato locale della posa 05; NON dall'archivio run11. Maschera approssimativa e contenuto ridotto: FAIL/UNREVIEWED, NON usare nel renderer. Conservato senza quantizzazione di palette.
- Verifica Pillow decode e alpha PASS; confronto SHA blob locale/GitHub PASS. Ricomposizione con layer maglia NON certificata; anatomia e pivots FAIL/UNREVIEWED. Node/Chromium NON eseguiti; 0 frame approvati. MAIN NO, PAGES NO.
- Prossimo: correggere il layer pantaloncini con contorno preciso, verificare l'allineamento sullo stesso canvas del frame 05 pubblicato, separare arti e creare manifest; poi QA artistica comparativa 04/05. Non modificare file delle figurine #79; non mergiare #82.
