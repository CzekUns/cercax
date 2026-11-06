/* ORONZO · Narrative engine v1. Standalone: no DOM, storage or game.js dependency.
   Integrator imports this file; all futureEffects remain inert until explicit implementation. */
const NUMERIC_STATS = new Set(["morale", "fatigue", "confidence", "health", "luck"]);
const TRIGGER_KEYS = new Set(["weekMin", "weekMax", "trainingDone", "lastResult", "teamMoraleBelow", "teamMoraleAbove", "teamFatigueAbove", "teamFatigueBelow", "teamConfidenceBelow", "teamConfidenceAbove", "teamHealthBelow", "teamLuckBelow", "teamCharacterAbove", "standingsPositionAbove", "standingsPositionBelow"]);

export function makeMemory() {
  return {eventsSeen: {}, seasonOnce: {}, lastEvents: [], eventVariantIndex: {},
    microSeen: {}, recentMicro: [], dialoguesSeen: {}, recentDialogues: [],
    lastEventTag: null};
}
function hasOwn(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); }
function finite(value) { return typeof value === "number" && Number.isFinite(value); }
function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
function avg(players, key) {
  const values = players.map(p => p[key]).filter(finite);
  return values.length ? values.reduce((a,b) => a+b,0)/values.length : null;
}
export function deriveMetrics(state) {
  const players = Array.isArray(state && state.players) ? state.players : [];
  const starters = players.filter(p => p.starter);
  const base = starters.length ? starters : players;
  let standingsPosition = null;
  if (Array.isArray(state && state.table) && state.table[0]) {
    const home = state.table[0];
    const sorted = [...state.table].sort((a,b) => (b.pt-a.pt) || ((b.gf-b.ga)-(a.gf-a.ga)));
    standingsPosition = sorted.indexOf(home)+1;
  }
  return {
    week: finite(state && state.week) ? state.week : 1,
    trainingDone: Boolean(state && state.trainingDone),
    lastResult: state && (state.lastResult === "win" || state.lastResult === "draw" || state.lastResult === "loss") ? state.lastResult : null,
    teamMorale: avg(base,"morale"),
    teamFatigue: avg(base,"fatigue"),
    teamConfidence: avg(base,"confidence"),
    teamHealth: avg(base,"health"),
    teamLuck: avg(base,"luck"),
    teamCharacter: avg(base,"character"),
    standingsPosition
  };
}
export function matchConditions(conditions, stateOrMetrics) {
  const m = stateOrMetrics && hasOwn(stateOrMetrics,"teamMorale") ? stateOrMetrics : deriveMetrics(stateOrMetrics);
  const source = conditions || {};
  for (const [key, threshold] of Object.entries(source)) {
    if (!TRIGGER_KEYS.has(key)) return false; // unknown trigger must not silently fire
    if (key === "weekMin" && !(m.week >= threshold)) return false;
    if (key === "weekMax" && !(m.week <= threshold)) return false;
    if (key === "trainingDone" && m.trainingDone !== threshold) return false;
    if (key === "lastResult" && m.lastResult !== threshold) return false;
    if (key.startsWith("team") && (key.endsWith("Below") || key.endsWith("Above"))) {
      const field = key.slice(0,-5);
      const val = m[field]; // teamMoraleBelow => teamMorale
      if (!finite(val)) return false;
      if (key.endsWith("Below") && !(val < threshold)) return false;
      if (key.endsWith("Above") && !(val > threshold)) return false;
    }
    if (key === "standingsPositionAbove" && !(finite(m.standingsPosition) && m.standingsPosition > threshold)) return false;
    if (key === "standingsPositionBelow" && !(finite(m.standingsPosition) && m.standingsPosition < threshold)) return false;
  }
  return true;
}
function weightedPick(items, rng, effectiveWeight) {
  if (!items.length) return null;
  const weights = items.map(x => Math.max(0, effectiveWeight(x)));
  const sum = weights.reduce((a,b) => a+b, 0);
  if (!sum) return null;
  const raw = rng();
  let n = clamp(finite(raw) ? raw : 0.5, 0, 0.999999) * sum;
  for (let i=0; i<items.length; i++) { n -= weights[i]; if (n < 0) return items[i]; }
  return items[items.length-1];
}
function cooled(id, week, cooldown, seen) {
  return !hasOwn(seen,id) || (week-seen[id] >= cooldown);
}
function appendRecent(memory, key, id, max) {
  if (!Array.isArray(memory[key])) memory[key]=[];
  memory[key] = [...memory[key].filter(x => x!==id), id].slice(-max);
}
export function eligibleEvents(data, state, memory) {
  const m = deriveMetrics(state);
  return (Array.isArray(data) ? data : data.events || []).filter(event =>
    matchConditions(event.triggers, m) &&
    !(event.oncePerSeason && memory.seasonOnce[event.id]) &&
    cooled(event.id,m.week,event.cooldownWeeks,memory.eventsSeen)
  );
}
export function selectEvent(data, state, memory, rng=Math.random) {
  const m=deriveMetrics(state), choices=eligibleEvents(data,state,memory);
  const selected=weightedPick(choices,rng,e => (e.weight || 1) * (e.tags.includes(memory.lastEventTag) ? 0.65 : 1));
  if (!selected) return null;
  memory.eventsSeen[selected.id]=m.week;
  if (selected.oncePerSeason) memory.seasonOnce[selected.id]=true;
  appendRecent(memory,"lastEvents",selected.id,6);
  memory.lastEventTag=selected.tags[0] || null;
  const bodies=[selected.body, ...(selected.variants || [])];
  const idx=(memory.eventVariantIndex[selected.id] || 0)%bodies.length;
  memory.eventVariantIndex[selected.id]=idx+1;
  return {event:selected,text:bodies[idx],metrics:m};
}
export function applyChoice(state, choice) {
  const players=Array.isArray(state.players) ? state.players : [];
  const target=choice.target || "all";
  const accepts = p => target==="all" || (target==="starters" && p.starter) ||
    (target==="reserves" && !p.starter) || (target==="strikers" && p.starter && p.role==="ATT");
  let count=0;
  const nextPlayers=players.map(p=>{
    if (!accepts(p)) return p;
    const changed={...p};
    for(const [key,delta] of Object.entries(choice.effects || {})) {
      if (!NUMERIC_STATS.has(key) || !finite(delta) || Math.abs(delta)>3) continue;
      if (!finite(changed[key])) continue;
      changed[key]=clamp(changed[key]+delta,0,100);
    }
    count++;
    return changed;
  });
  return {state:{...state,players:nextPlayers},applied:{target,affectedPlayers:count,effects:{...choice.effects}},
    deferred:{...(choice.futureEffects || {})}};
}
export function selectMicrocopy(data, category, state, memory, rng=Math.random) {
  const items=Array.isArray(data) ? data : data.entries || [];
  const m=deriveMetrics(state);
  const eligible=items.filter(x => x.category===category && matchConditions(x.when,m) &&
    cooled(x.id,m.week,x.cooldownWeeks || 0,memory.microSeen) && !(memory.recentMicro || []).includes(x.id));
  const picked=weightedPick(eligible,rng,x=>x.weight || 1);
  if(!picked) return null;
  memory.microSeen[picked.id]=m.week;
  appendRecent(memory,"recentMicro",picked.id,5);
  return picked;
}
export function selectDialogue(data, scene, state, memory, rng=Math.random) {
  const items=Array.isArray(data) ? data : data.dialogues || [];
  const m=deriveMetrics(state);
  const eligible=items.filter(x => x.scene===scene &&
    cooled(x.id,m.week,x.cooldownWeeks || 0,memory.dialoguesSeen) &&
    !(memory.recentDialogues || []).includes(x.id) &&
    (x.variants || []).some(v=>matchConditions(v.when,m)));
  const picked=weightedPick(eligible,rng,x=>x.weight || 1);
  if (!picked) return null;
  const specific=picked.variants.find(v=>Object.keys(v.when || {}).length>0 && matchConditions(v.when,m));
  const variant=specific || picked.variants.find(v=>matchConditions(v.when,m));
  memory.dialoguesSeen[picked.id]=m.week;
  appendRecent(memory,"recentDialogues",picked.id,4);
  return {id:picked.id,scene:picked.scene,variantId:variant.id,lines:variant.lines};
}
export function resetSeason(memory) {
  memory.eventsSeen={}; memory.seasonOnce={}; memory.lastEvents=[]; memory.eventVariantIndex={};
  memory.microSeen={}; memory.recentMicro=[]; memory.dialoguesSeen={}; memory.recentDialogues=[];
  memory.lastEventTag=null;
  return memory;
}
export const supportedTriggers=[...TRIGGER_KEYS];
export const supportedEffects=[...NUMERIC_STATS];
