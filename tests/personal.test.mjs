import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {combinations,QUESTIONS,encodeDNA,generateMonster} from '../src/dna.js';
import {generateStory,wordCount} from '../src/story.js';
import {initialState,reducer,restoreState,normalizeName} from '../src/state.js';

test('the original pigment renderer and Anidoodle anatomy primitives remain unchanged',()=>{
 const hashes={'illustrations.js':'f041180f92acacb8c7464723094b357c1f774c37f709f90a4ab6caa3654677fc','anidoodle-kit.js':'85a187c37dfe66205dbf34e1657e9ff6bbb16d59c231194322cd010b2c0687c4'};
 for(const [file,expected]of Object.entries(hashes))assert.equal(createHash('sha256').update(readFileSync(new URL(`../src/${file}`,import.meta.url))).digest('hex'),expected,file);
});
test('names and stories persist through all 80 flows, editing, rename, refresh and regeneration',()=>{
 for(const answers of combinations()){
  let s=reducer(initialState(),{type:'START',name:'  Juniper  Moss  ',seed:148});assert.equal(s.name,'Juniper Moss');
  for(const q of QUESTIONS){s=reducer(s,{type:'SELECT',value:answers[q.key]});assert.equal(s.name,'Juniper Moss');s=reducer(s,{type:'ADVANCE'});}
  assert.equal(s.screen,'reveal');assert.equal(s.story.code,encodeDNA(answers));
  const text=s.story.text,art=generateMonster(s.answers);
  s=reducer(s,{type:'NAME',name:'פיפ'});assert.equal(s.name,'Juniper Moss');assert.equal(s.story.text,text);assert.deepEqual(generateMonster(s.answers),art);
  assert.deepEqual(restoreState(JSON.stringify(s)),s);
  s=reducer(s,{type:'GO',step:0});s=reducer(s,{type:'REVEAL'});assert.equal(s.story.text,text);
  s=reducer(s,{type:'REGENERATE',seed:148});assert.notEqual(s.story.text,text);assert.deepEqual(generateMonster(s.answers),art);
  const locked=s;s=reducer(s,{type:'GO',step:3});s=reducer(s,{type:'SELECT',value:answers.density==='rich'?'minimal':'rich'});assert.equal(s,locked);
  assert.equal(reducer(s,{type:'RESET'}).name,'');
 }
});
test('local writing stays within 35–55 words and has broad variation for every design DNA',()=>{
 for(const answers of combinations()){
   const paragraphs=new Set();
   for(let seed=0;seed<100;seed++){const text=generateStory(answers,seed);assert.ok(wordCount(text)>=35&&wordCount(text)<=55);assert.equal(text,generateStory(answers,seed));assert.doesNotMatch(text,/undefined|NaN/);paragraphs.add(text);}
   assert.ok(paragraphs.size>=90,`${encodeDNA(answers)}: inadequate narrative variety`);
 }
});
test('a name is required and legacy DNA remains available while asking for a personal identity',()=>{
 assert.equal(reducer(initialState(),{type:'START',name:'   ',seed:1}).screen,'intro');
 assert.equal(normalizeName(' A\n  B '),'A B');assert.equal(Array.from(normalizeName('a'.repeat(100))).length,48);
 const answers=combinations()[20],legacy=restoreState(JSON.stringify({screen:'reveal',step:4,answers}));assert.equal(legacy.screen,'intro');assert.deepEqual(legacy.answers,answers);
 const named=reducer(legacy,{type:'START',name:'Wren',seed:17});assert.equal(named.screen,'reveal');assert.deepEqual(named.answers,answers);assert.ok(named.story.text);
});
