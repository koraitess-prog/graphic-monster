import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildScene,specimens} from '../src/illustrations.js';
import {rng,limb} from '../src/anidoodle-kit.js';
test('three different anatomies reproduce from fixed seeds',()=>{
 assert.equal(specimens.length,3);
 assert.equal(new Set(specimens.map(s=>s.seed)).size,3);
 assert.deepEqual(specimens.map(s=>buildScene(s).eyes.length),[7,2,1]);
 for(const s of specimens){const scene=buildScene(s);assert.deepEqual(scene,buildScene(structuredClone(s)));for(const part of [...scene.shapes,...scene.lines])for(const [x,y]of part.points){assert.ok(Number.isFinite(x)&&Number.isFinite(y));assert.ok(x>20&&x<560&&y>40&&y<700,'anatomy stays within its artboard');}}
});
test('each design principle has a bounded response upstream of rendering',()=>{
 const s=specimens[0],base=buildScene(s);
 for(const key of Object.keys(s.dna)){const changed=buildScene({...s,dna:{...s.dna,[key]:s.dna[key]===1?0:1}});assert.notDeepEqual(changed,base,key);}
 assert.notDeepEqual(buildScene({...s,seed:s.seed+1}),base);
 const seq=a=>Array.from({length:20},rng(a));assert.deepEqual(seq(42),seq(42));assert.notDeepEqual(seq(42),seq(43));
});
test('variable-radius limbs remain finite across curved gestures',()=>{
 const pts=limb([[10,10],[30,50],[15,100]],[5,8,2]);assert.ok(pts.length>40);assert.ok(pts.flat().every(Number.isFinite));
});
