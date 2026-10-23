import {test} from 'node:test';
import assert from 'node:assert/strict';
import {combinations,QUESTIONS,generateMonster,pointInside,encodeDNA} from '../src/dna.js';
import {initialState,reducer,restoreState} from '../src/state.js';
import {makeRecord,mergeRecord,shortStatement} from '../src/archive.js';

function completed(answers,id='creature-1'){
 let state=reducer(initialState(),{type:'START',name:'Moss & Margot',seed:421,id,createdAt:1761100000000});
 for(const q of QUESTIONS){state=reducer(state,{type:'SELECT',value:answers[q.key]});state=reducer(state,{type:'ADVANCE'});}return state;
}
test('archive records preserve the exact finished scene, identity and original description',()=>{
 const ids=new Set();
 for(const [i,a] of combinations().entries()){
  const state=completed(a,`specimen-${i}`),record=makeRecord(state);ids.add(record.id);
  assert.equal(record.code,encodeDNA(a));assert.deepEqual(record.scene,generateMonster(a));assert.equal(record.seed,record.scene.seed);assert.equal(record.createdAt,state.createdAt);
  assert.deepEqual(restoreState(JSON.stringify(state)),state);
  const next=reducer(state,{type:'REGENERATE',seed:847});const merged=mergeRecord(record,makeRecord(next));
  assert.equal(merged.scene,record.scene);assert.equal(merged.answers,record.answers);assert.equal(merged.originalStory,record.originalStory);assert.equal(merged.story.text,next.story.text);assert.notEqual(merged.story.text,record.story.text);
  assert.equal(mergeRecord(record,record).id,record.id);
  assert.throws(()=>mergeRecord(record,{...record,name:'Changed'}));assert.throws(()=>mergeRecord({...record,version:99},record));
  assert.ok(state.story.text.startsWith(shortStatement(state.story)));assert.ok(shortStatement(state.story).length<230);
 }
 assert.equal(ids.size,80);assert.throws(()=>makeRecord(initialState()));
});
test('new creations get new identities while navigation and refresh keep one identity',()=>{
 let s=reducer(initialState(),{type:'START',name:'Moss',seed:3,id:'one',createdAt:100});s=reducer(s,{type:'HOME'});s=reducer(s,{type:'START',id:'two',name:'Moss',seed:5,createdAt:200});assert.equal(s.creationId,'one');assert.equal(s.createdAt,100);
 s=reducer(s,{type:'RESET'});s=reducer(s,{type:'START',id:'two',name:'Moss',seed:5,createdAt:200});assert.equal(s.creationId,'two');
 const legacy=completed(combinations()[0]);delete legacy.creationId;delete legacy.createdAt;
 const a=restoreState(JSON.stringify(legacy)),b=restoreState(JSON.stringify(legacy));assert.equal(a.creationId,b.creationId);assert.ok(a.creationId.startsWith('legacy-'));
});
test('surface marks stay on anatomy without backing panels or interference with sockets',()=>{
 for(const a of combinations()){
  const scene=generateMonster(a),marks=[...scene.shapes,...scene.lines].filter(s=>s.pattern);
  assert.ok(marks.length>0);assert.ok(!scene.shapes.some(s=>s.id.includes('pattern-field')));
  for(const mark of marks){
   assert.ok(mark.points.every(p=>pointInside(p,scene.body)),`${scene.code}/${mark.id}: pigment outside anatomy`);
   for(const eye of scene.eyes)assert.ok(Math.hypot(mark.anchor[0]-eye.x,mark.anchor[1]-eye.y)>Math.max(eye.r,eye.ry)+15);
  }
 }
});
