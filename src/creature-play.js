// Pure, family-aware stage direction. The camera moves the original printed art;
// saved coordinates, rig lengths and DNA stay untouched.
import {familyPose,familyCapabilities,familyProfile,supportsFamilyMotion} from './family-motion.js';
import {mouthFor,withMonsterMouth} from './monster-mouths.js';
const clamp=t=>Math.max(0,Math.min(1,t)),ease=t=>{t=clamp(t);return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*t;
const box=scene=>{const pts=scene.shapes.filter(p=>!p.carrier&&!p.opening).flatMap(p=>p.points),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return {left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)};};
const center=scene=>{const p=scene.shapes.find(p=>p.id==='body')?.points??[[300,380]];return p.reduce((c,q)=>[c[0]+q[0]/p.length,c[1]+q[1]/p.length],[0,0]);};
const geometry=new WeakMap();
export const BASE_PLAY_END=30000,TEXT_PLAY_DELAY=12200,PLAY_END=BASE_PLAY_END+TEXT_PLAY_DELAY;
export function faceBox(scene){
 const eyes=scene.eyes;if(!eyes.length)return {x:300,y:270,width:180,height:160};
 const left=Math.min(...eyes.map(e=>e.x-e.r)),right=Math.max(...eyes.map(e=>e.x+e.r)),top=Math.min(...eyes.map(e=>e.y-e.ry)),bottom=Math.max(...eyes.map(e=>e.y+e.ry));
 return {x:(left+right)/2,y:(top+bottom)/2+14,width:Math.max(90,right-left+45),height:Math.max(100,bottom-top+65)};
}
export function creaturePlayFrame(scene,ms,{width,height,home,text}){
 if(!geometry.has(scene))geometry.set(scene,{caps:familyCapabilities(scene),profile:familyProfile(scene),bounds:box(scene),face:faceBox(scene)});
 const {caps,profile,bounds,face}=geometry.get(scene),side=scene.seed%2?1:-1;
 const baseline={scale:home.scale,x:home.x,y:home.y};
 const edge={scale:home.scale*.9,x:side>0?width-22-bounds.right*home.scale*.9:22-bounds.left*home.scale*.9,y:height-38-bounds.bottom*home.scale*.9};
 const wall={...edge,y:48-bounds.top*edge.scale};
 // Deliberately crop a tall face rather than shrinking it back into a portrait.
 const closeScale=Math.min(14,width*.9/face.width),close={scale:closeScale,x:width*.5-face.x*closeScale,y:height*.46-face.y*closeScale};
 const interpolate=(a,b,t)=>Object.fromEntries(['scale','x','y'].map(k=>[k,mix(a[k],b[k],ease(t))]));
 const locomotion=caps.includes('run')?'run':caps.includes('walk')?'walk':'glide';
 if(text?.description&&text?.name){
  if(ms>=1800&&ms<14000){
   const reachPose=geometry.get(scene).reachPose??(geometry.get(scene).reachPose=familyPose(scene,'greet',.4,0)),hand=reachPose.shapes.find(p=>p.id==='hand-right')?.anchor??[420,350],mouth=mouthFor(scene)??{x:face.x,y:face.y+50};
   const s=home.scale*.95,swat={scale:s,x:Math.max(8-bounds.left*s,Math.min(width-8-bounds.right*s,text.description.left+text.description.width*.28-hand[0]*s)),y:text.description.top+text.description.height*.35-hand[1]*s},bite={scale:s,x:text.name.left+text.name.width*.84-mouth.x*s,y:text.name.top+text.name.height*.52-mouth.y*s};
   let phase,action,t,camera;
   if(ms<5800){phase='text-approach';action=locomotion;t=((ms-1800)/1400)%1;camera=interpolate(baseline,swat,(ms-1800)/4000);}
   else if(ms<7400){phase='swat';action='swat';t=(ms-5800)/1600;camera=swat;}
   else if(ms<9400){phase='text-watch';action='look';t=(ms-7400)/2000;camera=interpolate(swat,bite,t);}
   else if(ms<12000){phase='name-bite';action='bite';t=(ms-9400)/2600;camera=bite;}
   else{phase='text-return';action=locomotion;t=((ms-12000)/1000)%1;camera=interpolate(bite,baseline,(ms-12000)/2000);}
   return {phase,action,t,camera,direction:1,closeup:false};
  }
  if(ms>=14000)ms-=TEXT_PLAY_DELAY;
 }
 let phase='notice',action='look',t=clamp(ms/1800),camera=baseline,cycle=0,direction=side;
 if(ms>=1800&&ms<6000){phase='run';action=locomotion;t=((ms-1800)/(profile.weight>1.5?1900:1300))%1;camera=interpolate(baseline,edge,(ms-1800)/4200);}
 else if(ms>=6000&&ms<10500){phase='climb';action='climb';t=(ms-6000)/4500;camera=interpolate(edge,wall,t);cycle=(ms-6000)/1000;}
 else if(ms>=10500&&ms<12800){phase='peek';action='suspicious';t=(ms-10500)/2300;camera={...wall,x:wall.x+side*Math.sin(t*Math.PI)*14};}
 else if(ms>=12800&&ms<15900){phase='descend';action='climb';t=1-(ms-12800)/3100;camera=interpolate(wall,edge,(ms-12800)/3100);cycle=(15900-ms)/1000;}
 else if(ms>=15900&&ms<19700){phase='approach';action=locomotion;t=((ms-15900)/1300)%1;camera=interpolate(edge,close,(ms-15900)/3800);direction=-side;}
 else if(ms>=19700&&ms<23500){phase='stare';action='look';t=(ms-19700)/3800;camera=close;}
 else if(ms>=23500&&ms<27500){phase='retreat';action=locomotion;t=((ms-23500)/1500)%1;camera=interpolate(close,baseline,(ms-23500)/4000);}
 else if(ms>=27500&&ms<BASE_PLAY_END){phase='home';action=caps.includes('grin')?'grin':'greet';t=(ms-27500)/2500;camera=baseline;}
 else if(ms>=BASE_PLAY_END)return {phase:'complete',complete:true,closeup:false,camera:baseline,action:'breathe',t:0,direction};
 return {phase,action,t,cycle,camera,direction,closeup:camera.scale>home.scale*1.9};
}
export function creaturePlayPose(scene,frame,seconds){
 if(frame.complete)return scene;
 if(frame.action==='swat')return familyPose(scene,'greet',frame.t*.8,seconds,frame.direction);
 if(frame.action==='bite'){
  const pose=familyPose(scene,familyCapabilities(scene).includes('chatter')?'chatter':'greet',frame.t,seconds,frame.direction);
  // Two tentative nibbles on the unchanged paper edge, then let it go.
  const t=clamp((frame.t*2600-150)/2300),envelope=ease(t/.25)*(1-ease((t-.72)/.28)),nibble=t>=.38&&t<=.72?.55+.45*Math.cos((t-.38)*Math.PI*2/.17):1;
  if(pose.faceFrame)return {...pose,faceFrame:{...pose.faceFrame,cue:{...pose.faceFrame.cue,open:envelope*nibble}}};
  return pose;
 }
 if(frame.action==='climb'){
  // Reuse the fixed-length family solver with staggered gripping arms and feet.
  const grip=i=>(1+Math.sin(frame.cycle*3.8+i*Math.PI))*.5;
  return familyPose(scene,'fall',.8,seconds,frame.direction,{arms:Array.from({length:12},(_,i)=>({lift:.42+grip(i)*.53,flap:grip(i)*.36,roll:grip(i)*.15})),legLift:18+12*grip(0),legSwing:Math.sin(frame.cycle*3.8)*8});
 }
 return familyPose(scene,frame.action,frame.t,seconds,frame.direction);
}
export function textPlayMotion(ms){
 const f=ms>=6400&&ms<=9400?(ms-6400)/3000:0,b=ms>=9900&&ms<=11900?(ms-9900)/2000:0;
 const flight=Math.sin(f*Math.PI),bite=Math.sin(b*Math.PI);
 return {textX:flight*120,textY:-flight*76,rotation:flight*11,nameX:-bite*9,nameRotation:-bite*4,bite:bite*.22};
}
export function letterFlight(ms,index,width=1280){
 const t=clamp((ms-6400-(index%7)*23)/2650),arc=Math.sin(t*Math.PI),spread=width<680?.48:1;
 return {x:arc*(48+(index*47)%139)*spread,y:-arc*(28+(index*31)%102),rotation:arc*((index*29)%91-45)};
}
export function posedMouthTarget(pose,camera){
 const mouth=withMonsterMouth(pose).shapes.find(p=>p.id==='expression-mouth-void');if(!mouth)return null;
 const xs=mouth.points.map(p=>p[0]),ys=mouth.points.map(p=>p[1]);
 return {x:(Math.min(...xs)+Math.max(...xs))/2*camera.scale+camera.x,y:(Math.min(...ys)+Math.max(...ys))/2*camera.scale+camera.y,width:(Math.max(...xs)-Math.min(...xs))*camera.scale};
}
export function nameFeeding(){
 // The lettering is a fixed object in the scene, never attracted to the face.
 return {x:0,y:0,scale:1,opacity:1};
}
export function containedPaperRect(rect,width,height,position='50% 50%'){
 const scale=Math.min(rect.width/width,rect.height/height),w=width*scale,h=height*scale;
 const [horizontal='50%',vertical='50%']=position.split(' '),fraction=value=>value==='left'||value==='top'?0:value==='right'||value==='bottom'?1:value==='center'?.5:parseFloat(value)/100;
 return {left:rect.left+(rect.width-w)*fraction(horizontal),top:rect.top+(rect.height-h)*fraction(vertical),width:w,height:h};
}
export function creatureTextCamera(pose,frame,text,ms,camera=frame.camera){
 if(!text?.name)return camera;
 const reach=ms<9400?ease((ms-7400)/2000):ms<12000?1:1-ease((ms-12000)/2000);
 if(!reach)return camera;
 const mouth=posedMouthTarget(pose,camera);if(!mouth)return camera;
 // Dock the animated jaw, not its rest-pose estimate, at the stationary name.
 const x=text.name.left+text.name.width*.94,y=text.name.top+text.name.height*.52;
 return {...camera,x:camera.x+(x-mouth.x)*reach,y:camera.y+(y-mouth.y)*reach};
}
function flyingLetters(element){
 const layer=document.createElement('div');layer.className='flying-description';layer.setAttribute('aria-hidden','true');
 const style=getComputedStyle(element);Object.assign(layer.style,{position:'fixed',inset:'0',pointerEvents:'none',zIndex:'14',font:style.font,color:style.color,letterSpacing:style.letterSpacing});
 const letters=[],walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode())){let offset=0;for(const char of Array.from(node.textContent)){
  const end=offset+char.length;if(char.trim()){const range=document.createRange();range.setStart(node,offset);range.setEnd(node,end);const r=range.getBoundingClientRect(),span=document.createElement('span');span.textContent=char;Object.assign(span.style,{position:'absolute',left:r.left+'px',top:r.top+'px',lineHeight:r.height+'px',whiteSpace:'pre',transformOrigin:'center'});layer.append(span);letters.push(span);}offset=end;
 }}
 document.body.append(layer);return {letters,remove:()=>layer.remove()};
}
export function mountCreaturePlay(field,view){
 const events=new AbortController();
 const canvas=view.renderer.canvas,oldStyle=canvas.getAttribute('style'),oldTransparent=view.renderer.transparent,oldGround=view.renderer.ground,oldViewport=view.renderer.viewport;
 const root=field.closest?.('.screen-reveal'),description=root?.querySelector('.specimen-description'),name=root?.querySelector('.reveal-name'),textStyles=[description,name].filter(Boolean).map(element=>({element,style:element.getAttribute('style')}));
 const restoreText=()=>{for(const{element,style}of textStyles)if(style===null)element.removeAttribute('style');else element.setAttribute('style',style);};
 let text=null,letterLayer=null;
 const clearLetters=()=>{letterLayer?.remove();letterLayer=null;if(description)description.style.opacity='';};
 let home=null,start=null,suspended=null,done=false,restored=true;
 const restore=()=>{clearLetters();restoreText();if(restored)return;restored=true;if(oldStyle===null)canvas.removeAttribute('style');else canvas.setAttribute('style',oldStyle);view.renderer.transparent=oldTransparent;view.renderer.ground=oldGround;view.renderer.viewport=oldViewport;view.renderer.resize(view.renderer.scale);document.body.classList.remove('creature-playing','creature-closeup');delete canvas.dataset.playPhase;};
 const suspend=now=>{if(start!==null&&suspended===null)suspended=now;const wasActive=!restored;restore();if(wasActive)view.renderer.draw?.(view.target);};
 window.addEventListener('resize',()=>{done=true;restore();},{signal:events.signal});
 return {
  frame(scene,now,ready){
   if(done||!supportsFamilyMotion(view.target)||!ready){if(!ready)suspend(now);return scene;}
   if(start===null){const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/600,r.height/760);home={scale,x:r.left+(r.width-600*scale)/2,y:r.top+(r.height-760*scale)/2};if(description&&name){const paper=name.querySelector('canvas'),rect=(paper??name).getBoundingClientRect();text={description:description.getBoundingClientRect(),name:paper?containedPaperRect(rect,paper.width,paper.height,getComputedStyle(paper).objectPosition):rect};}start=now;}
   if(suspended!==null){start+=now-suspended;suspended=null;}
   const frame=creaturePlayFrame(view.target,now-start,{width:innerWidth,height:innerHeight,home,text});
   if(frame.complete){done=true;view.familyAction=null;view.familyRequested=null;view.familyDue=now+1800;restore();return view.target;}
   const pose=creaturePlayPose(view.target,frame,now/1000);let c={...frame.camera};
   if(['walk','run','glide'].includes(frame.action)){const a=center(view.target),b=center(pose);c.x-=(b[0]-a[0])*c.scale;c.y-=(b[1]-a[1])*c.scale;}
   if(text){
    const elapsed=now-start;
    if(elapsed>=6400&&elapsed<9300){letterLayer??=flyingLetters(description);description.style.opacity='0';letterLayer.letters.forEach((letter,i)=>{const m=letterFlight(elapsed,i,innerWidth);letter.style.transform=`translate(${m.x}px,${m.y}px) rotate(${m.rotation}deg)`;});}else clearLetters();
    c=creatureTextCamera(pose,frame,text,elapsed,c);
   }
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
