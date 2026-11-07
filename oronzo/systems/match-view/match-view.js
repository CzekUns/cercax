/** ORONZO — Canvas MatchSnapshotV1 renderer, fully separate from simulation. */
import {SnapshotInterpolator,clamp,resolveFacing,spriteAction} from './interpolation.js';
import {createAssetAdapter} from './asset-adapter.js';
import {initialCamera,followCamera,cameraTransform,validateCameraMode} from './camera.js';
export const LOGICAL_WIDTH=640, LOGICAL_HEIGHT=360;
export const PITCH=Object.freeze({x:44,y:36,w:552,h:288});
const timeNow=()=>typeof performance!=='undefined'?performance.now():0;
const SEQUENCE=Object.freeze({goal:'goal',save:'save',injury:'injury',card:'yellow',yellow_card:'yellow',red_card:'red'});
const DEFAULTS={simSecondsPerRealSecond:6,eventCooldownMs:750,overlayDurationMs:1800,animationSpeedCap:2.5,autoStart:true,showTechnicalFallbackLabel:true,cameraMode:'full',cameraZoom:2,cameraHalfLifeMs:190};
export const projectPosition=(x,y)=>({x:Math.round(PITCH.x+clamp(x,0,1)*PITCH.w),y:Math.round(PITCH.y+clamp(y,0,1)*PITCH.h)});
export function sceneForEvent(event) {
  const type=String(event?.type||'').toLowerCase();
  if(type==='card'){
    const description=String(event?.detail?.color||event?.detail?.card||event?.detail||'').toLowerCase();
    return description.includes('red')||description.includes('rosso')?'red':'yellow';
  }
  return SEQUENCE[type]||null;
}
/** State-only event router: deduplicates tick retransmissions and limits visual interruptions. */
export class OverlayEvents {
  constructor({cooldownMs=750,durationMs=1800}={}) {this.cooldownMs=cooldownMs;this.durationMs=durationMs;this.seen=new Set();this.lastByType=new Map();this.current=null;}
  ingest(events=[],now=0){
    for(const e of events){
      const key=String(e?.id??[e?.type,e?.t,e?.playerId].join('|'));
      if(this.seen.has(key))continue;
      this.seen.add(key);if(this.seen.size>512)this.seen.delete(this.seen.values().next().value);
      const scene=sceneForEvent(e);if(!scene)continue;
      if(now-(this.lastByType.get(scene)??-Infinity)<this.cooldownMs)continue;
      this.lastByType.set(scene,now);
      this.current={type:scene,event:e,since:now,until:now+this.durationMs};
    }
    return this.current;
  }
  active(now=0){return this.current&&now<this.current.until?this.current:null;}
  clear(){this.current=null;this.seen.clear();this.lastByType.clear();}
}
function drawStands(ctx){
  ctx.fillStyle='#111b30';ctx.fillRect(0,0,640,360);
  for(let y=0;y<360;y+=6){ctx.fillStyle=y%12?'#24334b':'#2d4257';ctx.fillRect(0,y,640,3);}
  // Stable small crowd texture; decorative, no Math.random in visual rendering.
  for(let y=3;y<360;y+=7)for(let x=2;x<640;x+=7){
    const v=(x*17+y*31+(x*y)%43)%11;
    ctx.fillStyle=['#b1a078','#8d9da3','#bb6552','#d4c7a4','#6b8496'][v%5];
    if(v>2)ctx.fillRect(x+v%3,y,2,2);
  }
  ctx.fillStyle='#5c4d37';ctx.fillRect(0,23,640,5);ctx.fillRect(0,333,640,5);
  ctx.fillStyle='#d4c5a0';ctx.fillRect(0,27,640,3);ctx.fillRect(0,330,640,3);
}
function fieldLine(ctx){
  ctx.strokeStyle='#ecf0de';ctx.lineWidth=1;ctx.beginPath();
  ctx.strokeRect(PITCH.x+2,PITCH.y+2,PITCH.w-4,PITCH.h-4);
  const mid=PITCH.x+PITCH.w/2,cy=PITCH.y+PITCH.h/2;
  ctx.moveTo(mid,PITCH.y+2);ctx.lineTo(mid,PITCH.y+PITCH.h-2);
  ctx.moveTo(mid+46,cy);ctx.arc(mid,cy,46,0,Math.PI*2);
  ctx.stroke();ctx.fillStyle='#f3f1df';ctx.fillRect(mid,cy,2,2);
  ctx.strokeRect(PITCH.x+2,cy-62,91,124);ctx.strokeRect(PITCH.x+2,cy-29,31,58);
  ctx.strokeRect(PITCH.x+PITCH.w-93,cy-62,91,124);ctx.strokeRect(PITCH.x+PITCH.w-33,cy-29,31,58);
  ctx.fillRect(PITCH.x+65,cy,2,2);ctx.fillRect(PITCH.x+PITCH.w-67,cy,2,2);
  ctx.strokeRect(PITCH.x-5,cy-22,7,44);ctx.strokeRect(PITCH.x+PITCH.w-2,cy-22,7,44);
  // Corner arcs, chalk tiles and touchlines belong to artwork, not physics.
  for(const px of [PITCH.x+2,PITCH.x+PITCH.w-2]) for(const py of [PITCH.y+2,PITCH.y+PITCH.h-2]){ctx.beginPath();ctx.arc(px,py,8,0,Math.PI*2);ctx.stroke();}
}
export function drawPitch(ctx){
  drawStands(ctx);
  ctx.fillStyle='#194d3b';ctx.fillRect(PITCH.x-8,PITCH.y-9,PITCH.w+16,PITCH.h+18);
  for(let i=0;i<12;i++){ctx.fillStyle=i%2?'#327d53':'#2e724e';ctx.fillRect(PITCH.x+i*PITCH.w/12,PITCH.y,PITCH.w/12+1,PITCH.h);}
  ctx.fillStyle='#286b49';for(let y=PITCH.y+4;y<PITCH.y+PITCH.h;y+=12)for(let x=PITCH.x+6;x<PITCH.x+PITCH.w;x+=14)if((x+y)%3)ctx.fillRect(x,y,2,1);
  fieldLine(ctx);
  ctx.fillStyle='#e9ddbf';ctx.fillRect(0,342,640,3);
}
function projectedFrames(player){
  const vx=Number.isFinite(player.vx)?player.vx:0,vy=Number.isFinite(player.vy)?player.vy:0;
  return {action:spriteAction(player.action,false,Math.hypot(vx,vy)),direction:resolveFacing(player.facing,vx,vy)};
}
export function createMatchView(canvas,{assetLoader,config={}}={}) {
  if(!canvas||typeof canvas.getContext!=='function')throw new TypeError('A Canvas is required');
  const opt={...DEFAULTS,...config};
  canvas.width=LOGICAL_WIDTH;canvas.height=LOGICAL_HEIGHT;
  if(canvas.style){canvas.style.aspectRatio='16 / 9';canvas.style.imageRendering='pixelated';canvas.style.maxWidth='100%';canvas.style.height='auto';canvas.style.display='block';}
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('2D canvas unavailable');ctx.imageSmoothingEnabled=false;
  const assets=createAssetAdapter({assetLoader,playerBaseUrl:opt.playerBaseUrl,cutsceneBaseUrl:opt.cutsceneBaseUrl,onWarning:opt.onWarning});
  const interpolation=new SnapshotInterpolator({simSecondsPerRealSecond:opt.simSecondsPerRealSecond});
  const overlay=new OverlayEvents({cooldownMs:opt.eventCooldownMs,durationMs:opt.overlayDurationMs});
  const clock=opt.clock||timeNow;
  const request=opt.requestFrame||(typeof requestAnimationFrame==='function'?requestAnimationFrame:null);
  const cancel=opt.cancelFrame||(typeof cancelAnimationFrame==='function'?cancelAnimationFrame:null);
  const appearances=opt.appearances||{};
  let animationTime=0,lastDrawAt=null,rafId=null,destroyed=false,teamOrder=[opt.homeTeamId,opt.awayTeamId].filter(v=>v!==undefined).map(String),keepers=new Set((opt.keeperIds||[]).map(String)),selectedId=null;
  const frameStates=new Map();
  let cameraMode=validateCameraMode(opt.cameraMode),cameraState=initialCamera({mode:cameraMode,zoom:opt.cameraZoom}),cameraCut=true;
  function teamOf(id){return teamOrder.indexOf(String(id))===1?'away':'home';}
  function kitFor(player){
    const team=teamOf(player.teamId);
    return {
      ...(appearances[team]||{}),
      ...(keepers.has(player.id)?appearances[team+'Keeper']||{}:{}),
      ...(appearances[player.teamId]||{}),
      ...(appearances[player.id]||{}),
      ...(player.appearance||{})
    };
  }
  function stepAnimation(now){
    if(lastDrawAt===null)lastDrawAt=now;
    const dt=clamp(now-lastDrawAt,0,100);lastDrawAt=now;
    if(!interpolation.paused)animationTime+=dt*Math.min(opt.animationSpeedCap,Math.sqrt(interpolation.speed));
  }
  function drawAt(now=clock()){
    if(destroyed)return;
    stepAnimation(now);ctx.imageSmoothingEnabled=false;
    const snap=interpolation.sample(now);
    if(!snap){drawPitch(ctx);drawNoFeed(ctx);return;}
    cameraState=followCamera(cameraState,snap.ball,{mode:cameraMode,now,zoom:opt.cameraZoom,halfLifeMs:opt.cameraHalfLifeMs,cut:cameraCut,paused:interpolation.paused});
    cameraCut=false;
    ctx.save();ctx.beginPath();ctx.rect(0,0,LOGICAL_WIDTH,LOGICAL_HEIGHT);ctx.clip();
    if(cameraMode==='broadcast'){const tr=cameraTransform(cameraState);ctx.translate(tr.translateX,tr.translateY);ctx.scale(tr.zoom,tr.zoom);}
    drawPitch(ctx);
    const actors=snap.players.slice().sort((a,b)=>a.y-b.y);
    let missing=0;
    for(const p of actors){
      const screen=projectPosition(p.x,p.y),isKeeper=keepers.has(p.id);
      const vx=p.vx??0,vy=p.vy??0;
      const motion=projectedFrames(p);
      if(isKeeper&&['save','dive','parry','catch'].includes(String(p.action).toLowerCase()))motion.action='keeper';
      const key=p.id;let st=frameStates.get(key);
      if(!st||st.action!==motion.action){st={action:motion.action,start:animationTime};frameStates.set(key,st);}
      const spec=assets.manifest?.actions?.[motion.action],frames=spec?.directions?.[motion.direction]?.length||4;
      const elapsed=Math.max(0,animationTime-st.start)/1000;
      const frame=spec?.loop===false?Math.min(frames-1,Math.floor(elapsed*(spec?.fps||8))):Math.floor(elapsed*(spec?.fps||8))%frames;
      if(String(selectedId)===p.id||p.hasBall){
        ctx.strokeStyle=p.hasBall?'#f7d777':'#eaf0dc';ctx.lineWidth=1;
        ctx.beginPath();ctx.ellipse(screen.x,screen.y,11,4,0,0,Math.PI*2);ctx.stroke();
      }
      const ok=assets.drawPlayer(ctx,{...screen,action:motion.action,direction:motion.direction,frame,appearance:kitFor(p),team:teamOf(p.teamId),isKeeper});
      if(!ok)missing++;
    }
    const b=projectPosition(snap.ball.x,snap.ball.y);assets.drawBall(ctx,b.x,b.y,snap.ball.height);
    ctx.restore(); // technical warnings and cutscenes remain screen-space overlays
    if(opt.showTechnicalFallbackLabel&&missing){ctx.fillStyle='#152b39';ctx.fillRect(6,4,168,13);ctx.font='9px monospace';ctx.fillStyle='#f5dba2';ctx.fillText('FALLBACK ASSET ('+missing+'/22)',11,14);}
    const active=overlay.active(now);
    if(active){
      const e=active.event,actor=snap.players.find(p=>p.id===String(e.playerId));
      const good=assets.drawScene(ctx,active.type,now-active.since,actor?kitFor(actor):null);
      if(!good){ctx.fillStyle='rgba(7,21,34,.88)';ctx.fillRect(202,151,236,48);ctx.fillStyle='#f6d99a';ctx.font='bold 16px monospace';ctx.fillText('EVENTO: '+active.type.toUpperCase(),222,181);}
    }
  }
  function drawNoFeed(ctx){ctx.fillStyle='#071722';ctx.fillRect(201,157,238,35);ctx.fillStyle='#e1d4b3';ctx.font='12px monospace';ctx.fillText('ATTESA SNAPSHOT PARTITA',213,179);}
  function render(snapshot,now=clock()){
    if(destroyed)return false;
    const previous=interpolation.latest;
    const normalized=interpolation.push(snapshot,now);
    if(!previous || normalized.t<previous.t || normalized.phase!==previous.phase || normalized.events.some(e=>e?.type==='kickoff'||e?.type==='halftime')) cameraCut=true;
    // A rewind/replay invalidates old goal/card overlays and animation frames.
    // Otherwise an expired goal may paint over the first frame of the replay.
    if(previous && normalized.t<previous.t){overlay.clear();frameStates.clear();animationTime=0;}
    // Keeper identity must follow the accepted engine substitution event.
    for(const event of normalized.events){
      if(event?.type!=='substitution')continue;
      const {outId,inId}=event.detail||{};
      if(keepers.has(String(outId)) && inId!=null){
        keepers.delete(String(outId));keepers.add(String(inId));
      }
    }
    for(const p of normalized.players){if(!teamOrder.includes(p.teamId))teamOrder.push(p.teamId);}
    overlay.ingest(normalized.events,now);
    const active=overlay.active(now);if(active)assets.preloadScene(active.type).catch(()=>{});
    if(!request)drawAt(now);
    return true;
  }
  function animate(now){if(destroyed)return;drawAt(now);rafId=request(animate);}
  function setSpeed(speed,now=clock()){interpolation.setSpeed(speed,now);}
  function setPaused(value,now=clock()){interpolation.setPaused(value,now);lastDrawAt=now;}
  function setCameraMode(mode){const next=validateCameraMode(mode);if(cameraMode!==next){cameraMode=next;cameraCut=true;}return cameraMode;}
  function selectPlayer(id){selectedId=id===null?null:String(id);}
  function setKeepers(ids){keepers=new Set((ids||[]).map(String));}
  function resize(){canvas.width=LOGICAL_WIDTH;canvas.height=LOGICAL_HEIGHT;ctx.imageSmoothingEnabled=false;drawAt(clock());return {width:canvas.width,height:canvas.height};}
  function destroy(){if(destroyed)return;destroyed=true;if(rafId!==null&&cancel)cancel(rafId);frameStates.clear();overlay.clear();interpolation.reset();assets.destroy();}
  if(request&&opt.autoStart)rafId=request(animate);else drawAt(clock());
  return {render,drawAt,setSpeed,setPaused,setCameraMode,selectPlayer,setKeepers,
    getKeeperIds:()=>[...keepers],resize,destroy,ready:assets.preload(),assets,interpolation,overlay,
    get destroyed(){return destroyed;},get cameraMode(){return cameraMode;},getCameraState:()=>({...cameraState})};
}
/**
 * Optional runner adapter for Agent 6. Invokes getEventsSince(cursor) once per
 * sync, replaces tick-only snapshot.events with the authoritative event stream,
 * then calls view.render(). The simulation clock is NEVER advanced here.
 * Initial keeperIds are the GK IDs in MatchInputV1.homeXI/awayXI.
 */
export function createEngineViewBridge(engine,view,{initialEventId=0,keeperIds=[]}={}){
  if(!engine || typeof engine.snapshot!=='function' || typeof engine.getEventsSince!=='function')
    throw new TypeError('Expected Agent 6 engine with snapshot()/getEventsSince()');
  if(!view || typeof view.render!=='function' || typeof view.setKeepers!=='function')
    throw new TypeError('Expected MatchView with render()/setKeepers()');
  let cursor=initialEventId;
  const keepers=new Set(keeperIds.map(String));
  view.setKeepers([...keepers]);
  function sync(now){
    const snapshot=engine.snapshot();
    const fetched=engine.getEventsSince(cursor);
    if(!Array.isArray(fetched))throw new TypeError('getEventsSince must return an array');
    const fresh=fetched.filter(e=>Number.isSafeInteger(e?.id) && e.id>cursor);
    for(const e of fresh){
      cursor=Math.max(cursor,e.id);
      if(e.type==='substitution'){
        const {outId,inId}=e.detail||{};
        if(keepers.has(String(outId))&&inId!=null){
          keepers.delete(String(outId));keepers.add(String(inId));
          view.setKeepers([...keepers]);
        }
      }
    }
    // No double-delivery of snapshot tick events; the cursor is authoritative.
    view.render({...snapshot,events:fresh},now);
    return {snapshot,events:fresh,lastEventId:cursor};
  }
  function reset(lastEventId=0,nextKeeperIds=keeperIds){
    cursor=lastEventId;keepers.clear();
    for(const id of nextKeeperIds)keepers.add(String(id));
    view.setKeepers([...keepers]);
  }
  return {sync,reset,get lastEventId(){return cursor;},get keeperIds(){return [...keepers];}};
}
