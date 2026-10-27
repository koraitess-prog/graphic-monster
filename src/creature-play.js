// Pure, family-aware stage direction. The camera moves the original printed art;
// saved coordinates, rig lengths and DNA stay untouched.
import {familyPose,familyCapabilities,familyProfile,supportsFamilyMotion} from './family-motion.js';
const clamp=t=>Math.max(0,Math.min(1,t)),ease=t=>{t=clamp(t);return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*t;
const box=scene=>{const pts=scene.shapes.filter(p=>!p.carrier&&!p.opening).flatMap(p=>p.points),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return {left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)};};
const center=scene=>{const p=scene.shapes.find(p=>p.id==='body')?.points??[[300,380]];return p.reduce((c,q)=>[c[0]+q[0]/p.length,c[1]+q[1]/p.length],[0,0]);};
const geometry=new WeakMap();
export const PLAY_END=30000;
export function faceBox(scene){
 const eyes=scene.eyes;if(!eyes.length)return {x:300,y:270,width:180,height:160};
 const left=Math.min(...eyes.map(e=>e.x-e.r)),right=Math.max(...eyes.map(e=>e.x+e.r)),top=Math.min(...eyes.map(e=>e.y-e.ry)),bottom=Math.max(...eyes.map(e=>e.y+e.ry));
 return {x:(left+right)/2,y:(top+bottom)/2+14,width:Math.max(90,right-left+45),height:Math.max(100,bottom-top+65)};
}
export function creaturePlayFrame(scene,ms,{width,height,home}){
 if(!geometry.has(scene))geometry.set(scene,{caps:familyCapabilities(scene),profile:familyProfile(scene),bounds:box(scene),face:faceBox(scene)});
 const {caps,profile,bounds,face}=geometry.get(scene),side=scene.seed%2?1:-1;
 const baseline={scale:home.scale,x:home.x,y:home.y};
 const edge={scale:home.scale*.9,x:side>0?width-22-bounds.right*home.scale*.9:22-bounds.left*home.scale*.9,y:height-38-bounds.bottom*home.scale*.9};
 const wall={...edge,y:48-bounds.top*edge.scale};
 // Deliberately crop a tall face rather than shrinking it back into a portrait.
 const closeScale=Math.min(14,width*.9/face.width),close={scale:closeScale,x:width*.5-face.x*closeScale,y:height*.46-face.y*closeScale};
 const interpolate=(a,b,t)=>Object.fromEntries(['scale','x','y'].map(k=>[k,mix(a[k],b[k],ease(t))]));
 const locomotion=caps.includes('run')?'run':caps.includes('walk')?'walk':'glide';
 let phase='notice',action='look',t=clamp(ms/1800),camera=baseline,cycle=0,direction=side;
 if(ms>=1800&&ms<6000){phase='run';action=locomotion;t=((ms-1800)/(profile.weight>1.5?1900:1300))%1;camera=interpolate(baseline,edge,(ms-1800)/4200);}
 else if(ms>=6000&&ms<10500){phase='climb';action='climb';t=(ms-6000)/4500;camera=interpolate(edge,wall,t);cycle=(ms-6000)/1000;}
 else if(ms>=10500&&ms<12800){phase='peek';action='suspicious';t=(ms-10500)/2300;camera={...wall,x:wall.x+side*Math.sin(t*Math.PI)*14};}
 else if(ms>=12800&&ms<15900){phase='descend';action='climb';t=1-(ms-12800)/3100;camera=interpolate(wall,edge,(ms-12800)/3100);cycle=(15900-ms)/1000;}
 else if(ms>=15900&&ms<19700){phase='approach';action=locomotion;t=((ms-15900)/1300)%1;camera=interpolate(edge,close,(ms-15900)/3800);direction=-side;}
 else if(ms>=19700&&ms<23500){phase='stare';action='look';t=(ms-19700)/3800;camera=close;}
 else if(ms>=23500&&ms<27500){phase='retreat';action=locomotion;t=((ms-23500)/1500)%1;camera=interpolate(close,baseline,(ms-23500)/4000);}
 else if(ms>=27500&&ms<PLAY_END){phase='home';action=caps.includes('grin')?'grin':'greet';t=(ms-27500)/2500;camera=baseline;}
 else if(ms>=PLAY_END)return {phase:'complete',complete:true,closeup:false,camera:baseline,action:'breathe',t:0,direction};
 return {phase,action,t,cycle,camera,direction,closeup:camera.scale>home.scale*1.9};
}
export function creaturePlayPose(scene,frame,seconds){
 if(frame.complete)return scene;
 if(frame.action==='climb'){
  // Reuse the fixed-length family solver with staggered gripping arms and feet.
  const grip=i=>(1+Math.sin(frame.cycle*3.8+i*Math.PI))*.5;
  return familyPose(scene,'fall',.8,seconds,frame.direction,{arms:Array.from({length:12},(_,i)=>({lift:.42+grip(i)*.53,flap:grip(i)*.36,roll:grip(i)*.15})),legLift:18+12*grip(0),legSwing:Math.sin(frame.cycle*3.8)*8});
 }
 return familyPose(scene,frame.action,frame.t,seconds,frame.direction);
}
export function mountCreaturePlay(field,view){
 const events=new AbortController();
 const canvas=view.renderer.canvas,oldStyle=canvas.getAttribute('style'),oldTransparent=view.renderer.transparent,oldGround=view.renderer.ground,oldViewport=view.renderer.viewport;
 let home=null,start=null,suspended=null,done=false,restored=true;
 const restore=()=>{if(restored)return;restored=true;if(oldStyle===null)canvas.removeAttribute('style');else canvas.setAttribute('style',oldStyle);view.renderer.transparent=oldTransparent;view.renderer.ground=oldGround;view.renderer.viewport=oldViewport;view.renderer.resize(view.renderer.scale);document.body.classList.remove('creature-playing','creature-closeup');delete canvas.dataset.playPhase;};
 const suspend=now=>{if(start!==null&&suspended===null)suspended=now;const wasActive=!restored;restore();if(wasActive)view.renderer.draw?.(view.target);};
 window.addEventListener('resize',()=>{done=true;restore();},{signal:events.signal});
 return {
  frame(scene,now,ready){
   if(done||!supportsFamilyMotion(view.target)||!ready){if(!ready)suspend(now);return scene;}
   if(start===null){const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/600,r.height/760);home={scale,x:r.left+(r.width-600*scale)/2,y:r.top+(r.height-760*scale)/2};start=now;}
   if(suspended!==null){start+=now-suspended;suspended=null;}
   const frame=creaturePlayFrame(view.target,now-start,{width:innerWidth,height:innerHeight,home});
   if(frame.complete){done=true;view.familyAction=null;view.familyRequested=null;view.familyDue=now+1800;restore();return view.target;}
   const pose=creaturePlayPose(view.target,frame,now/1000),c={...frame.camera};
   if(['walk','run','glide'].includes(frame.action)){const a=center(view.target),b=center(pose);c.x-=(b[0]-a[0])*c.scale;c.y-=(b[1]-a[1])*c.scale;}
   restored=false;view.renderer.transparent=true;view.renderer.ground=false;
   view.renderer.viewport={width:innerWidth,height:innerHeight,dpr:Math.min(1.5,globalThis.devicePixelRatio??1),matrix:[c.scale,0,0,c.scale,c.x,c.y]};
   Object.assign(canvas.style,{position:'fixed',inset:'auto',left:'0px',top:'0px',width:`${innerWidth}px`,height:`${innerHeight}px`,maxWidth:'none',transformOrigin:'0 0',zIndex:'8',transform:'none'});
   document.body.classList.add('creature-playing');document.body.classList.toggle('creature-closeup',frame.closeup);canvas.dataset.playPhase=frame.phase;
   return pose;
  },
  suspend:()=>suspend(performance.now()),
  destroy(){done=true;events.abort();restore();}
 };
}
