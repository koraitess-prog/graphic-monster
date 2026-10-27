import test from 'node:test';import assert from 'node:assert/strict';
import {creaturePlayFrame,creaturePlayPose,PLAY_END,faceBox} from '../src/creature-play.js';
import {generateMonster} from '../src/dna.js';import {ANATOMIES} from '../src/paper-dna.js';
import {currentCollection} from '../src/shared-archive.js';
const sample=anatomy=>generateMonster({anatomy,principle:'color',organization:'experiment',gaze:'expression',density:'rich',attitude:'playful',seed:411},6);
test('all eight families run or walk, grip the wall, inspect the viewer and return home without changing saved art',()=>{
 for(const anatomy of ANATOMIES){const scene=sample(anatomy),before=JSON.stringify(scene);
  for(const [width,height]of [[1280,850],[390,844]]){const home={scale:width<500?.32:.75,x:20,y:85},layout={width,height,home};
   const phases=new Set();for(const ms of [0,2000,4000,7000,9000,11000,14000,17000,21000,24500,28000,PLAY_END]){const f=creaturePlayFrame(scene,ms,layout);phases.add(f.phase);assert.ok(Object.values(f.camera).every(Number.isFinite));const p=creaturePlayPose(scene,f,ms/1000);assert.equal(p.shapes.length,scene.shapes.length);assert.equal(p.eyes.length,scene.eyes.length);assert.ok(p.shapes.every(s=>s.points.every(p=>p.every(Number.isFinite))));}
   assert.ok(phases.has('climb'));assert.ok(phases.has('stare'));assert.deepEqual(creaturePlayFrame(scene,PLAY_END,layout).camera,{scale:home.scale,x:home.x,y:home.y});
   const close=creaturePlayFrame(scene,21000,layout),face=faceBox(scene);assert.ok(close.closeup);assert.ok(face.width*close.camera.scale>=width*.5,'the face must dominate the frame');
   for(const boundary of [1800,6000,10500,12800,15900,19700,23500,27500]){const a=creaturePlayFrame(scene,boundary-1,layout).camera,b=creaturePlayFrame(scene,boundary+1,layout).camera;assert.ok(Math.abs(a.x-b.x)<1&&Math.abs(a.y-b.y)<1&&Math.abs(a.scale-b.scale)<.01,'camera stays continuous at '+boundary);}
  }assert.equal(JSON.stringify(scene),before);
 }
});
test('new archive epoch hides earlier creations without deleting or editing records',()=>{
 const records=[{id:'old',createdAt:99},{id:'new',createdAt:100},{id:'next',createdAt:101}],copy=structuredClone(records);
 assert.deepEqual(currentCollection(records,{collectionStartedAt:100}).map(r=>r.id),['new','next']);assert.deepEqual(records,copy);assert.equal(currentCollection(records,{}).length,3);
});

test('play can pause, complete and release its viewport camera and event listeners',async()=>{
 const {mountCreaturePlay}=await import('../src/creature-play.js');
 const keys=['window','document','innerWidth','innerHeight'],old=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const classes=new Set(),canvas={style:{},dataset:{},getAttribute:()=>null,removeAttribute(){this.style={};},getBoundingClientRect:()=>({left:30,top:80,width:500,height:620})};
 globalThis.window=new EventTarget();globalThis.document={body:{classList:{add:(...ks)=>ks.forEach(k=>classes.add(k)),remove:(...ks)=>ks.forEach(k=>classes.delete(k)),toggle:(k,v)=>v?classes.add(k):classes.delete(k)}}};globalThis.innerWidth=1280;globalThis.innerHeight=850;
 try{const scene=sample('accordion'),renderer={canvas,scale:1.5,transparent:false,ground:true,resize(){}},view={target:scene,renderer};
  const binding=mountCreaturePlay({},view);binding.frame(scene,0,true);assert.equal(renderer.transparent,true);assert.ok(renderer.viewport);assert.equal(canvas.style.position,'fixed');
  binding.suspend();assert.equal(renderer.transparent,false);assert.equal(renderer.viewport,undefined);assert.deepEqual(canvas.style,{});assert.equal(classes.size,0);
  binding.destroy();assert.equal(binding.frame(scene,100000,true),scene);assert.equal(classes.size,0);
  const second=mountCreaturePlay({},view);second.frame(scene,1,true);second.frame(scene,31001,true);assert.equal(renderer.viewport,undefined);assert.equal(renderer.ground,true);second.destroy();assert.equal(classes.size,0);
 }finally{for(const k of keys)if(old[k]===undefined)delete globalThis[k];else globalThis[k]=old[k];}
});
