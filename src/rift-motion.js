import {paperGrid} from './paper-motion.js';
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
function bind(point,rest,posed){
 let best;
 for(let i=0;i<rest.length-1;i++){
  const a=rest[i],b=rest[i+1],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy)||1,t=Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(length*length))),x=a[0]+dx*t,y=a[1]+dy*t,distance=Math.hypot(point[0]-x,point[1]-y);
  if(!best||distance<best.distance){const c=posed[i],d=posed[i+1],ux=d[0]-c[0],uy=d[1]-c[1],len=Math.hypot(ux,uy)||1,offset=((point[0]-x)*-dy+(point[1]-y)*dx)/length;best={distance,p:[mix(c[0],d[0],t)-uy/len*offset,mix(c[1],d[1],t)+ux/len*offset]};}
 }
 return best.p;
}
export function riftIdlePose(scene,t,event=0){
 if(t<=0||t>=1)return scene;
 const wave=event%3===1,envelope=Math.sin(Math.PI*t)**2;
 let sx=1,sy=1,dy=0,dx=0,tilt=0;
 if(!wave){
  // Slow preparation, quick release, ballistic hang, then a heavy landing.
  if(t<.22){const u=t/.22,e=smooth(u);sx=1+.035*e;sy=1-.045*e;tilt=-.006*e;}
  else if(t<.30){const e=1-smooth((t-.22)/.08);sx=1+.035*e;sy=1-.045*e;tilt=-.006*e;}
  else if(t<.69){const u=(t-.30)/.39,flight=4*u*(1-u);dy=-34*flight;sy=1-.02*flight;dx=3*flight;tilt=.008*Math.sin(u*Math.PI*2)*flight;}
  else{const u=(t-.69)/.31,e=Math.sin(Math.min(1,u/.28)*Math.PI/2)*Math.exp(-u*5)*(1-smooth((u-.65)/.35));sx=1+.055*e;sy=1-.063*e;tilt=.005*Math.sin(u*9)*Math.exp(-u*4)*(1-u);}
  if(event%3===2)dx+=envelope*1.4;
 }else{dx=envelope*1.3;tilt=-.008*smooth(t/.3)*smooth((1-t)/.3);sy=1-.004*envelope;}
 const global=([x,y])=>{const px=(x-300)*sx,py=(y-655)*sy;return [300+px*Math.cos(tilt)-py*Math.sin(tilt)+dx,655+px*Math.sin(tilt)+py*Math.cos(tilt)+dy];};
 const rig=scene.motionRig?.rightArm;
 const lift=wave?smooth((t-.08)/.29)*smooth((1-t)/.31):0;
 // Two unequal, separated wrist gestures instead of a metronomic wave.
 const pulse=(at,width)=>Math.exp(-(((t-at)/width)**2));
 const flutter=wave?(.24*pulse(.48,.055)-.12*pulse(.59,.08)+.16*pulse(.71,.04))*lift:0;
 const shoulder=rig?.[0],wrist=rig?.[2];
 const target=rig?.map((p,i)=>i===0?p:i===1?[mix(p[0],shoulder[0]+76,lift),mix(p[1],shoulder[1]+31,lift)]:[mix(p[0],shoulder[0]+123,lift)+flutter*20,mix(p[1],shoulder[1]-63,lift)]);
 const handLift=wave?smooth((t-.12)/.29)*smooth((1-t)/.25):0;
 const angle=Math.PI*handLift+flutter,cos=Math.cos(angle),sin=Math.sin(angle);
 const moveHand=([x,y])=>[target[2][0]+(x-wrist[0])*cos-(y-wrist[1])*sin,target[2][1]+(x-wrist[0])*sin+(y-wrist[1])*cos];
 const rotate=(p,root,a)=>{const x=p[0]-root[0],y=p[1]-root[1];return [root[0]+x*Math.cos(a)-y*Math.sin(a),root[1]+x*Math.sin(a)+y*Math.cos(a)];};
 const dangling=(point,p)=>{
  const id=p.motionPart??p.id,side=id.endsWith('left')?'left':id.endsWith('right')?'right':null;
  if(!side||!id.startsWith('arm-')&&!id.startsWith('hand-')||wave&&side==='right')return point;
  const root=scene.attachments.find(a=>a.id==='arm-'+side)?.root;if(!root)return point;
  const delay=side==='left'?0:.035,release=.045*pulse(.36+delay,.085)-.026*pulse(.73+delay,.075)+.009*pulse(.88+delay,.05);
  const swing=wave?.012*envelope:release;
  let q=point;
  if(id.startsWith('hand-')){const anchor=p.anchor;const drag=wave?.014*envelope:.06*pulse(.43+delay,.1)-.045*pulse(.79+delay,.06);q=rotate(point,anchor,drag);}
  return rotate(q,root,side==='left'?-swing:swing);
 };
 const part=p=>{
  const id=p.motionPart??p.id;
  const deform=point=>global(wave&&rig&&id==='arm-right'?bind(point,rig,target):wave&&rig&&id==='hand-right'?moveHand(point):dangling(point,p));
  const material=wave&&rig&&id==='arm-right'?paperGrid(p.points):null;
  return {...p,paperRestPoints:p.points,...(material?{paperMaterial:{...material,points:material.rest.map(deform)}}:{}),points:p.points.map(deform)};
 };
 const shapes=scene.shapes.map(part);
 const eyes=scene.eyes.map((e,i)=>{const [x,y]=global([e.x,e.y]),blink=Math.max(0,1-Math.abs(t-(wave?.67+i*.035:.79+i*.018))/.038);return {...e,x,y,angle:(e.angle??0)+tilt,blink,gaze:[e.gaze[0]+envelope*(wave?1.5:.5),e.gaze[1]-(wave?0:1.2)*envelope]};});
 return {...scene,shapes,lines:scene.lines.map(part),eyes,body:shapes.find(p=>p.id==='body').points,attachments:scene.attachments.map(a=>({...a,root:global(a.root)}))};
}
