# ORONZO · Partita rapida — prima versione giocabile

**Pagina:** [partita-rapida.html](partita-rapida.html) — per smartphone in **orizzontale 16:9**.

## Funzionalità operative previste
- Partita **11 contro 11** con il vero modulo `systems/match-engine/match-engine.js`, visualizzata con `systems/match-view/match-view.js`, che utilizza gli sprite pixel art `assets/players/`.
- Due società dimostrative originali: **Montevento – Porto Selva**. Il seed cambia a ogni nuova partita. La gara dura 5400 secondi simulati, distribuiti su **circa 15 minuti reali a velocità 1×** (6 secondi di gioco per secondo reale). Le velocità 2×/4×/8× riducono la durata a circa 7,5 / 3,75 / 1,875 minuti.
- Calcio d'inizio, pausa/ripresa, velocità 1×/2×/4×/8×, selezione modulo, pressing, mentalità, ordini dalla panchina e fino a 2 cambi. I comandi sono inoltrati a `match.command()` e gli eventuali rifiuti sono mostrati a schermo.
- Il runner avanza con `match.step(quickMatchSimDelta(dt,speed))` da `quick-match-clock.js` e invia snapshot al renderer **solo quando il tempo simulato è avanzato**, così le pose scorrono fluide fra due tick senza reset a ogni frame. Il renderer condivide la velocità base di 6 secondi simulati/secondo reale.
- Risultato, tempo, possesso e tiri derivano dallo snapshot dell'engine. La vista usa `createEngineViewBridge` e `getEventsSince(lastId)` per eventi non persi o duplicati, e mostra scene o segnaposto degli eventi senza generare reti.
- Se mancano cutscene o immagini, il renderer mostra un fallback tecnico chiaramente riconoscibile, mentre il motore continua. I file cutscene sono attualmente in PR separata #12 **draft**, da integrare dopo QA.

## Limiti di questa consegna
È una **Partita rapida indipendente dalla carriera**: la gara non incide ancora su classifica, obiettivi, rapporti con il presidente o save di stagione. Il vecchio `index.html` rimane l'ufficio/prototipo principale e offre un collegamento alla nuova pagina; il pulsante MATCH del suo menu inferiore può ancora mostrare il motore precedente. Questa separazione impedisce che i cinque problemi dell'audit R02 su società/carriera blocchino la partita rapida.

**Qualità da verificare in browser:** sprites caricate senza label fallback, layout e touch su viewport landscape 640×360, 800×360, 844×390, tempi reali del match, eventuali stutter, esiti da kickoff a fulltime, comportamento background/restore. Gli assert statici di sintassi superati durante la creazione del file non sono un test browser né dimostrano che tutti questi casi siano già passati.

## Test programmati
```bash
node --test oronzo/partita-rapida-smoke.test.mjs
node --test oronzo/systems/match-engine/tests/*.test.mjs
node --test oronzo/systems/match-view/*.test.mjs
```
`partita-rapida-smoke.test.mjs` comprende verifiche Node su XI, score/eventi goal, tempo e velocità, tattiche e sostituzioni, feed persistente del renderer e direzioni in radianti.

## Passi per la prova manuale
1. Aprire `https://czekuns.github.io/cercax/oronzo/partita-rapida.html` su telefono **orizzontale** dopo la pubblicazione GitHub Pages.
2. Attendere il caricamento degli sprite; controllare che siano disegnati 22 giocatori sul campo.
3. Selezionare un modulo e muovere pressing e mentalità; premere **CALCIO D'INIZIO**.
4. Controllare il tempo, mettere in pausa e riprendere, passare a 2×/4×; dare un ordine e sostituire un giocatore di movimento.
5. Aspettare il 90°: il risultato deve corrispondere agli eventi di rete realmente simulati.
6. Riavviare e provare una nuova partita, con seed distinto.

**Proprietà:** `partita-rapida.html` e gli innesti al runtime sono mantenuti dall'orchestratore. Gli agenti restano proprietari di `systems/match-engine/`, `systems/match-view/`, grafica e contenuti, con NEXT/REPORT come registro.
