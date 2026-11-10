#!/usr/bin/env python3
"""Oronzo: deterministic original pixel-art cutscene raster generator.
All foreground pixels encode (material,shade) so recoloring is lossless.
Needs Pillow; writes within this folder only.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import json, random, math, collections
ROOT=Path(__file__).resolve().parent
W,H=320,180
N=6
MATS={"transparent":0,"skin":1,"hair":2,"shirt":3,"shirtB":4,"shorts":5,"socks":6,"boots":7,"outline":8,"gloves":9,"ball":10,"yellowCard":11,"redCard":12,"eyes":13,"trim":14,"refereeShirt":15,"refereeShorts":16,"refereeSocks":17}
PALETTES={
 'skin':['#ffe2ac','#eeb881','#b77550','#784838'],
 'hair':['#74503e','#50352e','#33272e','#191d26'],
 'shirt':['#92baff','#3769cb','#234d9f','#193169'],
 'shirtB':['#f1f2f0','#ccd4df','#8b94b0','#59657f'],
 'shorts':['#fffaf0','#e4e8e3','#a9b2c5','#65738f'],
 'socks':['#8daefa','#3260c9','#244ba3','#172d74'],
 'boots':['#7e8796','#394452','#252a32','#161c29'],
 'outline':['#1f2028','#1d1e28','#161720','#10121b'],
 'gloves':['#fff9f0','#e0e6dd','#abb9b7','#596c6e'],
 'ball':['#ffffff','#e0e5e4','#424c5a','#151821'],
 'yellowCard':['#fffdb8','#ffeb34','#d6a81b','#855e19'],
 'redCard':['#ffb6a3','#f34b48','#c92335','#701d2f'],
 'eyes':['#fbfbec','#cfd5db','#4b4850','#161921'],
 'trim':['#ffffff','#d0dce2','#7a9ab4','#40536b'],
 'refereeShirt':['#7b818e','#313744','#1b202e','#11131d'],
 'refereeShorts':['#626b77','#373e4a','#252b37','#141820'],
 'refereeSocks':['#667480','#3b4353','#222935','#141b23']
}
REFEREE=dict(PALETTES,shirt=['#696f82','#313744','#1a1d2b','#11131d'],shirtB=['#d7dee8','#969fae','#596779','#333c4c'],shorts=['#616878','#353947','#1c2030','#111521'],socks=['#626a76','#383f4d','#242833','#10131c'])
KEEPER=dict(PALETTES,shirt=['#abf899','#3fbd62','#217d45','#174f34'],shirtB=['#e7fee2','#abe2b1','#67a984','#386a55'],shorts=['#474958','#2b303e','#1f2830','#111924'],socks=['#f7f4e2','#dde2ce','#aaaeb0','#66757a'])
HEX=lambda h:tuple(bytes.fromhex(h.lstrip('#')))

def draw_stadium(goal=False):
 im=Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
 # Color-block terraces with carefully shaded crowd and grandstand.
 d.rectangle((0,0,319,9),fill='#1b3353');d.rectangle((0,10,319,15),fill='#31425b')
 d.rectangle((0,16,319,88),fill='#28344c');d.rectangle((0,19,319,73),fill='#354364')
 d.rectangle((0,78,319,82),fill='#a5a9aa');d.rectangle((0,83,319,88),fill='#485876')
 rng=random.Random(1985)
 coats=['#49669d','#7c4e60','#8a7445','#4a6b60','#a66b54','#6d577e','#bba577','#536f8b','#d4c096']
 skin=['#cf906b','#e4b88b','#a46752','#f0c99d','#865941']
 # Crowd: tiny recognizable heads, shoulders, raised arms, scarves, varied rows.
 for row in range(7):
  yy=18+row*9
  for j in range(55):
   x=j*6+(3 if row%2 else 0)+rng.randrange(-2,3)
   if x<0 or x>319:continue
   jacket=rng.choice(coats);face=rng.choice(skin)
   d.rectangle((x-2,yy+4,x+3,yy+9),fill=jacket)
   d.rectangle((x-1,yy+1,x+2,yy+4),fill=face)
   d.line((x-1,yy+1,x+2,yy+1),fill=rng.choice(['#191e31','#413027','#71523a']))
   if rng.random()<0.19:
    d.line((x+1,yy+3,x+4,yy-2),fill=face,width=1)
   if rng.random()<0.13:
    d.line((x-2,yy+5,x+4,yy+5),fill='#eee5c7',width=1)
 for yy in (36,59,78):
  d.line((0,yy,319,yy),fill='#1a2439',width=2)
 # handrails and 1980s advertising boards, no actual logo or words
 d.rectangle((0,89,319,92),fill='#d5d0ae');d.line((0,90,319,90),fill='#fcf3c4')
 d.rectangle((0,94,319,117),fill='#546c84')
 colors=['#304e7c','#bd714e','#45637b','#8a695c','#627b7f']
 for j in range(7):
  x=j*49-7;c=colors[j%len(colors)]
  d.rectangle((x,97,x+45,113),fill=c)
  d.rectangle((x+2,99,x+43,100),fill='#9cb5bf')
  d.line((x+8,106,x+29,106),fill='#d5ded2',width=2)
  d.line((x+11,109,x+34,109),fill='#91acb5')
 d.rectangle((0,114,319,120),fill='#c7c9b6');d.line((0,117,319,117),fill='#445766',width=2)
 # Striped turfs and isolated pixels for soccer-pitch feel.
 for k,(a,b) in enumerate([(121,133),(134,146),(147,161),(162,179)]):
  d.rectangle((0,a,319,b),fill=['#398043','#478e49','#36753e','#3e8141'][k])
 grass=['#266b35','#529352','#6b9e58','#418247','#296b36']
 for i in range(3100):
  x=rng.randrange(W);y=rng.randrange(121,H)
  d.point((x,y),fill=rng.choice(grass))
 d.line((0,165,319,165),fill='#729b65',width=1)
 if goal:
  # Net behind foreground silhouettes with believable perspective
  d.rectangle((193,57,314,141),outline='#f0f1dd',width=3)
  for xx in range(201,314,11):d.line((xx,60,xx,140),fill='#c8d5d5',width=1)
  for yy in range(64,141,10):d.line((195,yy,312,yy),fill='#cbd7d1',width=1)
  d.line((193,142,318,148),fill='#a2c9b5',width=1)
 return im

class Sprite:
 def __init__(self): self.im=Image.new('L',(W,H),0)
 def poly(self,p,m,s=1):ImageDraw.Draw(self.im).polygon([tuple(map(int,q)) for q in p],fill=(MATS[m]*4+s))
 def rect(self,box,m,s=1):
  x1,y1,x2,y2=map(int,box);ImageDraw.Draw(self.im).rectangle((min(x1,x2),min(y1,y2),max(x1,x2),max(y1,y2)),fill=MATS[m]*4+s)
 def ellipse(self,box,m,s=1):ImageDraw.Draw(self.im).ellipse(tuple(map(int,box)),fill=MATS[m]*4+s)
 def line(self,pts,m,s=1,width=1):ImageDraw.Draw(self.im).line([tuple(map(int,q)) for q in pts],fill=MATS[m]*4+s,width=width,joint='curve')
 def bone(self,a,b,rad,m,shade=1):
  # hand-pixelled segmented limb: black rim, warm flat + edge-light + undershadow.
  a=tuple(map(int,a));b=tuple(map(int,b));d=ImageDraw.Draw(self.im)
  d.line((a,b),fill=MATS['outline']*4+2,width=rad+4)
  for p in (a,b):d.ellipse((p[0]-(rad+4)//2,p[1]-(rad+4)//2,p[0]+(rad+4)//2,p[1]+(rad+4)//2),fill=MATS['outline']*4+2)
  d.line((a,b),fill=MATS[m]*4+2,width=rad)
  for p in (a,b):d.ellipse((p[0]-rad//2,p[1]-rad//2,p[0]+rad//2,p[1]+rad//2),fill=MATS[m]*4+2)
  d.line(((a[0]-1,a[1]-1),(b[0]-1,b[1]-1)),fill=MATS[m]*4+0,width=max(2,rad//3))
  d.line(((a[0]+rad//3,a[1]+1),(b[0]+rad//3,b[1]+1)),fill=MATS[m]*4+3,width=max(1,rad//4))
 def outline(self):
  # Only silhouette outermost pixel, preserved into material index atlas.
  import numpy as np
  a=np.array(self.im);b=a>0;edges=np.zeros_like(b)
  edges[1:,:]|=b[1:,:]&(~b[:-1,:]);edges[:-1,:]|=b[:-1,:]&(~b[1:,:]);edges[:,1:]|=b[:,1:]&(~b[:,:-1]);edges[:,:-1]|=b[:,:-1]&(~b[:,1:]);
  a[edges]=MATS['outline']*4+2;self.im=Image.fromarray(a,'L')
 def merge(self, other):self.im.paste(other.im,(0,0),other.im.point(lambda v:255 if v else 0))

def player_at(x,y,phase=0,raised=False,fall=0,keeper=False, ref=False, facing=1,card=None, arm_raise=0,striped=False):
 """Produce original full-height pixel character; x,y are scene-anchor on grass."""
 s=Sprite(); t=phase*math.pi/3
 # local coordinates, incl. variable shoulder/hip positions with momentum
 sway=math.sin(t)*2
 hip=(x-2,y-37)
 shoulder=(x+5+int(sway),y-66)
 nose=1 if facing>0 else -1
 h=(shoulder[0]+4*nose,shoulder[1]-14)
 # legs first (rear behind torso) in 90px tall articulated body
 stride=math.sin(t)
 if ref:
  kneeL=(x-5,y-17);footL=(x-7,y-1);kneeR=(x+8,y-18);footR=(x+10,y-1)
 elif raised:
  kneeL=(x-20,y-20);footL=(x-32,y-7);kneeR=(x+13,y-15);footR=(x+20,y)
 else:
  kneeL=(x+int(stride*15)-4,y-19+int(abs(stride)*2));footL=(x+int(stride*20)-8,y-2-int(stride*8))
  kneeR=(x-int(stride*13)+12,y-19-int(abs(stride)*3));footR=(x-int(stride*20)+16,y-2+int(stride*7))
 if facing<0:
  def flip(p):return (2*x-p[0],p[1])
  hip,shoulder,h,kneeL,footL,kneeR,footR=map(flip,(hip,shoulder,h,kneeL,footL,kneeR,footR))
 # far leg and boot.
 sockmat='refereeSocks' if ref else 'socks'
 shorts_mat='refereeShorts' if ref else 'shorts'
 shirt_mat='refereeShirt' if ref else 'shirt'
 for knee,foot in [(kneeL,footL),(kneeR,footR)]:
  s.bone(hip,knee,9,'skin')
  s.bone(knee,(foot[0],foot[1]-9),7,sockmat)
  s.bone((foot[0],foot[1]-9),foot,7,sockmat)
  s.poly([(foot[0]-6,foot[1]-3),(foot[0]+nose*9,foot[1]-3),(foot[0]+nose*11,foot[1]+2),(foot[0]-6,foot[1]+2)],'boots',2)
  s.line([(foot[0]-2,foot[1]+1),(foot[0]+nose*8,foot[1]+1)],'boots',3,2)
  s.line([(knee[0]-3,knee[1]-1),(knee[0]+4,knee[1]-1)],'skin',0,2)
 # sport shorts, side piping/shading
 hips=[(hip[0]-12,hip[1]-4),(hip[0]+10,hip[1]-4),(hip[0]+12,hip[1]+13),(hip[0]-10,hip[1]+14)]
 s.poly(hips,'outline',2)
 s.poly([(hip[0]-10,hip[1]-2),(hip[0]+8,hip[1]-2),(hip[0]+10,hip[1]+10),(hip[0]-8,hip[1]+11)],shorts_mat,1)
 s.line([(hip[0]-6,hip[1]+2),(hip[0]-5,hip[1]+10)],shorts_mat,0,2)
 s.line([(hip[0]+8,hip[1]+2),(hip[0]+8,hip[1]+11)],shorts_mat,3,2)
 # torso textile: shaped side-view trapezoid tilted in motion.
 sh=(shoulder[0],shoulder[1]);hp=(hip[0],hip[1])
 p=[(sh[0]-11,sh[1]-3),(sh[0]+11,sh[1]-1),(hp[0]+10,hp[1]+3),(hp[0]-10,hp[1]+2)]
 s.poly([(a-2,b-2) for a,b in p],'outline',3)
 s.poly(p,shirt_mat,1)
 s.poly([p[0],(sh[0]-7,sh[1]+1),(hp[0]-6,hp[1]),p[-1]],shirt_mat,2)
 s.line([(sh[0]-6,sh[1]+1),(hp[0]-7,hp[1]-1)],shirt_mat,0,2)
 s.line([(sh[0]+8,sh[1]+2),(hp[0]+8,hp[1])],shirt_mat,3,3)
 if striped:
  for xx in range(-4,10,7):s.line([(sh[0]+xx,sh[1]+5),(hp[0]+xx,hp[1]-1)],'shirtB',1,3)
 s.line([(sh[0]-4,sh[1]-1),(sh[0]+2,sh[1]+2)],'trim',2,3)
 # far arm, bent sidewise. Referee raised-card arm includes a believable bend.
 if ref:
  shL=(sh[0]-9,sh[1]+5); shR=(sh[0]+7,sh[1]+6)
  a=(shL[0]-5,shL[1]+20);hand=(a[0]+4,a[1]+9)
  s.bone(shL,a,6,'skin');s.bone(a,hand,5,'skin')
  arm_raise=min(1,max(0,arm_raise))
  elbow=(int(shR[0]+(9*arm_raise)+5),int(shR[1]+14-24*arm_raise))
  hand2=(int(elbow[0]+6+2*arm_raise),int(elbow[1]+10-27*arm_raise))
  s.bone(shR,elbow,7,'skin');s.bone(elbow,hand2,6,'skin')
  # whistle chord and referee badge
  s.rect((sh[0]+4,sh[1]+8,sh[0]+8,sh[1]+13),'trim',1)
  s.line([(sh[0]-1,sh[1]+2),(sh[0]+1,sh[1]+19)],'outline',2,1)
  if card and arm_raise>0.15:
   mat='yellowCard' if card=='yellow' else 'redCard';xx,yy=hand2
   s.rect((xx-2,yy-10,xx+5,yy-1),'outline',3)
   s.rect((xx-1,yy-9,xx+4,yy-2),mat,1)
   s.line([(xx,yy-8),(xx+2,yy-8)],mat,0,1)
 else:
  swing=math.cos(t)
  # far arm
  ash=(sh[0]-7,sh[1]+4);el=(ash[0]-8-int(swing*8),ash[1]+11);hand=(el[0]-4-int(swing*4),el[1]+8)
  s.bone(ash,el,6,'skin');s.bone(el,hand,5,'skin')
  if keeper:s.ellipse((hand[0]-5,hand[1]-5,hand[0]+5,hand[1]+5),'gloves',1)
  # front arm with colored sleeve, prominent fist
  ash=(sh[0]+8,sh[1]+3)
  if raised:el=(ash[0]+8,ash[1]-16);hand=(el[0]+9,el[1]-12)
  else:el=(ash[0]+5+int(swing*8),ash[1]+13);hand=(el[0]+7+int(swing*4),el[1]-6)
  s.bone(ash,el,7,'skin');s.bone(el,hand,6,'skin');s.ellipse((hand[0]-4,hand[1]-5,hand[0]+4,hand[1]+4),'gloves' if keeper else 'skin',1)
  s.poly([(ash[0]-4,ash[1]-3),(ash[0]+3,ash[1]-2),(ash[0]+5,ash[1]+7),(ash[0]-3,ash[1]+8)],shirt_mat,2)
  s.line([(ash[0]-3,ash[1]+7),(ash[0]+5,ash[1]+7)],'trim',1,2)
 # head and profile with ear, cheek, jaw, hair tufts
 hx,hy=h
 s.ellipse((hx-9,hy-9,hx+9,hy+10),'outline',3)
 s.ellipse((hx-8,hy-7,hx+7,hy+8),'skin',1)
 s.poly([(hx+6*nose,hy-2),(hx+10*nose,hy+1),(hx+7*nose,hy+4)],'skin',1)
 s.ellipse((hx-7,hy+0,hx-3,hy+5),'skin',2)
 s.ellipse((hx-8,hy-11,hx+6,hy-4),'hair',2)
 for dx,dy in [(-8,-5),(-6,-9),(-3,-10),(2,-10),(7,-7)]:s.rect((hx+dx,hy+dy,hx+dx+4,hy+dy+3),'hair',1)
 s.line([(hx-5,hy-7),(hx+4,hy-7)],'hair',0,2)
 s.line([(hx-7,hy+1),(hx-4,hy+4)],'hair',3,2)
 s.rect((hx+4*nose,hy,hx+5*nose,hy+1),'eyes',3)
 s.line([(hx+2*nose,hy+6),(hx+7*nose,hy+6)],'skin',3,1)
 s.rect((hx-2,hy+10,hx+2,hy+14),'skin',2)
 s.outline()
 return s

def transformed(sprite, angle=0, dx=0,dy=0,center=(155,120),bottom=None):
 # Pixel-for-pixel rigid motion; no resampling blur; keep characters within turf.
 a=sprite.im.rotate(angle,Image.Resampling.NEAREST,expand=False,center=center)
 if bottom is not None:
  box=a.getbbox()
  if box:dy=bottom-box[3]
 out=Sprite();out.im.paste(a,(int(dx),int(dy)))
 return out

def ball(s,x,y):
 x,y=int(x),int(y)
 s.ellipse((x-7,y-7,x+7,y+7),'outline',3)
 s.ellipse((x-6,y-6,x+6,y+6),'ball',0)
 s.poly([(x-2,y-2),(x+2,y-4),(x+5,y),(x+2,y+4),(x-2,y+2)],'ball',3)
 for xx,yy in [(-4,-3),(4,4),(-3,4)]:s.rect((x+xx,y+yy,x+xx+2,y+yy+2),'ball',2)

def scene(name,i):
 s=Sprite();t=i/5
 if name=='goal_celebrate':
  x=106+16*i;y=153
  s.merge(player_at(x,y,phase=i,raised=(i>=4)))
 elif name=='goalkeeper_save':
  # A six-keyframe professional keeper save (ready -> dive -> catch -> ground).
  x=105+[0,5,25,39,57,68][i];y=[153,152,148,143,154,157][i]
  p=player_at(x,y,phase=i,keeper=True,raised=i>=2)
  if i in [2,3,4,5]:p=transformed(p,angle=[0,0,-25,-46,-70,-85][i],dx=[0,0,4,7,8,4][i],center=(x,y-40),bottom=[153,153,145,138,150,156][i])
  s.merge(p)
  ball(s,x+[35,38,46,50,40,28][i], [97,96,105,101,113,134][i])
 elif name in ('yellow_card','red_card'):
  # distinct raised-card keyframes, second footballer reacts.
  f=[0,0.18,0.40,0.72,1.0,1.0][i]
  s.merge(player_at(99,157,phase=0,ref=True,arm_raise=f,card=('yellow' if name=='yellow_card' else 'red')))
  s.merge(player_at(221+[0,0,1,1,2,2][i],157,phase=1,ref=False,facing=-1,raised=False))
 elif name=='injury':
  x=112+[0,9,15,22,28,28][i];y=153
  # real key poses: stumble then sideways loss of balance and ground.
  if i<2:s.merge(player_at(x,y,phase=i+1))
  else:
   p=player_at(x,y,phase=(0 if i>=4 else i))
   angle=[0,0,-22,-45,-72,-83][i]
   p=transformed(p,angle=angle,dx=[0,0,4,3,2,0][i],center=(x,y-40),bottom=[155,155,156,157,157,158][i]);s.merge(p)
  if i>=4:
   s.line([(x-17,154),(x+23,154)],'outline',2,1)
 return s

def rgb_from_index(idx,appearance):
 import numpy as np
 a=np.asarray(idx,dtype=np.uint8);rgb=np.zeros((a.shape[0],a.shape[1],4),dtype=np.uint8)
 for mat,mid in MATS.items():
  if mid==0:continue
  for shade,col in enumerate(appearance[mat]):
   select=(a==mid*4+shade);rgb[select,:3]=HEX(col);rgb[select,3]=255
 return Image.fromarray(rgb,'RGBA')

def main():
 bg=draw_stadium(False);bg.save(ROOT/'stadium_background.png',optimize=True)
 draw_stadium(True).save(ROOT/'stadium_goal_background.png',optimize=True)
 manifest={"schema":"oronzo.cutscenes.v1","orientation":"landscape","frame":{"width":320,"height":180},"strip":{"width":1920,"height":180,"layout":"6 horizontal frames"},"frameCount":6,"loop":False,"materials":{"ids":MATS,"shadeLevels":4,"shadeOrder":"0=highlight,1=base,2=shadow,3=deep_shadow","encoding":"material mask: material ID (0 transparent); shade mask: level 0..3; alpha: material>0","palette":PALETTES},"patterns":{"solid":"shirt only","vertical":"shirt/shirtB alternation based on local torso x","horizontal":"shirt/shirtB alternation based on local torso y","halves":"shirt/shirtB split across torso"},"scenes":{},"credits":"Original ORONZO illustration and generative procedural pixel artwork; no third-party game sprites."}
 for name,trigger,fps,background,appearance in [
  ('goal_celebrate','goal',10,'stadium_background.png',PALETTES),
  ('goalkeeper_save','save',10,'stadium_goal_background.png',KEEPER),
  ('yellow_card','yellow',8,'stadium_background.png',PALETTES),
  ('red_card','red',8,'stadium_background.png',PALETTES),
  ('injury','injury',8,'stadium_background.png',PALETTES)]:
  strip=Image.new('RGBA',(W*N,H),(0,0,0,0));matstrip=Image.new('L',(W*N,H),0);shstrip=Image.new('L',(W*N,H),0)
  coverage=[]
  for i in range(N):
   spr=scene(name,i)
   im=rgb_from_index(spr.im,appearance)
   strip.paste(im,(i*W,0));idx=spr.im
   mat=idx.point(lambda v:int(v//4) if v else 0)
   shade=idx.point(lambda v:int(v%4) if v else 0)
   matstrip.paste(mat,(i*W,0));shstrip.paste(shade,(i*W,0))
   coverage.append(sum(v>0 for v in idx.getdata()))
  strip.save(ROOT/(name+'.png'),optimize=True)
  matstrip.save(ROOT/(name+'_materials.png'),optimize=True)
  shstrip.save(ROOT/(name+'_shades.png'),optimize=True)
  manifest['scenes'][trigger]={"id":name,"sprite":name+'.png',"materialsMask":name+'_materials.png',"shadesMask":name+'_shades.png',"background":background,"frameCount":6,"width":320,"height":180,"frameWidth":320,"frameHeight":180,"fps":fps,"durationMs":round(6000/fps),"loop":False,"pivot":{"x":160,"y":153},"drawOrder":["background","recoloredSprite"],"opaquePixelsPerFrame":coverage,"role":"goalkeeper" if trigger=='save' else 'referee' if trigger in ('yellow','red') else 'player',"defaultAppearance":appearance}
 (ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 # PNG QA
 for filename in list(ROOT.glob('*.png')):
  with Image.open(filename) as im:im.verify()
 print('Rendered:',[(p.name,p.stat().st_size) for p in ROOT.glob('*.png')]);print('Scenes:',list(manifest['scenes']))
if __name__=='__main__':main()
