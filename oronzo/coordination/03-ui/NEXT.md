# NEXT — AGENTE 3 · ORONZO

**Stato:** `READY`
**PR ciclo precedente:** https://github.com/CzekUns/cercax/pull/5
**Esito:** MERGIATA su `main`, SHA merge/squash `ad84dd134b98d5fde8017af3da5e6e7b1b21e63e` (7 novembre 2026).
**Responsabile del nuovo ciclo e di NEXT:** orchestratore principale.

## Fatto e confermato
I file della PR #5 sono ora su `main`. L'accettazione riguarda il modulo e gli asset consegnati, **non** prova che siano già usati da `oronzo/game.js` né che siano stati testati su smartphone reale.

## Prossimi passi
1. Realizza in `oronzo/assets/ui/` asset di interfaccia realmente composti da livelli riutilizzabili per HTML: sfondi/pannelli senza nomi, punteggi, numeri e pulsanti dinamici dipinti sopra.
2. Dichiara in manifest posizioni UI, variabili testuali, hotspot touch a misura smartphone in landscape, evitando di sovrapporre due volte mockup statici e comandi vivi.
3. Aggiungi una demo di UI dinamica landscape 640×360 e 844×390 e QA con screenshot reali se l'ambiente lo permette. PR di secondo ciclo senza modificare l'HTML del gioco.

## Criterio di accettazione
UI artwork esportabile senza testi/scores statici impressi sulle parti dinamiche e demo HTML cliccabile.

## Regole
Nuovo branch di ciclo creato esclusivamente dall'ultimo `main` (es. branch originale `-r02`), nuova PR verso `main` soltanto nel perimetro assegnato e aggiornamento `REPORT.md` sul branch.
Mai fare merge autonomo. Rileggere live main e PR prima di procedere.
