# ORONZO — HANDOFF COMPLETO AGENTE 10 → 10-BIS

**Preparato:** 9 novembre 2026. **Nuovo owner orchestrazione:** `ORONZO-AGENT-10B`, alias 10-bis, issue [#65](https://github.com/CzekUns/cercax/issues/65). **Predecessore:** `ORONZO-AGENT-10` (storico, in standby dopo attivazione del 10-bis).
**Repository:** `CzekUns/cercax`, solo cartella `oronzo/**`. **Priorità:** stadi/HEAD *sempre riverificati live*; questa è una fotografia del passaggio, non un feed automatico.

## 1. Decisioni del proprietario da preservare
- ORONZO è un gestionale calcistico mobile **orizzontale 16:9** con atmosfera provinciale rétro/pixel-art, nuovo mister nel **1979** (non la precedente stagione 1985–86), scelta avatar e **20 offerte**, campionati dalla Promozione, rapporti con presidente/tifosi/stampa, allenamento, partite animate 11v11, caricamento e lunga carriera; **morale mister a zero = game over**. In partita 1× circa **15 minuti reali**, come da GAME-VISION-v02.
- Promozione ha **30 partite**, altre divisioni possono avere 38 giornate: settimane 31–38 senza match del mister devono avanzare senza inventare gol/conferenze del mister, mantenendo gli altri campionati, stipendi e allenamenti. Due stagioni complete sono il caso di certificazione.
- I **500 comuni** integrati sono da fonte contemporanea, non certificazione del 1979; i **600 cognomi** documentati sono fonte Bergamo 2021 e non rappresentano dati demografici nazionali. I cataloghi devono essere davvero usati dalla nuova carriera, non soltanto presenti in repository.
- Il proprietario vuole **playtest diretto su telefono** e correzioni per screenshot, **nessun Layout Editor**. Il12 è incaricato di cambiare posizione/dimensione/leggibilità; il 07-bis costruisce il contenuto e le funzioni delle sottosezioni.
- Richiesta esplicita: **07 originale saturo → 07-bis subentra completamente**, inclusi Career07, Flow e save. Analoga nuova successione dell'orchestratore: **10-bis** subentra a 10, senza riscrivere la storia.

## 2. Stato GitHub verificato al passaggio

### Già integrato su main (NON riavviare)
| PR | Funzione |
|---|---|
| #52 | fullscreen nativo |
| #53 | 500 comuni |
| #29 | sprite giocatori |
| #28 | renderer camera FULL/BROADCAST come API |
| #31 | PlayerV2, tratti e catalogo 600 cognomi |
| #35 | comandi individuali Engine06 |
| #57 | logica presidente/mercato/stadio/shout persistente 09 |
| #56 | adapter carriera07 e progressione bye-week |
| #59 | landing larga e rimozione footer UI12 |
| #60 | scrivania PC e sottosezioni full-width UI12 |
| #61 | ripristino immagine PC/caricamento UI12 |

Queste PR sono **CLOSED/MERGED** secondo GitHub. Non supporre che tutte le loro API siano raggiungibili dalla UI.

### Aperte e vincoli
| Ref | Stato | Azione |
|---|---|---|
| [PR #63](https://github.com/CzekUns/cercax/pull/63), 07-bis, HEAD auditato `6eb647894f79b38bc26915f016d245b7ee25bc85` | OPEN / NOT MERGED | Scheda giocatore, 5 piani allenamento + intensità, Stadio/Tifosi/Giornali read-only, agenda bye-week. **NEEDS CHANGES** |
| [PR #64](https://github.com/CzekUns/cercax/pull/64), HEAD `9227e057103bff9e745dd25415e2e739af4863a9` | OPEN audit-only | Rapporto audit indipendente contro #63, non una PR da mergiare nel runtime |
| [PR #12](https://github.com/CzekUns/cercax/pull/12) | OPEN DRAFT | Cutscene Agente02; nessun merge senza nuovo gate artistico+tecnico |
| #55 / #58 | OPEN audit-documentale | Relazioni di audit storiche; non causano rilascio o merge del codice |

**Il passaggio non contiene nuovi HEAD della #63:** controllare sempre prima di richiamare 07-bis.

## 3. Audit #64: evidenze da non perdere
Report su branch `#64`, percorso `oronzo/coordination/coerentizzatore/REPORT.md`, verdetto **NEEDS CHANGES**. Verificati **64/64 test Node**, **10/10 casi addizionali di allenamento**, **8 percorsi Chromium HTTP** su 640×360, 800×360, 844×390, 960×400 con e senza safe-area: 232 checkpoint, touch/scroll, immagini PC e training PNG. Non sono prove su telefono Android fisico.

**R11-QA-01 — introdotto da #63:** si sceglie RECUPERO, intensità 73%; ledger persistito corretto, ma dopo reload pulsante disabilitato ed evidenziazione mostrano EQUILIBRATO, slider 50%. Correzione **nella PR #63**: i controlli della settimana già scelta devono leggere la selezione persistita, non default locali; save/reload browser E2E.

**R11-QA-02 — preesistente su main, ora affidato a 07-bis:** carriera standard (1979, PROM, 30 match) alla settimana31: stato serializzato ≈ **4.125.983 caratteri**. Primo slot `localStorage` passa, secondo slot può lanciare `QuotaExceededError`. Le settimane31–38 passano in memoria e si raggiunge39, ma silenziosi fallimenti save fanno tornare alla31 al reload. Conservare il precedente slot recuperabile. **Fix UI dei messaggi nella #63**, **fix strutturale save manager nella PR backend separata** (progetto 07-bis). Non certificare playtest di due stagioni persistenti finché manca gate Chromium su due slot grandi e reload.

**Stadio:** schede visibili, nessuna biglietteria operativa. Manca `club.stadium` con capacity/condition/ticketPriceITL validi e adapter transazionale Career07→Coach09, documentato in `oronzo/assets/ui/sections-r11/HANDOFF-07-09.md` nella PR #63. Prezzo/incasso/fiducia/morale **solo su partite casalinghe effettivamente concluse e recensite**, con commit e ledger atomici una volta sola. Non inventare capienza, incassi né dati 1979.

## 4. Responsabilità agenti dopo due successioni
| Agente | Stato / owner |
|---|---|
| **00** | auditor indipendente; Node/Chromium, report e verdict; non merge |
| **01** | artwork sprite, regressioni solo su difetti veri |
| **02** | cutscene (PR #12 draft), nessun rilascio automatico |
| **03 / 11** | UI storica; 11 consegnato, non riavviare cicli duplicati |
| **04** | testi e conferenze, originali e verificabili |
| **05** | visualizzazione partita, camera FULL/BROADCAST disponibile come API |
| **06** | engine partita/ordini, non UI |
| **07** | **STANDBY — sostituito** |
| **07-bis** | **owner unico** Career/Flow/Save + sezioni R11, attivo PR #63, issue #62 |
| **08** | attributi, training mechanics, dati cognomi |
| **09** | presidente, finanza, mercato, effetti persistenti; 07-bis fa gli adapter |
| **10** | **STANDBY — successore 10-bis** |
| **10-bis** | **ORCHESTRATORE UNICO**, issue #65 |
| **12** | correzioni durante playtest da screenshot Android; non tocca simultaneamente hunks 07-bis |

## 5. Sequenza di incarichi per il 10-bis
1. **Controllare #63 e #64** e aggiornare NEXT07B se nuove correzioni. Far concludere **P0-A stessa PR #63**: controllo training reload/73%; errore quota mostrato, progresso solo in RAM chiarissimo; test veri.
2. Assegnare al 07-bis **P0-B backend persistenza** in PR distinta: provider sostenibile (es. IndexedDB, o formato compatto dimostrato con storage reale) con 2 copie recuperabili e commit atomico, migrazione chiavi `oronzo.career.flow.r03` + `oronzo.career.v2`, checksum, import/export, failure recovery. Prova con carriere grandi/due stagioni standard in browser e Node.
3. Ottenere **re-audit 00 mirato** di entrambe le correzioni con nuovo HEAD, combinazione integrata; se PASS e utente autorizza, merge **uno alla volta** (HEAD esatto), test post-merge e Android con 12.
4. **Stadio/Presidenti/mercato**: 07-bis adapter 07↔09, dati stadio canonici/assunzioni di gameplay esplicite, biglietteria+incassi, richieste e vendite in finestra, seller release, anti replay; 09 conferma contratto senza cedere formule.
5. **Dati e gameplay M1**: il runtime `career-r03.js` deve invocare il catalogo 600 cognomi nella nuova carriera; integrare UI camera TV (`view.setCameraMode`), ordini `commandM1Match`, formazione reale e lavagna, calendario, tifoseria/giornali/presidente in sezioni ricche, agenda.
6. **Cutscene e polish** soltanto dopo gate giocabilità e audit, evitando nuove ricerche inutili o campionati/dati falsamente storici.

**Da evitare:** riattivare 07, duplicare UI12/07-bis, accettare PR63 sulla sola base 24 test V8 (sono stati fatti test browser nel #64 e trovato BUG), riprogettare engine o ricominciare roadmap, proclamare "gioco finito" senza persistenza e UI operativa.

## 6. Dove leggere le informazioni canoniche
- `oronzo/coordination/10b-orchestrator/{IDENTITY,RUN,NEXT,HANDOFF}.md` (mandato successore)
- `oronzo/coordination/10-orchestrator/TODO-R11-SEZIONI-UI.md` (backlog completo con correzione owner 07-bis)
- `oronzo/coordination/07b-sections/{IDENTITY,RUN,NEXT}.md` (tutti gli incarichi di successione 07)
- `oronzo/app/flow/M1-AGENT12-CONTRACT.md`, `oronzo/systems/coach-club/MANAGEMENT-R10.md` (contratti funzionali)
- `oronzo/coordination/coerentizzatore/{REQUEST,RUN}.md` su main e `REPORT.md` sul branch #64 (audit)
- [Epic issue #25](https://github.com/CzekUns/cercax/issues/25), [issue screenshot #54](https://github.com/CzekUns/cercax/issues/54), [issue 07B #62](https://github.com/CzekUns/cercax/issues/62), [issue 10B #65](https://github.com/CzekUns/cercax/issues/65)
- `oronzo/coordination/GAME-VISION-v02.md` fonte di verità del prodotto; `oronzo/coordination/PROTOCOL.md` protocollo dei gate
- `oronzo/coordination/ORCHESTRATOR.md` registro storico molto lungo: **non usarlo come ultimo stato**; contiene 1985–86 e altri piani superati dal 1979.

## 7. Criteri di consegna / cambio chat
Il 10-bis **non dovrebbe chiedere all'utente di ripetere** numeri PR o aspettare passivamente. Deve iniziare con controllo GitHub reale e dire:
- quali PR sono aperte e a quali HEAD;
- quali agenti contattare (solo quelli necessari) e con quale prompt;
- che cosa è già su main, che cosa è in PR e che cosa è bloccato;
- se ha modificato davvero NEXT/issue (e con quale commit) oppure ha soltanto consigliato.
Non si perde mai lo storico: **10 originale = archivio; 10-bis = nuovo proprietario operativo**. Nessun comportamento asincrono attribuito a una chat.
