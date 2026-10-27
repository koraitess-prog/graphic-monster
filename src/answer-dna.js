import {normalizeAnswers,pointInside,ellipse} from './dna.js';
import {paperDNAScene} from './paper-dna.js';
import {anatomyFromAnswers,designParameters,fitDesignParameters,mapDesignPoint} from './anatomy-dna.js';
export function answerDNAScene(input={}){
 const answers=normalizeAnswers(input),anatomy=anatomyFromAnswers(answers),source=paperDNAScene({...input,...answers,anatomy,...(anatomy==='accordion'?{eyeVariant:answers.gaze==='clarity'?'central':'side'}:{})}),design=fitDesignParameters(source,designParameters(answers)),move=p=>mapDesignPoint(p,design);
 const part=p=>({...p,points:p.points.map(move),...(p.anchor?{anchor:move(p.anchor)}:{})});
 const shapes=source.shapes.map(part),body=shapes.find(s=>s.id==='body').points;
 // Dense material becomes actual silhouette: a small attached fan of cut fins.
 if(answers.density==='rich'){
  const edge=body.reduce((best,p)=>p[0]>best[0]?p:best,body[0]),color=source.shapes.find(p=>p.carrier&&!p.opening&&p.color!=='#151a1b')?.color??'#519f7d';
  for(let i=0;i<3;i++){const root=[edge[0]-8,edge[1]+(i-1)*7];if(!pointInside(root,body))continue;
   const tip=[Math.min(555,edge[0]+15+i*7),Math.max(66,Math.min(680,edge[1]-21+i*24))];
   shapes.push({id:'material-fin-'+i,points:[root,[edge[0]-3,root[1]-5],tip,[edge[0]-4,root[1]+6]],color,seed:source.seed+i,texture:.4,print:true,printRevision:3,grainPhase:i%2,grainAngle:i*12,paperPiece:true,paperRole:'silhouette',motionPart:'body',structural:true});
  }
 }
 let eyes=source.eyes.map(e=>{const[x,y]=move([e.x,e.y]),a=move([e.x+e.r,e.y]),b=move([e.x,e.y+e.ry]);return {...e,x,y,r:Math.abs(a[0]-x)*.93,ry:Math.abs(b[1]-y)*.93,...(e.anchor?{anchor:move(e.anchor)}:{})};});
 if(answers.gaze==='clarity'&&eyes.length>1){
  const template=eyes.reduce((a,b)=>a.r>b.r?a:b),mean=eyes.reduce((s,e)=>[s[0]+e.x/eyes.length,s[1]+e.y/eyes.length],[0,0]);let hero;
  for(const[x,y]of [mean,[template.x,template.y]]){for(let r=30;r>=8;r--)if(ellipse(x,y,r*(template.eyeWidth??1.48)+7,r*.85*(template.eyeHeight??1)+7,0,64).every(p=>pointInside(p,body))){hero={...template,id:'eye-0',x,y,r,ry:r*.85};break;}if(hero)break;}
  eyes=[hero??{...template,id:'eye-0'}];
 }
 for(let i=0;i<eyes.length;i++)for(let j=i+1;j<eyes.length;j++){
  const a=eyes[i],b=eyes[j],distance=Math.hypot(a.x-b.x,a.y-b.y),scale=Math.min(1,Math.max(0,(distance-12.1)/(a.r+b.r)));
  if(scale<1){a.r*=scale;a.ry*=scale;b.r*=scale;b.ry*=scale;}
 }
 const motionRig=source.motionRig?Object.fromEntries(Object.entries(source.motionRig).map(([k,v])=>[k,Array.isArray(v)?v.map(move):v])):undefined;
 return {...source,shapes,lines:source.lines.map(part),eyes,body,attachments:source.attachments.map(a=>({...a,root:move(a.root)})),...(motionRig?{motionRig}:{}),answers,anatomy,rulesVersion:7,answerAnatomy:design,anatomySource:'answers',anatomySeed:null};
}
