/* CercaX: interprete formule in sola lettura. Non utilizza eval. */
(function(g){
"use strict";
class FormulaError extends Error{constructor(code,detail){super(detail||code);this.code=code}}
const fail=(code,detail)=>{throw new FormulaError(code,detail)};
const alias={
 SOMMA:"SUM",MEDIA:"AVERAGE",SE:"IF","SE.ERRORE":"IFERROR",E:"AND",O:"OR",NON:"NOT",
 "CONTA.SE":"COUNTIF","SOMMA.SE":"SUMIF","CONTA.PIÙ.SE":"COUNTIFS","SOMMA.PIÙ.SE":"SUMIFS",
 "CONTA.NUMERI":"COUNT","CONTA.VALORI":"COUNTA","CERCA.VERT":"VLOOKUP","CERCA.X":"XLOOKUP",
 CONFRONTA:"MATCH",INDICE:"INDEX",ARROTONDA:"ROUND","ARROTONDA.PER.ECC":"ROUNDUP",
 "ARROTONDA.PER.DIF":"ROUNDDOWN",RADQ:"SQRT",POTENZA:"POWER",RESTO:"MOD",
 SINISTRA:"LEFT",DESTRA:"RIGHT","STRINGA.ESTRAI":"MID",LUNGHEZZA:"LEN",
 MAIUSC:"UPPER",MINUSC:"LOWER","ANNULLA.SPAZI":"TRIM",CONCATENA:"CONCATENATE",
 SOSTITUISCI:"SUBSTITUTE",TROVA:"FIND",RICERCA:"SEARCH",OGGI:"TODAY",ADESSO:"NOW",VERO:"TRUE",FALSO:"FALSE"
};
const norm=s=>{s=String(s).toUpperCase().replace(/^_XLFN\./,"");return alias[s]||s};
const flat=x=>Array.isArray(x)?x.flat(Infinity):[x];
const num=x=>{if(Array.isArray(x))return num(flat(x)[0]);if(x==null||x==="")return 0;if(typeof x==="boolean")return Number(x);const n=Number(x);return Number.isFinite(n)?n:fail("#VALUE!","Valore non numerico")};
const str=x=>x==null?"":typeof x==="boolean"?(x?"TRUE":"FALSE"):Array.isArray(x)?str(flat(x)[0]):String(x);
const bool=x=>typeof x==="string"?!!x&&x.toUpperCase()!=="FALSE":!!x;
function compare(a,b){if((typeof a==="number"||typeof b==="number")&&a!==""&&b!==""){const n=Number(a),m=Number(b);if(Number.isFinite(n)&&Number.isFinite(m))return n-m}return str(a).localeCompare(str(b),undefined,{sensitivity:"accent"})}
function criteria(x,c){
 if(typeof c==="number"||typeof c==="boolean")return compare(x,c)===0;
 const match=/^(<=|>=|<>|=|<|>)(.*)$/.exec(str(c)),op=match?match[1]:"=",txt=match?match[2]:str(c);
 if(/[?*]/.test(txt)&&(op==="="||op==="<>")){
  let re="^";for(const ch of txt){if(ch==="*")re+=".*";else if(ch==="?")re+=".";else re+=ch.replace(/[.*+?^$()|[\]{}\\]/g,"\\$&")}re+="$";
  const yes=new RegExp(re,"i").test(str(x));return op==="="?yes:!yes
 }
 const n=Number(txt),target=txt.trim()!==""&&Number.isFinite(n)?n:txt,d=compare(x,target);
 return op==="="?d===0:op==="<>"?d!==0:op===">"?d>0:op==="<"?d<0:op===">="?d>=0:d<=0;
}
function tokenize(input){
 const s=String(input).replace(/^=/,"");let i=0;const out=[];
 while(i<s.length){
  if(/\s/.test(s[i])){i++;continue}const rem=s.slice(i),ch=s[i];
  if(ch==='"'){let v="",closed=false;i++;while(i<s.length){if(s[i]==='"'){i++;if(s[i]==='"'){v+='"';i++;continue}closed=true;break}v+=s[i++]}if(!closed)fail("UNSUPPORTED","Testo non chiuso");out.push({t:"str",v});continue}
  if(ch==="'"){let v="",closed=false;i++;while(i<s.length){if(s[i]==="'"){i++;if(s[i]==="'"){v+="'";i++;continue}closed=true;break}v+=s[i++]}if(!closed)fail("UNSUPPORTED","Nome foglio non chiuso");out.push({t:"sheet",v});continue}
  const n=/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(rem);
  if(n){out.push({t:"num",v:Number(n[0])});i+=n[0].length;continue}
  const c=/^\$?[A-Za-z]{1,4}\$?\d+/.exec(rem);
  if(c&&!/[\w.]/.test(rem[c[0].length]||"")){out.push({t:"cell",v:c[0].replace(/\$/g,"").toUpperCase()});i+=c[0].length;continue}
  const id=/^[\p{L}_][\p{L}\p{N}_.]*/u.exec(rem);
  if(id){out.push({t:"id",v:id[0]});i+=id[0].length;continue}
  const two=rem.slice(0,2);if([">=","<=","<>"].includes(two)){out.push({t:two});i+=2;continue}
  if("+-*/^%&=<>():!,;".includes(ch)){out.push({t:ch});i++;continue}
  fail("UNSUPPORTED","Simbolo non supportato: "+ch)
 }
 out.push({t:"eof"});return out;
}
const priority={"=":1,"<>":1,">":1,"<":1,">=":1,"<=":1,"&":2,"+":3,"-":3,"*":4,"/":4,"^":6};
function parse(formula){
 const tok=tokenize(formula);let i=0;const peek=()=>tok[i],eat=x=>{if(peek().t===x){i++;return true}return false},need=x=>{if(!eat(x))fail("UNSUPPORTED","Atteso "+x)};
 function atom(){
  const t=peek();
  if(eat("num")||eat("str"))return {t:"lit",v:t.v};
  if(eat("+")||eat("-"))return {t:"un",op:t.t,v:expr(5)};
  if(eat("(")){const a=expr(0);need(")");return a}
  let sheet;if(t.t==="sheet"||(t.t==="id"&&tok[i+1]?.t==="!")){sheet=t.v;i++;need("!")}
  const next=peek();
  if(eat("cell")){
   if(eat(":")){let other=sheet;if((peek().t==="sheet"||peek().t==="id")&&tok[i+1]?.t==="!"){other=peek().v;i++;need("!")}const last=peek();need("cell");if(sheet&&other&&sheet.toLowerCase()!==other.toLowerCase())fail("UNSUPPORTED","Intervallo su fogli differenti");return {t:"range",sheet:sheet||other,start:next.v,end:last.v}}
   return {t:"ref",sheet,ref:next.v}
  }
  if(eat("id")){
   if(sheet)fail("UNSUPPORTED","Nomi definiti non supportati");const name=norm(next.v);
   if(eat("(")){const args=[];if(!eat(")")){do{args.push(expr(0))}while(eat(",")||eat(";"));need(")")}return {t:"fn",name,args}}
   if(name==="TRUE"||name==="FALSE")return {t:"lit",v:name==="TRUE"};
   fail("UNSUPPORTED","Nome sconosciuto: "+next.v)
  }
  fail("UNSUPPORTED","Sintassi non riconosciuta")
 }
 function expr(min){let a=atom();while(true){if(peek().t==="%"&&min<=7){i++;a={t:"pct",v:a};continue}const op=peek().t,p=priority[op];if(p===undefined||p<min)break;i++;a={t:"bin",op,a,b:expr(p+(op==="^"?0:1))}}return a}
 const ast=expr(0);if(peek().t!=="eof")fail("UNSUPPORTED","Formula non completa");return ast
}
function position(ref){const m=/^([A-Z]{1,4})(\d+)$/.exec(ref);if(!m)fail("#REF!");let c=0;for(const ch of m[1])c=c*26+ch.charCodeAt(0)-64;return {r:Number(m[2])-1,c:c-1}}
function refAt(r,c){let a="";for(c++;c>0;c=Math.floor((c-1)/26))a=String.fromCharCode(65+(c-1)%26)+a;return a+(r+1)}
class Engine{
 constructor(book){this.book=book;this.map=new Map(book.SheetNames.map(s=>[s.toLowerCase(),s]));this.cache=new Map();this.ast=new Map();this.stats={calculated:0,saved:0,unsupported:0,errors:0}}
 sheet(name){const s=this.map.get(String(name).toLowerCase());return s||fail("#REF!","Foglio sconosciuto: "+name)}
 cell(sheet,ref,stack=new Set()){
  sheet=this.sheet(sheet);const key=sheet+"!"+ref.toUpperCase();if(this.cache.has(key))return this.cache.get(key);
  const c=this.book.Sheets[sheet]?.[ref.toUpperCase()];if(!c)return {value:"",state:"empty"};
  if(!c.f)return {value:c.v??"",state:"original"};
  if(stack.has(key))return {value:"#CIRC!",state:"error",detail:"Riferimento circolare"};
  stack.add(key);let result;
  try{
   let ast=this.ast.get(c.f);if(!ast){ast=parse(c.f);this.ast.set(c.f,ast)}
   const ctx={stack,mixed:false},value=this.eval(ast,sheet,ctx);
   result={value,state:ctx.mixed?"partial":"calculated"};this.stats.calculated++;
  }catch(e){
   const er=e instanceof FormulaError?e:new FormulaError("UNSUPPORTED",e.message);
   if((er.code==="UNSUPPORTED"||er.code==="#NAME?")&&c.v!==undefined&&c.v!==null&&c.v!==""){result={value:c.v,state:"saved",detail:er.message};this.stats.saved++}
   else{result={value:er.code==="UNSUPPORTED"?"Non disponibile":er.code,state:er.code==="UNSUPPORTED"?"unsupported":"error",detail:er.message};this.stats[result.state==="error"?"errors":"unsupported"]++}
  }finally{stack.delete(key)}
  this.cache.set(key,result);return result
 }
 value(sheet,ref,ctx){const r=this.cell(sheet,ref,ctx.stack);if(r.state==="error")fail(r.value,r.detail);if(r.state==="unsupported")fail("UNSUPPORTED",r.detail);if(r.state==="saved"||r.state==="partial")ctx.mixed=true;return r.value}
 eval(n,sheet,ctx){
  if(n.t==="lit")return n.v;
  if(n.t==="ref")return this.value(n.sheet||sheet,n.ref,ctx);
  if(n.t==="range"){
   const s=this.sheet(n.sheet||sheet),a=position(n.start),b=position(n.end),rows=Math.abs(b.r-a.r)+1,cols=Math.abs(b.c-a.c)+1;
   if(rows*cols>120000)fail("UNSUPPORTED","Intervallo troppo ampio");const result=[];
   for(let r=Math.min(a.r,b.r);r<=Math.max(a.r,b.r);r++){const row=[];for(let c=Math.min(a.c,b.c);c<=Math.max(a.c,b.c);c++)row.push(this.value(s,refAt(r,c),ctx));result.push(row)}
   return result
  }
  if(n.t==="un")return (n.op==="-"?-1:1)*num(this.eval(n.v,sheet,ctx));
  if(n.t==="pct")return num(this.eval(n.v,sheet,ctx))/100;
  if(n.t==="bin"){
   const a=this.eval(n.a,sheet,ctx),b=this.eval(n.b,sheet,ctx);
   switch(n.op){
    case "+":return num(a)+num(b);case "-":return num(a)-num(b);case "*":return num(a)*num(b);
    case "/":return num(b)===0?fail("#DIV/0!","Divisione per zero"):num(a)/num(b);
    case "^":return num(a)**num(b);case "&":return str(a)+str(b);
    case "=":return compare(a,b)===0;case "<>":return compare(a,b)!==0;
    case ">":return compare(a,b)>0;case "<":return compare(a,b)<0;
    case ">=":return compare(a,b)>=0;case "<=":return compare(a,b)<=0
   }
  }
  if(n.t==="fn")return this.fn(n,sheet,ctx);
  fail("UNSUPPORTED","Espressione non supportata")
 }
 fn(n,sheet,ctx){
  const {name,args}=n;
  const run=i=>this.eval(args[i],sheet,ctx);
  if(name==="IF"){const condition=bool(run(0));return condition?run(1):(args.length>2?run(2):false)}
  if(name==="IFERROR"||name==="IFNA"){try{return run(0)}catch(e){if(name==="IFNA"&&e.code!=="#N/A")throw e;return args.length>1?run(1):""}}
  if(name==="AND")return args.every((_,i)=>flat(run(i)).every(bool));
  if(name==="OR")return args.some((_,i)=>flat(run(i)).some(bool));
  const v=args.map((_,i)=>run(i)),f=flat(v),numbers=f.filter(x=>typeof x==="number"&&Number.isFinite(x));
  const x=i=>v[i],N=i=>num(x(i)),T=i=>str(x(i));
  const sum=(xs)=>xs.reduce((a,b)=>a+b,0);
  const testSum=(keys,criterion,amount)=>{
   const a=flat(keys),b=amount===undefined?a:flat(amount);if(a.length!==b.length)fail("#VALUE!");
   return sum(a.map((val,i)=>criteria(val,criterion)?num(b[i]):0))
  };
  switch(name){
   case "SUM":return sum(numbers);case "AVERAGE":return numbers.length?sum(numbers)/numbers.length:fail("#DIV/0!");
   case "MIN":return numbers.length?Math.min(...numbers):0;case "MAX":return numbers.length?Math.max(...numbers):0;
   case "COUNT":return numbers.length;case "COUNTA":return f.filter(y=>y!==""&&y!==null&&y!==undefined).length;
   case "COUNTBLANK":return f.filter(y=>y===""||y===null||y===undefined).length;
   case "COUNTIF":return flat(x(0)).filter(y=>criteria(y,x(1))).length;
   case "SUMIF":return testSum(x(0),x(1),x(2));
   case "COUNTIFS":case "SUMIFS":{
    const vals=name==="SUMIFS"?flat(x(0)):null,start=vals?1:0,pairs=[];
    for(let i=start;i<v.length;i+=2)pairs.push([flat(x(i)),x(i+1)]);
    if(!pairs.length||pairs.some(p=>p[0].length!==pairs[0][0].length)||(vals&&vals.length!==pairs[0][0].length))fail("#VALUE!");
    let out=0;for(let i=0;i<pairs[0][0].length;i++)if(pairs.every(p=>criteria(p[0][i],p[1])))out+=vals?num(vals[i]):1;return out
   }
   case "NOT":return !bool(x(0));
   case "ROUND":{const p=10**(N(1)||0);return Math.round((N(0)+Number.EPSILON)*p)/p}
   case "ROUNDUP":{const p=10**(N(1)||0);return Math.sign(N(0))*Math.ceil(Math.abs(N(0))*p)/p}
   case "ROUNDDOWN":{const p=10**(N(1)||0);return Math.trunc(N(0)*p)/p}
   case "ABS":return Math.abs(N(0));case "INT":return Math.floor(N(0));
   case "MOD":return N(1)===0?fail("#DIV/0!"):N(0)-N(1)*Math.floor(N(0)/N(1));
   case "POWER":return N(0)**N(1);case "SQRT":return N(0)<0?fail("#NUM!"):Math.sqrt(N(0));
   case "PRODUCT":return numbers.reduce((a,b)=>a*b,1);
   case "MEDIAN":{const a=numbers.sort((a,b)=>a-b),m=Math.floor(a.length/2);return !a.length?fail("#NUM!"):a.length%2?a[m]:(a[m-1]+a[m])/2}
   case "LEN":return T(0).length;case "UPPER":return T(0).toUpperCase();
   case "LOWER":return T(0).toLowerCase();case "TRIM":return T(0).trim().replace(/\s+/g," ");
   case "LEFT":return T(0).slice(0,Math.max(0,v.length>1?N(1):1));
   case "RIGHT":{const k=Math.max(0,v.length>1?N(1):1);return k?T(0).slice(-k):""}
   case "MID":return T(0).slice(Math.max(0,N(1)-1),Math.max(0,N(1)-1)+Math.max(0,N(2)));
   case "CONCAT":case "CONCATENATE":return f.map(str).join("");
   case "SUBSTITUTE":return T(0).split(T(1)).join(T(2));
   case "FIND":case "SEARCH":{const sensitive=name==="FIND",needle=sensitive?T(0):T(0).toLowerCase(),hay=sensitive?T(1):T(1).toLowerCase(),i=hay.indexOf(needle,Math.max(0,(v.length>2?N(2):1)-1));return i<0?fail("#VALUE!"):i+1}
   case "EXACT":return T(0)===T(1);
   case "VLOOKUP":{
    const tbl=x(1),needle=x(0),col=N(2)-1,exact=v.length>=4&&(x(3)===false||x(3)===0);
    if(!Array.isArray(tbl)||!Array.isArray(tbl[0])||col<0||col>=tbl[0].length)fail("#REF!");
    let found;for(const row of tbl){if(compare(row[0],needle)===0){found=row;break}if(!exact&&compare(row[0],needle)<=0)found=row}
    return found?found[col]:fail("#N/A","Valore non trovato")
   }
   case "INDEX":{const table=x(0),r=N(1)-1,c=(v.length>2?N(2):1)-1;return Array.isArray(table)&&table[r]&&c>=0&&c<table[r].length?table[r][c]:fail("#REF!")}
   case "MATCH":{const list=flat(x(1)),needle=x(0),exact=v.length>=3&&N(2)===0;let index=-1;list.forEach((y,i)=>{if(compare(y,needle)===0)index=i;else if(!exact&&compare(y,needle)<=0)index=i});return index<0?fail("#N/A"):index+1}
   case "XLOOKUP":{const keys=flat(x(1)),result=flat(x(2)),i=keys.findIndex(y=>compare(y,x(0))===0);return i<0?(v.length>3?x(3):fail("#N/A")):result[i]}
   case "TODAY":return Math.floor(Date.now()/86400000+25569);
   case "NOW":return Date.now()/86400000+25569;
   case "PI":return Math.PI;
   default:fail("UNSUPPORTED","Funzione non ancora implementata: "+name)
  }
 }
}
g.CercaXEngine={Engine,parse,FormulaError,norm};
if(typeof module!=="undefined"&&module.exports)module.exports=g.CercaXEngine
})(typeof window!=="undefined"?window:globalThis);
