/** ORONZO 05 — purely visual 16:9 camera, independent of game simulation. */
export const CAMERA_MODES = Object.freeze(['full', 'broadcast']);
export const CAMERA_WIDTH = 640;
export const CAMERA_HEIGHT = 360;
export const CAMERA_PITCH = Object.freeze({x:44, y:36, w:552, h:288});
const clamp = (v, low, high) => Math.min(high, Math.max(low, v));
const finite = (v, fallback) => Number.isFinite(v) ? v : fallback;

export function validateCameraMode(mode) {
  if (!CAMERA_MODES.includes(mode)) throw new RangeError('cameraMode must be full or broadcast');
  return mode;
}

/** CSS contain: never changes the logical canvas's resolution or coordinate space. */
export function fitLandscapeViewport(width, height, logicalWidth=CAMERA_WIDTH, logicalHeight=CAMERA_HEIGHT) {
  if (![width,height,logicalWidth,logicalHeight].every(x => Number.isFinite(x) && x>0)) {
    throw new RangeError('viewport dimensions must be finite positive values');
  }
  const scale=Math.min(width/logicalWidth,height/logicalHeight);
  const displayWidth=logicalWidth*scale, displayHeight=logicalHeight*scale;
  return {scale,displayWidth,displayHeight,offsetX:(width-displayWidth)/2,offsetY:(height-displayHeight)/2};
}

export function ballWorldPosition(ball, pitch=CAMERA_PITCH) {
  return {
    x:pitch.x + clamp(finite(ball?.x,.5),0,1)*pitch.w,
    y:pitch.y + clamp(finite(ball?.y,.5),0,1)*pitch.h
  };
}

/** Immutable state. Camera positions are world canvas coordinates, never engine coordinates. */
export function initialCamera({mode='full',zoom=2,width=CAMERA_WIDTH,height=CAMERA_HEIGHT}={}) {
  validateCameraMode(mode);
  if (![width,height,zoom].every(x=>Number.isFinite(x)&&x>0) || zoom<1) throw new RangeError('invalid camera dimensions or zoom');
  return {mode,zoom:mode==='full'?1:zoom,worldWidth:width,worldHeight:height,
    cx:width/2,cy:height/2,lastNow:null};
}

/**
 * Follow the *rendered* ball. A camera cut on restart, halftime or mode change
 * never traverses the pitch. Boundary safety keeps the ball inside the crop,
 * even on a fast aerial pass or after a long tick gap.
 */
export function followCamera(previous,ball,{mode=previous?.mode||'full',now=0,
  zoom=2,halfLifeMs=190,cut=false,paused=false,pitch=CAMERA_PITCH}={}) {
  validateCameraMode(mode);
  if (!Number.isFinite(zoom)||zoom<1||zoom>4) throw new RangeError('broadcast zoom must be in [1,4]');
  if (!Number.isFinite(halfLifeMs)||halfLifeMs<=0) throw new RangeError('camera half life must be positive');
  const width=previous?.worldWidth||CAMERA_WIDTH,height=previous?.worldHeight||CAMERA_HEIGHT;
  if (mode==='full') return {...initialCamera({mode,width,height}),lastNow:now};
  const halfW=width/(2*zoom), halfH=height/(2*zoom);
  const pos=ballWorldPosition(ball,pitch);
  const desiredX=clamp(pos.x,halfW,width-halfW);
  const desiredY=clamp(pos.y,halfH,height-halfH);
  const changed=!previous||previous.mode!==mode||previous.zoom!==zoom;
  const nowMs=finite(now,0);
  const elapsed=previous?.lastNow===null?0:clamp(nowMs-(previous?.lastNow??nowMs),0,500);
  const alpha=1-Math.pow(.5,elapsed/halfLifeMs);
  let cx=(cut||changed)?desiredX:paused?previous.cx:previous.cx+(desiredX-previous.cx)*alpha;
  let cy=(cut||changed)?desiredY:paused?previous.cy:previous.cy+(desiredY-previous.cy)*alpha;
  // No empty shots and no ball disappearing while smoothing catches up.
  const marginW=Math.min(22/zoom,halfW*.3),marginH=Math.min(22/zoom,halfH*.3);
  cx=clamp(cx,pos.x-halfW+marginW,pos.x+halfW-marginW);
  cy=clamp(cy,pos.y-halfH+marginH,pos.y+halfH-marginH);
  cx=clamp(cx,halfW,width-halfW);cy=clamp(cy,halfH,height-halfH);
  return {mode,zoom,worldWidth:width,worldHeight:height,cx,cy,lastNow:nowMs};
}

/** Canvas transform: draw world at 640x360 then zoom/crop without changing positions. */
export function cameraTransform(camera) {
  const width=camera.worldWidth,height=camera.worldHeight,zoom=camera.mode==='full'?1:camera.zoom;
  return {zoom,translateX:width/2-zoom*camera.cx,translateY:height/2-zoom*camera.cy};
}

export function worldToScreen(camera,x,y) {
  const tr=cameraTransform(camera);
  return {x:tr.translateX+tr.zoom*x,y:tr.translateY+tr.zoom*y};
}
