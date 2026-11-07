# ORONZO — AGENTE 03 · STATO POST CORREZIONI R07

**Stato attuale: `WAIT_REVIEW_R07B` (7 novembre 2026).** La PR #33 (`agent/oronzo-ui-r02`) è ancora **OPEN**, HEAD verificato `1e41c8716798612863aa0fc2327c6ee09deeb82d`. Il REPORT03 sul branch documenta fix R07-1 e R07-2 e QA proprietario **6/6 desktop+touch Chromium** a 640×360, 800×360, 844×390 con 10 PNG reali via `route.fulfill`, non HTTP live; Android fisico NON testato. **Non modificare nuovamente il kit in assenza di richiesta del 00.**

**Azione unica:** il Coerentizzatore 00 deve eseguire audit indipendente R07B su HEAD attuale #33, provando HTTP statico reale, clipping, touch e toast, senza affidarsi alle sole asserzioni/screenshot dell'autore. Se manca un gate, correggere solo la #33 secondo difetti esatti; nessun merge autonomo. Solo dopo gate PASS e merge autorizzato, Agente 10 emetterà NEXT R03 runtime e nuovo branch per il primo playtest mobile.

---

## ARCHIVIO — FIX R07 CONSEGNATO
# ORONZO — AGENTE 03 · FIX R07-1 / R07-2, STESSA PR #33

**STATO ATTUALE: `FIX_REQUESTED` (7 novembre 2026)**. Il Coerentizzatore 00 ha completato [REPORT-R07](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r07/oronzo/coordination/coerentizzatore/REPORT-R07.md) sulla **PR #33 OPEN**, HEAD osservato `c38be80c392939d042dd998e6d1bf655c259804d`. Nessun merge. Questo blocco prevale sui precedenti WAIT_REVIEW/READY riportati di seguito.

**Scope:** esclusivamente `oronzo/assets/ui/` e `oronzo/coordination/03-ui/REPORT.md`, nella **stessa PR #33** `agent/oronzo-ui-r02`. Non creare nuova PR, non cambiare main, `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html` o codice gameplay. Il nuovo runtime mobile sarà autorizzato SOLO dopo superamento gate e merge #33.

## R07-1 P1 — tasto CARICA PARTITA tagliato a 360px
- In `oronzo/assets/ui/demo-v02.js` `renderEntry()`, CSS `demo-v02.css` layout `.panel`, `.news`, `.v-stack`, `.hint-line`: a 640×360 e 800×360 il pulsante ha height DOM 44px ma area realmente visibile ~21px, per clipping `overflow:hidden`; al centro il touch intercetta il pannello anziché il bottone. A 844×390 la CTA è visibile ma la didascalia sotto viene tagliata.
- Correggere layout con spazio riservato alle **due** CTA Nuova/Carica, mantenendo almeno 44×44 px realmente visibili/toccabili e testo leggibile, senza scroll invisibile. Le decorazioni possono adattarsi alla risoluzione.
- Test in Chromium **reale** a 640×360, 800×360 e 844×390, desktop e touch: no clipping su antenati, `document.elementFromPoint` al centro CTA identifica bottone/figlio, `page.touchscreen.tap` sul centro (NO locator automatic scroll) attiva la risposta corretta a tutte e tre.

## R07-2 P2 — toast che occlude e intercetta CTA
- In `demo-v02.css` `.toast` e `demo-v02.js` `notify()`, dopo 5 risposte stampa il toast copre la CTA PROSSIMA GIORNATA nell'hub, il menu presidente e/o valori UMORE TIFOSI. In viewport 640×360 toast x=160,y=266,w=320,h=46; CTA y=254,h=44; centro CTA intercettato da `#ui-toast`; la navigazione resta ferma su hub. Riprodotto anche a 800×360 e 844×390.
- Preferire uno **slot status dedicato** con altezza riservata e testo adattivo; in alternativa posizione fuori da controlli/indicatori. `pointer-events:none` da solo non basta (testo comunque coperto). Mantenere il fix R04 `changeScreen()` che cancella toast vecchi.
- Test Chromium: percorso Nuova → offerte → conferenza 5 risposte rapide → hub; tap immediato sul **centro reale** PROSSIMA GIORNATA, senza attendere 2400ms e senza scroll automatico, deve navigare alla schermata prepartita; nessun contenuto o CTA occlusi nelle tre risoluzioni. Ripetere test su menu presidente e indicatori.

## Deliverable e QA
1. Modificare **solo** le due regressioni e, se necessario, script QA e screenshot nella stessa PR #33. Esportare screenshot 640×360, 800×360, 844×390 dopo fix, con 10 PNG veri caricati su HTTP statico quando possibile. Nessun dato demo spacciato per gameplay.
2. Rilanciare `node --check oronzo/assets/ui/demo-v02.js`, `python oronzo/assets/ui/qa/check_assets.py`, `python oronzo/assets/ui/qa/run_browser_r04.py` e test aggiuntivi di hit-testing, clipping e toast; distinguere prove realmente eseguite da quelle impossibili.
3. Aggiornare `oronzo/coordination/03-ui/REPORT.md` con SHA, file modificati, riscontri e limiti, e aggiornare **solo PR #33**. **NON MERGIARE**. Richiedere review **R07B** del Coerentizzatore 00, limitata ai due difetti e regressioni, prima di un'eventuale autorizzazione merge.

---

## ARCHIVIO — direttive pre-R07, superate
# ORONZO — AGENTE 03 · NEXT ATTUALE R07: REVISONE FINALE KIT UI #33

**Stato attuale: `WAIT_REVIEW_R07` — PR #33 ancora OPEN.** Le PR **#39 e #38** sono MERGED e il gate R06B 97/97 PASS su main; il controller carriera 1979 è pronto per essere collegato alla UI. **Non** ripartire da R02 e non riscrivere logica 07/09.

**Prima azione:** lasciare al Coerentizzatore 00 la review mirata R07 sulla **stessa PR #33** (HEAD noto `c38be80c392939d042dd998e6d1bf655c259804d`) secondo `coerentizzatore/REQUEST.md`. Se il 00 chiede correzioni di leggibilità, browser/touch, manifest o asset, aggiorna **solo #33** e `oronzo/assets/ui/` + REPORT03; **nessun merge autonomo**. Non aprire in contemporanea una PR runtime che dipende da un kit non approvato.

## R03 — INCARICO PRONTO PER PLAYTEST, SI ATTIVA SOLO DOPO MERGE #33

Una volta che **#33 è realmente MERGED**, l'Agente 10 autorizzerà un **nuovo NEXT** e un **nuovo branch da main** `agent/oronzo-ui-r03-runtime`. *Non è ancora un incarico di implementazione attivo in questo NEXT R07.* Il suo output richiesto sarà una **partita realmente giocabile via browser mobile**, non l'ennesima demo con dati hardcoded:

- Integrazione runtime `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css` e, se necessario, `oronzo/partita-rapida.html`, consumando il kit #33 e `oronzo/app/flow/controller.js` **reale** su main. Il 03 presenta dati e invia intent, senza modificare regole di 07/09/06. UI 16:9 landscape e touch.
- Flusso prima partita: Nuova/Carica → avatar/4 tratti → **20 offerte vere dal controller** → selezione e anteprima morale da 09 → 5 domande iniziali Copy04 → hub 1979, Rosa/Allenamento con stesso `playerId` e kit persistente (mostrare stato “asset non disponibile” se mancano `player.visual`, non inventare) → formazione da 11 con portiere → match realmente simulato Engine06 via `prepareMatch/tickMatch/consumeMatchResult` a **1× = ~15 minuti** → 2 risposte postpartita → club/finanze/risultato/classifica → save/load e prossima giornata. Esclusi shout 06/08 avanzati finché non verificati.
- **Non attribuire dati demo/placeholder alla produzione.** Per playtest personale è ammissibile esporre solo in versione test una modalità ben distinta **“Demo tecnica — località sintetiche”** usando le fixture `oronzo/app/flow/tests/qa-geography.mjs` già etichettate `synthetic_test_only`, senza usare quelle località come dati ISTAT. Nella modalità normale, se manca catalogo regionale approvato, mostrare `geography_required` con messaggio leggibile e nessun ingaggio non valido. Non cambiare contratti 07/09 per aggirarlo. La produzione M1 aspetta i 100 comuni/500 cognomi verificati, ma questo **non deve impedire un playtest tecnico dichiaratamente demo**.
- Solo rendering, interazioni e orchestrazione UI. Per il match usare soltanto il motore autorevole 06 e la vista esistente disponibile su main, senza creare gol casuali o promettere le due camere / sprite PR #28/#29 prima dei rispettivi merge. Mostrare chiaramente la disponibilità reale di camera FULL/TV. Cutscene #12 non gate.
- Test Node esistenti sempre verdi, QA browser Chromium a 640×360, 800×360, 844×390 e touch; static server HTTP reale o dichiarare blocco; scenario automatizzato **sul runtime HTML vero**, non soltanto demo Kit: dall'avatar al match fulltime, effetti morale e salvataggio. Fornire URL verificato di preview giocabile e istruzioni Android; se hosting non disponibile segnalarlo senza inventare URL. Non dichiarare test Android fisico prima che l'utente lo esegua.

**Obiettivo di orchestrazione:** superato R07, autorizzare senza nuovi round generali il R03 runtime del 03. Tutte le altre PR (28/29/12/31/35) seguono propri gate e non devono ritardare **il test funzionale**.

---

## ARCHIVIO — R02 e direttive pre-R07
# NEXT — AGENTE 03 · ART DIREZIONE UI · VISIONE v0.2
**Stato:** `WAIT_REVIEW` — prevale la direttiva R05 in fondo al documento; lavoro R02 nella PR esistente.
**Lavoro precedente:** PR #5 MERGIATA (ad84dd134b98d5fde8017af3da5e6e7b1b21e63e).
**Fonte:** [visione v0.2](https://github.com/CzekUns/cercax/blob/main/oronzo/coordination/GAME-VISION-v02.md), [epic #25](https://github.com/CzekUns/cercax/issues/25).
**Branch:** `agent/oronzo-ui-r02`.
**Scope:** `oronzo/assets/ui/` e proprio REPORT.

## Task
1. Progetta/realizza come **asset HTML componibili** (non mockup statici incollati) i pannelli landscape 16:9 e i ritratti/caricature originali degli avatar allenatore, con luogo natale e 4 statistiche resi come testo dinamico, non bitmap. Interfaccia 640×360, 800×360, 844×390.
2. Priorità alle schermate del flusso: Nuova/Carica partita; scelta avatar; 20 ingaggi con indicatori morale/costo; presentazione presidente; conferenza iniziale 5 domande; hub con data 1979 e menu Campionato/Rosa/Tifoseria/Ufficio presidente; prepartita; vista match con switch full campo/TV.
3. Esporta texture/pannelli/tasti/ritratti con manifest degli hotspot touch e aree dinamiche separate; demo HTML in tua directory e istruzioni da usare nel successivo ciclo d'integrazione runtime a carico dello stesso agente 03.
4. Evita nomi reali di squadre/loghi/marchi; leggibilità prima di decoro.

## Proprietà del futuro runtime (PRENOTATA, NON ANCORA AUTORIZZATA IN QUESTO CICLO)
Dopo merge della PR UI corrente e dopo risoluzione/merge R02 di 07+09, il 03 riceverà una nuova iterazione **separata** per implementare e collegare il runtime di interfaccia: `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html`. Consumer dei moduli degli altri agenti e del controller di carriera fornito dal 07 sotto `oronzo/app/flow/`. Nessun altro agente, incluso il 10, modifica questi file. Aggiornare IDENTIY/RUN/NEXT e autorizzare esplicitamente questo scope prima della PR. Nel ciclo R02 attuale rimani **solo in `oronzo/assets/ui/`**.

## Gate
Non modificare `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css` o sistemi di gameplay. Lo scopo è artwork e kit di UI, non logica. Testa dimensioni e demo, REPORT concreto, PR verso main senza merge.

## Controllo orchestratore — ripresa parallela del 7 novembre 2026
Il branch `agent/oronzo-ui-r02` è **identico a main** (0 commit nuovi) e il REPORT leggibile riguarda il ciclo 01. **Stato READY confermato solo per il kit UI** in `oronzo/assets/ui/`. Al termine aprire PR con screenshot, manifest dinamico e report aggiornato. **NON autorizzato ora** scrivere `index.html`, `game.js`, `ui.css` e `partita-rapida.html`: il ciclo runtime sarà assegnato DOPO merge del kit UI e fix R02 degli agenti 07+09, con un nuovo NEXT esplicito e PR separata.

## R04 — CONSEGNA IN REVISIONE WORK 00
**PR:** [#33](https://github.com/CzekUns/cercax/pull/33). **Stato di merge:** NON confermato. Rapporto R02 presente sul branch della PR; testi precedenti READY sono archivio del lavoro autorizzato, non un invito a iniziare un altro ciclo.
**Gate di accettazione:** Gate kit: demo Chromium 640×360/800×360/844×390, hotspot e asset; non autorizzare runtime HTML finché R02 07/09 e questo kit non sono mergiati.
**Regola:** attendere review Work 00 e riassegnazione da Agente 10; solo correzioni sulla PR corrente se richieste, niente R03 autonomo.


## AGENTE 10 — RISULTATO R04 E PROSSIMO PASSO (7 novembre 2026)
**PR #33, esito R04: HOLD per gate browser.** QA statica/sintassi/asset sullo snapshot combinato è passata; **Work 00 non disponeva di eseguibile Chromium** e il tentativo d'installazione è fallito. I test browser dichiarati dall'agente con `page.set_content` sono utili ma non provano il deploy/hosting o il touch Android.
**Azione ammessa sulla PR #33 corrente:** fornire test browser ripetibile in ambiente Chromium realmente disponibile, con screenshot/autovalidazione delle schermate e interazioni 640×360/800×360/844×390, 8 avatar e 4 tratti dinamici, 20 offerte, 5 Q, hub, scroll e pulsanti almeno 44 px, nessun errore console, URL/asset HTTP veri ove possibile; documentare eventuale blocco e non millantare PASS. Controllare l'arte e leggibilità.
**NON autorizzare ancora** `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html`: il futuro runtime UI avrà NEXT separato **solo dopo** #33 approvata/mergiata, R02 07/09 superato, adapter 07 contrattualizzato e contratto #31/#35 compatibile (prima di integrare gli shouts). I 100 comuni e 500 cognomi sono contenuti dinamici da ricevere, non numeri incisi nelle bitmap; non confondere la demo con gioco già integrato.


## DIRETTIVA ATTUALE — DISPATCH R05 (7 NOVEMBRE 2026)
**PR #33: integrare solo prove del kit art, NON il runtime.** Nel REPORT aggiornato è documentato Chromium 144 reale con touch emulato e asset CSS/JS/PNG caricati tramite `page.route(...).fulfill(...)` (HEAD `c38be80c392939d042dd998e6d1bf655c259804d`), screenshot e test 640×360/800×360/844×390. Il QA con richieste intercettate NON certifica HTTP/deploy reale né Android fisico. **Priorità immediata:** fornire giudizio di leggibilità sulle didascalie 8–9px, screenshot e riproduzione accessibile; se possibile verificare URL realmente serviti/GitHub Pages/touch fisico, altrimenti segnalare limite. Solo dopo review Work 00 e superamento del gate artistico/browser, chiedere merge PR #33.

**PROSSIMA ITERAZIONE PREPARATA — NON AUTORIZZATA:** distinta PR su `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html`: navigazione nuova/carica→avatar→20 ingaggi→presidente→5 Q→hub→rosa/allenamento→prepartita→11v11 full/TV→2 Q postmatch→save/load, dati reali dal controller 07, no demo placeholder, nessun doppio event apply; landscape 16:9 e touch, QA Android/browser. Avvio esclusivo con nuovo NEXT **dopo** merge #33, #30+#32, adapter 07 stabile e contratto #31+#35 risolto. Non iniziare ora.
