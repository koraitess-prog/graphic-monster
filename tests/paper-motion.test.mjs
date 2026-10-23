import test from 'node:test';
import assert from 'node:assert/strict';
import {combinations,generateMonster} from '../src/dna.js';
import {idlePose} from '../src/motion.js';
import {paperAffine,paperPoint,paperGrid,paperBasis} from '../src/paper-motion.js';
test('paper material follows the body, hand rotation and bending arm',()=>{
 for(const answers of combinations().filter(a=>a.principle==='typography')){
  const scene=generateMonster(answers,5);
  for(const event of [0,1])for(const t of [.18,.45,.72,.9]){
   const posed=idlePose(scene,t,event);
   posed.shapes.forEach((part,n)=>{
    assert.equal(part.paperRestPoints,scene.shapes[n].points);
    if(part.paperMaterial){
     const m=part.paperMaterial;
     assert.equal(m.rest,paperGrid(part.paperRestPoints).rest);
     for(const triangle of m.triangles){
      const matrix=paperAffine(m.rest,m.points,triangle);assert.ok(matrix?.every(Number.isFinite));
      for(const i of triangle){const p=paperPoint(matrix,m.rest[i]);assert.ok(Math.hypot(p[0]-m.points[i][0],p[1]-m.points[i][1])<1e-6);}
     }
    }else{
     const matrix=paperAffine(part.paperRestPoints,part.points,paperBasis(part.paperRestPoints));assert.ok(matrix);
     part.paperRestPoints.forEach((q,i)=>{const p=paperPoint(matrix,q);assert.ok(Math.hypot(p[0]-part.points[i][0],p[1]-part.points[i][1])<1e-6);});
    }
   });
  }
 }
});
