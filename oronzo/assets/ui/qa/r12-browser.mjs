// R12 HTTP Chromium, the actual career entrypoint and original PNG masks.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.ORONZO_URL||'http://127.0.0.1:8123/oronzo/assets/ui/career-r03.html';
const sizes=[[640,360],[800,360],[844,390],[960,400]];
await mkdir('r12-evidence',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[],errors=[];
async function scenario(w,h,seed){
 const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const page=await ctx.newPage();
 page.on('pageerror',e=>errors.push({viewport:w+'x'+h,seed,error:e.message}));
 const url=base+'?seed='+seed;
 const res=await page.goto(url,{waitUntil:'networkidle',timeout:60000});
 const check=(condition,label)=>{results.push({viewport:w+'x'+h,seed,label,pass:!!condition});if(!condition)throw Error(label+' @ '+w+'x'+h+' seed '+seed);};
 check(res?.status()===200,'HTTP 200');
 await page.waitForFunction(()=>window.OronzoR03?.getStage&&document.querySelector('#qa-mode'));
 await page.locator('[data-action="start"]').first().click();
 await page.locator('#qa-mode').check();
 await page.locator('[data-action="begin"]').first().click();
 await page.waitForFunction(()=>window.OronzoR03?.getScreen()==='offers');
 const s=await page.evaluate(()=>window.OronzoR03.getState());
 check(s.seed===seed,'seed query replay');
 check(s.flow.initialOffers.length===20,'exactly 20 offers');
 check(s.clubs.flatMap(c=>c.players).every(p=>p.visual?.hairStyleId&&p.origin?.regione),'visuals and sourced origins present');
 const codes=s.flow.initialOffers.map(o=>o.clubId).join('|');
 if(seed===1979){
  await page.screenshot({path:'r12-evidence/'+w+'x'+h+'-offers.png'});
  await page.locator('[data-action="accept"]').first().click();
  await page.waitForFunction(()=>window.OronzoR03?.getScreen()==='president');
  check((await page.locator('#ui-screen').innerText()).includes('EFFETTO PRESIDENZIALE'),'president buff visible');
  await page.screenshot({path:'r12-evidence/'+w+'x'+h+'-president.png'});
  for(let i=0;i<8&&(await page.evaluate(()=>window.OronzoR03.getScreen()))!=='hub';i++){
   const screen=await page.evaluate(()=>window.OronzoR03.getScreen());
   if(screen==='president')await page.locator('[data-action="press"]').first().click();
   else if(screen==='press')await page.locator('[data-action="answer"]').first().click();
   else throw Error('Unexpected opening stage '+screen);
  }
  check((await page.evaluate(()=>window.OronzoR03.getScreen()))==='hub','conferences to playable office');
  await page.locator('[data-action="section"][data-value="rosa"]').first().click();
  await page.locator('[data-action="player"]').first().click();
  check(await page.locator('#r11-player-art').count()===1,'player portrait canvas exists');
  await page.waitForTimeout(1000);
  await page.screenshot({path:'r12-evidence/'+w+'x'+h+'-roster.png'});
  check(await page.evaluate(()=>window.OronzoR03.getErrors().length)===0,'no recorded UI errors');
 }
 await ctx.close();
 return codes;
}
try{
 for(const [w,h]of sizes){
  const a=await scenario(w,h,1979);
  const b=await scenario(w,h,1980);
  const ok=a!==b;results.push({viewport:w+'x'+h,label:'two seeds yield different 20 offers',pass:ok});if(!ok)throw Error('Same offers for two seeds');
 }
}finally{
 await writeFile('r12-evidence/chromium-results.json',JSON.stringify({results,errors},null,2));
 await browser.close();
}
if(errors.length||results.some(x=>!x.pass))throw Error(JSON.stringify({errors,failed:results.filter(x=>!x.pass)}));
console.log(JSON.stringify({pass:results.length,viewports:sizes.length,errors:errors.length,source:'real HTTP Chromium'}));
