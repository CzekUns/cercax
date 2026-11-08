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

## Revisione oraria R03 — difetto finanziario
- Verificato su GitHub che tutte le 10 PR sono ancora aperte, senza cambiamenti degli HEAD rispetto a R02; la PR #12 è draft. Tutti i 9 NEXT letti, nessuno dei 9 REPORT.md presente sui branch. Consultate le nove issue richieste e i contratti su main.
- Nuovo **ORZ-P1-008** nella PR #17: `oronzo/systems/coach-club/finance.js` permette importi monetari negativi, e un'uscita negativa aumenta la cassa. Verifica **statica del codice**, senza esecuzione test; l'agente 09 è stato impostato `FIX_REQUESTED` nel suo NEXT su main, con richiesta di validazione e test regressione. Vedi REVIEW-QUEUE.
- Non sono stati fatti merge, test runtime, correzioni al codice o nuovi incarichi Work. Gli altri problemi già registrati restano aperti; evitare duplicati.

## Revisione oraria R05 — 7 novembre 2026
- Controllati LIVE i 10 HEAD PR (#5,#6,#12–#19), ancora invariati; #12 draft. Letti i 9 NEXT, ricercati i 9 REPORT.md sui branch (tutti assenti), consultate le 9 issue richieste e i contratti condivisi. Nessun nuovo fix consegnato.
- Corretto in `REVIEW-QUEUE.md` un disallineamento puramente documentale: PR #17 era `WAIT_REVIEW` nella tabella, mentre il NEXT dell'agente 09 è già `FIX_REQUESTED` dalla R03 per ORZ-P1-008. Non duplicare l'issue.
- Esaminati staticamente i file `career.js`, `league.js`, `progression.js`, `save.js` (PR #14) e `finance.js` (PR #17). Nessun nuovo difetto dimostrato da assegnare. Nessun test runtime, nessun merge, nessun intervento sul codice, nessuna sessione Work.
- Restano prioritarie le correzioni già assegnate ai moduli 04/05/06/09 e i REPORT.md mancanti. Prossima revisione: cercare nuovi HEAD, test e rapporti, evitando audit duplicati.


## Supervisione manuale e merge — 7 novembre 2026, mattina (STATO ATTUALE)
La presente sezione **sostituisce i vecchi snapshot storici precedenti su PR ancora aperte**. Sono stati effettuati e confermati tramite GitHub `merge_pull_request` con SHA HEAD atteso **sette merge**:
- [PR #19](https://github.com/CzekUns/cercax/pull/19): rapporto Coerentizzatore R01, merge commit `e3e1b85cfcbaac66db82d8e6b34042052e52e8d2`.
- [PR #13](https://github.com/CzekUns/cercax/pull/13): Copy e 8 presidenti, merge `065dc4ee7e59e26612b14c471b9c2be99f43cad1`; verificati JSON e 23 personaggi, 73 eventi, 42 dialoghi, 144 microcopy.
- [PR #16](https://github.com/CzekUns/cercax/pull/16): attributi e allenamento, merge `389dce444a7f7c19254381bfda2205acc4268f51`; audit R01 la considerava pronta per QA, 15 test dichiarti dall'agente.
- [PR #5](https://github.com/CzekUns/cercax/pull/5): UI art direction, merge `ad84dd134b98d5fde8017af3da5e6e7b1b21e63e`; mockup 16:9 esaminati visivamente da GitHub su scelta allenatore, match HUD, tattiche, rosa.
- [PR #6](https://github.com/CzekUns/cercax/pull/6): sprite/palette, merge `3585b39596e6aa879c69e2136f8f22e2ca1ea102`; preview PNG esaminata visivamente, QA raster e ricolorazione dichiarata dall'agente.
- [PR #14](https://github.com/CzekUns/cercax/pull/14): carriera, merge `bb9e384796fdd8fd7ad8b7f200cc5902511442e1`; agente dichiara 11 test Node superati e correzione salvataggio. Integrazione reale con board non ancora provata.
- [PR #17](https://github.com/CzekUns/cercax/pull/17): società, finanza, allenatore e presidenti, merge `7309f1fe908e2e62b4304f44261d026d2866755c`; fix sicurezza importi con 9 Node test e 14 V8 test dichiarati; da integrare con carriera/copy.

**Ancora non mergiate:**
- [PR #12](https://github.com/CzekUns/cercax/pull/12), agente 02: OPEN **draft**, PNG/cutscene strutturalmente verificati dall'agente e tavola esaminata; necessaria approvazione artistica e gate di review prima del merge.
- [PR #15](https://github.com/CzekUns/cercax/pull/15), agente 05: OPEN `FIX_REQUESTED`, differenza `facing` engine radians vs renderer ±1. Verificata direttamente in `interpolation.js` vs `movement.js`, richiesta patch in NEXT e commento PR.
- [PR #18](https://github.com/CzekUns/cercax/pull/18), agente 06: OPEN, fix precedenti dichiarati e test V8; attendere aggiornamento renderer e test veri combinati prima del merge.

**Nuovo audit Work R02:** incarico pronto ma NON avviato in `oronzo/coordination/coerentizzatore/REQUEST.md`: verificare soltanto compatibilità dei sistemi **carriera #14 + società #17 + copy #13 già su main**, in particolare presidentId, obiettivi board, cassa/paghe, persistenza e mapping; non usare Work per controlli ordinari. Primo audit R01 è già archiviato.

I NEXT sono stati aggiornati: 1 e 3 `READY` per iterazioni di QA/layout; 4,7,8,9 `BLOCKED` in attesa di integrazione/audit; 5 `FIX_REQUESTED`; 2 e 6 restano in revisione. Non aprire nuovi cicli di codice fuori da questi gate.

**Avvertenza fondamentale:** i merge qui sopra **aggiungono moduli e asset al repository, ma non li cablano automaticamente** nel vecchio runtime `oronzo/game.js`. Il prossimo lavoro principale dell'orchestratore sarà uno slice verticale di integrazione, una volta superate PR #15 e #18, con QA browser landscape. I test nativi Node completi non sono stati ripetuti tutti in questa chat, perché il container non risolve github.com per scaricare il repo. Non dichiarare demo finale integrata o browser QA completata.

## Nuovo ciclo: audit R02 e prima Partita rapida pubblicata — 7 novembre 2026
- **Audit R02:** [PR #20](https://github.com/CzekUns/cercax/pull/20) rapporto Coerentizzatore mergiato (`7212806be`). Cinque P1 verificati su presidenti/obiettivi/salari/rollover/allenatore. Agenti 7 e 9 hanno NEXT `READY` per i fix, nessun audit Work ripetuto.
- **Match engine/renderer:** PR #15 MERGIATA (`9dc68d21`), PR #18 MERGIATA (`d98a2226`); contratto `facing` numerico in radianti verificato in V8; eventi e risultato restano proprietà del motore.
- **Partita rapida:** [PR #21](https://github.com/CzekUns/cercax/pull/21) MERGIATA (`a0c2f9a8`) con pagina `oronzo/partita-rapida.html`, accessibile via percorso GitHub Pages `https://czekuns.github.io/cercax/oronzo/partita-rapida.html`. Deploy Pages completato con successo (Actions). Sul browser/Android resta **QA manuale da eseguire**, perciò niente dichiarazioni di release stabile.
- Test V8 realmente eseguito dall'orchestratore su sorgenti match engine: partita 22 calciatori, sostituzioni e comandi accettati, pausa e 2×, clock 5400, punteggio 0–2 con due eventi gol, PASS. Sei test Node smoke consegnati ma non eseguiti nativamente.
- **Cutscene #12** ancora draft; fallback eventi resta presente. La pagina è indipendente dalla carriera e non aggiorna salvataggi/serie.
- I NEXT di 05 e 06 sono READY per QA/bilanciamento, NEXT 07 e 09 READY per fix R02; Coerentizzatore COMPLETED_R02, non avviare audit nuovo.
- Azione successiva: ricevere bug dal test telefono, eseguire QA browser dei 22 sprite e correggere; integrare cutscene soltanto dopo gate QA; poi collegare Partita rapida a carriera corretta.



## Revisione tattica visibile — feedback prova smartphone, 7 novembre 2026
L'utente conferma che la velocità **1× = 15 minuti** è corretta e desidera accelerazioni opzionali. Segnala invece che durante la gara non si capisce se i cambi modulo e gli ordini siano eseguiti.
- **Esame del motore**: `executeCommand(tacticChange)` accetta l'ordine e aggiorna `team.tactics`; `movement.desired()` legge modulo, mentalità e pressing ad ogni step. Prova deterministica in V8 dopo l'ordine 4-4-2→3-5-2 / pressing 80 / mentalità 80: **10 su 11** dei giocatori di casa hanno coordinate diverse rispetto al controllo identico dopo 30 secondi simulati. Problema primario di **leggibilità/feedback tattico**, non di ricezione del comando.
- Integrata [PR #23](https://github.com/CzekUns/cercax/pull/23), merge `d7e38401d59c3c5b6220a7e6a027b4d9a76e9f1c`: il pannello mostra modulo/pressing/mentalità **accettati dal motore**; un overlay SVG rappresenta undici posizioni di riferimento del nuovo modulo usando la funzione `formationAnchors()` effettiva e specchia lo schema all'intervallo; indicazione riposizionamento, toggle SCHEMA. Gli atleti non vengono teletrasportati.
- Test di regressione aggiunto nel smoke Node; prova V8 eseguita sui sorgenti reali e sintassi UI PASS. QA visuale su Android **ancora da raccogliere**. I 15 minuti a 1× **non sono stati modificati**.
- Dopo deploy Pages, far riprovare al telefono 4-4-2→3-5-2 a 1× e verificare che il modulo comparso sia accettato e che gli undici si riallineino progressivamente; controllare anche pressing/mentalità e cambio campo. Non riaprire audit Work per questo difetto circoscritto.

## Revisione oraria R09 — 7 novembre 2026

- Main verificato via REST: `6204dcc679d15a569bc5b38de457ccf4469720f0`. PR #12 aperta/draft, HEAD `b633cc20`; nessun nuovo branch agente 07/09 in PR aperta. Consultati nove NEXT, contratti, protocollo, registry, issue #1/#2/#3/#4/#7/#8/#9/#10/#11 e stato delle PR. I REPORT degli agenti integrati risultano presenti su main, mentre quello dell'agente 02 è nella PR #12.
- Dopo il feedback sui pallini del modulo che non corrispondevano al movimento reale, il fix è stato preparato e pubblicato nella [PR #24](https://github.com/CzekUns/cercax/pull/24), branch di manutenzione `fix/oronzo-formation-real-regroup-r01`, HEAD `b6aaa7e`. Non tocca CercaX o branch degli agenti. In V8 sono passati cinque gruppi di verifiche sui moduli reali, inclusi 10 seed, cambi modulo nel secondo tempo e corrispondenza gol/risultato; sintassi JS HTML controllata. **Non ancora eseguiti test Node nativi né browser/Android**. PR lasciata aperta senza merge.
- Difetto registrato `ORZ-P2-010` in REVIEW-QUEUE, stato `FIX_IN_PR`; prossima verifica: suite Node, comportamento touch/landscape e revisione del diff #24. La PR #12 resta draft; nessun incarico Work necessario.


## Fix reale per modulo in campo — 7 novembre 2026
Feedback del test su Android: i pallini seguivano il modulo richiesto, ma gli sprite non si recavano nelle posizioni base. Causa verificata: il comando aggiornava `team.tactics`, però il sistema `desired()` sceglieva subito target influenzati da pallone, possesso e pressing; l'overlay mostrava invece `formationAnchors()` statici, creando una discrepanza visiva.

**Correzione implementata e mergiata**: [PR #24](https://github.com/CzekUns/cercax/pull/24), commit `61dab9f8eb482706b295e9d885cd64545e315b23`.
- Prematch `state.t===0`: il nuovo modulo riposiziona immediatamente i giocatori reali; il calciatore incaricato del kickoff e la palla restano al centro.
- In gara: `tacticChange` di formazione crea `regroupStarted`/`regroupUntil`; i giocatori senza palla percorrono **fisicamente** il tragitto verso i nuovi ancoraggi per 22 secondi simulati con velocità limitata al 55%, poi si riallacciano gradualmente alla dinamica di pallone/avversari nel resto della finestra di 64 secondi simulati. Il portatore di palla non è forzato lontano dall'azione. Nessun teletrasporto per cambio in gara.
- `partita-rapida.html` mostra connettori dagli sprite ai rispettivi riferimenti, cerchi verdi per giocatori entro 3,5 m e contatore degli allineati; overlay temporaneo (35 s simulati) e toggle per posizioni base. Pressing/mentalità non simulano una falsa reimpostazione della formazione.
- **Verifica effettiva:** 5 gruppi V8 eseguiti su codice reale del branch, tutti PASS, inclusi 10 seed live, t+20 con almeno 9/11 entro 3 m (campione 10 seed effettivamente 11/11), distanza massima nel primo tick 3,41 m, cambio a secondo tempo, prematch e 90 minuti/risultati. Suite Node `formation-regroup.test.mjs` aggiunta ma NON eseguita nativamente in questa chat; QA Android non ancora confermata.
- **Vincolo utente confermato:** 1× deve restare a 15 minuti reali, accelerazione 2×/4×/8× su richiesta. Invariato.
- Attendere la successiva verifica diretta dall'utente: cambiare 4-4-2→3-5-2 durante la partita, osservare la corsa degli sprite e i pallini che diventano verdi. Dopo la transizione, i giocatori lasciano naturalmente i punti base per seguire l'azione.


## NUOVA VISIONE UTENTE v0.2 — 7 novembre 2026 · AGENTE 10
L'utente assegna formalmente a questa chat il numero **10**, orchestratore di prodotto: coordinare i nove agenti, impedire implementazioni scollegate e portare il gioco al ciclo completo. La fonte di verità di prodotto da ora è [GAME-VISION-v02.md](GAME-VISION-v02.md), salvata anche nella [cartella ORONZO Google Drive](https://drive.google.com/drive/folders/1jIpmS1V2oEAMI7LODJ1ZjnvC26b7CZcs) come [Visione v0.2](https://docs.google.com/document/d/1k52clWWRcD3CMvD_HsX1ke7zdiVAY_AHp2MT9KfDEG0/edit). Prima visione v0.1 preservata come archivio.

**Nuove decisioni esplicite rispetto al v0.1:** mondo a partire dal 1979; avatar con fortuna, leadership, autostima, pazienza che incidono; morale coach come currency con 0 = game over; 20 ingaggi casuali e costo regione 1/macroregione 3 modificato fino al 2× dal rapporto cachet-autostima; presentazione con presidente random persistente; 500 piccoli comuni / 5000 cognomi sourced; conferenza iniziale 5 domande e una dopo ogni gara, stampa ed emittenti fittizie; hub Campionato/Rosa/Tifoseria/Ufficio del presidente, stadio, mercato stagionale, papponeria, relazioni tifosi/giocatori/media/board; ordini individuali buoni/duri con affinità regionale; vista TV ball-follow oltre full campo; 1× 15 minuti (già adottato). **Eccellenza nel 1979 è anacronistica**: per fedeltà storica utilizzare denominazione Promozione salvo altra decisione dell'utente. Dataset/dati demografici e dialettali richiedono fonti verificabili, e nomi comuni non garantiscono da soli assenza di marchi.

**Azioni effettuate:** creata [Epic #25](https://github.com/CzekUns/cercax/issues/25) e issue integratore [#26](https://github.com/CzekUns/cercax/issues/26); aggiornati tutti i `coordination/01–09/NEXT.md` con scope e nuova direzione; agenti 07 e 09 devono prima chiudere i cinque fix R02 e NON avviare R03; agente 02 resta WAIT_REVIEW su PR #12 draft; 04 e 08 sbloccati per nuovi contenuti/attributi indipendenti; 01/03/05/06 READY per demo/asset/camera/shouts. Creati `coordination/10-orchestrator/{IDENTITY,RUN,NEXT,PLAN,CONTRACT-v02}.md`. Aggiornati AGENTS.md ed engine-contract.md con direttiva di precedenza v0.2. Documento di coerenza modelli V2 è **proposta**, non implementazione.

**GAP da non mascherare:** i moduli e la Partita rapida esistono ma la sequenza Nuova partita→avatar→20 ingaggi→presidente→5 domande→hub→partita→postmatch→morale→salvataggio/ricarica non è ancora integrata. Camera TV, dialoghi nuovi, 500/5000 dati, papponeria, interazioni e prezzi biglietti non sono stati implementati solo perché documentati. L'orchestratore deve integrare nel runtime dopo merge/test, mantenendo la Partita rapida funzionante. Autorizzazioni su GitHub **non avviano automaticamente** le chat degli agenti.

## Revisione oraria R10 — 7 novembre 2026
- Ricontrollati su GitHub main, protocollo, registry, contratti, nove NEXT e REPORT, PR aperte e nuova direttiva `GAME-VISION-v02.md`. Gli incarichi READY degli agenti non implicano chat in esecuzione.
- [PR #24](https://github.com/CzekUns/cercax/pull/24) **MERGED** (commit `61dab9f8eb482706b295e9d885cd64545e315b23`): ORZ-P2-010 implementato su main, ma QA Node/Android non completata; vedere REVIEW-QUEUE per stato `MERGED_AWAITING_BROWSER_QA`.
- PR aperte: #12 draft cutscene; #27 report preliminare R03 su integrazione v0.2 ancora incompleta. Nessuna sessione Coerentizzatore avviata da questa revisione.
- Fonte di verità prodotto v0.2: **1979**, **1× ~15 minuti**, avatar e morale, 20 offerte e percorso completo; vecchi riferimenti 1985/86 e 90 s nei contratti v1 non prevalgono. L'integrazione completa non è stata verificata. Cinque P1 R02 restano assegnati a 07/09 e bloccano il gate di integrazione.
- In R10 nessun test eseguito, nessuna modifica al gameplay e nessun merge. Prossimo controllo: nuovi branch/PR dei fix 07/09 e QA runtime della Partita rapida.


## Rettifica VINCOLANTE del mandato dell'Agente 10 — 7 novembre 2026
**Correzione esplicita dell'utente:** «Tu devi solo fare il tuo ruolo di stabilire le regole mie nei posti giusti», istruendo gli agenti paralleli. **Tutte le note storiche che assegnano al 10 l'implementazione diretta, l'adapter o il runtime sono superate.**
- 10: regole utente → specifiche verificabili → proprietario agente 01–09 → NEXT/contratti/issue → report/review e gate di merge. Nessun HTML, JS, CSS, asset o test codificato da 10.
- 07: proprietario futuro del controller dati/game-flow `oronzo/app/flow/`, esclusivamente DOPO che i 5 fix R02 di carriera/società sono approvati e mergiati, con nuovo NEXT autorizzato; attualmente resta sul fix R02.
- 03: proprietario futuro dei file UI runtime `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, `oronzo/partita-rapida.html`, esclusivamente DOPO il merge del suo ciclo UI e il gate R02 e con nuovo NEXT; attualmente resta solo in `oronzo/assets/ui/`.
- Nessun altro agente può scrivere in tali file, mantenere API e scope. Issue #26, CONTRACT-v02, registry, PROTOCOL e AGENTS sono stati aggiornati di conseguenza. I commit della documentazione non attivano automaticamente le chat né implementano le funzionalità.

## Verifica di ripresa parallela — 7 novembre 2026, Agente 10 (solo regole)
- Riletti 9 `NEXT.md`, i 9 REPORT su `main` (otto disponibili, 02 solo nel branch PR #12), il report 02 nel branch, PR aperte e confronti dei branch R02. **Tutti i REPORT su main riportano il ciclo precedente**, non nuove consegne R02; non confondere con completamento delle nuove iterazioni.
- PR aperte verificabili: **#12 cutscene DRAFT** (HEAD aggiornato `7ec2e1f`, 25 file, soltanto `oronzo/assets/cutscenes/**` più REPORT 02; QA Chromium non confermata) e **#27 Coerentizzatore R03 prematuro**, rapporto solo documentale che dichiara di non aver eseguito test. Nessuna nuova PR agente 01,03–09.
- **07**: branch `agent/oronzo-career-r02` senza commit propri, arretrato rispetto a main aggiornato; R02 non consegnato. **09**: branch `agent/oronzo-coach-club-r02` con sei commit e modifiche concrete a club, coach, finance, presidenti, objectives e period; non c'è PR né nuovo REPORT e mancano test cross-module. Stato 09: lavorazione parziale, non accettata. La R02 resta gate bloccante.
- **04**: branch `agent/oronzo-copy-r02` con un commit nuovo su `oronzo/content/press-media.json` (nessuna PR/REPORT nuovo); **06**: un commit nuovo nel ramo R02 su actions, coach-effects, commands, movement, orders (nessuna PR/REPORT nuovo). **01,03,08**: branch R02 inizialmente identici a main, senza consegne; **05**: branch R02 non ancora verificabile via compare 404; **02**: resta WAIT_REVIEW PR #12.
- Aggiornati tutti i NEXT con esiti e consegne richieste; 09 aggiornato nuovamente dopo l'arrivo dei suoi sei commit. **Non sono stati eseguiti test Node/Chromium/Android, né merge né modifiche al codice di gioco da parte dell'orchestratore.**
- **Autorizzazione futura 07/03 ancora sospesa:** prima PR e test 07+09 R02 con 2 stagioni, payroll e presidenti; poi merge e aggiornamento formale del NEXT del 07 per `oronzo/app/flow/`. Dopo PR UI e merge relativi, nuovo NEXT del 03 per runtime; non autorizzare adesso editing di `index.html`, `game.js`, `ui.css`, `partita-rapida.html`.


### Refresh ramo 09 — dopo la prima verifica R02
Il branch `agent/oronzo-coach-club-r02` è progredito da **6 a 9 commit propri** durante questa sessione; il diff include ora anche `board.js`, `index.js` e `negotiations.js`. Ultima verifica PR aperte: soltanto #12 e #27, nessuna PR R02. Il branch 07 `-r02` resta a 0 commit propri, il 03 `-r02` resta a 0. Nessun nuovo REPORT R02 verificato. Il gate R02 rimane NON SUPERATO, nessuna autorizzazione runtime/adapter.

## Coordinamento R04 — consegne 01–09 e delega review/merge alla chat Work 00 (7 novembre 2026)
L'utente conferma fine dei lavori paralleli e chiede revisione con possibilità di delegare i merge a 00. Verificate su GitHub **otto PR R02 effettivamente aperte**: 07 #30, 09 #32, 03 #33, 05 #28, 06 #35, 08 #31, 04 #34, 01 #29; 02 mantiene #12 OPEN/DRAFT; anche #27 audit prematuro OPEN. Gli HEAD iniziali per l'audit sono nel nuovo `coerentizzatore/REQUEST.md`.
- Le otto PR sono `mergeable:true` secondo metadata iniziale e rispettano gli scope dichiarati nel diff (cartella propria + REPORT), ma **mergeable non equivale a QA approvata**. 00 deve riesaminare a ogni merge. Nessun merge eseguito dall'Agente 10.
- **Gate P0:** #30/#32 sviluppano i cinque fix R02 su due scope, ma il 07 esegue test Node su un file Agent09 precedente e l'09 dichiara suite V8 completa e Node parziale. Imporre QA **sul codice combinato** e test con `{week:seasonWeek, absoluteWeek, seasonYear}`; priorità merge 07→09, se e solo se verificati.
- **Possibile P1 di contratto cross-engine:** #31 08 usa nomi italiani per regione e `gentle/hard`; #35 06 usa `regionId,macroRegion` e `encourage/harsh`. Anche #08 `applyShout` e #06 `coach_shout` applicano potenzialmente effetti temporanei/persistenti incompatibili. Work 00 deve valutare test bridge/owner dell'adapter senza fare nuove feature da sé.
- #33 UI art è **kit standalone** con Chromium/Playwright tramite `set_content`, non interazione col motore né hosting reale. #28 offre camera TV, ma manca QA Chromium live. #29 atlanti e 22 sprite verificati via V8 e preview offline; il gate artistico/telefono non è completo. #34 37 Q apertura, 32 postmatch, 80 battute ma stile ancora da approvare dall'utente; dialetti non verificati esclusi. #31 solo 20 cognomi campione, non dataset 5000.
- #12 resta DRAFT/QA arte incompleta; #27 rapporto R03 prematuro e non test di integrazione, **NON MERGIARE** automaticamente.
- **Decisione:** tutti i NEXT 01,03–09 posti a `WAIT_REVIEW`; 02 già `WAIT_REVIEW`. REQUEST R04 scritto in `coerentizzatore/REQUEST.md`; RUN/PROTOCOL di 00 aggiornati con **eccezione temporanea di merge condizionato** richiesta dall'utente. 00 non modifica NEXT né scrive codice; restituisce report e SHA; 10 autorizza prossimi cicli sulla base degli esiti, non prima.


## Coordinamento successivo a R04 — 7 novembre 2026, user decision 100/500
- Work 00 [PR #36](https://github.com/CzekUns/cercax/pull/36) ha verificato 1 merge produttivo **#34** (`b8976cb2b0129de9ee6537e1d624abce9ff1402f`), e ha riprodotto R04-1 migrazione ledger V1 (doppia paga 486.000 ITL), R04-2 suite 07/09 combinata 50 PASS/1 FAIL per fixture payroll obsoleta, R04-3/4 origin/trust/tone incongruenti 06/08 e doppia applicazione potenziale. 95 PASS motore/attributi/camera, 104 club x 2 stagioni su path nuovi; Chromium non disponibile. Nessun altro merge R02.
- L'orchestratore ha verificato cinque SHA blob principali di `oronzo/content/**` su main identici alla #34 e metadata merged. **04 NEXT = BLOCKED** per nuova scrittura editoriale in attesa di scelta stile (codice contenuti R02 disponibile).
- 07 #30 e 09 #32 **FIX_REQUESTED** nelle rispettive PR: 07 converte ledger/transazioni/board legacy con provenienza periodo; 09 rifiuta ledger misti e aggiorna test per importi effettivi, con test combined/periodo `{week,absoluteWeek,seasonYear}`. Niente autorizzazione flow fino a merge entrambi e test passati.
- 06 #35 e 08 #31 **FIX_REQUESTED**: origine `{comune,regione,macroregione}`/fiducia, mapping toni, engine unico effetto temporaneo, 09 delta persistenti con chiave `matchId:eventId`, una sola transazione e replay; suite integrata obbligatoria. 01 #29, 03 #33, 05 #28 = WAIT_REVIEW/HOLD browser-arte; 02 #12 DRAFT. Commenti operativi pubblicati nelle sette PR con riferimenti a NEXT.
- **Nuova decisione dell'utente:** il primo rilascio richiede solo **100 comuni italiani + 500 cognomi italiani verificati**; 500/5000 rimane espansione e non gate M1. Direttiva registrata in `GAME-VISION-v02.md`, `AGENTS.md`, `10-orchestrator/CONTRACT-v02.md` e nel [Google Doc v0.2](https://docs.google.com/document/d/1k52clWWRcD3CMvD_HsX1ke7zdiVAY_AHp2MT9KfDEG0/edit). L'automazione **ORONZO · Revisione oraria** è attiva e il prompt già prevede raccolta progressiva su `data/oronzo-world-research` e `oronzo/data/research/`, con report counts/licenze, senza merge autonomi. Nessuna PR di ricerca rilevata a questo controllo; non dichiarare record già acquisiti.
- **Gate integrazione:** 07 R03 adapter `oronzo/app/flow/` autorizzabile SOLO dopo #30+#32 merge e test Node V1/V2 verdi; 03 runtime separato SOLO dopo #33 merge/browser+arte e stato adapter 07 stabile. Sono stati aggiornati i NEXT, ma **nessun nuovo ciclo R03 autorizzato**. L'agente 10 ha agito soltanto su coordinamento, contratti, doc e PR commenti; non ha modificato codice di gioco.
- PR #36 di sola documentazione ancora OPEN al controllo; GitHub metadata `mergeable:false` dopo gli ultimi commit di coordinamento, perciò nessun merge del rapporto tentato. L'R04 è disponibile sul suo branch.

## Orchestrazione R05 assegnata — 7 novembre 2026
**Nuovo documento di dispatch su main:** [`oronzo/coordination/10-orchestrator/DISPATCH-R05.md`](10-orchestrator/DISPATCH-R05.md), con fasi e gate per 00 e 01–09. Aggiornati **tutti i nove NEXT** con tasks individuali e prerequisiti; REQUEST del 00 ora descrive un audit **R05 pronto ma non avviato**.
**Nuovi lavori rilevati nelle PR:** #30 HEAD `f098b547` e #32 HEAD `89bb4944` riportano migrazione ledger, guard anti-doppio pagamento, regressioni/fixture aggiornate; PR ancora OPEN, nessun merge; le due suite Node combinate sullo stesso HEAD aggiornato ancora da eseguire da Work 00. #33 HEAD `c38be80c` documenta test Chromium 144 vero con assets via request interception, senza deploy HTTP; #28 HEAD `9c00a329` documenta 54 test Chromium fallback, ma realSprites=0 e HTTP bloccato. #31/#35 mantengono HEAD precedenti e incompatibilità R04-3/4. #29 #12 gate arte/browser; #34 MERGED; #36 rapporto R04 storico.
**Stati attuali:** 07, 09 = `WAIT_REVIEW` **dopo** fix pubblicati; 06, 08 = `FIX_REQUESTED` (iniziare subito); 01, 02, 03, 05 = `WAIT_REVIEW` con gate browser/artistici; 04 = `BLOCKED` alla nuova scrittura finché stile approvato. Nessun R03 runtime/adapter autorizzato.
**Sequenza di riattivazione raccomandata:** 00 subito, 06+08 in parallelo, poi 01+03+05 per prove visuali; 02 revisioni in PR draft quando arte in discussione, 04 fermo; 07+09 attendono report 00. L'utente dovrà attivare effettivamente le chat. **Work 00 non dispone di nuovo permesso di merge senza espressa autorizzazione R05.**
**Dati M1:** 100 comuni + 500 cognomi via automazione ORONZO oraria, con fonti/licenze, dataset ancora non certificato come importato. Non confondere 500/5000 espansione con requisiti release.
**Ruolo di 10:** solo governance; scritti documenti e NEXT, nessun codice, nessun merge e nessun test game eseguito in questo ciclo.

## Handoff mirato R05 — 7 novembre 2026, dopo PR #37
Work 00 ha verificato su checkout combinata delle nuove #30 e #32: **77 test, 76 PASS, 1 FAIL**, non ha mergiato. [REPORT-R05 / PR #37](https://github.com/CzekUns/cercax/pull/37). R04-1 (migrazione/salario ripetuto), R04-2 (importo fisso nel test del 09), 104 club × due stagioni e rollback V1/V2 sono passati. Il **solo** difetto residuo è `oronzo/systems/career/tests/r02-cross.test.mjs` del 07 che chiama `settleWeek` con solo week e, dopo serializzazione, ottiene il rifiuto corretto `period_migration_required`.
**NEXT 07** aggiornato a `FIX_REQUESTED` con tre-campi e chiavi `a:N`, modifica **solo** PR #30 e REPORT. **NEXT 09** aggiornato a `WAIT_REVIEW`, nessun fix proprio richiesto. Gli altri agenti non sono convocati. Dopo fix 07: solo verifica delta #30 + Node combinata con #32, nessuna ripetizione audit ampia. Nessun merge/nuovo ciclo flow 07 prima del gate completamente verde e merge effettivi. Il progetto passa a orchestrazione per blocchi concreti, non round generali obbligatori.

## Decisione POST MERGE R05B — 7 novembre 2026
Verificato live che **PR #30 07 è MERGED** il 7 novembre 2026 alle 13:13 UTC, merge `aab48f0be77f022dbb7d915ab44187037d96b5f0`, e **PR #32 09 è MERGED** alle 13:14 UTC, merge `5b1dcd7c71435709d8b2c62d5455720b73691eb8`. Il test cross corretto (`r02-cross.test.mjs`, blob `586e6856910196965172e9488ff3bee8b839ee74`) e il test `period-r04.test.js` sono presenti su main; l'utente comunica **test verdi**. Agente 10 ha autorizzato due **incarichi mirati, non un round generale**: **07** `READY` per carriera/flow 1979 + 20 offerte in `oronzo/app/flow/` e `systems/career/`, nuovo branch `agent/oronzo-career-r03-flow`; **09** `READY` per morale coach e preview/applicazione offerte idempotenti (morale=0 game-over), nuovo branch `agent/oronzo-coach-club-r03-morale`. Entrambi partono da ultimo main, PR separate, codice e report nello scope proprio, senza merge autonomo. NEXT e RUN autorizzano espressamente questi due cicli; per 07 anche IDENTITY aggiornato con deroga all'area app/flow.
Il 03 **non è ancora autorizzato a modificare runtime HTML root**: kit #33 ancora OPEN e gate browser/artistico da chiudere; il 03 aspetterà le API concordate 07/09. #31/#35 mismatch shout non deve bloccare il controller base: feature shouts differita o esclusa in modo esplicito. #28/#29 QA PNG e #12 cutscene DRAFT sono percorsi indipendenti. Dataset M1 100 comuni/500 cognomi non dichiarato consegnato fino alla PR ricerca dell'automazione. Niente altro round obbligatorio.

## Aggiornamento audit R06 — PR #38/#39 (7 novembre 2026)
L'audit 00 su GitHub Actions ha confermato 5/5 Node flow, 86/86 Node career/coach, demo 1979 con Match06 reale; **test E2E reale dei callback 09 FALLITO** per `club_region_required` quando la demo parte senza catalogo geografico. Il flow non collega automaticamente i callback 09: mantiene `awaiting_agent09`. Rapporti e link: [R06](https://github.com/CzekUns/cercax/blob/audit/oronzo-r06-38-39/oronzo/coordination/coerentizzatore/REPORT-R06.md) e [CI run 42381672625](https://github.com/CzekUns/cercax/actions/runs/42381672625).
**Decisione: SOLO AGENTE 07 `FIX_REQUESTED`**, modifica #38 già aperta, wiring di tutte le API 09 reali + requisito preflight geografia senza mutazione + E2E Node no stub. **Agente 09 `WAIT_REVIEW`**, nessun errore del suo codice dimostrato; 03 runtime non parte. Dopo correzione, Work 00 può eseguire audit R06B e riportare test; merge subordinati a una nuova autorizzazione utente, non ereditata. Nessun round generale.

## Gate attuale — 03 UI e primo test personale (7 novembre 2026)
R06B **PASS**: #39 (`cf4a8bc0`) e #38 (`12fe01ff`) merge confermati; suite completa **97/97**, demo 1979 (Match06 + Coach09 + Copy04 + salvataggi). Il controller headless funziona ma UI/mobile non integrata. Il kit UI #33 è **OPEN**, con QA Chromium tramite intercettazione richieste e screenshot; non è prova di hosting Android. `coerentizzatore/REQUEST.md` ora definisce **R07** esclusivamente per controllare #33; `03-ui/NEXT.md` assegna WAIT_REVIEW_R07 e prepara una nuova PR R03 runtime **solo dopo merge del kit**. Per primo playtest l'utente potrà usare una modalità tecnica con fixture geografiche sintetiche esplicitamente marcate, senza dichiarare dati nazionali validati; non usare `newGame()` senza catalogo come flusso pronto, perché l'ingaggio risponderebbe `geography_required`. Niente merge non autorizzati o review generali.

## Stato attuale: R07B MERGED, R03 runtime UI 03 (7 novembre 2026)

Lo 00 ha verificato [REPORT-R07B](https://github.com/CzekUns/cercax/blob/audit/oronzo-coerentizzatore-r07b/oronzo/coordination/coerentizzatore/REPORT-R07B.md) PASS: PR #33 MERGED `c019d511af89eb54851b3743fba598254d59707f`, controllo browser vero HTTP/10 PNG/touch a 640×360, 800×360, 844×390 superato anche dopo merge. Legibilità e toast corretti. **Kit artistico pronto, runtime ancora legacy**. Già 97/97 Node R06B per #38/#39.

**Decisione Agente 10:** AUTORIZZATO **Agente 03, unico owner UI runtime**, a partire dall'ultimo main su nuovo branch `agent/oronzo-ui-r03-runtime` con scope `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, eventuale `oronzo/partita-rapida.html`, `oronzo/assets/ui/` e test UI/REPORT; `03-ui/IDENTITY.md`, `RUN.md`, `NEXT.md` aggiornati. Incarico: primo playtest 1979 a UI vera, 20 offerte, morale, stampa, formazione, Match06 con MatchView05 esistente, classifica/save/load. La fixture geografia sintetica è ammessa SOLO per demo personale contrassegnata in modo permanente; gioco normale blocca ingaggio con `geography_required` fino a dati M1 verificati. Niente gameplay o dati inventati per UI, no modifica sistemi altri agenti, regressione della vecchia partita rapida, test Chromium su gioco runtime (non demo kit), nessun auto-merge. R08 QA 00 in seguito.


## Verifica GitHub 8 novembre 2026 — riconciliazione PR R03
- Stato LIVE verificato tramite `fetch_pr`: PR #39 **merged** il 7 novembre 2026 alle 15:07:10 UTC; PR #38 **merged** il 7 novembre alle 15:08:13 UTC; PR #43 **merged** l'8 novembre alle 08:05:31 UTC. La semplice etichetta `closed` non era sufficiente: il campo `merged=true` è stato controllato per tutte e tre.
- I NEXT di 07 e 09 su main conservano snapshot `OPEN/WAIT_REVIEW` precedenti ai merge; quello di 03 conserva istruzioni anteriori alla consegna #43. Trattarli come documentazione da riconciliare con i proprietari e i gate, non come autorizzazione a ripetere il ciclo. Nessun nuovo lavoro assegnato automaticamente.
- PR dati #40 è ancora **open**, non merged. Su branch `data/oronzo-world-research` verificato parsing di `municipalities.json` (250 record) e `surnames.json` (500 record); soglia iniziale utente 100/500 raggiunta nei file di ricerca, non equivale a integrazione nel gioco. Obiettivi di espansione 500/5000. Ranking nazionali verificati 0; anno demografico puntuale comunale ignoto; frequenze cognomi locali Bergamo 2021. Nessun record aggiunto in questo controllo.
- Non eseguiti test runtime/browser, né QA integrale di tutte le PR; nessun merge o modifica runtime eseguiti da questa revisione. Coerentizzatore non avviato.
