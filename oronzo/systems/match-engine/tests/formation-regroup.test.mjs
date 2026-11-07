import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatch} from '../match-engine.js';
import {makeFixture} from '../fixtures.js';
import {formationAnchors} from '../movement.js';

const HOME='montevento';
const targetDistance=(p,target,secondHalf=false)=>
  Math.hypot((p.x-(secondHalf?1-target.x:target.x))*105,(p.y-target.y)*68);
const players=m=>m.snapshot().players.filter(p=>p.teamId===HOME);

test('prematch formation command moves REAL sprites before kickoff, without moving ball',()=>{
  const m=createMatch(makeFixture('formation-pregame'));
  const before=new Map(players(m).map(p=>[p.id,p]));
  const r=m.command({type:'tacticChange',teamId:HOME,payload:{formation:'3-5-2'}});
  assert.equal(r.accepted,true,r.reason);
  assert.equal(m.snapshot().t,0);
  const anchored=formationAnchors('3-5-2');
  const next=players(m);
  const settled=next.filter((p,i)=>!p.hasBall && targetDistance(p,anchored[i])<.001);
  assert.equal(settled.length,10,'all off-ball players must be in their new positions');
  const moved=next.filter(p=>{
    const prior=before.get(p.id);
    return Math.hypot((p.x-prior.x)*105,(p.y-prior.y)*68)>10;
  });
  assert.ok(moved.length>=2,'the prematch 3-5-2 must visibly move multiple players');
  assert.equal(m.snapshot().ball.x,.5);
  assert.equal(m.snapshot().ball.y,.5);
  assert.ok(next.find(p=>p.hasBall),'the kick-off carrier remains on the ball');
});

test('live 4-4-2 -> 3-5-2 runs onto new spots without teleportation',()=>{
  for(let seed=0;seed<10;seed++){
    const m=createMatch(makeFixture('tactical-regroup-'+seed));
    m.step(100);
    const before=new Map(players(m).map(p=>[p.id,p]));
    const command=m.command({type:'tacticChange',teamId:HOME,payload:{formation:'3-5-2'}});
    assert.equal(command.accepted,true);
    assert.equal(command.effects.regroupUntil,164);
    assert.deepEqual(players(m),[...before.values()],'command must not teleport during play');
    m.step(1);
    for(const p of players(m)){
      const previous=before.get(p.id);
      assert.ok(Math.hypot((p.x-previous.x)*105,(p.y-previous.y)*68)<4.5,
        'each real step must obey the movement speed limit');
    }
    m.step(19);
    const targets=formationAnchors('3-5-2');
    const aligned=players(m).filter((p,i)=>targetDistance(p,targets[i])<=3);
    assert.ok(aligned.length>=9,'at least 9 actors must have reached the new formation');
    const changes=m.getEventsSince(0).filter(e=>e.type==='tacticChange');
    assert.equal(changes.at(-1)?.detail?.tactics?.formation,'3-5-2');
  }
});

test('the repositioning reverses at halftime and ordinary pressing does not reset XI',()=>{
  const m=createMatch(makeFixture('tactical-regroup-secondhalf'));
  m.step(2800);
  const event=m.command({type:'tacticChange',teamId:HOME,payload:{formation:'5-3-2'}});
  assert.equal(event.accepted,true);
  m.step(20);
  const targets=formationAnchors('5-3-2');
  assert.ok(players(m).filter((p,i)=>targetDistance(p,targets[i],true)<3.5).length>=9);
  const before=players(m);
  const press=m.command({type:'tacticChange',teamId:HOME,payload:{pressing:85,mentality:75}});
  assert.equal(press.accepted,true);
  assert.equal(press.effects.regroupUntil,undefined);
  assert.deepEqual(players(m),before,'ordinary coach sliders must not teleport players');
});

test('regroup never takes the ball away from its carrier or edits the match clock',()=>{
  const m=createMatch(makeFixture('tactical-regroup-carrier'));
  m.step(110);
  const before=m.snapshot();
  const r=m.command({type:'tacticChange',teamId:HOME,payload:{formation:'4-3-3'}});
  assert.equal(r.accepted,true);
  const after=m.snapshot();
  assert.equal(after.t,before.t);
  assert.deepEqual(after.score,before.score);
  assert.deepEqual(after.ball,before.ball);
  m.step(30);
  const next=m.snapshot();
  assert.equal(next.t,before.t+30);
  assert.equal(next.players.length,22);
});
