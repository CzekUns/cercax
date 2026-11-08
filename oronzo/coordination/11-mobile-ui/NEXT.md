# ORONZO — AGENTE 11 · M01 INTEGRATO SU MAIN · STANDBY

**STATO: `MERGED_WAIT_ANDROID` — 8 novembre 2026.** [PR #48](https://github.com/CzekUns/cercax/pull/48) **MERGED** con autorizzazione esplicita dell'utente, commit di merge **`1bb8815b967dc4171fc644713918ad97f1cd95fb`**, HEAD auditato **`8c82cd0aa1cd856c8afc2964acae4ff57f5da93d`**. [REPORT-R09C-M01](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r09c-m01/oronzo/coordination/coerentizzatore/REPORT-R09C-M01.md) ([PR #51](https://github.com/CzekUns/cercax/pull/51)) è **PASS** indipendente, checkout reale e Chromium HTTP: 97+22 Node, 16/16 percorsi, 336/336 attivazioni conferenza +42 testo lungo, TERMINA GARA ≥44px. La PR #51 documentale **non è stata mergiata**.

**Verifica post-merge di Agente10:** GitHub conferma #48 merged e su `main` il blob `oronzo/assets/ui/career-r03.css` è `0f3569d37c07f2153a4bf8ca28149ded60f2956e`, **identico** al blob dell'HEAD auditato. Anche HTML/JS carriera invariati. Suite Node/browser **non rieseguite dall'Agente10 dopo merge** perché il container corrente non risolve github.com e non può ottenere un checkout (errore `Could not resolve host: github.com`); non dichiarare POST-MERGE runtime PASS su una prova non eseguita.

**Nessun nuovo lavoro assegnato a 11.** Prossimo gate: prova manuale Android reale landscape con barre Chrome, inset e navigazione/scroll. Solo successivamente Agente10 potrà decidere M02 camera dinamica (owner05), M03 comandi allenatore, M04 Layout Studio **privato dello sviluppatore**. Non sviluppare senza successivo NEXT esplicito, non creare nuove PR.

---

## ARCHIVIO — NEXT precedenti
# ORONZO — AGENTE 11 · M01 PASS R09C · ATTESA AUTORIZZAZIONE MERGE

**STATO: `PASS_WAIT_MERGE_AUTHORIZATION` — 8 novembre 2026.** [PR #48](https://github.com/CzekUns/cercax/pull/48) ancora OPEN, HEAD approvato **`8c82cd0aa1cd856c8afc2964acae4ff57f5da93d`**, GitHub mergeable=true al controllo dell'Agente10. [REPORT-R09C-M01](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r09c-m01/oronzo/coordination/coerentizzatore/REPORT-R09C-M01.md) nella [PR di audit #51](https://github.com/CzekUns/cercax/pull/51): **PASS indipendente** con checkout Git autentico, browser Chromium HTTP, 97/97 Node flow/career/coach +22/22 renderer, 16/16 percorsi, 240/240 domande iniziali, 96/96 postpartita, 42/42 ulteriori prove con testi lunghi, TERMINA GARA visibile e attivabile ≥44px; geometria/safe-area, font, canvas 16:9, save/load, game-over e percorso reale senza regressioni nello scope.

**M01 completato. Non apportare altri commit su #48, non avviare nuovi cicli, non fare merge.** Attendere autorizzazione espressa dell'utente per il merge della **sola #48** e successiva verifica main. Android fisico, browser Chrome Android con barre/cutout reali e 900s a 1× non sono ancora stati verificati. Dopo merge/Android, l'Agente10 deciderà M02 camera (owner 05), M03 comandi mister e M04 Layout Studio privato; **non sono attivi**.

---

## ARCHIVIO — NEXT precedenti
# ORONZO — AGENTE 11 · R09B-M01-2 CONSEGNATO · ATTESA AUDIT R09C

**STATO: `WAIT_REVIEW_R09C_M01` — 8 novembre 2026.** [PR #48](https://github.com/CzekUns/cercax/pull/48) è ancora OPEN/NOT MERGED, **HEAD verificato `8c82cd0aa1cd856c8afc2964acae4ff57f5da93d`**. REPORT11 aggiornato nel branch: correzione R09B-M01-2 della conferenza consegnata su CSS nella stessa PR, con scorrimento esplicito; il report autore documenta **336/336 attivazioni opzioni** (240 opening +96 postmatch), **16/16** percorsi Chromium HTTP/true localStorage e TERMINA GARA44/44 in 16 configurazioni, **119/119 Node**. Diff GitHub verificato: **unico file runtime cambiato `oronzo/assets/ui/career-r03.css`**, nessun JS/engine/flow/renderer modificato. QA dell'autore, **non certificazione indipendente**.

**Consegna completata — nessuna nuova modifica o PR finché non arriva un review finding.** Audit 00 R09C deve usare il **nuovo HEAD** e il runtime autentico HTTP + Chromium, non fixture, verificando tutte le risposte raggiungibili in scroll, almeno44px visibili/attivabili dopo scroll, TERMINA GARA, safe-area, font, canvas e regressioni Node. Se un difetto emerge, correzione esclusivamente sulla stessa PR; **NO MERGE finché QA indipendente positiva e autorizzazione esplicita dell'utente**. Android fisico non ancora verificato. Camera/comandi/Layout Studio non attivi.

---

## ARCHIVIO — NEXT precedenti
# ORONZO — AGENTE 11 · R09B-M01-2 · CONFERENZA TOUCH (VERIFICA + FIX CONDIZIONATO)

**STATO: `FIX_REQUESTED` — 8 novembre 2026.** La [PR #48](https://github.com/CzekUns/cercax/pull/48) è ancora OPEN/NOT MERGED, HEAD rilevato `58c7c65506f74f012b17b099583e96ee380f8db5`. Dopo R09-M01-1 (pulsante TERMINA GARA dichiarato 44/44px dall'autore), il Coerentizzatore 00 nella [revisione R09B-M01](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r09b-m01-20261108/oronzo/coordination/coerentizzatore/REPORT-R09B-M01.md) ha stabilito **NO MERGE / AUDIT INCOMPLETO**: accesso HTTP e checkout autenticati indisponibili al revisore; le 96 prove con fixture CSS non sono test del gioco.

**NUOVO RILIEVO MIRATO `R09B-M01-2` — possibile clipping conferenza:**
- L'autore11 nel runtime autentico ha misurato a **640×360 con safe-area CDP `left24/right12/bottom16`**, durante la **domanda iniziale n. 3**, la terza risposta (testo «Capisco il problema, ma la politica dei prezzi non dipende dal mister.») **39,15625px VISIBILI su 44 nominali**, in mouse e touch. Il rapporto indipendente conferma la plausibilità del meccanismo di clipping nella fixture, **non** la geometria del gioco e **non** la presenza del difetto sul main precedente. Il problema è precedente al fix del padding TERMINA, ma **non è provato che esistesse prima del CSS M01**.
- **Prima misura sul runtime reale** nella PR e confronta con l'HEAD precedente a M01 oppure main, stesso viewport/inset/domanda/risposta; salva geometrie e DOM clip chain per entrambi. Se riproducibile, **correggi SOLO il layout conferenza in `oronzo/assets/ui/career-r03.css` sulla STESSA PR #48**; nessuna nuova PR. Evita compressione del testo o dei bottoni: recupera spazio da elementi decorativi/gap/padding, oppure rendi le tre risposte esplicitamente scrollabili e completamente raggiungibili, con indicazione di scorrimento quando necessario. Conserverai tutta la risposta leggibile e ogni CTA effettivamente visibile ≥44px nel suo stato di interazione.
- **Vincoli invariabili:** il fix R09-M01-1 deve restare positivo (TERMINA GARA ≥44px), `.site` pieno landscape con safe area integra, canvas 16:9, font e testi esistenti, ruolo e gameplay/HTML/JS/renderer/engine/salvataggi invariati. Nessuna modifica a Cutscene, altre PR o Layout Studio/telecamera/comandi mister.
- **Verifica nel gioco originale (non fixture)** con Chromium HTTP reale, localStorage vero, 640×360/800×360/844×390/960×400 × safe area sì/no (top0 left24 right12 bottom16) × mouse/touch: per tutte le 5 domande della conferenza iniziale, tutte le opzioni (incl. testi lunghi), eventuale conferenza postpartita, e pulsanti/CTA delle schermate critiche, calcola la dimensione realmente visibile dopo clipping antenati, `elementFromPoint`, tap senza auto-scroll automatico. Se una risposta è nell'area scrollabile, esegui gesture touch reale e misura quando è raggiunta. Confronta prima/dopo anche TERMINA GARA e documenta 44/44px.
- Ripeti suite Node storiche 97/97 flow/career/coach + 22/22 renderer, percorso completo reale, save/load/reload e gameover. Aggiorna REPORT11, screenshot propri, QA riproducibile e stesso branch PR #48; **non merge**. Se non riesci a riprodurre il difetto nel gioco, documenta prova verificabile e **non modificare CSS solo sulla base della fixture**.

**Prossimo gate:** un revisore indipendente deve eseguire tests sul checkout effettivo e riportare PASS/NEEDS CHANGES. Il rapporto R09B precedente aveva accesso soltanto a una fixture; **non richiedergli un nuovo audit esclusivamente su fixture**. Garantire un ambiente con checkout accessibile e Chromium HTTP, o segnalare onestamente il blocco. Nessuna autorizzazione al merge ora.

---

## ARCHIVIO — NEXT precedenti
# ORONZO — AGENTE 11 · M01 FIX R09-M01-1 CONSEGNATO · ATTESA R09B

**STATO: `WAIT_REVIEW_R09B_M01` — 8 novembre 2026.** PR #48 OPEN/NOT MERGED, **HEAD `58c7c65506f74f012b17b099583e96ee380f8db5`**. Fix CSS CTA "TERMINA GARA" dichiarato PASS 16/16 con e senza safe area, 119/119 Node, rapporto aggiornato nel branch. **Nessun nuovo commit finché il revisore indipendente 00 in chat separata non conclude R09B.** La conferenza stampa ha un possibile problema preesistente di target parzialmente visibile a 640×360 con inset, da verificare autonomamente; potrebbe richiedere una correzione separata, non occultare. Non merge, non M02/M03/Layout Studio.

---

## ARCHIVIO — NEXT precedenti
# ORONZO — AGENTE 11 · CORREZIONE R09-M01-1 SU PR #48

**STATO: `FIX_REQUESTED`, 8 novembre 2026.** [PR #48](https://github.com/CzekUns/cercax/pull/48) OPEN, NO MERGE, HEAD oggetto del rilievo `6e72486607405d06d9a5ba8cac8d00a002ea5da8`. [REPORT-R09-M01](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r09-m01/oronzo/coordination/coerentizzatore/REPORT-R09-M01.md) ([PR #49](https://github.com/CzekUns/cercax/pull/49)) conclude **NEEDS CHANGES**.

**Unica correzione autorizzata:** `R09-M01-1`, in `oronzo/assets/ui/career-r03.css`, **sulla stessa PR #48**, senza crearne un'altra e senza merge:
- Con `Emulation.setSafeAreaInsetsOverride` e safe area `{top:0,left:24,right:12,bottom:16}`, la CTA `[data-action="finish-qa"]` è nominalmente 44px ma solo **42px visibili** a 640×360, 800×360, 960×400, con mouse e touch; 844×390 passa. Lo spazio interno effettivo è ridotto dall'inset bottom. La regola landscape di M01 (`.site` padding safe-area e `#oronzo-r03` full width/height) interagisce con `.runtime-match-panel` e la media query compatta.
- **Preservare** safe area sui quattro lati, larghezza realmente sfruttata, font esistenti, canvas partita 16:9 senza stretch e target ≥44px. Riservare 44px REALMENTE VISIBILI alla CTA, comprimendo **solo spazi decorativi, gap, padding o elementi non interattivi** del pannello partita; niente riduzione di testo/pulsanti e niente rimozione del padding safe-area.
- Aggiornare il QA nello scope `oronzo/assets/ui/qa/` per **tutti e quattro** i viewport 640×360, 800×360, 844×390 e 960×400, con e senza inset left24/right12/bottom16, mouse e touch; intersezione con tutti gli antenati overflow e viewport, verifica `elementFromPoint` + tap senza autoscroll; salvare screenshot e misure geometriche.
- Ripetere percorso reale Chromium via HTTP, smoke test di tutte le schermate e salvataggi, suite Node flow/career/coach 97 e renderer 22. Il test dell'autore deve essere documentato onestamente; non equivale ad audit indipendente.
- Aggiornare `oronzo/coordination/11-mobile-ui/REPORT.md` **nel branch #48** con diff, commit/HEAD, prima/dopo 42→≥44px, regressioni, limiti e screenshot; nessun file gameplay/renderer/flow e nessuna nuova PR. **NON MERGE.**

**Gate successivo:** incarico `R09B-M01` da svolgere in una **chat Work separata da quella autrice di M01** (00 Coerentizzatore), solo dopo aggiornamento HEAD #48. REPORT-R09B-M01 autonomo, PASS o NEEDS CHANGES. Merge solo dopo PASS e successiva autorizzazione esplicita dell'utente. Non iniziare camera pallone, comandi mister o Layout Studio privato in questo ciclo.

---

## ARCHIVIO — NEXT precedenti
# ORONZO — AGENTE 11 · M01 CONSEGNATO / GATE 00

**STATO ATTUALE: `WAIT_REVIEW_M01` — 8 novembre 2026.** La [PR #48](https://github.com/CzekUns/cercax/pull/48) è **OPEN, NOT MERGED**, HEAD verificato `6e72486607405d06d9a5ba8cac8d00a002ea5da8`; branch `agent/oronzo-11-mobile-m01`. Il [REPORT11](https://github.com/CzekUns/cercax/blob/agent/oronzo-11-mobile-m01/oronzo/coordination/11-mobile-ui/REPORT.md) dichiara M01 terminato: 8 righe CSS in `career-r03.css`, 97/97 flow/carriera/coach, 22/22 renderer, Chromium HTTP 8 prima + 8 dopo alle quattro viewport con mouse/touch, 48 screenshot e safe-area/resize. **Si tratta di QA effettuata dall'autore, non ancora audit 00 indipendente.**

**Unica azione ora:** nessuna modifica ulteriore, nessun nuovo branch, nessuna altra PR o merge. Attendere il gate indipendente `coerentizzatore/REQUEST.md` **M01-R09** sulla HEAD #48. Se `NEEDS CHANGES`, correggere solo nella stessa PR #48 su richiesta del 00. Se `PASS` e merge specificamente autorizzato dall'utente, Agente10 assegnerà il ciclo successivo; **camera dinamica, comandi dell'allenatore e Layout Studio privato restano NON AUTORIZZATI ora**. Prova Android fisico ancora mancante.

---

## ARCHIVIO — NEXT M01 iniziale
# ORONZO — AGENTE 11 · NEXT M01 · RECUPERO SPAZIO LANDSCAPE SMARTPHONE

**STATO: `READY` — 8 novembre 2026. PR #43 già mergiata su main: `241068d383a67c0be8513a2ef9b74b37eea58155`.**
**Mandato:** nuova evoluzione UI **al posto dell'Agente03 per i lavori futuri**, mantenendone la storia. Prima di scrivere codice leggi integralmente tutti i materiali dell'03 nell'IDENTITY/RUN dell'11. Il lavoro parte da `main` più recente, **nuovo branch `agent/oronzo-11-mobile-m01`**, nuova PR, NO MERGE.

## Obiettivo singolo di questo ciclo
**Far occupare al runtime della carriera 1979 tutta (o quasi tutta) l'area realmente disponibile in landscape** sugli smartphone larghi, **senza rifare UI/UX e senza toccare motore, tattiche, morale, roster o salvataggi**.

Il componente base `demo-v02.css` ora imposta `.stage{width:min(100vw,177.7778dvh);height:min(100dvh,56.25vw)}`: vincolo rigido 16:9. A 800×360 la superficie logica appare larga 640px, con ~80px laterali inutilizzati per lato; a 844×390 circa 693px e ~75px laterali. Verificare questi numeri con il browser reale, **non presumerli misure su Android fisico**.

### Intervento raccomandato
- Cambiare **il minimo CSS possibile** per la sola pagina `oronzo/assets/ui/career-r03.html` e usare la larghezza viewport disponibile (safe-area/toolbar/orientamento). Conservare proporzioni 16:9 **del canvas della partita** senza deformazioni; adattare coerentemente il contenitore grafico e i pannelli laterali. Evitare di modificare la base demo R02 per errore se è possibile un override in `career-r03.css`.
- Preservare le altezze e i caratteri attuali: **non ridurre ulteriormente font, statistiche o dimensioni dei target** solo per riempire. Controllare status toast, banner `DEMO TECNICA — LOCALITÀ SINTETICHE` sempre visibile, area header/footer, tasti principali, campi input/select, dialoghi e scroll.
- Se il riempimento totale produce una regressione di leggibilità/layout, proporre un limite adattivo motivato e documentare quali px restano inutilizzati. Non forzare `canvas` ad aspect errato o sprite stirati.
- Conservare tutte le funzionalità: 8 avatar, 20 offerte vere, 5 conferenze, 16/16 rosa, 16/16 classifica, formazione, MatchEngine06 e 2 domande post, `geography_required`, save/load e game over. Legacy 1985 / partita rapida invariati.
- Non introdurre ora **telecamera pallone**, nuovi comandi allenatore, spostamenti manuali pannelli, editor o nuovi elementi di gameplay. Questi resteranno attività future separate. NESSUNA modifica al renderer/motore 05/06/07, a Copy04, o al codice salvataggi.

### QA richiesto
1. **Screenshot prima e dopo** delle schermate Ufficio e Partita, più verifica Avatar/Offerte/Conferenze/Rosa/Classifica; a 640×360, 800×360, 844×390 e **almeno un viewport ultrawide** (ad esempio 960×400), mouse+touch quando possibile.
2. Registrare numericamente `viewport.innerWidth/innerHeight`, `.stage.getBoundingClientRect()`, margini inutilizzati, superficie occupata, `canvas.getBoundingClientRect()` e suo rapporto d'aspetto. Target touch di ogni CTA **≥44px effettivamente visibili** dopo clipping degli antenati; nessuna collisione con barre/notifiche.
3. Test reale di navigazione del runtime R03 su Chromium HTTP se disponibile e regressioni Node 97+22 (rieseguiti sul proprio branch oppure dire esattamente quali non eseguiti). Distinguere emulazione browser da Android vero, e link effettivi da link presunti.
4. Non cambiare convenzione CSS per il kit demo R02, a meno che un test documentato non dimostri l'assenza di regressioni.
5. Documentare differenze fotografiche/metriche, commit, prova di click/touch, limiti e suggerimento per test Android; nuova PR con REPORT `oronzo/coordination/11-mobile-ui/REPORT.md`, nessun merge.

### Pianificazione future fasi (NON ATTIVE IN M01)
- M02: audit indipendente e integrazione della **camera dinamica che segue pallone + giocatori vicini** (Agente05 PR #28; camera TV default, FULL alternativa) sul runtime, dopo gate del 05.
- M03: UI comandi mister durante partita (tattiche, sostituzioni, richiami) su contratti/validazioni dell'engine06 e 07, senza score inventati.
- M04: **ORONZO Layout Studio PRIVATO** per il proprietario, *non per il giocatore*: strumento dev separato non distribuito, drag/resize delle sezioni, salvataggio bozze, export JSON/CSS di configurazioni UI; controllare ACL/deploy, nessun link o codice editor nel sito pubblico. Nessuna implementazione/assegnazione ora.

**Gate dopo consegna:** 00 audit mobile CSS della PR M01, poi merge **solo su autorizzazione esplicita utente**. 10 coordina; 03 non lavora sugli stessi file.
