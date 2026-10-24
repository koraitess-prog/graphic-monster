import test from 'node:test';
import assert from 'node:assert/strict';
import {introScrapPoints,makeIntroPile,scrapNames} from '../src/intro-scraps.js';
import {pointInside} from '../src/dna.js';

test('eight original, bounded contours reproduce without changing anatomy',()=>{
 assert.equal(scrapNames.length,8);
 const contours=scrapNames.map((_,i)=>introScrapPoints(i));
 assert.equal(new Set(contours.map(JSON.stringify)).size,8);
 for(let i=0;i<8;i++){
  assert.deepEqual(contours[i],introScrapPoints(i));
  assert.ok(contours[i].every(p=>p.every(Number.isFinite)&&p[0]>=0&&p[0]<=320&&p[1]>=0&&p[1]<=256));
 }
});
test('mixed silhouettes fully cover sampled phone and desktop viewports',()=>{
 for(const [width,height] of [[390,844],[1280,800]]){
  const pile=makeIntroPile(width,height),contours=Array.from({length:16},(_,i)=>introScrapPoints(i));
  assert.deepEqual(pile,makeIntroPile(width,height));assert.equal(new Set(pile.map(p=>p.stock%8)).size,8);
  for(let y=0;y<height;y+=24)for(let x=0;x<width;x+=24){
   assert.ok(pile.some(p=>{
    const dx=x-p.x,dy=y-p.y,c=Math.cos(p.angle),s=Math.sin(p.angle),u=(dx*c+dy*s)/p.w*320+160,v=(-dx*s+dy*c)/p.h*256+128;
    return u>=0&&u<=320&&v>=0&&v<=256&&pointInside([u,v],contours[p.stock]);
   }),`Uncovered point ${x},${y} at ${width}x${height}`);
  }
 }
});
