import test from 'node:test';import assert from 'node:assert/strict';
import {generateMonster} from '../src/dna.js';
import {ANATOMIES} from '../src/paper-dna.js';
import {buildFamilyRig} from '../src/family-rig.js';
import {FAMILY_PROFILES,familyProfile,familyPose,familyCapabilities,gaitTargets} from '../src/family-motion.js';
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const representative=anatomy=>generateMonster({anatomy,principle:'color',organization:'experiment',gaze:'expression',density:'rich',attitude:'precise',seed:411},6);
test('one representative per existing family retains its art, limb count, attachments and bone lengths',()=>{
 assert.deepEqual(Object.keys(FAMILY_PROFILES).sort(),[...ANATOMIES].sort());
 for(const anatomy of ANATOMIES){
  const scene=representative(anatomy),before=JSON.stringify(scene),rig=buildFamilyRig(scene);
  assert.equal(rig.legs.length,scene.shapes.filter(a=>/^(extra-)?leg-[^~]+$/.test(a.id)).length);assert.equal(rig.arms.length,scene.attachments.filter(a=>/^(extra-)?arm-/.test(a.id)).length);
  const rest=familyPose(scene,'breathe',0,0);for(let i=0;i<scene.shapes.length;i++)for(let j=0;j<scene.shapes[i].points.length;j++)assert.ok(dist(scene.shapes[i].points[j],rest.shapes[i].points[j])<.002,anatomy+'/'+scene.shapes[i].id);
  for(const action of ['walk','jump','greet','look','stretch'])for(const t of [.2,.5,.8]){
   const pose=familyPose(scene,action,t,0);assert.equal(pose.shapes.length,scene.shapes.length);assert.equal(pose.eyes.length,scene.eyes.length);
   assert.ok(pose.shapes.every(s=>s.points.every(p=>p.every(Number.isFinite))),anatomy+'/'+action);
   const contacts=pose.motionContacts?.limbs;
   if(contacts)for(const limb of [...rig.legs,...rig.arms]){const q=contacts.get(limb.id);for(let j=0;j<q.length-1;j++)assert.ok(Math.abs(dist(q[j],q[j+1])-dist(limb.rest[j],limb.rest[j+1]))<.002,anatomy+'/'+limb.id);}
  }
  assert.equal(JSON.stringify(scene),before);
 }
});
test('three and four legs coordinate support rather than lifting every foot together',()=>{
 for(const anatomy of ['crane','knot','grid','texture']){
  const scene=representative(anatomy),rig=buildFamilyRig(scene),p=familyProfile(scene);assert.ok(rig.legs.length>=3);
  for(const t of [.08,.18,.31,.47,.62,.83]){const g=gaitTargets(rig,p,t);assert.ok(g.moving.length>0&&g.moving.length<rig.legs.length);const pose=familyPose(scene,'walk',t,0);for(const leg of rig.legs)if(!g.moving.includes(leg.id))assert.ok(dist(pose.motionContacts.limbs.get(leg.id).at(-1),g.targets.get(leg.id))<.35,anatomy+'/'+leg.id+' planted foot');}
 }
});
test('derived variants inherit family identity with deterministic individual rhythm; no limbs are invented',()=>{
 const a=representative('crane'),b=generateMonster({...a.answers,anatomy:'crane',seed:412},6);
 assert.notEqual(familyProfile(a).breathPeriod,familyProfile(b).breathPeriod);assert.equal(familyProfile(a).stride,familyProfile(b).stride);assert.deepEqual(familyProfile(a),familyProfile(a));
 const limbless={...a,attachments:a.attachments.filter(s=>!/(leg|arm)-/.test(s.id)),shapes:a.shapes.filter(s=>!/(leg|arm)-/.test(s.id))};const rig=buildFamilyRig(limbless);assert.equal(rig.legs.length,0);assert.equal(rig.arms.length,0);assert.ok(!familyCapabilities(limbless).includes('walk'));assert.ok(familyCapabilities(limbless).includes('glide'));assert.equal(familyPose(limbless,'greet',.5).shapes.length,limbless.shapes.length);
});
