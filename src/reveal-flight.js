import {arrivalBeat,ARRIVAL_GESTURE_AT,ARRIVAL_DISTANCE} from './arrival.js?v=arrival2';
import {familyProfile} from './family-motion.js';
import {arrivalPose} from './arrival-pose.js';
import {flightViewport,flightViewportMatrix,restoreArrivalCanvas} from './arrival-camera.js';

export function flightFrame(beat,distance){return {worldY:beat.drop*distance,scrollY:beat.camera*distance,screenY:(beat.drop-beat.camera)*distance};}

export async function playRevealFlight({view,app,reduced,signal,papers}){
 if(signal.aborted)return false;
 const scene=view.target;
 if(reduced.matches||document.hidden){restoreArrivalCanvas(view.renderer);view.renderer.draw(scene);return true;}
 const studio=app.querySelector('.studio'),canvas=view.renderer.canvas;
 // Measure the observation layout, then extend its world downwards. At landing
 // drop === camera === 1: removing the spent world and scroll together keeps
 // the creature in precisely the same viewport coordinates.
 const rect=studio.getBoundingClientRect(),parent=app.getBoundingClientRect(),identity=app.querySelector('.observation-identity')?.getBoundingClientRect();
 const origin=view.renderer.arrivalOrigin,landingRect=origin?(studio.querySelector?.('.canvas-wrap')?.getBoundingClientRect()??rect):null;
 const landing=origin?{scale:Math.min(landingRect.width/600,landingRect.height/760),x:landingRect.left+(landingRect.width-600*Math.min(landingRect.width/600,landingRect.height/760))/2,y:landingRect.top+(landingRect.height-760*Math.min(landingRect.width/600,landingRect.height/760))/2}:null;
 const distance=Math.round(Math.max(600,innerHeight*ARRIVAL_DISTANCE)),profile=familyProfile(scene);
 const gesture=scene.anatomy==='texture'?'twitch':scene.anatomy==='accordion'?'inspect':'look';
 const duration=ARRIVAL_GESTURE_AT+profile[gesture+'Duration']*1000,tiltDirection=scene.seed%2?1:-1;
 const properties={'--flight-distance':`${distance}px`,'--flight-height':`${Math.max(innerHeight,parent.height)}px`,'--flight-top':`${rect.top-parent.top}px`,'--flight-left':`${rect.left-parent.left}px`,'--flight-width':`${rect.width}px`,'--flight-studio-height':`${rect.height}px`};
 if(identity)Object.assign(properties,{'--flight-identity-top':`${identity.top-parent.top}px`,'--flight-identity-left':`${identity.left-parent.left}px`,'--flight-identity-width':`${identity.width}px`});
 for(const [key,value]of Object.entries(properties))app.style.setProperty(key,value);
 app.classList.add('arrival-stage');
 if(origin){app.classList.add('viewport-flight');view.renderer.transparent=true;}
 const canvasRect=landingRect??canvas.getBoundingClientRect(),scale=Math.min(canvasRect.width/600,canvasRect.height/760),shadow=document.createElement('div');
 shadow.className='arrival-ground';shadow.setAttribute('aria-hidden','true');
 shadow.style.top=`${canvasRect.top-parent.top+(canvasRect.height-760*scale)/2+668*scale+distance}px`;app.append(shadow);
 const skip=document.createElement('button');skip.type='button';skip.className='arrival-skip';skip.textContent='Skip';skip.setAttribute('aria-label','Skip arrival animation');document.body.append(skip);
 view.stop();view.visible=false;view.renderer.ground=false;if(!origin)view.renderer.resize(1.5);
 let raf=0,lastPaint=-100,started=performance.now();
 return new Promise(resolve=>{
  let finished=false;
  const finish=ok=>{
   if(finished)return;finished=true;cancelAnimationFrame(raf);
   signal.removeEventListener('abort',abort);reduced.removeEventListener('change',shorten);document.removeEventListener('visibilitychange',onHidden);document.removeEventListener('keydown',onKey);window.removeEventListener('resize',onResize);
   shadow.remove();skip.remove();app.classList.remove('arrival-stage');app.classList.remove('viewport-flight');studio.style.removeProperty('transform');studio.style.removeProperty('transform-origin');restoreArrivalCanvas(view.renderer);
   for(const key of Object.keys(properties))app.style.removeProperty(key);
   view.renderer.ground=true;
   if(ok){window.scrollTo({top:0,behavior:'instant'});view.renderer.draw(scene);}
   resolve(ok);
  };
  const abort=()=>finish(false),shorten=()=>{if(reduced.matches)finish(true);},onHidden=()=>{if(document.hidden)finish(true);},onResize=()=>finish(true),onKey=e=>{if(e.key==='Escape'){e.preventDefault();finish(true);}};
  signal.addEventListener('abort',abort,{once:true});reduced.addEventListener('change',shorten);document.addEventListener('visibilitychange',onHidden);document.addEventListener('keydown',onKey);window.addEventListener('resize',onResize);skip.addEventListener('click',()=>finish(true));
  const frame=now=>{
   if(signal.aborted){finish(false);return;}
   const elapsed=now-started,beat=arrivalBeat(elapsed,gesture,profile[gesture+'Duration']*1000,scene),position=flightFrame(beat,distance);
   app.dataset.revealPhase=beat.phase;
   if(origin){const c=flightViewport(position,beat,origin.camera,landing);view.renderer.viewport={width:innerWidth,height:innerHeight,dpr:Math.min(1.5,globalThis.devicePixelRatio??1),matrix:flightViewportMatrix(c,beat.tilt*tiltDirection,(beat.drift??0)*rect.width*tiltDirection)};}
   else{studio.style.transform=`translate(${(beat.drift??0)*rect.width*tiltDirection}px,${position.worldY}px) rotate(${beat.tilt*tiltDirection}deg)`;studio.style.transformOrigin='50% 86%';}
   shadow.style.opacity=String(beat.shadow*.72*(beat.phase==='gesture'?Math.max(0,1-beat.pose*3):1));
   window.scrollTo({top:position.scrollY,behavior:'instant'});
   papers?.flight(elapsed,beat,window.scrollY);
   if(now-lastPaint>=32){view.renderer.draw(arrivalPose(scene,beat,elapsed));lastPaint=now;}
   if(elapsed<duration)raf=requestAnimationFrame(frame);else finish(true);
  };raf=requestAnimationFrame(frame);
 });
}
