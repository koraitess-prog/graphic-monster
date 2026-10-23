import {rng,sample,limb} from './anidoodle-kit.js';
export const PAPER='#f7f4ec';
export const C={ink:'#30313b',cream:'#f4e9ce',violet:'#8586a1',violetDark:'#626883',coral:'#cf7866',ochre:'#c7a14e',ochreDark:'#967a45',teal:'#658d87',tealDark:'#3f6969',pink:'#ce9e9b'};
export const specimens=[
 {name:'Murmur',seed:1042,kind:'murmur',subtitle:'The gentle observer',description:'Notices everything. Says very little. Keeps an eye on the things everyone else walks past.',principles:{typography:'Soft counters',grid:'Clustered / free',color:'Violet + rust',shape:'Broad / organic',texture:'Gouache + pencil'},dna:{counter:.72,order:.2,colorSpread:.65,elongation:.3,tooth:.85}},
 {name:'Tilly',seed:2087,kind:'tilly',subtitle:'The wandering thought',description:'Always looking in two directions. Takes a very long step, then thinks about where to land.',principles:{typography:'Tall ascenders',grid:'Extended / offset',color:'Ochre + rose',shape:'Light / elongated',texture:'Dry brush + ink'},dna:{counter:.45,order:.6,colorSpread:.35,elongation:.95,tooth:.65}},
 {name:'Oddo',seed:5077,kind:'oddo',subtitle:'The lateral thinker',description:'Follows the curve of a thought. Leaves a little space for an idea that hasn’t arrived yet.',principles:{typography:'Open aperture',grid:'Asymmetric / folded',color:'Petrol + apricot',shape:'Curled / off-center',texture:'Scumble + hatching'},dna:{counter:.9,order:.15,colorSpread:.55,elongation:.6,tooth:.75}}
];
const oval=(x,y,rx,ry,angle=0)=>Array.from({length:32},(_,i)=>{const a=i/32*Math.PI*2,r=1+Math.sin(i*2.7)*.018;return[x+Math.cos(a)*rx*r*Math.cos(angle)-Math.sin(a)*ry*r*Math.sin(angle),y+Math.cos(a)*rx*r*Math.sin(angle)+Math.sin(a)*ry*r*Math.cos(angle)];});

/** All creature geometry is authored in a shared scene grammar, rendered by one hand.
 * DNA is upstream of anatomy and pigment; no questionnaire is implemented. */
export function buildScene(recipe){
 const shapes=[],lines=[],eyes=[];let serial=0;
 const S=(points,color,opts={})=>{const s={points:opts.raw?points:sample(points,true,10),color,seed:recipe.seed+serial++*31,texture:1,...opts};shapes.push(s);return s;};
 const L=(points,color=C.ink,width=2,opts={})=>lines.push({points:sample(points,false,12),color,width,seed:recipe.seed+serial++*17,...opts});
 const tube=(pts,radii,color,opts={})=>S(limb(pts,radii),color,{raw:true,...opts});
 const O=(x,y,rx,ry,color,opts={})=>S(oval(x,y,rx,ry,opts.angle||0),color,{raw:true,...opts});
 const hand=(x,y,angle,size=1)=>{const f=(u,v)=>[x+(u*Math.cos(angle)-v*Math.sin(angle))*size,y+(u*Math.sin(angle)+v*Math.cos(angle))*size];S([f(-8,7),f(-10,-4),f(-8,-19),f(-4,-23),f(-1,-18),f(0,-4),f(3,-28),f(7,-31),f(10,-26),f(9,-5),f(17,-27),f(22,-28),f(23,-22),f(17,1),f(28,-13),f(33,-13),f(34,-8),f(16,14),f(5,18)],C.ink,{texture:.7,flow:angle+1.3});};
 const foot=(x,y,dir,color=C.ink,w=1)=>{S([[x-dir*9,y-18],[x+dir*9,y-19],[x+dir*14,y-6],[x+dir*34*w,y-9],[x+dir*49*w,y-1],[x+dir*48*w,y+7],[x+dir*4,y+9],[x-dir*11,y+5]],color,{flow:.1,texture:.8});for(let j=0;j<3;j++)L([[x+dir*(22+j*8)*w,y-5],[x+dir*(27+j*8)*w,y+5]],C.cream,1.4,{alpha:.55});};
 const eye=(x,y,r,opts={})=>eyes.push({x,y,r,ry:r*(opts.aspect||1.09),rim:C.coral,iris:C.ink,gaze:[2,2],...opts});
 if(recipe.kind==='murmur'){
  tube([[222,555],[215,612],[193,651]],[11,8,7],C.ink);foot(191,654,-1);
  tube([[337,561],[340,607],[363,648]],[13,9,8],C.ink);foot(366,654,1);
  S([[142,330],[104,304],[92,281],[107,270],[132,283],[154,314]],C.ochre,{flow:1});
  S([[125,390],[79,375],[65,353],[79,339],[106,354],[141,374]],C.teal,{flow:.7});
  S([[129,448],[88,458],[67,445],[72,427],[103,420],[143,433]],C.coral,{flow:.2});
  S([[267,171],[249,126],[252,101],[269,99],[283,131],[282,169]],C.coral,{flow:1.4});
  S([[306,174],[319,125],[339,111],[351,119],[342,149],[327,181]],C.teal,{flow:1.9});
  tube([[387,384],[439,411],[467,380],[478,337]],[9,7,6,5],C.ink);hand(478,329,.12,.85);
  S([[273,157],[326,174],[367,225],[396,290],[418,367],[428,455],[401,525],[346,567],[264,588],[188,569],[137,528],[119,466],[128,397],[145,323],[163,257],[207,193]],C.violet,{flow:1.4,texture:1.1,furry:true,body:true});
  S([[233,423],[274,410],[307,446],[330,508],[305,557],[257,565],[224,528],[218,472]],'#b6b1b7',{texture:1.4,flow:1.3,soft:true});
  for(const [x,y,rx,ry,c] of [[172,414,9,17,C.ochre],[184,449,7,14,C.coral],[165,475,8,19,C.ochre],[194,490,6,12,C.teal],[370,425,7,16,C.tealDark],[382,455,6,12,C.teal],[365,486,7,18,C.tealDark]])O(x,y,rx,ry,c,{angle:.2,texture:1.2});
  tube([[161,386],[152,442],[161,497]],[1,5,4],C.ink);hand(162,499,Math.PI,.72);
  eye(290,286,41,{rim:C.coral,iris:C.ochre,gaze:[4,4],detail:true});eye(222,255,20,{rim:C.teal,gaze:[4,2]});eye(330,223,18,{rim:C.ochre,gaze:[0,4]});eye(187,320,24,{rim:C.cream,gaze:[5,-1]});eye(367,312,22,{rim:C.teal,gaze:[-1,3]});eye(244,339,12,{rim:C.ochre,gaze:[2,0]});eye(311,359,14,{rim:C.coral,gaze:[3,-2]});
  O(220,378,16,9,C.pink,{texture:.7});O(350,386,19,11,C.coral);
  L([[270,378],[273,393],[284,400],[297,394],[304,381]],C.ink,5.5);L([[148,522],[174,545],[199,552]],C.violetDark,1.5,{alpha:.6});
 }else if(recipe.kind==='tilly'){
  tube([[246,366],[239,475],[221,561],[204,648]],[10,8,6,8],C.ochre,{flow:1.5});tube([[313,365],[327,457],[346,544],[353,649]],[11,8,6,8],C.ochre,{flow:1.4});
  tube([[223,552],[212,603],[204,649]],[7,7,8],C.pink);tube([[346,557],[348,607],[353,649]],[7,7,8],C.coral);
  for(let j=0;j<5;j++){const y=570+j*16;L([[214-(y-570)*.19,y],[228-(y-570)*.19,y+3]],C.ink,3,{alpha:.72});L([[340+(y-570)*.08,y+6],[353+(y-570)*.08,y+8]],C.ink,3,{alpha:.65});}
  foot(204,654,-1,C.ochre,1.1);foot(353,654,1,C.ochre,1.05);
  tube([[193,311],[153,351],[160,406],[167,429]],[9,7,5,4],C.ochre,{flow:1.8});hand(167,435,2.9,.7);
  tube([[353,309],[395,277],[418,222],[427,188]],[9,7,5,4],C.ochre,{flow:1.5});hand(428,184,.12,.8);
  S([[180,268],[204,241],[249,236],[293,247],[335,267],[365,295],[363,329],[339,366],[290,391],[235,382],[192,355],[174,313]],C.ochre,{flow:.4,texture:1.15,body:true});
  S([[214,351],[256,353],[294,342],[337,322],[347,344],[315,375],[273,383],[234,371]],'#ddba73',{texture:1.2,flow:-.3,soft:true});
  tube([[223,271],[212,221],[209,194]],[19,15,17],C.ochre);tube([[303,265],[316,222],[333,182]],[18,14,18],C.ochre);
  eye(207,211,43,{rim:C.ochreDark,iris:C.teal,gaze:[9,0],detail:true,aspect:1.13});eye(325,181,49,{rim:C.ochreDark,iris:C.teal,gaze:[-6,8],detail:true,aspect:1.12});
  for(let j=0;j<5;j++)L([[180+j*12,260-j*2],[177+j*12,245-j*3]],C.ink,1.5);
  O(208,311,13,8,C.coral);O(333,310,12,8,C.pink);
  S([[220,308],[251,318],[294,314],[332,297],[314,331],[276,344],[242,335]],C.ink,{texture:.6});S([[239,319],[252,322],[249,333],[242,331]],C.cream,{texture:.4});S([[296,314],[308,309],[306,324],[298,327]],C.cream,{texture:.4});
  L([[189,332],[214,349],[231,367]],C.ochreDark,1.4);for(const [x,y]of [[200,340],[215,350],[225,362],[320,358]])L([[x-4,y+3],[x+4,y-4]],C.ink,1.5);L([[271,254],[272,271],[282,282]],C.ochreDark,1.5);
 }else if(recipe.kind==='oddo'){
  S([[188,479],[146,483],[99,457],[73,417],[78,395],[95,402],[121,433],[174,442],[209,451]],C.coral,{flow:.7,texture:1.15});
  for(let j=0;j<4;j++)L([[94+j*17,427+j*10],[107+j*18,417+j*11]],C.ink,2,{alpha:.55});
  tube([[191,531],[183,594],[158,642]],[21,16,10],C.tealDark);foot(156,652,-1,C.tealDark,1.15);tube([[329,539],[351,583],[394,630]],[23,17,11],C.teal);foot(396,647,1,C.tealDark);tube([[272,549],[267,607],[277,648]],[14,9,8],C.tealDark);foot(276,655,1,C.tealDark,.65);
  tube([[311,192],[290,137],[265,112]],[7,5,3],C.ink);O(259,105,16,21,C.coral,{angle:-.7});tube([[360,185],[392,131],[428,119]],[7,4,3],C.ink);O(436,115,21,13,C.ochre,{angle:-.5});
  tube([[184,443],[141,418],[132,375]],[10,7,5],C.ink);hand(130,368,-.4,.7);tube([[354,393],[410,406],[432,448],[424,475]],[10,7,5,4],C.ink);hand(423,480,2.8,.8);
  S([[308,174],[349,170],[387,188],[407,220],[405,255],[379,282],[347,301],[340,336],[366,374],[386,422],[384,476],[352,528],[301,557],[235,564],[178,546],[151,511],[155,465],[179,428],[213,396],[238,356],[251,309],[250,261],[265,208]],C.teal,{flow:1.6,texture:1.2,body:true});
  S([[283,349],[303,366],[317,406],[317,452],[295,496],[250,519],[206,509],[215,482],[253,458],[270,422]],'#b5b8a0',{texture:1.3,flow:1.6,soft:true});
  eye(340,238,43,{rim:C.coral,iris:C.ochre,gaze:[-7,4],detail:true,aspect:1.02});L([[291,214],[310,195],[337,191]],C.tealDark,3.2);L([[334,302],[348,306],[363,296]],C.ink,4);L([[325,310],[332,316]],C.tealDark,1.4);O(381,276,12,7,C.coral,{angle:-.5});
  for(const [x,y]of [[190,470],[179,493],[192,519],[343,442],[352,470],[329,496]]){O(x,y,6,12,C.ochre,{angle:.5});L([[x-2,y-7],[x+3,y+5]],C.coral,1.2);}L([[236,345],[232,370],[214,391]],C.tealDark,1.5,{alpha:.75});
 }else throw new Error('Unknown creature anatomy');
 // Small, bounded changes preserve each authored concept's silhouette and clearances.
 // Typography opens counters; grid shifts eye organization; color changes accent mass.
 const dx=(recipe.dna.counter-.5),stretch=1+(recipe.dna.elongation-.5)*.09;
 for(const s of shapes){
   if([C.coral,C.pink,C.ochre].includes(s.color)&&!s.body){
     const center=s.points.reduce((a,p)=>[a[0]+p[0]/s.points.length,a[1]+p[1]/s.points.length],[0,0]);
     const k=1+(recipe.dna.colorSpread-.5)*.14;
     s.points=s.points.map(([x,y])=>[center[0]+(x-center[0])*k,center[1]+(y-center[1])*k]);
   }
 }
 for(const e of eyes){e.x+=(Math.round(e.x/20)*20-e.x)*recipe.dna.order*.3;e.y+=(Math.round(e.y/20)*20-e.y)*recipe.dna.order*.3;e.r*=1+dx*.08;e.ry*=1+dx*.08;}
 const transform=([x,y])=>[300+(x-300)*(1+dx*.06),660+(y-660)*stretch];
 for(const s of shapes)s.points=s.points.map(transform);for(const l of lines)l.points=l.points.map(transform);for(const e of eyes)[e.x,e.y]=transform([e.x,e.y]);
 return{shapes,lines,eyes,seed:recipe.seed,tooth:recipe.dna.tooth};
}
function path(points,closed=true){const p=new Path2D();points.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));if(closed)p.closePath();return p;}
function bounds(points){return points.reduce((b,[x,y])=>[Math.min(b[0],x),Math.min(b[1],y),Math.max(b[2],x),Math.max(b[3],y)],[Infinity,Infinity,-Infinity,-Infinity]);}
const mix=(a,b,t)=>{const rgb=s=>s.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)),aa=rgb(a),bb=rgb(b);return '#'+aa.map((v,i)=>Math.round(v+(bb[i]-v)*t).toString(16).padStart(2,'0')).join('');};
/** Anidoodle's gouache mark order: opaque mass, dry-brush bristles, pencil, ink.
 * Original procedural surface renderer. No assets, gradients, filters or clock. */
export function paint(ctx,s,tooth){
 const{points,color,seed,texture=1,flow=1.15}=s,r=rng(seed),b=bounds(points);
 // The pigment edge is physically irregular, not a filtered vector boundary.
 const edge=points.map(([x,y],i)=>[x+Math.sin(i*1.8+seed)*.55,y+Math.cos(i*2.3+seed)*.6]);
 const p=path(edge);ctx.fillStyle=color;ctx.globalAlpha=s.soft?0:1;ctx.fill(p);ctx.globalAlpha=1;
 if(s.furry)for(let i=0;i<points.length;i+=2){const[x,y]=points[i],q=points[(i+1)%points.length],dx=q[0]-x,dy=q[1]-y,len=Math.hypot(dx,dy)||1,length=3+r()*13;ctx.beginPath();ctx.moveTo(x-dy/len*2,y+dx/len*2);ctx.quadraticCurveTo(x+dy/len*length*.6+3,y-dx/len*length*.6+7,x+dy/len*length,y-dx/len*length+8);ctx.strokeStyle=mix(color,C.cream,r()*.28);ctx.lineWidth=.4+r()*1.7;ctx.globalAlpha=.3+r()*.5;ctx.stroke();}
 ctx.globalAlpha=1;ctx.save();ctx.clip(p);const area=(b[2]-b[0])*(b[3]-b[1]),n=Math.min(5200,Math.ceil(area*.035*texture));
 for(let i=0;i<n*(s.soft?.22:.11);i++){const x=b[0]+r()*(b[2]-b[0]),y=b[1]+r()*(b[3]-b[1]),len=10+r()*43,a=flow+Math.sin(x*.021+y*.01)*.35;ctx.strokeStyle=mix(color,i%3===0?C.cream:C.ink,i%3===0?.33:.21);ctx.globalAlpha=s.soft?.13+r()*.17:.025+r()*.065;ctx.lineWidth=4+r()*12;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+Math.cos(a)*len*.5+5,y+Math.sin(a)*len*.5,x+Math.cos(a)*len,y+Math.sin(a)*len);ctx.stroke();}
 for(let i=0;i<n;i++){const x=b[0]+r()*(b[2]-b[0]),y=b[1]+r()*(b[3]-b[1]),len=3+r()*24,a=flow+Math.sin(x*.018)*.25+(r()-.5)*.65,light=i%3!==0;ctx.strokeStyle=mix(color,light?C.cream:C.ink,light?.3+r()*.4:.25+r()*.18);ctx.globalAlpha=.12+r()*.3;ctx.lineWidth=.25+r()*1.1;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+Math.cos(a)*len*.4+1.5,y+Math.sin(a)*len*.45,x+Math.cos(a)*len,y+Math.sin(a)*len);ctx.stroke();}
 for(let i=0;i<n*2.7*tooth;i++){const x=b[0]+r()*(b[2]-b[0]),y=b[1]+r()*(b[3]-b[1]);ctx.fillStyle=i%5===0?C.ink:C.cream;ctx.globalAlpha=.045+r()*.15;ctx.fillRect(x,y,.25+r()*.9,.3+r()*.8);}
 ctx.restore();ctx.globalAlpha=1;
 if(s.body){for(let j=0;j<3;j++){const start=Math.floor(points.length*(.14+j*.27));ctx.beginPath();points.slice(start,start+17).forEach(([x,y],i)=>i?ctx.lineTo(x+1.3,y+.7):ctx.moveTo(x+1.3,y+.7));ctx.strokeStyle=mix(color,C.ink,.5);ctx.globalAlpha=.45;ctx.lineWidth=.8;ctx.stroke();}ctx.globalAlpha=1;}
}
function pencilLine(ctx,l){const r=rng(l.seed),s=l.points;ctx.globalAlpha=l.alpha??1;ctx.fillStyle=l.color;ctx.fill(path(limb([s[0],s[Math.floor(s.length*.35)],s[Math.floor(s.length*.7)],s.at(-1)],[l.width*.32,l.width*.56,l.width*.46,l.width*.13])));for(let j=0;j<2;j++){ctx.beginPath();s.forEach(([x,y],i)=>i?ctx.lineTo(x+(r()-.5)*.7,y+(r()-.5)*.7):ctx.moveTo(x,y));ctx.strokeStyle=l.color;ctx.lineWidth=.45;ctx.globalAlpha=(l.alpha??1)*.4;ctx.stroke();}ctx.globalAlpha=1;}
function drawEye(ctx,e,seed,tooth){
 const r=rng(seed),{x,y,r:radius,ry,rim,iris,gaze,detail}=e,shape=(rx,rry,col,k)=>paint(ctx,{points:oval(x,y,rx,rry),color:col,seed:seed+k,texture:.6,flow:1.1},tooth);
 shape(radius+6,ry+6,rim,0);shape(radius,ry,C.cream,1);
 for(let j=0;j<2;j++){ctx.strokeStyle=mix(rim,C.ink,.4);ctx.globalAlpha=.46;ctx.lineWidth=.65;ctx.stroke(path(oval(x+.7+j*.4,y-.6,radius+4+j*2,ry+3+j*1.5)));}ctx.globalAlpha=1;
 const ix=x+gaze[0],iy=y+gaze[1],ir=radius*.52;
 if(detail){paint(ctx,{points:oval(ix,iy,ir,ir*1.05),color:iris,seed:seed+20,texture:1.1,flow:1},tooth);for(let j=0;j<44;j++){const a=j/44*Math.PI*2,lo=ir*(.58+r()*.08),hi=ir*(.87+r()*.12);ctx.beginPath();ctx.moveTo(ix+Math.cos(a)*lo,iy+Math.sin(a)*lo);ctx.lineTo(ix+Math.cos(a)*hi,iy+Math.sin(a)*hi);ctx.strokeStyle=j%3?mix(iris,C.ink,.45):C.cream;ctx.globalAlpha=.55;ctx.lineWidth=.5+r()*.6;ctx.stroke();}ctx.globalAlpha=1;}
 const pr=radius*(detail?.28:.32);ctx.fillStyle=C.ink;ctx.fill(path(oval(ix,iy,pr,pr*1.06)));if(radius>30){ctx.fillStyle=C.cream;ctx.beginPath();ctx.arc(ix-pr*.32,iy-pr*.39,pr*.17,0,Math.PI*2);ctx.fill();}
}
export function drawMonster(canvas,recipe,{scale=2}={}){
 canvas.width=600*scale;canvas.height=760*scale;const ctx=canvas.getContext('2d');ctx.scale(scale,scale);ctx.lineCap='round';ctx.lineJoin='round';ctx.fillStyle=PAPER;ctx.fillRect(0,0,600,760);
 const scene=buildScene(recipe),r=rng(recipe.seed+998);
 for(let i=0;i<650;i++){const x=300+(r()+r()-1)*185,y=665+(r()+r()-1)*9;ctx.strokeStyle=C.ink;ctx.globalAlpha=.015+r()*.025;ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+3+r()*15,y-.6);ctx.stroke();}ctx.globalAlpha=1;
 for(const s of scene.shapes)paint(ctx,s,scene.tooth);scene.eyes.forEach((e,i)=>drawEye(ctx,e,recipe.seed+500+i*37,scene.tooth));for(const l of scene.lines)pencilLine(ctx,l);
 for(let i=0;i<18000;i++){ctx.fillStyle=i%2?C.ink:C.cream;ctx.globalAlpha=.018+r()*.025;ctx.fillRect(r()*600,r()*760,.3+r()*.5,.3+r()*.5);}ctx.globalAlpha=1;return scene;
}
