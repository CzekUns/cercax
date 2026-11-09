# ORONZO — REPORT R07B · Verifica finale UI #33

**Esito: PASS. PR #33 mergiata dopo verifica indipendente**, secondo l'autorizzazione esplicita dell'utente nella chat 00 R07B. Nessun nuovo problema importante rilevato nello scope controllato.

- Data: 7 novembre 2026 (Europe/Rome).
- Main iniziale: `52520b68b44dcbf0873e999da7fca50f9d136004`.
- HEAD #33 testato e passato al merge con expected_head_sha: `1e41c8716798612863aa0fc2327c6ee09deeb82d`.
- **Merge e main verificato:** [`c019d511af89eb54851b3743fba598254d59707f`](https://github.com/CzekUns/cercax/commit/c019d511af89eb54851b3743fba598254d59707f).
- PR produttiva: [#33](https://github.com/CzekUns/cercax/pull/33), unica PR esaminata/mergiata in questo incarico.
- Perimetro verificato: 45 file, esclusivamente `oronzo/assets/ui/` e REPORT03. Nessuna modifica del revisore a gioco, NEXT o branch produttivo.

## Prove indipendenti realmente eseguite

Letti REQUEST corrente READY R07B, RUN, PROTOCOL, NEXT03 e REPORT03, documenti/contratti pertinenti. Confrontati i sorgenti nuovi con quelli effettivamente testati in R07: modifica JS limitata a renderEntry; HTML sposta il toast nel gamebar; CSS riserva spazio alle CTA e allo status. I dieci PNG sono invariati, verificati contro i blob del nuovo HEAD.

**Chromium 149.0.7827.0 + Playwright Node**, vero server HTTP statico su 127.0.0.1, nessuna intercettazione delle richieste, nessun set_content o sostituto delle immagini. PNG originali decodificati esplicitamente prima delle catture. Font di sistema, deviceScaleFactor=1, locale it-IT.

Eseguiti **6/6 percorsi prima del merge e 6/6 dopo il merge**: desktop e mobile con isMobile/hasTouch alle risoluzioni **640×360, 800×360, 844×390**. Tasti critici azionati con mouse.click/touchscreen.tap sulle coordinate del centro, senza locator auto-scroll. Scorrimento offerte provato anche tramite gesti touch CDP. Catture proprie esaminate personalmente, non approvazione basata sugli screenshot dell'autore.

| Gate | 640×360 desktop/touch | 800×360 desktop/touch | 844×390 desktop/touch |
|---|---|---|---|
| R07-1: CARICA PARTITA, altezza effettivamente visibile | 44/44 px, PASS | 44/44 px, PASS | 44/44 px, PASS |
| Hit-test centrale e risposta al clic/tap | sample-load, PASS | sample-load, PASS | sample-load, PASS |
| Hint sotto le azioni dentro il pannello | PASS | PASS | PASS |
| R07-2: quinta risposta → toast visibile → tap immediato CTA | prematch, PASS | prematch, PASS | prematch, PASS |
| Toast senza intersezioni con controlli/indicatori/header | PASS | PASS | PASS |
| Regressioni funzionali/asset/console della demo | PASS | PASS | PASS |

**R07-1 chiuso.** A 640×360 il pulsante ora è x=15,y=239.484375,w=293.5,h=44, con 44 px realmente visibili dopo intersezione con gli antenati che applicano overflow; a 800×360 x=95 con identiche altre misure; a 844×390 x=93.328125,y=263.921875,w=315.15625,h=44. Hint visibile in tutti i casi. I due pulsanti iniziali restano leggibili.

**R07-2 chiuso.** Lo status occupa uno slot nella barra superiore. Controllate le intersezioni con pulsanti, KPI, note, titoli, navigazione inferiore, brand e informazioni data: zero. Verificato durante la sequenza delle risposte, nell'hub e nel menu presidente. UMORE TIFOSI e CTA restano leggibili. Con toast ancora presente il tap centrale restituisce goto/prematch e apre subito la prepartita. Preservata la pulizia del toast al cambio schermata. Il risultato non dipende dal solo pointer-events:none.

## Regressioni controllate

- `node --check oronzo/assets/ui/demo-v02.js`: **PASS**, prima e dopo merge.
- `python oronzo/assets/ui/qa/check_assets.py`: **PASS**, prima e dopo merge; dieci PNG, dimensioni/formati, tre atlanti e manifest.
- Otto avatar selezionati, otto profili distinti, quattro parametri DOM presenti e aggiornati.
- Venti offerte: scorrimento touch e selezione dell'ultima, dettaglio aggiornato.
- Presidente: ritratto reale e ciclo fra i quattro profili; nessuna regressione visiva rilevata.
- Cinque domande con tre risposte; completamento hub; quattro menu e feedback Squadra/Allenamento/Presidente.
- Prepartita, vista partita demo, FULL/TV: 22 marker e coordinate logiche invariati.
- Geometria dei controlli non appartenenti alla lista scrollabile: almeno 44×44 px, nessun clipping rilevato dal controllo dei confini della scena.
- **Zero errori console, pageerror o richieste fallite**, prima e dopo merge.
- Arte, contrasto e piccoli testi ispezionati nelle catture native; nessuna nuova occlusione rilevata.

Usato un harness indipendente equivalente ai test browser della PR, ampliato con intersezione degli antenati, hit-test e tap immediato; non dichiarata esecuzione separata degli script Python R04/R07 dell'autore.

## Verifica main dopo il merge

Riletto main e confermato SHA `c019d511af89eb54851b3743fba598254d59707f`. Recuperati da quel commit i metadati/contenuti dei **15 file necessari al test**: HTML/CSS/JS, dieci PNG, manifest e check_assets.py. Tutti i blob risultano identici ai file locali verificati sul HEAD approvato. Su quell'albero equivalente rieseguiti sintassi, check asset e i **sei percorsi Chromium HTTP**: tutti PASS.

Blob sorgenti verificati:
- HTML: `83b3c435911061fa1a38c0f5eefe4f22526deec9`
- CSS: `621ec2507863f337cbc41abc9712229f6a76f259`
- JS: `99dff55566f7b0fd1053a190c32e352c7d281098`

## Evidenze e limiti

[Pacchetto delle prove indipendenti R07B](https://chatgpt.com/library?file_id=libfile_1dba322c6d648191b12ae72d71919268&account_id=personal): harness Node, risultati prima/dopo merge, log, elenco blob verificati e **18 screenshot propri post-merge** (entry con feedback, stampa con toast, hub post-stampa, presidente con feedback, avatar e TV nelle tre risoluzioni). SHA256 ZIP: `30e2d73b31f539b5de55f76d3df388e447f79ede853e81823f562f207529d391`. I log completi registrano 138 catture per esecuzione; il pacchetto ne seleziona 18.

Per replicare: recuperare `oronzo/assets/ui/` al commit indicato in `r07b-src/oronzo/assets/ui/`, installare Playwright/Chromium, adeguare executablePath nell'harness fornito e avviare `node r07b-qa.cjs`. L'harness crea e chiude il server HTTP.

**Non verificati:** Android fisico e deploy GitHub Pages. Non sono stati promossi a PASS. La consegna è il **kit UI autonomo**, non un gioco integrato: caricamento, valori di carriera, Rosa/Allenamento, score e 22 marker rimangono demo/placeholder. Nessuna nuova certificazione di save/load, due stagioni o dei 97 test headless R06B, fuori da questo incarico.

**Consegna al 10:** gate R07B concluso; può predisporre il ciclo runtime 03 già pianificato tramite NEXT dedicato. Il revisore non lo ha avviato, non ha modificato NEXT e non ha esaminato altre PR. Questo rapporto resta in PR documentale separata, senza auto-merge.
