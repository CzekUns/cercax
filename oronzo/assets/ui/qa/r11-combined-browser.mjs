// ORONZO R11 combined Chrome HTTP integration — real browser, no mocked game state.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.ORONZO_URL||'http://127.0.0.1:8123/oronzo/assets/ui/career-r03.html';
const dir=process.env.ORONZO_SCREENSHOTS||'r11-screenshots';
await mkdir(dir,{recursive:true});
const sizes=[{w:640,h:360},{w:800,h:360},{w:844,h:390},{w:960,h:400}];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];
async function run(spec,index){
 const context=await browser.newContext({viewport:{width:spec.w,height:spec.h},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const file=name=>dir+'/'+spec.w+'x'+spec.h+'-'+name+'.png';
 const screenshot=async name=>await page.screenshot({path:file(name)});
 const act=label=>page.locator('[data-action="'+label+'"]').first();
 const screen=()=>page.evaluate(()=>window.OronzoR03?.getScreen());
 const state=()=>page.evaluate(()=>window.OronzoR03?.getState());
 const check=(ok,label)=>{results.push({viewport:spec.w+'x'+spec.h,label,pass:!!ok});if(!ok)throw Error('CHECK FAILED '+label)};
 try{
  const response=await page.goto(base,{waitUntil:'networkidle',timeout:60000});
  check(response.status()===200,'HTTP entry 200');
  await page.waitForFunction(()=>Boolean(window.OronzoR03?.getStage));
  check(await act('start').isVisible(),'start visible');
  check(await act('load').isVisible(),'load visible');
  await screenshot('entry');
  await act('start').click();
  await page.locator('#qa-mode').check();
  await act('begin').click();
  check((await screen())==='offers','20 offers');
  check((await page.locator('[data-action="offer"]').count())===20,'20 offer items');
  await act('accept').click();
  for(let i=0;i<6&&(await screen())!=='hub';i++){
   if((await screen())==='president'){await act('press').click();continue}
   if((await screen())==='press'){await act('answer').click();continue}
   throw Error('unexpected opening stage: '+await screen());
  }
  check((await screen())==='hub','offer to office');
  await screenshot('office');
  await page.locator('[data-action="section"][data-value="allenamento"]').click();
  await page.locator('[data-action="training-plan"][data-value="rest"]').click();
  await page.locator('#r11-training-intensity').evaluate(el=>{
   el.value='73';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await act('training-apply').click();
  await page.waitForFunction(()=>window.OronzoR03?.getState()?.flow?.m1?.training?.selected?.intensity===73);
  const selected=(await state()).flow.m1.training.selected;
  check(selected.plan==='rest'&&selected.intensity===73,'rest 73 persisted ledger');
  await screenshot('training-selected');
  await page.reload({waitUntil:'networkidle'});
  await act('load').click();
  await page.waitForFunction(()=>window.OronzoR03?.getScreen()==='hub');
  await page.locator('[data-action="section"][data-value="allenamento"]').click();
  check(await page.locator('[data-action="training-plan"][data-value="rest"]').getAttribute('aria-pressed')==='true','rest73 restored pressed');
  check((await page.locator('#r11-training-intensity').inputValue())==='73','rest73 restored slider');
  check((await page.locator('#r11-intensity-value').innerText())==='73','rest73 restored output');
  await screenshot('training-reloaded');
  await act('hub').click();
  await page.locator('[data-action="section"][data-value="tifoseria"]').click();
  check(await page.locator('[data-action="support-tab"]').count()===3,'three supporters sections');
  await screenshot('stadium');
  if(index===0){
   const inp=page.locator('#r11-ticket-price');
   check(await inp.count()===1,'real ticket input');
   await inp.fill('2000');await act('ticket-change').click();
   const ticketState=await state();
   check(ticketState.clubs.find(c=>c.id===ticketState.coach.clubId).stadium.ticketPriceITL===2000,'stadium real ticket changed');
   await page.locator('[data-action="support-tab"][data-value="giornali"]').click();
   await screenshot('newspaper');
   await act('hub').click();
   await page.locator('[data-action="section"][data-value="presidente"]').click();
   await screenshot('president');
   await page.locator('[data-action="pres-tab"][data-value="mercato"]').click();
   await screenshot('market');
   await act('hub').click();
   await page.locator('[data-action="section"][data-value="campionato"]').click();
   await page.locator('[data-action="league-tab"][data-value="calendario"]').click();
   await screenshot('calendar');
   await act('hub').click();
   await act('formation').click();
   await screenshot('formation');
   await act('prepare').click();
   check((await screen())==='match','real engine match');
   await screenshot('match-full');
   await act('camera-tv').click();
   check((await page.locator('[data-action="camera-tv"]').getAttribute('aria-pressed'))==='true','TV camera active');
   await screenshot('match-tv');
   await act('match-tools').click();
   await screenshot('match-controls');
   await act('match-tactic').click();
   await act('match-shout').click();
   await act('match-tools').click();
   await act('finish-qa').click();
   await page.waitForFunction(()=>window.OronzoR03?.getScreen()==='press',{timeout:60000});
   for(let j=0;j<3&&(await screen())==='press';j++)await act('answer').click();
   check((await screen())==='post','real match post-conference');
   await act('advance').click();
   check((await state()).absoluteWeek===2,'real week advance');
  }
  const touch=await page.locator('button:visible').evaluateAll(nodes=>nodes.map(e=>{
   const b=e.getBoundingClientRect();return {action:e.dataset.action||'button',width:b.width,height:b.height};
  }));
  check(!touch.some(t=>t.height<43.5||t.width<40),'touch targets >=44px height and >=40px width');
  check(errors.length===0,'no JS page errors');
 }catch(e){results.push({viewport:spec.w+'x'+spec.h,label:'uncaught',pass:false,error:String(e),pageErrors:errors});
  await screenshot('failure').catch(()=>{});
 }finally{await context.close();}
}
for(let i=0;i<sizes.length;i++)await run(sizes[i],i);
await browser.close();
await writeFile(dir+'/results.json',JSON.stringify(results,null,2));
console.log(JSON.stringify({passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,results},null,2));
if(results.some(x=>!x.pass))process.exitCode=1;
