/* CercaX mobile workspace — local editing, selection and smart fill. */
(function(){
"use strict";
const $=s=>document.querySelector(s), X=()=>window.XLSX, make=(tag,content,cls)=>{
 const n=document.createElement(tag);if(content!==undefined)n.textContent=content;if(cls)n.className=cls;return n
};
const PAGE=56,MAX_COL=52;
let book=null,engine=null,sheet="",name="",rowStart=0,selection=null;
let showRows=false,showCols=false,orientation="portrait",modHeld=false,modLock=false;
let tap={ref:"",time:0},styleMap=new Map(),dirty=false,drag=null,lastToast=0;
function display(v,cell){
 if(v===undefined||v===null)return "";
 if(typeof v==="boolean")return v?"VERO":"FALSO";
 if(typeof v==="number"){
  if(cell?.w&&cell?.v!==undefined&&Math.abs(Number(cell.v)-v)<1e-9*Math.max(1,Math.abs(v)))return String(cell.w);
  if(!Number.isFinite(v))return String(v);
  if(cell?.z&&/([dmy]|yy|mm)/i.test(cell.z)&&!/^general$/i.test(cell.z)){try{return X().SSF.format(cell.z,v)}catch(_){}}
  if(cell?.z&&/%/.test(cell.z))return (v*100).toLocaleString("it-IT",{maximumFractionDigits:2})+"%";
  if(cell?.z&&/[€$]/.test(cell.z))return v.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";
  return Number.isInteger(v)?String(v):Number(v.toPrecision(11)).toLocaleString("it-IT",{maximumFractionDigits:9})
 }
 return String(v)
}
function toast(message){const el=$("#toast");el.textContent=message;el.hidden=false;lastToast++;const my=lastToast;setTimeout(()=>{if(my===lastToast)el.hidden=true},2700)}
function ws(){return book.Sheets[sheet]}
function bounds(){return X().utils.decode_range(ws()["!ref"]||"A1")}
function at(r,c){return X().utils.encode_cell({r,c})}
function pos(ref){return X().utils.decode_cell(ref)}
function cell(ref){return ws()[ref]}
function currentValue(ref){const c=cell(ref);return c?.f?engine.cell(sheet,ref).value:c?.v}
function present(c){return !!(c&&(c.f||c.v!==undefined&&c.v!==null&&c.v!==""))}
function modOn(){return modHeld||modLock}
function resetEngine(){engine=new CercaXEngine.Engine(book)}
function expandRef(ref){
 const p=pos(ref),b=bounds();b.s.r=Math.min(b.s.r,p.r);b.s.c=Math.min(b.s.c,p.c);
 b.e.r=Math.max(b.e.r,p.r);b.e.c=Math.max(b.e.c,p.c);
 ws()["!ref"]=X().utils.encode_range(b)
}
function put(ref,content){
 const old=cell(ref)||{},trim=String(content);
 if(trim===""){delete ws()[ref]}
 else if(trim.startsWith("=")){
  ws()[ref]={...old,t:"n",f:trim.slice(1)};delete ws()[ref].v;delete ws()[ref].w
 }else{
  let value=trim,type="s";
  if(/^(?:true|false|vero|falso)$/i.test(trim)){value=/^(true|vero)$/i.test(trim);type="b"}
  else if(trim.trim()!==""&&Number.isFinite(Number(trim.trim().replace(",",".")))&&!/^0\d+/.test(trim.trim())){value=Number(trim.trim().replace(",","."));type="n"}
  ws()[ref]={...old,t:type,v:value};delete ws()[ref].f;delete ws()[ref].w
 }
 expandRef(ref);dirty=true;resetEngine();
}
function setAt(ref,c){
 ws()[ref]=c;expandRef(ref);dirty=true
}
function refresh(keepScroll=true){
 if(!book)return;
 const scroll=$("#gridScroll"),top=keepScroll?scroll.scrollTop:0,left=keepScroll?scroll.scrollLeft:0;
 const b=bounds(),endCol=Math.min(MAX_COL-1,Math.max(b.e.c+5,19));
 const lastLogicalRow=Math.min(Math.max(b.e.r+60,250),80000);
 rowStart=Math.max(0,Math.min(lastLogicalRow-PAGE+1,Math.floor(top/45)-14));
 const endRow=Math.min(lastLogicalRow,rowStart+PAGE-1);
 const table=make("table",undefined,"sheet-table"),head=make("thead"),hr=make("tr");
 const corner=make("th","▣","corner");corner.title="Seleziona tutto il foglio";corner.onclick=()=>choose({kind:"sheet"});hr.append(corner);
 for(let c=0;c<=endCol;c++){
  const th=make("th",X().utils.encode_col(c));th.dataset.col=c;
  th.onclick=()=>choose({kind:"column",c});
  if(isHeadSelected("column",c))th.classList.add("head-selected");hr.append(th)
 }
 head.append(hr);table.append(head);
 const body=make("tbody"),colspan=endCol+2;
 function spacer(count){
  if(count<=0)return;
  const tr=make("tr"),td=make("td",undefined,"virtual-spacer");
  td.colSpan=colspan;td.style.height=(count*45)+"px";
  tr.append(td);body.append(tr)
 }
 spacer(rowStart);
 for(let r=rowStart;r<=endRow;r++){
  const tr=make("tr"),rh=make("th",String(r+1),"rowhead");
  rh.onclick=()=>choose({kind:"row",r});if(isHeadSelected("row",r))rh.classList.add("head-selected");
  tr.append(rh);
  for(let c=0;c<=endCol;c++){
   const ref=at(r,c),source=cell(ref),result=engine.cell(sheet,ref),td=make("td",display(result.value,source));
   td.dataset.ref=ref;td.dataset.r=r;td.dataset.c=c;
   if(source?.f)td.classList.add("formula",result.state);
   const style=styleMap.get(sheet+"!"+ref);
   if(style?.bold||source?.s?.font?.bold)td.classList.add("bold-value");
   if(style?.align==="center"||source?.s?.alignment?.horizontal==="center")td.classList.add("align-center");
   if(style?.align==="right"||source?.s?.alignment?.horizontal==="right")td.classList.add("align-right");
   if(isSelected(r,c))td.classList.add(selection?.kind==="cell"?"chosen":selection?.kind==="range"?"in-range":"axis-selected");
   td.onclick=()=>touchCell(ref);
   td.ondblclick=e=>{e.preventDefault();choose({kind:"cell",ref});openEditor()};
   tr.append(td)
  }
  body.append(tr)
 }
 spacer(lastLogicalRow-endRow);
 table.append(body);scroll.replaceChildren(table);
 scroll.scrollTop=top;scroll.scrollLeft=left;
 markFillHandle();updateHeads();updateFloat()
}
function isHeadSelected(kind,i){
 if(!selection)return false;
 if(selection.kind===kind)return selection[kind==="row"?"r":"c"]===i;
 return selection.kind==="sheet"||selection.kind==="range"&&(kind==="row"?i>=selection.a.r&&i<=selection.b.r:i>=selection.a.c&&i<=selection.b.c)
}
function isSelected(r,c){
 const s=selection;if(!s)return false;
 if(s.kind==="cell")return pos(s.ref).r===r&&pos(s.ref).c===c;
 if(s.kind==="row")return r===s.r;
 if(s.kind==="column")return c===s.c;
 if(s.kind==="sheet")return true;
 if(s.kind==="range")return r>=s.a.r&&r<=s.b.r&&c>=s.a.c&&c<=s.b.c;
 return false
}
function touchCell(ref){
 const now=Date.now();
 if(modOn()){
  const p=pos(ref),anchor=selection?.kind==="range"?selection.anchor:selection?.kind==="cell"?pos(selection.ref):p;
  const a={r:Math.min(anchor.r,p.r),c:Math.min(anchor.c,p.c)},b={r:Math.max(anchor.r,p.r),c:Math.max(anchor.c,p.c)};
  choose(a.r===b.r&&a.c===b.c?{kind:"cell",ref}:{kind:"range",a,b,anchor});
  tap.ref="";return
 }
 if(tap.ref===ref&&now-tap.time<360&&selection?.kind==="cell"){
  tap.ref="";openEditor();return
 }
 tap={ref,time:now};choose({kind:"cell",ref})
}
function choose(s){selection=s;updateSelectedVisual();updatePanel();updateFloat()}
function updateSelectedVisual(){
 document.querySelectorAll(".sheet-table td[data-ref]").forEach(td=>{
  const r=+td.dataset.r,c=+td.dataset.c;
  td.classList.remove("chosen","axis-selected","in-range");
  if(isSelected(r,c))td.classList.add(selection.kind==="cell"?"chosen":selection.kind==="range"?"in-range":"axis-selected")
 });
 document.querySelectorAll(".sheet-table th[data-col]").forEach(th=>th.classList.toggle("head-selected",isHeadSelected("column",+th.dataset.col)));
 document.querySelectorAll(".sheet-table th.rowhead").forEach((th,i)=>th.classList.toggle("head-selected",isHeadSelected("row",rowStart+i)));
 markFillHandle()
}
function selectionName(){
 const s=selection;if(!s)return "Nessuna cella";
 if(s.kind==="cell")return s.ref;
 if(s.kind==="row")return "Riga "+(s.r+1);
 if(s.kind==="column")return "Colonna "+X().utils.encode_col(s.c);
 if(s.kind==="sheet")return "Tutto il foglio";
 return at(s.a.r,s.a.c)+":"+at(s.b.r,s.b.c)
}
function updateFloat(){const label=$("#selectionInfo");label.textContent=selectionName();$("#sheetName").textContent=sheet||"CercaX";$("#mod").classList.toggle("active",modOn());$("#mod").setAttribute("aria-pressed",String(modOn()))}
function updateHeads(){
 $("#workspace").classList.toggle("show-rows",showRows);$("#workspace").classList.toggle("show-cols",showCols);
 $("#edgeRows").setAttribute("aria-pressed",String(showRows));$("#edgeCols").setAttribute("aria-pressed",String(showCols))
}
function button(text,func,cls){
 const b=make("button",text,cls);b.type="button";b.onclick=func;return b
}
function hidePanel(){$("#panel").hidden=true}
function decoratePanel(title,detail){
 const p=$("#panel");p.replaceChildren();p.hidden=false;
 p.append(make("span",undefined,"panel-handle"),button("×",hidePanel,"dismiss"),make("div",title,"panel-title"),make("p",detail,"panel-sub"));
 const actions=make("div",undefined,"action-list");p.append(actions);return actions
}
function action(actions,label,fn,important=false){actions.append(button(label,fn,important?"important":""))}
function selectionRefs(){
 const s=selection;if(!s)return [];
 const b=bounds(),out=[];
 let r0=b.s.r,r1=b.e.r,c0=b.s.c,c1=b.e.c;
 if(s.kind==="cell"){return [s.ref]}
 if(s.kind==="sheet"){
  const existing=Object.keys(ws()).filter(ref=>/^[A-Z]{1,4}\d+$/.test(ref));
  if(existing.length>60000){toast("Troppi elementi per formattare tutto il foglio in una volta");return []}
  return existing
 }
 if(s.kind==="row"){r0=r1=s.r;c1=Math.max(c1,19)}
 if(s.kind==="column"){c0=c1=s.c;r1=Math.max(r1,19)}
 if(s.kind==="range"){r0=s.a.r;r1=s.b.r;c0=s.a.c;c1=s.b.c}
 r1=Math.min(r1,r0+25000);c1=Math.min(c1,c0+300);
 if((r1-r0+1)*(c1-c0+1)>60000){toast("Selezione troppo ampia: limite formato 60.000 celle");return []}
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)out.push(at(r,c));
 return out
}
function applyFormat(kind,value,refList){
 const refs=refList||selectionRefs();if(!refs.length)return;
 const w=ws();for(const ref of refs){
  if(!w[ref]){w[ref]={t:"z"};expandRef(ref)}
  const st=styleMap.get(sheet+"!"+ref)||{},c=w[ref];c.s=c.s||{};
  if(kind==="bold"){st.bold=value;c.s.font={...(c.s.font||{}),bold:value}}
  if(kind==="align"){st.align=value;c.s.alignment={...(c.s.alignment||{}),horizontal:value}}
  if(kind==="number"){
   st.number=value;c.z=value==="currency"?'#,##0.00 "€"':value==="percent"?"0.00%":value==="date"?"dd/mm/yyyy":"General";
  }
  styleMap.set(sheet+"!"+ref,st);
 }
 dirty=true;refresh();toast("Formato applicato a "+refs.length+" celle")
}
function formatControls(container,apply){
 const controls=make("div",undefined,"format-buttons");
 const entries=[["B","bold",true],["Normale","bold",false],["←","align","left"],["↔","align","center"],["→","align","right"],["€","number","currency"],["%","number","percent"],["Data","number","date"],["123","number","general"]];
 for(const [label,kind,value] of entries)controls.append(button(label,()=>apply(kind,value)));
 container.append(controls)
}
function findAxis(s){
 const b=bounds(),isRow=s.kind==="row",fixed=isRow?s.r:s.c;
 const max=isRow?Math.min(Math.max(b.e.c+3,19),400):Math.min(Math.max(b.e.r+3,19),40000);
 let first=-1,last=-1,numberCount=0;
 for(let i=0;i<=max;i++){
  const ref=isRow?at(fixed,i):at(i,fixed),c=cell(ref);
  if(present(c)){
   if(first<0)first=i;last=i;
   if(typeof currentValue(ref)==="number")numberCount++
  }
 }
 return {isRow,fixed,first,last,next:Math.max(0,last+1),numberCount}
}
function refAlong(d,i){return d.isRow?at(d.fixed,i):at(i,d.fixed)}
function shiftFormula(formula,dr,dc){
 return String(formula).split(/("(?:[^"]|"")*")/g).map((chunk,i)=>{
  if(i%2)return chunk;
  return chunk.replace(/(^|[^A-Za-z0-9_.])(\$?)([A-Z]{1,3})(\$?)(\d+)(?![A-Za-z0-9_.])/gi,(m,pre,colAbs,col,rowAbs,row)=>{
   let c=0;for(const ch of col.toUpperCase())c=c*26+ch.charCodeAt(0)-64;c--;c+=colAbs?0:dc;
   const r=Number(row)+(rowAbs?0:dr);if(c<0||r<1)return pre+"#REF!";
   let letters="";for(c++;c>0;c=Math.floor((c-1)/26))letters=String.fromCharCode(65+(c-1)%26)+letters;
   return pre+colAbs+letters+rowAbs+r
  })
 }).join("")
}
function guessNext(d,i){
 if(d.last<0)return null;
 const old=refAlong(d,d.last),latest=cell(old),v=currentValue(old),older=d.last>0?currentValue(refAlong(d,d.last-1)):undefined;
 if(latest?.f){
  const delta=i-d.last;return {t:"n",f:shiftFormula(latest.f,d.isRow?0:delta,d.isRow?delta:0),z:latest.z,s:latest.s?structuredClone(latest.s):undefined}
 }
 if(typeof v==="number"&&Number.isFinite(v)){
  const step=typeof older==="number"&&Number.isFinite(older)?v-older:1;
  return {t:"n",v:v+step*(i-d.last),z:latest?.z,s:latest?.s?structuredClone(latest.s):undefined}
 }
 if(typeof v==="string"){
  const italian=/^(\d{2})\/(\d{2})\/(\d{4})$/;
  if(italian.test(v)){
   const parseDate=text=>{const p=italian.exec(text);return p?Date.UTC(Number(p[3]),Number(p[2])-1,Number(p[1])):NaN};
   const last=parseDate(v),previous=parseDate(older),step=Number.isFinite(previous)?last-previous:86400000;
   const date=new Date(last+step*(i-d.last));
   return {t:"s",v:String(date.getUTCDate()).padStart(2,"0")+"/"+String(date.getUTCMonth()+1).padStart(2,"0")+"/"+date.getUTCFullYear()};
  }
  const dates=/^\d{4}-\d{2}-\d{2}$/;
  if(dates.test(v)){
   const last=Date.parse(v+"T00:00:00Z"),prior=dates.test(String(older))?Date.parse(older+"T00:00:00Z"):last-86400000;
   const next=new Date(last+(last-prior)*(i-d.last)).toISOString().slice(0,10);
   return {t:"s",v:next}
  }
  const m=/^(.*?)(\d+)$/.exec(v);
  if(m){const p=typeof older==="string"?/^(.*?)(\d+)$/.exec(older):null;const step=p&&p[1]===m[1]?Number(m[2])-Number(p[2]):1;
   return {t:"s",v:m[1]+String(Number(m[2])+step*(i-d.last)).padStart(m[2].length,"0")}
  }
  return {t:"s",v}
 }
 return {t:latest?.t||"s",v:v??""}
}
function continueAxis(d,amount){
 if(d.last<0){toast("Inserisci almeno un valore prima di estendere la serie");return}
 amount=Math.min(100,Math.max(1,amount));
 for(let i=d.last+1;i<=d.last+amount;i++)setAt(refAlong(d,i),guessNext(d,i));
 resetEngine();refresh();updatePanel();toast("Serie estesa di "+amount+" celle")
}
function sumAxis(d){
 if(d.first<0||d.numberCount<2){toast("Servono almeno due valori numerici");return}
 const start=refAlong(d,d.first),end=refAlong(d,d.last),dest=refAlong(d,d.next);
 put(dest,"=SUM("+start+":"+end+")");refresh();updatePanel();toast("Somma inserita in "+dest)
}
function fillRange(direction,amount){
 const s=selection;if(!s||s.kind!=="range")return;
 amount=Math.min(50,Math.max(1,amount));
 const width=s.b.c-s.a.c+1,height=s.b.r-s.a.r+1,operations=(direction==="right"?height:width)*amount;
 if(operations>4000){toast("Intervallo troppo esteso per il riempimento: massimo 4.000 celle");return}
 let added=0;
 if(direction==="right"){
  for(let r=s.a.r;r<=s.b.r;r++){
   const d={isRow:true,fixed:r,last:s.b.c};
   if(!present(cell(refAlong(d,d.last))))continue;
   for(let c=s.b.c+1;c<=s.b.c+amount;c++){setAt(refAlong(d,c),guessNext(d,c));added++}
  }
 }else{
  for(let c=s.a.c;c<=s.b.c;c++){
   const d={isRow:false,fixed:c,last:s.b.r};
   if(!present(cell(refAlong(d,d.last))))continue;
   for(let r=s.b.r+1;r<=s.b.r+amount;r++){setAt(refAlong(d,r),guessNext(d,r));added++}
  }
 }
 if(!added){toast("Nessuna serie da proseguire sul bordo selezionato");return}
 resetEngine();
 const next={kind:"range",a:s.a,b:{r:s.b.r+(direction==="down"?amount:0),c:s.b.c+(direction==="right"?amount:0)},anchor:s.anchor};
 selection=next;refresh();updatePanel();
 toast("Estensione "+(direction==="right"?"orizzontale":"verticale")+": "+added+" celle")
}
function sumRange(){
 const s=selection;if(s.kind!=="range")return;
 const from=at(s.a.r,s.a.c),to=at(s.b.r,s.b.c),target=at(s.b.r+1,s.a.c);
 if(present(cell(target))){toast("La cella "+target+" è occupata; nessun valore sovrascritto");return}
 put(target,"=SUM("+from+":"+to+")");refresh();toast("Somma inserita in "+target)
}
function addAxisStrip(panel,d){
 const max=d.isRow?Math.max(bounds().e.c,19):Math.max(bounds().e.r,19);
 const heading=make("p","Esplora tutta la "+(d.isRow?"riga":"colonna")+" · tocca un valore per aprire la cella","axis-heading");
 const strip=make("div",undefined,"axis-strip"),more=button("Mostra altre celle",()=>appendMore(75),"axis-more");
 let next=0;
 function appendMore(batch){
  const end=Math.min(max+1,next+batch);
  for(;next<end;next++){
   const ref=refAlong(d,next),c=cell(ref),v=currentValue(ref);
   const b=button("",()=>{
    choose({kind:"cell",ref});openEditor()
   },"axis-item");
   b.append(make("small",ref),make("strong",display(v,c)||"·"));
   strip.append(b)
  }
  more.hidden=next>max
 }
 panel.append(heading,strip,more);appendMore(45)
}
function updatePanel(){
 const s=selection;if(!s){hidePanel();return}
 const label=selectionName();
 if(s.kind==="cell"){
  const src=cell(s.ref),result=engine.cell(sheet,s.ref);
  const detail=(src?.f?"="+src.f+" · ":"")+display(result.value,src)+(result.state==="saved"?" · Valore salvato":"");
  const actions=decoratePanel("Cella "+label,detail);
  action(actions,"✎ Modifica",openEditor,true);
  action(actions,"Copia",()=>{const value=src?.f?"="+src.f:display(src?.v,src);if(navigator.clipboard)navigator.clipboard.writeText(value).then(()=>toast("Copiato")).catch(()=>toast("Copia non disponibile"));else toast("Copia non disponibile")});
  action(actions,"Formato",()=>formatControls($("#panel"),(k,v)=>applyFormat(k,v)));
  return
 }
 if(s.kind==="row"||s.kind==="column"){
  const d=findAxis(s),free=refAlong(d,d.next),suggest=guessNext(d,d.next),value=suggest?(suggest.f?"="+suggest.f:display(suggest.v,suggest)):"nessuna serie";
  const subtitle="Prima cella libera dopo i dati: "+free+" · Prossimo valore suggerito: "+value;
  const actions=decoratePanel((s.kind==="row"?"Riga ":"Colonna ")+label.replace(/^(Riga |Colonna )/,""),subtitle);
  action(actions,"Continua +1",()=>continueAxis(findAxis(s),1),true);
  action(actions,"Continua +5",()=>continueAxis(findAxis(s),5));
  action(actions,"Continua +10",()=>continueAxis(findAxis(s),10));
  if(d.numberCount>=2)action(actions,"∑ Somma",()=>sumAxis(findAxis(s)));
  action(actions,"Formato",()=>formatControls($("#panel"),(k,v)=>applyFormat(k,v)));
  addAxisStrip($("#panel"),d);
  return
 }
 if(s.kind==="range"){
  const count=(s.b.r-s.a.r+1)*(s.b.c-s.a.c+1);
  const nextRight=at(s.a.r,s.b.c+1),nextDown=at(s.b.r+1,s.a.c);
  const actions=decoratePanel("Intervallo "+label,count+" celle · Prossime libere: "+nextRight+" (→) / "+nextDown+" (↓)");
  action(actions,"→ +1",()=>fillRange("right",1),true);
  action(actions,"→ +5",()=>fillRange("right",5));
  action(actions,"↓ +1",()=>fillRange("down",1));
  action(actions,"↓ +5",()=>fillRange("down",5));
  action(actions,"∑ Somma sotto",sumRange);
  action(actions,"Formato",()=>formatControls($("#panel"),(k,v)=>applyFormat(k,v)));
  action(actions,"Una cella",()=>choose({kind:"cell",ref:at(s.a.r,s.a.c)}));
  return
 }
 if(s.kind==="sheet"){
  const actions=decoratePanel("Intero foglio "+sheet,"Formattazione estesa all'area usata, senza modificare gli altri fogli.");
  action(actions,"Formato",()=>formatControls($("#panel"),(k,v)=>applyFormat(k,v)));
 }
}
function markFillHandle(){
 document.querySelectorAll(".fill-handle").forEach(x=>x.remove());
 const s=selection;if(!s||!["row","column","range"].includes(s.kind))return;
 const d=s.kind==="range"?null:findAxis(s);
 if(d&&d.last<0)return;
 const ref=s.kind==="range"?at(s.b.r,s.b.c):refAlong(d,d.last);
 const td=Array.from(document.querySelectorAll(".sheet-table td[data-ref]")).find(x=>x.dataset.ref===ref);
 if(!td)return;
 const handle=button("↘",()=>{},"fill-handle handle");
 handle.setAttribute("aria-label","Trascina per continuare i valori");
 handle.onclick=e=>{e.stopPropagation();toast("Trascina il quadratino verde verso le celle vuote")};
 handle.onpointerdown=e=>{
  e.stopPropagation();e.preventDefault();
  drag={s,d,amount:0,direction:null};handle.setPointerCapture(e.pointerId)
 };
 handle.onpointermove=e=>{
  if(!drag)return;
  const node=document.elementFromPoint(e.clientX,e.clientY)?.closest("td[data-ref]");
  if(!node)return;
  const p=pos(node.dataset.ref);
  let axis="",amount=0;
  if(s.kind==="range"){
   if(p.c>s.b.c&&p.r>=s.a.r&&p.r<=s.b.r){axis="right";amount=p.c-s.b.c}
   else if(p.r>s.b.r&&p.c>=s.a.c&&p.c<=s.b.c){axis="down";amount=p.r-s.b.r}
  }else{
   const index=d.isRow?p.c:p.r,other=d.isRow?p.r:p.c;
   if(other===d.fixed&&index>d.last){axis=d.isRow?"right":"down";amount=index-d.last}
  }
  drag.direction=axis;drag.amount=amount;
  document.querySelectorAll(".sheet-table td.fill-preview").forEach(el=>el.classList.remove("fill-preview"));
  if(!axis)return;
  document.querySelectorAll(".sheet-table td[data-ref]").forEach(el=>{
   const z=pos(el.dataset.ref);let active=false;
   if(s.kind==="range"){
    active=axis==="right"?z.r>=s.a.r&&z.r<=s.b.r&&z.c>s.b.c&&z.c<=s.b.c+amount:
     z.c>=s.a.c&&z.c<=s.b.c&&z.r>s.b.r&&z.r<=s.b.r+amount
   }else{
    const k=d.isRow?z.c:z.r,o=d.isRow?z.r:z.c;
    active=o===d.fixed&&k>d.last&&k<=d.last+amount
   }
   if(active)el.classList.add("fill-preview")
  })
 };
 handle.onpointerup=e=>{
  e.preventDefault();e.stopPropagation();
  if(!drag)return;
  const {amount,direction}=drag;drag=null;
  if(amount>0){
   if(s.kind==="range")fillRange(direction,amount);
   else continueAxis(findAxis(s),amount)
  }else toast("Trascina verso le celle vuote, oppure usa i comandi +1 e +5")
 };
 handle.onpointercancel=()=>{drag=null}
 td.append(handle)
}

/* Il foglio come tastiera per le formule: selezione, non modifica. */
const REF_ROW=39,REF_COL=106,REF_HEAD_H=26,REF_HEAD_W=35;
let refPicker=null,refCaret={start:0,end:0},refDrawQueued=false,editorSheet="";
function refLabel(name,origin){
 if(name===origin)return "";
 return "'"+name.replace(/'/g,"''")+"'!";
}
function chosenReference(){
 if(!refPicker?.start)return "";
 if(refPicker.mode==="range"&&!refPicker.end)return "";
 const {start,end,sheet:source}=refPicker;
 const a=end?{r:Math.min(start.r,end.r),c:Math.min(start.c,end.c)}:start;
 const b=end?{r:Math.max(start.r,end.r),c:Math.max(start.c,end.c)}:start;
 const first=at(a.r,a.c),last=at(b.r,b.c);
 return refLabel(source,editorSheet)+first+(first===last?"":":"+last);
}
function updateReferenceSelection(){
 const selection=chosenReference();
 $("#refSelection").textContent=selection||(refPicker?.mode==="range"&&refPicker.start?"Scegli la cella finale":"Nessuna cella");
 $("#refInsert").disabled=!selection;
 $("#refInstructions").textContent=refPicker?.mode==="range"?
  (refPicker.start&&!refPicker.end?"Ora tocca l'ultima cella dell'intervallo. Puoi scorrere liberamente.":"Tocca la prima cella e poi l'ultima per delimitare un intervallo."):
  "Tocca una cella: il riferimento sarà aggiunto nel punto del cursore.";
 $("#refCellMode").classList.toggle("active",refPicker?.mode==="cell");
 $("#refRangeMode").classList.toggle("active",refPicker?.mode==="range");
 $("#refCellMode").setAttribute("aria-pressed",String(refPicker?.mode==="cell"));
 $("#refRangeMode").setAttribute("aria-pressed",String(refPicker?.mode==="range"));
}
function refPick(r,c){
 if(!refPicker)return;
 const p={r,c};
 if(refPicker.mode==="cell"){refPicker.start=p;refPicker.end=null}
 else if(!refPicker.start||refPicker.end){refPicker.start=p;refPicker.end=null}
 else{refPicker.end=p}
 updateReferenceSelection();refRender()
}
function refSizing(){
 if(!refPicker)return;
 const sh=book.Sheets[refPicker.sheet],b=X().utils.decode_range(sh["!ref"]||"A1");
 refPicker.cols=Math.min(16384,Math.max(24,b.e.c+20));
 const maxRow=Math.min(1048576,Math.max(400,b.e.r+100));
 refPicker.base=0;
 refPicker.rows=Math.min(500000,maxRow);
 const surface=$("#refSurface");
 surface.style.width=(REF_HEAD_W+refPicker.cols*REF_COL)+"px";
 surface.style.height=(REF_HEAD_H+refPicker.rows*REF_ROW)+"px"
}
function refJump(r,c){
 if(!refPicker)return;
 const view=$("#refViewport");
 r=Math.max(0,Math.min(1048575,r));c=Math.max(0,Math.min(16383,c));
 if(r<refPicker.base||r>=refPicker.base+refPicker.rows){
  refPicker.base=Math.max(0,r-250);
  refPicker.rows=Math.min(500000,1048576-refPicker.base);
  $("#refSurface").style.height=(REF_HEAD_H+refPicker.rows*REF_ROW)+"px"
 }
 if(c>=refPicker.cols){
  refPicker.cols=Math.min(16384,c+20);
  $("#refSurface").style.width=(REF_HEAD_W+refPicker.cols*REF_COL)+"px"
 }
 view.scrollTop=Math.max(0,REF_HEAD_H+(r-refPicker.base)*REF_ROW-REF_ROW*2);
 view.scrollLeft=Math.max(0,REF_HEAD_W+c*REF_COL-REF_COL);
 refRender()
}
function refRender(){
 if(!refPicker)return;
 const view=$("#refViewport"),surface=$("#refSurface"),scrollY=view.scrollTop,scrollX=view.scrollLeft;
 const firstRow=Math.max(0,Math.floor((scrollY-REF_HEAD_H)/REF_ROW)-3);
 const lastRow=Math.min(refPicker.rows-1,Math.ceil((scrollY+Math.max(view.clientHeight,180)-REF_HEAD_H)/REF_ROW)+2);
 const firstCol=Math.max(0,Math.floor((scrollX-REF_HEAD_W)/REF_COL)-2);
 const lastCol=Math.min(refPicker.cols-1,Math.ceil((scrollX+Math.max(view.clientWidth,290)-REF_HEAD_W)/REF_COL)+1);
 const selected=refPicker.start,final=refPicker.end,rows=refPicker.rows,nodes=[];
 function tile(type,text,left,top,width,height,cls){
  const node=make("div",text,cls||type);
  node.style.left=left+"px";node.style.top=top+"px";node.style.width=width+"px";node.style.height=height+"px";
  nodes.push(node);return node
 }
 for(let row=firstRow;row<=lastRow;row++){
  const r=refPicker.base+row,top=REF_HEAD_H+row*REF_ROW;
  const label=tile("row",String(r+1),scrollX,top,REF_HEAD_W,REF_ROW,"ref-row-label");
  label.title="Riga "+(r+1);
  for(let col=firstCol;col<=lastCol;col++){
   const ref=at(r,col),sheetObj=book.Sheets[refPicker.sheet],c=sheetObj[ref],v=engine.cell(refPicker.sheet,ref);
   const el=tile("cell",display(v.value,c),REF_HEAD_W+col*REF_COL,top,REF_COL,REF_ROW,"ref-cell");
   el.dataset.ref=ref;
   if(c?.f)el.classList.add("ref-formula");
   if(selected){
    if(final&&r>=Math.min(selected.r,final.r)&&r<=Math.max(selected.r,final.r)&&col>=Math.min(selected.c,final.c)&&col<=Math.max(selected.c,final.c))el.classList.add("ref-range");
    else if(!final&&selected.r===r&&selected.c===col)el.classList.add("ref-chosen");
    if(selected.r===r&&selected.c===col)el.classList.add("ref-anchor")
   }
   el.onclick=()=>refPick(r,col)
  }
 }
 for(let col=firstCol;col<=lastCol;col++){
  tile("column",X().utils.encode_col(col),REF_HEAD_W+col*REF_COL,scrollY,REF_COL,REF_HEAD_H,"ref-col-label")
 }
 tile("corner","▦",scrollX,scrollY,REF_HEAD_W,REF_HEAD_H,"ref-corner");
 surface.replaceChildren(...nodes)
}
function refRenderSoon(){
 if(refDrawQueued||!refPicker)return;
 refDrawQueued=true;
 requestAnimationFrame(()=>{refDrawQueued=false;refRender()})
}
function refTabs(){
 const container=$("#refSheetTabs");container.replaceChildren();
 for(const source of book.SheetNames){
  const tab=button(source,()=>{
   if(!refPicker)return;
   refPicker.sheet=source;refPicker.start=null;refPicker.end=null;
   refSizing();$("#refViewport").scrollTop=0;$("#refViewport").scrollLeft=0;
   refTabs();updateReferenceSelection();refRender()
  },source===refPicker.sheet?"active":"");
  container.append(tab)
 }
}
function openRefPicker(){
 if(refPicker){closeRefPicker(true);return}
 if(!editorRef||!book)return;
 const input=$("#editInput");
 if(!input.value.startsWith("=")){
  if(input.value.trim()!==""){toast("Per scegliere riferimenti, inizia una formula con =");return}
  input.value="=";input.setSelectionRange?.(1,1)
 }
 refCaret={start:input.selectionStart??input.value.length,end:input.selectionEnd??input.value.length};
 refPicker={sheet:editorSheet||sheet,mode:"cell",start:null,end:null,rows:400,cols:30,base:0};
 $("#refViewport").scrollTop=0;$("#refViewport").scrollLeft=0;
 $("#referencePicker").hidden=false;$("#editorOverlay").classList.add("picking");
 $("#addReference span").textContent="Torna alla formula";
 refSizing();refTabs();updateReferenceSelection();refRender();
 editPreview()
}
function closeRefPicker(refocus=true){
 if(!refPicker)return;
 refPicker=null;$("#referencePicker").hidden=true;$("#editorOverlay").classList.remove("picking");
 $("#addReference span").textContent="Dal foglio";
 if(refocus){const input=$("#editInput");input.focus();input.setSelectionRange?.(refCaret.start,refCaret.end)}
}
function insertRef(){
 const chosen=chosenReference();if(!chosen)return;
 const input=$("#editInput"),start=Math.max(0,Math.min(refCaret.start,input.value.length)),end=Math.max(start,Math.min(refCaret.end,input.value.length));
 input.value=input.value.slice(0,start)+chosen+input.value.slice(end);
 const newPos=start+chosen.length;refCaret={start:newPos,end:newPos};
 closeRefPicker(true);
 input.setSelectionRange?.(newPos,newPos);editPreview();
 toast("Riferimento inserito: "+chosen)
}
$("#addReference").onclick=openRefPicker;
$("#refCancel").onclick=()=>closeRefPicker(true);
$("#refInsert").onclick=insertRef;
$("#refCellMode").onclick=()=>{
 if(!refPicker)return;refPicker.mode="cell";refPicker.start=null;refPicker.end=null;updateReferenceSelection();refRender()
};
$("#refRangeMode").onclick=()=>{
 if(!refPicker)return;refPicker.mode="range";refPicker.start=null;refPicker.end=null;updateReferenceSelection();refRender()
};
$("#refViewport").addEventListener("scroll",refRenderSoon,{passive:true});
$("#refGoto").onsubmit=e=>{
 e.preventDefault();if(!refPicker)return;
 const address=$("#refAddress").value.trim().toUpperCase().replace(/\$/g,"");
 const range=/^([A-Z]{1,3}\d+)(?::([A-Z]{1,3}\d+))?$/.exec(address);
 if(!range){toast("Scrivi una cella, ad esempio C250, oppure C5:C20");return}
 try{
  const first=pos(range[1]),last=range[2]?pos(range[2]):null;
  refJump(first.r,first.c);
  if(last){refPicker.mode="range";refPicker.start=first;refPicker.end=last}
  else{refPicker.start=first;refPicker.end=refPicker.mode==="range"?null:null}
  updateReferenceSelection();refRender()
 }catch(e){toast("Indirizzo non valido")}
};
$("#editInput").addEventListener("keyup",()=>{
 if(refPicker){const i=$("#editInput");refCaret={start:i.selectionStart,end:i.selectionEnd}}
});
$("#editInput").addEventListener("click",()=>{
 if(refPicker){const i=$("#editInput");refCaret={start:i.selectionStart,end:i.selectionEnd}}
});

function editPreview(){
 const ref=selection?.ref;if(!ref)return;
 const text=$("#editInput").value;
 if(!text.startsWith("=")){ $("#livePreview").textContent="Il contenuto sarà salvato come valore.";return }
 const existing=cell(ref),ws0=ws();
 ws0[ref]={t:"n",f:text.slice(1)};
 try{
  const sim=new CercaXEngine.Engine(book),r=sim.cell(sheet,ref);
  $("#livePreview").textContent=r.state==="calculated"?"Anteprima: "+display(r.value):r.state==="error"?"Errore: "+r.value:"Formula non ancora supportata o incompleta";
 }catch(e){$("#livePreview").textContent="Anteprima non disponibile"}
 finally{if(existing)ws0[ref]=existing;else delete ws0[ref]}
}
let editorRef=null,editorStyle={};
function openEditor(){
 if(!selection||selection.kind!=="cell")return;
 editorRef=selection.ref;editorSheet=sheet;const src=cell(editorRef),result=engine.cell(sheet,editorRef);
 editorStyle={...(styleMap.get(sheet+"!"+editorRef)||{})};
 $("#editorTitle").textContent="Cella "+editorRef;
 $("#editorOld").textContent=display(result.value,src)||"(vuota)";
 $("#editInput").value=src?.f?"="+src.f:src?.v===undefined?"":String(src.v);
 $("#editorOverlay").hidden=false;$("#livePreview").textContent="";
 const controls=$("#editorFormat");controls.replaceChildren();
 formatControls(controls,(kind,value)=>{
  editorStyle[kind]=value;
  toast("Formato preparato: verrà applicato al salvataggio")
 });
 editPreview();$("#editInput").focus()
}
$("#editInput").addEventListener("input",editPreview);
function closeEditor(){closeRefPicker(false);$("#editorOverlay").hidden=true;editorRef=null}
$("#cancelEditor").onclick=closeEditor;
$("#closeEditor").onclick=closeEditor;
$("#saveEditor").onclick=()=>{
 if(!editorRef)return;
 const ref=editorRef,text=$("#editInput").value;put(ref,text);
 closeEditor();
 const changes=Object.entries(editorStyle);for(const [kind,value] of changes)applyFormat(kind,value,[ref]);
 refresh();choose({kind:"cell",ref});toast("Cella "+ref+" aggiornata")
};
function exportFile(){
 if(!book||!X()){toast("Impossibile esportare");return}
 try{
  for(const sh of book.SheetNames){
   for(const [ref,c] of Object.entries(book.Sheets[sh])){
    if(!/^[A-Z]+\d+$/.test(ref)||!c?.f)continue;
    const r=engine.cell(sh,ref);
    if(r.state==="calculated"&&(typeof r.value==="number"&&Number.isFinite(r.value)||typeof r.value==="string"||typeof r.value==="boolean")){
     c.v=r.value;c.t=typeof r.value==="number"?"n":typeof r.value==="boolean"?"b":"s";delete c.w
    }
   }
  }
  const file=name.replace(/\.[^.]+$/,"").replace(/[\\/:*?"<>|]/g,"_")+"_CercaX.xlsx";
  X().writeFile(book,file,{bookType:"xlsx",compression:true,cellStyles:true});
  dirty=false;toast("Esportazione avviata: "+file)
 }catch(e){toast("Errore esportazione: "+e.message)}
}
function createDemo(){
 const x=X();const book=x.utils.book_new(),data=[["Codice","Articolo","Prezzo","Quantità","Totale","Sconto","Netto"]];
 for(let i=1;i<=220;i++)data.push(["P"+String(i).padStart(3,"0"),"Prodotto "+i,5+i*.65,2+i%7,null,null,null]);
 const s=x.utils.aoa_to_sheet(data);
 for(let i=2;i<=221;i++){
  s["E"+i]={t:"n",f:"C"+i+"*D"+i};s["F"+i]={t:"n",f:"IF(E"+i+">100,0.1,0)"};s["G"+i]={t:"n",f:"ROUND(E"+i+"*(1-F"+i+"),2)"}
 }
 x.utils.book_append_sheet(book,s,"Ordini");
 const calc=x.utils.aoa_to_sheet([["Indicatore","Calcolo"],["Totale",null],["Media",null],["Ordini",null]]);
 calc.B2={t:"n",f:"SUM(Ordini!G2:G221)"};calc.B3={t:"n",f:"AVERAGE(Ordini!G2:G221)"};calc.B4={t:"n",f:"COUNTA(Ordini!A2:A221)"};
 x.utils.book_append_sheet(book,calc,"Dashboard");
 return book
}
function load(b,file){
 if(!b?.SheetNames?.length)throw Error("Il file non contiene fogli.");
 book=b;engine=new CercaXEngine.Engine(b);sheet=b.SheetNames[0];name=file;rowStart=0;selection=null;dirty=false;styleMap.clear();
 $("#welcome").hidden=true;$("#workspace").hidden=false;
 setOrientation(orientation);
 renderSheets();refresh(false);toast("Aperto: "+file)
}
function renderSheets(){
 const list=$("#sheetPicker");list.replaceChildren(make("h3","Fogli di lavoro"));
 for(const sh of book.SheetNames){
  const item=button(sh,()=>{
   sheet=sh;rowStart=0;selection=null;list.hidden=true;hidePanel();refresh(false)
  },sh===sheet?"current":"");
  list.append(item)
 }
 list.append(make("small","Tocca un foglio per aprirlo. Tutte le modifiche rimangono sul dispositivo fino all'esportazione."))
}
$("#file").onchange=async e=>{
 const f=e.target.files?.[0];if(!f)return;
 try{if(!X())throw Error("Libreria Excel non disponibile, controlla Internet");
  const b=X().read(await f.arrayBuffer(),{type:"array",cellFormula:true,cellText:true,cellDates:false,cellStyles:true});
  load(b,f.name)
 }catch(err){toast("Errore: "+err.message);$("#welcomeError").textContent=err.message}
 finally{e.target.value=""}
};
$("#openFile").onclick=()=>$("#file").click();
$("#welcomeDemo").onclick=()=>{
 try{if(!X())throw Error("Libreria Excel non caricata");load(createDemo(),"Demo.xlsx")}
 catch(e){$("#welcomeError").textContent=e.message}
};
$("#sheetButton").onclick=()=>{
 renderSheets();$("#sheetPicker").hidden=!$("#sheetPicker").hidden;$("#mainMenu").hidden=true
};
$("#menuButton").onclick=()=>{$("#mainMenu").hidden=!$("#mainMenu").hidden;$("#sheetPicker").hidden=true};
$("#menuOpen").onclick=()=>{$("#mainMenu").hidden=true;$("#file").click()};
$("#menuSave").onclick=()=>{$("#mainMenu").hidden=true;exportFile()};
$("#menuRows").onclick=()=>{showRows=!showRows;updateHeads();$("#mainMenu").hidden=true};
$("#menuCols").onclick=()=>{showCols=!showCols;updateHeads();$("#mainMenu").hidden=true};
$("#menuSelectAll").onclick=()=>{$("#mainMenu").hidden=true;choose({kind:"sheet"})};
$("#menuNext").onclick=()=>{selection=null;$("#mainMenu").hidden=true;hidePanel();$("#gridScroll").scrollBy({top:PAGE*45,behavior:"smooth"})};
$("#menuPrev").onclick=()=>{selection=null;$("#mainMenu").hidden=true;hidePanel();$("#gridScroll").scrollBy({top:-PAGE*45,behavior:"smooth"})};
$("#menuHome").onclick=()=>{if(dirty&&!confirm("Tornare alla schermata iniziale? Esporta prima per non perdere le modifiche."))return;$("#workspace").hidden=true;$("#welcome").hidden=false;$("#mainMenu").hidden=true};
$("#saveButton").onclick=exportFile;
$("#menuFullscreen").onclick=async()=>{
 $("#mainMenu").hidden=true;
 try{
  if(document.fullscreenElement){await document.exitFullscreen()}
  else if(document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen()}
  else throw Error("Fullscreen API non disponibile");
 }catch(e){toast("La modalità schermo intero non è disponibile in questo browser")}
};
window.addEventListener("beforeunload",e=>{
 if(dirty){e.preventDefault();e.returnValue=""}
});
let scrollPending=false;
$("#gridScroll").addEventListener("scroll",()=>{
 if(!book||scrollPending)return;
 const target=Math.max(0,Math.floor($("#gridScroll").scrollTop/45)-14);
 if(Math.abs(target-rowStart)<=12)return;
 scrollPending=true;
 requestAnimationFrame(()=>{scrollPending=false;refresh(true)})
});
$("#selectionInfo").onclick=()=>{if(selection)updatePanel();else toast("Tocca una cella per selezionarla")};
function setOrientation(v){
 orientation=v;const el=$("#workspace"),portrait=window.innerHeight>=window.innerWidth;
 el.classList.toggle("rotated",v==="landscape"&&portrait);
 el.classList.toggle("portrait-rotated",v==="portrait"&&!portrait&&window.innerWidth<=900);
 el.classList.toggle("portrait-desktop",v==="portrait"&&window.innerWidth>900);
 $("#rotateButton").title=v==="portrait"?"Passa a vista orizzontale":"Passa a vista verticale";
 $("#rotateButton").textContent=v==="portrait"?"↔":"↕"
}
$("#rotateButton").onclick=()=>{
 setOrientation(orientation==="portrait"?"landscape":"portrait");
 toast("Vista "+(orientation==="portrait"?"verticale":"orizzontale")+". Puoi anche ruotare fisicamente il telefono.")
};
window.addEventListener("resize",()=>setOrientation(orientation));
const mod=$("#mod");
let modStart=0;
mod.onpointerdown=e=>{e.preventDefault();e.stopPropagation();modStart=Date.now();modHeld=true;updateFloat();mod.setPointerCapture(e.pointerId)};
mod.onpointerup=e=>{
 e.preventDefault();e.stopPropagation();
 const elapsed=Date.now()-modStart;modHeld=false;if(elapsed<290)modLock=!modLock;
 updateFloat()
};
mod.onpointercancel=()=>{modHeld=false;updateFloat()};
mod.onclick=e=>{e.preventDefault();if(e.detail===0){modLock=!modLock;updateFloat()}};
function edgeControl(id,axis){
 const el=$(id);let start=null;
 el.onpointerdown=e=>{e.preventDefault();start={x:e.clientX,y:e.clientY};el.setPointerCapture(e.pointerId)};
 el.onpointerup=e=>{
  e.preventDefault();if(!start)return;
  const rotated=$("#workspace").classList.contains("rotated"),dx=rotated?e.clientY-start.y:e.clientX-start.x,dy=rotated?-(e.clientX-start.x):e.clientY-start.y;
  const distance=axis==="cols"?dy:dx;
  if(axis==="cols")showCols=Math.abs(distance)>22?distance>0:!showCols;
  else showRows=Math.abs(distance)>22?distance>0:!showRows;
  updateHeads();start=null
 };
 el.onpointercancel=()=>{start=null}
}
edgeControl("#edgeCols","cols");edgeControl("#edgeRows","rows");
$("#editorOverlay").onclick=e=>{if(e.target.id==="editorOverlay")closeEditor()};
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"){closeEditor();$("#mainMenu").hidden=true;$("#sheetPicker").hidden=true;hidePanel()}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"&&book){e.preventDefault();exportFile()}
});
})();
