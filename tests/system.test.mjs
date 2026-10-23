import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateMonster,combinations,validateScene,QUESTIONS,encodeDNA,decodeDNA,describeMonster} from '../src/dna.js';
import {interpolateScene,springProgress} from '../src/renderer.js';
import {initialState,reducer,restoreState} from '../src/state.js';
const all=combinations();
test('all 80 complete combinations have valid, deterministic, distinct anatomies',()=>{
 assert.equal(all.length,80);const signatures=new Set();
 for(const answers of all){const scene=generateMonster(answers);assert.deepEqual(validateScene(scene),[],scene.code);assert.deepEqual(scene,generateMonster(structuredClone(answers)));assert.deepEqual(decodeDNA(scene.code),answers);assert.equal(scene.eyes.length,answers.gaze==='expression'?5:['grid','color'].includes(answers.principle)?2:1);for(const id of ['body','leg-left','leg-right','arm-left','arm-right','hand-left','hand-right'])assert.ok(scene.shapes.some(s=>s.id===id),`${scene.code}: missing ${id}`);signatures.add(JSON.stringify(scene.shapes.map(s=>[s.id,s.points,s.texture]))+JSON.stringify(scene.eyes));}
 assert.equal(signatures.size,80);
});
test('each question has a substantial effect on its intended system in every context',()=>{
 for(const answers of all){const s=generateMonster(answers);for(const q of QUESTIONS){const changed={...answers,[q.key]:q.options.find(o=>o[0]!==answers[q.key])[0]},other=generateMonster(changed);const part=(scene,id)=>scene.shapes.find(s=>s.id===id)?.points;
 if(q.key==='principle'||q.key==='organization')assert.notDeepEqual(part(s,'body'),part(other,'body'));
 if(q.key==='gaze')assert.notEqual(s.eyes.length,other.eyes.length);
 if(q.key==='density'){assert.notEqual([...s.shapes,...s.lines].filter(s=>s.pattern).length,[...other.shapes,...other.lines].filter(s=>s.pattern).length);assert.notEqual(s.tooth,other.tooth);}
 if(q.key==='attitude'){assert.notDeepEqual(part(s,'arm-right'),part(other,'arm-right'));assert.notEqual(s.shapes.some(s=>s.id==='mouth'),other.shapes.some(s=>s.id==='mouth'));}
 }}
});
test('morph endpoints and interrupted transitions preserve stable parts and finite geometry',()=>{
 for(const answers of all){const from=generateMonster(answers);for(const q of QUESTIONS){const to=generateMonster({...answers,[q.key]:q.options.find(o=>o[0]!==answers[q.key])[0]});assert.equal(interpolateScene(from,to,0),from);assert.equal(interpolateScene(from,to,1),to);for(const t of [.2,.5,.8]){const mid=interpolateScene(from,to,springProgress(t));for(const s of [...mid.shapes,...mid.lines])assert.ok(s.points.flat().every(Number.isFinite));assert.ok(mid.eyes.length>=1);assert.ok(new Set(mid.shapes.map(s=>s.id)).size===mid.shapes.length);const interrupted=interpolateScene(mid,from,.5);assert.ok(interrupted.eyes.every(e=>e.r>=0&&Number.isFinite(e.x)));}}}
});
test('single-click flow, backtracking, changed answers, and reset work for all 80 paths',()=>{
 for(const answers of all){let state=reducer(initialState(),{type:'START',name:'Juniper',seed:42});for(const q of QUESTIONS){state=reducer(state,{type:'SELECT',value:answers[q.key]});state=reducer(state,{type:'ADVANCE'});}assert.equal(state.screen,'reveal');assert.deepEqual(state.answers,answers);state=reducer(state,{type:'GO',step:1});state=reducer(state,{type:'SELECT',value:answers.organization==='order'?'experiment':'order'});state=reducer(state,{type:'REVEAL'});assert.equal(state.screen,'reveal');assert.equal(encodeDNA(state.answers),encodeDNA(answers));state=reducer(state,{type:'BACK'});assert.equal(state.step,4);assert.deepEqual(restoreState(JSON.stringify(state)),state);assert.deepEqual(reducer(state,{type:'RESET'}),initialState());}
 assert.equal(reducer(initialState(),{type:'REVEAL'}).screen,'intro');assert.deepEqual(restoreState('{bad JSON'),initialState());assert.deepEqual(restoreState('{"screen":"reveal","step":4,"answers":{}}'),initialState());
});
test('every single-answer change keeps visible eyes on the face and apart during the morph',()=>{
 let checked=0;
 for(const answers of all){const from=generateMonster(answers);for(const q of QUESTIONS)for(const option of q.options.filter(o=>o[0]!==answers[q.key])){
   const to=generateMonster({...answers,[q.key]:option[0]});
   for(const t of [.2,.5,.8]){const mid=interpolateScene(from,to,t);assert.deepEqual(validateScene({...mid,attachments:[],eyes:mid.eyes.filter(e=>e.r>2)}),[],`${from.code} → ${to.code} at ${t}`);checked++;}
 }}
 assert.equal(checked,1920);
});
