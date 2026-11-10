// Real Chromium HTTP persistence and beforeunload regression for PR #71.
import {chromium} from 'playwright';
const url=process.env.ORONZO_URL||'http://127.0.0.1:8123/oronzo/assets/ui/career-r03.html';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let checks=0;
try{
 for(const [width,height] of [[640,360],[800,360],[844,390],[960,400]]){
  const context=await browser.newContext({viewport:{width,height},acceptDownloads:true});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const check=(condition,message)=>{if(!condition)throw Error(width+'x'+height+': '+message);checks++};
  const response=await page.goto(url,{waitUntil:'networkidle'});
  check(response.status()===200,'HTTP 200');
  await page.waitForFunction(()=>Boolean(window.OronzoR03?.getState));
  check(await page.evaluate(()=>window.OronzoR03.hasUnsavedProgress())===false,'clean entry');
  const clean=await page.evaluate(()=>{
   const e=new Event('beforeunload',{cancelable:true});
   window.dispatchEvent(e);return e.defaultPrevented;
  });
  check(clean===false,'clean unload must not be cancelled');
  await page.locator('[data-action="start"]').click();
  await page.locator('#qa-mode').check();
  await page.locator('[data-action="begin"]').click();
  await page.waitForFunction(()=>window.OronzoR03?.getScreen()==='offers');
  check(await page.locator('[data-action="offer"]').count()===20,'offers generated');
  await page.locator('[data-action="accept"]').click();
  await page.waitForFunction(()=>window.OronzoR03?.getScreen()==='president');
  await page.waitForFunction(()=>!window.OronzoR03?.hasUnsavedProgress(),{timeout:15000});
  check(await page.evaluate(()=>!window.OronzoR03.hasUnsavedProgress()),'offer persisted');
  // A real imported save is deliberately dirty until explicitly confirmed.
  const downloadPromise=page.waitForEvent('download');
  await page.locator('[data-action="export-save"]').first().click();
  const download=await downloadPromise;
  const file=await download.path();
  page.once('dialog',d=>d.accept());
  await page.locator('#r11-save-import').setInputFiles(file);
  await page.waitForFunction(()=>window.OronzoR03?.hasUnsavedProgress()===true);
  check(await page.evaluate(()=>{
   const e=new Event('beforeunload',{cancelable:true});
   window.dispatchEvent(e);return e.defaultPrevented;
  }),'dirty unload must be cancelled');
  page.once('dialog',d=>d.accept());
  await page.locator('[data-action="save"]').first().click();
  await page.waitForFunction(()=>window.OronzoR03?.hasUnsavedProgress()===false);
  check(await page.evaluate(()=>{
   const e=new Event('beforeunload',{cancelable:true});
   window.dispatchEvent(e);return !e.defaultPrevented;
  }),'saved unload must be clean');
  await page.reload({waitUntil:'networkidle'});
  await page.locator('[data-action="load"]').click();
  await page.waitForFunction(()=>window.OronzoR03?.getState()!=null);
  check(await page.evaluate(()=>!window.OronzoR03.hasUnsavedProgress()),'reload restores persisted save');
  check(errors.length===0,'browser errors: '+errors.join('; '));
  await context.close();
 }
 console.log('PASS '+checks+' real Chromium HTTP checks across 4 landscape viewports');
}finally{await browser.close()}
