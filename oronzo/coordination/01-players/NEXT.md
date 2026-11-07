# NEXT — AGENTE 1 · ORONZO

**Stato:** `READY`
**PR ciclo precedente:** https://github.com/CzekUns/cercax/pull/6
**Esito:** MERGIATA su `main`, SHA merge/squash `3585b39596e6aa879c69e2136f8f22e2ca1ea102` (7 novembre 2026).
**Responsabile del nuovo ciclo e di NEXT:** orchestratore principale.

## Fatto e confermato
I file della PR #6 sono ora su `main`. L'accettazione riguarda il modulo e gli asset consegnati, **non** prova che siano già usati da `oronzo/game.js` né che siano stati testati su smartphone reale.

## Prossimi passi
1. Partendo dall'ultimo main in un nuovo branch di ciclo, prepara una demo esclusivamente in `oronzo/assets/players/` con due squadre e almeno 22 sprite effettivi ricolorati sul campo, risoluzioni landscape 640×360 e 844×390.
2. Verifica che ogni direzione/azione sia distinguibile a grandezza reale, cerca sprite brutti/pose duplicate e correggi solo problemi artistici/materiali verificati, senza riscrivere il motore.
3. Aggiungi test riproducibili di palette, transparenza, atlas e un nuovo `REPORT.md`; produci PR separata verso main. Nessun codice del renderer o gioco.

## Criterio di accettazione
Preview reale delle divise su 22 giocatori, sprite più leggibili dove necessario, demo/test e QA riproducibile.

## Regole
Nuovo branch di ciclo creato esclusivamente dall'ultimo `main` (es. branch originale `-r02`), nuova PR verso `main` soltanto nel perimetro assegnato e aggiornamento `REPORT.md` sul branch.
Mai fare merge autonomo. Rileggere live main e PR prima di procedere.
