# RAPPORTO ORONZO-AGENT-11 — M01 · Recupero spazio landscape

**Stato: PR_OPEN / richiesta audit 00. Nessun merge.**
PR: [#48](https://github.com/CzekUns/cercax/pull/48).
Data: 8 novembre 2026, Europe/Rome.
Branch: `agent/oronzo-11-mobile-m01`, base ultimo main `55df243b6397d545baab967652f8556f71f878d3`, riconfermato invariato dopo i test.
Commit codice/QA verificato: `c36411d34e880f2caff2a9407e77b41a05055c6d` (questo report segue in commit documentale).
Issue: [#47](https://github.com/CzekUns/cercax/issues/47).

## Continuità e perimetro

Letti integralmente IDENTITY/RUN/NEXT11, PROTOCOL, registry, GAME-VISION-v02, AGENTS e asset-contract, IDENTITY/RUN/NEXT/REPORT03, specifiche 03/11, istruzioni d'integrazione, demo R02, runtime R03, script e risultati QA, API flow07 e renderer05. Ricostruita la storia e discussione delle PR #33/#43, con rapporti indipendenti R07B/R08B: #33 merged `c019d511af89eb54851b3743fba598254d59707f`; #43 merged `241068d383a67c0be8513a2ef9b74b37eea58155`, HEAD approvato `4d00fb5bb6f05465eec30e1b8d997865579d47d8`.

03 è storico/HOLD; nessuna PR UI concorrente rilevata nel controllo delle PR aperte. Identità corrente **11**, nessuna riassegnazione o modifica ai suoi documenti. Non ripartito da zero.

Unico file runtime modificato: **`oronzo/assets/ui/career-r03.css`, otto righe aggiunte**, due regole dentro media query landscape:

- `.site` riserva `env(safe-area-inset-*)` sui quattro lati;
- `#oronzo-r03` usa il 100% della larghezza e altezza del contenitore, già dimensionato con `100dvh`.

Nessun cambiamento HTML, JS, asset, font, altezza delle barre, gameplay, camera, regole, stato o salvataggi. Demo R02 e legacy restano invariati. Aggiunti soltanto QA/script/evidenze locali autorizzate e questo REPORT.
CSS prima: blob `866a60e83b4cce4ca047615ab677dfd99a28c644`; dopo: **`7feecdc8a9e16d01237627c895bf84e8a4586ad5`**. JS runtime sempre `729ab290406d7ab6b33747e6ab09280f04b65af4`, HTML sempre `94b5774f81fefa776108d722af97365e89e78485`.

## Risultato misurato prima/dopo

Chromium **149.0.7827.0**, HTTP locale autentico, DPR 1, desktop e mobile/touch emulato. Numeri CSS px, non misure Android fisico. Le misure sotto valgono per Ufficio e Partita e coincidono tra mouse e touch.

| Viewport innerWidth×innerHeight | Stage prima | Margine per lato prima | Stage dopo | Margini dopo | Superficie occupata prima → dopo |
|---|---|---:|---|---:|---|
| 640×360 | 640×360 | 0 | 640×360 | 0 | 100% → 100% |
| 800×360 | 640×360 | 80 | 800×360 | 0 | 80% → 100% |
| 844×390 | 693,328×390 | 75,328 | 844×390 | 0 | 82,15% → 100% |
| 960×400 | 711,109×400 | 124,438 circa | 960×400 | 0 | 74,07% → 100% |

In assenza di cutout restano **zero px inutilizzati fuori dallo stage**. Su 800×360 lo stage recupera 160 px totali (+25% rispetto alla sua larghezza iniziale); su 844×390 recupera circa 151 px (+21,73%); su 960×400 circa 249 px (+35%). Le larghezze dei pannelli flessibili e dei tasti crescono, senza cambiare font o altezze.

| Viewport | Canvas prima e dopo (larghezza×altezza) | Rapporto misurato dopo |
|---|---|---:|
| 640×360 | 328,875×184,984 | 1,77785 |
| 800×360 | 328,875×184,984 | 1,77785 |
| 844×390 | 361,078×203,094 | 1,77789 |
| 960×400 | 378,859×213,094 | 1,77790 |

**Il campo non diventa più grande in M01:** è già limitato dall'altezza disponibile. Il canvas 640×360 conserva scala uniforme e intero campo. Rimane spazio verde interno ai lati del canvas: è il contenimento intenzionale del campo 16:9, non una nuova camera o una superficie occupata dal campo stesso. Riempirlo richiederebbe sacrificare altezza delle barre/controlli o cambiare camera, fuori mandato. Nessuna promessa di aumento del campo o di zoom.

## Verifiche realmente eseguite

| Controllo | Esito |
|---|---|
| Node flow/carriera/coach sul branch con CSS definitivo | **97/97 PASS**, 0 fail; circa 18,8 s |
| Node renderer05 | **22/22 PASS**, 0 fail |
| `node --check career-r03.js` | PASS |
| `python qa/check_assets.py` | PASS, 10 PNG originali e manifest |
| Chromium prima / dopo | **8/8 + 8/8 PASS**, quattro viewport × mouse/touch |
| Clic e touch | Coordinate centrali con hit test, senza auto-scroll delle CTA; swipe CDP e wheel per raggiungere ultime righe |
| Touch target misurati dopo | Minimo **44 px realmente visibili**, larghezza minima 70,5 px sui target campionati; clipping calcolato lungo tutti gli antenati overflow |
| Toast/header/footer/banner | Zero intersezioni toast/controlli/indicatori; banner visibile, nessuna riduzione font; ispezione screenshot nativi |
| Safe area CDP simulata | A 844×390 con sinistra24/destra12/basso16: stage x24/y0, **808×374**, CTA fisse e partita interamente raggiungibili; canvas 332,625×187,094, rapporto preservato |
| Resize viewport (simulazione toolbar) | 844×360 → 844×390 → 960×400: stage segue esattamente lo spazio disponibile; controlli fissi verificati |
| Orientamento | Avviso portrait e ritorno landscape riusciti in tutti gli 8 percorsi dopo |
| Kit R02 separato | Conserva 16:9 e margini: a 960×400 stage 711,109×400 |
| Link legacy / Rapida 1985 | Collegamenti presenti e pagina partita rapida HTTP 200; nessun file legacy cambiato |
| Integrità sorgenti ricostruiti | **246/246 blob invariati** corrispondenti al main, oltre al CSS letto prima della modifica; manifest SHA in QA |

Ogni percorso browser esercita il **runtime reale**: otto avatar selezionati, 20 offerte dal controller07 e ultima raggiunta con gesto, ingaggio/presidente, cinque risposte iniziali, Ufficio, Rosa e Allenamento con 16/16 e scheda dell'ultimo, classifica 16/16 e scroll finale, formazione 11/GK/capitano, 22 attori Engine06 e fulltime tramite comando QA reale, due domande postpartita, avanzamento a settimana2, reload HTTP e caricamento JSON identico. Provati game over tramite API09, nuova carriera senza cancellazione dei save, rifiuto del dialogo di sovrascrittura, e `geography_required` senza mutazione. Nessuna simulazione o storage sostituiti nel test.

**Zero eccezioni JavaScript** nel percorso R03. Rimane il noto **404 opzionale `assets/cutscenes/manifest.json`** per partita, già assente da main; nessun altro HTTP >=400 rilevato. Non dichiaro console di rete senza errori.

## Evidenze e replica

- `oronzo/assets/ui/qa/m01-landscape.cjs`: server HTTP e confronto funzionale/metrico;
- `oronzo/assets/ui/qa/m01-environment.cjs`: safe area, resize, target fissi e collegamenti legacy;
- `oronzo/assets/ui/qa/m01/`: **48 screenshot Chromium nativi** (6 viste × 4 viewport × prima/dopo), `before-results.json`, `after-results.json`, `environment-results.json`, log Node/browser, SHA sorgenti e README con comandi.

Confronto principale 800×360:

| Ufficio prima | Ufficio dopo |
|---|---|
| ![Ufficio prima](../../assets/ui/qa/m01/before-office-800x360.png) | ![Ufficio dopo](../../assets/ui/qa/m01/after-office-800x360.png) |

| Partita prima | Partita dopo |
|---|---|
| ![Partita prima](../../assets/ui/qa/m01/before-match-800x360.png) | ![Partita dopo](../../assets/ui/qa/m01/after-match-800x360.png) |

Gli altri screenshot includono Avatar, Offerte, Conferenza e Classifica alle quattro risoluzioni. Metriche complete (inclusi coordinate e rapporto del canvas) nei JSON. Gli script Python storici R03/R04/R07/R08 sono stati letti, non rieseguiti come comandi: questo ciclo usa i nuovi harness Node HTTP senza route.fulfill o storage shim.

## Limiti e prova Android

**Non testato Android fisico, non pubblicata una preview di questo branch, non attesi 900 secondi reali di gara.** Cutout e resize sono emulazioni, non la prova delle barre di Chrome/gesture Android reali. Conservati testi piccoli esistenti, da valutare sul telefono; nessun giudizio di leggibilità fisica universale. Non certificata una nuova suite completa di gameplay legacy.

Per provare prima del merge: checkout del branch, `python3 -m http.server 8000 --bind 0.0.0.0` dalla root; Android sulla stessa rete, aprire `http://<IP-LAN-del-PC>:8000/oronzo/assets/ui/career-r03.html`, ruotare landscape, confrontare Ufficio/Partita con barre visibili e nascoste, tornare portrait/landscape e ricaricare il save. IP/URL LAN non verificati qui. Usare deliberatamente la modalità etichettata sintetica. Il sito pubblico continua a servire main finché non viene effettuato un merge autorizzato.

## Handoff

M01 consegnato per **audit mobile CSS dell'Agente00** e coordinamento dell'Agente10. Nessun merge e nessun incarico assegnato ad altri agenti. API/contratti invariati; non serve integrare moduli nuovi.

M02 camera segue pallone, M03 comandi mister e M04 **Layout Studio privato dello sviluppatore** restano futuri NEXT separati. Nessun editor, link o codice Layout Studio nell'app per giocatori. Prossimo passo consigliato: audit00 e prova Android reale; nessuna estensione autonoma del mandato.
