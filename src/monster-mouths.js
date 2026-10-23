// Presentation geometry only: the original scene and archive are never edited.
import {pointInside} from './dna.js';
import {rng} from './anidoodle-kit.js';
import {tornContour} from './paper-library.js';
import {expressionPerformance} from './monster-expression.js';
export const MOUTH_LIBRARY=Object.freeze({
 toothy:{teeth:7,depth:.34},slit:{teeth:0,depth:.06},crooked:{teeth:3,depth:.15},
 orbital:{teeth:4,depth:.34},split:{teeth:9,depth:.12},jagged:{teeth:11,depth:.27},
 beak:{teeth:0,depth:.14},folded:{teeth:5,depth:.22},sideways:{teeth:6,depth:.2},cavity:{teeth:2,depth:.4}
});
const families={
 crane:{kinds:['slit','beak','slit'],w:47,h:17},color:{kinds:['orbital','toothy','crooked'],w:86,h:44},
 grid:{kinds:['split','jagged','slit'],w:126,h:32},accordion:{kinds:['folded','toothy','cavity'],w:106,h:40},
 typography:{kinds:['jagged','crooked','toothy'],w:67,h:28},shape:{kinds:['beak','crooked','cavity'],w:60,h:27},
 texture:{kinds:['jagged','slit','orbital'],w:94,h:36},knot:{kinds:['sideways','cavity','folded'],w:60,h:25}
};
const cache=new WeakMap(),neutral=new WeakMap();
const local=(x,y,cx,cy,a)=>[cx+x*Math.cos(a)-y*Math.sin(a),cy+x*Math.sin(a)+y*Math.cos(a)];
export function mouthPointFits(scene,point,parent){
 if(!pointInside(point,parent.points))return false;
 if(scene.shapes.some(s=>s.opening&&pointInside(point,s.points)))return false;
 for(const e of scene.eyes){const w=e.r*(e.print?(e.eyeWidth??1.48):1)+7,h=e.ry*(e.print?(e.eyeHeight??1):1)+8;if(((point[0]-e.x)/w)**2+((point[1]-e.y)/h)**2<1.12)return false;}
 return true;
}
export function mouthFor(scene){
 if(cache.has(scene))return cache.get(scene);
 if(scene.rulesVersion<6||scene.stage!==5||!families[scene.anatomy])return null;
 const profile=families[scene.anatomy],seed=scene.seed>>>0,variant=(seed+(scene.answers.gaze==='expression'?1:0)+(scene.answers.attitude==='playful'?1:0))%profile.kinds.length,kind=profile.kinds[variant];
 const plates=scene.shapes.filter(s=>s.id==='body'||/^eye-head-\d+$/.test(s.id)),eyes=scene.eyes;
 const eyeX=eyes.reduce((n,e)=>n+e.x/eyes.length,0),eyeY=eyes.reduce((n,e)=>n+(e.y+e.ry)/eyes.length,0),angle=scene.anatomy==='knot'?Math.PI/2:scene.answers.organization==='experiment'?-.055:0;
 let best;
 for(const scale of [1,.78,.59,.43,.30]){
  const h=profile.h*scale,w=(kind==='orbital'?Math.min(profile.w,profile.h*1.2):kind==='cavity'?Math.min(profile.w,profile.h*1.8):profile.w)*scale;
  for(const parent of plates){const xs=parent.points.map(p=>p[0]),ys=parent.points.map(p=>p[1]);
   for(let y=Math.min(...ys)+6;y<Math.max(...ys)-5;y+=7)for(let x=Math.min(...xs)+6;x<Math.max(...xs)-5;x+=7){
    if(!mouthPointFits(scene,[x,y],parent))continue;
    let fit=true;for(const u of [-1,-.5,0,.5,1])for(const v of [-1,0,1])if(!mouthPointFits(scene,local(u*(w/2+4),v*(h/2+4),x,y,angle),parent)){fit=false;break;}
    if(!fit)continue;
    // Prefer below the gaze and near an existing paper join, rather than the
    // middle of an empty torso. A vertical jaw suits Knot's hollow body rim.
    const targetY=eyeY+18+h*.3,targetX=scene.anatomy==='knot'?385:eyeX;
    const score=Math.hypot((x-targetX)*.7,y-targetY)+(y<eyeY?35:0)+(1-scale)*60;
    if(!best||score<best.score)best={x,y,w,h,angle,parentId:parent.id,score,kind,seed};
   }
  }
  if(best&&scale>=.59)break;
 }
 if(best){const surface=[...scene.shapes].reverse().find(s=>s.paperPiece&&s.color!=='#151a1b'&&!s.opening&&pointInside([best.x,best.y],s.points));const parent=scene.shapes.find(s=>s.id===best.parentId);
  best.style={color:surface?.color??parent.color,print:true,printRevision:3,texture:.45,grainPhase:surface?.grainPhase??0,grainAngle:surface?.grainAngle??0,...(surface?.paperPattern?{paperPattern:surface.paperPattern}:{})};best.tongue=seed%3===0;best.tongueColor=scene.shapes.find(p=>p.color!==best.style.color&&!['#151a1b','#e8ddba'].includes(p.color)&&!p.opening)?.color??best.style.color;
 }
 cache.set(scene,best??null);return best??null;
}

export function mouthParts(scene,spec,cue={},map=(p)=>p){
 if(!spec)return [];
 const {x,y,w,h,angle,kind,seed}=spec,definition=MOUTH_LIBRARY[kind],random=rng(seed+881),open=Math.max(0,Math.min(1,cue.open??0)),grin=cue.grin??0,snarl=cue.snarl??0;
 const half=w/2,depth=h*(definition.depth+(1-definition.depth)*open)*(kind==='orbital'||kind==='cavity'?.56:.43)*(1-(cue.suspicion??0)*.32),lean=Math.max(-h*.31/w,Math.min(h*.31/w,(kind==='crooked'?.04:kind==='sideways'?-.06:.015)+grin*.20));
 const top=[],bottom=[];
 for(let i=0;i<=10;i++){
  const u=i/10*2-1,round=kind==='folded'?Math.min(1,(1-Math.abs(u))*3):Math.pow(Math.max(0,1-u*u),kind==='orbital'||kind==='cavity'?.53:kind==='split'?.3:.82),edge=(Math.sin(i*2.9+seed)*.28),slant=u*w*lean;
  const hinge=kind==='beak'?Math.abs(u)*depth*.38:0;
  const upper=kind==='orbital'?.82:.44+snarl*.16,lower=kind==='orbital'?.88:kind==='cavity'?.85:.76+open*.18;
  top.push([u*half,kind==='beak'?-(u+1)*depth*.4:-round*depth*upper+slant+edge-hinge-grin*h*.14*Math.max(0,u)]);
  bottom.push([u*half+open*round*w*.025,kind==='beak'?(u+1)*depth*.55:round*depth*lower+slant+edge+hinge+grin*h*.18*u*(1-Math.abs(u))]);
 }
 const outline=[...top,...bottom.slice().reverse()],shell=[...top.map(([u,v])=>[u,v-2.2]),...bottom.slice().reverse().map(([u,v])=>[u,v+3])];
 const convert=points=>tornContour(points,seed,.40).map(([u,v])=>local(u,v,x,y,angle));
 const part=(id,points,color,extra={})=>{const rest=convert(points);return {id:'expression-'+id,points:rest.map(q=>map(q,spec.parentId)),paperRestPoints:rest,color,texture:.42,print:true,printRevision:3,grainPhase:seed%2,grainAngle:0,seed,...extra};};
 const pieces=[part('mouth-rim',shell,spec.style.color,{...spec.style,clipParent:spec.parentId}),part('mouth-void',outline,'#101313',{clipParent:spec.parentId})];
 const visible=definition.teeth; // Fixed jaw teeth; the opening reveals them by clipping.
 for(let i=0;i<visible;i++){
  const u=-.84+(i+.3+random()*.4)/visible*1.68,round=Math.pow(Math.max(0,1-u*u),.82),px=u*half,py=-round*depth*(kind==='orbital'?.82:.44+snarl*.16)+u*w*lean;
  const length=Math.min(h*.31,(3+random()*5)),width=Math.min(w/(visible+2)*.65,6);
  pieces.push(part('tooth-'+i,[[px-width/2,py-1],[px+width/2,py-.5],[px+width*(random()-.5),py+length]],'#e8ddba',{clipParent:'expression-mouth-void'}));
 }
 if(spec.tongue&&open>.48){const a=open-.48,p0=[-half*.22,depth*.64],points=[[p0[0]-w*.12,p0[1]+2],[p0[0]-w*.11,p0[1]-h*a*.6],[p0[0]+w*.03,p0[1]-h*a*.9],[p0[0]+w*.13,p0[1]-h*a*.5],[p0[0]+w*.17,p0[1]+3]];pieces.push(part('tongue',points,spec.tongueColor,{clipParent:'expression-mouth-void'}));}
 // The lower lip is an independent folded strip, with a lifted paper edge.
 const lower=[...bottom,...bottom.slice().reverse().map(([u,v])=>[u+open*.5,v+(kind==='folded'?3:1.8)])];pieces.push(part('jaw-fold',lower,spec.style.color,{...spec.style,clipParent:spec.parentId}));
 return pieces;
}
export function withMonsterMouth(scene){
 if(scene.mouthDrawn)return scene;
 if(!scene.faceFrame&&neutral.has(scene))return neutral.get(scene);
 const source=scene.faceFrame?.source??scene,spec=mouthFor(source);if(!spec)return scene;
 const c=scene.faceFrame?.cue??expressionPerformance('breathe',0,source.seed),map=scene.faceFrame?.mapPoint??(p=>p),parts=mouthParts(source,spec,c,map);
 if(!scene.faceFrame&&neutral.has(scene))return neutral.get(scene);
 const eyes=scene.eyes.map((e,i)=>({...e,ry:e.ry*(1+(c.wide??0)*.14),blink:Math.max(e.blink??0,(c.lid??0)*.95),gaze:[e.gaze[0]+(c.suspicion??0)*(i%2?-2.1:1.8)-(c.snarl??0)*e.gaze[0]*.55,e.gaze[1]-(c.snarl??0)*.6]}));
 const result={...scene,shapes:[...scene.shapes,...parts],eyes,mouthDrawn:true,mouthPresentation:{kind:spec.kind,source:spec,cue:c}};if(!scene.faceFrame)neutral.set(scene,result);return result;
}
