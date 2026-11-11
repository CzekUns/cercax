import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let checks=0;
try {
 for(const [width,height] of [[640,360],[800,360],[844,390],[960,400]]) {
  const context=await browser.newContext({viewport:{width,height}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8123/oronzo/assets/ui/career-r03.html',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>!!window.OronzoR03?.getState);
  await page.locator('[data-action="start"]').click();
  await page.locator('#qa-mode').check();
  await page.locator('[data-action="begin"]').click();
  await page.locator('[data-action="accept"]').click();
  await page.locator('[data-action="press"]').click();
  for(let i=0;i<6&&await page.evaluate(()=>window.OronzoR03.getScreen())!=='hub';i++)
   await page.locator('[data-action="answer"]').first().click();
  await page.waitForFunction(()=>window.OronzoR03.getScreen()==='hub');
  const initial=await page.evaluate(async()=>{
   const state=window.OronzoR03.getState();
   const club=state.clubs.find(c=>c.id===state.coach.clubId);
   club.boardTrust=70;club.finance.cash=100000;club.board.winStreak=3;
   // Isolate the current-week story from the already recorded appointment editorial.
   state.flow.r12Narrative.issues=[];
   const {recordCareerNarrativeR12}=await import('/oronzo/content/career-narrative-r12.js');
   const issue=recordCareerNarrativeR12(state);
   return {id:issue.id,category:issue.category,trust:club.boardTrust};
  });
  assert.equal(initial.category,'winning_run');
  await page.locator('[data-action="section"][data-value="tifoseria"]').click();
  await page.locator('[data-action="support-tab"][data-value="giornali"]').click();
  assert.equal(await page.locator('[data-r12-issue]').count(),1);
  assert.equal(await page.locator('[data-action="narrative-choice"]').count(),2);
  await page.locator('[data-action="narrative-choice"]').first().click();
  await page.waitForFunction(()=>!window.OronzoR03.hasUnsavedProgress(),{timeout:15000});
  const after=await page.evaluate(()=>{
   const state=window.OronzoR03.getState();
   const club=state.clubs.find(c=>c.id===state.coach.clubId);
   return {trust:club.boardTrust,selected:state.flow.r12Narrative.issues.at(-1).selected?.id};
  });
  assert.equal(after.trust,initial.trust+1);
  assert.equal(after.selected,'protect');
  assert.equal(await page.locator('[data-action="narrative-choice"]').count(),0);
  await page.reload({waitUntil:'networkidle'});
  await page.locator('[data-action="load"]').click();
  await page.waitForFunction(()=>window.OronzoR03.getState()!=null);
  const restored=await page.evaluate(()=>{
   const state=window.OronzoR03.getState();
   return {trust:state.clubs.find(c=>c.id===state.coach.clubId).boardTrust,
    selected:state.flow.r12Narrative.issues.at(-1).selected?.id};
  });
  assert.deepEqual(restored,after);
  assert.deepEqual(errors,[]);
  checks+=5;
  await context.close();
 }
 console.log('PASS '+checks+' provincial narrative Chromium UI/persistence checks');
} finally {await browser.close()}
