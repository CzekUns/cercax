"""Offline Chromium QA with real repository PNG bytes; never claims HTTP navigation.
Usage: python oronzo/systems/match-view/browser-qa-offline.py --output /tmp/oronzo-tv
"""
import argparse,base64,hashlib,json,pathlib,re,zipfile
from playwright.sync_api import sync_playwright
P=pathlib.Path(__file__).resolve().parent
ROOT=P.parents[2]
ATLAS=ROOT/'oronzo/assets/players'
SCENARIOS=['opening','left','right','running','restart','halftime','paused','replay','late']
VIEWPORTS=[(640,360),(800,360),(844,390)]

def wrap(filename,exports,dependencies=''):
    code=(P/filename).read_text()
    code=re.sub(r'^import .*?;\s*$', '',code,flags=re.M)
    code=re.sub(r'\bexport (const|class|function)\b',r'\1',code)
    code=code.replace("new URL('../../assets/players/',import.meta.url)","new URL('https://qa.invalid/assets/players/')")
    code=code.replace("new URL('../../assets/cutscenes/',import.meta.url)","new URL('https://qa.invalid/assets/cutscenes/')")
    code=code.replace('new URL(playerBaseUrl,import.meta.url)','new URL(playerBaseUrl)')
    code=code.replace('new URL(cutsceneBaseUrl,import.meta.url)','new URL(cutsceneBaseUrl)')
    return '(function('+dependencies+') {\n'+code+'\nreturn {'+','.join(exports)+'};\n})'

def bundle():
    chunks=[
      'const M_I='+wrap('interpolation.js',['DIRECTIONS','clamp','clamp01','directionFromVector','resolveFacing','spriteAction','SnapshotInterpolator'])+'();',
      'const M_C='+wrap('camera.js',['initialCamera','followCamera','cameraTransform','validateCameraMode','ballWorldPosition','worldToScreen'])+'();',
      'const M_A='+wrap('asset-adapter.js',['createAssetAdapter'],'{DIRECTIONS,clamp}')+'(M_I);',
      'const M_V='+wrap('match-view.js',['createMatchView'],'{SnapshotInterpolator,clamp,resolveFacing,spriteAction},{createAssetAdapter},{initialCamera,followCamera,cameraTransform,validateCameraMode}')+'(M_I,M_A,M_C);',
      'const M_F='+wrap('fixture.js',['makeFixtureSnapshot'],'{clamp01,directionFromVector}')+'(M_I);',
    ]
    images={p.name:'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode() for p in ATLAS.glob('*.png')}
    chunks.append('const QA_PNGS='+json.dumps(images,separators=(',',':'))+';')
    chunks.append('const QA_MANIFEST='+(ATLAS/'manifest.json').read_text()+';')
    chunks.append("""
const QA_LOADER={loadJson:async(url)=>{if(url.href.includes('/players/'))return QA_MANIFEST;throw Error('optional cutscenes absent')},
 loadImage:async(url)=>new Promise((ok,no)=>{const n=new URL(url).pathname.split('/').pop(),src=QA_PNGS[n];if(!src)return no(Error('PNG missing '+n));const img=new Image();img.onload=()=>ok(img);img.onerror=()=>no(Error('PNG decode '+n));img.src=src;})};
const {createMatchView}=M_V,{makeFixtureSnapshot}=M_F,{ballWorldPosition,worldToScreen}=M_C;
""")
    html=(P/'browser-qa.html').read_text()
    script=re.search(r'<script type="module">([\s\S]*?)</script>',html)
    if not script:raise RuntimeError('browser-qa.html module block missing')
    js=script.group(1)
    js=re.sub(r'^import .*?;\s*$', '',js,flags=re.M)
    js=js.replace("createMatchView(el('pitch'),{config:","createMatchView(el('pitch'),{assetLoader:QA_LOADER,config:")
    js=js.replace("await ready;await run('opening');",'')
    return '\n'.join(chunks)+js,html[:script.start()]+html[script.end():]

def main():
    arg=argparse.ArgumentParser();arg.add_argument('--browser',default='/usr/bin/chromium');arg.add_argument('--output',default='/tmp/oronzo-tv-offline');opt=arg.parse_args()
    output=pathlib.Path(opt.output).resolve();output.mkdir(parents=True,exist_ok=True)
    javascript,html=bundle();results=[];errors=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=opt.browser,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        try:
            for width,height in VIEWPORTS:
                context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
                page=context.new_page();page.on('pageerror',lambda err:errors.append(str(err)))
                page.set_content(html);page.add_script_tag(content=javascript)
                page.evaluate('()=>window.ORONZO_MATCH_VIEW_QA.ready')
                for mode in ('full','broadcast'):
                    for name in SCENARIOS:
                        data=page.evaluate('([s,m])=>window.ORONZO_MATCH_VIEW_QA.run(s,m)',[name,mode])
                        checks={
                            'assetReady':data['assetState']=='ready',
                            'real22':data['players']==22 and data['drawn']>=22 and data['allRealSprites'],
                            'ballDrawn':data['ballDraws']>=1,
                            'ballVisible':data['ballVisible'],
                            'scoreIntact':data['snapshotScoreUnchanged'],
                            'sourceIntact':data['sourceIntact'],
                            'canvasContained':data['canvasInViewport'],
                            'zoom':data['camera']['zoom']==(1 if mode=='full' else 2),
                            'pause':name!='paused' or data['pauseCameraStable'],
                            'replay':name!='replay' or data['rewindOverlayCleared']}
                        png=output/f'{width}x{height}-{mode}-{name}.png';page.screenshot(path=str(png),animations='disabled')
                        results.append({'viewport':[width,height],'mode':mode,'scenario':name,'checks':checks,
                            'assetState':data['assetState'],'realSprites':data['realSprites'],'drawn':data['drawn'],
                            'screenshot':png.name,'sha256':hashlib.sha256(png.read_bytes()).hexdigest()})
                context.close()
        finally:browser.close()
    passed=len(results)==54 and not errors and all(all(r['checks'].values()) for r in results)
    report={'method':'Chromium set_content / real PNG data URLs; HTTP browser gate NOT tested',
            'passed':passed,'scenarios':results,'errors':errors,
            'assetGitBlobs':{p.name:hashlib.sha1(b'blob '+str(p.stat().st_size).encode()+b'\0'+p.read_bytes()).hexdigest() for p in ATLAS.glob('*.png')}}
    (output/'results.json').write_text(json.dumps(report,indent=2))
    with zipfile.ZipFile(str(output)+'.zip','w',compression=zipfile.ZIP_DEFLATED) as z:
        for x in output.iterdir():z.write(x,x.name)
    print('OFFLINE CHROMIUM QA', 'PASS' if passed else 'FAIL','cases',len(results),'output',output)
    if not passed:raise SystemExit(1)
if __name__=='__main__':main()
