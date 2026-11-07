/* ORONZO · conferenze stampa R02 — solo contenuti e selezione.
 * Zero mutazioni a Club, Coach o match engine; 07/09 applicano gli effetti semanticamente.
 * Tutte le API sono pure/deterministiche; il chiamante persiste le sessioni.
 */
export const PRESS_EFFECT_KEYS = Object.freeze(["coachMorale","supportersTrust","mediaReputation","presidentTrust"]);
export const PHASE_COUNTS = Object.freeze({opening:5,postmatch:2});
export const CONTEXT_KEYS = Object.freeze([
  "offerDistance","offerPayBand","clubObjective","presidentFrugalityAbove","presidentAmbitionAbove",
  "coachMoraleBelow","coachMoraleAbove","supportersTrustBelow","mediaReputationBelow",
  "result","fixtureType","venue","injuryOccurred","redCard","lateGoal","shotsDisadvantage",
  "crowdWhistled","lossStreakMin","fatigueAbove","clubCashBelow"
]);
const allowed=new Set(CONTEXT_KEYS);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const finite=x=>typeof x==="number"&&Number.isFinite(x);
const str=x=>String(x??"");
export function seedHash(seed) {
  let h=2166136261;
  for(let i=0;i<str(seed).length;i++){h^=str(seed).charCodeAt(i);h=Math.imul(h,16777619);}
  return h>>>0;
}
export function seededRng(seed){
  let s=seedHash(seed);
  return ()=>{
    s=(s+0x6D2B79F5)>>>0;
    let t=s;t=Math.imul(t^(t>>>15),t|1);
    t^=t+Math.imul(t^(t>>>7),t|61);
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
export function seededShuffle(items,seed){
  const out=[...items],random=seededRng(seed);
  for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
  return out;
}
function readMetric(context,key) {
  if(key==="presidentFrugalityAbove")return context.president?.traits?.frugality;
  if(key==="presidentAmbitionAbove")return context.president?.traits?.ambition;
  if(key==="coachMoraleBelow"||key==="coachMoraleAbove")return context.coachMorale;
  if(key==="supportersTrustBelow")return context.supportersTrust;
  if(key==="mediaReputationBelow")return context.mediaReputation;
  if(key==="lossStreakMin")return context.lossStreak;
  if(key==="fatigueAbove")return context.teamFatigue;
  if(key==="clubCashBelow")return context.clubCash;
  return context[key];
}
export function matchesPressContext(when={},context={}){
  if(!when||typeof when!=="object"||Array.isArray(when))return false;
  for(const [key,expected] of Object.entries(when)){
    if(!allowed.has(key))return false;
    const actual=readMetric(context,key);
    if(key.endsWith("Above")){if(!finite(actual)||!(actual>expected))return false;}
    else if(key.endsWith("Below")){if(!finite(actual)||!(actual<expected))return false;}
    else if(key==="lossStreakMin"){if(!finite(actual)||!(actual>=expected))return false;}
    else if(actual===undefined||actual===null||actual!==expected)return false;
  }
  return true;
}
export function buildPressRoster(media,seed){
  const all=media?.journalists||[],stations=media?.broadcasters||[];
  if(all.length<12||stations.length<8)throw new RangeError("press roster too small");
  const firstMale=seededShuffle(media.journalistNamePools?.firstMale||[],str(seed)+"|firstMale");
  const firstFemale=seededShuffle(media.journalistNamePools?.firstFemale||[],str(seed)+"|firstFemale");
  const last=seededShuffle(media.journalistNamePools?.last||[],str(seed)+"|last");
  if(firstMale.length<all.length||firstFemale.length<all.length||last.length<all.length)throw new RangeError("insufficient name pool");
  const used=new Set(),journalists=[];
  for(let i=0;i<all.length;i++){
    const template=all[i];
    let name=template.fixedName;
    if(!name){
      const first=template.nameGender==="f"?firstFemale:firstMale;
      let offset=0;do{
        name=first[(i+offset)%first.length]+" "+last[(i+offset)%last.length];offset++;
        if(offset>first.length*last.length)throw new Error("journalist names exhausted");
      }while(used.has(name));
    }
    if(used.has(name))throw new Error("duplicate canonical journalist name");
    used.add(name);
    const broadcasterId=stations[seedHash(str(seed)+"|station|"+template.id)%stations.length].id;
    journalists.push({...template,name,broadcasterId});
  }
  return {seed:str(seed),journalists,broadcasters:stations.map(x=>({...x}))};
}
function chooseWeightedWithoutReplacement(items,count,seed){
  const rng=seededRng(seed);
  const pool=[...items].sort((a,b)=>a.id.localeCompare(b.id));
  const chosen=[];
  while(pool.length&&chosen.length<count){
    const total=pool.reduce((n,x)=>n+Math.max(1,x.weight||1),0);
    let ticket=rng()*total,index=pool.length-1;
    for(let i=0;i<pool.length;i++){ticket-=Math.max(1,pool[i].weight||1);if(ticket<0){index=i;break;}}
    chosen.push(pool.splice(index,1)[0]);
  }
  return chosen;
}
export function selectConferenceQuestions(catalog,phase,context,seed,excludeIds=[]){
  const count=PHASE_COUNTS[phase];
  if(!count||seed===undefined||seed===null)throw new Error("invalid phase or seed");
  const qs=catalog?.questions;
  if(!Array.isArray(qs))throw new TypeError("questions array missing");
  const exclude=new Set(excludeIds);
  const matching=qs.filter(q=>q.phase===phase&&!exclude.has(q.id)&&matchesPressContext(q.when,context));
  if(matching.length<count)throw new RangeError("not enough eligible distinct questions");
  if(phase==="postmatch"&&["win","draw","loss"].includes(context?.result)){
    const resultSpecific=matching.filter(q=>q.when?.result===context.result);
    if(!resultSpecific.length)throw new RangeError("missing result-specific postmatch question");
    const first=chooseWeightedWithoutReplacement(resultSpecific,1,str(seed)+"|result")[0];
    const remaining=chooseWeightedWithoutReplacement(matching.filter(q=>q.id!==first.id),count-1,str(seed)+"|rest");
    return [first,...remaining];
  }
  // Avoid five questions on the same opening topic when other topics are available.
  const picked=[],available=[...matching];
  for(let i=0;i<count;i++){
    const fresh=available.filter(q=>!picked.some(v=>v.topic===q.topic));
    const eligible=fresh.length?fresh:available;
    const next=chooseWeightedWithoutReplacement(eligible,1,str(seed)+"|"+phase+"|"+i)[0];
    picked.push(next);
    available.splice(available.findIndex(q=>q.id===next.id),1);
  }
  return picked;
}
export function createPressConference({catalog,media,phase,context={},careerSeed,sessionKey}){
  if(careerSeed===null||careerSeed===undefined||!str(sessionKey).trim())throw new Error("stable career seed and sessionKey required");
  if(phase!=="opening"&&phase!=="postmatch")throw new RangeError("unsupported conference phase");
  if(phase==="postmatch"&&!(context.matchFinal===true&&["win","draw","loss"].includes(context.result)&&
    typeof context.matchId==="string"&&context.matchId.length>0&&context.matchId===sessionKey)){
    throw new Error("postmatch requires final real match context and matching matchId");
  }
  const sessionId="press:"+str(careerSeed)+":"+phase+":"+str(sessionKey);
  const roster=buildPressRoster(media,str(careerSeed)+"|"+str(context.clubId??"unknown"));
  const chosen=selectConferenceQuestions(catalog,phase,context,sessionId);
  const pool=seededShuffle(roster.journalists,sessionId+"|speakers");
  const byId=new Map(roster.broadcasters.map(x=>[x.id,x]));
  const questions=chosen.map((q,i)=>{
    const reporter=pool[i];
    const broadcaster=byId.get(reporter.broadcasterId);
    return {id:q.id,topic:q.topic,text:q.text,answers:q.answers.map(a=>({...a,effects:{...a.effects}})),
      journalistId:reporter.id,journalistName:reporter.name,broadcasterId:reporter.broadcasterId,
      broadcasterName:broadcaster?.name||""};
  });
  return {schemaVersion:2,sessionId,phase,careerSeed:str(careerSeed),sessionKey:str(sessionKey),
    clubId:context.clubId||null,questions,answers:{},completed:false};
}
export function answerPressConference(session,questionId,answerId){
  if(!session||!Array.isArray(session.questions))throw new TypeError("conference missing");
  const question=session.questions.find(x=>x.id===questionId);
  if(!question)return {accepted:false,reason:"question_not_in_session"};
  if(own(session.answers||{},questionId))return {accepted:false,reason:"already_answered"};
  const answer=question.answers.find(x=>x.id===answerId);
  if(!answer)return {accepted:false,reason:"answer_not_found"};
  const effects={};
  for(const key of PRESS_EFFECT_KEYS){
    const delta=answer.effects?.[key];
    if(!Number.isInteger(delta)||delta<-3||delta>3)throw new RangeError("invalid semantic delta "+key);
    effects[key]=delta;
  }
  const answers={...(session.answers||{}),[questionId]:answerId};
  const updated={...session,answers,completed:Object.keys(answers).length===session.questions.length};
  // effectTransactionId must be persisted by 07/09; replaying a saved answer yields no new delta.
  const effectTransactionId=session.sessionId+"|"+questionId;
  return {accepted:true,session:updated,selection:{questionId,answerId,label:answer.label,text:answer.text},
    semanticEffects:effects,effectTransactionId};
}
export function pickIndividualShout(catalog,{situation,intent,tone,seed,usedIds=[]}){
  if(seed===undefined||seed===null)throw new Error("seed required");
  const entries=catalog?.shouts||[],used=new Set(usedIds);
  const eligible=entries.filter(x=>x.situation===situation&&x.intent===intent&&
    (!tone||x.tone===tone)&&!used.has(x.id)&&x.language==="it-IT");
  const selected=seededShuffle(eligible,str(seed)+"|"+situation+"|"+intent+"|"+str(tone||"any"))[0];
  return selected||null;
}
