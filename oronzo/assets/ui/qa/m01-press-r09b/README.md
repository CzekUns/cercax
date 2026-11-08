# R09B-M01-2 — Conferenza nel runtime autentico

Stessa PR #48, recuperata da HEAD `58c7c65506f74f012b17b099583e96ee380f8db5`.
Nessun nuovo gameplay, HTML o JS di gioco. Unico cambiamento runtime: quattro regole CSS limitate a `.runtime-answers`.

## Riproduzione

Dalla root del checkout, con Node, Playwright e un eseguibile Chromium compatibile con `Emulation.setSafeAreaInsetsOverride`:

```sh
CHROMIUM=/percorso/chromium node oronzo/assets/ui/qa/m01-press-origin.cjs
CHROMIUM=/percorso/chromium node oronzo/assets/ui/qa/m01-press-compare.cjs
CHROMIUM=/percorso/chromium node oronzo/assets/ui/qa/m01-press-runtime.cjs
node --test oronzo/app/flow/tests/*.mjs oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js
node --test oronzo/systems/match-view/*.test.mjs
```

Se Playwright non è nelle dipendenze locali, impostare `NODE_PATH` sul relativo `node_modules`. Se il browser richiede librerie condivise esterne, impostare anche `LD_LIBRARY_PATH`. Nella sessione di recupero: Node 24.22.1, Playwright del runtime, Chromium 153.0.8010.0 estratto dal pacchetto `@sparticuz/chromium` già presente. Il download standard Playwright ha restituito archivi incompleti; non è stato usato un browser simulato.

Tutti e tre gli harness avviano e chiudono un server HTTP su 127.0.0.1, porta effimera, servendo HTML/ESM/CSS/JSON/PNG del checkout. Nessun `route.fulfill`, `set_content`, shim storage o score fittizio. Gli URL `/preM01/`, `/prePressFix/`, `/before/` cambiano solo il file CSS restituito dal server HTTP; il resto è il gioco originale identico.

## Origine verificata

`pre-m01-career.css` proviene da `55df243b6397d545baab967652f8556f71f878d3`, blob `866a60e83b4cce4ca047615ab677dfd99a28c644`.
`pre-press-fix-career.css` proviene da HEAD #48 `58c7c65506f74f012b17b099583e96ee380f8db5`, blob `e9a9a1194bee8051755220650481538f6ef19e15`.
`origin-results.json` conserva rettangoli, intersezione con viewport/antenati overflow e catena DOM completa prima/dopo, in mouse e touch.

640×360, inset top0/left24/right12/bottom16, avatar1 e ventesima offerta, domanda3/risposta3:

| Revisione | Stage | Nominale | Visibile |
|---|---|---:|---:|
| Prima di M01 | 640×360, x0/y0 | 44,625 | 44,625 |
| PR pubblicata prima del fix conferenza | 604×344, x24/y0 | 44 | 39,15625 |
| Fix conferenza, dopo scroll | 604×344, x24/y0 | 44 | 44 |

Il difetto **non è riprodotto prima di M01** nel medesimo scenario. Il CSS M01 riserva gli inset e riduce lo spazio verticale del pannello: con il suo `overflow:hidden` la terza risposta viene tagliata. La correzione precedente al padding del pannello partita non influisce sulla conferenza.

## Matrice e metodo

`runtime-results.json`: 640×360, 800×360, 844×390, 960×400 × mouse/touch × safe area assente/presente. Inset presenti `{top:0,left:24,right:12,bottom:16}`, DPR1, locale it-IT.

In ciascun percorso si misurano e si attivano **tutte le tre opzioni delle cinque domande iniziali e delle due domande postpartita**. Per ogni opzione: intersezione con viewport e aree interne di tutti gli antenati overflow; target effettivo ≥43,99px (tolleranza floating point 0,01 sul requisito 44); intero rettangolo del pulsante visibile; `elementFromPoint` al centro; mouse.click o touchscreen.tap alle coordinate, senza auto-scroll dei locator. Se necessario, wheel o `Input.dispatchTouchEvent` a più passi portano le risposte in vista. Non vengono assegnati `scrollTop` o `scrollIntoView` alla conferenza.

Dopo ogni prova di risposta si ripristina un salvataggio precedente **nel vero localStorage**, poi si usa l'azione CARICA del gioco e si confronta il JSON completo. È un branching di test, non uno shim o una modifica alle regole. Il percorso canonico sceglie poi la prima risposta e completa la prima partita con il comando QA del vero Engine06.

Lo script controlla anche avatar8, offerte20, rosa16/sedicesima scheda, Allenamento in lettura, classifica16, formazione11 con un GK, 22 attori del motore, finale, settimana2, save/reload/load identico, soglia gameover tramite API09, nuova carriera con vecchio save protetto, rifiuto sovrascrittura, `geography_required` senza mutazioni e ritorno portrait/landscape.

`comparison-results.json`: confronto prima/dopo su tutte16 le configurazioni; TERMINA GARA attivato fisicamente, geometria stage/canvas identica e font calcolati di tutte le domande/risposte invariati. I font con/senza inset sono confrontati anche dalla matrice completa.

Gli harness rigenerano tutte le schermate. Questa consegna conserva una selezione di screenshot nativi: Partita e terza risposta iniziale3 raggiunta in tutte16 le configurazioni, stato iniziale della domanda3 nei casi safe, confronto d'origine e conferenza postpartita 640×360 touch con inset. Le misure complete rimangono nei JSON anche per le immagini non conservate.

## Limiti

QA dell'autore11, **non audit indipendente00**. Android fisico, preview pubblica e 900 secondi reali continuativi non testati. Rimane il 404 opzionale `assets/cutscenes/manifest.json`, già assente nel checkout di partenza; gli harness rifiutano altri HTTP >=400 e pageerror. Dati geografici del playtest esplicitamente sintetici. Nessun merge.
