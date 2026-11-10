/** Real UI and IndexedDB combined gate for #70 + #72. Requires R12 ?seed override. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:8123/oronzo/assets/ui/career-r03.html';
const outcomes=new Set(['win','draw','loss']);
let checks=0;
const check=(value,message)=>{assert.ok(value,message);checks++;};
try {
 for(const [width,height] of [[640,360],[800,360],[844,390],[960,400]]) {
  const seen=new Set();
  for(let seed=1979;seed<2039&&seen.size<3;seed++) {
   const context=await browser.newContext({viewport:{width,height},acceptDownloads:true});
   try {
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const http=await page.goto(base+'?seed='+seed,{waitUntil:'networkidle'});
    check(http.status()===200,'career HTTP '+width);
    await page.waitForFunction(()=>!!window.OronzoR03?.getState);
    await page.locator('[data-action="start"]').click();
    await page.locator('#qa-mode').check();
    await page.locator('[data-action="begin"]').click();
    check(await page.evaluate(()=>window.OronzoR03.getState()?.seed)===seed,'seed override '+seed);
    await page.locator('[data-action="accept"]').click();
    await page.locator('[data-action="press"]').click();
    for(let i=0;i<6&&await page.evaluate(()=>window.OronzoR03.getScreen())!=='hub';i++)
     await page.locator('[data-action="answer"]').first().click();
    await page.waitForFunction(()=>window.OronzoR03.getScreen()==='hub');
    await page.locator('[data-action="formation"]').click();
    await page.locator('[data-action="prepare"]').click();
    await page.waitForFunction(()=>window.OronzoR03.getScreen()==='match');
    await page.evaluate(()=>window.OronzoR03.completeQaMatch());
    await page.waitForFunction(()=>window.OronzoR03.getScreen()==='press',{timeout:15000});
    const match=await page.evaluate(()=>{
     const s=window.OronzoR03.getState();
     return {result:s.flow.finalMatch?.result,
      questions:s.flow.press.postmatch?.questions?.map(q=>({id:q.id,text:q.text}))};
    });
    check(outcomes.has(match.result),'recognized match result '+JSON.stringify(match));
    if(seen.has(match.result))continue;
    seen.add(match.result);
    check(match.questions?.length===2,'two contextual questions');
    const catalog=await page.evaluate(async()=>await (await fetch('../../content/press-postmatch.json')).json());
    for(const q of match.questions){
     const item=catalog.questions.find(entry=>entry.id===q.id);
     check(!!item,'catalog question '+q.id);
     check(!item.when?.result||item.when.result===match.result,
      'question '+q.id+' mismatches '+match.result);
    }
    await page.locator('[data-action="answer"]').first().click();
    await page.locator('[data-action="answer"]').first().click();
    await page.waitForFunction(()=>window.OronzoR03.getScreen()==='post');
    await page.waitForFunction(()=>!window.OronzoR03.hasUnsavedProgress(),{timeout:20000});
    const before=await page.evaluate(()=>{
     const s=window.OronzoR03.getState();
     return {relations:JSON.stringify(s.coach.relationships),
      answers:JSON.stringify(s.flow.press.postmatch.answers),
      transactions:JSON.stringify(s.flow.effectTransactions),
      revision:window.OronzoR03.getSaveRevision()};
    });
    const disk=await page.evaluate(async()=>{
     const {createDurableSaveManager}=await import('/oronzo/app/flow/durable-save.js');
     const manager=createDurableSaveManager({indexedDB:window.indexedDB,legacyStorage:window.localStorage});
     const loaded=await manager.load();
     return {sequence:loaded.sequence,
      relations:JSON.stringify(loaded.state.coach.relationships),
      answers:JSON.stringify(loaded.state.flow.press.postmatch.answers),
      transactions:JSON.stringify(loaded.state.flow.effectTransactions)};
    });
    check(disk.sequence>=1,'IndexedDB sequence');
    check(disk.relations===before.relations,'actual IndexedDB relationship');
    check(disk.answers===before.answers,'actual IndexedDB answers');
    check(disk.transactions===before.transactions,'actual IndexedDB idempotency ledger');
    await page.reload({waitUntil:'networkidle'});
    await page.locator('[data-action="load"]').click();
    await page.waitForFunction(()=>window.OronzoR03.getState()!=null);
    const after=await page.evaluate(()=>{
     const s=window.OronzoR03.getState();
     return {relations:JSON.stringify(s.coach.relationships),
      answers:JSON.stringify(s.flow.press.postmatch.answers),
      transactions:JSON.stringify(s.flow.effectTransactions)};
    });
    check(after.relations===before.relations,'reload retains relationships');
    check(after.answers===before.answers,'reload retains answers');
    check(after.transactions===before.transactions,'reload retains transactions');
    await page.locator('[data-action="next"]').click();
    await page.waitForFunction(()=>window.OronzoR03.getScreen()==='hub');
    await page.locator('[data-action="section"][data-value="tifoseria"]').click();
    await page.locator('[data-action="support-tab"][data-value="giornali"]').click();
    const news=await page.locator('.r11-news-view').textContent();
    for(const q of match.questions)check(news.includes(q.text),'journal missing answered question '+q.id);
    check(!errors.length,'browser JS errors '+JSON.stringify(errors));
    console.log('COMBINED_OUTCOME_PASS '+JSON.stringify({
     viewport:width+'x'+height,seed,outcome:match.result,sequence:disk.sequence,
     revision:before.revision,transactionIds:Object.keys(JSON.parse(before.transactions))}));
   } finally {await context.close();}
  }
  check(seen.size===3,'did not observe win/draw/loss at '+width+'x'+height+
   ': '+JSON.stringify([...seen]));
 }
 console.log('PASS '+checks+' combined R12 Chromium checks (12 live outcome+save+GIORNALI paths)');
} finally {await browser.close();}
