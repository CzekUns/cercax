# RAPPORTO ORONZO AGENTE 12 — S01, primo feedback Android

**Data:** 9 novembre 2026 (Europe/Rome)  
**Stato:** `PR_OPEN / IMPLEMENTATA_DA_VERIFICARE`  
**Issue:** [#54](https://github.com/CzekUns/cercax/issues/54)  
**Branch:** `agent/oronzo-12-ui-playtest-s01`  
**PR:** [#59 — bozza, nessun merge](https://github.com/CzekUns/cercax/pull/59)  
**Base iniziale da ultimo main:** `21337c0161d654cce118a51f2cbbbca4b7e7eeff`

## Realizzato e codice verificato in repository

- **S12-001 — apertura larga:** in `oronzo/assets/ui/career-r03.js`, `renderEntry()` mostra soltanto le due CTA `data-action=start` e `data-action=load`. Rimossi esclusivamente da `entry` pannello introduttivo, descrizione QA e immagine laterale. La barra del marchio ORONZO è conservata; data/demo label sono nascoste solo su entry, visibili dove servono durante la carriera. `career-r03.css` usa un unico layout a due colonne ampio, con pulsanti di altezza minima 72px e safe-area esterne ereditate.
- **S12-002 — navigazione contestuale:** `render()` assegna `data-screen` al root e nasconde il footer `#runtime-nav` sulle 13 schermate; le CTA già integrate nelle viste permettono di proseguire, tornare, salvare nel hub e caricare al menu iniziale. Il markup del footer resta intenzionalmente in `career-r03.html` per non entrare in conflitto con #52. Se il fullscreen F01 (#52) è presente, lo stesso nodo `#fullscreen-toggle` viene riattaccato alla `.gamebar`, conservando `id`, attributi, listener e superficie nominale CSS 44×44px. Il runtime di main attuale **non** include ancora quel controllo.
- **QA aggiunta:** `oronzo/assets/ui/qa/ui12-landing-nav.test.cjs` (Node nativo, sorgente originale letto da disco).
- **Registro cumulativo:** `oronzo/coordination/12-ui-tuning/SCREEN-NOTES.md` include S12-001/S12-002 e motivazione delle modifiche.

Nessun file `career-r03.html`, `demo-v02.css`, `oronzo/app/flow/`, engine, data, salvataggi, career o sistemi è stato alterato.

## Verifiche effettivamente effettuate

- `career-r03.js` autentico letto da GitHub sul branch: parser V8 completo dopo esclusione dei soli import ESM (necessaria nell'ambiente isolato): **PASS**, 0 errori.
- Estrazione ed esecuzione V8 delle funzioni sorgenti originali `renderEntry()` e `render()`, con soli stub DOM e dei renderer delle schermate: **47/47 asserzioni PASS**, verifica 13 schermate, due CTA, visibilità footer, node identity fullscreen, match mount e presenza regole CSS.
- Esecuzione V8 del nuovo `ui12-landing-nav.test.cjs` recuperato dal branch, con `require` simulati per lettura dei due file autentici: **5/5 test PASS**. Il file rimane ripetibile in Node con `node --test oronzo/assets/ui/qa/ui12-landing-nav.test.cjs` su checkout completo; **non si dichiara eseguito con Node** in questa sessione.
- GitHub connector ha restituito SHA dei commit di codice e delle note; PR creata in bozza.

## Test NON eseguiti e rischi da convalidare

- **Chromium HTTP del gioco autentico: NON ESEGUITO.** Il contenitore di esecuzione non può clonare la repository (`git ls-remote`: `Could not resolve host: github.com`). Gli stub V8 non misurano geometria, rendering o interazione reale.
- **Android reale: NON ESEGUITO.** Ancora nessuno screenshot del proprietario dopo il fix.
- **Target ≥44px effettivamente visibili, risoluzioni 640×360 / 800×360 / 844×390 / 960×400, safe-area, overflow, tap/click, campo 16:9, conferenza e fullscreen F01:** attesi dal CSS, ma **non certificati** su Chromium/Android. Anche la compatibilità combinata con le PR #52 (fullscreen) e #53 (comuni, career-r03.js) necessita audit dopo integrazione: entrambe risultavano ancora aperte al controllo.
- Nuova assenza del footer: ricontrollare tutti i passaggi naturali della carriera per verificare che l'utente non desideri un comando di rientro aggiuntivo in alcune schermate. Nessuna modifica al flow/core per forzare i passaggi.

## Integrazione / consegna

Non aprire PR duplicate per S12-002; usare **sempre #59** per le successive correzioni guidate dal proprietario. Prima di approvare o fare merge, revisore00 deve eseguire HTTP Chromium autentico e prove sul codice combinato con #52/#53, allegare screenshot di confronto e touch hit-tests. Il proprietario deve confermare da Android la disposizione richiesta. **Nessun merge autorizzato.**

## Prossimi passi

1. Ricevere screenshot Android iniziale e feedback sulle due CTA a tutta larghezza.
2. Se necessario, rifinire solo `entry` e il posizionamento fullscreen, aggiungendo nuovi screenshot e misure.
3. Auditing indipendente delle viste reali dopo integrazione F01/D01; mantenere aperta questa PR finché non approvata dal proprietario.
