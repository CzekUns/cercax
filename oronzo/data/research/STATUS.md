# ORONZO — Research dataset

Verifica 2026-11-07: **100 comuni validati**, **0 cognomi validati**; **0 ranking nazionali verificati**. Target M1: 100 comuni / 500 cognomi; espansione 500 / 5000.

Batch 1: 20 Valle d'Aosta; batch 2: 30 Molise; batch 3: 25 Abruzzo; batch 4: **25 Basilicata**, selezionati per popolazione crescente nel file regionale. Non sono classifiche nazionali e non descrivono il 1979.

ID ISTAT univoci: 100; duplicati scartati nel batch 4: 106 record non selezionati (non necessariamente duplicati); duplicati effettivi nei 100 record salvati: 0. Nuovi record batch 4: 25. Popolazioni contemporanee senza anno puntuale attestato; 2026 indica lo snapshot, non l'anno demografico. Fonte derivata da ISTAT con attribuzione RP92, licenza dichiarata CC BY 4.0; obblighi di attribuzione prima del rilascio. Vedi sources.json. Nessun dato personale.

Blocco: catalogo cognomi con licenza e provenienza verificabili non ancora importato. L'agente 08 gestirà importazione e persistenza dopo QA. Nessuna modifica a runtime, generatori, NEXT o salvataggi.

Batch 5 (2026-11-07): 500 cognomi distinti estratti da 2021 Bergamo, soli residenti con cittadinanza 'Italiani' e frequenza pubblicata >10, ordinati per frequenza comunale crescente. Duplicati scartati per cognome normalizzato: 0. 500/500 soglia cognomi M1 raggiunta; insieme ai 100 comuni, dataset di ricerca iniziale disponibile nella PR per validazione agenti 07/08 (NON integrato nel runtime). Ranking nazionale verificato: 0; 500 frequenze **locali** presenti nella fonte. Licenza CC0 1.0 attestata nello snapshot della metadata ufficiale del Comune di Bergamo; dati demografici 2021, non 1979. Il dataset non certifica che tutti i cognomi siano esclusivamente di origine italiana: certifica la cittadinanza italiana della categoria statistica.
