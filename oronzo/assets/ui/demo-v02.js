/* ORONZO UI kit v0.2 — standalone visual demo, NOT career or match runtime.
 * No external dependencies. Everything generated into #ui-screen as DOM.
 * API exposed as window.OronzoUIKitV02.createApp(root, options).
 * Data below is illustrative and intentionally not historical/source-certified.
 */
(function(global){'use strict';
const COACHES=[
 {id:'o01',name:'Nino Bellavista',city:'Vico Alto',region:'Campania',macro:'Sud',stats:[56,78,47,72]},
 {id:'o02',name:'Arturo Foschetti',city:'Pieve Nuova',region:'Toscana',macro:'Centro',stats:[43,63,79,82]},
 {id:'o03',name:'Gino Mastrangelo',city:'Borgo Levante',region:'Puglia',macro:'Sud',stats:[71,81,58,39]},
 {id:'o04',name:'Cesare Ghirlandini',city:'Castel Vento',region:'Piemonte',macro:'Nord',stats:[61,64,91,34]},
 {id:'o05',name:'Beppe Quattrocchi',city:'Valle Scura',region:'Lombardia',macro:'Nord',stats:[68,43,83,54]},
 {id:'o06',name:'Goffredo Balsamo',city:'Poggio Fiorito',region:'Lazio',macro:'Centro',stats:[59,76,74,62]},
 {id:'o07',name:'Mario Cannizzaro',city:'Santa Vigna',region:'Sicilia',macro:'Sud',stats:[48,82,67,87]},
 {id:'o08',name:'Remo Filomeni',city:'Rio Torbido',region:'Umbria',macro:'Centro',stats:[73,59,52,61]}
];
const CLUBS=[
 ['Atletico Vallone','Campania','Sud',155],['A.C. Poggiarello','Toscana','Centro',130],['Unione Pietralba','Piemonte','Nord',212],['Borgo dei Gelsi','Lazio','Centro',185],
 ['Sportiva Fontana','Campania','Sud',173],['Città del Ponte','Lombardia','Nord',205],['Virtus Montepiano','Puglia','Sud',162],['A.C. Vallescura','Sicilia','Sud',124],
 ['Rondine d’Argento','Umbria','Centro',169],['Gialloblu delle Aie','Veneto','Nord',177],['A.C. San Cerchio','Campania','Sud',145],['Club Castelluccio','Marche','Centro',184],
 ['A.C. Vallagrande','Liguria','Nord',198],['Stella del Colle','Abruzzo','Sud',151],['Olimpia del Porto','Sardegna','Sud',164],['A.C. Campofieno','Emilia-Romagna','Nord',207],
 ['U.S. Torricella','Campania','Sud',190],['Borgo delle Rose','Calabria','Sud',152],['Nuova Altamura','Puglia','Sud',168],['A.S. Borgo Lungo','Trentino-Alto Adige','Nord',191]
];
const PRESIDENTS=[
 {name:'Comm. Vittorio D’Oro',traits:[23,70,88],line:'Il progetto è grande, mister. La cassa invece è piccola.'},
 {name:'Avv. Olimpio Barone',traits:[63,74,39],line:'Lei vinca il campionato. Io penserò alle fotografie.'},
 {name:'Rag. Tito Cedolini',traits:[48,41,84],line:'Una cosa sola: mi conservi tutte le ricevute.'},
 {name:'Cav. Erminio Chiodi',traits:[71,90,38],line:'Da oggi questa panchina è sua. Mi faccia divertire.'}
];
const QUESTIONS=[
 {q:'Mister, quale sarà il suo primo messaggio ai tifosi?',answers:['Serietà, lavoro e pazienza.','Prometto risultati immediati.','Preferisco parlare sul campo.']},
 {q:'La società le ha chiesto un obiettivo?',answers:['Pensiamo alla prossima gara.','Guardiamo la parte alta.','La priorità è crescere insieme.']},
 {q:'Quanta fiducia ha nello spogliatoio?',answers:['Il gruppo ha talento.','Tutti devono guadagnarsi il posto.','Conoscerò i ragazzi in allenamento.']},
 {q:'Qual è il suo atteggiamento verso il presidente?',answers:['Dialogo quotidiano.','Concedetemi autonomia.','Mi interessa solo allenare.']},
 {q:'Come affronterete la prima giornata?',answers:['Equilibrio e concentrazione.','Attaccheremo senza timore.','Le scelte arriveranno sul campo.']}
];
const HUB={
 campionato:{title:'CAMPIONATO',items:['Prossima giornata','Classifica','Calendario'],desc:'Calendario e incontri del girone provinciale. I risultati reali arriveranno dal motore.'},
 rosa:{title:'ROSA',items:['Squadra','Allenamento','Contratti'],desc:'Attributi individuali, fiducia e condizione: la vista userà i dati dell’agente 08.'},
 tifoseria:{title:'TIFOSERIA',items:['Stadio / biglietti','Cosa dicono i tifosi','Cosa dicono i giornali'],desc:'Umore, prezzi e rassegna stampa: valori collegati ai sistemi di club e narrativa.'},
 presidente:{title:'UFFICIO PRESIDENTE',items:['Rapporto col presidente','Richieste / mercato','Bilancio società'],desc:'Spesa, papponeria e decisioni persistenti: dati di proprietà dell’agente 09.'}
};
const POS=[[7,50],[21,20],[22,43],[22,63],[21,82],[43,16],[43,38],[43,62],[43,84],[64,32],[66,70]];
const OPP=[[94,50],[79,20],[78,42],[78,60],[79,81],[59,18],[59,40],[59,62],[59,85],[38,32],[38,73]];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,act,val='',cls='')=>`<button type="button" class="ui-btn ${cls}" data-action="${esc(act)}" data-value="${esc(val)}">${esc(text)}</button>`;
const heading=(title,side)=>`<div class="screen-heading"><h1>${esc(title)}</h1><small>${esc(side||'ORONZO • ITALIA 1979')}</small></div>`;
const portrait=(type,i,cls='')=>{const cols=type==='coach'?4:type==='president'?2:3;const x=-(i%cols)*104,y=-Math.floor(i/cols)*128;return `<span aria-hidden="true" class="portrait ${type==='coach'?'':type==='president'?'president':'journalist'} ${cls}" style="--px:${x}px;--py:${y}px"></span>`;};
const stat=(label,v)=>`<div class="stat-line"><label>${esc(label)}</label><div class="meter"><i style="--meter:${Math.max(0,Math.min(100,Number(v)||0))}%"></i></div><strong>${esc(v)}</strong></div>`;
const panel=(title,body,extra='')=>`<section class="panel ${extra}"><div class="panel-title">${esc(title)}</div>${body}</section>`;
function createApp(root,opts={}){
 let screen='entry',selectedCoach=0,selectedOffer=0,selectedHub='campionato',question=0,fan=50,camera='full',president=0,toastTimer=null;
 let data={coaches:COACHES,clubs:CLUBS,presidents:PRESIDENTS,questions:QUESTIONS,...(opts.data||{})};
 const el=root.querySelector('#ui-screen');if(!el)throw new Error('Missing #ui-screen');
 const nav=root.querySelector('.quick-nav');const toast=root.querySelector('#ui-toast');
 const coach=()=>data.coaches[selectedCoach]||data.coaches[0];
 const offers=()=>data.clubs.map((c,i)=>({id:`offer-${i+1}`,name:c[0],region:c[1],macro:c[2],fee:c[3]}));
 function preview(o){let c=coach(),delta=c.region===o.region?0:c.macro===o.macro?-1:-3;
   // UI preview only. Final economics/affinity multiplier is owned by career & coach-club systems.
   return {base:delta,delta,kind:c.region===o.region?'STESSA REGIONE':c.macro===o.macro?'CAMBIO REGIONE':'CAMBIO MACROREGIONE'};}
 function changeScreen(next){if(toastTimer){clearTimeout(toastTimer);toastTimer=null;}if(toast)toast.hidden=true;screen=next;render();}
 function notify(message){toast.textContent=message;toast.hidden=false;if(toastTimer)clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.hidden=true;},2400);}
 function renderEntry(){return heading('IL FISCHIO D’INIZIO','ORONZO • CARRIERA 1979')+`<div class="screen-body">${panel('L’UFFICIO TI ASPETTA',`<div class="news"><strong>STAGIONE 1979</strong><br>Una panchina di provincia, una cartellina piena di sogni e un presidente che ha già cambiato tre allenatori.</div><div class="v-stack" style="margin-top:8px">${button('▶ NUOVA PARTITA','goto','avatar','gold-btn')}${button('▣ CARICA PARTITA','sample-load')}</div><p class="hint-line">Schermata UI dimostrativa. Il salvataggio sarà fornito dal game-flow dell’agente 07.</p>`, 'grow')}<div class="panel main-art" style="width:47%" role="img" aria-label="Ufficio sportivo pixel art con trofeo e scrivania"></div></div>`;}
 function renderAvatar(){const c=coach();return heading('SCEGLI IL TUO ALLENATORE','8 CARICATURE ORIGINALI')+`<div class="screen-body"><section class="panel grow" style="display:flex;flex-direction:column">`+`<div class="avatar-grid" role="group" aria-label="Otto avatar allenatore">${data.coaches.map((a,i)=>`<button class="avatar-tile" type="button" data-action="coach" data-value="${i}" aria-pressed="${i===selectedCoach}" aria-label="${esc(a.name)}">${portrait('coach',i)}</button>`).join('')}</div><p class="small-note">Seleziona uno degli otto ritratti. Immagini senza nomi o valori incorporati.</p></section><section class="panel" style="width:43%;display:flex;flex-direction:column">`+`<div class="h-stack avatar-profile">${portrait('coach',selectedCoach,'avatar-show')}<div class="grow avatar-profile-data"><h2 class="gold" style="font-size:17px">${esc(c.name)}</h2><div class="bio">${esc(c.city)} · ${esc(c.region)}</div>${[['FORTUNA',c.stats[0]],['LEADERSHIP',c.stats[1]],['AUTOSTIMA',c.stats[2]],['PAZIENZA',c.stats[3]]].map(s=>stat(...s)).join('')}</div></div><div class="h-stack" style="margin-top:auto">${button('INDIETRO','goto','entry')}${button('SCOPRI 20 OFFERTE','goto','offers','gold-btn grow')}</div></section></div>`;}
 function renderOffers(){const all=offers(),o=all[selectedOffer],pr=preview(o);return heading('MERCATO DELLE PANCHINE','20 PROPOSTE · ANTEPRIMA MORALE')+`<div class="screen-body"><section class="panel list-column">`+`<div class="panel-title">OFFERTE DISPONIBILI <span class="gold">20/20</span></div><div class="scroll grow" role="listbox" aria-label="20 offerte di ingaggio">${all.map((a,i)=>`<button type="button" class="offer-item" role="option" aria-selected="${i===selectedOffer}" data-action="offer" data-value="${i}"><span><b>${String(i+1).padStart(2,'0')} · ${esc(a.name)}</b><br><small>${esc(a.region)}</small></span><span class="badge-cost">${preview(a).delta} ♥</span></button>`).join('')}</div></section><section class="panel detail-column">`+`<div class="panel-title">SCHEDA INGAGGIO</div><div class="h-stack"><div class="club-crest ${selectedOffer%3===1?'crest-red':selectedOffer%3===2?'crest-green':''}" aria-hidden="true"></div><div><h2 class="gold" style="font-size:18px">${esc(o.name)}</h2><p class="subtext">${esc(o.region)} • ${esc(o.macro)}</p></div></div><div class="kpi-strip"><div class="kpi"><small>INGAGGIO*</small><b>${o.fee}</b><small>unità demo</small></div><div class="kpi"><small>MORALE</small><b>${pr.delta===0?'0':pr.delta}</b><small>punti base</small></div></div><p class="small-note"><b class="gold">${esc(pr.kind)}</b> · Anteprima UI senza ingaggio persistito. Calcolo finale: agenti 07/09.</p><div class="h-stack" style="margin-top:auto">${button('AVATAR','goto','avatar')}${button('ACCETTA OFFERTA','accept-offer','','gold-btn grow')}</div></section></div>`;}
 function renderPresident(){const p=data.presidents[president],o=offers()[selectedOffer];return heading('IL PRESIDENTE TI ASPETTA','PRESENTAZIONE • DEMO')+`<div class="screen-body president-layout"><div class="panel president-art">${portrait('president',president)}</div><section class="panel grow" style="display:flex;flex-direction:column;gap:5px"><div class="panel-title">${esc(p.name)}</div><div class="speech">“${esc(p.line)}”</div><p class="bio">${esc(o.name)} · ESEMPI DI CARATTERE SOCIETARIO</p>${stat('SPESA',p.traits[0])}${stat('ATTACCAMENTO',p.traits[1])}${stat('PAPPONERIA',p.traits[2])}<p class="small-note">Valori dimostrativi. Presidente, identità e effetti reali spettano al sistema 09.</p><div class="h-stack" style="margin-top:auto">${button('CAMBIA RITRATTO','change-president')}${button('CONFERENZA INIZIALE','goto','press','gold-btn grow')}</div></section></div>`;}
 function renderPress(){let q=data.questions[question];return heading('CONFERENZA STAMPA','DOMANDA '+(question+1)+' / 5')+`<div class="press-layout"><div class="panel media-visual">${portrait('journalist',question%6)}<span class="media-name">TELE CAMPANILE</span><span class="small-note">GIORNALISTA DEMO</span></div><section class="panel grow" style="display:flex;flex-direction:column;gap:5px"><div class="press-question">${esc(q.q)}</div><div class="answer-grid">${q.answers.map((a,i)=>button(`${i+1}. ${a}`,'answer',i)).join('')}</div><p class="small-note">UMORE TIFOSI <strong class="gold">${fan}/100</strong> · stato puramente illustrativo.</p></section></div>`;}
 function renderHub(){const o=HUB[selectedHub];return heading('UFFICIO DEL MISTER','SETTEMBRE 1979 · STAGIONE DEMO')+`<div class="kpi-strip"><div class="kpi"><small>MORALE MISTER</small><b>76</b></div><div class="kpi"><small>PRESIDENTE</small><b>61</b></div><div class="kpi"><small>SPOGLIATOIO</small><b>69</b></div><div class="kpi"><small>TIFOSI</small><b>${fan}</b></div><div class="kpi"><small>STAMPA</small><b>52</b></div></div><div class="screen-body"><section class="panel grow" style="display:flex;flex-direction:column"><div class="panel-title">SCRIVANIA DEL MISTER</div><div class="menu-cards">${[['campionato','⚽','CAMPIONATO'],['rosa','▤','ROSA'],['tifoseria','♟','TIFOSERIA'],['presidente','♛','PRESIDENTE']].map(([key,icon,title])=>`<button type="button" class="menu-card" data-action="hub" data-value="${key}" aria-pressed="${selectedHub===key}"><span class="emoji">${icon}</span><span>${title}</span></button>`).join('')}</div></section><section class="panel hub-report"><div class="panel-title">${esc(o.title)}</div><p class="small-note">${esc(o.desc)}</p><div class="hub-subs">${o.items.map((item,i)=>button(item,selectedHub==='campionato'&&i===0?'goto':'not-ready',selectedHub==='campionato'&&i===0?'prematch':item)).join('')}</div><div style="margin-top:auto">${button('PROSSIMA GIORNATA ▶','goto','prematch','gold-btn grow')}</div></section></div>`;}
 const players=(positions,away)=>positions.map((a,i)=>`<span class="kit-player ${away?'away':''}" style="left:${a[0]}%;top:${a[1]}%" aria-hidden="true">${i+1}</span>`).join('');
 const pitch=()=>`<div class="pitch-wrap ${camera==='tv'?'tv':''}" aria-label="Campo e 22 posizioni dimostrative"><div class="pitch-field">${players(POS,false)}${players(OPP,true)}<span class="ball"></span></div><div class="camera-tag">${camera==='tv'?'CAMERA TV • ZOOM DEMO':'CAMPO COMPLETO • SNAPSHOT DEMO'}</div></div>`;
 function renderPrematch(){return heading('PREPARTITA','PRIMA GIORNATA • ESEMPIO')+`<div class="screen-body">${pitch()}<section class="panel pitch-side"><div class="panel-title">FORMAZIONI E ORDINI</div><p class="bio">${esc(offers()[selectedOffer].name)}<br>VIRTUS RONCOCHIARO</p><p class="small-note">11 TITOLARI · 5 RISERVE · OPPONENTI 4-4-2</p><div class="tab-row">${button('CAMPO','camera','full',camera==='full'?'active':'')}${button('TV','camera','tv',camera==='tv'?'active':'')}</div>${button('▶ VAI ALLA VISTA PARTITA','goto','match','gold-btn')}</section></div>`;}

 function renderMatch(){return heading('PARTITA · DUE TELECAMERE','STESSO SNAPSHOT • SOLO DEMO')+`<div class="scoreline"><span>${esc(offers()[selectedOffer].name)}</span><strong>0 — 0</strong><span>VIRTUS RONCOCHIARO</span><span class="gold">00:00</span></div><div class="screen-body">${pitch()}<section class="pitch-side"><div class="panel" style="display:flex;flex-direction:column;gap:5px"><div class="panel-title">CAMERA E ORDINI</div><div class="tab-row">${button('CAMPO','camera','full',camera==='full'?'active':'')}${button('TV','camera','tv',camera==='tv'?'active':'')}</div><p class="small-note">Stessi 22 giocatori e stesso pallone: cambia solo la camera, non la simulazione.</p><div class="h-stack" style="margin-top:auto">${button('⇄ CAMBIO','not-ready','cambio','compact')}${button('▲ INCITA','not-ready','incoraggiamento','compact')}${button('◀ PRE','goto','prematch','compact')}</div></div></section></div>`;}

 const renderers={entry:renderEntry,avatar:renderAvatar,offers:renderOffers,president:renderPresident,press:renderPress,hub:renderHub,prematch:renderPrematch,match:renderMatch};
 function render(){if(!renderers[screen])screen='entry';el.innerHTML=renderers[screen]();
  for(const b of nav.querySelectorAll('[data-action="goto"]')){if(b.dataset.value===screen)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}
 }
 function onClick(e){const b=e.target.closest('button[data-action]');if(!b||!root.contains(b)||b.disabled)return;
  const act=b.dataset.action,val=b.dataset.value;
  if(typeof opts.onIntent==='function' && opts.onIntent({type:act,value:val,screen,selectedCoach,selectedOffer,camera})===false)return;
  if(act==='goto'){if(val==='press')question=0;changeScreen(val);}
  else if(act==='coach'){selectedCoach=Number(val);render();}
  else if(act==='offer'){selectedOffer=Number(val);render();const list=el.querySelector('.scroll');if(list)list.scrollTop=selectedOffer*44-80;}
  else if(act==='accept-offer'){president=selectedOffer%data.presidents.length;changeScreen('president');}
  else if(act==='change-president'){president=(president+1)%data.presidents.length;render();}
  else if(act==='answer'){fan=Math.max(0,Math.min(100,fan+(Number(val)===0?2:Number(val)===1?-1:1)));if(question<4){question++;render();notify('Risposta registrata solo nella demo UI.');}else{changeScreen('hub');notify('Cinque domande completate. Demo senza salvataggio.');}}
  else if(act==='hub'){selectedHub=val;render();}
  else if(act==='camera'){camera=val;render();}
  else if(act==='sample-load'){notify('Caricamento non collegato: arriverà dal controller carriera 07.');}
  else if(act==='not-ready'){notify('Interfaccia predisposta: funzione runtime non ancora collegata.');}
 }
 root.addEventListener('click',onClick);
 render();
 return Object.freeze({navigate:changeScreen,render,getScreen:()=>screen,getPreview:()=>preview(offers()[selectedOffer]),getState:()=>({screen,selectedCoach,selectedOffer,selectedHub,question,fan,camera,president}),setData(next){data={...data,...next};render();},destroy(){root.removeEventListener('click',onClick);if(toastTimer)clearTimeout(toastTimer);el.innerHTML='';}});
}
global.OronzoUIKitV02=Object.freeze({createApp,VERSION:'0.2.0',SCREENS:['entry','avatar','offers','president','press','hub','prematch','match']});
if(global.document&&global.document.getElementById('oronzo-ui'))global.oronzoUIDemo=createApp(global.document.getElementById('oronzo-ui'));
})(window);
