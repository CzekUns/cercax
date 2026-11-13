// HTTP Chromium regression: imported careers must resume the same screen as durable load.
// Uses the actual controller serializer and UI file input; no mocked UI renderer.
import {chromium} from 'playwright';
const url=process.env.ORONZO_URL||'http://127.0.0.1:8123/oronzo/assets/ui/career-r03.html';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let checks=0;
try{
 for(const [width,height] of [[640,360],[800,360],[844,390],[960,400]]){
  const context=await browser.newContext({viewport:{width,height}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const check=(ok,why)=>{if(!ok)throw Error(width+'x'+height+' '+why);checks++};
  await page.goto(url,{waitUntil:'networkidle'});
  await page.locator('[data-action="start"]').click();
  await page.locator('#qa-mode').check();
  await page.locator('[data-action="begin"]').click();
  await page.locator('[data-action="accept"]').click();
  await page.locator('[data-action="press"]').click();
  for(let i=0;i<6&&await page.evaluate(()=>window.OronzoR03.getScreen())!=='hub';i++)
   await page.locator('[data-action="answer"]').first().click();
  await page.waitForFunction(()=>window.OronzoR03.getScreen()==='hub');
  const saves=await page.evaluate(async()=>{
   const {exportGame}=await import('../../app/flow/controller.js');
   const state=window.OronzoR03.getState();
   return Object.fromEntries(['hub','offers','season_complete','unemployed','opening_press'].map(stage=>{
    const copy=structuredClone(state);copy.flow.stage=stage;
    return [stage,exportGame(copy)];
   }));
  });
  for(const [stage,expected] of [['offers','offers'],['season_complete','season'],['unemployed','unemployed'],['hub','hub']]){
   // The import input is only mounted in the hub; restore hub before the next import.
   if(await page.evaluate(()=>window.OronzoR03.getScreen())!=='hub'){
    await page.reload({waitUntil:'networkidle'});
    await page.locator('[data-action="load"]').click();
    await page.waitForFunction(()=>window.OronzoR03.getScreen()==='hub');
   }
   page.once('dialog',d=>d.accept());
   await page.locator('#r11-save-import').setInputFiles({name:'career.json',mimeType:'application/json',buffer:Buffer.from(saves[stage])});
   // A hub->hub import leaves the same screen visible while File.text() and confirm
   // are still pending. Wait for the imported stage AND dirty flag, not just the screen.
   await page.waitForFunction(({stage,expected})=>
    window.OronzoR03.getScreen()===expected &&
    window.OronzoR03.getState()?.flow?.stage===stage &&
    window.OronzoR03.hasUnsavedProgress(),{stage,expected});
   check(await page.evaluate(()=>window.OronzoR03.hasUnsavedProgress()),stage+' import must remain unsaved');
   if(stage==='season_complete'||stage==='unemployed')
    check(await page.locator('[data-action="save"]').count()>0,stage+' has save action');
   check(await page.evaluate(()=>window.OronzoR03.getState()?.flow?.stage)===stage,stage+' stage retained');
  }
  check(errors.length===0,'browser errors '+errors.join('; '));
  await context.close();
 }
 console.log('PASS '+checks+' Chromium import-resume checks in four landscape viewports');
}finally{await browser.close()}
