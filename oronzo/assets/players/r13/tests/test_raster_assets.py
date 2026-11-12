from pathlib import Path
from PIL import Image
import json,hashlib
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'manifest.json').read_text())
assert manifest['canvas']==[128,160]
for name,n in [('faces',8),('hair',12),('facial-hair',8),('torsos',6)]:
    entries=manifest['groups'][name]
    assert len(entries)==n
    distinct=set()
    for item in entries:
        file=root/item['file']
        img=Image.open(file).convert('RGBA')
        assert img.size==(128,160)
        assert img.getchannel('A').getextrema()==(0,255)
        sha=hashlib.sha256(file.read_bytes()).hexdigest()
        assert sha==item['sha256']
        distinct.add(sha)
        assert Image.open(root/item['mask']).size==(128,160)
    assert len(distinct)==n
for i in range(6):
    for variant in ('solid','vertical','horizontal','halves'):
        assert Image.open(root/f'kits/{i:02d}-{variant}.png').size==(128,160)
assert Image.open(root/'previews/gallery-20.png').size==(880,800)
assert Image.open(root/'previews/transfer-identity.png').size==(576,206)
print('R13-BIS raster asset integrity PASS: 34 parts, 34 masks, 24 kit masks, 20-portrait gallery')
