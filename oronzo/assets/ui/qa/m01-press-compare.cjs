// Real HTTP comparison of the published PR CSS against the press-only fix.
// Setup clicks may auto-scroll lists; measured finish CTA uses only coordinates.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../../../..'),out=path.join(__dirname,'m01-press-r09b');
const prior=fs.readFileSync(path.join(out,'pre-press-fix-career.css'));
const server=http.createServer((req,res)=>{
 const [version,...parts]=decodeURIComponent(req.url.split('?')[0]).slice(1).split('/'),rel=parts.join('/'),file=path.resolve(root,rel);
 if(!file.startsWith(root+'/')||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png'})[path.extname(file)]||'application/octet-stream');
 res.setHeader('Cache-Control','no-store');res.end(version==='before'&&rel==='oronzo/assets/ui/career-r03.css'?prior:fs.readFileSync(file));
});
function metric(e){
 const q=e.getBoundingClientRect(),r={x:q.x,y:q.y,w:q.width,h:q.height};let t=Math.max(0,q.top),b=Math.min(innerHeight,q.bottom),l=Math.max(0,q.left),right=Math.min(innerWidth,q.right);const chain=[];
 for(let p=e.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),a=p.getBoundingClientRect();if(/auto|scroll|hidden|clip/.test(s.overflowY)){t=Math.max(t,a.top+p.clientTop);b=Math.min(b,a.top+p.clientTop+p.clientHeight);}if(/auto|scroll|hidden|clip/.test(s.overflowX)){l=Math.max(l,a.left+p.clientLeft);right=Math.min(right,a.left+p.clientLeft+p.clientWidth);}chain.push({id:p.id,classes:p.className,overflowX:s.overflowX,overflowY:s.overflowY,rect:{x:a.x,y:a.y,w:a.width,h:a.height}});}
 const x=q.x+q.width/2,y=q.y+q.height/2,z=document.elementFromPoint(x,y),s=getComputedStyle(e);
 return {rect:r,visible:{w:Math.max(0,right-l),h:Math.max(0,b-t)},hit:z===e||e.contains(z),x,y,font:s.font,lineHeight:s.lineHeight,chain};
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:process.env.CHROMIUM,args:['--no-sandbox']});const rows=[];
 try{for(const [w,h]of [[640,360],[800,360],[844,390],[960,400]])for(const safe of [false,true])for(const touch of [false,true]){
  const pair=[];for(const version of ['before','after']){
   const c=await browser.newContext({viewport:{width:w,height:h},isMobile:touch,hasTouch:touch,locale:'it-IT',deviceScaleFactor:1}),p=await c.newPage(),cdp=await c.newCDPSession(p);
   await cdp.send('Emulation.setSafeAreaInsetsOverride',{insets:safe?{top:0,left:24,right:12,bottom:16}:{top:0,left:0,right:0,bottom:0}});
   await p.goto(`http://127.0.0.1:${server.address().port}/${version}/oronzo/assets/ui/career-r03.html`);await p.waitForFunction(()=>!!window.OronzoR03);await p.waitForTimeout(90);
   const act=async a=>p.locator(`[data-action="${a}"]`).first().click();
   await act('start');await p.locator('[data-action="avatar"][data-value="1"]').click();await act('begin');await p.locator('.runtime-offer').last().click();await act('accept');await act('press');const fonts=[];
   for(let i=0;i<5;i++){
    fonts.push(await p.locator('.runtime-question,.runtime-answers .ui-btn,.runtime-foot').evaluateAll(es=>es.map(e=>({text:e.textContent,font:getComputedStyle(e).font,lineHeight:getComputedStyle(e).lineHeight}))));
    await act('answer');
   }
   await act('formation');await act('prepare');await p.waitForFunction(()=>OronzoR03.isViewReady());
   const finish=await p.locator('[data-action="finish-qa"]').evaluate(metric),stage=await p.locator('.stage').boundingBox(),canvas=await p.locator('canvas').boundingBox();
   assert(finish.visible.h>=43.99&&finish.visible.w>=43.99&&finish.hit);
   await(touch?p.touchscreen.tap(finish.x,finish.y):p.mouse.click(finish.x,finish.y));assert.equal(await p.evaluate(()=>OronzoR03.getStage()),'postmatch_press');
   pair.push({version,w,h,safe,touch,finish,stage,canvas,fonts,finishApplied:true});await c.close();
  }
  assert.deepEqual(pair[0].fonts,pair[1].fonts);assert.deepEqual(pair[0].stage,pair[1].stage);assert.deepEqual(pair[0].canvas,pair[1].canvas);assert.equal(pair[0].finish.rect.h,pair[1].finish.rect.h);assert.equal(pair[0].finish.visible.h,pair[1].finish.visible.h);
  rows.push({w,h,safe,touch,before:pair[0],after:pair[1],status:'PASS'});fs.writeFileSync(path.join(out,'comparison-results.json'),JSON.stringify({browser:browser.version(),rows}));console.log('PASS',w,h,safe,touch);
 }
 }finally{fs.writeFileSync(path.join(out,'comparison-results.json'),JSON.stringify({browser:browser.version(),rows}));await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
