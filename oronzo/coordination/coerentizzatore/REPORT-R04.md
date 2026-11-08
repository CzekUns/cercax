# ORONZO — Audit R04 e merge condizionati

**Data** 7 novembre 2026. **Esito** un merge produttivo eseguito, quattro PR richiedono correzioni, cinque rimangono sospese. Delega eccezionale limitata a questa sessione, esaurita alla consegna del rapporto.

Baseline main `4ecf1716e3180fee7db5ae5cd0b01e53a4091e2d`. Main dopo l'unico merge `b8976cb2b0129de9ee6537e1d624abce9ff1402f`. Letti RUN, REQUEST R04, PROTOCOL, visione v0.2, CONTRACT-v02, memoria/coda, registry, NEXT e REPORT pertinenti. Le assegnazioni e i NEXT rimangono di competenza dell'agente 10.

## Esito delle dieci PR

| PR / agente | HEAD analizzato | Esito | Motivo e SHA merge |
|---|---|---|---|
| #30 / 07 | 19d9600aeb3dc45d38db2760fd865de1b2da6a20 | **FIX_REQUESTED** | Migrazione dei registri legacy incompleta, R04-1. Non supera il gate con #32 |
| #32 / 09 | d604243eb300ca65b2f5c56beba8fde3f799a174 | **FIX_REQUESTED** | Pagamento duplicabile al cambio formato dei periodi, R04-1. Suite combinata fallisce, R04-2 |
| #28 / 05 | c326e33e8cb51825f2f18557f0903b011d70332b | **HOLD** | Test nativi e snapshot nelle due camere passano. Browser reale con asset non eseguibile qui, gate visivo aperto |
| #35 / 06 | 11e9901285f16ce3119c945fd22890a9c3e70fff | **FIX_REQUESTED** | Incompatibilità con #31 su origine, fiducia e toni; percorso unico degli effetti da formalizzare, R04-3/4 |
| #31 / 08 | 979cde10412d0b67aab616653616205e444de8fa | **FIX_REQUESTED** | R04-3/4. La pipeline cognomi consegna un campione di 20 comuni cognomi, non 5.000 rari |
| #34 / 04 | b74c376f1045e8b95c3cb4c5c21258a7df33087d | **MERGED** | Validatori nativi e verifica del codice/semantica passati. Merge `b8976cb2b0129de9ee6537e1d624abce9ff1402f` |
| #33 / 03 | a472423738a586dc7a6484706a2ac34f24502ec7 | **HOLD** | Verifica statica asset/sintassi passa. Chromium reale non disponibile. Kit dimostrativo, non runtime di carriera |
| #29 / 01 | 01c5deca71d6f7e304217c48525732cf914c4fbc | **HOLD** | Quattro test atlas nativi passano e preview esaminata. Restano gate artistico e prova browser/telefono |
| #12 / 02 | 7ec2e1f8625b828c819f41301577567a1e39d828 | **HOLD** | Draft e gate artistico. Nessun merge tentato |
| #27 / audit preliminare | 90f4f73f1a8cc9c1b31c6d5d85631a4d2142906b | **HOLD / NO MERGE** | Esclusa dal mandato produttivo. Nessun merge tentato |

Prima della decisione sono stati riletti via REST gli otto HEAD produttivi, i file modificati, mergeability e stato CI. Tutti e otto risultavano `mergeable=true / clean`, senza check-run né commit status configurati. Questo dato non è stato usato come approvazione del codice. Ogni diff rispetta lo scope produttivo e il solo REPORT personale autorizzato. Nessuna modifica a NEXT, codice di gioco o branch degli agenti.

## Problemi verificati e correzioni

### R04-1 — P1, doppio pagamento dopo migrazione legacy

**Verificato in esecuzione.** Un club con settimana 1 già contabilizzata e `settledWeeks:[1]`, importato con i nuovi moduli, viene nuovamente pagato usando `{week:1,absoluteWeek:1,seasonYear:1985}`. La nuova chiave `a:1` non corrisponde al numero 1. La prova è riprodotta anche attraverso veri envelope V1 e V2 con checksum valido e deserialize.

Seed 42, fixture ridotta. Dopo il primo pagamento la cassa è **9.234.000 ITL**. Il retry dopo import viene accettato e scende a **8.748.000 ITL**, un secondo payroll di **486.000 ITL**. Il registro diventa `[1,"a:1"]`. La stessa separazione di domini in samePeriod non riconosce i vecchi verbali quando si passa ad absoluteWeek.

**File e funzioni** [systems/career/compat.js](https://github.com/CzekUns/cercax/blob/19d9600aeb3dc45d38db2760fd865de1b2da6a20/oronzo/systems/career/compat.js#L107-L125) normalizza absoluteWeek ma non i registri finanziari/board. [systems/coach-club/period.js](https://github.com/CzekUns/cercax/blob/d604243eb300ca65b2f5c56beba8fde3f799a174/oronzo/systems/coach-club/period.js#L6-L22) genera chiavi distinte e confronta i legacy solo con chiamate legacy. [systems/coach-club/finance.js](https://github.com/CzekUns/cercax/blob/d604243eb300ca65b2f5c56beba8fde3f799a174/oronzo/systems/coach-club/finance.js#L61-L84) controlla includes(period.key).

**Atteso** il retry dello stesso periodo già pagato viene rifiutato, anche dopo migrazione.

**Fix proposto** 07 migra una sola volta settledWeeks, transazioni, verbali, cooldown e scadenze, con versione dello schema dei periodi e stagione di origine verificabile. 09 impone un unico dominio temporale per ledger e rifiuta cambi di modalità non migrati. Se i vecchi dati non permettono di distinguere le stagioni, segnalare il caso come non migrabile automaticamente, evitando di ricontabilizzare. Testare V1/V2, stagione corrente e precedenti, retry e promesse a cavallo d'anno. Non cancellare lo storico.

### R04-2 — P1 di accettazione, suite combinata non verde

**Verificato.** `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js` conclude **50 passati / 1 fallito**. Il test “R02 integration: real Career 07 across two seasons, save/load and dismissal” si ferma su **472000 !== 1600**.

**File e funzione** [systems/coach-club/compat-r02.test.js](https://github.com/CzekUns/cercax/blob/d604243eb300ca65b2f5c56beba8fde3f799a174/oronzo/systems/coach-club/compat-r02.test.js#L150-L164). La fixture imposta 100 ITL solo ai giocatori privi di contratto, ma il nuovo career genera già i contratti. L'asserzione resta fissata a 1.600.

**Atteso** il test usa davvero entrambi i moduli nuovi, conserva i contratti prodotti dalla carriera e completa il percorso.

**Fix proposto** agente 09 aggiorna la prova incrociata calcolando payroll e saldo attesi dai contratti effettivi, senza sostituire artificialmente i dati né modificare il calcolo produttivo per adattarlo alla fixture. Estendere il test a tutte le settimane di due stagioni con il nuovo oggetto periodo. Questo fallimento è un difetto del test consegnato, non una dimostrazione che le nuove carriere non possano avanzare. La prova indipendente su 104 club sotto descritta passa.

### R04-3 — P1, schema degli ordini 06/08 incompatibile

**Verificato.** La rosa prodotta da #31 usa `origin:{comune,regione,macroregione}`, `relationships.coachTrust` e toni `gentle/hard`. #35 legge `regionId/macroRegion`, `relationshipWithCoach` o payload.playerTrust e accetta `encourage/harsh`.

Con giocatore e allenatore campani il comando engine viene accettato, ma l'evento riporta **affinity:"unknown"**. Passare solo playerOrigin normalizzato nel payload non basta se player.origin è già presente, perché ha precedenza. Nella prova con RNG costante, passare coachTrust da 0 a 100 lascia identico il modifier engine **0,05235**. Passare tone:"encourage" direttamente ad applyShout di 08 provoca RangeError.

**File** [systems/attributes/geography.js](https://github.com/CzekUns/cercax/blob/979cde10412d0b67aab616653616205e444de8fa/oronzo/systems/attributes/geography.js#L22-L40), [systems/attributes/player-traits.js](https://github.com/CzekUns/cercax/blob/979cde10412d0b67aab616653616205e444de8fa/oronzo/systems/attributes/player-traits.js#L21-L25), [systems/match-engine/orders.js](https://github.com/CzekUns/cercax/blob/11e9901285f16ce3119c945fd22890a9c3e70fff/oronzo/systems/match-engine/orders.js#L9-L28).

**Atteso** stessa regione > stessa macro > altra, e fiducia individuale realmente letta senza campi duplicati divergenti.

**Fix proposto** agenti 06/08 concordano un formato canonico o un adapter esplicito, documentato e testato, per origine, nomi geografici, fiducia e toni. Il confine deve normalizzare anche Player.origin prima di createMatch, non soltanto un campo opzionale del comando. Il futuro flow 07 consuma la stessa convenzione. Test con una rosa reale di 08, trust minimo/massimo e reload.

### R04-4 — P1 d'integrazione, due risolutori di effetti senza ownership unica

**Verificati i comportamenti separati.** Sul medesimo giocatore e richiamo, 08.applyShout modifica subito morale/fiducia/confidence e aggiunge un bonus di **180 s**. Engine06 aggiunge personalShout per **150 s**, oltre a persistentSuggestion. Nella prova i due delta di fiducia sono rispettivamente **2,21** e **1**. I due percorsi hanno ledgers diversi, coachInteractionIds e appliedEventIds, e non consultano automaticamente l'altro. Ogni percorso deduplica correttamente solo se riceve il proprio ledger aggiornato.

**Inferito, non osservato nel runtime finale ancora assente** un adapter che chiami entrambi applicherà due regole per lo stesso fatto. Non dichiaro che nel gioco attuale sia già avvenuto un doppio bonus.

**File** [systems/attributes/player-traits.js](https://github.com/CzekUns/cercax/blob/979cde10412d0b67aab616653616205e444de8fa/oronzo/systems/attributes/player-traits.js#L35-L55), [systems/attributes/personality.js](https://github.com/CzekUns/cercax/blob/979cde10412d0b67aab616653616205e444de8fa/oronzo/systems/attributes/personality.js#L36-L43), [systems/match-engine/orders.js](https://github.com/CzekUns/cercax/blob/11e9901285f16ce3119c945fd22890a9c3e70fff/oronzo/systems/match-engine/orders.js#L18-L21), [systems/match-engine/coach-effects.js](https://github.com/CzekUns/cercax/blob/11e9901285f16ce3119c945fd22890a9c3e70fff/oronzo/systems/match-engine/coach-effects.js#L3-L28).

**Fix proposto** 06/08/09 definiscono un solo flusso per gli eventi partita. L'engine è l'unico risolutore dell'effetto temporaneo. 09 applica i delta permanenti autorizzati una volta con chiave matchId:eventId, salvando delta e ledger insieme. 08 espone dati/preview al risolutore o un'applicazione persistente che non ricalcoli né aggiunga il secondo bonus per lo stesso evento. I toni del copy sono solo testo/intento e richiedono mapping dichiarato. Test con lo stesso evento ritrasmesso da più snapshot e dopo save/load, verificando saldo e durata finali. Questa è una correzione consigliata al contratto, non codice sviluppato dal revisore.

## Test realmente eseguiti

Node **v24.22.1**, file dai rispettivi HEAD combinati in sandbox temporanea. I **128 file testuali** sono risultati SHA-identici ai blob GitHub con git hash-object. Gli asset PNG sono stati recuperati dai relativi HEAD. Il working snapshot include tutte le otto PR produttive, per verificare il codice combinato senza merge remoto preliminare.

| Verifica | Risultato effettivo |
|---|---|
| `node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js` | **50 PASS / 1 FAIL**, R04-2 |
| `node --test oronzo/systems/attributes/tests/*.js oronzo/systems/match-view/*.test.mjs oronzo/systems/match-engine/tests/*.mjs` | **95 PASS / 0 FAIL**, inclusa QA engine su 100 seed e test di modulo/azioni/sostituzioni |
| Suite camera completa, `node --test oronzo/systems/match-view/*.test.mjs` | **34 PASS / 0 FAIL**, sottoinsieme della riga precedente |
| `node --test oronzo/assets/players/qa-atlas.test.mjs` | **4 PASS / 0 FAIL**, riproducibilità atlas/mask, 160 pose, look e palette |
| `python oronzo/assets/ui/qa/check_assets.py` | PASS, 10 PNG, tre atlanti, otto schermate e manifest |
| `node --check oronzo/assets/ui/demo-v02.js` | PASS |
| `node oronzo/content/validate-press.mjs` | PASS, **4.772 controlli**, 100 opening + 300 postmatch, 37/32 domande, 12 cronisti, 8 TV, 80 battute |
| `node oronzo/content/validate.mjs` | PASS, catalogo legacy e presidenti compatibili |
| Prova indipendente, 104 club e due stagioni complete | PASS, **76 periodi** contabilizzati con week+absoluteWeek+seasonYear, ogni club, retry respinti, save/load a ogni giornata, cassa/arretrati conservati, presidenti stabili, cap stipendi, mismatch rifiutato ed esonero dopo createCoach/save |
| Prove negative R04-1 e R04-3/4 | Riproduzioni confermate. Migrazione di shape legacy e di envelope V1/V2, tone mismatch, origin unknown, due delta distinti |
| Chromium UI, camera con asset, Android | **NON ESEGUITI**, limite ambiente e gate aperti |

La prova di due stagioni usa risultati **sintetici 0–0** accettati dalle API per isolare campionato/finanza, senza attribuirli al motore. Non certifica una carriera UI giocabile. I test delle 100 partite usano invece il motore effettivo.

Una prima asserzione della mia prova legacy cercava l'aumento degli arretrati, ma il club aveva liquidità sufficiente e il doppio costo riduceva la cassa. Corretta la sola prova temporanea per misurare cash−arrears. Il difetto è quindi confermato dal secondo pagamento di 486.000 ITL, senza modificare alcun sorgente produttivo.

## Gate grafici e limiti strumenti

Playwright è disponibile, ma il suo eseguibile Chromium non esiste. Il lancio ha restituito “Executable doesn't exist … chromium_headless_shell-1234”. Tentata l'installazione ufficiale `playwright install chromium --only-shell`, il download ha restituito un archivio 0 MiB/non valido con “End of central directory record signature not found”, poi “Failed to install browsers”. Non sono state sostituite prove browser con canvas mock per dichiarare superati i gate.

Esaminate visivamente la preview sprite 844×390 di #29 e la schermata avatar 640×360 consegnata da #33. Nella preview si distinguono due squadre e due portieri. Le immagini esistenti non provano la demo browser in questa sessione né l'approvazione artistica finale. #28/#29/#33 restano HOLD per la verifica pertinente richiesta dal mandato.

Per #34 l'approvazione è **tecnica del pacchetto dati/API**, con controllo editoriale di esempi e vincoli: selettori deterministici, risposte coerenti con esito, delta dichiarativi, limiti UI, dialetti non verificati bloccati. Il tono comico rimane soggetto alla revisione narrativa prevista. Non è un'approvazione finale dello stile, una clearance marchi o un'integrazione morale/stampa nel gioco. La demo browser del copy non è stata certificata.

I 500 comuni e i 5.000 cognomi rari verificati non sono consegnati in questo ciclo. In #31 sono dichiarati soltanto 20 cognomi comuni e la pipeline, con fonti/licenza riportate dall'agente. Non è stata effettuata ricerca esterna sui dataset in questo audit.

## Merge effettuato e verifica successiva

Unica operazione produttiva, sequenziale.

- PR **#34**, HEAD controllato immediatamente prima dell'azione `b74c376f1045e8b95c3cb4c5c21258a7df33087d`, REST clean, scope solo content e REPORT agente 04. Chiamata merge con expected_head_sha.
- GitHub ha restituito merged:true e SHA **b8976cb2b0129de9ee6537e1d624abce9ff1402f**.
- Riletto main dopo il merge, verificati **11/11 blob** della consegna identici a quelli testati. Rieseguiti entrambi i validatori copy/press, PASS.
- Nessun tentativo di merge di #30/#32 dopo il fallimento. Non esiste una verifica “dopo il primo/secondo merge” della coppia perché quei merge non sono avvenuti. Non eseguiti merge di #12/#27 né della PR di questo rapporto.

## Indicazioni per il prossimo ciclo dell'agente 10

1. Riportare a 07/09 R04-1/2, mantenere chiuso il gate del nuovo flow fino a suite combinata verde e migrazione legacy verificata. La parte nuova-carriera dei fix mostra già una prova positiva su 104 club, senza cancellare i difetti residui.
2. Richiedere a 06/08, con 09 per la persistenza, il contratto unico di R04-3/4 e il test di un singolo evento attraverso reload. Non introdurre due bonus o due registri indipendenti per la stessa applicazione.
3. Completare Chromium/QA visuale per #28/#29/#33 e il gate artistico separato di #12. Aggiornare i NEXT e autorizzare gli ulteriori cicli soltanto quando i rispettivi prerequisiti sono soddisfatti. #34 è disponibile su main per i futuri consumer, con revisione del tono ancora aperta.

## Riproduzione delle prove aggiuntive

Il seguente file temporaneo `r04-probes.mjs` va collocato alla root della sandbox che combina le versioni indicate nella tabella. Comando per il test completo `node --test r04-probes.mjs`. Le prove “defect reproduction” asseriscono la presenza del difetto, quindi PASS significa riproduzione riuscita. Il test completo a 104 club è stato eseguito una volta con PASS. Le prove negative sono state rieseguite dopo la correzione dell'asserzione economica sopra descritta.

<details>
<summary>Codice delle prove temporanee, non parte del gioco</summary>

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newCareer,fixturesForWeek,registerResult,advanceWeek,finishSeason,applyBoardDecision} from './oronzo/systems/career/career.js';
import {serialize,deserialize,migrateState} from './oronzo/systems/career/save.js';
import {createClub,createCoach,settleWeek,weeklyPayroll,conveneBoard,reviewMatch,book} from './oronzo/systems/coach-club/index.js';
import {generateSquad} from './oronzo/systems/attributes/generator.js';
import {applyShout} from './oronzo/systems/attributes/player-traits.js';
import {createMatch} from './oronzo/systems/match-engine/match-engine.js';
import {makeFixture} from './oronzo/systems/match-engine/fixtures.js';
import {collectCoachEffects} from './oronzo/systems/match-engine/coach-effects.js';
const catalog=JSON.parse(readFileSync(new URL('./oronzo/content/presidents.json',import.meta.url)));
const profiles=new Map(catalog.presidents.map(p=>[p.id,p]));
test('new combined API: 104 clubs, two full seasons, roundtrips and weekly retries',()=>{
 let s=newCareer({},42);assert.equal(s.clubs.length,104);
 s.clubs=s.clubs.map(c=>createClub(c,{presidentCatalog:catalog}));
 s.coach=createCoach(s.coach);s.coach.contract.until=1989;
 const identities=s.clubs.map(c=>c.presidentId),payroll=s.clubs.map(weeklyPayroll);
 const rounds=[];
 for(let year=0;year<2;year++){
  while(s.phase==='inSeason'){
   const period={week:s.week,absoluteWeek:s.absoluteWeek,seasonYear:s.seasonYear};
   for(let i=0;i<s.clubs.length;i++){
    const c=s.clubs[i],profile=profiles.get(c.presidentId);
    assert(profile);assert(payroll[i]>0);assert(payroll[i]<=c.wageBudget);
    const meeting=conveneBoard(c,profile,{...period,seed:42});assert(meeting.accepted);
    const r=settleWeek(meeting.club,period);assert(r.accepted);
    assert.equal(settleWeek(r.club,period).reason,'week_already_settled');
    assert.equal(conveneBoard(r.club,profile,period).reason,'already_met_this_week');
    assert(r.club.budget>=0);assert(r.club.finance.arrears>=0);s.clubs[i]=r.club;
   }
   rounds.push(period.absoluteWeek);
   for(const f of fixturesForWeek(s))registerResult(s,{fixtureId:f.id,score:{home:0,away:0},events:[]});
   advanceWeek(s);const frozen=JSON.stringify(s.clubs.map(c=>c.finance));
   s=deserialize(serialize(s));assert.equal(JSON.stringify(s.clubs.map(c=>c.finance)),frozen);
  }
  finishSeason(s);s=deserialize(serialize(s));assert.deepEqual(s.clubs.map(c=>c.presidentId),identities);
 }
 assert.equal(s.history.length,2);assert.equal(new Set(rounds).size,rounds.length);
 const c=s.clubs[0],p=profiles.get(c.presidentId),other=catalog.presidents.find(x=>x.id!==p.id);
 assert.equal(conveneBoard(c,other,{week:1,absoluteWeek:s.absoluteWeek,seasonYear:s.seasonYear}).reason,'president_mismatch');
 assert.equal(book(c,{type:'expense',amount:c.budget+1}).accepted,false);
 assert.throws(()=>book(c,{type:'expense',amount:-1}));
 applyBoardDecision(s,{type:'dismiss',clubId:s.coach.clubId});
 s=deserialize(serialize(s));assert.equal(s.coach.clubId,null);assert.equal(s.coach.employmentHistory.at(-1).reason,'dismissed');
 console.log('104-club full seasons, periods',rounds.length,'PASS');
});
test('defect reproduction: legacy paid week becomes payable under new absolute key',()=>{
 let s=newCareer({leagueSizes:{PROM:2,INTER:2,C2:2,C1:2,B:2,A:2}},42);
 const id=s.coach.clubId,idx=s.clubs.findIndex(c=>c.id===id);
 s.clubs[idx]=createClub(s.clubs[idx],{presidentCatalog:catalog});
 s.clubs[idx]=settleWeek(s.clubs[idx],{week:1}).club;
 delete s.absoluteWeek;const before=s.clubs[idx].finance.cash-s.clubs[idx].finance.arrears;
 s=migrateState(s);s=deserialize(serialize(s));
 const repeated=settleWeek(s.clubs[idx],{week:s.week,absoluteWeek:s.absoluteWeek,seasonYear:s.seasonYear});
 assert.equal(repeated.accepted,true);assert.equal(before-(repeated.club.finance.cash-repeated.club.finance.arrears),weeklyPayroll(repeated.club));
 console.log('legacy duplicate economic position',before,'->',repeated.club.finance.cash-repeated.club.finance.arrears,'keys',repeated.club.finance.settledWeeks);
});
test('defect reproduction: real V1/V2 save envelopes repeat legacy payment after import',()=>{
 for(const version of [1,2]){
  let s=newCareer({leagueSizes:{PROM:2,INTER:2,C2:2,C1:2,B:2,A:2}},42);
  const i=s.clubs.findIndex(c=>c.id===s.coach.clubId);
  s.clubs[i]=createClub(s.clubs[i]);s.clubs[i]=settleWeek(s.clubs[i],{week:1}).club;
  const cash=s.clubs[i].budget;delete s.absoluteWeek;s.schemaVersion=version;
  const raw=JSON.stringify(s);let h=2166136261;
  for(let j=0;j<raw.length;j++){h^=raw.charCodeAt(j);h=Math.imul(h,16777619);}
  s=deserialize(JSON.stringify({kind:'ORONZO_CAREER',version,sequence:1,checksum:(h>>>0).toString(16).padStart(8,'0'),data:s}));
  const r=settleWeek(s.clubs[i],{week:s.week,absoluteWeek:s.absoluteWeek,seasonYear:s.seasonYear});
  assert(r.accepted);assert.equal(cash-r.club.budget,weeklyPayroll(r.club));
  console.log('V'+version+' envelope replay',cash,'->',r.club.budget);
 }
});
test('defect reproduction: Player08 origin unknown to Engine06, tone mismatch and divergent ledgers',()=>{
 const input=makeFixture(42);
 for(const side of ['home','away']){
  input[side+'Club'].players=generateSquad({seed:42,teamId:input[side+'Club'].id,origins:[{comune:'Napoli',regione:'Campania'}]});
  input[side+'XI']=input[side+'Club'].players.slice(0,11).map(p=>p.id);
  input[side+'Bench']=input[side+'Club'].players.slice(11).map(p=>p.id);
 }
 const match=createMatch(input),target=input.homeClub.players[9],coachOrigin={regionId:'campania',macroRegion:'south'};
 const r=match.command({type:'shout',teamId:input.homeClub.id,payload:{targetPlayerId:target.id,tone:'encourage',coachOrigin}});assert(r.accepted);
 const event=match.getEventsSince().find(e=>e.type==='coach_shout');assert(event);
 assert.equal(event.detail.affinity,'unknown');
 assert.throws(()=>applyShout(target,{tone:'encourage',eventId:'match:1',coachOrigin:target.origin}));
 const a=applyShout(target,{tone:'gentle',eventId:'match:'+event.id,coachOrigin:target.origin});
 const bridge=collectCoachEffects([event],[],{matchId:'match'});
 assert.equal(a.applied,true);assert.equal(bridge.effects.length,1);
 assert.equal(a.player.temporaryEffects.length,1);assert.equal(event.detail.temporaryEffect.expiresAt,150);
 const reloaded=JSON.parse(JSON.stringify(a.player));
 assert.equal(collectCoachEffects([event],reloaded.coachInteractionIds,{matchId:'match'}).effects.length,0);
 console.log('engine affinity',event.detail.affinity,'08 trust delta',a.effects.coachTrustDelta,'06 suggested delta',bridge.effects[0].playerTrustDelta);
});
```

</details>
