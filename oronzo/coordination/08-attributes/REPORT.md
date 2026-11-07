# RAPPORTO AGENTE 08 — Attributi, regionalità e cognomi — ciclo R02 / visione v0.2

**ID immutabile:** `ORONZO-AGENT-08`  
**Stato:** `PR_OPEN` / `DELIVERED` per R02; QA e merge spettano all'orchestratore  
**Branch:** `agent/oronzo-attributes-r02`  
**PR:** https://github.com/CzekUns/cercax/pull/31  
**Ciclo precedente:** PR #16 integrata nel commit `389dce444a7f7c19254381bfda2205acc4268f51`  
**Codice R02 verificato:** `9247e84bbc45949cee35c07b6b168e4ccc591e0e`  
**Base di riallineamento:** `7e65a1370d7a3afe6704bbc2d40dfdca2aa4479c` (ultimo `main` osservato prima della PR)  
**Data rapporto:** 7 novembre 2026 (Europe/Rome)  
**Fonte decisionale:** `oronzo/coordination/08-attributes/NEXT.md` `READY` per R02, `GAME-VISION-v02.md`, `10-orchestrator/PLAN.md`.

## Realizzato

### Estensioni compatibili con PlayerV1

- `oronzo/systems/attributes/player-model.js`: 5 tratti nuovi 0–100 (`mental.pazzia`, `spericolatezza`, `coraggio`, `suscettibilita`, `impulsivita`), `origin:{comune,regione,macroregione}|null`, `surname`, `surnameSourceId`, `relationships.coachTrust`, `temporaryEffects` e `coachInteractionIds`. I campi core esistenti restano invariati. Origini dei vecchi save **null** invece che generate silenziosamente.
- `geography.js`: `REGION_MACRO` (20 regioni, Nord/Centro/Sud), `normalizeOrigin`, `regionAffinity`, `DEMO_ORIGINS` (17 capoluoghi autentici come fixture di demo). Sicilia/Sardegna, Abruzzo/Molise mappati a Sud per scelta progettuale; l'identità del comune deve essere provata dai dati Agente 07.

### Pipeline cognomi

- `surnames.js`: `loadSurnameCSV(csv,{source,limit,country})`, `chooseSurname(catalog,rng)`. Validazione di fonte/anno/licenza, parser CSV quote-aware, filtro country IT, deduplica, varianti `variant_of`, gestione collisone canonico/alias, ranking comparabile dentro **una sola sorgente** per quota/frequenza/rank, 5.000 massimi.
- `data/surname-sample.csv`: **20 cognomi COMUNI** italiani con stime per famiglie dalla tabella Italia di Wikipedia ("List of most common surnames in European countries"). NON 5.000, NON rari, NON conteggi ISTAT, NON 1979. `data/surname-sample.source.json` e `data/SOURCES.md`: attribuzione **CC BY-SA 4.0**, fonte secondaria originale ("Mappa dei Cognomi"), limite della certificazione storica, fonte integrale futura candidata Onomaverse v2026.10 **CC BY 4.0** (41.162 righe globali, numero italiano non verificato). Non sono state inventate frequenze o distribuzioni regionali.
- `generator.js`: input opzionali `surnameCatalog`, `origins`; inserisce origine, cognome, fonte, nuovi tratti su giocatori con ID stabile basato su team/index. Fallback legacy dei nomi marcato `legacy-fallback-unverified`. Stesso seed/input = stessa rosa e serializzazione JSON senza perdita.

### Gameplay del carattere

- `player-traits.js`: `analyzeDisposition`, `previewShout`, `applyShout`. Tratti influenzano propensione rischiosa, disponibilità a seguire ordini e reazioni a incoraggiamento/rimprovero.
- `applyShout` applica morale, fiducia nel mister e confidence individuale; usa `eventId` per evitare duplicazione dopo save/load; differenziale regionale stessa regione > stessa macro > altre; `temporaryEffects` limitati a 180 secondi di partita simulata. Questa è **una API**, non ancora un comando effettivo della partita integrata.
- `personality.js`: rischio contestuale e consumazione opzionale bonus temporanei con `effectiveAbility(player,{skill,t,riskyAction,...})`. Nessuna promozione artificiale dell'attributo tecnico base tramite etichetta.
- `training.js`: spericolatezza incide modestamente sul carico, e pazzia/spericolatezza sul rischio **probabilistico** di incidente da allenamento; disciplina sulla crescita, con limiti e normalizzazione. Nessun incidente è determinato al 100% dai tratti.

### Demo e documentazione

- `demo.html`, `demo.js`: anno di demo 1979, nuovi tratti/regione e fiducia mister, controlli tono/luogo del mister, simulazione dei richiami, import facoltativo via HTTP del CSV campione. La schermata rimane **landscape 16:9**, indipendente da `oronzo/game.js`.
- `README.md`, `integration-notes.md`, `data/SOURCES.md`: API R02, fonte/licenza, vincoli e contratti per gli altri agenti.
- `tests/attributes-r02.test.js`: 17 nuove prove; i 15 test originali restano nel branch senza modifica funzionale.

## Verifiche realmente effettuate

1. Riletti su GitHub `PROTOCOL.md`, `GAME-VISION-v02.md`, `PLAN.md`, `IDENTITY.md`, `RUN.md`, `NEXT.md`, report R01 e issue #10. REST GitHub: PR #16 **merged=true**, issue #10 closed/completed. Branch R02 creato da `main` e poi riallineato in sicurezza su base più recente `7e65a137...`. `NEXT.md` resta `READY` per il ciclo R02.
2. Suite **realmente eseguita** in isolate JavaScript **V8**, ottenendo i sorgenti GitHub e sostituendo **solo in memoria** le righe `import/export` ESM con binding locali; adattatore `assert` Node e `readFileSync` del CSV tramite contenuto recuperato. La logica originale dei moduli e le funzioni dei test sono state eseguite. Primo run: 30/32, due **fixture di test** non ammessi dal validatore; corretti i fixture senza indebolire la validazione. Run finale: **32 test passati su 32, 0 falliti** (15 R01 + 17 R02).
3. Casi nuovi: clamp dei tratti, legacy con origine ignota, 20 regioni, isole, affinità, CSV documentato e ordinamento per rarità, deduplica/varianti e rigetti, prova sintetica 5.100 righe→5.000 selezionate (numeri artificiali **solo nel test**, non dataset), seed/ID/JSON, scelta rischiosa, carichi/infortuni probabilistici, richiami gentile/duro, effetto regionale, idempotenza su JSON save/load e scadenza 180s.
4. `demo.js` compilato sintatticamente in V8 senza gli import ESM; `demo.html` contiene **24/24 ID** usati, collegamento `type=module`, regola portrait→ruota e anno 1979. Controllo sorgenti/markup, **NON** QA browser Android, screenshot né test touch.
5. **Non eseguito `node --test` nativo in questa ripresa**: il container non risolve `github.com` (`Temporary failure in name resolution`) e non può clonare il repository. I test V8 sono effettivamente eseguiti, non vanno descritti come test Node. Comando riproducibile con checkout reale: `node --test oronzo/systems/attributes/tests/*.test.js`.
6. Dati di cognomi: fonte/licenza esaminate su pagine pubbliche; il campione di 20 non equivale a verifica di 5.000 cognomi rari. Il file completo Onomaverse non è stato scaricato (limite del container/connessione). Nessuna affermazione di download o di copertura 5.000.

## Integrazione e responsabilità esterne

- **Agente 06 — match engine:** consumare `analyzeDisposition` per propensione azioni, `effectiveAbility` per resa contestuale e `temporaryEffects` mediante `t` in secondi simulati. Da `CoachCommandV1` convertire azioni individuali di tono in `applyShout` **una volta per ID**; l'evento score resta esclusivamente del motore. **Non sommare due volte** i modificatori di forma/salute/fortuna. Gli ordini effettivi e UI match non sono qui integrati.
- **Agente 07 — career/data:** iniettare `origins` da comuni autorizzati, verificando associazione comune→regione; salvare `origin`, `surname`, `surnameSourceId`, `coachInteractionIds` e `temporaryEffects` del PlayerV1 esistente; non rigenerare identità dopo load. I 17 capoluoghi della demo non sono i 500 comuni meno popolati.
- **Agente 09 — coach/club:** fornire `coachLeadership`, `coachOrigin`, `tone` e consumare `relationships.coachTrust` del **singolo giocatore**. `previewShout` restituisce effetti previsionali; `applyShout` aggiorna il calciatore. Morale coach come risorsa, GAME OVER, ingaggi, papponeria e finanze restano proprietà Agente 09.
- **Agente 04 — copy:** tono e dialetti mediante dialoghi verificati, nessun dialetto inventato in questo sistema.
- **Agente 03 — UI/runtime:** eventuale scheda dinamica con tratti e regione solo dopo NEXT autorizzato; questa PR non altera file UI del runtime.

## Mancante / problemi e limiti

- **Target di 5.000 cognomi rari NON raggiunto**: loader pronto a massimo 5.000; campione incluso = **20 cognomi comuni** con stime secondarie, senza rango certificato su 1979. Necessaria importazione autorizzata e auditing IT di un dataset integrale, controllo licenza, copertura e versione.
- `regionAffinity` non dimostra la correttezza geografica del comune: il catalogo dei comuni dell'Agente 07 dovrà verificarla; città demo sono capoluoghi d'esempio.
- Nessun comando nel runtime principale è stato collegato. `applyShout` non modifica morale del mister né crea gol/eventi di partita.
- Il demo HTML non è stato provato su browser reale; QA touch/landscape ancora dovuta.
- Nuovo roster con cognomi documentati richiede la fonte `surnameCatalog` esplicitamente passata; fallback legacy non verificato resta a supporto salvataggi esistenti.

## Proposta prossimo ciclo (solo se NEXT lo autorizzerà)

1. Importare e congelare un dataset integrale di cognomi Italia con licenza/dati di rarità riusabili; verificare il numero effettivo di righe nazionali e raggiungere 5.000 solo se supportati.
2. Con Agente 06: test su seed identico degli effetti di carattere e richiami nei veri eventi del match, minimizzando doppio conteggio.
3. Con Agenti 07/09: test di migrazione e persistenza multi-stagione di origine, relazione individuale, eventi idempotenti e bonus temporanei; QA browser Android landscape.

**Nessun merge, nessuna modifica a `NEXT.md`, né a file degli altri agenti.**
