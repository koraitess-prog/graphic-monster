import {engravingTile} from './engraving.js';
import {paperAffine,paperPoint,paperBasis} from './paper-motion.js';
import {paint,C,PAPER} from './illustrations.js';
import {ellipse,resample,pointInside} from './dna.js';
import {idlePose,motionProfile} from './motion.js';

const lerp=(a,b,t)=>a+(b-a)*t;
const colorMix=(a,b,t)=>{const aa=a.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)),bb=b.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16));return '#'+aa.map((v,i)=>Math.round(lerp(v,bb[i],t)).toString(16).padStart(2,'0')).join('');};
function polyPath(points,close=true){const p=new Path2D();points.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));if(close)p.closePath();return p;}
const styleOf=s=>({color:s.color,texture:s.texture??.7,flow:s.flow??1.35,soft:!!s.soft,...(s.print?{print:true}:{}),...(s.printRevision>=2?{printRevision:s.printRevision,grainPhase:s.grainPhase??0,grainAngle:s.grainAngle??0}:{}),...(s.paperPattern?{paperPattern:s.paperPattern}:{})});
const styleKey=s=>`${s.color}/${s.texture}/${s.flow}/${s.soft??false}${s.print?'/cut-paper':''}${s.printRevision>=2?'/r'+s.printRevision+'/'+s.grainPhase+'/'+s.grainAngle:''}${s.paperPattern?'/'+s.paperPattern:''}`;
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
   const rest=ap.map((p,i)=>[lerp(p[0],bp[i][0],t),lerp(p[1],bp[i][1],t)]);
   let points=rest,material={};
   if(a.paperPiece||b.paperPiece){
    const phase=id.split('').reduce((s,c)=>s+c.charCodeAt(0),0),envelope=Math.sin(Math.PI*t)**2;
    const center=rest.reduce((s,p)=>[s[0]+p[0]/rest.length,s[1]+p[1]/rest.length],[0,0]),angle=Math.sin(phase)*.11*envelope,c=Math.cos(angle),s=Math.sin(angle);
    const offsetX=Math.sin(phase*3)*5*envelope,offsetY=Math.cos(phase)*7*envelope;
    points=rest.map(([x,y])=>[center[0]+(x-center[0])*c-(y-center[1])*s+offsetX,center[1]+(x-center[0])*s+(y-center[1])*c+offsetY]);
    const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),dx=Math.max(0,35-Math.min(...xs))-Math.max(0,Math.max(...xs)-560),dy=Math.max(0,60-Math.min(...ys))-Math.max(0,Math.max(...ys)-690);
    points=points.map(([x,y])=>[x+dx,y+dy]);
    const box=p=>{const x=p.map(q=>q[0]),y=p.map(q=>q[1]);return [Math.min(...x),Math.min(...y),Math.max(.001,Math.max(...x)-Math.min(...x)),Math.max(.001,Math.max(...y)-Math.min(...y))];};
    const originPoints=a.paperTextureOrigin??(a.points.every(p=>Math.hypot(p[0]-a.points[0][0],p[1]-a.points[0][1])<.01)?b.points:a.points),origin=box(originPoints),target=box(rest);
    const u=target[2]/origin[2],v=target[3]/origin[3],tx=target[0]-origin[0]*u,ty=target[1]-origin[1]*v;
    const matrix=[c*u,s*u,-s*v,c*v,center[0]+c*(tx-center[0])-s*(ty-center[1])+offsetX+dx,center[1]+s*(tx-center[0])+c*(ty-center[1])+offsetY+dy];
    material={paperRestPoints:rest,paperMaterial:null,paperTextureTransform:matrix,paperTextureOrigin:originPoints};
   }
   return{...b,id,points,...material,width:lerp(a.width??2,b.width??2,t),furry:lerp(Number(a.furry)||0,Number(b.furry)||0,t),alpha:lerp(a.alpha??1,b.alpha??1,t),styles:styleBlend(a.styles??[{style:styleOf(a),weight:1}],b.styles??[{style:styleOf(b),weight:1}],t)};
 });
}
export function interpolateScene(from,to,t){
 if(t<=0)return from;if(t>=1)return to;
 const a=new Map(from.eyes.map(e=>[e.id,e])),b=new Map(to.eyes.map(e=>[e.id,e]));
 let eyes=[...new Set([...a.keys(),...b.keys()])].map(id=>{const aa=a.get(id)??{...b.get(id),x:b.get(id).anchor?.[0]??b.get(id).x,y:b.get(id).anchor?.[1]??b.get(id).y,r:0,ry:0},bb=b.get(id)??{...a.get(id),r:0,ry:0};const e={...bb,id,stalk:aa.stalk||bb.stalk};for(const k of ['x','y','r','ry','angle'])e[k]=lerp(aa[k]??0,bb[k]??0,t);if(!a.has(id)){const grow=Math.max(0,(t-.4)/.6);e.r=bb.r*grow*grow;e.ry=bb.ry*grow*grow;}if(!b.has(id)){const shrink=Math.max(0,1-t/.6);e.r=aa.r*shrink*shrink;e.ry=aa.ry*shrink*shrink;}e.gaze=aa.gaze.map((v,i)=>lerp(v,bb.gaze[i],t));e.rim=colorMix(aa.rim,bb.rim,t);e.iris=colorMix(aa.iris,bb.iris,t);return e;});
 const shapes=interpolateParts(from.shapes,to.shapes,t);
 if(to.rulesVersion>=6){
  const body=shapes.find(s=>s.id==='body').points;
  // Sockets make room before new eyes open. No eyes cross one another or
  // float off the face while a clear stare becomes several smaller stares.
  eyes=eyes.filter(e=>e.r>.05).map(e=>({...e}));
  for(const e of eyes)if(!e.stalk){let attempts=0;while(attempts++<24&&!ellipse(e.x,e.y,e.r+6,e.ry+6,0,32).every(p=>pointInside(p,body))){e.r*=.82;e.ry*=.82;}}
  eyes=eyes.filter(e=>e.r>.1&&(e.stalk||ellipse(e.x,e.y,e.r+6,e.ry+6,0,32).every(p=>pointInside(p,body))));
  for(let i=0;i<eyes.length;i++)for(let j=i+1;j<eyes.length;j++){
   const p=eyes[i],q=eyes[j],distance=Math.hypot(p.x-q.x,p.y-q.y);
   if(distance<12.01){(p.r<q.r?p:q).r=0;continue;}
   const factor=Math.min(1,(distance-12.01)/(p.r+q.r));if(factor<1){p.r*=factor;p.ry*=factor;q.r*=factor;q.ry*=factor;}
  }
  eyes=eyes.filter(e=>e.r>.1);
 }
 return{...to,shapes,lines:interpolateParts(from.lines,to.lines,t),eyes,tooth:lerp(from.tooth,to.tooth,t)};
}
// One small overshoot is enough to suggest physical weight. The art itself is pure;
// the browser host supplies time. An interrupted transition begins at its current pose.
export function springProgress(t){if(t>=1)return 1;if(t<=0)return 0;const z=.88,w=11,d=Math.sqrt(1-z*z);return Math.min(1,1-Math.exp(-z*w*t)*(Math.cos(w*d*t)+z/d*Math.sin(w*d*t)));}

/** A baked gouache swatch is shared across moving silhouettes. This is Anidoodle's
 * bake-once/composite-on-input approach, adapted to continuously deforming anatomy.
 * Shapes are geometrically interpolated; textures never flash to a random new seed.
 */
export class MonsterRenderer{
 constructor(canvas,{scale=2,canvasFactory,background=PAPER}={}){
   this.background=background;
   this.canvas=canvas;this.scale=scale;canvas.width=600*scale;canvas.height=760*scale;
   this.ctx=canvas.getContext('2d');this.factory=canvasFactory??((w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;});this.patterns=new Map();this.paperRasters=new WeakMap();
 }
 resize(scale){if(this.scale===scale)return;this.scale=scale;this.canvas.width=600*scale;this.canvas.height=760*scale;}
 pattern(style){
   if(this.paintVersion!==paintVersion){this.patterns.clear();this.paintVersion=paintVersion;}
   const key=styleKey(style);if(this.patterns.has(key))return this.patterns.get(key);
   if(style.printRevision>=2){
    const {tile,transform}=engravingTile(this.factory,style),pattern=this.ctx.createPattern(tile,'repeat');pattern.setTransform(transform);this.patterns.set(key,pattern);
    if(this.patterns.size>(style.printRevision>=3?64:28))this.patterns.delete(this.patterns.keys().next().value);
    return pattern;
   }
   if(style.print){
    const tile=this.factory(768,768),g=tile.getContext('2d');g.scale(2,2);g.fillStyle=style.color;g.fillRect(0,0,384,384);
    let n=981723;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
    const dark=style.color==='#151a1b';g.fillStyle=dark?'#e8ddba':'#151a1b';
    // Ink fails in clustered islands. Slender carved gouges follow a diagonal grain.
    for(let i=0;i<(style.texture>.5?5400:2400);i++){
     const x=random()*384,y=random()*384,patch=Math.sin(x/27+y/58)*Math.cos(y/41);
     if(patch<.12&&i%5)continue;
     g.globalAlpha=dark?.11:(.25+random()*.63);const w=.3+random()*2.1;
     g.fillRect(x,y,w,w*(.4+random()*1.5));
    }
    g.strokeStyle=dark?'#e8ddba':'#151a1b';g.lineCap='butt';
    for(let i=0;i<270;i++){
     const x=random()*384,y=random()*384,len=3+random()**3*61;
     g.globalAlpha=dark?.10:.25+random()*.5;g.lineWidth=.25+random()*1.1;
     g.beginPath();g.moveTo(x,y);g.lineTo(x+len*.32,y-len);g.stroke();
    }
    // Broad, broken brayer streaks create real areas of ink loss, not uniform noise.
    for(let i=0;i<430;i++){
     const x=random()*384,y=random()*384,cluster=Math.sin(x/39+y/83)+Math.cos(y/49);
     if(cluster<.6)continue;
     const length=7+random()*58,width=.8+random()*5;
     g.globalAlpha=dark?.08:.45+random()*.4;
     g.beginPath();g.moveTo(x,y);g.lineTo(x+width,y-3);g.lineTo(x+length*.29+width*.24,y-length);g.lineTo(x+length*.28-width*.3,y-length*.88);g.closePath();g.fill();
    }
    const pattern=this.ctx.createPattern(tile,'repeat');pattern.setTransform({a:.5,b:0,c:0,d:.5,e:0,f:0});this.patterns.set(key,pattern);return pattern;
   }
   if(bakedPaint.has(key)){const p=this.ctx.createPattern(bakedPaint.get(key),'repeat');p.setTransform({a:.5,b:0,c:0,d:.5,e:0,f:0});this.patterns.set(key,p);return p;}
   const size=384,c=this.factory(size*2,size*2),ctx=c.getContext('2d');ctx.scale(2,2);
   // Solid pigment underneath prevents a transparent seam at the repeating tile edge.
   if(!style.soft){ctx.fillStyle=style.color;ctx.fillRect(0,0,size,size);}
   paint(ctx,{points:[[0,0],[size,0],[size,size],[0,size]],color:style.color,seed:1042,texture:style.texture,flow:style.flow,soft:style.soft},style.texture>.5?.9:.35);
   const pattern=this.ctx.createPattern(c,'repeat');
   // Native Skia and Chromium both accept a 2D transform dictionary.
   pattern.setTransform({a:.5,b:0,c:0,d:.5,e:0,f:0});this.patterns.set(key,pattern);return pattern;
 }
 paperRaster(points,style){
   let entries=this.paperRasters.get(points);if(!entries){entries=new Map();this.paperRasters.set(points,entries);}
   const key=styleKey(style);if(entries.has(key))return entries.get(key);
   const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.floor(Math.min(...xs))-2,y=Math.floor(Math.min(...ys))-2,w=Math.max(1,Math.ceil(Math.max(...xs))-x+2),h=Math.max(1,Math.ceil(Math.max(...ys))-y+2);
   const image=this.factory(w,h),g=image.getContext('2d');g.translate(-x,-y);g.fillStyle=this.pattern(style);g.fillRect(x,y,w,h);
   const raster={image,x,y};entries.set(key,raster);return raster;
 }
 compositePaper(points,part){
   const layers=part.styles??[{style:styleOf(part),weight:1}];let cumulative=0;
   for(const layer of layers){cumulative+=layer.weight;this.ctx.globalAlpha=layer.weight/cumulative;const r=this.paperRaster(points,layer.style);this.ctx.drawImage(r.image,r.x,r.y);}this.ctx.globalAlpha=1;
 }
 fill(points,part){
   const ctx=this.ctx,p=polyPath(points);if(part.opening){ctx.fillStyle=this.background;ctx.fill(p);return;}
   if(part.paperTextureTransform){
    ctx.save();ctx.clip(p);ctx.transform(...part.paperTextureTransform);
    this.compositePaper(part.paperTextureOrigin,part);ctx.restore();return;
   }
   if(part.paperRestPoints){
    const rest=part.paperRestPoints,matrix=paperAffine(rest,part.points,paperBasis(rest)),material={...part,paperRestPoints:null};
    if(part.printRevision>=3){
     ctx.save();ctx.clip(p);
     if(matrix&&rest.every((q,i)=>{const v=paperPoint(matrix,q);return Math.hypot(v[0]-part.points[i][0],v[1]-part.points[i][1])<.01;})){
      ctx.transform(...matrix);this.compositePaper(rest,part);
     }else if(part.paperMaterial){
      const mesh=part.paperMaterial;
      for(const triangle of mesh.triangles){const m=paperAffine(mesh.rest,mesh.points,triangle);if(!m)continue;
       const tri=triangle.map(i=>mesh.rest[i]),center=tri.reduce((s,q)=>[s[0]+q[0]/3,s[1]+q[1]/3],[0,0]),expanded=tri.map(q=>{const dx=q[0]-center[0],dy=q[1]-center[1],len=Math.hypot(dx,dy)||1;return [q[0]+dx/len*.4,q[1]+dy/len*.4];});
       ctx.save();ctx.transform(...m);ctx.clip(polyPath(expanded));this.compositePaper(rest,part);ctx.restore();
      }
     }
     ctx.restore();return;
    }
    if(matrix&&rest.every((q,i)=>{const v=paperPoint(matrix,q);return Math.hypot(v[0]-part.points[i][0],v[1]-part.points[i][1])<.01;})){
     ctx.save();ctx.transform(...matrix);this.fill(rest,material);ctx.restore();return;
    }
    // A bending arm is a small paper mesh. Overlap internal seams slightly,
    // while the outer silhouette clips the original crisp cut edge.
    ctx.save();ctx.clip(p);
    const mesh=part.paperMaterial;if(!mesh){ctx.restore();return;}
    for(const triangle of mesh.triangles){
     const m=paperAffine(mesh.rest,mesh.points,triangle);if(!m)continue;
     const tri=triangle.map(i=>mesh.rest[i]),center=tri.reduce((s,q)=>[s[0]+q[0]/3,s[1]+q[1]/3],[0,0]);
     const expanded=tri.map(q=>{const dx=q[0]-center[0],dy=q[1]-center[1],len=Math.hypot(dx,dy)||1;return [q[0]+dx/len*.45,q[1]+dy/len*.45];});
     ctx.save();ctx.transform(...m);ctx.clip(polyPath(rest));this.fill(expanded,material);ctx.restore();
    }
    ctx.restore();return;
   }
   const styles=part.styles??[{style:styleOf(part),weight:1}];let cumulative=0;
   for(const layer of styles){cumulative+=layer.weight;ctx.globalAlpha=layer.weight/cumulative;ctx.fillStyle=this.pattern(layer.style);ctx.fill(p);}ctx.globalAlpha=1;
 }
 draw(scene){
   const ctx=this.ctx;ctx.setTransform(this.scale,0,0,this.scale,0,0);ctx.clearRect(0,0,600,760);ctx.fillStyle=this.background;ctx.fillRect(0,0,600,760);ctx.lineCap='round';ctx.lineJoin='round';
   // A few understated graphite strokes ground the feet in the same paper.
   ctx.strokeStyle='#d4d0c4';ctx.lineWidth=.4;ctx.globalAlpha=.4;
   for(let i=0;i<(scene.stage===0?0:22);i++){const x=176+i*10,y=668+Math.sin(i*4.3)*3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+10+Math.sin(i*2.2)*7,y+.2);ctx.stroke();}ctx.globalAlpha=1;
   const body=scene.shapes.find(s=>s.id==='body'),bodyPath=polyPath(body.points);
   for(const s of scene.shapes){
     if(s.carrier)continue;
     ctx.save();if(s.clip==='body')ctx.clip(bodyPath);if(s.pattern)this.patternClearance(scene);
     if(s.clipParent){const parent=scene.shapes.find(p=>p.id===s.clipParent);if(parent){const center=parent.points.reduce((c,p)=>[c[0]+p[0]/parent.points.length,c[1]+p[1]/parent.points.length],[0,0]),k=parent.paperEnvelopeScale??1;ctx.clip(polyPath(parent.points.map(([x,y])=>[center[0]+(x-center[0])*k,center[1]+(y-center[1])*k])));}else{ctx.restore();continue;}}
     const edge=s.points.map(([x,y],i)=>[x+Math.sin(i*1.8+s.seed)*.4,y+Math.cos(i*2.3+s.seed)*.4]);this.fill(edge,s);
     if(s.paperSeam){ctx.strokeStyle='#151a1b';ctx.globalAlpha=.65;ctx.lineWidth=s.paperSeam;ctx.stroke(polyPath(edge));ctx.globalAlpha=1;}
     if(!s.print&&(s.body||s.furry)){ctx.strokeStyle=s.color;ctx.lineWidth=.55;ctx.globalAlpha=.5;
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
   if(e.print){
    const w=e.r*(e.eyeWidth??1.48),h=e.ry*(e.eyeHeight??1);
    const points=e.orbital?ellipse(0,0,w,h,0,48):e.rectangular?[[-w,-h],[w,-h*.7],[w,h],[-w,h*.7]]:[[-w,0],[-w*.4,-h],[w*.35,-h*.8],[w,h*.1],[w*.2,h],[-w*.5,h*.65]];
    if(e.printRevision>=2){ctx.fillStyle='#e8ddba';ctx.fill(polyPath(points));}
    else this.fill(points,{color:'#e8ddba',texture:.35,flow:1,print:true});
    if(e.orbitalIris){ctx.fillStyle=e.orbitalIris;ctx.fill(polyPath(ellipse(e.gaze[0]*.5,e.gaze[1]*.5,w*.57,h*.64,0,48)));}
    ctx.fillStyle='#151a1b';ctx.fill(polyPath([[-1.8+e.gaze[0],-h*.94],[2.2+e.gaze[0],-h*.15],[1.5+e.gaze[0],h*.96],[-1.4+e.gaze[0],h*.15]]));
    ctx.restore();return;
   }
   const ring=polyPath(ellipse(0,0,e.r+5,e.ry+5));ctx.fillStyle=e.rim;ctx.fill(ring);
   const whites=ellipse(0,0,e.r,e.ry);this.fill(whites,{color:C.cream,texture:.3,flow:1.35});
   ctx.strokeStyle=C.ink;ctx.lineWidth=.65;ctx.globalAlpha=.35;ctx.stroke(polyPath(ellipse(.5,-.5,e.r+3,e.ry+3)));ctx.globalAlpha=1;
   const [gx,gy]=e.gaze,ir=e.r*(e.irisScale??.53),pr=e.r*(e.pupilScale??(e.detail?.27:.32));
   if(e.detail){ctx.fillStyle=e.iris;ctx.fill(polyPath(ellipse(gx,gy,ir,ir*1.03)));ctx.lineWidth=.6;for(let j=0;j<40;j++){const a=j/40*Math.PI*2;ctx.strokeStyle=j%3?C.ink:C.cream;ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(gx+Math.cos(a)*ir*.63,gy+Math.sin(a)*ir*.63);ctx.lineTo(gx+Math.cos(a)*ir*.94,gy+Math.sin(a)*ir*.94);ctx.stroke();}ctx.globalAlpha=1;}
   ctx.fillStyle=C.ink;ctx.fill(polyPath(ellipse(gx,gy,pr,pr*1.05)));if(e.r>25&&!e.lid){ctx.fillStyle=C.cream;ctx.beginPath();ctx.arc(gx-pr*.3,gy-pr*.35,pr*.15,0,Math.PI*2);ctx.fill();}
   if(e.lid){
    ctx.save();ctx.clip(ring);const cut=-e.ry+e.ry*e.lid*2;
    ctx.fillStyle=e.skin;ctx.beginPath();ctx.moveTo(-e.r-8,-e.ry-8);ctx.lineTo(e.r+8,-e.ry-8);ctx.lineTo(e.r+8,cut+5);ctx.quadraticCurveTo(0,cut-6,-e.r-8,cut-9);ctx.closePath();ctx.fill();
    ctx.strokeStyle=C.ink;ctx.globalAlpha=.58;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-e.r-7,cut-9);ctx.quadraticCurveTo(0,cut-6,e.r+7,cut+5);ctx.stroke();ctx.restore();
   }
   ctx.restore();
 }
}

export class CreatureView{
 constructor(canvas,scene){
   this.renderer=new MonsterRenderer(canvas,{background:"#202426"});this.scene=scene;this.from=scene;this.target=scene;this.start=0;this.duration=1100;this.raf=0;this.timer=0;this.event=0;this.idle=false;this.visible=true;
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
 play(event=0){if(this.motion.matches||!this.visible||document.hidden)return;this.stop();this.start=0;this.scene=this.target;this.event=event;this.animateIdle();}
 animateIdle(){
   if(!this.visible||this.motion.matches||document.hidden||this.start)return;
   this.idle=true;const begun=performance.now(),profile=motionProfile(this.target,this.event),samples=[];this.renderer.resize(1);let last=0;
   const frame=now=>{
     const t=Math.min(1,(now-begun)/profile.duration);
     if(now-last>=32||t===1){const started=performance.now();this.scene=idlePose(this.target,t,this.event);this.renderer.draw(this.scene);samples.push(performance.now()-started);last=now;}
     if(t<1)this.raf=requestAnimationFrame(frame);else{samples.sort((a,b)=>a-b);this.renderer.canvas.setAttribute('data-idle-frames',String(samples.length));this.renderer.canvas.setAttribute('data-idle-p95',String(samples[Math.floor(samples.length*.95)]?.toFixed(2)));this.idle=false;this.event++;this.scene=this.target;this.renderer.resize(2);this.renderer.draw(this.scene);this.schedule();}
   };this.raf=requestAnimationFrame(frame);
 }
 finish(){this.stop();this.start=0;this.scene=this.target;this.renderer.resize(2);this.renderer.draw(this.target);this.renderer.canvas.setAttribute('aria-busy','false');this.schedule();}
 destroy(){this.stop();this.motion.removeEventListener('change',this.onMedia);document.removeEventListener('visibilitychange',this.onVisibility);}
}
