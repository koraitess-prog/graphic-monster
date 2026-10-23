import {normalizeAnswers,encodeDNA,pointInside,resample,ellipse} from './dna.js';
import {expandedCollageScene} from './expanded-collage.js';
import {paperCutout,PAPER_LIBRARY} from './paper-library.js';

export const ANATOMIES=['crane','color','grid','accordion','typography','shape','texture','knot'];
export function independentAnatomy(input={}){
 if(ANATOMIES.includes(input.anatomy))return input.anatomy;
 const a=normalizeAnswers(input),index=(a.organization==='experiment'?4:0)+(a.gaze==='expression'?2:0)+(a.attitude==='playful'?1:0);
 return ANATOMIES[Number.isInteger(input.seed)?(input.seed>>>0)%8:index];
}
const sourceFor={crane:'shape',color:'color',grid:'grid',accordion:'color',typography:'typography',shape:'shape',texture:'texture',knot:'texture'};
const bounds=points=>{const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);return {x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};};
function touches(points,parent){return points.some(p=>pointInside(p,parent))||parent.some(p=>pointInside(p,points));}
function sourceScene(input,anatomy){
 const answers=normalizeAnswers(input),principle=sourceFor[anatomy];
 const scene=expandedCollageScene({...answers,principle,...(input.eyeVariant==='side'&&anatomy==='accordion'?{gaze:'expression'}:{}),...(input.eyeVariant?{eyeVariant:input.eyeVariant}:{})},anatomy);
 if(anatomy==='accordion'&&input.eyeVariant!=='side'&&(input.eyeVariant==='central'||answers.gaze==='clarity'||answers.density==='minimal')){
  const active=answers.attitude==='playful',move=([x,y])=>[300+(x-300)*(active?1.025:1)+(active?(415-y)*.018:0),y+(active?(x-300)*.013:0)],center=move([275,335]);
  scene.eyes=[{...scene.eyes[0],id:'eye-0',x:center[0],y:center[1],r:35,ry:33,orbital:true,eyeWidth:1,eyeHeight:1,gaze:[1.5,0]}];
  scene.shapes=scene.shapes.map(p=>p.id==='eye-mask'?{...p,points:ellipse(center[0],center[1],44,42,0,96)}:p);scene.eyeVariant='central';
 }
 if(answers.gaze==='clarity'&&['color','texture'].includes(anatomy)){
  const eye=scene.eyes[0],center=scene.eyes.reduce((sum,e)=>[sum[0]+e.x/scene.eyes.length,sum[1]+e.y/scene.eyes.length],[0,0]);
  const wanted=anatomy==='color'?32:27,ratio=anatomy==='color'?.88:.96;
  let radius=wanted;
  while(radius>19&&!ellipse(center[0],center[1],radius+7,radius*ratio+7,0,48).every(p=>pointInside(p,scene.body)))radius--;
  if(radius>=20){
   scene.eyes=[{...eye,x:center[0],y:center[1],r:radius,ry:radius*ratio,orbital:true,orbitalIris:anatomy==='color'?'#b89338':null,angle:anatomy==='color'?-.07:.035,eyeWidth:1,eyeHeight:1,gaze:anatomy==='color'?[2,-1]:[-1,1]}];
   scene.shapes=scene.shapes.map(p=>p.id==='eye-mask'?{...p,points:ellipse(center[0],center[1],radius+7,radius*ratio+7,0,96)}:p);
  }
 }
 if(answers.organization!=='experiment'||!['crane','accordion','knot'].includes(anatomy))return scene;
 const move=([x,y])=>[300+(x-300)*.97+(655-y)*.018,y];
 const part=p=>({...p,points:p.points.map(move),...(p.anchor?{anchor:move(p.anchor)}:{})}),shapes=scene.shapes.map(part);
 return {...scene,shapes,lines:scene.lines.map(part),body:shapes.find(p=>p.id==='body').points,eyes:scene.eyes.map(e=>{const [x,y]=move([e.x,e.y]);return {...e,x,y,...(e.anchor?{anchor:move(e.anchor)}:{})};}),attachments:scene.attachments.map(a=>({...a,root:move(a.root)}))};
}
export function paperDNAScene(input={}){
 const answers=normalizeAnswers(input),code=encodeDNA(answers),anatomy=independentAnatomy(input),source=sourceScene(input,anatomy);
 const seed=Number.isInteger(input.seed)?input.seed>>>0:(Number(code)+4041)*8+ANATOMIES.indexOf(anatomy),rich=answers.density==='rich',loose=answers.organization==='experiment';
 const colors=[...new Set(source.shapes.filter(p=>!p.opening&&!['#151a1b','#e8ddba'].includes(p.color)).map(p=>p.color))];
 if(colors.length===1)colors.push(anatomy==='typography'?'#d5aa39':'#b5a0c6');
 const palette=[...colors.slice(0,3),'#e8ddba'],shapes=[];
 for(const parent of source.shapes){
  if(parent.opening||parent.color==='#151a1b'||parent.mouth||parent.id.startsWith('hinge')){shapes.push(parent);continue;}
  // The carrier is geometry/rigging only; its paper pieces provide the visible mass.
  const envelopeScale={typography:1.04,grid:1.08,color:1.03,shape:1.10,texture:1.04}[answers.principle];
  shapes.push({...parent,carrier:true,paperEnvelopeScale:envelopeScale});
  // A narrow dark backing joins the cuts at their seams; it is not a painted body.
  // Foreground fragments supply all pigment and the majority of the visible area.
  shapes.push({...parent,id:parent.id+'~backing',color:'#151a1b',printRevision:3,texture:.18,paperPiece:true,paperRole:'backing',vocabulary:'neutral',clipParent:parent.id,motionPart:parent.id,carrier:false});
  const b=bounds(parent.points),isBody=parent.id==='body',limb=/^(arm|leg|eye-stalk|extra-leg)/.test(parent.id),hand=parent.id.startsWith('hand');
  const vertical=b.h>=b.w,sections=isBody?(rich?(answers.principle==='grid'?7:5):3):limb?(rich?3:2):rich?2:1;
  const across=isBody&&b.w>200?(rich?3:2):1;
  let slot=0;
  const add=(index,box,color,role='construction')=>{
   const cut=paperCutout(answers.principle,index,box);
   if(answers.principle==='typography'&&cut.pattern==='newsprint')color='#d8cfb4';
   if(answers.principle==='typography'&&cut.pattern==='oversized-type'&&slot%2===0)color='#e8ddba';
   if(!touches(cut.points,parent.points))return;
   // All world points remain bounded; clipping belongs to this anatomical carrier.
   const points=resample([...cut.points,cut.points[0]],96).map(([x,y])=>[Math.max(Math.max(35,b.x),Math.min(Math.min(560,b.x+b.w),x)),Math.max(Math.max(60,b.y),Math.min(Math.min(690,b.y+b.h),y))]);
   const phase=slot%2;
   shapes.push({id:parent.id+'~paper-'+slot++,points,color,texture:rich?.4:.22,flow:1,print:true,printRevision:3,grainPhase:phase,grainAngle:phase?12:-7,paperPattern:cut.pattern??null,paperPiece:true,paperSeam:answers.principle==='grid'?1.3:.55,vocabulary:answers.principle,paperKind:cut.name,paperRole:role,clipParent:parent.id,motionPart:parent.id,anchor:parent.anchor??[b.x+b.w/2,b.y+b.h/2],structural:parent.structural||isBody,...(parent.stalk?{stalk:true}:{}),...(parent.pattern?{pattern:true}:{}),...(parent.clip?{clip:parent.clip}:{}),seed:seed+slot*79});
  };
  // Interlocking long cuts carry the silhouette, rather than a texture laid on a blob.
  for(let row=0;row<sections;row++)for(let col=0;col<across;col++){
   const w=vertical?b.w/across:b.w/sections,h=vertical?b.h/sections:b.h/across;
   const x=b.x+(vertical?col+.5:row+.5)*w,y=b.y+(vertical?row+.5:col+.5)*h;
   const jitter=loose?Math.sin(row*7+col*5+seed)*.055:0;
   const family=answers.principle;
   // Primary pieces use broad vocabulary forms; secondary cuts articulate their joins.
   const index=family==='typography'?[1,5,0,9][row%4]:family==='grid'?[0,3,6,7][(row+col)%4]:family==='color'?(row+col)%5:family==='shape'?[0,3,5,6,8][(row+col)%5]:(row*3+col+(parent.id.length%5))%PAPER_LIBRARY.texture.length;
   const color=parent.color==='#e8ddba'?parent.color:family==='color'?palette[(row+col)%palette.length]:(row+col)%4===3?palette[1]:parent.color;
   add(index,{x,y,width:w*(family==='typography'?1.8:1.25),height:h*1.24,angle:jitter},color);
  }
  if(isBody||hand||rich&&!limb){
   const count=isBody?(rich?7:2):rich?2:1;
   for(let i=0;i<count;i++){
    const y=b.y+b.h*(.14+((i*.223+seed*.001)% .74)),x=b.x+b.w*(.19+((i*.317+seed*.003)% .62));
    const size=isBody?.4:.72;
    const jointColor=isBody&&i%3===0&&['typography','shape'].includes(answers.principle)?'#e8ddba':answers.principle==='color'?palette[(i+1)%palette.length]:i%3===0?palette[1]:parent.color;
    add(i*3+2,{x,y,width:b.w*size,height:b.h*(isBody?.22:.7),angle:loose?(i%2?-.23:.17):0},jointColor,'joint');
   }
  }
 }
 const lines=source.lines.filter(p=>!p.pattern);
 return {...source,shapes,lines,answers,code,seed,anatomy,family:answers.principle,designLanguage:answers.principle,rulesVersion:6,paperSystem:1,anatomySeed:seed,pattern:{dominant:answers.principle==='texture'?'mixed-paper':'cutouts',secondary:rich?'layered':null}};
}
