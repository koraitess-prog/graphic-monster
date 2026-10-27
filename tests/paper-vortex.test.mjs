import test from 'node:test';import assert from 'node:assert/strict';
import {vortexPose,stirAt,shredContour} from '../src/paper-vortex.js';
import {paperThrowEnergy} from '../src/paper-drag.js';
import {attentivePose} from '../src/observation.js';
test('paper currents are bounded, reproducible, folded and independently phased',()=>{
 const t={language:'color',playful:true,ordered:false,expressive:true};
 for(let i=0;i<144;i++)for(const seconds of [0,1,3,7,17]){const p=vortexPose('scrap-'+i,i,144,t,seconds,.8);assert.deepEqual(p,vortexPose('scrap-'+i,i,144,t,seconds,.8));assert.ok(p.x>35&&p.x<565);assert.ok(p.y>135&&p.y<610);assert.ok(p.fold>=.52&&p.fold<=1);assert.ok(p.size>0&&p.size<=145);assert.notDeepEqual(p,vortexPose('scrap-'+i,i,144,t,seconds+.2,.8));}
 assert.notDeepEqual(vortexPose('a',0,144,t,2),vortexPose('a',0,144,{...t,ordered:true},2));
 assert.equal(new Set(Array.from({length:12},(_,i)=>JSON.stringify(shredContour(i)))).size,12);
});
test('throw energy uses recent velocity, discards a held gesture and clamps spikes',()=>{
 const slow=paperThrowEnergy([{x:0,y:100,at:0},{x:5,y:90,at:100}],100),fast=paperThrowEnergy([{x:80,y:100,at:0},{x:0,y:0,at:30}],30);
 assert.ok(fast.energy>slow.energy*3);assert.equal(fast.energy,1);assert.equal(fast.spin,-1);assert.equal(paperThrowEnergy([{x:90,y:0,at:5}],500).energy,.16);
 const impulse={at:100,energy:1,spin:-1};assert.ok(stirAt(impulse,200).energy>stirAt(impulse,1800).energy);assert.ok(stirAt(impulse,20000).energy<.0001);assert.ok(stirAt(impulse,200).turn<0);
});
test('meeting the pointer changes only gaze, preserving saved anatomy',()=>{
 const scene={shapes:[{id:'body'}],eyes:[{r:30,ry:24,gaze:[0,0]}]},before=JSON.stringify(scene),pose=attentivePose(scene,{x:1,y:0});assert.equal(JSON.stringify(scene),before);assert.equal(pose.shapes,scene.shapes);assert.ok(pose.eyes[0].gaze[0]>0);assert.ok(pose.eyes[0].gaze[1]<0);assert.equal(attentivePose(scene,null),scene);
});

test('large retained papers share the same current, spin and throw response as small scraps',()=>{
 const traits={language:'color',playful:true,ordered:false};
 for(const energy of [0,.8])for(const time of [0,1,3,7]){
  const small=vortexPose('same-stock',4,120,traits,time,energy,'paper'),large=vortexPose('same-stock',4,120,traits,time,energy,'material');
  for(const key of ['x','y','angle','fold','depth'])assert.equal(large[key],small[key],key+' uses one velocity field');
  assert.ok(large.size>small.size);
 }
});
