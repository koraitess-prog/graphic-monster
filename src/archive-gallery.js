import {supportsFamilyMotion,familyPose,familyProfile,signatureAction} from './family-motion.js';
import {loadPaintTiles} from './paint-cache.js?v=laboratory1';
import {MonsterRenderer} from './renderer.js?v=laboratory1';
import {idlePose,motionProfile} from './motion.js';
// One scheduler for the visible collection. Offscreen windows release their pixel
// buffers. Pigment images are shared globally by the existing renderer.
export class LivingArchive{
 constructor(root,records){
  this.root=root;this.items=new Map();this.raf=0;this.timer=0;this.media=matchMedia('(prefers-reduced-motion: reduce)');
  this.events=new AbortController();
  this.onChange=()=>{this.stop();for(const item of this.items.values())if(item.visible){item.active=false;item.canvas.dataset.motion='rest';item.renderer?.draw(item.record.scene);}this.schedule();};
  this.media.addEventListener('change',this.onChange);document.addEventListener('visibilitychange',this.onChange);
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){const item=this.items.get(entry.target);if(!item)continue;item.visible=entry.isIntersecting;
   if(item.visible){if(!item.renderer)item.renderer=new MonsterRenderer(item.canvas,{scale:.6,background:"#202426"});else item.renderer.resize(.6);item.renderer.draw(item.record.scene);item.canvas.dataset.motion='rest';void loadPaintTiles(item.record.scene).then(()=>{if(item.visible&&!item.active)item.renderer?.draw(item.record.scene);});item.due=performance.now()+650+(item.record.seed*107+item.index*1399)%3100;if(matchMedia('(hover: none)').matches&&!item.seen){item.requested=true;item.due=performance.now()+280;}item.seen=true;}
   else{item.active=false;item.canvas.dataset.motion='offscreen';item.renderer?.resize(.002);}
  }this.schedule();},{threshold:.12});this.observer=observer;
  root.querySelectorAll('[data-specimen]').forEach((window,index)=>{const record=records[index],canvas=window.querySelector('canvas'),item={record,canvas,index,visible:false,active:false,due:0,event:index,renderer:null};this.items.set(window,item);observer.observe(window);
   const notice=()=>{if(item.attended)return;item.attended=this.greet(item);};
   const leave=()=>{item.attended=false;};
   window.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')notice();},{signal:this.events.signal});
   window.addEventListener('focus',notice,{signal:this.events.signal});
   window.addEventListener('pointerleave',leave,{signal:this.events.signal});window.addEventListener('blur',leave,{signal:this.events.signal});
   window.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')notice();},{signal:this.events.signal});
  });
 }
 greet(item){
  if(this.media.matches||document.hidden||!item.visible)return false;
  // The next available slot belongs to the visitor, never eighty simultaneous waves.
  const now=performance.now(),active=[...this.items.values()].filter(i=>i.visible&&i.active&&i!==item);
  if(active.length>=2){const yieldItem=active.find(i=>!i.attended)??active.find(i=>!i.visitor);if(yieldItem){yieldItem.active=false;yieldItem.canvas.dataset.motion='rest';yieldItem.due=now+9000;yieldItem.renderer?.draw(yieldItem.record.scene);}}
  item.requested=true;item.due=now;if(item.active){item.active=false;item.renderer?.draw(item.record.scene);}this.schedule();return true;
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
  for(const item of [...this.items.values()].sort((a,b)=>Number(b.requested??false)-Number(a.requested??false))){
   if(!item.visible)continue;
   if(!item.active&&now>=item.due&&slots>0){slots--;item.active=true;item.visitor=!!item.requested;item.requested=false;item.action=item.visitor||!supportsFamilyMotion(item.record.scene)?'greet':signatureAction(item.record.scene,item.event);item.canvas.dataset.motion=item.visitor?'visitor-greeting':'greeting';item.start=now;item.last=0;}
   if(item.active){const family=supportsFamilyMotion(item.record.scene),performanceAction=family?item.action:'greet',notice=family&&item.visitor?320:0,duration=(family?familyProfile(item.record.scene)[performanceAction+'Duration']*1000:motionProfile(item.record.scene,item.event).duration)+notice,t=Math.min(1,(now-item.start)/duration);
    if(now-item.last>50||t===1){const elapsed=now-item.start,action=elapsed<notice?'look':performanceAction,phase=elapsed<notice?elapsed/notice:Math.max(0,(elapsed-notice)/(duration-notice));item.renderer.draw(family?familyPose(item.record.scene,action,Math.min(1,phase),now/1000+item.index*.7):idlePose(item.record.scene,t,item.event));item.last=now;}
    if(t===1){item.active=false;item.canvas.dataset.motion='rest';item.event++;item.due=now+7500+(item.record.seed*71+item.event*631)%9000;}else moving=true;
   }
   if(!item.active){
    if(supportsFamilyMotion(item.record.scene)&&idleBudget>0&&now-(item.breathed??0)>350){item.renderer.draw(familyPose(item.record.scene,'breathe',0,now/1000+item.index*.7));item.breathed=now;idleBudget--;}
    next=Math.min(next,Math.max(now+180,item.due),now+350);
   }
  }
  if(moving)this.raf=requestAnimationFrame(t=>this.tick(t));else if(Number.isFinite(next))this.timer=setTimeout(()=>this.tick(performance.now()),Math.max(0,next-performance.now()));
 }
 destroy(){this.stop();this.events.abort();this.observer.disconnect();this.media.removeEventListener('change',this.onChange);document.removeEventListener('visibilitychange',this.onChange);for(const i of this.items.values()){i.canvas.width=1;i.canvas.height=1;i.renderer?.patterns.clear();}this.items.clear();}
}
