#!/usr/bin/env node
// Run from repository root: node oronzo/content/validate-press.mjs
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {
  PRESS_EFFECT_KEYS, CONTEXT_KEYS, seededRng, seededShuffle, seedHash,
  buildPressRoster, matchesPressContext, selectConferenceQuestions,
  createPressConference, answerPressConference, pickIndividualShout
} from "./press-kit.js";
const here=dirname(fileURLToPath(import.meta.url));
const read=(n)=>JSON.parse(readFileSync(join(here,n),"utf8"));
const opening=read("press-opening.json"),post=read("press-postmatch.json"),
 media=read("press-media.json"),shouts=read("individual-shouts.json");
const chars=read("characters.json"),presidents=read("presidents.json");
let checks=0;
function test(condition,message){assert.ok(condition,message);checks++;}
function unique(items,label){test(new Set(items.map(x=>x.id)).size===items.length,label+" unique IDs");}
test(opening.questions.length>=30,"opening question count");
test(post.questions.length>=20,"postmatch question count");
test(media.journalists.length>=12,"journalists count");
test(media.broadcasters.length>=8,"broadcasters count");
test(shouts.shouts.length>=40,"shouts count");
test(presidents.presidents.length===8,"existing president IDs stable");
unique(opening.questions,"opening");unique(post.questions,"postmatch");
unique(media.journalists,"journalists");unique(media.broadcasters,"broadcasters");
unique(shouts.shouts,"shouts");
test(new Set([...opening.questions,...post.questions].map(x=>x.id)).size===opening.questions.length+post.questions.length,
 "no overlapping opening/post IDs");
const allowed=new Set(CONTEXT_KEYS),effectSet=new Set(PRESS_EFFECT_KEYS);
for(const [phase,arr] of [["opening",opening.questions],["postmatch",post.questions]]){
  for(const q of arr){
    test(q.phase===phase,"phase mismatch "+q.id);
    test(q.text.length>0&&q.text.length<=180,"question UI length "+q.id);
    test(Number.isInteger(q.weight)&&q.weight>=1,"question weight "+q.id);
    test(q.answers.length>=3,"three choices "+q.id);
    unique(q.answers,"answers "+q.id);
    for(const [k,v] of Object.entries(q.when||{})){
      test(allowed.has(k),"unknown trigger "+q.id+" "+k);
      test((k.endsWith("Below")||k.endsWith("Above")||k==="lossStreakMin")?
        typeof v==="number":typeof v==="string"||typeof v==="boolean","bad trigger value "+q.id);
    }
    for(const a of q.answers){
      test(a.label.length<=38&&a.text.length<=180,"choice UI lengths "+q.id);
      test(Object.keys(a.effects).length===4,"effects must have exactly four keys "+q.id);
      for(const [key,delta] of Object.entries(a.effects)){
        test(effectSet.has(key),"unsupported effect "+key);
        test(Number.isInteger(delta)&&Math.abs(delta)<=3,"semantic delta range "+q.id+" "+key);
      }
    }
  }
}
for(const j of media.journalists){
  test(j.fixedName===null||typeof j.fixedName==="string","journalist naming "+j.id);
  test(["f","m"].includes(j.nameGender),"journalist nameGender "+j.id);
  if(j.characterRef)test(chars.characters.some(c=>c.id===j.characterRef),"canonical journalist missing "+j.id);
}
for(const s of media.broadcasters){
  test(s.fictional===true,"fictional station "+s.id);
  test(s.tagline.length<=65&&s.name.length<=38,"station name/short line "+s.id);
}
for(const line of shouts.shouts){
  test(line.target==="single_player"&&line.language==="it-IT","shout target/language "+line.id);
  test(line.text.length<=110,"shout long "+line.id);
  test(Number.isInteger(line.intensity)&&line.intensity>=1&&line.intensity<=3,"shout intensity "+line.id);
  test(["encourage","reprimand"].includes(line.intent),"shout intent "+line.id);
}
test(shouts.regionalVariants.length===0,"unverified dialect shipped");
test(shouts.regionalReviewQueue.every(x=>x.releaseAllowed===false),"regional review gates");
const context={clubId:"campanile",clubObjective:"promozione",offerDistance:"other_region",
 offerPayBand:"low",president:{traits:{frugality:80,ambition:90}},coachMorale:60};
test(matchesPressContext({presidentFrugalityAbove:75,offerDistance:"other_region"},context),"opening contextual trigger");
test(!matchesPressContext({inventedThing:true},context),"unknown trigger rejected");
test(!matchesPressContext({coachMoraleBelow:50},context),"threshold respected");
test(seedHash("a")!==seedHash("b"),"seed distinguishes inputs");
test(JSON.stringify(seededShuffle([1,2,3,4],"s"))===JSON.stringify(seededShuffle([1,2,3,4],"s")),
 "shuffle deterministic");
const sampleR=buildPressRoster(media,"1979|club");
test(sampleR.journalists.length===12,"roster length");
test(new Set(sampleR.journalists.map(j=>j.name)).size===12,"generated names unique");
test(sampleR.journalists.every(j=>media.broadcasters.some(b=>b.id===j.broadcasterId)),"broadcasters assigned");
test(sampleR.journalists.some(j=>j.id==="raffaele_corsi"&&j.name==="Raffaele Corsi"),"existing reporter identity");
test(sampleR.journalists.some(j=>j.id==="piero_masi"&&j.name==="Piero Masi"),"existing radiocronista identity");
for(let seed=0;seed<100;seed++){
  const opts={catalog:opening,media,phase:"opening",context,careerSeed:"career-"+seed,sessionKey:"start"};
  const a=createPressConference(opts),b=createPressConference(opts);
  test(JSON.stringify(a)===JSON.stringify(b),"opening deterministic seed "+seed);
  test(a.questions.length===5&&new Set(a.questions.map(q=>q.id)).size===5,"five nonrepeat "+seed);
  test(new Set(a.questions.map(q=>q.topic)).size===5,"opening topic diversity "+seed);
  test(new Set(a.questions.map(q=>q.journalistId)).size===5,"reporter nonrepeat within session "+seed);
  const restored=JSON.parse(JSON.stringify(a));
  const answer=answerPressConference(restored,restored.questions[0].id,"a");
  test(answer.accepted===true&&Object.keys(answer.semanticEffects).length===4,"answer accepted "+seed);
  const again=answerPressConference(answer.session,restored.questions[0].id,"a");
  test(again.accepted===false&&again.reason==="already_answered","no duplicate on reload "+seed);
  test(a.questions[0].id===restored.questions[0].id,"reload immutable "+seed);
}
const pctxBase={clubId:"campanile",matchFinal:true,fixtureType:"league",matchId:"season-1:round-1",venue:"home"};
for(const result of ["win","draw","loss"]){
  for(let seed=0;seed<100;seed++){
    const pctx={...pctxBase,result};
    const options={catalog:post,media,phase:"postmatch",context:pctx,careerSeed:"c"+seed,sessionKey:pctx.matchId};
    const a=createPressConference(options),b=createPressConference(options);
    test(JSON.stringify(a)===JSON.stringify(b),"postmatch deterministic "+result+seed);
    test(a.questions.length===2&&new Set(a.questions.map(q=>q.id)).size===2,"postmatch nonrepeat "+result+seed);
    test(a.questions.some(q=>post.questions.find(x=>x.id===q.id)?.when.result===result),"postmatch result relevant "+result+seed);
    test(a.questions.every(q=>!post.questions.find(x=>x.id===q.id)?.when.result||
      post.questions.find(x=>x.id===q.id)?.when.result===result),"other result excluded "+result+seed);
  }
}
let rejected=false;try{createPressConference({catalog:post,media,phase:"postmatch",context:{...pctxBase,result:"win",matchFinal:false},careerSeed:"c",sessionKey:pctxBase.matchId});}
catch{rejected=true;}test(rejected,"no postmatch before final whistle");
rejected=false;try{createPressConference({catalog:post,media,phase:"postmatch",context:{...pctxBase,result:"win"},careerSeed:"c",sessionKey:"wrong-fixture"});}
catch{rejected=true;}test(rejected,"matchId must match stable session key");
const testSession=createPressConference({catalog:opening,media,phase:"opening",context,careerSeed:1,sessionKey:"start"});
const before=JSON.stringify(testSession);
const answer=answerPressConference(testSession,testSession.questions[0].id,"b");
test(before===JSON.stringify(testSession),"answer must not mutate input");
test(answer.effectTransactionId.includes(testSession.sessionId),"transaction ID stable");
test(!("score" in answer)&&!("club" in answer),"no score or state mutation");
for(const intent of ["encourage","reprimand"]){
  const selected=pickIndividualShout(shouts,{situation:"after_error",intent,seed:123});
  test(!!selected&&selected.intent===intent,"individual shout selected");
  test(pickIndividualShout(shouts,{situation:"after_error",intent,seed:123})?.id===selected.id,"shout deterministic");
  const second=pickIndividualShout(shouts,{situation:"after_error",intent,seed:123,usedIds:[selected.id]});
  test(second!==null&&second.id!==selected.id,"shout cooldown exclusion");
}
console.log("ORONZO PRESS R02: OK");
console.log(JSON.stringify({openingQuestions:opening.questions.length,postQuestions:post.questions.length,
 journalists:media.journalists.length,broadcasters:media.broadcasters.length,individualShouts:shouts.shouts.length,
 seededOpeningRuns:100,seededPostmatchRuns:300,checks},null,2));
