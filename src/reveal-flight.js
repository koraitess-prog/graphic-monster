import {arrivalBeat,ARRIVAL_GESTURE_AT,ARRIVAL_DISTANCE} from './arrival.js?v=paperfall2';
import {familyProfile} from './family-motion.js?v=paperfall2';
import {arrivalPose} from './arrival-pose.js';

export async function playRevealFlight({view,app,reduced,signal,papers}){
 if(signal.aborted)return false;
 const scene=view.target,studio=app.querySelector('.studio'),canvas=view.renderer.canvas;
 if(reduced.matches||document.hidden){view.renderer.draw(scene);return true;}
 const distance=Math.round(Math.max(600,innerHeight*ARRIVAL_DISTANCE)),profile=familyProfile(scene),gesture=scene.answers.attitude==='playful'?'greet':'look',gestureDuration=profile[gesture+'Duration']*1000;
 const duration=ARRIVAL_GESTURE_AT+gestureDuration,tiltDirection=scene.seed%2?1:-1;
 app.style.setProperty('--fall-distance',`${distance}px`);
 const rect=canvas.getBoundingClientRect(),scale=Math.min(rect.width/600,rect.height/760),shadow=document.createElement('div');
 shadow.className='arrival-ground';shadow.setAttribute('aria-hidden','true');
 shadow.style.top=`${rect.top-app.getBoundingClientRect().top+rect.height/2+288*scale+distance}px`;app.append(shadow);
 view.stop();view.visible=false;view.renderer.resize(1.5);
 let raf=0,lastPaint=-100,started=performance.now();
 return new Promise(resolve=>{
  let finished=false;
  const finish=ok=>{
   if(finished)return;finished=true;cancelAnimationFrame(raf);
   signal.removeEventListener('abort',abort);reduced.removeEventListener('change',shorten);document.removeEventListener('visibilitychange',onHidden);
   shadow.remove();resolve(ok);
  };
  const abort=()=>finish(false),shorten=()=>{if(reduced.matches)finish(true);},onHidden=()=>{if(document.hidden)finish(true);};
  signal.addEventListener('abort',abort,{once:true});reduced.addEventListener('change',shorten);document.addEventListener('visibilitychange',onHidden);
  const frame=now=>{
   if(signal.aborted){finish(false);return;}
   const elapsed=now-started,beat=arrivalBeat(elapsed,gesture,gestureDuration);
   app.dataset.revealPhase=beat.phase;
   papers?.flight(elapsed,beat);
   studio.style.transform=`translateY(${beat.drop*distance}px) rotate(${beat.tilt*tiltDirection}deg)`;
   studio.style.transformOrigin='50% 86%';shadow.style.opacity=String(beat.shadow*.72);
   window.scrollTo({top:beat.camera*distance,behavior:'instant'});
   if(now-lastPaint>=32){view.renderer.draw(arrivalPose(scene,beat,elapsed));lastPaint=now;}
   if(elapsed<duration)raf=requestAnimationFrame(frame);else finish(true);
  };raf=requestAnimationFrame(frame);
 });
}
