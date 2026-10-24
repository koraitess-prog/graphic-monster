import test from 'node:test';
import assert from 'node:assert/strict';
import {creatureNamePapers} from '../src/creature-lettering.js';
import {paperDNAScene} from '../src/paper-dna.js';

test('name stock comes from saved visible paper, retaining its print and grain',()=>{
 const points=[[0,0],[10,0],[10,10],[0,10]],paper={points,color:'#519f7d',texture:.22,printRevision:3,grainPhase:7,grainAngle:12,paperPattern:'newsprint'};
 const scene={shapes:[paper,{...paper,carrier:true,color:'#ff0000'},{...paper,paperRole:'backing',color:'#151a1b'},{...paper,opening:true,color:'#ffffff'}]},before=JSON.stringify(scene);
 const result=creatureNamePapers(scene);
 assert.equal(result.length,1);assert.equal(result[0].area,100);
 for(const key of ['color','texture','printRevision','grainPhase','grainAngle','paperPattern'])assert.equal(result[0].style[key],paper[key]);
 assert.equal(JSON.stringify(scene),before);assert.deepEqual(creatureNamePapers(scene),result);
});

test('all eight anatomies supply their own reproducible papers without altering saved art',()=>{
 const palettes=new Set();
 for(let seed=0;seed<8;seed++){
  const scene=paperDNAScene({seed,principle:'texture',organization:'experiment',gaze:'clarity',density:'rich',attitude:'playful'}),before=JSON.stringify(scene),papers=creatureNamePapers(scene);
  assert.ok(papers.length);assert.ok(papers.every(p=>p.area>0));
  for(const {style} of papers)assert.ok(scene.shapes.some(p=>!p.carrier&&p.color===style.color&&p.grainPhase===style.grainPhase&&p.paperPattern===style.paperPattern||!p.carrier&&p.color===style.color&&p.grainPhase===style.grainPhase&&!p.paperPattern&&!style.paperPattern));
  palettes.add([...new Set(papers.map(p=>p.style.color))].sort().join());
  assert.equal(JSON.stringify(scene),before);
 }
 assert.ok(palettes.size>3);assert.deepEqual(creatureNamePapers(),[]);
});
