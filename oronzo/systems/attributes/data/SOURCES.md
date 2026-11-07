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
