export function inPaperVortex(x,y,rect){
 const rx=Math.min(rect.width*.43,170),ry=Math.min(rect.height*.43,170);
 return ((x-rect.left-rect.width/2)/Math.max(1,rx))**2+((y-rect.top-rect.height/2)/Math.max(1,ry))**2<=1;
}
export function paperThrowEnergy(samples=[],releasedAt=0){
 const last=samples.at(-1);if(!last||releasedAt-last.at>110)return {energy:.16,spin:1};
 const first=samples.find(p=>last.at-p.at<=110)??last,dt=Math.max(16,last.at-first.at),vx=(last.x-first.x)/dt,vy=(last.y-first.y)/dt;
 return {energy:Math.max(.16,Math.min(1,Math.hypot(vx,vy)/1.6)),spin:vx<-.06?-1:1};
}
export function enablePaperDrag({root,target,canStart,onDrop,onRelease=()=>{},announce,reduced}){
 let active=null,pending=false,motion=null;
 const clear=()=>{target.closest('.studio')?.classList.remove('vortex-ready','vortex-near');document.body.classList.remove('dragging-paper');};
 const cancel=()=>{motion?.cancel();motion=null;pending=false;if(active){active.button.classList.remove('paper-lifted');active.ghost.remove();active=null;}clear();};
 root.addEventListener('pointerdown',event=>{
  const button=event.target.closest('.choice');if(!button||button.disabled||pending||active||!canStart()||event.button!==0)return;
  event.preventDefault();const art=button.querySelector('.choice-art'),rect=art.getBoundingClientRect(),ghost=art.cloneNode(true);
  art.querySelectorAll('canvas').forEach((source,i)=>ghost.querySelectorAll('canvas')[i].getContext('2d').drawImage(source,0,0));
  ghost.className='paper-in-hand';ghost.setAttribute('aria-hidden','true');Object.assign(ghost.style,{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});document.body.append(ghost);
  active={button,ghost,id:event.pointerId,startX:event.clientX,startY:event.clientY,x:0,y:0,value:button.dataset.value,rect,samples:[{x:event.clientX,y:event.clientY,at:event.timeStamp}]};
  button.classList.add('paper-lifted');button.setPointerCapture(event.pointerId);document.body.classList.add('dragging-paper');target.closest('.studio')?.classList.add('vortex-ready');
 });
 root.addEventListener('pointermove',event=>{
  if(!active||active.id!==event.pointerId)return;event.preventDefault();active.x=event.clientX-active.startX;active.y=event.clientY-active.startY;
  active.samples.push({x:event.clientX,y:event.clientY,at:event.timeStamp});if(active.samples.length>12)active.samples.shift();
  active.ghost.style.transform=`translate(${active.x}px,${active.y}px) rotate(${Math.max(-12,Math.min(12,active.x*.04))}deg) scale(1.08)`;
  target.closest('.studio')?.classList.toggle('vortex-near',inPaperVortex(event.clientX,event.clientY,target.getBoundingClientRect()));
 });
 root.addEventListener('pointerup',event=>{
  if(!active||active.id!==event.pointerId)return;const drag=active,accepted=Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<8||inPaperVortex(event.clientX,event.clientY,target.getBoundingClientRect());active=null;clear();
  const impulse=paperThrowEnergy(drag.samples,event.timeStamp);if(accepted)onRelease(impulse);
  if(drag.button.hasPointerCapture(event.pointerId))drag.button.releasePointerCapture(event.pointerId);
  pending=true;const r=target.getBoundingClientRect(),dx=accepted?r.left+r.width/2-drag.rect.left-drag.rect.width/2:0,dy=accepted?r.top+r.height/2-drag.rect.top-drag.rect.height/2:0;
  motion=drag.ghost.animate([{transform:drag.ghost.style.transform||'none',opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${accepted?110:0}deg) scale(${accepted?.03:1})`,opacity:accepted?0:1}],{duration:reduced.matches?0:accepted?330:240,easing:accepted?'cubic-bezier(.5,0,.8,.6)':'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
  motion.finished.then(()=>{drag.ghost.remove();drag.button.classList.remove('paper-lifted');pending=false;motion=null;if(accepted&&canStart()){announce(`${drag.button.getAttribute('aria-label')} added.`);onDrop(drag.value,impulse);}}).catch(()=>{drag.ghost.remove();drag.button.classList.remove('paper-lifted');});
 });
 root.addEventListener('pointercancel',cancel);root.addEventListener('lostpointercapture',()=>{if(active)cancel();});
 window.addEventListener('blur',cancel);window.addEventListener('keydown',e=>{if(e.key==='Escape')cancel();});document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 return {cancel};
}
