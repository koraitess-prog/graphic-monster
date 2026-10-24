import {PaperFormation} from './paper-formation.js';
import {paperPrelude} from './collage.js';
import {QUESTIONS,generateMonster,encodeDNA,decodeDNA} from './dna.js';
import {evolutionScene,amorphousScene} from './evolution.js';
import {CreatureView} from './renderer.js?v=mobile2';
import {initialState,reducer,restoreState,normalizeName} from './state.js';
import {visualChoice} from './samples.js';
import {loadPaintTiles} from './paint-cache.js?v=mobile2';
import {displayFamily} from './typography.js';
import {drawWordmark} from './wordmark.js';
import {openArchive,makeRecord,mergeRecord} from './archive.js?v=mobile2';
import {SharedArchive,combineArchives} from './shared-archive.js';
import {archiveConfig} from './archive-config.js';
import {CollectionScreen,parseCollectionRoute} from './collection-screen.js?v=mobile2';
import {decoratePaperTitles} from './paper-titles.js';
import {playRevealFlight} from './reveal-flight.js';
import {familyProfile} from './family-motion.js';

const app=document.querySelector('#app'),copy=document.querySelector('#copy'),canvas=document.querySelector('#monster');
const announcement=document.querySelector('#announcement'),dialog=document.querySelector('#name-dialog');
const headerName=document.querySelector('#header-name'),caption=document.querySelector('#creature-caption');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),storageKey='graphic-monster:experience:v2';
const feedback=['Taking shape.','Finding its balance.','Something is waking up.','Leaving an impression.','Becoming itself.'];
const freshSeed=()=>crypto.getRandomValues(new Uint32Array(1))[0];
const escape=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labelFor=(q,value)=>q.options.find(o=>o[0]===value)?.[1];
let state=initialState(),advanceTimer,renameFocus,transitioning=false,answerLocked=false,revealPlaying=false,revealController=null;
let archiveDB,records=[],archiveFailure='',archiveQueue=Promise.resolve();
const sharedArchive=new SharedArchive(archiveConfig);let sharedRecords=[],refreshingArchive=false;
const afterlife=document.querySelector('#afterlife');
const collection=new CollectionScreen(document.querySelector('#collection-screen'),{back:()=>returnToExperience(),create:()=>{returnToExperience();dispatch({type:'RESET'},{art:true});},open:id=>{location.hash=id?'creature='+encodeURIComponent(id):'archive';}});
try{state=restoreState(sessionStorage.getItem(storageKey)??sessionStorage.getItem('design-monsters:experience:v1'));}catch{}
function applyHash(){if(state.screen==='reveal')return false;const match=location.hash.match(/^#dna=([0-4][01]{4})$/);if(!match)return false;const answers=decodeDNA(match[1]);const changed=encodeDNA(state.answers)!==match[1];state={...state,answers,step:4,story:changed?null:state.story};state=state.name?reducer(state,{type:'REVEAL'}):{...state,screen:'intro'};return true;}
applyHash();
try{archiveDB=await openArchive();records=await archiveDB.list();}catch{archiveFailure='The collection cannot be saved in this browser right now.';}
const visualAnswers=()=>({...state.answers,...(state.rulesVersion>=6&&state.visualSeed!==null?{seed:state.visualSeed}:{})});
const previewScene=()=>state.screen==='intro'?(state.rulesVersion>=4?paperPrelude():amorphousScene()):state.screen==='reveal'?(records.find(r=>r.id===state.creationId)?.scene??evolutionScene(visualAnswers(),state.rulesVersion)):evolutionScene(visualAnswers(),state.rulesVersion);

const view=new CreatureView(canvas,previewScene());
const formation=new PaperFormation(view);
function warmPaint(scene){void loadPaintTiles(scene).then(()=>{if(!app.hidden&&!formation.active&&!transitioning)view.renderer.draw(view.pose());});}
warmPaint(previewScene());
const stageVisibility=new IntersectionObserver(entries=>{if(transitioning)return;if(formation.active)formation.setVisible(entries[0].isIntersecting);else view.setVisible(entries[0].isIntersecting);},{threshold:.05});stageVisibility.observe(canvas);
function save(){
 try{sessionStorage.setItem(storageKey,JSON.stringify(state));}catch{}
 if(parseCollectionRoute(location.hash))return;
 if(state.screen==='reveal')history.replaceState(null,'',`#dna=${encodeDNA(state.answers)}`);
 else if(location.hash.startsWith('#dna='))history.replaceState(null,'',location.pathname+location.search);
}
function announce(text){announcement.textContent=text;}
function progress(){return `<div class="dimension-nav" role="progressbar" aria-label="Design decisions" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${QUESTIONS.filter(q=>state.answers[q.key]).length}">${QUESTIONS.map((q,i)=>`<span class="dimension${state.step===i?' current':''}${state.answers[q.key]?' complete':''}" aria-hidden="true"><span class="progress-mark"></span></span>`).join('')}</div>`;}
function answer(option,index){const[value,label,detail]=option,selected=state.answers[QUESTIONS[state.step].key]===value;return `<button type="button" class="choice${selected?' selected':''}" data-value="${value}" aria-pressed="${selected}" aria-label="${label}" title="${label}"><span class="choice-art">${visualChoice(value)}</span><span class="choice-label">${label}</span><span class="choice-check" aria-hidden="true">✓</span></button>`;}
function render({focus=false,selection=false}={}){
 document.body.classList.toggle('intro-paper',state.screen==='intro'&&!parseCollectionRoute(location.hash));
 const wordmark=document.querySelector('.wordmark');wordmark.hidden=state.screen==='intro';if(state.screen==='reveal')wordmark.removeAttribute('href');else wordmark.setAttribute('href','./');wordmark.setAttribute('aria-label',state.screen==='reveal'?'GRAPHIC MONSTER':'Graphic Monster home');
 app.className=`experience screen-${state.screen}${state.rulesVersion>=4?" medium-paper":""}`;document.title=state.screen==='reveal'?`${state.name} — GRAPHIC MONSTER`:'GRAPHIC MONSTER — Your design decisions create a creature';
 document.querySelector('.header-actions [data-action="archive"]').hidden=false;
 headerName.hidden=state.screen!=='question';headerName.textContent=state.name;headerName.setAttribute('aria-label',`Edit ${state.name}’s name`);
 caption.textContent='';
 if(state.screen==='intro'){
   copy.innerHTML=`${state.rulesVersion>=4?'<h1 class="intro-title paper-title" tabindex="-1">GRAPHIC<br>MONSTER</h1>':'<h1 class="intro-title furry-title" tabindex="-1"><span class="sr-only">GRAPHIC MONSTER</span><canvas id="title-art" aria-hidden="true"></canvas></h1>'}<form id="create-form" class="name-form"><label class="sr-only" for="monster-name">Name</label><input id="monster-name" name="monsterName" placeholder="Name" value="${escape(state.name)}" required maxlength="48" autocomplete="off" enterkeyhint="go" dir="auto"></form>`;
   if(copy.querySelector('#title-art'))drawWordmark(copy.querySelector('#title-art'));
   document.querySelector('#stage-note').textContent='';
   canvas.setAttribute('aria-label','An amorphous living painting. No face or limbs yet.');
 }else if(state.screen==='question'){
   const q=QUESTIONS[state.step];
   copy.innerHTML=`<div class="question-top"><span class="counter">0${state.step+1} <span>/ 05</span></span></div><h1 class="question-title" tabindex="-1">${q.title.replace('\n',' ')}</h1><div class="choices ${q.options.length===5?'five':'two'}" role="group" aria-label="${q.title.replace('\n',' ')}">${q.options.map(answer).join('')}</div><div class="question-footer">${progress()}</div>`;
   document.querySelector('#stage-note').textContent='';
   canvas.setAttribute('aria-label',`${state.name}, evolving through your design decisions. ${QUESTIONS.filter(q=>state.answers[q.key]).map(q=>labelFor(q,state.answers[q.key])).join(', ')}.`);
 }else{
   state=reducer(state,{type:'REVEAL'});
   const story=state.story.text;
   const nameSize=state.name.length>24?28:state.name.length>12?36:44;
   copy.innerHTML=`<h1 class="reveal-name" style="--name-size:${nameSize}px" tabindex="-1" dir="auto">${escape(state.name)}</h1><div class="poster-actions"><button type="button" class="text-button visit-archive" data-action="archive">Archive <span aria-hidden="true">↗</span></button><button type="button" class="text-button" data-action="reset">New monster</button></div>`;
   fitRevealName();
   document.querySelector('#full-story').innerHTML=`<p class="personality" aria-live="polite" aria-atomic="true">${escape(story)}</p><button type="button" class="another-story text-button" data-action="story">New description</button>`;
   void syncArchive(structuredClone(state));
   document.querySelector('#stage-note').textContent='';canvas.setAttribute('aria-label',revealPlaying?state.name:`${state.name}. ${story}`);
 }
 if(state.screen==='question'){formation.update(generateMonster(visualAnswers(),state.rulesVersion),state.answers);}
 else if(formation.active){formation.stop();view.visible=true;}
 afterlife.hidden=state.screen!=='reveal'||revealPlaying;
 document.body.classList.toggle('monster-reveal',state.screen==='reveal'&&!parseCollectionRoute(location.hash));
 if(state.rulesVersion>=6)decoratePaperTitles(copy,{scene:state.screen==='reveal'?previewScene():undefined});
 window.dispatchEvent(new CustomEvent('graphic-monster:intro',{detail:state.screen==='intro'&&!parseCollectionRoute(location.hash)}));
 if(focus){
   copy.querySelector('h1')?.focus({preventScroll:true});
   if(state.screen==='question'&&matchMedia('(max-width:680px)').matches)window.scrollTo({top:0,behavior:'instant'});
 }
 if(selection)copy.querySelector(`[data-value="${state.answers[QUESTIONS[state.step].key]}"]`)?.focus({preventScroll:true});
 save();
}
function fitRevealName(){
 const title=copy.querySelector('.reveal-name');if(!title)return;
 const family=displayFamily(state.name);title.style.fontFamily=family;const ctx=document.createElement('canvas').getContext('2d');ctx.font=`900 100px ${family}`;
 const natural=ctx.measureText(state.name).width/100,mobile=innerWidth<=680,width=mobile?app.clientWidth-38:app.clientWidth*.88;
 const desired=Number(title.style.getPropertyValue('--name-size').replace('px',''))||174;
 const size=Math.max(20,Math.min(desired,44,width/Math.max(1,natural)));
 title.style.fontSize=`${size}px`;
}
window.addEventListener('resize',fitRevealName);
reduced.addEventListener('change',()=>{if(reduced.matches)for(const animation of [...canvas.getAnimations(),...copy.getAnimations()]){try{animation.finish();}catch{}}});
function returnToExperience(){
 history.pushState(null,'',location.pathname+location.search+(state.screen==='reveal'?`#dna=${encodeDNA(state.answers)}`:''));
 collection.close();app.hidden=false;render({focus:true});if(state.screen!=='question')view.setVisible(true);window.scrollTo({top:0,behavior:'instant'});
}
async function routeCollection(){
 const route=parseCollectionRoute(location.hash);
 if(!route){collection.close();app.hidden=false;render();if(state.screen!=='question')view.setVisible(true);return;}
 document.body.classList.remove('intro-paper');
 revealController?.abort();document.body.classList.remove('monster-reveal');
 window.dispatchEvent(new CustomEvent('graphic-monster:intro',{detail:false}));
 clearTimeout(advanceTimer);formation.stop();app.hidden=true;afterlife.hidden=true;headerName.hidden=true;view.setVisible(false);
 document.querySelector('.header-actions [data-action="archive"]').hidden=true;
 collection.show(route,records,archiveFailure,sharedRecords.length);
 await refreshArchive();
}
async function refreshArchive(){
 if(refreshingArchive)return;refreshingArchive=true;
 try{
  await archiveQueue;
  let local=records;
  if(archiveDB)try{local=await archiveDB.list();}catch(error){console.warn('Local archive:',error.message);}
  sharedRecords=await sharedArchive.list();archiveFailure='';
  for(const record of local){
   const published=sharedRecords.find(r=>r.id===record.id);
   if(record.createdAt>=archiveConfig.enabledAt&&(!published||JSON.stringify(published.story)!==JSON.stringify(record.story))){
    try{await sharedArchive.save(record);sharedRecords=combineArchives(sharedRecords,[record]);}
    catch{archiveFailure='Saved here. Sharing unavailable; reopen Archive to retry.';}
   }
  }
  records=combineArchives(local,sharedRecords);
 }catch(error){console.warn('Shared archive:',error.message);archiveFailure='Shared archive unavailable. Showing saved creatures.';}
 finally{refreshingArchive=false;}
 const route=parseCollectionRoute(location.hash);if(route)collection.show(route,records,archiveFailure,sharedRecords.length);
}
// Refresh only while the collection is visible, without interrupting a specimen.
setInterval(()=>{if(!document.hidden&&location.hash==='#archive')void refreshArchive();},30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&parseCollectionRoute(location.hash))void refreshArchive();});
async function syncArchive(snapshot){
 const incoming=makeRecord(snapshot),existing=records.find(r=>r.id===incoming.id);
 const record=mergeRecord(existing,incoming);records=existing?records.map(r=>r.id===record.id?record:r):[record,...records];
 archiveQueue=archiveQueue.then(async()=>{
  let localSaved=false;
  if(archiveDB)try{await archiveDB.save(record);localSaved=true;}catch{}
  try{await sharedArchive.save(record);archiveFailure='';}
  catch(error){console.warn('Shared archive save:',error.message);archiveFailure=localSaved?'Saved here. Sharing unavailable; retry from Archive.':'This creature could not be saved. Your existing collection is retained.';}
 });await archiveQueue;
}
function artRect(){const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/600,r.height/760);return {x:r.left+r.width/2,y:r.top+r.height/2,scale};}
async function enterReveal(next,{focus=true}={}){
 const sourceState=state,controller=new AbortController();revealController=controller;transitioning=true;revealPlaying=true;clearTimeout(advanceTimer);
 copy.querySelectorAll('button').forEach(b=>b.disabled=true);
 document.body.classList.add('reveal-playing');app.classList.add('reveal-air');app.dataset.revealPhase='assembling';view.renderer.ground=false;window.scrollTo({top:0,behavior:'instant'});
 const finalScene=generateMonster({...next.answers,...(next.visualSeed!==null?{seed:next.visualSeed}:{})},next.rulesVersion);
 try{
  await formation.reveal(finalScene);
  if(controller.signal.aborted||state!==sourceState||parseCollectionRoute(location.hash))return;
  view.visible=false;view.update(finalScene,{immediate:true});view.stop();state=next;render({focus:false});app.classList.add('reveal-stage');
  const completed=await playRevealFlight({view,app,reduced,signal:controller.signal});
  if(!completed||controller.signal.aborted||parseCollectionRoute(location.hash))return;
  view.renderer.ground=true;view.renderer.draw(finalScene);
  const before=artRect();app.classList.remove('reveal-stage');app.querySelector('.studio').style.removeProperty('transform');app.querySelector('.studio').style.removeProperty('transform-origin');app.style.removeProperty('--fall-distance');
  window.scrollTo({top:0,behavior:'instant'});const after=artRect();
  if(!reduced.matches&&!document.hidden){
   const landing=canvas.animate([{transform:`translate(${before.x-after.x}px,${before.y-after.y}px) scale(${before.scale/after.scale})`},{transform:'translate(0,0) scale(1)'}],{duration:320,easing:'cubic-bezier(.22,.72,.2,1)'});
   await landing.finished.catch(()=>{});
  }
  if(controller.signal.aborted)return;
  revealPlaying=false;document.body.classList.remove('reveal-playing');app.dataset.revealPhase='complete';
  afterlife.hidden=false;canvas.setAttribute('aria-label',`${state.name}. ${state.story.text}`);
  if(!reduced.matches&&!document.hidden)afterlife.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:400,easing:'ease-out'});
  view.visible=true;view.familyDue=performance.now()+familyProfile(finalScene).pause;view.update(finalScene,{immediate:true});
  if(focus)copy.querySelector('h1')?.focus({preventScroll:true});announce(`${state.name}. ${state.story.text}`);
 }catch(error){
  console.warn('Creature arrival:',error.message);
  if(!controller.signal.aborted&&!parseCollectionRoute(location.hash)){revealPlaying=false;state=next;view.visible=true;view.update(finalScene,{immediate:true});render({focus});window.scrollTo({top:0,behavior:'instant'});}
 }finally{
  if(revealController===controller){transitioning=false;answerLocked=false;revealPlaying=false;revealController=null;view.renderer.ground=true;document.body.classList.remove('reveal-playing');app.classList.remove('reveal-air','reveal-stage');app.style.removeProperty('--fall-distance');app.querySelector('.studio')?.style.removeProperty('transform');app.querySelector('.studio')?.style.removeProperty('transform-origin');}
 }
}
function dispatch(event,{focus=true,art=false}={}){
 clearTimeout(advanceTimer);answerLocked=false;const previous=state.screen,next=reducer(state,event);
 if(previous==='question'&&next.screen==='reveal'){enterReveal(next,{focus});return;}
 state=next;render({focus});if(previous!=='reveal'&&state.screen==='reveal')window.scrollTo({top:0,behavior:'instant'});if(art&&state.screen!=='question'){const scene=previewScene();view.update(scene,{immediate:state.screen==='intro'});warmPaint(scene);}
}
function choose(value){
 if(transitioning||answerLocked)return;
 answerLocked=true;
 transferMaterial(copy.querySelector(`[data-value="${value}"] .choice-art`));
 clearTimeout(advanceTimer);state=reducer(state,{type:'SELECT',value});const q=QUESTIONS[state.step];render({selection:true});announce(`${labelFor(q,value)} selected. ${feedback[state.step]}`);
 copy.querySelectorAll('.choice').forEach(b=>b.disabled=true);
 advanceTimer=setTimeout(()=>{answerLocked=false;dispatch({type:'ADVANCE'});},reduced.matches?0:140);
}
function transferMaterial(source){
 if(!source||reduced.matches||document.hidden)return;
 const start=source.getBoundingClientRect(),target=canvas.getBoundingClientRect(),fragment=source.cloneNode(true);
 fragment.className='material-transfer';fragment.setAttribute('aria-hidden','true');
 Object.assign(fragment.style,{left:`${start.left}px`,top:`${start.top}px`,width:`${start.width}px`,height:`${start.height}px`});
 // Repeated SVG clip ids must stay local to the travelling copy.
 const prefix=`flight-${crypto.randomUUID()}-`;
 fragment.querySelectorAll('[id]').forEach(el=>{const id=el.id;fragment.querySelectorAll('[clip-path]').forEach(p=>{if(p.getAttribute('clip-path')===`url(#${id})`)p.setAttribute('clip-path',`url(#${prefix}${id})`);});el.id=prefix+id;});
 document.body.append(fragment);
 const dx=target.left+target.width/2-start.left-start.width/2,dy=target.top+target.height*.46-start.top-start.height/2;
 const motion=fragment.animate([{transform:'translate(0,0) scale(1)',opacity:.85},{transform:`translate(${dx*.65}px,${dy*.65-20}px) scale(.65)`,opacity:.9,offset:.65},{transform:`translate(${dx}px,${dy}px) scale(.15)`,opacity:0}],{duration:950,easing:'cubic-bezier(.25,.65,.25,1)'});
 motion.finished.catch(()=>{}).finally(()=>fragment.remove());
}
function openRename(){if(state.screen==='reveal')return;clearTimeout(advanceTimer);renameFocus=document.activeElement;const input=document.querySelector('#edit-monster-name');input.value=state.name;input.setCustomValidity('');dialog.showModal();input.focus();input.select();}
function checkName(input){const name=normalizeName(input.value);input.setCustomValidity(name?'':'Enter a name.');return input.reportValidity()?name:null;}
copy.addEventListener('submit',event=>{if(event.target.id!=='create-form')return;event.preventDefault();const name=checkName(copy.querySelector('#monster-name'));if(!name)return;dispatch({type:'START',name,seed:freshSeed(),id:crypto.randomUUID(),createdAt:Date.now()},{art:true});announce(`${name}.`);});
copy.addEventListener('input',event=>{if(event.target.id==='monster-name'){event.target.setCustomValidity('');state=reducer(state,{type:'NAME',name:event.target.value});save();}});
document.querySelector('#rename-form').addEventListener('submit',event=>{event.preventDefault();const name=checkName(document.querySelector('#edit-monster-name'));if(!name)return;state=reducer(state,{type:'NAME',name});dialog.close();render();announce(`Your creature is now called ${name}.`);headerName.focus({preventScroll:true});});
document.querySelector('#edit-monster-name').addEventListener('input',event=>event.target.setCustomValidity(''));
dialog.addEventListener('close',()=>renameFocus?.isConnected&&renameFocus.focus({preventScroll:true}));
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||button.disabled||transitioning||answerLocked)return;
 if(button.dataset.value&&state.screen==='question'){choose(button.dataset.value);return;}
 switch(button.dataset.action){
  case'archive':clearTimeout(advanceTimer);location.hash='archive';break;
  case'back':dispatch({type:'BACK'},{art:true});break;
  case'rename':openRename();break;
  case'close-name':dialog.close();break;
  case'story':dispatch({type:'REGENERATE',seed:freshSeed()},{focus:false});announce('A new story for the same creature.');document.querySelector('[data-action="story"]').focus({preventScroll:true});break;

  case'reset':dispatch({type:'RESET'},{art:true});copy.querySelector('#monster-name')?.focus({preventScroll:true});break;
 }
});
copy.addEventListener('keydown',event=>{
 if(!event.target.closest('.choice')||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
 event.preventDefault();const buttons=[...copy.querySelectorAll('.choice')],index=buttons.indexOf(event.target.closest('.choice')),columns=getComputedStyle(copy.querySelector('.choices')).gridTemplateColumns.split(' ').length;
 const delta=event.key==='ArrowUp'?-columns:event.key==='ArrowDown'?columns:event.key==='ArrowLeft'?-1:1;
 const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+delta+buttons.length)%buttons.length;buttons[next].focus();
});
document.querySelector('.wordmark').addEventListener('click',event=>{event.preventDefault();if(transitioning||answerLocked)return;if(parseCollectionRoute(location.hash)){returnToExperience();return;}if(state.screen!=='reveal')dispatch({type:'HOME'},{art:true});});
window.addEventListener('hashchange',()=>{if(parseCollectionRoute(location.hash)||!collection.root.hidden){void routeCollection();return;}if(state.screen==='reveal'){save();return;}if(applyHash()){clearTimeout(advanceTimer);render({focus:true});view.update(previewScene());}});
document.querySelector('.header-actions [data-action="archive"]').disabled=false;
render();if(parseCollectionRoute(location.hash))void routeCollection();
else for(let resume=0;resume<5&&state.screen==='question'&&state.answers[QUESTIONS[state.step].key]&&!transitioning;resume++)dispatch({type:'ADVANCE'});
