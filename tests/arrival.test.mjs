import test from 'node:test';
import assert from 'node:assert/strict';
import {arrivalBeat,ARRIVAL_FALL_AT,ARRIVAL_IMPACT_AT,ARRIVAL_HEAP_AT,ARRIVAL_RECOVER_AT,ARRIVAL_GESTURE_AT} from '../src/arrival.js';
import {arrivalPose} from '../src/arrival-pose.js';
import {generateMonster,combinations} from '../src/dna.js';

import {playRevealFlight,flightFrame} from '../src/reveal-flight.js';

test('the camera trails the accelerating body, while landing returns to the exact observation viewport',()=>{
 for(const height of [740,844,900]){
  const distance=height*2.2;
  const suspended=flightFrame(arrivalBeat(ARRIVAL_FALL_AT),distance),falling=flightFrame(arrivalBeat(2900),distance),landed=flightFrame(arrivalBeat(ARRIVAL_GESTURE_AT+3000),distance);
  assert.equal(suspended.scrollY,0);assert.ok(falling.screenY>height*.2,'body must visibly move ahead of the camera');
  assert.ok(falling.worldY>falling.scrollY);assert.equal(landed.worldY,distance);assert.equal(landed.scrollY,distance);assert.equal(landed.screenY,0,'collapsing the spent page must not reposition the creature');
 }
});

test('the arrival lands, recovers and performs before the description can appear',()=>{
 const checkpoints=[0,ARRIVAL_FALL_AT,ARRIVAL_IMPACT_AT,ARRIVAL_HEAP_AT,ARRIVAL_RECOVER_AT,ARRIVAL_GESTURE_AT,ARRIVAL_GESTURE_AT+3000];
 assert.deepEqual(checkpoints.map(t=>arrivalBeat(t).phase),['suspended','falling','impact','heap','recovering','gesture','complete']);
 assert.ok(ARRIVAL_IMPACT_AT-ARRIVAL_FALL_AT>=4500);assert.ok(ARRIVAL_RECOVER_AT-ARRIVAL_HEAP_AT>=1000);
 for(let ms=ARRIVAL_FALL_AT;ms<ARRIVAL_IMPACT_AT;ms+=16){const p=arrivalBeat(ms);assert.ok(p.camera<=Math.max(0,p.drop)+.0001);assert.ok(p.pose>=0&&p.pose<=1);}
 assert.equal(arrivalBeat(ARRIVAL_IMPACT_AT).drop,1);assert.equal(arrivalBeat(ARRIVAL_GESTURE_AT).collapse,0);assert.equal(arrivalBeat(ARRIVAL_GESTURE_AT+3000).pose,1);
});
test('landing and recovery reuse every family without mutating saved snapshots',()=>{
 const families=new Set();
 const options=combinations();
 for(let seed=0;seed<64;seed++){
  const scene=generateMonster({...options[seed%options.length],seed},6);if(families.has(scene.anatomy))continue;families.add(scene.anatomy);
  const original=JSON.stringify(scene);
  for(const ms of [0,1700,2900,5150,6000,7200,ARRIVAL_GESTURE_AT,ARRIVAL_GESTURE_AT+3000]){
   const b=arrivalBeat(ms),pose=arrivalPose(scene,b,ms);
   assert.ok(pose.shapes.every(s=>s.points.every(p=>p.every(Number.isFinite))));
   assert.equal(pose.shapes.length,scene.shapes.length);
  }
  const height=s=>{const ys=s.shapes.flatMap(p=>p.points.map(q=>q[1]));return Math.max(...ys)-Math.min(...ys);};
  assert.ok(height(arrivalPose(scene,arrivalBeat(6000),6000))<height(scene)*.27);
  const hands=ms=>arrivalPose(scene,arrivalBeat(ms),ms).shapes.filter(p=>/^hand-/.test(p.id)).map(p=>p.points);
  assert.notDeepEqual(hands(1700),hands(1900));
  assert.equal(JSON.stringify(scene),original);
 }
 assert.equal(families.size,8);
});
test('reduced motion immediately reveals the original scene without scrolling or frame loops',async()=>{
 const scene=generateMonster({...combinations()[0],seed:1},6);let draws=0;
 const view={target:scene,renderer:{canvas:{},draw(value){assert.equal(value,scene);draws++;}}};
 assert.equal(await playRevealFlight({view,app:{querySelector(){return null;}},reduced:{matches:true},signal:new AbortController().signal}),true);
 assert.equal(draws,1);
 const aborted=new AbortController();aborted.abort();
 assert.equal(await playRevealFlight({signal:aborted.signal}),false);
});

test('arrival completes, skips and aborts without leaving a tall page, transform, overlay controls or animation loop',async()=>{
 const keys=['document','window','innerHeight','requestAnimationFrame','cancelAnimationFrame'],before=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 class Element extends EventTarget{
  constructor(){super();this.values=new Map();this.classes=new Set();this.dataset={};this.style={setProperty:(k,v)=>this.values.set(k,v),removeProperty:k=>{this.values.delete(k);delete this.style[k.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())];}};this.classList={add:k=>this.classes.add(k),remove:k=>this.classes.delete(k)};this.children=[];}
  getBoundingClientRect(){return {left:32,top:60,width:1000,height:650};}setAttribute(){}append(e){this.children.push(e);}remove(){this.removed=true;}
 }
 try{
  for(const exit of ['complete','skip','abort','resize','reduced']){
   const body=new Element(),doc=new EventTarget(),win=new EventTarget(),scrolls=[],frames=new Map();let seq=0,ground=false;
   Object.assign(doc,{hidden:false,body,createElement:()=>new Element()});win.scrollY=0;win.scrollTo=({top})=>{win.scrollY=top;scrolls.push(top);};
   globalThis.document=doc;globalThis.window=win;globalThis.innerHeight=900;globalThis.requestAnimationFrame=cb=>{frames.set(++seq,cb);return seq;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
   const scene=generateMonster({...combinations()[0],seed:3},6),studio=new Element(),canvas=new Element(),app=new Element(),identity=new Element();
   identity.getBoundingClientRect=()=>({left:750,top:270,width:280,height:240});
   app.querySelector=selector=>selector==='.observation-identity'?identity:studio;
   const renderer={canvas,resize(){},draw(){},get ground(){return ground;},set ground(v){ground=v;}};
   const view={target:scene,renderer,stop(){}},media=new EventTarget(),controller=new AbortController();media.matches=false;
   const result=playRevealFlight({view,app,reduced:media,signal:controller.signal,papers:{flight(){}}});
   assert.ok(app.classes.has('arrival-stage'));assert.equal(frames.size,1);
   assert.equal(app.values.get('--flight-identity-top'),'210px');assert.equal(app.values.get('--flight-identity-left'),'718px');assert.equal(app.values.get('--flight-identity-width'),'280px');
   const falling=[...frames.values()][0];frames.clear();falling(performance.now()+2800);
   assert.equal(identity.style.transform,undefined,'the record never rides the creature');
   assert.equal(app.values.get('--flight-identity-top'),'210px','the lower-floor record stays at its measured world position');
   if(exit==='complete'){const cb=[...frames.values()][0];frames.clear();cb(performance.now()+16000);}
   if(exit==='skip')body.children.find(e=>e.className==='arrival-skip').dispatchEvent(new Event('click'));
   if(exit==='abort')controller.abort();
   if(exit==='resize')win.dispatchEvent(new Event('resize'));
   if(exit==='reduced'){media.matches=true;media.dispatchEvent(new Event('change'));}
   assert.equal(await result,exit!=='abort');assert.equal(app.classes.size,0);assert.equal(app.values.size,0);assert.equal(studio.style.transform,undefined);assert.equal(frames.size,0);assert.ok(body.children.every(e=>e.removed));assert.equal(ground,true);
   if(exit!=='abort')assert.equal(scrolls.at(-1),0);
  }
 }finally{for(const key of keys)if(before[key]===undefined)delete globalThis[key];else globalThis[key]=before[key];}
});
