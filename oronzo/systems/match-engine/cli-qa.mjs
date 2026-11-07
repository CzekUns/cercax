import {runQa100} from './qa-100-seeds.mjs';
const seeds=process.argv[2]===undefined?100:Number(process.argv[2]);
console.log(JSON.stringify(runQa100(seeds),null,2));
