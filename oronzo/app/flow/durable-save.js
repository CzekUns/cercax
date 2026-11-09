/** ORONZO 07B · durable dual-slot IndexedDB saves.
 * No destructive migration: legacy localStorage A/B remain untouched.
 * Browser IndexedDB transactions carry full checksummed SAVE_VERSION=2 envelopes.
 */
import {serialize,deserialize,createSaveManager} from '../../systems/career/save.js';

export const DURABLE_DB='oronzo-career-r11';
export const DURABLE_STORE='snapshots';
const clone=x=>JSON.parse(JSON.stringify(x));
function transaction(db,mode,operation){
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(DURABLE_STORE,mode),store=tx.objectStore(DURABLE_STORE);
  let result;
  tx.oncomplete=()=>resolve(result);
  tx.onabort=()=>reject(tx.error||new Error('durable_save_aborted'));
  tx.onerror=()=>{}; // tx.onabort reports the transaction error once.
  try {
   const request=operation(store);
   if(request){request.onsuccess=()=>{result=request.result};}
  }catch(error){try{tx.abort()}catch{}reject(error);}
 });
}
function openDB(indexedDB){
 return new Promise((resolve,reject)=>{
  if(!indexedDB?.open){reject(new Error('indexeddb_unavailable'));return;}
  let req;
  try{req=indexedDB.open(DURABLE_DB,1)}catch(e){reject(e);return;}
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(DURABLE_STORE))db.createObjectStore(DURABLE_STORE);};
  req.onerror=()=>reject(req.error||new Error('indexeddb_open_failed'));
  req.onsuccess=()=>resolve(req.result);
 });
}
const verified=row=>{
 if(!row||typeof row!=='object'||typeof row.blob!=='string')return null;
 try{
  const envelope=JSON.parse(row.blob);
  if(!Number.isSafeInteger(envelope.sequence)||envelope.sequence<1)return null;
  const state=deserialize(row.blob);
  return {state,sequence:envelope.sequence};
 }catch{return null;}
};
export function createDurableSaveManager({indexedDB=globalThis.indexedDB,legacyStorage=null,key='oronzo.career.flow.r03'}={}){
 let pending=Promise.resolve();
 const withDB=async callback=>{
  const db=await openDB(indexedDB);
  try{return await callback(db)}finally{db.close()}
 };
 const inspect=async db=>{
  const [a,b,active]=await Promise.all([
   transaction(db,'readonly',s=>s.get('A')),
   transaction(db,'readonly',s=>s.get('B')),
   transaction(db,'readonly',s=>s.get('active'))
  ]);
  return {A:verified(a),B:verified(b),active:active==='A'||active==='B'?active:null};
 };
 const doSave=async snapshot=>withDB(async db=>{
  const current=await inspect(db);
  const latest=Math.max(0,current.A?.sequence??0,current.B?.sequence??0);
  // Alternation never overwrites the only good copy. If one slot is invalid,
  // use that slot first rather than risk the working backup.
  const target=!current.A?'A':!current.B?'B':
   current.active==='A'?'B':current.active==='B'?'A':
   current.A.sequence<=current.B.sequence?'A':'B';
  const blob=serialize(snapshot,{sequence:latest+1});
  await transaction(db,'readwrite',s=>s.put({blob},target));
  const proof=verified(await transaction(db,'readonly',s=>s.get(target)));
  if(!proof||proof.sequence!==latest+1)throw new Error('durable_save_verify_failed');
  // Point to the new copy only after a separate checked readback has passed.
  await transaction(db,'readwrite',s=>s.put(target,'active'));
  return {sequence:latest+1,slot:target,provider:'indexeddb',verified:true};
 });
 return {
  /** Overlapping clicks enqueue isolated immutable snapshots in order. */
  save(state){
   if(['pre_match','match_live'].includes(state?.flow?.stage))
    return Promise.reject(new Error('MID_MATCH_SAVE_UNSUPPORTED'));
   // Snapshot before the asynchronous transaction to prevent later mutation changing the write.
   let snapshot;
   try{snapshot=clone(state);}catch(e){return Promise.reject(e);}
   const next=pending.catch(()=>{}).then(()=>doSave(snapshot));
   pending=next;
   return next;
  },
  async load(){
   await pending.catch(()=>{});
   let primary=null,error=null;
   try {
    primary=await withDB(async db=>{
     const records=await inspect(db);
     const valid=['A','B'].filter(k=>records[k]);
     if(!valid.length)return null;
     const chosen=records.active&&records[records.active]?records.active:
       valid.sort((x,y)=>records[y].sequence-records[x].sequence)[0];
     return {state:records[chosen].state,sequence:records[chosen].sequence,
       recovered:chosen!==records.active,legacy:false,provider:'indexeddb'};
    });
   }catch(e){error=e;}
   if(primary)return primary;
   // Read-only fallback. Do not auto-delete or overwrite old :A/:B/:active.
   if(legacyStorage){
    const first=createSaveManager(legacyStorage,key).load();
    if(first)return {...first,legacy:false,provider:'localstorage_legacy'};
    const old=createSaveManager(legacyStorage,'oronzo.career.v2').load();
    if(old)return {...old,legacy:true,provider:'localstorage_1985'};
   }
   if(error)throw error;
   return null;
  },
  export(state){return serialize(state);},
  import(json){return deserialize(json);},
  async inspect(){
   return withDB(async db=>{
    const a=await inspect(db);
    return {A:a.A?{sequence:a.A.sequence,valid:true}:null,
     B:a.B?{sequence:a.B.sequence,valid:true}:null,active:a.active};
   });
  }
 };
}
