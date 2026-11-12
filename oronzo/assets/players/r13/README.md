# ORONZO R13-BIS — Primo prototipo di ritratti raster (bozza artistica)

Questo pacchetto contiene asset PNG disegnati tramite generazione di immagini, ritagliati e separati in layer alpha reali. Nella scheda ogni volto, capigliatura, barba e maglia viene caricato da file PNG autonomi e assemblato con `drawImage`. I colori vengono rimappati preservando le ombre originali; nessun occhio, naso o volto è generato con rettangoli Canvas.

## Limitazioni non nascoste
- La selezione e la coerenza delle forme non sono ancora a livello di qualità definitiva: alcune barbe e capigliature hanno ancoraggi da rifinire.
- Gli otto visi base hanno differenze insufficientemente nette per l'accettazione estetica del proprietario.
- Il nuovo renderer non è stato verificato all'interno della carriera completa, soltanto nella demo HTML/Chromium.
- Sprite partita non ancora convertiti. Non mergiare come feature completa senza ulteriore artwork e QA runtime.

## Contract

Lettura degli identificativi canonici di `visual-r12.js`, nessuna riscrittura o migrazione dello stato persistito. Preserva il volto attraverso cambi kit. Dimensioni 128×160, alpha RGBA e materiali in `masks/` con kit in `kits/`. `manifest.json` include SHA-256 dei file.

Per uso browser, `portrait-r13.js` deve restare al percorso `oronzo/assets/ui/sections-r11/` e gli asset a `oronzo/assets/players/r13/`.
