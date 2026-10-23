import {generateMonster} from './dna.js';
import {ANATOMIES} from './paper-dna.js';
import {MonsterRenderer} from './renderer.js';
import {buildFamilyRig} from './family-rig.js';
import {familyPose,familyProfile,familyCapabilities} from './family-motion.js';
const root=document.querySelector('#families'),controls=[...document.querySelectorAll('[data-action]')],status=document.querySelector('#status'),media=matchMedia('(prefers-reduced-motion: reduce)');
const performanceSelect=document.querySelector('#performance'),performancePlay=document.querySelector('#play-performance');
const materials=['shape','color','grid','color','typography','shape','texture','texture'];
let selected=4,raf=0,last=0,cursor=0;
const entries=ANATOMIES.map((anatomy,i)=>{
 const scene=generateMonster({anatomy,principle:materials[i],organization:'experiment',gaze:'clarity',density:'rich',attitude:'precise',seed:407+i},6),rig=buildFamilyRig(scene),card=document.createElement('button');card.className='family';card.type='button';card.setAttribute('aria-label','Select '+anatomy);card.innerHTML=`<canvas role="img" aria-label="${anatomy} motion"></canvas><span class="family-label">${anatomy==='typography'?'Typography / Rift':anatomy}<small>${rig.legs.length} legs · ${rig.arms.length} arms</small></span>`;root.append(card);
 const canvas=card.querySelector('canvas'),renderer=new MonsterRenderer(canvas,{scale:.85,background:'#202426'});renderer.draw(scene);card.addEventListener('click',()=>{selected=i;sync();});return {scene,card,canvas,renderer,visible:true,action:'breathe',baseX:0,start:0,last:0};
});
function sync(){const current=entries[selected],available=familyCapabilities(current.scene);performancePlay.disabled=media.matches||current.action!=='breathe'||!available.includes(performanceSelect.value);for(const option of performanceSelect.options)option.disabled=!available.includes(option.value);entries.forEach((e,i)=>e.card.setAttribute('aria-pressed',String(i===selected)));const e=entries[selected];controls.forEach(b=>{b.disabled=media.matches||e.action!=='breathe'||!familyCapabilities(e.scene).includes(b.dataset.action);b.setAttribute('aria-pressed',String(b.dataset.action===e.action));});}
function offset(pose,x){if(!x)return pose;const move=([u,v])=>[u+x,v],part=p=>({...p,points:p.points.map(move),...(p.paperMaterial?{paperMaterial:{...p.paperMaterial,points:p.paperMaterial.points.map(move)}}:{})}),shapes=pose.shapes.map(part);return {...pose,...(pose.faceFrame?{faceFrame:{...pose.faceFrame,mapPoint:(q,id)=>move(pose.faceFrame.mapPoint(q,id))}}:{}),shapes,lines:pose.lines.map(part),eyes:pose.eyes.map(e=>({...e,x:e.x+x})),body:shapes.find(s=>s.id==='body').points};}
function paint(e,now){
 const p=familyProfile(e.scene),t=e.action==='breathe'?0:Math.min(1,(now-e.start)/(p[e.action+'Duration']*1000));
 e.renderer.draw(media.matches?e.scene:offset(familyPose(e.scene,e.action,t,now/1000,e.direction??1),e.baseX));e.canvas.dataset.action=e.action;e.canvas.dataset.family=e.scene.anatomy;
 if(t>=1&&e.action!=='breathe'){if(['walk','run','glide'].includes(e.action))e.baseX+=(e.direction??1)*p.stride*2;e.action='breathe';sync();}e.last=now;
}
function frame(now){
 if(document.hidden||media.matches)return;
 if(now-last>33){for(const e of entries)if(e.visible&&e.action!=='breathe')paint(e,now);const visible=entries.filter(e=>e.visible&&e.action==='breathe');if(visible.length)paint(visible[cursor++%visible.length],now);last=now;}
 raf=requestAnimationFrame(frame);
}
function startPerformance(action){const e=entries[selected];if(e.action!=='breathe'||media.matches)return;e.action=action;e.direction=e.baseX>10?-1:1;e.start=performance.now();status.textContent=`${e.scene.anatomy} / ${e.action}`;sync();}
controls.forEach(b=>b.addEventListener('click',()=>startPerformance(b.dataset.action)));
performancePlay.addEventListener('click',()=>startPerformance(performanceSelect.value));performanceSelect.addEventListener('change',sync);
const observer=new IntersectionObserver(list=>{for(const item of list){const e=entries.find(e=>e.card===item.target);e.visible=item.isIntersecting;}},{threshold:.05});entries.forEach(e=>observer.observe(e.card));
function run(){cancelAnimationFrame(raf);if(media.matches){entries.forEach(e=>{e.action='breathe';e.renderer.draw(e.scene);});sync();return;}if(!document.hidden)raf=requestAnimationFrame(frame);}
document.addEventListener('visibilitychange',run);media.addEventListener('change',run);sync();run();
