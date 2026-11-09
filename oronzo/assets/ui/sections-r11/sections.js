/** ORONZO-AGENT-07B · R11-01. Read-only section presenters.
 * All mutations are delegated to career-r03.js -> controller07.
 * Data rendered here is always from the persisted career state.
 */
import {createAssetAdapter} from '../../../systems/match-view/asset-adapter.js';

export const TRAINING_PLANS_R11=Object.freeze([
  ['technical','TECNICA','Controllo, passaggi e tiro'],
  ['athletic','ATLETICA','Resistenza e velocità'],
  ['tactical','TATTICA','Posizioni e decisioni'],
  ['balanced','EQUILIBRATO','Lavoro distribuito'],
  ['rest','RECUPERO','Riposo e recupero']
]);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const B=(label,action,value='',extra='')=>'<button type="button" class="ui-btn '+E(extra)+'" data-action="'+E(action)+'" data-value="'+E(value)+'">'+E(label)+'</button>';
const val=x=>x===undefined||x===null||x===''?'—':E(x);
const number=x=>typeof x==='number'&&Number.isFinite(x);
const score=x=>number(x)?Math.max(0,Math.min(100,x)):null;
const fmt=x=>number(x)?new Intl.NumberFormat('it-IT',{maximumFractionDigits:2}).format(x):'—';
const badge=(t,cls='')=>'<span class="r11-chip '+cls+'">'+E(t)+'</span>';
const metric=(name,value)=>'<div class="r11-metric"><span>'+E(name)+'</span><b>'+val(value)+'</b></div>';
const stat=(name,value,{limit=100}={})=>{
  const ok=number(value), pct=ok?Math.min(100,Math.max(0,value/limit*100)):0;
  return '<div class="r11-stat"><div class="r11-stat-top"><span>'+E(name)+'</span><strong>'+ (ok?fmt(value):'—') +'</strong></div>'+
    '<div class="r11-stat-bar" role="meter" aria-label="'+E(name)+'" aria-valuemin="0" aria-valuemax="'+E(limit)+'"'+(ok?' aria-valuenow="'+E(value)+'"':'')+'><i style="width:'+pct+'%"></i></div></div>';
};
const attributeLabels={
 passing:'Passaggi',shooting:'Tiro',control:'Controllo',tackling:'Contrasti',
 positioning:'Posizionamento',decisions:'Decisioni',goalkeeping:'Parate',vision:'Visione',dribbling:'Dribbling',
 pace:'Velocità',stamina:'Resistenza',strength:'Forza',durability:'Robustezza',acceleration:'Scatto',
 composure:'Freddezza',discipline:'Disciplina',teamwork:'Gioco di squadra',confidence:'Autostima',
 morale:'Morale',luck:'Fortuna',character:'Carattere',ambition:'Ambizione',pazzia:'Pazzia',
 spericolatezza:'Spericolatezza',coraggio:'Coraggio',suscettibilita:'Suscettibilità',impulsivita:'Impulsività'
};
const group=(title,object)=>{
 const entries=Object.entries(object||{}).filter(([,x])=>number(x));
 return '<section class="r11-attribute-group"><h3>'+E(title)+'</h3><div class="r11-bars">'+
  (entries.length?entries.map(([k,x])=>stat(attributeLabels[k]||k,x)).join(''):'<p>Dati non disponibili nel salvataggio.</p>')+
 '</div></section>';
};
const knownOrigin=p=>{
 const o=p?.origin;
 if(!o||typeof o!=='object')return null;
 return [o.municipalityName,o.regionId,o.macroRegion].filter(Boolean).join(' · ')||null;
};
const clubPlayerReport=(reports,id)=>reports.filter(x=>x?.report?.playerId===id);
export function renderPlayerCard({item,clubName,source='rosa',reports=[]}){
 if(!item?.player||item.player.id!==item.playerId)throw new Error('R11_PLAYER_ID_MISMATCH');
 const p=item.player, s=p.status||{}, r=p.relationships||{}, c=p.contract||{};
 const active=source==='allenamento';
 const availability=s.injuryDays>0?badge('INFORTUNATO · '+fmt(s.injuryDays)+' GG','warning'):
   s.suspensionMatches>0?badge('SQUALIFICATO · '+fmt(s.suspensionMatches)+' TURNI','warning'):badge('DISPONIBILE','okay');
 const appearance=item.appearanceStatus==='ready'&&item.appearance&&item.visualKits?.home&&
  paletteIndex(item.appearance.skinToneId,skins)&&paletteIndex(item.appearance.hairColorId,hairs);
 const card='<div class="r11-player-hero"><div class="r11-player-picture">'+
 (appearance?'<canvas id="r11-player-art" width="112" height="112" aria-label="Sprite autentico del calciatore" role="img"></canvas>':
 '<div class="r11-no-portrait" role="note"><span>▦</span>IDENTITÀ VISIVA<br>NON ASSOCIATA</div>')+
 '</div><div class="r11-player-ident"><strong>'+E(p.name)+'</strong><span>'+
 E(p.positions?.join(' / ')||'Ruolo non registrato')+' · '+(number(p.age)?E(p.age)+' anni':'Età sconosciuta')+'</span>'+
 '<div class="r11-chips">'+availability+badge(p.foot==='L'?'PIEDE SX':p.foot==='R'?'PIEDE DX':p.foot==='B'?'AMBIDESTRO':'PIEDE N/D')+'</div>'+
 '<small>ORIGINE: '+E(knownOrigin(p)||'non registrata')+'</small><small>PERSONALITÀ: '+E(p.personality||'non registrata')+'</small></div></div>';
 const contract='<div class="r11-metrics">'+
 metric('Contratto fino al',c.until??c.contractUntil??'non registrato')+
 metric('Ingaggio settimanale',number(c.weeklyWage)?fmt(c.weeklyWage)+' ₤':'non registrato')+
 metric('Potenziale',p.development?.potential??'—')+
 metric('Fiducia nel mister',r.coachTrust??p.relationshipWithCoach??'—')+'</div>';
 const status='<div class="r11-status-bars">'+stat('Forma fisica',s.fitness)+
 stat('Salute',s.health)+stat('Fatica',s.fatigue)+stat('Morale personale',p.mental?.morale)+
 '</div><div class="r11-metrics">'+metric('Infortunio (giorni)',s.injuryDays)+
 metric('Squalifica (turni)',s.suspensionMatches)+'</div>';
 const press=clubPlayerReport(reports,p.id);
 const footer=press.length?'<p class="r11-hint">Eventi personali registrati: '+E(press.length)+'</p>':'';
 return '<div class="r11-player-page">'+
 '<section class="panel r11-player-identity"><div class="panel-title">CARTELLINO · '+E(clubName)+'</div>'+
 '<div class="r11-column-scroll">'+card+status+contract+footer+
 '<p class="r11-hint">'+(appearance?'Sprite 01 renderizzato dai dati visivi persistenti; dettagli di barba e taglio non codificati dall’atlante base.':
 'Il salvataggio non contiene un visual + kit canonico: nessun ritratto inventato.')+'</p></div>'+
 '<div class="r11-bottom">'+B(active?'TORNA ALL’ALLENAMENTO':'TORNA ALLA ROSA',active?'back-training':'back-rosa')+
 B(active?'VEDI ROSA':'VEDI ALLENAMENTO',active?'back-rosa':'back-training')+'</div></section>'+
 '<section class="panel r11-player-attributes"><div class="panel-title">IL CALCIATORE · DATI REALI</div>'+
 '<div class="r11-column-scroll">'+group('TECNICA',p.technical)+group('FISICO',p.physical)+group('MENTE',p.mental)+'</div></section></div>';
}
export function trainingStatus(ui){
 const t=ui?.m1?.training||{},week=ui?.absoluteWeek;
 const selected=t.selected?.absoluteWeek===week?t.selected:null;
 const applied=Array.isArray(t.appliedWeeks)&&t.appliedWeeks.includes(week);
 return {selected,applied,canSelect:ui?.stage==='hub'&&!!ui?.club&&!selected&&!applied};
}
export function renderTrainingPanel({ui,plan='balanced',intensity=50}){
 const state=trainingStatus(ui),ledger=ui?.m1?.training||{};
 // Once confirmed, persisted controller values own every locked control, even after reload.
 const shownPlan=state.selected?.plan??plan,shownIntensity=state.selected?.intensity??intensity;
 const last=Array.isArray(ledger.reports)?ledger.reports.at(-1):null;
 const clubPlayers=ui?.club?.players||[];
 const planName=x=>TRAINING_PLANS_R11.find(p=>p[0]===x)?.[1]||x;
 const pills=TRAINING_PLANS_R11.map(([key,name,description])=>
  '<button type="button" data-action="training-plan" data-value="'+E(key)+'" class="r11-plan'+(shownPlan===key?' is-selected':'')+
  '" aria-pressed="'+(shownPlan===key)+'" '+(!state.canSelect?'disabled':'')+' title="'+E(description)+'">'+E(name)+'</button>').join('');
 const stateText=state.selected?'PIANO BLOCCATO: '+planName(state.selected.plan)+' · '+fmt(state.selected.intensity)+'% · settimana '+E(ui.absoluteWeek):
  state.applied?'SETTIMANA GIÀ ALLENATA':'PIANIFICA LA SETTIMANA '+E(ui.absoluteWeek);
 const lastBlock=last?'<div class="r11-training-report"><b>ULTIMA SEDUTA APPLICATA · SETT. '+E(last.absoluteWeek)+'</b>'+
 '<span>'+E(planName(last.report?.plan))+' · Fatica media risultante: '+fmt(last.report?.averageFatigue)+'</span>'+
 '<span>Infortuni rilevati: '+E(Array.isArray(last.incidents)?last.incidents.length:'non registrati')+'</span></div>':
 '<div class="r11-training-report">Nessun esito registrato dal controller 07.</div>';
 return '<div class="r11-training-page">'+
 '<section class="panel r11-training-scene"><div class="panel-title">CAMPO D’ALLENAMENTO</div><img src="./training.png" alt="Illustrazione originale ORONZO: campo di allenamento" class="r11-original-art" loading="lazy">'+
 '<p class="r11-hint">'+E(stateText)+'</p>'+lastBlock+
 '<div class="r11-bottom">'+B('SCHEDE CALCIATORI','training-roster')+'</div></section>'+
 '<section class="panel r11-training-controls"><div class="panel-title">PROGRAMMA SETTIMANALE</div>'+
 '<div class="r11-column-scroll"><div class="r11-plan-grid">'+pills+'</div>'+
 '<label class="r11-intensity-label" for="r11-training-intensity">INTENSITÀ <output id="r11-intensity-value">'+E(shownIntensity)+'</output>%</label>'+
 '<input id="r11-training-intensity" data-training-intensity type="range" min="0" max="100" step="1" value="'+E(shownIntensity)+'" '+(!state.canSelect?'disabled':'')+'>'+
 '<p class="r11-hint">La scelta viene registrata oggi. Fatica e attributi cambiano soltanto con l’avanzamento reale della settimana.</p>'+
 '<small class="r11-hint">Rosa: '+E(clubPlayers.length)+' giocatori · programma corrente: '+E(state.selected?.plan||'da scegliere')+'</small></div>'+
 '<div class="r11-bottom">'+B('UFFICIO','hub')+(state.canSelect?B('CONFERMA PROGRAMMA','training-apply','','gold-btn'):B('PIANO GIÀ REGISTRATO','training-locked','','r11-inactive'))+'</div>'+
 '</section></div>';
}
export function renderRosterLinks({ui,activeTraining=false}){
 const rows=(ui?.club?.players||[]).map(x=>'<button type="button" class="r11-roster-row" data-action="player" data-value="'+E(x.playerId)+'">'+
 '<b>'+E(x.positions?.[0]||'—')+'</b><span>'+E(x.name)+'</span><small>VEDI SCHEDA ›</small></button>').join('');
 return '<div class="r11-column-scroll r11-roster-scroll">'+rows+'</div>';
}
const tabs=[['stadio','STADIO'],['tifosi','TIFOSI'],['giornali','GIORNALI']];
export function renderSupportersPanel({ui,club,tab='stadio',canEditTicket=false}){
 const toolbar='<nav class="r11-tabs" aria-label="Sottosezioni tifoseria">'+tabs.map(([id,label])=>
  '<button type="button" data-action="support-tab" data-value="'+id+'" '+(id===tab?'aria-current="page"':'')+'>'+label+'</button>').join('')+'</nav>';
 let inside='';
 if(tab==='stadio'){
  const s=club?.stadium,valid=Number.isInteger(s?.capacity)&&s.capacity>0&&
    number(s?.condition)&&number(s?.ticketPriceITL);
  const history=Array.isArray(club?.management?.stadiumSettlements)?club.management.stadiumSettlements:[];
  inside='<div class="r11-stadium-view"><div class="r11-stadium-drawing" aria-hidden="true"><div class="r11-pitch-mini"></div><span>ORONZO 1979 · STADIO</span></div>'+
   '<div class="r11-column-scroll">'+(valid?'<div class="r11-metrics">'+
   metric('Capienza',fmt(s.capacity))+metric('Condizione',fmt(s.condition)+'/100')+
   metric('Biglietto',fmt(s.ticketPriceITL)+' ₤')+
   metric('Cassa società',fmt(club?.finance?.cash)+' ₤')+'</div>'+
   (canEditTicket?'<div class="r11-stadium-price"><input type="number" id="r11-ticket-price" min="0" max="1000000" step="50" value="'+E(s.ticketPriceITL)+'" aria-label="Prezzo biglietto in lire">'+B('APPLICA PREZZO','ticket-change')+'</div>':
   '<p class="r11-hint">Adapter biglietteria non disponibile: prezzo in lettura.</p>'):
   '<div class="r11-empty"><b>DATI STADIO NON DISPONIBILI</b><p>La carriera non conserva capienza, condizioni e prezzo dei biglietti. Nessuna affluenza o incasso è stimato.</p>'+
   '<small>Richiesto adapter Career07 per inizializzare club.stadium da dati espliciti; gestione 09 subordinata a salvataggio atomico.</small></div>')+
   (history.length?'<div class="r11-timeline">'+history.slice(-4).reverse().map(x=>'<div>'+E(x.fixtureId??x.matchId??'Gara registrata')+
   ' · Presenze '+val(x.attendance)+' · Incasso '+(number(x.revenueITL)?fmt(x.revenueITL)+' ₤':'non registrato')+'</div>').join('')+'</div>':'')+'</div></div>';
 }else if(tab==='tifosi'){
  const approval=club?.supporters?.approval;
  const notices=Array.isArray(club?.board?.notices)?club.board.notices.filter(n=>['supporters','fans','stadium'].includes(n.kind)).slice(-4).reverse():[];
  inside='<div class="r11-fans-view"><div class="r11-terrace" aria-hidden="true"><span>CURVA · 1979</span></div><div class="r11-column-scroll">'+
   '<div class="r11-metrics">'+metric('Rapporto mister / tifosi',ui?.coach?.relationships?.fans)+
   metric('Gradimento club',approval??'non disponibile')+'</div>'+
   (notices.length?'<div class="r11-timeline">'+notices.map(x=>'<p>'+E(x.reason||x.kind)+' · sett. '+val(x.week)+'</p>').join('')+'</div>':
    '<p class="r11-hint">Nessun evento specifico tifoseria registrato. I rapporti mostrati provengono dallo stato salvato.</p>')+
   '</div></div>';
 }else{
  const sessions=Object.entries(ui?.press||{}).filter(([,s])=>s?.questions);
  const entries=sessions.flatMap(([phase,s])=>(s.questions||[]).filter(q=>Object.hasOwn(s.answers||{},q.id)).map(q=>{
   const id=s.answers[q.id],a=(q.answers||[]).find(x=>x.id===id);
   return '<div class="r11-press-item"><b>'+E(q.broadcasterName||q.journalistName||phase)+'</b><span>'+E(q.text)+'</span>'+
    '<small>Risposta registrata: '+E(a?.text||a?.label||id)+'</small></div>';
  }));
  inside='<div class="r11-news-view"><div class="r11-newspaper" aria-hidden="true"><b>LA GAZZETTA</b><span>RITAGLI D’ARCHIVIO</span></div>'+
   '<div class="r11-column-scroll"><div class="r11-metrics">'+metric('Rapporto stampa',ui?.coach?.relationships?.media)+'</div>'+
   (entries.length?'<div class="r11-news-entries">'+entries.slice(-6).reverse().join('')+'</div>':
    '<p class="r11-hint">Nessuna conferenza registrata. Non sono state generate notizie artificiali.</p>')+'</div></div>';
 }
 return '<div class="r11-support-page"><section class="panel r11-support-panel"><div class="panel-title">TIFOSERIA · ARCHIVIO SOCIETÀ</div>'+
 toolbar+inside+'<div class="r11-bottom">'+B('UFFICIO','hub')+B('SALVA','save')+'</div></section></div>';
}
export function agendaItems(ui){
 if(!ui)return[];
 const status=ui.coachWeekStatus||{},stage=ui.stage||'hub',training=trainingStatus(ui),items=[];
 if(stage==='hub'&&ui.club){
  items.push({title:'ALLENAMENTO',detail:training.selected?'Piano '+training.selected.plan+' già confermato':
     training.applied?'Seduta contabilizzata':'Scegli il programma settimanale',
   action:training.canSelect?'section':'section',value:'allenamento',done:!!training.selected||training.applied});
 }
 if(status.kind==='bye_week'){
  items.push({title:'TURNO DI RIPOSO',detail:'Nessuna partita del mister in questa settimana. Avanza il calendario delle altre squadre.',
   action:status.canAdvance?'advance':'',done:false});
 }else if(status.kind==='match_pending'){
  items.push({title:'PREPARA LA PARTITA',detail:'La gara del mister è ancora da disputare. Non può essere saltata.',
   action:stage==='hub'?'formation':'',done:false});
 }else if(status.kind==='match_recorded'){
  items.push({title:'CHIUSURA PARTITA',detail:stage==='postmatch_ready'?'Conferenza conclusa: avanza la settimana.':'Completa la conferenza stampa.',
   action:status.canAdvance?'advance':'press',done:false});
 }else if(status.kind==='season_complete'){
  items.push({title:'FINE STAGIONE',detail:'Tutti i calendari conclusi.',
   action:status.canRollover?'rollover':'',done:false});
 }else if(status.kind==='unemployed'){
  items.push({title:'SENZA PANCHINA',detail:'Consulta le offerte oppure avanza la settimana.',
   action:status.canAdvance?'advance':'',done:false});
 }
 if(ui.clubManagement?.requests?.some(x=>x.status==='pending')){
  items.push({title:'DECISIONE PRESIDENZIALE',detail:'Una richiesta al presidente attende una decisione.',
   action:'section',value:'presidente',done:false});
 }
 if(ui.marketWindow?.open===true){
  items.push({title:'MERCATO APERTO',detail:'È attiva una finestra di gameplay. Consulta proposte e mandati.',
   action:'section',value:'presidente',done:false});
 }
 if(ui.club)items.push({title:'ROSA E CONTRATTI',detail:'Consulta calciatori, condizioni e fiducia nel mister.',
   action:'section',value:'rosa',done:false});
 items.push({title:'SALVA CARRIERA',detail:'Archivia l’avanzamento attuale della tua carriera.',
   action:'save',done:false});
 return items;
}
export function renderDeskAgenda(ui){
 const items=agendaItems(ui);
 return '<div class="r11-agenda-view"><div class="r11-column-scroll">'+items.map((x,i)=>'<div class="r11-agenda-row"><span class="r11-agenda-index">'+String(i+1).padStart(2,'0')+'</span>'+
 '<div class="r11-agenda-copy"><b>'+E(x.title)+'</b><small>'+E(x.detail)+'</small></div>'+
 (x.action?B(x.done?'VEDI':'APRI',x.action,x.value||''):badge('IN ATTESA'))+'</div>').join('')+'</div>'+
 '<div class="r11-bottom">'+B('UFFICIO','hub')+'</div></div>';
}
export function agendaSummary(ui){
 const s=ui?.coachWeekStatus;const t=trainingStatus(ui);
 if(s?.kind==='bye_week')return 'TURNO DI RIPOSO · PUOI AVANZARE LA SETTIMANA';
 if(s?.kind==='match_pending')return 'PARTITA IN PROGRAMMA · PREPARA LA FORMAZIONE';
 if(s?.kind==='match_recorded')return 'PARTITA REGISTRATA · COMPLETA LA CHIUSURA';
 if(s?.kind==='season_complete')return 'STAGIONE COMPLETATA';
 return t.canSelect?'ALLENAMENTO DA PIANIFICARE':'CONSULTA LA TUA AGENDA';
}
let adapter=null;
const skins=['#E6B485','#BD8058','#F0C998','#98633F','#D59A70','#B87451','#A87552','#E2AF7A'];
const hairs=['#292022','#6D422B','#2C252C','#9C6737','#49271D','#C49259','#201D20','#594131'];
function paletteIndex(id,list){
 const n=typeof id==='number'?id:Number(id);
 return Number.isInteger(n)&&n>=0&&n<list.length?list[n]:null;
}
/** A player image is drawn only if both persistent visual and club kit identify it.
 * Original indexed PNG/mask from Agent01 are recolored with the same material bridge as match-view.
 */
export async function mountPlayerIllustration(root,item){
 const target=root?.querySelector('#r11-player-art');
 if(!target||item?.appearanceStatus!=='ready')return false;
 const a=item.appearance,skin=paletteIndex(a.skinToneId,skins),hair=paletteIndex(a.hairColorId,hairs);
 const home=item.visualKits?.home;
 if(!skin||!hair||!home)return false;
 if(!adapter)adapter=createAssetAdapter();
 await adapter.playersReady;
 if(!target.isConnected)return false;
 const kit={skin,hair,shirt:home.shirtA??home.shirt,shirtB:home.shirtB??home.shirtA??home.shirt,
  shorts:home.shorts,socks:home.socks,trim:home.trim,pattern:home.shirtPatternId??home.pattern};
 const ctx=target.getContext('2d');
 if(!ctx)return false;
 ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,112,112);ctx.save();
 ctx.scale(3,3);
 const drawn=adapter.drawPlayer(ctx,{x:19,y:34,appearance:kit,team:'home',isKeeper:a.role==='GK'});
 ctx.restore();
 return drawn;
}
