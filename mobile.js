/* CercaX mobile workspace — local editing, selection and smart fill. */
(function(){
"use strict";
const $=s=>document.querySelector(s), X=()=>window.XLSX, make=(tag,content,cls)=>{
 const n=document.createElement(tag);if(content!==undefined)n.textContent=content;if(cls)n.className=cls;return n
};
const PAGE=80,MAX_COL=52;
let book=null,engine=null,sheet="",name="",page=0,selection=null;
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
 if(!book)return;const scroll=$("#gridScroll"),top=keepScroll?scroll.scrollTop:0,left=keepScroll?scroll.scrollLeft:0;
 const b=bounds(),endRow=page*PAGE+PAGE-1,endCol=Math.min(MAX_COL-1,Math.max(b.e.c+5,19));
 const table=make("table",undefined,"sheet-table");
 const head=make("thead"),hr=make("tr"),corner=make("th","▣","corner");corner.title="Seleziona tutto il foglio";corner.onclick=()=>choose({kind:"sheet"});
 hr.append(corner);
 for(let c=0;c<=endCol;c++){
  const th=make("th",X().utils.encode_col(c));th.dataset.col=c;
  th.onclick=()=>choose({kind:"column",c});if(isHeadSelected("column",c))th.classList.add("head-selected");
  hr.append(th)
 }
 head.append(hr);table.append(head);
 const body=make("tbody");
 for(let r=page*PAGE;r<=endRow;r++){
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
 document.querySelectorAll(".sheet-table th.rowhead").forEach((th,i)=>th.classList.toggle("head-selected",isHeadSelected("row",page*PAGE+i)));
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
  if(!w[ref])w[ref]={t:"z"};
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
function sumRange(){
 const s=selection;if(s.kind!=="range")return;
 const from=at(s.a.r,s.a.c),to=at(s.b.r,s.b.c),target=at(s.b.r+1,s.a.c);
 if(present(cell(target))){toast("La cella "+target+" è occupata; nessun valore sovrascritto");return}
 put(target,"=SUM("+from+":"+to+")");refresh();toast("Somma inserita in "+target)
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
  const preview=make("div",undefined,"action-preview");
  const samples=[];
  for(let i=Math.max(0,d.last-5);i<=d.last;i++)samples.push(refAlong(d,i)+" "+display(currentValue(refAlong(d,i)),cell(refAlong(d,i))));
  preview.textContent="Valori recenti: "+(samples.join(" · ")||"nessuno")+". Puoi anche trascinare il quadratino verde dall'ultima cella visibile.";
  $("#panel").append(preview);return
 }
 if(s.kind==="range"){
  const count=(s.b.r-s.a.r+1)*(s.b.c-s.a.c+1),actions=decoratePanel("Intervallo "+label,count+" celle selezionate");
  action(actions,"∑ Somma sotto",sumRange,true);
  action(actions,"Formato",()=>formatControls($("#panel"),(k,v)=>applyFormat(k,v)));
  action(actions,"Riduci a cella",()=>choose({kind:"cell",ref:at(s.a.r,s.a.c)}));
  return
 }
 if(s.kind==="sheet"){
  const actions=decoratePanel("Intero foglio "+sheet,"Formattazione estesa all'area usata, senza modificare gli altri fogli.");
  action(actions,"Formato",()=>formatControls($("#panel"),(k,v)=>applyFormat(k,v)));
 }
}
function markFillHandle(){
 document.querySelectorAll(".fill-handle").forEach(x=>x.remove());
 const s=selection;if(!s||!(s.kind==="row"||s.kind==="column"))return;
 const d=findAxis(s);if(d.last<0)return;
 const ref=refAlong(d,d.last);
 const td=Array.from(document.querySelectorAll(".sheet-table td[data-ref]")).find(x=>x.dataset.ref===ref);
 if(!td)return;
 const handle=button("↘",()=>{},"fill-handle handle");
 handle.setAttribute("aria-label","Trascina per continuare la serie");
 handle.onclick=e=>{e.stopPropagation();toast("Trascina il quadratino verso le celle vuote per continuare la serie")};
 handle.onpointerdown=e=>{
  e.stopPropagation();e.preventDefault();drag={axis:s.kind,reference:d,aim:d.last};handle.setPointerCapture(e.pointerId)
 };
 handle.onpointermove=e=>{
  if(!drag)return;
  const node=document.elementFromPoint(e.clientX,e.clientY)?.closest("td[data-ref]");
  if(!node)return;
  const p=pos(node.dataset.ref);
  const index=d.isRow?p.c:p.r,other=d.isRow?p.r:p.c;
  if(other!==d.fixed)return;
  drag.aim=index;
  document.querySelectorAll(".sheet-table td.fill-preview").forEach(el=>el.classList.remove("fill-preview"));
  document.querySelectorAll(".sheet-table td[data-ref]").forEach(el=>{
   const z=pos(el.dataset.ref),k=d.isRow?z.c:z.r,o=d.isRow?z.r:z.c;
   if(o===d.fixed&&k>d.last&&k<=index)el.classList.add("fill-preview")
  })
 };
 handle.onpointerup=e=>{
  e.preventDefault();e.stopPropagation();
  if(!drag)return;const n=drag.aim-d.last;drag=null;
  if(n>0)continueAxis(findAxis(s),n);else toast("Trascina verso le celle libere per estendere")
 };
 handle.onpointercancel=()=>{drag=null};
 td.append(handle)
}
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
 editorRef=selection.ref;const src=cell(editorRef),result=engine.cell(sheet,editorRef);
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
function closeEditor(){$("#editorOverlay").hidden=true;editorRef=null}
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
 book=b;engine=new CercaXEngine.Engine(b);sheet=b.SheetNames[0];name=file;page=0;selection=null;dirty=false;styleMap.clear();
 $("#welcome").hidden=true;$("#workspace").hidden=false;
 setOrientation(orientation);
 renderSheets();refresh(false);toast("Aperto: "+file)
}
function renderSheets(){
 const list=$("#sheetPicker");list.replaceChildren(make("h3","Fogli di lavoro"));
 for(const sh of book.SheetNames){
  const item=button(sh,()=>{
   sheet=sh;page=0;selection=null;list.hidden=true;hidePanel();refresh(false)
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
$("#menuNext").onclick=()=>{page++;selection=null;$("#mainMenu").hidden=true;hidePanel();refresh(false)};
$("#menuPrev").onclick=()=>{page=Math.max(0,page-1);selection=null;$("#mainMenu").hidden=true;hidePanel();refresh(false)};
$("#menuHome").onclick=()=>{if(dirty&&!confirm("Tornare alla schermata iniziale? Esporta prima per non perdere le modifiche."))return;$("#workspace").hidden=true;$("#welcome").hidden=false;$("#mainMenu").hidden=true};
$("#saveButton").onclick=exportFile;
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
