# ORONZO — Rapporto esecutivo R12-BIS, PR #72

Data: 2026-11-10. Scope: conferenze postpartita contestuali, persistenza UI, regressione IndexedDB, QA; nessuna modifica a CercaX esterno a ORONZO.

## Codice consegnato
- `oronzo/content/press-postmatch.json`: 12 nuove domande originali, quattro per ciascun esito win/draw/loss, tre risposte e quattro chiavi effetto per risposta; regole `when.result` valutate dal Copy04 esistente.
- `oronzo/assets/ui/career-r03.js`: correzione reale alla segnalazione di persistenza. Il manager IndexedDB R11 serializza già gli snapshot in ordine, ma la prima operazione conclusa azzerava `dirtyUnsaved` anche se una risposta successiva non era ancora salvata. Ora ogni mutazione registrata da `persistAction` incrementa `saveRevision`; soltanto la scrittura dello stesso oggetto stato e della revisione corrente può azzerare il flag. La seconda conferenza non è più esposta a reload anticipato dopo un salvataggio intermedio.
- `oronzo/content/tests/r12-postmatch-browser.mjs`: ogni viewport legge il vero snapshot IndexedDB con un manager indipendente, confronta rapporti, risposte e ledger prima del reload e dopo il reload; registra ID delle transazioni, sequence e revisione. Non basta interrogare il solo flag UI.
- `oronzo/content/tests/r12-postmatch.test.mjs`: compatibilità Node delle 12 domande, reachability per ogni risultato, coerenza dei seed e idempotenza della risposta serializzata.
- `.github/workflows/oronzo-r12-postmatch.yml`: test Node e Playwright/Chromium HTTP.

## Prova tecnica osservata sull'HEAD 6f286a278688cf2e3706e830987912674811ac93
- [GitHub Actions Postmatch run 42904277337](https://github.com/CzekUns/cercax/actions/runs/42904277337): **SUCCESS**, 3/3 test postmatch e 18/18 regressioni native, 48/48 verifiche Chromium HTTP, nessun fail.
- Viewport reali Chromium HTTP: 640×360, 800×360, 844×390, 960×400.
- In ogni viewport: partita QA 1979:PROM:1:5 con esito pareggio; risposte effettive, ultimo IndexedDB sequence=9 e revision=9, stessa relazione stampa 59 prima/dopo reload, ledger con due eventi postmatch e 5 eventi apertura, nessuna perdita dei dati. La precedente perdita 59→58 non si riproduce.
- [GitHub Actions Unsaved integration run 42904277386](https://github.com/CzekUns/cercax/actions/runs/42904277386): **SUCCESS** sul controllo nativo e Chromium.
- La selezione di domande vittoria/sconfitta è coperta dal test Node, NON ancora da partite browser con tali esiti in questa PR isolata.

## Criteri di merge e limiti
Queste prove valgono per #72 isolata sul main pre-R12. Deve ancora essere eseguito il gate combinato con #70 prima della consegna pubblica. Lo smartphone Android fisico e le tre risoluzioni partita in browser restano da verificare separatamente. Nessuna PR #12 cutscene viene mergiata direttamente da qui.
