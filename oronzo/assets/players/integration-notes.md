# Oronzo / Agent A — integration notes

Created for issue #1, 2026-11-06. Scope: only `oronzo/assets/players/`.

## Files
Five authentic 256x128 indexed PNG action atlases: `idle.png`, `run.png`, `kick.png`, `tackle.png`, `keeper.png`.
Matching masks `*-mask.png`, 16x16 `ball.png`, generator, manifest, recolorer and landscape demo.

## Geometry
8 columns follow N NE E SE S SW W NW; 4 rows follow frames 0 1 2 3.
Cells are exactly 32x32; pivot=(16,29) at the feet. Never crop per-frame bounding boxes
when rendering. No filtering: CSS `image-rendering:pixelated`, Canvas `imageSmoothingEnabled=false`.

## Browser integration (for orchestrator)
Load `oronzo/assets/players/palette.js` after DOM. Do NOT replace the existing match fallback until ready.
```js
const atlas = await OronzoPalette.prepare("run", {
  skin:"#BC8151", hair:"#302015", shirt:"#304A97", shirtB:"#F4F4E9",
  shorts:"#F1EFEA", socks:"#F6F6F1", boots:"#161921", pattern:"vertical"
}, "assets/players/");
OronzoPalette.draw(ctx, atlas, "SE", 2, playerScreenX, playerScreenY, 2);
```
The path is relative to `oronzo/index.html` when called from that page.
Memoize the prepared atlas per team/player appearance; `prepare` caches.
For animation: `Math.floor(elapsedSeconds*manifest.actions.run.fps)%4`.
Outlines, skin, hair, shorts, socks and shoes shade independently; match pixels use mask RGB
red=24*(materialId+1), green=64*shade. Default sprite is indexed palette, mask is equally aligned.
`shirtB` and `pattern` select solid, vertical, horizontal or halves in torso coordinates.
The back number must be a separate overlay, never painted onto atlas textures.

## Known limitations
- 32x32 is the hard limit for faces and sleeve detailing; do not stretch with bilinear filtering.
- The five animation sequences share one character build, not five visually unrelated people.
- Keeper has glove material 7; game can set `gloves` independently of kit.
- Torso pattern UV is computed procedurally from action/direction/frame, not a separate UV bitmap.
- Ref issue explicitly assigns merge/integration to the orchestrator; no main game files were changed.
