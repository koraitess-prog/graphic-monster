import {generateMonster} from './dna.js';
import {MonsterRenderer} from './renderer.js';
import {buildRiftRig,actionProfile,characterActionPose} from './character-actions.js';

const canvas=document.querySelector('#action-creature'),status=document.querySelector('#motion-status');
const scene=generateMonster({principle:'typography',organization:'experiment',gaze:'clarity',density:'rich',attitude:'precise',anatomy:'typography',seed:411},6);
const rig=buildRiftRig(scene),profile=actionProfile(scene),renderer=new MonsterRenderer(canvas,{scale:1.5,background:'#202426'});
const media=matchMedia('(prefers-reduced-motion: reduce)'),buttons=[...document.querySelectorAll('[data-action]')],pause=document.querySelector('#motion-pause');
let action='breathe',started=performance.now(),baseX=0,direction=1,frame=0,last=0,visible=true,paused=false,clock=0,previous=performance.now(),samples=[];
// Position is presentation state. Original anatomy, paper rest coordinates and
// the generator result never move or change in storage.
function positioned(pose,x){
 if(!x)return pose;
 const move=([u,v])=>[u+x,v],part=p=>({...p,points:p.points.map(move),...(p.paperMaterial?{paperMaterial:{...p.paperMaterial,points:p.paperMaterial.points.map(move)}}:{})});
 const shapes=pose.shapes.map(part);return {...pose,...(pose.faceFrame?{faceFrame:{...pose.faceFrame,mapPoint:(q,id)=>move(pose.faceFrame.mapPoint(q,id))}}:{}),shapes,lines:pose.lines.map(part),eyes:pose.eyes.map(e=>({...e,x:e.x+x})),body:shapes.find(p=>p.id==='body').points,attachments:pose.attachments.map(a=>({...a,root:move(a.root)}))};
}
const duration=()=>profile[action+'Duration']??1;
function draw(now){
 const dt=Math.min(70,now-previous);previous=now;
 if(!paused&&!media.matches)clock+=dt;
 if(now-last>=33||paused||media.matches){
  const begun=performance.now(),t=action==='breathe'?0:Math.min(1,(clock-started)/1000/duration());
  renderer.draw(media.matches?positioned(scene,baseX):positioned(characterActionPose(scene,rig,action,t,clock/1000,direction),baseX));
  samples.push(performance.now()-begun);if(samples.length>90)samples.shift();
  canvas.dataset.action=action;canvas.dataset.progress=t.toFixed(3);canvas.dataset.renderMs=(samples.reduce((a,b)=>a+b,0)/samples.length).toFixed(1);last=now;
  if(t>=1&&action!=='breathe'){if(action==='walk')baseX+=direction*profile.stride*2;action='breathe';buttons.forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.action==='breathe'));b.disabled=media.matches;});status.textContent='Breathing';}
 }
 if(!paused&&!media.matches&&visible&&!document.hidden)frame=requestAnimationFrame(draw);
}
function run(){cancelAnimationFrame(frame);previous=performance.now();last=0;draw(previous);}
buttons.forEach(button=>button.addEventListener('click',()=>{
 if(media.matches)return;
 // Start a new action from quiet breathing, never snap across two gestures.
 if(action!=='breathe')return;
 action=button.dataset.action;started=clock;direction=baseX>20?-1:1;paused=false;pause.textContent='Pause';
 buttons.forEach(b=>{b.setAttribute('aria-pressed',String(b===button));b.disabled=action!=='breathe';});status.textContent=button.textContent;run();
}));
pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Resume':'Pause';run();});
function motionPreference(){buttons.forEach(b=>b.disabled=media.matches);pause.disabled=media.matches;if(media.matches){action='breathe';status.textContent='Reduced motion';}run();}
media.addEventListener('change',motionPreference);
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);if(!document.hidden)run();});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)run();else cancelAnimationFrame(frame);},{threshold:.05}).observe(canvas);
motionPreference();
