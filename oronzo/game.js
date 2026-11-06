(()=>{"use strict";
const $=id=>document.getElementById(id), $all=q=>[...document.querySelectorAll(q)];
const TEAMS=["Campanile","Santa Croce","Borgonuovo","Atletico Murgia","Torremare","Montelupo","Real Oliveto","San Rocco"];
const FIRST=["Nino","Gennaro","Bruno","Giuliano","Salvo","Oreste","Carmine","Dino","Ettore","Pietro","Michele","Lello","Sandro","Arturo","Mimmo","Rocco"];
const LAST=["Caputo","Marchese","De Rosa","Pisano","Bellini","Fusco","Barone","Basile","Lombardi","Conte","Greco","Gargiulo","Monti","Coppola","Russo","Marini"];
const roles=["POR","DIF","DIF","DIF","DIF","CEN","CEN","CEN","CEN","ATT","ATT","POR","DIF","CEN","ATT","DIF"];
const formations={"4-4-2":[[50,89],[17,73],[39,75],[61,75],[83,73],[18,52],[39,55],[61,55],[82,52],[38,30],[62,30]],"4-3-3":[[50,89],[17,73],[39,75],[61,75],[83,73],[25,52],[50,56],[75,52],[17,30],[50,26],[83,30]],"3-5-2":[[50,89],[23,75],[50,77],[77,75],[10,55],[30,53],[50,55],[70,53],[90,55],[37,30],[63,30]]};
function r(n){return Math.floor(Math.random()*n)}function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function fresh(){return{week:1,formation:"4-4-2",press:50,attack:50,trainingDone:false,coaching:"balance",players:roles.map((role,i)=>({id:i+1,name:FIRST[i]+" "+LAST[(i*7+3)%LAST.length],role,starter:i<11,tech:48+r(31),speed:44+r(36),stamina:46+r(33),luck:20+r(71),character:20+r(75),confidence:45+r(41),health:55+r(43),morale:54+r(34),fatigue:0})),table:TEAMS.map((name,i)=>({name,pt:0,pg:0,w:0,d:0,l:0,gf:0,ga:0})),log:["La società cerca il miracolo. In panchina arriva un mister con idee confuse ma una gran voglia di lavorare."]}}
let S;try{S=JSON.parse(localStorage.getItem("oronzo_v01"))||fresh();if(!Array.isArray(S.players)||!Array.isArray(S.table))S=fresh()}catch{S=fresh()}let match=null,pending=null,loop=null,lastTick=0,lastCut=0;
function save(){try{localStorage.setItem("oronzo_v01",JSON.stringify(S))}catch{}}
function opponent(){return TEAMS[1+((S.week-1)%(TEAMS.length-1))]}
function show(name){$all(".view").forEach(el=>el.classList.toggle("active",el.id===name));$all(".bottom-nav [data-go]").forEach(el=>el.classList.toggle("selected",el.dataset.go===name));render();if(name==="match")draw()}
$all("[data-go]").forEach(el=>el.addEventListener("click",()=>show(el.dataset.go)));
function render(){ $("weekLabel").textContent="GIORNATA "+S.week;$("overview").innerHTML='<div><b>'+S.table[0].pt+'</b><small>PUNTI</small></div><div><b>'+S.table[0].pg+'</b><small>GARE</small></div><div><b>'+Math.round(S.players.filter(p=>p.starter).reduce((v,p)=>v+p.morale,0)/11)+'</b><small>MORALE</small></div>';$("headline").textContent=S.log[0];const sorted=[...S.table].sort((a,b)=>b.pt-a.pt||(b.gf-b.ga)-(a.gf-a.ga));$("standings").innerHTML='<table><thead><tr><th>CLUB</th><th>PG</th><th>PT</th><th>DR</th></tr></thead><tbody>'+sorted.map((t,i)=>'<tr class="'+(t.name===TEAMS[0]?"ours":"")+'"><td>'+(i+1)+'. '+t.name+'</td><td>'+t.pg+'</td><td>'+t.pt+'</td><td>'+(t.gf-t.ga)+'</td></tr>').join("")+'</tbody></table>';renderSquad();renderTactics();$("homeTeam").textContent=TEAMS[0].toUpperCase();$("awayTeam").textContent=opponent().toUpperCase();$("trainingReport").textContent=S.trainingDone?"Seduta svolta. Ora puoi preparare la partita.":"Scegli un lavoro settimanale prima della prossima partita.";$("score").textContent=match?match.home+" : "+match.away:"0 : 0";$("clock").textContent=match?timeStr(match.minute):"00:00";$("play").textContent=match?.finished?"▶ PROSSIMA GARA":match?.running?"■ IN CORSO":"▶ CALCIO D'INIZIO";$("speed").textContent=(match?.speed||1)+"×";$("pause").textContent=match?.paused?"▶ RIPRENDI":"Ⅱ PAUSA";$("sub").disabled=!!match?.finished;$("shots").textContent=match?match.shotsHome+" - "+match.shotsAway:"0 - 0";$("possession").textContent=match?match.possession+"%":"50%";$("morale").textContent=Math.round(S.players.filter(p=>p.starter).reduce((a,p)=>a+p.morale,0)/11);$all("[data-coach]").forEach(el=>el.classList.toggle("active",el.dataset.coach===S.coaching))}
function renderSquad(){$("squadCount").textContent="TITOLARI "+S.players.filter(p=>p.starter).length+"/11";$("squadTable").innerHTML='<table class="roster"><thead><tr><th>#</th><th>CALCIATORE</th><th>RUOLO</th><th>TEC</th><th>VEL</th><th>RES</th><th>MOR</th></tr></thead><tbody>'+[...S.players].sort((a,b)=>Number(b.starter)-Number(a.starter)||a.id-b.id).map(p=>'<tr data-player="'+p.id+'" class="'+(p.starter?"starting ":"")+(pending===p.id?"chosen":"")+'"><td>'+(p.starter?"●":"○")+'</td><td>'+p.name+'<br><span class="tag">'+(pending===p.id?"SELEZIONATO":p.starter?"TITOLARE":"RISERVA")+'</span></td><td>'+p.role+'</td><td>'+p.tech+'</td><td>'+p.speed+'</td><td>'+p.stamina+'</td><td>'+p.morale+'</td></tr>').join("")+'</tbody></table>';$all("[data-player]").forEach(tr=>tr.addEventListener("click",()=>swapPlayer(Number(tr.dataset.player))))}
function swapPlayer(id){const p=S.players.find(x=>x.id===id);if(!p)return;if(p.starter){pending=p.id;$("commentary").textContent=p.name+" selezionato. Tocca una riserva per effettuare il cambio."}else if(pending!==null){const out=S.players.find(x=>x.id===pending);if(out){if(out.role==="POR"&&p.role!=="POR"){$("commentary").textContent="Il portiere va sostituito con un altro portiere.";return}out.starter=false;p.starter=true;S.log.unshift("Cambio: "+p.name+" entra al posto di "+out.name+".");S.log=S.log.slice(0,10);if(match?.running){if(match.subs>=5){out.starter=true;p.starter=false;$("commentary").textContent="Hai già usato i cambi disponibili in questa demo.";pending=null;render();return}match.subs++;match.paused=true;$("commentary").textContent="Sostituzione effettuata: "+p.name+" entra in campo."}}pending=null;save()}else{$("commentary").textContent="Seleziona prima un titolare da sostituire."}render()}
function renderTactics(){ $("formations").innerHTML=Object.keys(formations).map(k=>'<button data-formation="'+k+'" class="'+(S.formation===k?"active":"")+'">'+k+'</button>').join("");$all("[data-formation]").forEach(el=>el.addEventListener("click",()=>{S.formation=el.dataset.formation;save();renderTactics()}));$("press").value=S.press;$("att").value=S.attack;$("pressLabel").textContent=S.press;$("attLabel").textContent=S.attack;const starters=S.players.filter(p=>p.starter);$("chalkPlayers").innerHTML=formations[S.formation].map(([x,y],i)=>'<div class="chalk-player" style="left:'+(100-y)+'%;top:'+x+'%">'+(starters[i]?.id||i+1)+'</div>').join("")}
$("press").addEventListener("input",e=>{S.press=Number(e.target.value);$("pressLabel").textContent=S.press;save()});$("att").addEventListener("input",e=>{S.attack=Number(e.target.value);$("attLabel").textContent=S.attack;save()});
$all("[data-training]").forEach(btn=>btn.addEventListener("click",()=>{if(S.trainingDone){$("trainingReport").textContent="Seduta già svolta: attendi la prossima giornata.";return}const k=btn.dataset.training;for(const p of S.players){if(k==="fitness"){p.stamina=clamp(p.stamina+2,1,99);p.fatigue=clamp(p.fatigue+8,0,100)}if(k==="tech"){p.tech=clamp(p.tech+1,1,99);p.fatigue=clamp(p.fatigue+6,0,100)}if(k==="tactics"){p.confidence=clamp(p.confidence+2,1,99);p.fatigue=clamp(p.fatigue+5,0,100)}if(k==="rest"){p.fatigue=clamp(p.fatigue-22,0,100);p.morale=clamp(p.morale+2,1,99)}}S.trainingDone=true;save();render();$("trainingReport").textContent="Seduta completata: "+btn.querySelector("b").textContent.toLowerCase()+". Le condizioni sono state aggiornate."}));
$all("[data-coach]").forEach(b=>b.addEventListener("click",()=>{S.coaching=b.dataset.coach;if(b.dataset.coach==="attack")S.attack=80;if(b.dataset.coach==="defend")S.attack=20;if(b.dataset.coach==="balance")S.attack=50;save();render();$("commentary").textContent="Dalla panchina arriva l'ordine: "+b.textContent.trim()+"."}));
const pitch=$("pitch"),ctx=pitch.getContext("2d",{alpha:false});ctx.imageSmoothingEnabled=false;let focus={x:160,y:220,owner:0};function draw(){
 if(!ctx)return;
 const w=440,h=280, t=match?.minute||0;
 ctx.imageSmoothingEnabled=false;
 for(let i=0;i<11;i++){ctx.fillStyle=i%2?"#217643":"#27854b";ctx.fillRect(i*40,0,40,h);}
 ctx.strokeStyle="#e5ecd9";ctx.lineWidth=2;
 ctx.strokeRect(13,13,414,254);
 ctx.beginPath();ctx.moveTo(220,13);ctx.lineTo(220,267);ctx.arc(220,140,36,0,Math.PI*2);ctx.stroke();
 ctx.strokeRect(13,72,61,136);ctx.strokeRect(366,72,61,136);
 ctx.strokeRect(13,105,23,70);ctx.strokeRect(404,105,23,70);
 ctx.strokeRect(5,116,8,48);ctx.strokeRect(427,116,8,48);
 ctx.fillStyle="#f5ebd2";ctx.fillRect(220,139,2,2);
 ctx.fillRect(75,139,3,3);ctx.fillRect(363,139,3,3);
 const ps=formations[S.formation], starters=S.players.filter(p=>p.starter), players=[];
 for(let i=0;i<11;i++){
  const p=ps[i];const x=clamp(440-(p[1]/100)*440+Math.sin(t*.25+i*1.5)*9,26,414);
  const y=clamp((p[0]/100)*280+Math.cos(t*.3+i)*7,22,258);
  players.push({x,y,team:0,id:starters[i]?.id||i+1});
 }
 for(let i=0;i<11;i++){
  const p=ps[i];const x=clamp((p[1]/100)*440+Math.sin(t*.28+i*2.1)*9,26,414);
  const y=clamp((1-p[0]/100)*280+Math.cos(t*.22+i)*8,22,258);
  players.push({x,y,team:1,id:i+1});
 }
 const pixel=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 const drawPlayer=(p,i)=>{
  const x=Math.round(p.x),y=Math.round(p.y),enemy=p.team;
  const shirt=enemy?"#b23d42":"#e3d9ba",trim=enemy?"#e6d6be":"#254cbd";
  const shorts=enemy?"#e5ded0":"#2247b8";
  pixel(x-5,y+8,12,3,"#0c3c29");
  pixel(x-2,y-12,6,2,"#2c211e");
  pixel(x-4,y-10,10,6,"#b78054");
  pixel(x-3,y-9,2,1,"#e5b18a");
  pixel(x-6,y-4,14,3,trim);
  pixel(x-5,y-4,12,9,shirt);
  pixel(x-3,y-3,2,8,trim);
  pixel(x+2,y-3,2,8,trim);
  pixel(x-9,y-2,3,7,"#a96e4d");
  pixel(x+8,y-2,3,7,"#a96e4d");
  pixel(x-5,y+4,12,5,shorts);
  pixel(x-4,y+9,3,6,"#dfddd3");
  pixel(x+3,y+9,3,6,"#dfddd3");
  pixel(x-5,y+15,5,2,"#272b29");
  pixel(x+3,y+15,5,2,"#272b29");
 };
 players.forEach(drawPlayer);
 const owner=players[Math.floor((t*1.13)%players.length)];
 const bx=Math.round(owner?.x||220)+11,by=Math.round(owner?.y||140)+10;
 pixel(bx-4,by-3,8,8,"#0e2921");pixel(bx-3,by-3,6,6,"#fff2dc");
 pixel(bx-1,by-1,3,3,"#19212c");pixel(bx-3,by+2,2,2,"#19212c");
}
function timeStr(min){let m=Math.min(90,Math.floor(min));return String(m).padStart(2,"0")+":00"}
function strength(){const p=S.players.filter(x=>x.starter);const avg=p.reduce((v,x)=>v+x.tech*.35+x.speed*.15+x.stamina*.15+x.confidence*.15+x.morale*.15+x.luck*.05-x.fatigue*.1,0)/p.length;return avg+S.attack*.1+S.press*.04}
function msg(s){$("commentary").textContent=s;S.log.unshift(s);S.log=S.log.slice(0,12)}
function scene(title,detail){$("cutsceneTitle").textContent=title;$("cutsceneDetail").textContent=detail;$("cutscene").hidden=false;lastCut=performance.now()+2500}
function event(){if(!match||match.finished)return;const ourP=clamp(.5+(strength()-64)/300,.32,.68);const ours=Math.random()<ourP;const shooter=ours?S.players.filter(p=>p.starter&&p.role==="ATT").sort((a,b)=>b.tech-a.tech)[r(2)]:null;const name=ours?(shooter?.name||"Il centravanti"):"Un attaccante avversario";const chance=clamp((ours?0.16+S.attack/500:0.19+S.press/1300)+(ours?S.players.filter(p=>p.starter).reduce((v,p)=>v+p.luck,0)/11000:0)-.045,.07,.35);
if(Math.random()<.66){if(ours)match.shotsHome++;else match.shotsAway++;if(Math.random()<chance){if(ours)match.home++;else match.away++;msg("RETE! "+name+" va a segno al "+Math.floor(match.minute)+"'.");scene("GOOOL!",name+" · "+Math.floor(match.minute)+"'");if(ours)S.players.forEach(p=>{p.morale=clamp(p.morale+1,0,100)});else S.players.forEach(p=>{p.morale=clamp(p.morale-1,0,100)})}else msg((ours?"Occasione Campanile! ":"Pericolo avversario! ")+name+" tenta il tiro, ma niente gol.")}else{const scripts=ours?["Buona manovra, ma l'ultimo passaggio è impreciso.","Il mister chiede di allargare il gioco.","Palla recuperata a centrocampo."]:["Gli ospiti alzano il ritmo.","La difesa prova a ripartire.","Il portiere salva in uscita."];msg(scripts[r(scripts.length)])}
match.possession=clamp(Math.round(50+(strength()-64)/4+(Math.random()-.5)*12),33,67)}
function finish(){match.running=false;match.finished=true;match.minute=90;if(loop){clearInterval(loop);loop=null}scene(match.home>match.away?"VITTORIA!":match.home===match.away?"PAREGGIO":"SCONFITTA",TEAMS[0]+" "+match.home+" - "+match.away+" "+opponent());msg("Triplice fischio! "+TEAMS[0]+" "+match.home+" - "+match.away+" "+opponent()+". Tocca PROSSIMA GARA per proseguire.");const a=S.table[0],b=S.table.find(t=>t.name===opponent());applyResult(a,b,match.home,match.away);const others=S.table.filter(t=>t!==a&&t!==b);for(let i=0;i<others.length-1;i+=2){const g1=r(4),g2=r(4);applyResult(others[i],others[i+1],g1,g2)}S.players.forEach(p=>{p.fatigue=clamp(p.fatigue+(p.starter?12:0)-7,0,100);p.confidence=clamp(p.confidence+(match.home>match.away?2:match.home<match.away?-2:0),10,99)});save();render()}
function applyResult(a,b,x,y){for(const t of [a,b])t.pg++;a.gf+=x;a.ga+=y;b.gf+=y;b.ga+=x;if(x>y){a.w++;a.pt+=3;b.l++}else if(y>x){b.w++;b.pt+=3;a.l++}else{a.d++;b.d++;a.pt++;b.pt++}}
function tick(now){if(!match||!match.running||match.finished)return;const elapsed=(now-lastTick)/1000;lastTick=now;if(!match.paused){match.minute+=Math.max(0,Math.min(elapsed,.5))*match.speed;while(match.minute>=match.nextEvent&&match.minute<90){event();match.nextEvent+=3+Math.random()*4}if(match.minute>=90){finish();return}if(Math.floor(match.minute)%15===0){S.players.forEach(p=>{if(p.starter)p.fatigue=clamp(p.fatigue+.003*match.speed,0,100)})}}if(lastCut&&now>lastCut){$("cutscene").hidden=true;lastCut=0}$("score").textContent=match.home+" : "+match.away;$("clock").textContent=timeStr(match.minute);$("shots").textContent=match.shotsHome+" - "+match.shotsAway;$("possession").textContent=match.possession+"%";draw()}
function start(){if(match?.finished){S.week++;S.trainingDone=false;S.players.forEach(p=>{p.fatigue=clamp(p.fatigue-12,0,100);p.health=clamp(p.health+1,0,100)});match=null;pending=null;save();render();msg("Preparazione della giornata "+S.week+". Avversari: "+opponent()+".");draw();return}if(match?.running)return;match={minute:0,home:0,away:0,shotsHome:0,shotsAway:0,possession:50,nextEvent:3+Math.random()*4,running:true,finished:false,paused:false,speed:1,subs:0};lastTick=performance.now();loop=setInterval(()=>tick(performance.now()),50);msg("Fischio d'inizio! Campanile contro "+opponent()+".");render()}
$("play").addEventListener("click",start);
$("pause").addEventListener("click",()=>{if(!match?.running)return;match.paused=!match.paused;lastTick=performance.now();$("pause").textContent=match.paused?"▶ RIPRENDI":"Ⅱ PAUSA";$("commentary").textContent=match.paused?"Il mister ferma la simulazione per studiare la partita.":"Il gioco riprende."});
$("speed").addEventListener("click",()=>{if(!match?.running)return;const speeds=[1,2,4,8];match.speed=speeds[(speeds.indexOf(match.speed)+1)%speeds.length];$("speed").textContent=match.speed+"×"});
$("sub").addEventListener("click",()=>{if(match?.running)match.paused=true;pending=null;show("squad");$("commentary").textContent="Scegli un titolare e poi una riserva per effettuare il cambio."});
$("reset").addEventListener("click",()=>{if(!confirm("Vuoi cancellare la stagione salvata e ricominciare?"))return;if(loop)clearInterval(loop);loop=null;match=null;S=fresh();pending=null;save();show("home")});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&match?.running){match.paused=true;$("pause").textContent="▶ RIPRENDI"}});
render();draw();
})();