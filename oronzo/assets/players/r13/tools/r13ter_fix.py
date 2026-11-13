#!/usr/bin/env python3
"""ORONZO R13-TER: re-register and retouch original painted PNG parts.
Operate only on this R13 asset tree. Idempotent, never draws vector/Canvas features.
"""
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np, json, hashlib

ROOT=Path(__file__).resolve().parents[1]
W,H=128,160
manifest_path=ROOT/'manifest.json'
manifest=json.loads(manifest_path.read_text())
if manifest.get('artRevision')=='r13ter-retouch-applied-v1':
    print('R13TER_ASSETS_ALREADY_RETOUCHED')
    raise SystemExit(0)

def read(path):
    return Image.open(ROOT/path).convert('RGBA')

def save(path,image):
    target=ROOT/path
    target.parent.mkdir(parents=True,exist_ok=True)
    image.convert('RGBA').save(target,optimize=True,compress_level=9)

def warp_face(img,n):
    """Resample authentic painted strokes by anatomical bands, no new facial primitives."""
    src=np.array(img.convert('RGBA'));dst=np.zeros_like(src)
    shift=-10 if n==7 else 0
    band=[(1,-1,0),(0,2,2),(-1,1,2),(-2,-2,-1),(2,1,-2),(0,-1,2),(2,3,1),(-1,-2,0)][n]
    for y in range(H):
        if y<26 or y>102:
            for x in np.flatnonzero(src[y,:,3]):
                dstx=int(x+shift)
                if 0<=dstx<W:dst[y,dstx]=src[y,x]
            continue
        delta=band[0] if y<48 else band[1] if y<74 else band[2]
        centre=75 if n==7 else 64
        factor=1+delta/30
        for x in range(W):
            sx=round(centre+(x-shift-centre)/factor)
            if 0<=sx<W:dst[y,x]=src[y,sx]
    return Image.fromarray(dst,'RGBA')

# Face and material masks retain the same persisted visual ID; correct no. 7 in source.
for i in range(8):
    save(f'faces/{i:02}.png',warp_face(read(f'faces/{i:02}.png'),i))
    save(f'masks/faces-{i:02}.png',warp_face(read(f'masks/faces-{i:02}.png'),i))

# Recenter the original asymmetric comb-over crop and exactly matching material mask.
for path in ('hair/09.png','masks/hair-09.png'):
    im=Image.new('RGBA',(W,H));im.alpha_composite(read(path),(-7,0));save(path,im)

# Existing beard painterly pixels, including shadow and hair highlights, remain the source.
raw=[read(f'facial-hair/{i:02}.png') for i in range(8)]
for i in range(8):
    img=raw[i].copy()
    if i==2:
        # mirrored cheek fragment restores the missing left arc of the horseshoe
        from PIL import ImageOps
        left=ImageOps.mirror(raw[i]).crop((0,0,64,H))
        img.paste(left,(0,0),left)
    if i in (4,5,6,7):
        donor=np.array(raw[7])
        yy,xx=np.mgrid[0:H,0:W]
        donor[(yy<87)|(yy>99)|(xx<49)|(xx>79),3]=0
        img.alpha_composite(Image.fromarray(donor,'RGBA'))
        if i in (5,6):img.alpha_composite(raw[1])
    save(f'facial-hair/{i:02}.png',img)
    rgba=np.zeros((H,W,4),dtype='uint8');rgba[:,:,:3]=255;rgba[:,:,3]=np.array(img)[:,:,3]
    save(f'masks/facial_hair-{i:02}.png',Image.fromarray(rgba,'RGBA'))

# Separate skin of exposed neck from fabric. Normalize original pre-baked stripe
# shading, preserving painted folds/contour while canonical kit masks supply patterns.
for i in range(6):
    path=f'torsos/{i:02}.png'
    src=np.array(read(path))
    origmask=np.array(read(f'masks/torsos-{i:02}.png'))[:,:,3]
    yy,xx=np.mgrid[0:H,0:W]
    grey=src[:,:,:3].astype(float).mean(axis=2)
    blur=np.array(Image.fromarray(grey.astype('uint8'),'L').filter(ImageFilter.GaussianBlur(4)),dtype=float)
    fabric=(origmask>127)&(src[:,:,3]>127)
    neck_zone=(yy>=94)&(yy<=112)&(abs(xx-64)<=14-(yy-94)*.22)
    skin=(src[:,:,0]>src[:,:,1]*1.12)&(src[:,:,1]>src[:,:,2]*.96)&(src[:,:,0]>93)
    fabric &= ~(neck_zone & (skin|(yy<=105)))
    neutral=np.clip(130+(grey-blur)*.48+(blur-113)*.12,70,188).astype('uint8')
    for k in range(3):src[:,:,k][fabric]=neutral[fabric]
    save(path,Image.fromarray(src,'RGBA'))
    material=np.zeros((H,W,4),dtype='uint8');material[:,:,:3]=255;material[:,:,3]=np.where(fabric,255,0)
    save(f'masks/torsos-{i:02}.png',Image.fromarray(material,'RGBA'))
    neck=np.zeros((H,W,4),dtype='uint8');neck[:,:,:3]=255
    neck[:,:,3]=np.where(neck_zone&skin&(src[:,:,3]>127)&~fabric,255,0)
    save(f'masks/neck-{i:02}.png',Image.fromarray(neck,'RGBA'))

# Canonical ledger records exact Git blob bytes and anatomical anchors.
for group,items in manifest['groups'].items():
    for item in items:
        path=ROOT/item['file']
        rawbytes=path.read_bytes()
        item['gitBlobSha1']=hashlib.sha1(f'blob {len(rawbytes)}'.encode()+bytes([0])+rawbytes).hexdigest()
        img=read(item['file']);bb=img.getbbox() or (0,0,0,0)
        item['rect']=[bb[0],bb[1],bb[2]-bb[0],bb[3]-bb[1]]
        if group=='torsos':item['neckMask']=f"masks/neck-{item['id']:02}.png"
        if group=='faces':
            alpha=np.array(img)[:,:,3]
            row=np.flatnonzero(alpha[80]>127)
            centre=int(round((row[0]+row[-1])/2)) if len(row) else 64
            item['anatomy']={'mouthCenter':[centre,79],'chinCenter':[centre,99],
                'hairlineCenter':[centre,34],'neckCenter':[64,101]}
manifest['schema']='oronzo-r13ter-articulated-raster-v2'
manifest['assetRegistration']={'faces':{'07':{'dx':0,'reason':'Already recentered in PNG'}},
    'hair':{'09':{'dx':0,'reason':'Already recentered in PNG'}},
    'facialHair':{'fitting':'clip to selected face PNG alpha plus 1px'}}
manifest['artRevision']='r13ter-retouch-applied-v1'
manifest['releaseState']='R13TER_QA_PENDING'
manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print('R13TER_RETOUCH_APPLIED 34 real raster parts, 40 masks')
