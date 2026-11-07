// Pure, idempotency-ready boundary to Agent 09's persistent career ledger.
// Caller MUST persist appliedEventIds in the same transaction as relation deltas.
export function collectCoachEffects(events, appliedEventIds=[], {matchId}={}) {
  if(!Array.isArray(events)||!Array.isArray(appliedEventIds))
    throw new TypeError('events and appliedEventIds must be arrays');
  if(typeof matchId!=='string'||!matchId.trim())
    throw new TypeError('stable matchId is required for cross-match event keys');
  const seen=new Set(appliedEventIds.map(String));
  const effects=[];
  const nextIds=[...appliedEventIds.map(String)];
  for(const event of events) {
    if(!event || event.type!=='coach_shout' || !Number.isInteger(event.id) || event.id<=0)continue;
    const id=matchId+':'+event.id;
    if(seen.has(id))continue;
    if(event.detail?.accepted!==true)continue;
    const suggestion=event.detail.persistentSuggestion;
    if(!suggestion || !Number.isFinite(suggestion.playerTrustDelta) ||
       !Number.isFinite(suggestion.coachMoraleDelta))continue;
    seen.add(id);nextIds.push(id);
    effects.push({
      eventId:id,sourceEventId:event.id,t:event.t,teamId:event.teamId,
      playerId:event.playerId,tone:event.detail.tone,
      utteranceId:event.detail.utteranceId??null,
      playerTrustDelta:suggestion.playerTrustDelta,
      coachMoraleDelta:suggestion.coachMoraleDelta,
    });
  }
  return {effects,appliedEventIds:nextIds};
}
