import {paperPrelude} from './collage.js';
import {QUESTIONS,generateMonster,encodeDNA,decodeDNA} from './dna.js';
import {evolutionScene,amorphousScene} from './evolution.js';
import {CreatureView} from './renderer.js?v=mobile2';
import {initialState,reducer,restoreState,normalizeName} from './state.js';
import {visualSample} from './samples.js';
import {createPoster} from './poster.js';
import {loadPaintTiles} from './paint-cache.js?v=mobile2';
import {displayFamily} from './typography.js';
import {drawWordmark} from './wordmark.js';
import {openArchive,makeRecord,mergeRecord} from './archive.js?v=mobile2';
import {CollectionScreen,parseCollectionRoute} from './collection-screen.js?v=mobile2';
import {decoratePaperTitles} from './paper-titles.js';

const app=document.querySelector('#app'),copy=document.querySelector('#copy'),canvas=document.querySelector('#monster');
const announcement=document.querySelector('#announcement'),dialog=document.querySelector('#name-dialog');
const headerName=document.querySelector('#header-name'),caption=document.querySelector('#creature-caption');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),storageKey='graphic-monster:experience:v2';
const dimensions=['Language','Organization','Gaze','Surface','Gesture'];
const feedback=['Taking shape.','Finding its balance.','Something is waking up.','Leaving an impression.','Becoming itself.'];
const freshSeed=()=>crypto.getRandomValues(new Uint32Array(1))[0];
const escape=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labelFor=(q,value)=>q.options.find(o=>o[0]===value)?.[1];
const complete=()=>QUESTIONS.every(q=>state.answers[q.key]);
let state=initialState(),advanceTimer,renameFocus,transitioning=false;
let archiveDB,records=[],archiveFailure='',archiveQueue=Promise.resolve();
const afterlife=document.querySelector('#afterlife');
const collection=new CollectionScreen(document.querySelector('#collection-screen'),{back:()=>returnToExperience(),create:()=>{returnToExperience();dispatch({type:'RESET'},{art:true});},open:id=>{location.hash=id?'creature='+encodeURIComponent(id):'archive';}});
try{state=restoreState(sessionStorage.getItem(storageKey)??sessionStorage.getItem('design-monsters:experience:v1'));}catch{}
function applyHash(){if(state.screen==='reveal')return false;const match=location.hash.match(/^#dna=([0-4][01]{4})$/);if(!match)return false;const answers=decodeDNA(match[1]);const changed=encodeDNA(state.answers)!==match[1];state={...state,answers,step:4,story:changed?null:state.story};state=state.name?reducer(state,{type:'REVEAL'}):{...state,screen:'intro'};return true;}
applyHash();
try{archiveDB=await openArchive();records=await archiveDB.list();}catch{archiveFailure='The collection cannot be saved in this browser right now.';}
const visualAnswers=()=>({...state.answers,...(state.rulesVersion>=6&&state.visualSeed!==null?{seed:state.visualSeed}:{})});
const previewScene=()=>state.screen==='intro'?(state.rulesVersion>=4?paperPrelude():amorphousScene()):state.screen==='reveal'?(records.find(r=>r.id===state.creationId)?.scene??evolutionScene(visualAnswers(),state.rulesVersion)):evolutionScene(visualAnswers(),state.rulesVersion);

const view=new CreatureView(canvas,previewScene());
function warmPaint(scene){void loadPaintTiles(scene).then(()=>{if(!app.hidden)view.renderer.draw(view.pose());});}
warmPaint(previewScene());
const stageVisibility=new IntersectionObserver(entries=>view.setVisible(entries[0].isIntersecting),{threshold:.05});stageVisibility.observe(canvas);
function save(){
 try{sessionStorage.setItem(storageKey,JSON.stringify(state));}catch{}
 if(parseCollectionRoute(location.hash))return;
 if(state.screen==='reveal')history.replaceState(null,'',`#dna=${encodeDNA(state.answers)}`);
 else if(location.hash.startsWith('#dna='))history.replaceState(null,'',location.pathname+location.search);
}
function announce(text){announcement.textContent=text;}
function progress(){return `<nav class="dimension-nav" aria-label="Your five design decisions">${QUESTIONS.map((q,i)=>{const available=QUESTIONS.slice(0,i).every(p=>state.answers[p.key]);return `<button type="button" data-step="${i}" class="dimension${state.step===i?' current':''}${state.answers[q.key]?' complete':''}" ${available?'':'disabled'} ${state.step===i?'aria-current="step"':''} aria-label="${dimensions[i]}${state.answers[q.key]?`: ${labelFor(q,state.answers[q.key])}`:''}"><span class="progress-mark" aria-hidden="true"></span></button>`;}).join('')}</nav>`;}
function answer(option,index){const[value,label,detail]=option,selected=state.answers[QUESTIONS[state.step].key]===value;return `<button type="button" class="choice${selected?' selected':''}" data-value="${value}" aria-pressed="${selected}" aria-label="${label}" title="${label}"><span class="choice-art">${visualSample(value)}</span></button>`;}
function render({focus=false,selection=false}={}){
 document.body.classList.toggle('intro-paper',state.screen==='intro'&&!parseCollectionRoute(location.hash));
 const wordmark=document.querySelector('.wordmark');wordmark.hidden=state.screen==='intro';if(state.screen==='reveal')wordmark.removeAttribute('href');else wordmark.setAttribute('href','./');wordmark.setAttribute('aria-label',state.screen==='reveal'?'GRAPHIC MONSTER':'Graphic Monster home');
 app.className=`experience screen-${state.screen}${state.rulesVersion>=4?" medium-paper":""}`;document.title=state.screen==='reveal'?`${state.name} — GRAPHIC MONSTER`:'GRAPHIC MONSTER — Your design decisions create a creature';
 document.querySelector('.header-actions [data-action="archive"]').hidden=false;
 headerName.hidden=state.screen!=='question';headerName.textContent=state.name;headerName.setAttribute('aria-label',`Edit ${state.name}’s name`);
 caption.textContent='';
 if(state.screen==='intro'){
   copy.innerHTML=`${state.rulesVersion>=4?'<h1 class="intro-title paper-title" tabindex="-1">GRAPHIC<br>MONSTER</h1>':'<h1 class="intro-title furry-title" tabindex="-1"><span class="sr-only">GRAPHIC MONSTER</span><canvas id="title-art" aria-hidden="true"></canvas></h1>'}<form id="create-form" class="name-form"><label class="sr-only" for="monster-name">Name</label><input id="monster-name" name="monsterName" placeholder="Name" value="${escape(state.name)}" required maxlength="48" autocomplete="off" dir="auto"><button class="name-submit" type="submit" aria-label="Start"><span aria-hidden="true">→</span></button></form>`;
   if(copy.querySelector('#title-art'))drawWordmark(copy.querySelector('#title-art'));
   document.querySelector('#stage-note').textContent='';
   canvas.setAttribute('aria-label','An amorphous living painting. No face or limbs yet.');
 }else if(state.screen==='question'){
   const q=QUESTIONS[state.step],selected=state.answers[q.key];
   copy.innerHTML=`<div class="question-top"><span class="counter">0${state.step+1} <span>/ 05</span></span><button type="button" class="text-button" data-action="back" aria-label="Back"><span aria-hidden="true">←</span></button></div><h1 class="question-title" tabindex="-1">${q.title.replace('\n',' ')}</h1><div class="choices ${q.options.length===5?'five':'two'}" role="group" aria-label="${q.title.replace('\n',' ')}">${q.options.map(answer).join('')}</div><div class="question-footer">${progress()}<div class="decision-status">${selected?`<button type="button" class="text-button" data-action="next" aria-label="${complete()?'Finish':'Next'}"><span aria-hidden="true">→</span></button>`:''}</div></div>`;
   document.querySelector('#stage-note').textContent='';
   canvas.setAttribute('aria-label',`${state.name}, evolving through your design decisions. ${QUESTIONS.filter(q=>state.answers[q.key]).map(q=>labelFor(q,state.answers[q.key])).join(', ')}.`);
 }else{
   state=reducer(state,{type:'REVEAL'});
   const story=state.story.text;
   const nameSize=state.name.length>32?64:state.name.length>17?94:state.name.length>9?128:174;
   copy.innerHTML=`<h1 class="reveal-name" style="--name-size:${nameSize}px" tabindex="-1" dir="auto">${escape(state.name)}</h1><div class="poster-actions"><button type="button" class="primary" data-action="export">Download PNG <span aria-hidden="true">↓</span></button><button type="button" class="text-button visit-archive" data-action="archive">Visit the Archive <span aria-hidden="true">↗</span></button><button type="button" class="text-button" data-action="reset">New monster</button><p id="export-status" class="export-status" role="status"></p></div>`;
   fitRevealName();
   document.querySelector('#full-story').innerHTML=`<p class="personality" aria-live="polite" aria-atomic="true">${escape(story)}</p><button type="button" class="another-story text-button" data-action="story">New description</button>`;
   void syncArchive(structuredClone(state));
   document.querySelector('#stage-note').textContent='';canvas.setAttribute('aria-label',`${state.name}. ${story}`);
 }
 afterlife.hidden=state.screen!=='reveal';
 if(state.rulesVersion>=6)decoratePaperTitles(copy);
 window.dispatchEvent(new CustomEvent('graphic-monster:intro',{detail:state.screen==='intro'&&!parseCollectionRoute(location.hash)}));
 if(focus){
   copy.querySelector('h1')?.focus({preventScroll:true});
   if(state.screen==='question'&&matchMedia('(max-width:680px)').matches){
     const top=copy.getBoundingClientRect().top,safe=document.querySelector('#studio').getBoundingClientRect().bottom+12;
     if(top<safe-10||top>innerHeight*.75)copy.scrollIntoView({block:'start',behavior:'instant'});
   }
 }
 if(selection)copy.querySelector(`[data-value="${state.answers[QUESTIONS[state.step].key]}"]`)?.focus({preventScroll:true});
 save();
}
function fitRevealName(){
 const title=copy.querySelector('.reveal-name');if(!title)return;
 const family=displayFamily(state.name);title.style.fontFamily=family;const ctx=document.createElement('canvas').getContext('2d');ctx.font=`900 100px ${family}`;
 const natural=ctx.measureText(state.name).width/100,mobile=innerWidth<=680,width=mobile?app.clientWidth-38:app.clientWidth*.88;
 const desired=Number(title.style.getPropertyValue('--name-size').replace('px',''))||174;
 const size=Math.max(mobile?22:28,Math.min(desired,innerWidth*(mobile?.17:.105),width*(mobile?2.8:1.85)/Math.max(1,natural)));
 title.style.fontSize=`${size}px`;
}
window.addEventListener('resize',fitRevealName);
reduced.addEventListener('change',()=>{if(reduced.matches)for(const animation of [...canvas.getAnimations(),...copy.getAnimations()]){try{animation.finish();}catch{}}});
function returnToExperience(){
 history.pushState(null,'',location.pathname+location.search+(state.screen==='reveal'?`#dna=${encodeDNA(state.answers)}`:''));
 collection.close();app.hidden=false;render({focus:true});view.setVisible(true);window.scrollTo({top:0,behavior:'instant'});
}
async function routeCollection(){
 const route=parseCollectionRoute(location.hash);
 if(!route){collection.close();app.hidden=false;render();view.setVisible(true);return;}
 document.body.classList.remove('intro-paper');
 clearTimeout(advanceTimer);app.hidden=true;afterlife.hidden=true;headerName.hidden=true;view.setVisible(false);
 document.querySelector('.header-actions [data-action="archive"]').hidden=true;
 collection.show(route,records,archiveFailure);
 if(archiveDB){try{await archiveQueue;const saved=await archiveDB.list();if(location.hash===route.hash){records=saved;collection.show(route,records,archiveFailure);}}catch{}}
}
async function syncArchive(snapshot){
 const incoming=makeRecord(snapshot),existing=records.find(r=>r.id===incoming.id);
 const record=mergeRecord(existing,incoming);records=existing?records.map(r=>r.id===record.id?record:r):[record,...records];
 archiveQueue=archiveQueue.then(async()=>{if(!archiveDB)return;try{await archiveDB.save(record);}catch{archiveFailure='This creature could not be saved. Your existing collection is retained.';}});await archiveQueue;
}
function artRect(){const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/600,r.height/760);return {x:r.left+r.width/2,y:r.top+r.height/2,scale};}
function enterReveal(next,{focus=true}={}){
 state=next;transitioning=true;copy.querySelectorAll('button').forEach(b=>b.disabled=true);
 const remaining=view.start?Math.max(0,view.duration-(performance.now()-view.start))+60:0;
 setTimeout(async()=>{
  if(reduced.matches||document.hidden){render({focus});window.scrollTo({top:0,behavior:'instant'});transitioning=false;return;}
  const outgoing=copy.animate([{transform:'translateY(0)',clipPath:'inset(0 0 0 0)'},{transform:'translateY(-16px)',clipPath:'inset(0 0 100% 0)'}],{duration:220,easing:'ease-in',fill:'forwards'});let settleTimeout;await Promise.race([outgoing.finished.catch(()=>{}),new Promise(resolve=>{settleTimeout=setTimeout(resolve,360);})]);clearTimeout(settleTimeout);outgoing.cancel();
  const before=artRect();render({focus});window.scrollTo({top:0,behavior:'instant'});const after=artRect();
  if(!reduced.matches&&!document.hidden)canvas.animate([{transform:`translate(${before.x-after.x}px,${before.y-after.y}px) scale(${before.scale/after.scale})`},{transform:'translate(0,0) scale(1)'}],{duration:1050,easing:'cubic-bezier(.22,.72,.2,1)'});
  if(!reduced.matches&&!document.hidden){app.classList.add('reveal-arriving');view.greet(1080);}transitioning=false;
 },remaining);
}
function dispatch(event,{focus=true,art=false}={}){
 clearTimeout(advanceTimer);const previous=state.screen,next=reducer(state,event);
 if(previous==='question'&&next.screen==='reveal'&&!reduced.matches){enterReveal(next,{focus});return;}
 state=next;render({focus});if(previous!=='reveal'&&state.screen==='reveal')window.scrollTo({top:0,behavior:'instant'});if(art){const scene=previewScene();view.update(scene,{immediate:state.screen==='intro'});warmPaint(scene);}
}
function choose(value){
 if(transitioning)return;
 const editing=complete();clearTimeout(advanceTimer);state=reducer(state,{type:'SELECT',value});const q=QUESTIONS[state.step];render({selection:true});view.update(evolutionScene(visualAnswers(),state.rulesVersion));warmPaint(evolutionScene(visualAnswers(),state.rulesVersion));announce(`${labelFor(q,value)} selected. ${feedback[state.step]}`);
 // Keep the existing 780ms morph; leave a short, quiet beat to see its settled shape.
 advanceTimer=setTimeout(()=>{dispatch({type:editing?'REVEAL':'ADVANCE'});announce(state.screen==='reveal'?`${state.name} observed.`:`Decision ${state.step+1} of five. ${QUESTIONS[state.step].title.replace('\n',' ')}`);},reduced.matches?650:1700);
}
function openRename(){if(state.screen==='reveal')return;clearTimeout(advanceTimer);renameFocus=document.activeElement;const input=document.querySelector('#edit-monster-name');input.value=state.name;input.setCustomValidity('');dialog.showModal();input.focus();input.select();}
function checkName(input){const name=normalizeName(input.value);input.setCustomValidity(name?'':'Enter a name.');return input.reportValidity()?name:null;}
copy.addEventListener('submit',event=>{if(event.target.id!=='create-form')return;event.preventDefault();const name=checkName(copy.querySelector('#monster-name'));if(!name)return;dispatch({type:'START',name,seed:freshSeed(),id:crypto.randomUUID(),createdAt:Date.now()},{art:true});announce(`${name}.`);});
copy.addEventListener('input',event=>{if(event.target.id==='monster-name'){event.target.setCustomValidity('');state=reducer(state,{type:'NAME',name:event.target.value});save();}});
document.querySelector('#rename-form').addEventListener('submit',event=>{event.preventDefault();const name=checkName(document.querySelector('#edit-monster-name'));if(!name)return;state=reducer(state,{type:'NAME',name});dialog.close();render();announce(`Your creature is now called ${name}.`);headerName.focus({preventScroll:true});});
document.querySelector('#edit-monster-name').addEventListener('input',event=>event.target.setCustomValidity(''));
dialog.addEventListener('close',()=>renameFocus?.isConnected&&renameFocus.focus({preventScroll:true}));
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||button.disabled||transitioning)return;
 if(button.dataset.value&&state.screen==='question'){choose(button.dataset.value);return;}
 if(button.dataset.step!==undefined){dispatch({type:'GO',step:Number(button.dataset.step)});return;}
 switch(button.dataset.action){
  case'archive':clearTimeout(advanceTimer);location.hash='archive';break;
  case'back':dispatch({type:'BACK'},{art:true});break;
  case'next':dispatch({type:complete()?'REVEAL':'ADVANCE'});break;
  case'rename':openRename();break;
  case'close-name':dialog.close();break;
  case'story':dispatch({type:'REGENERATE',seed:freshSeed()},{focus:false});announce('A new story for the same creature.');document.querySelector('[data-action="story"]').focus({preventScroll:true});break;

  case'reset':dispatch({type:'RESET'},{art:true});copy.querySelector('#monster-name')?.focus({preventScroll:true});break;
  case'export':void exportCreature();break;
 }
});
copy.addEventListener('keydown',event=>{
 if(!event.target.closest('.choice')||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
 event.preventDefault();const buttons=[...copy.querySelectorAll('.choice')],index=buttons.indexOf(event.target.closest('.choice')),columns=getComputedStyle(copy.querySelector('.choices')).gridTemplateColumns.split(' ').length;
 const delta=event.key==='ArrowUp'?-columns:event.key==='ArrowDown'?columns:event.key==='ArrowLeft'?-1:1;
 const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+delta+buttons.length)%buttons.length;buttons[next].focus();
});
document.querySelector('.wordmark').addEventListener('click',event=>{event.preventDefault();if(parseCollectionRoute(location.hash)){returnToExperience();return;}if(state.screen!=='reveal')dispatch({type:'HOME'},{art:true});});
window.addEventListener('hashchange',()=>{if(parseCollectionRoute(location.hash)||!collection.root.hidden){void routeCollection();return;}if(state.screen==='reveal'){save();return;}if(applyHash()){clearTimeout(advanceTimer);render({focus:true});view.update(previewScene());}});
async function exportCreature(){
 const button=copy.querySelector('[data-action="export"]'),note=document.querySelector('#export-status'),snapshot=structuredClone(state);button.disabled=true;note.textContent='Preparing…';
 try{
  snapshot.scene=view.target;
  const {canvas:poster}=createPoster(snapshot);
  const blob=await new Promise((resolve,reject)=>poster.toBlob(b=>b?resolve(b):reject(new Error('PNG export failed')),'image/png'));
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;
  const filename=snapshot.name.normalize('NFKC').replace(/[^\p{L}\p{N}._-]+/gu,'-').replace(/^[.-]+|[.-]+$/g,'').slice(0,70)||'creature';
  link.download=`graphic-monster-${filename}-${encodeDNA(snapshot.answers)}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);note.textContent='Saved.';announce('Your PNG includes your creature, its name, and its story.');
 }catch{note.textContent='Couldn’t save. Try again.';}finally{button.disabled=false;}
}
document.querySelector('.header-actions [data-action="archive"]').disabled=false;
render();if(parseCollectionRoute(location.hash))void routeCollection();
