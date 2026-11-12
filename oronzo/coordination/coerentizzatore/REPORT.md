# ORONZO — Agente00 · audit indipendente anticipato R11

Mandato: audit **intermedio** del codice pubblicato, nessuna certificazione finale U1–U9, nessun merge e nessuna modifica al codice produttivo. Gli esiti valgono soltanto per gli SHA fissati:

| PR | Commit congelato | Ruolo |
| --- | --- | --- |
| #63 | `8fd4df94cc477d909f165cffecaeeb07f8871f81` | UI |
| #66 | `575f8c56cf477833e0b8dbfced407a83e2265f2f` | Backend |
| #67 | `b2209762cd600425b9311a610bb8c8f946ace9e4` | Checkout combinato, draft, NON MERGIARE |

Main del mandato: `62c2e24b50c2189e952b628f1f0dbf1f38770e86`; REQUEST acquisito da main all'avvio (`d3c60651ffa96057fcb50a5bcf15f91bc347e450`). Checkout Git separato in detached HEAD su #67. Confronti indipendenti: nessuna differenza dei file `oronzo/assets/ui/**` fra #63 congelata e #67; nessuna differenza dei file `oronzo/app/flow/**` fra #66 e #67. Le PR separate non sono singolarmente la combinazione completa. Il nuovo HEAD #63 osservato all'avvio, `788025b79a0ef3d0935182c1fb9528dc73196f80`, differisce dal congelato soltanto nel REPORT dell'autore: non viene comunque certificato da questo audit.

## Matrice funzionale — combinazione congelata, non main pubblico

**Esito intermedio: porzioni certificate PASS PARZIALE; tre problemi UI NEEDS CHANGES. Nessuna approvazione di merge.** I singoli bug non annullano le prove positive sulle altre funzioni.

| Funzione | API presente | Adapter | UI raggiungibile | Test indipendente | Verdetto |
| --- | --- | --- | --- | --- | --- |
| U1 · Allenamento,5 piani,RECUPERO73 e avvisi save | 07/08/09 | Sì | Sì |10 casi Node +8 percorsi browser;73 persistito su slider/pulsanti; errore quota dichiarato | **PASS PARZIALE** |
| U2a · IndexedDB A/B,checksum,recovery,migrazione,export | Sì | Sì | Sì | Due snapshot autentici5.561.117/8.759.578 caratteri; quota localStorage osservata; IDB nativo,reload,corruzione e failure; download JSON | **PASS PARZIALE** |
| U2b · Import di uno stato valido a fine stagione | Sì | Sì | Ingresso sì; ripresa no | Importato il vero save1979 completo: stato season_complete ma vista entry e nessun SALVA/rollover | **NEEDS CHANGES** |
| U3 · Stadio,prezzo,affluenza,cassa | Sì | Sì | Sì | Cambio prezzo e fixture casalinga veri; ledger/cassa corretti; storico non legge revenue | **NEEDS CHANGES** per storico; transazione **PASS PARZIALE** |
| U4a · Presidente,richieste,mandato e acquisto | Sì | Sì | Sì | Decisioni reali e acquisto completato dalla UI; Node verifica due rose,costi e replay | **PASS PARZIALE** |
| U4b · Cessioni dalla UI | Sì | Sì | Sì | Backend compra/cede atomicamente nei test Node; selezione acquirente UI A-02→A-01 dopo invio | **NEEDS CHANGES** |
| U5 · Fiducia persistente da ordine individuale | Sì | Sì | Sì | Evento Engine06→09 applicato una volta; trust+1 e invariato dopo reload; nessun doppio effetto temporaneo | **PASS PARZIALE** |
| U6 ·600 cognomi nella nuova carriera e rosa | Sì | Sì | Sì | Tutti i player hanno surnameId/sourceId; dataset600; rosa,scheda e reload; percorso normale500 comuni distinto da QA | **PASS PARZIALE** |
| U7 · FULL/TV,tattiche,pressing,cambi,ordini | Sì | Sì | Sì | Snapshot invariato dallo switch; modulo3-5-2/pressing67; sostituzione reale; cambio GK incoerente rifiutato;22 giocatori/11PNG atlas e maschere caricati | **PASS PARZIALE** |
| U8 · Rosa,filtri,lavagna,campionato e calendario | Sì | Sì | Sì | GK e fitness; modulo4-3-3 reale prima del kickoff; calendario/next; ≥44px e scroll; due stagioni standard anche attraverso la UI | **PASS PARZIALE** nel perimetro provato |
| U8-extra · Identità fisica/ritratto individuale generato per ogni calciatore | Record opzionali | Fallback pronto | Scheda raggiungibile | I nuovi player provati non hanno visual+kit canonici; nessun portrait inventato | **NON INTEGRATO** come identità visiva completa di tutte le nuove rose |
| U9 · Tifosi,giornali,agenda e gestione settimana | Sì | Sì | Sì |5 risposte opening in archivio; rapporti salvati; match_pending non saltato;16 bye da agenda; report allenamento dopo advance e reload | **PASS PARZIALE** nel perimetro provato |

L'avanzamento completo di due stagioni **interamente tramite UI con reload dopo ogni settimana** ha una prova browser distinta, riportata sotto con il suo esito effettivo; non viene dedotto dal solo test Node o dalla CI dell'autore.

## Problemi riprodotti sul congelato

### R11-PIN-01 · P2 · storico incassi stadio legge un campo inesistente

`oronzo/assets/ui/sections-r11/sections.js:144–145`. Prezzo impostato a1500 dalla UI, partita Engine06 casalinga `1979:PROM:1:5`, successivo advance: ledger autentico `{attendance:709,revenue:1063500,priceITL:1500}` e cassa incrementata correttamente. La vista mostra **«Presenze709 · Incasso non registrato»** perché legge `revenueITL`, mentre il contratto09 e le nuove registrazioni usano `revenue`. Riproduzione su viewport e safe-area della matrice browser, screenshot `*-stadium-after-match.png` e ledger in `browser-matrix.json`.

Owner07B: normalizzare il campo del presentatore al ledger autentico, conservando eventuale compatibilità esplicita con vecchi salvataggi; non cambiare gli importi già contabilizzati. Retest UI→fixture casalinga→incasso visualizzato→reload→retry senza secondo accredito. Il backend stadio ora è collegato; il precedente blocco adapter non descrive più questa combinazione. I parametri restano sintetici di gameplay, etichettati come tali, senza valore storico.

### R11-PIN-02 · P2 · la cessione perde l'acquirente scelto

`oronzo/assets/ui/sections-r11/management-ui.js:39–54`; `career-r03.js:494–504`. Nel percorso **normale**, catalogo500 comuni, selezionata società acquirente `A-02`, prezzo1000 e giocatore della rosa; METTI IN VENDITA registra la pratica, poi renderizza il form con `A-01`. Il valore scelto non è persistito/ripristinato. La finalizzazione legge nuovamente il selettore corrente, pertanto può utilizzare il compratore di default anziché quello scelto inizialmente. **Verificato** il reset A-02→A-01; **inferito dal codice** il rischio sulla finalizzazione di quella specifica proposta, che non è stata completata dall'auditor. Separatamente, il trasferimento atomico di cessione API e un acquisto intero dalla UI sono stati eseguiti con successo.

Owner07B: conservare i termini della pratica per requestId e renderizzarli coerentemente fino alla decisione; non affidare la finalizzazione a valori di un form ricreato coi default. Retest cambiando acquirente e prezzo, passando per VALUTA/rerender/reload, quindi controllando club di destinazione e contabilità finale. `storage-management.json.saleBuyer`, screenshot `sale-buyer-reset.png`.

### R11-PIN-03 · P2 · import valido di fine stagione lascia il giocatore senza comandi

`oronzo/assets/ui/career-r03.js:134–141`. Importato dalla UI il vero `standard-one-season.json` generato dal test Engine06: checksum valido,1979,settimana39,stage `season_complete`. Dopo conferma, la carriera è in memoria ma `importSave()` instrada qualsiasi stato diverso da hub a entry. La UI propone «Premi SALVA», ma conta **zero** pulsanti SALVA e **zero** INIZIA NUOVA STAGIONE. Il salvataggio precedente resta preservato: non è una perdita della copia persistente, è una ripresa inutilizzabile del file importato.

Owner07B: condividere il routing per stage già usato da load, mostrando la destinazione e la conferma di salvataggio anche per opening/postmatch/fine stagione; mantenere la protezione del save precedente. Retest import/export nelle fasi supportate, rifiuto checksum errato e annullamento dialogo. `storage-management.json.importSeason`, screenshot `import-season-stranded.png`.

## Node eseguito indipendentemente

Cinque `node --check` su `career-r03.js`, `sections-r11/sections.js`, `controller.js`, `durable-save.js`, `management-r11.js`: PASS.

```sh
node --test oronzo/assets/ui/sections-r11/sections-r11.test.mjs \
  oronzo/assets/ui/qa/ui12-landing-nav.test.cjs \
  oronzo/app/flow/tests/r11-integration.test.mjs \
  oronzo/app/flow/tests/m1-contract.test.mjs \
  oronzo/app/flow/tests/m1-live.test.mjs \
  oronzo/systems/coach-club/management-r10.test.js
```

**63 PASS,0 FAIL,1 SKIP**,64 test, circa59,5s. Lo skip riguarda soltanto la prova opzionale con `fake-indexeddb` non installato: non spacciato per prova di quota browser. Le prove IndexedDB native del presente audit sono distinte. Incluse due stagioni standard vere con104 club,60 partite Engine06 e16 bye, checksum/reload,15 incassi casalinghi per anno, trasferimenti da due rose e contratti, presidente, finestra/mandato, fiducia post-shout.

Regressioni legacy eseguite anche con `node --test --test-reporter=spec oronzo/systems/career/tests/r04-save.test.mjs oronzo/systems/coach-club/period-r04.test.js`: **13/13 PASS**. Comprendono envelope V1/V2 firmati, ambiguità rifiutata senza sovrascrittura e periodi1985/1986. Non sono una nuova certificazione generale R10: servono a verificare la retrocompatibilità richiesta dal nuovo save.

Harness ulteriore scritto dall'auditor, `independent-node.mjs`: **10/10** casi (5 programmi × intensità0/100), selezione immutabile durante la settimana, nessun effetto anticipato, gara Engine06 e conferenze, confronto degli effetti e incidenti con output08 autentico, checksum/load, payroll una volta e retry stale senza mutazioni. Mondo ridotto a4 squadre/divisione soltanto in questi dieci test; non utilizzato per dichiarare le stagioni standard. Ulteriori guard wrong-club e seller inesistente senza side effect: PASS. Verifica indipendente del risultato standard:76 righe storia e76 chiavi payroll uniche per tutti i104 club,30 gare+8 bye per stagione e30 receipt casalinghe distinte (`standard-two-season-summary.json`).

## Prove browser, limiti e consegna

Chromium Headless Shell151.0.7922.34 via server HTTP dal checkout autentico; nessun HTML fixture e nessun route.fulfill. Viewport640×360,800×360,844×390,960×400, touch, insets zero o left24/right12/bottom16 tramite CDP. La modalità TEST del gioco è usata per il pulsante pubblico di conclusione rapida della gara con Engine06: non sostituisce il motore né inventa risultati; il catalogo geografico sintetico è visibilmente dichiarato. Il percorso normale con i500 comuni è distinto nelle prove specifiche.

**Matrice browser:8 percorsi completati,432 check,1556 misure di controlli.** Solo gli8 check sullo stesso difetto di storico incassi falliscono: nessun'altra violazione geometrica misurata, nessun pageerror o errore runtime. È provata la visibilità≥44px dei controlli usati; le liste scrollabili vengono portate in vista, senza pretendere che tutte le righe siano visibili insieme. File `browser-matrix.json`, screenshot delle sezioni per ciascuna configurazione.

**Storage/management browser separato:** percorso normale reale, mandato5000 approvato, acquisto reale completato con una sola presenza del player nell'intero mondo; export JSON scaricato dalla UI; errore quota iniettato sul provider produce NON PERSISTITO e retry riuscito; la quota localStorage è inoltre incontrata realmente con i due blob grandi. Entrambi gli slot IndexedDB sono verificati e caricabili, corruzione della copia attiva recupera1979, scrittura negata conserva quella copia, nuova scrittura e reload UI caricano1980/fine stagione. Migrazione R03: provider localstorage_legacy→indexeddb con tutti i byte dei vecchi slot intatti. Import corrotto rifiutato mantenendo lo stato corrente. È distinta la failure injection dalla quota native effettivamente osservata. `storage-management.json` e relativi screenshot.

**Prova lunga browser: PASS.** Due stagioni standard1979 e1980 percorse interamente tramite i pulsanti pubblici del gioco a844×390,touch,safe-area.60 gare Engine06,16 bye,76 programmi RECUPERO73 applicati,76 liquidazioni settimanali per tutti i club e76 ricaricamenti, con confronto SHA-256 del contenuto integrale prima/dopo reload e confronto dei riepiloghi di stato. Dopo ogni bye, nessuna nuova gara Engine06 o conferenza del mister; ledger allenamenti senza duplicati.15 incassi casalinghi alla fine del1979 e30 cumulati alla fine del1980. Entrambi i rollover effettuati dalla UI e ricaricati, fino al1981. `two-season-browser.json`, log e screenshot dei16 bye/fine stagione. Uno dei primi tentativi dell'harness è stato interrotto dall'ambiente; l'esito qui riportato deriva dalla successiva esecuzione completa, non da quella interrotta.

La verifica lunga chiude il precedente blocco di persistenza della settimana31 **sulla combinazione fissata**. Non estende questo risultato al main pubblico, al telefono fisico o ad altri commit. Restano i tre NEEDS CHANGES riprodotti e la mancata integrazione delle identità visive complete. La cessione completa dalla UI non è attestata: la prova si è fermata al reset dell’acquirente; la transazione API è invece provata. Non estendere i PASS ai flussi non completati.

La pipeline dell'autore Actions42711637028 risulta success su #67; artifact13715589317 identificato/recuperato. I suoi64/74 PASS non vengono contati come prove indipendenti. Il REPORT dell'autore nel congelato è più vecchio del codice: il perimetro di questo audit deriva da diff e runtime, non dalla descrizione storica.

Android fisico e deploy GitHub Pages non attestati. Non è stata attesa una gara per15 minuti di orologio a1×: le conclusioni rapide usano il comando QA dell'Engine06 reale. Foto/ritratto canonico non attribuito ai giocatori privi di `visual`+kit: il fallback dichiarato è verificato, non costituisce integrazione di un ritratto individuale. La grafica CSS dello stadio non è certificata come nuovo asset PNG rifinito.

La successiva consegna finale07B richiede solo delta-review dagli SHA fissati, correzioni dei bug riprodotti e completamento dei percorsi esplicitamente NON_CERTIFICATO/NON_INTEGRATO. Non si richiede di fermare o riscrivere il lavoro in corso. Nessun file tecnico, NEXT, branch produttivo o asset è stato modificato.

## Indicazioni al10-bis

1. Conservare i PASS PARZIALI già documentati; nella consegna finale07B correggere i tre punti mirati di UI (incassi,acquirente cessione,routing import), senza riaprire i moduli05/06/08/09 già funzionanti.
2. Richiedere la successiva delta-review degli eventuali nuovi commit e dei soli retest collegati. #63 successiva osservata `788025b…`: diff solo REPORT, codice congelato invariato; #66/#67 ancora sugli SHA fissati al ricontrollo. Qualsiasi commit ulteriore resta fuori da questi esiti.
3. Nessun merge automatico e nessun merge della draft#67. Il successivo playtest Android fisico resta distinto dalla presente emulazione; il presente rapporto è intermedio, non la chiusura finale R11.

## Archivio delle prove

[ORONZO-R11-audit-heads-congelati.zip](https://chatgpt.com/library?file_id=libfile_1b40505da3e881918ae9e9feb83a6b65&account_id=personal) — screenshot,log,harness indipendenti,stati autentici e hash Git degli input.
