import test from 'node:test';
import assert from 'node:assert/strict';
import {generateMonster} from '../src/dna.js';
import {ANATOMIES} from '../src/paper-dna.js';
import {familyCapabilities,familyPose} from '../src/family-motion.js';
import {mountObservation,observationAction} from '../src/observation.js';

const specimen=anatomy=>generateMonster({anatomy,principle:'typography',organization:'experiment',gaze:'expression',density:'rich',attitude:'precise',seed:411},6);
test('observation stimuli use supported, reproducible behaviours across all eight saved anatomies',()=>{
 for(const anatomy of ANATOMIES){
  const scene=specimen(anatomy),before=JSON.stringify(scene),available=familyCapabilities(scene),seen=new Set();
  for(const kind of ['near','sudden','material','repeated','idle'])for(let event=0;event<7;event++){
   const action=observationAction(scene,kind,event);assert.ok(available.includes(action),anatomy+'/'+action);assert.equal(action,observationAction(scene,kind,event));seen.add(action);
   const pose=familyPose(scene,action,.5,1);assert.ok(pose.shapes.every(s=>s.points.every(p=>p.every(Number.isFinite))));
   assert.equal(pose.shapes.length,scene.shapes.length);assert.equal(pose.eyes.length,scene.eyes.length);
  }
  assert.ok(seen.size>=8);assert.equal(JSON.stringify(scene),before);
 }
});

test('observation rate limits stimuli, honours pause, reduced motion and offscreen state, and releases listeners',()=>{
 const oldDocument=globalThis.document,oldObserver=globalThis.IntersectionObserver;
 class Element extends EventTarget{constructor(){super();this.style={};this.classList={add(){},remove(){}};}closest(){return null;}setAttribute(){}append(){}remove(){}getBoundingClientRect(){return {left:0,top:0,width:600,height:760};}}
 let visible;globalThis.IntersectionObserver=class{constructor(callback){visible=callback;}observe(){}disconnect(){}};
 globalThis.document=Object.assign(new EventTarget(),{hidden:false,createElement:()=>new Element()});
 try{
  const field=new Element(),pause=new Element(),stimulate=new Element(),log={},calls=[];
  const view={target:specimen('accordion'),visible:true,motion:{matches:false},react:(...args)=>{calls.push(args);return true;},setVisible(v){this.visible=v;}};
  const binding=mountObservation(field,view,{log,pause,stimulate});
  stimulate.dispatchEvent(new Event('click'));stimulate.dispatchEvent(new Event('click'));assert.equal(calls.length,1,'repeated input cannot queue a performance');
  view.onBehavior('inspect');assert.equal(log.textContent,'observed / inspect');
  pause.dispatchEvent(new Event('click'));assert.equal(view.visible,false);visible([{isIntersecting:true}]);assert.equal(view.visible,false,'scrolling cannot undo a pause');
  pause.dispatchEvent(new Event('click'));assert.equal(view.visible,true);
  view.motion.matches=true;stimulate.dispatchEvent(new Event('click'));assert.equal(calls.length,1);
  binding.destroy();assert.equal(view.behaviorSelector,undefined);assert.equal(view.onBehavior,undefined);assert.equal(view.familyRequested,null);
  pause.dispatchEvent(new Event('click'));assert.equal(view.visible,true,'destroy removes control listeners');
 }finally{globalThis.document=oldDocument;globalThis.IntersectionObserver=oldObserver;}
});
