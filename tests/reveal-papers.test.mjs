import test from 'node:test';
import assert from 'node:assert/strict';
import {burstLayout,burstPose,upperPaperPose,fallingLetterPose,createRevealPapers} from '../src/reveal-papers.js';
import {arrivalBeat,ARRIVAL_GESTURE_AT} from '../src/arrival.js';

test('burst is reproducible and leaves a clear centre on narrow and wide screens',()=>{
 for(const [w,h] of [[390,844],[1440,900]]){
  const pieces=burstLayout(42,w,h);assert.deepEqual(pieces,burstLayout(42,w,h));assert.equal(pieces.length,40);
  for(const piece of pieces){const p=burstPose(piece,1);assert.ok(p.x<w*.05||p.x>w*.95||p.y<h*.05||p.y>h*.95);assert.ok(Object.values(p).every(Number.isFinite));}
 }
});
test('individual letters fall with the creature and settle into a straight readable name',()=>{
 for(const count of [4,16,48]){
  const starts=[],ends=[];
  for(let i=0;i<count;i++){
   starts.push(fallingLetterPose(i,count,390,844,arrivalBeat(0),0));
   ends.push(fallingLetterPose(i,count,390,844,arrivalBeat(ARRIVAL_GESTURE_AT),ARRIVAL_GESTURE_AT));
  }
  assert.ok(new Set(starts.map(p=>p.y)).size>1);
  assert.ok(ends.every(p=>p.y===36&&p.angle===0&&p.x>0&&p.x<390));
 }
 const beat=arrivalBeat(2900);assert.ok(beat.drop-beat.camera>.08,'camera lets a substantial fall happen before following');
});
test('scraps remain on the upper page as the camera follows the creature below',()=>{
 for(const [width,height] of [[390,844],[1440,900]])for(const piece of burstLayout(42,width,height)){
  const origin=upperPaperPose(piece,1,0),scroll=height*2.2,below=upperPaperPose(piece,1,scroll);
  assert.equal(below.x,origin.x);assert.ok(Math.abs(below.y+scroll-origin.y)<1e-9);
  assert.ok(below.y+piece.size<0,'the scraps must be above the viewport at landing');
 }
});
test('reduced motion creates no paper overlay or frame loop',()=>{
 const effect=createRevealPapers({reduced:{matches:true}});assert.doesNotThrow(()=>{effect.flight(900,arrivalBeat(900));effect.finish();effect.finish();});
});
