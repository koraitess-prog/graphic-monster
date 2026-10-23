// Presentation only. The generator and saved scene snapshots remain untouched.
// Anidoodle's seeded composition / bake-once, composite-on-input approach.
import {rng} from './anidoodle-kit.js';
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const hash=s=>[...s].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
const center=p=>p.reduce((c,q)=>[c[0]+q[0]/p.length,c[1]+q[1]/p.length],[0,0]);
const path=(g,ps)=>{g.beginPath();g.moveTo(...ps[0]);for(const p of ps.slice(1))g.lineTo(...p);g.closePath();};

export function cloudTraits(answers={}){
 return {language:answers.principle??'shape',ordered:answers.organization==='order',expressive:answers.gaze==='expression',count:answers.density==='rich'?48:answers.density==='minimal'?17:29,playful:answers.attitude==='playful',stage:Object.keys(answers).filter(k=>['principle','organization','gaze','density','attitude'].includes(k)).length};
}
export function cloudPlacement(id,index,total,answers={},seconds=0){
 const t=cloudTraits(answers),random=rng(hash(id)),a=index*2.39996+random()*.3,r=Math.sqrt((index+.7)/total),phase=random()*Math.PI*2;
 const speed=t.playful?.8:.27,orbit=seconds*speed*(t.ordered?.13:.26),drift=Math.sin(seconds*speed+phase),depth=.74+random()*.4;
 let x,y;
 if(t.ordered){const cols=Math.ceil(Math.sqrt(total)),rows=Math.ceil(total/cols);x=(index%cols-(cols-1)/2)*49;y=(Math.floor(index/cols)-(rows-1)/2)*43;x+=Math.cos(phase+seconds*.33)*5;y+=drift*5;}
 else{x=Math.cos(a+orbit)*r*151+drift*15;y=Math.sin(a+orbit)*r*124+Math.cos(seconds*.57+phase)*16;x+=24*Math.sin(a*.7);}
 const gesture=t.playful?Math.sin(seconds*1.7+phase)*Math.sin(seconds*.7+phase)*7:Math.sin(seconds*.5+phase)*2;
 if(answers.gaze==='clarity'){if(index===0){x=0;y=-22;}else{x*=1.08;y*=1.08;}}
 if(t.expressive){x+=(index%2?23:-14);y+=Math.sin(index*2.3)*14;}
 return {x:300+x,y:362+y+gesture,angle:(t.ordered?Math.sin(phase+seconds*.32)*.055:Math.sin(phase+seconds*.41)*.24)+(t.playful?drift*.06:0),size:(answers.gaze==='clarity'&&index===0?156:t.count<20?146:108)*depth,depth};
}

export class PaperFormation{
 constructor(view){
  this.view=view;this.renderer=view.renderer;this.canvas=this.renderer.canvas;this.factory=this.renderer.factory;this.active=false;this.visible=true;this.raf=0;this.parts=[];this.answers={};this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
  this.onVisibility=()=>{if(document.hidden&&this.resolveReveal)this.stop();cancelAnimationFrame(this.raf);if(this.active&&!document.hidden)this.run();};
  this.onMotion=()=>{if(this.resolveReveal)this.stop();cancelAnimationFrame(this.raf);if(this.active){this.draw(performance.now());this.run();}};
  document.addEventListener('visibilitychange',this.onVisibility);this.reduced.addEventListener('change',this.onMotion);
 }
 bake(scene){
  const renderer=this.renderer,old=renderer.ctx;
  const make=(id,points,paint,kind)=>{
   const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.floor(Math.min(...xs))-4,y=Math.floor(Math.min(...ys))-4,w=Math.ceil(Math.max(...xs)-x)+4,h=Math.ceil(Math.max(...ys)-y)+4;
   const image=this.factory(Math.max(2,w*2),Math.max(2,h*2)),g=image.getContext('2d');renderer.ctx=g;g.setTransform(2,0,0,2,-x*2,-y*2);g.lineJoin='round';g.lineCap='round';paint(g);renderer.ctx=old;
   return {id,image,x,y,w,h,cx:x+w/2,cy:y+h/2,kind};
  };
  const parts=[];
  for(const s of scene.shapes){
   if(s.carrier)continue;
   // The exact final parent clipping is baked into each physical piece.
   parts.push(make(s.id,s.points,g=>{
    if(s.clip==='body'){path(g,scene.shapes.find(p=>p.id==='body').points);g.clip();}
    if(s.clipParent){const parent=scene.shapes.find(p=>p.id===s.clipParent);if(parent){const c=center(parent.points),k=parent.paperEnvelopeScale??1;path(g,parent.points.map(p=>[c[0]+(p[0]-c[0])*k,c[1]+(p[1]-c[1])*k]));g.clip();}}
    if(s.pattern)renderer.patternClearance(scene);
    const edge=s.points.map(([x,y],i)=>[x+Math.sin(i*1.8+s.seed)*.4,y+Math.cos(i*2.3+s.seed)*.4]);renderer.fill(edge,s);
    if(s.paperSeam){g.strokeStyle='#151a1b';g.globalAlpha=.65;g.lineWidth=s.paperSeam;path(g,edge);g.stroke();}
   },'paper'));
  }
  const eyes=scene.eyes.map(e=>make(e.id,[[e.x-e.r*1.7-8,e.y-e.ry-9],[e.x+e.r*1.7+8,e.y+e.ry+9]],()=>renderer.eye(e,scene.tooth),'eye'));
  const lines=scene.lines.map(l=>make(l.id,l.points,g=>{if(l.clip==='body'){path(g,scene.shapes.find(p=>p.id==='body').points);g.clip();}g.strokeStyle=l.color;g.lineWidth=l.width;g.globalAlpha=l.alpha??1;g.beginPath();l.points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();},'line'));
  return {parts,eyes,lines};
 }
 update(scene,answers){
  const now=performance.now();this.previous=new Map(this.visibleParts().map((p,i)=>[p.id,this.placement(p,i,now)]));this.changed=now;
  this.scene=scene;this.answers={...answers};const baked=this.bake(scene);this.parts=baked.parts;this.eyes=baked.eyes;this.lines=baked.lines;
  // Keep anatomical draw order for assembly, seeded order for a stable paper cloud.
  this.cloudParts=this.parts.filter(p=>!p.id.includes('backing')&&!p.id.includes('mask')&&!/hand|claw|mouth|teeth|tooth/.test(p.id)&&!scene.shapes.find(s=>s.id===p.id)?.opening).sort((a,b)=>hash(a.id)-hash(b.id));
  if(!this.active){this.view.stop();this.view.start=0;this.view.visible=false;this.active=true;this.begun=now;}
  this.canvas.dataset.formation=JSON.stringify(cloudTraits(answers));this.draw(now);this.run();
 }
 visibleParts(){return (this.cloudParts??[]).slice(0,cloudTraits(this.answers).count);}
 placement(p,i,now){
  const seconds=this.reduced.matches?0:(now-(this.begun??now))/1000,target=cloudPlacement(p.id,i,this.visibleParts().length,this.answers,seconds),from=this.previous?.get(p.id),t=this.reduced.matches?1:smooth((now-this.changed)/680);
  return from?Object.fromEntries(Object.entries(target).map(([k,v])=>[k,mix(from[k]??v,v,t)])):{...target,x:mix(300,target.x,t),y:mix(362,target.y,t),size:target.size*t};
 }
 stamp(g,p,pos,scale){g.save();g.translate(pos.x,pos.y);g.rotate(pos.angle??0);g.scale(scale,scale);g.drawImage(p.image,-p.w/2,-p.h/2,p.w,p.h);g.restore();}
 draw(now){
  const g=this.renderer.ctx;this.renderer.resize(1.5);g.setTransform(1.5,0,0,1.5,0,0);g.clearRect(0,0,600,760);g.fillStyle=this.renderer.background;g.fillRect(0,0,600,760);
  const camera=this.canvas.clientWidth<450?1.4:1;g.translate(300,362);g.scale(camera,camera);g.translate(-300,-362);
  const parts=this.visibleParts(),time=this.reduced.matches?0:(now-this.begun)/1000,traits=cloudTraits(this.answers);
  // One compatible eye, briefly visible between back and front layers. The
  // source is the actual future eye, never an invented facial configuration.
  const glimpse=traits.stage>=3&&time%11>5.2&&time%11<7.1&&!this.reduced.matches;
  parts.forEach((p,i)=>{
   const pos=this.placement(p,i,now);this.stamp(g,p,pos,pos.size/Math.max(p.w,p.h));
   if(glimpse&&i===Math.floor(parts.length*.66)&&this.eyes.length){const eye=this.eyes[traits.expressive?this.eyes.length-1:0],pulse=Math.sin((time%11-5.2)/1.9*Math.PI);this.stamp(g,eye,{x:traits.expressive?338:300,y:330-12*pulse,angle:Math.sin(time)*.04},pulse*.93);}
  });
 }
 setVisible(visible){this.visible=visible;this.run();}
 run(){cancelAnimationFrame(this.raf);if(!this.active||!this.visible||this.reduced.matches||document.hidden)return;let last=0;const frame=now=>{if(!this.active)return;if(now-last>32){this.draw(now);last=now;}this.raf=requestAnimationFrame(frame);};this.raf=requestAnimationFrame(frame);}
 stop(){this.active=false;cancelAnimationFrame(this.raf);if(this.resolveReveal)this.cancelled=true;this.resolveReveal?.();this.resolveReveal=null;}
 async reveal(scene){
  const now=performance.now(),positions=new Map(this.visibleParts().map((p,i)=>[p.id,this.placement(p,i,now)]));this.stop();this.canvas.dataset.formation='assembling';
  if(this.reduced.matches||document.hidden){this.canvas.dataset.formation='complete';this.view.visible=true;this.view.update(scene,{immediate:true});return;}
  const baked=this.bake(scene),all=[...baked.parts,...baked.eyes,...baked.lines],g=this.renderer.ctx;this.renderer.resize(1.5);
  this.cancelled=false;await new Promise(resolve=>{this.resolveReveal=resolve;const frame=time=>{
   const elapsed=(time-now)/2100;g.setTransform(1.5,0,0,1.5,0,0);g.clearRect(0,0,600,760);g.fillStyle=this.renderer.background;g.fillRect(0,0,600,760);
   const camera=mix(this.canvas.clientWidth<450?1.4:1,1,smooth(elapsed));g.translate(300,362);g.scale(camera,camera);g.translate(-300,-362);
   all.forEach((p,i)=>{const random=rng(hash(p.id)),delay=p.kind==='eye'?.40:random()*.19,t=smooth((elapsed-delay)/(.98-delay)),from=positions.get(p.id)??{x:300+(random()-.5)*120,y:360+(random()-.5)*90,angle:(random()-.5)*.5,size:0};const startScale=from.size/Math.max(p.w,p.h),s=mix(startScale,1,t);const lift=Math.sin(t*Math.PI)*(p.kind==='eye'?8:18);
    this.stamp(g,p,{x:mix(from.x,p.cx,t),y:mix(from.y,p.cy,t)-lift,angle:mix(from.angle,0,t)},s);
   });
   if(elapsed<1&&!this.reduced.matches&&!document.hidden)this.raf=requestAnimationFrame(frame);else resolve();
  };this.raf=requestAnimationFrame(frame);});
  this.resolveReveal=null;if(this.cancelled)return;this.canvas.dataset.formation='complete';this.view.visible=true;this.view.update(scene,{immediate:true});
 }
}
