# ORONZO — Audit R05, gate PR #30 e #32

**7 novembre 2026. Esito complessivo FIX_REQUESTED. Nessun merge eseguito.**

L'utente ha autorizzato i merge R05 soltanto dopo superamento dei test. La suite nativa combinata produce **76 PASS / 1 FAIL**, quindi il gate rimane chiuso. Il solo difetto rilevato in questa revisione è un test preesistente dell'agente 07 ancora basato sulla vecchia convenzione dei periodi.

## Versioni verificate

| Fonte | SHA | Stato della decisione |
|---|---|---|
| main iniziale e finale | `85d7a932ad97e7856fd61b26c3e24b36837de128` | invariato durante R05 |
| PR #30, agente 07 | `f098b5474801171f55e451889eca8c65653000f3` | FIX_REQUESTED, aggiornare il test incrociato |
| PR #32, agente 09 | `89bb4944e6c6fc78ad9164c8e0d899355ec9d67f` | HOLD, attesa suite combinata verde con #30 |

Letti REQUEST R05, RUN aggiornato, NEXT 07/09, REPORT e codice effettivo dei due HEAD. Sandbox ricostruita con i moduli career/coach-club di main sovrapposti esattamente alle due PR, più catalogo reale presidents.json. **39/39 file** confrontati tramite git hash-object, SHA identici ai blob recuperati da GitHub. Nessun mock dei moduli.

Diff #30 limitato a systems/career e REPORT 07. Diff #32 limitato a systems/coach-club e REPORT 09. Gli HEAD coincidono con gli snapshot del REQUEST. REST consultato di nuovo dopo i test, entrambi open/non-draft, mergeable=true e mergeable_state=clean, nessun check-run o commit status configurato. L'assenza di conflitti non risolve il fallimento della suite.

## Test realmente eseguiti

Node **v24.22.1**.

```sh
node --test oronzo/systems/career/tests/*.mjs oronzo/systems/coach-club/*.test.js
```

**77 test, 76 passati, 1 fallito, 0 saltati**, durata circa 31,75 s.

Sono passati, sulla stessa sandbox combinata:

- Test R04 anti-doppio payroll, incluso il precedente caso 486.000 ITL. Gli envelope V1/V2 con checksum valido convertono [1] in ['a:1']; il retry viene rifiutato e il saldo conservato.
- Migrazione di transazioni, verbali, eventi/cooldown, promesse e scadenze a cavallo di stagione. Provenienza documentata negli anni precedenti, conversione idempotente e storico originale conservato.
- Rifiuto PERIOD_MIGRATION_AMBIGUOUS in assenza di stagione dimostrabile, senza mutazione dei record. I test del save manager preservano byte A/B e puntatore, impedendo di sovrascrivere la copia legacy bloccata.
- period-r04.test.js completo, compreso il test esteso con **104 club × due stagioni, 76 periodi e 7.904 liquidazioni**. Ogni periodo usa {week,absoluteWeek,seasonYear}. Save/load a ogni giornata, confronto dell'intero stato finanziario, retry di paghe e meeting respinti, presidenti stabili, payroll entro tetto, cassa/arretrati non negativi ed esonero dopo createCoach/save/load.
- Contratti e stipendi generati reali, presidenti del catalogo, rifiuto di profili sbagliati, obiettivi e alias/soglie, importi monetari invalidi e overflow, history/hiredSeason/until, rinnovi, esoneri e reingaggi nei casi delle suite.
- Il test di #32 che in R04 si aspettava 1.600 ITL ora passa usando il payroll contrattuale effettivo.

Le partite della prova carriera multi-stagione usano esiti **sintetici 0–0**, per isolare campionato e società. Nessuna partita del match engine o prova browser è stata eseguita in R05. Le altre PR sono rimaste fuori dalla revisione.

## Unico blocco — R05-1, P1 di accettazione della PR #30

**Verificato in esecuzione. Proprietario agente 07.**

File [oronzo/systems/career/tests/r02-cross.test.mjs](https://github.com/CzekUns/cercax/blob/f098b5474801171f55e451889eca8c65653000f3/oronzo/systems/career/tests/r02-cross.test.mjs#L16), test “R02 career + real Agent09 finance: two seasons, salary, saved absolute weeks and retries”.

Le righe 23–31 salvano absoluteWeek in un numero period, poi chiamano settleWeek(club,{week:period}), aspettandosi accepted:true e un registro numerico. La riga 35 effettua serialize/deserialize. La nuova serialize migra il registro in chiavi a:N. Alla successiva iterazione il test invia ancora soltanto week, quindi il guard dell'agente 09 risponde correttamente **accepted:false / period_migration_required**. L'asserzione a riga 28 fallisce con **false !== true**.

Riferimenti della catena:

- [save.js, serialize](https://github.com/CzekUns/cercax/blob/f098b5474801171f55e451889eca8c65653000f3/oronzo/systems/career/save.js#L58) converte i ledger prima della scrittura.
- [finance.js, settleWeek](https://github.com/CzekUns/cercax/blob/89bb4944e6c6fc78ad9164c8e0d899355ec9d67f/oronzo/systems/coach-club/finance.js#L76) rifiuta un dominio legacy diverso da quello già presente.
- [r02-cross.test.mjs, verifiche dopo rollover](https://github.com/CzekUns/cercax/blob/f098b5474801171f55e451889eca8c65653000f3/oronzo/systems/career/tests/r02-cross.test.mjs#L41) contiene altre aspettative obsolete sui domini numerici.

**Comportamento atteso** il test di integrazione usa il contratto corrente della carriera per ogni pagamento e retry e completa entrambe le stagioni.

**Correzione precisa proposta all'agente 07**

1. Costruire period come {week:s.week,absoluteWeek:s.absoluteWeek,seasonYear:s.seasonYear} e passare lo stesso oggetto a settleWeek.
2. Salvare allKeys come numeri absoluteWeek e confrontare settledWeeks con 'a:'+period.absoluteWeek.
3. Adeguare le verifiche del rollover. La chiamata con solo week a un ledger assoluto deve produrre period_migration_required. La chiamata corretta con tutti e tre i campi deve essere accettata per il nuovo periodo, poi rifiutata al retry.
4. Conservare i controlli su salari, saldi, unicità, due stagioni e reload. Mantenere i casi legacy nei test di migrazione già dedicati, senza indebolire il guard produttivo.
5. Rieseguire **tutta** la suite combinata pubblicata sopra e aggiornare la stessa PR #30 e REPORT.

Il test completo a 104 club è già passato con il contratto corretto. Il blocco rimasto riguarda l'adeguamento della prova R02 al contratto ora imposto dalle due implementazioni.

### Riproduzione minima indipendente

Eseguita dalla root della sandbox combinata:

```js
import {newCareer} from './oronzo/systems/career/career.js';
import {serialize,deserialize} from './oronzo/systems/career/save.js';
import {initializeFinances,settleWeek} from './oronzo/systems/coach-club/finance.js';

let s=newCareer({
  leagueSizes:{PROM:2,INTER:2,C2:2,C1:2,B:2,A:2}
},70);
s.clubs=s.clubs.map(c=>initializeFinances(c));
s.clubs[0]=settleWeek(s.clubs[0],{week:s.absoluteWeek}).club;
console.log(s.clubs[0].finance.settledWeeks); // [1]
s=deserialize(serialize(s));
console.log(s.clubs[0].finance.settledWeeks); // ['a:1']
console.log(settleWeek(s.clubs[0],{week:2}).reason);
// period_migration_required
console.log(settleWeek(s.clubs[0],{
  week:2,absoluteWeek:2,seasonYear:s.seasonYear
}).accepted); // true
```

Output osservato conforme ai commenti. Il registro rifiuta il vecchio dominio e accetta il periodo nel formato corretto.

## Decisione sui merge e sul ciclo successivo

**Nessuna chiamata merge effettuata.** #30 è FIX_REQUESTED per R05-1. #32 rimane HOLD come parte della coppia, in attesa del completamento del gate richiesto. Non esistono SHA merge R05 né test post-merge da dichiarare.

L'agente 10 può trasmettere la correzione mirata al 07. Il nuovo ciclo game-flow del 07 resta **non autorizzabile secondo questo gate**, finché la suite non sarà interamente verde e i due merge realmente verificati. Le correzioni R04-1 e R04-2 risultano invece superate nei casi eseguiti e non vengono riproposte come difetti attuali.

Il 00 non ha modificato sorgenti, NEXT, contratti, registry o le PR degli agenti. Il presente rapporto è l'unico nuovo documento. La delega condizionata R05 termina con questa consegna.
