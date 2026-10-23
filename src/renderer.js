import {paint,C,PAPER} from './illustrations.js';
import {ellipse,resample} from './dna.js';
import {idlePose,motionProfile} from './motion.js';

const lerp=(a,b,t)=>a+(b-a)*t;
const colorMix=(a,b,t)=>{const aa=a.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)),bb=b.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16));return '#'+aa.map((v,i)=>Math.round(lerp(v,bb[i],t)).toString(16).padStart(2,'0')).join('');};
function polyPath(points,close=true){const p=new Path2D();points.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));if(close)p.closePath();return p;}
const styleOf=s=>({color:s.color,texture:s.texture??.7,flow:s.flow??1.35,soft:!!s.soft});
const styleKey=s=>`${s.color}/${s.texture}/${s.flow}/${s.soft??false}`;
const bakedPaint=new Map();let paintVersion=0;
export function registerPaintTiles(entries){for(const [key,image] of entries)bakedPaint.set(key,image);paintVersion++;}
function styleBlend(a,b,t){
 const all=new Map();for(const [parts,weight]of [[a,1-t],[b,t]])for(const p of parts){const key=styleKey(p.style),old=all.get(key);all.set(key,{style:p.style,weight:(old?.weight??0)+p.weight*weight});}
 return [...all.values()].filter(p=>p.weight>.001);
}
function collapse(part){const center=part.anchor??part.points.reduce((a,p)=>[a[0]+p[0]/part.points.length,a[1]+p[1]/part.points.length],[0,0]);return{...part,points:part.points.map(()=>center),furry:0,width:0};}
function interpolateParts(from,to,t){
 const aa=new Map(from.map(s=>[s.id,s])),bb=new Map(to.map(s=>[s.id,s]));
 // Destination paint order is canonical. Exiting parts retain their old neighborhood.
 const ids=[...bb.keys()];for(const id of aa.keys())if(!bb.has(id)){const oldIndex=from.findIndex(s=>s.id===id),next=from.slice(oldIndex+1).find(s=>bb.has(s.id));ids.splice(next?ids.indexOf(next.id):ids.length,0,id);}
 return ids.map(id=>{
   const a=aa.get(id)??collapse(bb.get(id)),b=bb.get(id)??collapse(aa.get(id));
   const count=Math.max(a.points.length,b.points.length),ap=a.points.length===count?a.points:resample(a.points,count),bp=b.points.length===count?b.points:resample(b.points,count);
   return{...b,id,points:ap.map((p,i)=>[lerp(p[0],bp[i][0],t),lerp(p[1],bp[i][1],t)]),width:lerp(a.width??2,b.width??2,t),furry:lerp(Number(a.furry)||0,Number(b.furry)||0,t),alpha:lerp(a.alpha??1,b.alpha??1,t),styles:styleBlend(a.styles??[{style:styleOf(a),weight:1}],b.styles??[{style:styleOf(b),weight:1}],t)};
 });
}
export function interpolateScene(from,to,t){
 if(t<=0)return from;if(t>=1)return to;
 const a=new Map(from.eyes.map(e=>[e.id,e])),b=new Map(to.eyes.map(e=>[e.id,e]));
 const eyes=[...new Set([...a.keys(),...b.keys()])].map(id=>{const aa=a.get(id)??{...b.get(id),x:b.get(id).anchor?.[0]??b.get(id).x,y:b.get(id).anchor?.[1]??b.get(id).y,r:0,ry:0},bb=b.get(id)??{...a.get(id),r:0,ry:0};const e={...bb,id,stalk:aa.stalk||bb.stalk};for(const k of ['x','y','r','ry','angle'])e[k]=lerp(aa[k]??0,bb[k]??0,t);if(!a.has(id)){const grow=Math.max(0,(t-.4)/.6);e.r=bb.r*grow*grow;e.ry=bb.ry*grow*grow;}if(!b.has(id)){const shrink=Math.max(0,1-t/.6);e.r=aa.r*shrink*shrink;e.ry=aa.ry*shrink*shrink;}e.gaze=aa.gaze.map((v,i)=>lerp(v,bb.gaze[i],t));e.rim=colorMix(aa.rim,bb.rim,t);e.iris=colorMix(aa.iris,bb.iris,t);return e;});
 return{...to,shapes:interpolateParts(from.shapes,to.shapes,t),lines:interpolateParts(from.lines,to.lines,t),eyes,tooth:lerp(from.tooth,to.tooth,t)};
}
// One small overshoot is enough to suggest physical weight. The art itself is pure;
// the browser host supplies time. An interrupted transition begins at its current pose.
export function springProgress(t){if(t>=1)return 1;if(t<=0)return 0;const z=.88,w=11,d=Math.sqrt(1-z*z);return Math.min(1,1-Math.exp(-z*w*t)*(Math.cos(w*d*t)+z/d*Math.sin(w*d*t)));}

/** A baked gouache swatch is shared across moving silhouettes. This is Anidoodle's
 * bake-once/composite-on-input approach, adapted to continuously deforming anatomy.
 * Shapes are geometrically interpolated; textures never flash to a random new seed.
 */
export class MonsterRenderer{
 constructor(canvas,{scale=2,canvasFactory}={}){
   this.canvas=canvas;this.scale=scale;canvas.width=600*scale;canvas.height=760*scale;
   this.ctx=canvas.getContext('2d');this.factory=canvasFactory??((w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;});this.patterns=new Map();
 }
 resize(scale){if(this.scale===scale)return;this.scale=scale;this.canvas.width=600*scale;this.canvas.height=760*scale;}
 pattern(style){
   if(this.paintVersion!==paintVersion){this.patterns.clear();this.paintVersion=paintVersion;}
   const key=styleKey(style);if(this.patterns.has(key))return this.patterns.get(key);
   if(bakedPaint.has(key)){const p=this.ctx.createPattern(bakedPaint.get(key),'repeat');p.setTransform({a:.5,b:0,c:0,d:.5,e:0,f:0});this.patterns.set(key,p);return p;}
   const size=384,c=this.factory(size*2,size*2),ctx=c.getContext('2d');ctx.scale(2,2);
   // Solid pigment underneath prevents a transparent seam at the repeating tile edge.
   if(!style.soft){ctx.fillStyle=style.color;ctx.fillRect(0,0,size,size);}
   paint(ctx,{points:[[0,0],[size,0],[size,size],[0,size]],color:style.color,seed:1042,texture:style.texture,flow:style.flow,soft:style.soft},style.texture>.5?.9:.35);
   const pattern=this.ctx.createPattern(c,'repeat');
   // Native Skia and Chromium both accept a 2D transform dictionary.
   pattern.setTransform({a:.5,b:0,c:0,d:.5,e:0,f:0});this.patterns.set(key,pattern);return pattern;
 }
 fill(points,part){
   const ctx=this.ctx,p=polyPath(points);if(part.opening){ctx.fillStyle=PAPER;ctx.fill(p);return;}
   const styles=part.styles??[{style:styleOf(part),weight:1}];let cumulative=0;
   for(const layer of styles){cumulative+=layer.weight;ctx.globalAlpha=layer.weight/cumulative;ctx.fillStyle=this.pattern(layer.style);ctx.fill(p);}ctx.globalAlpha=1;
 }
 draw(scene){
   const ctx=this.ctx;ctx.setTransform(this.scale,0,0,this.scale,0,0);ctx.clearRect(0,0,600,760);ctx.fillStyle=PAPER;ctx.fillRect(0,0,600,760);ctx.lineCap='round';ctx.lineJoin='round';
   // A few understated graphite strokes ground the feet in the same paper.
   ctx.strokeStyle='#d4d0c4';ctx.lineWidth=.4;ctx.globalAlpha=.4;
   for(let i=0;i<(scene.stage===0?0:22);i++){const x=176+i*10,y=668+Math.sin(i*4.3)*3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+10+Math.sin(i*2.2)*7,y+.2);ctx.stroke();}ctx.globalAlpha=1;
   const body=scene.shapes.find(s=>s.id==='body'),bodyPath=polyPath(body.points);
   for(const s of scene.shapes){
     ctx.save();if(s.clip==='body')ctx.clip(bodyPath);if(s.pattern)this.patternClearance(scene);
     const edge=s.points.map(([x,y],i)=>[x+Math.sin(i*1.8+s.seed)*.4,y+Math.cos(i*2.3+s.seed)*.4]);this.fill(edge,s);
     if(s.body||s.furry){ctx.strokeStyle=s.color;ctx.lineWidth=.55;ctx.globalAlpha=.5;
       for(let i=0;i<s.points.length-1;i+=2){const [x,y]=s.points[i],q=s.points[i+1],dx=q[0]-x,dy=q[1]-y,len=Math.hypot(dx,dy)||1,f=(s.furry??.1)*(4+Math.sin(i*2.31)**2*10);ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+dy/len*f*.7+2,y-dx/len*f*.6+3,x+dy/len*f,y-dx/len*f+4);ctx.stroke();}ctx.globalAlpha=1;
     }
     ctx.restore();
   }
   for(const eye of scene.eyes)this.eye(eye,scene.tooth);
   for(const l of scene.lines){ctx.save();if(l.clip==='body')ctx.clip(bodyPath);if(l.pattern)this.patternClearance(scene);ctx.globalAlpha=l.alpha??1;ctx.strokeStyle=l.color;ctx.lineWidth=l.width;ctx.stroke(polyPath(l.points,false));ctx.globalAlpha=(l.alpha??1)*.22;ctx.lineWidth=.6;ctx.translate(.8,-.6);ctx.stroke(polyPath(l.points,false));ctx.restore();}
 }
 patternClearance(scene){
   const p=new Path2D();p.rect(0,0,600,760);for(const s of scene.shapes.filter(s=>s.opening))p.addPath(polyPath(s.points));
   this.ctx.clip(p,'evenodd');
 }
 eye(e,tooth){
   if(e.r<.05)return;const ctx=this.ctx;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle??0);ctx.scale(1,Math.max(.045,1-(e.blink??0)*.955));
   const ring=polyPath(ellipse(0,0,e.r+5,e.ry+5));ctx.fillStyle=e.rim;ctx.fill(ring);
   const whites=ellipse(0,0,e.r,e.ry);this.fill(whites,{color:C.cream,texture:.3,flow:1.35});
   ctx.strokeStyle=C.ink;ctx.lineWidth=.65;ctx.globalAlpha=.35;ctx.stroke(polyPath(ellipse(.5,-.5,e.r+3,e.ry+3)));ctx.globalAlpha=1;
   const [gx,gy]=e.gaze,ir=e.r*.53,pr=e.r*(e.detail?.27:.32);
   if(e.detail){ctx.fillStyle=e.iris;ctx.fill(polyPath(ellipse(gx,gy,ir,ir*1.03)));ctx.lineWidth=.6;for(let j=0;j<40;j++){const a=j/40*Math.PI*2;ctx.strokeStyle=j%3?C.ink:C.cream;ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(gx+Math.cos(a)*ir*.63,gy+Math.sin(a)*ir*.63);ctx.lineTo(gx+Math.cos(a)*ir*.94,gy+Math.sin(a)*ir*.94);ctx.stroke();}ctx.globalAlpha=1;}
   ctx.fillStyle=C.ink;ctx.fill(polyPath(ellipse(gx,gy,pr,pr*1.05)));if(e.r>25){ctx.fillStyle=C.cream;ctx.beginPath();ctx.arc(gx-pr*.3,gy-pr*.35,pr*.15,0,Math.PI*2);ctx.fill();}ctx.restore();
 }
}

export class CreatureView{
 constructor(canvas,scene){
   this.renderer=new MonsterRenderer(canvas);this.scene=scene;this.from=scene;this.target=scene;this.start=0;this.duration=1100;this.raf=0;this.timer=0;this.event=0;this.idle=false;this.visible=true;
   this.motion=matchMedia('(prefers-reduced-motion: reduce)');
   this.onMedia=()=>this.finish();this.onVisibility=()=>{if(document.hidden)this.finish();else this.schedule();};
   this.motion.addEventListener('change',this.onMedia);
   document.addEventListener('visibilitychange',this.onVisibility);
   this.renderer.draw(scene);this.schedule();
 }
 pose(now=performance.now()){
   if(this.idle)return this.scene;
   if(!this.start)return this.scene;
   return interpolateScene(this.from,this.target,springProgress(Math.min(1,(now-this.start)/this.duration)));
 }
 stop(){cancelAnimationFrame(this.raf);clearTimeout(this.timer);this.idle=false;}
 update(target,{immediate=false}={}){
   const now=performance.now();this.from=this.pose(now);this.stop();this.target=target;this.renderer.canvas.setAttribute('data-stage',String(target.stage));
   if(immediate||this.motion.matches||document.hidden){this.finish();return;}
   this.renderer.resize(1);this.renderer.canvas.setAttribute('aria-busy','true');this.start=now;this.frameTimes=[];
   const frame=time=>{
     const begun=performance.now();this.scene=this.pose(time);this.renderer.draw(this.scene);this.frameTimes.push(performance.now()-begun);
     if(time-this.start<this.duration)this.raf=requestAnimationFrame(frame);
     else{
       const sorted=[...this.frameTimes].sort((a,b)=>a-b);
       this.renderer.canvas.setAttribute('data-motion-frames',String(sorted.length));this.renderer.canvas.setAttribute('data-motion-p95',String(sorted[Math.floor(sorted.length*.95)]?.toFixed(2)));this.finish();
     }
   };this.raf=requestAnimationFrame(frame);
 }
 setVisible(visible){if(this.visible===visible)return;this.visible=visible;if(!visible)this.finish();else this.schedule();}
 greet(delay=0){clearTimeout(this.timer);if(this.visible&&!this.motion.matches&&!document.hidden&&!this.start)this.timer=setTimeout(()=>this.animateIdle(),delay);}
 schedule(){
   clearTimeout(this.timer);if(!this.visible||this.motion.matches||document.hidden||this.start)return;
   this.timer=setTimeout(()=>this.animateIdle(),motionProfile(this.target,this.event).pause);
 }
 animateIdle(){
   if(!this.visible||this.motion.matches||document.hidden||this.start)return;
   this.idle=true;const begun=performance.now(),profile=motionProfile(this.target,this.event);this.renderer.resize(1);let last=0;
   const frame=now=>{
     const t=Math.min(1,(now-begun)/profile.duration);
     if(now-last>=32||t===1){this.scene=idlePose(this.target,t,this.event);this.renderer.draw(this.scene);last=now;}
     if(t<1)this.raf=requestAnimationFrame(frame);else{this.idle=false;this.event++;this.scene=this.target;this.renderer.resize(2);this.renderer.draw(this.scene);this.schedule();}
   };this.raf=requestAnimationFrame(frame);
 }
 finish(){this.stop();this.start=0;this.scene=this.target;this.renderer.resize(2);this.renderer.draw(this.target);this.renderer.canvas.setAttribute('aria-busy','false');this.schedule();}
 destroy(){this.stop();this.motion.removeEventListener('change',this.onMedia);document.removeEventListener('visibilitychange',this.onVisibility);}
}
