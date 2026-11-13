# ORONZO R13-TER — rapporto finale tecnico

**Stato: test reali verdi, revisione estetica ancora aperta.**

## Correzioni committate
- Volto 07 ricentrato di circa 10 pixel a livello di PNG; capelli 09 ricentrati di 7 pixel, senza cambiare gli identificativi R12.
- Barbe e baffi ripresi da immagini raster illustrate; fitting alfa per seguire la sagoma effettiva del volto con tolleranza di 1 pixel.
- Sei busti retoccati per eliminare colori originali precotti e conservare le ombre dipinte. Sei nuove maschere del collo separano pelle e divisa.
- Protezione contro richieste asincrone obsolete, che impedisce di mostrare il calciatore precedente.
- Totale su PR: **23 PNG di componenti rielaborati** (8 visi, 8 barbe, 1 capigliatura, 6 busti) e **29 maschere modificate o nuove**. Gli asset restano modulari, raster e ricolorabili. Nessun SVG, emoji, CSS shape o fillRect per disegnare il personaggio.
- Manifest con ancoraggi anatomici, checksum Git reali e versione idempotente. Non cambia schema salvataggi.

## Verifiche reali
GitHub Actions R13-TER run **43241233286**, conclusa SUCCESS:
https://github.com/CzekUns/cercax/actions/runs/43241233286

- Python: integrità PNG, trasparenza, manifest, maschere e checksum: PASS.
- Node: regressioni originali più R13-TER, DNA persistente e cambio maglia: PASS.
- Chromium HTTP sulla **vera app** alle viewport 640×360, 800×360, 844×390, 960×400: **36/36 PASS**.
- Percorso: creazione carriera, ingaggio, conferenza, Rosa, scheda, cambio giocatore, identità DNA dopo salvataggio/ricarica. PASS.
- Il salvataggio è stato invocato tramite il vero handler dell'app, perché il vecchio pulsante SALVA della navigazione inferiore è volontariamente nascosto nella UI.
- Zero errori JS, zero errori di caricamento PNG, zero overflow orizzontali nei quattro screenshot.
- Galleria QA HTTP: **54/54 composizioni PNG** (8 visi, 8 barbe, 12 capelli, 6 divise, 20 calciatori) PASS.
- Evidenza reale: https://github.com/CzekUns/cercax/actions/runs/43241233286/artifacts/13953869747

## Limiti e rilascio
La fixture iniziale denominata Ennio Robetti non proveniva dal salvataggio dell'utente: non era disponibile. Le screenshot della carriera QA ritraggono calciatori fittizi prodotti dalla vera app.

**PR #79: aperta DRAFT, non mergiata.** Main e GitHub Pages non comprendono ancora R13-TER. La tavola A mostra volti ancora poco differenziati; nella B alcune barbe sono artisticamente disomogenee. La review estetica non va falsamente dichiarata completa.
