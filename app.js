/* CercaX UI: lettura locale, paginazione e risultato ricalcolato. */
(function(){
"use strict";
const $=q=>document.querySelector(q), make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
let workbook,engine,current="",page=0,selected="",filename="";const PAGE=65,MAXCOL=30;
const catalog={Matematica:"SUM AVERAGE MIN MAX ROUND ROUNDUP ROUNDDOWN ABS INT MOD POWER SQRT PRODUCT MEDIAN",Logica:"IF IFERROR IFNA AND OR NOT",Conteggi:"COUNT COUNTA COUNTBLANK COUNTIF COUNTIFS SUMIF SUMIFS",Ricerca:"VLOOKUP INDEX MATCH XLOOKUP",Testo:"LEN UPPER LOWER TRIM LEFT RIGHT MID CONCAT CONCATENATE SUBSTITUTE FIND SEARCH EXACT",Date:"TODAY NOW"};
function write(id,v){$(id).textContent=v}
function fmt(v,c){
 if(v==null)return "";if(typeof v==="boolean")return v?"VERO":"FALSO";
 if(typeof v==="number"&&Number.isFinite(v)){
  if(c?.w&&typeof c.v==="number"&&Math.abs(c.v-v)<1e-8*Math.max(1,Math.abs(v)))return c.w;
  return Number.isInteger(v)?String(v):Number(v.toPrecision(11)).toLocaleString("it-IT",{maximumFractionDigits:9})
 }return String(v)
}
function equals(a,b){return typeof a==="number"&&typeof b==="number"?Math.abs(a-b)<1e-7*Math.max(1,Math.abs(a),Math.abs(b)):a===b}
function showCell(ref,td){
 const c=workbook.Sheets[current][ref],r=engine.cell(current,ref);selected=ref;
 write("#selected",current+" · "+ref);write("#formula",c?.f?"="+c.f:"Nessuna formula");
 write("#computed",fmt(r.value,c)||"—");write("#stored",c?.w??(c?.v!==undefined?String(c.v):"—"));
 const labels={calculated:"Ricalcolata",partial:"Parzialmente ricalcolata",saved:"Valore salvato nel file",original:"Dato originale",empty:"Cella vuota",unsupported:"Non supportata",error:"Errore di calcolo"};
 const descriptions={calculated:"Risultato eseguito autonomamente da CercaX.",partial:"Il calcolo dipende anche da risultati memorizzati nel file.",saved:"Funzione non ancora supportata. Uso il valore memorizzato nel file.",original:"Questa cella contiene un dato, non una formula.",empty:"Nessun contenuto.",unsupported:"Formula priva di risultato utilizzabile.",error:"Il motore ha trovato un errore."};
 write("#state",labels[r.state]||r.state);$("#state").dataset.status=r.state;
 write("#detail",(descriptions[r.state]||"")+(r.detail?" "+r.detail:""));
 write("#comparison",c?.f&&r.state==="calculated"&&c.v!==undefined?(equals(c.v,r.value)?"✓ Coerente con il risultato memorizzato":"⚠ Diverso dal valore memorizzato"):"");
 document.querySelectorAll("td.selected").forEach(x=>x.classList.remove("selected"));
 if(td)td.classList.add("selected");else document.querySelectorAll("[data-ref]").forEach(x=>{if(x.dataset.ref===ref)x.classList.add("selected")});
}
function render(){
 const ws=workbook.Sheets[current],bound=XLSX.utils.decode_range(ws["!ref"]||"A1");
 for(const tab of $("#tabs").children)tab.classList.toggle("selected",tab.textContent===current);
 const first=bound.s.r+page*PAGE,last=Math.min(first+PAGE-1,bound.e.r),lastcol=Math.min(bound.s.c+MAXCOL-1,bound.e.c);
 const table=make("table"),header=make("tr");header.append(make("th","#"));
 for(let c=bound.s.c;c<=lastcol;c++)header.append(make("th",XLSX.utils.encode_col(c)));table.append(header);
 for(let r=first;r<=last;r++){
  const tr=make("tr");tr.append(make("th",String(r+1)));
  for(let c=bound.s.c;c<=lastcol;c++){
   const ref=XLSX.utils.encode_cell({r,c}),source=ws[ref],result=engine.cell(current,ref),td=make("td",fmt(result.value,source));
   td.dataset.ref=ref;if(source?.f)td.classList.add("formula",result.state);
   td.onclick=()=>showCell(ref,td);if(selected===ref)td.classList.add("selected");tr.append(td)
  }
  table.append(tr)
 }
 $("#grid").replaceChildren(table);$("#grid").scrollTop=0;$("#grid").scrollLeft=0;
 write("#pageLabel",(first+1)+"–"+(last+1)+" di "+(bound.e.r+1)+" righe");
 $("#prev").disabled=page===0;$("#next").disabled=last>=bound.e.r;
 write("#columnHint",lastcol<bound.e.c?"Anteprima limitata alle prime "+MAXCOL+" colonne.":"");
 const ref=selected&&ws[selected]?selected:XLSX.utils.encode_cell({r:first,c:bound.s.c});showCell(ref)
}
function load(b,name){
 if(!b?.SheetNames?.length)throw Error("Nessun foglio trovato");
 workbook=b;engine=new CercaXEngine.Engine(b);current=b.SheetNames[0];page=0;selected="";filename=name;
 $("#welcome").hidden=true;$("#reader").hidden=false;write("#fileName",name);write("#sheetCount",b.SheetNames.length);
 let total=0;for(const sheet of b.SheetNames)for(const cell of Object.values(b.Sheets[sheet]))if(cell&&typeof cell==="object"&&cell.f)total++;
 write("#formulaCount",total.toLocaleString("it-IT"));$("#tabs").replaceChildren();
 for(const sheet of b.SheetNames){const btn=make("button",sheet,"sheet-tab");btn.type="button";btn.onclick=()=>{current=sheet;page=0;selected="";render()};$("#tabs").append(btn)}
 render()
}
$("#prev").onclick=()=>{page=Math.max(0,page-1);selected="";render()};
$("#next").onclick=()=>{page++;selected="";render()};
$("#goto").onsubmit=e=>{
 e.preventDefault();if(!workbook)return;
 const ref=$("#address").value.trim().toUpperCase().replace(/\$/g,"");
 if(!/^[A-Z]{1,4}\d+$/.test(ref)){write("#notification","Indirizzo non valido: prova D42.");return}
 const ws=workbook.Sheets[current],p=XLSX.utils.decode_cell(ref),bounds=XLSX.utils.decode_range(ws["!ref"]||"A1");
 if(p.r<bounds.s.r||p.r>bounds.e.r||p.c<bounds.s.c||p.c>bounds.e.c){write("#notification","La cella richiesta è fuori dall'area del foglio.");return}
 if(p.c>=bounds.s.c+MAXCOL){write("#notification","Questa colonna non è ancora mostrata nell'anteprima.");return}
 page=Math.floor((p.r-bounds.s.r)/PAGE);selected=ref;render();write("#notification","Selezionata "+ref)
};
$("#file").onchange=async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  if(!window.XLSX)throw Error("La libreria Excel non è disponibile: verifica la connessione.");
  write("#notification","Lettura locale di "+file.name+"…");
  load(XLSX.read(await file.arrayBuffer(),{type:"array",cellFormula:true,cellText:true,cellDates:false}),file.name);
  write("#notification","File aperto in sola lettura.");
 }catch(error){write("#notification","Errore: "+error.message);write("#welcomeError",error.message)}
 finally{e.target.value=""}
};
$("#demo").onclick=()=>{
 try{
  if(!window.XLSX)throw Error("Libreria Excel non disponibile.");
  const b=XLSX.utils.book_new(),products=[["SKU","Articolo","Prezzo"]];
  for(let i=1;i<=120;i++)products.push(["P"+i,"Prodotto "+i,5+i*.75]);
  XLSX.utils.book_append_sheet(b,XLSX.utils.aoa_to_sheet(products),"Catalogo");
  const orders=[["N.","SKU","Quantità","Prezzo","Totale","Sconto","Netto"]];
  for(let i=1;i<=240;i++)orders.push([i,"P"+((i*7)%120+1),1+i%8,null,null,null,null]);
  const ws=XLSX.utils.aoa_to_sheet(orders);
  for(let i=2;i<=241;i++){
   ws["D"+i]={t:"n",f:"VLOOKUP(B"+i+",Catalogo!$A$2:$C$121,3,FALSE)"};
   ws["E"+i]={t:"n",f:"C"+i+"*D"+i};
   ws["F"+i]={t:"n",f:"IF(E"+i+">150,0.10,0)"};
   ws["G"+i]={t:"n",f:"ROUND(E"+i+"*(1-F"+i+"),2)"}
  }
  XLSX.utils.book_append_sheet(b,ws,"Ordini");
  const sum=XLSX.utils.aoa_to_sheet([["Indicatore","Risultato"],["Ordini",null],["Netto",null],["Quantità",null],["Sconto medio",null]]);
  sum.B2={t:"n",f:"COUNTA(Ordini!A2:A241)"};sum.B3={t:"n",f:"SUM(Ordini!G2:G241)"};
  sum.B4={t:"n",f:"SUM(Ordini!C2:C241)"};sum.B5={t:"n",f:"AVERAGE(Ordini!F2:F241)"};
  XLSX.utils.book_append_sheet(b,sum,"Riepilogo");
  load(b,"Demo · 240 ordini, 120 prodotti");write("#notification","Demo generata: oltre 900 formule ricalcolate nel browser.")
 }catch(e){write("#welcomeError",e.message)}
};
for(const [cat,names] of Object.entries(catalog)){
 const group=make("div",undefined,"catalog-group"),tags=make("div",undefined,"chips");group.append(make("strong",cat));
 for(const name of names.split(" "))tags.append(make("span",name,"chip"));group.append(tags);$("#catalog").append(group)
}
})();
