import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {combinations,generateMonster,encodeDNA} from '../src/dna.js';
import {idlePose} from '../src/motion.js';
import {generateStory} from '../src/story.js';
import {initialState,reducer,restoreState} from '../src/state.js';
import {makeRecord} from '../src/archive.js';
const all=combinations(),hash=rows=>createHash('sha256').update(JSON.stringify(rows)).digest('hex');
test('all legacy anatomy, motion and writing remain byte-for-byte compatible',()=>{
 assert.equal(hash(all.map(a=>generateMonster(a,2))),'8af026a4ec38d282a5c6bd43109fbdcd3cc591102dd5c2fc8e26c24866b0f753');
 assert.equal(hash(all.map(a=>idlePose(generateMonster(a,2),.37,2))),'b7f967347987fb3713e356eacc6bcb8d02f6b38197d1529e42fe50b1cf22d632');
 assert.equal(hash(all.map(a=>generateStory(a,147,2))),'92aca1e50e764434b5273e0d4a82b876c56f0482297cac7ccf1d7d80eb5a770a');
});
test('old sessions retain version two while new creations persist version seven',()=>{
 const answers=all[49],code=encodeDNA(answers),story={code,seed:147,text:generateStory(answers,147,2)};
 const old=restoreState(JSON.stringify({screen:'reveal',step:4,answers,name:'Original',storySeed:147,story,creationId:'original',createdAt:1}));
 assert.equal(old.rulesVersion,2);assert.deepEqual(old.story,story);assert.deepEqual(makeRecord(old).scene,generateMonster(answers,2));
 let fresh=reducer(initialState(),{type:'START',name:'Anomaly',seed:31});
 for(const [key,value] of Object.entries(answers)){fresh=reducer(fresh,{type:'SELECT',value});fresh=reducer(fresh,{type:'ADVANCE'});}
 assert.equal(fresh.rulesVersion,7);assert.equal(makeRecord(fresh).scene.rulesVersion,7);assert.deepEqual(restoreState(JSON.stringify(fresh)),fresh);
 assert.equal(reducer(old,{type:'RESET'}).rulesVersion,7);
});
test('new anatomies replace cute signals and keep strongly unequal eyes',()=>{
 for(const a of all){const scene=generateMonster(a),old=generateMonster(a,2);
  assert.equal(scene.rulesVersion,3);assert.notDeepEqual(scene.body,old.body);
  assert.ok(!scene.shapes.some(p=>/cheek-|feeler|sock-/.test(p.id)));
  assert.ok(scene.shapes.filter(p=>p.id.startsWith('seam-tooth-')).length>=7);
  assert.ok(scene.eyes.every(e=>e.lid>0));
  if(scene.eyes.length>1)assert.ok(Math.max(...scene.eyes.map(e=>e.r))/Math.min(...scene.eyes.map(e=>e.r))>2.5);
 }
});
