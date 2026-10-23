// Pure, replayable poses. The browser owns clocks and quiet intervals. Each event
// begins and ends at the exact authored rest pose, including connected joints.
export function motionProfile(scene,event=0){
 const a=scene.answers,code=scene.seed;
 return {pause:scene.stage===0?300:2200+(a.density==='minimal'?2600:700)+(a.organization==='experiment'?(code*37+event*1171)%2400:800),duration:scene.stage===0?4400:1700+(a.attitude==='playful'?700:0)+(code%5)*90,signature:[scene.family,...Object.values(a)].join('/')};
}
export function idlePose(scene,t,event=0){
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
