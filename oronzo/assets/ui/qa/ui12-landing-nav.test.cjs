// UI12 S12-001/002: isolated source-level regression tests; not a Chromium visual audit.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'career-r03.js'), 'utf8');
const styles = fs.readFileSync(path.join(__dirname, '..', 'career-r03.css'), 'utf8');

function between(first, last) {
  const a = source.indexOf(first), b = source.indexOf(last, a + first.length);
  assert.ok(a >= 0 && b > a, 'expected authentic runtime function boundaries');
  return source.slice(a, b);
}
function entryHtml() {
  const code = between('function renderEntry(){', 'function renderAvatar(){');
  const button = (text, action, value = '', extra = '') =>
    `<button class="ui-btn ${extra}" data-action="${action}">${text}</button>`;
  return new Function('btn', `${code}; return renderEntry();`)(button);
}
function renderOn(screen, withFullscreen = false) {
  const code = between('function render(){', 'function clearMatch(){');
  const nav = { hidden: false }, header = { appendChild(el) { el.parentElement = this; } };
  const fullscreen = withFullscreen ? { parentElement: nav } : null;
  const root = {
    dataset: {},
    querySelector(sel) {
      return ({ '#runtime-nav': nav, '#fullscreen-toggle': fullscreen, '.gamebar': header })[sel] || null;
    },
  };
  const area = { innerHTML: '' }, mounted = { count: 0 };
  const stubs = ['Entry','Avatar','Offers','President','Press','Hub','Player',
    'Formation','Match','Post','Season','Unemployed','Gameover']
    .map(name => `const render${name}=()=>'<article>${name}</article>';`).join('\n');
  const make = new Function('env', `
    let screen=env.screen, state=null;
    const root=env.root, area=env.area, restoreMode=()=>{};
    const mountMatchView=()=>env.mounted.count++;
    ${stubs}
    ${code}
    return render;
  `);
  make({screen,root,area,mounted})();
  return { root, nav, area, header, fullscreen, mounted };
}

test('S12-001: opening contains only two functioning career actions', () => {
  const html = entryHtml();
  assert.equal((html.match(/<button\\b/g) || []).length, 2);
  assert.match(html, /data-action="start"/);
  assert.match(html, /data-action="load"/);
  for (const legacy of ['entry-brief', 'runtime-image', 'entry-panel', 'runtime-foot'])
    assert.ok(!html.includes(legacy), `legacy UI still visible: ${legacy}`);
});
test('S12-001: landing styles own the viewport without changing shared panels', () => {
  assert.match(styles, /#oronzo-r03\\[data-screen="entry"\\] #ui-screen\\{padding:0;gap:0\\}/);
  assert.match(styles, /runtime-entry-actions[\\s\\S]*grid-template-columns:repeat\\(2,minmax\\(0,1fr\\)\\)/);
});
test('S12-002: all 13 screens hide persistent navigation while preserving rendering', () => {
  for (const screen of ['entry','avatar','offers','president','press','hub','player',
    'formation','match','post','season','unemployed','gameover']) {
    const result=renderOn(screen);
    assert.equal(result.nav.hidden, true, screen);
    assert.equal(result.root.dataset.screen,screen);
    assert.ok(result.area.innerHTML.length>0,screen);
    if (screen==='match') assert.equal(result.mounted.count,1);
  }
});
test('S12-002: future F01 fullscreen link moves to header, retaining node identity', () => {
  for (const screen of ['entry','hub','match','press']) {
    const result=renderOn(screen,true);
    assert.equal(result.fullscreen.parentElement,result.header);
    assert.equal(result.nav.hidden,true);
  }
  assert.match(styles, /gamebar #fullscreen-toggle[\\s\\S]*height:44px;min-height:44px/);
});
test('S12: preserved former M01 touch fixes', () => {
  assert.match(styles, /runtime-answers::before/);
  assert.match(styles, /runtime-match-panel>\\[data-action="finish-qa"\\]/);
});
