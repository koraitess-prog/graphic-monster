import test from 'node:test';import assert from 'node:assert/strict';
import {combinations,generateMonster,QUESTIONS,validateScene} from '../src/dna.js';
import {ANATOMIES,independentAnatomy} from '../src/paper-dna.js';
import {PAPER_LIBRARY} from '../src/paper-library.js';
import {evolutionScene} from '../src/evolution.js';
import {idlePose} from '../src/motion.js';
import {interpolateScene} from '../src/renderer.js';
import {initialState,reducer,restoreState} from '../src/state.js';
import {makeRecord,mergeRecord} from '../src/archive.js';
const all=combinations(),languages=QUESTIONS[0].options.map(o=>o[0]);
test('all eight anatomies are available in every language, independently of question one',()=>{
 for(const language of languages)assert.deepEqual(new Set(all.filter(a=>a.principle===language).map(independentAnatomy)),new Set(ANATOMIES));
 for(const a of all.filter(a=>a.principle==='typography')){
  const reference=generateMonster(a,6);
  for(const principle of languages){const s=generateMonster({...a,principle},6);assert.equal(s.anatomy,reference.anatomy);assert.deepEqual(s.body,reference.body);assert.deepEqual(s.eyes,reference.eyes);assert.deepEqual(s.attachments,reference.attachments);}
 }
});
test('every cutout family supplies structural geometry and pattern pieces carry their own prints',()=>{
 for(const language of languages)assert.ok(PAPER_LIBRARY[language].length>=8);
 assert.ok(new Set(PAPER_LIBRARY.texture.map(t=>t.pattern)).size>=13);
 for(const a of all){const s=generateMonster(a,6),pieces=s.shapes.filter(p=>p.paperPiece&&p.vocabulary!=='neutral');
  assert.ok(pieces.length>=12,s.code);assert.ok(pieces.every(p=>p.vocabulary===a.principle));
  assert.ok(pieces.every(p=>s.shapes.some(parent=>parent.id===p.clipParent&&parent.carrier)));
  assert.ok(s.shapes.find(p=>p.id==='body').carrier);
  assert.ok(pieces.some(p=>p.motionPart==='body')&&pieces.some(p=>p.motionPart==='arm-left'));
  if(a.principle==='texture')assert.ok(new Set(pieces.map(p=>p.paperPattern)).size>=4,s.code);
  const rich=generateMonster({...a,density:'rich'},6),minimal=generateMonster({...a,density:'minimal'},6);
  assert.ok(rich.shapes.filter(p=>p.paperPiece).length>minimal.shapes.filter(p=>p.paperPiece).length);
 }
});
test('all new DNA paths reproduce, remain valid while moving, and preserve five-step projection',()=>{
 for(const a of all){const scene=generateMonster(a,6);assert.deepEqual(scene,generateMonster(a,6));assert.deepEqual(scene,JSON.parse(JSON.stringify(scene)));assert.deepEqual(validateScene(scene),[],scene.code);
  for(const event of [0,1])for(const t of [.15,.5,.85])assert.deepEqual(validateScene(idlePose(scene,t,event)),[],scene.code+' idle');
  let partial={};for(const [i,q]of QUESTIONS.entries()){partial[q.key]=a[q.key];const s=evolutionScene(partial,6);assert.equal(s.stage,i+1);assert.deepEqual(validateScene(s),[],scene.code+' stage '+i);assert.equal(s.eyes.length>0,i>=2);assert.equal(s.shapes.some(p=>p.id==='arm-left'),i===4);}
  const seeded=generateMonster({...a,seed:123},6);assert.deepEqual(seeded,generateMonster({...a,seed:123},6));assert.equal(seeded.seed,123);assert.deepEqual(scene,generateMonster({...a,seed:scene.seed},6));
 }
});
test('legacy version-six creations keep their anatomy seed through the questionnaire and story regeneration',()=>{
 for(let seed=0;seed<8;seed++){
  let state=reducer({...initialState(),rulesVersion:6},{type:'START',name:'Continuity',seed}),previous=null;
  for(const [i,q]of QUESTIONS.entries()){
   state=reducer(state,{type:'SELECT',value:q.options[i%q.options.length][0]});const scene=evolutionScene({...state.answers,seed:state.visualSeed},6);
   assert.equal(scene.anatomy,ANATOMIES[seed]);
   if(previous)for(const t of [.25,.5,.75])assert.deepEqual(validateScene(interpolateScene(previous,scene,t)),[],seed+' stage '+i);
   previous=scene;state=reducer(state,{type:'ADVANCE'});
  }
  const original=makeRecord(state);state=reducer(state,{type:'REGENERATE',seed:99});assert.equal(state.visualSeed,seed);assert.deepEqual(makeRecord(state).scene,original.scene);
 }
});
test('version six archives snapshots while previous versions and the approved Rift remain stable',()=>{
 for(const a of all){let state=reducer({...initialState(),rulesVersion:6},{type:'START',name:'Paper specimen',seed:19});for(const q of QUESTIONS){state=reducer(state,{type:'SELECT',value:a[q.key]});state=reducer(state,{type:'ADVANCE'});}
  assert.equal(state.rulesVersion,6);assert.deepEqual(restoreState(JSON.stringify(state)),state);const record=makeRecord(state);assert.deepEqual(record.scene,generateMonster({...a,seed:state.visualSeed},6));
  const oldState={...state,rulesVersion:5},old=makeRecord(oldState);assert.deepEqual(restoreState(JSON.stringify(oldState)),oldState);assert.equal(mergeRecord(old,record).scene,old.scene);
 }
});
test('paper reassembly has exact endpoints, finite fragments and animated material coordinates',()=>{
 for(const a of all.filter(a=>a.organization==='experiment')){
  const from=generateMonster(a,6),to=generateMonster({...a,principle:languages[(languages.indexOf(a.principle)+1)%5]},6);
  assert.equal(interpolateScene(from,to,0),from);assert.equal(interpolateScene(from,to,1),to);
  for(const t of [.2,.5,.8]){const s=interpolateScene(from,to,t);assert.deepEqual(validateScene(s),[],s.code+' transition');assert.ok(s.shapes.filter(p=>p.paperPiece).every(p=>p.paperRestPoints&&p.points.every(q=>q.every(Number.isFinite))));}
 }
});
