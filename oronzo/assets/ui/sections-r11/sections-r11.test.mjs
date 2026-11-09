// ORONZO 07-bis R11-01 · native Node, real section module (no DOM emulation).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderPlayerCard,renderTrainingPanel,renderSupportersPanel,renderDeskAgenda,
  agendaItems,agendaSummary,trainingStatus} from './sections.js';

const ui=()=>({
 stage:'hub',gameDate:'1979-08-01',seasonWeek:1,absoluteWeek:1,
 club:{id:'PROM-01',name:'Atletico Campanile',divisionId:'PROM',
   players:[{playerId:'PROM-01:P01',name:'Nino Rocchi',positions:['GK']}]},
 coach:{relationships:{fans:43,media:61}},
 coachWeekStatus:{kind:'bye_week',canAdvance:true},
 m1:{training:{selected:null,appliedWeeks:[],reports:[]}},press:{}
});
const p={id:'PROM-01:P01',name:'Nino <Rocchi>',age:28,positions:['GK'],foot:'L',
 personality:'equilibrato',origin:null,
 status:{health:91,fitness:87,fatigue:22,injuryDays:0,suspensionMatches:0},
 technical:{goalkeeping:84,passing:33},physical:{pace:47,stamina:69},
 mental:{morale:67,discipline:48},relationships:{coachTrust:63},
 contract:{until:1980,weeklyWage:2000},development:{potential:79}};
const item=()=>({playerId:p.id,clubId:'PROM-01',player:p,
 appearanceStatus:'awaiting_canonical_visual_data_from_08_01',appearance:null});

test('scheda: dati persistenti, barre, ID e HTML escapato',()=>{
 const html=renderPlayerCard({item:item(),clubName:'Atletico Campanile'});
 assert.match(html,/Nino &lt;Rocchi&gt;/);
 assert.doesNotMatch(html,/Nino <Rocchi>/);
 for(const marker of ['Parate','Fatica','Fiducia nel mister','weekly','Contratto fino al','63','2000']) {
  if(marker!=='weekly') assert.ok(html.includes(marker),marker);
 }
 assert.match(html,/data-action="back-rosa"/);
 assert.doesNotMatch(html,/<canvas/,'no made-up illustration without visual/kit');
});
test('scheda: proiezione allenamento conserva il ritorno',()=>{
 assert.match(renderPlayerCard({item:item(),clubName:'Atletico',source:'allenamento'}),/data-action="back-training"/);
});
test('scheda: blocca mismatch canonical player ID',()=>{
 assert.throws(()=>renderPlayerCard({item:{...item(),playerId:'other'},clubName:'X'}),/R11_PLAYER_ID_MISMATCH/);
});
test('allenamento: esattamente cinque piani e intensità 0..100',()=>{
 const html=renderTrainingPanel({ui:ui(),plan:'tactical',intensity:37});
 assert.equal((html.match(/data-action="training-plan"/g)||[]).length,5);
 assert.match(html,/data-action="training-apply"/);
 assert.match(html,/data-training-intensity type="range" min="0" max="100" step="1" value="37"/);
 assert.match(html,/data-value="tactical"/);
});
test('allenamento: selezione già registrata impedisce nuovo invio',()=>{
 const u=ui();u.m1.training.selected={plan:'rest',intensity:60,absoluteWeek:1};
 assert.equal(trainingStatus(u).canSelect,false);
 assert.doesNotMatch(renderTrainingPanel({ui:u}),/data-action="training-apply"/);
 assert.match(renderTrainingPanel({ui:u}),/PIANO BLOCCATO/);
});
test('allenamento: ledger esiti reali mostrato senza delta ipotetici',()=>{
 const u=ui();u.m1.training.reports=[{absoluteWeek:0,report:{plan:'technical',averageFatigue:43.5},incidents:[{playerId:p.id,days:5}]}];
 const html=renderTrainingPanel({ui:u});
 assert.match(html,/43,5/);
 assert.match(html,/Infortuni rilevati: 1/);
});
test('stadio assente: nessuna capacità, presenza o incasso inventato',()=>{
 const html=renderSupportersPanel({ui:ui(),club:{id:'PROM-01'},tab:'stadio'});
 assert.match(html,/DATI STADIO NON DISPONIBILI/);
 assert.doesNotMatch(html,/Capienza<\/span><b>\d+/);
 assert.doesNotMatch(html,/data-action="ticket-price"/);
});
test('stadio autentico: dati numerici letti dal club e nessuna mutazione',()=>{
 const stadium={capacity:2750,condition:81,ticketPriceITL:600};
 const club={stadium,finance:{cash:120000}};
 const html=renderSupportersPanel({ui:ui(),club,tab:'stadio'});
 assert.match(html,/2\.750/);
 assert.match(html,/600/);
 assert.match(html,/120\.000/);
 assert.equal(stadium.ticketPriceITL,600);
});
test('tifosi: rapporti provenienti dallo stato, tre schede navigabili',()=>{
 const html=renderSupportersPanel({ui:ui(),club:{supporters:{approval:59}},tab:'tifosi'});
 assert.equal((html.match(/data-action="support-tab"/g)||[]).length,3);
 assert.match(html,/59/);
});
test('giornali: solo conferenze con risposte registrate',()=>{
 const u=ui();
 assert.match(renderSupportersPanel({ui:u,club:{},tab:'giornali'}),/Nessuna conferenza registrata/);
 u.press.opening={questions:[{id:'q1',text:'Come giocherete?',journalistName:'Cronista',
  broadcasterName:'Radio',answers:[{id:'a1',text:'Con coraggio.'}]}],answers:{q1:'a1'}};
 const html=renderSupportersPanel({ui:u,club:{},tab:'giornali'});
 assert.match(html,/Come giocherete\?/);
 assert.match(html,/Con coraggio\./);
});
test('agenda bye-week: avanza, mai prepara un match inesistente',()=>{
 const u=ui(),html=renderDeskAgenda(u);
 assert.match(html,/data-action="advance"/);
 assert.doesNotMatch(html,/data-action="formation"/);
 assert.match(agendaSummary(u),/TURNO DI RIPOSO/);
});
test('agenda match_pending: prepara partita, mai skip',()=>{
 const u=ui();u.coachWeekStatus={kind:'match_pending',canAdvance:false};
 const html=renderDeskAgenda(u);
 assert.match(html,/data-action="formation"/);
 assert.doesNotMatch(html,/data-action="advance"/);
});
test('agenda periodo concluso: rollover solo se consentito',()=>{
 const u=ui();u.coachWeekStatus={kind:'season_complete',canRollover:false};
 assert.ok(agendaItems(u).some(x=>x.title==='FINE STAGIONE'&&!x.action));
 u.coachWeekStatus.canRollover=true;
 assert.match(renderDeskAgenda(u),/data-action="rollover"/);
});
test('integrazione: il runtime usa controller e non formula UI',()=>{
 const src=readFileSync(new URL('../career-r03.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('./sections.css',import.meta.url),'utf8');
 const html=readFileSync(new URL('../career-r03.html',import.meta.url),'utf8');
 assert.match(src,/selectM1Training\(state,\{plan:trainingPlan,intensity:trainingIntensity,/);
 assert.match(src,/expectedAbsoluteWeek:state\.absoluteWeek/);
 assert.match(src,/advanceMatchday\(state,\{presidentCatalog:presidents,expectedAbsoluteWeek:week\}\)/);
 assert.match(src,/renderPlayerCard\(\{item,clubName:/);
 assert.match(html,/sections-r11\/sections\.css\?v=r11-01/);
 assert.match(css,/r11-plan\{min-height:44px/);
 assert.match(css,/r11-tabs button\{min-height:44px/);
 assert.match(css,/r11-agenda-row>\.ui-btn\{min-height:44px/);
});
