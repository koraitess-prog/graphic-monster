import test from 'node:test';import assert from 'node:assert/strict';
import {MATERIAL_QUESTIONS,materialQuestion,materialPrinciple,materialHashSuffix} from '../src/material-flow.js';
import {QUESTIONS,generateMonster,encodeDNA,decodeDNA,combinations} from '../src/dna.js';
import {initialState,reducer,restoreState} from '../src/state.js';import {makeRecord} from '../src/archive.js';import {validPublicRecord} from '../src/shared-archive.js';
test('form and surface are independent; every form offers both surfaces after refresh',()=>{
 assert.equal(materialQuestion({}).options.length,3);
 for(const [construction]of MATERIAL_QUESTIONS[0].options){
  let s=reducer(initialState(),{type:'START',name:'Study',seed:17});s=reducer(s,{type:'SELECT',value:construction});s=reducer(s,{type:'ADVANCE'});
  assert.equal(s.step,0);assert.equal(s.answers.principle,undefined);assert.deepEqual(restoreState(JSON.stringify(s)),s);
  assert.deepEqual(materialQuestion(s.answers).options.map(o=>o[0]),['pigment','grain']);
 }
});
test('all 96 combined flows retain both inputs, reproduce, describe and archive their artwork',()=>{
 const geometries=new Set();
 for(const [construction]of MATERIAL_QUESTIONS[0].options)for(const [surface]of MATERIAL_QUESTIONS[1].options)for(const tail of combinations().filter(a=>a.principle==='shape')){
  let s=reducer(initialState(),{type:'START',name:'Study',seed:17});
  for(const value of [construction,surface,...QUESTIONS.slice(1).map(q=>tail[q.key])]){s=reducer(s,{type:'SELECT',value});s=reducer(s,{type:'ADVANCE'});}
  assert.equal(s.screen,'reveal');assert.equal(s.answers.principle,materialPrinciple(construction,surface));assert.deepEqual(restoreState(JSON.stringify(s)),s);
  const scene=generateMonster({...s.answers,seed:17},7);geometries.add(scene.anatomy);assert.equal(scene.answers.construction,construction);assert.equal(scene.answers.surface,surface);
  assert.ok(scene.shapes.filter(p=>p.paperPiece).some(p=>surface==='grain'?p.paperPattern:p.paperPattern===null));
  const record=makeRecord(s);assert.ok(validPublicRecord(record));assert.deepEqual(record.scene,generateMonster({...s.answers,seed:17},7));
  const suffix=materialHashSuffix(s.answers),params=new URLSearchParams('dna='+encodeDNA(s.answers)+suffix),restored={...decodeDNA(params.get('dna')),construction:params.get('form'),surface:params.get('surface')};assert.deepEqual(restored,s.answers);
 }
 assert.equal(geometries.size,8);
});
test('surface choice changes the print even when the structural family stays the same',()=>{
 const a={principle:'typography',construction:'form-type',organization:'order',gaze:'clarity',density:'minimal',attitude:'precise',seed:17},color=generateMonster({...a,surface:'pigment'},7),grain=generateMonster({...a,surface:'grain'},7);
 assert.equal(color.anatomy,grain.anatomy);assert.notDeepEqual(color.shapes,grain.shapes);assert.deepEqual(color.shapes.map(s=>s.points),grain.shapes.map(s=>s.points));
});
