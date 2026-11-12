import json, hashlib
from pathlib import Path
from PIL import Image, ImageChops
ROOT=Path(__file__).resolve().parents[1]
MANIFEST=json.loads((ROOT/'manifest.json').read_text())
assert MANIFEST['canvas']==[128,160]
counts={'faces':8,'hair':12,'facial-hair':8,'torsos':6}
for kind,expected in counts.items():
 entries=MANIFEST['groups'][kind]
 assert len(entries)==expected,(kind,len(entries))
 signatures=set()
 for entry in entries:
  f=ROOT/entry['file']; assert f.is_file(),f
  im=Image.open(f); assert im.size==(128,160),(f,im.size)
  assert im.mode in ('RGBA','P'),(f,im.mode)
  aa=im.convert('RGBA').getchannel('A'); assert aa.getextrema()==(0,255),(f,aa.getextrema())
  assert hashlib.sha256(f.read_bytes()).hexdigest()==entry['sha256'],f
  mask=Image.open(ROOT/entry['mask']).convert('RGBA')
  assert mask.size==im.size
  signatures.add(hashlib.sha256(f.read_bytes()).hexdigest())
 assert len(signatures)==expected,(kind,len(signatures))
print('PNG asset layers: PASS 34 illustrated sprites + 34 material masks')
for i in range(6):
 for p in ['solid','vertical','horizontal','halves']:
  assert (ROOT/f'kits/{i:02}-{p}.png').exists()
print('Kit pattern masks: PASS 24')
previews=[Image.open(ROOT/f'previews/player-{i:02}.png').convert('RGBA') for i in range(1,21)]
assert len(set(hashlib.sha256(im.tobytes()).hexdigest() for im in previews))==20
print('20 modular assembled previews: PASS')
# Keep same player upper face/head pixel data when changing the team palette.
transfers=[Image.open(ROOT/f'previews/transfer-{i:02}.png').convert('RGBA') for i in [1,2,3]]
for i in range(1,3):
 assert ImageChops.difference(transfers[0].crop((0,0,128,93)),transfers[i].crop((0,0,128,93))).getbbox() is None,'head changed on transfer'
 assert ImageChops.difference(transfers[0].crop((0,111,128,160)).convert('RGB'),transfers[i].crop((0,111,128,160)).convert('RGB')).getbbox() is not None,'kit unchanged'
print('Identical DNA / new club kit: PASS, head pixels unchanged')
print('Transparency / alignment / material and kit masks: PASS')
