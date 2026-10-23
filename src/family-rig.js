// Motion adapters for the eight EXISTING anatomical branches. These are joint
// paths from collage.js / expanded-collage.js, not new visible anatomy.
import {buildRiftRig} from './character-actions.js';
const basic={
 typography:{hips:[[263,477],[322,478]],arms:[[246,300],[337,300]]},
 color:{hips:[[234,486],[360,485]],arms:[[212,366],[396,363]]},
 grid:{hips:[[198,450],[374,450]],arms:[[164,400],[409,400]]},
 shape:{hips:[[281,489],[346,489]],arms:[[267,379],[355,391]]},
 texture:{hips:[[223,486],[364,484]],arms:[[176,366],[385,363]]}
};
const special={
 accordion:active=>({'leg-left':[[191,514],[167,592],[145,638]],'leg-right':[[309,513],[342,578],[370,642]],'arm-left':[[166,420],[109,467],[135,519]],'arm-right':[[361,418],[446,449],[467,515],[active?471:441,active?537:563]]}),
 crane:active=>({'leg-left':[[267,409],[247,530],[218,654]],'leg-right':[[335,414],[374,503],[348,632]],'extra-leg-0':[[310,462],[298,556],[299,661]],'arm-left':[[263,389],[213,414],[174,373],[161,293],[149,235]],'arm-right':[[333,392],[active?393:380,445],[362,490]]}),
 knot:()=>({'leg-left':[[189,503],[153,558],[184,633]],'leg-right':[[336,544],[401,582],[469,571],[489,615]],'extra-leg-0':[[273,548],[282,601],[346,622]],'arm-left':[[179,421],[115,458],[105,526]],'arm-right':[[363,497],[435,485],[461,449]]})
};
const cache=new WeakMap();
export function buildFamilyRig(scene){
 if(cache.has(scene))return cache.get(scene);
 const anatomy=scene.anatomy,loose=scene.answers.organization==='experiment',active=scene.answers.attitude==='playful',isSpecial=!!special[anatomy];
 const warp=point=>{
  const [x,y]=point;let q=isSpecial?[300+(x-300)*(active?1.025:1)+(active?(415-y)*.018:0),y+(active?(x-300)*.013:0)]:[300+(x-300)*(loose?.91:1)+(loose?(350-y)*.065:0),y+(loose?(x-300)*.045:0)];
  if(isSpecial&&loose&&scene.rulesVersion>=6)q=[300+(q[0]-300)*.97+(655-q[1])*.018,q[1]];
  return q;
 };
 let paths={};
 if(isSpecial)paths=special[anatomy](active);
 else if(basic[anatomy]){
  const data=basic[anatomy],footY=anatomy==='grid'?622:657;
  for(const [i,side]of ['left','right'].entries()){
   const hip=data.hips[i],root=data.arms[i];
   paths['leg-'+side]=[hip,[hip[0]+(i?48:-38)*(loose?1.3:1),560-(i?0:20)],[hip[0]+(i?38:-26),footY-(i&&active?14:0)]];
   paths['arm-'+side]=[root,[root[0]+(i?64:-61),root[1]+(i&&active?-45:65)],[root[0]+(i?76:-71),root[1]+(anatomy==='typography'?(i&&active?133:192):(i&&active?47:135))]];
  }
  if(anatomy==='grid')for(const [i,side]of ['left','right'].entries()){const dir=i?1:-1;paths['arm-'+side]=[data.arms[i],[300+dir*209,493],[300+dir*180,615]];}
  if(['grid','texture'].includes(anatomy))for(let i=0;i<2;i++){const dir=i?1:-1;paths['extra-leg-'+i]=[data.hips[i],[300+dir*190,510],[300+dir*168,613]];}
 }
 const legs=[],arms=[],stalks=[];
 const attachments=new Map(scene.attachments.map(a=>[a.id,a]));
 for(const shape of scene.shapes)if(/^(?:extra-)?(?:leg|arm)-[^~]+$/.test(shape.id)&&shape.anchor&&!attachments.has(shape.id))attachments.set(shape.id,{id:shape.id,root:shape.anchor});
 for(const attachment of attachments.values()){
  const id=attachment.id,part=scene.shapes.find(p=>p.id===id);if(!part)continue;
  if(id.startsWith('eye-stalk')){stalks.push({id,root:attachment.root});continue;}
  const type=/^(extra-)?leg-/.test(id)?'leg':/^(extra-)?arm-/.test(id)?'arm':null;if(!type)continue;
  let rest=paths[id]?.map(warp);
  // Unknown additional limbs can inherit a conservative bend using THEIR
  // existing silhouette and root. Never create an attachment that isn't present.
  if(!rest){const tip=part.points.reduce((a,p)=>Math.hypot(p[0]-attachment.root[0],p[1]-attachment.root[1])>Math.hypot(a[0]-attachment.root[0],a[1]-attachment.root[1])?p:a,attachment.root);rest=[attachment.root,[(attachment.root[0]+tip[0])/2,(attachment.root[1]+tip[1])/2],tip];}
  rest[0]=attachment.root;
  const suffix=id.replace(/^(extra-)?(?:leg|arm)-/,''),extra=id.startsWith('extra-'),terminalId=type==='leg'?(extra?'extra-foot-'+suffix:'foot-'+suffix):(extra?'extra-hand-'+suffix:'hand-'+suffix),terminal=scene.shapes.find(p=>p.id===terminalId);
  if(terminal?.anchor&&anatomy!=='grid')rest[rest.length-1]=terminal.anchor;
  const entry={id,rest,terminalId:terminal?terminalId:null,length:rest.slice(1).reduce((n,p,i)=>n+Math.hypot(p[0]-rest[i][0],p[1]-rest[i][1]),0)};
  (type==='leg'?legs:arms).push(entry);
 }
 legs.sort((a,b)=>a.rest.at(-1)[0]-b.rest.at(-1)[0]);
 arms.sort((a,b)=>Number(b.id==='arm-right')-Number(a.id==='arm-right'));
 const body=scene.shapes.find(p=>p.id==='body'),xs=body.points.map(p=>p[0]),ys=body.points.map(p=>p[1]);
 const pelvis=legs.length?legs.reduce((c,p)=>[c[0]+p.rest[0][0]/legs.length,c[1]+p.rest[0][1]/legs.length],[0,0]):[(Math.min(...xs)+Math.max(...xs))/2,Math.max(...ys)];
 const rig={anatomy,legs,arms,stalks,pelvis,height:Math.max(...ys)-Math.min(...ys),width:Math.max(...xs)-Math.min(...xs)};
 if(anatomy==='typography'&&legs.length===2&&arms.length===2)rig.rift=buildRiftRig(scene);
 cache.set(scene,rig);return rig;
}
