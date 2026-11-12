# ORONZO 1979 — R13-TER · stato di revisione (12 novembre 2026)

**GATE: PARTIAL — NOT READY FOR MERGE**.

## Difetti riprodotti
- Volto PNG 07: baricentro del mento ~10 px a destra del busto; barba e capelli registrati attorno a x64. Rendeva la barba decisamente spostata a sinistra.
- Capelli PNG 09: estrazione orizzontale decentrata ~7 px.
- Alcune barbe estratte sono asimmetriche, presentano zone mancanti sul mento. Anche altri volti oltre 07 richiedono revisione artigianale.
- Alcune maschere di divisa ricoprono il collo con i colori della maglia.
- La ricolorazione precedente usava maschere di barba che potevano non coprire i nuovi pixel pittorici.
- CSS letto su ultimo main aveva già width/height coerenti 4:5. Nessuna regressione CSS introdotta.

## Commit presenti nel ramo R13-TER
- Asset: `facial-hair/06.png` nuovo PNG illustrato, derivato da ritaglio pittorico esistente e lavorato per ripristinare la parte inferiore della barba.
- Renderer: fitting alpha della barba contro la sagoma del volto reale (tolleranza 1px); registrazione specifica del volto 07 e capello 09; riconoscimento pixel pelle del collo; ricolorazione su alpha della barba; protezione dal caricamento concorrente obsoleto.
- Manifest: coordinate anatomiche per volto e metadati degli asset spostati, Git blob SHA-1 per i PNG realmente committati (non checksum riferiti al precedente ZIP sorgente).
- Test Node aggiunti: DNA, roundtrip JSON, 8x12x8 combinazioni nominali, trasferimento con cambio divisa.
- Test Python aggiornati per integrità, alpha, maschere, metadati e checksum dei file Git.
- `qa-r13ter.html`: tavole A–E composte dai PNG reali per 8 visi, 8 barbe, 12 acconciature, 6 divise e 20 identità.

## Esecuzioni locali effettuate
- 55/55 composizioni caricate in Chromium **in-memory**; zero errori JS nella pagina isolata.
- 640x360, 800x360, 844x390, 960x400 per layout **fixture**, non app pubblica.
- Race di due richieste sul medesimo canvas: la prima obsoleta viene scartata.
- 4/4 test Node originari del renderer BIS sulla copia del modulo compatibile.
- Lo script Python originale passa sul vecchio archivio byte-identico; fallisce se cambia l'asset 06 senza aggiornare il manifest, ragione del nuovo test Git blob.
- Browser via HTTP locale: `ERR_BLOCKED_BY_ADMINISTRATOR`. Non dichiarare QA HTTP reale superata.
- Salvataggio/caricamento e trasferimenti **della carriera completa**: non certificati. Le proprietà dei dati visivi sono validate a livello di mapping, non nel runtime completo.

## Mancanze artistiche e rilascio
La tavola visuale contiene **ancora alcune barbe lontane dal livello richiesto** e collo/maglia non completamente omogenei. 23 raster e 29 maschere sono stati sperimentati in un pacchetto locale separato, ma quei file **non sono committati nel ramo**; non confonderli con il lavoro su GitHub.

Non approvare né mergiare questa PR finché le immagini corrette non sono tutte nel repository, le tavole A–F non sono sottoposte a review e la vera scheda giocatore non supera Chromium HTTP alle quattro risoluzioni. Nessuna dichiarazione di Pages aggiornato.

La fixture nominata «Ennio Robetti» è **equivalente sintetica**. L'esatto salvataggio del proprietario non era accessibile.
