# Agente11 — correzione R09-M01-1

Unica modifica runtime: `#oronzo-r03 .runtime-match-panel{padding-top:1px}`, dentro la regola landscape M01. Recupera 2px decorativi nella configurazione compatta e spazio sufficiente nella configurazione 400px, preservando l'altezza 44px della CTA e gli inset dello stage.

## Riprodurre

Dalla root repository, con Node, Playwright e Chromium installati:

```sh
NODE_PATH=/percorso/node_modules CHROMIUM=/percorso/chromium node oronzo/assets/ui/qa/m01-fix-r09.cjs
node --test oronzo/app/flow/tests/*.mjs oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js
node --test oronzo/systems/match-view/*.test.mjs
```

La matrice comprende 640×360, 800×360, 844×390, 960×400; ciascuna con mouse/touch e inset nulli oppure `{top:0,left:24,right:12,bottom:16}`. HTTP reale su porta effimera, localStorage reale, nessuna intercettazione Playwright delle risorse. DPR1, locale it-IT, Chromium153.0.8010.0.

Il test conserva 44px dopo intersezione con viewport e aree interne di tutti gli antenati overflow; controlla il centro con elementFromPoint e usa coordinate mouse/touch. Le liste vengono percorse con wheel/gesture CDP. Il select Origine è in un corpo già scrollabile: se necessario viene portato interamente in vista con la stessa gesture, senza cambiare la UI. Le CTA fisse non vengono scorse automaticamente.

`results.json`: **16 percorsi funzionali completati**, target finish-qa **16/16 a 44px**, font identici con/senza inset. `before-safe-results.json` registra le misure R09 precedenti sullo stesso HEAD iniziale 6e72486607405d06d9a5ba8cac8d00a002ea5da8: 42px nei sei casi segnalati. `target-probe.json` è un controllo supplementare del pannello corretto, 8/8 con inset. Screenshot selezionati: 16 Partita + 8 Avatar con inset + 8 Ufficio con inset; il comando può rigenerare le altre viste.

## Trovato anche fuori dalla correzione autorizzata

**Non è un PASS generale di tutte le geometrie con inset.** A 640×360 con inset e una domanda iniziale lunga, la terza risposta stampa ha 39,15625px visibili. La matrice lo registra in `otherFindings`, stato `R09_FIX_PASS_WITH_OTHER_FINDINGS`, senza confonderlo con il risultato del pulsante TERMINA GARA. Il controllo finish-qa resta un'asserzione bloccante; il percorso funzionale usa risposte pienamente raggiungibili.

`existing-press-before-after.json` conferma la stessa identica geometria prima e dopo il fix, sul CSS precedente: risposta3 della domanda3, y247,84375, nominale44, visibile39,15625. Nessuna regola della stampa è cambiata. Il problema è documentato per il prossimo incarico/revisore, non corretto ampliando lo scope R09-M01-1.

Limiti: QA dell'autore, non audit indipendente; Android fisico e preview pubblica non verificati; non attesi 900 secondi reali; noto 404 cutscene opzionale. Nessuna camera, comando allenatore o editor implementato. Nessun merge.
