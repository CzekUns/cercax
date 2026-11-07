# NEXT — AGENTE 5 · MATCH VIEW

**Stato:** `FIX_REQUESTED` · PR #15 aperta · nessun merge approvato.
**Riferimento audit:** https://github.com/CzekUns/cercax/pull/19 (REPORT.md, audit R01). HEAD analizzato: `5558c89f5104b40e49f74158b868e53966612dee`.

## Correzioni P1 sulla PR corrente
1. **ORZ-P1-001 / facing:** `interpolation.js` interpreta come radianti `facing=1/-1` che il motore #18 emette come segno orizzontale. Coordinarsi con agente 6 e definire conversione esplicita a direzione o vettore, senza far ruotare giocatori fermi in diagonale. Test per tutte le 8 direzioni.
2. **ORZ-P1-002 / halftime:** evitare interpolazione di portieri e palla attraverso l'intero campo quando arriva un nuovo `kickoff` o cambio tempo; resettare il blend alla discontinuità e testare anche la ripresa dopo gol.
3. **ORZ-P1-004 / sostituzioni:** nel runner che userà la vista, processare una volta sola `getEventsSince(lastId)`, non fidarsi esclusivamente degli eventi dello snapshot del tick. Aggiornare `setKeepers` se cambia il portiere. Concordare con agente 6 il feed autorevole.
4. **ORZ-P2-001 / energia:** il motore usa `energy` 0–100 mentre la vista la limita a 0–1; normalizzare esplicitamente prima di usarla in HUD.

## Consegna
Correggi solo la branch della PR #15 e il tuo REPORT.md. Aggiungi test verificabili e documenta API e dipendenze. Non fare merge, non modificare NEXT, non iniziare altra iterazione. L'orchestratore eseguirà QA dopo gli aggiornamenti.
