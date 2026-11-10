/** R12 display selection from the verified 80 Italian-language Coach04 shouts.
 * A geographical affinity changes Engine06 performance through orders.js, not
 * text filtering. No unreviewed dialect expression can be published. */
function hash(str){let h=2166136261;for(const c of String(str))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function situationOf({events=[],playerId,minute=0,fatigue=0}={}){
 const relevant=events.filter(x=>x.playerId===playerId);
 const last=relevant.at(-1);
 if(last?.type==='save')return 'keeper_save';
 if(last?.type==='substitution')return 'sub_entry';
 if(last?.type==='shot')return 'missed_chance';
 if(['foul','card'].includes(last?.type))return 'nervous';
 if(['pass_error','bad_pass'].includes(last?.type))return 'bad_pass';
 if(minute>=75)return 'late_match';
 if(fatigue>=72)return 'tired';
 return 'good_run';
}
export function selectMatchShoutR12(catalog,{seed,absoluteWeek,playerId,tone,minute=0,fatigue=0,events=[],ordinal=0}={}){
 const intent=tone==='harsh'?'reprimand':'encourage';
 const rows=catalog?.shouts;
 if(!Array.isArray(rows))return null;
 const situation=situationOf({events,playerId,minute,fatigue});
 let selected=rows.filter(x=>x.language==='it-IT'&&x.intent===intent&&x.situation===situation);
 if(!selected.length)selected=rows.filter(x=>x.language==='it-IT'&&x.intent===intent);
 if(!selected.length)return null;
 const key=seed+'|'+absoluteWeek+'|'+playerId+'|'+tone+'|'+minute+'|'+ordinal;
 const line=selected[hash(key)%selected.length];
 return {id:line.id,text:line.text,situation,intensity:line.intensity,
  tone:line.tone,language:'it-IT',dialectVerified:false,source:'copy04-80-original-italian'};
}
