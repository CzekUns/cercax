// UI12 S12-001/002/003: isolated source-level regression tests; not a Chromium visual audit.
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
  const stubs = ['Entry','Avatar','Offers','President','Press','Hub','HubSection','Player',
    'Formation','Match','Post','Season','Unemployed','Gameover']
    .map(name => `const render${name}=()=>'<article>${name}</article>';`).join('\n');
  const make = new Function('env', `
    let screen=env.screen, state=null, selectedPlayerId=null;
    const root=env.root, area=env.area, restoreMode=()=>{};
    const mountMatchView=()=>env.mounted.count++, mountPlayerIllustration=()=>Promise.resolve(false), getRosterPlayer=()=>({}), errors=[];
    ${stubs}
    ${code}
    return render;
  `);
  make({screen,root,area,mounted})();
  return { root, nav, area, header, fullscreen, mounted };
}

test('S12-001: opening contains only two functioning career actions', () => {
  const html = entryHtml();
  assert.equal((html.match(/<button\b/g) || []).length, 2);
  assert.match(html, /data-action="start"/);
  assert.match(html, /data-action="load"/);
  for (const legacy of ['entry-brief', 'runtime-image', 'entry-panel', 'runtime-foot'])
    assert.ok(!html.includes(legacy), `legacy UI still visible: ${legacy}`);
});
test('S12-001: landing styles own the viewport without changing shared panels', () => {
  assert.match(styles, /#oronzo-r03\[data-screen="entry"\] #ui-screen\{padding:0;gap:0\}/);
  assert.match(styles, /runtime-entry\{[\s\S]*grid-template-columns:minmax\(0,1\.55fr\) minmax\(185px,1fr\)/);
  assert.match(styles, /office-desk-v02\.png/);
  assert.match(styles, /runtime-entry-actions\{[\s\S]*flex-direction:column/);
  assert.match(entryHtml(), /class="runtime-entry-visual"/);
});
test('S12-002: all 14 screens hide persistent navigation while preserving rendering', () => {
  for (const screen of ['entry','avatar','offers','president','press','hub','hub-section','player',
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
  assert.match(styles, /gamebar #fullscreen-toggle[\s\S]*height:44px;min-height:44px/);
});
test('S12: preserved former M01 touch fixes', () => {
  assert.match(styles, /runtime-answers::before/);
  assert.match(styles, /runtime-match-panel>\[data-action="finish-qa"\]/);
});

function sectionFixture() {
  const code=between('const hubMenu=', 'function renderFieldGroup(');
  const make=new Function('env', [
    'let selectedHub="campionato", state=env.state, trainingPlan="balanced", trainingIntensity=50, trainingRosterOpen=false, supportTab="stadio";',
    'const getUI=()=>env.ui;',
    'const esc=s=>String(s??""),',
    ' head=(name)=>"<h1>"+name+"</h1>",',
    ' pane=(name,html,extra)=>"<section class=\\""+extra+"\\">"+html+"</section>",',
    ' h=html=>"<div class=\\"runtime-controls\\">"+html+"</div>",',
    ' btn=(name,action)=>"<button data-action=\\""+action+"\\">"+name+"</button>",',
    ' kpis=()=>"<aside>INDICATORI</aside>",',
    ' playerRow=(p)=>"<button data-action=\\"player\\">"+p.name+"</button>",',
    ' tableRow=(r)=>"<div class=\\"runtime-table-row\\">"+r.clubName+"</div>",',
    ' president=()=>({name:"Presidente QA",goal:"Promozione"}),',
    ' getStandings=()=>[{clubName:"Club QA",points:3,played:1}],',
    ' agendaSummary=()=>"PREPARA LA PARTITA",',
    ' renderTrainingPanel=()=>"<div class=\\\"r11-training-page\\\"><button data-action=\\\"hub\\\">UFFICIO</button><button data-action=\\\"training-apply\\\">APPLICA</button></div>",',
    ' renderSupportersPanel=()=>"<div class=\\\"r11-support-page\\\"><button data-action=\\\"hub\\\">UFFICIO</button></div>",',
    ' renderDeskAgenda=()=>"<div class=\\\"r11-agenda-view\\\"><button data-action=\\\"hub\\\">UFFICIO</button></div>",',
    ' renderRosterLinks=()=>"<div class=\\\"r11-roster-scroll\\\"></div>";',
    code,
    'return {renderHub,renderHubSection,hubMenu,setSection(v){selectedHub=v}};'
  ].join('\n'));
  const ui={gameDate:'1979-08-01',seasonWeek:1,
    club:{id:'club-1',name:'Club QA',divisionId:'PROM',
      players:[{playerId:'player-1',name:'Giocatore QA',positions:['GK']}]},
    upcomingFixture:null,coach:{relationships:{fans:50,media:50}}};
  const state={clubs:[{id:'club-1',boardTrust:50,finance:{cash:100,arrears:0}}]};
  return make({ui,state});
}
test('S12-003/R11: office shows six navigable cards including the agenda', () => {
  const fixture=sectionFixture(),html=fixture.renderHub();
  assert.equal((html.match(/data-action="section"/g)||[]).length,6);
  assert.match(html,/runtime-hub-home/);
  assert.ok(!html.includes('runtime-hub-detail'));
  assert.ok(!html.includes('runtime-table-row'));
  assert.match(html,/data-action="formation"/);
  assert.match(html,/data-action="save"/);
});
test('S12-003: each office section is a full panel with actual data and a return action', () => {
  const fixture=sectionFixture();
  const expectations={
    campionato:'runtime-table',rosa:'runtime-roster-list',
    allenamento:'r11-training-page',tifoseria:'r11-support-page',
    presidente:'Fiducia'
  };
  for(const [section,marker] of Object.entries(expectations)){
    fixture.setSection(section);
    const html=fixture.renderHubSection();
    if(!['allenamento','tifoseria'].includes(section))assert.match(html,/runtime-hub-detail/,section);
    assert.ok(html.includes(marker),section);
    assert.match(html,/data-action="hub"/,section);
    assert.ok(!html.includes('class="menu-cards'),section);
    assert.equal((html.match(/data-action="section"/g)||[]).length,0,section);
  }
  fixture.setSection('allenamento');
  assert.doesNotMatch(fixture.renderHubSection(),/MODIFICA ALLENAMENTO · NON DISPONIBILE/);
});
test('S12-003: menu selection and player back routes point to dedicated office section', () => {
  const code=between('function interact(action,value)', 'function renderMatchControls()');
  const factory=new Function('env', [
    'let selectedHub="campionato", selectedPlayerId=null, screen="hub", trainingRosterOpen=false, supportTab="stadio";',
    'const state={coach:{morale:60,gameOver:false}},',
    ' hubMenu=env.hubMenu;',
    'const activeStage=()=>"hub", failure=s=>{throw Error(s)},',
    ' display=s=>{screen=s}, getUI=()=>({club:{players:[{playerId:"p1"}]}});',
    code,
    'return {interact,get screen(){return screen},get selectedHub(){return selectedHub}};'
  ].join('\n'));
  const f=sectionFixture();
  const page=factory({hubMenu:f.hubMenu});
  for(const section of f.hubMenu.map(row=>row[0])){
    page.interact('section',section);
    assert.equal(page.screen,'hub-section');
    assert.equal(page.selectedHub,section);
    page.interact('hub');
    assert.equal(page.screen,'hub');
  }
  page.interact('back-rosa');
  assert.equal(page.screen,'hub-section');assert.equal(page.selectedHub,'rosa');
  page.interact('back-training');
  assert.equal(page.screen,'hub-section');assert.equal(page.selectedHub,'allenamento');
  assert.throws(()=>page.interact('section','nonexistent'),/Sezione non disponibile/);
});

test('S12-004: visible PC artwork is an explicit image, not only CSS background', () => {
  const html=entryHtml();
  assert.match(html, /<img class="runtime-entry-photo" /);
  assert.match(html, /src="\.\/office-desk-v02\.png\?v=s12-004"/);
  assert.match(html, /alt="Ufficio rétro con computer"/);
  assert.match(styles, /\.runtime-entry-visual \.runtime-entry-photo\{[\s\S]*object-fit:contain/);
  assert.match(styles, /\.runtime-entry-visual\{[\s\S]*overflow:hidden/);
});
test('S12-004: career CSS and JS are versioned together for cache invalidation', () => {
  const page=fs.readFileSync(path.join(__dirname,'..','career-r03.html'),'utf8');
  assert.match(page, /career-r03\.css\?v=r11-single/);
  assert.match(page, /career-r03\.js\?v=r11-single/);
});
