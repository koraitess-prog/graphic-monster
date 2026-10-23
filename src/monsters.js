/** The future quiz adapter only needs to return this recipe schema.
 * Positions are composed in a common 300 × 400 illustration space.
 * Curated recipes constrain combinations; seeds control print details and pupil attitude.
 */
export const INK = '#25251f';
export const PAPER = '#f3f0e7';
export const PALETTE = ['#ef593e', '#d6a73b', '#ae9ec7', '#899451', '#638eaa'];
export const specimens = [
  {name:'Riff',seed:1042,color:0,body:{kind:'block',x:75,y:117,w:155,h:171,tilt:-5},eyes:[{x:123,y:173,r:25},{x:179,y:164,r:20}],mouth:{kind:'grin',x:116,y:213,w:77,h:40,teeth:3},limbs:'stomp',spikes:'crown',pattern:'slashes',energy:'Bold / impulsive / offbeat',description:'Makes an entrance. Breaks the grid. Somehow makes it work.',dna:['Cut block','Uneven pair','Sawtooth grin','Dry slashes']},
  {name:'Momo',seed:2087,color:1,body:{kind:'bean',x:62,y:105,w:177,h:184,tilt:5},eyes:[{x:152,y:171,r:39}],mouth:{kind:'small',x:153,y:227,w:29,h:25,teeth:1},limbs:'swing',spikes:'ears',pattern:'dots',energy:'Curious / warm / a little odd',description:'Sees the small things. Asks the big questions. Usually sideways.',dna:['Bent bean','One wide eye','Single fang','Ink freckles']},
  {name:'Zig',seed:3091,color:2,body:{kind:'burst',x:46,y:130,w:211,h:143,tilt:-2},eyes:[{x:103,y:192,r:18},{x:150,y:179,r:23},{x:197,y:192,r:17}],mouth:{kind:'grin',x:126,y:224,w:53,h:24,teeth:2},limbs:'scuttle',spikes:'none',pattern:'patch',energy:'Restless / electric / unruly',description:'Three eyes. Twelve ideas. Absolutely no interest in a straight line.',dna:['Angular burst','Triple gaze','Double bite','Overprinted patch']},
  {name:'Odo',seed:4053,color:3,body:{kind:'arch',x:83,y:85,w:138,h:216,tilt:3},eyes:[{x:133,y:145,r:18},{x:180,y:152,r:25}],mouth:{kind:'slot',x:132,y:198,w:39,h:13,teeth:0},limbs:'long',spikes:'sprout',pattern:'stripes',energy:'Quiet / precise / unexpected',description:'Likes a little order. Leaves room for the beautifully unexpected.',dna:['Split arch','Offset pair','Quiet slot','Broken stripes']},
  {name:'Kiki',seed:5077,color:4,body:{kind:'zigzag',x:68,y:110,w:171,h:181,tilt:-4},eyes:[{x:138,y:177,r:30},{x:187,y:186,r:13}],mouth:{kind:'grin',x:138,y:227,w:63,h:29,teeth:3},limbs:'kick',spikes:'side',pattern:'rings',energy:'Playful / sharp / contrary',description:'Takes the scenic route. Puts the wrong shapes in the right places.',dna:['Folded zigzag','Big + small','Crooked grin','Orbit marks']}
];
export function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const path=(d,fill=INK,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const circle=(x,y,r,fill=INK,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const stroke=(d,color=INK,width=8)=>path(d,'none',`stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`);

/** Body grammar: all shapes use normalized coordinates, then share one transform. */
export function silhouette({kind}){
  switch(kind){
    case 'block':return 'M 4,7 L 88,0 L 100,89 Q 92,100 78,98 L 7,95 L 0,47 Z';
    case 'bean':return 'M 51,0 C 83,-4 105,22 97,43 C 91,60 69,55 70,71 C 73,95 43,110 19,93 C -5,78 -6,42 10,20 C 20,6 33,1 51,0 Z';
    case 'burst':return 'M 4,43 L 19,32 L 14,7 L 36,18 L 47,0 L 58,19 L 82,5 L 81,29 L 100,39 L 87,54 L 98,77 L 73,78 L 68,100 L 49,88 L 30,100 L 26,79 L 3,81 L 14,60 L 0,53 Z';
    case 'arch':return 'M 0,98 L 1,35 C 0,12 15,0 48,0 C 78,-1 94,14 96,34 L 100,99 L 66,100 L 60,71 Q 55,59 45,69 L 33,100 Z';
    case 'zigzag':return 'M 14,0 L 92,10 L 65,40 L 100,48 L 81,100 L 4,88 L 30,57 L 0,46 Z';
    default:throw new Error(`Unknown silhouette: ${kind}`);
  }
}
function bodyPath(body, fill, extra=''){
  return path(silhouette(body),fill,`transform="translate(${body.x} ${body.y}) scale(${body.w/100} ${body.h/100})" ${extra}`);
}
function limbs(kind){
  const legs={
    stomp:['M 106,270 L 103,318 L 83,320 L 81,328 L 119,328 L 124,272','M 178,272 L 185,318 L 208,320 L 208,330 L 170,328 L 161,273'],
    swing:['M 106,271 L 109,319 L 90,324 L 91,332 L 123,329 L 126,273','M 174,273 L 182,317 L 207,313 L 211,321 L 171,331 L 157,274'],
    scuttle:['M 99,260 L 90,307 L 67,312 L 69,321 L 104,315 L 117,262','M 180,258 L 199,298 L 224,296 L 226,305 L 191,312 L 163,265'],
    long:['M 101,278 L 92,329 L 71,331 L 72,338 L 105,338 L 118,279','M 191,282 L 197,325 L 218,326 L 221,335 L 184,335 L 174,282'],
    kick:['M 103,267 L 90,313 L 66,309 L 64,319 L 101,328 L 119,271','M 179,272 L 207,305 L 226,287 L 234,294 L 208,324 L 163,279']
  };
  const arms={stomp:['M 83,204 Q 49,190 46,230 L 42,242','M 219,197 Q 248,197 251,176 L 254,163'],swing:['M 77,204 Q 42,212 45,253','M 211,202 Q 245,225 263,201'],scuttle:['M 71,219 L 39,237 L 30,218','M 227,219 L 261,236 L 269,218'],long:['M 90,192 Q 51,205 65,250','M 210,194 Q 246,184 243,153'],kick:['M 91,205 L 47,188 L 43,163','M 221,216 L 253,247 L 269,236']};
  return legs[kind].map(d=>path(d)).join('')+arms[kind].map(d=>stroke(d,INK,8)).join('');
}
function spikes(kind,color){
  switch(kind){
    case 'crown':return path('M 94,136 L 84,87 L 120,119 L 137,77 L 155,119 L 186,91 L 186,132',color);
    case 'ears':return path('M 95,134 L 77,84 Q 103,75 118,113 M 182,119 L 209,84 L 222,138',color);
    case 'sprout':return stroke('M 153,100 Q 161,65 139,55',INK,7)+path('M 140,57 Q 112,62 113,39 Q 138,31 140,57',color)+path('M 151,74 Q 156,43 181,48 Q 182,71 151,74',color);
    case 'side':return path('M 85,163 L 50,145 L 63,184 M 199,152 L 252,132 L 226,195 L 192,192 Z',color);
    default:return '';
  }
}
function eye({x,y,r},random,index){
  const pupil=r*(index%2?.32:.37),dx=(random()-.5)*r*.33,dy=(random()-.5)*r*.25;
  return `<g transform="rotate(${index%2?8:-7} ${x} ${y})">${path(`M ${x-r},${y} C ${x-r-2},${y-r*.76} ${x-r*.45},${y-r-3} ${x+2},${y-r} C ${x+r*.82},${y-r} ${x+r+2},${y-r*.42} ${x+r},${y+3} C ${x+r},${y+r*.8} ${x+r*.2},${y+r+2} ${x-3},${y+r} C ${x-r*.8},${y+r} ${x-r},${y+r*.5} ${x-r},${y} Z`,PAPER)}${circle(x+dx+3,y+dy+2,pupil)}</g>`;
}
function mouth({kind,x,y,w,h,teeth},id){
  const d=kind==='grin'?`M ${x},${y} L ${x+w},${y-3} Q ${x+w-1},${y+h} ${x+w*.48},${y+h} Q ${x+3},${y+h-2} ${x},${y} Z`:`M ${x},${y} Q ${x+w/2},${y-5} ${x+w},${y} L ${x+w-2},${y+h} L ${x+2},${y+h-2} Z`;
  return `<defs><clipPath id="mouth-${id}">${path(d)}</clipPath></defs>${path(d)}<g clip-path="url(#mouth-${id})">${Array.from({length:teeth},(_,i)=>{const tx=x+7+i*(w-10)/teeth;return path(`M ${tx},${y-4} L ${tx+12},${y-4} L ${tx+9},${y+15+i%2*3} L ${tx+1},${y+13} Z`,PAPER);}).join('')}</g>`;
}
function pattern(kind,color){
  if(kind==='slashes')return [0,1,2].map(i=>stroke(`M ${89+i*11},245 l 5,-13`,INK,3)).join('');
  if(kind==='dots')return [[92,216],[102,231],[84,238],[108,249],[91,258],[121,259]].map(([x,y],i)=>circle(x,y,i%2?2:3)).join('');
  if(kind==='patch')return path('M 58,175 L 103,150 L 109,169 L 70,192 Z','#ef593e');
  if(kind==='stripes')return [0,1,2,3].map(i=>stroke(`M 185,${233+i*12} l 24,4`,PAPER,4)).join('');
  return circle(109,242,13,'none',`stroke="${INK}" stroke-width="3"`)+circle(99,259,5,INK);
}
export function renderMonster(recipe,{id=`m-${recipe.seed}`,label=true}={}){
  const {seed,body,eyes,mouth:mouthRecipe}=recipe,random=rng(seed),color=PALETTE[recipe.color];
  if(!color)throw new Error('Invalid palette index');
  const marks=Array.from({length:160},()=>{const x=40+random()*220,y=65+random()*250,r=.25+random()*.8;return circle(x.toFixed(2),y.toFixed(2),r.toFixed(2),PAPER,`opacity="${(.12+random()*.3).toFixed(2)}"`);}).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" ${label?`role="img" aria-labelledby="title-${id}"`:'aria-hidden="true"'}><title id="title-${id}">${recipe.name}, ${recipe.energy}</title><defs><clipPath id="body-${id}">${bodyPath(body,INK)}</clipPath></defs><g transform="rotate(${body.tilt} 150 220)">${limbs(recipe.limbs)}${spikes(recipe.spikes,color)}${bodyPath(body,color)}<g clip-path="url(#body-${id})">${pattern(recipe.pattern,color)}${marks}</g>${eyes.map((e,i)=>eye(e,random,i)).join('')}${mouth(mouthRecipe,id)}</g></svg>`;
}
