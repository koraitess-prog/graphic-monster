import {engravingTile} from './engraving.js';
import {scatterImpulse,advancePaper} from './paper-scatter.js';
import {tornContour} from './paper-library.js';
const cover=document.querySelector('#paper-cover');
if(cover){
 const canvas=cover.querySelector('canvas'),ctx=canvas.getContext('2d'),skip=cover.querySelector('button'),media=matchMedia('(prefers-reduced-motion: reduce)');
 let papers=[],width=0,height=0,raf=0,last=0,cleared=false,previous=null,finishing=false;
 const factory=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const palette=['#d8cfb4','#e8ddba','#ce6587','#f05226','#519f7d','#5765c4','#d6a333','#b5a0c6'];
 const kinds=['newsprint','magazine-type','oversized-type','checks','stripes-diagonal','dots-large','stripes-wave',null];
 const sprites=palette.map((color,i)=>{
  const w=320,h=256,c=factory(w,h),g=c.getContext('2d'),{tile,transform}=engravingTile(factory,{color,texture:.3,printRevision:3,grainPhase:i%2,grainAngle:0,paperPattern:kinds[i]});
  const p=g.createPattern(tile,'repeat');p.setTransform(transform);
  g.beginPath();tornContour([[3,7],[w*.32,1],[w-4,6],[w-1,h*.43],[w-7,h-2],[w*.61,h-6],[2,h-1],[6,h*.55]],i,2.1).forEach(([x,y],j)=>j?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=p;g.fill();
  // A second large printed clipping, rather than a uniform wallpaper texture.
  if(i===1||i===2){g.save();g.clip();g.fillStyle='#151a1b';g.font=i===1?'900 132px Georgia':'900 124px Arial';g.fillText(i===1?'Aa':'FORM',-12,196);g.restore();}
  return c;
 });
 function deactivate(){
  cancelAnimationFrame(raf);raf=0;cover.hidden=true;
  document.querySelector('#app')?.removeAttribute('inert');document.querySelector('.site-header')?.removeAttribute('inert');
 }
 function finish(){if(cleared)return;cleared=true;cover.dataset.cleared='true';deactivate();}
 function draw(){
  ctx.clearRect(0,0,width,height);
  for(const p of papers)if(!p.gone){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.shadowColor='#080d1045';ctx.shadowBlur=3;ctx.shadowOffsetY=2;ctx.drawImage(sprites[p.stock],-p.w/2,-p.h/2,p.w,p.h);ctx.restore();}
 }
 function resize(){
  if(cleared||cover.hidden)return;
  width=innerWidth;height=innerHeight;const dpr=Math.min(1.5,devicePixelRatio||1);canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  finishing=false;cover.style.pointerEvents='';
  const cols=Math.ceil(width/(width<650?110:170))+2,rows=Math.ceil(height/(width<650?100:135))+2,sx=width/(cols-2),sy=height/(rows-2);
  papers=[];for(let y=-1;y<rows-1;y++)for(let x=-1;x<cols-1;x++){const i=(y+1)*cols+x+1;papers.push({x:(x+.5)*sx,y:(y+.5)*sy,w:sx*1.9,h:sy*1.95,angle:Math.sin(i*9)*.22,stock:(i*7+Math.floor(i/cols)*3)%sprites.length,vx:0,vy:0,spin:0,awake:false,gone:false});}
  // A reproducible shuffle supplies the loose, overlapping pile.
  papers.sort((a,b)=>Math.sin(a.x*4+a.y)-Math.sin(b.x*4+b.y));draw();cover.dataset.ready='true';cover.dataset.remaining=String(papers.length);
 }
 function frame(now){
  if(cleared||document.hidden){raf=0;last=0;return;}
  const step=Math.min(2.2,last?(now-last)/16.667:1);last=now;let moving=false;
  for(const p of papers){advancePaper(p,step,width,height,media.matches);if(p.awake&&!p.gone)moving=true;}
  draw();
  const remaining=papers.filter(p=>!p.gone).length;cover.dataset.remaining=String(remaining);
  if(!finishing&&remaining<papers.length*.52){
   finishing=true;cover.style.pointerEvents='none';document.querySelector('#app')?.removeAttribute('inert');document.querySelector('.site-header')?.removeAttribute('inert');
   // Once the visitor opens the pile, the loose edge scraps follow the sweep.
   // The revealed name field is usable immediately; no edge-cleaning chore.
   for(const p of papers)if(!p.gone){p.awake=true;const dx=p.x-width/2,dy=p.y-height/2,n=Math.hypot(dx,dy)||1;p.vx+=dx/n*9;p.vy+=dy/n*9;p.spin+=(dx>=0?1:-1)*.015;}
   moving=true;
  }
  if(remaining<=Math.max(3,papers.length*.06)){finish();return;}
  if(moving)raf=requestAnimationFrame(frame);else{raf=0;last=0;}
 }
 function disturb(event){
  if(cleared||event.pointerType==='touch'&&event.type==='pointermove'&&!event.buttons)return;
  const p={x:event.clientX,y:event.clientY},velocity=previous?{x:Math.max(-36,Math.min(36,p.x-previous.x)),y:Math.max(-36,Math.min(36,p.y-previous.y))}:{x:0,y:-10};
  previous=p;let hit=false;
  for(const paper of papers)if(!paper.gone&&scatterImpulse(paper,p,velocity))hit=true;
  if(hit&&!raf)raf=requestAnimationFrame(frame);
 }
 function activate(){
  if(cleared)return;cover.hidden=false;document.querySelector('#app')?.setAttribute('inert','');document.querySelector('.site-header')?.setAttribute('inert','');resize();
 }
 skip.addEventListener('click',()=>{finish();document.querySelector('#monster-name')?.focus();});
 cover.addEventListener('pointerdown',event=>{cover.setPointerCapture(event.pointerId);disturb(event);});cover.addEventListener('pointermove',disturb);cover.addEventListener('pointerleave',()=>previous=null);cover.addEventListener('pointerup',()=>previous=null);
 window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!cleared&&!cover.hidden&&!raf)raf=requestAnimationFrame(frame);});
 window.addEventListener('graphic-monster:intro',event=>event.detail?activate():deactivate());
 let intro=!location.hash||location.hash.startsWith('#dna=');try{const s=JSON.parse(sessionStorage.getItem('graphic-monster:experience:v2'));if(s&&s.screen!=='intro')intro=false;}catch{}
 if(intro)activate();else deactivate();
}
