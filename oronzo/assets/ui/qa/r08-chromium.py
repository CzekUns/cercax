"""Agent03 R08 targeted Chromium QA on the *actual* R03 runtime.

Uses Playwright request fulfillment because this sandbox blocks top-level localhost,
not because any engine/press/controller is stubbed. Node + screenshot tests are
separate from this HTTP validation; independent QA should repeat against HTTP.
"""
from pathlib import Path
from urllib.parse import urlparse, unquote
from playwright.sync_api import sync_playwright
import json, mimetypes, hashlib, time, os
ROOT=Path(__file__).resolve().parents[4]
QA=Path(__file__).resolve().parent
BASE='https://oronzo-r08.invalid/oronzo/assets/ui/'
HTML=(ROOT/'oronzo/assets/ui/career-r03.html').read_text().replace('<head>',f'<head><base href="{BASE}">')
PORTS=[(640,360),(800,360),(844,390)]

GEOMETRY="""el=>{
 let r=el.getBoundingClientRect(), left=r.left,top=r.top,right=r.right,bottom=r.bottom;
 for(let p=el.parentElement;p;p=p.parentElement){let st=getComputedStyle(p);
  if(['hidden','scroll','auto','clip'].some(v=>(st.overflow+' '+st.overflowX+' '+st.overflowY).includes(v))) {
   let b=p.getBoundingClientRect();left=Math.max(left,b.left);top=Math.max(top,b.top);right=Math.min(right,b.right);bottom=Math.min(bottom,b.bottom);
  }
 }
 left=Math.max(left,0);top=Math.max(top,0);right=Math.min(right,innerWidth);bottom=Math.min(bottom,innerHeight);
 const x=r.left+r.width/2,y=r.top+r.height/2,at=document.elementFromPoint(x,y);
 return {height:r.height,width:r.width,visibleH:Math.max(0,bottom-top),visibleW:Math.max(0,right-left),
  center:{x,y},hit:at===el||el.contains(at),tag:at?.tagName,action:at?.closest('button')?.dataset?.action||null};
}"""

def run_case(browser,width,height,touch):
 name=f'{width}x{height}-'+('touch' if touch else 'mouse')
 ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=touch,has_touch=touch)
 page=ctx.new_page();errors=[];http=[];check=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:http.append({'status':r.status,'url':r.url}) if r.status>=400 else None)
 def serve(route):
  f=ROOT/unquote(urlparse(route.request.url).path.lstrip('/'))
  if f.is_file() and ROOT in f.parents:route.fulfill(status=200,body=f.read_bytes(),content_type=mimetypes.guess_type(str(f))[0] or 'application/octet-stream')
  else:route.fulfill(status=404,body='missing')
 page.route('**/*',serve)
 def show(storage=None):
  page.goto('about:blank')
  page.evaluate('seed=>{let d={...seed};Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>{d[k]=v},removeItem:k=>{delete d[k]},all:()=>({...d})}})}',storage or {})
  page.set_content(HTML,wait_until='load')
  page.wait_for_function('!!window.OronzoR03',timeout=15000)
  page.wait_for_function('!!document.querySelector("#oronzo-r03") && !window.OronzoR03.getErrors().length')
 def check_target(selector, expected_action=None):
  loc=page.locator(selector).last
  assert loc.count()==1,(name,'not found',selector)
  g=loc.evaluate(GEOMETRY)
  assert g['height']>=43.99 and g['visibleH']>=43.99 and g['visibleW']>=43.99,(name,selector,'clipped',g)
  assert g['hit'],(name,selector,'center occluded',g)
  if expected_action:assert g['action']==expected_action,(name,selector,'wrong hit',g)
  return g
 def tap(selector,action=None):
  geo=check_target(selector,action)
  x,y=geo['center']['x'],geo['center']['y']
  assert 0<=x<width and 0<=y<height,(name,selector,'off viewport',geo)
  (page.touchscreen.tap(x,y) if touch else page.mouse.click(x,y))
 def act(action):
  tap(f'button[data-action="{action}"]',action)
 def section(value):
  tap(f'button[data-action="section"][data-value="{value}"]','section')
 def js(query):return page.evaluate(query)
 def snapshot(label):
  if touch:page.screenshot(path=str(QA/f'r08-{label}-{width}x{height}.png'),animations='disabled')
 def scroll_to_last(container_selector,item_selector,min_visible=44):
  container=page.locator(container_selector)
  assert container.count()==1
  before=container.evaluate('(el)=>el.scrollTop')
  bounds=container.bounding_box();assert bounds and bounds['height']>44,(name,'bad scroll area',bounds)
  if touch:
   cdp=ctx.new_cdp_session(page)
   for _ in range(26):
    maxscroll=container.evaluate('(e)=>e.scrollHeight-e.clientHeight')
    now=container.evaluate('(e)=>e.scrollTop')
    if now >= maxscroll-2:break
    x=bounds['x']+bounds['width']/2;y0=bounds['y']+bounds['height']*.8;y1=bounds['y']+bounds['height']*.2
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y0}]})
    for k in range(1,7):
     cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y0+(y1-y0)*k/6}]})
     page.wait_for_timeout(10)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(80)
  else:
   page.mouse.move(bounds['x']+bounds['width']/2,bounds['y']+bounds['height']/2)
   for _ in range(26):
    maxscroll=container.evaluate('(e)=>e.scrollHeight-e.clientHeight')
    if container.evaluate('(e)=>e.scrollTop')>=maxscroll-2:break
    page.mouse.wheel(0,120);page.wait_for_timeout(40)
  after=container.evaluate('(el)=>el.scrollTop')
  assert after>before,(name,container_selector,'scroll did not move',before,after)
  item=page.locator(item_selector).last
  g=item.evaluate(GEOMETRY)
  assert g['visibleH']>=min_visible-.01 and g['hit'],(name,'last row not reachable',g,after)
  return after

 show()
 tap('button[data-action="start"]','start')
 assert page.locator('.avatar-tile').count()==8
 check_target('#origin')
 check_target('button[data-action="begin"]','begin');check_target('button[data-action="home"]','home')
 snapshot('avatar')
 act('begin');assert js('OronzoR03.getStage()')=='offers';assert page.locator('.runtime-offer').count()==20
 act('accept');assert js('OronzoR03.getStage()')=='opening_press'
 act('press')
 for _ in range(5):act('answer')
 assert js('OronzoR03.getStage()')=='hub'
 roster=js('OronzoR03.getState().clubs.find(c=>c.id===OronzoR03.getState().coach.clubId).players.map(p=>({id:p.id,name:p.name}))')
 assert len(roster)==16,(name,'fixture roster changed',len(roster))
 section('rosa');assert page.locator('.runtime-player-link').count()==len(roster)
 assert page.locator('.runtime-roster-list').get_attribute('data-total-players')=='16'
 scroll_to_last('.runtime-roster-list','.runtime-player-link')
 assert page.locator('.runtime-player-link').last.get_attribute('data-player-id')==roster[-1]['id']
 tap('.runtime-player-link:last-child','player')
 assert js('OronzoR03.getScreen()')=='player'
 assert page.locator('.runtime-player-name').inner_text()==roster[-1]['name']
 assert roster[-1]['id'] in page.locator('#ui-screen').inner_text()
 assert 'TECNICA' in page.locator('#ui-screen').inner_text() and 'MENTALE' in page.locator('#ui-screen').inner_text()
 assert not page.locator('.runtime-unavailable').last.is_enabled()
 snapshot('player')
 act('back-rosa');section('allenamento')
 assert page.locator('.runtime-player-link').count()==16
 assert page.locator('.runtime-unavailable').last.is_disabled()
 before=js('JSON.stringify(OronzoR03.getState())')
 scroll_to_last('.runtime-roster-list','.runtime-player-link')
 tap('.runtime-player-link:last-child','player')
 assert 'getTrainingPlayer' in page.locator('#ui-screen').inner_text()
 assert js('JSON.stringify(OronzoR03.getState())')==before,(name,'training mutated state')
 act('back-rosa');assert js('OronzoR03.getScreen()')=='hub';assert page.locator('.runtime-player-link').count()==16
 section('campionato')
 rows=page.locator('.runtime-table-row')
 assert rows.count()==16,(name,'standings truncated',rows.count())
 assert [rows.nth(i).get_attribute('data-rank') for i in range(12,16)]==['13','14','15','16']
 clubid=js('OronzoR03.getState().coach.clubId')
 assert page.locator(f'.runtime-table-row[data-club-id="{clubid}"]').count()==1,(name,'coach missing in standings')
 scroll_to_last('.runtime-table','.runtime-table-row',min_visible=30)
 assert page.locator('.runtime-table-row').last.get_attribute('data-rank')=='16'
 snapshot('standings')
 act('formation')
 assert page.locator('[data-player]').count()==16
 assert page.locator('[data-player]:checked').count()==11
 first=page.locator('[data-player]').first
 check_target('.runtime-roster .runtime-player:first-child')
 # Last item in the roster is scrollable to 44px and not clipped.
 scroll_to_last('.runtime-roster','.runtime-player')
 check_target('.runtime-roster .runtime-player:last-child')
 check_target('#captain')
 act('prepare')
 assert js('OronzoR03.getScreen()')=='match'
 assert js('OronzoR03.getSnapshot().players.length')==22
 check_target('button[data-action="finish-qa"]','finish-qa')
 snapshot('match')
 act('finish-qa');assert js('OronzoR03.getStage()')=='postmatch_press',(name,js('OronzoR03.getErrors()'))
 for _ in range(2):act('answer')
 assert js('OronzoR03.getStage()')=='postmatch_ready'
 act('advance');assert js('OronzoR03.getState().absoluteWeek')==2
 previous=js('OronzoR03.getState()');saved=js('localStorage.all()');assert saved
 # A reload reads the real flow07 envelope; a shim is used only for localStorage in this blocked sandbox.
 show(saved);act('load')
 after=js('OronzoR03.getState()')
 assert after==previous,(name,'save/load state mismatch')
 # Inject a real Agent09 event through the genuine module, to test the terminal state.
 morale=page.evaluate('''async()=>{const mod=await import('https://oronzo-r08.invalid/oronzo/systems/coach-club/morale.js');
 const s=OronzoR03.getState();let result=mod.applyCoachMoraleEvent(s.coach,{eventId:'r08-qa-gameover-'+s.absoluteWeek,moraleDelta:-100});
 if(!result.accepted)throw Error(result.reason);s.coach=result.coach;return {morale:s.coach.morale,gameOver:s.coach.gameOver};}''')
 assert morale['morale']==0 and morale['gameOver']
 act('home')
 assert js('OronzoR03.getScreen()')=='gameover'
 assert page.locator('button[data-action="reset-career"]').count()==1
 snapshot('gameover')
 beforeSave=js('localStorage.all()')
 act('reset-career')
 assert js('OronzoR03.getScreen()')=='avatar' and js('OronzoR03.getState()') is None
 assert js('localStorage.all()')==beforeSave
 act('begin')
 assert js('OronzoR03.getState().coach.morale')>0
 assert js('OronzoR03.getStage()')=='offers'
 assert js('localStorage.all()')==beforeSave
 act('accept')
 assert js('localStorage.all()')==beforeSave,(name,'autosaVe overwrote previous career')
 dialog=[]
 page.once('dialog',lambda d:(dialog.append(d.message),d.dismiss()))
 act('save')
 assert dialog and 'sovrascriverlo' in dialog[0]
 assert js('localStorage.all()')==beforeSave
 act('home');act('load')
 assert js('OronzoR03.getState()')==previous,(name,'previous save not restored')
 assert not errors,(name,errors)
 assert not [x for x in http if '/cutscenes/' not in x['url']],(name,'non-optional missing',http)
 # Validate that geography_required still refuses an offer without partial commit.
 show();act('start')
 page.locator('#qa-mode').uncheck();act('begin')
 before=js('JSON.stringify(OronzoR03.getState())');act('accept')
 assert js('JSON.stringify(OronzoR03.getState())')==before
 assert 'geography_required' in page.locator('#ui-toast').inner_text()
 assert not errors,(name,errors)
 ctx.close()
 return {'case':name,'status':'PASS','rosterRows':len(roster),'standingsRows':rows.count() if False else 16,'QAFulltime':True,'gameoverResetPreservesSave':True,'missingAssets':http}

if __name__=='__main__':
 results=[]
 with sync_playwright() as p:
  b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  print('Chromium',b.version,flush=True)
  for w,h in PORTS:
   for touch in (False,True):
    if os.environ.get("R08_CASE") and os.environ["R08_CASE"]!=f"{w}x{h}-{'touch' if touch else 'mouse'}":continue
    print('RUN',w,h,'touch',touch,flush=True)
    t=time.monotonic()
    try:res=run_case(b,w,h,touch)
    except Exception as e:
     print('FAIL',w,h,touch,type(e).__name__,str(e)[:1200],flush=True)
     results.append({'case':f'{w}x{h}-{touch}','status':'FAIL','error':str(e)[:1800]})
     (QA/f'R08B-RESULTS-{os.environ.get("R08_CASE","all")}.json').write_text(json.dumps(results,indent=2,ensure_ascii=False))
     raise
    res['seconds']=round(time.monotonic()-t,2);results.append(res)
    print('PASS',res['case'],res['seconds'],flush=True)
  b.close()
 (QA/f'R08B-RESULTS-{os.environ.get("R08_CASE","all")}.json').write_text(json.dumps(results,indent=2,ensure_ascii=False))
 print('COMPLETE',len(results),'PASS',flush=True)
