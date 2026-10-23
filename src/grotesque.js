import {sample,limb,rng} from './anidoodle-kit.js';
import {pointInside,resample,ellipse} from './dna.js';
const palette={'#8586a1':'#77717f','#cf7866':'#995852','#658d87':'#747d60','#c7a14e':'#aaa05b','#f4e9ce':'#e0d8b9','#b5b7a5':'#9f9d82','#b4a7aa':'#a18d91','#b4b4a0':'#a4a18c','#3f6969':'#46584d','#626883':'#5d5468'};
const tint=c=>palette[c]??c;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function deformFor(scene){
 const family=scene.family,loose=scene.answers.organization==='experiment';
 return ([x,y])=>{
  const height=clamp((665-y)/510,0,1),side=(x-300)/180;
  let shift=0,scale=1,drop=0;
  switch(family){
   case 'typography':shift=36*Math.sin((y-160)/115)-24;scale=.87+.17*Math.sin(y/77);drop=side*17;break;
   case 'grid':shift=26*Math.cos(y/91)+14;scale=.87+.22*Math.sin((y-40)/67);drop=side*24;break;
   case 'color':shift=22+32*Math.sin(y/150);scale=.98+.14*Math.cos(y/113);drop=23*Math.sin(x/97)+side*13;break;
   case 'shape':shift=-55*Math.exp(-(((y-120)/140)**2))+32*Math.sin(y/180);scale=.88+.12*Math.sin(y/71);drop=side*25;break;
   case 'texture':shift=-12+26*Math.sin(y/120);scale=.96+.10*Math.sin(y/19);drop=side*25+10*Math.sin(x/70);break;
  }
  return [clamp(300+(x-300)*scale+shift*height+(loose?side*14*height:0),42,552),clamp(y+drop*height+Math.max(0,side)*18*height,65,679)];
 };
}
export function grotesqueScene(source){
 const scene=structuredClone(source),a=scene.answers,rich=a.density==='rich',erratic=a.attitude==='playful',random=rng(scene.seed+7143);
 const remove=/^(cheek-|sock-|sock-stripe-|tooth-|feeler|mouth$|smile$)/;
 scene.shapes=scene.shapes.filter(p=>!remove.test(p.id));scene.lines=scene.lines.filter(p=>!remove.test(p.id)&&!/^foot-.*-toe-/.test(p.id));
 const body=scene.shapes.find(p=>p.id==='body');
 const outlines={
  typography:[[208,174],[257,150],[297,186],[344,173],[382,210],[388,286],[352,337],[369,384],[392,429],[379,522],[330,555],[277,535],[210,554],[160,526],[150,471],[192,414],[209,357],[177,302],[175,232]],
  grid:[[189,195],[262,163],[340,179],[394,207],[404,287],[382,336],[410,373],[431,438],[409,531],[339,558],[281,534],[209,550],[172,510],[175,450],[204,398],[172,351],[167,279]],
  color:[[250,174],[314,151],[351,188],[400,208],[425,266],[410,318],[449,368],[430,424],[446,494],[399,541],[330,563],[275,545],[215,567],[171,536],[144,474],[156,420],[123,378],[156,333],[148,270],[188,219]],
  shape:[[258,196],[319,167],[374,187],[410,238],[396,290],[350,330],[345,373],[406,403],[419,460],[391,515],[335,550],[269,570],[205,552],[158,522],[147,471],[181,429],[225,400],[239,365],[204,326],[187,275],[210,224]],
  texture:[[222,186],[263,161],[310,188],[343,175],[383,215],[380,255],[410,285],[395,320],[429,349],[412,386],[442,424],[416,455],[435,493],[402,522],[389,558],[347,549],[319,581],[278,557],[242,580],[210,552],[174,560],[158,520],[131,494],[149,456],[132,424],[152,388],[138,350],[162,321],[155,282],[180,253],[185,215]]
 };
 body.points=resample(sample(outlines[scene.family],true,9));
 const make=(id,points,color,opts={})=>({id,points:resample(sample(points,true,7)),color,texture:rich?1:.3,flow:1.35,seed:1042+id.length*31,...opts});
 const replace=(id,points)=>{const part=scene.shapes.find(s=>s.id===id);if(part)part.points=resample(points);};
 // Elbows lag well below unequal shoulders; fingers hang rather than wave.
 for(const [side,x,baseY] of [['left',118,{typography:580,grid:480,color:545,shape:560,texture:409}[scene.family]],['right',438,{typography:466,grid:601,color:420,shape:525,texture:597}[scene.family]]]){
  const y=baseY+(erratic?(side==='right'?-26:9):0);
  const root=scene.attachments.find(p=>p.id==='arm-'+side).root;
  replace('arm-'+side,limb([root,[side==='left'?124:466,(root[1]+y)*.5],[x,y]],[8,4,2.8]));
  replace('hand-'+side,sample([[x-4,y-7],[x+5,y-4],[x+11,y+12],[x+15,y+34],[x+10,y+28],[x+5,y+12],[x+3,y+42],[x-1,y+34],[x-3,y+14],[x-10,y+31],[x-13,y+26],[x-7,y+7]],true,5));
 }
 // Family-specific supports: bent stilts, a third foot, or a low crawling stance.
 const legs={
  typography:[[[228,516],[173,585],[187,655]],[[350,518],[365,607],[390,655]]],
  grid:[[[228,516],[192,564],[217,655]],[[350,518],[419,574],[363,655]]],
  color:[[[228,516],[171,587],[187,655]],[[350,518],[432,568],[390,655]]],
  shape:[[[228,516],[247,588],[217,655]],[[350,518],[414,558],[363,655]]],
  texture:[[[228,516],[151,559],[187,655]],[[350,518],[460,568],[390,655]]]
 }[scene.family];
 for(const [i,side] of ['left','right'].entries()){
  const root=scene.attachments.find(p=>p.id==='leg-'+side).root,points=legs[i];
  replace('leg-'+side,limb([root,points[1],points[2]],[14,i?5:9,3]));
 }
 if(['grid','color','texture'].includes(scene.family)){
  const roots=scene.family==='texture'?[[177,466],[389,480]]:[[294,530]];
  roots.forEach(([xx,yy],i)=>{
   const end=roots.length===1?[291,668]:[i?506:87,635];
   const knee=roots.length===1?[270,605]:[i?486:101,530];
   const part=make('extra-leg-'+i,limb([[xx,yy],knee,end],[12,6,2.5]),'#747d60');
   scene.shapes.splice(scene.shapes.indexOf(body),0,part);
  });
 }
 for(const p of scene.shapes){
  if(p.id.startsWith('foot-')){const cx=p.points.reduce((v,q)=>v+q[0]/p.points.length,0);p.points=p.points.map(([x,y])=>[cx+(x-cx)*.69,y]);}
  if(p.id.startsWith('fin-')){p.points=p.points.map(([x,y],i)=>[x+Math.max(0,180-x)*.45,y+Math.max(0,180-x)*.35+Math.sin(i*.6)*4]);p.color='#5d6254';}
  if(p.opening){const cx=p.points.reduce((v,q)=>v+q[0]/p.points.length,0),cy=p.points.reduce((v,q)=>v+q[1]/p.points.length,0);p.points=resample(sample([[cx-4,cy-32],[cx+13,cy-23],[cx+6,cy-6],[cx+16,cy+26],[cx-5,cy+41],[cx-15,cy+16],[cx-9,cy-2],[cx-16,cy-18]],true,7));const edge=scene.lines.find(l=>l.id==='counter-edge');if(edge)edge.points=resample(p.points.slice(0,45),32);}
 }
 // Unequal sockets retain the original reserved face envelope.
 scene.eyes=scene.eyes.map((e,i)=>({...e,r:e.r*(i===0?1.24:i%2?.38:.61),ry:e.ry*(i===0?1.16:i%2?.49:.71),rim:i%2?'#77715a':tint(e.rim),iris:i%2?'#a18d91':'#aaa05b',gaze:[i%2?-e.r*.16:e.r*.14,i%3?e.r*.04:-e.r*.13],lid:i===0?.14:i%2?.70:.30,pupilScale:i===0?.39:.20,irisScale:i===0?.69:.47,skin:tint(body.color),vacant:i%3===2}));
 // Each family has a different jaw construction: fissure, wedge, pouch, beak, gill.
 const jaw={
  typography:{x:283,y:376,w:22,h:69,tilt:-13},
  grid:{x:294,y:379,w:63,h:35,tilt:17},
  color:{x:302,y:386,w:68,h:48,tilt:-21},
  shape:{x:280,y:395,w:27,h:41,tilt:12},
  texture:{x:290,y:390,w:39,h:63,tilt:-9}
 }[scene.family];
 const {x,y,w,h,tilt}=jaw;
 const mouth=make(erratic?'mouth':'mouth-slit',[[x-w,y-h*.35],[x-w*.4,y-h*.65],[x+w*.28,y-h*.37+tilt],[x+w,y-h*.6+tilt],[x+w*.77,y+h*.45],[x+w*.12,y+h],[x-w*.49,y+h*.66],[x-w*.85,y+h*.15]],'#30313b',{mouth:true,clip:'body'});
 scene.shapes.push(mouth);
 if(!erratic)scene.lines.push({id:'smile',points:resample(sample([[x-w-6,y-h*.35],[x-w*.4,y-h*.65],[x+w,y-h*.6+tilt]],false,8),32),color:'#30313b',width:2.4,seed:1042,clip:'body'});
 const teeth=rich?17:11;
 for(let i=0;i<teeth;i++){
  const t=((i>>1)+.5)/Math.ceil(teeth/2),xx=x-w*.68+t*w*1.34,top=i%2===0;
  const yy=top?y-h*.4+tilt*t:y+h*(.52+.22*Math.sin(t*3));
  const depth=9+(i*7%17),direction=top?1:-1;
  scene.shapes.push(make('seam-tooth-'+i,[[xx-3,yy],[xx+3.5,yy+1],[xx+Math.sin(i*4)*4,yy+direction*depth]],i%3?'#c5c1a4':'#ddd6c0',{clip:'body'}));
 }
 // Asymmetric antler-like cartilage grows from one side of the crown.
 // Authored curves, with hooked tips and broad roots, rather than paired devil horns.
 const crowns={
  typography:[[[218,210],[184,169],[182,110],[160,91],[186,103],[201,150],[242,181]]],
  grid:[[[210,202],[182,158],[202,112],[188,84],[219,108],[208,153],[246,183]],[[338,196],[361,151],[397,130],[409,98],[410,143],[381,171],[375,212]]],
  color:[[[369,236],[404,186],[464,180],[484,149],[480,191],[428,208],[405,256]]],
  shape:[[[240,229],[208,192],[200,147],[169,127],[209,133],[226,180],[267,209]]],
  texture:[[[203,234],[177,195],[180,154],[155,137],[188,141],[199,183],[229,208]],[[345,214],[364,172],[349,132],[373,153],[384,180],[375,225]],[[272,199],[254,158],[272,112],[272,153],[300,188]]]
 };
 const crownParts=crowns[scene.family].map((points,i)=>make('crown-'+i,points,i%2?'#aaa05b':'#747d60',{furry:.12}));
 scene.shapes.splice(scene.shapes.indexOf(body),0,...crownParts);
 // Ridges around the jaw read as anatomy, not a decorative belly patch.
 for(let i=0;i<4;i++)scene.lines.push({id:'jaw-ridge-'+i,points:resample(sample([[x+w*.86+5+i*4,y+h*.12],[x+w*.7+9+i*4,y+h*.53],[x+w*.16+12+i*4,y+h+7+i*4]],false,7),32),color:'#46584d',width:1.4,clip:'body',seed:723+i});
 // Fungal pits interrupt the skin; no red wounds or splatter.
 const pitCount=rich?13:4;
 for(let i=0;i<pitCount;i++){
  const xx=190+random()*200,yy=425+random()*95,r=2+random()*6;
  if(ellipse(xx,yy,r+3,r+3).every(p=>pointInside(p,body.points))&&!scene.shapes.some(p=>p.opening&&pointInside([xx,yy],p.points)))
   scene.shapes.push(make('skin-pit-'+i,ellipse(xx,yy,r,r*.6),i%3?'#666b54':'#9b7881',{clip:'body',pattern:true,patternKind:'spots',texture:.8,anchor:[xx,yy]}));
 }
 // Cluster existing marks into unequal colonies, leaving broad vacant skin.
 for(const p of [...scene.shapes,...scene.lines].filter(p=>p.pattern&&!p.id.startsWith('skin-pit'))){
  const center=p.points.reduce((v,q)=>[v[0]+q[0]/p.points.length,v[1]+q[1]/p.points.length],[0,0]);
  const scale=.5+1.05*Math.sin(center[1]/37)**2;
  p.points=p.points.map(([xx,yy])=>[center[0]+(xx-center[0])*scale,center[1]+(yy-center[1])*scale]);
  p.color=rich&&Math.sin(center[1]/29)>.5?'#59614f':tint(p.color);
 }
 const warp=deformFor(scene);
 for(const p of [...scene.shapes,...scene.lines]){p.points=p.points.map(warp);p.color=tint(p.color);if(p.anchor)p.anchor=warp(p.anchor);}
 scene.eyes=scene.eyes.map(e=>{const [xx,yy]=warp([e.x,e.y]);return {...e,x:xx,y:yy,r:e.r*.82,ry:e.ry*.85,angle:0,...(e.anchor?{anchor:warp(e.anchor)}:{})};});
 const fitted=[];
 for(const eye of scene.eyes){
  if(eye.stalk){fitted.push(eye);continue;}
  let found;
  outer:for(const factor of [1,.94,.87,.79,.7,.6])for(let distance=0;distance<=36;distance+=3)for(let j=0;j<(distance?16:1);j++){
   const angle=j*Math.PI/8,e={...eye,x:eye.x+Math.cos(angle)*distance,y:eye.y+Math.sin(angle)*distance,r:eye.r*factor,ry:eye.ry*factor};
   if(fitted.every(o=>Math.hypot(e.x-o.x,e.y-o.y)>=e.r+o.r+14)&&ellipse(e.x,e.y,e.r+7,e.ry+7,0,40).every(p=>pointInside(p,body.points))){found=e;break outer;}
  }
  if(!found)throw new Error('Cannot fit grotesque socket '+scene.code);fitted.push(found);
 }
 scene.eyes=fitted;
 scene.attachments=scene.attachments.map(p=>({...p,root:warp(p.root)}));scene.body=body.points;
 const holes=scene.shapes.filter(p=>p.opening),mouthPoints=scene.shapes.find(p=>p.mouth).points;
 const clear=p=>(!p.anchor||scene.eyes.every(e=>Math.hypot(p.anchor[0]-e.x,p.anchor[1]-e.y)>Math.max(e.r,e.ry)+16))&&p.points.every(q=>pointInside(q,body.points)&&!holes.some(h=>pointInside(q,h.points))&&!pointInside(q,mouthPoints));
 for(const key of ['shapes','lines'])scene[key]=scene[key].filter(p=>!p.pattern||clear(p));
 scene.rulesVersion=3;scene.behavior='watchful';return scene;
}
