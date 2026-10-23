import {supportsFamilyMotion,familyEventProfile,familyPose,familyProfile} from './family-motion.js';
import {riftIdlePose} from './rift-motion.js';
import {paperLivingPose} from './paper-behavior.js';
// Pure, replayable poses. The browser owns clocks and quiet intervals. Each event
// begins and ends at the exact authored rest pose, including connected joints.
function legacyMotionProfile(scene,event=0){
 const a=scene.answers,code=scene.seed;
 return {pause:scene.stage===0?300:2200+(a.density==='minimal'?2600:700)+(a.organization==='experiment'?(code*37+event*1171)%2400:800),duration:scene.stage===0?4400:1700+(a.attitude==='playful'?700:0)+(code%5)*90,signature:[scene.family,...Object.values(a)].join('/')};
}
export function legacyIdlePose(scene,t,event=0){
 if(t<=0||t>=1)return scene;
 const a=scene.answers,envelope=Math.sin(Math.PI*t)**2,play=a.attitude==='playful',loose=a.organization==='experiment';
 const amount=envelope*(play?1.35:.85),phase=Math.sin(t*Math.PI*2),direction=(event+scene.seed)%2?1:-1;
 const deform=([x,y])=>{
  let dx=0,dy=0;
  switch(scene.family){
   case 'unformed':dx=Math.sin(y/64+t*6.28)*4*envelope;dy=-envelope*8+Math.sin(x/67+t*6.28)*3*envelope;break;
   case 'typography':dx=(x-300)*.018*amount*phase;dy=-(y-655)*.018*amount*phase;break;
   case 'grid':dx=Math.sin(Math.PI*t)**4*2.8*direction*Math.max(0,(655-y)/480);break;
   case 'shape':dx=(x-300)*.025*amount*phase;dy=-(y-655)*.018*amount*phase;break;
   case 'texture':dx=Math.sin(y/62-t*6.28)*1.4*amount;break;
   case 'color':dy=Math.sin(x/84+t*6.28)*.6*amount;break;
  }
  if(loose)dx+=(655-y)*.004*amount*direction;
  // Same deformation field moves stalk and eye together, anchored at its root.
  if(y<220)dx+=Math.max(0,220-y)*.035*amount*phase;
  return [x+dx,y+dy];
 };
 const part=s=>({...s,points:s.points.map(p=>{
  let q=deform(p);
  if(['color','unformed'].includes(scene.family)&&s.id.startsWith('color-mass'))q=[q[0]+Math.sin(t*6.28)*3*amount,q[1]+Math.cos(t*6.28)*2*amount];
  if(s.pattern&&scene.family==='texture')q=[q[0]+Math.sin(p[1]/28-t*9)*2*amount,q[1]];
  if(play&&/hand-right|arm-right/.test(s.id)){const w=Math.max(0,(p[0]-400)/110);q=[q[0]+w*3*amount*phase,q[1]-w*5*amount*phase];}
  return q;
 })});
 const eyes=scene.eyes.map((e,i)=>{
  const [x,y]=deform([e.x,e.y]),at=.42+(a.gaze==='expression'?i*.045:0);
  const blink=Math.max(0,1-Math.abs(t-at)/.055);
  return {...e,x,y,blink,gaze:[e.gaze[0]+direction*envelope*(a.gaze==='expression'?3:1.5),e.gaze[1]+envelope*Math.sin(t*6.28)]};
 });
 const shapes=scene.shapes.map(part);
 return {...scene,shapes,lines:scene.lines.map(part),eyes,body:shapes.find(s=>s.id==='body').points,attachments:scene.attachments.map(a=>({...a,root:deform(a.root)}))};
}

export function motionProfile(scene,event=0){
 if(supportsFamilyMotion(scene))return familyEventProfile(scene,event);
 if(scene.behavior==='lively'&&scene.stage===5)return {pause:2500+(scene.seed*37+event*251)%1400,duration:event%3===1?2850:1700,signature:'rift/lively/'+scene.code+'/'+event%3};
 if(!(scene.rulesVersion>=3))return legacyMotionProfile(scene,event);
 if(scene.rulesVersion>=5&&['accordion','crane','knot'].includes(scene.anatomy)){const [pause,duration]={accordion:[8300,3300],crane:[11200,4100],knot:[6100,2200]}[scene.anatomy];return {pause:pause+(scene.seed*43+event*911)%2800,duration,signature:'v5/'+scene.anatomy+'/'+Object.values(scene.answers).join('/')};}
 return {pause:6500+(scene.seed*43+event*911)%5000,duration:2600+(scene.seed%5)*230,signature:'v3/'+[scene.family,...Object.values(scene.answers)].join('/')};
}
export function idlePose(scene,t,event=0){
 if(supportsFamilyMotion(scene)){if(t<=0||t>=1)return scene;const p=familyEventProfile(scene,event);return familyPose(scene,p.action,t,t*familyProfile(scene).breathPeriod);}
 if(scene.behavior==='lively'&&scene.stage===5)return riftIdlePose(scene,t,event);
 if(scene.rulesVersion>=6)return paperLivingPose(scene,t,event);
 if(!(scene.rulesVersion>=3))return legacyIdlePose(scene,t,event);
 if(t<=0||t>=1)return scene;
 const a=scene.answers,envelope=Math.sin(Math.PI*t)**2,direction=(scene.seed+event)%2?1:-1;
 const twitch=a.attitude==='playful'?Math.exp(-(((t-.69)/.035)**2))*Math.sin(t*115):0;
 const deform=([x,y])=>{const upper=Math.max(0,(655-y)/520);let dx=upper*(envelope*direction*1.8+twitch*.75),dy=upper*envelope*(a.organization==='experiment'?1.4:-.8);
  if(scene.rulesVersion>=5){
   if(scene.anatomy==='accordion'){dx+=(x-280)*.009*envelope;dy+=Math.sin(y/38)*envelope*.75;}
   if(scene.anatomy==='crane'){dx+=Math.max(0,280-y)*.012*envelope*direction;dy-=upper*.5*envelope;}
   if(scene.anatomy==='knot'){dx-=upper*envelope*2;dy+=Math.sin(x/77)*envelope*.6;}
  }
  return [x+dx,y+dy];};
 const part=p=>({...p,points:p.points.map(deform)}),shapes=scene.shapes.map(part);
 const eyes=scene.eyes.map((e,i)=>{const [x,y]=deform([e.x,e.y]),at=.24+(i*.137+event*.071)%.56,width=i===0?.13:a.attitude==='playful'?.018:.045;
  return {...e,x,y,blink:Math.max(0,1-Math.abs(t-at)/width),gaze:[e.gaze[0]+direction*envelope*(i===0?1.8:.6),e.gaze[1]+envelope*.4]};});
 return {...scene,shapes,lines:scene.lines.map(part),eyes,body:shapes.find(p=>p.id==='body').points,attachments:scene.attachments.map(p=>({...p,root:deform(p.root)}))};
}
