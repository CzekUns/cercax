from pathlib import Path
from PIL import Image
import json, hashlib

root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'manifest.json').read_text())
assert manifest['canvas']==[128,160]
assert manifest['schema'].startswith('oronzo-r13ter')
assert manifest['assetRegistration']['faces']['07']['dx']==-10
assert manifest['assetRegistration']['hair']['09']['dx']==-7

for name,n in [('faces',8),('hair',12),('facial-hair',8),('torsos',6)]:
    entries=manifest['groups'][name]
    assert len(entries)==n, name
    identities=set()
    for item in entries:
        path=root/item['file']
        raw=path.read_bytes()
        image=Image.open(path).convert('RGBA')
        assert image.size==(128,160), path
        assert image.getchannel('A').getextrema()==(0,255), path
        # Git-blob hash is insensitive to on-disk repackaging of previous source artworks:
        # it is tied to the actual PNG bytes committed in THIS repo, not prior ZIP prototypes.
        blob_sha=hashlib.sha1(f'blob {len(raw)}\\0'.encode()+raw).hexdigest()
        assert blob_sha==item['gitBlobSha1'], path
        assert Image.open(root/item['mask']).size==(128,160), item['mask']
        assert image.getbbox() is not None
        identities.add(blob_sha)
        if name=='faces':
            anchors=item['anatomy']
            assert 50<=anchors['mouthCenter'][0]<=80
            assert 70<=anchors['mouthCenter'][1]<=90
            assert 91<=anchors['chinCenter'][1]<=105
    assert len(identities)==n, name

for i in range(6):
    for variant in ('solid','vertical','horizontal','halves'):
        assert Image.open(root/f'kits/{i:02}-{variant}.png').size==(128,160)
assert Image.open(root/'previews/gallery-20.png').size==(880,800)
assert Image.open(root/'previews/transfer-identity.png').size==(576,206)
print('R13-TER PNG integrity PASS: 34 layered artworks, 34 masks, 24 kit masks')
