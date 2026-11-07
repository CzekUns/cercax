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


## Visibilità degli ordini tattici (revisione del 7 novembre 2026)
Il motore già accettava `tacticChange`, ma sul campo non era immediato distinguere i nuovi schieramenti dalle corse verso il pallone. La partita rapida ora mostra:
- **Modulo effettivamente accettato**, con valori di pressing e mentalità attivi (ricavati da `result.effects.tactics`, non semplicemente dalla select).
- **Schema di riferimento** direttamente sopra il campo tramite SVG con undici cerchi e posizioni base del modulo ricavate da `systems/match-engine/movement.js#formationAnchors`. Si specchia al cambio di tempo.
- I riferimenti appaiono per 45 secondi simulati dopo un cambio di modulo (circa 7,5 s reali a 1×). Il pulsante **SCHEMA ◯/●** permette di lasciarli visibili o nasconderli.
- Messaggio quando l'ordine viene ricevuto dal motore. I giocatori si riposizionano con la fisica e con la palla in movimento; non avviene un teletrasporto forzato ai cerchi, che rappresentano l'assetto **di riferimento** e non le coordinate istantanee.
- Premendo Attacca, Equilibrio o Difendi oppure modificando pressing/mentalità i valori attivi cambiano solo se il motore accetta il comando.

**Verifica orchestratore:** confronto deterministico di due match uguali a t=100, con e senza `tacticChange({formation:'3-5-2',pressing:80,mentality:80})`. Dopo 30 s simulati **10 dei 11 calciatori** della squadra hanno posizioni differenti per più di 0,025 in coordinate normalizzate; il comando ed evento tattico sono accettati e registrati. Prova eseguita in V8 con sorgenti reali; la resa SVG su Android richiede ancora il controllo manuale.


## Cambio modulo: comportamento fisico verificabile
Dopo il feedback dell'utente che i pallini del modulo cambiavano ma gli sprite non li raggiungevano, è stata corretta la **logica reale del motore**:
- Prima del calcio d'inizio, il modulo scelto dispone subito gli 11 sul nuovo schema, lasciando il portatore del calcio d'inizio al centro.
- Durante la partita un cambio modulo crea una fase transitoria nel match-engine: gli uomini **senza pallone** corrono davvero verso i nuovi riferimenti, per 22 secondi simulati con velocità ridotta; poi tornano progressivamente a rispondere a palla, marcature e avversari entro 64 secondi simulati. Il portatore mantiene l'azione. Nessuna teletrasportazione a partita avviata.
- L'overlay tattico mostra per circa 35 secondi simulati linee tratteggiate dai giocatori verso i loro riferimenti, pallini verdi se la distanza è entro 3,5 m e il numero di calciatori effettivamente allineati. Il comando SCHEMA permette di osservare le posizioni di riferimento, senza pretendere che gli undici rimangano incollati ai pallini durante l'azione.
- Cambiare soltanto pressing/mentalità non attiva una finta riorganizzazione.
- Prova orchestratore in V8 sui moduli reali: **5 gruppi di test PASS** (prematch, 10 seed in-play senza teleport, inversione dopo l'intervallo, pressing senza spostamenti immediati, 90 minuti con score coerente con gli eventi gol). Per i 10 seed la soglia minima dopo 20 secondi simulati è 11/11 giocatori entro 3 m nelle fixture usate; un altro campione con pallone in possesso ha 10/11. Nuovo test Node in `systems/match-engine/tests/formation-regroup.test.mjs`. Non sostituisce la verifica visuale su Android.
- La durata normale **1× = 15 minuti reali** resta invariata.
