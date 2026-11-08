# ORONZO M1 — 600 cognomi realmente integrati · PlayerV2 / Agente 06

**Contratto vigente (8 novembre 2026):** la PR #31 utilizza per impostazione predefinita **600 cognomi italiani attestati nei dati dei residenti con cittadinanza italiana del Comune di Bergamo, anno 2021**. Dataset M1 in `data/bergamo-2021-m1.js`, con **600 ID originali persistenti** provenienti da [PR dati #40](https://github.com/CzekUns/cercax/pull/40), HEAD congelato `0b9eedd4070c10beb164e929d4740354663bf86d`, Git blob `de098d57f1ce47be4cd07ecfb64ba213a6835663`. Licenza dataset **CC0 1.0** dichiarata dal portale open data, fonte Comune di Bergamo / Regione Lombardia ([dataset 4pqu-7zkd](https://www.dati.lombardia.it/d/4pqu-7zkd)). **Frequenze solo locali (11–16) e oltre la soglia >10; non sono frequenze nazionali, etimologie certificate o dati del 1979**. La precedente lista di 20 cognomi comuni in `surname-sample.csv` resta **fixture documentale**, non catalogo predefinito. Gli obiettivi 5.000 e 500 comuni non fanno parte dell'implementazione 08 M1.

L'import avviene **offline**, senza richieste web al caricamento del gioco: `generator.js` usa `BUILTIN_SURNAME_CATALOG` da `surnames.js`. `surnameId`, `surname`, `surnameSourceId` e `player.id` sono congelati nel PlayerV2 salvato; un save caricato non viene rigenerato. Importazione 600/600 validata per ID, unicità case-folded, caratteri di origine (anche spazi/apostrofi), frequenza, licenza, anno e hash del sorgente. `loadVerifiedSurnameSnapshot` rifiuta collisioni o provenienza incompleta. `toMatchEnginePlayer` + `toIndividualShoutCommand` in `player-engine-bridge.js` presentano i dati al vero motore #35.

**Ownership vincolante:** PlayerV2 canonico `origin:{comune,regione,macroregione}|null` e `relationships.coachTrust`; tono UI `gentle|hard` ↔ comando 06 `encourage|harsh`. Origine ignota resta `null` e fiducia **0 rimane 0**, mai sostituita con default 50. Il motore 06 accetta ormai anche i nomi italiani tramite `normalizePlayerMatchContext`. L'effetto **temporaneo per 150 s simulati** appartiene solo a 06 (evento `coach_shout`); 09 applica i suggerimenti **persistenti** una sola volta con `matchId:event.id`. `effectiveAbility` ignora i vecchi `temporaryEffects.kind='coach-shout'` da 180 s. `applyShout` è consentito **solo** con `scope:'standalone-demo'` e non crea effetti temporanei: NON usarlo in partita. La demo autonoma non integra il runtime.

Per test Node su checkout con il codice 08: `node --test oronzo/systems/attributes/tests/*.test.js`. Quando la PR #35 è disponibile nello **stesso checkout**, aggiungere `node --test oronzo/systems/attributes/tests/pr35-integration.test.mjs` (altrimenti gli scenari cross-PR vengono esplicitamente **saltati**). Le suite eseguite qui in V8: **43/43 test 08**, **6/6 prove reali 08↔06 #35** con import ESM adattati in memoria (non spacciate per esecuzioni native Node). Per QA browser richiesta la verifica HTTP/Chromium e save/load in game-flow 07.

---

# ORONZO — Attributi, personalità e allenamento (Agente 8)

**Stato:** implementato e testato indipendentemente. **NON ancora integrato** nel prototipo `oronzo/game.js`.

Sistema JavaScript ESM senza dipendenze obbligatorie, compatibile con il contratto `PlayerV1` in `oronzo/engine-contract.md`.

## Demo interattiva

Aprire `oronzo/systems/attributes/demo.html` con GitHub Pages oppure un server statico. Interfaccia **landscape 16:9**. Si possono generare 22 giocatori con seed riproducibile, consultare le loro statistiche, scegliere un allenamento settimanale, caricare 90 minuti e chiudere una stagione. La demo NON genera gol o risultati. Per il browser è preferibile un server HTTP: `python -m http.server` dalla root (i moduli ESM su `file://` possono essere bloccati).

## Moduli pubblici

| Modulo | API |
|---|---|
| `rng.js` | `createRng(seed)`, `seedNumber`, `clamp`, `pick`, `range`, `triangular` |
| `player-model.js` | `normalizePlayer`, `createPlayer`, `validatePlayer`, `importLegacyPlayers`, `ATTRIBUTE_KEYS`, `POSITIONS` |
| `generator.js` | `generatePlayer({seed,teamId,index,role,teamLevel,archetype})`, `generatePlayers(count,options)`, `generateSquad(options)`, `generateLeague(options)` |
| `personality.js` | `effectiveAbility(player,context)`, `resolveAction(player,context,rng)`, `trainingInjuryProbability(player,load)` |
| `training.js` | `TRAINING_PLANS`, `applyTrainingWeek(players,plan,options)`, `applyMatchLoad(players,minutesById,options)`, `applyObservedInjury(player,days)`, `advanceSeason(players,options)` |
| `career-stats.js` | `createCareerRecord(player)`, `recordMatch(record,match)`, `recordSeasonSnapshot(record,seasonId,player)` |

`PlayerV1` comprende `id:string`, `name`, `teamId:string`, `age`, `positions`, `technical`, `physical`, `mental`, `status`. I campi obbligatori del contratto sono presenti. Le estensioni sono `technical.vision/dribbling`, `physical.acceleration`, `mental.ambition`, `foot`, `personality`, `relationships`, `development`. Attributi e indicatori 0–100; giorni infortunio 0–365, giornate squalifica 0–30.

Ruoli: `GK` portiere, `DF` difensore, `MF` centrocampista, `FW` attaccante. Importer legacy: `POR/DIF/CEN/ATT` con conversione di `tech,speed,stamina,luck,character,confidence,health,morale,fatigue`; mantiene anche proprietà originarie (`starter`, ecc.) per migrazioni progressive. Gli ID sono stringhe stabili.

## Collega la probabilità al motore partita

```js
import { effectiveAbility, resolveAction } from './personality.js';
import { createRng } from './rng.js';
const rng = createRng('partita-001');
const rating = effectiveAbility(player, {
  skill: 'shooting',
  pressure: 75,
  teamAction: true,
  tacticalDemand: 70,
  requiresInstruction: true,
  leaderAura: 65,
  allyId: 'club-1-015'
});
const attempt = resolveAction(player, {skill:'shooting',pressure:75}, rng);
// attempt.success riguarda l'esecuzione di una singola azione.
// Il motore decide autonomamente se ciò produca un tiro, una parata o un gol.
```

`effectiveAbility` è pura: restituisce `base`, `effective` (0–100), `executionProbability` (0.01–0.99), `adherence`, `luckDelta`, `modifiers`, senza consumare casualità. Fatica alta penalizza fino a 23 punti; forma, salute, sicurezza, morale, autocontrollo sotto pressione, rapporti e leadership producono modificatori misurabili. Disciplina e collaborazione incidono sull'adesione alle istruzioni. Fortuna: margine ristretto di **±2,5 punti percentuali** di probabilità; nessun fallimento automatico. Usare un unico lancio RNG per ogni azione effettivamente valutata, e non interpretare `success` come un evento `goal`.

## Allenamenti, recupero e stagioni

Piani: `technical`, `athletic`, `tactical`, `balanced`, `rest`; oppure `{load:0..100,skills:[]}`. Allenamento:

```js
const {players:trained, incidents} = applyTrainingWeek(club.players,'technical',{
  seed: 'carriera-1985', week: 7, coachQuality: 60, intensity: 50
});
const postMatch = applyMatchLoad(trained,{'club-1-001':90});
const nextSeason = advanceSeason(postMatch,{seed:'carriera-1985',season:'1985-86'});
```

L'allenamento restituisce oggetti **nuovi**, progressi frazionari limitati dal potenziale, fatica, condizione e rari infortuni da allenamento generati con seed. I giovani migliorano più velocemente; il decadimento fisico inizia dopo un picco individuale. `applyMatchLoad` usa i minuti realmente giocati e non inventa eventi di partita. Eventuali infortuni in partita si applicano **solo dopo** un evento reale dell'engine via `applyObservedInjury`.

`recordMatch(record,{id,seasonId,playerId,minutes,started,events})` registra presenze, minuti, gol, assist, cartellini e infortuni soltanto da dati/azioni reali del motore. I doppi eventi di assist vengono riconciliati; la ripetizione del medesimo ID partita è idempotente. `recordSeasonSnapshot` archivia le capacità per anno. Rosa e storico sono serializzabili in JSON.

## Test replicabili

Da root repository su Node 20+:

```bash
node --test oronzo/systems/attributes/tests/*.test.js
```

Test di 120 giocatori, 8 squadre/176 calciatori, 11 titolari più riserve, generazione a seed, posizioni e archetipi, invarianti numeriche, import dei vecchi salvataggi, probabilità di fortuna e infortuni, carichi, riposo, crescita, declino e registri storici. Il codice è anche testato localmente con Node v22; l'integrazione col progetto globale richiederà test distinti.

## Limiti

- La demo principale e il match engine restano di proprietà dell'orchestratore e degli altri agenti. Questo sistema non cambia score, calendari, bilanci o dialoghi.
- I giorni di stop sono un modello ludico approssimativo, non una diagnosi.
- Chiamare `applyTrainingWeek` **una sola volta** per settimana. Il chiamante deve registrare la settimana completata; questa funzione non fa deduplica temporale.
- Le posizioni sono categorie base PlayerV1; eventuali sottoruoli tattici saranno estensioni interoperabili.


## Ciclo R02 · Visione 1979: carattere, geografia e cognomi (moduli, non runtime)

Il codice originale `PlayerV1` rimane compatibile (stesse proprietà obbligatorie e API): estensioni addizionali `mental.pazzia`, `mental.spericolatezza`, `mental.coraggio`, `mental.suscettibilita`, `mental.impulsivita` (0–100), `origin: {comune,regione,macroregione}|null`, `surname`, `surnameSourceId`, `relationships.coachTrust`, `temporaryEffects` e `coachInteractionIds`. I vecchi salvataggi senza origine mantengono `origin:null`: il modulo **non inventa** il comune natale dopo load. Le regioni vengono validate in `geography.js`; per ORONZO Sicilia, Sardegna, Abruzzo, Molise sono **Sud** (scelta di gioco esplicita, non classificazione ufficiale universale).

### Provenienza cognomi e copertura reale

- `surnames.js`: `loadSurnameCSV(csv,{source,limit:5000,country:'IT'})`. Accetta un CSV attribuito e dichiarato riutilizzabile con `name`/`surname`, `country_code` e almeno una metrica **attestata** (`pct_in_country`, `frequency`, `rank`). Scarta record non italiani, deduplica i nomi (confronto NFC e maiuscole), valida eventuali varianti `variant_of`, ordina dal **meno frequente**; se la fonte espone solo `rank` (1=più comune) ordina il ranking in senso decrescente. Non confronta metriche/anni di fonti diverse in un unico ranking.
- `chooseSurname(catalog,createRng(seed))` seleziona riproducibilmente un cognome da un catalogo già limitato, senza inventare frequenze. `generatePlayer`, `generateSquad`, `generatePlayers`, `generateLeague` ricevono opzionalmente `surnameCatalog` e `origins`.
- **Campione effettivamente incluso:** `data/surname-sample.csv` contiene **20 cognomi italiani diffusi** con ranking/stime di famiglie riportati nella tabella Italia della voce [List of most common surnames in European countries](https://en.wikipedia.org/wiki/List_of_most_common_surnames_in_European_countries#Italy), che attribuisce tali stime a Mappa dei Cognomi. Licenza **CC BY-SA 4.0** della pubblicazione Wikipedia; attribuzione, avvertenze e fonte in `data/surname-sample.source.json`. **NON sono cognomi rari, NON sono dati censuari ufficiali e NON sono conteggi del 1979.** Il campo `year:2026` indica la consultazione, non la data della popolazione stimata.
- **Per arrivare a 5.000:** fonte potenziale riutilizzabile [Onomaverse surname-frequency v2026.10](https://github.com/onomaverse/datasets/releases/tag/v2026.10), **CC BY 4.0**, file `surname-frequency.csv` con `name,country_code,pct_in_country`. La documentazione Onomaverse dichiara **41.162 righe globali**, non 5.000 cognomi italiani garantiti. Verificare copertura IT e provenienza/anno prima di importare; non certificare il ranking come censimento. Attribuzione richiesta: "Names data from Onomaverse (https://onomaverse.com/datasets), licensed CC BY 4.0." Il file completo non è stato vendorizzato e NON si dichiara 5.000 raggiunto.
- Senza un catalogo documentato il generatore conserva il fallback dei 35 cognomi legacy con `surnameSourceId:'legacy-fallback-unverified'`; **questo fallback non costituisce un archivio documentato**.

### Personalità e feedback tecnico

- `player-traits.js` esporta `analyzeDisposition(player,context)`, `previewShout(player,{tone,coachOrigin,coachLeadership,pressure})`, `applyShout(player,{eventId,t,tone,coachOrigin,coachLeadership,pressure})`. Calcola `riskPreference`, `orderCompliance`, `errorOnRiskyAction`, `emotionalSensitivity` senza mutare la tecnica di base.
- `effectiveAbility(player,{skill,pressure,riskyAction,t,...})` penalizza azioni rischiose condizionate da spericolatezza/impulsività, e legge gli effetti `temporaryEffects` solo se `t` (secondi di partita) è fornito e `t < expiresAt`. Gli effetti sono limitati a 8 punti complessivi. Il motore resta responsabile di *quali* azioni tentare: non generiamo tiri, gol o comandi.
- `applyShout` richiede ID evento stabile, non duplica modifiche dopo retry/reload, è limitato alla modalità esplicita `scope:'standalone-demo'` e applica solo delta locali di demo, **senza bonus temporaneo**. Risposta media stessa regione > stessa macroregione > macroregione diversa, ponderata da leadership e carattere; gli shouts ripetuti devono essere gestiti e limitati dall'Agente 06/09. La morale di **allenatore**, game over e costi ingaggi sono esclusivamente dell'Agente 09.
- Rischio infortunio da seduta: pazzia e spericolatezza influenzano le **probabilità** di sovraccarico senza creare esiti certi; piani/allenamenti rimangono deterministici a seed. L'origine è immutabile durante progressione stagionale e serializzabile.

### Esempio R02

```js
import {loadSurnameCSV} from './surnames.js';
import {generateSquad} from './generator.js';
import {applyShout} from './player-traits.js';
const catalog=loadSurnameCSV(csvText,{source:sourceMetadata,limit:5000});
const players=generateSquad({seed:1979,teamId:'club-17',surnameCatalog:catalog,origins:verifiedTownRecords});
const {player,applied,effects}=applyShout(players[0],{eventId:'match-100-shout-1',t:1800,tone:'gentle',
 coachOrigin:{comune:'Napoli',regione:'Campania'},coachLeadership:75});
```

`demo.html` usa il catalogo M1 interno da 600 cognomi per la scheda, mostra tratti e regione e permette di simulare richiami; non è collegata alla partita reale. Avviarla via HTTP per permettere il caricamento del CSV locale.
