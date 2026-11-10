/** ORONZO 03 R03 — mobile career runtime. Imports 07/09/06/05; no parallel simulation. */
import {newGame,listInitialOffers,acceptOffer,getStateForUI,answerOpeningPress,
  answerPostMatchPress,prepareMatch,tickMatch,consumeMatchResult,advanceMatchday,
  rolloverSeason,saveGame,loadGame,takeCareerOffer,getRosterPlayer,getTrainingPlayer,selectM1Training,exportGame,importGame}
  from '../../app/flow/controller.js';
import {qaMunicipalityCatalog} from '../../app/flow/tests/qa-geography.mjs';
import {BUILTIN_SURNAME_CATALOG} from '../../systems/attributes/surnames.js';
import {newCareerSeedR12} from '../../systems/career/seed-r12.js';
import {decideCareerNarrativeR12} from '../../content/career-narrative-r12.js';
import {ensureCareerVisualsR12,appearanceForMatchR12} from '../../systems/attributes/visual-r12.js';
import {effectiveCoachTraitsR12} from '../../systems/coach-club/president-traits-r12.js';
import {previewOfferMorale} from '../../systems/coach-club/index.js';
import {getStandings} from '../../systems/career/career.js';
import {createMatchView,createEngineViewBridge} from '../../systems/match-view/match-view.js';
import {formationAnchors,FORMATIONS} from '../../systems/match-engine/movement.js';
import {commandM1Match} from '../../app/flow/controller.js';
import {renderPresidentOperations} from './sections-r11/management-ui.js';
import {renderLeaguePage} from './sections-r11/league-ui.js';
import {renderPlayerCard,renderTrainingPanel,renderRosterLinks,renderSupportersPanel,
  renderDeskAgenda,agendaSummary,trainingStatus,mountPlayerIllustration}
  from './sections-r11/sections.js';

const root=document.querySelector('#oronzo-r03'), area=document.querySelector('#ui-screen');
const status=document.querySelector('#ui-toast'), date=document.querySelector('#stageDate');
const label=document.querySelector('#qa-label');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(name,action,value='',extra='')=>`<button type="button" class="ui-btn ${extra}" data-action="${esc(action)}" data-value="${esc(value)}">${esc(name)}</button>`;
const head=(text,sub='CARRIERA · 1979')=>`<div class="screen-heading"><h1>${esc(text)}</h1><small>${esc(sub)}</small></div>`;
const pane=(title,html,extra='')=>`<section class="panel runtime-col ${extra}"><div class="panel-title">${esc(title)}</div>${html}</section>`;
const h=(html)=>`<div class="runtime-controls">${html}</div>`;
const portraits=(type,i)=>{const cols=type==='coach'?4:type==='president'?2:3;return `<span class="portrait ${type==='coach'?'':type==='president'?'president':'journalist'}" style="--px:${-(i%cols)*104}px;--py:${-Math.floor(i/cols)*128}px" aria-hidden="true"></span>`};
const baseCoaches=[
 ['Nino Bellavista',[56,78,47,72]],['Arturo Foschetti',[43,63,79,82]],
 ['Gino Mastrangelo',[71,81,58,39]],['Cesare Ghirlandini',[61,64,91,34]],
 ['Beppe Quattrocchi',[68,43,83,54]],['Goffredo Balsamo',[59,76,74,62]],
 ['Mario Cannizzaro',[48,82,67,87]],['Remo Filomeni',[73,59,52,61]]
];
const names=['FORTUNA','LEADERSHIP','AUTOSTIMA','PAZIENZA'];
const QA=qaMunicipalityCatalog();
let REAL=null; // Contemporary catalog is separate from synthetic QA fixtures.
let state=null, press=null, presidents=null, mode='normal', screen='entry', avatar=0, origin='',
 offerIndex=0, selectedHub='campionato', lineup=new Set(), bench=new Set(), captain=null,
 engine=null,matchInput=null,view=null,bridge=null,paused=true,speed=1,last=0,locking=false,
 lastEvent='',scoreSnapshot=null, showToastTimer=null, selectedPlayerId=null, profileSource='rosa', protectPreviousSave=false;
let errors=[], viewReady=false;
let trainingPlan='balanced',trainingIntensity=50,trainingRosterOpen=false,supportTab='stadio';
let dirtyUnsaved=false,lastSaveError='',actionSerial=0,cameraMode='full',matchToolsOpen=false,leagueTab='classifica',presidentTab='ufficio',formationChoice='4-4-2',pressingChoice=50,rosterFilter='ALL',rosterSort='name';
let integrationBackend=null;
const backendPromise=import('../../app/flow/management-r11.js')
 .then(m=>{integrationBackend=m; if(state&&screen!=='match')render();return m;})
 .catch(()=>null); // PR63 can be tested independently before backend PR is merged.
const durablePromise=import('../../app/flow/durable-save.js')
 .then(m=>m.createDurableSaveManager({indexedDB:globalThis.indexedDB,legacyStorage:localStorage}))
 .catch(()=>null);
const activeStage=()=>state?.flow?.stage??'entry';
const getUI=()=>state?getStateForUI(state):null;
const dataOk=()=>!!press&&!!presidents;
function message(text){status.textContent=text;status.hidden=false;clearTimeout(showToastTimer);showToastTimer=setTimeout(()=>status.hidden=true,4600)}
function failure(reason){message(String(reason??'Azione non disponibile'));}
async function guard(action){if(locking)return;locking=true;try{await action()}catch(e){errors.push(String(e));failure(e?.message??e)}finally{locking=false}}
function api(result,success){if(result?.accepted===false){failure(result.reason==='geography_required'?'geography_required: località verificate non disponibili; usa DEMO TECNICA per provare':result.reason);return false}success?.();return true}
function restoreMode(){const qa=state?.world?.mode==='qa_fixture'||mode==='qa';label.textContent=qa?'DEMO TECNICA — LOCALITÀ SINTETICHE':REAL?'COMUNI REALI · DATI ATTUALI (NON 1979)':'CATALOGO COMUNI NON DISPONIBILE';date.textContent=(state?.gameDate||'1979-08-01')+(dirtyUnsaved?' · NON PERSISTITO':'')}
function display(next){screen=next;render()}
function saveErrorText(error){
 const code=String(error?.name||'')+' '+String(error?.message||error);
 if(/QuotaExceeded|quota|storage full/i.test(code))return 'Quota memoria esaurita';
 if(/SecurityError|NotAllowed|permission|denied/i.test(code))return 'Accesso alla memoria negato';
 if(/checksum|corrupt|invalid save|verify/i.test(code))return 'Verifica salvataggio fallita';
 return code.slice(0,160);
}
async function save({silent=false}={}){
 if(!state)return false;
 if(protectPreviousSave){
  if(silent){lastSaveError='Conferma sovrascrittura richiesta';dirtyUnsaved=true;restoreMode();return false;}
  if(!window.confirm('Esiste un salvataggio precedente. Vuoi sovrascriverlo con questa nuova carriera?')){
   lastSaveError='Sovrascrittura rifiutata';dirtyUnsaved=true;
   message('Salvataggio precedente conservato · nuova carriera NON PERSISTITA');
   restoreMode();return false;
  }
  protectPreviousSave=false;
 }
 const snapshot=JSON.parse(JSON.stringify(state));
 try {
  const durable=await durablePromise;
  const result=durable?await durable.save(snapshot):saveGame(snapshot,localStorage);
  lastSaveError='';dirtyUnsaved=false;restoreMode();
  if(!silent)message('Carriera verificata e salvata · '+result.sequence);
  return true;
 }catch(e){
  lastSaveError=saveErrorText(e);dirtyUnsaved=true;restoreMode();
  failure('NON PERSISTITO · '+lastSaveError+' · usa ESPORTA SALVATAGGIO');
  errors.push('SAVE_FAILED: '+String(e));
  return false;
 }
}
function persistAction(success){
 dirtyUnsaved=true;restoreMode();
 return save({silent:true}).then(ok=>{
  message(ok?success:'NON PERSISTITO · '+lastSaveError+' · progressi solo in memoria');
  return ok;
 });
}
async function load(){
 try{
  const durable=await durablePromise;
  const payload=durable?await durable.load():loadGame(localStorage);
  if(!payload){message('Nessuna carriera salvata');return}
  if(payload.legacy){message('Salvataggio storico 1985 protetto. Usa il prototipo precedente.');return}
  clearMatch();protectPreviousSave=false;dirtyUnsaved=false;lastSaveError='';
  selectedPlayerId=null;profileSource='rosa';state=payload.state;
   const visualMigration=ensureCareerVisualsR12(state);
   if(visualMigration.players||visualMigration.kits)dirtyUnsaved=true;
  mode=state.world?.mode==='qa_fixture'?'qa':'normal';
  avatar=Math.max(0,baseCoaches.findIndex((_,i)=>'ui-r03-'+i===state.coach.avatarId));
  selectLineup();formationChoice=state.coach.tactics?.formation||'4-4-2';pressingChoice=state.coach.tactics?.pressing??50;
  const selection=getUI()?.m1?.training?.selected;trainingPlan=selection?.plan||'balanced';trainingIntensity=selection?.intensity??50;
  const stage=activeStage();
  display(stage==='offers'?'offers':stage==='opening_press'?'president':
   stage==='postmatch_press'?'press':stage==='postmatch_ready'?'post':
   stage==='pre_match'?'hub':stage==='season_complete'?'season':
   stage==='unemployed'?'unemployed':'hub');
  message('Carriera caricata · '+state.gameDate+
   (payload.recovered?' · copia di recupero':'')+
   (payload.provider?' · '+payload.provider:''));
 }catch(e){failure('CARICAMENTO FALLITO · '+saveErrorText(e));errors.push('LOAD_FAILED: '+String(e))}
}
function exportSave(){
 if(!state)return failure('Nessuna carriera da esportare');
 try{
  const content=exportGame(state);
  const blob=new Blob([content],{type:'application/json'});
  const link=document.createElement('a');
  link.href=URL.createObjectURL(blob);
  link.download='oronzo-carriera-'+state.seasonYear+'-sett-'+state.absoluteWeek+'.json';
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  message('Esportazione JSON avviata · verifica il file scaricato');
 }catch(e){failure('ESPORTAZIONE FALLITA · '+saveErrorText(e))}
}
async function importSave(file){
 if(!file)return;
 try{
  const candidate=importGame(await file.text());
  if(!window.confirm('Caricare questo file come carriera in memoria? Il salvataggio precedente non sarà cancellato.'))return;
  clearMatch();state=candidate;protectPreviousSave=true;dirtyUnsaved=true;
  selectLineup();display(activeStage()==='hub'?'hub':'entry');
  message('Importazione verificata · IN MEMORIA. Premi SALVA per confermare sovrascrittura.');
 }catch(e){failure('IMPORTAZIONE RIFIUTATA · '+saveErrorText(e))}
}
async function loadCopy(){
 const paths=['../../content/press-opening.json','../../content/press-postmatch.json','../../content/press-media.json','../../content/presidents.json'];
 const all=await Promise.all(paths.map(async p=>{
  const r=await fetch(p);if(!r.ok)throw new Error('COPY04 HTTP '+r.status+': '+p);return r.json();
 }));
 press={opening:all[0],postmatch:all[1],media:all[2]};presidents=all[3];
 try{
  const response=await fetch('../../data/world/municipalities-m1.json');
  if(!response.ok)throw new Error('HTTP '+response.status);
  const catalog=await response.json();
  if(catalog.reviewStatus!=='approved'||!Array.isArray(catalog.municipalities)||catalog.municipalities.length<100)
   throw new Error('WORLD_DATA_UNREVIEWED');
  REAL=catalog;origin=REAL.municipalities[0].municipalityId;
 }catch(e){REAL=null;errors.push('Catalogo comuni: '+e.message);}
 render();
}
function restartAfterGameOver(){
 // End the previous in-memory career only. Save slots are purposefully untouched.
 clearMatch();state=null;selectedPlayerId=null;profileSource='rosa';selectedHub='campionato';
 lineup=new Set();bench=new Set();captain=null;offerIndex=0;avatar=0;mode='normal';origin=REAL?.municipalities[0]?.municipalityId||'';
 protectPreviousSave=true;
 display('avatar');
 message('Nuova carriera: il salvataggio precedente resta protetto finché non decidi di sostituirlo.');
}
function newCareer(){
 if(!dataOk())return failure('Cataloghi Copy04 ancora non disponibili');
 const c=baseCoaches[avatar],catalog=mode==='qa'?QA:REAL;
 if(!catalog)return failure('Comuni non disponibili. Se vuoi provare la demo, abilita la modalità TEST.');
 const place=catalog.municipalities.find(x=>x.municipalityId===origin);
 if(!place)return failure('Seleziona un comune di origine valido');
 const originData={municipalityId:place.municipalityId,regionId:place.regionId,macroRegion:place.macroRegion};
 state=newGame({seed:newCareerSeedR12({query:window.location.search}),coachName:c[0],avatar:{id:'ui-r03-'+avatar,traits:{
  luck:c[1][0],leadership:c[1][1],selfEsteem:c[1][2],patience:c[1][3]
 },origin:originData},municipalityCatalog:catalog,surnameCatalog:BUILTIN_SURNAME_CATALOG});
 offerIndex=0;dirtyUnsaved=true;selectLineup();display('offers');
}

function selectLineup(){lineup=new Set();bench=new Set();captain=null;const club=getUI()?.club;if(!club)return;const eligible=club.players.filter(p=>{const full=state.clubs.find(c=>c.id===club.id).players.find(x=>x.id===p.playerId);return !(full.status?.injuryDays||full.status?.suspensionMatches||full.status?.health===0)});
 const gk=eligible.find(p=>p.positions.includes('GK'));if(gk)lineup.add(gk.playerId);for(const p of eligible.filter(x=>!x.positions.includes('GK')).slice(0,10))lineup.add(p.playerId);
 for(const p of eligible.filter(x=>!lineup.has(x.playerId)).slice(0,5))bench.add(p.playerId);captain=[...lineup].find(x=>x!==gk?.playerId)??null;}
function renderEntry(){return `<div class="runtime-entry" role="group" aria-label="Menu iniziale ORONZO"><div class="runtime-entry-visual"><img class="runtime-entry-photo" src="./office-desk-v02.png?v=s12-004" alt="Ufficio rétro con computer" decoding="async" fetchpriority="high"></div><div class="runtime-entry-actions">${btn('▶ NUOVA PARTITA','start','','gold-btn')}${btn('▣ CARICA PARTITA','load')}</div></div>`}
function renderAvatar(){
 const c=baseCoaches[avatar];
 const choices=mode==='qa'?QA.municipalities.slice(0,4):(REAL?.municipalities||[]);
 if(choices.length&&!choices.some(x=>x.municipalityId===origin))origin=choices[0].municipalityId;
 const ordered=mode==='qa'?choices:choices.slice().sort((a,b)=>
  a.regionId.localeCompare(b.regionId)||a.municipalityName.localeCompare(b.municipalityName,'it'));
 const opts=ordered.map(x=>'<option value="'+esc(x.municipalityId)+'"'+
  (origin===x.municipalityId?' selected':'')+'>'+esc(x.municipalityName)+' · '+esc(x.regionId)+'</option>').join('');
 const avatars='<div class="avatar-grid runtime-grow">'+baseCoaches.map((v,i)=>
  '<button class="avatar-tile" data-action="avatar" data-value="'+i+'" aria-label="'+esc(v[0])+
  '" aria-pressed="'+(avatar===i)+'">'+portraits('coach',i)+'</button>').join('')+'</div>';
 const profile='<div class="runtime-avatar-fields runtime-scroll runtime-grow">'+
  '<div class="runtime-top-row"><div class="runtime-portrait">'+portraits('coach',avatar)+
  '</div><div class="runtime-info"><b>'+esc(c[0])+'</b><br>'+
  names.map((x,i)=>x+': '+c[1][i]).join('<br>')+'</div></div>'+
  '<label class="runtime-label">'+
  (mode==='qa'?'Origine QA · località inventata':'Comune italiano · fonte attuale, non 1979')+
  '<select id="origin">'+opts+'</select></label>'+
  '<label class="runtime-label"><input id="qa-mode" type="checkbox"'+
  (mode==='qa'?' checked':'')+'> Modalità TEST: luoghi sintetici</label></div>'+
  h(btn('INDIETRO','home')+btn('20 OFFERTE ▶','begin','','gold-btn'));
 return head('SCEGLI IL MISTER','8 AVATAR ORIGINALI')+
  '<div class="runtime-split">'+pane('RITRATTI',avatars,'runtime-grow')+
  pane('PROFILO ALLENATORE',profile,'runtime-grow')+'</div>';
}
function offerResult(o){try{const club=state.clubs.find(c=>c.id===o.clubId);return previewOfferMorale(state.coach,o,club)}catch{return null}}
function renderOffers(){const opts=listInitialOffers(state),o=opts[offerIndex]||opts[0];if(!o)return head('NESSUNA OFFERTA');const pr=offerResult(o);return head('MERCATO DELLE PANCHINE','20 OFFERTE · SEED '+state.seed)+`<div class="runtime-split">${pane('LE PROPOSTE',`<div class="runtime-list runtime-scroll runtime-grow">${opts.map((x,i)=>`<button class="runtime-offer" data-action="offer" data-value="${i}" aria-selected="${offerIndex===i}"><span><b>${i+1}. ${esc(x.clubName)}</b><small>${esc(x.divisionId)}</small></span><b>${esc(offerResult(x)?.finalMoraleDelta??'—')} ♥</b></button>`).join('')}</div>`,'runtime-grow')}${pane('CONTRATTO',`<div class="runtime-info"><b>${esc(o.clubName)}</b><br>Serie ${esc(o.divisionId)}<br>Compenso settimanale: ${esc(o.coachWageITL.toLocaleString('it-IT'))} ₤ (bilanciamento fittizio)<br>Morale ingaggio: ${esc(pr?.finalMoraleDelta??'non calcolabile')}<br>Scadenza: ${esc(o.contractUntil)}<br>Regione: ${esc(o.regionId||'geografia assente')}</div><p class="runtime-foot">Preview del modulo 09. Nessuna firma se mancano origine/regione attendibili.</p>${h(btn('AVATAR','back-avatar')+btn('ACCETTA OFFERTA','accept','','gold-btn'))}`,'runtime-grow') }</div>`}
function president(){const club=state?.clubs.find(c=>c.id===state.coach.clubId);return presidents?.presidents.find(p=>p.id===club?.presidentId)}
function renderPresident(){const p=president(),idx=presidents.presidents.findIndex(x=>x.id===p?.id),club=getUI()?.club;const influence=effectiveCoachTraitsR12(state.coach,controlledClub());const traitSummary=['luck','leadership','selfEsteem','patience'].map((key,i)=>['FORTUNA','LEADERSHIP','AUTOSTIMA','PAZIENZA'][i]+': '+influence.base[key]+' '+(influence.modifiers[key]>=0?'+':'')+influence.modifiers[key]+' = '+influence.effective[key]).join(' · ');return head('IL PRESIDENTE TI ASPETTA','PRESENTAZIONE SOCIETÀ · COPY04')+`<div class="runtime-split"><div class="panel runtime-reporter">${portraits('president',Math.max(0,idx)%4)}</div>${pane(p?.name||'Presidente',`<p class="speech">“${esc(p?.lines?.[0]||p?.goal||'—')}”</p><div class="runtime-info">${esc(club?.name||'')}<br>Presidente: ${esc(p?.archetype||'')}<br>Fiducia società: ${esc(state.clubs.find(c=>c.id===club?.id)?.boardTrust??'—')}<br>EFFETTO PRESIDENZIALE: ${esc(traitSummary)}</div>${h(btn('CONFERENZA STAMPA ▶','press','','gold-btn'))}`,'runtime-grow')}</div>`}
function activeQuestion(){const kind=activeStage()==='postmatch_press'?'postmatch':'opening';const session=state.flow.press[kind];return {kind,session,q:session?.questions.find(x=>!(x.id in session.answers))}}
function renderPress(){const {session,q,kind}=activeQuestion();if(!session||!q)return head('CONFERENZA COMPLETATA');const idx=session.questions.indexOf(q),i=session.questions.length;return head(kind==='opening'?'CONFERENZA INIZIALE':'CONFERENZA POSTPARTITA',`DOMANDA ${idx+1} / ${i} · COPY04`)+`<div class="runtime-press-wrap"><div class="panel runtime-reporter">${portraits('journalist',idx)}</div><div class="panel runtime-answers"><p class="runtime-foot">${esc(q.journalistName)} · ${esc(q.broadcasterName)}</p><div class="runtime-question">${esc(q.text)}</div>${q.answers.map((a,i)=>btn(`${i+1}. ${a.text||a.label}`,'answer',`${q.id}|${a.id}`)).join('')}<p class="runtime-foot">MORALE MISTER: ${esc(state.coach.morale)}/100 · Gli effetti sono applicati dal modulo 09.</p></div></div>`}
function kpis(){const p=state?.coach;if(!p)return '';return `<div class="runtime-stats">${[['MORALE',p.morale],['PRESIDENTE',p.relationships.board],['SPOGLIATOIO',p.relationships.squad],['TIFOSI',p.relationships.fans],['STAMPA',p.relationships.media]].map(([k,v])=>`<div>${esc(k)}<strong>${esc(v??'—')}</strong></div>`).join('')}</div>`}
function tableRow(r,i,clubId){
 const rank=r.position??(i+1), id=r.clubId??r.id;
 return `<div class="runtime-table-row ${id===clubId?'mine':''}" data-club-id="${esc(id)}" data-rank="${esc(rank)}"><b>${esc(rank)}.</b><span>${esc(r.clubName)}</span><strong>${esc(r.points)} PT</strong><small>${esc(r.played)} G</small></div>`;
}
function playerRow(p,source){
 const stored=controlledClub()?.players?.find(x=>x.id===p.playerId);
 const injury=(stored?.status?.injuryDays??0)>0,suspended=(stored?.status?.suspensionMatches??0)>0;
 return `<button type="button" class="runtime-player-link" data-action="player" data-value="${esc(p.playerId)}" data-player-id="${esc(p.playerId)}">
 <span>${esc(p.name)}</span><small>${esc(p.positions?.join('/')||'—')} · FORMA ${esc(stored?.status?.fitness??'—')} · FIDUCIA ${esc(stored?.relationships?.coachTrust??'—')}${injury?' · INFORTUNATO':suspended?' · SQUALIFICATO':''}</small><b>›</b></button>`;
}
const hubMenu=[['campionato','⚽','CAMPIONATO'],['rosa','▤','ROSA'],['allenamento','◆','ALLENAMENTO'],['tifoseria','♟','TIFOSERIA'],['presidente','♛','PRESIDENTE'],['agenda','▣','COSA FARE OGGI']];
function renderHub(){
 const ui=getUI(),club=ui?.club;
 if(!club)return head('UFFICIO NON DISPONIBILE');
 const choices=hubMenu.map(([key,icon,title])=>`<button type="button" class="menu-card" data-action="section" data-value="${key}"><span class="emoji" aria-hidden="true">${icon}</span>${title}</button>`).join('');
 return head('UFFICIO DEL MISTER',`${ui.gameDate} · ${club.name}`)+kpis()+
  pane('SCRIVANIA',`<div class="r11-desk-brief">${esc(agendaSummary(ui))}</div><div class="menu-cards runtime-grow">${choices}</div>${h(btn('FORMAZIONE ▶','formation','','gold-btn')+btn('SALVA','save')+
    btn('ESPORTA','export-save')+btn('IMPORTA','import-save'))+
    '<input id="r11-save-import" type="file" accept="application/json,.json" hidden>'}`,'runtime-grow runtime-hub-home');
}
const controlledClub=()=>state?.clubs.find(c=>c.id===state.coach.clubId);
function marketWindow(){return integrationBackend?.getCareerMarketWindow(state)||null}
function nextActionId(prefix){return prefix+':'+state.absoluteWeek+':'+
 (globalThis.crypto?.randomUUID?.()||String(Date.now())+'-'+(++actionSerial))}
function renderHubSection(){
 const ui=getUI(),club=ui?.club;
 if(!club)return head('UFFICIO NON DISPONIBILE');
 const full=state.clubs.find(c=>c.id===club.id);
 const title=hubMenu.find(([key])=>key===selectedHub)?.[2]||'UFFICIO';
 if(selectedHub==='allenamento'){
  if(trainingRosterOpen){
   return head('ROSA IN ALLENAMENTO',ui.gameDate+' · '+club.name)+
    pane('SELEZIONA CALCIATORE',renderRosterLinks({ui,activeTraining:true})+
      h(btn('PROGRAMMA SETTIMANALE','training-roster','','gold-btn')+btn('UFFICIO','hub')),
      'runtime-grow runtime-hub-detail');
  }
  return head('ALLENAMENTO',ui.gameDate+' · '+club.name)+
    renderTrainingPanel({ui,plan:trainingPlan,intensity:trainingIntensity});
 }
 if(selectedHub==='tifoseria'){
  return head('TIFOSERIA',ui.gameDate+' · '+club.name)+
    renderSupportersPanel({ui,club:full,tab:supportTab,canEditTicket:!!integrationBackend});
 }
 if(selectedHub==='presidente'){
  const p=president();
  return head('PRESIDENTE E MERCATO',ui.gameDate+' · '+club.name)+
   renderPresidentOperations({club:full,profile:p,tab:presidentTab,
    backendReady:!!integrationBackend,window:marketWindow(),
    candidates:integrationBackend?.listCareerMarketCandidates(state)||[],
    otherClubs:state.clubs});
 }
 if(selectedHub==='agenda'){
  return head('COSA FARE OGGI','SETTIMANA '+ui.seasonWeek+' · '+ui.gameDate)+
    pane('SCRIVANIA DEL MISTER',renderDeskAgenda({...ui,clubManagement:full?.management,marketWindow:marketWindow()}),'runtime-grow runtime-hub-detail');
 }
 let body='';
 if(selectedHub==='campionato'){
  return head('CAMPIONATO',ui.gameDate+' · '+club.name)+
   renderLeaguePage({state,ui,standings:getStandings(state,club.divisionId),tab:leagueTab});
 }else if(selectedHub==='rosa'){
  const storedById=new Map((full?.players||[]).map(p=>[p.id,p]));
  const players=club.players.filter(p=>rosterFilter==='ALL'||p.positions?.includes(rosterFilter)).slice();
  const numeric=(p,key)=>key==='fitness'?storedById.get(p.playerId)?.status?.fitness:
    storedById.get(p.playerId)?.relationships?.coachTrust;
  players.sort((a,b)=>rosterSort==='name'?a.name.localeCompare(b.name,'it'):
    (numeric(b,rosterSort)??-1)-(numeric(a,rosterSort)??-1)||
    a.name.localeCompare(b.name,'it'));
  const filterOptions=['ALL','GK','DF','MF','FW'].map(x=>
   '<option value="'+x+'"'+(x===rosterFilter?' selected':'')+'>'+x+'</option>').join('');
  const sortOptions=[['name','NOME'],['fitness','FORMA'],['trust','FIDUCIA']].map(([x,label])=>
   '<option value="'+x+'"'+(x===rosterSort?' selected':'')+'>'+label+'</option>').join('');
  body='<div class="r11-roster-controls"><label>RUOLO<select id="r11-roster-filter">'+filterOptions+'</select></label>'+
   '<label>ORDINA PER<select id="r11-roster-sort">'+sortOptions+'</select></label></div>'+
   '<p class="runtime-foot">'+players.length+' / '+club.players.length+' calciatori · seleziona una scheda.</p>'+
   '<div class="runtime-scroll runtime-grow runtime-roster-list" aria-label="Rosa">'+
    players.map(p=>playerRow(p,'rosa')).join('')+'</div>';
 }else if(selectedHub==='presidente'){
  const p=president();
  body='<div class="runtime-info">'+esc(p?.name??'dato non disponibile')+
   '<br>'+esc(p?.goal??'dato non disponibile')+
   '<br>Fiducia: '+esc(full?.boardTrust??'dato non disponibile')+
   '/100<br>Cassa: '+esc(full?.finance?.cash?.toLocaleString('it-IT')??'dato non disponibile')+
   ' ₤<br>Arretrati: '+esc(full?.finance?.arrears?.toLocaleString('it-IT')??'dato non disponibile')+' ₤</div>';
 }
 const secondary=selectedHub==='rosa'?btn('FORMAZIONE ▶','formation','','gold-btn'):btn('SALVA','save');
 return head(title,ui.gameDate+' · '+club.name)+pane(title,body+h(btn('TORNA ALL’UFFICIO','hub')+secondary),
  'runtime-grow runtime-hub-detail');
}
function renderFieldGroup(title,object){
 const fields=object&&typeof object==='object'?Object.entries(object).filter(([,val])=>typeof val==='number'||typeof val==='string'):[];
 return `<section class="runtime-attribute-group"><h2>${esc(title)}</h2>${fields.length?fields.map(([key,val])=>`<div class="runtime-attribute"><span>${esc(key)}</span><strong>${esc(val)}</strong></div>`).join(''):'<span class="runtime-missing">dato non disponibile</span>'}</section>`;
}
function renderPlayer(){
 const club=getUI()?.club;
 const selected=club?.players.find(p=>p.playerId===selectedPlayerId);
 if(!selected)return head('GIOCATORE NON DISPONIBILE')+
  pane('SCHEDA',h(btn('TORNA ALLA ROSA','back-rosa')),'runtime-grow');
 const roster=getRosterPlayer(state,selectedPlayerId),training=getTrainingPlayer(state,selectedPlayerId);
 if(roster.playerId!==selectedPlayerId||training.playerId!==selectedPlayerId||
    roster.clubId!==club.id||training.clubId!==club.id)
  throw Error('Scheda giocatore non coerente col club selezionato');
 const item=profileSource==='allenamento'?training:roster;
 return head('SCHEDA GIOCATORE',club.name+' · '+profileSource.toUpperCase())+
  renderPlayerCard({item,clubName:club.name,source:profileSource,
   reports:getUI()?.m1?.training?.reports||[]});
}

function renderFormation(){
 const club=getUI()?.club;if(!club)return head('NESSUNA SQUADRA');
 const players=club.players,real=controlledClub(),fixture=getUI().upcomingFixture;
 const opponent=fixture?state.clubs.find(c=>c.id===(fixture.homeId===club.id?fixture.awayId:fixture.homeId)):null;
 const valid=players.filter(p=>lineup.has(p.playerId)),
   gk=valid.find(p=>p.positions.includes('GK')), ordered=[...(gk?[gk]:[]),...valid.filter(x=>x!==gk)].slice(0,11);
 const anchors=formationAnchors(formationChoice);
 const field='<div class="r11-formation-board" aria-label="Lavagna con posizioni del modulo '+esc(formationChoice)+'">'+
 ordered.map((p,i)=>'<div class="r11-position-marker" style="left:'+Math.round(anchors[i].x*88+6)+'%;top:'+Math.round(anchors[i].y*82+9)+'%">'+
  '<b>'+esc(p.positions[0])+'</b><small>'+esc(p.name.split(' ').at(-1))+'</small></div>').join('')+'</div>';
 const choices=Object.keys(FORMATIONS).map(x=>'<option value="'+esc(x)+'"'+(x===formationChoice?' selected':'')+'>'+esc(x)+'</option>').join('');
 const roster='<div class="runtime-roster runtime-grow">'+players.map(p=>{
  const full=real?.players.find(x=>x.id===p.playerId),status=full?.status||{},unavailable=status.injuryDays>0||status.suspensionMatches>0||status.health===0;
  return '<label class="runtime-player"><input type="checkbox" data-player="'+esc(p.playerId)+'"'+(lineup.has(p.playerId)?' checked':'')+
   (unavailable?' disabled':'')+' aria-label="Titolare '+esc(p.name)+'"><span>'+esc(p.name)+'</span><small>'+
   esc(p.positions.join('/'))+' · forma '+esc(status.fitness??'—')+(unavailable?' · NON DISPONIBILE':'')+'</small></label>';
 }).join('')+'</div>';
 return head('FORMAZIONE E PANCHINA',lineup.size+' TITOLARI · '+bench.size+' RISERVE')+
  '<div class="runtime-split">'+pane('ROSA · SELEZIONE REALE',roster,'runtime-grow')+
  pane('LAVAGNA PREPARTITA',
   '<div class="runtime-scroll runtime-grow">'+
   '<p class="r11-hint">Avversario: '+esc(opponent?.name||'non disponibile')+
    ' · '+(fixture?.homeId===club.id?'CASA':'TRASFERTA')+'</p>'+field+
   '<label class="runtime-label">MODULO<select id="r11-pre-formation">'+choices+'</select></label>'+
   '<label class="runtime-label">PRESSING '+esc(pressingChoice)+'<input id="r11-pre-pressing" type="range" min="0" max="100" step="5" value="'+esc(pressingChoice)+'"></label>'+
   '<label class="runtime-label">CAPITANO<select id="captain">'+
   valid.filter(p=>!p.positions.includes('GK')).map(p=>'<option value="'+esc(p.playerId)+'"'+(p.playerId===captain?' selected':'')+'>'+esc(p.name)+'</option>').join('')+
   '</select></label></div>'+
   h(btn('UFFICIO','hub')+btn('CALCIO D’INIZIO','prepare','','gold-btn')),'runtime-grow')+'</div>';
}
function renderMatchTools(){
 const snap=engine?.snapshot(),club=controlledClub(),myId=club?.id;
 const active=(snap?.players||[]).filter(x=>x.teamId===myId),
  benchIds=(matchInput?(matchInput.homeClub.id===myId?matchInput.homeBench:matchInput.awayBench):[])||[];
 const unused=benchIds.filter(id=>!active.some(x=>x.id===id));
 const names=id=>club?.players?.find(p=>p.id===id)?.name||id;
 const mk=(ids,id)=>'<select id="'+id+'">'+ids.map(p=>{
  const v=typeof p==='string'?p:p.id;
  return '<option value="'+esc(v)+'">'+esc(names(v))+'</option>'}).join('')+'</select>';
 const formations=Object.keys(FORMATIONS).map(x=>'<option value="'+esc(x)+'"'+(x===state.coach.tactics?.formation?' selected':'')+'>'+esc(x)+'</option>').join('');
 return '<div class="r11-match-orders">'+
  btn('◀ TORNA AL CAMPO','match-tools')+
  '<label>MODULO<select id="r11-live-formation">'+formations+'</select></label>'+
  '<label>PRESSING <input id="r11-live-pressing" type="number" min="0" max="100" value="'+esc(state.coach.tactics?.pressing??50)+'"></label>'+
  btn('APPLICA TATTICA','match-tactic')+
  '<label>FUORI'+mk(active,'r11-sub-out')+'</label><label>DENTRO'+mk(unused,'r11-sub-in')+'</label>'+
  btn('SOSTITUISCI','match-substitute')+
  '<label>GIOCATORE'+mk(active,'r11-shout-player')+'</label>'+
  '<label>ORDINE<select id="r11-shout-tone"><option value="encourage">INCORAGGIA</option><option value="harsh">RIMPROVERA</option></select></label>'+
  btn('COMUNICA ORDINE','match-shout')+
 '</div>';
}
function renderMatch(){
 const snap=engine?.snapshot(),fx=state?.flow?.pendingMatch;
 const home=state.clubs.find(c=>c.id===fx?.homeId),away=state.clubs.find(c=>c.id===fx?.awayId);
 return head('PARTITA VERA · ENGINE 06','GIORNATA '+state.week+' · 1× ≈ 15 MINUTI')+
 '<div class="runtime-score"><span>'+esc(home?.name)+'</span><b id="match-score">'+
 esc(snap?.score.home??0)+' — '+esc(snap?.score.away??0)+'</b><span>'+esc(away?.name)+
 '</span><strong id="match-time">00:00</strong></div>'+
 '<div class="runtime-split"><div class="runtime-pitch"><canvas id="r03-pitch" width="640" height="360" aria-label="Partita reale con 22 giocatori"></canvas></div>'+
 '<section class="panel runtime-match-panel">'+(matchToolsOpen?renderMatchTools():
  '<div class="runtime-grid"><div class="kpi"><small>POSSESSO</small><b id="match-pos">50%</b></div>'+
  '<div class="kpi"><small>TIRI</small><b id="match-shots">0–0</b></div></div>'+
  '<div class="runtime-grid">'+btn('▶ RIPRENDI','pause','','gold-btn')+btn('1× VELOCITÀ','speed')+
  btn('CAMPO COMPLETO','camera-full','',cameraMode==='full'?'active':'')+btn('TELECAMERA TV','camera-tv','',cameraMode==='broadcast'?'active':'')+'</div>'+
  btn('TATTICHE · CAMBI · ORDINI','match-tools')+
  '<p class="runtime-match-note" id="match-news">'+esc(lastEvent||'Feed reale Engine 06')+'</p>'+
  (mode==='qa'?btn('TERMINA GARA CON ENGINE06 (QA)','finish-qa','','gold-btn'):'')
 )+'</section></div>';
}
function renderPost(){const fm=state.flow.finalMatch;return head('FISCHIO FINALE · RISULTATO UFFICIALE','MATCH ENGINE 06')+`<div class="runtime-split">${pane('RISULTATO VERIFICATO',`<div class="runtime-score"><b>${fm.score.home} — ${fm.score.away}</b></div><div class="runtime-info">Esito del mister: ${esc(fm.result)}<br>Eventi motore: ${esc(fm.eventCount)}<br>Fonte: ${esc(state.flow.resultSources[fm.fixtureId])}</div>`,'runtime-grow')}${pane('CHIUSURA GIORNATA',`<p class="runtime-info">Due risposte stampa completate. L’Agente 09 aggiornerà il bilancio e il rapporto col presidente; il controller avanzerà il campionato una sola volta.</p>${h(btn('AVANZA GIORNATA ▶','advance','','gold-btn'))}`,'runtime-grow')}</div>`}
function renderSeason(){return head('STAGIONE TERMINATA')+pane('PROSSIMO ANNO',`<p class="runtime-info">Ultima giornata conclusa. I risultati precedenti restano nella carriera.</p>${h(btn('INIZIA NUOVA STAGIONE','rollover','','gold-btn'))}`,'runtime-grow')}
function renderUnemployed(){return head('SENZA PANCHINA',state.gameDate)+pane('NUOVE OCCASIONI',`<p class="runtime-info">Il presidente ha deciso. Le vacanze contrattuali restano del sistema 07.</p><div class="runtime-scroll runtime-grow">${(getUI().careerOffers||[]).map(x=>btn(x.clubName||x.clubId,'vacancy',x.id)).join('')}</div>${h(btn('AVANZA SETTIMANA','advance','','gold-btn'))}`,'runtime-grow')}
function renderGameover(){return head('GAME OVER · MORALE ESAURITO')+pane('CARRIERA CONCLUSA',`<div class="runtime-info">Morale del mister: 0. Il controller 07/09 ha chiuso questa carriera. Puoi crearne una nuova senza eliminare i salvataggi precedenti, oppure caricare una carriera valida.</div>${h(btn('NUOVA CARRIERA','reset-career','','gold-btn')+btn('CARICA SALVATAGGIO','load'))}`,'runtime-grow')}
function render(){
 restoreMode();
 if(state?.coach?.gameOver||state?.coach?.morale===0)screen='gameover';
 const output={entry:renderEntry,avatar:renderAvatar,offers:renderOffers,president:renderPresident,press:renderPress,hub:renderHub,'hub-section':renderHubSection,formation:renderFormation,match:renderMatch,post:renderPost,season:renderSeason,unemployed:renderUnemployed,gameover:renderGameover,player:renderPlayer}[screen]||renderEntry;
 root.dataset.screen=screen;
 area.innerHTML=output();
 if(screen==='player'&&selectedPlayerId){
  try{mountPlayerIllustration(area,getRosterPlayer(state,selectedPlayerId))
   .catch(e=>errors.push('Sprite scheda: '+e.message));}catch(e){errors.push('Sprite scheda: '+e.message)}
 }
 // The persistent five-item footer duplicates screen-local navigation and wastes landscape height.
 // Keep its markup for the pending PR #52, but remove it from every view.
 const nav=root.querySelector('#runtime-nav');
 if(nav)nav.hidden=true;
 // PR #52 adds a native fullscreen control to the footer. Once present, promote only
 // that control to the header so its existing listener and 44px hit area remain available.
 const fullscreen=root.querySelector('#fullscreen-toggle'),header=root.querySelector('.gamebar');
 if(fullscreen&&header&&fullscreen.parentElement!==header)header.appendChild(fullscreen);
 if(screen==='match')mountMatchView();
}
function clearMatch(){if(view)view.destroy();viewReady=false;view=null;bridge=null;engine=null;matchInput=null;scoreSnapshot=null;paused=true;}
function prepare(){if(!state)return;const all=getUI().club.players;const chosen=all.filter(p=>lineup.has(p.playerId));const goalkeepers=chosen.filter(p=>p.positions.includes('GK'));if(chosen.length!==11||goalkeepers.length!==1){failure('La formazione richiede 11 titolari, esattamente un portiere');return}
 const candidates=all.filter(x=>!lineup.has(x.playerId));const b=[...bench].filter(x=>candidates.some(p=>p.playerId===x));if(!b.length){failure('Scegli almeno una riserva');return}const result=prepareMatch(state,{xi:[...lineup],bench:b,captainId:captain});
 api(result,()=>{
  engine=result.engine;matchInput=result.matchInput;paused=true;speed=1;matchToolsOpen=false;cameraMode='full';
  const applied=commandM1Match(state,engine,{requestId:nextActionId('prematch-tactic'),
   type:'tacticChange',payload:{formation:formationChoice,pressing:pressingChoice}});
  if(!applied.accepted)failure('Tattica prepartita RESPINTA: '+applied.reason);
  display('match');
 });
}
function mountMatchView(){if(view){view.destroy();view=null}viewReady=false;const canvas=document.querySelector('#r03-pitch');if(!canvas||!engine)return;const input=matchInput;const firstGK=(club,ids)=>ids.find(id=>club.players.find(p=>p.id===id)?.positions.includes('GK'));
 const ids=[firstGK(input.homeClub,input.homeXI),firstGK(input.awayClub,input.awayXI)];
  const kit={home:{shirt:'#2759b6',shirtB:'#fff0b0',pattern:'vertical',shorts:'#f2ebca'},away:{shirt:'#be3640',shirtB:'#faefcc',pattern:'solid',shorts:'#f5ede3'},homeKeeper:{shirt:'#edc84b'},awayKeeper:{shirt:'#319367'}};
  // Uniforms follow the club; skin, hair and face are inherited from the player ID.
  for(const [club,away] of [[input.homeClub,false],[input.awayClub,true]])for(const p of club.players){
    const visual=appearanceForMatchR12(p,club,{away});if(visual)kit[p.id]=visual;
  }
 view=createMatchView(canvas,{config:{homeTeamId:input.homeClub.id,awayTeamId:input.awayClub.id,keeperIds:ids,appearances:kit,simSecondsPerRealSecond:6,autoStart:false,onWarning:()=>{}}});bridge=createEngineViewBridge(engine,view,{keeperIds:ids});view.setPaused(paused);view.setCameraMode(cameraMode);bridge.sync();const loading=view;view.ready.then(()=>{if(view===loading&&!view.destroyed){viewReady=true;view.drawAt(performance.now());}}).catch(()=>{});updateMatch();}
function updateMatch(){if(!engine||screen!=='match')return;const s=engine.snapshot();scoreSnapshot=s;const el=id=>document.querySelector('#'+id);if(el('match-score'))el('match-score').textContent=`${s.score.home} — ${s.score.away}`;if(el('match-time')){const m=Math.floor(s.t/60),sec=Math.floor(s.t%60);el('match-time').textContent=String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')};if(el('match-pos'))el('match-pos').textContent=Math.round(s.stats.home.possession)+'%';if(el('match-shots'))el('match-shots').textContent=`${s.stats.home.shots}–${s.stats.away.shots}`;}
function step(seconds){if(!engine||screen!=='match')return;tickMatch(engine,seconds,{speed});const d=bridge.sync(performance.now());for(const e of d.events){if(['goal','fulltime','halftime','shot','save'].includes(e.type))lastEvent=`${Math.floor(e.t/60)}′ · ${e.type.toUpperCase()} · ${e.playerId||''}`;}const feed=document.querySelector('#match-news');if(feed)feed.textContent=lastEvent||'Rendering 05 · dati del motore 06';updateMatch();if(engine.isFinished())finishMatch()}
function finishMatch(){if(!engine||!engine.isFinished())return;const result=consumeMatchResult(state,engine,{press});api(result,()=>{clearMatch();display('press');persistAction('Risultato reale registrato e salvato')})}
function fulltimeQA(){if(!engine||mode!=='qa')return;if(!engine.isFinished())step((5400-engine.snapshot().t)/6/speed+1);}
function changeMatchCamera(next){
 if(!engine||!view||screen!=='match')return failure('Partita televisiva non pronta');
 const before=JSON.stringify(engine.snapshot());
 try{
  const applied=view.setCameraMode(next);
  if(applied!==next)return failure('Cambio vista rifiutato dal renderer');
  cameraMode=next;
  if(JSON.stringify(engine.snapshot())!==before)throw Error('CAMERA_MODIFIED_ENGINE');
  renderMatchControls();
  message(next==='broadcast'?'TELECAMERA TV ATTIVA':'CAMPO COMPLETO ATTIVO');
 }catch(e){failure('Cambio camera non riuscito: '+e.message)}
}
function submitMatchCommand(type,payload={}){
 if(!engine||screen!=='match')return failure('La partita non è in esecuzione');
 const outcome=commandM1Match(state,engine,{
  requestId:nextActionId('match-command'),type,...payload
 });
 if(!outcome.accepted)return failure('ORDINE RIFIUTATO · '+outcome.reason);
 const current=engine.snapshot(),news=outcome.events?.at(-1);
 lastEvent='ORDINE ESEGUITO · '+type+' · '+(news?.type||'engine06');
 bridge?.sync(performance.now());
 render();updateMatch();
 message('Engine06 conferma: '+type+' · '+(outcome.engineResult?.effects?.remaining??''));
 return true;
}
function advance(){if(!state)return;const week=state.absoluteWeek;
 const result=advanceMatchday(state,{presidentCatalog:presidents,expectedAbsoluteWeek:week});
 api(result,()=>{
  display(activeStage()==='season_complete'?'season':activeStage()==='unemployed'?'unemployed':'hub');
  persistAction((result.weekType==='bye_week'?'Turno di riposo':'Giornata')+' '+week+' salvato · '+state.gameDate);
 });
}

const readValue=id=>area.querySelector('#'+id)?.value;
const readMoney=id=>{
 const v=readValue(id),n=Number(v);
 if(v==null||v===''||!Number.isSafeInteger(n)||n<0)throw Error('Importo non valido');
 return n;
};
async function applyManagementAction(action,value){
 const apiR11=integrationBackend||await backendPromise;
 if(!apiR11)return failure('Adapter Career07 non disponibile · operazione non eseguita');
 if(!state?.coach?.clubId||activeStage()!=='hub')return failure('Operazione ammessa solo in ufficio');
 const ctx={presidentCatalog:presidents,expectedAbsoluteWeek:state.absoluteWeek};
 let r;
 if(action==='ticket-change')
  r=apiR11.changeCareerTicketPrice(state,{...ctx,clubId:state.coach.clubId,
   priceITL:readMoney('r11-ticket-price'),eventId:nextActionId('ticket')});
 else if(action==='board-request')
  r=apiR11.requestCareerPresident(state,{...ctx,kind:readValue('r11-request-kind'),
   amountITL:readMoney('r11-request-amount'),requestId:nextActionId('board')});
 else if(action==='board-decide')
  r=apiR11.decideCareerPresident(state,{...ctx,requestId:value});
 else if(action==='market-request'){
  const [sellerClubId,playerId]=String(readValue('r11-market-candidate')||'').split('|');
  r=apiR11.careerMarketOperation(state,{...ctx,action:'request',requestId:nextActionId('transfer'),
   sellerClubId,playerId,mandateId:readValue('r11-market-mandate'),
   feeITL:readMoney('r11-market-fee'),weeklyWage:readMoney('r11-market-wage')});
 }else if(action==='market-sale')
  r=apiR11.careerSaleOperation(state,{...ctx,action:'request',requestId:nextActionId('sale'),
   playerId:readValue('r11-sale-player'),buyerClubId:readValue('r11-sale-buyer'),
   feeITL:readMoney('r11-sale-fee')});
 else if(action==='market-progress'){
  const [step,requestId]=String(value).split('|');
  const req=controlledClub()?.market?.requests?.find(x=>x.id===requestId);
  if(!req)return failure('Pratica non registrata');
  if(req.kind==='sell')
   r=apiR11.careerSaleOperation(state,{...ctx,action:step==='finalize-sale'?'finalize':step,requestId,
    buyerClubId:readValue('r11-sale-buyer'),feeITL:readMoney('r11-sale-fee')});
  else if(['review','negotiate','finalize'].includes(step))
   r=apiR11.careerMarketOperation(state,{...ctx,action:step,requestId,
    feeITL:req.agreement?.sellerFee??req.askingFee,
    weeklyWage:req.agreement?.agreedWage??req.weeklyWage,sellerAccepts:true});
  else return failure('Fase mercato non ammessa');
 }else return failure('Azione sconosciuta');
 if(!r?.accepted)return failure('RESPINTO · '+String(r?.reason||'non eseguito'));
 render();await persistAction('Operazione reale salvata'+(r.reason?' · '+r.reason:''));
}
async function interact(action,value){if((state?.coach?.gameOver||state?.coach?.morale===0)&&!['load','home','reset-career','export-save'].includes(action))return failure('GAME_OVER');
 switch(action){case 'reset-career':restartAfterGameOver();break;case 'home':if(state&&screen!=='entry'&&screen!=='match'&&activeStage()==='hub'){display('hub')}else display('entry');break;
 case 'start':display('avatar');break;case 'avatar':avatar=Number(value);render();break;case 'back-avatar':display('avatar');break;case 'begin':newCareer();break;
 case 'offer':offerIndex=Number(value);render();break;case 'accept':{const offer=listInitialOffers(state)[offerIndex];api(acceptOffer(state,offer.id,{press,presidents}),()=>{selectLineup();display('president');persistAction('Contratto di ingaggio salvato')});break;}
 case 'press':display('press');break;case 'answer':{const [q,a]=value.split('|');const kind=activeStage()==='postmatch_press'?'postmatch':'opening';const result=kind==='opening'?answerOpeningPress(state,q,a,{press}):answerPostMatchPress(state,q,a,{press});api(result,()=>{display(activeStage()==='hub'?'hub':activeStage()==='postmatch_ready'?'post':'press');persistAction('Risposta stampa salvata')});break;}
 case 'hub':if(!state)return display('entry');if(activeStage()==='hub')display('hub');else if(activeStage()==='postmatch_ready')display('post');else failure('Completa il passaggio corrente');break;
 case 'section':if(!hubMenu.some(([key])=>key===value))return failure('Sezione non disponibile');selectedHub=value;selectedPlayerId=null;trainingRosterOpen=false;if(value==='tifoseria')supportTab='stadio';if(value==='campionato')leagueTab='classifica';if(value==='presidente')presidentTab='ufficio';display('hub-section');break;
 case 'training-roster':trainingRosterOpen=!trainingRosterOpen;display('hub-section');break;
 case 'support-tab':if(!['stadio','tifosi','giornali'].includes(value))return failure('Scheda tifoseria non disponibile');supportTab=value;render();break;
 case 'narrative-choice':{
  const [issueId,optionId]=value.split('|');
  const result=decideCareerNarrativeR12(state,issueId,optionId);
  api(result,()=>{render();persistAction('Decisione sulla stampa provinciale registrata')});break;
 }
 case 'league-tab':if(!['classifica','calendario','prossima'].includes(value))return failure('Vista campionato sconosciuta');leagueTab=value;render();break;
 case 'pres-tab':if(!['ufficio','mercato'].includes(value))return failure('Vista presidente sconosciuta');presidentTab=value;render();break;
 case 'ticket-change':case 'board-request':case 'board-decide':
 case 'market-request':case 'market-sale':case 'market-progress':
  await applyManagementAction(action,value);break;
 case 'training-plan':{
  if(!trainingStatus(getUI()).canSelect)return failure('Allenamento già pianificato');
  if(!['technical','athletic','tactical','balanced','rest'].includes(value))return failure('Programma non valido');
  trainingIntensity=Number(area.querySelector('#r11-training-intensity')?.value??trainingIntensity);
  trainingPlan=value;render();break;
 }
 case 'training-apply':{
  if(!trainingStatus(getUI()).canSelect)return failure('Settimana già pianificata');
  const result=selectM1Training(state,{plan:trainingPlan,intensity:trainingIntensity,
   expectedAbsoluteWeek:state.absoluteWeek});
  api(result,()=>{render();persistAction('Programma registrato e salvato · sett. '+result.selection.absoluteWeek)});break;
 }
 case 'training-locked':failure('Programma già registrato per questa settimana');break;
 case 'player':{const club=getUI()?.club;if(!club?.players.some(p=>p.playerId===value))return failure('Giocatore non presente nella rosa');selectedPlayerId=value;profileSource=selectedHub==='allenamento'?'allenamento':'rosa';display('player');break;}
 case 'back-rosa':selectedHub='rosa';selectedPlayerId=null;display('hub-section');break;
 case 'back-training':selectedHub='allenamento';selectedPlayerId=null;trainingRosterOpen=true;display('hub-section');break;case 'formation':if(activeStage()==='hub')display('formation');else failure('Non è il momento di preparare la squadra');break;
 case 'prepare':prepare();break;
 case 'match-tools':matchToolsOpen=!matchToolsOpen;if(matchToolsOpen){paused=true;view?.setPaused(true)}render();break;
 case 'match-tactic':{
  const formation=readValue('r11-live-formation'),pressing=readMoney('r11-live-pressing');
  submitMatchCommand('tacticChange',{payload:{formation,pressing}});break;
 }
 case 'match-substitute':submitMatchCommand('substitution',{
  payload:{outId:readValue('r11-sub-out'),inId:readValue('r11-sub-in')}});break;
 case 'match-shout':submitMatchCommand('individualShout',{
  targetPlayerId:readValue('r11-shout-player'),tone:readValue('r11-shout-tone')});break;
 case 'pause':paused=!paused;view?.setPaused(paused);renderMatchControls();last=performance.now();break;
 case 'speed':speed=speed===8?1:speed*2;view?.setSpeed(speed);renderMatchControls();break;
 case 'camera-full':changeMatchCamera('full');break;
 case 'camera-tv':changeMatchCamera('broadcast');break;
 case 'finish-qa':fulltimeQA();break;case 'advance':advance();break;case 'next':if(getUI()?.coachWeekStatus?.kind==='bye_week'&&getUI()?.coachWeekStatus?.canAdvance)advance();else if(activeStage()==='postmatch_ready'||activeStage()==='unemployed')advance();else if(activeStage()==='hub')display('formation');else failure('Giornata non avanzabile');break;
 case 'save':await save();break;case 'load':await load();break;case 'export-save':exportSave();break;
 case 'import-save':root.querySelector('#r11-save-import')?.click();break;
 case 'rollover':api(rolloverSeason(state),()=>{selectLineup();display('hub');persistAction('Nuova stagione salvata')});break;
 case 'vacancy':api(takeCareerOffer(state,value,{presidents}),()=>{selectLineup();display('hub');persistAction('Nuovo ingaggio salvato')});break;
 default:failure('Azione non gestita: '+action);
 }}
function renderMatchControls(){if(screen!=='match')return;
 for(const [mode,action] of [['full','camera-full'],['broadcast','camera-tv']]){
  const el=area.querySelector('[data-action="'+action+'"]');
  if(el){el.classList.toggle('active',cameraMode===mode);el.setAttribute('aria-pressed',String(cameraMode===mode))}
 }
 const p=area.querySelector('[data-action="pause"]'),s=area.querySelector('[data-action="speed"]');if(p){p.textContent=paused?'▶ RIPRENDI':'Ⅱ PAUSA';p.classList.toggle('gold-btn',paused)}if(s)s.textContent=speed+'× VELOCITÀ'}
root.addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b||b.disabled||!root.contains(b))return;guard(()=>interact(b.dataset.action,b.dataset.value))});
root.addEventListener('input',e=>{if(e.target.matches('[data-training-intensity]')){trainingIntensity=Number(e.target.value);const out=root.querySelector('#r11-intensity-value');if(out)out.textContent=String(trainingIntensity)}});
root.addEventListener('change',e=>{if(e.target.id==='r11-save-import'){importSave(e.target.files?.[0]);e.target.value='';return;}if(e.target.id==='origin'){origin=e.target.value;return}if(e.target.id==='qa-mode'){mode=e.target.checked?'qa':'normal';origin=mode==='qa'?'000001':REAL?.municipalities[0]?.municipalityId||'';render();return}if(e.target.id==='r11-roster-filter'){rosterFilter=e.target.value;render();return}
 if(e.target.id==='r11-roster-sort'){rosterSort=e.target.value;render();return}
 if(e.target.id==='captain'){captain=e.target.value;return}
 if(e.target.id==='r11-pre-formation'){formationChoice=e.target.value;render();return}
 if(e.target.id==='r11-pre-pressing'){pressingChoice=Number(e.target.value);render();return}if(!e.target.matches('[data-player]'))return;const id=e.target.dataset.player;if(e.target.checked)lineup.add(id);else lineup.delete(id);const club=getUI()?.club;const eligible=club?.players||[];bench=new Set(eligible.filter(p=>!lineup.has(p.playerId)).slice(0,5).map(p=>p.playerId));if(!lineup.has(captain))captain=[...lineup].find(x=>!club.players.find(p=>p.playerId===x)?.positions.includes('GK'))||null;render();});
function loop(now){if(view&&viewReady&&screen==='match'){try{view.drawAt(now)}catch(e){viewReady=false;failure('Errore renderer: '+e.message)}}const dt=Math.max(0,Math.min(.20,(now-last)/1000));last=now;if(engine&&screen==='match'&&!paused){try{step(dt)}catch(e){paused=true;view?.setPaused(true);failure(e.message)}}requestAnimationFrame(loop)}
window.OronzoR03=Object.freeze({getState:()=>state,hasUnsavedProgress:()=>dirtyUnsaved,getSaveError:()=>lastSaveError,getScreen:()=>screen,getSnapshot:()=>scoreSnapshot,completeQaMatch:()=>guard(fulltimeQA),getErrors:()=>errors.slice(),getMode:()=>mode, isViewReady:()=>viewReady, getStage:activeStage});
render();loadCopy().catch(e=>{failure(e.message);errors.push(e.message)});last=performance.now();requestAnimationFrame(loop);
