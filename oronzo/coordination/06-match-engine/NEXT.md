# NEXT — ORONZO AGENTE 6 · MOTORE PARTITA

**Stato:** `READY` per ciclo R02, dopo completamento PR precedente.
**PR precedente:** [#18](https://github.com/CzekUns/cercax/pull/18), MERGIATA su main commit `d98a2226e74b6083e4b0d085bb4d2fca8eea9902`.
**Fix conclusi nella PR precedente:** convenzione facing radianti, decisioni `technical.decisions`, modificatori graduati di salute/fitness, feed sostituzioni e assist; relazione con renderer #15 allineata.
**Prima prova orchestratore:** moduli reali caricati in V8, 22 giocatori, tattica e cambio accettati, pausa e velocità, fulltime 5400 s, score 0–2 coincidente con due goal in log. Non è stata effettuata QA browser completa.

## Prossimo ciclo autorizzato
Riparti dall'ultimo main nel branch `agent/oronzo-match-engine-r02`:
1. Valida gameplay e bilanciamento su almeno 100 seed; risultati, tiri, passaggi, falli, fatica, infortuni, fuorigioco, durata e realismo tattico. Evidenzia distribuzioni anomale e modifica solo problemi misurati.
2. Verifica con la pagina `oronzo/partita-rapida.html` (sola lettura) i comandi tattici, gli eventi e il risultato 1×/2×/4×/8×; aggiungi test d'integrazione solo nella tua directory.
3. In ogni test mantieni deterministicità e invarianti: score=numero goal, XI=22, partita fino a fulltime, nessun risultato scritto dal renderer. Documenta test reali e limiti in REPORT.md e apri PR a main.
**Nessun merge autonomo.**
