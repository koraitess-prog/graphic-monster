import test from 'node:test';
import assert from 'node:assert/strict';
import {arrivalBeat,ARRIVAL_FALL_AT,ARRIVAL_IMPACT_AT,ARRIVAL_HEAP_AT,ARRIVAL_RECOVER_AT,ARRIVAL_GESTURE_AT} from '../src/arrival.js';
import {arrivalPose} from '../src/arrival-pose.js';
import {generateMonster,combinations} from '../src/dna.js';

import {playRevealFlight} from '../src/reveal-flight.js';

test('the arrival lands, recovers and performs before the description can appear',()=>{
 const checkpoints=[0,ARRIVAL_FALL_AT,ARRIVAL_IMPACT_AT,ARRIVAL_HEAP_AT,ARRIVAL_RECOVER_AT,ARRIVAL_GESTURE_AT,ARRIVAL_GESTURE_AT+3000];
 assert.deepEqual(checkpoints.map(t=>arrivalBeat(t).phase),['suspended','falling','impact','heap','recovering','gesture','complete']);
 assert.ok(ARRIVAL_IMPACT_AT-ARRIVAL_FALL_AT>=4500);assert.ok(ARRIVAL_RECOVER_AT-ARRIVAL_HEAP_AT>=1000);
 for(let ms=ARRIVAL_FALL_AT;ms<ARRIVAL_IMPACT_AT;ms+=16){const p=arrivalBeat(ms);assert.ok(p.camera<=Math.max(0,p.drop)+.0001);assert.ok(p.pose>=0&&p.pose<=1);}
 assert.equal(arrivalBeat(ARRIVAL_IMPACT_AT).drop,1);assert.equal(arrivalBeat(ARRIVAL_GESTURE_AT).collapse,0);assert.equal(arrivalBeat(ARRIVAL_GESTURE_AT+3000).pose,1);
});
test('landing and recovery reuse every family without mutating saved snapshots',()=>{
 const families=new Set();
 const options=combinations();
 for(let seed=0;seed<64;seed++){
  const scene=generateMonster({...options[seed%options.length],seed},6);if(families.has(scene.anatomy))continue;families.add(scene.anatomy);
  const original=JSON.stringify(scene);
  for(const ms of [0,1700,2900,5150,6000,7200,ARRIVAL_GESTURE_AT,ARRIVAL_GESTURE_AT+3000]){
   const b=arrivalBeat(ms),pose=arrivalPose(scene,b,ms);
   assert.ok(pose.shapes.every(s=>s.points.every(p=>p.every(Number.isFinite))));
   assert.equal(pose.shapes.length,scene.shapes.length);
  }
  const height=s=>{const ys=s.shapes.flatMap(p=>p.points.map(q=>q[1]));return Math.max(...ys)-Math.min(...ys);};
  assert.ok(height(arrivalPose(scene,arrivalBeat(6000),6000))<height(scene)*.27);
  const hands=ms=>arrivalPose(scene,arrivalBeat(ms),ms).shapes.filter(p=>/^hand-/.test(p.id)).map(p=>p.points);
  assert.notDeepEqual(hands(1700),hands(1900));
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
