// Opt-in motion study. No generator, saved scene or global idle rules are changed.
import {bindLimbPoint} from './rift-motion.js';
import {paperGrid} from './paper-motion.js';
const mix=(a,b,t)=>a+(b-a)*t;
const clamp=t=>Math.max(0,Math.min(1,t));
const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
const length=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const angle=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
function rotate(p,origin,r){const x=p[0]-origin[0],y=p[1]-origin[1];return [origin[0]+x*Math.cos(r)-y*Math.sin(r),origin[1]+x*Math.sin(r)+y*Math.cos(r)];}

// Two rigid bone lengths, a fixed contact target, and the authored bend direction.
export function solveLimb(rest,root,target){
 const a=length(rest[0],rest[1]),b=length(rest[1],rest[2]),raw=length(root,target),d=Math.max(Math.abs(a-b)+.001,Math.min(a+b-.001,raw)),dx=(target[0]-root[0])/(raw||1),dy=(target[1]-root[1])/(raw||1);
 const along=(a*a-b*b+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));
 const cross=(rest[2][0]-rest[0][0])*(rest[1][1]-rest[0][1])-(rest[2][1]-rest[0][1])*(rest[1][0]-rest[0][0]),side=Math.sign(cross)||1;
 return [root,[root[0]+dx*along-dy*height*side,root[1]+dy*along+dx*height*side],[root[0]+dx*d,root[1]+dy*d]];
}

export function buildRiftRig(scene){
 if(scene.anatomy!=='typography')throw new Error('This study is fitted to Rift only. Other anatomies need an attachment adapter.');
 const loose=scene.answers.organization==='experiment',active=scene.answers.attitude==='playful';
 const warp=([x,y])=>[300+(x-300)*(loose?.91:1)+(loose?(350-y)*.065:0),y+(loose?(x-300)*.045:0)];
 const root=id=>scene.attachments.find(a=>a.id===id).root,anchor=id=>scene.shapes.find(p=>p.id===id).anchor;
 const rig={legs:{},arms:{},pelvis:[285,478]};
 for(const [i,side]of ['left','right'].entries()){
  const hip=i?[322,478]:[263,477];
  rig.legs[side]=[root('leg-'+side),warp([hip[0]+(i?48:-38)*(loose?1.3:1),560-(i?0:20)]),warp([hip[0]+(i?38:-26),657-(i&&active?14:0)])];
  const shoulder=i?[337,300]:[246,300];
  rig.arms[side]=[root('arm-'+side),warp([shoulder[0]+(i?64:-61),shoulder[1]+(i&&active?-45:65)]),anchor('hand-'+side)];
 }
 return rig;
}
export function actionProfile(scene){
 const playful=scene.answers.attitude==='playful',rich=scene.answers.density==='rich';
 return {breathPeriod:playful?3.6:4.7,walkDuration:playful?2.8:3.6,jumpDuration:rich?2.5:2.2,greetDuration:playful?3.2:3.7,energy:playful?1.12:1,elasticity:playful?1:.62,stride:40};
}
function track(keys,t){
 for(let i=0;i<keys.length-1;i++){const [a,v,m]=keys[i],[b,w,n]=keys[i+1];if(t<=b){const h=b-a,u=clamp((t-a)/h);return (2*u**3-3*u*u+1)*v+(u**3-2*u*u+u)*h*m+(-2*u**3+3*u*u)*w+(u**3-u*u)*h*n;}}
 return keys.at(-1)[1];
}
export function actionControls(scene,rig,action,t,seconds=0,direction=1){
 const profile=actionProfile(scene),breath=(1-Math.cos(seconds/profile.breathPeriod*Math.PI*2))*.5;
 let dx=0,dy=0,tilt=0,sx=1+.026*breath,sy=1+.018*breath;
 const feet={},hands={},footAngles={left:0,right:0},lift=ease(t/.22)*ease((1-t)/.22);
 if(action==='walk'){
  const phase=Math.min(3.999999,t*4),step=Math.floor(phase),u=phase-step;
  dx=direction*profile.stride*2*ease(t);dy=-5.5*Math.sin(Math.PI*u)**2*lift;tilt=direction*.012*lift;
  for(const [i,side]of ['left','right'].entries()){
   const done=Math.max(0,Math.floor((step+1-i)/2)),moving=step%2===i,swing=moving?ease(u):0;
   feet[side]=add(rig.legs[side][2],[direction*profile.stride*(done+swing),moving?-27*Math.sin(Math.PI*u)**1.4:0]);
   footAngles[side]=moving?direction*.12*Math.sin(2*Math.PI*u):0;
  }
  // Weight follows the planted foot; arms oppose the stepping legs.
  dx+=Math.sin(phase*Math.PI)*3*lift;
 }else if(action==='jump'){
  dy=track([[0,0,0],[.20,20,0],[.30,-30,-500],[.46,-74,0],[.68,0,600],[.75,22,0],[.87,-3,0],[1,0,0]],t)*profile.energy;
  const compression=t<.3?ease(t/.2)*(1-ease((t-.2)/.1)):t>.68?Math.sin(clamp((t-.68)/.14)*Math.PI)*Math.exp(-Math.max(0,t-.75)*15):0;
  sx+=compression*.035;sy-=compression*.075;tilt=.012*Math.sin(t*Math.PI*2)*lift;
  const flight=t>.24&&t<.68?Math.min(0,dy):0,tuck=t>.24&&t<.68?-16*Math.sin(clamp((t-.24)/.44)*Math.PI):0;
  for(const side of ['left','right'])feet[side]=add(rig.legs[side][2],[0,flight+tuck]);
 }else if(action==='greet'){tilt=-.013*lift;dy=2*lift;}
 const torso=p=>{const q=[rig.pelvis[0]+(p[0]-rig.pelvis[0])*sx,rig.pelvis[1]+(p[1]-rig.pelvis[1])*sy];return add(rotate(q,rig.pelvis,tilt),[dx,dy]);};
 for(const [i,side]of ['left','right'].entries()){
  if(!feet[side])feet[side]=rig.legs[side][2];
  const arm=rig.arms[side],shoulder=torso(arm[0]),opposition=action==='walk'?Math.sin(t*Math.PI*4+(i?0:Math.PI))*.15*lift:0;
  const delay=Math.sin(seconds*1.2-i*.6)*breath*.012+(action==='jump'?Math.sin(t*11-i*.5)*Math.sin(Math.PI*t)**2*.085:0);
  hands[side]=rotate(torso(arm[2]),shoulder,opposition+delay);
 }
 let wristAngle=0;
 if(action==='greet'){
  const shoulder=torso(rig.arms.right[0]),raise=ease((t-.06)/.27)*ease((1-t)/.25),pulse=(at,w)=>Math.exp(-(((t-at)/w)**2));
  const flutter=(.15*pulse(.46,.055)-.11*pulse(.58,.07)+.12*pulse(.72,.05))*profile.elasticity;
  hands.right=[mix(hands.right[0],shoulder[0]+126,raise)+flutter*22,mix(hands.right[1],shoulder[1]-63,raise)];wristAngle=Math.PI*raise+flutter;
 }
 return {torso,feet,hands,footAngles,wristAngle,dx,dy,tilt,profile};
}
export function characterActionPose(scene,rig,action,t,seconds=0,direction=1){
 const c=actionControls(scene,rig,action,clamp(t),seconds,direction),legs={},arms={};
 for(const side of ['left','right']){legs[side]=solveLimb(rig.legs[side],c.torso(rig.legs[side][0]),c.feet[side]);arms[side]=solveLimb(rig.arms[side],c.torso(rig.arms[side][0]),c.hands[side]);}
 const transform=(point,id)=>{
  const side=id.endsWith('left')?'left':id.endsWith('right')?'right':null;
  if(side&&id.startsWith('leg-'))return bindLimbPoint(point,rig.legs[side],legs[side],true);
  if(side&&id.startsWith('arm-'))return bindLimbPoint(point,rig.arms[side],arms[side],true);
  if(side&&id.startsWith('foot-'))return add(rotate(point,rig.legs[side][2],c.footAngles[side]),[legs[side][2][0]-rig.legs[side][2][0],legs[side][2][1]-rig.legs[side][2][1]]);
  if(side&&id.startsWith('hand-')){const rest=rig.arms[side],posed=arms[side],r=action==='greet'&&side==='right'?c.wristAngle:angle(posed[1],posed[2])-angle(rest[1],rest[2]);return add(rotate(point,rest[2],r),[posed[2][0]-rest[2][0],posed[2][1]-rest[2][1]]);}
  return c.torso(point);
 };
 const part=p=>{const id=p.motionPart??p.id,deform=q=>transform(q,id),bending=/^(leg|arm)-/.test(id),grid=bending?paperGrid(p.points):null;return {...p,paperRestPoints:p.points,points:p.points.map(deform),...(grid?{paperMaterial:{...grid,points:grid.rest.map(deform)}}:{}),...(p.anchor?{anchor:deform(p.anchor)}:{})};};
 const shapes=scene.shapes.map(part),blinkPhase=(seconds%6.7);
 return {...scene,faceFrame:{source:scene,mapPoint:q=>c.torso(q)},shapes,lines:scene.lines.map(part),eyes:scene.eyes.map((e,i)=>{const [x,y]=c.torso([e.x,e.y]);return {...e,x,y,angle:(e.angle??0)+c.tilt,blink:Math.max(0,1-Math.abs(blinkPhase-4.4-i*.035)/.09),gaze:[e.gaze[0]+(action==='greet'?2*Math.sin(t*Math.PI)**2:action==='walk'?direction*1.5:0),e.gaze[1]-(action==='jump'?Math.sin(t*Math.PI)*1.7:0)]};}),body:shapes.find(p=>p.id==='body').points,attachments:scene.attachments.map(a=>({...a,root:transform(a.root,a.id)})),motionContacts:{feet:legs,arms}};
}
