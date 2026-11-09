/** A persistent consumer for Career07 PR56 pending_agent09_player_trust.
 * Engine06 is sole owner of temporary modifiers, so this file never applies them.
 */
import {copy,clamp} from './core.js';
import {createCoach} from './coach-model.js';
import {applyCoachMoraleEvent} from './morale.js';
import {ensureShoutLedger} from './management-r10.js';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function smallDelta(n,label) {
  if(!Number.isSafeInteger(n)||n< -3||n>3)throw new RangeError(label+' must be integer -3..3');
  return n;
}
/** Agent07 passes {key:'fixtureId:eventId',event,coach,club}. Duplicates are acked true/no-op
 * to let reconcileM1Shouts finish an already-applied pending journal safely.
 */
export function persistShout({key,event,coach,club}={}) {
  if(typeof key!=='string'||!key.includes(':')||!event||event.type!=='coach_shout'||
     event.id==null||String(event.id)==='' || key.slice(key.lastIndexOf(':')+1)!==String(event.id))
    throw new Error('invalid_shout_event_key');
  if(event.teamId!==club?.id||typeof event.playerId!=='string'||!event.playerId)
    throw new Error('shout_team_or_player_mismatch');
  const detail=event.detail;
  if(detail?.accepted!==true||detail.temporaryOwner!=='match-engine-06'||
     detail.persistentOwner!=='coach-club-09'||!detail.temporaryEffect ||
     !detail.persistentSuggestion)throw new Error('untrusted_shout_event');
  const delta=smallDelta(detail.persistentSuggestion.playerTrustDelta,'playerTrustDelta');
  const moraleDelta=smallDelta(detail.persistentSuggestion.coachMoraleDelta,'coachMoraleDelta');
  const c=ensureShoutLedger(club);
  const previous=c.management.shouts[key];
  if(previous){
    if(previous.playerId!==event.playerId||previous.playerTrustDelta!==delta||previous.moraleDelta!==moraleDelta)
      throw new Error('conflicting_shout_replay');
    return {accepted:true,duplicate:true,club:c,coach:createCoach(coach)};
  }
  const mister=createCoach(coach);
  if(mister.clubId!==c.id)throw new Error('shout_coach_team_mismatch');
  if(mister.gameOver)throw new Error('game_over');
  const player=c.players?.find(x=>x.id===event.playerId);
  if(!player)throw new Error('shout_unknown_player');
  const actual=player.relationships?.coachTrust ?? player.relationshipWithCoach;
  if(typeof actual!=='number'||!Number.isFinite(actual)||actual<0||actual>100)
    throw new Error('missing_player_coach_trust');
  const nextTrust=Math.round(clamp(actual+delta,0,100)*100)/100;
  const morale=applyCoachMoraleEvent(mister,{eventId:'shout:'+key,sourceId:key,
    reason:'individual_shout',moraleDelta});
  if(!morale.accepted)throw new Error('shout_morale_'+morale.reason);
  player.relationships={...(player.relationships??{}),coachTrust:nextTrust};
  player.relationshipWithCoach=nextTrust;
  morale.coach.relationships.playerTrustById[event.playerId]=nextTrust;
  c.management.shouts[key]={key,playerId:event.playerId,eventId:event.id,
    playerTrustBefore:actual,playerTrustAfter:nextTrust,playerTrustDelta:delta,moraleDelta,
    origin:'engine06',temporaryAppliedHere:false};
  return {accepted:true,duplicate:false,coach:morale.coach,club:c,
    playerId:event.playerId,playerTrust:nextTrust};
}
