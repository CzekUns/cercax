/** R10-W2-01 P0 regression: native Node parser and real runtime import chain. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const directory=path.dirname(fileURLToPath(import.meta.url));
test('R10-W2-01: presidents and negotiations pass the actual Node parser',()=>{
  for(const file of ['presidents.js','negotiations.js']){
    assert.doesNotThrow(()=>execFileSync(process.execPath,['--check',path.join(directory,file)],
      {encoding:'utf8',stdio:'pipe'}),'Syntax failure in '+file);
  }
});
test('R10-W2-01: index09 and the real Career07 controller are importable',async()=>{
  const coachClub=await import('./index.js');
  assert.equal(typeof coachClub.persistShout,'function');
  assert.equal(typeof coachClub.settleHomeAttendance,'function');
  assert.equal(typeof coachClub.decidePresidentRequest,'function');
  assert.equal(typeof coachClub.reviewTransfer,'function');
  const careerFlow=await import('../../app/flow/controller.js');
  assert.equal(typeof careerFlow.newGame,'function');
  assert.equal(typeof careerFlow.advanceMatchday,'function');
});
