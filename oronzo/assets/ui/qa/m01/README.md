# ORONZO Agent11 M01 — prove riproducibili

Baseline main: `55df243b6397d545baab967652f8556f71f878d3`.
CSS prima: blob `866a60e83b4cce4ca047615ab677dfd99a28c644`.
CSS dopo: blob `7feecdc8a9e16d01237627c895bf84e8a4586ad5`.

Richiede Node e Playwright, Chromium installato. Dalla root repository:

```sh
export NODE_PATH=/percorso/node_modules
export CHROMIUM=/percorso/chromium
node oronzo/assets/ui/qa/m01-landscape.cjs after
node oronzo/assets/ui/qa/m01-environment.cjs
node --test oronzo/app/flow/tests/*.mjs oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js
node --test oronzo/systems/match-view/*.test.mjs
```

Lo script crea e chiude un server HTTP vero su una porta effimera, con localStorage autentico. Non usa route.fulfill, set_content o storage shim. Mouse e tap sono inviati al centro dopo hit test; swipe CDP e wheel portano le liste alla fine. Il ritorno alla prima offerta può ripristinare lo scroll via DOM dopo aver provato l'ultima con gesto reale.

Per replicare `before`, utilizzare un checkout separato allo SHA baseline, copiarvi `m01-landscape.cjs` nella stessa posizione e lanciarlo con argomento `before`. Non sostituire il CSS del branch di lavoro. `before` misura e verifica la navigazione, senza esigere il nuovo riempimento viewport; `after` esige 100% e rapporto canvas 16:9. Il supplemento verifica più severamente tutti i controlli fissi, inclusa l'intersezione delle aree interne degli antenati. Le righe parziali nelle liste sono intenzionali: l'ultima viene portata tutta in vista e controllata.

I PNG sono screenshot nativi Chromium touch emulato: 6 viste × 4 viewport × prima/dopo = 48 file. JSON: 8 percorsi prima, 8 dopo, controlli viewport e safe-area CDP. `source-blobs.json` registra i sorgenti recuperati; gli screenshot storici del 03 non sono necessari al runtime e non sono stati ricreati.

Limiti: nessun Android fisico, nessuna preview pubblica di questo branch, nessun test continuativo di 900 secondi. I cutout CDP e il resize viewport sono simulazioni, non barre di Chrome Android reali. Un 404 opzionale cutscene per partita deriva dal manifest assente su main. La camera TV resta indisponibile. Nessun Layout Studio incluso.
