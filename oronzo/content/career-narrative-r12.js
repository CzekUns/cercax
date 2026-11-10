/** R12 live provincial football serial. Every item is a fictional radio/TV
 * editorial selected from genuine career events and saved in the career.
 * There are no external/real broadcasters, people or historic 1979 assertions.
 * Financial and trust effects are owned by Coach09 applyClubEvent. */
import {applyClubEvent} from '../systems/coach-club/board.js';
const cast=[
 ['Rete Campanile 79','Olindo Tabarri'],['Tele Panchina 2','Rita Malfanti'],
 ['Canale del Campetto','Nereo Cuscini'],['Radio Ponte Vecchio','Lalla Ferretti'],
 ['Tele Serranda','Guglielmo Schiena'],['Rete Gradinata','Marisa Cartocci'],
 ['TV Domenica Sera','Lamberto Tacci'],['Radio Bilancio','Tilde Rocchi']
];
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
function hash(str){let h=2166136261;for(const c of String(str))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
const templates={
 appointment:[
  ['La cravatta del mister non ha ancora conosciuto il fango','La dirigenza ha promesso una presentazione sobria. In tribuna hanno noleggiato tre megafoni.'],
  ['Venti panchine, una sola stretta di mano','Il presidente chiede fiducia. Il custode domanda chi ha le chiavi dello spogliatoio.']],
 victory:[
  ['Tre punti, quattro discorsi','La piazza festeggia. Il presidente rivendica il merito del nuovo orario del pullman.'],
  ['La gradinata chiede un monumento al tabellone','Una vittoria accende il paese. Il ragioniere ricorda che il monumento non è in bilancio.']],
 draw:[
  ['Un punto in classifica, due opinioni alla radio','L’emittente locale ha dedicato mezz’ora a un traversone che nessuno ricorda.'],
  ['Pareggio diplomatico','Il presidente lo chiama equilibrio. I tifosi chiedono un tiro in porta in più.']],
 defeat:[
  ['La sconfitta spiegata col vento','Il presidente promette una riunione. Il meteo smentisce le sue dichiarazioni sul vento.'],
  ['Il processo del lunedì comincia di domenica','La radio ha già aperto le telefonate: quattro chiedono cambi, uno vuole cambiare la radio.']],
 debt:[
  ['La cassa fa rumore: è vuota','Il direttore amministrativo parla di prudenza. La trasferta ha appena richiesto un secondo preventivo.'],
  ['I conti hanno bisogno di un portiere','Nelle carte del club la parola risparmio è stata sottolineata tre volte, a matita.']],
 pressure:[
  ['Il presidente convoca il calendario','La società chiede una risposta. Il calendario, sentito telefonicamente, non ha voluto commentare.'],
  ['Fiducia a tempo determinato','La presidenza chiede una svolta. Un dirigente ha preparato il comunicato per entrambe le ipotesi.']],
 routine:[
  ['La tribuna pesa le parole','Il campionato prosegue. Il magazziniere ha numerato le borse, tranne la propria.'],
  ['Il paese aspetta domenica','Nell’ufficio stampa si discute del prossimo avversario. Al bar si discute del parcheggio.']],
 unemployment:[
  ['Panchina vuota, agenda piena','Il mister studia gli annunci. La radio provinciale ha già previsto tre candidature immaginarie.']
 ]
};
const choices={
 appointment:[
  {id:'calm',label:'Parla di lavoro e prudenza',effects:{boardTrust:2}},
  {id:'flair',label:'Prometti gioco spettacolare',effects:{morale:1,boardTrust:-1}}],
 victory:[
  {id:'team',label:'Attribuisci il merito alla squadra',effects:{morale:1,boardTrust:1}},
  {id:'rest',label:'Invita alla calma dopo la vittoria',effects:{boardTrust:2}}],
 draw:[
  {id:'defend',label:'Difendi il punto conquistato',effects:{morale:1,boardTrust:-1}},
  {id:'work',label:'Prometti più lavoro sui dettagli',effects:{boardTrust:1}}],
 defeat:[
  {id:'defend',label:'Proteggi i calciatori',effects:{morale:2,boardTrust:-1}},
  {id:'responsibility',label:'Prenditi la responsabilità',effects:{boardTrust:1, morale:-1}}],
 debt:[
  {id:'save',label:'Rinuncia a una spesa straordinaria',effects:{boardTrust:2}},
  {id:'ask',label:'Chiedi impegni scritti',effects:{boardTrust:-1, morale:1}}],
 pressure:[
  {id:'quiet',label:'Abbassa i toni',effects:{boardTrust:2}},
  {id:'proud',label:'Difendi lo spogliatoio',effects:{morale:2,boardTrust:-1}}],
 routine:[
  {id:'school',label:'Dedica la settimana ai giovani',effects:{morale:1}},
  {id:'club',label:'Incontra i dirigenti',effects:{boardTrust:1}}],
 unemployment:[]
};
function note(state){
 if(!state.flow)throw new Error('R12_NARRATIVE_FLOW_REQUIRED');
 if(!state.flow.r12Narrative)state.flow.r12Narrative={version:1,issues:[]};
 return state.flow.r12Narrative;
}
export function recordCareerNarrativeR12(state,{context='routine',realResult=null,presidentCatalog=null}={}){
 const ledger=note(state),club=state.clubs.find(c=>c.id===state.coach.clubId);
 const abs=state.absoluteWeek;
 if(ledger.issues.some(x=>x.absoluteWeek===abs&&x.clubId===(club?.id??null)))return null;
 let category=context==='appointment'?'appointment':!club?'unemployment':'routine';
 if(category==='routine'){
  if((club.finance?.cash??club.budget)<20000)category='debt';
  else if(club.boardTrust<=30)category='pressure';
  else if(['victory','draw','defeat'].includes(realResult))category=realResult;
 }
 const key=state.seed+'|'+abs+'|'+(club?.id??'free')+'|'+category;
 const idx=hash(key)%templates[category].length;
 const [title,body]=templates[category][idx];
 const channel=cast[hash(key+':cast')%cast.length];
 const p=Array.isArray(presidentCatalog)?presidentCatalog:
  (presidentCatalog?.presidents??presidentCatalog?.profiles??[]);
 const president=p.find(x=>x.id===club?.presidentId);
 const id='r12-narrative:'+abs+':'+(club?.id??'unemployed');
 const item={id,seasonYear:state.seasonYear,absoluteWeek:abs,clubId:club?.id??null,
  presidentId:president?.id??club?.presidentId??null,category,channel:channel[0],
  reporter:channel[1],title,body:president?body+' '+president.name+' ha chiesto di essere citato correttamente.':body,
  source:'fictional-provincial-football-editorial-r12',options:choices[category].map(x=>({...x, effects:{...x.effects}})),
  selected:null};
 ledger.issues.push(item);
 if(ledger.issues.length>80)ledger.issues.splice(0,ledger.issues.length-80);
 return item;
}
/** Delegates real effects to the already idempotent Coach09 club-event ledger. */
export function decideCareerNarrativeR12(state,issueId,optionId){
 if(state.coach?.gameOver||state.coach?.morale===0)return {accepted:false,reason:'game_over'};
 if(state.flow?.stage!=='hub')return {accepted:false,reason:'hub_required'};
 const ledger=note(state),issue=ledger.issues.find(x=>x.id===issueId);
 if(!issue||issue.selected)return {accepted:false,reason:issue?.selected?'already_decided':'unknown_issue'};
 if(issue.absoluteWeek!==state.absoluteWeek||issue.clubId!==state.coach.clubId)
  return {accepted:false,reason:'issue_expired_or_other_club'};
 const option=issue.options.find(x=>x.id===optionId);
 if(!option)return {accepted:false,reason:'unknown_choice'};
 const index=state.clubs.findIndex(x=>x.id===issue.clubId);
 const club=state.clubs[index];
 if(!club)return {accepted:false,reason:'club_missing'};
 const out=applyClubEvent(club,{id:issue.id,clubId:club.id,
  options:issue.options.map(x=>({id:x.id,effects:{...x.effects}}))},optionId,
  {week:state.week,absoluteWeek:state.absoluteWeek,seasonYear:state.seasonYear});
 if(!out.accepted)return out;
 state.clubs[index]=out.club;
 issue.selected={id:optionId,label:option.label,absoluteWeek:state.absoluteWeek};
 return {accepted:true,issueId,optionId,effects:out.effects};
}
