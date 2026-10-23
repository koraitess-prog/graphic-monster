import test from 'node:test';import assert from 'node:assert/strict';
import {generateMonster,combinations,validateScene} from '../src/dna.js';
import {tornContour} from '../src/paper-library.js';
test('torn contours retain the original corners and add bounded, reproducible irregularities',()=>{
 const rect=[[0,0],[100,0],[100,80],[0,80]],torn=tornContour(rect,17,1.5);
 assert.ok(torn.length>40);assert.deepEqual(torn,tornContour(rect,17,1.5));
 rect.forEach(p=>assert.ok(torn.some(q=>q[0]===p[0]&&q[1]===p[1])));
 assert.ok(torn.some(p=>p[1]<0));assert.ok(torn.every(([x,y])=>x>=-1.6&&x<=101.6&&y>=-1.6&&y<=81.6));
});
test('new large-eye variations fit their anatomy while keeping other eye languages',()=>{
 const styles=new Set();
 for(const a of combinations()){
  const s=generateMonster(a,6);assert.deepEqual(validateScene(s),[],s.code);
  if(a.gaze==='clarity')for(const anatomy of ['color','texture']){
   const v=generateMonster({...a,anatomy},6),e=v.eyes[0];assert.equal(v.eyes.length,1);assert.ok(e.orbital&&e.r>=20);assert.deepEqual(validateScene(v),[]);styles.add([e.r,e.ry,e.angle,e.orbitalIris].join('/'));
  }
 }
 assert.ok(styles.size>=2);
 const original=generateMonster({principle:'color',organization:'experiment',gaze:'clarity',density:'rich',attitude:'precise'},5);
 assert.ok(!original.eyes.some(e=>e.orbital));
});
