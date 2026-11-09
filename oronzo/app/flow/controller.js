/** ORONZO R03: headless career flow. No UI/rendering, no fabricated coach morale.
 * Dependencies: Career07, real Board09, MatchEngine06, Copy04 press.
 */
import { newCareer, getUpcomingFixture, fixturesForWeek, registerResult, advanceWeek,
  finishSeason, applyBoardDecision, applyJobOffer } from '../../systems/career/career.js';
import { createInitialOffers, listInitialOffers as offersView,
  selectInitialOffer } from '../../systems/career/offers-r03.js';
import { assignWorldToClubs, getClubGeography } from '../../systems/career/world.js';
import { simulateOtherFixture } from '../../systems/career/uncontrolled-fixtures.js';
import { seededRandom } from '../../systems/career/league.js';
import { createSaveManager, serialize, deserialize } from '../../systems/career/save.js';
import { createClub, createCoach, prepareMatchday, conveneBoard,
  reviewMatch, endClubWeek, resolveClubPresident,
  previewOfferMorale, applyOfferEffect, applyPressEffect } from '../../systems/coach-club/index.js';
import { createMatch } from '../../systems/match-engine/match-engine.js';
import { createPressConference, answerPressConference } from '../../content/press-kit.js';
import { generatePlayer as generateAttributesPlayer } from '../../systems/attributes/generator.js';
import { normalizePlayer as normalizeAttributesPlayer } from '../../systems/attributes/player-model.js';
import { applyTrainingWeek, applyMatchLoad, advanceSeason } from '../../systems/attributes/training.js';
import { chooseTrainingPlan } from '../../systems/coach-club/index.js';
import { ensureM1Ledger, attachSourcedPlayers, chooseM1Training, settleM1Training,
  issueM1Command, settleM1MatchLoad, journalM1Shouts, settleM1Season
} from './m1-contract.js';

export const FLOW_VERSION=1;
export const START_YEAR=1979;
export const MATCH_SIM_SECONDS_PER_REAL_SECOND=6; // 5400 simulated / 900 real = 15 min at 1x
const clone=value=>JSON.parse(JSON.stringify(value));
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const knownMacros=new Set(['north','centre','south']);
const macroAlias=Object.freeze({nord:'north',centro:'centre',sud:'south'});
const normalizeOrigin=origin=>{
  if(!origin)return null;
  const result=clone(origin);
  if(result.macroRegion in macroAlias)result.macroRegion=macroAlias[result.macroRegion];
  return result;
};
const commitDraft=(state,draft)=>{
  for(const key of Object.keys(state))delete state[key];
  Object.assign(state,draft);
};
function preflightOfferGeography(state,club) {
  const origin=state.coach.origin, missing=[];
  for(const [label,geo] of [['coach',origin],['club',club]]) {
    if(typeof geo?.regionId!=='string'||!geo.regionId.trim())missing.push(label+'.regionId');
    if(!knownMacros.has(geo?.macroRegion))missing.push(label+'.macroRegion');
  }
  if(origin?.regionId===club?.regionId && origin?.macroRegion!==club?.macroRegion)
    missing.push('region_macroRegion_mismatch');
  return missing.length ? {
    accepted:false,reason:'geography_required',messageKey:'oronzo.geography_required',
    missing,worldStatus:state.world?.datasetStatus??'unknown'
  } : null;
}
const dateAt=(year,week,month=8,day=1)=>{
  const date=new Date(Date.UTC(year,month-1,day)+ (week-1)*7*86400000);
  return date.toISOString().slice(0,10);
};
function ensureLive(state) {
  if(!state?.flow || state.flow.version!==FLOW_VERSION)throw new Error('Flow V1 state required');
  if(state.coach.gameOver || state.coach.morale===0)throw new Error('GAME_OVER: coach morale exhausted');
}
function clubById(state,id) {
  const club=state.clubs.find(c=>c.id===id);
  if(!club)throw new Error('Unknown club: '+id);
  return club;
}
const lineUp=club=>{
  const eligible=club.players.filter(p=>!p.status?.injuryDays&&!p.status?.suspensionMatches&&
    p.status?.health!==0);
  const keeper=eligible.find(p=>p.positions?.includes('GK'));
  const others=eligible.filter(p=>!p.positions?.includes('GK')).slice(0,10);
  if(!keeper || others.length<10)throw new Error('Not enough fit players for XI: '+club.id);
  const xi=[keeper.id,...others.map(p=>p.id)];
  const bench=eligible.filter(p=>!xi.includes(p.id)).slice(0,5).map(p=>p.id);
  return {xi,bench,captainId:others[0].id};
};
const uiPlayer=(state,id)=>{
  const club=state.clubs.find(c=>c.players.some(p=>p.id===id));
  if(!club)throw new Error('Unknown player');
  const player=club.players.find(p=>p.id===id),kit=club.visualKits?.home??null;
  const visual=player.visual??null;
  const appearance=visual && kit ? {
    playerId:player.id,role:player.positions?.[0]??null,
    skinToneId:visual.skinToneId, hairColorId:visual.hairColorId,
    hairStyleId:visual.hairStyleId, facialHairStyleId:visual.facialHairStyleId,
    facialHairColorId:visual.facialHairColorId,
    portraitAssetId:visual.portraitAssetId??null,
    shirtA:kit.shirtA,shirtB:kit.shirtB,shirtPatternId:kit.shirtPatternId,
    shorts:kit.shorts,socks:kit.socks,trim:kit.trim
  } : null;
  return clone({playerId:player.id,clubId:club.id,player,visual,visualKits:club.visualKits??null,
    kitId:'home',appearance,
    appearanceStatus:appearance?'ready':'awaiting_canonical_visual_data_from_08_01'});
};
function pressContext(state, extra={}) {
  const club=clubById(state,state.coach.clubId);
  return {clubId:club.id,clubObjective:club.seasonObjective,
    president:null,clubCash:club.finance?.cash??club.budget,
    coachMorale:state.coach.morale??null, ...extra};
}
function startPress(state,phase,press,sessionKey,context={}) {
  if(state.flow.press[phase])return state.flow.press[phase];
  const catalog=press?.[phase],media=press?.media;
  if(!catalog || !media) return null; // Clear dependency, no dummy questions.
  const session=createPressConference({
    catalog,media,phase,context:pressContext(state,context),
    careerSeed:state.seed,sessionKey
  });
  state.flow.press[phase]=session;
  return session;
}
function recordEffect(state,eventId,kind,semanticEffects,additional={}) {
  if(own(state.flow.effectTransactions,eventId))
    return {status:state.flow.effectTransactions[eventId].status,duplicate:true};
  const stored={eventId,kind,semanticEffects:clone(semanticEffects),
    status:'awaiting_agent09',...additional};
  if(state.flow.effectsMode!=='isolated_test') {
    const applier=kind==='initial_offer' ? applyOfferEffect :
      kind==='press' ? applyPressEffect : null;
    if(typeof applier!=='function')throw new Error('AGENT09_MORALE_UNAVAILABLE');
    const club=state.coach.clubId?clubById(state,state.coach.clubId):null;
    const result=applier({
      eventId,kind,semanticEffects:clone(semanticEffects),offer:additional.offer??null,
      coach:clone(state.coach),club:club?clone(club):null,date:state.gameDate
    });
    const applied=Boolean(result?.accepted===true && result.coach);
    const replay=Boolean(result?.accepted===false &&
      ['already_applied','source_already_applied'].includes(result.reason) &&
      result.coach?.moraleEvents?.some(e=>e.eventId===eventId));
    if(!applied && !replay)
      throw new Error('AGENT09_MORALE_NOT_APPLIED: '+String(result?.reason??'invalid_result'));
    state.coach=clone(result.coach);
    if(result.club) {
      const index=state.clubs.findIndex(c=>c.id===result.club.id);
      if(index<0)throw new Error('AGENT09_UNKNOWN_CLUB');
      state.clubs[index]=clone(result.club);
    }
    stored.status='applied';
    stored.moraleEventId=eventId;
    stored.moraleAfter=state.coach.morale;
  }
  state.flow.effectTransactions[eventId]=stored;
  return {status:stored.status,duplicate:false};
}
function answerPress(state,phase,questionId,answerId,{press}={}) {
  ensureLive(state);
  const stage=phase==='opening'?'opening_press':'postmatch_press';
  if(state.flow.stage!==stage)return {accepted:false,reason:'wrong_stage'};
  const draft=clone(state); // The coach event and the conference answer commit together.
  const key=phase==='opening'?draft.flow.acceptedOfferId:draft.flow.finalMatch?.fixtureId;
  const context=phase==='postmatch'?{
    matchFinal:true,matchId:key,result:draft.flow.finalMatch.result,
    venue:draft.flow.finalMatch.homeId===draft.coach.clubId?'home':'away'
  }:{};
  const session=startPress(draft,phase,press,key,context);
  if(!session)return {accepted:false,reason:'press_catalog_required'};
  const answer=answerPressConference(session,questionId,answerId);
  if(!answer.accepted)return answer;
  const status=recordEffect(draft,answer.effectTransactionId,'press',answer.semanticEffects);
  draft.flow.press[phase]=answer.session;
  if(answer.session.completed)draft.flow.stage=phase==='opening'?'hub':'postmatch_ready';
  commitDraft(state,draft);
  return {...answer,effectStatus:status.status};
}

export function newGame({seed=1979,avatar,municipalityCatalog=null,coachName='Il Mister',
  leagueSizes,playerVisualById={},clubVisualKitsById={},startDate='1979-08-01',
  effectsMode='integrated',surnameCatalog=null,playerOrigins=[]}={}) {
  if(!Number.isSafeInteger(seed))throw new Error('seed must be an integer');
  if(!['integrated','isolated_test'].includes(effectsMode))
    throw new Error('Unknown morale integration mode');
  if(!avatar || !String(avatar.id??'').trim())throw new Error('Selected avatar ID required');
  const traits=avatar.traits;
  if(!traits || ['luck','leadership','selfEsteem','patience']
    .some(k=>!Number.isInteger(traits[k]) || traits[k]<0 || traits[k]>100))
    throw new Error('Avatar must define four 0..100 integer traits');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
     !Number.isFinite(Date.parse(startDate)) || !startDate.startsWith('1979-'))
    throw new Error('Start date must be an explicit 1979 date');
  const state=newCareer({startYear:START_YEAR,coachName,leagueSizes},seed);
  const assignment=assignWorldToClubs(state.clubs,seed,municipalityCatalog);
  // Caller supplies visual identity owned by Agent08 and kits owned by the club.
  // We keep these unchanged: no alternative generator or fabricated portrait.
  const knownPlayers=new Set(assignment.clubs.flatMap(c=>c.players.map(p=>p.id)));
  const knownClubs=new Set(assignment.clubs.map(c=>c.id));
  if(Object.keys(playerVisualById).some(id=>!knownPlayers.has(id)) ||
     Object.keys(clubVisualKitsById).some(id=>!knownClubs.has(id)))
    throw new Error('Unknown visual player/club ID');
  for(const club of assignment.clubs) {
    if(own(clubVisualKitsById,club.id))club.visualKits=clone(clubVisualKitsById[club.id]);
    for(const player of club.players)
      if(own(playerVisualById,player.id))player.visual=clone(playerVisualById[player.id]);
  }
  state.clubs=assignment.clubs.map(c=>({
    ...createClub(c),
    // createClub owns finance/board fields; 07 owns geography and kit identity.
    ...(c.municipalityId?{municipalityId:c.municipalityId}:{}),
    ...(c.regionId?{regionId:c.regionId}:{}),
    ...(c.macroRegion?{macroRegion:c.macroRegion}:{}),
    ...(c.provinceCode?{provinceCode:c.provinceCode}:{}),
    ...(c.geographicSourceId?{geographicSourceId:c.geographicSourceId}:{}),
    ...(c.geographicReferenceYear?{geographicReferenceYear:c.geographicReferenceYear}:{}),
    ...(c.visualKits?{visualKits:clone(c.visualKits)}:{})
  }));
  state.world=assignment.world;
  if(state.world.data && avatar.origin?.municipalityId) {
    const originRecord=state.world.data.records.find(r=>
      r.municipalityId===avatar.origin.municipalityId);
    if(!originRecord)throw new Error('Coach home city not found in supplied catalog');
    const selectedOrigin=normalizeOrigin(avatar.origin);
    if(selectedOrigin.regionId!==originRecord.regionId ||
       selectedOrigin.macroRegion!==originRecord.macroRegion)
      throw new Error('Coach origin region conflicts with supplied catalog');
  }
  state.coach=createCoach({...state.coach,clubId:null,contract:null,avatarId:avatar.id,
    origin:normalizeOrigin(avatar.origin),traits:clone(traits),hiredSeason:START_YEAR,
    employmentHistory:[],gameOver:null});
  // Agent09 createCoach supplies numerical V2 morale, moraleEvents and relationships.
  state.gameDate=startDate;
  state.calendarPolicy={kind:'gameplay_assumption',seasonStartMonth:Number(startDate.slice(5,7)),
    seasonStartDay:Number(startDate.slice(8,10)),
    description:'Configured gameplay date, not a verified 1979 fixture date'};
  state.rngState={version:1,mode:'seed_derived_per_event',seed,cursor:0};
  state.flow={version:FLOW_VERSION,stage:'offers',initialOffers:[],acceptedOfferId:null,
    acceptedOffer:null,press:{opening:null,postmatch:null},
    finalMatch:null,pendingMatch:null,resultSources:{},
    effectTransactions:{},history:[],effectsMode,
    pressDependency:effectsMode==='isolated_test'?'isolated_test_only':'agent09_integrated'};
  createInitialOffers(state);
  ensureM1Ledger(state);
  if(surnameCatalog) {
    const result=enableM1SourcedPlayers(state,{surnameCatalog,playerOrigins});
    if(!result.accepted)throw new Error('M1_SURNAMES_UNAVAILABLE: '+result.reason);
  }
  return state;
}

/** Consume actual 08 generator PlayerV2 and its sourced surname records once.
 * PR #31 adds the verified surnameId; main fallback names are explicitly rejected.
 * We never invent a player birth municipality when 08 has none.
 */
export function enableM1SourcedPlayers(state,{surnameCatalog,playerOrigins=[]}={}) {
  if(state.flow?.stage!=='offers'||state.flow.acceptedOfferId)
    return {accepted:false,reason:'initial_world_only'};
  if(!surnameCatalog?.source?.id || !surnameCatalog?.source?.license ||
     !Array.isArray(surnameCatalog.surnames)||surnameCatalog.surnames.length<500)
    return {accepted:false,reason:'verified_surname_catalog_required'};
  if(!Array.isArray(playerOrigins))throw new TypeError('playerOrigins must be an array');
  if(state.flow.m1?.playerDataset)return {accepted:false,reason:'already_attached'};
  const squadsByClub=Object.fromEntries(state.clubs.map(club=>[
    club.id,club.players.map((old,index)=>
      generateAttributesPlayer({seed:state.seed,teamId:club.id,index,
        role:old.positions[0],teamLevel:club.reputation,
        surnameCatalog,origins:playerOrigins}))
  ]));
  try {
    return attachSourcedPlayers(state,{
      squadsByClub,dataset:{sourceId:surnameCatalog.source.id,
        version:String(surnameCatalog.source.datasetSnapshotId ??
          surnameCatalog.source.year ?? surnameCatalog.schemaVersion),
        license:surnameCatalog.source.license,surnames:surnameCatalog.surnames},
      normalizePlayer:normalizeAttributesPlayer
    });
  } catch(e) {
    if(String(e).includes('SOURCED_PLAYER_MISMATCH'))
      return {accepted:false,reason:'attributes08_verified_surname_output_required'};
    throw e;
  }
}
export function selectM1Training(state,options) {
  return chooseM1Training(state,{...options,chooseTrainingPlan});
}
/** The UI12 caller keeps the exact engine handle returned by prepareMatch. */
export function commandM1Match(state,engine,request) {
  const outcome=issueM1Command(state,engine,request);
  if(outcome.accepted && request.type==='tacticChange')
    state.coach.tactics={...state.coach.tactics,...outcome.engineResult.effects.tactics};
  return outcome;
}

export function listInitialOffers(state) { return offersView(state); }
export function acceptOffer(state,offerId,{press}={}) {
  ensureLive(state);
  const found=state.flow.initialOffers.find(o=>o.id===offerId);
  if(!found)return {accepted:false,reason:'unknown_offer'};
  if(state.flow.acceptedOfferId)return {
    accepted:false,reason:state.flow.acceptedOfferId===offerId?'already_accepted':'opening_contract_already_signed'
  };
  const club=clubById(state,found.clubId);
  if(state.flow.effectsMode!=='isolated_test') {
    // In real gameplay location is mandatory. Never infer an Italian region for
    // fictional demo clubs and never partially sign an unpreviewable contract.
    const unavailable=preflightOfferGeography(state,club);
    if(unavailable)return unavailable;
  }
  const draft=clone(state);
  const preview=draft.flow.effectsMode==='isolated_test' ? null :
    previewOfferMorale(clone(draft.coach),clone(found),clone(club));
  const accepted=selectInitialOffer(draft,offerId);
  if(!accepted.accepted)return accepted;
  const eventId='offer-morale:'+offerId;
  const effect=recordEffect(draft,eventId,'initial_offer',{preview},{offer:found});
  startPress(draft,'opening',press,offerId);
  commitDraft(state,draft);
  return {...accepted,effectStatus:effect.status,previewMorale:preview};
}

export function answerOpeningPress(state,questionId,answerId,options) {
  return answerPress(state,'opening',questionId,answerId,options);
}
export function answerPostMatchPress(state,questionId,answerId,options) {
  return answerPress(state,'postmatch',questionId,answerId,options);
}
export function getRosterPlayer(state,playerId) { return uiPlayer(state,playerId); }
export function getTrainingPlayer(state,playerId) { return uiPlayer(state,playerId); }

/** Single authoritative answer for UI12 and matchday progression.
 * A club can have fewer rounds than the longest division: that is a bye week,
 * not an unplayed fixture and never a reason to fabricate a coach match.
 */
export function getCoachWeekStatus(state) {
  const base={seasonYear:state.seasonYear,week:state.week,
    absoluteWeek:state.absoluteWeek,fixtureId:null,canAdvance:false};
  if(state.phase==='seasonComplete')
    return {...base,kind:'season_complete',canRollover:state.flow?.stage==='season_complete'};
  if(state.phase!=='inSeason')return {...base,kind:'season_inactive'};
  if(!state.coach?.clubId)return {...base,kind:'unemployed',
    canAdvance:state.flow?.stage==='unemployed'};
  const fixture=fixturesForWeek(state).find(f=>
    f.homeId===state.coach.clubId||f.awayId===state.coach.clubId);
  if(!fixture)return {...base,kind:'bye_week',
    canAdvance:state.flow?.stage==='hub'&&!state.flow?.pendingMatch};
  if(!fixture.result)return {...base,kind:'match_pending',fixtureId:fixture.id};
  return {...base,kind:'match_recorded',fixtureId:fixture.id,
    canAdvance:state.flow?.stage==='postmatch_ready'};
}

export function getStateForUI(state) {
  const club=state.coach.clubId?clubById(state,state.coach.clubId):null;
  return clone({
    version:state.flow?.version??null,stage:state.flow?.stage??'legacy_career',
    gameDate:state.gameDate??null,seasonYear:state.seasonYear,seasonWeek:state.week,
    coachWeekStatus:getCoachWeekStatus(state),
    absoluteWeek:state.absoluteWeek,coach:state.coach,
    club:club?{id:club.id,name:club.name,divisionId:club.divisionId,
      presidentId:club.presidentId,world:getClubGeography(state,club.id),
      players:club.players.map(p=>({playerId:p.id,name:p.name,positions:p.positions,
        visual:p.visual??null}))}:null,
    offers:state.flow?.initialOffers??[],careerOffers:state.offers,
    press:state.flow?.press??null,upcomingFixture:getUpcomingFixture(state),
    resultSources:state.flow?.resultSources??{},
    pendingEffectTransactions:Object.values(state.flow?.effectTransactions??{})
      .filter(e=>e.status!=='applied'),
    worldStatus:state.world?.datasetStatus??'legacy',worldMode:state.world?.mode??'legacy',
    m1:state.flow?.m1?{version:state.flow.m1.version,
      playerDataset:state.flow.m1.playerDataset,
      training:state.flow.m1.training,
      matchCommands:state.flow.m1.matchCommands,
      persistentEvents:state.flow.m1.persistentEvents,
      matchLoads:state.flow.m1.matchLoads,
      seasonDevelopments:state.flow.m1.seasonDevelopments}:null,
    gameOver:state.coach.gameOver??(state.coach.morale===0?{reason:'morale_zero'}:null)
  });
}
export function prepareMatch(state,{xi,bench,captainId}={}) {
  ensureLive(state);
  if(state.flow.stage!=='hub'&&state.flow.stage!=='pre_match')
    return {accepted:false,reason:'wrong_stage'};
  const weekStatus=getCoachWeekStatus(state);
  if(weekStatus.kind==='bye_week')return {
    accepted:false,reason:'bye_week',canAdvance:weekStatus.canAdvance,
    expectedAbsoluteWeek:weekStatus.absoluteWeek
  };
  if(weekStatus.kind==='match_recorded')
    return {accepted:false,reason:'coach_match_already_recorded'};
  const fixture=getUpcomingFixture(state);
  if(!fixture)return {accepted:false,reason:'no_coach_fixture'};
  if(state.flow.pendingMatch && state.flow.pendingMatch.fixtureId!==fixture.id)
    throw new Error('Another match is pending');
  const club=clubById(state,state.coach.clubId);
  const home=clubById(state,fixture.homeId),away=clubById(state,fixture.awayId);
  const ownerXI=xi??lineUp(club).xi;
  const ownerBench=bench??lineUp(club).bench;
  const ownerCaptain=captainId??ownerXI.find(id=>!club.players.find(p=>p.id===id).positions.includes('GK'));
  const formation=prepareMatchday(club,state.coach,{
    xi:ownerXI,bench:ownerBench,captainId:ownerCaptain
  });
  if(!formation.accepted)return formation;
  const other=lineUp(home.id===club.id?away:home);
  const isHome=fixture.homeId===club.id;
  const matchSeed=Math.floor(seededRandom('match06:'+state.seed+':'+fixture.id)()*4294967296);
  const input={seed:matchSeed,homeClub:home,awayClub:away,
    homeXI:isHome?formation.selection.xi:other.xi,
    awayXI:isHome?other.xi:formation.selection.xi,
    homeBench:isHome?formation.selection.bench:other.bench,
    awayBench:isHome?other.bench:formation.selection.bench,
    homeTactics:isHome?formation.selection.tactics:state.coach.tactics,
    awayTactics:isHome?state.coach.tactics:formation.selection.tactics,
    competitionRules:{maxSubstitutions:2}};
  const engine=createMatch(input); // Actual Match Engine 06; no synthetic score for played matches.
  state.flow.pendingMatch={fixtureId:fixture.id,homeId:home.id,awayId:away.id,seed:matchSeed,
    lineup:clone(formation.selection),phase:'prepared'};
  state.flow.stage='pre_match';
  return {accepted:true,fixture:clone(fixture),matchInput:input,engine,
    engineProvenance:{fixtureId:fixture.id,seed:matchSeed,source:'match-engine-06'},
    timeScale:{simulatedSeconds:5400,realSecondsAt1x:900}};
}
export function tickMatch(engine,realSeconds,{speed=1}={}) {
  if(![1,2,4,8].includes(speed)||!Number.isFinite(realSeconds)||realSeconds<0)
    throw new Error('Invalid match speed/time');
  return engine.step(realSeconds*MATCH_SIM_SECONDS_PER_REAL_SECOND*speed);
}
export function consumeMatchResult(state,engine,{press}={}) {
  ensureLive(state);
  if(state.flow.stage!=='pre_match'||!state.flow.pendingMatch)
    return {accepted:false,reason:'no_prepared_match'};
  if(!engine || typeof engine.isFinished!=='function' || !engine.isFinished())
    return {accepted:false,reason:'engine_not_fulltime'};
  const meta=state.flow.pendingMatch,fixture=fixturesForWeek(state).find(f=>f.id===meta.fixtureId);
  if(!fixture || fixture.result)return {accepted:false,reason:'already_recorded'};
  const final=engine.snapshot(),events=engine.getEventsSince(0);
  if(final.phase!=='fulltime'||final.t!==5400)throw new Error('Invalid Match Engine 06 fulltime');
  const score={home:final.score.home,away:final.score.away};
  const normalizedEvents=events.map(e=>({...e,id:String(e.id)}));
  registerResult(state,{fixtureId:fixture.id,homeId:fixture.homeId,awayId:fixture.awayId,
    score,events:normalizedEvents});
  // 08 is the sole owner of fatigue/fitness formulas. The engine's
  // substitution event times determine played minutes once per fixture.
  const matchLoad=settleM1MatchLoad(state,{
    fixtureId:fixture.id,teamId:state.coach.clubId,
    startingXI:meta.lineup.xi,events:normalizedEvents,applyMatchLoad
  });
  if(!matchLoad.accepted)throw new Error('M1_MATCH_LOAD_REJECTED: '+matchLoad.reason);
  // 06 already applied temporary shout modifiers. 09 has not yet exported a
  // player-trust consumer; journal suggestions, never invent a permanent delta.
  journalM1Shouts(state,{fixtureId:fixture.id,events:normalizedEvents});
  const coachHome=fixture.homeId===state.coach.clubId;
  const ours=coachHome?score.home:score.away,opponent=coachHome?score.away:score.home;
  const result=ours>opponent?'win':ours<opponent?'loss':'draw';
  state.flow.resultSources[fixture.id]='match_engine_06';
  state.flow.finalMatch={fixtureId:fixture.id,homeId:fixture.homeId,awayId:fixture.awayId,
    score,result,phase:'fulltime',t:5400,eventCount:events.length};
  state.flow.stage='postmatch_press';
  state.flow.press.postmatch=null;
  startPress(state,'postmatch',press,fixture.id,
    {matchFinal:true,matchId:fixture.id,result,venue:coachHome?'home':'away'});
  return {accepted:true,fixtureId:fixture.id,score,result,
    pressReady:!!state.flow.press.postmatch,source:'match_engine_06'};
}

export function advanceMatchday(state,{presidentCatalog,simulateFixture=simulateOtherFixture,
  expectedAbsoluteWeek}={}) {
  ensureLive(state);
  // Use a period precondition in UI clicks/retries. Unemployed coaches may advance
  // repeatedly, so without it a network/button replay could skip another week.
  if(expectedAbsoluteWeek!==undefined && expectedAbsoluteWeek!==state.absoluteWeek)
    return {accepted:false,reason:'stale_week_action'};
  if(state.phase!=='inSeason')return {accepted:false,reason:'season_not_active'};
  const weekStatus=getCoachWeekStatus(state);
  if(weekStatus.kind==='unemployed' && expectedAbsoluteWeek===undefined)
    return {accepted:false,reason:'expected_week_required_when_unemployed'};
  if(weekStatus.kind==='bye_week' && expectedAbsoluteWeek===undefined)
    return {accepted:false,reason:'expected_week_required_when_bye'};
  const permitted=weekStatus.kind==='match_recorded'
    ? state.flow.stage==='postmatch_ready'
    : weekStatus.canAdvance;
  if(!permitted)
    return {accepted:false,reason:weekStatus.kind==='match_pending'
      ? 'coach_match_not_recorded':'postmatch_press_not_completed'};
  if(!presidentCatalog)return {accepted:false,reason:'president_catalog_required'};
  const draft=clone(state); // Atomic: no scores, payroll or meeting committed on exception.
  const playerClub=draft.coach.clubId;
  const period={week:draft.week,absoluteWeek:draft.absoluteWeek,seasonYear:draft.seasonYear};
  const fixtures=fixturesForWeek(draft);
  const coachFixture=playerClub
    ?fixtures.find(f=>f.homeId===playerClub||f.awayId===playerClub):null;
  if(coachFixture && !coachFixture.result)
    return {accepted:false,reason:'coach_match_not_recorded'};
  if(weekStatus.kind==='bye_week' && (draft.flow.pendingMatch || draft.flow.finalMatch))
    return {accepted:false,reason:'unexpected_coach_match_on_bye'};
  for(const fixture of fixtures)if(!fixture.result){
    if(fixture.homeId===playerClub||fixture.awayId===playerClub)
      throw new Error('Coach match cannot be AI-simulated');
    const result=simulateFixture(draft,fixture);
    registerResult(draft,result);
    draft.flow.resultSources[fixture.id]='deterministic_uncontrolled_fixture_v1';
  }
  let dismissed=false;
  for(let i=0;i<draft.clubs.length;i++) {
    let club=draft.clubs[i];
    if(club.id===playerClub) {
      const president=resolveClubPresident(club,presidentCatalog);
      const meeting=conveneBoard(club,president,{...period,seed:draft.seed});
      if(meeting.accepted)club=meeting.club;
      else if(meeting.reason!=='already_met_this_week')
        throw new Error('Board meeting denied: '+meeting.reason);
      // Weekly board meetings may still occur on a bye; reviewing a match
      // without a real fixture would invent a coach performance and corrupt trust.
      if(coachFixture) {
        const reviewed=reviewMatch(club,president,{
          ...period,matchId:coachFixture.id,homeClubId:coachFixture.homeId,
          awayClubId:coachFixture.awayId,
          snapshot:{phase:'fulltime',t:5400,score:coachFixture.result.score}
        },draft.seed);
        if(!reviewed.accepted && reviewed.reason!=='already_recorded')
          throw new Error('Board review denied: '+reviewed.reason);
        if(reviewed.accepted) {club=reviewed.club;dismissed=reviewed.dismissed;}
      }
    }
    const settled=endClubWeek(club,period);
    if(!settled.accepted)throw new Error('Payroll denied: '+settled.reason);
    draft.clubs[i]=settled.club;
  }
  // Training plans are explicit and week-bound; do not silently invent a plan.
  const training=settleM1Training(draft,{applyTrainingWeek});
  if(!training.accepted && !['no_training_selected','already_applied'].includes(training.reason))
    throw new Error('M1_TRAINING_REJECTED: '+training.reason);
  const matchday=period.absoluteWeek;
  advanceWeek(draft);
  if(dismissed && playerClub)applyBoardDecision(draft,{type:'dismiss',clubId:playerClub});
  const weekType=coachFixture?'played_match':playerClub?'bye_week':'unemployed';
  draft.flow.history.push({seasonYear:period.seasonYear,week:period.week,
    absoluteWeek:period.absoluteWeek,fixtureCount:fixtures.length,
    playedFixtureId:coachFixture?.id??null,weekType});
  draft.flow.pendingMatch=null;draft.flow.finalMatch=null;draft.flow.press.postmatch=null;
  draft.flow.stage=draft.phase==='seasonComplete'?'season_complete':
    draft.coach.clubId?'hub':'unemployed';
  draft.gameDate=dateAt(draft.seasonYear,draft.week,draft.calendarPolicy.seasonStartMonth,
    draft.calendarPolicy.seasonStartDay);
  // Replace validated state only after all per-club finance and game rules succeed.
  for(const k of Object.keys(state))delete state[k];
  Object.assign(state,draft);
  return {accepted:true,completedAbsoluteWeek:matchday,nextStage:state.flow.stage,
    gameDate:state.gameDate,weekType,playedFixtureId:coachFixture?.id??null,
    simulatedOtherFixtures:fixtures.length-(coachFixture?1:0)};
}
export function rolloverSeason(state) {
  ensureLive(state);
  if(state.flow.stage!=='season_complete')return {accepted:false,reason:'season_not_complete'};
  const draft=clone(state),endingYear=draft.seasonYear;
  finishSeason(draft);
  if(draft.flow.m1) {
    const result=settleM1Season(draft,{advanceSeason,seasonYear:endingYear,alreadyAged:true});
    if(!result.accepted && result.reason!=='already_applied')
      throw new Error('M1_SEASON_REJECTED: '+result.reason);
  }
  draft.gameDate=dateAt(draft.seasonYear,1,draft.calendarPolicy.seasonStartMonth,
    draft.calendarPolicy.seasonStartDay);
  draft.flow.stage=draft.coach.clubId?'hub':'unemployed';
  commitDraft(state,draft);
  return {accepted:true,seasonYear:state.seasonYear,gameDate:state.gameDate};
}
export function takeCareerOffer(state,offerId) {
  ensureLive(state);
  if(state.flow.stage!=='unemployed')return {accepted:false,reason:'coach_not_unemployed'};
  applyJobOffer(state,offerId);
  state.flow.stage='hub';
  return {accepted:true,clubId:state.coach.clubId};
}
export function saveGame(state,storage,{key='oronzo.career.flow.r03'}={}) {
  // The 06 handle has no hydrate/serialize API: only save between matches.
  if(['pre_match','match_live'].includes(state?.flow?.stage))
    throw new Error('MID_MATCH_SAVE_UNSUPPORTED: save before preparation or after fulltime');
  return createSaveManager(storage,key).save(state);
}
export function loadGame(storage,{key='oronzo.career.flow.r03'}={}) {
  // Preserve the old v2 localStorage key and its 1985 date, without rewriting it.
  const loaded=createSaveManager(storage,key).load();
  if(loaded)return {...loaded,legacy:false};
  if(key==='oronzo.career.flow.r03') {
    const legacy=createSaveManager(storage,'oronzo.career.v2').load();
    if(legacy)return {...legacy,legacy:true};
  }
  return null;
}
export function exportGame(state) { return serialize(state); }
export function importGame(json) { return deserialize(json); }
