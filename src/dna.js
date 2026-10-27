import {expandedCollageScene} from './expanded-collage.js';
import {paperDNAScene} from './paper-dna.js';
import {answerDNAScene} from './answer-dna.js';
import {collageScene} from './collage.js';
import {grotesqueScene} from './grotesque.js';
import {sample,limb,rng} from './anidoodle-kit.js';
import {C,PAPER} from './illustrations.js';
import {addPatterns} from './patterns.js';

export const QUESTIONS = [
 {key:'principle',title:'What catches your eye?',chapter:'Paper language',hint:'Choose the paper vocabulary your creature is built from.',effect:'Paper construction',options:[['typography','Typography','Letters become anatomy.'],['grid','Grid','Find a rhythm in repetition.'],['color','Color','Think in painted masses.'],['shape','Shape','Follow an unexpected contour.'],['texture','Pattern','Let the marks make the form.']]},
 {key:'organization',title:'How would you arrange it?',chapter:'A sense of order',hint:'A measured rhythm, or a little room for the unexpected?',effect:'Proportions & organization',options:[['order','Order','Balance. Align. Repeat.'],['experiment','Experiment','Shift the balance. Make a discovery.']]},
 {key:'gaze',title:'What deserves attention?',chapter:'Ways of seeing',hint:'One clear focus, or several unexpected points of view?',effect:'Eyes & gaze',options:[['clarity','Clarity','Make the focal point unmistakable.'],['expression','Expression','There is more than one way to see.']]},
 {key:'density',title:'When is it enough?',chapter:'The surface of things',hint:'Give the paper room to breathe, or build a world of little details.',effect:'Surface density',options:[['minimal','Minimal','A few marks, carefully placed.'],['rich','Rich','Layers worth looking closer at.']]},
 {key:'attitude',title:'How should it behave?',chapter:'The finishing gesture',hint:'A deliberate line, or a gesture with a mind of its own?',effect:'Limbs, appendages & expression',options:[['precise','Precise','Quiet gestures. Intentional details.'],['playful','Playful','A crooked smile. A generous wave.']]}
];
export const DEFAULTS={principle:'shape',organization:'order',gaze:'clarity',density:'minimal',attitude:'precise'};
export function normalizeAnswers(answers={}){
 const result={};for(const q of QUESTIONS){const value=answers[q.key]??DEFAULTS[q.key];if(!q.options.some(o=>o[0]===value))throw new Error(`Invalid ${q.key}`);result[q.key]=value;}return result;
}
export function encodeDNA(answers){const a=normalizeAnswers(answers);return QUESTIONS.map(q=>q.options.findIndex(o=>o[0]===a[q.key])).join('');}
export function decodeDNA(code){if(!/^[0-4][01]{4}$/.test(code))throw new Error('Invalid DNA code');return Object.fromEntries(QUESTIONS.map((q,i)=>[q.key,q.options[Number(code[i])][0]]));}
export const combinations=()=>QUESTIONS.reduce((rows,q)=>rows.flatMap(a=>q.options.map(o=>({...a,[q.key]:o[0]}))),[{}]);
const FAMILIES={
 typography:{name:'Serif',base:C.violet,accent:C.coral,secondary:C.ochre,outline:[[300,170],[362,167],[395,194],[397,275],[399,350],[410,437],[420,529],[378,551],[340,523],[295,553],[223,550],[171,525],[145,466],[151,408],[187,373],[201,320],[195,262],[207,213],[251,184]],opening:[278,464,40,47]},
 grid:{name:'Rill',base:C.teal,accent:C.ochre,secondary:C.coral,outline:[[250,181],[350,181],[393,197],[414,237],[412,329],[382,363],[400,391],[420,432],[417,507],[385,544],[310,551],[230,548],[189,529],[176,479],[180,421],[207,382],[186,350],[180,290],[183,231],[208,193]]},
 color:{name:'Ochra',base:C.coral,accent:C.violet,secondary:C.ochre,outline:[[278,167],[337,181],[364,210],[405,215],[429,248],[428,296],[447,335],[440,380],[418,413],[431,458],[416,513],[369,544],[307,550],[258,568],[200,550],[165,516],[158,461],[137,425],[145,376],[173,343],[160,291],[170,245],[199,214],[222,182]]},
 shape:{name:'Oddo',base:C.teal,accent:C.coral,secondary:C.ochre,outline:[[290,166],[349,169],[390,194],[412,236],[406,294],[374,329],[348,359],[350,388],[379,423],[389,472],[365,521],[316,550],[248,560],[192,541],[161,510],[158,467],[184,428],[218,402],[235,374],[217,342],[196,301],[190,252],[212,204],[248,176]],opening:[287,473,30,28]},
 texture:{name:'Murmur',base:C.violet,accent:C.ochre,secondary:C.teal,outline:[[285,165],[309,181],[338,175],[352,207],[381,216],[381,248],[409,272],[400,302],[429,335],[415,367],[440,403],[424,433],[435,474],[411,499],[398,535],[364,538],[337,565],[305,552],[270,573],[239,554],[205,562],[185,532],[154,520],[155,488],[137,461],[149,430],[135,396],[153,367],[149,332],[168,309],[165,274],[187,255],[196,222],[226,209],[247,178]]}
};
export const ellipse=(x,y,rx,ry,angle=0,n=48)=>Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2,r=1+Math.sin(i*2.7)*.016;return[x+Math.cos(a)*rx*r*Math.cos(angle)-Math.sin(a)*ry*r*Math.sin(angle),y+Math.cos(a)*rx*r*Math.sin(angle)+Math.sin(a)*ry*r*Math.cos(angle)];});
export function resample(points,count=96){
 const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
 const total=lengths.at(-1);if(total<.00001)return Array.from({length:count},()=>[...points[0]]);
 let j=1;return Array.from({length:count},(_,i)=>{const distance=total*i/(count-1);while(j<lengths.length-1&&lengths[j]<distance)j++;const t=(distance-lengths[j-1])/(lengths[j]-lengths[j-1]||1);return[0,1].map(d=>points[j-1][d]+(points[j][d]-points[j-1][d])*t);});
}
export function pointInside([x,y],poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}

/** Main generator. Stable part IDs are shared across all 80 anatomies, enabling
 * correspondence-based morphs instead of image swaps. The authored family contour
 * is only the starting point: the other four systems independently change it. */
export function generateLegacyMonster(input={}){
 const answers=normalizeAnswers(input),code=encodeDNA(answers),family=FAMILIES[answers.principle];
 const experimental=answers.organization==='experiment',expressive=answers.gaze==='expression',rich=answers.density==='rich',playful=answers.attitude==='playful';
 const shapes=[],lines=[],eyes=[],attachments=[];
 const elevated=!expressive&&answers.principle==='shape';
 const warp=([x,y])=>{const p=experimental?[300+(x-300)*.87+(340-y)*.12+Math.max(0,y-370)*.13,330+(y-360)*.85]:[x,y];if(elevated)p[1]+=75*Math.max(0,(550-y)/384);return p;};
 const S=(id,points,color,opts={})=>{const contour=resample(opts.raw?points:sample(points,true,8));const part={id,points:opts.world?contour:contour.map(warp),color,texture:rich?1:.3,flow:1.35,seed:1042+id.split('').reduce((a,c)=>a+c.charCodeAt(0),0),...opts};shapes.push(part);return part;};
 const L=(id,points,color=C.ink,width=2,opts={})=>lines.push({id,points:resample(sample(opts.world?points:points.map(warp),false,8),32),color,width,seed:1042,...opts});
 const tube=(id,points,radii,color,opts={})=>S(id,limb(points,radii),color,{raw:true,...opts});
 const O=(id,x,y,rx,ry,color,opts={})=>S(id,ellipse(x,y,rx,ry,opts.angle||0),color,{raw:true,...opts});
 const hand=(id,x,y,angle,size=.8)=>{const f=(u,v)=>[x+(u*Math.cos(angle)-v*Math.sin(angle))*size,y+(u*Math.sin(angle)+v*Math.cos(angle))*size];S(id,[f(-8,7),f(-10,-4),f(-8,-19),f(-4,-23),f(-1,-18),f(0,-4),f(3,-28),f(7,-31),f(10,-26),f(9,-5),f(17,-27),f(22,-28),f(23,-22),f(17,1),f(28,-13),f(33,-13),f(34,-8),f(16,14),f(5,18)],C.ink,{world:true,anchor:[x,y]});};
 const foot=(id,x,y,dir)=>{S(id,[[x-dir*9,y-18],[x+dir*9,y-19],[x+dir*14,y-6],[x+dir*34,y-9],[x+dir*49,y-1],[x+dir*48,y+7],[x+dir*4,y+9],[x-dir*11,y+5]],experimental?family.secondary:C.ink,{world:true});for(let j=0;j<3;j++)L(`${id}-toe-${j}`,[[x+dir*(22+j*8),y-5],[x+dir*(27+j*8),y+5]],C.cream,1.3,{world:true,alpha:.6});};
 // Limbs are built from centerlines attached to the *warped* torso, with feet planted.
 const hipL=warp([228,516]),hipR=warp([350,518]);
 const feet=experimental?[[187,655],[390,655]]:[[217,655],[363,655]];
 tube('leg-left',[hipL,[hipL[0]-8,560],feet[0]],[13,8,7],family.base,{world:true});
 tube('leg-right',[hipR,[hipR[0]+(playful?32:3),570],feet[1]],[14,9,7],family.base,{world:true});
 foot('foot-left',...feet[0],-1);foot('foot-right',...feet[1],1);
 if(playful){tube('sock-left',[[feet[0][0]+7,611],feet[0]],[8,8],family.secondary,{world:true});for(let j=0;j<3;j++)L(`sock-stripe-${j}`,[[feet[0][0]-2,622+j*9],[feet[0][0]+12,624+j*9]],C.ink,2,{world:true,alpha:.7});}
 const shoulderL=warp([250,400]),shoulderR=warp([335,400]);
 const palmL=playful?[111,experimental?440:464]:[136,475],palmR=playful?[477,experimental?262:288]:[460,475];
 tube('arm-left',[shoulderL,[126,414],palmL],[10,7,4],C.ink,{world:true});hand('hand-left',...palmL,Math.PI-.2,.72);
 tube('arm-right',[shoulderR,[451,playful?371:422],palmR],[10,7,4],C.ink,{world:true});hand('hand-right',...palmR,playful?.18:Math.PI+.2,.8);
 attachments.push({id:'leg-left',root:hipL},{id:'leg-right',root:hipR},{id:'arm-left',root:shoulderL},{id:'arm-right',root:shoulderR});
 // Curved feelers and fins are actual secondary anatomy, not surface decoration.
 if(playful){
   const rootA=warp([265,205]),rootB=warp([334,202]);
   tube('feeler-left',[rootA,[rootA[0]-19,rootA[1]-45],[rootA[0]-43,rootA[1]-76]],[6,4,2],C.ink,{world:true,anchor:rootA});
   O('feeler-tip-left',rootA[0]-44,rootA[1]-78,14,19,family.accent,{world:true,anchor:rootA,angle:-.5});
   tube('feeler-right',[rootB,[rootB[0]+19,rootB[1]-50],[rootB[0]+54,rootB[1]-67]],[6,4,2],C.ink,{world:true,anchor:rootB});
   O('feeler-tip-right',rootB[0]+57,rootB[1]-69,20,12,family.secondary,{world:true,anchor:rootB,angle:-.4});
   for(let i=0;i<3;i++){const y=333+i*38;S(`fin-${i}`,[[260,y-4],[145,y-31],[111-i*4,y-27],[102-i*3,y-15],[117,y+1],[145,y+9],[260,y+12]],i%2?family.accent:family.secondary,{anchor:warp([260,y])});}
 }
 let outline=sample(family.outline,true,10);
 const body=S('body',outline,family.base,{raw:true,body:true,furry:answers.principle==='texture'?(rich?1:.45):.12});
 const bodyClip=body.points;
 // Pigment fields are clipped to the main body, so they can never float outside it.
 const patch=(id,pts,color,opts={})=>S(id,pts,color,{clip:'body',...opts});
 if(answers.principle==='color'){
   patch('color-mass-left',[[130,245],[239,180],[289,207],[299,310],[247,387],[146,405]],family.secondary);
   patch('color-mass-right',[[362,189],[435,230],[457,334],[391,394],[314,339],[326,264]],family.accent);
   patch('color-mass-bottom',[[223,419],[293,383],[396,425],[420,511],[339,569],[208,562],[173,503]],C.teal);
 }else if(answers.principle==='grid'){
   for(let i=0;i<3;i++){const x=205+i*64;patch(`module-${i}`,[[x,410],[x+43,410],[x+47,431],[x+45,493],[x+22,508],[x-1,490]],i%2?family.accent:'#b4b4a0',{soft:true});}
   for(let i=0;i<2;i++)L(`grid-seam-${i}`,[[190,405+i*57],[297,408+i*57],[405,405+i*57]],C.tealDark,1.4,{clip:'body',alpha:.65});
 }else{
   patch('belly-wash',[[239,416],[275,402],[321,423],[348,485],[328,537],[271,551],[226,520],[219,465]],answers.principle==='texture'?'#b4a7aa':'#b5b7a5',{soft:true});
 }
 // Real counters/apertures remain unpainted paper, with an inner pencil contour.
 if(family.opening){const[x,y,rx,ry]=family.opening;O('counter',x,y,rx,ry,PAPER,{opening:true,texture:0});L('counter-edge',[[x-rx+5,y-13],[x-rx,y+10],[x-rx*.5,y+ry-1],[x+rx*.5,y+ry-3]],family.base,1.8);}

 // Eye layout lives in a reserved face envelope; satellites have explicit clearance.
 let sockets=expressive?(experimental?[[286,277,35],[355,227,19],[230,251,15],[237,329,13],[355,322,20]]:[[300,267,31],[360,232,16],[240,232,16],[240,320,16],[360,320,16]]):[[260,277,30],[337,277,30]];
 const stalk=!expressive&&answers.principle==='shape';
 if(!expressive){if(stalk)sockets=[];else if(['typography','texture'].includes(answers.principle))sockets=[[300,278,44]];else if(answers.principle==='color')sockets=[[264,275,37],[348,264,22]];}
 sockets.forEach(([x,y,r],i)=>{
   const [wx,wy]=warp([x,y]),sx=experimental?.87:1,sy=experimental?.85:1;
   const eye={id:`eye-${i}`,x:wx,y:wy,r:r*sx,ry:r*1.07*sy,angle:0,rim:family.accent,iris:i===0?family.secondary:C.teal,gaze:expressive?[[3,5],[-3,2],[4,-2],[1,-3],[-4,2]][i]:[2,1],detail:i===0||!expressive};
   // Local socket fitting retains the authored eye size and picks the nearest
   // collision-free location inside this exact curved body, with a 1px safety band.
   const fits=e=>eyes.every(other=>Math.hypot(e.x-other.x,e.y-other.y)>=e.r+other.r+13)&&Array.from({length:32},(_,j)=>{const a=j/32*Math.PI*2;return pointInside([e.x+Math.cos(a)*(e.r+7),e.y+Math.sin(a)*(e.ry+7)],bodyClip);}).every(Boolean);
   let fitted=null;
   outer:for(const scale of [1,.94,.88])for(let distance=0;distance<=38;distance+=2)for(let j=0;j<(distance?16:1);j++){
     const angle=j/16*Math.PI*2,e={...eye,x:wx+Math.cos(angle)*distance,y:wy+Math.sin(angle)*distance,r:eye.r*scale,ry:eye.ry*scale};
     if(fits(e)){fitted=e;break outer;}
   }
   if(!fitted)throw new Error(`Unable to fit socket ${i} in ${code}`);
   eyes.push(fitted);
 });
 if(stalk){
  const root=warp([300,226]),tip=[root[0]+(experimental?28:0),116];
  const part=tube('eye-stalk',[root,[root[0]-8,166],tip],[27,17,22],family.base,{world:true,anchor:root,stalk:true});
  // Insert behind the torso: a substantial painted neck emerges from its crown.
  shapes.splice(shapes.indexOf(part),1);shapes.splice(shapes.indexOf(body),0,part);
  attachments.push({id:'eye-stalk',root});
  eyes.push({id:'eye-0',x:tip[0],y:tip[1],r:39,ry:42,angle:0,rim:family.accent,iris:family.secondary,gaze:[2,1],detail:true,stalk:true,anchor:root});
  for(let i=shapes.length-1;i>=0;i--)if(shapes[i].id.startsWith('feeler'))shapes.splice(i,1);
 }
 const pattern=addPatterns({answers,family,S,L,O,warp,outline,body:bodyClip,eyes,shapes,lines,holes:shapes.filter(s=>s.opening).map(s=>s.points)});
 // Expression uses a smile and teeth; precision uses a restrained, drawn mouth.
 if(playful){S('mouth',[[260,365],[286,373],[319,367],[337,356],[326,392],[301,402],[276,392]],C.ink);S('tooth-left',[[275,372],[286,374],[284,384],[278,382]],C.cream);S('tooth-right',[[316,367],[327,361],[324,376],[317,379]],C.cream);}else L('smile',[[282,367],[290,378],[303,379],[315,366]],C.ink,4);
 O('cheek-left',247,answers.principle==='shape'?348:369,13,7,C.pink,{clip:'body'});O('cheek-right',answers.principle==='shape'?327:351,answers.principle==='shape'?347:366,14,8,family.accent,{clip:'body'});
 if(rich){for(let i=0;i<3;i++)L(`brow-${i}`,[[249+i*8,202],[246+i*8,192-i*2]],C.ink,1.1);}
 return{shapes,lines,eyes,attachments,body:bodyClip,answers,code,seed:parseInt(code,10)+1042,tooth:rich?.9:.35,family:answers.principle,pattern,stage:5};
}

export function describeMonster(input){
 const a=normalizeAnswers(input),code=encodeDNA(a),index=parseInt(code.slice(1),2),suffix=['Nook','Wisp','Loop','Wink','Lilt','Moss','Fable','Wobble','Quill','Bramble','Drift','Riff','Pip','Tangle','Whorl','Jumble'][index];
 const construction={typography:'letterform curves and open counters',grid:'modular rhythms and repeated forms',color:'overlapping, harmonious color masses',shape:'a curled silhouette and unexpected openings',texture:'a tufted outline shaped by repeated marks'}[a.principle];
 const description=`Built from ${construction}, with ${a.organization==='order'?'balanced proportions':'off-center proportions and long, wandering legs'}. ${a.gaze==='clarity'?'A clear, paired gaze':"Five differently voiced eyes"}, ${a.density==='minimal'?'quiet surfaces':'layered pencil marks'}, and ${a.attitude==='precise'?'deliberate gestures':'a generous wave and a crooked grin'} make this creature yours.`;
 return{name:`${FAMILIES[a.principle].name} ${suffix}`,description,code,traits:QUESTIONS.map(q=>({key:q.key,label:q.options.find(o=>o[0]===a[q.key])[1]}))};
}

export function validateScene(scene){
 const errors=[],body=scene.shapes.find(s=>s.id==='body').points;
 for(const s of [...scene.shapes,...scene.lines])for(const [x,y]of s.points)if(!Number.isFinite(x)||!Number.isFinite(y)||x<35||x>560||y<60||y>690){errors.push(`${s.id}: out of artboard`);break;}
 for(const e of scene.eyes){if(e.stalk)continue;for(let i=0;i<32;i++){const a=i/32*Math.PI*2;if(!pointInside([e.x+Math.cos(a)*(e.r+6),e.y+Math.sin(a)*(e.ry+6)],body)){errors.push(`${e.id}: outside face`);break;}}}
 for(let i=0;i<scene.eyes.length;i++)for(let j=i+1;j<scene.eyes.length;j++){const a=scene.eyes[i],b=scene.eyes[j];if(Math.hypot(a.x-b.x,a.y-b.y)<a.r+b.r+12)errors.push(`${a.id}/${b.id}: eye collision`);}
 for(const attachment of scene.attachments)if(!pointInside(attachment.root,body))errors.push(`${attachment.id}: disconnected root`);
 return [...new Set(errors)];
}

export function generateMonster(input={},version=3){if(version>=7)return answerDNAScene(input);if(version>=6)return paperDNAScene(input);if(version>=5)return expandedCollageScene(input);if(version>=4)return collageScene(input);const scene=generateLegacyMonster(input);return version>=3?grotesqueScene(scene):scene;}
