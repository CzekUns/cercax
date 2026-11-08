# ORONZO — REPORT-R09C-M01 · audit finale PR #48

**VERDETTO: PASS — ready for orchestrator review.** I due rilievi UI precedenti risultano risolti sul commit verificato. Merge raccomandabile esclusivamente per questo HEAD dopo autorizzazione dell'utente; **nessun merge effettuato**.

- Data: 8 novembre 2026, Europe/Rome. Revisore: Agente00, indipendente dall'autore11.
- PR: [#48](https://github.com/CzekUns/cercax/pull/48), OPEN / NOT MERGED.
- **HEAD verificato: `8c82cd0aa1cd856c8afc2964acae4ff57f5da93d`.**
- Confronto precedente: `58c7c65506f74f012b17b099583e96ee380f8db5`.
- Main documentale letto all'avvio: `fc5ff8a9679e1162c49e5ccb9796bc347f6c12a9`.
- CSS verificato: blob `0f3569d37c07f2153a4bf8ca28149ded60f2956e`.

Letti REQUEST R09C dall'ultimo main, NEXT11, REPORT11 sull'HEAD richiesto, R09-M01 e R09B-M01. Per R09B è stato consultato anche il rapporto NON CERTIFICATO del ramo `audit/oronzo-coerentizzatore-r09b-m01-20261108` indicato dal REQUEST. Nessun risultato dell'autore o dei rapporti precedenti viene usato come certificazione del nuovo HEAD.

## Checkout e prova autentica

**Checkout Git riuscito**, non ricostruzione dei file tramite API:

```sh
git clone --no-checkout --filter=blob:none https://github.com/CzekUns/cercax.git checkout-r09c
git -C checkout-r09c checkout --detach 8c82cd0aa1cd856c8afc2964acae4ff57f5da93d
git -C checkout-r09c worktree add --detach ../checkout-r09c-before 58c7c65506f74f012b17b099583e96ee380f8db5
```

Checkout effettivo: `/workspace/scratch/985057801ac7/checkout-r09c`, **459 file tracciati**, stato Git pulito prima e dopo le prove. Il worktree precedente è separato. Due server HTTP locali servono direttamente i rispettivi file originali; nessuna sostituzione CSS, DOM, ESM, JSON, PNG o handler. Verificata la corrispondenza di **122 risorse HTTP** ai rispettivi blob dell'indice Git.

Ambiente: **Node24.22.1, Chromium149.0.7827.0 reale headless, Playwright, DPR1, it-IT**. Mouse oppure contesto mobile/touch; safe area CDP assente oppure `{top:0,left:24,right:12,bottom:16}`. Attivazioni a coordinate con `mouse.click` / `touchscreen.tap`; scorrimento wheel o touchStart/Move/End, senza autoscroll dei locator. Nessun `set_content`, `route.fulfill`, storage shim o motore sostitutivo.

Il percorso usa la **modalità tecnica già implementata nel gioco**, con catalogo geografico sintetico e banner permanente. Il dataset di playtest non sostituisce il runtime: sono eseguiti controller07, Coach09, Copy04, Engine06 e renderer05 effettivamente presenti nel checkout.

## Matrice UI e difetti chiusi

Quattro risoluzioni × due condizioni inset × due input: **16/16 PASS**. Ulteriori16 percorsi sul checkout precedente confrontano geometria e font fino alla partita.

| Viewport | Stage senza inset | Stage con inset, x24/y0 | TERMINA senza inset, mouse/touch | TERMINA con inset, mouse/touch |
|---|---|---|---|---|
| 640×360 | 640×360 | 604×344 | 44 / 44px | 44 / 44px |
| 800×360 | 800×360 | 764×344 | 44 / 44px | 44 / 44px |
| 844×390 | 844×390 | 808×374 | 44 / 44px | 44 / 44px |
| 960×400 | 960×400 | 924×384 | 44 / 44px | 44 / 44px |

La shell occupa tutta la larghezza utile, riservando36px laterali e16px inferiori quando richiesti. **R09-M01-1 chiuso:** TERMINA GARA mantiene44px nominali e visibili, hit-test positivo al centro e presso i due bordi verticali; click/tap completa davvero Engine06 e apre la conferenza postpartita. Anche i quattro controlli adiacenti conservano almeno44px.

**R09B-M01-2 chiuso:** tutte le tre alternative delle cinque domande iniziali e delle due finali sono state raggiunte e attivate singolarmente:

| Conferenza sul nuovo HEAD | Attivazioni verificate | Altezza visibile minima dopo scroll |
|---|---:|---:|
| Iniziale: 5 domande ×3 opzioni ×16 casi | **240/240 PASS** | **44px** |
| Postpartita: 2 domande ×3 opzioni ×16 casi | **96/96 PASS** | **44px** |

Ogni controllo viene intersecato con viewport e aree interne di tutti gli antenati overflow: **rettangolo completo visibile**, hit-test positivo in tre punti verticali e testo contenuto senza clipping interno. Dopo ogni tap è verificato che il vero stato del gioco registri precisamente l'ID dell'alternativa scelta.

Per provare alternative mutuamente esclusive si ripristinano nel localStorage autentico gli slot appena prodotti dal gioco, si ricarica la pagina HTTP e si usa CARICA dell'interfaccia; lo stato ripristinato deve essere identico al JSON originale. Non vengono modificati gli handler o fabbricate risposte.

A640×360 con inset, domanda3/risposta3: **39,15625px** sul checkout precedente → **44px interamente visibili dopo scroll** sul nuovo, mouse e touch. L'indicazione «↕ Scorri per leggere tutte le risposte» è presente e leggibile; la navigazione resta esterna allo scroll. Non è necessario che tutte le opzioni siano visibili contemporaneamente.

**Prova aggiuntiva del testo lungo:** altri due percorsi reali a640×360 con inset, mouse/touch, selezionano la diciannovesima offerta. Il gioco genera naturalmente `q_start_paese`, con la risposta più lunga del catalogo iniziale:87 caratteri,90 col prefisso UI. Il testo va a capo e rimane completo;44px visibili e tap riuscito. Provate tutte21 le alternative anche in questi due percorsi: **42/42 attivazioni supplementari PASS**.

Canvas con inset: **300,438×168,984**, **300,438×168,984**, **332,625×187,094**, **350,406×197,094**. Rapporto16:9 preservato entro0,001; stage/canvas identici al checkout precedente nelle16 coppie. Font domanda/risposte invariati nel confronto; risposte10px, TERMINA9px. Nessuna riduzione dei caratteri. Portrait→landscape e resize verticale di30px superati nei16 percorsi. Screenshot propri ispezionati alle quattro risoluzioni: asset reali caricati, campo e sprite proporzionati, banner e navigazione preservati.

## Regressioni realmente eseguite

| Prova | Esito |
|---|---|
| `node --test oronzo/app/flow/tests/*.mjs oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js` | **97/97 PASS**,0 fail, circa18,5s |
| `node --test oronzo/systems/match-view/*.test.mjs` | **22/22 PASS**,0 fail |
| Totale richiesto Node | **119/119 PASS** |
| Percorso carriera completo sul nuovo HEAD | **16/16 PASS**, più2 percorsi testo lungo |
| Save, reload HTTP e CARICA | Stato JSON identico,16/16 |
| Morale0, game over, nuova carriera e vecchi slot protetti | PASS,16/16 |
| Rifiuto sovrascrittura del vecchio salvataggio | PASS,16/16 |
| Gioco senza dati geografici | `geography_required` senza mutazione,16/16 |
| Homepage → carriera → Rapida1985, mouse/touch | PASS |
| Demo R02 a960×400 | Ancora centrata16:9,711,109×400 |

Ogni percorso comprende8 avatar,20 offerte e ultima raggiunta tramite gesto, ingaggio/presidente,5 domande, Ufficio, Rosa/Allenamento16/16, scheda del sedicesimo confrontata con API07, classifica16 confrontata con API e fondo lista raggiunto,11 titolari con1GK e capitano,22 attori reali, pausa/ripresa e tempo che avanza, fulltime Engine06 attraverso il comando QA,2 domande finali, avanzamento alla settimana2, salvataggio/caricamento e navigazione.

La prova game over usa un **evento di soglia controllato dell'API09 reale**; la nuova carriera conserva il precedente salvataggio e il rifiuto del dialogo non lo sovrascrive. Non viene presentata come una carriera giocata naturalmente fino all'esaurimento del morale.

Verificati anche risultati/gol, classifica, stipendi e storico negli18 stati finali. Esempio della matrice: PROM-14 vince2–1; tre eventi goal corrispondono al risultato; classifica1 giocata/2 punti/differenza+1; cassa10.100.000→9.595.000, stipendio505.000 addebitato una sola volta e `settledWeeks:['a:1']`; fixture e settimana assoluta coerenti. JSON completo preservato al caricamento, incluse finanze, identità e storico.

**Zero pageerror** nei percorsi completati. Rimane il404 opzionale di `assets/cutscenes/manifest.json`, già assente nel checkout precedente; nessun altro HTTP≥400 nei percorsi R03. Non è una regressione di questa PR.

## Scope, prove e limiti

Rispetto alla base originaria `55df243b6397d545baab967652f8556f71f878d3`, l'unico file runtime modificato è **`oronzo/assets/ui/career-r03.css`,17 righe aggiunte**. Rispetto a58c7c655:7 righe per lo scroll conferenza. Gli altri cambiamenti sono QA e REPORT11. JS, engine, renderer, regole, salvataggi e asset invariati. Nessun nuovo problema bloccante individuato nello scope R09C.

[Evidenze indipendenti: screenshot nativi, harness, log e risultati](https://chatgpt.com/library?file_id=libfile_3b9f365a62888191abd43eeeedb086b3&account_id=personal). File principali: `results.json`, `verified-summary.json`, `long-results.json`, `legacy-results.json`, `served-files.json`, `git-index.txt`, README con replica. Gli screenshot includono conferenza precedente/nuova e partita nelle16 configurazioni.

**Non verificati:** Android fisico, toolbar/cutout reali, anteprima pubblica del branch,900 secondi continuativi a1×. La suite Node copre anche due stagioni/104 club/76 periodi; non è stata eseguita una nuova campagna browser pluristagionale. Il PASS riguarda il checkout e la matrice Chromium descritti, non certifica ogni dispositivo Android o tutte le possibili carriere.

**Consegna:** rapporto su branch esclusivamente documentale. PR #48 pronta per la valutazione di merge sull'HEAD indicato, senza nuovi fix richiesti da questo audit. Nessun merge, modifica al gioco/NEXT, audit di altre PR o avvio di ulteriori attività.
