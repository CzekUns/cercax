# ORONZO — REPORT R08 · Revisione indipendente runtime UI PR #43

**Esito: NEEDS CHANGES / NO MERGE.** Il percorso della prima partita funziona realmente; restano quattro difetti di completezza/navigazione/touch, tutti nell'area dell'Agente 03. Nessun P0 o corruzione di dati riprodotto nelle prove svolte.

- Data: 8 novembre 2026, Europe/Rome.
- Main: `8ba2a84a0fed49dc052e4c41b06db2c602f093ae`.
- [PR #43](https://github.com/CzekUns/cercax/pull/43), HEAD verificato prima e dopo i test: **`8977305d78d1ddf161ac72b38b41973fe4311db4`**, OPEN, nessun merge eseguito.
- Scope: sei file, solo nuovo runtime/QA in `oronzo/assets/ui/`, link in `oronzo/index.html` e REPORT03. Nessuna modifica dei sistemi 07/09/06/05.
- Nota di coordinamento: REQUEST su main contiene ancora R07B già concluso. R08 è stato richiesto direttamente dall'utente; perimetro ricostruito dal NEXT03 R03 su main e dalla consegna #43. Nessun altro audit o merge ereditato.

## Test realmente eseguiti

Checkout di main più i file della #43, con blob verificati. Chromium **149.0.7827.0**, Playwright Node, **HTTP statico reale** su 127.0.0.1, CSS/JS/JSON/PNG originali, nessun route.fulfill né storage shim. Screenshot propri ispezionati personalmente. Tre viewport **640×360, 800×360, 844×390**, desktop e touch emulato.

| Prova indipendente | Risultato |
|---|---|
| node --check career-r03.js | PASS |
| node --test app/flow/tests/*.mjs systems/career/tests/*.mjs systems/coach-club/*.test.js (percorsi sotto oronzo/) | **97/97 PASS**, circa 37,5 s; include cross-test due stagioni |
| node --test oronzo/systems/match-view/*.test.mjs | **22/22 PASS** |
| Nuova → avatar → 20 offerte → presidente → 5 risposte → hub → 11 titolari/1 GK → motore fulltime → 2 risposte → settimana 2 | **6/6 PASS funzionale**, con difetti geometrici raccolti separatamente |
| Modalità normale senza dataset | **6/6 PASS**: geography_required, JSON stato identico prima/dopo il rifiuto |
| Orologio 1× | **6/6 PASS**: circa 6 secondi simulati in 1,05 s reali; non attesa integrale di 15 minuti |
| Save → vero reload della pagina → load | **6/6 PASS**, stato JSON esattamente uguale |
| Chiusura Chromium e riavvio con stesso profilo su disco | **PASS**, stato identico; fixture di save QA proveniente dal percorso precedente, scritta nel vero localStorage prima del riavvio |
| Seconda partita e doppio tap sull'avanzamento | **PASS**: da settimana 2 a 3, nessun doppio periodo economico |
| Rotazione portrait → landscape, 844×390 touch | PASS, avviso di rotazione e ripristino vista |
| Legacy e partita rapida | PASS navigazione: vecchia home, link R03 e link partita rapida; chiave legacy separata preservata |
| Gate complessivo | **FAIL: R08-1/2/3/4** |

Il risultato della prima gara è **2–0** in tutti i sei percorsi, da Engine06: nel save sono presenti due goal di PROM-16 a t=504 e t=3385, punteggio coerente e **2 punti** nella classifica storica. Paghe: un solo periodo `a:1`, una sola transazione wages; cassa da 9.540.000 a 9.063.000, costo 477.000, arretrati 0. Morale 50→52 dopo le due risposte postpartita, con eventi persistiti. Nessuna doppia applicazione al reload.

Nessuna eccezione JavaScript nel percorso completo. Presente **un 404 console per percorso** per `assets/cutscenes/manifest.json`, assente già su main: fallback opzionale dichiarato dall'autore, non nuovo blocco della #43. Non dichiarata console completamente pulita.

## Difetti verificati — correzioni raccomandate ad Agente 03 sulla stessa #43

### R08-1 · P1 · Rosa incompleta, schede e accesso Allenamento assenti

**File/funzione:** [career-r03.js, renderHub(), riga 61](https://github.com/CzekUns/cercax/blob/8977305d78d1ddf161ac72b38b41973fe4311db4/oronzo/assets/ui/career-r03.js#L61), menu e dispatcher interact.

**Prova:** caricare la carriera QA dopo la prima giornata e premere ROSA. Il club ha **16 giocatori**, ma il DOM contiene **12 righe** per `club.players.slice(0,12)`. Le righe sono div non interattivi; nessun pulsante giocatore o Allenamento. Non sono consultabili attributi, condizione o fiducia individuali. `getRosterPlayer/getTrainingPlayer` sono importati ma mai usati.

**Atteso:** il NEXT03 richiede Rosa/Allenamento e consumo delle due API di scheda; il mister deve consultare l'intera rosa prima delle decisioni.

**Correzione:** rimuovere il taglio a 12; rendere selezionabili i giocatori ed esporre le schede con le API 07 già disponibili, aggiungendo la navigazione Allenamento prevista. Non ricreare dati o regole del modulo 08 nella UI. Eventuali azioni allenamento che richiedano ulteriori contratti vanno concordate dal 10, non inventate. Testare il sedicesimo giocatore e coerenza tra scheda e stato.

### R08-2 · P2 · Classifica troncata anche quando si scorre

**File/funzione:** stessa [riga 61, renderHub(), ramo campionato](https://github.com/CzekUns/cercax/blob/8977305d78d1ddf161ac72b38b41973fe4311db4/oronzo/assets/ui/career-r03.js#L61).

**Prova:** getStandings restituisce **16 club**, mentre il contenitore scrollabile ne renderizza **12** a causa di `rows.slice(0,12)`. Lo scroll non può mostrare le posizioni 13–16; non è un semplice problema di altezza viewport. Può sparire dalla classifica la squadra allenata.

**Atteso/correzione:** mostrare tutte le righe con scroll o paginazione, conservando le posizioni della classifica autorevole. Testare numero righe uguale al numero club e una squadra nelle ultime quattro posizioni.

### R08-3 · P2 · Tornano pulsanti tagliati e target touch sotto 44px

**File/funzioni:** [career-r03.css](https://github.com/CzekUns/cercax/blob/8977305d78d1ddf161ac72b38b41973fe4311db4/oronzo/assets/ui/career-r03.css#L18), regole `.runtime-col`, `.runtime-controls`, `.runtime-match-panel`, media query; renderAvatar/renderMatch in JS.

**Prova personale, sia touch sia desktop a 640×360 e 800×360:**
- Avatar: INDIETRO e 20 OFFERTE hanno altezza nominale 44px, y=270,bottom=314; intersezione con gli antenati che tagliano **33px visibili**.
- Match: TERMINA GARA CON ENGINE06 (QA) nominalmente 44px, y=269,bottom=313; **34px visibili**.
- Il centro resta raggiungibile e il percorso passa: per questo non basta l'hit-test centrale dell'autore. La sua soglia di test è inoltre 39px, non 44.
- A 844×390 queste CTA non risultano tagliate. I select restano impostati a 34px e le righe selezione rosa a 29/34px: ampliare anche i relativi target effettivi secondo il gate touch.

**Atteso/correzione:** 44px realmente visibili e attivabili, non soltanto nel bounding box. Riservare spazio alle azioni; comprimere decorazioni o rendere scrollabile il solo contenuto. Verificare intersezioni con tutti gli antenati overflow e allineare il test automatico al target richiesto. Non ridurre ulteriormente font o pulsanti per farli entrare.

### R08-4 · P2 · GAME OVER non offre nuova carriera; INIZIO torna al game over

**File/funzioni:** [career-r03.js, renderGameover/render, righe 68–69](https://github.com/CzekUns/cercax/blob/8977305d78d1ddf161ac72b38b41973fe4311db4/oronzo/assets/ui/career-r03.js#L68), interact/home.

**Prova controllata:** da un save valido a settimana 2, applicato il vero `applyCoachMoraleEvent` del 09 con eventId di test e moraleDelta=-100; coach aggiornato col risultato accettato. È una fixture di soglia, non una carriera esaurita naturalmente. Con morale 0 la progressione è bloccata; premere INIZIO rende gameover, e premerlo nuovamente lascia gameover. Nessun pulsante NUOVA PARTITA (`[data-action=start]`, conteggio 0), solo CARICA SALVATAGGIO.

**Atteso/correzione:** offrire una nuova carriera dopo la fine di quella corrente senza richiedere refresh del browser. Introdurre azione di reset UI che chiuda il renderer e disassoci lo stato terminato, mantenendo il save precedente fino a nuova scelta esplicita. Non rendere recuperabile il morale del vecchio coach tramite questo reset. Il caricamento di un save precedente funziona già; ricaricare l'intera pagina è il workaround attuale.

## Evidenze, limiti e decisione

[Pacchetto prove indipendenti R08](https://chatgpt.com/library?file_id=libfile_87f854f4f4d481919b006b328820d424&account_id=personal): due harness Node, output delle suite, log browser, risultati/metriche DOM, fixture di save sintetica e **15 screenshot propri**. SHA256 ZIP: `92d0910e2d55fb6c3de1bd22dcd56ae511f3cfcaa26e4b5bf31ab2a4c93357e7`. Le immagini dell'autore non sono state usate al posto delle prove personali.

Non verificati Android fisico, URL pubblico, carriera pluristagionale nel browser, camera TV e cutscene definitive. Le due stagioni sono coperte dalla suite Node rieseguita, non da una nuova partita Android. La velocità 15 minuti è verificata attraverso il rapporto temporale, non un'attesa continua di 900 s. I dati sintetici restano segnalati permanentemente e non certificano dataset M1 reali. La vecchia partita rapida è stata aperta, non giocata per intero.

Il report dell'autore riconosce l'allenamento incompleto, ma questo non sostituisce il requisito nel NEXT03: il 10 può eventualmente restringere esplicitamente il gate. **Non ho modificato REQUEST/NEXT né il codice, non ho assegnato incarichi o fatto merge.**

Al coordinatore: (1) richiedere i fix mirati 03 sulla #43; (2) aggiornare REQUEST con il perimetro R08 corrente; (3) dopo consegna, ripetere solo i test interessati e le regressioni prima di una distinta decisione di merge.
