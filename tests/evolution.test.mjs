import {test} from 'node:test';
import assert from 'node:assert/strict';
import {combinations,QUESTIONS,generateMonster,validateScene,pointInside} from '../src/dna.js';
import {evolutionScene,amorphousScene} from '../src/evolution.js';
import {idlePose,motionProfile} from '../src/motion.js';
import {interpolateScene} from '../src/renderer.js';
import {initialState,reducer} from '../src/state.js';
import {PATTERNS} from '../src/patterns.js';

test('all 80 paths grow cumulative anatomy without leaking unfinished decisions',()=>{
 for(const answers of combinations()){
  let selected={},previous=amorphousScene();
  assert.equal(previous.eyes.length,0);assert.equal(previous.shapes.length,4);assert.equal(previous.lines.length,0);
  for(let i=0;i<5;i++){
   selected[QUESTIONS[i].key]=answers[QUESTIONS[i].key];const scene=evolutionScene(selected);
   assert.equal(scene.stage,i+1);assert.equal(scene.eyes.length>0,i>=2);
   assert.equal(scene.shapes.some(s=>s.id==='arm-left'),i===4);
   assert.equal([...scene.shapes,...scene.lines].some(s=>s.pattern),i>=3);
   assert.equal(scene.shapes.some(s=>s.id==='mouth')||scene.lines.some(s=>s.id==='smile'),i===4);
   assert.deepEqual(validateScene(scene),[],`${scene.code}, stage ${i+1}`);
   for(const t of [.1,.3,.5,.7,.9]){
    const mid=interpolateScene(previous,scene,t);
    assert.ok([...mid.shapes,...mid.lines].every(s=>s.points.flat().every(Number.isFinite)));
    assert.deepEqual(validateScene({...mid,attachments:[],eyes:mid.eyes.filter(e=>e.r>2)}),[],`${scene.code}, stage ${i+1} at ${t}`);
   }
   previous=scene;
  }
  assert.deepEqual(previous,generateMonster(answers));
 }
});

test('every creature has deterministic connected motion, a quiet rest and a distinct DNA profile',()=>{
 const signatures=new Set(),patterns=new Set();
 for(const answers of combinations()){
  const scene=generateMonster(answers);signatures.add(motionProfile(scene).signature);
  patterns.add(scene.pattern.dominant);if(scene.pattern.secondary)patterns.add(scene.pattern.secondary);
  assert.equal(idlePose(scene,0),scene);assert.equal(idlePose(scene,1),scene);
  assert.notDeepEqual(idlePose(scene,.4),scene);
  for(let t=.1;t<1;t+=.1){const pose=idlePose(scene,t);assert.deepEqual(pose,idlePose(scene,t));assert.deepEqual(validateScene(pose),[],`${scene.code}: idle ${t}`);
   const eye=pose.eyes.find(e=>e.stalk);if(eye){const stalk=pose.shapes.find(s=>s.stalk);assert.ok(pointInside([eye.x,eye.y+5],stalk.points));assert.ok(eye.y-eye.ry>=55);}
  }
 }
 assert.equal(signatures.size,80);assert.deepEqual([...patterns].sort(),[...PATTERNS].sort());
});

test('final discovery is locked against all navigation and editing events',()=>{
 let s=reducer(initialState(),{type:'START',name:'Moss',seed:12});
 for(const q of QUESTIONS){s=reducer(s,{type:'SELECT',value:q.options[0][0]});s=reducer(s,{type:'ADVANCE'});}
 for(const event of [{type:'START',name:'Other'},{type:'NAME',name:'Other'},{type:'HOME'},{type:'BACK'},{type:'GO',step:0},{type:'SELECT',value:'texture'},{type:'ADVANCE'}])assert.equal(reducer(s,event),s);
 const next=reducer(s,{type:'REGENERATE',seed:57});assert.deepEqual(next.answers,s.answers);assert.equal(next.name,s.name);assert.notEqual(next.story.text,s.story.text);
 assert.deepEqual(reducer(next,{type:'RESET'}),initialState());
});
