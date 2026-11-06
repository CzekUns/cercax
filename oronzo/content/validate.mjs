#!/usr/bin/env node
// ORONZO content-only checks. Run: node oronzo/content/validate.mjs
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import assert from "node:assert/strict";
const here=dirname(fileURLToPath(import.meta.url));
const read=(name)=>JSON.parse(readFileSync(join(here,name),"utf8"));
const chars=read("characters.json").characters;
const events=read("events.json").events;
const micro=read("microcopy.json").entries;
const dialogues=read("dialogues.json").dialogues;
const source=readFileSync(join(here,"narrative-engine.js"),"utf8");
const engine=await import("data:text/javascript;base64,"+Buffer.from(source).toString("base64"));
const limits={notice:110,ticker:65,headline:55,subhead:140,commentary:110,dialogue:180,choice_label:38};
const keySet=new Set(engine.supportedTriggers);
const effectSet=new Set(engine.supportedEffects);
const targets=new Set(["all","starters","reserves","strikers"]);
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message);};
const unique=(xs,label)=>check(new Set(xs.map(x=>x.id)).size===xs.length,label+" IDs duplicati");
for(const [k,a,n] of [["personaggi",chars,12],["eventi",events,40],["microcopy",micro,80],["dialoghi",dialogues,20]]){
 check(a.length>=n,k+": minimo "+n+" richiesto");unique(a,k);
}
const charIds=new Set(chars.map(c=>c.id)),voices=new Set;
for(const c of chars){
 check(c.name && c.role && c.goal && c.flaw && c.voice,"scheda incompleta "+c.id);
 check(Array.isArray(c.lines)&&c.lines.length>=2,"battute mancano "+c.id);
 for(const relation of c.relations||[])check(charIds.has(relation),"relazione sconosciuta "+c.id+" -> "+relation);
 for(const line of c.lines||[])check(line.length<=limits.dialogue,"personaggio lungo "+c.id);
 voices.add(c.voice);
}
check(voices.size>=12,"voci poco differenziate");
const validateTriggers=(o,origin)=>{
 for(const [key,value] of Object.entries(o||{})){
  check(keySet.has(key),"trigger sconosciuto "+origin+" "+key);
  check(key==="lastResult"?["win","draw","loss"].includes(value):key==="trainingDone"?typeof value==="boolean":Number.isFinite(value),"trigger malformato "+origin+" "+key);
 }
};
const variantsCount=dialogues.reduce((n,d)=>n+d.variants.length,0);
let futureEffects=0;
for(const e of events){
 check(charIds.has(e.speakerId),"speaker evento mancante "+e.id);
 check(e.channel==="dialogue","canale evento "+e.id);
 check(e.title.length<=55 && e.body.length<=limits.dialogue,"testo evento lungo "+e.id);
 check(Number.isFinite(e.weight)&&e.weight>0,"peso "+e.id);
 check(Number.isInteger(e.cooldownWeeks)&&e.cooldownWeeks>=1,"cooldown "+e.id);
 check(typeof e.oncePerSeason==="boolean","oncePerSeason "+e.id);
 check(Array.isArray(e.tags)&&e.tags.length>0,"tag assenti "+e.id);
 check(Array.isArray(e.choices)&&e.choices.length===2,"scelte "+e.id);
 validateTriggers(e.triggers,e.id);
 for(const body of e.variants||[])check(body.length<=limits.dialogue,"variante lunga "+e.id);
 const cids=new Set;
 for(const c of e.choices||[]){
  check(!cids.has(c.id),"scelta ID ripetuta "+e.id);cids.add(c.id);
  check(c.label.length<=limits.choice_label,"etichetta lunga "+e.id);
  check(targets.has(c.target),"target non supportato "+e.id);
  check(Object.keys(c.effects||{}).length>=1,"nessun effetto attuale "+e.id);
  for(const [key,value] of Object.entries(c.effects||{}))check(effectSet.has(key)&&Number.isInteger(value)&&Math.abs(value)<=3,"effetto attuale fuori contratto "+e.id+" "+key);
  for(const [key,value] of Object.entries(c.futureEffects||{})){futureEffects++;check(!effectSet.has(key)&&Number.isInteger(value)&&Math.abs(value)<=3,"effetto futuro non dichiarato "+e.id+" "+key);}
 }
}
const texts=new Set;
for(const m of micro){
 check(Boolean(limits[m.channel]),"canale micro sconosciuto "+m.id);
 check(m.text.length<=limits[m.channel],"microcopy lungo "+m.id);
 check(!texts.has(m.text),"microcopy duplicato "+m.id);texts.add(m.text);
 check(Number.isInteger(m.cooldownWeeks)&&m.cooldownWeeks>=0,"cooldown micro "+m.id);
 check(m.category&&Array.isArray(m.tags),"contesto micro "+m.id);
 validateTriggers(m.when,m.id);
}
for(const d of dialogues){
 check(Number.isInteger(d.cooldownWeeks)&&d.cooldownWeeks>=1,"cooldown dialogo "+d.id);
 check(d.scene&&d.variants.length>=2,"varianti dialogo "+d.id);
 const vids=new Set;
 for(const variant of d.variants){
  check(!vids.has(variant.id),"variante dialogo duplicata "+d.id);vids.add(variant.id);
  check(variant.lines.length>=2&&variant.lines.length<=5,"lunghezza scena "+d.id);
  validateTriggers(variant.when,d.id);
  for(const l of variant.lines){
   check(charIds.has(l.speakerId),"speaker dialogo mancante "+d.id);
   check(l.text.length<=limits.dialogue,"battuta lunga "+d.id);
  }
 }
}
const forbidden=/\b(Oronzo Canà|Longobarda|Aristoteles|Bi-zona|VAR|smartphone|social media|streaming|WhatsApp|Instagram|TikTok)\b/i;
for(const [category,values] of [["personaggi",chars],["eventi",events],["microcopy",micro],["dialoghi",dialogues]]){
 check(!forbidden.test(JSON.stringify(values)),"riferimento protetto o anacronistico in "+category);
}
const sample={week:8,trainingDone:false,players:Array.from({length:16},(_,i)=>({id:i,starter:i<11,role:i===9||i===10?"ATT":i===0?"POR":"CEN",morale:55,confidence:62,health:81,fatigue:31,luck:35,character:80})),
table:[{name:"Campanile",pt:3,gf:3,ga:8},{name:"Rivale",pt:13,gf:10,ga:2},{name:"Altro",pt:9,gf:8,ga:4}]};
const mem=engine.makeMemory();
const metrics=engine.deriveMetrics(sample);
check(engine.matchConditions({teamLuckBelow:45,teamCharacterAbove:75,standingsPositionAbove:2},metrics),"trigger derivati errati");
check(!engine.matchConditions({futureBadKey:2},metrics),"trigger ignoti accettati");
let calls=0;const rng=()=>{calls++;return .47};
const a=engine.selectEvent(events,sample,mem,rng);
check(Boolean(a),"selezione eventi impossibile");check(calls===1,"estrazione RNG non singola");
const b=engine.selectEvent(events,sample,mem,()=>.47);
check(!b || b.event.id!==a.event.id,"evento ripetuto in cooldown");
const option={target:"all",effects:{morale:2,fatigue:-1},futureEffects:{clubCash:-1}};
const edited=engine.applyChoice(sample,option);
check(sample.players[0].morale===55 && edited.state.players[0].morale===57,"effetto o immutabilità non corretti");
check(edited.state.table===sample.table,"la scelta non deve toccare la classifica");
check(edited.deferred.clubCash===-1,"effetto futuro perso");
check(Boolean(engine.selectMicrocopy(micro,"cartelli",sample,mem,()=>.2)),"microcopy non selezionabile");
check(Boolean(engine.selectDialogue(dialogues,"locker",sample,mem,()=>.2)),"dialogo non selezionabile");
engine.resetSeason(mem);check(Object.keys(mem.eventsSeen).length===0,"reset cooldown stagionale");
if(failures.length){
 console.error("ERRORI ORONZO:",failures.length);
 for(const f of failures)console.error(" - "+f);
 process.exitCode=1;
}else{
 console.log("ORONZO COPY: OK");
 console.log(JSON.stringify({characters:chars.length,events:events.length,microcopy:micro.length,dialogues:dialogues.length,dialogueVariants:variantsCount,futureEffectReferences:futureEffects,runtimeChecks:"OK"},null,2));
}
