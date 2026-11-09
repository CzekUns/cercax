/** ORONZO R11 · Verified fixtures only. No dummy scores, no fabricated week. */
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const B=(title,section)=>'<button class="ui-btn" data-action="league-tab" data-value="'+E(section)+'">'+E(title)+'</button>';
export function renderLeaguePage({state,ui,standings,tab='classifica'}={}){
 const club=ui?.club;
 if(!club)return '<p>Campionato non disponibile</p>';
 const league=state.leagues?.[club.divisionId],fixtures=league?.fixtures||[],maxRound=fixtures.reduce((m,x)=>Math.max(m,x.round),0);
 const week=ui.seasonWeek,coachGames=fixtures.filter(f=>f.homeId===club.id||f.awayId===club.id);
 const current=coachGames.find(f=>f.round===week)||null;
 const opponent=current?state.clubs.find(c=>c.id===(current.homeId===club.id?current.awayId:current.homeId)):null;
 const tabs='<div class="r11-tabs r11-league-tabs">'+B('CLASSIFICA','classifica')+B('CALENDARIO','calendario')+B('PROSSIMA','prossima')+'</div>';
 let content='';
 if(tab==='classifica'){
  content='<div class="r11-league-standings">'+(standings||[]).map((x,i)=>
   '<div class="r11-league-row'+(x.clubId===club.id?' is-mine':'')+'"><b>'+E(x.position??i+1)+
   '</b><span>'+E(x.clubName||state.clubs.find(c=>c.id===x.clubId)?.name||x.clubId)+'</span>'+
   '<strong>'+E(x.points)+' PT</strong><small>'+E(x.played)+' G</small></div>').join('')+'</div>';
 }else if(tab==='calendario'){
  content='<div class="r11-league-calendar">'+fixtures.map(f=>{
   const home=state.clubs.find(x=>x.id===f.homeId),away=state.clubs.find(x=>x.id===f.awayId);
   const myMatch=f.homeId===club.id||f.awayId===club.id;
   return '<div class="r11-league-fixture'+(myMatch?' my-match':'')+'"><b>G'+E(f.round)+'</b>'+
    '<span>'+E(home?.name||f.homeId)+' — '+E(away?.name||f.awayId)+'</span>'+
    '<strong>'+ (f.result?E(f.result.score?.home)+' : '+E(f.result.score?.away):
      f.round<week?'NESSUN RISULTATO':'DA GIOCARE')+'</strong></div>';
  }).join('')+'</div>';
 }else{
  content='<div class="r11-league-preview"><div class="r11-league-masthead">ORONZO · CAMPIONATO '+E(state.seasonYear)+'</div>'+
   '<div><b>SETTIMANA '+E(week)+'</b><p>'+
    (current?(current.homeId===club.id?'IN CASA':'IN TRASFERTA')+' · '+E(opponent?.name||'avversario non disponibile'):
      ui.coachWeekStatus?.kind==='bye_week'?'TURNO DI RIPOSO · NESSUNA GARA DEL MISTER':
       ui.coachWeekStatus?.kind==='season_complete'?'STAGIONE CONCLUSA':
        'Nessuna partita della propria squadra in questo turno')+
   '</p><small>Campionato proprio: '+E(coachGames.length)+' gare · calendario fino alla giornata '+E(maxRound)+
   '</small></div></div>';
 }
 const action=ui.coachWeekStatus?.kind==='bye_week'&&ui.coachWeekStatus.canAdvance?
  '<button class="ui-btn gold-btn" data-action="advance">AVANZA SETTIMANA</button>':
  ui.coachWeekStatus?.kind==='match_pending'?
  '<button class="ui-btn gold-btn" data-action="formation">FORMAZIONE PREPARTITA</button>':'';
 return '<div class="r11-league-page"><section class="panel r11-league-panel">'+
  '<div class="panel-title">IL CAMPIONATO · '+E(club.divisionId)+'</div>'+tabs+
  '<div class="r11-column-scroll">'+content+'</div>'+
  '<div class="r11-bottom"><button class="ui-btn" data-action="hub">UFFICIO</button>'+action+
  '<button class="ui-btn" data-action="save">SALVA</button></div></section></div>';
}
