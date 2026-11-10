/**
 * ORONZO / Cutscene player. Self-contained ESM, no dependencies.
 * Side-scrolling keyframe playback over an independent stadium background.
 * Import from the game: import { OronzoCutscenePlayer } from './assets/cutscenes/cutscene-player.js';
 */
const BASE_URL = new URL('.', import.meta.url);
const IMG = new Map();
const DEFAULT_CUSTOM = { skin: null, hair: null, shirt: null, shirtB: null, shorts: null, socks: null };

function image(url) {
  const key = url.href;
  if (!IMG.has(key)) IMG.set(key, new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Cannot load cutscene image: ' + key));
    el.src = key;
  }));
  return IMG.get(key);
}
function readPixels(el) {
  const canvas = document.createElement('canvas');
  canvas.width = el.naturalWidth;
  canvas.height = el.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(el, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}
function parseHex(str) {
  const cleaned = String(str || '#808080').replace('#', '');
  const h = cleaned.length === 3 ? cleaned.split('').map(s => s + s).join('') : cleaned;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function recolorRamp(hex) {
  const base = parseHex(hex);
  return [1.26, 1, 0.73, 0.48].map(f => base.map(v => Math.min(255, Math.round(v * f))));
}

export class OronzoCutscenePlayer {
  /** canvas needs to be physically 320x180. It may have responsive CSS pixelated scaling. */
  constructor(canvas, { baseUrl = BASE_URL, onComplete = null } = {}) {
    this.canvas = canvas;
    this.canvas.width = 320;
    this.canvas.height = 180;
    this.canvas.style.imageRendering = 'pixelated';
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.ctx.imageSmoothingEnabled = false;
    this.baseUrl = new URL(baseUrl, document.baseURI);
    this.onComplete = onComplete;
    this.manifest = null;
    this.loaded = new Map();
    this.frame = 0;
    this.eventType = 'goal';
    this.appearance = { ...DEFAULT_CUSTOM };
    this.pattern = 'solid';
    this.running = false;
    this.loop = false;
    this.speed = 1;
    this._frameStart = 0;
    this._raf = null;
  }
  async init() {
    const response = await fetch(new URL('manifest.json', this.baseUrl));
    if (!response.ok) throw new Error('Cannot load cutscene manifest (' + response.status + ')');
    this.manifest = await response.json();
    if (this.manifest.frame.width !== 320 || this.manifest.frame.height !== 180)
      throw new Error('Unexpected cutscene dimensions');
    await this.prepare('goal');
    this.renderFrame(0);
    return this;
  }
  async prepare(type) {
    if (!this.manifest) throw new Error('Call init() first');
    const spec = this.manifest.scenes[type];
    if (!spec) throw new Error('Unknown cutscene event: ' + type);
    if (!this.loaded.has(type)) {
      const filenames = [spec.sprite, spec.materialsMask, spec.shadesMask, spec.background];
      const [sprite, materials, shades, background] = await Promise.all(
        filenames.map(name => image(new URL(name, this.baseUrl)))
      );
      if (sprite.naturalWidth !== 1920 || sprite.naturalHeight !== 180 ||
          materials.naturalWidth !== 1920 || materials.naturalHeight !== 180 ||
          shades.naturalWidth !== 1920 || shades.naturalHeight !== 180 ||
          background.naturalWidth !== 320 || background.naturalHeight !== 180)
        throw new Error('Cutscene source is incorrectly sized: ' + type);
      this.loaded.set(type, { sprite, background, materialData: readPixels(materials), shadeData: readPixels(shades), cache: new Map() });
    }
    this.eventType = type;
    return this.loaded.get(type);
  }
  setAppearance(appearance = {}, pattern = this.pattern) {
    this.appearance = { ...DEFAULT_CUSTOM, ...appearance };
    this.pattern = ['solid','vertical','horizontal','halves'].includes(pattern) ? pattern : 'solid';
    if (this.manifest && this.loaded.has(this.eventType)) this.renderFrame(this.frame);
  }
  _buildAtlas(type) {
    const spec = this.manifest.scenes[type];
    const src = this.loaded.get(type);
    const key = JSON.stringify([this.appearance, this.pattern]);
    if (src.cache.has(key)) return src.cache.get(key);
    const ids = this.manifest.materials.ids;
    const palettes = spec.defaultAppearance;
    const ramps = {};
    Object.keys(ids).forEach(name => {
      if (name === 'transparent') return;
      const picked = this.appearance[name];
      ramps[ids[name]] = picked
        ? recolorRamp(picked)
        : palettes[name].map(parseHex);
    });
    const w = 1920, h = 180, mat = src.materialData, shades = src.shadeData;
    const raw = new Uint8ClampedArray(w * h * 4);
    // For stripes, derive the running player's torso x/y origin per individual frame
    // from its shirt material bbox, not from screen coordinates.
    const origins = [];
    for (let f = 0; f < 6; f++) {
      let minX = 999, minY = 999, maxX = 0;
      for (let y = 0; y < h; y++) for (let x = f * 320; x < (f+1)*320; x++) {
        if (mat[(y*w+x)*4] === ids.shirt) {
          minX = Math.min(minX, x); maxX = Math.max(maxX,x); minY = Math.min(minY,y);
        }
      }
      origins.push({ x: minX === 999 ? f * 320 : minX, y: minY === 999 ? 0 : minY, center: (minX+maxX)/2 });
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const k = (y*w+x)*4;
        let id = mat[k];
        if (!id) continue;
        const shade = Math.min(3, shades[k]);
        if (id === ids.shirt && this.pattern !== 'solid') {
          const frame = Math.floor(x / 320), org = origins[frame];
          if ((this.pattern === 'vertical' && Math.floor((x-org.x)/6) % 2 === 1) ||
              (this.pattern === 'horizontal' && Math.floor((y-org.y)/7) % 2 === 1) ||
              (this.pattern === 'halves' && x > org.center)) id = ids.shirtB;
        }
        const color = ramps[id]?.[shade];
        if (!color) continue;
        raw[k] = color[0]; raw[k+1] = color[1]; raw[k+2] = color[2]; raw[k+3] = 255;
      }
    }
    const atlas = document.createElement('canvas');
    atlas.width = w; atlas.height = h;
    atlas.getContext('2d').putImageData(new ImageData(raw, w, h), 0, 0);
    if (src.cache.size > 5) src.cache.clear();
    src.cache.set(key, atlas);
    return atlas;
  }
  renderFrame(frame = this.frame) {
    if (!this.loaded.has(this.eventType)) return;
    const spec = this.manifest.scenes[this.eventType];
    this.frame = Math.max(0, Math.min(spec.frameCount - 1, Math.floor(frame)));
    const { background } = this.loaded.get(this.eventType);
    const ctx = this.ctx;
    ctx.clearRect(0,0,320,180);
    ctx.drawImage(background,0,0,320,180);
    ctx.drawImage(this._buildAtlas(this.eventType),this.frame*320,0,320,180,0,0,320,180);
  }
  async play(type, { appearance, pattern, loop = false, speed = 1 } = {}) {
    this.stop(false);
    await this.prepare(type);
    if (appearance || pattern) this.setAppearance(appearance || this.appearance, pattern || this.pattern);
    this.loop = !!loop;
    this.speed = Math.min(4, Math.max(0.25, Number(speed) || 1));
    this.running = true;
    this._frameStart = performance.now();
    const animate = now => {
      if (!this.running) return;
      const fps = this.manifest.scenes[type].fps * this.speed;
      const pos = Math.floor((now - this._frameStart) * fps / 1000);
      if (!this.loop && pos >= 6) {
        this.stop(true);
        this.onComplete?.(type);
        return;
      }
      this.renderFrame(pos % 6);
      this._raf = requestAnimationFrame(animate);
    };
    this.renderFrame(0);
    this._raf = requestAnimationFrame(animate);
  }
  stop(clear = true) {
    this.running = false;
    if (this._raf !== null) cancelAnimationFrame(this._raf);
    this._raf = null;
    if (clear) this.ctx.clearRect(0,0,320,180);
  }
}
