# Catalogo M1 congelato — 600 cognomi da Bergamo 2021

Il catalogo in uso **per default dal generatore** è `data/bergamo-2021-m1.js` (600 record unici, ciascuno `{id,name,frequency}`). Snapshot indipendente, versionato, importato senza modificare branch di ricerca #40, Git commit `0b9eedd4070c10beb164e929d4740354663bf86d`, Git blob originale `de098d57f1ce47be4cd07ecfb64ba213a6835663`; licenza e metadati originali nel branch ricerca `oronzo/data/research/sources.json`.

- **Ente:** Comune di Bergamo, dataset [Serie storica cognomi più diffusi](https://www.dati.lombardia.it/d/4pqu-7zkd), Open Data Regione Lombardia; dichiarazione licenza dataset **CC0 1.0** (Public Domain Dedication); metadati fonte [API views/4pqu-7zkd](https://www.dati.lombardia.it/api/views/4pqu-7zkd.json), richiamata dall'archivio fonti #40. Il portale generale offre anche FAQ IODL2.0, ma la scheda dataset specifica CC0; conservarne la provenienza e non rimuovere l'attribuzione editoriale.
- **Periodo/dominio:** anno 2021, **residenti con cittadinanza italiana** nel solo Comune di Bergamo. Le 600 voci importate hanno frequenze locali documentate 11–16, soltanto record pubblicati con numerosità >10. La selezione del campione di ricerca è per frequenza locale crescente, **non** classifica italiana/nazionale, non prova etimologica né cognomi storicamente frequenti nel 1979.
- **Audit:** 600 nomi normalizzati distinti, 600 ID originari univoci, 0 record non validi, nessun `nationalRank` valorizzato; mantenuti ID con spazi e apostrofi (es. `it-surname-de feudis`, `it-surname-d'avanzo`). Deduplica su NFC/casefold e apostrofi tipografici equiparati, **spazi conservati** (es. `Di Stefano` distinto da `Distefano`).
- **Moduli:** `surnames.js` importa/valida `BERGAMO_2021_RECORDS` e `BERGAMO_2021_METADATA` dal file congelato e pubblica `BUILTIN_SURNAME_CATALOG`. La selezione tramite `chooseSurname` conserva ID indipendente dalla posizione in elenco. Nuovi calciatori usano i 600 record, quelli già salvati non si rigenerano.
- **Campione storico:** il precedente `surname-sample.csv` con 20 cognomi comuni da Wikipedia CC BY-SA resta esclusivamente fixture dei test R02. Non è il catalogo M1.

# Fonti per nomi — R02

La pipeline di gioco distingue *dati riutilizzabili* da *repertori ancora non verificati*. `surname-sample.csv` contiene **20 cognomi diffusi**, esclusivamente per validare la pipeline di caricamento e la demo.

## Campione italiano (in repository)

- Fonte consultata: [List of most common surnames in European countries — sezione Italy](https://en.wikipedia.org/wiki/List_of_most_common_surnames_in_European_countries#Italy), Wikipedia contributors; la tabella cita Mappa dei Cognomi e presenta stime delle famiglie, **non un censimento ISTAT**.
- Licenza della pubblicazione: [Creative Commons BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Rispettare attribuzione e share-alike per contenuti soggetti a tale licenza. `surname-sample.source.json` contiene il riferimento macchina.
- Anno `2026`: solo consultazione; riferimento temporale delle stime **non accertato**. I valori sono campione di test, non una distribuzione nazionale certificata e non appartengono alla stagione 1979.
- Non associare statistiche del cognome a luogo di origine del singolo giocatore. Il comune di nascita è estratto da un dataset indipendente dell'Agente 07.

## Sorgente integrale candidata (non inclusa)

- [Onomaverse Global Surname Frequency v2026.10](https://github.com/onomaverse/datasets/releases/tag/v2026.10), titolare Onomaverse, CC BY 4.0. Il dataset pubblica la quota nei record disponibili per nazione; non si tratta di conteggi esatti della popolazione.
- Schema `name,name_id,country_code,country_name,pct_in_country,origin`. Filtrare `IT` e ordinare `pct_in_country` crescente; validare che il sottoinsieme contenga effettivamente almeno 5.000 cognomi prima di annunciare il completamento. `loadSurnameCSV` supporta direttamente lo schema e impone un limite massimo di 5.000.
- Attribuzione richiesta: **Names data from Onomaverse (https://onomaverse.com/datasets), licensed CC BY 4.0.**
- Condizione di completamento: estrazione IT verificata con conteggio, data/licenza, deduplica/varianti e congelamento della versione nel save. Senza i record reali non creare frequenze artificiali.

Le cifre sintetiche nei soli test sono esplicitamente fixture artificiali, non fonti demografiche.
