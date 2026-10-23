import {buildFamilyRig} from './family-rig.js';
import {solveLimb,characterActionPose,actionProfile} from './character-actions.js';
import {bindLimbPoint} from './rift-motion.js';
import {paperGrid} from './paper-motion.js';

// [breath seconds, stride, lift, jump height, weight, sway, gesture amplitude]
export const FAMILY_PROFILES=Object.freeze({
 typography:[4.7,40,27,74,1,.012,1],
 crane:[5.4,31,24,48,.8,.017,.78],
 color:[4.4,25,20,49,1.2,.012,.86],
 grid:[5.6,19,16,32,1.6,.006,.62],
 accordion:[6.2,18,16,34,1.9,.008,.72],
 shape:[4.8,28,23,52,.9,.018,.95],
 texture:[4.2,22,19,43,1.2,.011,.85],
 knot:[5.1,15,15,25,1.4,.015,.65]
});
const clamp=t=>Math.max(0,Math.min(1,t)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>{t=clamp(t);return t*t*(3-2*t);};
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]),angle=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
const rotate=(p,c,a)=>{const x=p[0]-c[0],y=p[1]-c[1];return [c[0]+x*Math.cos(a)-y*Math.sin(a),c[1]+x*Math.sin(a)+y*Math.cos(a)];};
export const supportsFamilyMotion=scene=>scene.rulesVersion>=6&&scene.stage===5&&!!FAMILY_PROFILES[scene.anatomy];
export function familyProfile(scene){
 const [breath,stride,lift,jump,weight,sway,gesture]=FAMILY_PROFILES[scene.anatomy]??FAMILY_PROFILES.shape,play=scene.answers.attitude==='playful',seed=(scene.seed>>>0)%97/97;
 return {breathPeriod:breath*(.95+seed*.12)*(play?.86:1),stride,lift,jump,weight,sway,gesture,energy:play?1.09:1,elasticity:play?1:.65,phase:seed*Math.PI*2,walkDuration:(2.7+weight*.55)*(play?.9:1),runDuration:2.0,greetDuration:2.8+weight*.3,jumpDuration:2.1+weight*.18,lookDuration:2.8,stretchDuration:3.8,pause:5200+seed*3400};
}
export function familyCapabilities(scene){
 const rig=buildFamilyRig(scene);return ['breathe',...(rig.legs.length?['walk']:['glide']),...(rig.legs.length===2&&rig.legs.every(p=>p.length>145)&&!['accordion'].includes(scene.anatomy)?['run']:[]),'jump','greet','look','stretch'];
}
export function signatureAction(scene,event=0){const sequence=scene.anatomy==='accordion'?['greet','stretch','look','jump']:scene.anatomy==='crane'?['look','greet','stretch','jump']:scene.anatomy==='knot'?['look','greet','stretch']:['greet','look','jump','stretch'];return sequence[(event+(scene.seed>>>0)%3)%sequence.length];}
export function familyEventProfile(scene,event=0){const action=signatureAction(scene,event),p=familyProfile(scene);return {pause:p.pause,duration:p[action+'Duration']*1000,action,signature:'family/'+scene.anatomy+'/'+action};}

// The same fixed-length solver as Rift for two bones; FABRIK only for authored
// chains with additional joints (crane's raised arm, knot's folded leg, etc.).
export function solveChain(rest,root,target){
 if(dist(root,rest[0])<1e-8&&dist(target,rest.at(-1))<1e-8)return rest.map(p=>[...p]);
 if(rest.length===3)return solveLimb(rest,root,target);
 const lengths=rest.slice(1).map((p,i)=>dist(p,rest[i])),total=lengths.reduce((a,b)=>a+b,0),d=dist(root,target);
 if(d>=total-.001)return rest.map((_,i)=>{const n=lengths.slice(0,i).reduce((a,b)=>a+b,0)/Math.max(d,.001);return [root[0]+(target[0]-root[0])*n,root[1]+(target[1]-root[1])*n];});
 const points=rest.map(p=>add(p,[root[0]-rest[0][0],root[1]-rest[0][1]]));
 for(let iteration=0;iteration<24;iteration++){
  points[points.length-1]=target;
  for(let i=points.length-2;i>=0;i--){const l=dist(points[i],points[i+1])||1,k=lengths[i]/l;points[i]=[points[i+1][0]+(points[i][0]-points[i+1][0])*k,points[i+1][1]+(points[i][1]-points[i+1][1])*k];}
  points[0]=root;
  for(let i=1;i<points.length;i++){const l=dist(points[i],points[i-1])||1,k=lengths[i-1]/l;points[i]=[points[i-1][0]+(points[i][0]-points[i-1][0])*k,points[i-1][1]+(points[i][1]-points[i-1][1])*k];}
  if(dist(points.at(-1),target)<.0001)break;
 }
 return points;
}
export function gaitTargets(rig,profile,t,direction=1){
 const count=rig.legs.length,groups=count===3?3:2,phase=Math.min(groups*2-.000001,t*groups*2),step=Math.floor(phase),u=phase-step,targets=new Map(),moving=[];
 rig.legs.forEach((leg,i)=>{const group=count===4?[0,1,1,0][i]:i%groups,done=Math.max(0,Math.floor((step+groups-1-group)/groups)),swing=step%groups===group,progress=swing?ease(u):0;
  targets.set(leg.id,add(leg.rest.at(-1),[direction*profile.stride*(done+progress),swing?-profile.lift*Math.sin(Math.PI*u)**1.4:0]));if(swing)moving.push(leg.id);
 });
 return {targets,moving,dx:direction*profile.stride*2*ease(t),bounce:-4/profile.weight*Math.sin(Math.PI*u)**2*ease(t/.15)*ease((1-t)/.15),phase,u};
}

export function familyPose(scene,action='breathe',t=0,seconds=0,direction=1){
 const rig=buildFamilyRig(scene),p=familyProfile(scene);t=clamp(t);
 // Preserve the approved four Rift actions, including their exact fitted rig.
 if(rig.rift&&['breathe','walk','jump','greet'].includes(action))return characterActionPose(scene,rig.rift,action,t,seconds*actionProfile(scene).breathPeriod/p.breathPeriod,direction);
 const breath=(1-Math.cos(seconds/p.breathPeriod*Math.PI*2))*.5,env=Math.sin(Math.PI*t)**2;
 let dx=0,dy=0,tilt=p.sway*.25*Math.sin(seconds*.6+p.phase)*breath,sx=1+.022*breath,sy=1+.015*breath,gait;
 if(['walk','run'].includes(action)&&rig.legs.length){gait=gaitTargets(rig,p,t,direction);dx=gait.dx;dy=gait.bounce*(action==='run'?1.5:1);tilt+=direction*p.sway*env;}
 if(action==='glide'&&!rig.legs.length){dx=p.stride*2*ease(t)*direction;dy=-8*env;}
 if(action==='jump'){
  const crouch=t<.27?ease(t/.18)*(1-ease((t-.18)/.09)):t>.68?Math.sin(clamp((t-.68)/.19)*Math.PI)*Math.exp(-Math.max(0,t-.77)*12):0;
  const flight=t>=.27&&t<=.68?4*((t-.27)/.41)*(1-(t-.27)/.41):0;
  dy=crouch*(10+4*p.weight)-flight*p.jump*p.energy;sx+=crouch*.028;sy-=crouch*.045;tilt+=Math.sin(t*Math.PI*2)*p.sway*env;
 }
 if(action==='stretch'){sx-=env*.018;sy+=env*.04;tilt+=env*p.sway;}
 if(action==='greet')tilt-=env*p.sway*p.gesture;
 if(action==='look')tilt+=Math.sin(t*Math.PI*2)*p.sway*env;
 const torso=q=>add(rotate([rig.pelvis[0]+(q[0]-rig.pelvis[0])*sx,rig.pelvis[1]+(q[1]-rig.pelvis[1])*sy],rig.pelvis,tilt),[dx,dy]);
 // Sag just enough to keep even nearly straight crane legs grounded.
 // Contact targets win over torso travel; bones never stretch to reach them.
 let drop=0;for(const leg of rig.legs){const root=torso(leg.rest[0]),target=gait?.targets.get(leg.id)??leg.rest.at(-1),reach=leg.length;if(target[1]>root[1]&&dist(root,target)>reach+1e-6&&Math.abs(target[0]-root[0])<reach)drop=Math.max(drop,target[1]-root[1]-Math.sqrt(reach*reach-(target[0]-root[0])**2));}
 if(action!=='jump')dy+=drop;
 const posed=new Map(),terminals=new Map();
 for(const leg of rig.legs){
  let target=gait?.targets.get(leg.id)??leg.rest.at(-1);
  if(action==='jump'&&dy<0)target=add(target,[0,dy-(p.lift*.25)*env]);
  const chain=solveChain(leg.rest,torso(leg.rest[0]),target);posed.set(leg.id,chain);
  if(leg.terminalId)terminals.set(leg.terminalId,{limb:leg,chain,rotation:gait?.moving.includes(leg.id)?.08*Math.sin(gait.u*Math.PI*2)*direction:0});
 }
 for(const [i,arm]of rig.arms.entries()){
  const root=torso(arm.rest[0]),side=arm.rest.at(-1)[0]>=arm.rest[0][0]?1:-1,secondary=Math.sin(seconds*.9-i*.63)*breath*.018;
  let target=rotate(torso(arm.rest.at(-1)),root,secondary+(gait?Math.sin(gait.phase*Math.PI+(i%2)*Math.PI)*.12*env:action==='jump'?Math.sin(t*10-i*.4)*.08*env:0)),roll;
  if(action==='greet'){
   const delay=i*.055,raise=ease((t-.05-delay)/.27)*ease((1-t)/.28)*(i===0?1:.24),reach=Math.min(90,arm.length*.53),wave=Math.sin(t*16+i*.8)*env*.07*p.elasticity;
   target=[mix(target[0],Math.max(85,Math.min(470,root[0]+side*reach)),raise),mix(target[1],root[1]-Math.min(90,arm.length*.45),raise)];roll=Math.PI*raise+wave*raise;
  }
  const chain=solveChain(arm.rest,root,target);posed.set(arm.id,chain);if(arm.terminalId)terminals.set(arm.terminalId,{limb:arm,chain,rotation:roll??angle(chain.at(-2),chain.at(-1))-angle(arm.rest.at(-2),arm.rest.at(-1))});
 }
 const limbById=new Map([...rig.legs,...rig.arms].map(l=>[l.id,l]));
 const move=(q,id)=>{
  const limb=limbById.get(id);if(limb)return bindLimbPoint(q,limb.rest,posed.get(id),true);
  const terminal=terminals.get(id);if(terminal){const origin=terminal.limb.rest.at(-1),end=terminal.chain.at(-1);return add(rotate(q,origin,terminal.rotation),[end[0]-origin[0],end[1]-origin[1]]);}
  if(id.startsWith('claw-blade')&&terminals.has('hand-right'))return move(q,'hand-right');
  if(id.startsWith('hinge-')){
   const part=scene.shapes.find(s=>s.id===id),c=part?.points.reduce((s,v)=>[s[0]+v[0]/part.points.length,s[1]+v[1]/part.points.length],[0,0]);let best;
   if(c)for(const l of [...rig.legs,...rig.arms])for(const joint of l.rest.slice(1,-1)){const d=dist(c,joint);if(!best||d<best.d)best={d,l};}if(best&&best.d<25)return move(q,best.l.id);
  }
  const stalkId=id.match(/^eye-(?:stalk|head|mask)-(\d+)/)?.[1],stalk=stalkId!==undefined?rig.stalks.find(s=>s.id==='eye-stalk-'+stalkId):null;
  if(stalk){const r=(Math.sin(seconds*.65+Number(stalkId)*.8)-Math.sin(Number(stalkId)*.8))*.014*breath+(action==='look'||action==='greet'?Math.sin(t*Math.PI*2+Number(stalkId)*.35)*env*.045:0);return torso(rotate(q,stalk.root,r));}
  if(id==='tail'){const root=scene.shapes.find(s=>s.id==='tail').points[0];return torso(rotate(q,root,Math.sin(seconds*.8)*breath*.035+Math.sin(t*8)*env*.035));}
  return torso(q);
 };
 const part=s=>{const id=s.motionPart??s.id,deform=q=>move(q,id),grid=limbById.has(id)?paperGrid(s.points):null;return {...s,paperRestPoints:s.points,points:s.points.map(deform),...(grid?{paperMaterial:{...grid,points:grid.rest.map(deform)}}:{}),...(s.anchor?{anchor:deform(s.anchor)}:{})};};
 const shapes=scene.shapes.map(part),blink=seconds%7.1;
 return {...scene,shapes,lines:scene.lines.map(part),body:shapes.find(s=>s.id==='body').points,eyes:scene.eyes.map((e,i)=>{const stalk=e.stalk?rig.stalks.reduce((a,s)=>!a||dist(s.root,e.anchor??[e.x,e.y])<dist(a.root,e.anchor??[e.x,e.y])?s:a,null):null,[x,y]=move([e.x,e.y],stalk?stalk.id:'body');return {...e,x,y,angle:(e.angle??0)+tilt,blink:Math.max(0,1-Math.abs(blink-4.1-i*.07)/.09),gaze:[e.gaze[0]+(action==='look'?Math.sin(t*Math.PI*2)*env*2.2:action==='greet'?env*1.2:0),e.gaze[1]-(action==='jump'?env:0)]};}),attachments:scene.attachments.map(a=>({...a,root:move(a.root,a.id)})),motionContacts:{limbs:posed,targets:gait?.targets??new Map()}};
}
