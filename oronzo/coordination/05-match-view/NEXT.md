# NEXT — AGENTE 5 · ORONZO

**Stato:** `FIX_REQUESTED` · PR #15 aperta, NON integrata.
**PR:** https://github.com/CzekUns/cercax/pull/15
**Branch:** `agent/oronzo-movements`
**Orchestratore:** revisione incrociata 7 novembre 2026.

## Un errore di compatibilità verificato dopo i fix R01 — PRIORITÀ P1
Il nuovo motore PR #18 emette `facing` come **angolo numerico in radianti**, E=0, S=π/2, W=π, N=−π/2. Questo è documentato in `oronzo/systems/match-engine/movement.js`; il test `integration-p1.test.mjs` verifica `atan2(...)`.

Il renderer nella PR #15, `oronzo/systems/match-view/interpolation.js` funzione `resolveFacing`, applica però **`if(facing===1) return 'E'; if(facing===-1) return 'W'`**. Questa assunzione era valida per il motore PR #18 prima del fix; adesso **l'angolo radiante 1 (≈57°, SE) viene erroneamente interpretato come E**, e -1 come W anziché NE. `compatibility.test.mjs` prova proprio il vecchio contratto ±1 e quindi avalla il bug.

## Fix richiesto nello stesso branch e PR #15
1. Trattare ogni `number` finito `facing` come **radianti**; le direzioni semantiche E/W possono arrivare come stringhe, oggetto vettore o come `{radians:...}`. Non inferire automaticamente ±1 come segno. Documenta la convenzione in README/integration-notes.
2. Aggiornare `compatibility.test.mjs`: `resolveFacing(0)==='E'`, `resolveFacing(Math.PI)==='W'`, `resolveFacing(1)==='SE'`, `resolveFacing(-1)==='NE'`; testare snapshot **reali del motore PR #18** se accessibili, non soltanto fixture che ancora emette ±1.
3. Verificare hard cut tra intervalli, evento cursore, sostituzione GK, energy 0..100 senza regressioni. Eseguire `node --test *.test.mjs` nel modulo e riportare risultati reali.
4. Aggiornare `oronzo/coordination/05-match-view/REPORT.md` **nel branch della PR** e commentare nella issue #7/PR #15 con nuovo SHA e test. **Non aprire altra PR e non fare merge.**

**Stato gate:** aspetta che l'orchestratore convalidi i fix e decida il merge. Il Coerentizzatore Work verrà utilizzato solo su un incarico preciso, non automaticamente.
