import {paintCreatureName,nameLines,CREATURE_LETTER_FONT} from './creature-lettering.js';

// Anidoodle's bake-once/composite-on-input: the host owns attention and time;
// each numbered print plate is deterministic and keeps the exact letter mask.
const mounts=new WeakMap();
export function mountLivingTitle(title){
 const canvas=title.querySelector('canvas'),button=title.closest('button');
 if(!canvas||!button||mounts.has(title))return;
 const text=title.textContent,frames=new Map(),media=matchMedia('(prefers-reduced-motion: reduce)');
 const base=document.createElement('canvas');base.width=canvas.width;base.height=canvas.height;base.getContext('2d').drawImage(canvas,0,0);frames.set(0,base);
 const measure=base.getContext('2d');measure.font=CREATURE_LETTER_FONT;
 const letters=[];
 nameLines(text).forEach((line,row)=>{
  const origin=(canvas.width-measure.measureText(line).width)/2;let prefix='';
  for(const char of Array.from(line)){
   prefix+=char;if(char===' ')continue;
   const metric=measure.measureText(char),x=origin+measure.measureText(prefix).width-metric.width;
   const left=Math.floor(x-metric.actualBoundingBoxLeft-2),right=Math.ceil(x+metric.actualBoundingBoxRight+2),top=row*138;
   const mask=document.createElement('canvas');mask.width=right-left;mask.height=138;
   const g=mask.getContext('2d');g.font=CREATURE_LETTER_FONT;g.fillStyle='#fff';g.fillText(char,x-left,111);
   letters.push({char,index:letters.length,left,top,width:mask.width,height:mask.height,inkTop:top+111-metric.actualBoundingBoxAscent,inkBottom:top+111+metric.actualBoundingBoxDescent,mask});
  }
 });
 const patch=document.createElement('canvas');
 let timer=0,phase=0,active=null,visible=true;
 const render=index=>{
  if(!frames.has(index)){const plate=document.createElement('canvas');paintCreatureName(plate,text,{align:'center',texturePhase:index});frames.set(index,plate);}
  const g=canvas.getContext('2d');g.clearRect(0,0,canvas.width,canvas.height);g.drawImage(base,0,0);
  if(index&&active){
   // Clip the replacement print to this glyph's actual ink mask. Neighbouring
   // letters, counters and the other line retain the original baked pixels.
   patch.width=active.width;patch.height=active.height;const p=patch.getContext('2d');
   p.drawImage(frames.get(index),-active.left,-active.top);p.globalCompositeOperation='destination-in';p.drawImage(active.mask,0,0);
   g.save();g.globalCompositeOperation='destination-out';g.drawImage(active.mask,active.left,active.top);g.restore();g.drawImage(patch,active.left,active.top);
  }
  canvas.dataset.texturePhase=String(index);canvas.dataset.activeLetter=active?.char??'';
  canvas.dataset.activeLetterIndex=active?String(active.index):'';
  canvas.dataset.activeLetterBounds=active?JSON.stringify([active.left,active.top,active.width,active.height]):'';
 };
 const stop=()=>{clearInterval(timer);timer=0;phase=0;render(0);};
 const update=()=>{
  if(!active||!visible||document.hidden){stop();return;}
  if(media.matches){clearInterval(timer);timer=0;render(1);return;}
  if(timer)return;
  phase=1;render(phase);
  timer=setInterval(()=>{phase=phase%5+1;render(phase);},420);
 };
 const point=e=>{
  if(e.pointerType!=='mouse')return;
  const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;
  const next=letters.find(l=>x>=l.left&&x<l.left+l.width&&y>=l.inkTop-3&&y<=l.inkBottom+3)??null;
  if(next===active)return;
  clearInterval(timer);timer=0;active=next;update();
 };
 const leave=()=>{active=null;update();};
 button.addEventListener('pointerenter',point);button.addEventListener('pointermove',point);button.addEventListener('pointerleave',leave);
 button.addEventListener('pointercancel',leave);
 media.addEventListener('change',update);document.addEventListener('visibilitychange',update);
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();});observer.observe(button);
 title.dataset.livingTitle='true';canvas.dataset.texturePhase='0';
 mounts.set(title,()=>{
  clearInterval(timer);observer.disconnect();frames.clear();
  button.removeEventListener('pointerenter',point);button.removeEventListener('pointermove',point);button.removeEventListener('pointerleave',leave);
  button.removeEventListener('pointercancel',leave);
  media.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);mounts.delete(title);
 });
}
export function releaseLivingTitles(root){for(const title of root.querySelectorAll('[data-living-title]'))mounts.get(title)?.();}
