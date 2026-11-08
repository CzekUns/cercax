# ORONZO — REPORT-R10-D01 · PR #53 comuni reali

**VERDETTO: PASS.** Ambito: funzionamento e dati contemporanei. Importazione, metadati null e percorso autentico superano il gate richiesto. Merge raccomandabile sull'HEAD esatto dopo autorizzazione dell'utente; **nessun merge su GitHub effettuato**. Questo PASS non certifica la geografia o la demografia del1979.

- PR [#53](https://github.com/CzekUns/cercax/pull/53), HEAD **`9ec2baa6dc0c06b3d6fff432218f19be17ee77c0`**.
- Catalogo app: blob **`c568ce9864a8ac147b0a5a0a908a1eaf323e3098`**.
- Ricerca di origine: commit `0cc7eead7c5e971cff0e2d08e4bb2febc1df884b`, blob **`7bcf0d6e24932817b880e164d7c3d5869d6e1d85`**, verificato tramite Git.
- Fonte primaria del dataset derivato controllata: RP92/comuni-italiani, commit **`e0df3f548dc8ef94e0d30fba69bb5344858ab26f`**.
- Data: 8 novembre 2026, Europe/Rome. Revisore00, indipendente dall'autore.

## Verifica indipendente dei dati

Clonato anche il repository upstream RP92. Tutti i500 record sono stati confrontati con lo snapshot di ricerca e con i19 JSON regionali effettivi, non soltanto col REPORT dell'autore.

| Controllo | Risultato |
|---|---|
| Identificativi ISTAT a6 cifre distinti | **500/500**, nessun duplicato |
| Corrispondenza codice, nome e popolazione con fonte dichiarata | **500/500**,0 discrepanze |
| Regione del record corrispondente al file regionale sorgente | **500/500**,0 discrepanze |
| Snapshot di ricerca → import | **500/500 corrispondenti** |
| Fonti regionali | **19**, riferimenti risolti |
| provinceCode | **500 null**, senza valori inventati |
| populationReferenceYear | **500 null**, senza conversione di2026 in anno demografico |
| historical1979 | **500 false**, ambito contemporaneo esplicito |
| Licenza dichiarata e attribuzione | LICENSE-DATA upstream conferma CC BY4.0 e attribuzione ISTAT; crediti RP92/ISTAT conservati |

Fonti verificabili: [LICENSE-DATA fissata al commit](https://github.com/RP92/comuni-italiani/blob/e0df3f548dc8ef94e0d30fba69bb5344858ab26f/LICENSE-DATA) e [JSON regionali della stessa revisione](https://github.com/RP92/comuni-italiani/tree/e0df3f548dc8ef94e0d30fba69bb5344858ab26f/data/regioni). L'attribuzione a ISTAT è quella dichiarata dall'upstream RP92; non viene presentato un confronto separato con un censimento ISTAT1979.

Il valore `reviewStatus:'approved'` è sostenuto, per l'ambito limitato dell'import, dalla corroborazione indipendente delle identità contemporanee e dalla tracciabilità verificata. Non valida l'anno della popolazione o i confini storici. `sourceSnapshotYear:2026` rimane anno dello snapshot; non è un dato demografico certificato. Il campione non rappresenta tutti i comuni italiani.

Lo schemaV2 consente i null espliciti con ambito non1979; la validazione V1 resta restrittiva. I club `Sportiva [Comune] [n]` rimangono società fittizie. Banner permanente **COMUNI REALI · DATI ATTUALI (NON1979)**, attribuzione in ingresso, modalità sintetica separata: nessun fallback QA occulto nel percorso normale verificato.

## Runtime autentico e regressioni

| Prova indipendente | Esito |
|---|---|
| Node119 +5 nuovi test mondo/flow | **124/124 PASS**,0 fail |
| PR53 da sola, quattro viewport con safe area, mouse/touch distribuiti | **4/4 percorsi completi PASS** |
| PR52+PR53,4 viewport ×2 inset ×2 input | **16/16 percorsi completi PASS** |
| Origine non predefinita Ciorlano061030, Campania,640×360 safe/touch, PR53 | **PASS**, partita→salvataggio→reload conserva l'origine |
| Selettore nativo | **500 opzioni reali**, scelta inviata al controller; nessun TEST attivo |
| Offerte/ingaggio/presidente/stampa | 20 offerte; delta morale coerente con preview09, applicato una volta |
| Partita normale |22 attori reali, Engine06 fino a5400/fulltime; nessun pulsante QA usato |
| Morale, risultati, classifica, finanze/storico | Coerenti nei controlli sui dati finali |
| Save/reload/load | JSON identico, inclusi500 record, null, fonti/versione, mondo e identità |
| Salvataggio QA precedente creato su PR52 → CARICA e SALVA su PR53 | **PASS**,100 record originali e mondo sintetico preservati |
| Combinazione: Node con tutte le nuove suite | **128/128 PASS**,0 fail |

Per il selettore sono provate sia Rhêmes-Notre-Dame007055 sia l'origine non predefinita Ciorlano061030. L'interazione apre il select a coordinate e usa la selezione nativa del controllo tramite automazione; non certifica il picker del telefono fisico. Dopo creazione, ingaggio e caricamento vengono controllati gli ID effettivi nel Coach09.

Le tre alternative di ciascuna delle5 domande iniziali e2 finali sono raggiunte e misurate; la terza viene attivata. I controlli restano almeno44px dopo scroll, incluse le condizioni compatte. La partita normale è eseguita con clock del browser accelerato a8×: il loop e Engine06 producono veramente gol, risultato e conferenza finale. Non sono costruiti risultati o schermate sostitutive.

Il confronto sui dati verifica punteggio contro eventi goal, classifica e fixture storica, payroll singolo `a:1`, cassa e settimana assoluta2. Il delta d'ingaggio è confrontato con `previewOfferMorale` reale. Save/load non riassegna i comuni né sostituisce vecchi cataloghi: il caso precedente QA100 è stato prodotto dalla vecchia UI, trasferito tramite veri slot localStorage e ricaricato dalla nuova UI, senza inventare un salvataggio di esempio.

## Compatibilità e nota di coordinamento

Main documentale: `89a128066525333558899aa25c0e96ce3e123d0c`. Checkout Git veri ottenuti con fetch delle due PR e worktree separati. Nessuna ricostruzione HTML/CSS, intercettazione delle risposte del gioco o sostituzione di motore/storage. Server HTTP statici servono i file originali; i byte caricati sono confrontati con gli indici Git.

Combinazione locale di prova: main + #52 + #53, senza conflitti, **senza commit né push**. Albero Git `3749cc958f86c4bce4bceab7e4bf1e55fae9e227`; nessuna integrazione su GitHub. La combinazione conserva esattamente i blob produttivi delle due PR. Ambiente: Node24.22.1, Chromium149.0.7827.0 headless, Playwright, DPR1, it-IT; mouse o touch mobile emulato. Viewport640×360,800×360,844×390,960×400; inset assenti oppure top0/left24/right12/bottom16.

Gli harness sono del revisore. I controlli vengono intersecati con viewport e antenati overflow; hit-test e click/tap a coordinate, scroll wheel/touchStart/Move/End. Per controlli più alti di44px si verifica anche una fascia centrale realmente attiva di44px; per risposte/CTA da44px è verificata l'intera altezza. Nessun locator autoscroll.

Prove comuni: avatar,20 offerte, ingaggio/presidente,5 domande iniziali, rosa e allenamento16, classifica16, XI11/1GK,22 attori PNG reali, partita Engine06,2 domande finali, settimana2, morale, bilanci, save/reload/load JSON identico, evento controllato API09 per morale0, game over, nuova carriera e protezione del vecchio salvataggio.

**Limiti:** Android fisico, toolbar/cutout hardware e anteprima pubblica non verificati. Non attesi900 secondi reali a1×. Nelle carriere con comuni reali la partita è completata con **tempo browser avanzato di116s a8×** tramite Playwright Clock: RAF, loop, Engine06, gol e fulltime sono quelli autentici; il comando TERMINA GARA QA è assente e non viene usato. Il clock controllato accelera l'esecuzione, non produce risultati finti. La suite Node include due stagioni/104 club/76 periodi; non è una nuova campagna browser pluristagionale.

Le modifiche delle due PR non confliggono: #52 interviene su HTML/CSS e modulo fullscreen; #53 su dati, world.js e career-r03.js. Misure aggiuntive in fullscreen attivo:16/16 condizioni della combinazione, stage pieno al netto degli inset, campo16:9 e controlli44px. Zero pageerror; solo404 opzionale cutscene noto.

**ORZ-P2-053-UI-SCOPE, nota documentale esistente:** REVIEW-QUEUE su main cita il divieto UI nel mandato07. Tale testo è nella sezione **ARCHIVIO** del NEXT07; il NEXT attivo `DIRECT_IMPL_WAIT_QA_D01` documenta invece l'esecuzione diretta richiesta dall'utente e nomina esplicitamente il collegamento `career-r03.js`. Anche il REQUEST R10 richiede il gate sull'origine nel runtime. Questo audit non inventa un bug o un conflitto Git per risolvere la divergenza dei documenti: la compatibilità è stata verificata realmente. Si raccomanda al10 di riconciliare la voce con il mandato attivo; le future modifiche UI restano all'owner12. Nessun fix funzionale richiesto alla PR per il solo rilievo storico.

## Evidenze e conclusione

[Evidenze R10: sorgenti verificati per hash, script di confronto dati, screenshot e log](https://chatgpt.com/library?file_id=libfile_be1df23835c081918e856744fe71ff1c&account_id=personal). File principali: `data-validation.json`, `validate-sources.py`, `verified-summary.json`, `browser-results.json`, `cross-save-results.json`, `checkout-proof.json`, README con replica.

**Raccomandazione:** #53 pronta tecnicamente e per l'import contemporaneo sul commit indicato. Valutare #52 e poi #53 una alla volta, solo con autorizzazione utente e controllo degli SHA; la compatibilità qui attestata vale per questa coppia esatta. Nessun merge, modifica al gioco, NEXT o revisione di altre PR. Questo rapporto conclude R10; non dichiara ORONZO M1 completo.
