import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTIONS,combinations,encodeDNA,decodeDNA} from '../src/dna.js';
import {nameLines} from '../src/creature-lettering.js';
import {cloudTraits,cloudPlacement} from '../src/paper-formation.js';
import {LivingArchive} from '../src/archive-gallery.js';

test('approved question headings retain every existing DNA identity',()=>{
 assert.deepEqual(QUESTIONS.map(q=>q.title),['What catches your eye?','How would you arrange it?','What deserves attention?','When is it enough?','How should it behave?']);
 const all=combinations();assert.equal(all.length,80);assert.equal(new Set(all.map(encodeDNA)).size,80);
 for(const a of all)assert.deepEqual(decodeDNA(encodeDNA(a)),a);
 assert.deepEqual(QUESTIONS.map(q=>q.options.map(o=>o[0])),[['typography','grid','color','shape','texture'],['order','experiment'],['clarity','expression'],['minimal','rich'],['precise','playful']]);
});
test('long illustrated names wrap without losing case, letters or Unicode',()=>{
 for(const name of ['Moss','Mobile study','A very long creature name with forty eight letters','Supercalifragilisticexpialidocious','שלום מפלצת נייר']){
  const lines=nameLines(name);assert.ok(lines.every(l=>Array.from(l).length<=16));
  assert.equal(lines.join('').replaceAll(' ',''),name.replaceAll(' ',''));
 }
});
test('each opposite answer leaves a different settled cloud and motion',()=>{
 const a={principle:'typography',organization:'order',gaze:'clarity',density:'minimal',attitude:'precise'};
 for(const q of QUESTIONS)for(const [value] of q.options){const b={...a,[q.key]:value};if(value===a[q.key])continue;
  assert.notDeepEqual(cloudTraits(a),cloudTraits(b));assert.notDeepEqual(cloudPlacement('paper',3,25,a,7),cloudPlacement('paper',3,25,b,7));
 }
});
test('visitor greetings preempt idle performances and respect reduced motion',()=>{
 const previous=globalThis.document;globalThis.document={hidden:false};
 try{
  const make=(active=false)=>({active,visible:true,record:{scene:{}},canvas:{dataset:{}},renderer:{draw(){}},due:0});
  const a=make(true),b=make(true),visitor=make(),host=Object.create(LivingArchive.prototype);let scheduled=0;
  Object.assign(host,{items:new Map([[1,a],[2,b],[3,visitor]]),media:{matches:false},schedule:()=>scheduled++});
  assert.equal(host.greet(visitor),true);assert.equal(visitor.requested,true);assert.equal([a,b].filter(i=>i.active).length,1);assert.equal(scheduled,1);
  host.media.matches=true;visitor.requested=false;assert.equal(host.greet(visitor),false);assert.equal(visitor.requested,false);
 }finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});
