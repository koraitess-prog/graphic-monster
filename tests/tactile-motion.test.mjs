import test from 'node:test';import assert from 'node:assert/strict';
import {materialSpring,fallingMaterial} from '../src/tactile-motion.js';
import {burstLayout,materialPaperPose} from '../src/reveal-papers.js';
import {generateMonster,combinations} from '../src/dna.js';
import {arrivalBeat,ARRIVAL_IMPACT_AT,ARRIVAL_GESTURE_AT} from '../src/arrival.js';
import {arrivalPose} from '../src/arrival-pose.js';

test('Anidoodle scalar spring retains initial displacement/velocity and settles independent of sampling order',()=>{
 for(const damping of [.82,1]){
  assert.equal(materialSpring(0,2,7,3,10,damping),2);
  assert.ok(Math.abs((materialSpring(.000001,2,7,3,10,damping)-2)/.000001-3)<.002);
  assert.ok(Math.abs(materialSpring(4,2,7,3,10,damping)-7)<1e-8);
  const times=[.01,.2,.5,1,3],forward=times.map(t=>materialSpring(t,2,7,3,10,damping));
  assert.deepEqual(times.toReversed().map(t=>materialSpring(t,2,7,3,10,damping)).toReversed(),forward);
 }
});
test('paper fragments release separately, curl continuously and stay anchored to the upper world',()=>{
 for(const [w,h]of [[390,844],[1440,900]]){
  const pieces=burstLayout(13,w,h);assert.ok(new Set(pieces.map(p=>p.release.toFixed(2))).size>20);
  assert.ok(new Set(pieces.map(p=>p.y.toFixed(1))).size>25,'not an evenly spaced edge border');
  const mixed=pieces.map(p=>materialPaperPose(p,1.15));assert.ok(mixed.some(p=>p.alpha===0)&&mixed.some(p=>p.alpha>0));
  for(const piece of pieces){
   const times=[1,1.5,2.1,2.101,3,8],forward=times.map(t=>materialPaperPose(piece,t));
   assert.deepEqual(times.toReversed().map(t=>materialPaperPose(piece,t)).toReversed(),forward);
   assert.ok(forward.every(p=>Object.values(p).every(Number.isFinite)));
   assert.ok(Math.hypot(forward[3].x-forward[2].x,forward[3].y-forward[2].y)<5,'no snap at assembly/flight handoff');
   const world=materialPaperPose(piece,8),screen=materialPaperPose(piece,8,h*2.2);assert.equal(world.x,screen.x);assert.ok(Math.abs(screen.y+h*2.2-world.y)<1e-8);assert.ok(screen.y+piece.size<0);
  }
 }
});
test('eight families have staggered reflexes and connected, immutable crumple poses with a trailing camera',()=>{
 const signatures=new Set();
 for(let seed=0;seed<8;seed++){
  const scene=generateMonster({...combinations()[15],seed},6),before=JSON.stringify(scene),reflex=fallingMaterial(scene,.22);
  assert.notEqual(reflex.arms[0].lift,reflex.arms[1].lift);signatures.add(JSON.stringify(fallingMaterial(scene,.7)));
  const contact=arrivalBeat(ARRIVAL_IMPACT_AT,'look',2800,scene);assert.ok(contact.camera<contact.drop,'camera is still catching up at first contact');
  for(const ms of [ARRIVAL_IMPACT_AT-1,ARRIVAL_IMPACT_AT,ARRIVAL_IMPACT_AT+40,ARRIVAL_IMPACT_AT+350,7500,ARRIVAL_GESTURE_AT]){
   const beat=arrivalBeat(ms,'look',2800,scene),pose=arrivalPose(scene,beat,ms);assert.ok(pose.shapes.every(p=>p.points.every(v=>v.every(Number.isFinite))));assert.equal(pose.shapes.length,scene.shapes.length);
   if(beat.collapse)assert.ok(pose.shapes.filter(p=>!p.carrier).every(p=>p.paperOuterSource&&p.paperOuterTransform.length===6));
  }
  const beforeContact=arrivalPose(scene,arrivalBeat(ARRIVAL_IMPACT_AT-1,'look',2800,scene),ARRIVAL_IMPACT_AT-1),atContact=arrivalPose(scene,contact,ARRIVAL_IMPACT_AT);
  const hand=beforeContact.shapes.find(p=>p.id==='hand-right');if(hand){const next=atContact.shapes.find(p=>p.id===hand.id);assert.ok(Math.max(...hand.points.map((p,i)=>Math.hypot(p[0]-next.points[i][0],p[1]-next.points[i][1])))<3,'hands must not snap to rest at impact');}
  assert.equal(JSON.stringify(scene),before);
 }
 assert.equal(signatures.size,8);
});
