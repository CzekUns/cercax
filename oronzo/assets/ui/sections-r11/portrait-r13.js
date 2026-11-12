/** ORONZO R13-TER: illustrated raster player portrait, read-only R12 DNA.
 * Each layer is an original separately stored PNG with alpha and material mask.
 * Canvas exclusively composites and palette-remaps pixels from image assets.
 */
export const PORTRAIT_WIDTH=128;
export const PORTRAIT_HEIGHT=160;
const SKIN=['#E6B485','#BD8058','#F0C998','#98633F','#D59A70','#B87451','#A87552','#E2AF7A'];
const HAIR=['#292022','#6D422B','#2C252C','#9C6737','#49271D','#C49259','#201D20','#594131'];
const HAIR_STYLES=['crop','side-part','wavy','curly','receding','buzz','long','bald'];
const FACIAL_STYLES=['shaved','moustache','goatee','stubble','full-beard'];
const hairMap=[0,1,4,3,7,8,5,-1]; // Canonical PlayerV2 names -> illustrated hair PNG slots
const beardMap=[-1,0,3,4,6]; // -1: clean-shaven (no overlay)
const cache=new Map();
const root=new URL('../../players/r13/',import.meta.url);
function idx(value,n){const v=Number(value);return Number.isInteger(v)?((v%n)+n)%n:0;}
function style(value,n,names,map){if(typeof value==='string'&&!/^\d+$/.test(value)){
  const pos=names.indexOf(value.toLowerCase());if(pos>=0)return map[pos];
}return idx(value,n);}
function hex(color,fallback){return /^#[0-9a-f]{6}$/i.test(String(color||''))?String(color):fallback;}
export const portraitVariantCount=8*12*9*8*8;
export function portraitParts(appearance={},kit={}){
 const hair=style(appearance.hairStyleId,12,HAIR_STYLES,hairMap);
 const facial=style(appearance.facialHairStyleId,8,FACIAL_STYLES,beardMap);
 const face=idx(appearance.faceVariantId,8);
 const torso=idx(appearance.torsoVariantId??appearance.faceVariantId,6);
 const pattern=String(kit.shirtPatternId||kit.pattern||'solid').toLowerCase();
 const canonicalPattern=/vertical|righe|stripes/.test(pattern)?'vertical':/horizontal|fasce/.test(pattern)?'horizontal':/halves|half|metà/.test(pattern)?'halves':'solid';
 return {face,hair,facial,torso,pattern:canonicalPattern,
  skin:hex(appearance.skin,SKIN[idx(appearance.skinToneId,8)]),
  hairColor:hex(appearance.hair,HAIR[idx(appearance.hairColorId,8)]),
  facialColor:hex(appearance.facialHairColor,HAIR[idx(appearance.facialHairColorId??appearance.hairColorId,8)]),
  shirtA:hex(kit.shirtA||kit.shirt,'#315b9c'),shirtB:hex(kit.shirtB||kit.trim||kit.shirtA,'#f1e5d2')};
}
function loadImage(path){
 if(cache.has(path))return cache.get(path);
 const promise=new Promise((resolve,reject)=>{
  if(typeof Image==='undefined'){reject(new Error('R13_IMAGE_API_UNAVAILABLE'));return;}
  const image=new Image();image.decoding='async';image.crossOrigin='anonymous';
  image.onload=()=>image.naturalWidth===PORTRAIT_WIDTH&&image.naturalHeight===PORTRAIT_HEIGHT?resolve(image):reject(new Error('R13_ASSET_DIMENSIONS:'+path));
  image.onerror=()=>reject(new Error('R13_ASSET_NOT_FOUND:'+path));
  image.src=new URL(path,root).href;
 });
 cache.set(path,promise);promise.catch(()=>{if(cache.get(path)===promise)cache.delete(path);});return promise;
}
const filename=(group,n)=>group+'/'+String(n).padStart(2,'0')+'.png';
const maskname=(group,n)=>'masks/'+group.replaceAll('-','_')+'-'+String(n).padStart(2,'0')+'.png';
const kitMask=(n,pattern)=>'kits/'+String(n).padStart(2,'0')+'-'+pattern+'.png';
function canvas2d(){const c=document.createElement('canvas');c.width=PORTRAIT_WIDTH;c.height=PORTRAIT_HEIGHT;return c;}
function imagePixels(image){const c=canvas2d(),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);return ctx.getImageData(0,0,c.width,c.height);}
function toRGB(str){return [1,3,5].map(i=>parseInt(str.slice(i,i+2),16));}
/** Palette remapping retains original shaded illustrated pixels and alpha. */
function remap(image,materialMask,color,material='hair',secondMask=null,secondColor=null,neckColor=null){
 const original=imagePixels(image),next=original.data,mask=imagePixels(materialMask).data;
 const second=secondMask?imagePixels(secondMask).data:null;
 const toneA=toRGB(color),toneB=toRGB(secondColor||color),toneSkin=toRGB(neckColor||color);
 for(let i=0;i<next.length;i+=4){
  if(next[i+3]===0)continue;
  const px=(i/4)%PORTRAIT_WIDTH,py=Math.floor(i/4/PORTRAIT_WIDTH);
  // Distinguish painted, exposed neck from kit fibers; source pixels remain illustrated PNGs.
  const neck=material==='kit'&&py>=94&&py<=113&&Math.abs(px-64)<=15&&
    next[i]>next[i+1]*1.12&&next[i+1]>next[i+2]*.96&&next[i]>95;
  if(!neck&&mask[i+3]<128)continue;
  const source=[next[i],next[i+1],next[i+2]],tone=neck?toneSkin:
    second&&second[i+3]>127?toneB:toneA;
  const lum=(source[0]+source[1]+source[2])/3;
  const light=Math.max(-0.75,Math.min(1.15,(lum-118)/95));
  for(let k=0;k<3;k++){
   let v=Math.max(0,Math.min(255,tone[k]+light*76));
   if(material==='skin'||neck)v=v*.86+source[k]*.14;
   next[i+k]=Math.round(v);
  }
 }
 const c=canvas2d();c.getContext('2d').putImageData(original,0,0);return c;
}
/** Move an already painted raster, never synthesize facial features. */
function shiftRaster(img,dx){if(!dx)return img;const c=canvas2d();c.getContext('2d').drawImage(img,dx,0);return c;}
/** Fit facial-hair alpha to the anatomical silhouette from the selected, saved face PNG. */
function fitFacialHair(painted,faceImage){
 const beard=imagePixels(painted),face=imagePixels(faceImage),out=beard.data,faceData=face.data;
 for(let y=0;y<PORTRAIT_HEIGHT;y++)for(let x=0;x<PORTRAIT_WIDTH;x++){
  const i=(y*PORTRAIT_WIDTH+x)*4;
  if(!out[i+3])continue;
  let faceAlpha=faceData[i+3];
  for(const dx of [-1,1]){
   const nx=x+dx;
   if(nx>=0&&nx<PORTRAIT_WIDTH)faceAlpha=Math.max(faceAlpha,faceData[(y*PORTRAIT_WIDTH+nx)*4+3]);
  }
  out[i+3]=Math.min(out[i+3],faceAlpha);
 }
 const c=canvas2d();c.getContext('2d').putImageData(beard,0,0);return c;
}
/** Render from real PNGs; never creates character geometry with drawing primitives.
 * Returns Promise<boolean>. A stale in-flight load never overwrites a newer player.
 */
export async function drawPortrait(canvas,appearance={},kit={}){
 const ctx=canvas?.getContext?.('2d');if(!ctx||typeof document==='undefined')return false;
 const token=Symbol('portrait');canvas.__r13Token=token;
 const p=portraitParts(appearance,kit);
 const requests=[
  [filename('torsos',p.torso),maskname('torsos',p.torso),kitMask(p.torso,p.pattern)],
  [filename('faces',p.face),maskname('faces',p.face)],
  p.hair<0?null:[filename('hair',p.hair),maskname('hair',p.hair)],
  p.facial<0?null:[filename('facial-hair',p.facial),maskname('facial-hair',p.facial)]];
 try{
  const layers=await Promise.all(requests.map(paths=>paths?Promise.all(paths.map(loadImage)):null));
  if(canvas.__r13Token!==token)return false;
  canvas.width=PORTRAIT_WIDTH;canvas.height=PORTRAIT_HEIGHT;
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,PORTRAIT_WIDTH,PORTRAIT_HEIGHT);
  // drawImage only: the illustrated source layers own every contour and facial feature.
  const [shirt,skin,hair,facial]=[
   remap(layers[0][0],layers[0][1],p.shirtA,'kit',layers[0][2],p.shirtB,p.skin),
   remap(...layers[1],p.skin,'skin'),
   layers[2]&&remap(...layers[2],p.hairColor),
   layers[3]&&remap(layers[3][0],layers[3][0],p.facialColor)];
  // Existing 3/4-view face no. 7 is registered 10 pixels to the right;
  // haircut 09 comes from an asymmetric off-centre crop. Correct per-asset, not per player.
  const faceShift=p.face===7?-10:0;
  const correctedFace=shiftRaster(skin,faceShift);
  const correctedFaceSilhouette=shiftRaster(layers[1][0],faceShift);
  const correctedHair=hair&&p.hair===9?shiftRaster(hair,-7):hair;
  const fittedBeard=facial?fitFacialHair(facial,correctedFaceSilhouette):null;
  for(const layer of [shirt,correctedFace,correctedHair,fittedBeard])if(layer)ctx.drawImage(layer,0,0);
  canvas.dataset.r13Raster='loaded';return true;
 }catch(error){if(canvas.__r13Token!==token)return false;canvas.dataset.r13Raster='failed';console.warn('ORONZO_R13_RASTER_ERROR',error);return false;}
}
