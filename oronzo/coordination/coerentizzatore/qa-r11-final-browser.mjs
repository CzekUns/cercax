// Independent Agent00 final R11 check. Audit-only harness; game code is untouched.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const sizes=[[640,360],[800,360],[844,390],[960,400]];
const outDir='audit00-r11-evidence';
await mkdir(outDir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const findings=[];
let failed=false;
function record(view,test,pass,details=''){
 findings.push({view,test,pass,details});
 if(!pass){failed=true;throw Error(test+': '+details);}
}
const base=process.env.ORONZO_URL||'http://127.0.0.1:8123/oronzo/assets/ui/career-r03.html';
for(const [w,h] of sizes){
 const view=w+'x'+h, context=await browser.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const page=await context.newPage();
 const errors=[],pngs=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(/\.png(?:\?|$)/i.test(r.url()))pngs.push({url:r.url(),status:r.status()})});
 const action=(name,value)=>page.locator('[data-action="'+name+'"]'+(value===undefined?'':'[data-value="'+value+'"]')).first();
 const snap=name=>page.screenshot({path:outDir+'/'+view+'-'+name+'.png'});
 const screen=()=>page.evaluate(()=>window.OronzoR03?.getScreen());
 const st=fn=>page.evaluate(fn);
 try {
  const result=await page.goto(base,{waitUntil:'networkidle'});
  record(view,'http-200',result.status()===200,String(result.status()));
  await page.waitForFunction(()=>window.OronzoR03?.getStage);
  const imageOk=await page.locator('img.runtime-entry-photo').evaluate(e=>e.complete&&e.naturalWidth>0);
  record(view,'entry-real-png',imageOk);
  await snap('entry');
  await action('start').click();
  await page.locator('#qa-mode').check();
  await action('begin').click();
  record(view,'twenty-real-offers',(await page.locator('[data-action="offer"]').count())===20);
  await action('accept').click();
  for(let n=0;n<8&&(await screen())!=='hub';n++){
   const x=await screen();
   if(x==='president') await action('press').click();
   else if(x==='press') await action('answer').click();
   else throw Error('Opening blocked: '+x);
  }
  record(view,'career-reaches-hub',(await screen())==='hub');
  await action('section','allenamento').click();
  await action('training-plan','rest').click();
  await page.locator('#r11-training-intensity').evaluate(e=>{e.value='73';e.dispatchEvent(new Event('input',{bubbles:true}));});
  await action('training-apply').click();
  await page.waitForFunction(()=>window.OronzoR03.getState()?.flow?.m1?.training?.selected?.intensity===73);
  record(view,'recupero73-ledger',await st(()=>window.OronzoR03.getState().flow.m1.training.selected.plan==='rest'));
  // Distinguish an in-flight user action from a completed durable save.
  await page.waitForFunction(()=>window.OronzoR03 && !window.OronzoR03.hasUnsavedProgress(),null,{timeout:45000});
  record(view,'save-acknowledged',await st(()=>!window.OronzoR03.hasUnsavedProgress()&&!window.OronzoR03.getSaveError()));
  await snap('training-saved-before-reload');
  await page.reload({waitUntil:'networkidle'});
  await action('load').click();
  await page.waitForFunction(()=>window.OronzoR03.getScreen()==='hub');
  await action('section','allenamento').click();
  const loadedTraining={slider:await page.locator('#r11-training-intensity').inputValue(),
   pressed:await action('training-plan','rest').getAttribute('aria-pressed'),
   state:await st(()=>window.OronzoR03.getState()?.flow?.m1?.training?.selected)};
  record(view,'recupero73-reloaded',loadedTraining.slider==='73'&&loadedTraining.pressed==='true'&&loadedTraining.state?.intensity===73,JSON.stringify(loadedTraining));
  await snap('training-reload');
  await action('hub').click();
  await action('section','rosa').click();
  record(view,'roster-buttons',await page.locator('.runtime-player-link').count()>0);
  await page.locator('#r11-roster-filter').selectOption('GK');
  record(view,'roster-gk-filter',await page.locator('.runtime-player-link').count()>0);
  await snap('roster');
  await action('hub').click();
  await action('section','presidente').click();
  record(view,'president-requests-ui',await action('board-request').isVisible());
  if(w===640){
   await page.locator('#r11-request-kind').selectOption('market_mandate');
   await page.locator('#r11-request-amount').fill('5000');
   const before=await st(()=>window.OronzoR03.getState().clubs.find(c=>c.id===window.OronzoR03.getState().coach.clubId).management?.requests?.length??0);
   await action('board-request').click();
   await page.waitForFunction(n=>window.OronzoR03.getState().clubs.find(c=>c.id===window.OronzoR03.getState().coach.clubId).management?.requests?.length??0>n,before);
   await page.waitForFunction(()=>!window.OronzoR03.hasUnsavedProgress());
   await action('board-decide').first().click();
   await page.waitForFunction(()=>!window.OronzoR03.hasUnsavedProgress());
   const board=await st(()=>{
    let s=window.OronzoR03.getState(),club=s.clubs.find(c=>c.id===s.coach.clubId),r=club.management.requests.at(-1);
    return {id:r.id,kind:r.kind,status:r.status,boardTrust:club.boardTrust};
   });
   record(view,'board-request-clicks',board.kind==='market_mandate' && ['approved','rejected'].includes(board.status),JSON.stringify(board));
  }
  await action('pres-tab','mercato').click();
  record(view,'market-page-real',await page.locator('#r11-sale-player').count()===1);
  await snap('market-before');
  if(w===640){
    const chosen=await st(()=>{
      const s=window.OronzoR03.getState(),seller=s.clubs.find(c=>c.id===s.coach.clubId);
      const player=seller.players.find(p=>!p.positions.includes('GK'));
      const buyer=s.clubs.find(c=>c.id!==seller.id && c.finance.cash>=1000 &&
        c.wageBudget-c.players.reduce((sum,p)=>sum+(p.contract?.weeklyWage||0),0)>=(player.contract.weeklyWage||0));
      return {sellerId:seller.id,playerId:player.id,playerWage:player.contract.weeklyWage,
       buyerId:buyer?.id||null,cash:seller.finance.cash,buyerCash:buyer?.finance.cash};
    });
    record(view,'real-buyer-available',Boolean(chosen.buyerId),JSON.stringify(chosen));
    let approved=null;
    for(let attempt=0;attempt<28;attempt++){
      await page.locator('#r11-sale-player').selectOption(chosen.playerId);
      await page.locator('#r11-sale-buyer').selectOption(chosen.buyerId);
      await page.locator('#r11-sale-fee').fill('1000');
      const before=await st(()=>window.OronzoR03.getState().clubs.find(c=>c.id===window.OronzoR03.getState().coach.clubId).market?.requests?.length??0);
      await action('market-sale').click();
      await page.waitForFunction(n=>window.OronzoR03.getState().clubs.find(c=>c.id===window.OronzoR03.getState().coach.clubId).market?.requests?.length??0>n,before);
      await page.waitForFunction(()=>!window.OronzoR03.hasUnsavedProgress());
      const req=await st(()=>{
        const s=window.OronzoR03.getState(),c=s.clubs.find(x=>x.id===s.coach.clubId);
        return c.market.requests.at(-1);
      });
      record(view,'sale-proposal-'+attempt,req.kind==='sell' && req.status==='proposed',req.id);
      await action('market-progress','review|'+req.id).click();
      await page.waitForFunction(id=>{
        const s=window.OronzoR03.getState(),c=s.clubs.find(x=>x.id===s.coach.clubId);
        return c.market.requests.find(x=>x.id===id).status!=='proposed';
      },req.id);
      const status=await page.evaluate(id=>{
        const s=window.OronzoR03.getState(),c=s.clubs.find(x=>x.id===s.coach.clubId);
        return c.market.requests.find(x=>x.id===id).status;
      },req.id);
      await page.waitForFunction(()=>!window.OronzoR03.hasUnsavedProgress());
      if(status==='approved'){approved=req.id;break;}
      if(status!=='rejected')throw Error('Sale review unexpected '+status);
    }
    record(view,'sale-approved-via-buttons',Boolean(approved),approved||'no approval in 28 proposals');
    await page.locator('#r11-sale-buyer').selectOption(chosen.buyerId);
    await page.locator('#r11-sale-fee').fill('1000');
    await snap('market-approved');
    await action('market-progress','finalize-sale|'+approved).click();
    await page.waitForFunction(({sellerId,buyerId,playerId})=>{
      const s=window.OronzoR03.getState(),a=s.clubs.find(c=>c.id===sellerId),b=s.clubs.find(c=>c.id===buyerId);
      return !a.players.some(p=>p.id===playerId)&&b.players.some(p=>p.id===playerId);
    },chosen);
    await page.waitForFunction(()=>!window.OronzoR03.hasUnsavedProgress());
    const finalized=await st(()=>{
      const s=window.OronzoR03.getState(),c=s.clubs.find(x=>x.id===s.coach.clubId);
      return {requests:c.market.requests.length,completed:c.market.requests.filter(x=>x.status==='completed').length,
        clubId:c.id,playerCount:c.players.length,cash:c.finance.cash};
    });
    record(view,'sale-finalized-actual-transaction',finalized.completed>0,JSON.stringify(finalized));
    await snap('market-finalized');
    await page.reload({waitUntil:'networkidle'});
    await action('load').click();
    await page.waitForFunction(()=>window.OronzoR03.getScreen()==='hub');
    const reloaded=await page.evaluate(({sellerId,buyerId,playerId,cash,buyerCash})=>{
      const s=window.OronzoR03.getState(),a=s.clubs.find(c=>c.id===sellerId),b=s.clubs.find(c=>c.id===buyerId);
      return {sold:!a.players.some(p=>p.id===playerId),bought:b.players.filter(p=>p.id===playerId).length,
        sellerDelta:a.finance.cash-cash,buyerDelta:b.finance.cash-buyerCash};
    },chosen);
    record(view,'sale-still-correct-after-real-idb-reload',reloaded.sold&&reloaded.bought===1 &&
      reloaded.sellerDelta===1000&&reloaded.buyerDelta===-1000,JSON.stringify(reloaded));
    await snap('market-after-reload');
    // Purchase: genuine president mandate, candidate, proposal, review, negotiation,
    // completion via rendered buttons (no controller injection).
    await action('section','presidente').click();
    await action('pres-tab','mercato').click();
    const buying=await page.evaluate(()=>{
      const s=window.OronzoR03.getState(),mine=s.clubs.find(c=>c.id===s.coach.clubId);
      const mandate=mine.management?.requests?.find(r=>r.kind==='market_mandate'&&r.status==='approved');
      const values=[...document.querySelectorAll('#r11-market-candidate option')].map(o=>o.value);
      const candidate=values.map(v=>v.split('|')).find(([id,playerId])=>
        s.clubs.some(c=>c.id===id&&c.players.some(p=>p.id===playerId)));
      const source=s.clubs.find(c=>c.id===candidate?.[0]);
      const player=source?.players.find(p=>p.id===candidate?.[1]);
      return {mandateId:mandate?.id||null,sourceId:source?.id||null,
        playerId:player?.id||null,fee:1000,cash:mine.finance.cash,sourceCash:source?.finance.cash};
    });
    record(view,'purchase-prerequisites',!!buying.mandateId&&!!buying.playerId,JSON.stringify(buying));
    let buyApproved=null;
    for(let attempt=0;attempt<35;attempt++){
      await page.locator('#r11-market-candidate').selectOption(buying.sourceId+'|'+buying.playerId);
      await page.locator('#r11-market-mandate').selectOption(buying.mandateId);
      await page.locator('#r11-market-fee').fill('1000');
      await page.locator('#r11-market-wage').fill('0');
      const before=await st(()=>window.OronzoR03.getState().clubs.find(c=>c.id===window.OronzoR03.getState().coach.clubId).market.requests.length);
      await action('market-request').click();
      await page.waitForFunction(n=>window.OronzoR03.getState().clubs.find(c=>c.id===window.OronzoR03.getState().coach.clubId).market.requests.length>n,before);
      await page.waitForFunction(()=>!window.OronzoR03.hasUnsavedProgress());
      const req=await st(()=>{
        const s=window.OronzoR03.getState(),c=s.clubs.find(x=>x.id===s.coach.clubId);return c.market.requests.at(-1);
      });
      record(view,'buy-proposal-'+attempt,req.kind==='buy'&&req.status==='proposed',req.id);
      await action('market-progress','review|'+req.id).click();
      await page.waitForFunction(id=>{
        const s=window.OronzoR03.getState(),c=s.clubs.find(x=>x.id===s.coach.clubId);
        return c.market.requests.find(x=>x.id===id).status!=='proposed';
      },req.id);
      await page.waitForFunction(()=>!window.OronzoR03.hasUnsavedProgress());
      const status=await page.evaluate(id=>{
        const s=window.OronzoR03.getState(),c=s.clubs.find(x=>x.id===s.coach.clubId);
        return c.market.requests.find(x=>x.id===id).status;
      },req.id);
      if(status==='approved'){buyApproved=req.id;break;}
      if(status!=='rejected')throw Error('Unexpected purchase review '+status);
    }
    record(view,'purchase-board-approved-by-clicks',!!buyApproved,buyApproved||'no approval');
    await snap('purchase-approved');
    await action('market-progress','negotiate|'+buyApproved).click();
    await page.waitForFunction(id=>{
      const s=window.OronzoR03.getState(),c=s.clubs.find(x=>x.id===s.coach.clubId);
      return c.market.requests.find(x=>x.id===id)?.status==='negotiated';
    },buyApproved);
    await page.waitForFunction(()=>!window.OronzoR03.hasUnsavedProgress());
    await action('market-progress','finalize|'+buyApproved).click();
    await page.waitForFunction(id=>{
      const s=window.OronzoR03.getState(),c=s.clubs.find(x=>x.id===s.coach.clubId);
      return c.market.requests.find(x=>x.id===id)?.status==='completed';
    },buyApproved);
    await page.waitForFunction(()=>!window.OronzoR03.hasUnsavedProgress());
    const buyResult=await page.evaluate(({sourceId,playerId,cash,sourceCash})=>{
      const s=window.OronzoR03.getState(),mine=s.clubs.find(x=>x.id===s.coach.clubId);
      const seller=s.clubs.find(x=>x.id===sourceId);
      return {mineCount:mine.players.filter(p=>p.id===playerId).length,
        sourceCount:seller.players.filter(p=>p.id===playerId).length,
        mineCashDelta:mine.finance.cash-cash,sourceCashDelta:seller.finance.cash-sourceCash};
    },buying);
    record(view,'purchase-completed-both-clubs-accounted',buyResult.mineCount===1&&
      buyResult.sourceCount===0&&buyResult.mineCashDelta===-1000&&
      buyResult.sourceCashDelta===1000,JSON.stringify(buyResult));
    await snap('purchase-completed');
    await page.reload({waitUntil:'networkidle'});
    await action('load').click();
    await page.waitForFunction(()=>window.OronzoR03.getScreen()==='hub');
    const boughtAfterReload=await page.evaluate(({sourceId,playerId})=>{
      const s=window.OronzoR03.getState(),mine=s.clubs.find(x=>x.id===s.coach.clubId),seller=s.clubs.find(x=>x.id===sourceId);
      return mine.players.filter(p=>p.id===playerId).length===1&&!seller.players.some(p=>p.id===playerId);
    },buying);
    record(view,'purchase-survives-real-idb-reload',boughtAfterReload);
    await action('formation').click();
    await action('prepare').click();
    await page.waitForFunction(()=>window.OronzoR03.getScreen()==='match');
    await page.waitForFunction(()=>window.OronzoR03.isViewReady(),{timeout:45000});
    const pre=await st(()=>window.OronzoR03.getSnapshot());
    await action('camera-tv').click();
    const post=await st(()=>window.OronzoR03.getSnapshot());
    record(view,'tv-switch-preserves-match-state',JSON.stringify(pre)===JSON.stringify(post));
    record(view,'tv-button-clicked',await action('camera-tv').getAttribute('aria-pressed')==='true');
    await snap('match-tv');
    await action('match-tools').click();
    record(view,'live-tactic-ui',await action('match-tactic').count()===1);
    await action('match-tactic').click();
    await action('match-shout').click();
    await snap('match-controls');
    const matchErrors=await st(()=>window.OronzoR03.getErrors());
    record(view,'runtime-errors-empty',matchErrors.length===0,JSON.stringify(matchErrors).slice(0,800));
    // Native browser IndexedDB two large standard seasons with intentional corruption.
    const slots=await page.evaluate(async()=>{
      const [{createDurableSaveManager,DURABLE_DB,DURABLE_STORE},{deserialize}]=await Promise.all([
        import('/oronzo/app/flow/durable-save.js'),import('/oronzo/systems/career/save.js')]);
      const names=['standard-one-season.json','standard-two-season.json'];
      const texts=await Promise.all(names.map(async n=>{
        const r=await fetch('/r11-screenshots/'+n);if(!r.ok)throw Error('Snapshot not served: '+n+' '+r.status);return r.text();
      }));
      const m=createDurableSaveManager({indexedDB,legacyStorage:localStorage});
      const a=await m.save(deserialize(texts[0])),b=await m.save(deserialize(texts[1]));
      const start=await m.inspect();
      const db=await new Promise((resolve,reject)=>{
        const req=indexedDB.open(DURABLE_DB,1);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
      });
      await new Promise((resolve,reject)=>{
        const tx=db.transaction(DURABLE_STORE,'readwrite');
        tx.objectStore(DURABLE_STORE).put({blob:'bad-audit00-corrupted-envelope'},start.active);
        tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
      });
      db.close();
      const recovered=await m.load();
      return {chars:texts.map(s=>s.length),first:a.slot,second:b.slot,
       aValid:start.A?.valid,bValid:start.B?.valid,active:start.active,
       recovered:recovered.recovered,year:recovered.state?.seasonYear,
       recoveredSequence:recovered.sequence};
    });
    record(view,'native-chromium-idb-dual-over4m-corruption-recovery',
      slots.chars.every(n=>n>4000000)&&slots.aValid&&slots.bValid&&
      slots.first!==slots.second&&slots.recovered&&slots.year===1979,JSON.stringify(slots));
  }
  const visible=await page.locator('button:visible').evaluateAll(els=>els.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,a:e.dataset.action||''})));
  record(view,'touch-size',visible.every(x=>x.h>=43.5&&x.w>=40),JSON.stringify(visible.filter(x=>x.h<43.5||x.w<40)));
  record(view,'no-pageerror',errors.length===0,errors.join(';'));
  record(view,'loaded-png-status',pngs.some(p=>p.status===200)&&pngs.every(p=>p.status===200),JSON.stringify(pngs.filter(p=>p.status!==200)));
 }catch(err){
   failed=true;findings.push({view,test:'UNCUGHT',pass:false,details:String(err),errors});
   await snap('FAILURE').catch(()=>{});
 }finally {await context.close();}
}
await browser.close();
await writeFile(outDir+'/results.json',JSON.stringify({findings,failed},null,2));
console.log('AGENT00_INDEPENDENT_QA '+JSON.stringify({pass:findings.filter(x=>x.pass).length,fail:findings.filter(x=>!x.pass).length,findings},null,2));
if(failed)process.exitCode=1;
