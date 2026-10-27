import {familyCapabilities,supportsFamilyMotion} from './family-motion.js';
import {mountCreaturePlay} from './creature-play.js';
let visitor={x:.5,y:.4};
export function rememberVisitor(x,y){visitor={x:Math.max(0,Math.min(1,x)),y:Math.max(0,Math.min(1,y))};}
export function attentivePose(scene,attention){
 if(!attention)return scene;
 const x=Math.max(0,Math.min(1,attention.x)),y=Math.max(0,Math.min(1,attention.y));
 return {...scene,eyes:scene.eyes.map(e=>({...e,gaze:[(e.gaze?.[0]??0)*.3+(x-.5)*e.r*.42,(e.gaze?.[1]??0)*.3+(y-.5)*(e.ry??e.r)*.32]}))};
}

// Presentation policy only: stored scenes, anatomy and DNA are never modified.
export function observationAction(scene,kind,event=0){
 const available=familyCapabilities(scene),lists={
  near:['look','suspicious','inspect'],sudden:['startle','twitch','gasp'],
  material:['creep','inspect','look'],repeated:['irritated','growl','suspicious','outburst'],
  idle:['walk','chatter','look','jump','grin','inspect','stretch','run','gasp','greet','suspicious','outburst','creep','yawn','twitch','growl','irritated','sleepy']
 };
 const choices=(lists[kind]??lists.idle).filter(a=>available.includes(a));
 return choices.length?choices[((scene.seed>>>0)+event)%choices.length]:'breathe';
}
export function mountObservation(field,view,{log,pause,stimulate,enabled=()=>true,meet=false,play=false}={}){
 const events=new AbortController(),signal=events.signal;
 let last=-Infinity,event=0,previous=null,nearTimer=0,paused=false,repeat=0,dotTimer=0;
 const marker=document.createElement('span');marker.className='observation-stimulus';marker.setAttribute('aria-hidden','true');field.append(marker);
 const oldSelector=view.behaviorSelector,oldCallback=view.onBehavior,oldPresenter=view.posePresenter,oldPause=view.behaviorPause;
 if(play)view.behaviorPause=(_scene,index)=>1500+(index%4)*350;
 const stagePlay=play?mountCreaturePlay(field,view):null;
 let attention=meet?{...visitor}:null,gaze=attention?{...attention}:null,lastFrame=0;
 view.posePresenter=(scene,now)=>{const posed=stagePlay?.frame(oldPresenter?.(scene,now)??scene,now,ready())??(oldPresenter?.(scene,now)??scene);if(!attention||!ready())return posed;const t=1-Math.exp(-Math.min(100,now-lastFrame)/220);lastFrame=now;gaze??={x:.5,y:.5};gaze={x:gaze.x+(attention.x-gaze.x)*t,y:gaze.y+(attention.y-gaze.y)*t};return attentivePose(posed,gaze);};
 const ready=()=>enabled()&&!paused&&!document.hidden&&!view.motion.matches&&view.visible;
 const meeting=setTimeout(()=>{if(meet&&ready())view.react('look',{delay:120,direction:visitor.x<.5?-1:1});},600);
 view.behaviorSelector=(scene,index)=>observationAction(scene,'idle',index);
 view.onBehavior=action=>{if(log)log.textContent=`observed / ${action}`;};
 function provoke(kind,x=.72,y=.55){
  if(!ready())return;
  const now=performance.now();if(now-last<(kind==='near'?1400:2000))return;
  if(!supportsFamilyMotion(view.target)){view.play(event++);last=now;return;}
  repeat=now-last<15000?repeat+1:0;
  const action=observationAction(view.target,repeat>=3?'repeated':kind,event);
  if(!view.react(action,{delay:kind==='near'?650:180,direction:x<.5?-1:1}))return;
  last=now;event++;marker.style.left=`${x*100}%`;marker.style.top=`${y*100}%`;marker.classList.add('present');
  clearTimeout(dotTimer);dotTimer=setTimeout(()=>marker.classList.remove('present'),2300);
 }
 field.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;nearTimer=setTimeout(()=>provoke('near'),1000);},{signal});
 field.addEventListener('pointerleave',()=>{clearTimeout(nearTimer);previous=null;},{signal});
 field.addEventListener('pointermove',e=>{
  const now=performance.now(),r=field.getBoundingClientRect();
  const x=document.body.classList.contains('creature-playing')?e.clientX/Math.max(1,innerWidth):(e.clientX-r.left)/r.width,y=document.body.classList.contains('creature-playing')?e.clientY/Math.max(1,innerHeight):(e.clientY-r.top)/r.height;
  attention={x,y};
  if(e.buttons){marker.style.left=`${x*100}%`;marker.style.top=`${y*100}%`;marker.style.transform=`rotate(${(x-.5)*50}deg)`;marker.classList.add('present');provoke('material',x,y);return;}
  if(e.pointerType==='touch')return;
  if(!previous||Math.abs(e.clientX-previous.x)>25)provoke('near',x,y);
  if(previous&&now-previous.at>20&&now-previous.at<220&&Math.hypot(e.clientX-previous.x,e.clientY-previous.y)/(now-previous.at)>1.7)provoke('sudden',(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);
  if(!previous||now-previous.at>40)previous={x:e.clientX,y:e.clientY,at:now};
 },{signal});
 field.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,input,summary'))return;const r=field.getBoundingClientRect();attention=document.body.classList.contains('creature-playing')?{x:e.clientX/Math.max(1,innerWidth),y:e.clientY/Math.max(1,innerHeight)}:{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};provoke('material',attention.x,attention.y);},{signal});
 stimulate?.addEventListener('click',()=>provoke('material'),{signal});
 pause?.addEventListener('click',()=>{
  paused=!paused;if(paused)stagePlay?.suspend();view.familyRequested=null;view.setVisible(!paused);pause.textContent=paused?'Resume play':'Pause play';pause.setAttribute('aria-pressed',String(paused));
 },{signal});
 const visibility=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stagePlay?.suspend();view.setVisible(entries[0].isIntersecting&&!paused&&enabled());},{threshold:.08});visibility.observe(field);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stagePlay?.suspend();},{signal});
 view.motion.addEventListener?.('change',()=>{if(view.motion.matches)stagePlay?.suspend();},{signal});
 return {destroy(){events.abort();stagePlay?.destroy();visibility.disconnect();clearTimeout(meeting);clearTimeout(nearTimer);clearTimeout(dotTimer);marker.remove();view.familyRequested=null;view.behaviorSelector=oldSelector;view.onBehavior=oldCallback;view.posePresenter=oldPresenter;view.behaviorPause=oldPause;}};
}
