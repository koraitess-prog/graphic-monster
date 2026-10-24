import {rng,sample,limb} from './anidoodle-kit.js';
import {tornContour} from './paper-library.js';

// Original cut-paper silhouettes, using Anidoodle's seeded curves and variable
// width limbs. These belong to the cover only; saved creature anatomy is untouched.
const contours=[
 [[-1,-.78],[-.37,-1],[.08,-.87],[.67,-.98],[1,-.48],[.9,.19],[1,.72],[.42,.93],[-.13,.82],[-.74,1],[-1,.41],[-.85,-.13]],
 [[-1,.86],[-.48,-.87],[-.22,-1],[.06,-.6],[1,.63],[.33,.72],[-.25,1]],
 sample([[-.94,-.35],[-.52,-.92],[.08,-.72],[.5,-.96],[.95,-.4],[.79,.19],[.96,.6],[.31,.96],[-.17,.78],[-.73,.93],[-.9,.37]],true,4),
 limb([[-.78,-.84],[-.15,-.6],[-.42,.05],[.48,.28],[.74,.87]],[.2,.37,.26,.34,.14]),
 [...sample([[-.19,-1],[-.87,-.68],[-1,.03],[-.68,.83],[.1,1],[.9,.62]],false,7),...sample([[.9,.62],[.12,.52],[-.16,.26],[-.3,-.15],[-.17,-.61],[-.19,-1]],false,6)],
 [[-1,-.7],[-.44,-.7],[-.44,-1],[.34,-.94],[.35,-.43],[1,-.39],[.92,.39],[.44,.38],[.42,1],[-.37,.94],[-.4,.52],[-1,.5]],
 limb([[-.3,-1],[.14,-.52],[-.12,-.04],[.29,.46],[.09,1]],[.13,.24,.12,.28,.11]),
 [...sample([[-1,.14],[-.55,-.43],[.03,-.2],[.55,-.54],[1,-.21]],false,7),...sample([[1,.19],[.5,.49],[-.05,.17],[-.55,.61],[-1,.49]],false,7)]
];
export const scrapNames=['torn-sheet','broken-wedge','soft-lobe','crooked-ribbon','crescent','stepped-cut','thin-bend','wave-strip'];
export const scrapAspects=[1.3,1.1,1.06,.82,1.02,1.15,.47,2.4];
export function introScrapPoints(index,width=320,height=256){
 const kind=((index%8)+8)%8,ps=contours[kind],xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]),left=Math.min(...xs),top=Math.min(...ys),w=Math.max(...xs)-left,h=Math.max(...ys)-top;
 const points=ps.map(([x,y])=>[6+(x-left)/w*(width-12),6+(y-top)/h*(height-12)]);
 return tornContour(points,813+index*29,kind===6?1.4:2.7);
}
export function makeIntroPile(width,height){
 const random=rng(92417),cols=Math.ceil(width/(width<650?110:170))+2,rows=Math.ceil(height/(width<650?100:135))+2,sx=width/(cols-2),sy=height/(rows-2),layers=[[],[]];
 for(let layer=0;layer<2;layer++)for(let y=-1;y<rows-1;y++)for(let x=-1;x<cols-1;x++){
  const i=(y+1)*cols+x+1,stock=layer?(i*5+Math.floor(i/cols)*3)%16:[0,2,5][i%3]+(i%2)*8,aspect=layer?scrapAspects[stock%8]/1.25:1;
  layers[layer].push({x:(x+.5)*sx+(layer?(random()-.5)*sx*.7:0),y:(y+.5)*sy+(layer?(random()-.5)*sy*.7:0),w:sx*(layer?1.8:2.5)*Math.sqrt(aspect),h:sy*(layer?1.9:2.5)/Math.sqrt(aspect),angle:(random()-.5)*(layer?1.2:.3),stock,vx:0,vy:0,spin:0,awake:false,gone:false});
 }
 // Broad scraps cover the screen; the foreground carries the stranger contours.
 return layers.flatMap(layer=>layer.sort((a,b)=>Math.sin(a.x*4+a.y)-Math.sin(b.x*4+b.y)));
}
