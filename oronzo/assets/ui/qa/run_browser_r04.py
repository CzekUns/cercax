"""ORONZO agent 03 / R04: REAL Chromium DOM, resource and touch QA.

Usage: python oronzo/assets/ui/qa/run_browser_r04.py
Requirements: Python Playwright + an installed Chromium executable. No network access.
Because this QA environment forbids *top-level* localhost/HTTPS navigation,
we load the original HTML with page.set_content and fulfill every external
CSS/JS/image request through Playwright routing from the exact local files.
This DOES exercise real Chromium networking/resource requests and DOM handlers,
but DOES NOT certify a deployed GitHub Pages URL or an actual HTTP server.
"""
from __future__ import annotations
import json
import shutil
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / "qa"
QA.mkdir(parents=True, exist_ok=True)
PSEUDO_HOST = "https://oronzo-qa.invalid/"  # requests intercepted, never sent externally
VIEWPORTS = ((640, 360), (800, 360), (844, 390))
FILES = {"demo-v02.css", "demo-v02.js", "coaches-atlas.png", "presidents-atlas.png",
         "journalists-atlas.png", "navy-noise.png", "panel-noise.png",
         "office-desk-v02.png", "pitch-textless.png", "btn-blue-v02.png",
         "btn-gold-v02.png", "btn-disabled-v02.png"}


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise SystemExit("BLOCKED: Playwright Python not available; install playwright") from exc
    chrome = next((p for p in (shutil.which("chromium"), shutil.which("chromium-browser"),
                               shutil.which("google-chrome")) if p), None)
    if not chrome:
        raise SystemExit("BLOCKED: Chromium binary absent; no browser PASS claimed")

    html = (ROOT / "demo-v02.html").read_text(encoding="utf-8")
    assert '<link rel="stylesheet" href="./demo-v02.css">' in html
    assert '<script src="./demo-v02.js"></script>' in html
    html = html.replace("<head>", f'<head><base href="{PSEUDO_HOST}">', 1)
    for name in FILES:
        assert (ROOT / name).is_file(), f"asset missing: {name}"

    all_requests, all_errors, results = set(), [], []
    def mime_for(name):
        return 'image/png' if name.endswith('.png') else 'text/css' if name.endswith('.css') else 'text/javascript'

    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=chrome, headless=True, args=["--no-sandbox"])
        chromium_version = browser.version
        for w, h in VIEWPORTS:
            # Touch-enabled mobile Chromium, unlike screenshots made by PIL.
            context = browser.new_context(viewport={"width": w, "height": h},
                                          device_scale_factor=1, is_mobile=True,
                                          has_touch=True, locale="it-IT")
            page = context.new_page()
            requests, errors = set(), []

            def respond(route):
                name = unquote(urlsplit(route.request.url).path.lstrip('/'))
                requests.add(name)
                if name not in FILES:
                    errors.append(f"unexpected URL: {route.request.url}")
                    route.fulfill(status=404, body='Not found')
                    return
                route.fulfill(status=200, content_type=mime_for(name),
                              body=(ROOT / name).read_bytes())

            page.route("**/*", respond)
            page.on('pageerror', lambda err: errors.append('pageerror: '+str(err)))
            page.on('console', lambda msg: errors.append('console: '+msg.text) if msg.type == 'error' else None)
            page.on('requestfailed', lambda req: errors.append('requestfailed: '+req.url))
            page.set_content(html, wait_until='load')
            assert page.locator('.screen-heading h1').inner_text() == 'IL FISCHIO D’INIZIO'
            box = page.locator('.stage').bounding_box()
            assert box and abs(box['width']/box['height']-16/9) < .005, (w,h,box)
            assert box['x'] >= -.5 and box['y'] >= -.5
            assert box['x']+box['width'] <= w + .5 and box['y']+box['height'] <= h + .5

            def capture(screen):
                path = QA / f"r04-{screen}-{w}x{h}.png"
                page.screenshot(path=str(path), animations='disabled')
                return path

            def controls(screen):
                area=page.locator('#ui-screen').bounding_box()
                assert area,screen
                active=0
                for btn in page.locator('#ui-screen button[data-action],.quick-nav button[data-action]').all():
                    bb=btn.bounding_box()
                    if not bb or not btn.is_visible():
                        continue
                    name=(btn.inner_text() or btn.get_attribute('aria-label') or '').strip()
                    assert bb['width'] >= 43.5 and bb['height'] >= 43.5, (screen,w,h,'touch target',name,bb)
                    assert bb['x'] >= -.5 and bb['x']+bb['width'] <= w+.5, (screen,'horizontal',name,bb)
                    if btn.evaluate("el=>!!el.closest('.scroll')"):
                        continue  # off-screen options intentionally scrollable
                    if btn.evaluate("el=>!!el.closest('.quick-nav')"):
                        assert bb['y']+bb['height'] <= box['y']+box['height'] + 1, (screen,'nav clip',name,bb)
                    else:
                        assert bb['y'] >= area['y']-1, (screen,'top clip',name,bb,area)
                        assert bb['y']+bb['height'] <= area['y']+area['height']+2, (screen,'bottom clip',name,bb,area)
                    active+=1
                return active

            def tap(selector,index=None):
                loc=page.locator(selector)
                if index is not None:loc=loc.nth(index)
                loc.tap(timeout=5000)

            counts={}
            counts['entry']=controls('entry')
            capture('entry')
            tap('button[data-action="sample-load"]')
            assert 'non collegato' in page.locator('#ui-toast').inner_text().lower()
            tap('.quick-nav button[data-value="avatar"]')
            assert page.locator('#ui-toast').is_hidden(), 'load toast leaked to avatar'
            assert page.locator('button.avatar-tile').count() == 8
            before=page.locator('.avatar-profile-data').inner_text()
            tap('.avatar-tile',7)
            assert page.locator('.avatar-tile[aria-pressed="true"]').count() == 1
            after=page.locator('.avatar-profile-data').inner_text()
            assert before != after and 'Remo Filomeni' in after and 'Umbria' in after, ('avatar dynamic',after)
            for stat in ('FORTUNA','LEADERSHIP','AUTOSTIMA','PAZIENZA'):
                assert stat in after
            assert page.locator('.avatar-profile-data .stat-line').count() == 4
            capture('avatar')  # original character art, before synthetic data binding test
            # Dynamic data binding: replace only selected coach via setData; keep 8 entries.
            page.evaluate('''() => {
              const app=window.oronzoUIDemo;
              const selected=app.getState().selectedCoach;
              const coaches=Array.from(document.querySelectorAll('button.avatar-tile'))
                .map((b,i)=>({id:'fixture-'+i,name:b.getAttribute('aria-label'),city:'Fixture',region:'Umbria',macro:'Centro',stats:[1,2,3,4]}));
              coaches[selected]={id:'fixture-selected',name:'MISTER DINAMICO',city:'Comune fixture',region:'Umbria',macro:'Centro',stats:[12,34,56,78]};
              app.setData({coaches});
            }''')
            assert 'MISTER DINAMICO' in page.locator('.avatar-profile-data').inner_text()
            assert 'Comune fixture' in page.locator('.avatar-profile-data').inner_text()
            assert '78' in page.locator('.avatar-profile-data').inner_text()
            counts['avatar']=controls('avatar');capture('avatar-dynamic')

            tap('.quick-nav button[data-value="offers"]')
            assert page.locator('.offer-item').count() == 20
            initial_scroll=page.locator('.scroll').evaluate('(e)=>e.scrollTop')
            tap('.offer-item',19)
            assert page.locator('.offer-item[aria-selected="true"]').count() == 1
            assert page.locator('.scroll').evaluate('(e)=>e.scrollTop') > initial_scroll, '20 offer list not scrolling'
            offer_data=page.evaluate('window.oronzoUIDemo.getPreview()')
            assert offer_data['delta'] in [0,-1,-3] and 'kind' in offer_data,offer_data
            counts['offers']=controls('offers');capture('offers')
            tap('button[data-action="accept-offer"]')
            assert 'PRESIDENTE' in page.locator('.screen-heading h1').inner_text()
            assert page.locator('.stat-line').count() == 3
            counts['president']=controls('president');capture('president')
            tap('button[data-value="press"]')
            for i in range(5):
                assert page.locator('.screen-heading').inner_text().endswith(f'{i+1} / 5'), (w,h,i)
                assert page.locator('.answer-grid button').count() == 3
                counts['press-'+str(i+1)]=controls('press-'+str(i+1))
                capture('press-'+str(i+1))
                tap('.answer-grid button',i%3)
            assert 'UFFICIO DEL MISTER' in page.locator('.screen-heading h1').inner_text()
            assert page.locator('.kpi').count() == 5
            assert page.evaluate('window.oronzoUIDemo.getState().fan') == 53
            counts['hub']=controls('hub');capture('hub')
            for key in ('campionato','rosa','tifoseria','presidente'):
                tap(f'button[data-action="hub"][data-value="{key}"]')
                assert page.locator('.menu-card[aria-pressed="true"]').get_attribute('data-value')==key
                controls('hub-'+key)
            tap('button[data-action="goto"][data-value="prematch"]')
            assert page.locator('#ui-toast').is_hidden(), 'stale press toast persisted across navigation'
            assert page.locator('.kit-player').count()==22
            counts['prematch']=controls('prematch');capture('prematch')
            tap('button[data-action="camera"][data-value="tv"]')
            assert 'CAMERA TV' in page.locator('.camera-tag').inner_text()
            assert page.locator('.kit-player').count()==22
            capture('prematch-tv')
            tap('#ui-screen button[data-action="goto"][data-value="match"]')
            assert 'PARTITA' in page.locator('.screen-heading h1').inner_text()
            assert page.locator('.kit-player').count()==22
            assert 'CAMERA TV' in page.locator('.camera-tag').inner_text()
            counts['match-tv']=controls('match-tv');capture('match-tv')
            tap('button[data-action="camera"][data-value="full"]')
            assert 'CAMPO COMPLETO' in page.locator('.camera-tag').inner_text()
            assert page.locator('.kit-player').count()==22
            counts['match-full']=controls('match-full');capture('match-full')
            assert page.evaluate('window.oronzoUIDemo.getScreen()')=='match'
            # Actual Chromium decoding of non-text UI assets (not just file existence).
            image_dims=page.evaluate('''async () => {
                const list=['coaches-atlas.png','presidents-atlas.png','journalists-atlas.png',
                            'navy-noise.png','panel-noise.png','pitch-textless.png',
                            'office-desk-v02.png','btn-blue-v02.png','btn-gold-v02.png','btn-disabled-v02.png'];
                return await Promise.all(list.map(async name=>{
                    const im=new Image();im.src=name;await im.decode();return [name,im.naturalWidth,im.naturalHeight];
                })); }''')
            assert len(image_dims)==10 and all(a>0 and b>0 for _,a,b in image_dims)
            assert not errors, (w,h,errors)
            all_requests.update(requests)
            all_errors.extend(errors)
            results.append({"viewport":f"{w}x{h}","stage":box,"screenshots":15,
                            "counts":counts,"requestedAssets":sorted(requests),"decodedImages":image_dims,
                            "pageErrors":errors,"touchEmulated":True})
            context.close()
        browser.close()

    assert FILES <= all_requests, 'Some files not loaded by Chromium: '+str(FILES-all_requests)
    summary={"status":"PASS","chromiumVersion":chromium_version,"exe":chrome,
             "servedBy":"Playwright route.fulfill for CSS/JS/PNG (not a real remote HTTP server)",
             "topLevelNavigation":"page.set_content due to sandbox ERR_BLOCKED_BY_ADMINISTRATOR",
             "externalNetworkDeployedHTTPVerified":False,
             "androidPhysicalDeviceVerified":False,
             "uiOnlyNoCareerRuntime":True,"viewportResults":results,"errors":all_errors}
    (QA/'R04-BROWSER-RESULTS.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print('PASS: real Chromium',chromium_version,'3 viewports, touch DOM navigation, 8 coaches, 4 traits, 20 offers/scroll, 5 questions, 4 hub menus, 22 markers, two cameras, assets decoded, console clean')
    print('RESULTS',QA/'R04-BROWSER-RESULTS.json')

if __name__ == '__main__':
    main()
