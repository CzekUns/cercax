import test from 'node:test';
import assert from 'node:assert/strict';
import {createRng} from '../rng.js';
import {normalizePlayer,validatePlayer} from '../player-model.js';
import {generatePlayer,generateSquad,generatePlayers} from '../generator.js';
import {normalizeOrigin,REGION_MACRO,regionAffinity,DEMO_ORIGINS} from '../geography.js';
import {loadSurnameCSV,chooseSurname} from '../surnames.js';
import {analyzeDisposition,previewShout,applyShout} from '../player-traits.js';
import {effectiveAbility,trainingInjuryProbability} from '../personality.js';
import {applyTrainingWeek} from '../training.js';
import {readFileSync} from 'node:fs';

const csv=readFileSync(new URL('../data/surname-sample.csv',import.meta.url),'utf8');
const source=JSON.parse(readFileSync(new URL('../data/surname-sample.source.json',import.meta.url),'utf8'));
const catalog=()=>loadSurnameCSV(csv,{source});
const player=()=>generatePlayer({seed:91,role:'FW',teamId:'campanile',index:1});
test('canonical PlayerV1 remains valid with five documented 0..100 character extensions',()=>{
 const p=normalizePlayer({name:'Gianni Test',mental:{pazzia:140,spericolatezza:-5,coraggio:85,suscettibilita:78,impulsivita:95}});
 assert.equal(p.mental.pazzia,100);assert.equal(p.mental.spericolatezza,0);
 assert.equal(p.mental.coraggio,85);assert.equal(p.mental.suscettibilita,78);assert.equal(p.mental.impulsivita,95);
 assert.ok(validatePlayer(p).valid);
});
test('legacy player remains anonymous geographically rather than faking a birthplace',()=>{
 const p=normalizePlayer({id:7,name:'Vecchio Test',role:'CEN',tech:60});
 assert.equal(p.origin,null);assert.equal(p.surname,null);assert.equal(p.technical.control,60);
 assert.equal(p.relationships.coachTrust,50);
});
test('regional mapping covers exactly 20 regions; islands and Abruzzo/Molise are Sud',()=>{
 assert.equal(Object.keys(REGION_MACRO).length,20);
 for(const r of ['Sicilia','Sardegna','Abruzzo','Molise'])assert.equal(REGION_MACRO[r],'Sud');
 for(const o of DEMO_ORIGINS) assert.equal(normalizeOrigin(o).macroregione,REGION_MACRO[o.regione]);
 assert.deepEqual(normalizeOrigin({city:'Aosta',region:"Valle d'Aosta"}),{comune:'Aosta',regione:'Valle d’Aosta',macroregione:'Nord'});
 assert.throws(()=>normalizeOrigin({comune:'Napoli',regione:'Campania',macroregione:'Nord'}),RangeError);
 assert.throws(()=>normalizeOrigin({comune:'Roma',regione:'Atlantide'}),RangeError);
});
test('regional affinity is same region > same macroregion > elsewhere > unknown',()=>{
 const camp={comune:'Napoli',regione:'Campania'}, pug={comune:'Bari',regione:'Puglia'};
 const laz={comune:'Roma',regione:'Lazio'};
 const one=regionAffinity(camp,{comune:'Salerno',regione:'Campania'}).strength;
 const two=regionAffinity(camp,pug).strength,three=regionAffinity(camp,laz).strength;
 assert.ok(one>two&&two>three);assert.equal(regionAffinity(null,camp).strength,0);
});
test('catalog takes real documented frequency and sorts least frequent first, no invented ranking',()=>{
 const c=catalog();
 assert.equal(c.surnames.length,20);assert.equal(c.source.license,'CC BY-SA 4.0');
 assert.equal(c.surnames[0].name,'Barbieri');assert.equal(c.surnames.at(-1).name,'Rossi');
 assert.equal(c.surnames[0].rarityOrder,1);assert.equal(c.metric,'frequency');
 assert.equal(c.stats.duplicateRows,0);
});
test('catalog import handles CSV escaping, duplicates, variants, and other countries',()=>{
 const s='name,frequency,country_code,variant_of\n"De Rossi",2,IT,\n"De Rossi",2,IT,\n"DeRossi",,IT,"De Rossi"\nSmith,1,US,\nFerri,3,IT,\n';
 const c=loadSurnameCSV(s,{source,limit:2});
 assert.equal(c.stats.duplicateRows,1);assert.equal(c.stats.skippedCountries,1);
 assert.deepEqual(c.surnames[0].variants,['DeRossi']);
 assert.equal(c.surnames.length,2);
});
test('catalog rejects missing/invalid license, fabricated frequency and conflicting duplicates',()=>{
 assert.throws(()=>loadSurnameCSV('name\nRossi\n',{source}),/rank/i);
 assert.throws(()=>loadSurnameCSV('name,frequency\nRossi,0\n',{source}),RangeError);
 assert.throws(()=>loadSurnameCSV('name,frequency\nRossi,1\nRossi,2\n',{source}),/Conflicting/);
 assert.throws(()=>loadSurnameCSV('name,rank\nRossi,1\n',{source:{...source,license:'unknown'}}),/license/);
 assert.throws(()=>loadSurnameCSV('name,rank\nRossi,1\n',{source,limit:5001}),RangeError);
});
test('5000 rarest can be selected deterministically from larger documented ranked input (synthetic test ONLY)',()=>{
 let s='name,rank,country_code\n';
 const letters=i=>{let s='';do{s=String.fromCharCode(65+(i%26))+s;i=Math.floor(i/26);}while(i>0);return s;};
 for(let i=1;i<=5100;i++)s+=`Azz${letters(i)},${i},IT\n`;
 const c=loadSurnameCSV(s,{source,limit:5000});
 assert.equal(c.surnames.length,5000);assert.equal(c.surnames[0].rank,5100);
 assert.equal(c.surnames.at(-1).rank,101);
 assert.deepEqual(chooseSurname(c,createRng(10)),chooseSurname(c,createRng(10)));
});
test('generated roster uses documented surnames and regional identities, stable through JSON save/load',()=>{
 const options={seed:1979,teamId:'campanile',surnameCatalog:catalog()};
 const a=generateSquad(options);
 assert.equal(a.length,22);assert.deepEqual(a,generateSquad(options));
 assert.equal(new Set(a.map(p=>p.id)).size,22);
 assert.ok(a.every(p=>p.origin && p.origin.macroregione===REGION_MACRO[p.origin.regione]));
 assert.ok(a.every(p=>options.surnameCatalog.surnames.some(s=>s.name===p.surname)));
 assert.ok(a.every(p=>p.name.endsWith(p.surname)));
 assert.ok(a.every(p=>p.surnameSourceId===source.id));
 assert.deepEqual(JSON.parse(JSON.stringify(a)),a);
 assert.ok(a.every(p=>validatePlayer(p).valid));
});
test('multi-team generation has no ID collisions and trait combinations vary',()=>{
 const p=[...generatePlayers(100,{seed:7,teamId:'a'}),...generatePlayers(100,{seed:7,teamId:'b'})];
 assert.equal(new Set(p.map(x=>x.id)).size,200);
 assert.ok(new Set(p.map(x=>x.mental.pazzia)).size>25);
 assert.ok(new Set(p.map(x=>x.mental.spericolatezza)).size>25);
});
test('disposition influences risky choices and adherence without changing raw shooting',()=>{
 const low=player(), high=structuredClone(low);
 low.mental.pazzia=0;low.mental.spericolatezza=0;low.mental.impulsivita=0;
 high.mental.pazzia=100;high.mental.spericolatezza=100;high.mental.impulsivita=100;
 assert.equal(low.technical.shooting,high.technical.shooting);
 assert.ok(analyzeDisposition(high).riskPreference>analyzeDisposition(low).riskPreference);
 assert.ok(analyzeDisposition(high).orderCompliance<analyzeDisposition(low).orderCompliance);
 assert.ok(effectiveAbility(high,{skill:'shooting',riskyAction:true}).effective<
  effectiveAbility(low,{skill:'shooting',riskyAction:true}).effective);
});
test('recklessness and pazzia change fatigue/risk probabilities, not certainties',()=>{
 const calm=player(),wild=structuredClone(calm);
 calm.mental.spericolatezza=5;calm.mental.pazzia=5;
 wild.mental.spericolatezza=95;wild.mental.pazzia=95;
 assert.ok(trainingInjuryProbability(wild,85)>trainingInjuryProbability(calm,85));
 assert.ok(trainingInjuryProbability(wild,85)<1);
 assert.ok(applyTrainingWeek([wild],'athletic',{seed:2}).players[0].status.fatigue>=
  applyTrainingWeek([calm],'athletic',{seed:2}).players[0].status.fatigue);
});
test('same-region shout response stronger than same macroregion, both greater than elsewhere',()=>{
 const p=player();p.origin={comune:'Napoli',regione:'Campania',macroregione:'Sud'};
 const base={tone:'gentle',coachLeadership:55};
 const local=previewShout(p,{...base,coachOrigin:{comune:'Salerno',regione:'Campania'}});
 const macro=previewShout(p,{...base,coachOrigin:{comune:'Bari',regione:'Puglia'}});
 const away=previewShout(p,{...base,coachOrigin:{comune:'Roma',regione:'Lazio'}});
 assert.ok(local.moraleDelta>macro.moraleDelta);
 assert.ok(macro.moraleDelta>away.moraleDelta);
});
test('harsh correction has a meaningful downside for susceptible impulsive characters',()=>{
 const p=player(),steady=structuredClone(p);
 p.mental.suscettibilita=95;p.mental.impulsivita=95;p.mental.discipline=5;
 steady.mental.suscettibilita=5;steady.mental.impulsivita=5;steady.mental.discipline=95;
 assert.ok(previewShout(p,{tone:'hard'}).moraleDelta<previewShout(steady,{tone:'hard'}).moraleDelta);
});
test('shout is idempotent by eventId and persists trust/morale and temporary effects through JSON',()=>{
 const p=player();
 const options={eventId:'match-x-14',tone:'gentle',t:1200,coachOrigin:{comune:'Napoli',regione:'Campania'}};
 const first=applyShout(p,options);assert.equal(first.applied,true);
 const revived=JSON.parse(JSON.stringify(first.player));
 const duplicate=applyShout(revived,options);
 assert.equal(duplicate.applied,false);assert.deepEqual(duplicate.player,revived);
 assert.notEqual(first.player.relationships.coachTrust,p.relationships.coachTrust);
 assert.equal(first.player.temporaryEffects.length,1);
 assert.equal(first.player.temporaryEffects[0].expiresAt,1380);
 assert.throws(()=>applyShout(p,{...options,eventId:''}),/eventId/);
});
test('temporary boost modifies ability only during its declared 180s validity window',()=>{
 const p=player(),next=applyShout(p,{eventId:'m1',t:300,tone:'gentle'});
 const early=effectiveAbility(next.player,{skill:'shooting',t:330}).effective;
 const late=effectiveAbility(next.player,{skill:'shooting',t:481}).effective;
 assert.ok(early>late);assert.ok(next.effects.temporaryPerformanceBonus>0);
});
test('a real source is required and a later load never silently overwrites player origin',()=>{
 const p=player(),legacy=normalizePlayer(p);
 assert.deepEqual(legacy.origin,p.origin);
 assert.equal(legacy.surname,p.surname);
 assert.deepEqual(legacy.coachInteractionIds,p.coachInteractionIds);
 assert.throws(()=>loadSurnameCSV('name,rank\nRossi,1',{source:null}),TypeError);
});

