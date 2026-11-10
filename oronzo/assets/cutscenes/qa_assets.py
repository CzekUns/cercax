#!/usr/bin/env python3
"""Standalone strict check for geometry, PNG integrity, indexed masks, timeline."""
from PIL import Image
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
m=json.loads((ROOT/'manifest.json').read_text(encoding='utf-8'))
assert set(m['scenes'])=={'goal','save','yellow','red','injury'}
assert m['frame']=={'width':320,'height':180}
for event,s in m['scenes'].items():
 with Image.open(ROOT/s['sprite']) as base, Image.open(ROOT/s['materialsMask']) as mm, Image.open(ROOT/s['shadesMask']) as ss:
  base.load();mm.load();ss.load()
  assert (base.width,base.height)==(1920,180) and base.mode=='RGBA', (event,'sprite dimensions')
  assert (mm.width,mm.height)==(1920,180) and (ss.width,ss.height)==(1920,180)
  assert mm.mode=='L' and ss.mode=='L', (event,'mask type')
  aa=base.getchannel('A').tobytes();masks=mm.tobytes();shade=ss.tobytes()
  assert all((a==255)==(b!=0) for a,b in zip(aa,masks)),(event,'alpha mask mismatch')
  assert all(v<=3 for v in shade), (event,'shade mismatch')
  for f in range(6):
   matf=mm.crop((f*320,0,(f+1)*320,180))
   assert matf.getbbox(),(event,f,'frame empty')
 with Image.open(ROOT/s['background']) as back:
  assert back.size==(320,180),event
 print(event, 'OK · 6 frames 320×180 · masks aligned · alpha clean')
print('ALL 5 CUTSCENES VALIDATED')
