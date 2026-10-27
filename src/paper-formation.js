// Presentation only. The generator and saved scene snapshots remain untouched.
// Anidoodle's seeded composition / bake-once, composite-on-input approach.
import {rng} from './anidoodle-kit.js';
import {tornContour} from './paper-library.js';
import {paintQuestionPaper} from './question-papers.js';
import {vortexPose,stirAt,shredContour,incomingPaperPose} from './paper-vortex.js';
import {centeredFormationCamera,formationStartCamera,interpolateArrivalCamera,installArrivalCanvas,restoreArrivalCanvas} from './arrival-camera.js';
import {withMonsterMouth} from './monster-mouths.js';
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const hash=s=>[...s].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
const center=p=>p.reduce((c,q)=>[c[0]+q[0]/p.length,c[1]+q[1]/p.length],[0,0]);
const path=(g,ps)=>{g.beginPath();g.moveTo(...ps[0]);for(const p of ps.slice(1))g.lineTo(...p);g.closePath();};

export function cloudTraits(answers={}){
 const base={typography:78,grid:70,color:64,shape:60,texture:86}[answers.principle]??70;
 const count=Math.round((base+(answers.organization==='experiment'?12:answers.organization==='order'?-4:0)+(answers.gaze==='expression'?10:answers.gaze==='clarity'?-4:0))*(answers.density==='rich'?1.65:answers.density==='minimal'?.58:1));
 return {language:answers.principle??'shape',ordered:answers.organization==='order',expressive:answers.gaze==='expression',count:Math.max(38,Math.min(132,count))+(answers.attitude==='playful'?9:answers.attitude==='precise'?-3:0),playful:answers.attitude==='playful',stage:Object.keys(answers).filter(k=>['principle','organization','gaze','density','attitude'].includes(k)).length};
}
export function cloudPlacement(id,index,total,answers={},seconds=0){
 return vortexPose(id,index,total,cloudTraits(answers),seconds);
}

export class PaperFormation{
 constructor(view){
  this.view=view;this.renderer=view.renderer;this.canvas=this.renderer.canvas;this.factory=this.renderer.factory;this.active=false;this.visible=true;this.raf=0;this.parts=[];this.answers={};this.retained=new Map();this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
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
  restoreArrivalCanvas(this.renderer);
  const key=JSON.stringify(answers);if(this.active&&key===this.answerKey)return;this.answerKey=key;
  const now=performance.now();this.previous=new Map(this.visibleParts().map((p,i)=>[p.id,this.placement(p,i,now)]));this.changed=now;
  this.scene=scene;this.answers={...answers};
  for(const [key,value] of Object.entries(answers))if(['principle','organization','gaze','density','attitude'].includes(key)&&this.retained.get(key)?.value!==value){const image=this.factory(600,360);paintQuestionPaper(image,value);this.retained.set(key,{value,image,w:200,h:120,at:now});}
  for(const key of this.retained.keys())if(!answers[key]&&!key.startsWith('route:'))this.retained.delete(key);
  if(!Object.keys(answers).length&&!this.active)this.retained.clear();
  const baked=this.bake(scene);this.parts=baked.parts;this.eyes=baked.eyes;this.lines=baked.lines;
  // Keep anatomical draw order for assembly, seeded order for a stable paper cloud.
  this.cloudParts=this.parts.filter(p=>!p.id.includes('backing')&&!p.id.includes('mask')&&!/hand|claw|mouth|teeth|tooth/.test(p.id)&&!scene.shapes.find(s=>s.id===p.id)?.opening).sort((a,b)=>hash(a.id)-hash(b.id));
  // Fracture actual printed paper into independent scraps. These are cloud-only
  // sprites: assembly still uses the untouched full creature pieces above.
  const source=this.cloudParts.slice();this.cloudParts=Array.from({length:144},(_,i)=>{
   const p=source[i%source.length];if(!p)return null;
   if(i<source.length)return p;
   const sw=p.image.width*(i%3===0?.84:.62),sh=p.image.height*(i%4===0?.32:.78),sx=(i%2)*(p.image.width-sw),sy=(i%3)/2*(p.image.height-sh),image=this.factory(Math.ceil(sw),Math.ceil(sh)),g=image.getContext('2d');path(g,tornContour(shredContour(i).map(([x,y])=>[2+x*(sw-4),2+y*(sh-4)]),i,1.5));g.clip();g.drawImage(p.image,sx,sy,sw,sh,0,0,sw,sh);
   return {...p,id:`${p.id}~scrap-${i}`,image,w:sw/2,h:sh/2};
  }).filter(Boolean);
  // Whole anatomical scraps remain recognizable between the smaller shreds.
  const limbs=scene.rulesVersion>=7&&!answers.organization?[]:this.parts.filter(p=>/hand|claw|foot|leg|arm/.test(p.id)&&!p.id.includes('backing')).slice(0,10).map(p=>({...p,kind:'limb'}));
  const faces=[...(scene.rulesVersion>=7&&!answers.gaze?[]:this.eyes.slice(0,3)),...(scene.rulesVersion>=7&&!answers.attitude?[]:this.parts.filter(p=>/mouth/.test(p.id)).slice(0,1).map(p=>({...p,kind:'mouth'})))];
  [...limbs,...faces].forEach((p,i)=>this.cloudParts.splice(Math.min(this.cloudParts.length,4+i*5),0,p));
  if(!this.active){this.view.stop();this.view.start=0;this.view.visible=false;this.active=true;this.begun=now;}
  this.canvas.dataset.formation=JSON.stringify(cloudTraits(answers));this.draw(now);this.run();
 }
 visibleParts(){return (this.cloudParts??[]).slice(0,cloudTraits(this.answers).count);}
 placement(p,i,now){
  const stir=this.reduced.matches?{energy:0,turn:0}:stirAt(this.impulse,now),seconds=this.reduced.matches?0:(now-(this.begun??now))/1000,target=vortexPose(p.id,i,this.visibleParts().length,cloudTraits(this.answers),seconds+stir.turn,stir.energy,p.kind),from=this.previous?.get(p.id),raw=this.reduced.matches?1:Math.min(1,(now-this.changed)/1150),t=smooth(raw);
  const pos=from?Object.fromEntries(Object.entries(target).map(([k,v])=>[k,mix(from[k]??v,v,t)])):{...target,x:mix(300,target.x,t),y:mix(362,target.y,t),size:target.size*t};
  // A deliberate press / unfold, distinct from idle drift; no particle burst.
  const press=Math.sin(raw*Math.PI)*Math.sin(raw*Math.PI*2)*.24;
  pos.x=300+(pos.x-300)*(1+press);pos.y=362+(pos.y-362)*(1-press*.8);pos.angle+=Math.sin(raw*Math.PI)*(i%2?1:-1)*.44;pos.size*=1+Math.sin(raw*Math.PI)*(i%3===0?.50:-.13);return pos;
 }
 stamp(g,p,pos,scale){g.save();g.translate(pos.x,pos.y);g.rotate(pos.angle??0);g.scale(scale*(pos.fold??1),scale);g.globalAlpha*=pos.alpha??1;g.drawImage(p.image,-p.w/2,-p.h/2,p.w,p.h);g.restore();}
 stir(input={}){if(!this.active||this.reduced.matches)return;this.impulse={at:performance.now(),energy:Math.max(.12,Math.min(1,input.energy??.3)),spin:input.spin??1};this.draw(this.impulse.at);}
 keepRoute(value){const key='route:'+value;if(this.retained.has(key))return;const image=this.factory(600,360);paintQuestionPaper(image,value);this.retained.set(key,{value,image,w:200,h:120,at:performance.now()});if(this.reduced.matches)this.draw(performance.now());}
 camera(){return this.canvas.dataset.paperWorkbench==='true'?Math.min(1.05,this.canvas.clientHeight/Math.max(1,this.canvas.clientWidth)*1.3):this.canvas.clientWidth<450?1.4:1.05;}
 draw(now){
  const g=this.renderer.ctx;this.renderer.resize(1.5);g.setTransform(1.5,0,0,1.5,0,0);g.clearRect(0,0,600,760);g.fillStyle=this.renderer.background;g.fillRect(0,0,600,760);
  const camera=this.camera();g.translate(300,362);g.scale(camera,camera);g.translate(-300,-362);
  const parts=this.visibleParts(),time=this.reduced.matches?0:(now-this.begun)/1000,traits=cloudTraits(this.answers);
  // The actual choices remain legible in the cloud; new paper sweeps behind it.
  const materials=[...this.retained.values()];
  const stir=this.reduced.matches?{energy:0,turn:0}:stirAt(this.impulse,now),materialFrames=[];
  materials.forEach((p,i)=>{const elapsed=this.reduced.matches?2:(now-p.at)/1000;
   const target=vortexPose(`retained:${p.value}`,i*3+1,parts.length,traits,time+stir.turn,stir.energy,'material'),pos=this.reduced.matches?target:incomingPaperPose(target,elapsed);
   materialFrames.push({p,i:-1,pos});
  });
  // One compatible eye, briefly visible between back and front layers. The
  // source is the actual future eye, never an invented facial configuration.
  const glimpse=(this.scene.rulesVersion<7||!!this.answers.gaze)&&traits.stage>=1&&time%9>3.8&&time%9<6.0&&!this.reduced.matches;
  [...materialFrames,...parts.map((p,i)=>({p,i,pos:this.placement(p,i,now)}))].sort((a,b)=>a.pos.depth-b.pos.depth).forEach(({p,i,pos})=>{
   this.stamp(g,p,pos,pos.size/Math.max(p.w,p.h));
   if(glimpse&&i===Math.floor(parts.length*.66)&&this.eyes.length){const eye=this.eyes[traits.expressive?this.eyes.length-1:0],pulse=Math.sin((time%9-3.8)/2.2*Math.PI);this.stamp(g,eye,{x:traits.expressive?338:300,y:330-12*pulse,angle:Math.sin(time)*.04},pulse*.93);}
  });
  if(!this.reduced.matches&&traits.stage>=2&&time%14>9&&time%14<11){const hand=this.parts.find(p=>/hand|claw/.test(p.id));if(hand){const t=(time%14-9)/2,pulse=Math.sin(t*Math.PI);this.stamp(g,hand,{x:440+Math.sin(t*5)*9,y:340-pulse*38,angle:-.4+Math.sin(t*10)*.14},pulse*.8);}}
 }
 setVisible(visible){this.visible=visible;this.run();}
 run(){cancelAnimationFrame(this.raf);if(!this.active||!this.visible||this.reduced.matches||document.hidden)return;let last=0;const frame=now=>{if(!this.active)return;if(now-last>32){this.draw(now);last=now;}this.raf=requestAnimationFrame(frame);};this.raf=requestAnimationFrame(frame);}
 stop(){this.active=false;cancelAnimationFrame(this.raf);if(this.resolveReveal)this.cancelled=true;this.resolveReveal?.();this.resolveReveal=null;}
 async reveal(scene){
  const now=performance.now(),departing=this.visibleParts().map((p,i)=>({p,pos:this.placement(p,i,now)})),positions=new Map(departing.map(({p,pos})=>[p.id,pos]));this.stop();this.canvas.dataset.formation='assembling';
  if(this.reduced.matches||document.hidden){this.canvas.dataset.formation='complete';this.view.visible=true;this.view.update(scene,{immediate:true});return;}
  const startCamera=formationStartCamera(this.canvas.getBoundingClientRect(),this.camera()),endCamera=centeredFormationCamera(scene,innerWidth,innerHeight),dpr=Math.min(1.5,globalThis.devicePixelRatio??1);installArrivalCanvas(this.renderer,endCamera);
  const baked=this.bake(withMonsterMouth(scene)),all=[...baked.parts,...baked.eyes,...baked.lines],g=this.renderer.ctx;
  this.canvas.width=Math.round(innerWidth*dpr);this.canvas.height=Math.round(innerHeight*dpr);
  this.cancelled=false;await new Promise(resolve=>{this.resolveReveal=resolve;const frame=time=>{
   const elapsed=(time-now)/3200;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,this.canvas.width,this.canvas.height);g.fillStyle=this.renderer.background;g.fillRect(0,0,this.canvas.width,this.canvas.height);
   const c=interpolateArrivalCamera(startCamera,endCamera,elapsed);g.setTransform(c.scale*dpr,0,0,c.scale*dpr,c.x*dpr,c.y*dpr);
   if(elapsed<.78){const t=Math.min(1,elapsed/.78);departing.filter(({p})=>p.id.includes('~scrap')).forEach(({p,pos},i)=>{const a=elapsed*7+(i%2?.1:-.1),dx=pos.x-300,dy=pos.y-362;this.stamp(g,p,{x:300+(dx*Math.cos(a)-dy*Math.sin(a))*(1-t),y:362+(dx*Math.sin(a)+dy*Math.cos(a))*(1-t),angle:pos.angle+elapsed*5,alpha:1-t},pos.size/Math.max(p.w,p.h)*(1-t*.85));});}
   all.forEach((p,i)=>{const random=rng(hash(p.id)),delay=p.kind==='eye'?.56:.14+random()*.22,t=smooth((elapsed-delay)/(.98-delay)),from=positions.get(p.id)??{x:300+(random()-.5)*270,y:360+(random()-.5)*230,angle:(random()-.5)*2,size:25};const startScale=from.size/Math.max(p.w,p.h),s=mix(startScale,1,t);const lift=Math.sin(t*Math.PI)*(p.kind==='eye'?8:18),curl=Math.sin(t*Math.PI)*(1-t);
    this.stamp(g,p,{x:mix(from.x,p.cx,t)+Math.cos(i*1.8)*curl*85,y:mix(from.y,p.cy,t)-lift+Math.sin(i*1.8)*curl*55,angle:mix(from.angle,0,t)+curl*1.1},s);
   });
   if(elapsed<1&&!this.reduced.matches&&!document.hidden)this.raf=requestAnimationFrame(frame);else resolve();
  };this.raf=requestAnimationFrame(frame);});
  this.resolveReveal=null;if(this.cancelled){restoreArrivalCanvas(this.renderer);return;}this.canvas.dataset.formation='complete';this.renderer.viewport={width:innerWidth,height:innerHeight,dpr,matrix:[endCamera.scale,0,0,endCamera.scale,endCamera.x,endCamera.y]};this.view.visible=true;this.view.update(scene,{immediate:true});
 }
 releaseArrival(){restoreArrivalCanvas(this.renderer);}
}
