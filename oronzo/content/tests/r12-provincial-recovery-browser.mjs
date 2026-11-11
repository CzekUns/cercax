import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let checks=0;
try {
 for(const [width,height] of [[640,360],[800,360],[844,390],[960,400]]) {
  for(const scenario of [
   {category:'draw_run',results:['draw','draw','draw'],result:'draw',choice:'attack',trustDelta:-1},
   {category:'recovery',results:['loss','loss','win'],result:'victory',choice:'credit',trustDelta:1},
   {category:'first_win',results:['win'],result:'victory',choice:'share',trustDelta:1}
  ]) {
   const context=await browser.newContext({viewport:{width,height}});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8123/oronzo/assets/ui/career-r03.html',{waitUntil:'networkidle'});
   await page.locator('[data-action="start"]').click();
   await page.locator('#qa-mode').check();
   await page.locator('[data-action="begin"]').click();
   await page.locator('[data-action="accept"]').click();
   await page.locator('[data-action="press"]').click();
   for(let i=0;i<6&&await page.evaluate(()=>window.OronzoR03.getScreen())!=='hub';i++)
    await page.locator('[data-action="answer"]').first().click();
   await page.waitForFunction(()=>window.OronzoR03.getScreen()==='hub');
   const initial=await page.evaluate(async({results,realResult})=>{
    const state=window.OronzoR03.getState();
    const club=state.clubs.find(c=>c.id===state.coach.clubId);
    club.boardTrust=70;club.finance.cash=100000;
    club.board.winStreak=0;club.board.lossStreak=0;
    club.board.results=results.map(result=>({result}));
    state.flow.r12Narrative.issues=[];
    const {recordCareerNarrativeR12}=await import('/oronzo/content/career-narrative-r12.js');
    const issue=recordCareerNarrativeR12(state,{realResult});
    return {category:issue.category,trust:club.boardTrust};
   },{results:scenario.results,realResult:scenario.result});
   assert.equal(initial.category,scenario.category);
   await page.locator('[data-action="section"][data-value="tifoseria"]').click();
   await page.locator('[data-action="support-tab"][data-value="giornali"]').click();
   assert.equal(await page.locator('[data-r12-issue]').count(),1);
   await page.locator('[data-action="narrative-choice"]').first().click();
   await page.waitForFunction(()=>!window.OronzoR03.hasUnsavedProgress(),{timeout:15000});
   const after=await page.evaluate(()=>{
    const state=window.OronzoR03.getState();
    const club=state.clubs.find(c=>c.id===state.coach.clubId);
    return {trust:club.boardTrust,selected:state.flow.r12Narrative.issues.at(-1).selected?.id};
   });
   assert.equal(after.selected,scenario.choice);
   assert.equal(after.trust,initial.trust+scenario.trustDelta);
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
   checks+=6;
   await context.close();
  }
 }
 console.log('PASS '+checks+' new provincial arcs Chromium UI/persistence checks');
} finally {await browser.close()}
