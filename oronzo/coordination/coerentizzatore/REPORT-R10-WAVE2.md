# ORONZO — AGENTE 00 — audit conclusivo R10, sei PR

Data: 9 novembre 2026. **Esito complessivo: NEEDS CHANGES. Nessun merge eseguito.** Quattro moduli superano la verifica; due blocchi concreti impediscono la certificazione dell'integrazione e delle due stagioni standard. Le correzioni sono richieste nelle PR esistenti, senza nuovi progetti.

## Commit e verdetti distinti

Main letto e verificato: `7b3d7f01fbcf8589ec0e516acffd8f177aacd81d`. REQUEST attivo `READY_AUDIT_R10_WAVE2_WITH_09`, roadmap R10 e contratti dei sistemi letti; confrontati codice e REPORT degli autori. HEAD riletti a fine prove: tutti invariati, OPEN e non mergiati.

| PR | HEAD verificato | Verdetto | Motivazione |
|---|---|---|---|
| [#28](https://github.com/CzekUns/cercax/pull/28) FULL/TV | `34aa26dce251c3c4f26e9705bca1fbefc20137f8` | **PASS** | 40 test isolati; Chromium HTTP con motore reale e PNG29, zoom1/2, input del motore invariato. PASS del renderer/API; il pulsante TV della UI non è ancora collegato. |
| [#29](https://github.com/CzekUns/cercax/pull/29) sprite | `7475cba747d6446841c4942178a9ec0b82d8abec` | **PASS** | 5 test atlas, incluse160 pose e bordo trasparente; PNG autentici caricati e disegnati dal renderer28, 22 attori iniziali, due squadre e portieri riconoscibili. |
| [#31](https://github.com/CzekUns/cercax/pull/31) PlayerV2/cognomi | `b6235d6a1115e6323fddfc6acce9a86d954e79e2` | **PASS** | 43 test isolati; cross06 eseguiti nella combinazione, 600 record confrontati con il blob40, origine/null, trust0 e alias verificati. |
| [#35](https://github.com/CzekUns/cercax/pull/35) ordini | `923b198c92f8d02983dfdedf659e8823e6d6c26f` | **PASS** | 37 PASS/2 SKIP da sola; cross08 senza SKIP nella combinazione; suite100 seed, effetti150s, movimenti reali e ledger delle proposte deduplicato. Applicazione permanente09 bloccata da57. |
| [#56](https://github.com/CzekUns/cercax/pull/56) carriera/adapter | `b27af7ced642b436e5317a7384589c77bc789617` | **NEEDS CHANGES** | API M1 e ciclo ridotto funzionano, ma il percorso standard si blocca dopo30 gare in Promozione, prima del rollover. R10-W2-02. |
| [#57](https://github.com/CzekUns/cercax/pull/57) società | `d5d0d908f002805e500005b48319d54e3947ce10` | **NEEDS CHANGES** | Due sorgenti contengono sequenze letterali fuori stringa: SyntaxError; carriera integrata non avviabile. R10-W2-01. |

PASS significa pronto per la review di merge nel perimetro indicato, non certificazione dell'intero gioco finito. Non si attribuiscono agli autori screenshot/test eseguiti da00 né viceversa.

## Prove indipendenti e combinazioni

Checkout Git autentici separati ai sei HEAD, Node **v24.22.1**, Chromium **149.0.7827.0** via Playwright e server HTTP `127.0.0.1`. Nessuna ricostruzione CSS, nessuna sostituzione degli import, nessun mock dei sistemi. Gli harness00 sono esterni al repository e importano i file veri. Nessun sorgente del gioco modificato.

Due combinazioni Git locali senza conflitti, non committate e non pubblicate come codice:

- **A, tutte6 + catalogo53:** albero `45d0cc0e12d20b34fad3099880dc5a80f6e8d57d`. Blocco di importazione57, riprodotto anche in Chromium sull'HTML reale; pageerror `Invalid or unexpected token`. La schermata vuota/non avviata è accompagnata dalla prova Node con file/riga.
- **B, stesse PR senza57:** albero `6898a3556ef02abad8d0a24a23ac0abfbed3625d`. Permette di verificare gli altri cinque moduli senza correggere o simulare09.
- Prerequisito geografico53: `9ec2baa6dc0c06b3d6fff432218f19be17ee77c0`, già approvato nella PR55, importato per usare il catalogo autentico. Nessuna nuova revisione53 o52.

### Node nativo

| Esecuzione | Risultato osservato |
|---|---|
| PR28 `node --test oronzo/systems/match-view/*.test.mjs` | 40 PASS, 0 FAIL |
| PR29 `node --test oronzo/assets/players/*.test.mjs` | 5 PASS, 0 FAIL |
| PR31 `node --test oronzo/systems/attributes/tests/*.test.js` | 43 PASS, 0 FAIL |
| PR31 cross `*.test.mjs`, senza35 | 3 SKIP dichiarati |
| PR35 `node --test oronzo/systems/match-engine/tests/*.mjs` | 37 PASS, 2 SKIP, 0 FAIL |
| PR56 `node --test oronzo/app/flow/tests/*.test.mjs oronzo/systems/career/tests/*.mjs` | 55 PASS, 3 SKIP, 0 FAIL |
| PR57 `node --test oronzo/systems/coach-club/*.test.js` | 18 PASS, 4 FAIL di caricamento; i casi non caricati non sono certificati |
| Combinazione B, tutti i file `.test.js/.test.mjs/.test.cjs` sotto `oronzo`, selezionati con `rg --files` | **251 PASS, 0 FAIL, 0 SKIP**,108,2s |
| Combinazione A, stessa selezione | **197 PASS, 9 FAIL di caricamento**,206 test registrati; i sotto-test dietro gli import falliti non vengono enumerati |

La suite251 comprende QA motore100 seed con cambi/shout/sostituzioni e il cross08 con **100 partite PlayerV2 reali e10 replay identici**; questi sono stati eseguiti da00 in Node, non dedotti dai rapporti degli autori. Un ulteriore avvio CLI duplicato è stato interrotto: non è contato come prova.

Prova propria aggiuntiva `independent-probes.mjs`: stesso input e seed, origine Campania/Puglia/Lazio → bonus regione > macroregione > altra; `relationships.coachTrust=0` prevale sul mirror contraddittorio100; scadenza esatta a150s; il vecchio bonus08 da180s non contribuisce. Due motori con lo stesso input, uno cambiato a4-3-3, hanno coordinate effettive diverse dopo22s. Nel JSON sono registrate coordinate prima/dopo e risposte reali.

### Carriera, persistenza e due stagioni

**Percorso standard:** seed1979, clubPROM-01, catalogo500 comuni già approvato,600 cognomi08, avatar75/80/80/80; 30 partite intere del motore06, conferenze reali, allenamento08 selezionato tramite09, liquidazione e `saveGame/loadGame` dopo ogni giornata. Replay di risultato e `advanceMatchday` con vecchia settimana respinti senza modifica dello stato. Alla settimana31 `prepareMatch` restituisce `no_coach_fixture`: la prima stagione non può finire dal flow pubblico. **Due stagioni standard: FAIL, non certificate.**

**Prova separata con parametro pubblico `leagueSizes={PROM:4,INTER:4,C2:4,C1:4,B:4,A:4}`:**12 partite vere,14 salvataggi/caricamenti identici,12 record history, due rollover1979→1980→1981, due sviluppi stagionali una tantum e settimane di training distinte. PASS del caso ridotto; non maschera il FAIL standard. Nessun risultato del club allenato è stato inventato; le altre fixture sono simulate dalla funzione deterministica originale07.

Il primo shout autentico passa07→06, rifiuta lo stesso requestId e conserva dopo reload un solo record `pending_agent09_player_trust`. La firma09 `persistShout({key,event,coach,club})` è staticamente compatibile con `reconcileM1Shouts`, ma il consumo permanente attraverso09 non è eseguibile nel checkout completo a causa di R10-W2-01. **Trust permanente applicato una sola volta con57, stadio→incasso→morale, richieste→spesa reale e sellerRelease/mercato: NON CERTIFICATI**, non PASS ottenuti con port sostitutivi. I test di finanze/presidenti main sono passati nella combinazioneB; non certificano le nuove API57.

### Chromium HTTP, PNG e UI

Quattro viewport touch emulato: **640×360,800×360,844×390,960×400**. Nessun pageerror nella combinazioneB. Per ciascuna: vera nuova carriera, offerta, cinque domande, formazione e campo; poi prova API separata dichiarata a video con un nuovo match creato dal controller07 autentico e snapshot06 reali collegati a05. FULL zoom1 / BROADCAST zoom2;22 chiamate riuscite al disegno sprite all'inizio, `assets.state.players='ready'`, portieri mantenuti, nessuna mutazione dello snapshot da parte del renderer. PNG e maschere caricati via HTTP200; hash e blob Git registrati. Secondo tempo e fulltime provati in entrambe le camere.21 attori a fine partita derivano da un'espulsione effettiva, non da un PNG mancante. Il motore attraversa l'intervallo immediatamente: non si rivendica un fermo immagine nella fasehalftime.

A **844×390** anche il percorso UI completo: partita vera a8×,120s di clock controllato Playwright, t5400, risultato2–0,1560 eventi, due risposte stampa, avanzamento, salvataggio, reload pagina/caricamento identico inhub. Non è un'attesa cronometrata di15 minuti né un test Android fisico.

Ispezionati personalmente screenshot FULL640,TV844 e ufficio dopo caricamento844: sprite pixel art reali, maglie distinte, scala campo preservata; gli altri screenshot sono acquisizioni automatiche con controlli di caricamento. Non si rivendicano nuove prove di fullscreen/safe area52 già approvate o di Android fisico.

**Collegamento UI ancora assente, distinto dal verdetto dei moduli:** `career-r03.js` conserva `camera-tv` come messaggio «non disponibile»; le nuove selezioni training/shout/gestione non sono chiamate automaticamente dalla UI corrente. Il gateAPI05 passa; non si dichiara che il pulsanteTV pubblico funzioni già. Il contratto `M1-AGENT12-CONTRACT.md` descrive il consumo successivo. Nessun incarico UI nuovo assegnato da00.

## Difetti confermati e correzioni richieste

### R10-W2-01 — P0 — PR57, Agente09: importazione impossibile

**File/funzioni:** `oronzo/systems/coach-club/presidents.js:44`, `presidentBehavior`; `negotiations.js:29`, `reviewTransfer`; `negotiations.js:81`, `decideSale`.

**Causa:** sequenze letterali backslash+n fuori dalle stringhe, dopo `fundingRatio*.19-`, dopo `askingFee,` e dopo `(100-t.ambition)*.0015+`. Node restituisce `SyntaxError: Invalid or unexpected token`. Il re-export tramiteindex09 blocca anchecontroller07 e la pagina della carriera.

**Riproduzione:** checkout HEAD57; `node --check oronzo/systems/coach-club/presidents.js` e `node --check oronzo/systems/coach-club/negotiations.js`; poi suite09 e HTML carriera della combinazioneA viaHTTP. Atteso: sorgenti importabili e nuove API eseguibili. Osservato: entrambi i check falliscono, UI non si avvia.

**Fix sulla stessa PR57:** sostituire le tre sequenze con veri newline/spazi; eseguire la suite sul checkout autentico con tutte le dipendenze, non su copie ridotte dei moduli. Pubblicare un nuovo HEAD. Solo dopo il fix sono verificabili i verticali economici e il consumo reale `fixtureId:eventId` dopo save/reload. [Richiesta già pubblicata](https://github.com/CzekUns/cercax/pull/57#issuecomment-6739791542). All'ultima rilettura HEAD invariato: nessun fix nuovo da valutare.

### R10-W2-02 — P1 bloccante per la carriera — PR56, Agente07: settimane senza gara non avanzabili

**File/funzioni:** `oronzo/app/flow/controller.js:344` `prepareMatch` (assenza fixture), `advanceMatchday:432–441` (stage e gara richiesta); `oronzo/systems/career/career.js:98` `getUpcomingFixture`, calendario al periodo corrente.

**Riproduzione reale:** percorso standard sopra; dopo30 risultatiPROM, week31/flowhub, `prepareMatch`→`no_coach_fixture`, `advanceMatchday`→`postmatch_press_not_completed`; anche forzando impropriamente lo stage resterebbe `coach_match_not_recorded`. Altre divisioni hanno38 giornate; `rolloverSeason` richiede `season_complete`. Nessun passaggio pubblico consente di terminare la stagione. Il blocco è **preesistente su main**, confermato dal confronto delle medesime guardie (maincontroller:360–369); non è attribuito falsamente a una nuova regressione del diff56.

**Fix richiesto nella stessa PR56 per chiudere il gate carriera:** distinguere settimana senza fixture del club da fixture presente ma non giocata; permettere avanzamento delle altre divisioni e conteggi settimanali una sola volta perabsoluteWeek, senza inventare una partita/review/conferenza del mister. Restituire un esito utilizzabile dal consumerUI. Aggiungere una prova su dimensioni standard/divisioni di durata diversa, due stagioni, save/load e retry. [Richiesta già pubblicata](https://github.com/CzekUns/cercax/pull/56#issuecomment-6739971365).

## Ordine di merge raccomandato, senza eseguirlo

1. **#29 → #28**, con PNG nuovi prima del renderer; **#31 → #35**, con PlayerV2 prima del consumer motore. Queste quattro sono pronte alla review dell'orchestratore sugli SHA indicati. Dopo ogni merge occorre verificare il main risultante.
2. **#57 e #56 restano sospese.** Dopo correzioni e gate combinato reale, ordine preferito **#57 → #56**: provider società09 prima del flow07. Non approvare anticipatamente i nuovi HEAD e non considerare i251 test verdi equivalenti al gate seiPR.
3. Per il ciclo finale restano soltanto: fix57/import+verticali+trust, fix56/settimane senza gara, prova combinata con due stagioni standard e persistenza. Nessuna richiesta di riscrittura, nessuna nuova revisione generale. Catalogo53 già approvato deve essere disponibile come prerequisito;52/53 non sono state riesaminate qui.

## Evidenze e limiti

Archivio indipendente **ORONZO-R10-WAVE2-evidenze.zip**: log Node separati, JSONbrowser, dodici screenshot delle quattro risoluzioni più errore import e caricamento, harness00 riproducibili, snapshot fonte40, hashPNG e SHA/alberiGit. [Scarica le evidenze](https://chatgpt.com/library?file_id=libfile_5146e0bcd3a48191a42765860e37017f&account_id=personal). SHA-256 ZIP: `881ec0308acfd3181c68e768cec2b38b82ca27341aac7aa838a330489fe25cd1`. Lo ZIP contiene la versione del rapporto precedente alla sola aggiunta di questo link; codice, log e screenshot sono gli stessi. `REPRODUCE.md` distingue ogni prova API/UI, caso ridotto/standard, tentativi incompleti e test eseguiti.

Non eseguiti/certificati: Android fisico, deploy pubblico, due stagioni standard complete, nuove finanze/stadio/mercato/persistShout57, collegamentoUI delle nuovefunzioni. Non sono limiti del browser o del checkout: per57 è un errore sorgente concreto, per le stagioni è un blocco funzionale riprodotto. Audit concluso sui sei HEAD indicati; nessun merge, modifica al gioco oNEXT, e nessuna altra PR esaminata.
