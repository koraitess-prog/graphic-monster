import {familyCapabilities,supportsFamilyMotion} from './family-motion.js';
let visitor={x:.5,y:.4};
export function rememberVisitor(x,y){visitor={x:Math.max(0,Math.min(1,x)),y:Math.max(0,Math.min(1,y))};}
export function attentivePose(scene,attention){
 if(!attention)return scene;
 return {...scene,eyes:scene.eyes.map(e=>({...e,gaze:[(e.gaze?.[0]??0)*.3+(attention.x-.5)*e.r*.42,(e.gaze?.[1]??0)*.3+(attention.y-.5)*(e.ry??e.r)*.32]}))};
}

// Presentation policy only: stored scenes, anatomy and DNA are never modified.
export function observationAction(scene,kind,event=0){
 const available=familyCapabilities(scene),lists={
  near:['look','suspicious','inspect'],sudden:['startle','twitch','gasp'],
  material:['creep','inspect','look'],repeated:['irritated','growl','suspicious','outburst'],
  idle:['stretch','look','yawn','inspect','sleepy','jump','suspicious']
 };
 const choices=(lists[kind]??lists.idle).filter(a=>available.includes(a));
 return choices.length?choices[((scene.seed>>>0)+event)%choices.length]:'breathe';
}
export function mountObservation(field,view,{log,pause,stimulate,enabled=()=>true,meet=false}={}){
 const events=new AbortController(),signal=events.signal;
 let last=-Infinity,event=0,previous=null,nearTimer=0,paused=false,repeat=0,dotTimer=0;
 const marker=document.createElement('span');marker.className='observation-stimulus';marker.setAttribute('aria-hidden','true');field.append(marker);
 const oldSelector=view.behaviorSelector,oldCallback=view.onBehavior,oldPresenter=view.posePresenter;
 let attention=meet?{...visitor}:null,gaze=attention?{...attention}:null,lastFrame=0;
 view.posePresenter=(scene,now)=>{if(!attention||!ready())return oldPresenter?.(scene,now)??scene;const t=1-Math.exp(-Math.min(100,now-lastFrame)/220);lastFrame=now;gaze??={x:.5,y:.5};gaze={x:gaze.x+(attention.x-gaze.x)*t,y:gaze.y+(attention.y-gaze.y)*t};return attentivePose(oldPresenter?.(scene,now)??scene,gaze);};
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
  const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  attention={x,y};
  if(e.buttons){marker.style.left=`${x*100}%`;marker.style.top=`${y*100}%`;marker.style.transform=`rotate(${(x-.5)*50}deg)`;marker.classList.add('present');provoke('material',x,y);return;}
  if(e.pointerType==='touch')return;
  if(!previous||Math.abs(e.clientX-previous.x)>25)provoke('near',x,y);
  if(previous&&now-previous.at>20&&now-previous.at<220&&Math.hypot(e.clientX-previous.x,e.clientY-previous.y)/(now-previous.at)>1.7)provoke('sudden',(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);
  if(!previous||now-previous.at>40)previous={x:e.clientX,y:e.clientY,at:now};
 },{signal});
 field.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,input,summary'))return;const r=field.getBoundingClientRect();attention={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};provoke('material',attention.x,attention.y);},{signal});
 stimulate?.addEventListener('click',()=>provoke('material'),{signal});
 pause?.addEventListener('click',()=>{
  paused=!paused;view.familyRequested=null;view.setVisible(!paused);pause.textContent=paused?'Resume':'Pause';pause.setAttribute('aria-pressed',String(paused));
 },{signal});
 const visibility=new IntersectionObserver(entries=>view.setVisible(entries[0].isIntersecting&&!paused&&enabled()),{threshold:.08});visibility.observe(field);
 return {destroy(){events.abort();visibility.disconnect();clearTimeout(meeting);clearTimeout(nearTimer);clearTimeout(dotTimer);marker.remove();view.familyRequested=null;view.behaviorSelector=oldSelector;view.onBehavior=oldCallback;view.posePresenter=oldPresenter;}};
}
