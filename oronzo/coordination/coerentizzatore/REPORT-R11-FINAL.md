# ORONZO — AGENTE 00 · REPORT INDIPENDENTE FINALE R11 U1–U9

**Data:** 9 novembre 2026 · **Stato:** AUDIT_FINALE_PASS_CON_LIMITI_DICHIARATI · **Nessun merge e nessuna modifica al gameplay.**

## 1. Perimetro e HEAD autentici congelati

| Oggetto | Commit HEAD osservato | Stato |
| --- | --- | --- |
| PR [#63 UI](https://github.com/CzekUns/cercax/pull/63) | `788025b79a0ef3d0935182c1fb9528dc73196f80` | OPEN; non merged |
| PR [#66 Backend](https://github.com/CzekUns/cercax/pull/66) | `575f8c56cf477833e0b8dbfced407a83e2265f2f` | OPEN; non merged |
| PR [#67 QA COMBINATO](https://github.com/CzekUns/cercax/pull/67) | `b2209762cd600425b9311a610bb8c8f946ace9e4` | OPEN, DRAFT; **NON MERGIARE** |
| `main` durante l'audit | `d3c60651ffa96057fcb50a5bcf15f91bc347e450` | non contiene #63/#66 |

Letti dal vero repository il `coerentizzatore/REQUEST.md` su main, il `07b-sections/NEXT.md` su main, il `07b-sections/REPORT.md` su #63, oltre ai sorgenti e alle modifiche delle tre PR. L'utente ha richiesto con questo incarico l'audit **finale**, che prevale sul precedente mandato di audit parziale ancora nel REQUEST storico.

Verificati gli hash **blob dei singoli file di gioco** nel combinato: i file UI corrispondono a #63 e quelli backend a #66. L'ultimo commit di #63 rispetto a `8fd4df94...` cambia soltanto `07b-sections/REPORT.md`, non il codice. La prova è quindi sul codice effettivo degli HEAD indicati. Nessuna sovrapposizione dei file di gameplay modificati da #63 e #66; GitHub le segnala entrambe `mergeable=true` contro il main osservato.

## 2. Esecuzioni realmente effettuate

**Ambiente:** runner GitHub Actions Ubuntu, Node.js 22, Playwright/Chromium reale headless, server HTTP Python su 127.0.0.1:8123; vero checkout Git del combinato R11, senza HTML o stato di gioco mock. Le prove si trovano su un ramo tecnico di audit, **non** sulle PR di produzione:

- Branch riproducibile: [`audit/oronzo-r11-final-00-20261109`](https://github.com/CzekUns/cercax/tree/audit/oronzo-r11-final-00-20261109); HEAD audit `b598eb764cb1b4784dda25364ce320cbce757bbf`.
- Suite specifica indipendente: [`qa-r11-final-browser.mjs`](https://github.com/CzekUns/cercax/blob/audit/oronzo-r11-final-00-20261109/oronzo/coordination/coerentizzatore/qa-r11-final-browser.mjs).
- [**Workflow indipendente #42716765363 — SUCCESS**](https://github.com/CzekUns/cercax/actions/runs/42716765363): **64/64 test Node PASS, 110/110 controlli Chromium PASS**, 0 FAIL.
- [**Evidenze: screenshot reali, log, JSON risultati**](https://github.com/CzekUns/cercax/actions/runs/42716765363/artifacts/13717524716).

Comandi eseguiti dalla pipeline (v. [workflow audit00](https://github.com/CzekUns/cercax/blob/audit/oronzo-r11-final-00-20261109/.github/workflows/oronzo-r11-agent00-independent.yml)):

```sh
node --check oronzo/assets/ui/career-r03.js
node --check oronzo/assets/ui/sections-r11/management-ui.js
node --check oronzo/app/flow/controller.js
node --check oronzo/app/flow/management-r11.js
node --check oronzo/app/flow/durable-save.js
node --check oronzo/coordination/coerentizzatore/qa-r11-final-browser.mjs
node --test oronzo/assets/ui/sections-r11/sections-r11.test.mjs oronzo/assets/ui/qa/ui12-landing-nav.test.cjs oronzo/app/flow/tests/r11-integration.test.mjs oronzo/app/flow/tests/m1-contract.test.mjs oronzo/app/flow/tests/m1-live.test.mjs oronzo/systems/coach-club/management-r10.test.js
python3 -m http.server 8123 --bind 127.0.0.1
node oronzo/coordination/coerentizzatore/qa-r11-final-browser.mjs
```

I 64 Node sono suite del checkout autentico rieseguite indipendentemente; il Chromium **è uno script autonomo scritto dall'Agente 00**, differente dal test Chromium del 07-bis. La precedente CI dell'autore #42711637028 è soltanto evidenza aggiuntiva, non fondamento esclusivo del verdetto.

**Risoluzioni Chromium:** 640×360, 800×360, 844×390, 960×400 con `isMobile=true`, touch abilitato. A tutte: caricamento HTTP, PNG visibile, 20 offerte, ufficio, training 73 dopo salvataggio/reload, rosa filtrata, calendario, tifoseria/giornali, agenda, presidente/mercato, assenza di eccezioni JS, pulsanti visibili ≥ circa 44×44 px e PNG richiesti senza errori (HTTP 200 o 304 da cache). A **640×360** anche transazioni complete di mercato, cambio prezzo, telecamera, comandi, sostituzione e corruzione IDB. Catturati screenshot delle schermate originali.

## 3. Matrice U1–U9: verdict per funzione

| Area / funzione | Esito | Evidenza indipendente |
| --- | --- | --- |
| **U1 · Allenamenti, 5 programmi e RECUPERO 73% persistito** | **PASS** | 5 programmi e ledger in Node; in Chromium selezione REST/73, conferma di salvataggio, reload, slider 73, pulsante REST marcato e stato 73 in tutte e quattro le viewport |
| **U2 · IndexedDB dual-slot A/B, checksum, recupero, import/migrazione legacy, 2 stagioni** | **PASS** | Node verifica 30 fixture mister + 8 bye-week e salvataggi di due stagioni standard, migrabilità in sola lettura; vero Chromium scrive snapshot di **5.561.117** e **8.759.578** caratteri in slot distinti, corrompe intenzionalmente l'attivo, recupera 1979 dalla copia integra; niente cancellazione legacy |
| **U3 · Stadio, prezzo, affluenza, incassi** | **PASS** | Click UI su biglietto da 900 a **2.000 lire** e cassa invariata prima dell'incontro; Node verifica fonte `synthetic_gameplay_r11`, 15 liquidazioni casalinghe per stagione, anti-duplicazione e bilancio/affluenza/rapporti 09 |
| **U4 · Presidente, mandate, acquisti, cessioni** | **PASS** | Pulsanti reali: mandato mercato approvato, **cessione** proposto→valutato→ceduto e **acquisto** proposto→valutato→negoziato→acquistato. Per ciascuno spostamento di un player ID, debit/credit reciproci **1.000 lire**, idempotenza/guard in Node e persistenza dopo reload IndexedDB. Rifiuti presidenziali reali durante la ricerca di offerte accettate, nessuna manipolazione diretta dello stato |
| **U5 · Fiducia permanente giocatori** | **PASS** | Node `persistShout` accettato una sola volta, senza bonus temporanei duplicati, reload; click Chromium ordine individuale verificato |
| **U6 · 600 cognomi effettivamente utilizzati** | **PASS** | Node `playerDataset.recordCount>=600`, ID/provenienza `surnameId` e `surnameSourceId` nei calciatori, `newGame` richiama catalogo autentico e non soltanto placeholder UI. Fonte documentata 2021: nessuna pretesa di frequenze nazionali del 1979 |
| **U7 · FULL/TV, tattiche, ordini, sostituzioni** | **PASS** | Chromium usa tasto TV e snapshot Engine06 identico pre/post; apre comandi, applica tattica, shout, e **SOSTITUISCI P04→P14** con conferma Engine06 `substitution · 1`; Node verifica i contratti e il motore effettivo |
| **U8 · Rosa/schede, formazione, calendario/classifica, campionato** | **PASS** | Chromium filtra GK, naviga calendario e apre formazione con preparazione della vera partita; Node controlla periodi reali e due stagioni 1979→1981, bye-week 31–38 e classifiche derivate da fixture |
| **U9 · Tifoseria, giornali, agenda** | **PASS** | Chromium naviga le 3 schede dei tifosi, i giornali e l'agenda su 4 viewport; Node verifica articoli solo da eventi/risposte salvate e agenda che distingue partita da bye-week |

La qualifica **PASS** riguarda il perimetro testato e la compatibilità tecnica degli HEAD congelati; non garantisce ogni possibile combinazione di eventi o dispositivo.

## 4. Mercato: riproduzione con interfaccia reale

**Cessione:** nuova carriera QA 1979 → offerta accettata → ufficio → Presidente → Mercato → scegli calciatore e acquirente → METTI IN VENDITA → VALUTA (prima proposta può essere rifiutata, seconda approvata) → CEDI → reload. Esito: giocatore unico nella società compratrice, assente dalla cedente, **+1.000 ₤** venditore / **−1.000 ₤** acquirente; dopo reload identico.

**Acquisto:** Ufficio → richiesta `market_mandate` 5.000 ₤ → DECIDI (approvata) → Mercato → candidato di altra società, mandato, offerta 1.000 ₤, ingaggio 0 → PROPOSTA → VALUTA (con decisione autentica del direttore/presidente; eventuali rifiuti vengono registrati) → NEGOZIA → ACQUISTA → reload. Esito: un solo player ID nel club acquirente, scomparso dalla società cedente; **−1.000 ₤** acquirente / **+1.000 ₤** cedente; persistenza confermata. Nessun pulsante aggirato da invocazioni dirette dell'adapter.

**Ripetizione / edge case:** contratto lato Node rifiuta operazioni fuori finestra, senza mandato, senza seller release, una seconda liquidazione e acquisti duplicati.

## 5. Errori e responsabilità

**Bug riproducibili del codice di gioco sugli HEAD R11 esaminati: nessuno bloccante rilevato.** Non richiedo perciò un nuovo ciclo correttivo al 07-bis sulla base di questo audit.

Durante la messa a punto dello **script indipendente di audit**, e non del gioco:
1. Un reload eseguito prima della conferma di salvataggio faceva apparire il precedente training: risolto nel test aspettando `!hasUnsavedProgress()`. Il successivo reload correttamente sincronizzato è PASS a tutte le risoluzioni.
2. Il primo script di audit leggeva `management.requests` prima dell'inizializzazione: risolto nel test usando lo stato opzionale, senza cambiare il gioco.
3. Lo script trattava erroneamente HTTP **304 Not Modified** dei PNG in cache come fallimento: accettati HTTP 200/304, con caricamento dell'immagine iniziale tramite `naturalWidth>0`. Esecuzione finale SUCCESS.

**Limiti NON CERTIFICATI:** telefono Android fisico (notch, safe-area hardware, tap manuali, performance), packaging/installabilità Play/PWA, GitHub Pages `main` prima dei merge, tutte le transizioni rare game-over/disoccupazione in Chromium. **Owner per rifiniture da screenshot dopo playtest:** Agente 12; **owner se emerge un difetto su adapter/UI R11:** 07-bis; formule societarie rimangono dell'Agente09. Non confondere limiti di test con bug dimostrati.

## 6. Conflitti e ordine merge proposto al 10-bis

1. **PR #66 backend per prima**: IndexedDB, Career07/09 stadio/mercato/fiducia. Verificare HEAD esatto e smoke-test Node su main immediatamente dopo un eventuale merge *autorizzato dal proprietario*.
2. **PR #63 UI per seconda**: import dinamici e viste dipendono dagli adapter backend. Controllare nuovamente che GitHub la mostri mergeable rispetto al nuovo main, poi Node + HTTP/Chromium mirato su main, solo previo consenso proprietario.
3. **PR #67: NON MERGIARE MAI**; è una copia temporanea della combinazione tecnica per QA, non la strategia di integrazione.
4. Anche la **PR documentale di questo audit** non deve essere confusa con un merge del gioco. Il 10-bis chiede al proprietario l'autorizzazione prima di ciascun merge.

**Verdetto complessivo:** **PASS / BETA_PLAYABLE TECNICAMENTE NEL CHECKOUT COMBINATO R11**; passaggio al merge **raccomandabile con autorizzazione**, poi playtest Android landscape reale. Nessun merge eseguito dall'Agente00.
