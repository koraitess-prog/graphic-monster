import test from 'node:test';
import assert from 'node:assert/strict';
import {arrivalBeat,ARRIVAL_GESTURE_AT} from '../src/arrival.js';
import {generateMonster,combinations} from '../src/dna.js';
import {familyPose} from '../src/family-motion.js';
import {playRevealFlight} from '../src/reveal-flight.js';

test('the arrival lands, recovers and performs before the description can appear',()=>{
 const checkpoints=[0,350,1250,1550,ARRIVAL_GESTURE_AT,ARRIVAL_GESTURE_AT+3000];
 assert.deepEqual(checkpoints.map(t=>arrivalBeat(t).phase),['suspended','falling','impact','recovering','gesture','complete']);
 for(let ms=350;ms<1250;ms+=16){const p=arrivalBeat(ms);assert.ok(p.camera<=Math.max(0,p.drop)+.0001);assert.ok(p.pose>=0&&p.pose<=1);}
 assert.equal(arrivalBeat(1250).drop,1);assert.equal(arrivalBeat(2350).tilt,0);assert.equal(arrivalBeat(5350).pose,1);
});
test('landing and recovery reuse every family without mutating saved snapshots',()=>{
 const families=new Set();
 const options=combinations();
 for(let seed=0;seed<64;seed++){
  const scene=generateMonster({...options[seed%options.length],seed},6);if(families.has(scene.anatomy))continue;families.add(scene.anatomy);
  const original=JSON.stringify(scene);
  for(const ms of [0,800,1400,1900,2350,4000,5350]){
   const b=arrivalBeat(ms),pose=familyPose(scene,b.action,b.pose,0);
   assert.ok(pose.shapes.every(s=>s.points.every(p=>p.every(Number.isFinite))));
   assert.equal(pose.shapes.length,scene.shapes.length);
  }
  assert.equal(JSON.stringify(scene),original);
 }
 assert.equal(families.size,8);
});
test('reduced motion immediately reveals the original scene without scrolling or frame loops',async()=>{
 const scene=generateMonster({...combinations()[0],seed:1},6);let draws=0;
 const view={target:scene,renderer:{canvas:{},draw(value){assert.equal(value,scene);draws++;}}};
 assert.equal(await playRevealFlight({view,app:{querySelector(){return null;}},reduced:{matches:true},signal:new AbortController().signal}),true);
 assert.equal(draws,1);
 const aborted=new AbortController();aborted.abort();
 assert.equal(await playRevealFlight({signal:aborted.signal}),false);
});
