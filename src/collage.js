import {normalizeAnswers,encodeDNA,resample,pointInside,ellipse} from './dna.js';
// Authored paper constructions, not transformations of the painted creatures.
const P={red:'#f05226',blue:'#5765c4',green:'#519f7d',yellow:'#d5aa39',bone:'#e8ddba',black:'#151a1b'};
const recipes={
 typography:{color:P.red,accent:P.bone,outline:[[251,94],[305,173],[380,204],[321,241],[375,303],[328,362],[358,467],[309,538],[254,510],[225,432],[247,366],[208,311],[249,255],[219,190],[197,145]],face:[293,205],hips:[[263,477],[322,478]],arms:[[246,300],[337,300]],holes:[[[233,145],[251,119],[277,147],[262,183],[239,176]],[[256,282],[326,301],[290,346],[251,315]],[[260,378],[324,395],[334,460],[274,434]]]},
 grid:{color:P.blue,accent:P.yellow,outline:[[144,324],[249,274],[366,293],[423,350],[458,424],[399,468],[344,495],[236,483],[166,451],[109,411]],face:[281,417],hips:[[198,450],[374,450]],arms:[[164,400],[409,400]],holes:[[[313,322],[353,324],[397,382],[411,431],[374,442],[349,387]]]},
 color:{color:P.yellow,accent:P.red,outline:[[233,144],[323,171],[352,231],[407,253],[437,334],[401,374],[423,430],[374,505],[282,547],[198,505],[172,428],[209,357],[177,284],[206,228]],face:[287,283],hips:[[234,486],[360,485]],arms:[[212,366],[396,363]],holes:[[[270,386],[319,369],[356,398],[335,465],[283,482],[253,440]]]},
 shape:{color:P.green,accent:P.bone,outline:[[198,92],[225,153],[283,194],[346,210],[430,196],[448,259],[357,285],[321,342],[371,384],[359,469],[393,514],[319,550],[258,517],[244,457],[269,399],[242,349],[260,285],[209,243],[175,194],[174,139]],face:[385,241],hips:[[281,489],[346,489]],arms:[[267,379],[355,391]],holes:[[[281,379],[306,356],[331,383],[309,418]],[[281,452],[313,431],[338,456],[314,481]]]},
 texture:{color:P.blue,accent:P.green,outline:[[203,189],[219,128],[264,179],[304,119],[325,190],[393,173],[374,242],[425,274],[388,323],[435,372],[391,415],[424,471],[367,513],[304,545],[248,518],[178,535],[173,473],[138,431],[165,376],[128,332],[177,286],[147,236]],face:[283,264],hips:[[223,486],[364,484]],arms:[[176,366],[385,363]],holes:[[[242,376],[282,349],[318,382],[312,443],[268,466],[233,420]]]}
};
function cut(points){
 // Preserve every authored corner; distribute the remaining vertices along edges.
 const lengths=points.map((p,i)=>Math.hypot(p[0]-points[(i+1)%points.length][0],p[1]-points[(i+1)%points.length][1])),total=lengths.reduce((a,b)=>a+b,0),counts=lengths.map(l=>Math.max(1,Math.floor(l/total*(95-points.length))+1));
 while(counts.reduce((a,b)=>a+b,0)<95){const index=lengths.map((l,i)=>l/counts[i]).indexOf(Math.max(...lengths.map((l,i)=>l/counts[i])));counts[index]++;}
 const result=[];
 points.forEach((p,i)=>{const q=points[(i+1)%points.length],dx=q[0]-p[0],dy=q[1]-p[1],len=lengths[i]||1;for(let j=0;j<counts[i];j++){const t=j/counts[i],chip=j?(Math.sin(i*71+j*19)*.65+Math.sin(j*3.3+i)*.42):0;result.push([p[0]+dx*t+dy/len*chip,p[1]+dy*t-dx/len*chip]);}});
 result.push([...points[0]]);return result;
}
function strap(points,width){const top=[],bottom=[];points.forEach(([x,y],i)=>{const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)],dx=next[0]-prev[0],dy=next[1]-prev[1],d=Math.hypot(dx,dy)||1,w=width*(1-i/(points.length+1)*.5);top.push([x-dy/d*w,y+dx/d*w]);bottom.unshift([x+dy/d*w,y-dx/d*w]);});return [...top,...bottom];}
export function collageScene(input={}){
 const answers=normalizeAnswers(input),code=encodeDNA(answers),seed=Number(code)+4041,r=recipes[answers.principle],loose=answers.organization==='experiment',rich=answers.density==='rich',restless=answers.attitude==='playful';
 const warp=([x,y])=>[300+(x-300)*(loose?.91:1)+(loose?(350-y)*.065:0),y+(loose?(x-300)*.045:0)];
 const shapes=[],lines=[],eyes=[],attachments=[];
 const S=(id,points,color,opts={})=>{const s={id,points:cut(points).map(warp),color,texture:rich?1:.35,flow:1,seed:seed+id.length*37,print:true,printRevision:2,grainPhase:id.length%2,grainAngle:id.startsWith('leg')?-17:id.startsWith('hand')?11:answers.principle==='grid'?35:-7,...opts};shapes.push(s);return s;};
 const L=(id,points,color,width=2,opts={})=>lines.push({id,points:resample(points,32).map(warp),color,width,seed,...opts});
 const footY=answers.principle==='grid'?622:657;
 for(const [i,side]of ['left','right'].entries()){
  const hip=r.hips[i],knee=[hip[0]+(i?48:-38)*(loose?1.3:1),560-(i?0:20)],tip=[hip[0]+(i?38:-26),footY-(i&&restless?14:0)];
  S('leg-'+side,strap([hip,knee,tip],answers.principle==='grid'?9:12),answers.principle==='shape'?P.black:answers.principle==='typography'?r.color:i?r.color:r.accent,{anchor:warp(hip)});
  S('foot-'+side,[[tip[0]-5,tip[1]-12],[tip[0]+7,tip[1]-4],[tip[0]+(i?41:-35),tip[1]+8],[tip[0]-14,tip[1]+4]],answers.principle==='shape'?P.bone:r.color);
  attachments.push({id:'leg-'+side,root:warp(hip)});
  const root=r.arms[i],elbow=[root[0]+(i?64:-61),root[1]+(i&&restless?-45:65)],palm=[root[0]+(i?76:-71),root[1]+(answers.principle==='typography'?(i&&restless?133:192):(i&&restless?47:135))];
  S('arm-'+side,strap([root,elbow,palm],10),r.color,{anchor:warp(root)});
  S('hand-'+side,[[palm[0]-10,palm[1]-8],[palm[0]+12,palm[1]-2],[palm[0]+23,palm[1]+48],[palm[0]+8,palm[1]+26],[palm[0]+3,palm[1]+63],[palm[0]-4,palm[1]+31],[palm[0]-18,palm[1]+59],[palm[0]-13,palm[1]+16],[palm[0]-23,palm[1]+36]],answers.principle==='typography'?P.bone:r.accent,{anchor:warp(palm)});
  attachments.push({id:'arm-'+side,root:warp(root)});
 }
 if(['grid','texture'].includes(answers.principle))for(let i=0;i<2;i++){
  const root=i?r.hips[1]:r.hips[0],dir=i?1:-1;
  S('extra-leg-'+i,strap([root,[300+dir*190,510],[300+dir*168,613]],8),r.accent,{anchor:warp(root)});
 }
 if(answers.principle==='grid')for(const [i,side]of ['left','right'].entries()){
  const root=r.arms[i],dir=i?1:-1,knee=[300+dir*209,493],tip=[300+dir*180,615];
  const arm=shapes.find(s=>s.id==='arm-'+side),hand=shapes.find(s=>s.id==='hand-'+side);
  arm.points=cut(strap([root,knee,tip],10)).map(warp);
  hand.points=cut([[tip[0]-5,tip[1]-12],[tip[0]+4,tip[1]],[tip[0]+dir*32,tip[1]+6],[tip[0]-dir*13,tip[1]+7]]).map(warp);hand.color=r.color;
 }
 if(answers.principle==='grid')for(const [i,[x,y]]of [[91,493],[509,493],[110,510],[490,510]].entries()){
  S('hinge-'+i,[[x-5,y-3],[x-1,y-6],[x+5,y-3],[x+5,y+3],[x,y+6],[x-5,y+2]],P.yellow);
  S('hinge-pin-'+i,[[x-2,y-2],[x+2,y-2],[x+2,y+2],[x-2,y+2]],P.black);
 }
 for(const part of shapes.filter(p=>p.id.startsWith('hand-'))){
  if(answers.principle==='typography'){
   const anchor=part.anchor;part.points=part.points.map(([x,y])=>[anchor[0]+(x-anchor[0])*2.05,Math.min(680,anchor[1]+(y-anchor[1])*2.05)]);
  }else if(answers.principle==='shape')part.color=r.color;
 }
 const body=S('body',r.outline,r.color,{body:true,structural:true});
 // Large folds are printed as separate, slightly misregistered paper fragments.
 if(answers.principle==='grid')S('color-mass-left',[[286,299],[330,314],[365,382],[379,455],[323,477],[313,385]],P.yellow,{clip:'body',structural:true});
 if(answers.principle==='color'){
  S('color-mass-left',[[166,278],[256,239],[289,349],[256,411],[174,438]],P.red,{clip:'body',structural:true});
  S('color-mass-right',[[321,159],[406,237],[431,347],[359,354],[308,291]],P.blue,{clip:'body',structural:true});
 }
 S('fold-shadow',[[r.face[0]-65,r.face[1]+40],[r.face[0]+65,r.face[1]+28],[r.face[0]+21,r.face[1]+91]],P.black,{clip:'body',structural:true});
 const bands={
  typography:[[237,191],[348,206],[333,228],[240,213]],
  grid:[[110,391],[435,422],[398,456],[131,420]],
  color:[[217,266],[358,279],[351,311],[221,292]],
  shape:[[337,227],[439,216],[441,260],[338,267]],
  texture:[[217,247],[350,264],[341,289],[214,272]]
 };
 S('eye-mask',bands[answers.principle],P.black,{clip:'body',structural:true});
 const planes={
  typography:[[[251,94],[265,156],[219,190]],[[375,303],[300,324],[328,362]],[[254,510],[311,481],[309,538]]],
  grid:[[[249,274],[223,362],[109,411]],[[249,274],[292,382],[366,293]],[[166,451],[344,495],[399,468]]],
  color:[[[233,144],[281,212],[206,228]],[[407,253],[350,323],[437,334]],[[198,505],[282,547],[267,482]]],
  shape:[[[198,92],[202,203],[260,243]],[[357,285],[267,306],[321,342]],[[269,399],[323,431],[244,457]],[[258,517],[319,550],[347,507]]],
  texture:[[[219,128],[264,179],[212,221]],[[393,173],[325,246],[374,242]],[[138,431],[248,470],[178,535]]]
 };
 planes[answers.principle].forEach((pts,i)=>S('ink-fold-'+i,pts,P.black,{clip:'body',structural:true,grainAngle:i%2?56:-27}));
 r.holes.forEach((pts,i)=>S(i?'counter-'+i:'counter',pts,P.black,{opening:true,structural:true}));
 const eyeCount=answers.gaze==='expression'?(answers.principle==='grid'?4:3):(answers.principle==='shape'?1:2);
 for(let i=0;i<eyeCount;i++){
  const cx=r.face[0]+(i-(eyeCount-1)/2)*(answers.principle==='grid'?46:40),cy=r.face[1]+(answers.principle==='grid'?i*4:(i%2?7:0)),center=warp([cx,cy]);let fitted;
  outer:for(const radius of [11,9,7])for(let distance=0;distance<=50;distance+=3)for(let j=0;j<(distance?16:1);j++){
   const angle=j*Math.PI/8,x=center[0]+Math.cos(angle)*distance,y=center[1]+Math.sin(angle)*distance;
   if(eyes.every(e=>Math.hypot(e.x-x,e.y-y)>e.r+radius+14)&&ellipse(x,y,radius+7,radius+7).every(p=>pointInside(p,body.points))){fitted={id:'eye-'+i,x,y,r:radius,ry:radius*.53,angle:0,rim:P.black,iris:P.yellow,gaze:[i%2?-1.4:1.4,0],detail:false,print:true,rectangular:answers.principle==='shape',printRevision:2,eyeWidth:answers.principle==='shape'&&eyeCount===1?3.7:1.48,eyeHeight:answers.principle==='shape'&&eyeCount===1?1.9:1,lid:.18,skin:r.color};break outer;}
  }
  if(!fitted)throw new Error('Paper socket does not fit '+code);eyes.push(fitted);
 }
 // A dark cut under the gaze, no round smiling mouth or conventional teeth.
 const [mx,my]=r.face,mouthPts=[[mx-28,my+45],[mx+39,my+38],[mx+18,my+54],[mx-23,my+60]];
 if(restless)S('mouth',mouthPts,P.black,{clip:'body',mouth:true});else L('smile',mouthPts.slice(0,3),P.black,4,{clip:'body'});
 const markCount=rich?17:5;
 for(let i=0;i<markCount;i++){
  const x=180+(i*43+seed%73)%237,y=340+(i*31)%154,p=warp([x,y]);
  if(!pointInside(p,body.points)||eyes.some(e=>Math.hypot(e.x-p[0],e.y-p[1])<e.r+20))continue;
  L('surface-'+i,[[x,y],[x+3+(i%3)*2,y-22],[x+7,y-36]],i%4?P.black:r.accent,rich?2.8:1.7,{clip:'body',pattern:true,patternKind:'crosshatch',anchor:p});
 }
 return {shapes,lines,eyes,attachments,body:body.points,answers,code,seed,tooth:rich?.9:.35,family:answers.principle,pattern:{dominant:'crosshatch',secondary:rich?'stipple':null},rulesVersion:4,medium:'cut-paper',stage:5};
}
export function paperPrelude(){
 const scene=collageScene({principle:'typography'});
 const body=scene.shapes.find(s=>s.id==='body');
 const points=cut([[234,195],[340,229],[375,325],[322,375],[354,441],[260,476],[215,387],[250,317],[201,267]]);body.points=points;
 return {...scene,shapes:[body],lines:[],eyes:[],attachments:[],body:points,stage:0,family:'unformed',code:'unformed',answers:{}};
}

export {cut as cutPaper,strap as paperStrap};
