import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const url='http://127.0.0.1:8123/oronzo/assets/ui/career-r03.html';
let checks=0;
try {
 for(const [width,height] of [[640,360],[800,360],[844,390],[960,400]]) {
  const context=await browser.newContext({viewport:{width,height},acceptDownloads:true});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const check=(ok,msg)=>{if(!ok)throw Error(width+'x'+height+': '+msg);checks++};
  const response=await page.goto(url,{waitUntil:'networkidle'});
  check(response.status()===200,'HTTP');
  await page.waitForFunction(()=>!!window.OronzoR03?.getState);
  await page.locator('[data-action="start"]').click();
  await page.locator('#qa-mode').check();
  await page.locator('[data-action="begin"]').click();
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
  const before=await page.evaluate(()=>window.OronzoR03.getState().coach.relationships);
  const question=await page.locator('.runtime-question').textContent();
  check(question.trim().length>10,'postmatch question visible');
  await page.locator('[data-action="answer"]').first().click();
  const after=await page.evaluate(()=>window.OronzoR03.getState().coach.relationships);
  check(JSON.stringify(before)!==JSON.stringify(after),'answer changes relationships');
  await page.locator('[data-action="answer"]').first().click();
  await page.waitForFunction(()=>window.OronzoR03.getScreen()==='post');
  // PersistAction saves asynchronously; a page reload before IndexedDB settles races the write.
  await page.waitForFunction(()=>!window.OronzoR03.hasUnsavedProgress(),{timeout:15000});
  check(!await page.evaluate(()=>window.OronzoR03.getSaveError()),'no save error');
  const saved=await page.evaluate(()=>{
   const s=window.OronzoR03.getState();
   return {relations:JSON.stringify(s.coach.relationships),
    answers:JSON.stringify(s.flow.press.postmatch.answers),
    effects:JSON.stringify(s.flow.effectTransactions),
    fixture:s.flow.finalMatch?.fixtureId,
    result:s.flow.finalMatch?.result,
    revision:window.OronzoR03.getSaveRevision()};
  });
  // Independent IndexedDB read: verify what was really committed, not only a UI flag.
  const durable=await page.evaluate(async()=>{
   const {createDurableSaveManager}=await import('/oronzo/app/flow/durable-save.js');
   const m=createDurableSaveManager({indexedDB:window.indexedDB,legacyStorage:window.localStorage});
   const r=await m.load();
   return {sequence:r?.sequence,relations:JSON.stringify(r?.state?.coach?.relationships),
    answers:JSON.stringify(r?.state?.flow?.press?.postmatch?.answers),
    effects:JSON.stringify(r?.state?.flow?.effectTransactions)};
  });
  check(durable.sequence>=1,'IndexedDB transaction committed');
  check(durable.relations===saved.relations,'IndexedDB lost press relation delta; '+JSON.stringify({saved,durable}));
  check(durable.answers===saved.answers,'IndexedDB lost conference answers');
  check(durable.effects===saved.effects,'IndexedDB lost event ledger');
  console.log('SAVE_AUDIT '+JSON.stringify({viewport:width+'x'+height,
   fixture:saved.fixture,outcome:saved.result,revision:saved.revision,
   committedSequence:durable.sequence,relationships:JSON.parse(saved.relations),
   transactionIds:Object.keys(JSON.parse(saved.effects))}));
  await page.reload({waitUntil:'networkidle'});
  await page.locator('[data-action="load"]').click();
  await page.waitForFunction(()=>window.OronzoR03.getState()!=null);
  const loaded=await page.evaluate(()=>{
   const s=window.OronzoR03.getState();
   return {relations:JSON.stringify(s.coach.relationships),
    answers:JSON.stringify(s.flow.press.postmatch.answers),
    effects:JSON.stringify(s.flow.effectTransactions)};
  });
  check(loaded.relations===saved.relations,'press effects persist; before='+saved.relations+' after='+loaded.relations);
  check(loaded.answers===saved.answers,'conference answers persist');
  check(loaded.effects===saved.effects,'press event ledger survives reload');
  check(errors.length===0,'browser errors '+errors.join('; '));
  await context.close();
 }
 console.log('PASS '+checks+' Chromium HTTP checks');
} finally {await browser.close();}
