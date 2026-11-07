# NEXT — ORONZO AGENTE 10 · SOLO ORCHESTRAZIONE
**Stato:** `WORKING` (coordinamento attivo; non sviluppo del gioco).
**Specifica utente:** [GAME-VISION-v02.md](../GAME-VISION-v02.md) · [Google Drive](https://docs.google.com/document/d/1k52clWWRcD3CMvD_HsX1ke7zdiVAY_AHp2MT9KfDEG0/edit).
**Epic:** [#25](https://github.com/CzekUns/cercax/issues/25) · **integrazione delegata:** [#26](https://github.com/CzekUns/cercax/issues/26).

## Prossimi passi del coordinatore (SOLO governance)
1. Sorvegliare REPORT/PR degli agenti e verificare incarichi, dipendenze e stato effettivo. Distinguere READY da una sessione realmente attiva.
2. **Prima priorità:** agenti 07 e 09 devono chiudere, testare e consegnare i fix R02 su ID presidente, obiettivi, stipendi, settimane assolute e persistenza mister. Non aprire ora nuova integrazione che presupponga moduli non corretti.
3. Agente 03 consegna prima kit UI dinamico nel suo scope attuale `oronzo/assets/ui/`. Dopo merge del ciclo artistico e dopo gate R02, autorizza un ciclo separato per la **UI runtime** (`index.html`, `game.js`, `ui.css`, `partita-rapida.html`), che sarà di sua esclusiva competenza. La UI consuma gli adapter, non duplica la logica.
4. Agente 07, dopo merge R02, riceve un nuovo ciclo per il **game-flow e gli adapter** in `oronzo/app/flow/` oltre alla propria career, con nuovo campo di proprietà esplicitato in contratto/IDENTITY/NEXT. Non farlo partire prematuramente.
5. Invia a 04,05,06,08,09 i requisiti necessari alla carriera morale/1979/società/telecamera/ordini; verifica compatibilità degli schemi, documenta cause dei rifiuti e richiedi correzioni prima del merge.
6. Valuta il primo percorso completo Nuova/Carica→avatar→20 ingaggi→presidente→rosa→5 domande→hub→match→stampa→morale→save/load usando i test e screenshot consegnati dagli agenti. Se manca una prova, segna il gate come aperto.
7. Aggiorna issue, NEXT, registro e stato delle PR. **Non scrivere codice del gioco**.

## Stato riscontrato
Partita rapida separata disponibile, PR #24 integrata; PR #12 cutscene in draft; cinque P1 R02 non ancora confermati come risolti nell'ultimo controllo; visione v0.2 documentata ma non implementata completamente. Evita affermazioni di avvio automatico dei nove agenti.

## Riscontro LIVE dopo riavvio degli agenti (7 novembre 2026)
- NEXT 01–09 aggiornati con situazione dei branch e criteri attesi; non si è modificato codice di gioco.
- **P0 bloccante:** 07 R02 branch senza diff proprio, 09 R02 6 commit su sei file ma REPORT/PR e cross-test ancora assenti. Lavoro 09 in corso, niente merge; il 07 deve consegnare campo salario, presidentId, obiettivi, absoluteWeek e coach coerenti con le API dell'09.
- 04 e 06 hanno un primo commit di secondo ciclo e nessuna PR; 01,03,08 sono senza commit propri ai primi confronti; 05 branch R02 ancora non risolto via compare; 02 WAIT_REVIEW su PR #12 draft. PR #27 R03 non costituisce QA integrata.
- **Prossimo passaggio** dopo le due PR 07/09: leggere diff/REPORT, verificare test realmente eseguiti su due stagioni, eventuale review/merge; SOLO allora autorizzare il nuovo NEXT 07 per adapter `oronzo/app/flow/`. Il NEXT 03 per il runtime resta sospeso sino ai merge R02 e kit UI art. L'Agente 10 non scrive codice.

## Mandato di audit R04 a Work 00 — 7 novembre 2026
**Stato PR:** otto nuove PR R02 aperte: #30 (07), #32 (09), #33 (03), #28 (05), #35 (06), #31 (08), #34 (04), #29 (01). #12 cutscenes ancora DRAFT; #27 R03 prematuro da non mergiare.
**Consegnati:** i nove REPORT del ciclo corrente/precedente sono leggibili sui branch PR; nuovi REPORT R02 disponibili per agenti 01,03–09. R02 #30 dichiara 19/19 Node; #32 32/32 V8 + Node parziale; servono test cross reali sui due HEAD combinati.
**Decisione di governance:** tutti gli otto agenti con R02 consegnata sono stati portati a `WAIT_REVIEW`; Work 00 ha incarico specifico in `coerentizzatore/REQUEST.md` per l'audit R04 e **merge condizionati** concessi eccezionalmente dall'utente. Agente 10 non scrive codice né esegue merge durante questa delega. 
**Due rischi P1 da verificare:** 06 usa `origin.regionId/macroRegion` e `encourage/harsh`; 08 produce `origin.regione/macroregione` e `gentle/hard`. Le modifiche temporanee e persistenti agli effetti `shout` non vanno applicate due volte; test espressi e mapping necessari prima di collegare. #31 ha 20 cognomi demo, NON 5000 verificati; UI #33 contiene mock data, non il ciclo carriera giocabile.
**Ramo futuro 07 `oronzo/app/flow/`:** autorizzare NEXT nuovo solo DOPO #30+#32 entrambi mergiati e test sul main. **Ramo futuro 03 runtime:** autorizzare NEXT nuovo solo DOPO #33 + R02 07/09 e adapter 07 disponibile o stabilmente contrattualizzato. La direzione stile dialoghi è ancora in discussione, non definitiva.


## Decisione e audit R04 verificati — 7 novembre 2026
- [#36](https://github.com/CzekUns/cercax/pull/36) audit R04: 50 PASS/1 FAIL su suite 07+09 combinata, doppio pagamento di ledger V1 riprodotto (R04-1), fixture 09 payroll obsoleta (R04-2), incompatibilità schemi ordini 06/08 (R04-3/4); gate browser HOLD #28/#29/#33, #12 DRAFT.
- [#34](https://github.com/CzekUns/cercax/pull/34) **MERGED**: commit `b8976cb2b0129de9ee6537e1d624abce9ff1402f`. Cinque file content su main verificati SHA uguali al branch; tono creativo ancora in discussione. 04 è BLOCKED per nuova scrittura editoriale fino a conferma stile, ma codice stampa disponibile ai consumer.
- **NEXT aggiornati:** 07/09/06/08 `FIX_REQUESTED` sulle PR esistenti; 01/03/05/02 `WAIT_REVIEW/HOLD` per browser/arte; 04 `BLOCKED` dopo merge tecnico. Nessun merge nuovo o patch codice di gioco da 10.
- **Direttiva M1 utente:** 100 comuni e 500 cognomi verificati bastano al primo rilascio; finalità estesa 500/5000. Automazione oraria ORONZO attiva con prompt già comprensivo di raccolta nel branch dati; branch/PR research non ancora verificata disponibile al controllo. 07/08 integrano solo quando il batch è realmente acquisito e validato.
- **GATE** autorizzazione ciclo 07 `oronzo/app/flow/`: subordinata al merge #30 + #32 e suite green Node sulla nuova main. **GATE** 03 runtime: subordinato a #33 (browser+art) mergeato e API/adapter 07 affidabili. Preparare istruzioni future, non abilitare nel NEXT corrente.
- Prossimo controllo: nuovi HEAD #30/#32 con test V1/V2 e #31/#35 con eventId/tone/origin, poi browser QA. R04 Work 00 è concluso; nessun permesso di merge permanente.
