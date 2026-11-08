# ORONZO — REPORT-R09B-M01 · Audit indipendente PR #48

**VERDETTO COMPLESSIVO: NON CERTIFICATO / NO MERGE (verifica incompleta e rischio touch sulla conferenza).**

**Esito circoscritto R09-M01-1:** correzione CSS minima e coerente con il difetto segnalato; **scope PASS, geometria della PR reale NON CERTIFICATA**. Non attribuire a questa verifica il PASS 16/16 dell'autore.

Data: 8 novembre 2026 (Europe/Rome). Revisore: AGENTE 00, in chat distinta dall'autore 11.

- PR: https://github.com/CzekUns/cercax/pull/48 (OPEN, NON MERGED quando consultata).
- HEAD controllato: **58c7c65506f74f012b17b099583e96ee380f8db5**.
- Main al controllo: **5a0e0a408d5f4c629d23509fdbcb24dde373ba8b** (8 novembre, 15:51:29 UTC).
- Vecchio HEAD bocciato da R09: **6e72486607405d06d9a5ba8cac8d00a002ea5da8**.
- Base originaria PR: **55df243b6397d545baab967652f8556f71f878d3**.
- Fonte richiesta: oronzo/coordination/coerentizzatore/REQUEST.md letta da main.
- Fonte precedente: REPORT-R09-M01 letto dal branch audit/oronzo-coerentizzatore-r09-m01.
- Fonte autore: oronzo/coordination/11-mobile-ui/REPORT.md letto sull'HEAD PR. I risultati dell'autore sono stati trattati come dichiarazioni, mai come prove proprie.

## 1. Verifica indipendente dei sorgenti Git

Accesso diretto alle API GitHub: HEAD, patch della PR e tre blob successivi di career-r03.css sono stati letti e confrontati direttamente.

| Revisione | Blob CSS career-r03.css |
| --- | --- |
| main precedente / base | 866a60e83b4cce4ca047615ab677dfd99a28c644 |
| PR #48 prima di R09-M01-1 | 7feecdc8a9e16d01237627c895bf84e8a4586ad5 |
| PR #48 HEAD R09B | e9a9a1194bee8051755220650481538f6ef19e15 |

Tra il vecchio HEAD e quello nuovo risultano **solo un commento e una dichiarazione CSS aggiunti** nel file di runtime:

    #oronzo-r03 .runtime-match-panel { padding-top: 1px; }

La nuova regola è sotto @media(orientation:landscape), restringe il padding alto del pannello partita da 3 a 1 CSS px nel layout compatto, **senza abbassare il min-height di 44px del pulsante**.

La PR ha 104 file nel suo diff rispetto alla base: un unico file di CSS di gioco, strumenti/risultati QA e il REPORT11. Confrontando l'albero dell'HEAD con il main corrente, gli unici file preesistenti differenti sono il CSS e tre file di coordinamento aggiornati nel frattempo sul main (NEXT10, NEXT11, REQUEST00). Non risulta alterato altro codice runtime.

Blob **identici su main e PR**:
- career-r03.html: 94b5774f81fefa776108d722af97365e89e78485;
- career-r03.js: 729ab290406d7ab6b33747e6ab09280f04b65af4;
- demo-v02.css: 621ec2507863f337cbc41abc9712229f6a76f259;
- oronzo/app/flow/controller.js: e354a4dfd3a3b71032b4f50d68742c11ac17dc74;
- oronzo/systems/match-view/match-view.js: c53a4bd1f22fe28dbb9d4d14d7718829bb1df0cc;
- oronzo/game.js: 5c1c8fdda219c61ab0502c880b6ac3751607bd46;
- oronzo/ui.css: 0ed66e2cc2c20c847ef3db54952278212513a2d9.

**Conclusione statica:** nessuna modifica introdotta da R09-M01-1 a JS, font, regole, renderer, salvataggi, testo della conferenza o dati. La tela conserva canvas HTML 640×360 e vincolo CSS aspect-ratio:16/9. La regola di M01 conserva l'area laterale tramite padding env(safe-area-inset-*), con stage a width/height 100% del contenitore. Il fatto che gli elementi siano realmente interamente visibili richiede però browser effettivo.

## 2. Diagnostica Chromium indipendente: fixture CSS, NON il gioco reale

Ambiente disponibile: **Chromium 144.0.7559.96**, Playwright Python. Ho costruito **da zero** una pagina di prova con struttura DOM rappresentativa dei pannelli Partita e Conferenza, ricopiando solo i selettori CSS rilevanti letti da GitHub. **Non ho scaricato il repository né eseguito career-r03.js**: questo è un modello parziale, deliberatamente non equivalente al prodotto. Le cifre qui sotto **non sono** le misure reali della PR e non vanno confrontate al decimale con il report dell'11.

Sono state realizzate 96 combinazioni del modello: 4 risoluzioni × safe area sì/no × mouse/touch × main/vecchia PR/fix × Partita/Conferenza. Tutte e 96 hanno consentito l'hit-test al centro e il click/tap a coordinate (1 evento su 1), ma questo **non certifica** l'effettivo percorso Engine06. Nessun locator autoscroll. API CDP Emulation.setSafeAreaInsetsOverride con inset {top:0,left:24,right:12,bottom:16}. Non è stato possibile navigare via HTTP neppure alla fixture per blocco della rete di esecuzione; il DOM di prova è stato caricato tramite page.set_content.

### Risultati indicativi della fixture, revisione FIX

| Viewport | Stage senza inset | Stage con inset | TERMINA senza/con inset visibile | Terza risposta senza/con inset visibile |
| --- | --- | --- | --- | --- |
| 640×360 | 640×360 | 604×344 (x24) | 44 / 43,25px | 44 / 30,19px |
| 800×360 | 800×360 | 764×344 (x24) | 44 / 43,25px | 44 / 30,19px |
| 844×390 | 844×390 | 808×374 (x24) | 44 / 44px | 44 / 41,05px |
| 960×400 | 960×400 | 924×384 (x24) | 44 / 44px | 44 / 44px |

Questi risultati sono **esclusivamente del modello CSS parziale**: il risultato 43,25 per TERMINA non dimostra che il gioco sia difettoso, perché la fixture non comprende tutte le regole e l'intero DOM. L'autore ha indicato 44px nel gioco; **non verificato autonomamente qui**. Il rapporto 16:9 nella canvas della fixture resta circa 1,778 e i font dichiarati non cambiano; la stessa verifica è ancora richiesta sul gioco.

Confronto diagnostico fixture, 640×360 con inset:
- main senza regola M01: TERMINA 44px, terza risposta 44px; stage 640×360 senza sottrazione inset;
- PR prima del fix: TERMINA 41,25px, terza risposta 30,19px;
- PR con fix: TERMINA 43,25px, terza risposta **30,19px invariati**.

Il confronto prova soltanto che **il cambiamento al padding match non influisce sulle risposte** e che riservare la safe area riduce lo spazio verticale della conferenza. Non prova i valori assoluti della UI reale.

Evidenze prodotte nella sessione, disponibili come allegati scaricabili della conversazione, **non caricate come screenshot del gioco su GitHub**:
- oronzo_r09b_layout_fixture/independent_fixture_probe.json (96 rilevazioni);
- oronzo_r09b_layout_fixture/probe_match_640x360_safe_touch.png (screenshot della fixture);
- oronzo_r09b_layout_fixture/probe_press_640x360_safe_touch.png (screenshot della fixture);
- oronzo_r09b_fixture_probe.py (strumento indipendente della fixture).

## 3. Questione conferenza: origine e gravità

Il codice renderPress genera tre risposte button.ui-btn in .panel.runtime-answers. Il CSS condiviso impone min-height:44px ai bottoni ma la classe .panel ha overflow:hidden. La sezione press ha spazio verticale finito, top/bottom .runtime-foot e una domanda che non può restringersi sotto il suo minimo. **Un min-height di 44px sul bottone non assicura 44px di superficie effettivamente visibile**, perché gli antenati possono ritagliarlo.

L'Agente11 **dichiara** sul gioco reale 39,15625px per la terza risposta della domanda iniziale 3 a 640×360 con inset, sia prima sia dopo R09-M01-1. Qui la fixture dimostra il medesimo meccanismo di clipping, ma non riproduce indipendentemente **quel numero** nel gioco autentico.

Distinzione temporale obbligatoria:
- **Presente nel precedente HEAD della PR #48:** stessa struttura delle risposte, stesso CSS della conferenza, stessa regola M01 che riserva gli inset; il solo fix finale non ha cambiato nulla nella stampa.
- **Sul main precedente:** il CSS delle risposte è uguale e contiene il rischio strutturale; **ma main non contiene la regola M01 che riserva safe area**, perciò il test identico di 640×360 + inset non produce necessariamente la stessa geometria. Nella fixture su main il bottone rimane 44px e lo stage non rispetta l'inset. **Non è dimostrato che il taglio da 39px si verifichi sul main**. È scorretto chiamarlo semplicemente 'preesistente sul main' senza questa precisazione.
- **Impatto:** se la misura reale dichiarata dall'11 viene confermata, viola il gate generale dei **44px realmente visibili dei controlli touch**, anche se il tap centrale funziona. Deve bloccare il merge complessivo.

### Correzione richiesta all'Agente11 qualora il difetto sia confermato nel gioco

Sulla **stessa PR #48**, esclusivamente nel layout della conferenza, fare in modo che alla configurazione 640×360 + inset bottom16/left24/right12 tutte e tre le risposte abbiano **almeno 44 CSS px interamente visibili e hit-testabili**: recuperare prioritariamente spazio da padding/gap/testi informativi decorativi oppure rendere il gruppo delle risposte scrollabile in modo esplicito con accesso completo a ogni controllo. Conservare safe area, caratteri, target, contenuti, larghezza stage e la correzione TERMINA GARA. Riprovare, per ciascuna risoluzione, entrambe le modalità mouse/touch, con e senza inset, misurando il clipping di tutti gli antenati e un tap a coordinate senza scroll implicito. Non è stata introdotta alcuna patch da AGENTE00.

## 4. Regressioni: che cosa NON è stato verificato

**Non eseguite le suite Node native 97 flow/carriera/coach e 22 renderer**. **Non eseguito il percorso reale HTTP + Chromium** di avatar, 20 offerte, 5Q stampa, ufficio, rosa16, classifica16, formazione 11+1GK, Engine06/fulltime, 2Q dopo, avanzamento, morale/gameover, save/load/localStorage/reload, geography_required, demo sintetica, link legacy. Le dichiarazioni di PASS dell'11 non sono una verifica indipendente.

Ragione documentata: l'ambiente locale può avviare Chromium ma il repository pubblico non è clonabile (git ls-remote restituisce impossibilità di risolvere github.com), mentre gli strumenti GitHub connessi consentono lettura di file e metadati ma non montano il checkout nell'ambiente Chromium. Anche una navigazione a localhost in Chromium risulta bloccata da ERR_BLOCKED_BY_ADMINISTRATOR. Nessuna workflow GitHub Actions presente nell'albero main per lanciare il test indipendentemente. Non è stata alterata la repository per aggirare questi limiti.

**Non verificati:** Android fisico; browser Chrome Android con barre reali e cutout; anteprima pubblica della PR; 900 s di gara al ritmo reale; assenza del 404 cutscene. Non si afferma che console/rete siano pulite.

## 5. Decisione e prossimo gate

- **R09-M01-1, diff/scope:** PASS statico. La sottrazione di 2px dal padding match è reale, minimale e non modifica gameplay/font/salvataggi.
- **R09-M01-1, misura 44px nel gioco:** **NON VERIFICATA INDIPENDENTEMENTE**. Non promuovere la fixture a prova del prodotto.
- **Conferenza, difetto da 39px nel gioco:** **SEGNALAZIONE PLAUSIBILE / RISCHIO DI GATE**; precedente al fix nel branch PR, non dimostrato sul main originario.
- **Node/HTTP/Chromium end-to-end:** **NON ESEGUITI**.
- **PR #48 complessiva:** **NO MERGE / AUDIT INCOMPLETO**. Non raccomando il merge finché un test indipendente del checkout esatto non misuri >=44px in tutte le configurazioni e non risolva o escluda il difetto della conferenza; poi ripetere i test di regressione richiesti.

Questo documento NON dichiara ingiustificatamente NEEDS CHANGES per il solo TERMINA e NON dichiara PASS dell'intera PR. Nessun merge, nessuna modifica a file del gioco, nessuna attività sulle altre PR, Layout Studio, camera o comandi allenatore.
