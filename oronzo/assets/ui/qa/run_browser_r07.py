"""R07-1/R07-2 Chromium QA: actual UI JS/CSS+10 PNG through browser requests.
Fallback route.fulfill since this sandbox blocks top-level localhost navigation.
Do not infer real HTTP hosting or physical Android validation from this test.
"""
from pathlib import Path
import json, mimetypes, collections
from urllib.parse import urlparse, unquote
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
SHOTS=ROOT/'qa'
SHOTS.mkdir(exist_ok=True)
SIZES=[(640,360),(800,360),(844,390)]
log=[]; requested=collections.Counter()

def rect(page,selector):
    return page.locator(selector).first.bounding_box()

def center(box):
    return [box['x']+box['width']/2,box['y']+box['height']/2]

def point(page,x,y):
    return page.evaluate('([x,y]) => {const e=document.elementFromPoint(x,y);return {tag:e?.tagName,action:e?.closest("button")?.dataset.action||null,value:e?.closest("button")?.dataset.value||null,id:e?.id||null}}',[x,y])

def click_center(page,sel,touch=True):
    box=rect(page,sel)
    assert box,sel
    x,y=center(box)
    hit=point(page,x,y)
    if touch:page.touchscreen.tap(x,y)
    else:page.mouse.click(x,y)
    return box,hit

def visible_fraction(page,selector):
    return page.evaluate('''(sel)=>{
       const b=document.querySelector(sel); if(!b) return null;
       let r=b.getBoundingClientRect(),lo=r.top,hi=r.bottom,anc=b.parentElement;
       while(anc){let s=getComputedStyle(anc),q=anc.getBoundingClientRect();if(['hidden','clip','scroll','auto'].includes(s.overflowY) || ['hidden','clip'].includes(s.overflow)) {lo=Math.max(lo,q.top+anc.clientTop);hi=Math.min(hi,q.top+anc.clientTop+anc.clientHeight)}anc=anc.parentElement}
       return {top:r.top,bottom:r.bottom,nominalHeight:r.height,visibleHeight:Math.max(0,hi-lo)};
    }''',selector)

def intersects(a,b):
    return a['x'] < b['x']+b['width'] and b['x']<a['x']+a['width'] and a['y'] < b['y']+b['height'] and b['y']<a['y']+a['height']

def assert_toast_clear(page):
    t=rect(page,'#ui-toast')
    assert t and page.locator('#ui-toast').is_visible(), 'toast not visible'
    watched=page.locator('#ui-screen button, #ui-screen .kpi, #ui-screen .small-note, #ui-screen .panel-title, .quick-nav button, .top-info, .brand')
    problems=[]
    for i in range(watched.count()):
        r=watched.nth(i).bounding_box()
        if r and intersects(t,r):problems.append(watched.nth(i).evaluate('(e)=>e.outerHTML.slice(0,110)'))
    assert not problems, 'toast visually overlaps: '+str(problems)
    return t

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width,height in SIZES:
        for touch in (False,True):
            ctx=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,is_mobile=touch,has_touch=touch,locale='it-IT')
            page=ctx.new_page();errors=[]
            page.on('pageerror',lambda exc:errors.append(str(exc)))
            page.on('console',lambda msg:errors.append(msg.text) if msg.type=='error' else None)
            def serve(route):
                path=unquote(urlparse(route.request.url).path.lstrip('/'))
                file=(ROOT/path)
                if file.is_file() and ROOT in file.parents:
                    mimetype=mimetypes.guess_type(file.name)[0] or 'application/octet-stream'
                    requested[path]+=1
                    route.fulfill(status=200,body=file.read_bytes(),content_type=mimetype)
                else:route.fulfill(status=404,body='Not Found')
            page.route('**/*',serve)
            html=(ROOT/'demo-v02.html').read_text().replace('<head>','<head><base href="https://oronzo-qa.invalid/">')
            page.set_content(html,wait_until='load')
            page.wait_for_function('!!window.oronzoUIDemo')
            entry='[data-action="sample-load"]'
            dim=visible_fraction(page,entry)
            b,hit=click_center(page,entry,touch)
            entry_box,entry_hit=b,hit
            assert dim['visibleHeight']>=43.5, (width,height,'R07-1 clipped',dim)
            assert b['height']>=43.5 and hit['action']=='sample-load', (width,height,'R07-1 intercept',hit)
            assert page.locator('#ui-toast').is_visible(),(width,height,'no load toast')
            assert_toast_clear(page)
            hint=page.locator('.entry-hint').bounding_box();parent=page.locator('.entry-panel').bounding_box()
            assert hint['y']+hint['height']<=parent['y']+parent['height']-2,(width,height,'entry hint clipped',hint,parent)
            if touch: page.screenshot(path=str(SHOTS/f'r07-entry-{width}x{height}.png'))
            # fast real journey, no locator auto-scroll for the relevant CTAs.
            b,hit=click_center(page,'#ui-screen [data-value="avatar"]',touch);assert hit['value']=='avatar'
            b,hit=click_center(page,'#ui-screen [data-value="offers"]',touch);assert hit['value']=='offers'
            assert page.locator('.offer-item').count()==20
            b,hit=click_center(page,'[data-action="accept-offer"]',touch);assert hit['action']=='accept-offer'
            b,hit=click_center(page,'#ui-screen [data-value="press"]',touch);assert hit['value']=='press'
            for i in range(5):
                b,hit=click_center(page,'.answer-grid button',touch)
                assert hit['action']=='answer',(width,height,i,hit)
                assert_toast_clear(page)
                if touch and i==2: page.screenshot(path=str(SHOTS/f'r07-press-toast-{width}x{height}.png'))
            assert page.evaluate('oronzoUIDemo.getScreen()')=='hub'
            assert_toast_clear(page)
            if touch: page.screenshot(path=str(SHOTS/f'r07-hub-after-press-{width}x{height}.png'))
            before=page.locator('#ui-screen .gold-btn[data-value="prematch"]').bounding_box()
            b,hit=click_center(page,'#ui-screen .gold-btn[data-value="prematch"]',touch)
            assert hit['action']=='goto' and hit['value']=='prematch',(width,height,'R07-2 hit',hit)
            assert page.evaluate('oronzoUIDemo.getScreen()')=='prematch',(width,height,'R07-2 no navigation')
            if touch:
                page.evaluate('oronzoUIDemo.navigate("hub")')
                page.locator('[data-action="hub"][data-value="presidente"]').evaluate('(e)=>e.click()')
                # Trigger notice from currently available president subsection.
                b,hit=click_center(page,'#ui-screen .hub-subs button',touch)
                assert hit['action']=='not-ready'
                assert_toast_clear(page)
                page.screenshot(path=str(SHOTS/f'r07-hub-toast-{width}x{height}.png'))
            assert not errors,(width,height,'console/page error',errors)
            log.append({'viewport':[width,height],'touch':touch,'entryButton':entry_box,'entryClipping':dim,'entryHit':entry_hit,'hubCTA':before,'assetRequests':dict(requested),'errors':errors,'result':'PASS'})
            ctx.close()
    browser.close()
print(json.dumps({'browser':'Chromium /usr/bin/chromium','cases':len(log),'passed':sum(x['result']=='PASS' for x in log),'assets':dict(requested),'results':log},ensure_ascii=False,indent=2))
(SHOTS/'R07B-RESULTS.json').write_text(json.dumps({'cases':len(log),'passed':sum(x['result']=='PASS' for x in log),'assets':dict(requested),'results':log},ensure_ascii=False,indent=2))
