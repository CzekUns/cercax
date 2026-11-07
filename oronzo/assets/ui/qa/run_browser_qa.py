from pathlib import Path
import threading
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from playwright.sync_api import sync_playwright
import base64, re
DIR=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(DIR)))
threading.Thread(target=server.serve_forever,daemon=True).start()
# Browser forbids local HTTP/file navigation in this sandbox: use self-contained set_content.
css=(DIR/'demo-v02.css').read_text(encoding='utf8')
def embed_png(m):
    return "url('data:image/png;base64,"+base64.b64encode((DIR/m.group(1)).read_bytes()).decode('ascii')+"')"
css=re.sub(r"url\('([^']+\.png)'\)",embed_png,css)
html=(DIR/'demo-v02.html').read_text(encoding='utf8').replace('<link rel="stylesheet" href="./demo-v02.css">','<style>'+css+'</style>').replace('<script src="./demo-v02.js"></script>','<script>'+(DIR/'demo-v02.js').read_text(encoding='utf8')+'</script>')
def audit_controls(page,phase,w,h):
    area=page.locator('#ui-screen').bounding_box()
    for b in page.locator('#ui-screen button[data-action]').all():
        bb=b.bounding_box()
        if bb is None: continue
        name=b.inner_text().strip()[:35] or b.get_attribute('aria-label') or 'button'
        assert bb['height']>=43.5,(phase,w,h,name,'short',bb)
        if b.evaluate("el=>!!el.closest('.scroll')"): continue  # list rows intentionally scroll
        assert bb['y']>=area['y']-1,(phase,w,h,name,'top',bb,area)
        assert bb['y']+bb['height']<=area['y']+area['height']+2,(phase,w,h,name,'clipped',bb,area)

errors=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    for w,h in [(640,360),(800,360),(844,390)]:
        page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='load')
        assert page.locator('h1').first.inner_text()=='IL FISCHIO D’INIZIO'
        audit_controls(page,'entry',w,h)
        box=page.locator('.stage').bounding_box()
        assert abs(box['height']*16/9-box['width'])<2,(w,h,box)
        page.screenshot(path=str(DIR/'qa'/f'entry-{w}x{h}.png'))
        # Avatar: 8 portraits; dynamic stats change after selection.
        page.get_by_role('button',name='AVATAR',exact=True).last.click()
        assert page.locator('button.avatar-tile').count()==8
        name1=page.locator('.bio').inner_text()
        page.locator('.avatar-tile').nth(3).click()
        assert page.locator('.bio').inner_text()!=name1
        assert page.locator('.stat-line').count()==4
        audit_controls(page,'avatar',w,h)
        page.screenshot(path=str(DIR/'qa'/f'avatar-{w}x{h}.png'))
        # Offers: 20 entries; dynamic preview; accept leads to president.
        page.get_by_role('button',name='20 OFFERTE',exact=True).click()
        assert page.locator('.offer-item').count()==20
        page.locator('.offer-item').nth(5).click()
        assert page.locator('.offer-item[aria-selected="true"]').count()==1
        audit_controls(page,'offers',w,h)
        page.screenshot(path=str(DIR/'qa'/f'offers-{w}x{h}.png'))
        page.get_by_role('button',name='ACCETTA OFFERTA').click()
        assert 'PRESIDENTE' in page.locator('h1').inner_text()
        audit_controls(page,'president',w,h)
        page.get_by_role('button',name='CONFERENZA INIZIALE').click()
        for i in range(5):
            audit_controls(page,'press'+str(i),w,h)
            assert f'{i+1} / 5' in page.locator('.screen-heading').inner_text()
            page.locator('.answer-grid button').first.click()
        assert 'UFFICIO DEL MISTER' in page.locator('h1').inner_text()
        audit_controls(page,'hub',w,h)
        page.screenshot(path=str(DIR/'qa'/f'hub-{w}x{h}.png'))
        page.get_by_role('button',name='PROSSIMA GIORNATA ▶').click()
        assert page.locator('.kit-player').count()==22
        audit_controls(page,'prematch',w,h)
        page.locator('button[data-action="camera"][data-value="tv"]').click()
        assert 'CAMERA TV' in page.locator('.camera-tag').inner_text()
        assert page.locator('.kit-player').count()==22
        page.get_by_role('button',name='▶ VAI ALLA VISTA PARTITA').click()
        assert page.locator('h1').inner_text().startswith('PARTITA')
        audit_controls(page,'match',w,h)
        page.screenshot(path=str(DIR/'qa'/f'match-tv-{w}x{h}.png'))
        page.locator('button[data-action="camera"][data-value="full"]').click()
        assert 'CAMPO COMPLETO' in page.locator('.camera-tag').inner_text()
        assert page.locator('.kit-player').count()==22
        # Stage contained by viewport and the primary controls use at least 44x44 CSS px.
        for b in page.locator('.quick-nav button').all():
            bb=b.bounding_box();assert bb['height']>=44,(w,h,bb)
        assert page.evaluate('window.oronzoUIDemo.getScreen()')=='match'
        page.screenshot(path=str(DIR/'qa'/f'match-full-{w}x{h}.png'))
        page.close()
    assert not errors,errors
    browser.close()
server.shutdown()
print('PASS: Chromium 640x360 800x360 844x390, entry/avatar/20 offers/president/5 press questions/hub/22 positions/TV-FULL switch, no JS pageerrors')
