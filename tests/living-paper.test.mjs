import test from 'node:test';
import assert from 'node:assert/strict';
import {cloudTraits,cloudPlacement,PaperFormation} from '../src/paper-formation.js';
import {titleTouchPose} from '../src/intro-lettering.js';

test('each answer accumulates a persistent cloud characteristic',()=>{
 const a={principle:'typography',organization:'experiment',gaze:'expression',density:'rich',attitude:'playful'};
 const t=cloudTraits(a);assert.equal(t.language,'typography');assert.equal(t.ordered,false);assert.equal(t.expressive,true);assert.equal(t.count,48);assert.equal(t.playful,true);assert.equal(t.stage,5);
 assert.equal(cloudTraits({...a,density:'minimal'}).count,17);
 const pose=(answers,time=7)=>cloudPlacement('body~paper-2',3,29,answers,time);
 assert.deepEqual(pose(a),pose(a));
 for(const [key,value] of [['organization','order'],['gaze','clarity'],['density','minimal'],['attitude','precise']]){
  const b={...a,[key]:value};assert.notDeepEqual(cloudTraits(b),t);
  if(key!=='density')assert.notDeepEqual(pose(a),pose(b));
 }
});
test('cloud remains central, bounded and moving, including organized choices',()=>{
 for(const organization of ['order','experiment'])for(const density of ['minimal','rich']){
  const a={organization,density},n=cloudTraits(a).count;
  for(let i=0;i<n;i++){const p=cloudPlacement('paper-'+i,i,n,a,3);assert.ok(p.x>60&&p.x<540);assert.ok(p.y>140&&p.y<600);assert.ok(p.size>0&&p.size<200);assert.notDeepEqual(p,cloudPlacement('paper-'+i,i,n,a,4));}
 }
});
test('title touch is local, bounded and returns exactly to rest',()=>{
 assert.equal(titleTouchPose(0).strength,0);assert.ok(titleTouchPose(200).strength>.95);
 for(let t=0;t<=650;t+=10){const p=titleTouchPose(t);assert.ok(Math.abs(p.angle)<Math.PI/90);assert.ok(Math.abs(p.dx)<=2.5);}
 assert.ok(titleTouchPose(650).strength<1e-10);
});
test('reduced motion reveals the supplied final scene without an animation loop',async()=>{
 const scene={id:'actual-generated-scene'},calls=[];
 const host=Object.create(PaperFormation.prototype);
 Object.assign(host,{visibleParts:()=>[],stop:()=>{},canvas:{dataset:{}},reduced:{matches:true},view:{update:(target,options)=>calls.push({target,options})}});
 await host.reveal(scene);
 assert.equal(calls.length,1);assert.equal(calls[0].target,scene);assert.deepEqual(calls[0].options,{immediate:true});
});
