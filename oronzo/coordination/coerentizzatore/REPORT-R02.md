# ORONZO — Rapporto Coerentizzatore R02

7 novembre 2026. **Verdetto dell'integrazione carriera–società–copy: needs changes.** Cinque P1 verificati, nessun P0 emerso nel perimetro. I moduli risultano già mergiati e sono testabili separatamente. L'integrazione deve risolvere le convenzioni sottostanti per sostenere due stagioni.

## Versioni e perimetro

Esaminata la versione main osservata al commit `c223bb10bc526e0a8ad5b7b40be2dea58531ef5c`, con le consegne seguenti. I file sono stati recuperati da main tramite GitHub, senza modificare i sorgenti.

| Modulo | PR chiusa con merge | HEAD consegnato | Merge |
|---|---|---|---|
| Copy/presidenti, agente 4 | #13 | db2ab586bf1fb437c230313cf1e6785b123aaffd | 065dc4ee7e59e26612b14c471b9c2be99f43cad1 |
| Carriera, agente 7 | #14 | 32891981180a3db5bd91bb8cca6959e4f0ec7874 | bb9e384796fdd8fd7ad8b7f200cc5902511442e1 |
| Società, agente 9 | #17 | 37e3fd798c49fcea96fe99ad25dcd01bc46b0b19 | 7309f1fe908e2e62b4304f44261d026d2866755c |

Letti REQUEST R02, RUN, memoria e coda dell'orchestratore, protocollo, contratti e NEXT/REPORT degli agenti interessati. Riscontrati via `git hash-object` gli stessi blob GitHub per `career.js` (290753833792e4b25567a87bf6fc176b0f2a1ef5), `finance.js` (618e77e63ef152d7c0959634f73b30351f6a56ab), `presidents.json` (fe299292f6c52386ab27a0063a6a8a0941fa73ec).

## Cinque P1 riprodotti

| ID locale | Prova e impatto | Correzione precisa e responsabile |
|---|---|---|
| R02-1 · Presidenti non risolti | Su una carriera con 24 club, **0 presidentId** corrispondono agli 8 profili canonici. `loadPresidents` carica correttamente il catalogo, ma non assegna profili ai club. `conveneBoard` accetta anche un profilo diverso dall'ID del club e lo registra nei verbali. Il copy filtra i testi per ID, quindi il disallineamento può silenziare i contenuti presidenziali o associare comportamento e voce diversi. | Orchestratore con 7/9, catalogo a cura di 4. Assegnare una volta, con seed e ordinamento stabile, un ID canonico a ciascun club e salvarlo. Risolvere sempre il profilo da quell'ID e rifiutare mismatch nelle API societarie. Con più club che profili, esplicitare il riuso di archetipi o un registro di istanze che separi persona e profilo, condiviso col copy. Migrare gli ID `president:*` esistenti. |
| R02-2 · Obiettivi divergenti in entrambi i sensi | `topHalf` cade nel fallback safety della società. Nella prova la stessa sconfitta produce fiducia **−4 invece di −5**, col profilo canonico Venturi. Rinominare globalmente in `top_half` rompe invece la valutazione carriera, che considera soddisfatto anche il quarto posto su quattro. `avoidRelegation` e `avoid_last` hanno oggi gli stessi delta partita, ma rimane il rischio nel percorso inverso di assessment. | Agenti 7/9. Un solo enum persistito e mapper espliciti per ciascun consumer, senza fallback silenzioso. Conservare le soglie e il significato degli obiettivi anche al cambio divisione. Testare entrambe le valutazioni sullo stesso obiettivo. |
| R02-3 · Tutte le rose iniziali giocano gratis | Tutti i 24 club generati hanno payroll **0**, perché manca `player.contract.weeklyWage`. `settleWeek` registra salari zero e lascia la cassa invariata senza altre entrate/spese. Il tetto ingaggi esiste ma i costi della rosa non incidono. | Orchestratore con agenti 7/9. Policy salariale deterministica per divisione/giocatore, importi ITL interi, totale entro wageBudget e salvataggio dei contratti. Se è prevista paga zero, indicarla esplicitamente nel contratto. Migrare le rose prive di salari senza rigenerare quelli già assegnati. |
| R02-4 · Il secondo anno salta paghe e riunioni | Dopo una stagione completa, reinserimento delle copie club, `finishSeason` e save/load, `week` torna a 1 ma `finance.settledWeeks` e verbali restano. `settleWeek({week:1})` rifiuta con **week_already_settled** e `conveneBoard({week:1})` con **already_met_this_week**. La cassa si conserva, ma l'attività del nuovo anno viene bloccata. Le promesse con dueWeek numerico hanno lo stesso dominio temporale ambiguo. | Agenti 7/9 e orchestratore. Introdurre chiavi seasonYear+week oppure un weekIndex assoluto persistito per società, scadenze e idempotenza. Passarle coerentemente dopo load e rollover, preservando registri finanziari e arretrati. Separare i reset annuali degli eventi dalle scadenze assolute. Verificare che ogni nuova settimana sia contabilizzata una volta e i retry restino esclusi. |
| R02-5 · Ricostruire il mister perde dati richiesti all'esonero | Il percorso `state.coach=createCoach(state.coach)`, save/load, `applyBoardDecision({type:'dismiss',clubId})` produce **TypeError** su `employmentHistory.push`. La factory elimina `employmentHistory` e `hiredSeason`. È un'incompatibilità riprodotta tra API pubbliche, condizionata all'uso della factory per normalizzare il mister. | Agenti 7/9 e orchestratore. Un unico Coach persistente. La normalizzazione conserva i campi carriera e la validazione/migrazione inizializza quelli obbligatori nei vecchi save. Finché manca, usare il coach carriera direttamente nelle operazioni societarie e aggiungere solo le estensioni mancanti. Concordare anche `contract.until` rispetto a `expiresSeason`, evitando due scadenze indipendenti. |

Riferimenti puntuali, tutti al commit analizzato.

- R02-1. [systems/career/career.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/career/career.js#L41-L46), [systems/coach-club/presidents.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/coach-club/presidents.js#L27-L39), [systems/coach-club/board.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/coach-club/board.js#L41-L55), [content/narrative-engine.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/content/narrative-engine.js#L84-L102).
- R02-2. [systems/coach-club/board.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/coach-club/board.js#L6-L26), [systems/career/progression.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/career/progression.js#L10-L19), [systems/coach-club/club.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/coach-club/club.js#L22-L25).
- R02-3. [systems/career/career.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/career/career.js#L17-L30), [systems/coach-club/finance.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/coach-club/finance.js#L8-L11), [systems/coach-club/finance.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/coach-club/finance.js#L76-L79).
- R02-4. [systems/career/career.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/career/career.js#L188-L203), [systems/coach-club/finance.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/coach-club/finance.js#L58-L79), [systems/coach-club/board.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/coach-club/board.js#L41-L55), [systems/coach-club/board.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/coach-club/board.js#L70-L86).
- R02-5. [systems/coach-club/coach-model.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/coach-club/coach-model.js#L3-L13), [systems/career/progression.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/career/progression.js#L38-L51), [systems/career/save.js](https://github.com/CzekUns/cercax/blob/c223bb10bc526e0a8ad5b7b40be2dea58531ef5c/oronzo/systems/career/save.js#L10-L18).

## Verifiche effettive

Node v24.22.1, copia temporanea con struttura sorgente originale.

| Comando, dalla directory indicata | Esito |
|---|---|
| Da oronzo/systems, `node --test career/tests/*.mjs coach-club/*.test.js` | 34 passati, 0 falliti |
| Da oronzo/systems, `node --test r02.test.mjs` riportato sotto | 6 passati, 0 falliti. Le prime cinque prove asseriscono la presenza dei difetti |
| Dalla root, `node oronzo/content/validate.mjs` | ORONZO COPY OK, 8 presidenti, 20 eventi e 22 dialoghi presidenziali, runtimeChecks OK |

La prima esecuzione del validatore copy si è fermata per JSON locale incompleto durante il trasferimento di `dialogues.json`. Ripristinata la coda mancante dalla risposta GitHub già acquisita, l'esecuzione completa è passata. Non è un difetto attribuito al repository.

Il test di due stagioni usa 4 club per ciascuna delle 6 divisioni, con risultati sintetici 0–0 dichiarati nelle fixture, senza motore partita. Completa entrambi gli anni e dimostra il blocco societario del secondo. Non è una verifica del runtime browser.

**Controlli positivi verificati.** Gli 8 profili canonici superano il caricatore senza fallback. Se `result.club` viene reinserito nello stato, entrate, budget e finanze sopravvivono ad advanceWeek e save/load. Una spesa discrezionale superiore alla cassa viene rifiutata e un importo negativo genera errore. Con il mister nativo carriera, esonero, avanzamento da disoccupato, offerta e nuovo ingaggio sopravvivono al salvataggio. Il difetto finanziario storico ORZ-P1-008 non è stato riaperto.

## Matrice delle interfacce

| Origine → destinazione | Esito | Collegamento necessario |
|---|---|---|
| Copy PresidentProfileV1 → loadPresidents | OK | Fetch del catalogo reale, 8 profili validi |
| Carriera presidentId → società e selezione testi | INCOMPATIBILE | Mapping persistente e controllo identità, R02-1 |
| Carriera seasonObjective ↔ board/assessment | INCOMPATIBILE | Enum canonico e mapper bidirezionali, R02-2 |
| Carriera giocatori → payroll | INCOMPATIBILE per una gestione salariale effettiva | Contratti e policy esplicita, R02-3 |
| result.club → stato carriera → save/load | OK con assegnazione esplicita | Sostituire il club per ID prima di salvare. Ignorare il ritorno perde l'aggiornamento |
| Rollover carriera → società | INCOMPATIBILE con week stagionale | Tempo e chiavi idempotenti concordate, R02-4 |
| Coach carriera → createCoach → carriera | INCOMPATIBILE | Preservare estensioni e schema contratti, R02-5 |
| reviewMatch.dismissed → applyBoardDecision | OK come ponte esplicito | Reinserire club, poi decisione riferita al club attuale; sincronizzare board.status al nuovo ingaggio |
| Browser e runtime completo | NON VERIFICATO | Fuori da questo audit breve |

## Ordine di integrazione proposto

1. Orchestratore con 4/7/9 definisce identità, enum obiettivi, schema Coach e policy salariale. Inizializzazione/migrazione una sola volta, senza riassegnare presidenti o stipendi a ogni load.
2. Agenti 7/9 concordano tempo assoluto/chiavi stagionali. Il runner rimpiazza ogni club restituito, inoltra esoneri/rinnovi/ingaggi e usa onRollover per reset annuali espliciti. Bilanci e arretrati restano persistenti.
3. Orchestratore verifica nuovamente un ciclo di due stagioni, con paghe non nulle, presidente stabile, evento narrativo coerente, esonero e reingaggio, save/load a metà settimana e dopo rollover. Solo dopo passa alla QA runtime.

## Riproduzione

Salvare il seguente script come file temporaneo `oronzo/systems/r02.test.mjs` in un checkout del commit analizzato ed eseguire il comando sopra. I nomi e gli import appartengono solo ai moduli dell'incarico.

<details>
<summary>Script completo dei sei test incrociati</summary>

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newCareer,fixturesForWeek,registerResult,advanceWeek,finishSeason,applyBoardDecision,applyJobOffer} from './career/career.js';
import {DIVISIONS} from './career/league.js';
import {seasonAssessment} from './career/progression.js';
import {serialize,deserialize} from './career/save.js';
import {createClub,createCoach,loadPresidents,weeklyPayroll,settleWeek,book,reviewMatch,conveneBoard} from './coach-club/index.js';
const data=JSON.parse(readFileSync(new URL('../content/presidents.json',import.meta.url)));
const make=()=>newCareer({leagueSizes:Object.fromEntries(DIVISIONS.map(d=>[d.id,4]))},42);
const active=s=>s.clubs.find(c=>c.id===s.coach.clubId);
const completeWeek=s=>{for(const f of fixturesForWeek(s))registerResult(s,{fixtureId:f.id,score:{home:0,away:0},events:[]});advanceWeek(s);};
test('R02-1 catalog loads but career president ids resolve zero profiles',async()=>{
 const s=make(), loaded=await loadPresidents(async()=>data);
 assert.equal(loaded.source,'copy');assert.equal(loaded.profiles.length,8);
 assert.equal(s.clubs.filter(c=>loaded.profiles.some(p=>p.id===c.presidentId)).length,0);
 const c=createClub(active(s));const r=conveneBoard(c,loaded.profiles[0],{week:1});
 assert(r.accepted);assert.notEqual(r.club.presidentId,r.policy.presidentId);
});
test('R02-2 topHalf fallback differs and reverse board enum misassesses season',()=>{
 const s=make(), p=data.presidents[0], raw=createClub(s.clubs[0]);
 const input={matchId:'real-ended',snapshot:{phase:'fulltime',t:5400,score:{home:0,away:1}},homeClubId:raw.id,awayClubId:s.clubs[1].id,week:1};
 const a=reviewMatch(raw,p,input,1), b=reviewMatch({...raw,seasonObjective:'top_half'},p,input,1);
 assert.equal(a.trustDelta,-4);assert.equal(b.trustDelta,-5);
 const rows=Array.from({length:4},(_,i)=>({clubId:'c'+i,position:i+1}));
 assert.equal(seasonAssessment(null,rows,'c3','topHalf').fulfilled,false);
 assert.equal(seasonAssessment(null,rows,'c3','top_half').fulfilled,true);
});
test('R02-3 generated career payroll zero; regular settlement pays zero',()=>{
 const s=make();assert(s.clubs.every(c=>weeklyPayroll(c)===0));
 const c=createClub(active(s)), r=settleWeek(c,{week:1});
 assert.equal(r.paidWages,0);assert.equal(r.club.budget,c.budget);
});
test('R02-4 second season repeats settled weeks and board meeting keys after save',()=>{
 let s=make(), id=s.coach.clubId,index=s.clubs.findIndex(c=>c.id===id);
 s.clubs[index]=createClub(s.clubs[index],{sponsorPerWeek:100});
 s.clubs[index]=conveneBoard(s.clubs[index],data.presidents[0],{week:1}).club;
 while(s.phase==='inSeason'){
  const r=settleWeek(s.clubs[index],{week:s.week});assert(r.accepted);
  s.clubs[index]=r.club;completeWeek(s);
 }
 const before=s.clubs[index].budget;finishSeason(s);
 s=deserialize(serialize(s));assert.equal(s.seasonYear,1986);
 assert.equal(s.clubs[index].budget,before);
 assert.equal(settleWeek(s.clubs[index],{week:1}).reason,'week_already_settled');
 assert.equal(conveneBoard(s.clubs[index],data.presidents[0],{week:1}).reason,'already_met_this_week');
 while(s.phase==='inSeason')completeWeek(s);finishSeason(s);
 assert.equal(s.seasonYear,1987);assert.equal(s.history.length,2);
});
test('R02-5 createCoach removes career fields; dismissal after save throws',()=>{
 let s=make();s.coach=createCoach(s.coach);s=deserialize(serialize(s));
 assert.equal(s.coach.employmentHistory,undefined);
 assert.throws(()=>applyBoardDecision(s,{type:'dismiss',clubId:s.coach.clubId}),TypeError);
});
test('positive controls detached club updates, no funds, negative money, dismissal and reemployment persist',()=>{
 let s=make();const id=s.coach.clubId,index=s.clubs.findIndex(c=>c.id===id);
 const c=createClub(active(s)), original=c.budget;
 const receipt=book(c,{type:'income',amount:125});assert.equal(c.budget,original);
 assert.equal(book(c,{type:'expense',amount:original+1}).accepted,false);
 assert.throws(()=>book(c,{type:'expense',amount:-1}));
 s.clubs[index]=receipt.club;completeWeek(s);
 s=deserialize(serialize(s));assert.equal(s.clubs[index].budget,original+125);
 applyBoardDecision(s,{type:'dismiss',clubId:id});s=deserialize(serialize(s));
 assert.equal(s.coach.clubId,null);completeWeek(s);
 const offer=s.offers.find(o=>o.status==='open');assert(offer);
 applyJobOffer(s,offer.id);s=deserialize(serialize(s));assert.equal(s.coach.clubId,offer.clubId);
 assert.equal(s.coach.employmentHistory.at(-1).reason,'dismissed');
});
```

</details>
