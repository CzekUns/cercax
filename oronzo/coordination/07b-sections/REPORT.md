# RAPPORTO AGENTE 07-BIS — R11-01 · SEZIONI GIOCABILI

**Identità:** ORONZO-AGENT-07B (registro tecnico ID 13, alias visibile 07-bis; distinto da 07/12).  
**Stato:** PR_OPEN · completamento tecnico parziale solo per adapter Stadio (BLOCKED_DEPENDENCY).  
**Branch:** agent/oronzo-07b-sections-r11-01  
**PR:** https://github.com/CzekUns/cercax/pull/63 · Issue https://github.com/CzekUns/cercax/issues/62  
**Main iniziale:** 84f1b0be735b7f52a55211a2b9739040617fd488  
**HEAD codice prima del REPORT:** a25712337ef1067bdef03a3c15997aee7039e025  
**Data:** 2026-11-09 · Nessun merge.

## Realizzato

- **sections-r11/sections.js** (ESM): presentatori isolati, canvas Sprite01 solo se visual e kit persistenti, scheda giocatore con status/contract/trust/attributi; training scelta cinque programmi/intensità; Tifosi/Stadio/Giornali reali; agenda condizionata a getCoachWeekStatus.
- **sections-r11/sections.css**: layout full-width pixel-art, originale scena allenamento già presente, illustrazioni CSS curve/stadio/giornale, scorrimento interno e target minimi 44px. Nessuna modifica alla landing Agent12.
- **career-r03.js**: nuovi import ESM e innesti minimi; sei tasti hub, section router, dati scheda da getRosterPlayer/getTrainingPlayer con stesso id, training-apply tramite selectM1Training e salvataggio; bye_week con advanceMatchday e token expectedAbsoluteWeek, mai skip match_pending.
- **career-r03.html**: link CSS moduli, mantenendo entry e fullscreen.
- **qa/ui12-landing-nav.test.cjs**: vecchia suite aggiornata alle sei card e all'allenamento attivo preservando test S12.
- **sections-r11/sections-r11.test.mjs**: 14 test Node nativi di presentazione, stato, contratti e integrazione statica.
- **sections-r11/HANDOFF-07-09.md**: specifica puntuale per backend 07/09 non presente, senza finti numeri.

## Verifiche EFFETTIVAMENTE eseguite

1. **V8 isolato su sorgenti autentici letti dal branch via GitHub**: 14/14 prove R11 superate (presentatori, escaping, stato allenamento e ledger, stadio con/senza dati, risposte stampa, bye_week, match_pending, rollover, wiring statico).
2. **V8 isolato su sorgenti autentici letti dal branch via GitHub**: 10/10 verifiche di regressione UI12 superate (landing computer e 2 CTA, full-width, footer nascosto, fullscreen, sottosezioni, menu e salvataggi presenti).
3. Parsing V8 del modulo e del runtime completo dopo rimozione delle istruzioni import superato; nessuna pretesa di verifica del module graph live.

**NON ESEGUITI / NON PROVATI:** comando Node sul repository intero, mock server HTTP, Chromium/Playwright, screenshot 640×360/800×360/844×390/960×400, Android reale, hit-area misurate in browser, catena end-to-end nuova partita→2 stagioni. L'ambiente presente ha accesso al connector GitHub, non a un checkout GitHub completo eseguibile nel container. La suite Node è scritta ma **non** stata lanciata tramite `node --test`. I 44px sono un vincolo CSS statico, non una misura browser.

### Comandi da eseguire in checkout Node/Chromium

```sh
node --check oronzo/assets/ui/career-r03.js
node --check oronzo/assets/ui/sections-r11/sections.js
node --test oronzo/assets/ui/sections-r11/sections-r11.test.mjs oronzo/assets/ui/qa/ui12-landing-nav.test.cjs
node --test oronzo/app/flow/tests/m1-contract.test.mjs oronzo/app/flow/tests/m1-live.test.mjs
python3 -m http.server 8000
```

Aprire via HTTP /oronzo/assets/ui/career-r03.html e ripetere con viewport landscape 640×360,800×360,844×390,960×400 in Chromium. Attestare ogni action, tab, slider, scroll, save/reload, 44px reali e catena 30/38 giornate con due stagioni prima di accettare il gate browser.

## Stato effettivo sezioni

| Sezione | Stato | Prova/limite |
| --- | --- | --- |
| A. Scheda giocatore | IMPLEMENTATA / BROWSER_NON_PROVATO | Attributi, stato, profilo, contratti, fiducia; sprite originale solo con kit e visual. Nessun portrait inventato se main privo di visual. |
| B. Allenamento | IMPLEMENTATO / BROWSER_NON_PROVATO | UI e controller07 selectM1Training, intensità reale, save, ledger post-avanzamento. Applicazione fisica delegata a 07→08 come da contratto. |
| C1. Stadio | UI_IMPLEMENTATA / BLOCKED_DEPENDENCY | Viste e valori reali se disponibili. Operazioni prezzo/affluenza non attivabili finché mancano club.stadium e adapter atomico 07/09. |
| C2. Tifosi | IMPLEMENTATA / BROWSER_NON_PROVATO | Rapporti da stato + eventuali eventi persistiti; nessuna notizia simulata. |
| C3. Giornali | IMPLEMENTATA / BROWSER_NON_PROVATO | Archivio domande/risposte realmente salvate da conferenza; nessun articolo «live» artificiale. |
| D. Agenda | IMPLEMENTATA / BROWSER_NON_PROVATO | Stato contestuale, bye_week con advance, match_pending non avanzabile, rollover condizionato, salvataggio. |

## Dipendenze, integrazione, rischi

- **07 → 09 Stadio:** vedere HANDOFF-07-09.md, con firma proposta changeCareerTicketPrice(state,{clubId,priceITL,eventId,expectedAbsoluteWeek}), costruzione period in Career07, setTicketPrice 09, e settleHomeAttendance soltanto con fixture autentica+board review, commit atomico club+coach e anti replay. **Non fornire valori inventati** per capacity/condition/ticketPriceITL, neppure sui vecchi save.
- **Player visuals 01/08:** il main non garantisce visual/kit per ogni calciatore. La UI non mostra uno sprite se impossibile identificarne i colori persistenti; originale atlas/maschera è renderizzato via asset-adapter 05 se informazioni disponibili.
- **Agente 12:** la PR lascia intatti blocchi entry e CSS S12-001/004, menu inferiore S12-002 e navigazione full-width S12-003. L'unico innesto è in renderHub, renderHubSection, renderPlayer, render, action dispatch e CSS link.
- **Regole backend:** nessuna modifica a oronzo/app/flow, oronzo/systems, economy, engine o cataloghi. Operazioni su società non simulate.
- **Gate indipendente 00 e 10:** richiedono test browser reali prima del merge. Non autorizzare merge basandosi sui soli test V8.

## Proposta prossimo ciclo

1. Prova Chromium HTTP completa e fix viewport reali per 640×360,844×390, 44px e save/load dopo interazione.
2. Agent07 +09: adapter stadio transazionale con fixture, capienza attendibile e doppio accredito protetto; poi 07B aggiunge price UI solo dopo gate.
3. Secondo ciclo sezioni: formazione lavagna, calendario completo, presidente/mercato quando backend pronti.
