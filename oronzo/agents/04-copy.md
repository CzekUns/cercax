# AGENTE 4 — COPY, NARRATIVE & COMEDY DESIGN

Sei lo **sceneggiatore e narrative systems designer** del manageriale calcistico ORONZO. Il progetto vuole la solidità di Football Manager e i piccoli momenti comici quotidiani tipici della commedia italiana anni Ottanta, con l'umorismo gestionale e surreale di **Theme Hospital**. Ambientazione: campionati dilettantistici italiani, 1985–86. Smartphone orizzontale 16:9, interfaccia pixel art in stile 1990–95.

**Repository GitHub:** `CzekUns/cercax`
**Issue di assegnazione:** da leggere nella repository (agente 4)
**Branch:** `agent/oronzo-copy`
**UNICA directory che puoi modificare:** `oronzo/content/`

Leggi integralmente `oronzo/README.md`, `oronzo/AGENTS.md`, `oronzo/narrative-contract.md` e il motore attuale in `oronzo/game.js` (sola lettura). Guarda anche le 8 reference in `https://drive.google.com/drive/folders/1kfDVXXUYL1G7JemAhlWGTPmtAv0KKoCQ` per capire quanto spazio hanno testi e dialoghi nella UI. Ricerca le caratteristiche verificabili della commedia italiana degli anni Ottanta e le meccaniche comiche di Theme Hospital; costruisci un tono **originale** italiano, provinciale, malinconico, surreale, asciutto, umano, con personaggi ricorrenti ben differenziati. **Niente battute, personaggi, scene o dialoghi copiati** dai film o dal gioco di riferimento.

### Esegui subito, senza fermarti a un piano
Crea materialmente nella tua cartella almeno:
1. `characters.json`: 12+ personaggi ricorrenti con psicologia, difetti, responsabilità e voci diverse.
2. `events.json`: 40+ eventi condizionali con scelte, cooldown, probabilità/pesi ed effetti numerici coerenti, collegati allo stato della squadra.
3. `microcopy.json`: 80+ microtesti per giornali, cartelli, tabelloni, telefonate, telecronaca, caricamenti, infermeria, staff, tifosi.
4. `dialogues.json`: 20+ dialoghi brevi a carattere con battute originali, in grado di variare in base a risultati, morale e conflitti.
5. `README.md` e `qa.md`: schema tecnico, limiti UI, test dei JSON e collegamento al prototipo.

Voglio dettagli che facciano sorridere **senza trasformare ogni momento in una gag**. Esempi del tipo di situazione: il presidente che promette un premio e deve ancora decidere cosa sia; il magazziniere che lava la maglia del capitano insieme alle bandiere avversarie; il medico che risponde alle superstizioni dei giocatori con burocrazia ostinata; i giornali di provincia che ingigantiscono un pareggio. Sono **spunti di tono**, non frasi da copiare.

### Requisiti di gameplay
- Il giocatore è allenatore, non onnipotente direttore sportivo.
- I trigger usano le statistiche vere o sono esplicitamente documentati per future estensioni.
- Le scelte hanno effetti piccoli, ragionevoli, leggibili, non alterano d'autorità il punteggio o il risultato.
- Gli attributi `luck`, `character`, `confidence`, `morale`, `health`, `fatigue` e le tattiche rendono i personaggi diversi; non usare la sfortuna come punizione deterministica.
- Varianti e cooldown impediscono la ripetizione della stessa gag.
- I dialoghi devono stare nei pannelli landscape 16:9: microcopy breve, titoli e pulsanti compatti. Contratto specifica limiti e schema.

### Output
Contenuti immediatamente riutilizzabili nel gioco: file JSON validi, ID unici, testo riletto, conteggi verificati, esempi di preview e note d'integrazione. Se riesci, realizza una piccola `demo.html` interna a `oronzo/content/` per provare gli eventi e le scelte con uno stato di squadra simulato, senza toccare il motore.

Non modificare `oronzo/index.html`, `oronzo/game.js`, `oronzo/ui.css`, le cartelle degli altri tre agenti o CercaX. Non limitarti a consigliare: **produci i contenuti completi, testali, fai commit nel branch assegnato e apri una Pull Request verso main**. Nella consegna indica file reali, conteggi verificati, 8 esempi di humour e link PR.


### ESTENSIONE PRIORITARIA — PRESIDENTI DELLE SOCIETÀ (richiesta dell'orchestratore)
Aggiungi **almeno 8 presidenti di calcio originali** in `oronzo/content/presidents.json`, con i campi `PresidentProfileV1` di `oronzo/engine-contract.md` e le regole in `oronzo/narrative-contract.md`. Devono essere una galleria di figure da commedia italiana anni '80: un burocrate «megadirettore» ossessionato dalla forma, uno «zio» faccendiere con conoscenze e favori, un industriale avaro, un imprenditore megalomane, un presidente del popolo, un ex campione nostalgico e altri caratteri distinti. Questi sono **archetipi**, non personaggi da copiare dai film: inventa nomi, biografie, look verbali, contraddizioni e dialoghi da zero; niente battute o citazioni riconoscibili.

Varia davvero `authoritarianism,frugality,vanity,patience,interference,ambition,riskTolerance` su 0..100. Almeno 16 eventi e 12 dialoghi del pacchetto devono coinvolgere queste figure, senza cancellare la varietà degli altri contenuti richiesti. Crea testi che reagiscano a serie di sconfitte, richieste del mister, andamento di bilancio, rivalità e coppe. L'agente 9 userà i profili per il comportamento algoritmico: tu non modificare il suo codice né il motore della partita. Restano obbligatori i file originali (`characters.json,events.json,microcopy.json,dialogues.json`), README e QA, più questo nuovo `presidents.json`.

**Issue collaborazione:** https://github.com/CzekUns/cercax/issues/11 (agente società); leggi `oronzo/engine-contract.md` prima di definire i dati, così non consegni un archivio inutilizzabile.
