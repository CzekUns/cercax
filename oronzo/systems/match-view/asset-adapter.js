/** ORONZO — sprite/cutscene bridges, no dependency on colleagues' implementation details. */
import {DIRECTIONS,clamp} from './interpolation.js';
import {drawPlayerFaceDetailsR12} from './player-details-r12.js';
const PLAYER_BASE=new URL('../../assets/players/',import.meta.url);
const SCENE_BASE=new URL('../../assets/cutscenes/',import.meta.url);
const MATERIALS=['skin','hair','shirt','shorts','socks','boots','outline','gloves','shadow'];
const BASE={skin:'#DCA06B',hair:'#493022',shirt:'#ECE5CE',shirtB:'#3159A5',shorts:'#273D78',socks:'#EDE7D8',boots:'#25283D',gloves:'#F2EEE4',pattern:'solid'};
const PALETTES={home:{shirt:'#EEE4CE',shirtB:'#2753A7',shorts:'#25448C',socks:'#F0E8C9',pattern:'vertical'},away:{shirt:'#BD4051',shirtB:'#F4E3C2',shorts:'#F4E3C2',socks:'#C3434F',pattern:'solid'},keeper:{shirt:'#D9B849',shirtB:'#D9B849',shorts:'#303D40',socks:'#D9B849'}};
const rgb=hex=>{const s=String(hex||'#888888').replace('#','');const h=s.length===3?s.split('').map(v=>v+v).join(''):s;return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)||0);};
function shade(hex,level){const c=rgb(hex);return c.map(v=>clamp(Math.round(level===0?255-(255-v)*.74:v*[1,1,.73,.47][level]),0,255));}
function canvasOf(width,height){if(typeof document==='undefined') throw new Error('Canvas requires DOM');const c=document.createElement('canvas');c.width=width;c.height=height;return c;}
const defaultLoadJson=async url=>{const r=await fetch(url);if(!r.ok)throw new Error('HTTP '+r.status+' '+url);return r.json();};
const defaultLoadImage=url=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('Image failed '+url));i.src=url.href||String(url);});
const naturalSize=im=>[im.naturalWidth??im.width,im.naturalHeight??im.height];
function pixels(image){const [w,h]=naturalSize(image),c=canvasOf(w,h),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);return ctx.getImageData(0,0,w,h).data;}
function torsoAlternate(pattern,x,y,action,dir,fi){
  if(pattern==='solid')return false;
  const dx=[0,.71,1,.71,0,-.71,-1,-.71][dir];
  const bob=action==='run'?[0,-.7,0,-1.1][fi]:[0,0,-.25,.25][fi];
  const lean=action==='tackle'&&fi>0?[0,2,4,3][fi]*(dx||1)*.6:action==='keeper'&&fi>1?[0,0,4,6][fi]*(dx||1)*.5:0;
  const cx=16+dx*1.1+lean, cy=12+bob+(action==='tackle'&&fi>0?[0,2,4,3][fi]:0);
  const hw=4.9*(1-.32*Math.abs(dx));
  const u=clamp((x-cx+hw)/(2*hw),0,.999),v=clamp((y-cy)/8,0,.999);
  if(pattern==='vertical')return Math.floor(u*5)%2===1;
  if(pattern==='horizontal')return Math.floor(v*5)%2===1;
  return u>=.5;
}
function recolorPlayers(src,mask,action,appearance){
  const [w,h]=naturalSize(src), raw=pixels(src),coded=pixels(mask),c=canvasOf(w,h),ctx=c.getContext('2d');
  const img=ctx.createImageData(w,h),out=img.data;
  const ramps=MATERIALS.map(mat=>[0,1,2,3].map(level=>mat==='outline'?shade('#241D33',level):mat==='shadow'?[16,24,29]:shade(appearance[mat]||BASE[mat]||'#888888',level)));
  const stripes=[0,1,2,3].map(level=>shade(appearance.shirtB||appearance.shirt,level));
  for(let p=0;p<w*h;p++){
    const j=p*4,alpha=coded[j+3];if(!alpha)continue;
    const mat=Math.round(coded[j]/24)-1,level=Math.round(coded[j+1]/64);
    if(mat<0||mat>=MATERIALS.length||level<0||level>3){out.set(raw.subarray(j,j+4),j);continue;}
    const x=p%w,y=Math.floor(p/w),dir=Math.floor(x/32),fi=Math.floor(y/32);
    const alternate=mat===2&&torsoAlternate(appearance.pattern,x%32,y%32,action,dir,fi);
    const [r,g,b]=alternate?stripes[level]:ramps[mat][level];out[j]=r;out[j+1]=g;out[j+2]=b;out[j+3]=alpha;
  }
  ctx.putImageData(img,0,0);return c;
}
function sceneAppearance(manifest,spec,kit){
  const palette=spec.defaultAppearance;
  const ramps={};
  for(const [name,id] of Object.entries(manifest.materials.ids)){
    if(!id)continue;
    ramps[id]=(kit?.[name] ? [0,1,2,3].map(i=>shade(kit[name],i)) : palette[name]?.map(rgb)) || [[255,255,255]];
  }
  return ramps;
}
function recolorScene(manifest,spec,sprite,materials,shades,kit){
  const [w,h]=naturalSize(sprite),m=pixels(materials),s=pixels(shades),r=sceneAppearance(manifest,spec,kit),out=canvasOf(w,h),ctx=out.getContext('2d');
  const img=ctx.createImageData(w,h),dst=img.data;
  // Use Agent 2's material/shade masks; its native strip is 6 x 320x180.
  for(let p=0;p<w*h;p++){
    const o=p*4,id=m[o],level=clamp(s[o],0,3);if(!id)continue;
    const color=r[id]?.[level];if(!color)continue;
    dst[o]=color[0];dst[o+1]=color[1];dst[o+2]=color[2];dst[o+3]=255;
  }
  ctx.putImageData(img,0,0);return out;
}
/** Explicit user appearance overrides kit defaults, never erases them. */
export function resolvePlayerAppearance({appearance,team='home',isKeeper=false}={}){
  return {...(PALETTES[isKeeper?'keeper':team]||PALETTES.home),...(appearance||{})};
}
export function createAssetAdapter({assetLoader={},playerBaseUrl=PLAYER_BASE,cutsceneBaseUrl=SCENE_BASE,onWarning=()=>{}}={}){
  const json=assetLoader.loadJson||defaultLoadJson, image=assetLoader.loadImage||defaultLoadImage;
  const playerUrl=new URL(playerBaseUrl,import.meta.url), sceneUrl=new URL(cutsceneBaseUrl,import.meta.url);
  const state={players:'loading',cutscenes:'loading',warnings:[]};
  let playerManifest=null,sceneManifest=null,ballImage=null;
  const atlases=new Map(),masks=new Map(),paletteCache=new Map(),scenes=new Map();
  function warn(error){const message=String(error?.message||error);state.warnings.push(message);if(state.warnings.length>12)state.warnings.shift();onWarning(message);}
  const playersReady=Promise.resolve().then(async()=>{
    try{
      playerManifest=await json(new URL('manifest.json',playerUrl));
      if(!playerManifest?.actions||!playerManifest.atlas)throw new Error('Player manifest missing actions/atlas');
      const acts=Object.entries(playerManifest.actions);
      await Promise.all(acts.map(async([name,spec])=>{
        try{const [atlas,mask]=await Promise.all([image(new URL(spec.image,playerUrl)),image(new URL(spec.mask,playerUrl))]);
          const [w,h]=naturalSize(atlas),[mw,mh]=naturalSize(mask);
          if(w!==mw||h!==mh||w!==playerManifest.atlas.width||h!==playerManifest.atlas.height)throw new Error('Atlas size mismatch '+name);
          atlases.set(name,atlas);masks.set(name,mask);
        }catch(e){warn(e);}
      }));
      if (playerManifest.ball?.file) {
        try { ballImage=await image(new URL(playerManifest.ball.file,playerUrl)); } catch(e){warn(e);}
      }
      state.players=atlases.size?'ready':'failed';
    }catch(e){state.players='failed';warn(e);}
  });
  const scenesReady=Promise.resolve().then(async()=>{
    try{sceneManifest=await json(new URL('manifest.json',sceneUrl));if(!sceneManifest?.scenes)throw new Error('Cutscene manifest missing scenes');state.cutscenes='ready';}
    catch(e){state.cutscenes='failed';warn(e);}
  });
  function frames(action,direction){
    const spec=playerManifest?.actions?.[action];return spec?.directions?.[direction]||[];
  }
  function getPalette(action,kit){
    const key=action+'|'+JSON.stringify(kit);
    if(paletteCache.has(key))return paletteCache.get(key);
    const a=atlases.get(action),m=masks.get(action);if(!a||!m)return null;
    try{const out=recolorPlayers(a,m,action,{...BASE,...kit});
      if(paletteCache.size>60)paletteCache.clear();paletteCache.set(key,out);return out;
    }catch(e){warn(e);return a;}
  }
  function drawPlayer(ctx,{x,y,action='idle',direction='S',frame=0,appearance,team='home',isKeeper=false}){
    const act=atlases.has(action)?action:'idle';const frameset=frames(act,DIRECTIONS.includes(direction)?direction:'S');
    if(!frameset.length){drawFallbackPlayer(ctx,x,y,team,isKeeper);return false;}
    const cell=frameset[clamp(frame,0,frameset.length-1)];
    const kit=resolvePlayerAppearance({appearance,team,isKeeper});
    const atlas=getPalette(act,kit)||atlases.get(act);
    ctx.drawImage(atlas,cell.x,cell.y,cell.w,cell.h,Math.round(x-(cell.pivotX??16)),Math.round(y-(cell.pivotY??29)),cell.w,cell.h);
    drawPlayerFaceDetailsR12(ctx,{x,y,direction,appearance:kit});
    return true;
  }
  function drawBall(ctx,x,y,height=0) {
    const a=Math.round(x),b=Math.round(y),lift=Math.round(clamp(height,0,1)*14);
    ctx.fillStyle='#0c392b';ctx.fillRect(a-4,b-1,8,3);
    if (ballImage) {
      const pivot=playerManifest?.ball?.pivot||{x:8,y:13};
      ctx.drawImage(ballImage,a-pivot.x,b-lift-pivot.y);
    } else {
      ctx.fillStyle='#f6edd2';ctx.fillRect(a-3,b-lift-6,6,6);
      ctx.fillStyle='#2b3037';ctx.fillRect(a-1,b-lift-4,2,2);
    }
  }
  async function prepareScene(type){
    await scenesReady;
    if(!sceneManifest?.scenes?.[type])return null;
    if(!scenes.has(type))scenes.set(type,Promise.resolve().then(async()=>{
      const spec=sceneManifest.scenes[type];
      const [sprite,materials,shades,background]=await Promise.all([spec.sprite,spec.materialsMask,spec.shadesMask,spec.background].map(file=>image(new URL(file,sceneUrl))));
      return {spec,sprite,materials,shades,background,recolored:new Map()};
    }).catch(e=>{warn(e);return null;}));
    return scenes.get(type);
  }
  function drawScene(ctx,type,elapsed=0,appearance){
    const val=scenes.get(type);if(!val||typeof val.then==='function')return false;
    const item=val;if(!item?.spec)return false;
    const {spec,background}=item,frames=spec.frameCount||6;
    const f=clamp(Math.floor(elapsed*(spec.fps||8)/1000),0,frames-1);
    const sx=f*(spec.frameWidth||320),dw=320,dh=180,dx=160,dy=90;
    ctx.fillStyle='#081c24';ctx.fillRect(dx-5,dy-5,dw+10,dh+10);
    ctx.drawImage(background,dx,dy,dw,dh);
    const kit=appearance||null,key=JSON.stringify(kit||{});
    if(!item.recolored.has(key)){
      try{item.recolored.set(key,recolorScene(sceneManifest,spec,item.sprite,item.materials,item.shades,kit));}
      catch(e){warn(e);item.recolored.set(key,item.sprite);}
    }
    ctx.drawImage(item.recolored.get(key),sx,0,320,180,dx,dy,dw,dh);
    ctx.strokeStyle='#d9c498';ctx.lineWidth=2;ctx.strokeRect(dx-4,dy-4,dw+8,dh+8);
    return true;
  }
  // Replace promises with their successful values for synchronous canvas drawing.
  function activateScene(type){const p=scenes.get(type);if(!p)return;Promise.resolve(p).then(scene=>{if(scene)scenes.set(type,scene);});}
  async function preloadScene(type){const s=await prepareScene(type);activateScene(type);return Boolean(s);}
  function destroy(){atlases.clear();masks.clear();paletteCache.clear();scenes.clear();}
  return {state,playersReady,scenesReady,preload:()=>Promise.all([playersReady,scenesReady]),preloadScene,drawPlayer,drawBall,drawScene,destroy,get manifest(){return playerManifest;}};
}
/** Visible solely when Agent 1's PNGs are missing; NEVER a final visual style. */
export function drawFallbackPlayer(ctx,x,y,team='home',keeper=false){
  const a=Math.round(x),b=Math.round(y),shirt=keeper?'#dab951':team==='away'?'#b8444d':'#e2dcc1';
  ctx.fillStyle='#102c28';ctx.fillRect(a-7,b-2,14,3);
  ctx.fillStyle='#5b3a29';ctx.fillRect(a-3,b-19,6,4);
  ctx.fillStyle='#d9a276';ctx.fillRect(a-4,b-16,8,6);
  ctx.fillStyle=shirt;ctx.fillRect(a-6,b-11,12,9);
  ctx.fillStyle=team==='away'?'#e6e3d5':'#294e93';ctx.fillRect(a-5,b-2,10,4);
  ctx.fillStyle='#eed2a0';ctx.fillRect(a-5,b+2,3,5);ctx.fillRect(a+2,b+2,3,5);
  ctx.fillStyle='#18262f';ctx.fillRect(a-6,b+7,5,2);ctx.fillRect(a+2,b+7,5,2);
}