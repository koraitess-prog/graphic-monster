import {normalizeAnswers,encodeDNA,resample,pointInside,ellipse} from './dna.js';
import {collageScene,cutPaper,paperStrap} from './collage.js';
const C={pink:'#ce6587',orange:'#ed783a',gold:'#d6a333',petrol:'#397f99',rust:'#b55c36',lilac:'#b5a0c6',bone:'#e8ddba',ink:'#151a1b'};
// These are anatomical branches of the five existing design instincts, not new quiz answers.
export function anatomyFor(input){const a=normalizeAnswers(input);if(a.principle==='color'&&a.organization==='order')return 'accordion';if(a.principle==='shape'&&a.organization==='order')return 'crane';if(a.principle==='texture'&&a.organization==='experiment')return 'knot';return a.principle;}
export function expandedCollageScene(input={},anatomyOverride=null){
 const answers=normalizeAnswers(input),anatomy=anatomyOverride??anatomyFor(answers);
 if(!['accordion','crane','knot'].includes(anatomy)){
  const scene={...collageScene(answers),rulesVersion:5,anatomy};
  if(anatomy==='typography'){
   const loose=answers.organization==='experiment',active=answers.attitude==='playful',warp=([x,y])=>[300+(x-300)*(loose?.91:1)+(loose?(350-y)*.065:0),y+(loose?(x-300)*.045:0)];
   scene.behavior='lively';scene.motionRig={rightArm:[scene.attachments.find(a=>a.id==='arm-right').root,warp([401,active?255:365]),scene.shapes.find(p=>p.id==='hand-right').anchor]};
   if(input.eyeVariant==='single'){
    const source=scene.eyes[0],x=scene.eyes.reduce((v,e)=>v+e.x,0)/scene.eyes.length,y=scene.eyes.reduce((v,e)=>v+e.y,0)/scene.eyes.length;
    scene.eyes=[{...source,x,y,r:14,ry:8,eyeWidth:1.9,eyeHeight:1.05,gaze:[1,0]}];scene.eyeVariant='single';
   }
  }
  return scene;
 }
 const code=encodeDNA(answers),seed=Number(code)+4041,rich=answers.density==='rich',active=answers.attitude==='playful',expressive=answers.gaze==='expression';
 const shapes=[],lines=[],eyes=[],attachments=[];
 // All parts share one deformation, retaining attachment and aperture relationships.
 const warp=([x,y])=>[300+(x-300)*(active?1.025:1)+(active?(415-y)*.018:0),y+(active?(x-300)*.013:0)];
 const S=(id,points,color,opts={})=>{const part={id,points:cutPaper(points).map(warp),color,texture:rich?1:.35,flow:1,seed:seed+id.length*37,print:true,printRevision:2,grainPhase:id.length%2,grainAngle:id.includes('fold')?32:id.includes('leg')?-16:-6,...opts};shapes.push(part);return part;};
 const L=(id,points,color,width=2,opts={})=>lines.push({id,points:resample(points,32).map(warp),color,width,seed,...opts});
 const attach=(id,root)=>attachments.push({id,root:warp(root)});
 const limb=(id,points,width,color)=>{S(id,paperStrap(points,width),color,{anchor:warp(points[0])});attach(id,points[0]);};
 const foot=(id,[x,y],color,dir=1)=>S(id,[[x-7,y-13],[x+8,y-3],[x+dir*40,y+8],[x-dir*21,y+6]],color);
 const hand=(id,[x,y],color,size=1)=>S(id,[[-8,-8],[10,-3],[23,37],[6,20],[2,57],[-4,27],[-18,49],[-11,9],[-27,29]].map(([u,v])=>[x+u*size,y+v*size]),color);
 let body,eyePlans=[],holes=[];
 if(anatomy==='accordion'){
  const left=[191,514],right=[309,513];
  limb('leg-left',[left,[167,592],[145,638]],28,C.pink);limb('leg-right',[right,[342,578],[370,642]],27,C.orange);
  S('foot-left',[[143,611],[195,654],[99,668]],C.pink);S('foot-right',[[352,617],[417,655],[327,663]],C.pink);
  limb('arm-left',[[166,420],[109,467],[135,519]],13,C.orange);hand('hand-left',[135,519],C.orange,.65);
  const palm=[active?471:441,active?537:563];limb('arm-right',[[361,418],[446,449],[467,515],palm],11,C.pink);hand('hand-right',palm,C.pink,1.6);
  body=S('body',[[141,282],[318,245],[399,281],[381,323],[413,351],[384,395],[420,424],[359,472],[343,522],[240,560],[155,532],[163,478],[115,446],[147,403],[105,373],[156,334],[127,312]],C.pink,{body:true,structural:true});
  S('color-mass-left',[[127,312],[318,267],[393,285],[284,338],[168,357]],C.orange,{clip:'body',structural:true});
  S('fold-ink-0',[[105,373],[284,338],[381,323],[356,381],[182,402]],C.ink,{clip:'body',structural:true});
  S('color-mass-center',[[147,403],[356,381],[413,351],[384,395],[186,433]],C.orange,{clip:'body',structural:true});
  S('fold-ink-1',[[115,446],[186,433],[384,395],[359,472],[185,482]],C.ink,{clip:'body',structural:true});
  S('color-mass-bottom',[[163,478],[185,482],[359,472],[343,522],[240,560],[155,532]],C.orange,{clip:'body',structural:true});
  S('fold-ink-2',[[163,478],[225,502],[327,519],[240,560],[155,532]],C.pink,{clip:'body',structural:true,grainAngle:62});
  S('eye-mask',[[336,282],[392,275],[398,392],[347,380]],C.ink,{clip:'body',structural:true});
  holes=[[[218,402],[250,390],[268,412],[243,431]]];
  eyePlans=expressive?[[361,301,10],[369,337,10],[376,373,10]]:[[369,335,17]];
 }else if(anatomy==='crane'){
  limb('leg-left',[[267,409],[247,530],[218,654]],9,C.gold);foot('foot-left',[218,654],C.gold,-1);
  limb('leg-right',[[335,414],[374,503],[348,632]],10,C.petrol);foot('foot-right',[348,632],C.gold);
  limb('extra-leg-0',[[310,462],[298,556],[299,661]],8,C.gold);foot('extra-foot-0',[299,661],C.gold);
  limb('arm-left',[[263,389],[213,414],[174,373],[161,293],[149,235]],12,C.petrol);
  S('hand-left',[[148,236],[157,268],[163,276],[155,303],[141,274]],C.gold);
  limb('arm-right',[[333,392],[active?393:380,445],[362,490]],8,C.gold);hand('hand-right',[362,490],C.petrol,.55);
  body=S('body',[[236,82],[457,116],[399,161],[281,142],[273,180],[318,229],[348,270],[321,326],[350,415],[312,478],[263,436],[250,366],[283,305],[300,274],[257,236],[227,192],[238,150],[223,126]],C.gold,{body:true,structural:true});
  S('color-mass-neck',[[250,95],[284,138],[267,185],[319,235],[335,273],[303,321],[277,402],[269,436],[250,366],[282,304],[299,274],[256,235],[227,192],[238,150]],C.petrol,{clip:'body',structural:true});
  S('color-mass-head',[[236,82],[457,116],[399,161],[281,142],[265,120]],C.petrol,{clip:'body',structural:true});
  S('paper-fold-head',[[236,82],[282,95],[321,145],[281,142],[249,116]],C.gold,{clip:'body',structural:true});
  S('eye-mask',[[318,111],[450,117],[398,153],[324,146]],C.ink,{clip:'body',structural:true});
  S('fold-ink-0',[[321,326],[350,415],[317,454],[303,409]],C.petrol,{clip:'body',structural:true});
  holes=[[[289,351],[321,385],[308,437],[277,405]]];
  eyePlans=expressive?[[341,130,9],[376,134,9],[410,131,7]]:[[381,131,14]];
  for(const [i,[x,y]]of [[247,530],[374,503],[298,556]].entries()){
   S('hinge-'+i,[[x-7,y-4],[x-1,y-8],[x+6,y-3],[x+5,y+5],[x-4,y+7],[x-7,y]],C.gold);S('hinge-pin-'+i,[[x-2,y-2],[x+2,y-2],[x+2,y+2],[x-2,y+2]],C.petrol);
  }
 }else{
  limb('leg-left',[[189,503],[153,558],[184,633]],11,C.lilac);foot('foot-left',[184,633],C.rust,-1);
  limb('leg-right',[[336,544],[401,582],[469,571],[489,615]],12,C.lilac);foot('foot-right',[489,615],C.rust);
  limb('extra-leg-0',[[273,548],[282,601],[346,622]],9,C.rust);foot('extra-foot-0',[346,622],C.lilac);
  limb('arm-left',[[179,421],[115,458],[105,526]],11,C.lilac);hand('hand-left',[105,526],C.rust,.7);
  limb('arm-right',[[363,497],[435,485],[461,449]],12,C.rust);
  S('hand-right',[[435,492],[452,501],[482,516],[513,509],[522,518],[496,541],[456,516]],C.bone);
  const blades=[[[465,417],[489,408],[520,431],[536,465],[535,497],[522,516],[520,463],[501,438],[480,427]],[[453,445],[482,429],[509,447],[520,477],[515,523],[502,526],[506,480],[493,456],[472,449]],[[447,474],[470,457],[494,469],[504,492],[496,530],[485,531],[487,494],[478,481],[460,479]]];
  blades.forEach((points,i)=>S('claw-blade-'+i,points,C.bone));
  S('tail',paperStrap([[218,533],[213,580],[270,613],[320,604],[303,569]],10),C.lilac);
  body=S('body',[[146,387],[219,324],[319,312],[388,353],[408,425],[370,481],[401,521],[359,567],[271,574],[210,536],[168,529],[136,478],[156,440]],C.rust,{body:true,structural:true});
  S('color-mass-left',[[146,387],[219,324],[243,397],[218,458],[247,511],[210,536],[168,529],[136,478]],C.lilac,{clip:'body',structural:true});
  S('color-mass-bottom',[[247,491],[322,497],[401,521],[359,567],[271,574],[210,536]],C.lilac,{clip:'body',structural:true});
  S('fold-ink-0',[[219,324],[319,312],[292,355],[249,386]],C.ink,{clip:'body',structural:true});
  S('fold-ink-1',[[271,574],[314,532],[359,567]],C.rust,{clip:'body',structural:true});
  holes=[[[222,386],[290,354],[346,384],[366,435],[335,480],[261,492],[214,463],[194,420]]];
  const stalks=[{root:[319,339],neck:[[319,339],[343,304],[322,266],[326,224]],head:[[305,205],[361,201],[369,245],[324,254]],eyes:[[337,226,10]]},{root:[377,389],neck:[[377,389],[405,356],[434,329],[461,333]],head:[[432,304],[499,307],[529,336],[477,353],[448,338]],eyes:expressive?[[465,329,8],[499,329,7]]:[[479,329,11]]}];
  for(const [i,stalk]of stalks.entries()){
   S('eye-stalk-'+i,paperStrap(stalk.neck,9),i?C.rust:C.lilac,{stalk:true,anchor:warp(stalk.root)});attach('eye-stalk-'+i,stalk.root);
   const head=S('eye-head-'+i,stalk.head,C.lilac,{stalk:true,anchor:warp(stalk.root)});
   S('eye-mask-'+i,[[stalk.head[0][0]+6,stalk.head[0][1]+13],[stalk.head[1][0]-2,stalk.head[1][1]+10],[stalk.head[2][0]-9,stalk.head[2][1]-4],[stalk.head[3][0]+3,stalk.head[3][1]-8]],C.ink,{stalk:true});
   for(const plan of stalk.eyes)eyePlans.push([...plan,{stalk:true,anchor:warp(stalk.root),envelope:head.points}]);
  }
 }
 holes.forEach((points,i)=>S(i?'counter-'+i:'counter',points,C.ink,{opening:true,structural:true}));
 for(const [i,[cx,cy,radius,opts={}]]of eyePlans.entries()){
  const center=warp([cx,cy]),envelope=opts.envelope??body.points;let fitted;
  outer:for(const factor of [1,.9,.8,.7,.6])for(let distance=0;distance<=24;distance+=2)for(let j=0;j<(distance?16:1);j++){
   const angle=j*Math.PI/8,x=center[0]+Math.cos(angle)*distance,y=center[1]+Math.sin(angle)*distance,r=radius*factor;
   if(eyes.every(e=>Math.hypot(e.x-x,e.y-y)>=e.r+r+14)&&ellipse(x,y,r+7,r+7).every(p=>pointInside(p,envelope))){fitted={id:'eye-'+i,x,y,r,ry:r*.56,angle:0,rim:C.ink,iris:C.gold,gaze:[i%2?-1.1:1.1,0],detail:false,print:true,printRevision:2,eyeWidth:anatomy==='crane'&&!expressive?2.6:1.42,eyeHeight:anatomy==='crane'&&!expressive?1.4:1,rectangular:anatomy==='crane',lid:.2,skin:anatomy==='accordion'?C.pink:C.gold,...(opts.stalk?{stalk:true,anchor:opts.anchor}:{} )};break outer;}
  }
  if(!fitted)throw new Error('Cannot fit '+anatomy+' socket '+i+' / '+code);eyes.push(fitted);
 }
 const markCount=rich?16:5;
 for(let i=0;i<markCount;i++){
  const x=170+(seed+i*61)%218,y=330+(i*29)%200,p=warp([x,y]);
  if(!pointInside(p,body.points)||eyes.some(e=>Math.hypot(e.x-p[0],e.y-p[1])<e.r+24))continue;
  L('surface-'+i,[[x,y],[x+3,y-16],[x+8,y-31]],C.ink,rich?1.6:.9,{clip:'body',pattern:true,patternKind:'crosshatch',anchor:p});
 }
 return {shapes,lines,eyes,attachments,body:body.points,answers,code,seed,tooth:rich?.9:.35,family:answers.principle,anatomy,pattern:{dominant:'crosshatch',secondary:rich?'stipple':null},rulesVersion:5,medium:'cut-paper',stage:5};
}
