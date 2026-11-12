// R13-TER browser QA: actual ORONZO career via HTTP, not an isolated portrait demo.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const base=process.env.ORONZO_URL||'http://127.0.0.1:8123/oronzo/assets/ui/career-r03.html';
const gallery='http://127.0.0.1:8123/oronzo/assets/players/r13/qa-r13ter.html';
const viewports=[[640,360],[800,360],[844,390],[960,400]];
const evidence='r13ter-evidence';
await mkdir(evidence,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const summary=[];
function check(condition,label,size){
 summary.push({viewport:size,label,pass:Boolean(condition)});
 if(!condition)throw new Error('R13TER_QA_FAIL '+label+' @ '+size);
}
async function reachPlayer(page,size){
 await page.locator('[data-action="start"]').first().click();
 await page.locator('#qa-mode').waitFor();
 await page.locator('#qa-mode').check();
 await page.locator('[data-action="begin"]').first().click();
 await page.waitForFunction(()=>window.OronzoR03?.getScreen()==='offers');
 await page.locator('[data-action="accept"]').first().click();
 await page.waitForFunction(()=>window.OronzoR03?.getScreen()==='president');
 for(let i=0;i<10;i++){
  const screen=await page.evaluate(()=>window.OronzoR03.getScreen());
  if(screen==='hub')break;
  if(screen==='president')await page.locator('[data-action="press"]').first().click();
  else if(screen==='press')await page.locator('[data-action="answer"]').first().click();
  else throw Error('R13TER unexpected screen '+screen+' @ '+size);
 }
 await page.waitForFunction(()=>window.OronzoR03.getScreen()==='hub');
 await page.locator('[data-action="section"][data-value="rosa"]').first().click();
 await page.locator('[data-action="player"]').first().click();
 await page.locator('#r11-player-art').waitFor();
 await page.waitForFunction(()=>document.querySelector('#r11-player-art')?.dataset.r13Raster==='loaded',{timeout:30000});
}
try{
 for(const [width,height] of viewports){
  const size=width+'x'+height;
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const page=await ctx.newPage(),errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().includes('/players/r13/')&&r.status()>=400)missing.push(r.url()+' '+r.status())});
  const response=await page.goto(base+'?seed=1979',{waitUntil:'networkidle',timeout:60000});
  check(response?.status()===200,'HTTP career entry 200',size);
  await page.waitForFunction(()=>Boolean(window.OronzoR03?.getScreen));
  await reachPlayer(page,size);
  const metric=await page.locator('#r11-player-art').evaluate(c=>{
   const rect=c.getBoundingClientRect(),pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
   let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0)visible++;
   return {width:c.width,height:c.height,displayWidth:rect.width,displayHeight:rect.height,visible,
    status:c.dataset.r13Raster,screenWidth:document.documentElement.scrollWidth};
  });
  check(metric.width===128&&metric.height===160,'canonical PNG canvas 128x160',size);
  check(metric.visible>1800,'real painted pixels are visible',size);
  check(Math.abs(metric.displayWidth/metric.displayHeight-.8)<.045,'portrait aspect ratio 4/5',size);
  check(metric.screenWidth<=width+4,'no horizontal page overflow',size);
  await page.screenshot({path:evidence+'/player-'+size+'.png'});
  // Switching players must update the existing card rather than leaking a stale async image.
  await page.locator('[data-action="back-rosa"]').first().click();
  await page.locator('[data-action="player"]').nth(1).click();
  await page.waitForFunction(()=>document.querySelector('#r11-player-art')?.dataset.r13Raster==='loaded',{timeout:30000});
  check(await page.locator('#r11-player-art').count()===1,'one card after switching player',size);
  check(errors.length===0,'no JavaScript page errors',size);
  check(missing.length===0,'no missing raster URLs',size);
  if(width===844){
   const before=await page.evaluate(()=>window.OronzoR03.getState().clubs
    .flatMap(c=>c.players).filter(p=>p.visual).map(p=>[p.id,p.visual]).slice(0,5));
   const saveDispatched=await page.evaluate(()=>{
    // The obsolete bottom nav is intentionally hidden in the latest UI.
    // Invoke the real delegated save action without pretending this is a visible-button QA.
    const button=document.querySelector('[data-action="save"]');
    button?.click();return Boolean(button);
   });
   check(saveDispatched,'real app save handler invoked',size);
   await page.reload({waitUntil:'networkidle'});
   await page.locator('[data-action="load"]').first().click();
   await page.waitForFunction(()=>window.OronzoR03?.getState()?.clubs?.length>0);
   const after=await page.evaluate(()=>window.OronzoR03.getState().clubs
    .flatMap(c=>c.players).filter(p=>p.visual).map(p=>[p.id,p.visual]).slice(0,5));
   check(JSON.stringify(before)===JSON.stringify(after),'R12 DNA survives save/reload',size);
  }
  await ctx.close();
 }
 const demo=await browser.newPage({viewport:{width:1200,height:850}});
 const gr=await demo.goto(gallery,{waitUntil:'networkidle',timeout:60000});
 check(gr?.status()===200,'real HTTP gallery entry 200','gallery');
 const qa=await demo.evaluate(()=>window.__r13terQA);
 check(qa?.total===54&&qa?.failed===0,'A-E gallery 54/54 actual PNG composites','gallery');
 await demo.screenshot({path:evidence+'/tavole-A-E.png',fullPage:true});
 await demo.close();
}finally{
 await writeFile(evidence+'/report.json',JSON.stringify(summary,null,2));
 await browser.close();
}
if(summary.some(x=>!x.pass))throw Error('R13TER_QA_FAILED');
console.log('R13TER_REAL_HTTP_PASS',summary.length,'checks over',viewports.length,'landscape viewports');
