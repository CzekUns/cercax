# ORONZO — REPORT R08B · Verifica finale indipendente PR #43

**Verdetto: PASS — raccomandato il merge della PR #43 al HEAD verificato. Nessun merge effettuato.** Le quattro correzioni R08 risultano verificate; nessuna regressione importante riprodotta nei percorsi sotto descritti.

- Data: 8 novembre 2026, Europe/Rome.
- Main letto e riconfermato: `82b5f5f629c3b2b5c41410053817512f4642e736`.
- PR [#43](https://github.com/CzekUns/cercax/pull/43), HEAD **`4d00fb5bb6f05465eec30e1b8d997865579d47d8`**, riconfermato OPEN/NOT MERGED al termine.
- Letti REQUEST READY_R08B, RUN, NEXT03, REPORT03 aggiornato e [REPORT-R08 originale](https://github.com/CzekUns/cercax/blob/af1a08aac0389b26e7023c52a8fa6bc13d9315a1/oronzo/coordination/coerentizzatore/REPORT-R08.md), oltre ai contratti/documenti di coordinamento pertinenti.
- Scope PR: 23 file, esclusivamente nuovo runtime/QA in assets/ui, link in index.html e REPORT03; nessuna modifica ai sistemi degli altri agenti. Nessuna modifica del revisore al gioco o ai NEXT.

## Ambiente e prove

**Chromium 149.0.7827.0 + Playwright Node**, vero server statico HTTP su 127.0.0.1, ESM/CSS/JSON/PNG originali, localStorage autentico. Nessun route.fulfill, set_content o storage shim. Checkout ricostruito da main più i file della PR, blob Git confrontati; sorgenti principali:
- career-r03.js: `729ab290406d7ab6b33747e6ab09280f04b65af4`
- career-r03.css: `866a60e83b4cce4ca047615ab677dfd99a28c644`
- career-r03.html: `94b5774f81fefa776108d722af97365e89e78485`

**Sei percorsi indipendenti:** desktop e mobile/touch emulato, ciascuno a **640×360, 800×360, 844×390**, DPR 1, locale it-IT. Immagini reali decodificate e screenshot propri esaminati personalmente. Tap/click dei controlli sul centro fisico, con hit-test, senza scorrimento automatico Playwright. Liste percorse tramite gesture touch CDP o wheel.

## Chiusura dei quattro rilievi

| Rilievo | Prova indipendente | Esito |
|---|---|---|
| **R08-1** Rosa/schede/Allenamento | 16/16 giocatori; sedicesimo selezionato da Rosa e Allenamento; ID/club/nome e valori tecnici confrontati con i DTO autentici getRosterPlayer/getTrainingPlayer. Navigazione di ritorno funzionante, stato invariato dopo consultazione. Modifica allenamenti realmente disabilitata. | **PASS 6/6** |
| **R08-2** Classifica | 16/16 righe; ID, ordine e punti confrontati con getStandings reale. Scroll fino alla posizione 16 con gesture, posizioni 13–16 raggiungibili. Club del mister presente ed evidenziato, anche inizialmente sedicesimo. | **PASS 6/6** |
| **R08-3** Touch/clipping | Intersezione del rettangolo con viewport e tutti gli antenati overflow. CTA avatar, select origine/capitano e TERMINA GARA QA: **44px visibili**; ultima riga Rosa e formazione: **45px**; cinque controlli hub almeno 44px. Hit-test e tap centrali riusciti. | **PASS 6/6** |
| **R08-4** Game over/nuova carriera | Evento reale applyCoachMoraleEvent del 09 con delta -100; stato terminale. NUOVA CARRIERA azzera solo runtime e apre avatar senza refresh. Nuova newGame con avatar/nome diverso e morale positivo; vecchio oggetto coach resta a morale 0. Save precedente invariato dopo reset e ingaggio/autosave della nuova carriera; SALVA manuale chiede conferma, rifiutata nel test. Ricaricamento del precedente save ripristina esattamente lo stato. | **PASS 6/6** |

Per R08-3 raccolte **54 misure per percorso**. Minimo effettivo dei target interattivi controllati: 44px, in tutti e sei i casi. Le righe di classifica sono informative, non pulsanti: la loro altezza 32px non viene confusa con il requisito dei target touch. Prova supplementare: target label del toggle QA 44px e attivazione/disattivazione dell'ultima riga formazione con tap reali, ripristinando 11 titolari.

**Allenamento è consultazione**, come autorizzato dal NEXT corretto; non viene certificata un'azione di allenamento attivo. L'evento morale-zero è una fixture di soglia applicata tramite API09 reale, non una carriera esaurita naturalmente.

## Regressioni e suite rieseguite

| Test sul nuovo HEAD | Risultato |
|---|---|
| node --check oronzo/assets/ui/career-r03.js | **PASS** |
| node --test oronzo/app/flow/tests/*.mjs oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js | **97/97 PASS**, 0 fail, circa 47,2 s |
| node --test oronzo/systems/match-view/*.test.mjs | **22/22 PASS**, 0 fail |
| Nuova → 8 avatar disponibili → 20 offerte → ingaggio/presidente → 5Q → hub → formazione 11/1GK → 22 calciatori Engine06/fulltime → 2Q → advanceMatchday → save/reload | **6/6 PASS** |
| Modalità normale senza catalogo | **6/6 PASS**, geography_required senza alcuna differenza nel JSON di stato |
| Banner sintetico, dieci PNG UI, sprite veri disponibili su main | **PASS** nei sei percorsi |
| Clock a 1× | Circa 6 secondi simulati in 1,05 secondi reali, nei sei percorsi |
| Doppio tap avanzamento | Resta settimana 2: un solo periodo economico registrato |
| Save/load dopo reload autentico | JSON di stato esattamente identico, **6/6** |
| Chiusura e riavvio del processo Chromium con stesso profilo su disco | Stato identico; chiave legacy separata preservata |
| Home legacy e collegamenti a nuova carriera/partita rapida | **PASS** navigazione supplementare |

Prima partita: **2–0** nei sei casi, con due eventi goal a t=504 e t=3385 dello stesso club, due punti in classifica; morale **50→52** dopo le conferenze. Cassa **9.063.000**, singolo addebito salari **477.000**, periodo settledWeeks **[a:1]**: nessun duplicato dopo avanzamento/reload. Ordine/punti e posizione derivano dalla carriera reale.

**Zero eccezioni JavaScript.** Rimane **un 404 opzionale per percorso** su assets/cutscenes/manifest.json, già assente da main e dichiarato: fallback renderer, nessun altro HTTP >=400 rilevato nel percorso. Non viene dichiarata console completamente priva di messaggi di rete.

## Evidenze, limiti e raccomandazione

[Pacchetto indipendente R08B](https://chatgpt.com/library?file_id=libfile_d0a78cca56fc8191987e21d3ca286c79&account_id=personal): harness Node, log Node/browser, metriche dei target, risultati e **20 screenshot propri**, non screenshot dell'autore. SHA256 ZIP: `58978477a619c66025f7057ce9b735b4f11966c46fb1c8057791b84f03285ed5`. Replica documentata nel LEGGIMI: recuperare main + PR nel percorso indicato, Playwright/Chromium locale e avviare i due harness.

**Non verificati:** Android fisico, URL pubblico, 900 secondi reali continuativi di partita, carriera pluristagionale nel browser, TV/cutscene definitive e allenamento attivo. Le due stagioni sono esercitate dalla suite Node rieseguita. I dati QA restano sintetici; questo audit non valida i dataset geografici/cognomi della release.

**Raccomandazione:** PR #43 ready for orchestrator review e merge sul preciso HEAD sopra, dopo il nuovo mandato esplicito dell'utente previsto dal REQUEST. In questo incarico **nessun merge**, nessuna modifica di main/gioco/NEXT e nessuna revisione di altre PR. REPORT-R08B consegnato in PR documentale separata, senza auto-merge.
