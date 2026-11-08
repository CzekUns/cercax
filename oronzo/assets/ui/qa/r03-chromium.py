from playwright.sync_api import sync_playwright
from pathlib import Path
import json
BASE='https://oronzo-r03.invalid/oronzo/assets/ui/career-r03.html'
ROOT=Path(__file__).resolve().parents[4]
DIR=Path(__file__).resolve().parent

def test(w,h,touch):
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  ctx=browser.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)
  page=ctx.new_page();errs=[];missing=[]
  page.on('pageerror',lambda e:errs.append(str(e)+' | STACK:'+str(e.stack)))
  page.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
  def state(s): return page.evaluate(f'OronzoR03.{s}')
  def hit(act):
   item=page.locator(f'[data-action="{act}"]').last
   b=item.bounding_box();assert b,(act,'missing',page.evaluate('OronzoR03.getScreen()'))
   x,y=b['x']+b['width']/2,b['y']+b['height']/2
   assert b['height']>=39,(act,'too short',b)
   actual=page.evaluate('([x,y])=>document.elementFromPoint(x,y)?.closest("button")?.dataset.action',[x,y]);assert actual==act,(act,'center target',actual,b)
   (page.touchscreen.tap(x,y) if touch else page.mouse.click(x,y))
  def serve(route):
   from urllib.parse import urlparse,unquote
   import mimetypes
   f=ROOT/unquote(urlparse(route.request.url).path.lstrip('/'))
   if f.is_file() and (ROOT in f.parents):route.fulfill(status=200,body=f.read_bytes(),content_type=mimetypes.guess_type(str(f))[0] or 'application/octet-stream')
   else:route.fulfill(status=404,body='missing')
  page.route('**/*',serve)
  html=(ROOT/'oronzo/assets/ui/career-r03.html').read_text().replace('<head>','<head><base href="https://oronzo-r03.invalid/oronzo/assets/ui/">')
  def show(storage=None):
   page.goto('about:blank')
   page.evaluate('seed=>{const values={...seed};Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>values[k]??null,setItem:(k,v)=>{values[k]=v},removeItem:k=>{delete values[k]},all:()=>values}})}',storage or {})
   page.set_content(html,wait_until='load')
   page.wait_for_function('!!window.OronzoR03')
  show()
  hit('start');assert page.locator('.avatar-tile').count()==8
  hit('begin');assert state('getStage()')=='offers';assert page.locator('.runtime-offer').count()==20
  hit('accept');assert state('getStage()')=='opening_press'
  hit('press')
  for _ in range(5):hit('answer')
  assert state('getStage()')=='hub',page.locator('#ui-toast').inner_text()
  if touch:page.screenshot(path=str(DIR/f'r03-hub-{w}x{h}.png'))
  hit('formation');assert page.locator('[data-player]:checked').count()==11
  hit('prepare');assert state('getScreen()')=='match',page.locator('#ui-toast').inner_text()
  assert state('getSnapshot().players.length')==22
  if touch:page.screenshot(path=str(DIR/f'r03-match-{w}x{h}.png'))
  hit('finish-qa');assert state('getStage()')=='postmatch_press',(state('getErrors()'),page.locator('#ui-toast').inner_text())
  for _ in range(2):hit('answer')
  assert state('getStage()')=='postmatch_ready';score=state('getState().flow.finalMatch.score')
  hit('advance');assert state('getState().absoluteWeek')==2
  before=state('getState()'); snapshot={'week':before['absoluteWeek'],'morale':before['coach']['morale'],'date':before['gameDate'],'rel':before['coach']['relationships']}
  storage=page.evaluate('localStorage.all()');show(storage);hit('load')
  after=state('getState()');assert snapshot=={'week':after['absoluteWeek'],'morale':after['coach']['morale'],'date':after['gameDate'],'rel':after['coach']['relationships']}
  assert not errs,errs
  show();hit('start');page.locator('#qa-mode').uncheck();hit('begin')
  before=state('getState()');hit('accept');assert state('getState()')==before
  assert 'geography_required' in page.locator('#ui-toast').inner_text()
  assert not errs,errs
  assert not [u for u in missing if '/cutscenes/' not in u],missing
  browser.close()
  return {'resolution':f'{w}x{h}','touch':touch,'status':'PASS','score':score,'savedWeek':snapshot['week'],'missingAssets':missing}
if __name__=='__main__':
 results=[]
 for w,h in [(640,360),(800,360),(844,390)]:
  for touch in [False,True]:
   print('testing',w,h,'touch',touch,flush=True)
   results.append(test(w,h,touch))
 (DIR/'R03-RESULTS.json').write_text(json.dumps(results,indent=2))
 print(json.dumps({'cases':len(results),'passed':len(results),'results':results},indent=2))
