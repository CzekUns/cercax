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


## 2026-11-14 05:30 CET · Layer testa posa 05 (DRAFT)

- Ripreso task `R13-MATCH-ATLAS` WORKING, PR #82 Draft, branch unico; HEAD iniziale `615f9b183a19132ab2615c7924b4903dc41b6469`.
- Pubblicato `oronzo/assets/players/r13-match/_drafts/run-right/run-right-05-head-layer-DRAFT.png` (40×44 RGBA, 2338 byte), ricavato dall'artwork raster illustrato locale `retro_soccer_player_sprinting.png` con maschera spaziale provvisoria della testa. Non è originale run11 e non è un layer anatomico approvato; ridimensionamento LANCZOS e margini da rifinire: **FAIL/UNREVIEWED**.
- SHA Git blob locale/GitHub `5fc2a759870352587cf0f167358b8affc11e11fa` PASS; commit asset `7df903e71573bfd7158f5fa9d6c9680ca28d12dc`, update_ref expected_sha senza force PASS.
- Test: PNG Pillow RGBA PASS; blob GitHub PASS; continuità, pivots, ricomposizione con maglia e pantaloncini NON certificati; Node/Chromium NON eseguiti; frame approvati 0. MAIN NO, PAGES NO.
- Prossimo: verificare la ricomposizione 05 sul medesimo canvas, correggere maschere anatomiche con riferimento all'illustrazione e completare arti; poi QA visiva 04/05 e ciclo corsa. Nessun merge, nessuna modifica alle figurine manuali.


## 2026-11-14 06:29 CET · Layer inferiore posa 05 pubblicato

- Verificati live `main` SHA `4b3752b7d638badd66d000f4ebc6269c70e8503d`, TASKS.json `R13-MATCH-ATLAS` WORKING, PR #82 Draft, HEAD iniziale `aac6c3af50f3cdaed1ef7380d0a4180be071601a`. Nessun file manuale modificato.
- Da artwork locale illustrato `retro_soccer_player_sprinting.png` è stata estratta con maschera spaziale una componente **inferiore gambe/scarpini**; nuovo PNG RGBA 40×44 senza quantizzazione di palette: `_drafts/run-right/run-right-05-legs-layer-DRAFT.png` (1160 byte). SHA Git blob locale `27de47389adf92b9f2a0b4edcd57a5b69749b9a5` = GitHub create_blob(base64): PASS.
- **DRAFT/FAIL artistico:** taglio approssimativo e anatomia incompleta, necessita raccordo con shorts, braccia mancanti, layer non validati in composizione; non inserire nel renderer. Non è originale run11.
- Test Pillow RGBA/alpha PASS, Git blob PASS. Node/Chromium non eseguiti; 0 frame approvati; MAIN NO, PAGES NO. Prossimo: correggere il layer gambe su canvas comune e realizzare braccia; validare ricomposizione e pivots prima di approvare.

## 2026-11-14 · Run 11 · indice draft persistente

- Live PR #82 HEAD iniziale `73efdd5c210d527f9219f8da1019c41668c26375`; TASKS.json main conferma `R13-MATCH-ATLAS` WORKING e scope automazioni soltanto.
- Nuovo file versionato: `_drafts/run-right/draft-atlas-index.json` (schema 1), inventario operativo dei frame illustrati 04–05 e dei layer head/jersey/shorts/legs della posa 05. Tutti esplicitamente DRAFT/FAIL; `rendererEnabled=false`, pivot null e frame approvati zero. Commit `667404edfa92ef8c08cb0df1f0919fe7363c7d59`.
- File sorgente locale accessibile: `/mnt/data/retro_pixel_soccer_player_sprinting.png` (illustrazione raster); prodotto localmente `/mnt/data/r13-source04-review.png` (64×58, 3887 byte, Git blob locale `3c0cf9389768e7a895cf6a5dc07b696f6260175f`) ma **NON pubblicato**: la stringa Base64 è stata generata, ma non è stata passata a `create_blob` in questa run. Non conteggiare come asset persistente. Non dichiarare completato il ponte binario.
- Test: file indice GitHub commit PASS; PNG Pillow locale PASS; trasferimento binario PNG NON eseguito; test Node/Chromium NON eseguiti; QA artistica FAIL/UNREVIEWED. MAIN NO, PAGES NO, PR Draft.
- Prossimo: inviare i byte Base64 effettivi del PNG draft con `create_blob`, poi create_tree/create_commit/update_ref e verifica remota; ricomporre braccia e pivots della posa 05. Evitare ulteriori report senza asset.


## 2026-11-14 08:24 CET · Recupero pubblicazione PNG sorgente 04

- Task R13-MATCH-ATLAS WORKING verificato su main; branch unico PR #82, HEAD di partenza `8b013673bf1fbe1a71e69544f74cade66aa61414`. Nessun file manuale modificato.
- **PNG realmente pubblicato:** `_drafts/run-right/run-right-04-source-review-DRAFT.png`, 64×58 RGBA, 3887 byte. Derivato dall'illustrazione raster locale `retro_pixel_soccer_player_sprinting.png` con ridimensionamento LANCZOS; **non** è originale run11, né un frame full-res, né un frame approvato. Nessuna quantizzazione della palette o filtro HSV.
- Base64 effettivo passato a `create_blob(encoding=base64)`; SHA1 Git blob locale `3c0cf9389768e7a895cf6a5dc07b696f6260175f` = SHA restituito da GitHub e confermato da `fetch_file(ref=branch)`: **PASS**. Tree `817a4e1f8a4b0ff35afea2ac69d54c8b09ac0a6f`; commit `eec5c5543868581b2a7ca34563a8b9d7b50bfc7f`; `update_ref(expected_sha, force=false)` PASS.
- QA: Pillow PNG RGBA locale PASS; integrità GitHub PASS. Qualità artistica **DRAFT/UNREVIEWED**; modularità e ciclo FAIL/incompleti. Node/Chromium NON eseguiti. Frame approvati 0. MAIN NO, PAGES NO, PR #82 Draft.
- Ultimo asset pubblicato `run-right-04-source-review-DRAFT.png`; prossimo: completare e correggere braccia della posa 05, ricomporre tutti i layer con pivots su canvas comune e verificare animazione. Non mergiare.


## 2026-11-14 09:29 CET · Braccia posa 05 pubblicate (DRAFT/FAIL)

- TASKS.json live: AUTOMATION-R13 / R13-MATCH-ATLAS WORKING; PR #82 Draft; HEAD iniziale `0fbecb83fc036fbb2ebed1a03d2cff2c60232d9d`.
- **PNG persistente** `_drafts/run-right/run-right-05-arms-layer-DRAFT.png`: 40×44 RGBA, 791 byte, bbox alpha (7,6,34,22). Sorgente reale `/mnt/data/retro_soccer_player_sprinting.png` (1189×1323 RGBA), maschere spaziali dei due arti superiori su pixel illustrati, poi ridimensionamento LANCZOS. Non è originale run11, non è anatomia manualmente rifinita. **DRAFT/FAIL**: contorni approssimativi e possibili sovrapposizioni con maglia, nessuna ricomposizione certificata.
- SHA1 Git blob locale `cb43f5dfa80e36e97ca2fe7a357f7349efa5f0b6` identico a `create_blob(base64)`: PASS. Tree `01793fd846009ef11eb070ec602a3855068b522b`; commit asset `a17a5fe82dd34c8242dd448720b227e34ac79b13`; update_ref con expected_sha e force=false PASS.
- QA Pillow RGBA/alpha PASS; SHA blob PASS; ricomposizione/continuità/pivots/kit artistici FAIL o non certificati. Node/Chromium NON eseguiti. Frame approvati 0; MAIN NO, PAGES NO; nessun merge e nessuna modifica ai manuali.
- Ultimo layer pubblicato `run-right-05-arms-layer-DRAFT.png`. **Prossimo**: riallineare e ricomporre head/jersey/shorts/legs/arms 05 sullo stesso canvas, correggere i bordi in pixel art e produrre test grafico persistente; quindi pivot/manifest e verifica Chromium prima di promuovere.


## 2026-11-14 10:30 CET · Layer scarpini posa 05 (DRAFT/FAIL)

- Task LIVE: `AUTOMATION-R13 / R13-MATCH-ATLAS` WORKING su `main`; PR #82, branch unico `automation/oronzo-r13-match-atlas`. HEAD prima `598d62ca027386102dab7c90ac25ec91989044c8`.
- **Nuovo PNG pubblicato**: `oronzo/assets/players/r13-match/_drafts/run-right/run-right-05-boots-layer-DRAFT.png`, RGBA 40×44, 535 byte, alpha bbox `(2,23,30,40)`; derivato dall'artwork locale `retro_soccer_player_sprinting.png`, maschera spaziale degli scarpini, ricampionamento LANCZOS. NON è un originale run11, NON è layer artisticamente rifinito. Stato **DRAFT/FAIL**: maschera da correggere, raccordo con calzettoni non verificato.
- Git blob SHA1 calcolato dai byte `467ca327f58f6f9d8a27025256e91b68078f340c`, `create_blob(base64)` uguale, `fetch_file` su branch uguale: **PASS**. Tree `fe805b6328ca54503c5b71ed2a2e1e3284908af0`, commit asset `69977cb967db2e2c7e4b6d96166b21792d113590`; update_ref expected_sha PASS.
- QA PNG Pillow/alpha PASS; verifica remota SHA PASS. Ricomposizione, pivots, continuità e resa artistica NON certificati; Node/Chromium NON eseguiti. Frame approvati **0**. MAIN NO; PAGES NO. PR Draft, nessun merge.
- **Ultimo file:** `run-right-05-boots-layer-DRAFT.png`. **Primo passo mancante:** ricomporre e confrontare tutti i layer posa 05 su canvas comune, rifinire manualmente bordi e pivots, pubblicare prova grafica; non promuovere la posa finché non supera QA.


## 2026-11-14 · Nuova posa illustrata 06 persistente
- Asset pubblicato: `oronzo/assets/players/r13-match/_drafts/run-right-06-illustrated-DRAFT.png` (56×68, PNG RGBA, 3743 byte). Fonte: nuova illustrazione locale `/mnt/data/retro_soccer_player_sprinting.png`, ritagliata sul bbox alpha e ridimensionata; **non** originale ZIP/run11 e **non** frame approvato. Nessun filtro HSV o quantizzazione palette.
- Blob SHA calcolato sui byte e restituito dal connettore GitHub identico: `7279a2c054869a45afac019a2764604acbef6c9d` (PASS). Commit asset `49c6a9a0d29f68ef29302f033cca5eb846499731`; update_ref expected parent `c842d3872e21c0d89f40a9dd25772afef5744a65` PASS.
- QA: PNG RGBA/alpha e lettura Pillow PASS; continuità animazione, raccordi layer, pivots, Node/Chromium NON ESEGUITI. Qualità artistica DRAFT/UNREVIEWED, frame approvati 0. Nessuna modifica ritratti/PR manuali. MAIN NO, PAGES NO.
- Prossimo: ricomposizione e revisione anatomica dei layer della posa 05, con preview versionata; poi allineamento delle pose 04–06 e pivots.


## 2026-11-14 12:27 CET · Prima direzione sinistra illustrata persistente (DRAFT)
- Task live main: AUTOMATION-R13 / R13-MATCH-ATLAS WORKING. Branch PR #82 unico, parent `b99d04b235b996707518a60dd8c1b5453fa05247`.
- PNG realmente versionato: `oronzo/assets/players/r13-match/_drafts/run-left-06-illustrated-DRAFT.png` (44×48 RGBA, 2603 byte). Ottenuto per specchiatura orizzontale dell'artwork illustrato locale `retro_soccer_player_sprinting.png`, crop su bbox alpha e riduzione LANCZOS; nuova direzione sinistra, NON originale run11 e NON nuova posa indipendente. Nessuna quantizzazione HSV/palette.
- SHA Git blob dai byte `7d4e4706960b64835d3bc4a0022501860aa85027` = GitHub create_blob(base64) = fetch_file(branch): PASS. Tree `13c01b44aaf4e534231d791881dab657f67934bb`, commit asset `36f74546c55278dfd311619aaed9af59c66a6328`, update_ref expected_sha PASS.
- QA: Pillow PNG RGBA/alpha PASS; integrità blob GitHub PASS. Controllo estetico, ciclo, raccordi, pivot, Node/Chromium NON ESEGUITI. Asset DRAFT/UNREVIEWED, frame approvati zero. MAIN NO, PAGES NO, PR #82 Draft e nessun merge.
- Prossimo: ricomporre e correggere i layer posa 05 su canvas unico e pubblicare preview persistente; quindi pivots/manifest e QA Chromium. Non modificare PR #79 o agenti manuali.


## 2026-11-14 · Browser compositing QA pose 05 (non certificato)

- Task R13-MATCH-ATLAS WORKING su main; PR #82 Draft, branch unico; HEAD iniziale live `1f3be894919122b155775a1149d8304422fcd7a9`.
- Pubblicato **codice funzionale di composizione raster**, `oronzo/assets/players/r13-match/_drafts/run-right/pose-05-layer-review.html`: carica i 6 PNG già versionati (legs, boots, shorts, jersey, arms, head), li compone sul canvas 40×44, permette attivazione/disattivazione di ciascun livello e confronta la posa illustrata di riferimento. Non genera figure con primitive Canvas: usa esclusivamente PNG illustrati esistenti. **Non è un nuovo PNG**.
- Aggiornato `_drafts/run-right/draft-atlas-index.json` includendo tutti e sei i layer e il percorso della preview; `rendererEnabled:false`, approvati 0.
- Verifica live GitHub: 7 PNG richiesti, HTML e JSON presenti e riletti con SHA; file references **PASS 9/9**. Browser/Chromium, allineamento anatomico, pivots e confronto visivo **NON eseguiti**, qualità ancora FAIL/UNREVIEWED. Nessun asset promosso.
- Blocco del PNG nuovo in questa run: gli ZIP storici e i byte degli artwork non sono montati in `/mnt/data`; il container non raggiunge `raw.githubusercontent.com` (errore DNS/proxy). Il connettore GitHub può leggere gli asset già versionati ma non può trasferire automaticamente i byte nel runtime Python. Non si è inventato un nuovo PNG o eseguita quantizzazione.
- Ultimo frame completo approvato: **nessuno**. Ultimo frame draft già esistente: `run-left-06-illustrated-DRAFT.png`. Prossimo: usare la preview versionata per verificare realmente in Chromium la ricomposizione 05, correggere maschere, poi produrre e pubblicare un PNG composito realmente verificato, con pivots; in alternativa recuperare ZIP run11 autentico. MAIN NO; PAGES NO; nessun merge.


## 2026-11-14 · Run 11 · composito inferiore posa 05 pubblicato

- Main live `4b3752b7d638badd66d000f4ebc6269c70e8503d`; TASKS.json conferma R13-MATCH-ATLAS WORKING, owner AUTOMATION-R13; PR #82 Draft. Branch prima del commit `f88ab042db6247f5308b22af0b5b51472a033f76`.
- Nuovo asset reale versionato: `_drafts/run-right/run-right-05-legs-boots-composite-DRAFT.png`, PNG RGBA 40×44, 1155 byte. Composizione alpha di due layer raster preesistenti recuperati tramite GitHub (`run-right-05-legs-layer-DRAFT.png` + `run-right-05-boots-layer-DRAFT.png`), senza quantizzazione o filtro HSV. NON è un frame originale run11 e NON è un giocatore completo.
- SHA Git blob calcolato sui byte `c0ba8f1d938e84c64746960fc850f01a4091f084` = GitHub create_blob(base64), PASS. Tree `f31b65c99b3fff7b6caa29a8a2b67146a32af26b`, commit asset `dfa1948c7d33132917616da5775d2bc7e03303ca`, update_ref expected_sha PASS. Pillow RGBA/alpha e decodifica PASS.
- Il composito è **DRAFT/FAIL artistico non revisionato**: mancano testa, jersey, shorts e braccia; pivots, raccordi e animazione non certificati. Node/Chromium NON eseguiti. Frame approvati 0. MAIN NO, PAGES NO. Nessuna modifica agli asset r13/ritratti o agli agenti manuali.
- Ultimo file pubblicato: `_drafts/run-right/run-right-05-legs-boots-composite-DRAFT.png`. Prossimo: recuperare `_drafts/run-right/run-right-05-jersey-layer-DRAFT.png` (nome effettivo) e gli altri quattro layer via GitHub, comporre un **frame intero PNG** su canvas 40×44, verificare visivamente in Chromium e registrare pivot/manifest prima di promuovere. PR #82 resta Draft, senza merge.


## 2026-11-14 15:29 CET · Composito inferiore+shorts+arms posa 05 (DRAFT/FAIL)
- Task live `AUTOMATION-R13 / R13-MATCH-ATLAS` WORKING, PR #82 Draft. Main TASKS.json letto, scope scheduled-automations-only. Branch parent `bfef312062d40ad25821aa98bdac3b1832b24fb4`.
- PNG pubblicato `_drafts/run-right/run-right-05-lower-shorts-arms-composite-DRAFT.png` (40×44 RGBA), composto con Pillow in ordine alpha lower legs+boots, shorts, arms dai PNG illustrati già su PR #82, senza quantizzazione HSV. Il nuovo file contiene **4 componenti corporei**, ancora privo di maglia e testa; non è originale ZIP run11 né sprite approvato.
- Blob remoto `c8ffe8a87e024c8bb4d79901b938b1affe1ea55e`, commit `9c70d84955df084c82aff7d2502e5748d79b2c71`, update_ref expected SHA PASS. Attenzione: SHA locale `4f4090757a234c38b1cf9b3cf6b74f26684dc9f9` **NON corrisponde** al blob GitHub: possibile differenza nel passaggio Base64; NON certificare integrità byte-identica. Rilettura GitHub mostra PNG IHDR/IDAT CRC validi, ma risposta base64 troncata a 2720 caratteri: IEND non verificabile tramite fetch_file. Stato DRAFT/FAIL finché non viene confermato il payload completo.
- Pillow composizione locale PASS, alpha RGBA PASS. QA remoto completo, anatomia, pivots, Node/Chromium NON certificati. Frame approvati 0; MAIN NO, PAGES NO; PR Draft senza merge. Nessuna modifica agenti manuali.
- Prossimo: recuperare e comporre maglia e testa sulla posa 05; verificare byte GitHub con SHA locale esatto e QA visiva, poi correggere maschere/pivots. Evitare ulteriori tavole non persistenti.


## 2026-11-14 16:24 CET · Compositore riproducibile posa 05, PNG NON pubblicato
- Live: PR #82 Draft, branch unico; HEAD iniziale `712fd4bd855b912d136b39fe112ac17da937de6d`. TASKS.json main conferma AUTOMATION-R13 / R13-MATCH-ATLAS WORKING.
- Pubblicato codice eseguibile `_drafts/run-right/compose-pose-05.py` (commit `cbf77498ddd92c66c354c28d8f89e97f109c262c`). Compone i sei layer raster PNG già versionati, senza quantizzazione/HSV, conserva RGBA, gestisce esplicitamente jersey 24×31 con offset provvisorio (8,6), rifiuta dimensioni inattese e stampa SHA Git blob. Output previsto `run-right-05-full-composite-DRAFT.png`.
- **Nuovi PNG su GitHub: 0; frame approvati: 0.** Non è stato eseguito lo script sui sei file: nel container `/mnt/data` è vuoto e GitHub/raw/API non raggiungibili dal container per errore DNS. Il connettore GitHub recupera i byte Base64 ma non li materializza automaticamente nel container. Nessun falso PASS o merge.
- Test: GitHub file Python persistente PASS; Python/Pillow esecuzione compositore NON eseguita; Chromium e QA visiva NON eseguiti; integrità del composito precedente non certificata.
- **Prossimo**: trasferire realmente tutti e sei i PNG nel runtime oppure usare un runner che li possieda, eseguire `compose-pose-05.py`, produrre Base64 effettivo del PNG, `create_blob` / tree / commit / ref con expected SHA e confrontare SHA locale/remoto; quindi controllo visivo. MAIN NO, PAGES NO, PR Draft.
