import { generateSquad } from './generator.js';
import { effectiveAbility } from './personality.js';
import { applyTrainingWeek, applyMatchLoad, advanceSeason } from './training.js';
import { recordSeasonSnapshot, createCareerRecord } from './career-stats.js';

const $ = id => document.getElementById(id);
const names = {passing:'Passaggio',shooting:'Tiro',control:'Controllo',tackling:'Contrasto',positioning:'Posizione',decisions:'Decisioni',goalkeeping:'Portiere',vision:'Visione',dribbling:'Dribbling',pace:'Velocità',stamina:'Resistenza',strength:'Forza',durability:'Integrità',acceleration:'Scatto',composure:'Freddezza',discipline:'Disciplina',teamwork:'Squadra',confidence:'Fiducia',morale:'Morale',luck:'Fortuna',character:'Carattere',ambition:'Ambizione',fatigue:'Fatica',fitness:'Forma',health:'Salute',injuryDays:'Giorni stop'};
const display = {technical:['shooting','passing','control','tackling','positioning','goalkeeping','vision','dribbling'],physical:['pace','acceleration','stamina','strength','durability'],mental:['composure','discipline','teamwork','confidence','morale','luck','character'],status:['fatigue','fitness','health']};
let players = [], selected = 0, week = 1, year = 1985, records = {};
function regenerate() {
  players = generateSquad({seed:$('seed').value || '1985',teamId:'campanile',size:22,teamLevel:46});
  selected=0;week=1;year=1985;records=Object.fromEntries(players.map(p=>[p.id,createCareerRecord(p)]));
  $('feedback').textContent='Nuova rosa generata: 22 calciatori, 11 titolari e 11 riserve. Seleziona una scheda.';
  draw();
}
function draw() {
  const p=players[selected];
  $('roster').replaceChildren(...players.map((q,i)=>{
    const b=document.createElement('button'); b.type='button'; b.className='person'+(i===selected?' active':'');
    const label=document.createElement('span');label.textContent=`${String(i+1).padStart(2,'0')}  ${q.name}${q.starter?' ★':''}`;
    const role=document.createElement('span');role.textContent=q.positions[0];b.append(label,role);
    b.onclick=()=>{selected=i;draw();};return b;
  }));
  $('teamInfo').textContent=`CAMPANILE · ${year}/${String(year+1).slice(-2)} · SETTIMANA ${week}`;
  $('name').textContent=p.name;
  $('archetype').textContent=p.personality.replaceAll('-',' ').toUpperCase();
  $('meta').textContent=`${p.age} ANNI · PIEDE ${p.foot} · ${p.starter?'TITOLARE':'RISERVA'} · POTENZIALE ${Math.round(p.development.potential)}`;
  $('role').textContent=p.positions[0];
  $('meters').replaceChildren(...Object.entries(display).map(([group,keys])=>{
    const section=document.createElement('div');
    const header=document.createElement('div');header.className='little-head';header.textContent={technical:'TECNICA',physical:'FISICO',mental:'MENTE',status:'CONDIZIONE'}[group];section.append(header);
    for(const key of keys) {
      const value=p[group][key],line=document.createElement('div');line.className='meter';
      const label=document.createElement('span');label.textContent=names[key];
      const track=document.createElement('div');track.className='bar '+(key==='fatigue'?'red':group==='mental'?'gold':'');
      const inner=document.createElement('div');inner.style.width=`${value}%`;track.append(inner);
      const number=document.createElement('span');number.className='metric-value';number.textContent=Math.round(value);
      line.append(label,track,number);section.append(line);
    }
    return section;
  }));
  const rating=effectiveAbility(p,{skill:$('skill').value,pressure:Number($('pressure').value),requiresInstruction:true,teamAction:true});
  $('ability').textContent=rating.effective.toFixed(1);
  $('probability').textContent=(rating.executionProbability*100).toFixed(1)+'%';
  $('fatigue').textContent=Math.round(p.status.fatigue);
  $('pressureLabel').textContent=$('pressure').value;
  $('history').textContent=`STORICO: ${Object.keys(records[p.id].seasons).length} stagioni archiviate · ${records[p.id].total.appearances} presenze · ${records[p.id].total.goals} gol (da eventi di partita).`;
}
$('generate').onclick=regenerate;
$('skill').onchange=draw;
$('pressure').oninput=draw;
$('train').onclick=()=>{
  const old=players[selected];const plan=$('plan').value;
  const outcome=applyTrainingWeek(players,plan,{seed:$('seed').value,week});players=outcome.players;week++;
  const p=players[selected];
  const changes=['control','passing','shooting','pace','stamina','positioning'].filter(k=>{
    const g=k in p.technical?'technical':'physical';return p[g][k]!==old[g][k];
  }).map(k=>`${names[k]} ${p[k in p.technical?'technical':'physical'][k].toFixed(1)}`);
  $('feedback').textContent=`Seduta ${plan.toUpperCase()} completata. ${p.name}: fatica ${Math.round(old.status.fatigue)}→${Math.round(p.status.fatigue)}, forma ${Math.round(old.status.fitness)}→${Math.round(p.status.fitness)}.\n${changes.join(' · ') || 'Nessun incremento rilevante in questa seduta.'}\nInfortuni in rosa: ${outcome.incidents.length}.`;
  draw();
};
$('match').onclick=()=>{
  const p=players[selected],old=p.status.fatigue;
  players=applyMatchLoad(players,{[p.id]:90},{intensity:60});
  $('feedback').textContent=`90′ simulati come carico fisico per ${p.name}: fatica ${Math.round(old)}→${Math.round(players[selected].status.fatigue)}. Nessun evento di gioco inventato.`;
  draw();
};
$('season').onclick=()=>{
  const season=`${year}-${String(year+1).slice(-2)}`;
  for(const p of players) records[p.id]=recordSeasonSnapshot(records[p.id],season,p);
  players=advanceSeason(players,{seed:$('seed').value,season});year++;week=1;
  $('feedback').textContent=`Stagione ${season} archiviata. I calciatori hanno un anno in più; crescita o declino dipendono dall'età. Gli ID e lo storico sono preservati.`;
  draw();
};
regenerate();

