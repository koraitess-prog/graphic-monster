import {loadPaintTiles} from './paint-cache.js?v=laboratory1';
import {SpecimenIndex} from './specimen-index.js';
import {mountObservation} from './observation.js';
import {CreatureView} from './renderer.js?v=laboratory1';
import {QUESTIONS} from './dna.js';
import {visualSample} from './samples.js';
import {decoratePaperTitles} from './paper-titles.js?v=laboratory1';
import {displayFamily} from './typography.js';
import {releaseLivingTitles} from './living-title.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function parseCollectionRoute(hash){
 if(hash==='#archive')return {type:'archive',hash};
 if(hash.startsWith('#creature=')){try{return {type:'profile',id:decodeURIComponent(hash.slice(10)),hash};}catch{return {type:'missing',hash};}}
 return null;
}
export function identityTraits(record){
 return QUESTIONS.map(q=>{const option=q.options.find(o=>o[0]===record.answers[q.key]);return {key:q.key,value:option?.[0]??'',label:option?.[1]??'Unknown'};});
}
export function windowMarkup(records){return records.map((r,i)=>`<button type="button" class="habitat" data-specimen="${esc(r.id)}" aria-label="Observe ${esc(r.name)}"><span class="habitat-room"><canvas width="1" height="1" aria-hidden="true"></canvas><span class="habitat-open" aria-hidden="true">↗</span></span><span class="habitat-label"><span dir="auto">${esc(r.name)}</span><span class="specimen-number" aria-hidden="true">${String(records.length-i).padStart(3,'0')}</span></span></button>`).join('');}
export class CollectionScreen{
 constructor(root,actions){
  this.root=root;this.actions=actions;this.signature='';
  root.addEventListener('click',event=>{
   const specimen=event.target.closest('[data-specimen]');if(specimen){this.focusSpecimen(specimen.dataset.specimen);return;}
   const action=event.target.closest('[data-collection-action]')?.dataset.collectionAction;
   if(action==='archive')this.actions.open();if(action==='back')this.actions.back();if(action==='new')this.actions.create();
  });
 }
 show(route,records,failure='',sharedCount=0){
  const signature=JSON.stringify([route.hash,records.map(r=>[r.id,r.story?.text]),failure,sharedCount]);
  document.body.classList.toggle('archive-page',route.type==='archive');
  this.root.hidden=false;if(signature===this.signature)return;
  const sameRoute=this.routeHash===route.hash,scroll=window.scrollY,focused=document.activeElement;
  const focusId=this.root.contains(focused)?focused?.dataset?.specimen:null;
  const focusAction=this.root.contains(focused)?focused?.dataset?.collectionAction:null;
  this.routeHash=route.hash;
  this.release();this.signature=signature;
  const wordmark=document.querySelector('.wordmark');wordmark.hidden=false;wordmark.setAttribute('href','./');wordmark.setAttribute('aria-label','Graphic Monster home');
  if(route.type==='archive'){
   document.title='Monster Archive — GRAPHIC MONSTER';
   this.records=records;
   this.root.innerHTML=`<header class="lab-archive-header"><h1 tabindex="-1">Living archive</h1><button type="button" class="text-button lab-new" data-collection-action="new">New experiment</button></header>${failure?`<p class="collection-error" role="status">${esc(failure)}</p>`:''}${records.length?`<section class="archive-observation" aria-label="Focused specimen"><div class="specimen-focus"></div><nav class="specimen-strip" aria-label="Select a specimen">${windowMarkup(records)}</nav></section>`:`<div class="collection-empty"><p>No specimens yet.</p></div>`}`;
   if(records.length){this.gallery=new SpecimenIndex(this.root.querySelector('.specimen-strip'),records);this.focusSpecimen(records.some(r=>r.id===this.selectedId)?this.selectedId:records[0].id);}
  }else{
   const record=records.find(r=>r.id===route.id);
   document.title=record?`${record.name} — Monster Archive`:'Creature unavailable — GRAPHIC MONSTER';
   if(!record){this.root.innerHTML=`<button class="text-button" data-collection-action="archive">← Archive</button><div class="collection-empty"><h1 tabindex="-1">Not here yet.</h1><p>${esc(failure||'This creature is unavailable.')}</p></div>`;}
   else{
    const number=String(records.length-records.indexOf(record)).padStart(3,'0');
    const fullStory=String(record.story?.text??record.originalStory?.text??'');
    this.root.innerHTML=`<div class="collection-toolbar"><button class="text-button" data-collection-action="archive"><span aria-hidden="true">←</span> Archive</button><span class="dossier-number">SPECIMEN ${number}</span></div><article class="creature-dossier"><div class="dossier-art"><canvas role="img" aria-label="${esc(record.name)}, an archived illustrated creature"></canvas></div><div class="dossier-copy"><p class="dossier-eyebrow">Living anomaly</p><h1 dir="auto" tabindex="-1">${esc(record.name)}</h1><p class="dossier-story" dir="auto">${esc(record.story?.text??record.originalStory?.text)}</p><section class="dossier-identity" aria-label="Design identity"><h2>Design instincts</h2><ul>${identityTraits(record).map(t=>`<li><span class="trait-symbol">${visualSample(t.value)}</span><span>${esc(t.label)}</span></li>`).join('')}</ul></section></div></article>`;
    this.root.querySelector('h1').style.fontFamily=displayFamily(record.name);
    {const story=this.root.querySelector('.dossier-story'),disclosure=document.createElement('details');disclosure.className='dossier-story field-notes';disclosure.innerHTML=`<summary>Field notes</summary><p dir="auto">${esc(fullStory)}</p>`;story.replaceWith(disclosure);}
    const art=this.root.querySelector('.dossier-art');art.classList.add('observation-field');
    const controls=document.createElement('div');controls.className='observation-toolbar';controls.innerHTML='<span class="observation-log" role="status">material / settled</span><div><button class="text-button" data-observe="stimulate">Place stimulus</button><button class="text-button" data-observe="pause" aria-pressed="false">Pause</button></div>';art.after(controls);
    this.mountSpecimen(art,record,controls);
   }
  }
  if(route.type==='profile')decoratePaperTitles(this.root,{scene:records.find(r=>r.id===route.id)?.scene});
  if(sameRoute){
   const target=focusId?this.root.querySelector(`[data-specimen="${CSS.escape(focusId)}"]`):focusAction?this.root.querySelector(`[data-collection-action="${CSS.escape(focusAction)}"]`):null;
   target?.focus({preventScroll:true});window.scrollTo({top:scroll,behavior:'instant'});
  }else{this.root.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 }
 mountSpecimen(field,record,controls){
  this.observation?.destroy();this.profile?.destroy();
  const profile=new CreatureView(field.querySelector('canvas'),record.scene);this.profile=profile;
  this.observation=mountObservation(field,profile,{log:controls.querySelector('.observation-log'),pause:controls.querySelector('[data-observe="pause"]'),stimulate:controls.querySelector('[data-observe="stimulate"]')});
  void loadPaintTiles(record.scene).then(()=>{if(this.profile===profile)profile.renderer.draw(profile.pose());});
 }
 focusSpecimen(id){
  const record=this.records?.find(r=>r.id===id),focus=this.root.querySelector('.specimen-focus');if(!record||!focus)return;
  this.selectedId=id;
  // The record's persistent ID is the catalogue identity; array order is navigation only.
  focus.innerHTML=`<div class="observation-field"><div class="specimen-identity"><span class="lab-meta">SPECIMEN / ${esc(record.id.slice(0,8))}</span><h2 dir="auto">${esc(record.name)}</h2></div><canvas role="img" aria-label="${esc(record.name)}, living paper specimen"></canvas></div><div class="observation-toolbar"><span class="observation-log" role="status" aria-live="polite">material / settled</span><div><button type="button" class="text-button" data-observe="stimulate">Place stimulus</button><button type="button" class="text-button" data-observe="pause" aria-pressed="false">Pause</button></div></div><details class="field-notes"><summary>Field notes</summary><p dir="auto">${esc(record.story?.text??record.originalStory?.text??'')}</p><button type="button" class="text-button" data-open-record>Design record</button></details>`;
  focus.querySelector('[data-open-record]').addEventListener('click',()=>this.actions.open(record.id));
  for(const button of this.root.querySelectorAll('[data-specimen]'))button.setAttribute('aria-pressed',String(button.dataset.specimen===id));
  this.mountSpecimen(focus.querySelector('.observation-field'),record,focus.querySelector('.observation-toolbar'));
 }
 release(){releaseLivingTitles(this.root);this.observation?.destroy();this.observation=null;this.gallery?.destroy();this.gallery=null;this.profile?.destroy();this.profile=null;}
 close(){this.release();this.signature='';this.routeHash='';document.body.classList.remove('archive-page');this.root.hidden=true;this.root.replaceChildren();}
}
