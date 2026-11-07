> **DIRETTIVA DI PRIMO RILASCIO — 7 NOVEMBRE 2026:** per la versione iniziale servono **100 comuni italiani + 500 cognomi italiani distinti**, verificati e con provenienza/licenza. **500 comuni + 5.000 cognomi** restano l'espansione finale e non bloccano M1. Raccoglie i dati l'automazione oraria ORONZO in `oronzo/data/research/` su branch dedicato, con PR; 07/08 li importeranno dopo review. Nessun ranking di rarità/demografia inventato. Dopo audit [R04 PR #36](https://github.com/CzekUns/cercax/pull/36): PR #34 è mergiata; #30/#32 e #31/#35 richiedono correzioni, #28/#29/#33 restano in gate browser/arte. Leggere sempre NEXT aggiornati.

> **DIRETTIVA UTENTE 7 NOVEMBRE 2026 — VISIONE v0.2**
> Fonte comune obbligatoria: [GAME-VISION-v02.md](coordination/GAME-VISION-v02.md) e [Epic #25](https://github.com/CzekUns/cercax/issues/25). Il gioco inizia nel **1979**, mantiene layout solo landscape 16:9 e partita 1× ~15 minuti; scelta avatar con tratti veri, 20 offerte ingaggio, presidente casuale persistente, conferenze stampa, morale game over, 500 piccoli comuni e 5000 cognomi verificabili, camera partita full/TV. In caso di contrasto con i testi storici sotto o con l'engine-contract v1, PREVALE v0.2. Agente 10 è SOLO orchestratore delle regole: NON scrive o integra codice/asset di gioco. Gestisce NEXT, contratti, issue, revisione e gate; gli agenti 01–09 sviluppano e NON cambiano scope o NEXT autonomamente. Il futuro adapter di carriera è assegnato al 07 (solo dopo fix R02) e il futuro runtime UI al 03 (solo dopo gate UI + R02), ciascuno in successivo ciclo autorizzato. Rileggere `coordination/<tuo-slug>/NEXT.md` per lo stato autorizzato: alcuni cicli sono subordinati ai fix R02 e la PR cutscene #12 è ancora draft.

> **DIRETTIVA VINCOLANTE AGGIORNATA — 6 novembre 2026**
> Il gioco è **ESCLUSIVAMENTE ORIZZONTALE (landscape)** su smartphone, aspect ratio di riferimento 16:9, griglia logica 640×360, mockup UI a 1280×720. Non proporre mockup portrait o una UI verticale adattata mediante rotazione. Il campo e gli intermezzi possono usare pixel art 4:3 della reference incorniciata nello spazio 16:9, preservandone la qualità. Le schermate devono **essere graficamente FINITE al primo passaggio, paragonabili per dettaglio e atmosfera alle otto reference Drive**, non wireframe, cubi, cerchietti, sagome geometriche, SVG di riempimento o immagini da «affinare dopo». Il sistema di palette serve a ricolorare sprite **già artisticamente finiti**, non a sostituire l'arte. Nel browser la grafica definitiva sostituisce l'attuale canvas procedurale provvisorio; va mantenuto solo come fallback tecnico finché gli asset non saranno integrati.

# Istruzioni di coordinamento Oronzo
1. Perimetro assoluto: `oronzo/**`. Non modificare i file CercaX alla root.
2. Branch separati: `agent/oronzo-players`, `agent/oronzo-cutscenes`, `agent/oronzo-ui`. Non lavorare su main per gli asset.
3. Ogni agente scrive soltanto nella propria cartella: `oronzo/assets/players`, `oronzo/assets/cutscenes`, `oronzo/assets/ui`; il proprio prompt è in `oronzo/agents/` ed è gestito dall'orchestratore.
4. Nessun agente sovrascrive `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css` o la cartella di altri agenti. Per suggerimenti di integrazione, crea `integration-notes.md` nella propria cartella.
5. Tutte le immagini vanno consegnate come file PNG separati (non un solo collage), oltre a sprite atlas quando previsti. Dimensioni precise, pixel art a bordi netti (no antialiasing), sfondo trasparente se richiesto. Verificare crop, trasparenza e dimensioni.
6. La recolorabilità ha precedenza sulla varietà di divise precotte. Usa palette indicizzate, maschere materiali e livelli/regioni per fantasia della maglia.
7. Ogni set consegna un `manifest.json` che dichiari file, dimensioni dei frame, pivot, numero di frame, fps suggeriti e mapping palette.
8. Minimo cinque immagini originali distinte per agente; niente screenshot ripubblicati e niente marchi reali.
9. Prima di PR: ispeziona visivamente ogni PNG e verifica percorso/file. Le bozze non passano per definitive.
10. Integrare il prima possibile, privilegiando la demo sul browser smartphone. La fase match deve restare giocabile anche se gli asset falliscono: fallback canvas.

## Agente 4 — Copy & Narrative
L'agente D usa esclusivamente `oronzo/content/` sul branch `agent/oronzo-copy`; i PNG richiesti agli agenti A/B/C non si applicano a lui. Il suo incarico è in `oronzo/agents/04-copy.md` e il contratto per formati, limiti UI, trigger, scelta/effetti, copyright e qualità è `oronzo/narrative-contract.md`. Non modifica `oronzo/game.js`, `oronzo/index.html` o `oronzo/ui.css`: i contenuti saranno integrati dall'agente 03 nella UI runtime, attraverso gli adapter dell'agente 07, dopo validazione. Scrivere JSON realmente importabili, coprire gli effetti sui parametri reali e riportare chiaramente ogni estensione futura.


## Agenti 5–9 — sistemi di gioco (aggiornamento orchestrazione)
Cinque nuovi agenti hanno scope ESCLUSIVI e branch distinti:
- 5 movimenti/rappresentazione: `agent/oronzo-movements` → `oronzo/systems/match-view/`; issue #7; prompt `oronzo/agents/05-movements.md`.
- 6 motore partita e AI tattica: `agent/oronzo-match-engine` → `oronzo/systems/match-engine/`; issue #8; prompt `oronzo/agents/06-simulation.md`.
- 7 carriera e competizioni: `agent/oronzo-career` → `oronzo/systems/career/`; issue #9; prompt `oronzo/agents/07-career.md`.
- 8 calciatori, attributi e allenamento: `agent/oronzo-attributes` → `oronzo/systems/attributes/`; issue #10; prompt `oronzo/agents/08-attributes.md`.
- 9 mister, società e presidenti: `agent/oronzo-coach-club` → `oronzo/systems/coach-club/`; issue #11; prompt `oronzo/agents/09-coach-club.md`.

**Contratto comune obbligatorio:** `oronzo/engine-contract.md`. La regola **«minimo cinque PNG»** riguarda esclusivamente agenti grafici 1–3, NON agenti 4–9. Agenti 5–9 consegnano moduli JS ESM realmente eseguibili, test, demo e note d'integrazione. Non riscrivono `oronzo/game.js`, `oronzo/index.html`, `oronzo/ui.css` o file fuori dal proprio perimetro. L'orchestratore coordina i contratti e assegna l'integrazione agli agenti responsabili; non programma al loro posto e non promette un'implementazione già collegata.

Agente 4 Copy: estensione richiesta sui presidenti: `oronzo/content/presidents.json` con almeno 8 profili originali e 16 eventi / 12 dialoghi su di loro; l'agente 9 è proprietario esclusivo della **logica** dei presidenti. Le somiglianze con personaggi cinematografici restano archetipiche, non copie.


## CENTRO DI COORDINAMENTO PERMANENTE (vincolante dal 7 novembre 2026)
I nove agenti si identificano con ID immutabile `ORONZO-AGENT-01` … `ORONZO-AGENT-09` nella cartella `oronzo/coordination/<id-slug>/`. Per ciascuno sono disponibili `IDENTITY.md`, un solo prompt di riavvio `RUN.md`, e `NEXT.md` con stato e prossimi passi autorizzati. L'agente può creare/aggiornare **solo** `REPORT.md` nella propria cartella di coordinamento, oltre allo scope tecnico già assegnato. Questa è un'eccezione esplicita e limitata alle restrizioni di percorso degli incarichi precedenti. `RUN.md`, `IDENTITY.md`, `NEXT.md`, `registry.json` e `PROTOCOL.md` sono riservati all'orchestratore. Prima di ricominciare: leggere `NEXT.md` su **main** e seguire `oronzo/coordination/PROTOCOL.md`. L'agente non può eseguire il merge della propria PR. La documentazione di riavvio non implica che le chat operino da sole; ogni esecuzione richiede una richiesta esplicita o un'automazione effettivamente configurata.
