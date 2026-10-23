import {supportsFamilyMotion,familyPose,familyProfile} from './family-motion.js';
import {loadPaintTiles} from './paint-cache.js?v=mobile2';
import {MonsterRenderer} from './renderer.js?v=mobile2';
import {idlePose,motionProfile} from './motion.js';
// One scheduler for the visible collection. Offscreen windows release their pixel
// buffers. Pigment images are shared globally by the existing renderer.
export class LivingArchive{
 constructor(root,records){
  this.root=root;this.items=new Map();this.raf=0;this.timer=0;this.media=matchMedia('(prefers-reduced-motion: reduce)');
  this.onChange=()=>{this.stop();for(const item of this.items.values())if(item.visible){item.active=false;item.canvas.dataset.motion='rest';item.renderer?.draw(item.record.scene);}this.schedule();};
  this.media.addEventListener('change',this.onChange);document.addEventListener('visibilitychange',this.onChange);
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){const item=this.items.get(entry.target);if(!item)continue;item.visible=entry.isIntersecting;
   if(item.visible){if(!item.renderer)item.renderer=new MonsterRenderer(item.canvas,{scale:.6,background:"#202426"});else item.renderer.resize(.6);item.renderer.draw(item.record.scene);item.canvas.dataset.motion='rest';void loadPaintTiles(item.record.scene).then(()=>{if(item.visible&&!item.active)item.renderer?.draw(item.record.scene);});item.due=performance.now()+650+(item.record.seed*107+item.index*1399)%3100;}
   else{item.active=false;item.canvas.dataset.motion='offscreen';item.renderer?.resize(.002);}
  }this.schedule();},{threshold:.12});this.observer=observer;
  root.querySelectorAll('[data-specimen]').forEach((window,index)=>{const record=records[index],canvas=window.querySelector('canvas');this.items.set(window,{record,canvas,index,visible:false,active:false,due:0,event:index,renderer:null});observer.observe(window);});
 }
 stop(){cancelAnimationFrame(this.raf);clearTimeout(this.timer);this.raf=0;this.timer=0;}
 schedule(){
  this.stop();if(document.hidden||this.media.matches)return;
  const visible=[...this.items.values()].filter(i=>i.visible);if(!visible.length)return;
  const now=performance.now(),soon=Math.min(...visible.map(i=>i.active?now:i.due));
  this.timer=setTimeout(()=>this.tick(performance.now()),Math.max(0,soon-now));
 }
 tick(now){
  if(document.hidden||this.media.matches)return;
  let moving=false,next=Infinity;let slots=Math.max(0,2-[...this.items.values()].filter(i=>i.visible&&i.active).length),idleBudget=2;
  for(const item of this.items.values()){
   if(!item.visible)continue;
   if(!item.active&&now>=item.due&&slots>0){slots--;item.active=true;item.canvas.dataset.motion='greeting';item.start=now;item.last=0;}
   if(item.active){const family=supportsFamilyMotion(item.record.scene),duration=family?familyProfile(item.record.scene).greetDuration*1000:motionProfile(item.record.scene,item.event).duration,t=Math.min(1,(now-item.start)/duration);
    if(now-item.last>50||t===1){item.renderer.draw(family?familyPose(item.record.scene,'greet',t,now/1000+item.index*.7):idlePose(item.record.scene,t,item.event));item.last=now;}
    if(t===1){item.active=false;item.canvas.dataset.motion='rest';item.event++;item.due=now+7500+(item.record.seed*71+item.event*631)%9000;}else moving=true;
   }
   if(!item.active){
    if(supportsFamilyMotion(item.record.scene)&&idleBudget>0&&now-(item.breathed??0)>350){item.renderer.draw(familyPose(item.record.scene,'breathe',0,now/1000+item.index*.7));item.breathed=now;idleBudget--;}
    next=Math.min(next,Math.max(now+180,item.due),now+350);
   }
  }
  if(moving)this.raf=requestAnimationFrame(t=>this.tick(t));else if(Number.isFinite(next))this.timer=setTimeout(()=>this.tick(performance.now()),Math.max(0,next-performance.now()));
 }
 destroy(){this.stop();this.observer.disconnect();this.media.removeEventListener('change',this.onChange);document.removeEventListener('visibilitychange',this.onChange);for(const i of this.items.values()){i.canvas.width=1;i.canvas.height=1;i.renderer?.patterns.clear();}this.items.clear();}
}
