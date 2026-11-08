/** ORONZO 03 R03 — mobile career runtime. Imports 07/09/06/05; no parallel simulation. */
import {newGame,listInitialOffers,acceptOffer,getStateForUI,answerOpeningPress,
  answerPostMatchPress,prepareMatch,tickMatch,consumeMatchResult,advanceMatchday,
  rolloverSeason,saveGame,loadGame,takeCareerOffer,getRosterPlayer,getTrainingPlayer}
  from '../../app/flow/controller.js';
import {qaMunicipalityCatalog} from '../../app/flow/tests/qa-geography.mjs';
import {previewOfferMorale} from '../../systems/coach-club/index.js';
import {getStandings} from '../../systems/career/career.js';
import {createMatchView,createEngineViewBridge} from '../../systems/match-view/match-view.js';

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
const activeStage=()=>state?.flow?.stage??'entry';
const getUI=()=>state?getStateForUI(state):null;
const dataOk=()=>!!press&&!!presidents;
function message(text){status.textContent=text;status.hidden=false;clearTimeout(showToastTimer);showToastTimer=setTimeout(()=>status.hidden=true,4600)}
function failure(reason){message(String(reason??'Azione non disponibile'));}
function guard(action){if(locking)return;locking=true;try{action()}catch(e){errors.push(String(e));failure(e?.message??e)}finally{locking=false}}
function api(result,success){if(result?.accepted===false){failure(result.reason==='geography_required'?'geography_required: località verificate non disponibili; usa DEMO TECNICA per provare':result.reason);return false}success?.();return true}
function restoreMode(){const qa=state?.world?.mode==='qa_fixture'||mode==='qa';label.textContent=qa?'DEMO TECNICA — LOCALITÀ SINTETICHE':REAL?'COMUNI REALI · DATI ATTUALI (NON 1979)':'CATALOGO COMUNI NON DISPONIBILE';date.textContent=state?.gameDate||'1979-08-01'}
function display(next){screen=next;render()}
function save({silent=false}={}){
 if(!state)return false;
 // On a restart after GAME OVER, keep the previous, potentially recoverable save
 // until the user explicitly chooses to replace it. Never erase a slot to reset UI.
 if(protectPreviousSave){
  if(silent)return false;
  if(!window.confirm('Esiste un salvataggio precedente. Vuoi sovrascriverlo con questa nuova carriera?')){
   message('Salvataggio precedente conservato.');return false;
  }
  protectPreviousSave=false;
 }
 try{const result=saveGame(state,localStorage);if(!silent)message('Carriera salvata · '+result.sequence);return true}
 catch(e){if(!silent)failure(e.message);return false}
}
function load(){const payload=loadGame(localStorage);if(!payload){message('Nessuna carriera R03 salvata');return}if(payload.legacy){message('Salvataggio storico 1985 protetto. Apri il prototipo precedente per continuarlo.');return}clearMatch();protectPreviousSave=false;selectedPlayerId=null;profileSource='rosa';state=payload.state;mode=state.world?.mode==='qa_fixture'?'qa':'normal';avatar=Math.max(0,baseCoaches.findIndex((_,i)=>'ui-r03-'+i===state.coach.avatarId));selectLineup();const stage=activeStage();display(stage==='offers'?'offers':stage==='opening_press'?'president':stage==='postmatch_press'?'press':stage==='postmatch_ready'?'post':stage==='pre_match'?'hub':stage==='season_complete'?'season':stage==='unemployed'?'unemployed':'hub');message('Salvataggio R03 caricato · '+state.gameDate)}
async function loadCopy(){const paths=['../../content/press-opening.json','../../content/press-postmatch.json','../../content/press-media.json','../../content/presidents.json'];const all=await Promise.all(paths.map(async p=>{const r=await fetch(p);if(!r.ok)throw new Error(`COPY04 HTTP ${r.status}: ${p}`);return r.json()}));press={opening:all[0],postmatch:all[1],media:all[2]};presidents=all[3];render()}
function restartAfterGameOver(){
 // End the previous in-memory career only. Save slots are purposefully untouched.
 clearMatch();state=null;selectedPlayerId=null;profileSource='rosa';selectedHub='campionato';
 lineup=new Set();bench=new Set();captain=null;offerIndex=0;avatar=0;origin='000001';mode='qa';
 protectPreviousSave=true;
 display('avatar');
 message('Nuova carriera: il salvataggio precedente resta protetto finché non decidi di sostituirlo.');
}
function newCareer(){if(!dataOk())return failure('Cataloghi Copy04 ancora non disponibili');const c=baseCoaches[avatar],r=QA.municipalities.find(x=>x.municipalityId===origin);if(mode==='qa'&&!r)return failure('Origine fixture non valida');
 const originData=mode==='qa'?{municipalityId:r.municipalityId,regionId:r.regionId,macroRegion:r.macroRegion}:null;
 state=newGame({seed:1979,coachName:c[0],avatar:{id:'ui-r03-'+avatar,traits:{luck:c[1][0],leadership:c[1][1],selfEsteem:c[1][2],patience:c[1][3]},origin:originData},...(mode==='qa'?{municipalityCatalog:QA}:{})});
 offerIndex=0;selectLineup();display('offers');}
function selectLineup(){lineup=new Set();bench=new Set();captain=null;const club=getUI()?.club;if(!club)return;const eligible=club.players.filter(p=>{const full=state.clubs.find(c=>c.id===club.id).players.find(x=>x.id===p.playerId);return !(full.status?.injuryDays||full.status?.suspensionMatches||full.status?.health===0)});
 const gk=eligible.find(p=>p.positions.includes('GK'));if(gk)lineup.add(gk.playerId);for(const p of eligible.filter(x=>!x.positions.includes('GK')).slice(0,10))lineup.add(p.playerId);
 for(const p of eligible.filter(x=>!lineup.has(x.playerId)).slice(0,5))bench.add(p.playerId);captain=[...lineup].find(x=>x!==gk?.playerId)??null;}
function renderEntry(){return head('IL FISCHIO D’INIZIO')+`<div class="runtime-split">${pane('L’UFFICIO TI ASPETTA',`<div class="news entry-brief">STAGIONE 1979<br>Inizia la tua carriera di provincia. Ingaggi e risultati provengono dai moduli reali.</div><p class="runtime-foot">Per il playtest personale useremo 100 località dichiaratamente sintetiche.</p><div class="v-stack entry-actions">${btn('▶ NUOVA PARTITA','start','','gold-btn')}${btn('▣ CARICA PARTITA','load')}</div>`, 'runtime-grow entry-panel')}<div class="panel runtime-image" role="img" aria-label="Ufficio di allenatore rétro"></div></div>`}
function renderAvatar(){const c=baseCoaches[avatar];const choices=QA.municipalities.filter(x=>x.municipalityId==='000001'||x.municipalityId==='000002'||x.municipalityId==='000003'||x.municipalityId==='000004');return head('SCEGLI IL MISTER','8 AVATAR ORIGINALI')+`<div class="runtime-split">${pane('RITRATTI',`<div class="avatar-grid runtime-grow">${baseCoaches.map((v,i)=>`<button class="avatar-tile" data-action="avatar" data-value="${i}" aria-label="${esc(v[0])}" aria-pressed="${avatar===i}">${portraits('coach',i)}</button>`).join('')}</div>`,'runtime-grow')}${pane('PROFILO ALLENATORE',`<div class="runtime-avatar-fields runtime-scroll runtime-grow"><div class="runtime-top-row"><div class="runtime-portrait">${portraits('coach',avatar)}</div><div class="runtime-info"><b>${esc(c[0])}</b><br>${names.map((x,i)=>`${x}: ${c[1][i]}`).join('<br>')}</div></div><label class="runtime-label">Origine QA (località inventata)<select id="origin">${choices.map(x=>`<option value="${esc(x.municipalityId)}" ${origin===x.municipalityId?'selected':''}>${esc(x.municipalityName)} · ${esc(x.regionId)}</option>`).join('')}</select></label><label class="runtime-label"><input id="qa-mode" type="checkbox" ${mode==='qa'?'checked':''}> Modalità TEST: luoghi sintetici</label></div>${h(btn('INDIETRO','home')+btn('20 OFFERTE ▶','begin','','gold-btn'))}`,'runtime-grow') }</div>`}
function offerResult(o){if(mode!=='qa')return null;try{const club=state.clubs.find(c=>c.id===o.clubId);return previewOfferMorale(state.coach,o,club)}catch{return null}}
function renderOffers(){const opts=listInitialOffers(state),o=opts[offerIndex]||opts[0];if(!o)return head('NESSUNA OFFERTA');const pr=offerResult(o);return head('MERCATO DELLE PANCHINE','20 OFFERTE REALI DEL CONTROLLER 07')+`<div class="runtime-split">${pane('LE PROPOSTE',`<div class="runtime-list runtime-scroll runtime-grow">${opts.map((x,i)=>`<button class="runtime-offer" data-action="offer" data-value="${i}" aria-selected="${offerIndex===i}"><span><b>${i+1}. ${esc(x.clubName)}</b><small>${esc(x.divisionId)}</small></span><b>${esc(offerResult(x)?.finalMoraleDelta??'—')} ♥</b></button>`).join('')}</div>`,'runtime-grow')}${pane('CONTRATTO',`<div class="runtime-info"><b>${esc(o.clubName)}</b><br>Serie ${esc(o.divisionId)}<br>Compenso settimanale: ${esc(o.coachWageITL.toLocaleString('it-IT'))} ₤ (bilanciamento fittizio)<br>Morale ingaggio: ${esc(pr?.finalMoraleDelta??'non calcolabile')}<br>Scadenza: ${esc(o.contractUntil)}<br>Regione: ${esc(o.regionId||'geografia assente')}</div><p class="runtime-foot">Preview del modulo 09. Nessuna firma se mancano origine/regione attendibili.</p>${h(btn('AVATAR','back-avatar')+btn('ACCETTA OFFERTA','accept','','gold-btn'))}`,'runtime-grow') }</div>`}
function president(){const club=state?.clubs.find(c=>c.id===state.coach.clubId);return presidents?.presidents.find(p=>p.id===club?.presidentId)}
function renderPresident(){const p=president(),idx=presidents.presidents.findIndex(x=>x.id===p?.id),club=getUI()?.club;return head('IL PRESIDENTE TI ASPETTA','PRESENTAZIONE SOCIETÀ · COPY04')+`<div class="runtime-split"><div class="panel runtime-reporter">${portraits('president',Math.max(0,idx)%4)}</div>${pane(p?.name||'Presidente',`<p class="speech">“${esc(p?.lines?.[0]||p?.goal||'—')}”</p><div class="runtime-info">${esc(club?.name||'')}<br>Presidente: ${esc(p?.archetype||'')}<br>Fiducia società: ${esc(state.clubs.find(c=>c.id===club?.id)?.boardTrust??'—')}</div>${h(btn('CONFERENZA STAMPA ▶','press','','gold-btn'))}`,'runtime-grow')}</div>`}
function activeQuestion(){const kind=activeStage()==='postmatch_press'?'postmatch':'opening';const session=state.flow.press[kind];return {kind,session,q:session?.questions.find(x=>!(x.id in session.answers))}}
function renderPress(){const {session,q,kind}=activeQuestion();if(!session||!q)return head('CONFERENZA COMPLETATA');const idx=session.questions.indexOf(q),i=session.questions.length;return head(kind==='opening'?'CONFERENZA INIZIALE':'CONFERENZA POSTPARTITA',`DOMANDA ${idx+1} / ${i} · COPY04`)+`<div class="runtime-press-wrap"><div class="panel runtime-reporter">${portraits('journalist',idx)}</div><div class="panel runtime-answers"><p class="runtime-foot">${esc(q.journalistName)} · ${esc(q.broadcasterName)}</p><div class="runtime-question">${esc(q.text)}</div>${q.answers.map((a,i)=>btn(`${i+1}. ${a.text||a.label}`,'answer',`${q.id}|${a.id}`)).join('')}<p class="runtime-foot">MORALE MISTER: ${esc(state.coach.morale)}/100 · Gli effetti sono applicati dal modulo 09.</p></div></div>`}
function kpis(){const p=state?.coach;if(!p)return '';return `<div class="runtime-stats">${[['MORALE',p.morale],['PRESIDENTE',p.relationships.board],['SPOGLIATOIO',p.relationships.squad],['TIFOSI',p.relationships.fans],['STAMPA',p.relationships.media]].map(([k,v])=>`<div>${esc(k)}<strong>${esc(v??'—')}</strong></div>`).join('')}</div>`}
function tableRow(r,i,clubId){
 const rank=r.position??(i+1), id=r.clubId??r.id;
 return `<div class="runtime-table-row ${id===clubId?'mine':''}" data-club-id="${esc(id)}" data-rank="${esc(rank)}"><b>${esc(rank)}.</b><span>${esc(r.clubName)}</span><strong>${esc(r.points)} PT</strong><small>${esc(r.played)} G</small></div>`;
}
function playerRow(p,source){return `<button type="button" class="runtime-player-link" data-action="player" data-value="${esc(p.playerId)}" data-player-id="${esc(p.playerId)}"><span>${esc(p.name)}</span><small>${esc(p.positions?.join('/')||'ruolo non disponibile')}</small><b>›</b></button>`;}
function renderHub(){
 const ui=getUI(),club=ui.club, meeting=ui.upcomingFixture;
 const opponent=meeting?state.clubs.find(c=>c.id===(meeting.homeId===club.id?meeting.awayId:meeting.homeId)):null;
 let body='';
 if(selectedHub==='campionato'){
  const rows=getStandings(state,club.divisionId);
  body=`<p class="runtime-info">Prossima: <b>${esc(opponent?.name||'Fine stagione')}</b> · ${esc(ui.gameDate)} · giornata ${ui.seasonWeek}</p><div class="runtime-scroll runtime-grow runtime-table" data-total-rows="${rows.length}" aria-label="Classifica completa">${rows.map((r,i)=>tableRow(r,i,club.id)).join('')}</div>`;
 }else if(selectedHub==='rosa'||selectedHub==='allenamento'){
  const training=selectedHub==='allenamento';
  body=`<p class="runtime-foot">${training?'Allenamento: consultazione dei dati reali. Modifica dei programmi non ancora disponibile.':'Rosa completa · '+club.players.length+' calciatori · seleziona una scheda.'}</p><div class="runtime-scroll runtime-grow runtime-roster-list" data-total-players="${club.players.length}" aria-label="${training?'Giocatori allenamento':'Rosa completa'}">${training?'<button class="ui-btn runtime-unavailable" type="button" disabled aria-label="Piano allenamento non disponibile">MODIFICA ALLENAMENTO · NON DISPONIBILE</button>':''}${club.players.map(p=>playerRow(p,selectedHub)).join('')}</div>`;
 }else if(selectedHub==='presidente'){
  const p=president(),full=state.clubs.find(c=>c.id===club.id);
  body=`<div class="runtime-info">${esc(p?.name??'dato non disponibile')}<br>${esc(p?.goal??'dato non disponibile')}<br>Fiducia: ${esc(full.boardTrust??'dato non disponibile')}/100<br>Cassa: ${esc(full.finance?.cash?.toLocaleString('it-IT')??'dato non disponibile')} ₤<br>Arretrati: ${esc(full.finance?.arrears?.toLocaleString('it-IT')??'dato non disponibile')} ₤</div>`;
 }else{
  body=`<div class="runtime-info">Morale tifosi ${esc(ui.coach.relationships.fans)}/100<br>Stampa ${esc(ui.coach.relationships.media)}/100<br>Rapporti persistiti dalla conferenza e dal sistema 09.</div>`;
 }
 const menu=[['campionato','⚽','CAMPIONATO'],['rosa','▤','ROSA'],['allenamento','◆','ALLENAMENTO'],['tifoseria','♟','TIFOSERIA'],['presidente','♛','PRESIDENTE']];
 return head('UFFICIO DEL MISTER',`${ui.gameDate} · ${club.name}`)+kpis()+`<div class="runtime-split">${pane('SCRIVANIA',`<div class="menu-cards runtime-grow">${menu.map(([key,g,title])=>`<button class="menu-card" data-action="section" data-value="${key}" aria-pressed="${selectedHub===key}"><span class="emoji">${g}</span>${title}</button>`).join('')}</div>`,'runtime-grow')}${pane(selectedHub.toUpperCase(),body+h(btn('FORMAZIONE ▶','formation','','gold-btn')+btn('SALVA','save')),'runtime-grow')}</div>`;
}
function renderFieldGroup(title,object){
 const fields=object&&typeof object==='object'?Object.entries(object).filter(([,val])=>typeof val==='number'||typeof val==='string'):[];
 return `<section class="runtime-attribute-group"><h2>${esc(title)}</h2>${fields.length?fields.map(([key,val])=>`<div class="runtime-attribute"><span>${esc(key)}</span><strong>${esc(val)}</strong></div>`).join(''):'<span class="runtime-missing">dato non disponibile</span>'}</section>`;
}
function renderPlayer(){
 const club=getUI()?.club;
 const selected=club?.players.find(p=>p.playerId===selectedPlayerId);
 if(!selected)return head('GIOCATORE NON DISPONIBILE')+pane('SCHEDA',h(btn('TORNA ALLA ROSA','back-rosa')),'runtime-grow');
 // Both authoritative read-only projections must refer to the same player ID.
 const roster=getRosterPlayer(state,selectedPlayerId),training=getTrainingPlayer(state,selectedPlayerId);
 if(roster.playerId!==selectedPlayerId||training.playerId!==selectedPlayerId||roster.clubId!==club.id||training.clubId!==club.id)
  throw Error('Scheda giocatore non coerente col club selezionato');
 const item=profileSource==='allenamento'?training:roster;
 const p=item.player;
 return head('SCHEDA GIOCATORE',`${esc(club.name)} · ${profileSource==='allenamento'?'ALLENAMENTO (LETTURA)':'ROSA'}`)+`<div class="runtime-split">${pane('ANAGRAFICA E CONDIZIONE',`<div class="runtime-scroll runtime-grow runtime-detail-scroll"><h2 class="runtime-player-name">${esc(p.name)}</h2><div class="runtime-info">ID: ${esc(p.id)}<br>Club: ${esc(club.name)}<br>Ruoli: ${esc(p.positions?.join('/')||'dato non disponibile')}<br>Età: ${esc(p.age??'dato non disponibile')}<br>Grafica: ${esc(item.appearanceStatus==='ready'?'disponibile':'dato non disponibile')}</div>${renderFieldGroup('CONDIZIONE · STATUS',p.status)}${renderFieldGroup('CONTRATTO',p.contract)}</div>${h(btn('TORNA ALLA ROSA','back-rosa')+btn('ALLENAMENTO','back-training'))}`,'runtime-grow')}${pane('ATTRIBUTI REALI',`<div class="runtime-scroll runtime-grow runtime-detail-scroll">${renderFieldGroup('TECNICA',p.technical)}${renderFieldGroup('FISICO',p.physical)}${renderFieldGroup('MENTALE',p.mental)}<p class="runtime-foot">Valori letti da ${profileSource==='allenamento'?'getTrainingPlayer':'getRosterPlayer'} (Agente 07). Nessun effetto attribuito dalla UI.</p></div><button class="ui-btn runtime-unavailable" disabled type="button">AZIONI ALLENAMENTO NON DISPONIBILI</button>`,'runtime-grow')}</div>`;
}

function renderFormation(){const club=getUI()?.club;if(!club)return head('NESSUNA SQUADRA');const all=club.players;return head('FORMAZIONE E PANCHINA',`${lineup.size} TITOLARI · ${bench.size} RISERVE`)+`<div class="runtime-split">${pane('TOCCA TITOLARI / PANCHINA',`<div class="runtime-roster runtime-grow">${all.map(p=>`<label class="runtime-player"><input type="checkbox" data-player="${esc(p.playerId)}" ${lineup.has(p.playerId)?'checked':''} aria-label="Titolare ${esc(p.name)}"><span>${esc(p.name)}</span><small>${esc(p.positions.join('/'))}</small></label>`).join('')}</div>`,'runtime-grow')}${pane('PREPARTITA',`<p class="runtime-info">Esattamente 11 titolari e un portiere. Le spunte controllano l’undici; gli altri idonei vanno in panchina (max 5).</p><label class="runtime-label">Capitano<select id="captain">${all.filter(p=>lineup.has(p.playerId)).map(p=>`<option value="${esc(p.playerId)}" ${captain===p.playerId?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><p class="runtime-info">Portieri titolari: ${all.filter(p=>lineup.has(p.playerId)&&p.positions.includes('GK')).length}</p><p class="runtime-foot">Il controller 07 e il modulo 09 convalidano la scelta. Il salvataggio è vietato durante una gara preparata.</p>${h(btn('UFFICIO','hub')+btn('CALCIO D’INIZIO','prepare','','gold-btn'))}`,'runtime-grow')}</div>`}
function renderMatch(){const snap=engine?.snapshot(),mi=matchInput,fx=state?.flow?.pendingMatch;const hclub=state.clubs.find(c=>c.id===fx?.homeId),aclub=state.clubs.find(c=>c.id===fx?.awayId);return head('PARTITA VERA · ENGINE 06',`GIORNATA ${state.week} · 1× ≈ 15 MINUTI`)+`<div class="runtime-score"><span>${esc(hclub?.name)}</span><b id="match-score">${snap?.score.home??0} — ${snap?.score.away??0}</b><span>${esc(aclub?.name)}</span><strong id="match-time">00:00</strong></div><div class="runtime-split"><div class="runtime-pitch"><canvas id="r03-pitch" width="640" height="360" aria-label="Partita reale in 22 giocatori renderizzata su canvas"></canvas></div><section class="panel runtime-match-panel"><div class="runtime-grid"><div class="kpi"><small>POSSESSO</small><b id="match-pos">50%</b></div><div class="kpi"><small>TIRI</small><b id="match-shots">0–0</b></div></div><div class="runtime-grid">${btn('▶ RIPRENDI','pause','','gold-btn')}${btn('1× VELOCITÀ','speed')}${btn('CAMPO COMPLETO','camera-full','','active')}${btn('TV NON DISP.','camera-tv')}</div><p class="runtime-match-note" id="match-news">Render 05 · La camera televisiva non è ancora implementata.</p>${mode==='qa'?btn('TERMINA GARA CON ENGINE06 (QA)','finish-qa','','gold-btn'):''}<p class="runtime-match-note">Gol, minuti e statistiche: solo snapshot ed eventi Engine 06.</p></section></div>`}
function renderPost(){const fm=state.flow.finalMatch;return head('FISCHIO FINALE · RISULTATO UFFICIALE','MATCH ENGINE 06')+`<div class="runtime-split">${pane('RISULTATO VERIFICATO',`<div class="runtime-score"><b>${fm.score.home} — ${fm.score.away}</b></div><div class="runtime-info">Esito del mister: ${esc(fm.result)}<br>Eventi motore: ${esc(fm.eventCount)}<br>Fonte: ${esc(state.flow.resultSources[fm.fixtureId])}</div>`,'runtime-grow')}${pane('CHIUSURA GIORNATA',`<p class="runtime-info">Due risposte stampa completate. L’Agente 09 aggiornerà il bilancio e il rapporto col presidente; il controller avanzerà il campionato una sola volta.</p>${h(btn('AVANZA GIORNATA ▶','advance','','gold-btn'))}`,'runtime-grow')}</div>`}
function renderSeason(){return head('STAGIONE TERMINATA')+pane('PROSSIMO ANNO',`<p class="runtime-info">Ultima giornata conclusa. I risultati precedenti restano nella carriera.</p>${h(btn('INIZIA NUOVA STAGIONE','rollover','','gold-btn'))}`,'runtime-grow')}
function renderUnemployed(){return head('SENZA PANCHINA',state.gameDate)+pane('NUOVE OCCASIONI',`<p class="runtime-info">Il presidente ha deciso. Le vacanze contrattuali restano del sistema 07.</p><div class="runtime-scroll runtime-grow">${(getUI().careerOffers||[]).map(x=>btn(x.clubName||x.clubId,'vacancy',x.id)).join('')}</div>${h(btn('AVANZA SETTIMANA','advance','','gold-btn'))}`,'runtime-grow')}
function renderGameover(){return head('GAME OVER · MORALE ESAURITO')+pane('CARRIERA CONCLUSA',`<div class="runtime-info">Morale del mister: 0. Il controller 07/09 ha chiuso questa carriera. Puoi crearne una nuova senza eliminare i salvataggi precedenti, oppure caricare una carriera valida.</div>${h(btn('NUOVA CARRIERA','reset-career','','gold-btn')+btn('CARICA SALVATAGGIO','load'))}`,'runtime-grow')}
function render(){restoreMode();if(state?.coach?.gameOver||state?.coach?.morale===0)screen='gameover';const output={entry:renderEntry,avatar:renderAvatar,offers:renderOffers,president:renderPresident,press:renderPress,hub:renderHub,formation:renderFormation,match:renderMatch,post:renderPost,season:renderSeason,unemployed:renderUnemployed,gameover:renderGameover,player:renderPlayer}[screen]||renderEntry;area.innerHTML=output();root.querySelectorAll('.quick-nav button').forEach(b=>b.disabled=screen==='match'||screen==='gameover'&&b.dataset.action!=='home'&&b.dataset.action!=='save');if(screen==='match')mountMatchView();}
function clearMatch(){if(view)view.destroy();viewReady=false;view=null;bridge=null;engine=null;matchInput=null;scoreSnapshot=null;paused=true;}
function prepare(){if(!state)return;const all=getUI().club.players;const chosen=all.filter(p=>lineup.has(p.playerId));const goalkeepers=chosen.filter(p=>p.positions.includes('GK'));if(chosen.length!==11||goalkeepers.length!==1){failure('La formazione richiede 11 titolari, esattamente un portiere');return}
 const candidates=all.filter(x=>!lineup.has(x.playerId));const b=[...bench].filter(x=>candidates.some(p=>p.playerId===x));if(!b.length){failure('Scegli almeno una riserva');return}const result=prepareMatch(state,{xi:[...lineup],bench:b,captainId:captain});api(result,()=>{engine=result.engine;matchInput=result.matchInput;paused=true;speed=1;display('match');});}
function mountMatchView(){if(view){view.destroy();view=null}viewReady=false;const canvas=document.querySelector('#r03-pitch');if(!canvas||!engine)return;const input=matchInput;const firstGK=(club,ids)=>ids.find(id=>club.players.find(p=>p.id===id)?.positions.includes('GK'));
 const ids=[firstGK(input.homeClub,input.homeXI),firstGK(input.awayClub,input.awayXI)];const kit={home:{shirt:'#2759b6',shirtB:'#fff0b0',pattern:'vertical',shorts:'#f2ebca'},away:{shirt:'#be3640',shirtB:'#faefcc',pattern:'solid',shorts:'#f5ede3'},homeKeeper:{shirt:'#edc84b'},awayKeeper:{shirt:'#319367'}};
 view=createMatchView(canvas,{config:{homeTeamId:input.homeClub.id,awayTeamId:input.awayClub.id,keeperIds:ids,appearances:kit,simSecondsPerRealSecond:6,autoStart:false,onWarning:()=>{}}});bridge=createEngineViewBridge(engine,view,{keeperIds:ids});view.setPaused(true);bridge.sync();const loading=view;view.ready.then(()=>{if(view===loading&&!view.destroyed){viewReady=true;view.drawAt(performance.now());}}).catch(()=>{});updateMatch();}
function updateMatch(){if(!engine||screen!=='match')return;const s=engine.snapshot();scoreSnapshot=s;const el=id=>document.querySelector('#'+id);if(el('match-score'))el('match-score').textContent=`${s.score.home} — ${s.score.away}`;if(el('match-time')){const m=Math.floor(s.t/60),sec=Math.floor(s.t%60);el('match-time').textContent=String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')};if(el('match-pos'))el('match-pos').textContent=Math.round(s.stats.home.possession)+'%';if(el('match-shots'))el('match-shots').textContent=`${s.stats.home.shots}–${s.stats.away.shots}`;}
function step(seconds){if(!engine||screen!=='match')return;tickMatch(engine,seconds,{speed});const d=bridge.sync(performance.now());for(const e of d.events){if(['goal','fulltime','halftime','shot','save'].includes(e.type))lastEvent=`${Math.floor(e.t/60)}′ · ${e.type.toUpperCase()} · ${e.playerId||''}`;}const feed=document.querySelector('#match-news');if(feed)feed.textContent=lastEvent||'Rendering 05 · dati del motore 06';updateMatch();if(engine.isFinished())finishMatch()}
function finishMatch(){if(!engine||!engine.isFinished())return;const result=consumeMatchResult(state,engine,{press});api(result,()=>{clearMatch();save({silent:true});display('press')})}
function fulltimeQA(){if(!engine||mode!=='qa')return;if(!engine.isFinished())step((5400-engine.snapshot().t)/6/speed+1);}
function advance(){if(!state)return;const week=state.absoluteWeek;api(advanceMatchday(state,{presidentCatalog:presidents,expectedAbsoluteWeek:week}),()=>{save({silent:true});display(activeStage()==='season_complete'?'season':activeStage()==='unemployed'?'unemployed':'hub');message('Giornata '+week+' chiusa · nuova data '+state.gameDate)})}
function interact(action,value){if((state?.coach?.gameOver||state?.coach?.morale===0)&&!['load','home','reset-career'].includes(action))return failure('GAME_OVER');
 switch(action){case 'reset-career':restartAfterGameOver();break;case 'home':if(state&&screen!=='entry'&&screen!=='match'&&activeStage()==='hub'){display('hub')}else display('entry');break;
 case 'start':display('avatar');break;case 'avatar':avatar=Number(value);render();break;case 'back-avatar':display('avatar');break;case 'begin':newCareer();break;
 case 'offer':offerIndex=Number(value);render();break;case 'accept':{const offer=listInitialOffers(state)[offerIndex];api(acceptOffer(state,offer.id,{press}),()=>{selectLineup();save({silent:true});display('president')});break;}
 case 'press':display('press');break;case 'answer':{const [q,a]=value.split('|');const kind=activeStage()==='postmatch_press'?'postmatch':'opening';const result=kind==='opening'?answerOpeningPress(state,q,a,{press}):answerPostMatchPress(state,q,a,{press});api(result,()=>{save({silent:true});display(activeStage()==='hub'?'hub':activeStage()==='postmatch_ready'?'post':'press')});break;}
 case 'hub':if(!state)return display('entry');if(activeStage()==='hub')display('hub');else if(activeStage()==='postmatch_ready')display('post');else failure('Completa il passaggio corrente');break;
 case 'section':selectedHub=value;selectedPlayerId=null;render();break;
 case 'player':{const club=getUI()?.club;if(!club?.players.some(p=>p.playerId===value))return failure('Giocatore non presente nella rosa');selectedPlayerId=value;profileSource=selectedHub==='allenamento'?'allenamento':'rosa';display('player');break;}
 case 'back-rosa':selectedHub='rosa';selectedPlayerId=null;display('hub');break;
 case 'back-training':selectedHub='allenamento';selectedPlayerId=null;display('hub');break;case 'formation':if(activeStage()==='hub')display('formation');else failure('Non è il momento di preparare la squadra');break;
 case 'prepare':prepare();break;case 'pause':paused=!paused;view?.setPaused(paused);renderMatchControls();last=performance.now();break;
 case 'speed':speed=speed===8?1:speed*2;view?.setSpeed(speed);renderMatchControls();break;
 case 'camera-full':message('Vista a campo completo del renderer 05');break;
 case 'camera-tv':message('Camera televisiva non disponibile nel renderer 05: nessuno zoom finto');break;
 case 'finish-qa':fulltimeQA();break;case 'advance':advance();break;case 'next':if(activeStage()==='postmatch_ready'||activeStage()==='unemployed')advance();else if(activeStage()==='hub')display('formation');else failure('Giornata non avanzabile');break;
 case 'save':save();break;case 'load':load();break;case 'rollover':api(rolloverSeason(state),()=>{save({silent:true});selectLineup();display('hub')});break;
 case 'vacancy':api(takeCareerOffer(state,value),()=>{selectLineup();save({silent:true});display('hub')});break;
 default:failure('Azione non gestita: '+action);
 }}
function renderMatchControls(){if(screen!=='match')return;const p=area.querySelector('[data-action="pause"]'),s=area.querySelector('[data-action="speed"]');if(p){p.textContent=paused?'▶ RIPRENDI':'Ⅱ PAUSA';p.classList.toggle('gold-btn',paused)}if(s)s.textContent=speed+'× VELOCITÀ'}
root.addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b||b.disabled||!root.contains(b))return;guard(()=>interact(b.dataset.action,b.dataset.value))});
root.addEventListener('change',e=>{if(e.target.id==='origin'){origin=e.target.value;return}if(e.target.id==='qa-mode'){mode=e.target.checked?'qa':'normal';render();return}if(e.target.id==='captain'){captain=e.target.value;return}if(!e.target.matches('[data-player]'))return;const id=e.target.dataset.player;if(e.target.checked)lineup.add(id);else lineup.delete(id);const club=getUI()?.club;const eligible=club?.players||[];bench=new Set(eligible.filter(p=>!lineup.has(p.playerId)).slice(0,5).map(p=>p.playerId));if(!lineup.has(captain))captain=[...lineup].find(x=>!club.players.find(p=>p.playerId===x)?.positions.includes('GK'))||null;render();});
function loop(now){if(view&&viewReady&&screen==='match'){try{view.drawAt(now)}catch(e){viewReady=false;failure('Errore renderer: '+e.message)}}const dt=Math.max(0,Math.min(.20,(now-last)/1000));last=now;if(engine&&screen==='match'&&!paused){try{step(dt)}catch(e){paused=true;view?.setPaused(true);failure(e.message)}}requestAnimationFrame(loop)}
window.OronzoR03=Object.freeze({getState:()=>state,getScreen:()=>screen,getSnapshot:()=>scoreSnapshot,completeQaMatch:()=>guard(fulltimeQA),getErrors:()=>errors.slice(),getMode:()=>mode, isViewReady:()=>viewReady, getStage:activeStage});
render();loadCopy().catch(e=>{failure(e.message);errors.push(e.message)});last=performance.now();requestAnimationFrame(loop);
