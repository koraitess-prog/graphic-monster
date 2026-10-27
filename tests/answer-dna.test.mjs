import test from 'node:test';import assert from 'node:assert/strict';
import {combinations,generateMonster,QUESTIONS,validateScene} from '../src/dna.js';import {anatomyFromAnswers} from '../src/anatomy-dna.js';
import {ANATOMIES} from '../src/paper-dna.js';import {familyPose} from '../src/family-motion.js';import {buildFamilyRig} from '../src/family-rig.js';
import {initialState,reducer,restoreState} from '../src/state.js';import {makeRecord} from '../src/archive.js';
const paths=combinations();
test('all 80 answer paths choose anatomy from answers, independent of random seed',()=>{
 const families=new Set();for(const a of paths){const base=generateMonster({...a,seed:1},7);families.add(base.anatomy);assert.equal(base.anatomy,anatomyFromAnswers(a));assert.equal(base.anatomySource,'answers');assert.equal(base.anatomySeed,null);assert.deepEqual(validateScene(base),[],base.code);assert.ok(a.gaze==='clarity'?base.eyes.length===1:base.eyes.length>=3,'gaze choice determines the eye system');
  for(const seed of [2,7,56,123,4294967295]){const scene=generateMonster({...a,seed},7);assert.equal(scene.anatomy,base.anatomy);assert.deepEqual(scene.body,base.body);assert.deepEqual(scene.attachments,base.attachments);assert.deepEqual(scene.eyes,base.eyes);}
 }assert.deepEqual(families,new Set(ANATOMIES));
});
test('every answer dimension changes actual anatomy, not only surface pigment',()=>{
 for(const a of paths){const base=generateMonster({...a,seed:11},7);for(const q of QUESTIONS){const alternate=q.options.find(o=>o[0]!==a[q.key])[0],other=generateMonster({...a,[q.key]:alternate,seed:11},7);assert.notDeepEqual(base.body,other.body,base.code+' / '+q.key);}}
});
test('new anatomy and its adapted rig remain finite and connected during movement',()=>{
 for(const a of paths){const scene=generateMonster({...a,seed:17},7),before=JSON.stringify(scene),rig=buildFamilyRig(scene);for(const limb of [...rig.arms,...rig.legs])assert.deepEqual(limb.rest[0],scene.attachments.find(p=>p.id===limb.id)?.root??scene.shapes.find(p=>p.id===limb.id)?.anchor);
  for(const action of ['breathe','look','walk','jump','fall','greet']){const pose=familyPose(scene,action,.47,2);assert.ok(pose.shapes.every(s=>s.points.every(p=>p.every(Number.isFinite))));assert.equal(pose.shapes.length,scene.shapes.length);}
  assert.equal(JSON.stringify(scene),before);
 }
});
test('fresh state uses version seven and archived version-six scenes remain exact',()=>{
 assert.equal(initialState().rulesVersion,7);
 for(const version of [6,7]){let s=reducer({...initialState(),rulesVersion:version},{type:'START',name:'DNA',seed:23,id:'dna-'+version,createdAt:123});for(const q of QUESTIONS){s=reducer(s,{type:'SELECT',value:q.options[0][0]});s=reducer(s,{type:'ADVANCE'});}const record=makeRecord(s);assert.deepEqual(restoreState(JSON.stringify(s)),s);assert.equal(record.scene.rulesVersion,version);assert.deepEqual(record.scene,generateMonster({...s.answers,seed:s.visualSeed},version));}
});
