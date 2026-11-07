import {clamp} from './rng.js';
import {normalizePlayer} from './player-model.js';
import {regionAffinity} from './geography.js';
const n=(p,key,base=50)=>clamp(p.mental?.[key]??base);
const round=x=>Math.round(x*100)/100;
// Probabilities steer player action choices, not scoring events.
export function analyzeDisposition(player,{pressure=50,shoutDifficulty=50}={}){
 const impulsivity=n(player,'impulsivita'),recklessness=n(player,'spericolatezza');
 const madness=n(player,'pazzia'),courage=n(player,'coraggio');
 const discipline=n(player,'discipline'),susceptibility=n(player,'suscettibilita');
 const riskPreference=clamp(.24+(recklessness-50)*.004+(madness-50)*.0025+
  (courage-50)*.0016+(impulsivity-50)*.0025-clamp(pressure)*.0005,.02,.92);
 const orderCompliance=clamp(.5+(discipline-50)*.004-(impulsivity-50)*.002-
   (madness-50)*.0016-(clamp(shoutDifficulty)-50)*.002,.08,.96);
 const errorOnRiskyAction=clamp(.06+(recklessness-50)*.0013+
   (impulsivity-50)*.001-(courage-50)*.0004,.015,.22);
 const emotionalSensitivity=clamp(.5+(susceptibility-50)*.005,.2,.8);
 return {riskPreference:round(riskPreference),orderCompliance:round(orderCompliance),
  errorOnRiskyAction:round(errorOnRiskyAction),emotionalSensitivity:round(emotionalSensitivity)};
}
export function previewShout(player,{tone='gentle',coachOrigin=null,coachLeadership=50,pressure=50}={}){
 const t=tone==='gentile'?'gentle':tone==='duro'?'hard':tone;
 if(!['gentle','hard'].includes(t))throw new RangeError('tone must be gentle/hard');
 const affinity=regionAffinity(player.origin,coachOrigin);
 const trust=clamp(player.relationships?.coachTrust??50);
 const lead=(clamp(coachLeadership)-50)*.034;
 const sensitivity=(n(player,'suscettibilita')-50)*.05;
 const impulsivity=(n(player,'impulsivita')-50)*.03;
 const discipline=(n(player,'discipline')-50)*.023;
 const stress=(clamp(pressure)-50)*.025;
 let gain=t==='gentle'
  ? 2.2+lead+(trust-50)*.027+affinity.strength*1.5-sensitivity*.21-stress*.35
  : .55+lead*.85+discipline-sensitivity-impulsivity-stress*.6+affinity.strength*1.5;
 gain=round(clamp(gain,-8,8));
 return {tone:t,affinity,coachTrustDelta:round(clamp(gain*.58,-5,5)),
  moraleDelta:gain,confidenceDelta:round(gain*.48),
  // This applies ONLY if engine passes a timestamp to effectiveAbility.
  temporaryPerformanceBonus:round(clamp(gain*.42,-3.5,3.5)),
  durationSeconds:180};
}
export function applyShout(player,options={}){
 const id=String(options.eventId??'').trim();
 if(!id)throw new Error('eventId required for idempotent coaching');
 const p=normalizePlayer(player), ids=Array.isArray(p.coachInteractionIds)?p.coachInteractionIds:[];
 if(ids.includes(id))return {player:p,applied:false,effects:null};
 const t=Number(options.t??0);
 if(!Number.isFinite(t)||t<0||t>5400)throw new RangeError('Invalid simulated match time');
 const effects=previewShout(p,options);
 p.mental.morale=round(clamp(p.mental.morale+effects.moraleDelta));
 p.mental.confidence=round(clamp(p.mental.confidence+effects.confidenceDelta));
 p.relationships.coachTrust=round(clamp((p.relationships.coachTrust??50)+effects.coachTrustDelta));
 p.coachInteractionIds=[...ids,id];
 const previous=Array.isArray(p.temporaryEffects)?p.temporaryEffects:[];
 p.temporaryEffects=[...previous.filter(e=>Number.isFinite(e.expiresAt)&&e.expiresAt>t),
  {id,kind:'coach-shout',bonus:effects.temporaryPerformanceBonus,expiresAt:Math.min(5400,t+effects.durationSeconds)}];
 return {player:p,applied:true,effects};
}

