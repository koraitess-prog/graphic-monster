import {rng} from './anidoodle-kit.js';
import {C} from './illustrations.js';

// A vocabulary of printed marks. Layout belongs to the DNA; pigment belongs to
// the existing gouache renderer. All coordinates are in the organism's space.
export const PATTERNS=['small-dots','large-dots','irregular-dots','checks','distorted-checks','horizontal','vertical','diagonal','curved','waves','crosshatch','broken-grid','symbols','spots','scales','stipple','type'];
const vocabulary={typography:['type','vertical','crosshatch','diagonal'],grid:['checks','distorted-checks','broken-grid','symbols'],color:['large-dots','irregular-dots','horizontal','small-dots'],shape:['curved','waves','scales','spots'],texture:['stipple','spots','crosshatch','diagonal']};
export function addPatterns({answers,family,S:shape,L:line,O:oval,warp,outline,body,eyes,holes,shapes,lines}){
 const rich=answers.density==='rich',loose=answers.organization==='experiment';
 const types=vocabulary[answers.principle],index=(loose?1:0)+(answers.gaze==='expression'?2:0),dominant=types[index],secondary=types[(index+2)%4];
 const random=rng(2031),colors=[family.secondary,C.cream,family.accent];
 const inside=([x,y],poly)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
 const extent=y=>{const hits=[];for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];if((a[1]>y)!==(b[1]>y))hits.push(a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]));}return hits.length?[Math.min(...hits),Math.max(...hits)]:[300,300];};
 const clear=(x,y,r)=>{
  if(y>342&&y<410&&x>234&&x<365)return false;
  const center=warp([x,y]);if(eyes.some(e=>Math.hypot(center[0]-e.x,center[1]-e.y)<Math.max(e.r,e.ry)+r+16))return false;
  return Array.from({length:12},(_,i)=>warp([x+Math.cos(i*Math.PI/6)*r,y+Math.sin(i*Math.PI/6)*r])).every(p=>inside(p,body)&&!holes.some(h=>inside(p,h)))&&!holes.some(h=>inside(center,h));
 };
 const mark=(kind,x,y,size,index,region,parity,angle)=>{
  const turn=([px,py])=>[x+(px-x)*Math.cos(angle)-(py-y)*Math.sin(angle),y+(px-x)*Math.sin(angle)+(py-y)*Math.cos(angle)];
  const S=(id,pts,color,opts)=>shape(id,pts.map(turn),color,opts),L=(id,pts,color,w,opts)=>line(id,pts.map(turn),color,w,opts),O=(id,px,py,rx,ry,color,opts)=>{const q=turn([px,py]);return oval(id,...q,rx,ry,color,{...opts,angle});};
  const id=`surface-${region}-${index}`,color=region?family.accent:(answers.principle==='color'?C.cream:family.secondary);
  const opts={clip:'body',pattern:true,patternKind:kind,anchor:warp([x,y]),texture:.8};
  const stroke=(suffix,points,width=2)=>L(id+suffix,points,color,width,{...opts,alpha:.85});
  const rect=(cx,cy,w,h)=>S(id,[[cx-w,cy-h],[cx+w,cy-h],[cx+w,cy+h],[cx-w,cy+h]],color,{...opts,raw:true});
  switch(kind){
   case 'small-dots':O(id,x,y,4.5,4.8,color,opts);break;
   case 'stipple':for(let j=0;j<5;j++)O(id+'-'+j,x+(random()-.5)*size*1.7,y+(random()-.5)*size*1.7,1.4,1.8,color,opts);break;
   case 'large-dots':O(id,x,y,size,size*1.05,color,opts);break;
   case 'irregular-dots':case 'spots':S(id,[[x-size,y],[x-size*.3,y-size],[x+size*.7,y-size*.6],[x+size,y+size*.4],[x,y+size*.8]],color,opts);break;
   case 'checks':if(parity===0)rect(x,y,size*.8,size*.8);break;
   case 'distorted-checks':if(parity===0)S(id,[[x-size,y-size*.7],[x+size*.8,y-size],[x+size*.6,y+size],[x-size*.7,y+size*.6]],color,{...opts,raw:true});break;
   case 'horizontal':stroke('',[[x-size,y],[x+size,y+1]],4);break;
   case 'vertical':stroke('',[[x,y-size],[x+1,y+size]],3);break;
   case 'diagonal':stroke('',[[x-size*.6,y-size],[x+size*.6,y+size]],3);break;
   case 'curved':case 'waves':stroke('',[[x-size,y+3],[x-size*.3,y-4],[x+size*.3,y-4],[x+size,y+3]],2.5);break;
   case 'crosshatch':stroke('a',[[x-size*.6,y-size],[x+size*.6,y+size]],1.4);stroke('b',[[x+size*.6,y-size],[x-size*.6,y+size]],1.4);break;
   case 'broken-grid':stroke('',[[x-size,y],[x,y],[x,y+size]],1.8);break;
   case 'symbols':S(id,[[x,y-size],[x+size*.7,y],[x,y+size],[x-size*.7,y]],color,{...opts,raw:true});break;
   case 'scales':stroke('',[[x-size,y-3],[x-size*.6,y+5],[x,y+8],[x+size*.6,y+5],[x+size,y-3]],2);break;
   case 'type':stroke('a',[[x-5,y-8],[x-5,y+8],[x+4,y+8]],3);stroke('b',[[x-9,y-8],[x,y-8]],1.6);break;
  }
 };
 // Sample curved anatomical bands from each contour's changing cross-section.
 // No backing panel, rectangular mask, or shared belly coordinates. Edge taper,
 // socket clearances and the actual apertures decide where pigment can land.
 const top=Math.min(...outline.map(p=>p[1]))+22,bottom=Math.max(...outline.map(p=>p[1]))-20;
 for(let region=0;region<(rich?2:1);region++){
  const kind=region?secondary:dominant,rows=rich?16:9,cols=rich?3:1;
  for(let row=0;row<rows;row++){
   const t=row/(rows-1),y=top+(bottom-top)*t;
   if(region&&t<.43)continue;
   const [left,right]=extent(y),width=right-left;
   const center=region?.77-.12*Math.sin(t*3.4):.22+.14*Math.sin(t*4.5+.3);
   for(let col=0;col<cols;col++){
    const u=center+(col-(cols-1)/2)*.10;
    const jitter=loose?5:1,x=left+width*u+(random()-.5)*jitter,yy=y+(random()-.5)*jitter;
    const size=(rich?7:12)*(1-.27*Math.abs(u-.5)*2),angle=(region?-.2:.2)*Math.cos(t*4)+(loose?(random()-.5)*.3:0);
    let fitted=size;while(fitted>size*.62&&!clear(x,yy,fitted*1.45))fitted*=.8;
    if(!clear(x,yy,fitted*1.45))continue;
    mark(kind,x,yy,fitted,row*cols+col,region,(row+col)%2,angle);
   }
  }
 }
 // Verify the resulting curved strokes too: a sampled brush path may bow
 // beyond its construction envelope. Omit such a mark rather than cutting it.
 for(const parts of [shapes,lines])for(let i=parts.length-1;i>=0;i--){const p=parts[i];if(p.pattern&&!p.points.every(q=>inside(q,body)&&!holes.some(h=>inside(q,h))))parts.splice(i,1);}
 return {dominant,secondary:rich?secondary:null};
}
