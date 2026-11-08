/** Supplement M01: CDP display cutouts, toolbar resize, kit and legacy links. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../../..'),out=path.join(__dirname,'m01'),result={checks:[]};
const server=http.createServer((q,r)=>{const f=path.resolve(root,'.'+q.url.split('?')[0]);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)){r.writeHead(404);return r.end();}r.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png'})[path.extname(f)]||'text/plain');fs.createReadStream(f).pipe(r);});
const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;const browser=await chromium.launch({executablePath:process.env.CHROMIUM,args:['--no-sandbox']});
 try{const ctx=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true}),p=await ctx.newPage(),cdp=await ctx.newCDPSession(p);
 await p.goto(base+'/oronzo/assets/ui/career-r03.html');await p.waitForFunction(()=>!!window.OronzoR03);
 async function checkTargets(){return p.evaluate(()=>{const failures=[];for(const el of document.querySelectorAll('button:enabled,nav a,select')){
  // Data lists may deliberately have partial rows at their scroll boundary.
  if(el.closest('.runtime-scroll,.runtime-roster'))continue;
  const r=el.getBoundingClientRect();let l=Math.max(0,r.left),t=Math.max(0,r.top),rr=Math.min(innerWidth,r.right),b=Math.min(innerHeight,r.bottom);
  for(let a=el.parentElement;a;a=a.parentElement){const s=getComputedStyle(a),q=a.getBoundingClientRect();if(/hidden|clip|auto|scroll/.test(s.overflowX)){l=Math.max(l,q.left+a.clientLeft);rr=Math.min(rr,q.left+a.clientLeft+a.clientWidth);}if(/hidden|clip|auto|scroll/.test(s.overflowY)){t=Math.max(t,q.top+a.clientTop);b=Math.min(b,q.top+a.clientTop+a.clientHeight);}}
  const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);if(rr-l<43.99||b-t<43.99||!(el===hit||el.contains(hit)))failures.push({action:el.dataset.action,w:rr-l,h:b-t});}return failures;});}
 await cdp.send('Emulation.setSafeAreaInsetsOverride',{insets:{left:24,right:12,top:0,bottom:16}});
 let stage=await p.locator('.stage').evaluate(rect);assert.deepEqual(stage,{x:24,y:0,width:808,height:374});assert.deepEqual(await checkTargets(),[]);result.checks.push({name:'CDP synthetic cutout: left24/right12/bottom16',stage});
 await p.locator('[data-action="start"]').click();assert.deepEqual(await checkTargets(),[]);await p.locator('[data-action="begin"]').click();await p.locator('[data-action="accept"]').click();await p.locator('[data-action="press"]').click();for(let i=0;i<5;i++){assert.deepEqual(await checkTargets(),[]);await p.locator('[data-action="answer"]').first().click();}
 assert.deepEqual(await checkTargets(),[]);await p.locator('[data-action="formation"]').click();assert.deepEqual(await checkTargets(),[]);await p.locator('[data-action="prepare"]').click();await p.waitForFunction(()=>OronzoR03.isViewReady());assert.deepEqual(await checkTargets(),[]);
 const canvas=await p.locator('canvas').evaluate(rect);assert(Math.abs(canvas.width/canvas.height-16/9)<.002);result.checks.push({name:'safe-area match and fixed CTA clipping',canvas});
 await cdp.send('Emulation.setSafeAreaInsetsOverride',{insets:{left:0,right:0,top:0,bottom:0}});
 for(const [w,h] of [[844,360],[844,390],[960,400]]){await p.setViewportSize({width:w,height:h});stage=await p.locator('.stage').evaluate(rect);assert.equal(stage.width,w);assert.equal(stage.height,h);assert.deepEqual(await checkTargets(),[]);result.checks.push({name:'toolbar/viewport resize',stage});}
 await p.goto(base+'/oronzo/assets/ui/demo-v02.html');await p.waitForFunction(()=>!!window.oronzoUIDemo);stage=await p.locator('.stage').evaluate(rect);assert(Math.abs(stage.width/stage.height-16/9)<.002);result.checks.push({name:'R02 retains centered 16:9',stage});
 await p.goto(base+'/oronzo/index.html');const hrefs=await p.locator('a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));assert(hrefs.some(h=>h.includes('career-r03.html')));assert(hrefs.some(h=>h.includes('partita-rapida.html')));
 const res=await p.goto(base+'/oronzo/partita-rapida.html');assert.equal(res.status(),200);result.checks.push({name:'legacy links and quick-match HTTP200',hrefs});
 await ctx.close();result.status='PASS';console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();server.close();fs.writeFileSync(path.join(out,'environment-results.json'),JSON.stringify(result,null,2));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
