import test from 'node:test';import assert from 'node:assert/strict';
import {generateMonster} from '../src/dna.js';
import {buildRiftRig,characterActionPose,actionControls} from '../src/character-actions.js';
const scene=generateMonster({principle:'typography',organization:'experiment',gaze:'clarity',density:'rich',attitude:'precise',anatomy:'typography',seed:411},6),rig=buildRiftRig(scene);
const distance=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
test('the rest pose keeps the original illustration, including limb end caps',()=>{
 const pose=characterActionPose(scene,rig,'breathe',0,0);
 for(let i=0;i<scene.shapes.length;i++)for(let j=0;j<scene.shapes[i].points.length;j++)assert.ok(distance(scene.shapes[i].points[j],pose.shapes[i].points[j])<1e-7,scene.shapes[i].id);
});
test('walk plants support feet and all four actions preserve bone lengths and attachments',()=>{
 const original=JSON.stringify(scene);
 assert.deepEqual(actionControls(scene,rig,'walk',.30).feet.left,actionControls(scene,rig,'walk',.40).feet.left);
 for(const action of ['breathe','walk','jump','greet'])for(const t of [0,.15,.35,.55,.75,1]){
  const pose=characterActionPose(scene,rig,action,t,0),c=actionControls(scene,rig,action,t,0);
  for(const side of ['left','right'])for(const [kind,rests]of [['feet',rig.legs],['arms',rig.arms]]){
   const posed=pose.motionContacts[kind][side],rest=rests[side];
   assert.ok(distance(posed[0],c.torso(rest[0]))<1e-7);
   for(let j=0;j<2;j++)assert.ok(Math.abs(distance(posed[j],posed[j+1])-distance(rest[j],rest[j+1]))<1e-6);
   if(kind==='feet')assert.ok(distance(posed[2],c.feet[side])<1e-6,'support foot must reach its contact target');
  }
 }
 assert.equal(JSON.stringify(scene),original);
});
test('jump has preparation, flight, landing and recovery; greeting lifts the actual hand',()=>{
 const dy=t=>actionControls(scene,rig,'jump',t).dy;
 assert.ok(dy(.2)>15);assert.ok(dy(.46)<-70);assert.ok(dy(.75)>15);assert.equal(dy(1),0);
 const c=actionControls(scene,rig,'greet',.5);assert.ok(c.hands.right[1]<c.torso(rig.arms.right[0])[1]);
});
