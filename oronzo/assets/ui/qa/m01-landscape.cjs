/** Agent11 M01: real HTTP, real storage, original assets. No request/storage stubs.
 * Run from repo root: NODE_PATH=<playwright modules> CHROMIUM=<binary>
 * node oronzo/assets/ui/qa/m01-landscape.cjs [before|after]
 * Run before BEFORE editing career-r03.css, then after with the same checkout.
 */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../../..'), phase=process.argv[2]||'after';
const out=path.join(__dirname,'m01');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('missing');}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
});
const geometry=el=>{const r=el.getBoundingClientRect();let l=Math.max(0,r.left),t=Math.max(0,r.top),rr=Math.min(innerWidth,r.right),bb=Math.min(innerHeight,r.bottom);
 for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),b=p.getBoundingClientRect();
  if(/hidden|clip|auto|scroll/.test(s.overflowX)){l=Math.max(l,b.left+p.clientLeft);rr=Math.min(rr,b.left+p.clientLeft+p.clientWidth);}
  if(/hidden|clip|auto|scroll/.test(s.overflowY)){t=Math.max(t,b.top+p.clientTop);bb=Math.min(bb,b.top+p.clientTop+p.clientHeight);}}
 const x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);
 return {x:r.x,y:r.y,width:r.width,height:r.height,visibleW:Math.max(0,rr-l),visibleH:Math.max(0,bb-t),cx:x,cy:y,hit:hit===el||el.contains(hit),font:getComputedStyle(el).fontSize};};
async function run(browser,url,w,h,touch){
 const id=`${w}x${h}-${touch?'touch':'mouse'}`,ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,hasTouch:touch,isMobile:touch,locale:'it-IT'});
 const p=await ctx.newPage(),errors=[],missing=[],targets=[],screens=[];
 p.on('pageerror',e=>errors.push(String(e)));p.on('response',r=>{if(r.status()>=400)missing.push({url:r.url(),status:r.status()});});
 async function open(){await p.goto(url);await p.waitForFunction(()=>!!window.OronzoR03);await p.waitForTimeout(100);}
 async function target(sel){const loc=p.locator(sel).last();assert.equal(await loc.count(),1,sel);const g=await loc.evaluate(geometry);targets.push({screen:await p.evaluate(()=>OronzoR03.getScreen()),sel,...g});
  if(phase==='after'){assert(g.visibleW>=43.99&&g.visibleH>=43.99,`${id} ${sel} clipped: ${JSON.stringify(g)}`);assert(g.hit,`${sel} occluded`);}return g;}
 async function tap(sel){const g=await target(sel);assert(g.hit,sel);await (touch?p.touchscreen.tap(g.cx,g.cy):p.mouse.click(g.cx,g.cy));}
 const act=a=>tap(`button[data-action="${a}"]`),section=v=>tap(`button[data-action="section"][data-value="${v}"]`);
 async function last(container,item,min=44){const loc=p.locator(container),box=await loc.boundingBox(),before=await loc.evaluate(e=>e.scrollTop);assert(box.height>=44);
  if(touch){const cdp=await ctx.newCDPSession(p);for(let i=0;i<35;i++){if(await loc.evaluate(e=>e.scrollTop>=e.scrollHeight-e.clientHeight-1))break;
   const x=box.x+box.width*.65,y=box.y+box.height*.85;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   for(let j=1;j<=6;j++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-box.height*.7*j/6}]});await p.waitForTimeout(10);}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(65);}await cdp.detach();
  }else{await p.mouse.move(box.x+box.width*.6,box.y+box.height*.6);for(let i=0;i<35;i++){if(await loc.evaluate(e=>e.scrollTop>=e.scrollHeight-e.clientHeight-1))break;await p.mouse.wheel(0,150);await p.waitForTimeout(40);}}
  const g=await p.locator(item).last().evaluate(geometry);assert(g.visibleH>=min-.01&&g.hit,`${id} last ${item}: ${JSON.stringify(g)}`);assert(await loc.evaluate(e=>e.scrollTop)>before);}
 async function audit(name,shot=false){
  const metrics=await p.evaluate(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};const stage=rect(document.querySelector('.stage')),canvas=document.querySelector('canvas');return {viewport:{width:innerWidth,height:innerHeight},stage,margins:{left:stage.x,right:innerWidth-stage.x-stage.width,top:stage.y,bottom:innerHeight-stage.y-stage.height},occupied:stage.width*stage.height/(innerWidth*innerHeight),canvas:canvas?rect(canvas):null,ratio:canvas?canvas.getBoundingClientRect().width/canvas.getBoundingClientRect().height:null};});
  if(phase==='after'){assert.equal(metrics.stage.width,w);assert.equal(metrics.stage.height,h);if(metrics.canvas)assert(Math.abs(metrics.ratio-16/9)<.002,`${id} canvas ${metrics.ratio}`);}
  assert(await p.locator('#qa-label').isVisible());
  const all=p.locator('button:enabled,nav a,select');for(let i=0;i<await all.count();i++){const l=all.nth(i),g=await l.evaluate(geometry);if(g.visibleH>=g.height-.01&&g.visibleW>=g.width-.01){if(phase==='after')assert(g.visibleH>=43.99&&g.visibleW>=43.99,`${id} ${name}: ${await l.innerText()} ${JSON.stringify(g)}`);}}
  const overlaps=await p.evaluate(()=>{const toast=document.querySelector('#ui-toast');if(toast.hidden)return [];const r=toast.getBoundingClientRect();return [...document.querySelectorAll('button,select,.demo-label,.brand,.runtime-stats,.top-info')].filter(e=>{const s=getComputedStyle(e),b=e.getBoundingClientRect();return s.display!=='none'&&Math.min(r.right,b.right)>Math.max(r.left,b.left)&&Math.min(r.bottom,b.bottom)>Math.max(r.top,b.top);}).map(e=>e.className);});assert.deepEqual(overlaps,[]);
  if(shot&&touch)await p.screenshot({path:path.join(out,`${phase}-${name}-${w}x${h}.png`)});screens.push({name,...metrics});
 }
 await open();await audit('entry');await act('start');assert.equal(await p.locator('.avatar-tile').count(),8);
 for(let i=0;i<8;i++)await tap(`[data-action="avatar"][data-value="${i}"]`);await tap('[data-action="avatar"][data-value="0"]');
 await target('#origin');await audit('avatar',true);await act('begin');assert.equal(await p.locator('.runtime-offer').count(),20);await audit('offers',true);
 await last('.runtime-list','.runtime-offer');await tap('.runtime-offer:last-child');await tap('.runtime-offer:first-child').catch(async()=>{await p.locator('.runtime-list').evaluate(e=>e.scrollTop=0);await tap('.runtime-offer:first-child');});
 await act('accept');await audit('president');await act('press');for(let i=0;i<5;i++){await audit(`press-${i+1}`,i===0);await act('answer');}
 assert.equal(await p.evaluate(()=>OronzoR03.getStage()),'hub');await act('save');await audit('office',true);
 for(const v of ['rosa','allenamento']){await section(v);assert.equal(await p.locator('.runtime-player-link').count(),16);await last('.runtime-roster-list','.runtime-player-link');await tap('.runtime-player-link:last-child');await audit(v+'-player');assert(await p.locator('.runtime-unavailable').last().isDisabled());await act('back-rosa');}
 await section('campionato');assert.equal(await p.locator('.runtime-table-row').count(),16);await last('.runtime-table','.runtime-table-row',32);await audit('standings',true);
 await act('formation');assert.equal(await p.locator('[data-player]:checked').count(),11);await target('#captain');await last('.runtime-roster','.runtime-player');await audit('formation');await act('prepare');await p.waitForFunction(()=>OronzoR03.isViewReady());
 assert.equal(await p.evaluate(()=>OronzoR03.getSnapshot().players.length),22);await audit('match',true);
 await act('camera-tv');await audit('match-toast');await act('speed');await act('pause');await p.waitForTimeout(300);await act('pause');
 await act('finish-qa');assert.equal(await p.evaluate(()=>OronzoR03.getStage()),'postmatch_press');for(let i=0;i<2;i++)await act('answer');await audit('post');await act('advance');assert.equal(await p.evaluate(()=>OronzoR03.getState().absoluteWeek),2);
 const previous=await p.evaluate(()=>OronzoR03.getState());await p.reload();await p.waitForFunction(()=>!!window.OronzoR03);await act('load');assert.deepEqual(await p.evaluate(()=>OronzoR03.getState()),previous);
 await p.evaluate(async()=>{const {applyCoachMoraleEvent}=await import('../../systems/coach-club/morale.js');const s=OronzoR03.getState(),r=applyCoachMoraleEvent(s.coach,{eventId:'m01-gameover',moraleDelta:-100});if(!r.accepted)throw Error(r.reason);s.coach=r.coach;});await act('home');await audit('gameover');const saved=await p.evaluate(()=>JSON.stringify(localStorage));await act('reset-career');await act('begin');assert.equal(await p.evaluate(()=>JSON.stringify(localStorage)),saved);await act('accept');assert.equal(await p.evaluate(()=>JSON.stringify(localStorage)),saved);
 let dialog=false;p.once('dialog',async d=>{dialog=true;await d.dismiss();});await act('save');assert(dialog);assert.equal(await p.evaluate(()=>JSON.stringify(localStorage)),saved);
 await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForFunction(()=>!!window.OronzoR03);await act('start');await p.locator('#qa-mode').uncheck();await act('begin');const before=await p.evaluate(()=>JSON.stringify(OronzoR03.getState()));await act('accept');assert.equal(await p.evaluate(()=>JSON.stringify(OronzoR03.getState())),before);assert.match(await p.locator('#ui-toast').innerText(),/geography_required/);await audit('geography-toast');
 await p.setViewportSize({width:h,height:w});assert(await p.locator('.rotate-r03').isVisible());await p.setViewportSize({width:w,height:h});await audit('orientation-return');
 assert.deepEqual(errors,[]);assert.deepEqual(missing.filter(x=>!x.url.endsWith('/assets/cutscenes/manifest.json')),[]);
 await ctx.close();return {id,status:'PASS',screens,targets,errors,missing};
}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/oronzo/assets/ui/career-r03.html`;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM,args:['--no-sandbox']});const result={phase,browser:browser.version(),transport:'HTTP (no routing)',results:[]};
 try{for(const [w,h]of [[640,360],[800,360],[844,390],[960,400]])for(const t of [false,true]){console.log('RUN',phase,w,h,t);result.results.push(await run(browser,url,w,h,t));console.log('PASS',w,h,t);}}
 finally{fs.writeFileSync(path.join(out,`${phase}-results.json`),JSON.stringify(result,null,2));await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
