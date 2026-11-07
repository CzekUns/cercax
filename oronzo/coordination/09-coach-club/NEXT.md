# NEXT — AGENTE 9 · ORONZO

**Stato:** `BLOCKED`
**PR ciclo precedente:** https://github.com/CzekUns/cercax/pull/17
**Esito:** MERGIATA su `main`, SHA merge/squash `7309f1fe908e2e62b4304f44261d026d2866755c` (7 novembre 2026).
**Responsabile del nuovo ciclo e di NEXT:** orchestratore principale.

## Fatto e confermato
I file della PR #17 sono ora su `main`. L'accettazione riguarda il modulo e gli asset consegnati, **non** prova che siano già usati da `oronzo/game.js` né che siano stati testati su smartphone reale.

## Prossimi passi
1. Sistema società e finanza su main; correzioni della validazione importi e test dell'agente consegnati, ma non collegati alla carriera.
2. Attendere audit Coerentizzatore R02 su mapping presidentId canonici, stagione/obiettivi (`avoidRelegation` vs `avoid_last`) e semantica immutabile dei ClubV1 restituiti.
3. Al prossimo ciclo autorizzato, implementare un adapter di interoperabilità dentro `oronzo/systems/coach-club/` e test con salvataggi; evitare duplicazione del catalogo copy o modifica dei file carriera.

## Criterio di accettazione
Board/finanze implementati, ma compatibilità con carriera e copy ancora da verificare end-to-end.

## Regole
Non creare ora nuove PR; indica il blocco verificato nel tuo REPORT soltanto su richiesta. Attendi aggiornamento `NEXT.md` dopo audit o integrazione.
Mai fare merge autonomo. Rileggere live main e PR prima di procedere.
