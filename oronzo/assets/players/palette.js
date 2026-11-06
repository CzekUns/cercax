/**
 * Oronzo player palette renderer. Pure browser canvas, no dependencies.
 * Input: 32x32 indexed PNG atlases and same-silhouette material-mask PNGs.
 * No modification outside oronzo/assets/players/.
 */
(function (root) {
  "use strict";
  const DIRS = ["N","NE","E","SE","S","SW","W","NW"];
  const VECTORS = [[0,-1],[.71,-.71],[1,0],[.71,.71],[0,1],[-.71,.71],[-1,0],[-.71,-.71]];
  const NAMES = ["skin","hair","shirt","shorts","socks","boots","outline","gloves","shadow"];
  const DEFAULT = Object.freeze({
    skin:"#DCA06B",hair:"#493022",shirt:"#C53C49",shirtB:"#F4EAD8",
    shorts:"#F2EEE4",socks:"#EDE7D8",boots:"#25283D",gloves:"#F2EEE4",pattern:"solid"
  });
  const cache = new Map(), promises = new Map(), sources = new Map();
  function hexRGB(hex) {
    const s=String(hex||"#888888").replace("#","");
    const h=s.length===3?s.split("").map(ch=>ch+ch).join(""):s;
    return [parseInt(h.slice(0,2),16)||0,parseInt(h.slice(2,4),16)||0,parseInt(h.slice(4,6),16)||0];
  }
  function shade(hex,level) {
    const c=hexRGB(hex), multiplier=[1.38,1.0,.73,.47][level];
    return c.map(x=>Math.max(0,Math.min(255,Math.round(level===0 ? 255-(255-x)*.74 : x*multiplier))));
  }
  function appearance(input) {
    const a=Object.assign({},DEFAULT,input||{});
    if(!["solid","vertical","horizontal","halves"].includes(a.pattern))a.pattern="solid";
    return a;
  }
  function image(url) {
    return new Promise((resolve,reject)=>{
      const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error("Asset not loaded: "+url));im.src=url;
    });
  }
  function createCanvas(w,h) {const c=document.createElement("canvas");c.width=w;c.height=h;return c;}
  function pixelsOf(im) {
    const c=createCanvas(im.width,im.height),ctx=c.getContext("2d",{willReadFrequently:true});
    ctx.imageSmoothingEnabled=false;ctx.drawImage(im,0,0);return ctx.getImageData(0,0,im.width,im.height);
  }
  async function load(action,basePath) {
    const id=String(action);
    if(!["idle","run","kick","tackle","keeper"].includes(id))throw new Error("Unknown action "+id);
    const path=basePath===undefined?"":basePath;
    const key=path+"|"+id;
    if(!promises.has(key)) {
      promises.set(key,Promise.all([image(path+id+".png"),image(path+id+"-mask.png")]).then(([original,mask])=>{
        if(original.width!==256||original.height!==128||mask.width!==256||mask.height!==128)throw new Error("Atlas mismatch: "+id);
        const pair={original,mask,source:pixelsOf(original),coded:pixelsOf(mask),key};
        sources.set(key,pair);return pair;
      }));
    }
    return promises.get(key);
  }
  function poseTorso(action,di,fi) {
    const [dx]=VECTORS[di],bx=16+dx*1.1,profile=1-.32*Math.abs(dx);
    let bob=(action==="run"?[0,-.7,0,-1.1][fi]:action==="keeper"?[0,-1,-2,-1][fi]:[0,0,-.25,.25][fi]);
    let lean=0;
    if(action==="tackle"&&fi>0)lean=[0,2,4,3][fi]*(dx||1)*.6;
    if(action==="keeper"&&fi>1)lean=[0,0,4,6][fi]*(dx||1)*.5;
    return {cx:bx+lean,y:12+bob+(action==="tackle"&&fi>0?[0,2,4,3][fi]:0)+(action==="keeper"&&fi>1?(fi===2?2:5):0),halfWidth:4.9*profile};
  }
  function alternate(pattern,localX,localY,action,di,fi) {
    if(pattern==="solid")return false;
    const t=poseTorso(action,di,fi);
    const u=Math.max(0,Math.min(.999,(localX-(t.cx-t.halfWidth))/(t.halfWidth*2)));
    const v=Math.max(0,Math.min(.999,(localY-t.y)/8));
    if(pattern==="vertical")return Math.floor(u*5)%2===1;
    if(pattern==="horizontal")return Math.floor(v*5)%2===1;
    return u>=.5;
  }
  function keyOf(action,a,basePath) {
    return (basePath||"")+"|"+action+"|"+JSON.stringify(
      ["skin","hair","shirt","shirtB","shorts","socks","boots","gloves","pattern"].map(k=>a[k])
    );
  }
  /** Recolor ALL 32 frames (256x128) offscreen once, cache by appearance. */
  function recolorAtlas(source,action,userAppearance) {
    const a=appearance(userAppearance),key=keyOf(action,a,source.key);
    if(cache.has(key))return cache.get(key);
    const w=256,h=128,canvas=createCanvas(w,h),ctx=canvas.getContext("2d",{willReadFrequently:true}),src=source.source.data,mask=source.coded.data;
    const out=ctx.createImageData(w,h),o=out.data;
    const colors=Array.from({length:9},(_,mi)=>Array.from({length:4},(_,s)=>{
      return mi===6?shade("#241D33",s):mi===8?[16,24,29]:shade(a[NAMES[mi]]||DEFAULT[NAMES[mi]]||"#888888",s);
    }));
    const shirtB=[0,1,2,3].map(s=>shade(a.shirtB,s));
    for(let p=0;p<w*h;p++) {
      const j=p*4,al=mask[j+3];if(al===0)continue;
      const m=Math.round(mask[j]/24)-1,s=Math.round(mask[j+1]/64);
      if(m<0||m>8||s<0||s>3) {
        o[j]=src[j];o[j+1]=src[j+1];o[j+2]=src[j+2];o[j+3]=src[j+3];continue;
      }
      const x=p%w,y=Math.floor(p/w),di=Math.floor(x/32),fi=Math.floor(y/32);
      const useB=m===2&&alternate(a.pattern,x%32,y%32,action,di,fi);
      const v=useB?shirtB[s]:colors[m][s];
      o[j]=v[0];o[j+1]=v[1];o[j+2]=v[2];o[j+3]=al;
    }
    ctx.putImageData(out,0,0);cache.set(key,canvas);return canvas;
  }
  function frameRect(direction,frame) {
    let d=typeof direction==="number"?direction:DIRS.indexOf(direction);
    if(d<0||d>7||frame<0||frame>3||!Number.isInteger(frame))throw new Error("Bad frame/direction");
    return {sx:d*32,sy:frame*32,sw:32,sh:32};
  }
  /** ctx coordinates x,y are ground pivot, NEVER sprite top-left. */
  async function prepare(action,userAppearance,basePath) {
    const pair=await load(action,basePath);
    return recolorAtlas(pair,action,userAppearance);
  }
  function draw(ctx,atlas,direction,frame,x,y,scale=1) {
    const r=frameRect(direction,frame);
    const prev=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=false;
    ctx.drawImage(atlas,r.sx,r.sy,32,32,Math.round(x-16*scale),Math.round(y-29*scale),32*scale,32*scale);
    ctx.imageSmoothingEnabled=prev;
  }
  async function clear(basePath) {
    cache.clear();if(basePath!==undefined)for(const k of [...sources.keys()])if(k.startsWith(basePath+"|"))sources.delete(k);
  }
  root.OronzoPalette={directions:DIRS,defaults:DEFAULT,appearance,load,prepare,recolorAtlas,frameRect,draw,clear,shade};
})(window);
