# ORONZO — COERENTIZZATORE 00 · SECONDA ONDATA R10, AUDIT INTEGRATO

**STATO: `READY_AUDIT_R10_WAVE2` — 9 novembre 2026.** Primo audit completato nella [PR documentale #55](https://github.com/CzekUns/cercax/pull/55): PASS indipendente delle [#52 fullscreen](https://github.com/CzekUns/cercax/pull/52) HEAD `d266ad1740ab330946ab7cccccb6928c30c55a29` e [#53 comuni](https://github.com/CzekUns/cercax/pull/53) HEAD `9ec2baa6dc0c06b3d6fff432218f19be17ee77c0`, **128/128 Node e 16/16 percorsi Chromium combinati** (checkout vero, HTTP reale, PNG reali); nessun merge e Android fisico non attestato. Non ripetere inutilmente R10-F01/D01 sullo stesso SHA.

**Missione nuova, da CONCLUDERE:** audit indipendente degli HEAD aggiornati di [#28 camera](https://github.com/CzekUns/cercax/pull/28) `34aa26dce251c3c4f26e9705bca1fbefc20137f8`, [#29 sprite](https://github.com/CzekUns/cercax/pull/29) `7475cba747d6446841c4942178a9ec0b82d8abec`, [#31 PlayerV2/600 cognomi](https://github.com/CzekUns/cercax/pull/31) `b6235d6a1115e6323fddfc6acce9a86d954e79e2`, [#35 comandi individuali](https://github.com/CzekUns/cercax/pull/35) `923b198c92f8d02983dfdedf659e8823e6d6c26f`, e [#56 adapter carriera](https://github.com/CzekUns/cercax/pull/56) `b27af7ced642b436e5317a7384589c77bc789617`. Verificare HEAD live, non presumere immutati.

**Percorsi obbligatori:** Node nativi su checkout autentico, harness Chromium HTTP di render FULL/TV con 22 PNG reali e confronto col #29, 100 seed/suite cross-PR #31+#35, normalize origin/trust/toni, shout temporaneo unico e evento persistente non duplicato, 600 cognomi fonte/licenza/ID, prova PR #56 su main + branch dipendenti #31/#35/#53 con training/settimane/save/reload/compatibilità. Verificare compatibilità funzionale fra `career-r03.js`/`world.js` della #53 e `controller.js`/`m1-contract.js` della #56; **non** sono file modificati in comune fra le due PR. Distingui un gate riproducibile non superato da bug codice. Se fallisce, indica esatto file, riproduzione e fix nella PR stessa: nessun secondo progetto.

**Consegna:** rapporti con SHA/risultati e PASS/NEEDS_CHANGES/NON_CERTIFICATO per ogni PR, matrice test incrociati, ordine di merge proposto senza eseguirlo; niente nuovi branch di codice o merge senza autorizzazione utente. Riferimento [Roadmap R10](../10-orchestrator/ROADMAP-R10-ACCELERAZIONE.md).

---

## ARCHIVIO AUDIT PRECEDENTI

# ORONZO — COERENTIZZATORE 00 · ACCELERAZIONE GATE M1

**STATO: `AUDIT_REQUIRED_PR52_PR53` — 8 novembre 2026.** Piano aggiornato in [ROADMAP-R10-ACCELERAZIONE.md](../10-orchestrator/ROADMAP-R10-ACCELERAZIONE.md). **Audit immediatamente prioritario sulle PR #52 (Fullscreen) e #53 (500 comuni)**, entrambe OPEN/NOT MERGED all'ultimo controllo; verificare HEAD reale. Report **separati** e una prova di compatibilità con entrambi i branch nello stesso checkout/merge-base prima di raccomandare il secondo merge, senza simulare repository via fixture. La #53 va verificata con cura per i metadati contemporanei `null` e uso di `reviewStatus:'approved'`: mai rivendicare geografia1979. 119 Node e Chromium HTTP end-to-end, touch e save/load realmente eseguiti. PASS/NEEDS_CHANGES/NON_CERTIFICATO con comandi e screenshot propri. NO MERGE.

**Seconda ondata di audit dopo correzioni autori:** #28 camera TV con sprite reali (non fallback), #29 arte leggibilità, #31+#35 ordine individuale/toni/regione/trust/idempotenza. Non usare prove di #52/#53 per certificare #28/#31; niente nuovo lavoro se è ancora un blocker prima dell'audit precedente. Dopo PASS e **autorizzazione utente**, orchestratore integra una PR alla volta con SHA atteso e main smoke-test. Fino ad allora 12 può raccogliere note UI ma non sovrascrivere PR in revisione.

---

## ARCHIVIO — REQUEST PRECEDENTI

# ORONZO — COERENTIZZATORE 00 · AUDIT FUTURI PR #52 FULLSCREEN E #53 COMUNI

**STATO: `READY_QA_F01_D01_DIRECT` — 8 novembre 2026.** L'utente ha chiesto implementazione diretta anziché delega Work. Sono state pubblicate **[PR #52](https://github.com/CzekUns/cercax/pull/52)** fullscreen (JS autonomo, nav always-on) e **[PR #53](https://github.com/CzekUns/cercax/pull/53)** comuni contemporanei (500 IDs, 19 fonti, scelta nel gioco, schemi null) senza merge. Non dichiarare alcun esito indipendente prima di prova. Gli sviluppi non sono opera degli agenti 07/11, bensì interventi diretti autorizzati dall'utente.

**Gate A #52:** leggere diff/stato HEAD della PR, QA README; verificare reale Chromium HTTP + Fullscreen API da gesto e uscita (incluso match e browser non supportato), attivazione 44px di tutte6 voci nav a640×360/800×360/844×390/960×400 con e senza safe-area, mouse/touch, layout/stampa/TERMINA GARA e regressioni119 Node. Se browser proibisce fullscreen test, indicare non certificato senza fake CSS fullscreen.

**Gate B #53:** verificare snapshot e source blob PR ricerca #40, struttura JSON di500 reali ID ISTAT distinti, 19 fonti, license/attribution CC BY, nessuna provincia o anno demografico inventati, no claim sul1979, schemaV1 non indebolito, v2/null, club fittizi, origine/20 offerte, morale/contratti, saving/reloading vecchi+nuovi, `geography_required` quando catalogo assente, mode QA sintetico esplicito; UI 500 scelte e label, 119 regressioni Node e browser HTTP percorso completo. Verificare esecuzione del nuovo `real-world-m1.test.mjs`. Non presentare il parse V8 o la sola validazione500 come test E2E. Valutare esattamente se `reviewStatus:approved` sia supportato dall'evidenza e fonte licenza; segnalare eventuale qualifica errata come NEEDS CHANGES.

**Consegna report distinti con SHA**, possibili FIX richiesti nella stessa PR. **NO MERGE** senza nuova autorizzazione espressa utente. Non assegnare lavoro concorrente agli agenti07/11, non attivare camera/editor/comandi.
# ORONZO — COERENTIZZATORE 00 · IN ATTESA AUDIT D01 E F01

**STATO: `WAIT_NEW_PR_D01_F01` — 8 novembre 2026.** L'utente ha richiesto **località italiane registrate nel catalogo di ricerca** e pulsante **schermo intero**. Agente10 ha assegnato: **07/D01** validazione + importazione reale catalogo comuni su branch/PR propria, **11/F01** Fullscreen API mobile su branch/PR propria. I loro `NEXT.md` aggiornati su main contengono l'intero mandato. Questa REQUEST NON autorizza audit anticipati su branch inesistenti e NON autorizza merge.

**Gate futuro DATA D01:** verificare sorgente [PR #40](https://github.com/CzekUns/cercax/pull/40) snapshot congelato, 500 codici ISTAT unici al controllo dell'Agente10, dedup, region/province/cognomi non mescolati, attribuzione CC BY 4.0, `populationReferenceYear:null`/provincia assente non falsificati, revisione indipendente dei metadati e versioni; non affermare accuratezza geografica/demografica nel 1979. Verificare API world e nuove carriere, idempotenza, real data vs QA, tests/HTML legacy/salvataggi. REPORT con SHA e limiti.
**Gate futuro FULLSCREEN F01:** vero `requestFullscreen` via gesto, `exitFullscreen`, eventi e fallback, Chrome/Chromium su vero gioco HTTP, 4 viewport × safe area sì/no × mouse/touch, controlli44px, campo16:9, pannello stampa, TERMINA GARA, passaggio carriera, 119 Node. Non confondere simulazione CSS con Fullscreen API reale; Android fisico dichiarato separatamente.
**Dopo D01:** non dare per implementato il selettore delle località fino a UI11 F02 su successiva PR. NO MERGE fino a revisione e autorizzazione esplicita dell'utente. Non aprire audit sulla vecchia #48 già MERGED.

---

## ARCHIVIO ISTRUZIONI PRECEDENTI

# ORONZO — COERENTIZZATORE 00 · M01 R09C CONCLUSO / STANDBY

**STATO: `STANDBY_POST_MERGE` — 8 novembre 2026.** Il [REPORT-R09C-M01](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r09c-m01/oronzo/coordination/coerentizzatore/REPORT-R09C-M01.md) ha dato **PASS indipendente** sull'HEAD `8c82cd0aa1cd856c8afc2964acae4ff57f5da93d` e raccomandato merge. L'utente ha autorizzato espressamente il merge della sola [PR #48](https://github.com/CzekUns/cercax/pull/48), ora **MERGED** nel commit `1bb8815b967dc4171fc644713918ad97f1cd95fb`. GitHub post-merge: blob CSS di `main` identico a quello auditato `0f3569d37c07f2153a4bf8ca28149ded60f2956e`; nessuna alterazione HTML/JS del runtime. [PR documentale #51](https://github.com/CzekUns/cercax/pull/51) rimane OPEN e **NON MERGED**.

**Nessun incarico ulteriore allo 00.** Prova Android fisico non ancora effettuata; i 119 test Node e i percorsi Chromium sono stati verificati indipendentemente **prima del merge** sul preciso HEAD; non rieseguiti nel container Agente10 post-merge per blocco DNS git clone. Non dichiarare ulteriori certificazioni. Attendere nuove istruzioni dell'orchestratore/utente, non effettuare merge di altre PR automaticamente.

---

## ARCHIVIO — REQUEST precedenti
# ORONZO — COERENTIZZATORE 00 · R09C-M01 PASS / GATE CONCLUSO

**STATO: `AUDIT_PASS_WAIT_MERGE_AUTHORIZATION` — 8 novembre 2026.** [REPORT-R09C-M01](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r09c-m01/oronzo/coordination/coerentizzatore/REPORT-R09C-M01.md) consegnato nella [PR documentale #51](https://github.com/CzekUns/cercax/pull/51): **PASS** sul solo HEAD [PR #48](https://github.com/CzekUns/cercax/pull/48) `8c82cd0aa1cd856c8afc2964acae4ff57f5da93d`. Checkout Git reale; browser Chromium via HTTP e localStorage, non fixture. Esiti indipendenti: **119/119 Node**, **16/16 percorsi**, **336/336** alternative conferenze e altre **42/42** lunghe, CTA TERMINA 44px, formato canvas16:9, safe area, font, navigazione, salvataggi e game-over verificati nello scope. Nessuna regressione rilevata nell'audit. Android fisico e 900 secondi 1× non ancora verificati.

**Nessuna altra revisione R09 richiesta sullo stesso HEAD. Nessun merge automatico.** Il revisore ha raccomandato il merge ma l'Agente10 deve ottenere **autorizzazione esplicita dell'utente** e verificare che l'HEAD #48 non sia cambiato. La PR #51 è **documentale**, non è oggetto di merge automatico né autorizzato con l'eventuale merge della #48. Se merge autorizzato, controllare main e test essenziali postmerge; altrimenti restare in attesa. Non assegnare altri lavori a 00.

---

## ARCHIVIO — REQUEST precedenti
# ORONZO — COERENTIZZATORE 00 · R09C-M01 READY, AUDIT FINALE #48

**STATO: `READY_R09C_M01` — 8 novembre 2026.** L'11 ha completato sulla **stessa PR #48**, OPEN/NOT MERGED, il rilievo **R09B-M01-2** (risposte conferenza stampa tagliate): **HEAD da verificare `8c82cd0aa1cd856c8afc2964acae4ff57f5da93d`**. Ultimo [REPORT11](https://github.com/CzekUns/cercax/blob/agent/oronzo-11-mobile-m01/oronzo/coordination/11-mobile-ui/REPORT.md) dichiara pannello risposte scrollabile (solo CSS), 240/240 attivazioni opzioni opening, 96/96 postmatch, CTA TERMINA GARA 44px in 16/16 configurazioni, 119/119 Node e16/16 percorsi browser HTTP. **Prove dell'autore, non audit indipendente.**

**Prerequisito non negoziabile:** nuova chat Work revisore00 realmente separata da autore11, con accesso al **checkout autentico e server HTTP localhost Chromium**. Il precedente [REPORT-R09B](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r09b-m01-20261108/oronzo/coordination/coerentizzatore/REPORT-R09B-M01.md) usava una fixture e **non ha certificato il gioco**. Se non possibile eseguire il gioco reale, dichiarare esplicitamente NON CERTIFICATO/NO MERGE, non riusare fixture come prova.

**Obiettivi R09C:** leggere REQUEST/NEXT11/REPORT11 e diff HEAD48; test prima/dopo e safe-area `{top:0,left:24,right:12,bottom:16}` alle 4 viewport 640×360,800×360,844×390,960×400, desktop/touch; controllare effettivi44px e tap per **TERMINA GARA** e **tutte le risposte** opening e postmatch dopo gesto di scroll esplicito, hit-test e clipping ancestrale, indicazione scroll comprensibile, font invariati, shell full width, canvas16:9, nessuna sovrapposizione con header/nav. Eseguire indipendentemente suite Node flow/career/coach+renderer (attesi97+22) e percorso Chromium HTTP autentico avatar/20 offerte/stampa5/rosa16/classifica16/formation11+GK/match22/2Q post/save-load/reload/gameover/geography_required, legacy e demo. Documentare Android fisico e 900s1× non verificati se è il caso.

**Consegna:** branch documentale `REPORT-R09C-M01.md`, SHA e prove **proprie**, PASS/NEEDS CHANGES/NO CERTIFICATION motivato. **Non fare merge nemmeno con PASS** senza nuova autorizzazione dell'utente. Non modificare gioco/NEXT/altri sistemi e non attivare M02/M03/Layout Studio.

---

## ARCHIVIO — REQUEST precedenti
# ORONZO — COERENTIZZATORE 00 · POST R09B-M01 · ATTESA FIX CONFERENZA E AUDIT REAL-RUNTIME

**STATO: `WAIT_FOR_11_R09B_M01_2` — 8 novembre 2026.** [PR #48](https://github.com/CzekUns/cercax/pull/48) OPEN, HEAD al momento di assegnazione `58c7c65506f74f012b17b099583e96ee380f8db5`. [REPORT-R09B-M01](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r09b-m01-20261108/oronzo/coordination/coerentizzatore/REPORT-R09B-M01.md) in branch documentale conclude **NON CERTIFICATO / NO MERGE**: solo confronto blob CSS e **96 prove su fixture**, non test del gioco via HTTP né suite Node reali. Diff R09-M01-1 conforme ma 44px sul runtime non indipendentemente verificato.

**Altra criticità da risolvere/escludere:** il REPORT11 riporta a 640×360 con safe area left24/right12/bottom16 la 3ª risposta della 3ª conferenza iniziale parzialmente visibile **39,15625px/44**; la fixture 00 ne dimostra solo la plausibilità, **non** ne prova i pixel nel runtime e **non dimostra** che esistesse già nel main pre-M01. Agente11 deve fare verifica reale e, se riprodotto, fix CSS su **stessa #48** `R09B-M01-2`, senza alterare TERMINA GARA, safe-area, larghezza landscape, font, canvas o gameplay. Vedi `11-mobile-ui/NEXT.md`.

**Prossimo audit soltanto su NUOVO HEAD #48 dopo la consegna11:**
1. Revisore 00 in **chat Work separata dall'autore**; leggere REQUEST aggiornato, NEXT11/REPORT11, REPORT-R09-M01 e REPORT-R09B-M01, PR reale e file source.
2. **Prerequisito di certificazione:** accesso a checkout reale dei sorgenti del gioco in ambiente utilizzabile e a Chromium con **server HTTP statico locale e localStorage nativo**. Se questo manca, segnalare il blocco senza promuovere la fixture a prova completa. Preferire Work con cloud computer/browser abilitati e accesso repository autenticato; se non possibile, usare una consegna QA/checkout riproducibile fornita dall'11 senza trattarne gli screenshot come prova.
3. Verifica geometria effettiva (clipping antenati/hit-test/tap) di **TERMINA GARA e di TUTTE le risposte delle conferenze**, a 640×360,800×360,844×390,960×400 con/senza insets top0 left24 right12 bottom16 × mouse e touch; qualunque controllo attivo ≥44px quando raggiunto anche dopo scroll touch. Controllare layout pieno, proporzioni campo 16:9, font, banner, navbar e orientamento.
4. Eseguire indipendentemente regressioni Node (97 flow/carriera/coach e 22 renderer, salvo cambi nella suite) e percorso completo E2E: avatar/offerte/presidente/stampa/ufficio/rosa16/classifica16/formazione11/Engine06/risultato/postpress/save+load/gameover/geography_required; test legati a main/HTML/JS reali, non harness synthetic. Distinguere Android fisico non testato.
5. Consegnare rapporto distinto `REPORT-R09C-M01.md` su branch **solo documentale** con SHA del nuovo HEAD, screenshot propri, metriche e PASS/NEEDS CHANGES/non certificato. **NO MERGE** salvo nuova autorizzazione esplicita dell'utente. Nessun intervento su altre PR o sviluppo camera/comandi/layout editor.

---

## ARCHIVIO — REQUEST precedenti
# ORONZO — COERENTIZZATORE 00 · AUDIT R09B-M01 ATTIVO · PR #48

**STATO: `READY_R09B_M01` — 8 novembre 2026.** L'Agente 11 ha completato la correzione `R09-M01-1` sulla **stessa PR #48**, ora OPEN/NOT MERGED, HEAD verificato **`58c7c65506f74f012b17b099583e96ee380f8db5`**. Commit sorgente/QA fix `efd42f14ef7c6c9949d2bfe936a64e04d4b6a47e`. Il [REPORT11](https://github.com/CzekUns/cercax/blob/agent/oronzo-11-mobile-m01/oronzo/coordination/11-mobile-ui/REPORT.md) dichiara CSS `#oronzo-r03 .runtime-match-panel{padding-top:1px}`, 44px visibili per TERMINA GARA in **16/16** configurazioni (640×360/800×360/844×390/960×400 × con/senza safe-area × desktop/touch), Node **97+22 PASS**, Chromium HTTP/true localStorage e percorso completo. Sono affermazioni dell'autore, da verificare in proprio.

**Indipendenza obbligatoria:** avviare questo incarico in una **nuova chat Work 00**, diversa sia dalla chat dell'Agente11 sia da quella che ha pubblicato R09-M01 (che ha dichiarato partecipazione precedente allo sviluppo). Leggere per intero REQUEST, REPORT11, [REPORT-R09-M01](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r09-m01/oronzo/coordination/coerentizzatore/REPORT-R09-M01.md) e diff/commit reali di #48. Nessun riuso di screenshot o risultati come prova indipendente.

**Controlli R09B-M01:**
1. Controlla invariati font/target e proporzioni del canvas 16:9, safe area su tutti i lati, riempimento landscape della larghezza; scope CSS minimo, nessun JS/sistema/dato/salvataggio toccato.
2. Test autonomo HTTP statico + Chromium in **4 viewport × con/senza inset `{top:0,left:24,right:12,bottom:16}` × mouse/touch**. Misura `[data-action="finish-qa"]` con intersezione viewport+antenati overflow, richiedi **≥44px visibili e realmente cliccabili/toccabili senza autoscroll**, prova pulsanti vicini, screenshot propri, orientamento e resize.
3. Regredisci vera carriera: avatar/20 offerte/5Q stampa/ufficio/rosa16/classifica16/11+1GK/Engine06 fulltime/2Q dopo/advance/save+load/localStorage/reload, gameover/new career, `geography_required` e avviso demo sintetica. Suite Node flow/career/coach + renderer, legacy/link; documenta l'eventuale 404 cutscene facoltativo e Android fisico NON verificato.
4. **Rilievo separato preesistente segnalato dall'11:** a **640×360 con safe-area**, terza risposta della **domanda iniziale 3** in conferenza stampa visibile **39,15625px su 44** (mouse/touch). L'autore riporta geometria identica prima/dopo il fix e prima della correzione R09-M01-1. **Riprodurre e confrontare con main/base CSS autonomamente**: se confermato, indicare esattamente se è preesistente, sua gravità e se viola il gate touch generale. **Non nasconderlo, non correggerlo in audit, non dare un PASS generale della geometria se persiste**. Puoi indicare `R09-M01-1 PASS` ma `MERGE BLOCKED / NEW FIX REQUIRED` se il requisito generale 44px resta insoddisfatto; spiegare chiaramente la decisione.
5. Consegnare `oronzo/coordination/coerentizzatore/REPORT-R09B-M01.md` in branch **solo documentale** e, se utile, PR audit separata, con nuovo HEAD, misure, screenshot e giudizio PASS / NEEDS CHANGES. **Mai merge senza nuova autorizzazione espressa dell'utente.** Non lavorare su PR #28, UI Studio, comandi coach, altre PR o NEXT.

---

## ARCHIVIO — REQUEST precedenti
# ORONZO — COERENTIZZATORE 00 · R09B-M01 DOPO FIX11, NUOVA CHAT INDIPENDENTE

**STATO: `WAIT_FOR_11_FIX` — 8 novembre 2026.** Il [REPORT-R09-M01](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r09-m01/oronzo/coordination/coerentizzatore/REPORT-R09-M01.md) su [PR #48](https://github.com/CzekUns/cercax/pull/48) HEAD `6e72486607405d06d9a5ba8cac8d00a002ea5da8` ha dato **NEEDS CHANGES** per `R09-M01-1`: safe-area left24/right12/bottom16 rende `TERMINA GARA` effettivamente visibile **42px** anziché 44 a 640×360, 800×360 e 960×400 (mouse e touch). PR #49 documentale con prove; niente merge. L'autore dichiara 119/119 Node e Chromium 16/16 standard, ma il gate safe-area è fallito.

**Nota sull'indipendenza:** la chat che ha prodotto R09-M01 dichiara di avere precedentemente realizzato M01. Il prossimo controllo DEVE essere eseguito in una **nuova chat Work dedicata a ORONZO-AGENT-00**, distinta dalla chat autrice dell'implementazione e da quella che ha prodotto R09; i risultati pregressi sono riferimenti, non prove da riciclare. Non avviare controllo del vecchio HEAD come se fosse nuovo.

## Audit R09B-M01 da eseguire *solo dopo* che Agente11 aggiorna la STESSA PR #48
1. Verificare live il nuovo HEAD #48, il nuovo REPORT11 e il diff CSS; confrontare con l'HEAD bocciato e il REPORT R09-M01. Nessuna modifica a motore, renderer, JS, regole, storia o font. M01 rimane intervento mirato layout.
2. Ricostruire da zero su HTTP statico + Chromium indipendente. A 640×360, 800×360, 844×390, 960×400, desktop e touch, verificare CON/SENZA safe-area `{top:0,left:24,right:12,bottom:16}`: CTA finale `[data-action="finish-qa"]` **≥44px visibili e attivabili**, e tutti i pulsanti essenziali senza tagli. Misura intersezione con tutti gli antenati overflow, `elementFromPoint` al centro, click/tap coordinate senza auto-scroll; documentare misure screenshot propri. Controllare anche toast, barre, banner QA e gesture.
3. Confronto prima/dopo: stage sfrutta tutta larghezza landscape disponibile esclusi i safe-area, campo canvas resta uniforme 16:9, nessun font ridotto; verificate portrait→landscape, resize e browser chrome/safe-area emulati. Non presentare emulazione come Android fisico.
4. Regressione percorso vero: avatar, 20 offerte, 5 conferenze, ufficio, roster e classifica 16/16, formazione 11+1GK, Engine06 fulltime, due postmatch, advance singolo, save/load HTTP/localStorage autentico, geography_required, gameover/new career, link legacy/demo. Node flow/career/coach (97 storici) + renderer (22 storici). Segnalare il 404 cutscene noto se presente.
5. Pubblicare `oronzo/coordination/coerentizzatore/REPORT-R09B-M01.md` in un **branch documentale distinto**, con HEAD e prove proprie, decisione **PASS** o **NEEDS CHANGES**. **Non effettuare merge anche se PASS**: attendere richiesta espressa dell'utente. Nessun lavoro su PR #28, Layout Studio, camera, coach controls o altri agenti.

**Non cambiare REQUEST/NEXT e non modificare i sorgenti del gioco**; l'00 valuta soltanto #48.

---

## ARCHIVIO — REQUEST precedenti
# ORONZO — AGENTE 00 · AUDIT INDIPENDENTE M01 / R09 — SOLO PR #48

**STATO: `READY` — 8 novembre 2026.** La [PR #48](https://github.com/CzekUns/cercax/pull/48) di **ORONZO-AGENT-11** è OPEN, NOT MERGED. **HEAD preciso da validare:** `6e72486607405d06d9a5ba8cac8d00a002ea5da8`; branch `agent/oronzo-11-mobile-m01`. L'11 ha consegnato [REPORT](https://github.com/CzekUns/cercax/blob/agent/oronzo-11-mobile-m01/oronzo/coordination/11-mobile-ui/REPORT.md), evidenze `oronzo/assets/ui/qa/m01/` e strumenti Node QA; asserisce **8 righe CSS solo `career-r03.css`**, 97/97 flow/career/coach + 22/22 renderer e 8+8 percorsi Chromium HTTP (640×360, 800×360, 844×390, 960×400, desktop+touch). **Non assumere PASS dall'autore.**

## Scopo e attività dell'audit 00 — limitato a PR #48
1. Leggere integralmente REQUEST presente, REPORT11 sulla PR, NEXT11 e storia 03/R08B pertinente, confrontare diff e HEAD. Verificare che la modifica runtime sia SOLO in `oronzo/assets/ui/career-r03.css`, CSS sotto media query landscape, con .site safe-area e `#oronzo-r03` width/height 100%, senza alterazione di JS, gameplay, renderer, dati, font, target, UI demo R02 o legacy. Gli altri file devono essere report e QA.
2. **Ricostruire e testare in proprio** main + PR #48 con server **HTTP reale e Chromium** (niente fiducia automatica nei risultati dell'autore). Capture + misure native delle stesse quattro viewport (640×360, 800×360, 844×390, 960×400), desktop e touch. **Prima/dopo**: stage 640→640, 640→800, ~693→844, ~711→960 CSS px, a parità di altezza; zero bande laterali inutilizzate salvo safe-area. Verificare le misure realmente, non copiare le tabelle.
3. **Geometria e interazione**: browser bars/resize, portrait→landscape, cutout/safe-area quando simulabile; `#oronzo-r03` interno alla viewport/padding; assenza overflow che nasconda stage; canvas della partita ancora rapporto 16:9 effettivo e non deformato, tutte le linee di campo/sprite proporzionati, distinzione tra maggior larghezza dello stage e ingrandimento reale del canvas (NON obbligatorio in M01). Safe-area fittizia non sostituisce Android fisico.
4. **Leggibilità & touch**: nessuna ulteriore riduzione dimensioni font; pannelli, info, toast e banner di QA sempre visibili; CTA e select **≥44px realmente visibili** considerando intersezioni con tutti gli antenati overflow; hit-test al centro tramite `elementFromPoint` e tap alle coordinate senza Playwright locator autoscroll. Ispezionare screenshot propri Ufficio, Partita, Avatar, Offerte, Stampa, Rosa, Classifica, a tutte le viewport. Nessun ostacolo alle gesture scroll.
5. **Regressioni runtime reali**: nuova carriera/8 avatar/20 offerte dal controller07/5 conferenze stampa/hub/16 rosa+schede+allenamento consultivo/classifica16/formazione11+1 GK/MatchEngine06 risultato+2 risposte post/avanzamento/save-load vero su HTTP/reload; `geography_required` senza dati e QA sintetico con banner, nuovo giro dopo gameover; link homepage legacy e Rapida1985, demo R02 invariati. Non inventare risultati o dati non visti.
6. Eseguire realmente Node suite `node --test oronzo/app/flow/tests/*.mjs oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js` e `node --test oronzo/systems/match-view/*.test.mjs`, confermare eventuale 97+22; controller/save/renderer invariati nei blob. Documentare eccezioni e 404 opzionale cutscene, se presente; non dichiarare console rete pulita se non lo è.
7. Consegnare **`oronzo/coordination/coerentizzatore/REPORT-R09-M01.md`** in **branch documentale di audit separato** (nuova PR documentale opzionale), con SHA HEAD, PASS/FAIL specifici, screenshot propri, numeri prima/dopo, limiti e problemi esatti se presenti.

**DECISIONE:** se qualsiasi gate fallisce: **NEEDS CHANGES / NO MERGE**, inviare correzioni circoscritte all'Agente11 sulla stessa PR #48. Se tutto passa: **PASS / merge raccomandato, ma NON effettuare merge senza nuova autorizzazione esplicita dell'utente**. Non toccare PR #28 camera, i sistemi di altri agenti o NEXT; non avviare M02/M03/M04. Android fisico e preview pubblica della PR non certificati da Chromium emulato.

---

## ARCHIVIO — REQUEST precedenti
# ORONZO — AGENTE 00 · GATE R08B PR #43, ORA READY

**Stato attuale: `READY_R08B` — 8 novembre 2026.** L'Agente 03 ha consegnato le quattro correzioni R08 **sulla stessa PR #43**; verificato live HEAD `4d00fb5bb6f05465eec30e1b8d997865579d47d8`, PR OPEN/NOT MERGED. Nel REPORT03/PR43 sono dichiarati 97/97 test flow-carriera-coach, 22/22 renderer, 6/6 Chromium144 con `route.fulfill`, 15 screenshot e tutte le quattro correzioni. **Questi sono risultati dell'Agente03, non ancora un PASS indipendente.**

**Incarico R08B da eseguire subito dal Coerentizzatore 00, limitato alla PR #43**, senza altri moduli/PR salvo regressioni legate al runtime:
1. Leggere [REPORT-R08](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r08/oronzo/coordination/coerentizzatore/REPORT-R08.md), nuovo REPORT03 nella PR #43, diff e HEAD attuale. Usare **Chromium reale su server HTTP statico**, se disponibile come durante R08; non fidarsi degli screenshot e test dell'autore via `route.fulfill`. Desktop + touch 640×360/800×360/844×390, asset reali, localStorage reale e reload.
2. R08-1: verificare che **16/16 giocatori** siano presenti e selezionabili, incluso il 16°, che schede Rosa/Allenamento consumino **`getRosterPlayer/getTrainingPlayer` autentiche**, e che Allenamento sia raggiungibile, con modifiche disabilitate se non esiste API autorizzata. Non dichiarare che l'allenamento attivo sia implementato.
3. R08-2: classifica **16/16 righe**, posizioni 13–16 raggiungibili con gesture touch, club controllato identificabile, ordine e punti dalle API reali.
4. R08-3: bottone INDIETRO/20 OFFERTE in avatar, TERMINA GARA QA nel match, select, righe formazione/rosa e controlli hub **almeno 44px effettivamente visibili**: intersecare bounding box con TUTTI gli antenati overflow e viewport; hit-test/tap al centro senza Playwright auto-scroll. Misurare a tutte le viewport e provare screenshot.
5. R08-4: forzare `gameOver` solo con evento Agent09 nel test, nuovo avvio senza refresh, nuovo `newGame` con coach distinto, salvataggio preesistente non cancellato/sovrascritto silenziosamente e ricaricabile.
6. Regressione: sequenza 1979 con 20 offerte/5Q/ingaggio/formazione/MatchEngine06 fulltime/2Q/morale/classifica/advanceMatchday idempotente/save/load con browser autentico, rifiuto `geography_required` atomico senza catalogo, banner “DEMO TECNICA — LOCALITÀ SINTETICHE” quando fixture QA. Test Node flow/career/coach (storicamente 97) + MatchView (storicamente 22) sul **nuovo HEAD**. Annotare il 404 cutscene facoltativo. Preservare home e partita rapida legacy.
7. Consegnare `REPORT-R08B.md` in branch audit separato con SHA, metriche, evidenze e limiti. **Se un gate fallisce: NO MERGE e fix esatti ad Agente03 sulla stessa PR #43. Se tutti i gate passano, **non mergiare ancora: consegna PASS e raccomandazione di merge**, poi attendi **un nuovo mandato esplicito dell'utente** per mergiare la PR #43 e verificare main. Nessuna altra PR, nessun lavoro su codice del 03 o main al di fuori dell'eventuale merge.

---

## ARCHIVIO — REQUEST R08B in attesa di consegna e audit precedenti
# ORONZO — COERENTIZZATORE 00 · PROSSIMO GATE R08B PR #43, DOPO FIX03

**Stato: `WAIT_FOR_03` — non eseguire ancora.** La verifica indipendente [R08](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r08/oronzo/coordination/coerentizzatore/REPORT-R08.md) ha dato **NEEDS CHANGES / NO MERGE** sulla PR #43 (HEAD auditato `8977305d78d1ddf161ac72b38b41973fe4311db4`). R08 ha verificato 97/97 test carriera, 22/22 renderer, 6/6 Chromium HTTP vero con percorso dalla prima gara al salvataggio/reload, ma quattro problemi UI: rosa 12/16 senza schede/Allenamento, classifica 12/16, pulsanti realmente visibili 33–34px e controlli 29–34px a 360h, game over senza nuova carriera. **Nessun merge autorizzato o realizzato.**

**Dopo che l'Agente 03 aggiorna LA STESSA PR #43:** confrontare HEAD reale, REPORT03 e NEXT03 aggiornato; ripetere in Chromium HTTP reale **640×360, 800×360, 844×390** desktop+touch le verifiche mirate e controllo regressioni:
1. Rosa e schede giocatori tramite API reali `getRosterPlayer/getTrainingPlayer`, accessibilità sedicesimo giocatore e sezione Allenamento consultabile (non assegnare PASS ad allenamento attivo se manca suo contratto).
2. Classifica con tutte le 16 righe del sistema, scroll touch per posizioni 13–16; nessuna squadra mancante.
3. Target controlli ≥44px **effettivamente visibili** dopo clipping antenati, hit-test al centro e gesture reali senza scroll automatico; niente CTA nascoste a 360px.
4. Da Coach09 morale 0 → `gameOver`, nuova carriera senza refresh, vecchi salvataggi non cancellati e vecchio coach non riattivato.
5. End-to-end reale UI (1979 avatar → 20 offerte → stampa 5Q → engine06 → stampa 2Q → classifica/morale → save/reload), dati geografici QA dichiaratamente sintetici, ramo produzione senza catalogo rifiuta firma atomicamente. Almeno le suite Node flow/career/coach e renderer22. Documentare limitazioni (Android fisico/hosting non testati; eventuale 404 opzionale).

**Rapporto R08B** in branch documentale dedicato, con SHA, asset HTTP, screenshot, test PASS/FAIL. Se qualsiasi punto critico fallisce, **NO MERGE** e fix owner 03 puntuali. Se tutto passa, **merge #43 soltanto dietro esplicita autorizzazione dell'utente nella chat 00**, e verifica main dopo merge. Nessuna review altre PR, nessuna modifica al codice del 03.

---

## ARCHIVIO — REQUEST precedenti
# ORONZO — REQUEST ATTUALE 00 · ESEGUIRE AUDIT R07B PR #33

**Stato: `READY` (7 novembre 2026).** Il 03 ha aggiornato la **stessa PR #33**, nuovo HEAD verificato `1e41c8716798612863aa0fc2327c6ee09deeb82d` (prima `c38be80c392939d042dd998e6d1bf655c259804d`). Il suo REPORT sul branch dichiara due fix R07-1/R07-2 con 6/6 test Chromium e screenshot, ma non ha potuto verificare HTTP reale; il precedente [REPORT-R07](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r07/oronzo/coordination/coerentizzatore/REPORT-R07.md) riproduceva due difetti in Chromium 149 via HTTP statico. **Incarico: verificare autonomamente R07B ora.**

1. Rileggere HEAD reale #33 e REPORT03. Ricostruire browser Chromium con veri HTML/CSS/JS/10 PNG **via server HTTP** dove possibile. Ripetere almeno 640×360, 800×360, 844×390 in desktop+touch; testare senza auto-scroll centrale il tasto CARICA PARTITA (44px visibili, hit corretto, clic funzionante, hint visibile), e dopo 5 Q stampa toast ancora presente con tap immediato su PROSSIMA GIORNATA (niente coperture, navigazione corretta) oltre a presidente e UMORE TIFOSI. Prove grafiche personalmente, senza fidarsi di screenshot già presenti. Regredire 8 avatar, 20 offerte, 5 Q, menu, switch camera demo, 10 PNG, console. Non dichiarare Android fisico testato.
2. Consegnare `oronzo/coordination/coerentizzatore/REPORT-R07B.md` in branch documentale separato, con risultati, SHA e screenshot/limitazioni, e non modificare codice 03.
3. **Se fallisce un qualsiasi gate: NO MERGE**, segnala file/selettore/condizione esatti. **Se passa: merge #33 solo dietro autorizzazione esplicita dell'utente** e verifica main dopo merge. Non iniziare runtime del 03 e non toccare altre PR.

---

## ARCHIVIO — REQUEST R07B PRE-CONSEGNA
# ORONZO — REQUEST ATTUALE COERENTIZZATORE 00 · R07B DOPO FIX AGENTE 03

**STATO: `WAIT_FOR_03` — NON avviare review ora.** L'audit [R07](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r07/oronzo/coordination/coerentizzatore/REPORT-R07.md) della sola PR #33 (HEAD `c38be80c392939d042dd998e6d1bf655c259804d`) ha dato **NEEDS CHANGES / NO MERGE**. Il NEXT03 su main ora assegna **R07-1 clipping CARICA PARTITA a 360px** e **R07-2 toast che copre/intercetta touch**. Gli altri test funzionali/asset/HTTP/Chromium sono passati nel gate R07.

**Dopo che il 03 ha modificato la stessa #33**, controllare HEAD aggiornato e REPORT03, verificare le sole due correzioni e regressioni in **Chromium reale con file PNG/HTML/CSS/JS via HTTP** alle risoluzioni 640×360, 800×360, 844×390 in emulazione touch:
- pulsanti Nuova/Carica interi e realmente tappabili (hit-test centro senza auto-scroll), testo e hint non tagliati;
- tap immediato dopo 5 risposte per PROSSIMA GIORNATA e menu funzionanti, toast senza occlusioni e senza intercettazioni;
- nessuna regressione su 8 avatar, 20 offerte/scroll, navigazione, 5 domande, full/TV demo, asset e console.
Creare `REPORT-R07B.md` con prove, screenshot e SHA. Se uno dei gate fallisce, **no merge** e fix precisi al 03. Se tutti PASS, **solo con autorizzazione esplicita dell'utente in quella chat**, può mergiare #33 e verificare main. Non modificare altre PR. Dopo gate R07B e merge #33 il 10 attiva runtime R03 del 03 in nuova PR: prima partita 1979 su smartphone, con modello geografico sintetico *solo se etichettato demo*.

---

## ARCHIVIO — richieste prima di R07B
# ORONZO — REQUEST ATTUALE AGENTE 00: R07 · GATE KIT UI #33 PER PRIMO PLAYTEST

**Stato: READY · 7 novembre 2026.** **Unico obiettivo:** collaudare la [PR #33](https://github.com/CzekUns/cercax/pull/33) di Agente 03 ed esprimere giudizio sulla qualità e riusabilità del kit UI 1979 per **il primo playtest mobile**. PR #39 e #38 sono già **MERGED** (`cf4a8bc0046cc73cf9995f9dafb9a39a94c15626` e `12fe01ff53a8a366dfa35271aa21cb3244ee2c10`); [R06B](https://github.com/CzekUns/cercax/blob/audit/oronzo-r06b-gate/oronzo/coordination/coerentizzatore/REPORT-R06B.md) documenta **97/97 Node PASS su main**. Non riaprire R06 e non riesaminare tutte le PR.

## Procedura e gate #33
1. Leggere main attuale `PROTOCOL.md`, `GAME-VISION-v02.md`, `10-orchestrator/CONTRACT-v02.md`, `03-ui/NEXT.md`, il REPORT 03 sulla PR #33, `oronzo/assets/ui/INTEGRATION-R02.md`, manifest, codice della demo e screenshot QA. Verificare HEAD live di #33 (ultimo noto `c38be80c392939d042dd998e6d1bf655c259804d`) e diff/ambito esclusivamente `oronzo/assets/ui/` + REPORT03.
2. Lanciare i test del kit: `node --check oronzo/assets/ui/demo-v02.js`, `python oronzo/assets/ui/qa/check_assets.py`, `python oronzo/assets/ui/qa/run_browser_r04.py` o equivalente Chromium reale. Caricare CSS, JS e PNG reali in browser tramite **HTTP statico reale se disponibile**, e controllare effettiva decodifica delle immagini; se l'ambiente blocca HTTP distinguere i test `route.fulfill` dal test di deploy non eseguito. Verificare desktop/mobile emulato e touch, soprattutto risoluzioni **640×360, 800×360, 844×390**.
3. Verificare attraverso screenshot e DOM: 8 avatar con 4 parametri dinamici, 20 offerte scrollabili, schermata presidente, 5 domande, hub, rosa/allenamento, area partita e switch camera nella sola demo; bottoni e hit area ≥44px dove appropriato; testo 8–9px davvero leggibile, contrasto, assenza di clipping, toast sovrapposti, risposte al touch, errori console; kit coerente 1990–95. **Esplicitare** che placeholder 22 marker, numeri e testo demo NON sono gioco vero. Se arte illeggibile o incompletezza critica, nominare i file/selector da correggere a 03 su stessa #33.
4. Controllare schema manifest, ID DOM `data-action` e API `OronzoUIKitV02.createApp(root,{data,onIntent})` per uso da **nuovo runtime 03**: aggiornamenti dinamici senza dati hard-coded; il kit deve poter visualizzare `getStateForUI` dal vero 07, ma **non** attribuire a #33 integrazione già funzionante.
5. **Nessun gate secondario** su PR #28/#29/#12/#31/#35. Le telecamere e sprite definitivi sono miglioramenti post-primo-playtest; primo UI runtime può usare solo asset già presenti su main, senza dire che #28/#29 sono integrate. Prima release demo può usare `tests/qa-geography.mjs` solo con etichetta esplicita **“Demo tecnica — località sintetiche”** e senza affermazioni su ISTAT; normale gioco senza dataset restituisce `geography_required`.
6. Rapporto [`oronzo/coordination/coerentizzatore/REPORT-R07.md`](./REPORT-R07.md), branch audit separato, con SHA #33, prove reali, screenshot/risorse testate, risultati e blocchi. Se un gate fallisce, **NO MERGE**, richiedere puntuale fix 03 sulla PR #33. Se tutto PASS, **merge #33 soltanto se l'utente autorizza esplicitamente nella chat 00** (nuovo mandato, il R06B non vale); dopo merge, verificare main e conservare il report nel ramo audit. Non avviare da te sviluppo del runtime.

## Fase immediatamente successiva dopo MERGE #33
L'Agente 10 attiverà il **NEXT R03 runtime del 03** su branch NUOVO da main, con scope esteso a `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html`, `oronzo/assets/ui/` per integration-only e proprio REPORT. Il 03 consuma `oronzo/app/flow/controller.js` e motore 06/renderer 05 presenti su main, non implementa nuove regole. Obiettivo: **prima partita 1979 sul telefono con risultato, morale, classifica e salvataggio**, non una demo con pulsanti finti.

---

## ARCHIVIO — richieste precedenti, completate o superate
# ORONZO — PREPARAZIONE GATE R06B DOPO CONSEGNA FIX 07 · SOLO #38/#39

**Stato: `WAIT_FOR_07`, non eseguire ora.** Su main il NEXT 07 contiene il fix R06-1/2/3 richiesto dopo [R06](https://github.com/CzekUns/cercax/blob/audit/oronzo-r06-38-39/oronzo/coordination/coerentizzatore/REPORT-R06.md). L'ultimo CI [run 42381672625](https://github.com/CzekUns/cercax/actions/runs/42381672625) certifica **91 PASS suite** ma **un test E2E FAIL** per geografia mancante, e wiring API 09 non completo. Non dichiarare attualmente gate verde.

**Quando il 07 avrà modificato la PR #38**: leggere HEAD live #38 e #39, REPORT07 aggiornato e contratto `MORALE-R03.md` del 09; checkout/sandbox combinata main+#39+#38; eseguire suite Node flow, career, coach e demo completa; creare/eseguire E2E con **vere** API 09/Copy04/Match06 e dati geografici verificabili di test, non stub. Controllare no-region path `geography_required` senza mutazione, offerta e risposta stampa con effetto applicato una sola volta, saldo e morale in save/load, game-over, due stagioni, legacy 1985, motore goal e avanzamento.
**Se fallisce:** niente merge; owner e correzione puntuale. **Se tutto passa:** rapporto R06B con test/SHA, e **solo se l'utente conferisce nuova autorizzazione specifica**, merge nell'ordine dipendenze **#39 poi #38**, uno per volta, verificando main e regressioni dopo ogni passaggio. Non lavorare su #28/#29/#31/#33/#35/cutscene, nessun nuovo round.

---

## ARCHIVIO — audit R06 originale
# ORONZO — REQUEST ATTUALE AGENTE 00 · AUDIT R06 MIRATO PR #38 + #39

**Stato: READY per attivazione su chat Agente 00, 7 novembre 2026.** Le PR precedenti #30 e #32 sono già MERGED e non vanno riesaminate come incarico a sé. In questa sessione **nessun merge autorizzato automaticamente**. Nuove PR su GitHub:
- [#38](https://github.com/CzekUns/cercax/pull/38) — 07 game-flow 1979, HEAD verificato `94538ae97b3f7423a7d1e691a2e493524556142f`, **OPEN**.
- [#39](https://github.com/CzekUns/cercax/pull/39) — 09 CoachV2/morale/offerte/stampa, HEAD verificato `80df15139d37c4ee36103001d6a24528037daed4`, **OPEN**.

## Obiettivo del controllo
Certificare o respingere la **compatibilità reale fra #38 e #39**, prima del loro merge e del mandato UI 03. Non usare solo le verifiche V8 isolate dichiarate dai due autori. Non allargare review a tutte le PR.

1. Leggere entrambi i REPORT e le due documentazioni `oronzo/app/flow/README.md` e `oronzo/systems/coach-club/MORALE-R03.md`. Rileggere HEAD attuali all'avvio; il main potrebbe essere avanzato. Preparare checkout/sandbox combinato main + #38 + #39, byte e dipendenze verificati.
2. Eseguire **Node nativo** completo: `node --test oronzo/app/flow/tests/*.mjs`; `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js`; ed esecuzione reale `node oronzo/app/flow/demo-r03.mjs`. Eseguire anche test end-to-end mirato del **controller reale + Coach09 reale + Copy04 reale + Match06 reale**, non uno stub; se l'ambiente impedisce tale prova indicare con precisione cosa manca.
3. **Gate P0 funzionale:** in `newGame`, `coach.morale` inizializzato tramite il nuovo CoachV2 e `traits/origin` coerenti con `previewOfferMorale`; venti offerte visibili; `acceptOffer` usa `previewOfferMorale` e `applyOfferEffect` con firma/contract effettivi e applica UNA SOLA VOLTA il delta; `answerOpeningPress` e `answerPostMatchPress` usano `applyPressEffect` reale con `eventId` persistente e NON lasciano `awaiting_agent09` se i moduli sono disponibili. Verificare `gameOver` a morale zero, ricaricamento, doppio clic/retry, cash/ledger 1979, save legacy 1985, due stagioni.
4. **Rischio già documentato:** il 09 dice in #39 che gli applier non vengono agganciati automaticamente dal controller #38: serve wiring da 07 o consumer esplicito, con test che dimostri esecuzione effettiva. Il 07 mantiene i callback opzionali e lo status `awaiting_agent09`. Non considerare una semplice firma di callback, stub test o demo con dati sintetici come integrazione funzionante; classificare il problema con owner e file/linea. Non implementare tu il codice di 07 o 09.
5. Verificare che l'interfaccia flow headless per il 03 sia reale e ben definita (incluso portiere, chiamata 1×15min, eventi goal e salvataggi); segnalare se la prova HTML/Android resta non eseguita, senza pretendere che i test Node la sostituiscano.
6. Pubblicare rapporto **`oronzo/coordination/coerentizzatore/REPORT-R06.md`** su ramo documentale separato, distinguendo PASS/FAIL testati, SHA, blocchi esatti e owner. **NON effettuare merge #38/#39** in questo audit; 10 riassegna eventuale fix mirato al 07 o 09, poi autorizza un gate merge se verde.

**Priorità:** rapidità nel raggiungere primo playtest utente; niente round generale né verifica arti/cutscene che non tocchino il flusso dati del 1979.

---

## ARCHIVIO — incarichi R05 precedenti, chiusi
# ORONZO — INTEGRAZIONE MIRATA SUCCESSIVA A R05-1 · SOLO PR #30 E #32

**Incarico attuale pronto per la chat 00, NON avviato automaticamente.** Leggere `coerentizzatore/RUN.md`, `PROTOCOL.md`, `10-orchestrator/CONTRACT-v02.md`, `10-orchestrator/DISPATCH-R05.md` e il report R05 nella [PR #37](https://github.com/CzekUns/cercax/pull/37). Il nuovo requisito di identità visiva è **solo documentale** e non fa parte di questa verifica.

1. **Ripartire dal difetto unico R05-1:** PR #30 HEAD osservato `1fb92d5c249270dced1e18414ef70c022bf68722` (nuovo `r02-cross.test.mjs`, report 2/2 V8, Node completo non eseguito). PR #32 HEAD osservato `89bb4944e6c6fc78ad9164c8e0d899355ec9d67f` (invariato). **Rileggere entrambi gli HEAD live**.
2. Preparare checkout reale/sandbox verificata con file di main + entrambe le PR e catalogo presidenti. **Eseguire realmente** `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js`; verificare che il precedente 76 PASS/1 FAIL sia ora interamente verde. Confermare schema `{week,absoluteWeek,seasonYear}`, chiavi `a:N`, V1/V2, idempotenza contabile, rollover e 104 club/due stagioni con i casi della suite.
3. Controllare diff, HEAD, assenza regressioni/conflitti, nessun scope estraneo. Se fallisce, **nessun merge** e riferire esattamente caso/owner; non chiedere nuovo round generale.
4. Se **tutto è verde** e l'utente **autorizza esplicitamente merge nella chat 00 corrente**, mergiare **soltanto** #30 e #32 **una alla volta**, usando `expected_head_sha`, verificando main e rieseguendo i test pertinenti dopo i merge. Nessuna deroga indefinita: l'autorizzazione precedente R05 è conclusa.
5. Documentare esiti e SHA nel rapporto mirato `REPORT-R05B.md` su branch documentale separato; non mergiare il proprio report. **Non controllare altre PR, non avviare R03, non scrivere codice.**

---

## Archivio incarico R05 originale (concluso)

# ORONZO — RICHIESTA ATTUALE COERENTIZZATORE 00 · AUDIT R05

**Stato:** `READY` — incarico preparato il 7 novembre 2026 dall'Agente 10, **non equivale ad avvio della chat Work 00**.
**Ambito:** verifica P0 **PR #30 e #32** dopo le correzioni R04; solo se gate verde valutare l'integrazione in main con eventuale autorizzazione utente specifica R05. **Non usare il vecchio mandato di merge R04**, esaurito.
**Riferimenti:** `coerentizzatore/RUN.md`, `10-orchestrator/DISPATCH-R05.md`, `PROTOCOL.md`, `GAME-VISION-v02.md`, `10-orchestrator/CONTRACT-v02.md`, `registry.json`, audit [PR #36](https://github.com/CzekUns/cercax/pull/36) `REPORT-R04.md`.

## Verifica primaria obbligatoria (P0)
- PR **#30** Agente 07, HEAD osservato **`f098b5474801171f55e451889eca8c65653000f3`**.
- PR **#32** Agente 09, HEAD osservato **`89bb4944e6c6fc78ad9164c8e0d899355ec9d67f`**.
Gli HEAD sono snapshot: **rileggerli live** prima di ogni test e merge. I branch sono distinti: costruire una **checkout/sandbox che combini esattamente le due PR** con main e nessun mock dei file Career/Coach-Club. Non confondere il report dell'agente con test indipendenti.

1. Eseguire Node **davvero**: `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js`. Controllare la precedente asserzione fissa 1600 (R04-2) contro stipendi reali, test del modulo `period-r04.test.js` e catalogo veri presidenti.
2. Riprodurre il bug R04-1 con save legacy `settledWeeks:[1]`, conversione una tantum a `a:1`, eventi/ledger/meeting/promesse in stagioni differenti. Verificare **nessun doppio pagamento** e **nessuna perdita storica**, incluso envelope V1/V2 con checksum; quando la stagione è ambigua il sistema rifiuta in sicurezza.
3. Eseguire smoke 104 club × **due stagioni** con `{week:seasonWeek,absoluteWeek,seasonYear}`, save/load frequenti, 76 periodi o numero effettivo, idempotenza payroll e board, finanze/arretrati, presidente canonico, obiettivi, esonero e contract.history. Distinguere risultati 0–0 sintetici da gare Match Engine reali.
4. Controllare che ogni PR modifichi solo il proprio scope e REPORT, che le API abbiano contratti compatibili e che il merge su main non reintroduca test rotti; rieseguire almeno suite interessate dopo ogni eventuale merge. No modifiche al codice di gioco da 00.
5. Se la suite è VERDE e non emergono P0/P1, classificare **READY_FOR_MERGE**. Se un difetto resta, **FIX_REQUESTED** con caso riproducibile e proprietario 07/09; bloccare adapter 07.

## Controllo secondario di fattibilità, senza diluire il P0
- **#33 UI 03**, HEAD osservato `c38be80c392939d042dd998e6d1bf655c259804d`: ora porta QA Chromium 144 con `page.route`, emulazione touch, otto screenshot reali; questo prova DOM/caricamento asset intercettati ma NON il sito GitHub Pages né il telefono fisico. Valutare art/readability 8–9px e rimanenti gate. Non attribuire a 00 prove non eseguite.
- **#28 camera 05**, HEAD `9c00a3298c0083e3836154a1cb1ff22529bf6366`: test browser con PNG reali bloccato dal sandbox, fallback realSprites=0; HOLD finché non dimostrato. **#29 sprite 01** resta gate artistico/Chrome. **#12 cutscene** OPEN/DRAFT HOLD.
- **#31 Attributes 08** e **#35 Engine 06**: finché i rispettivi HEAD restano quelli dell'audit R04 (rispettivamente `979cde1` e `11e9901`), **FIX_REQUESTED**, non fare merge; richiesti mapping `regione/macroregione/coachTrust`/toni e un unico effetto temporaneo con ledger persistente.
- **#34 Copy 04** già MERGED `b8976cb2b0129de9ee6537e1d624abce9ff1402f`, nessuna nuova review necessaria.

## Merge (ATTENZIONE: autorizzazione distinta)
L'utente ha autorizzato i merge di Work 00 **solo nel precedente audit R04**, che è concluso. Questo REQUEST R05 **non conferisce da solo un permesso di merge**. Se l'utente, quando attiva Work 00, autorizza esplicitamente nuovi merge, 00 può effettuarli **solo** per PR verificate con test reali, un merge alla volta, con `expected_head_sha`, dopo verifica CI/diff/arte, e controlli successivi su main. Altrimenti 00 presenta i risultati e SHA raccomandati **senza fare merge**.

## Consegna
Creare `oronzo/coordination/coerentizzatore/REPORT-R05.md` nel proprio branch audit, PR **solo report**, senza auto-merge. Includere elenco HEAD esaminati, comandi realmente eseguiti, PASS/FAIL, diff/integrazione, link e SHA di eventuali merge autorizzati, blocchi, e una decisione se 10 può **autorizzare** il nuovo ciclo di 07. Non editare NEXT/registry/contratti/gioco. Non aprire R03. Lo stile dialoghi rimane in discussione, 100 comuni/500 cognomi M1 sono raccolti dall'automazione oraria e non certificati finché non disponibili.

**Priorità pratica: terminare il gate #30/#32 prima di ogni audit esteso sulle altre PR.**
