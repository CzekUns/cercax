"""Static validation of Oronzo R02 assets. Run: python oronzo/assets/ui/qa/check_assets.py"""
from pathlib import Path
import json
from PIL import Image
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'ui-v02-manifest.json').read_text(encoding='utf-8'))
assert m['stage']['aspectRatio']=='16:9'
assert len(m['screens'])==8
assert len({s['id'] for s in m['screens']})==8
assert m['runtimeIntegrated'] is False
expected={'coaches-atlas.png':(416,256),'presidents-atlas.png':(208,256),'journalists-atlas.png':(312,256),'navy-noise.png':(96,96),'panel-noise.png':(96,96),'pitch-textless.png':(496,272),'btn-blue-v02.png':(164,44),'btn-gold-v02.png':(164,44),'btn-disabled-v02.png':(164,44),'office-desk-v02.png':(375,160)}
for file,size in expected.items():
    with Image.open(root/file) as img:
        assert img.format=='PNG',(file,img.format)
        assert img.size==size,(file,img.size,size)
        img.verify()
for role,entry in m['art']['portraits'].items():
    assert entry['cols']*entry['rows']>=entry['count']
    with Image.open(root/entry['path']) as img:
        assert img.mode=='RGBA',role
        assert img.size == (entry['cell'][0]*entry['cols'],entry['cell'][1]*entry['rows'])
for k in ['html','css','js']:
    assert (root/f'demo-v02.{k}').exists()
assert 'window.OronzoUIKitV02' not in (root/'demo-v02.html').read_text(encoding='utf8') # no runtime-inlined game state
print('PASS: 10 original R02 PNG dimensions and formats, 3 portrait atlases, 8 screens, manifest and demo files')
