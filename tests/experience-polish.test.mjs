import test from 'node:test';import assert from 'node:assert/strict';
import {generateMonster,combinations} from '../src/dna.js';import {describeCreature} from '../src/creature-description.js';
import {centeredFormationCamera,flightViewport} from '../src/arrival-camera.js';import {textPlayMotion,creaturePlayFrame} from '../src/creature-play.js';import {incomingPaperPose} from '../src/paper-vortex.js';
const scene=generateMonster({principle:'grid',organization:'experiment',gaze:'expression',density:'rich',attitude:'playful',seed:17},7);
test('centered assembly shares the exact first flight frame and ends at the landing layout',()=>{
 for(const[width,height]of [[390,844],[1280,850]]){const origin=centeredFormationCamera(scene,width,height),landing={scale:.5,x:20,y:60},points=scene.shapes.flatMap(p=>p.points),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 assert.ok(Math.abs((Math.min(...xs)+Math.max(...xs))*.5*origin.scale+origin.x-width/2)<.01);assert.deepEqual(flightViewport({worldY:0,scrollY:0},{drop:0},origin,landing),origin);assert.deepEqual(flightViewport({worldY:1800,scrollY:1800},{drop:1},origin,landing),landing);
 }
});
test('new paper unfolds into its own orbit at full opacity, without a giant faded duplicate',()=>{
 const target={x:420,y:390,size:140,angle:.5,fold:.8,alpha:1};for(let t=0;t<1.3;t+=.05){const p=incomingPaperPose(target,t);assert.ok(p.size<=target.size);assert.equal(p.alpha,1);assert.ok(p.fold>=.4);}
 const p=incomingPaperPose(target,2);assert.ok(Math.abs(p.x-target.x)<.001);assert.ok(Math.abs(p.y-target.y)<.001);assert.equal(p.size,target.size);
});
test('text and name return exactly; character approaches text before swatting and biting',()=>{
 const layout={width:1280,height:850,home:{scale:.7,x:80,y:100},text:{description:{left:800,top:370,width:280,height:100},name:{left:800,top:300,width:180,height:40}}};
 assert.equal(creaturePlayFrame(scene,6200,layout).phase,'swat');assert.equal(creaturePlayFrame(scene,10000,layout).phase,'name-bite');assert.ok(textPlayMotion(7900).textY<0);assert.ok(textPlayMotion(10900).bite>0);
 assert.deepEqual(textPlayMotion(13000),{textX:0,textY:-0,rotation:0,nameX:-0,nameRotation:-0,bite:0});
 for(const at of [1800,5800,7400,9400,12000,14000]){const a=creaturePlayFrame(scene,at-1,layout).camera,b=creaturePlayFrame(scene,at+1,layout).camera;assert.ok(Math.abs(a.x-b.x)<1&&Math.abs(a.y-b.y)<1&&Math.abs(a.scale-b.scale)<.01);}
});
test('all descriptions are short, factual, answer-specific and leave archived writing alone',()=>{
 for(const a of combinations()){const s=generateMonster({...a,seed:17},7),before=JSON.stringify(s),text=describeCreature(s);assert.ok(text.split(/\s+/).length<=28);assert.equal(text.split('.').filter(Boolean).length,3);assert.ok(text.includes(a.gaze==='clarity'?'one focused eye':s.eyes.length+' eyes'));assert.ok(text.includes(a.organization==='experiment'?'asymmetric':'ordered'));assert.equal(JSON.stringify(s),before);}
});
