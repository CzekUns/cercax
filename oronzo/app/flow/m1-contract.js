/** Agent07 M1 persistence and command boundary. Pure orchestration; no engine/08/09 formulas. */
export const M1_CONTRACT_VERSION = 1;
export const TRAINING_PLANS_M1 = Object.freeze(['technical','athletic','tactical','balanced','rest']);
const FOCUS = Object.freeze({technical:'technique',athletic:'fitness',tactical:'tactics',balanced:'teamwork',rest:'recovery'});
const copy = value => JSON.parse(JSON.stringify(value));
const ids = values => new Set(values.map(x=>x.id));
export function ensureM1Ledger(state) {
  if (!state?.flow || !Array.isArray(state.clubs)) throw new Error('FLOW_STATE_REQUIRED');
  if (!state.flow.m1) state.flow.m1 = {version:M1_CONTRACT_VERSION,playerDataset:null,
    training:{selected:null,appliedWeeks:[],reports:[]},matchLoads:[],
    matchCommands:{},persistentEvents:{},seasonDevelopments:[]};
  if (state.flow.m1.version !== M1_CONTRACT_VERSION) throw new Error('M1_SCHEMA_UNSUPPORTED');
  return state.flow.m1;
}
/** Hydrate a brand-new, never-played world with 08-owned PlayerV2 sources. */
export function attachSourcedPlayers(state,{squadsByClub,dataset,normalizePlayer}={}) {
  if (state.flow?.stage !== 'offers' || state.flow.acceptedOfferId)
    return {accepted:false,reason:'initial_world_only'};
  if (typeof normalizePlayer !== 'function') return {accepted:false,reason:'attributes_08_required'};
  if (!dataset?.sourceId || !dataset?.version || !dataset?.license ||
      !Array.isArray(dataset.surnames) || dataset.surnames.length < 500)
    return {accepted:false,reason:'verified_surname_catalog_required'};
  const unique = new Map(), names=new Set();
  for (const row of dataset.surnames) {
    const nameKey=String(row?.name??'').normalize('NFC').trim().toLocaleLowerCase('it-IT');
    if (!row?.id || !nameKey || unique.has(row.id) || names.has(nameKey)) return {accepted:false,reason:'invalid_surname_catalog'};
    unique.set(row.id,row.name);names.add(nameKey);
  }
  if (!squadsByClub || typeof squadsByClub !== 'object')
    return {accepted:false,reason:'club_squads_required'};
  if (state.flow.m1?.playerDataset) return {accepted:false,reason:'already_attached'};
  const replacements=[];
  const allIds = new Set();
  for (const club of state.clubs) {
    const sources = squadsByClub[club.id];
    if (!Array.isArray(sources) || sources.length !== club.players.length)
      return {accepted:false,reason:'club_roster_mismatch',clubId:club.id};
    const next=club.players.map((existing,i)=>{
      const incoming=sources[i];
      if (!incoming || incoming.teamId!==club.id || !incoming.surnameId ||
          unique.get(incoming.surnameId)!==incoming.surname ||
          typeof incoming.id!=='string') throw new Error('SOURCED_PLAYER_MISMATCH:'+club.id+':'+i);
      // The Career07 ID is canonical for saves, lineups and fixture results.
      // Agent08 generator IDs are recorded as aliases, not substituted.
      const player=normalizePlayer({...existing,...incoming,id:existing.id,teamId:club.id,
        positions:existing.positions,contract:existing.contract,
        visual:existing.visual??incoming.visual??null,
        sourcePlayerId:incoming.id});
      if (player.id!==existing.id || player.teamId!==club.id ||
          player.contract?.weeklyWage!==existing.contract?.weeklyWage ||
          !player.surnameId || player.surnameId!==incoming.surnameId)
        throw new Error('PLAYER_ID_OR_CONTRACT_CHANGED');
      if (allIds.has(player.id)) throw new Error('DUPLICATE_PLAYER_ID');
      allIds.add(player.id);
      return player;
    });
    replacements.push(next);
  }
  const ledger=ensureM1Ledger(state);
  state.clubs.forEach((club,i)=>{club.players=replacements[i]});
  ledger.playerDataset={sourceId:dataset.sourceId,version:dataset.version,
    license:dataset.license,recordCount:unique.size};
  return {accepted:true,players:allIds.size,dataset:copy(ledger.playerDataset)};
}
export function chooseM1Training(state,{plan,intensity=50,expectedAbsoluteWeek,chooseTrainingPlan}={}) {
  if (state?.coach?.gameOver || state?.coach?.morale===0) return {accepted:false,reason:'game_over'};
  if (state.flow?.stage!=='hub' || !state.coach?.clubId)
    return {accepted:false,reason:'training_requires_hub'};
  if (!TRAINING_PLANS_M1.includes(plan)) return {accepted:false,reason:'invalid_training_plan'};
  if (!Number.isInteger(intensity)||intensity<0||intensity>100)
    return {accepted:false,reason:'invalid_training_intensity'};
  if (expectedAbsoluteWeek!==state.absoluteWeek)
    return {accepted:false,reason:'stale_week_action'};
  if (typeof chooseTrainingPlan!=='function') return {accepted:false,reason:'coach09_training_port_required'};
  const ledger=ensureM1Ledger(state);
  if (ledger.training.selected?.absoluteWeek===state.absoluteWeek ||
      ledger.training.appliedWeeks.includes(state.absoluteWeek))
    return {accepted:false,reason:'already_planned'};
  const choice=chooseTrainingPlan(state.coach,{week:state.absoluteWeek,focus:FOCUS[plan],intensity});
  if (!choice?.accepted || !choice.coach) return {accepted:false,reason:choice?.reason??'coach09_rejected'};
  // All mutation happens after the external 09 validation succeeds.
  state.coach=choice.coach;
  ledger.training.selected={plan,intensity,absoluteWeek:state.absoluteWeek,
    seasonYear:state.seasonYear,clubId:state.coach.clubId};
  return {accepted:true,selection:copy(ledger.training.selected)};
}
export function settleM1Training(state,{applyTrainingWeek}={}) {
  const ledger=ensureM1Ledger(state),selection=ledger.training.selected;
  if (!selection || selection.absoluteWeek!==state.absoluteWeek)
    return {accepted:false,reason:'no_training_selected'};
  if (ledger.training.appliedWeeks.includes(state.absoluteWeek))
    return {accepted:false,reason:'already_applied'};
  if (typeof applyTrainingWeek!=='function') throw new Error('ATTRIBUTES08_TRAINING_UNAVAILABLE');
  const club=state.clubs.find(c=>c.id===selection.clubId);
  if (!club) throw new Error('TRAINING_CLUB_MISSING');
  const output=applyTrainingWeek(club.players,selection.plan,{seed:state.seed+'|'+club.id,
    week:state.absoluteWeek,intensity:selection.intensity,
    coachQuality:state.coach?.traits?.leadership??50});
  if (!Array.isArray(output?.players) || output.players.length!==club.players.length ||
      output.players.some((p,i)=>p.id!==club.players[i].id ||
        p.contract?.weeklyWage!==club.players[i].contract?.weeklyWage))
    throw new Error('ATTRIBUTES08_INVALID_TRAINING_RESULT');
  club.players=output.players;
  ledger.training.appliedWeeks.push(state.absoluteWeek);
  ledger.training.reports.push({clubId:club.id,absoluteWeek:state.absoluteWeek,
    report:copy(output.report),incidents:copy(output.incidents)});
  ledger.training.selected=null;
  return {accepted:true,clubId:club.id,absoluteWeek:state.absoluteWeek,
    report:copy(output.report),incidents:copy(output.incidents)};
}
/** Use an authoritative Engine06 command; never fake acceptance or coordinates. */
export function issueM1Command(state,engine,{requestId,type,payload={},tone,targetPlayerId}={}) {
  if (state?.coach?.gameOver || state?.coach?.morale===0)
    return {accepted:false,reason:'game_over'};
  if (state.flow?.stage!=='pre_match' || !state.flow.pendingMatch)
    return {accepted:false,reason:'match_not_prepared'};
  if (!engine || typeof engine.command!=='function' || typeof engine.getEventsSince!=='function')
    return {accepted:false,reason:'engine06_command_port_required'};
  if (typeof requestId!=='string' || !requestId.trim() || requestId.length>128)
    return {accepted:false,reason:'request_id_required'};
  const ledger=ensureM1Ledger(state);
  const fixture=state.flow.pendingMatch;
  const commandKey=fixture.fixtureId+':'+requestId;
  if (ledger.matchCommands[commandKey]) return {accepted:false,reason:'already_sent',
    recorded:copy(ledger.matchCommands[commandKey])};
  const teamId=state.coach?.clubId;
  if (teamId!==fixture.homeId && teamId!==fixture.awayId)
    return {accepted:false,reason:'not_coach_team'};
  const validTypes=new Set(['tacticChange','substitution','individualShout','teamShout']);
  if (!validTypes.has(type))return {accepted:false,reason:'unsupported_command'};
  let command;
  if (type==='individualShout') {
    const normalized={gentle:'encourage',encourage:'encourage',hard:'harsh',harsh:'harsh'}[tone];
    if (!normalized)return {accepted:false,reason:'unsupported_tone'};
    const club=state.clubs.find(c=>c.id===teamId);
    const player=club?.players?.find(p=>p.id===targetPlayerId);
    if (!player)return {accepted:false,reason:'unknown_player'};
    command={type:'shout',teamId,payload:{targetPlayerId,tone:normalized,
      coachOrigin:state.coach.origin??null,
      coachTraits:{leadership:state.coach.traits?.leadership??50},
      ...(player.origin?{playerOrigin:player.origin}:{}),
      utteranceId:requestId}};
  } else if (type==='teamShout') {
    command={type:'shout',teamId,payload};
  } else command={type,teamId,payload};
  const previous=engine.getEventsSince(0).at(-1)?.id??0;
  const outcome=engine.command(command);
  if (!outcome?.accepted)return {accepted:false,reason:outcome?.reason??'engine06_rejected'};
  const newEvents=engine.getEventsSince(previous);
  ledger.matchCommands[commandKey]={fixtureId:fixture.fixtureId,teamId,
    type,eventIds:newEvents.map(e=>e.id),command:copy(command)};
  return {accepted:true,requestId,command:copy(command),engineResult:copy(outcome),
    events:copy(newEvents)};
}
/** Calculate actual minutes from the starting XI and Engine06 substitution events. */
export function minutesByEngineEvents(startXI,events,teamId) {
  if (!Array.isArray(startXI)||!Array.isArray(events)) throw new Error('MATCH_MINUTES_INPUT_INVALID');
  const entered=new Map(startXI.map(id=>[id,0])),exited=new Map();
  for (const e of events) {
    if(e?.type!=='substitution'||e.teamId!==teamId)continue;
    const out=e.detail?.outId,inId=e.detail?.inId,t=e.t;
    if (!entered.has(out)||exited.has(out)||entered.has(inId)||!Number.isFinite(t)||t<0||t>5400)
      throw new Error('INVALID_SUBSTITUTION_EVENT');
    exited.set(out,t);entered.set(inId,t);
  }
  return Object.fromEntries([...entered].map(([id,start])=>[id,
    Math.max(0,Math.round(((exited.get(id)??5400)-start)/60*100)/100)]));
}
export function settleM1MatchLoad(state,{fixtureId,teamId,startingXI,events,applyMatchLoad}={}) {
  const ledger=ensureM1Ledger(state),key=fixtureId+':'+teamId;
  if (ledger.matchLoads.includes(key))return {accepted:false,reason:'already_applied'};
  if (typeof applyMatchLoad!=='function')throw new Error('ATTRIBUTES08_MATCH_LOAD_UNAVAILABLE');
  const club=state.clubs.find(c=>c.id===teamId);
  if (!club || !fixtureId || !Array.isArray(startingXI))throw new Error('MATCH_LOAD_INPUT_INVALID');
  const minutes=minutesByEngineEvents(startingXI,events,teamId);
  const next=applyMatchLoad(club.players,minutes,{intensity:state.coach?.tactics?.tempo??50});
  if (!Array.isArray(next)||next.length!==club.players.length ||
      next.some((p,i)=>p.id!==club.players[i].id || p.contract?.weeklyWage!==club.players[i].contract?.weeklyWage))
    throw new Error('ATTRIBUTES08_INVALID_MATCH_LOAD');
  club.players=next;
  ledger.matchLoads.push(key);
  return {accepted:true,playerCount:Object.keys(minutes).length,minutes};
}
/** The 06 event owns temporary bonuses. 09 must own lasting player trust. */
export function journalM1Shouts(state,{fixtureId,events,persistShout}={}) {
  const ledger=ensureM1Ledger(state);
  if (!fixtureId || !Array.isArray(events))throw new Error('SHOUT_EVENTS_REQUIRED');
  let recorded=0,applied=0;
  for(const e of events){
    if(e?.type!=='coach_shout'||e.teamId!==state.coach?.clubId)continue;
    const key=fixtureId+':'+String(e.id);
    if(ledger.persistentEvents[key])continue;
    const suggestion=e.detail?.persistentSuggestion;
    if(e.detail?.temporaryOwner!=='match-engine-06'||!suggestion)
      throw new Error('UNTRUSTED_SHOUT_EVENT');
    // No player-trust mutation in Agent07. Port from 09 must return the updated objects.
    const record={key,eventId:e.id,fixtureId,playerId:e.playerId,event:copy(e),
      suggestion:copy(suggestion),status:'pending_agent09_player_trust'};
    if(typeof persistShout==='function'){
      const result=persistShout({key,coach:copy(state.coach),
        club:copy(state.clubs.find(c=>c.id===state.coach.clubId)),event:copy(e)});
      if(result?.accepted){
        if(!result.coach||!result.club||result.club.id!==state.coach.clubId)
          throw new Error('COACH09_INVALID_SHOUT_RESULT');
        state.coach=result.coach;
        state.clubs[state.clubs.findIndex(c=>c.id===result.club.id)]=result.club;
        record.status='applied';applied++;
      }
    }
    ledger.persistentEvents[key]=record;
    recorded++;
  }
  return {recorded,applied,pending:recorded-applied};
}
/** Replay only unconsumed shout suggestions after 09 supplies an authorized handler.
 * Never apply 06's transient performance multiplier a second time.
 */
export function reconcileM1Shouts(state,{persistShout}={}) {
  if(typeof persistShout!=='function')return{accepted:false,reason:'coach09_player_trust_port_required'};
  const ledger=ensureM1Ledger(state),pending=Object.values(ledger.persistentEvents)
    .filter(x=>x.status==='pending_agent09_player_trust');
  let applied=0;
  for(const entry of pending){
    const club=state.clubs.find(c=>c.id===entry.event.teamId);
    if(!club)throw new Error('SHOUT_TEAM_MISSING');
    const result=persistShout({key:entry.key,coach:copy(state.coach),club:copy(club),event:copy(entry.event)});
    if(!result?.accepted || !result.coach || result.club?.id!==club.id)
      throw new Error('COACH09_INVALID_SHOUT_RESULT');
    state.coach=result.coach;
    state.clubs[state.clubs.findIndex(c=>c.id===club.id)]=result.club;
    entry.status='applied';applied++;
  }
  return{accepted:true,applied,remaining:pending.length-applied};
}
export function settleM1Season(state,{advanceSeason,seasonYear,alreadyAged=false}={}) {
  const ledger=ensureM1Ledger(state);
  if(!Number.isSafeInteger(seasonYear)||seasonYear<1900)throw new Error('SEASON_YEAR_REQUIRED');
  if(ledger.seasonDevelopments.includes(seasonYear))return{accepted:false,reason:'already_applied'};
  if(typeof advanceSeason!=='function')throw new Error('ATTRIBUTES08_SEASON_UNAVAILABLE');
  // Career07.finishSeason already increments ages. Feed 08 the pre-rollover
  // age while retaining Career07 as the only owner of the calendar transition.
  const squads=state.clubs.map(club=>advanceSeason(alreadyAged
    ? club.players.map(p=>({...p,age:p.age-1})) : club.players,
    {seed:state.seed+'|'+club.id,season:String(seasonYear)+'-'+String(seasonYear+1)}));
  squads.forEach((players,i)=>{
    if(!Array.isArray(players)||players.length!==state.clubs[i].players.length||
       players.some((p,j)=>p.id!==state.clubs[i].players[j].id ||
         p.contract?.weeklyWage!==state.clubs[i].players[j].contract?.weeklyWage))
      throw new Error('ATTRIBUTES08_INVALID_SEASON_RESULT');
  });
  squads.forEach((players,i)=>{state.clubs[i].players=players});
  ledger.seasonDevelopments.push(seasonYear);
  return {accepted:true,seasonYear,clubs:squads.length};
}
