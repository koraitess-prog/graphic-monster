import test from 'node:test';import assert from 'node:assert/strict';
import {generateMonster} from '../src/dna.js';import {ANATOMIES} from '../src/paper-dna.js';
import {mouthFor,mouthParts,mouthPointFits,withMonsterMouth,MOUTH_LIBRARY} from '../src/monster-mouths.js';
import {expressionPerformance,MOUTH_ACTIONS,MONSTER_ACTIONS} from '../src/monster-expression.js';
import {familyPose,familyProfile,gaitTargets} from '../src/family-motion.js';import {buildFamilyRig} from '../src/family-rig.js';
const scenes=ANATOMIES.map((anatomy,i)=>generateMonster({anatomy,principle:['shape','color','grid','color','typography','shape','texture','texture'][i],organization:'experiment',gaze:'clarity',density:'rich',attitude:'precise',seed:407+i},6));
test('mouths fit real paper on eight families without covering eyes or body cutouts',()=>{
 const kinds=new Set();
 for(const scene of scenes){const before=JSON.stringify(scene),spec=mouthFor(scene);assert.ok(spec,scene.anatomy);assert.equal(mouthFor(scene),spec);kinds.add(spec.kind);const parent=scene.shapes.find(p=>p.id===spec.parentId);
  for(const action of MOUTH_ACTIONS){const parts=mouthParts(scene,spec,expressionPerformance(action,.48,scene.seed));for(const shape of parts.filter(p=>p.clipParent===spec.parentId))for(const point of shape.points)assert.ok(mouthPointFits(scene,point,parent),scene.anatomy+'/'+action+'/'+shape.id);}
  const rig=buildFamilyRig(scene),creep=familyPose(scene,'creep',.31,1);for(const leg of rig.legs){const end=creep.motionContacts.limbs.get(leg.id).at(-1),target=creep.motionContacts.targets.get(leg.id);assert.ok(Math.hypot(end[0]-target[0],end[1]-target[1])<.35,scene.anatomy+' creep contact');}
  assert.equal(JSON.stringify(scene),before);
 }
 assert.ok(kinds.size>=6);assert.ok(Object.keys(MOUTH_LIBRARY).length>=8);
});
test('mouths follow their anatomical parent and do not accumulate in repeated renders',()=>{
 const scene=scenes[4],pose=familyPose(scene,'yawn',.48,1),display=withMonsterMouth(pose),spec=mouthFor(scene);
 assert.equal(display.shapes.filter(s=>s.id==='expression-mouth-void').length,1);assert.equal(withMonsterMouth(display),display);assert.ok(display.shapes.length>scene.shapes.length);
 const source=mouthParts(scene,spec,pose.faceFrame.cue),moving=mouthParts(scene,spec,pose.faceFrame.cue,pose.faceFrame.mapPoint);
 for(let i=0;i<source.length;i++)for(let j=0;j<source[i].points.length;j++){const expected=pose.faceFrame.mapPoint(source[i].points[j],spec.parentId);assert.ok(Math.hypot(expected[0]-moving[i].points[j][0],expected[1]-moving[i].points[j][1])<1e-7);}
 assert.equal(withMonsterMouth({...scene,rulesVersion:5}).shapes.length,scene.shapes.length);
});
test('performances prepare and recover, with bounded cues and anatomy-aware full-body poses',()=>{
 for(const action of [...MOUTH_ACTIONS,...MONSTER_ACTIONS]){
  for(const endpoint of [0,1])assert.ok(Object.values(expressionPerformance(action,endpoint,411)).every(v=>Math.abs(v)<1e-6),action+' recovery');
  assert.deepEqual(expressionPerformance(action,.5,411),expressionPerformance(action,.5,411));
 }
 for(const i of [0,2,4,7]){const scene=scenes[i],before=JSON.stringify(scene);for(const action of ['yawn','growl','chatter','suspicious','twitch','startle','creep','inspect','outburst','sleepy']){assert.ok(Number.isFinite(familyProfile(scene)[action+'Duration']));const pose=familyPose(scene,action,.48,1);assert.equal(pose.shapes.length,scene.shapes.length);assert.equal(pose.eyes.length,scene.eyes.length);assert.ok(pose.shapes.every(p=>p.points.every(q=>q.every(Number.isFinite))),scene.anatomy+'/'+action);assert.ok(pose.faceFrame);}
  assert.equal(JSON.stringify(scene),before);
 }
});
