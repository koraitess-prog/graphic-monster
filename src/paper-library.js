// Local paper contours, not decals: every template becomes a structural fragment.
// Coordinates are normalized so the same vocabulary can build a neck or a torso.
const polygon=(...p)=>p;
function arcBand(start,end,inner=.56){
 const arc=(r,a,b)=>Array.from({length:17},(_,i)=>{const t=a+(b-a)*i/16;return [Math.cos(t)*r,Math.sin(t)*r];});
 return [...arc(1,start,end),...arc(inner,end,start)];
}
const organic=(phase=0)=>Array.from({length:32},(_,i)=>{const a=i/32*Math.PI*2,r=.87+.11*Math.sin(a*3+phase)+.07*Math.cos(a*5-phase);return [Math.cos(a)*r,Math.sin(a)*r];});
export const PAPER_LIBRARY={
 typography:[
  {name:'stem',points:polygon([-.69,-1],[.65,-1],[.51,1],[-.61,1])},
  {name:'bracket-serif',points:polygon([-1,-1],[1,-1],[.91,-.77],[.51,-.68],[.43,.67],[.91,.79],[1,1],[-1,1],[-.9,.76],[-.4,.66],[-.5,-.67],[-.91,-.78])},
  {name:'bowl',points:arcBand(-2.55,2.55,.52)},
  {name:'open-counter',points:arcBand(.42,5.88,.65)},
  {name:'terminal',points:polygon([-1,-1],[.08,-.96],[.76,-.66],[1,-.05],[.75,.67],[.11,1],[-.84,.8],[-.67,.3],[.06,.47],[.39,.07],[.12,-.35],[-.95,-.3])},
  {name:'ligature',points:polygon([-1,-1],[-.25,-1],[-.2,-.18],[.22,-.28],[.27,-1],[1,-1],[.81,1],[.2,1],[.23,.21],[-.22,.36],[-.29,1],[-.91,1])},
  {name:'comma',points:polygon([-.7,-1],[.61,-1],[.86,-.2],[.35,.65],[-.42,1],[-.18,.2],[-.72,.14])},
  {name:'hairline',points:polygon([-.18,-1],[.3,-1],[.13,1],[-.24,1])},
  {name:'crossbar',points:polygon([-1,-.27],[-.29,-.36],[-.2,-1],[.36,-1],[.25,-.27],[1,-.19],[1,.36],[.2,.24],[.17,1],[-.37,1],[-.31,.29],[-1,.34])},
  {name:'spur',points:polygon([-.7,-1],[.4,-1],[.45,.16],[1,.38],[.48,.6],[.27,1],[-.73,1])}
 ],
 grid:[
  {name:'cell',points:polygon([-1,-1],[1,-1],[1,1],[-1,1])},
  {name:'column',points:polygon([-.58,-1],[.58,-1],[.58,1],[-.58,1])},
  {name:'row',points:polygon([-1,-.4],[1,-.4],[1,.4],[-1,.4])},
  {name:'stepped-module',points:polygon([-1,-1],[.08,-1],[.08,-.32],[1,-.32],[1,1],[-1,1])},
  {name:'window',points:polygon([-1,-1],[1,-1],[1,1],[.48,1],[.48,-.45],[-.43,-.45],[-.43,1],[-1,1])},
  {name:'divided-unit',points:polygon([-1,-1],[1,-1],[1,-.14],[.34,-.14],[.34,.17],[1,.17],[1,1],[-1,1])},
  {name:'offset-cell',points:polygon([-1,-1],[.7,-1],[.7,-.14],[1,-.14],[1,1],[-.65,1],[-.65,.18],[-1,.18])},
  {name:'double-column',points:polygon([-1,-1],[-.14,-1],[-.14,.47],[.2,.47],[.2,-1],[1,-1],[1,1],[-1,1])}
 ],
 color:[
  {name:'overprint-field',points:polygon([-1,-1],[.86,-.91],[1,.57],[.22,1],[-.93,.75])},
  {name:'diagonal-field',points:polygon([-1,-1],[1,-.55],[.6,1],[-1,.74])},
  {name:'color-wedge',points:polygon([-.83,-1],[1,-.42],[.6,1],[-1,.48])},
  {name:'split-field',points:polygon([-1,-1],[1,-1],[.7,.22],[.08,.17],[.02,1],[-1,1])},
  {name:'folded-color',points:polygon([-1,-.75],[.15,-1],[1,-.31],[.74,1],[-.47,.75])},
  {name:'overlap-ribbon',points:polygon([-1,-1],[.24,-.84],[.64,-.12],[1,.24],[.69,1],[-.25,.71],[-.48,-.09],[-1,-.24])},
  {name:'ink-trap',points:polygon([-1,-1],[1,-.8],[.15,.02],[.9,1],[-1,.74])},
  {name:'broad-mass',points:organic(.7)}
 ],
 shape:[
  {name:'lobe',points:organic(.2)},
  {name:'hook',points:arcBand(-2.5,2.6,.48)},
  {name:'crescent',points:arcBand(-2.2,2.2,.68)},
  {name:'notched-mass',points:polygon([-1,-.8],[-.14,-1],[.84,-.54],[1,.34],[.45,1],[-.36,.7],[.14,.15],[-.76,.37])},
  {name:'bent-tongue',points:polygon([-.71,-1],[.4,-.85],[.23,-.11],[1,.43],[.28,1],[-.83,.1])},
  {name:'fork',points:polygon([-1,-1],[-.27,-.65],[0,-.06],[.27,-.8],[1,-1],[.74,.53],[.16,1],[-.57,.71])},
  {name:'narrow-waist',points:organic(2.4).map(([x,y])=>[x*(.55+.45*Math.abs(y)),y])},
  {name:'aperture',points:arcBand(.2,6.05,.56)},
  {name:'asymmetric-blade',points:polygon([-1,.8],[-.47,-1],[.32,-.78],[1,.24],[.37,.63],[-.2,1])}
 ],
 texture:[
  {name:'fine-dotted',points:organic(.4),pattern:'dots-small'},
  {name:'large-dotted',points:polygon([-1,-1],[.87,-.77],[1,.82],[-.76,1]),pattern:'dots-large'},
  {name:'irregular-spots',points:organic(2),pattern:'spots'},
  {name:'checked',points:polygon([-1,-1],[1,-1],[1,1],[-1,1]),pattern:'checks'},
  {name:'warped-checks',points:organic(1),pattern:'warped-checks'},
  {name:'horizontal-ribs',points:polygon([-1,-.8],[.84,-1],[1,.9],[-.9,1]),pattern:'stripes-horizontal'},
  {name:'vertical-ribs',points:polygon([-.8,-1],[1,-.9],[.84,1],[-1,.8]),pattern:'stripes-vertical'},
  {name:'diagonal-ribs',points:polygon([-1,-1],[1,-.8],[.7,1],[-1,.7]),pattern:'stripes-diagonal'},
  {name:'waving-ribs',points:organic(2.8),pattern:'stripes-wave'},
  {name:'broken-grid',points:polygon([-1,-1],[.87,-1],[1,.4],[.4,1],[-1,.74]),pattern:'broken-grid'},
  {name:'scales',points:organic(1.7),pattern:'scales'},
  {name:'repeated-cuts',points:polygon([-1,-.7],[.7,-1],[1,.9],[-1,1]),pattern:'marks'},
  {name:'scratched-crosses',points:organic(.9),pattern:'crosses'}
 ]
};
export function tornContour(points,seed=0,amount=1.3){
 const out=[];
 points.forEach((p,i)=>{const q=points[(i+1)%points.length],dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy)||1,count=Math.max(1,Math.ceil(len/7));
  for(let j=0;j<count;j++){const t=j/count,n=j?((Math.sin(i*37+j*13+seed)*.72+Math.sin(j*7.7+i*3)*.28)*amount):0;out.push([p[0]+dx*t-dy/len*n,p[1]+dy*t+dx/len*n]);}
 });return out;
}
export function paperCutout(family,index,{x,y,width,height,angle=0}){
 const list=PAPER_LIBRARY[family],template=list[((index%list.length)+list.length)%list.length],c=Math.cos(angle),s=Math.sin(angle);
 const outline=template.points.map(([u,v],i)=>{const chip=i%3?Math.sin(i*19+index)*.009:0,px=(u+chip)*width/2,py=(v-chip)*height/2;return [x+px*c-py*s,y+px*s+py*c];});
 return {...template,...(family==='typography'?{pattern:['newsprint','magazine-type','oversized-type'][((index%3)+3)%3]}:{}),points:tornContour(outline,index,Math.min(1.6,Math.min(width,height)*.035))};
}
