# ORONZO — MEMORIA OPERATIVA PERSISTENTE DELL'ORCHESTRATORE

**Proprietario operativo:** chat principale di ChatGPT ORONZO (orchestratore).
**Aggiornamento del registro:** 7 novembre 2026.
**Fonte di verità:** repository `CzekUns/cercax`, branch `main`, cartella `oronzo/coordination/`. Gli stati vanno ricontrollati su GitHub quando si riprende il lavoro; non assumere che queste note siano aggiornamenti in tempo reale.

## Scopo del progetto e decisioni confermate
- Videogioco manageriale calcistico per smartphone **ESCLUSIVAMENTE orizzontale 16:9**, ambientato nell'Italia provinciale della stagione 1985–86, inizio dalla **Promozione** (non Eccellenza), progressione fino alla Serie A.
- Il giocatore è **allenatore**: undici titolare, tattiche, ordini durante la gara, sostituzioni, allenamenti e spogliatoio; la **società**, distinta dal mister, gestisce budget, mercato e contratti, e può dissentire.
- Partita visibile in pixel art come giochi calcistici 1990–95: **90 minuti simulati in ~90 secondi reali**, pausa e velocità regolabile. I risultati provengono dalle azioni reali dell'engine, non dal renderer.
- Sprite e cutscene **rifiniti fin dal primo rilascio** come atmosfera delle reference, senza cubetti o wireframe; sprite ricolorabili per pelle, capelli e fantasie di divisa. Reference: https://drive.google.com/drive/folders/1kfDVXXUYL1G7JemAhlWGTPmtAv0KKoCQ.
- Comicità da provincia calcistica anni Ottanta e umorismo ambientale gestionale tipo Theme Hospital; personaggi originali, niente citazioni o somiglianze quasi identiche a personaggi/volti cinematografici. Presidente e direttore sportivo devono avere caratteri e decisioni effettive.
- Il codice esistente in `oronzo/game.js` è una **alpha provvisoria**. Moduli degli agenti da integrare soltanto dopo test. La root della repo ospita CercaX e non va alterata.

## Identità e governance
- Questa chat rimane **orchestratore principale**, responsabile di decisioni, revisione finale, merge, integrazione e aggiornamento di `NEXT.md` per i 9 agenti.
- `Coerentizzatore` è un **revisore ausiliario in una chat Work separata**: deve agire solo su incarico esplicito, senza autonomi merge, senza aggiornare `NEXT.md`, senza modificare i file del gioco o comandare agenti. Vedi `coerentizzatore/RUN.md`.
- Work va usato **con parsimonia**: per una revisione incrociata complessa, prima di un'integrazione significativa o quando emerge un blocco tecnico non risolvibile efficientemente in questa chat. Per i controlli ordinari usare questa chat e gli strumenti GitHub standard.
- Le chat non si avvisano automaticamente. La persistenza è garantita da **file versionati su GitHub**, non da esecuzione continua: per riprendere rileggere questo file, `REVIEW-QUEUE.md`, `PROTOCOL.md`, `registry.json` e i 9 `NEXT.md`.
- Solo la chat principale aggiorna **questo** registro e `REVIEW-QUEUE.md` dopo il lavoro effettivamente compiuto. Evitare affermazioni di test o merge non effettuati.

## Nove agenti
`01` grafica calciatori; `02` cutscene; `03` UI; `04` copy/comedy; `05` match-view; `06` match-engine; `07` career; `08` attributes/training; `09` coach/club/presidents.
Ogni agente ha una cartella `oronzo/coordination/NN-*/`: `IDENTITY.md`, `RUN.md`, `NEXT.md`; crea il proprio `REPORT.md` nel branch della PR. Gli agenti **non possono fare merge** e non aggiornano NEXT.

## Stato rilevato all'istituzione del sistema (da riverificare)
- PR [#6](https://github.com/CzekUns/cercax/pull/6), agente 01: sprite, da QA, non merged.
- PR [#12](https://github.com/CzekUns/cercax/pull/12), agente 02: cutscene, da QA, non merged.
- PR [#5](https://github.com/CzekUns/cercax/pull/5), agente 03: UI, da QA, non merged.
- PR [#13](https://github.com/CzekUns/cercax/pull/13), agente 04: copy; verificati in prima battuta 16 personaggi, 57 eventi, 144 microcopy, 26 dialoghi. **Blocco identificato:** manca `oronzo/content/presidents.json`; è stato comunicato all'agente e segnato `FIX_REQUESTED` nel suo `NEXT.md`. PR non merged.
- Agenti 05–09: issue e specifiche predisposte; verificare prima se nuove PR siano apparse.
- Nessuna delle quattro PR sopra è stata approvata né integrata al momento della creazione del sistema di coordinamento. Uno stato GitHub `mergeable` non è QA.

## Flusso di controllo e ripresa
1. Leggere `oronzo/coordination/REVIEW-QUEUE.md`, issue/PR effettive e report degli agenti.
2. Valutare i deliverable: validità asset/JSON/JS, qualità artistica, test riproducibili, coerenza dei contratti `asset-contract.md`, `narrative-contract.md`, `engine-contract.md`, ownership dei file.
3. Chiedere correzioni nelle issue/PR, oppure mergiare **solo PR revisionate**. Usare controllo dell'HEAD SHA e annotare lo SHA integrato.
4. Aggiornare `NEXT.md` dell'agente su `main` con lavori successivi; ogni chat agente riparte dal proprio prompt permanente.
5. Collegare progressivamente i sistemi nel runtime solo dopo stabilità delle API. Testare la demo da smartphone landscape.
6. Delegare a Coerentizzatore **solo verifiche mirate che meritano Work**, richiedendo una lista di problemi con prove, impatto e suggerimenti eseguibili. L'orchestratore resta responsabile della decisione.

## Ripristino rapido del contesto
Quando la chat principale si interrompe, è sufficiente dire: «Riprendi l'orchestrazione di ORONZO leggendo `oronzo/coordination/ORCHESTRATOR.md`, `REVIEW-QUEUE.md` e i 9 NEXT su `CzekUns/cercax`. Controlla GitHub e continua dal primo lavoro non completato, senza rifare i passaggi già confermati».

## Revisione oraria del 7 novembre 2026 — R01 recepito
- Sono aperte tutte le 9 PR degli agenti: #6, #12, #5, #13, #15, #18, #14, #16, #17; nessuna mergiata durante questa revisione. L'audit Work mirato è stato consegnato in [PR #19](https://github.com/CzekUns/cercax/pull/19) (sola documentazione, non mergiata).
- Il rapporto R01 dichiara 39 test passati (non rieseguiti dall'orchestratore) e 5 incompatibilità P1 fra motore #18, vista #15 e attributi #16; vedere `REVIEW-QUEUE.md` per ID, prove e ownership. Nessun P0 nell'audit mirato. #15 e #18 `FIX_REQUESTED`; #16 rimane `WAIT_REVIEW`, pronto per QA dell'orchestratore.
- `NEXT.md` degli agenti 05 e 06 aggiornati con correzioni; quello di 08 con esito audit. PR #13 ancora priva di `oronzo/content/presidents.json` su HEAD verificato; agente 04 resta `FIX_REQUESTED`.
- Metadati GitHub: PR #5,#6,#12,#13,#14,#17 risultavano `mergeable=false`; #15,#16,#18,#19 `mergeable=true`. La causa dei false è da isolare. Mergeability non equivale a QA.
- Prossima azione: attendere fix agenti 05/06, verificare conflitti e report degli altri agenti, rieseguire test integrati e QA visuale; non avviare una seconda sessione Work sul medesimo problema.

## Revisione oraria R02 — verifica indipendente della mergeability
- Il campo `mergeable` restituito da `get_pr_info` si è rivelato **inaffidabile** per queste PR: REST diretto `GET /pulls/{n}` mostra `mergeable=true`, `mergeable_state=clean` per tutte e 10 le PR aperte (#5,#6,#12,#13,#14,#15,#16,#17,#18,#19), contrariamente al precedente rapporto di sei conflitti. PR #12 resta draft. La rettifica è registrata in REVIEW-QUEUE; non chiedere ai sei agenti di risolvere conflitti non dimostrati.
- Nessun nuovo commit ai moduli core #15/#16/#18, quindi le cinque incompatibilità P1 dell'audit R01 restano da correggere. PR #13 continua senza presidents.json.
- Le nove cartelle NEXT sono state lette; nessun REPORT.md presente sui branch originali al momento del controllo. Tutte le PR contengono solo file `oronzo/**` secondo i loro elenchi GitHub. Nessun test o merge effettuato in R02.
