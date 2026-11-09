const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

function setup({enabled=true,allowed=true}={}){
 const callbacks={};
 const toggle={
  textContent:'',attributes:{},title:'',
  classList:{toggle(){}},
  setAttribute(k,v){this.attributes[k]=v;},
  addEventListener(k,fn){callbacks['toggle:'+k]=fn;}
 };
 const toast={textContent:'',hidden:true};
 const pageListeners={};
 const doc={
  fullscreenElement:null,fullscreenEnabled:enabled,
  getElementById(id){return id==='fullscreen-toggle'?toggle:id==='ui-toast'?toast:null;},
  addEventListener(k,fn){pageListeners[k]=fn;},
  documentElement:{requestFullscreen:async()=>{
   if(!allowed)throw new Error('blocked');
   doc.fullscreenElement=doc.documentElement;
   pageListeners.fullscreenchange?.();
  }},
  exitFullscreen:async()=>{doc.fullscreenElement=null;pageListeners.fullscreenchange?.();}
 };
 const win={addEventListener(){},setTimeout(){}};
 const js=fs.readFileSync(path.join(__dirname,'..','fullscreen-r03.js'),'utf8');
 vm.runInNewContext(js,{document:doc,window:win});
 return {toggle,toast,doc,callbacks,pageListeners};
}
test('native user click toggles fullscreen on and off, including accessible label',async()=>{
 const h=setup();
 const event={prevented:false,preventDefault(){this.prevented=true;}};
 assert.equal(h.toggle.attributes['aria-pressed'],'false');
 await h.callbacks['toggle:click'](event);
 assert.equal(event.prevented,true);
 assert.equal(h.toggle.attributes['aria-pressed'],'true');
 assert.equal(h.doc.fullscreenElement,h.doc.documentElement);
 await h.callbacks['toggle:click'](event);
 assert.equal(h.toggle.attributes['aria-pressed'],'false');
 assert.equal(h.doc.fullscreenElement,null);
});
test('browser denied request shows feedback and never claims fullscreen',async()=>{
 const h=setup({allowed:false});
 await h.callbacks['toggle:click']({preventDefault(){}});
 assert.equal(h.toggle.attributes['aria-pressed'],'false');
 assert.equal(h.toast.hidden,false);
 assert.match(h.toast.textContent,/non consentito/);
});
test('browser missing Fullscreen API gracefully leaves link active',async()=>{
 const h=setup({enabled:false});
 await h.callbacks['toggle:click']({preventDefault(){}});
 assert.equal(h.toggle.attributes['aria-pressed'],'false');
 assert.match(h.toast.textContent,/non consentito/);
});
test('external Escape/back fullscreen change resynchronizes UI',()=>{
 const h=setup();
 h.doc.fullscreenElement=h.doc.documentElement;
 h.pageListeners.fullscreenchange();
 assert.equal(h.toggle.attributes['aria-pressed'],'true');
 h.doc.fullscreenElement=null;
 h.pageListeners.fullscreenchange();
 assert.equal(h.toggle.attributes['aria-pressed'],'false');
});
