import {engravingTile} from './engraving.js';
import {tornContour,paperCutout} from './paper-library.js';
import {rng} from './anidoodle-kit.js';

// Distinct silhouettes and negative spaces, printed with the creatures' material.
const cache=new Map(),cream='#e8ddba',ochre='#d6a333',ink='#151a1b',pink='#ce6587',teal='#519f7d',blue='#5765c4',red='#f05226';
const factory=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const contextStocks=new WeakMap();
export function drawQuestionObject(g,value,makeCanvas=factory,phase=0){
 const routes={'route-built':['typography','grid'],'route-sensory':['color','texture'],'route-marks':['shape','texture']};
 if(routes[value]){routes[value].forEach((v,i)=>{g.save();g.translate(i?72:0,i?34:0);g.scale(.67,.67);drawQuestionObject(g,v,makeCanvas,phase);g.restore();});return;}
 const seed=[...value].reduce((n,c)=>n*31+c.charCodeAt(0),7)>>>0,random=rng(seed);let piece=0;
 if(!contextStocks.has(g))contextStocks.set(g,new Map());const stocks=contextStocks.get(g);
 const paint=(color,pattern)=>{const key=color+'/'+pattern;if(stocks.has(key))return stocks.get(key);const {tile,transform}=engravingTile(makeCanvas,{color,texture:.25,printRevision:3,grainPhase:2,grainAngle:-7,paperPattern:pattern});const fill=g.createPattern(tile,'repeat');fill.setTransform(transform);stocks.set(key,fill);return fill;};
 const outline=points=>{g.beginPath();tornContour(points,seed+piece++, .65).forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();};
 const paper=(points,color=cream,pattern)=>{outline(points);g.fillStyle=paint(color,pattern);g.fill();};
 const strip=(x,y,w,h,color=cream)=>paper([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],color);
 const blob=(cx,cy,rx,ry,color,phase=0)=>paper(Array.from({length:44},(_,i)=>{const a=i/44*Math.PI*2,r=1+.07*Math.sin(a*5+phase)+.04*Math.cos(a*9);return [cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r];}),color);
 const ribbon=(points,width,color)=>{const side=sign=>points.map(([x,y],i)=>{const p=points[Math.max(0,i-1)],q=points[Math.min(points.length-1,i+1)],dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy)||1;return [x-dy/len*width*sign/2,y+dx/len*width*sign/2];});paper([...side(1),...side(-1).reverse()],color);};
 const cut=(family,index,x,y,w,h,color,angle=0)=>paper(paperCutout(family,index,{x,y,width:w,height:h,angle}).points,color,family==='typography'?'newsprint':undefined);
 g.save();
 // Deform the material in its own idiom; the marks move with the paper.
 if(phase){const s=Math.sin(phase*Math.PI*2);g.translate(100,60);
  if(value==='typography')g.scale(1-.12*s,1+.06*s);
  else if(value==='grid'||value==='order')g.transform(1,0,.14*s,1,0,0);
  else if(value==='color')g.scale(1+.11*s,1-.08*s);
  else if(value==='texture'||value==='rich')g.rotate(s*.065);
  else if(value==='shape'||value==='playful'||value==='experiment')g.transform(1,s*.12,-s*.12,1,0,-4*s);
  else g.scale(1+.07*s,1-.07*s);
  g.translate(-100,-60);
 }
 if(value==='typography'){
  paper([[24,99],[54,18],[70,18],[99,99],[76,99],[62,51],[44,99]],cream);strip(43,70,37,11,cream);
  cut('typography',2,111,62,57,80,pink);strip(87,22,13,78,pink);strip(145,49,12,51,ochre);blob(151,30,8,8,ochre);
 }
 if(value==='grid'){
  for(let i=0;i<4;i++)strip(43+i*29,17,12,88,teal);
  for(let i=0;i<3;i++)strip(28,30+i*29,141,12,cream);
  for(let y=0;y<3;y++)for(let x=0;x<4;x++)if((x+y)%2===0)strip(43+x*29,30+y*29,12,12,teal);
 }
 if(value==='color'){
  blob(78,56,50,39,red,.7);blob(121,70,48,37,blue,2);paper([[91,27],[117,35],[124,68],[101,91],[85,72]],ochre);
 }
 if(value==='shape')cut('shape',1,102,61,130,104,teal,-.24);
 if(value==='texture'){
  g.save();g.translate(37,23);g.rotate(-.14);g.fillStyle=cream;
  for(let i=0;i<360;i++){const x=random()*126,y=random()*78,edge=Math.sin(x*.06)*8;if(y>edge+4&&y<70+edge){g.globalAlpha=.22+random()*.65;g.fillRect(x,y,1+random()*3,1+random()*12);}}
  g.globalAlpha=1;g.strokeStyle=ochre;g.lineWidth=2;
  for(let i=0;i<8;i++){g.beginPath();g.moveTo(5+i*14,7);g.lineTo(16+i*14,69);g.stroke();}g.restore();
 }
 if(value==='order'){for(let i=0;i<5;i++)strip(29,23+i*17,142,7,i===2?ochre:cream);strip(29,19,5,87,ochre);}
 if(value==='experiment'){
  ribbon([[30,91],[55,27],[134,85],[67,98],[83,18],[156,42],[130,102]],12,cream);ribbon([[39,42],[103,64],[159,24]],7,ochre);
 }
 if(value==='clarity'){blob(100,60,43,43,ochre);blob(100,60,13,13,ink);}
 if(value==='expression'){
  paper([[24,77],[46,20],[100,28],[149,14],[174,62],[150,104],[73,96]],pink);
  g.save();g.globalCompositeOperation='destination-out';
  [[54,58,15],[93,48,7],[126,68,22],[146,35,5],[86,83,4]].forEach(([x,y,r])=>blob(x,y,r,r,'#000'));g.restore();
 }
 if(value==='minimal'){paper([[34,24],[165,19],[158,104],[29,96]],cream);ribbon([[92,53],[107,62]],3,ink);}
 if(value==='rich'){
  paper([[22,52],[39,20],[158,16],[178,78],[150,106],[36,102]],ochre,'newsprint');
  cut('typography',2,65,61,76,80,blue,-.35);paper([[78,14],[149,27],[125,91],[60,78]],pink,'magazine-type');
  paper([[30,84],[158,43],[167,63],[45,107]],cream,'newsprint');for(let i=0;i<5;i++)strip(127+i*6,74-i*3,3,22,ink);
 }
 if(value==='precise'){ribbon([[27,95],[94,21],[163,94]],10,cream);paper([[94,21],[99,51],[163,94],[146,77]],ochre);}
 if(value==='playful'){
  const p=Array.from({length:100},(_,i)=>{const t=i/99*Math.PI*3.1,r=34*(1-i/140);return [101+Math.cos(t)*r+(i/99-.5)*76,60+Math.sin(t)*r];});
  ribbon(p,11,pink);ribbon([[30,87],[42,104],[57,96]],7,ochre);
 }
 g.restore();
}
export function paintQuestionPaper(canvas,value){
 canvas.width=600;canvas.height=360;const target=canvas.getContext('2d');
 if(!cache.has(value)){const plate=factory(600,360),g=plate.getContext('2d');g.scale(3,3);drawQuestionObject(g,value);cache.set(value,plate);}
 target.drawImage(cache.get(value),0,0);
}
export function mountQuestionPapers(root){
 const events=new AbortController(),media=matchMedia('(prefers-reduced-motion:reduce)'),jobs=new Map();
 const stop=c=>{cancelAnimationFrame(jobs.get(c));jobs.delete(c);paintQuestionPaper(c,c.dataset.paperChoice);};
 for(const c of root.querySelectorAll('canvas[data-paper-choice]')){
  paintQuestionPaper(c,c.dataset.paperChoice);const button=c.closest('button');if(!button)continue;
  let hovering=false;
  const play=()=>{if(media.matches||document.hidden||jobs.has(c))return;const start=performance.now();let last=0;
   const frame=now=>{if(!c.isConnected||document.hidden||media.matches){stop(c);return;}const elapsed=(now-start)/900;
    if(elapsed>=1&&!hovering){stop(c);return;}
    if(now-last>40){const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.scale(3,3);drawQuestionObject(g,c.dataset.paperChoice,factory,elapsed);last=now;}
    jobs.set(c,requestAnimationFrame(frame));};jobs.set(c,requestAnimationFrame(frame));};
  const on=(event,fn)=>button.addEventListener(event,fn,{signal:events.signal});
  on('pointerenter',e=>{if(e.pointerType!=='touch'){hovering=true;play();}});on('focus',()=>{hovering=true;play();});
  on('pointerleave',()=>hovering=false);on('blur',()=>hovering=false);on('pointerdown',()=>{hovering=false;play();});
 }
 const halt=()=>{for(const c of jobs.keys())stop(c);};document.addEventListener('visibilitychange',halt,{signal:events.signal});media.addEventListener('change',halt,{signal:events.signal});
 return ()=>{events.abort();halt();};
}
