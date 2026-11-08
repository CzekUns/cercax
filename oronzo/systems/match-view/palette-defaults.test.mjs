import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePlayerAppearance} from './asset-adapter.js';

test('R10: no custom appearance keeps distinct home and away shirts',()=>{
  const home=resolvePlayerAppearance({team:'home',appearance:{}});
  const away=resolvePlayerAppearance({team:'away',appearance:{}});
  assert.notEqual(home.shirt,away.shirt);
  assert.notEqual(home.shorts,away.shorts);
  assert.equal(home.pattern,'vertical');
  assert.equal(away.pattern,'solid');
});
test('R10: goalkeeper kit distinct from both field teams',()=>{
  const home=resolvePlayerAppearance({team:'home'});
  const away=resolvePlayerAppearance({team:'away'});
  const goalkeeper=resolvePlayerAppearance({team:'home',isKeeper:true,appearance:{}});
  assert.notEqual(goalkeeper.shirt,home.shirt);
  assert.notEqual(goalkeeper.shirt,away.shirt);
  assert.notEqual(goalkeeper.shorts,home.shorts);
});
test('R10: partial customization preserves untouched club colors',()=>{
  const chosen=resolvePlayerAppearance({team:'away',appearance:{skin:'#AABBCC',shirt:'#123456'}});
  const base=resolvePlayerAppearance({team:'away'});
  assert.equal(chosen.skin,'#AABBCC');
  assert.equal(chosen.shirt,'#123456');
  assert.equal(chosen.shorts,base.shorts);
  assert.equal(chosen.socks,base.socks);
  assert.equal(chosen.pattern,base.pattern);
});
