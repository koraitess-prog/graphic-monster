import test from 'node:test';import assert from 'node:assert/strict';
import {generateMonster,combinations,validateScene} from '../src/dna.js';
import {scatterImpulse,advancePaper} from '../src/paper-scatter.js';
test('typographic paper is actually printed with newspaper columns and cropped magazine type',()=>{
 const kinds=new Set();
 for(const a of combinations().filter(a=>a.principle==='typography'))for(const p of generateMonster(a,6).shapes)if(p.paperPattern)kinds.add(p.paperPattern);
 assert.deepEqual(kinds,new Set(['newsprint','magazine-type','oversized-type']));
});
test('Pleat supports a central large eye as well as its original side-eye arrangement',()=>{
 for(const a of combinations()){
  const central=generateMonster({...a,anatomy:'accordion',eyeVariant:'central'},6),side=generateMonster({...a,anatomy:'accordion',eyeVariant:'side'},6);
  assert.equal(central.eyes.length,1);assert.ok(central.eyes[0].r>=33&&central.eyes[0].orbital);assert.ok(side.eyes.length>=3);assert.deepEqual(central.body,side.body);
  assert.deepEqual(validateScene(central),[]);assert.deepEqual(validateScene(side),[]);
  assert.ok(central.eyes[0].x<side.eyes[0].x-60);
 }
});
test('mouse and finger impulses throw physical scraps away without moving distant scraps',()=>{
 const original={x:180,y:160,w:180,h:160,vx:0,vy:0,spin:0,angle:0,awake:false,gone:false};
 for(const reduced of [false,true]){
  const paper={...original};assert.equal(scatterImpulse(paper,{x:165,y:150},{x:20,y:4}),true);assert.ok(paper.vx>0&&paper.spin!==0);
  for(let i=0;i<500&&!paper.gone;i++)advancePaper(paper,1,390,844,reduced);
  assert.equal(paper.gone,true);assert.ok([paper.x,paper.y,paper.angle].every(Number.isFinite));
 }
 const distant={...original};assert.equal(scatterImpulse(distant,{x:900,y:900},{x:20,y:5}),false);assert.deepEqual(distant,original);
});
