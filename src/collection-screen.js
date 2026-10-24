import {loadPaintTiles} from './paint-cache.js?v=mobile2';
import {LivingArchive} from './archive-gallery.js?v=mobile2';
import {CreatureView} from './renderer.js?v=mobile2';
import {QUESTIONS} from './dna.js';
import {visualSample} from './samples.js';
import {decoratePaperTitles} from './paper-titles.js';
import {displayFamily} from './typography.js';
import {shortStatement} from './archive.js';
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
   const specimen=event.target.closest('[data-specimen]');if(specimen){this.actions.open(specimen.dataset.specimen);return;}
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
   this.root.innerHTML=`<header class="archive-intro"><h1 class="archive-create-heading" tabindex="-1"><button type="button" class="archive-create-title" data-collection-action="new" aria-label="Create new monster"><span class="archive-create-lettering">CREATE NEW MONSTER</span></button></h1><p class="archive-label">ARCHIVE</p></header>${failure?`<p class="collection-error" role="status">${esc(failure)}</p>`:''}${records.length?`<div class="habitat-grid">${windowMarkup(records)}</div>`:`<div class="collection-empty"><span class="empty-window" aria-hidden="true"></span><p>No creatures yet.</p></div>`}`;
   if(records.length)this.gallery=new LivingArchive(this.root.querySelector('.habitat-grid'),records);
  }else{
   const record=records.find(r=>r.id===route.id);
   document.title=record?`${record.name} — Monster Archive`:'Creature unavailable — GRAPHIC MONSTER';
   if(!record){this.root.innerHTML=`<button class="text-button" data-collection-action="archive">← Archive</button><div class="collection-empty"><h1 tabindex="-1">Not here yet.</h1><p>${esc(failure||'This creature is unavailable.')}</p></div>`;}
   else{
    const number=String(records.length-records.indexOf(record)).padStart(3,'0');
    const fullStory=String(record.story?.text??record.originalStory?.text??''),lead=shortStatement(fullStory),rest=fullStory.slice(lead.length).trim();
    this.root.innerHTML=`<div class="collection-toolbar"><button class="text-button" data-collection-action="archive"><span aria-hidden="true">←</span> Archive</button><span class="dossier-number">SPECIMEN ${number}</span></div><article class="creature-dossier"><div class="dossier-art"><canvas role="img" aria-label="${esc(record.name)}, an archived illustrated creature"></canvas></div><div class="dossier-copy"><p class="dossier-eyebrow">Living anomaly</p><h1 dir="auto" tabindex="-1">${esc(record.name)}</h1><p class="dossier-story" dir="auto">${esc(record.story?.text??record.originalStory?.text)}</p><section class="dossier-identity" aria-label="Design identity"><h2>Design instincts</h2><ul>${identityTraits(record).map(t=>`<li><span class="trait-symbol">${visualSample(t.value)}</span><span>${esc(t.label)}</span></li>`).join('')}</ul></section></div></article>`;
    this.root.querySelector('h1').style.fontFamily=displayFamily(record.name);
    if(rest){const story=this.root.querySelector('.dossier-story'),disclosure=document.createElement('details');disclosure.className='dossier-story';disclosure.dir='auto';disclosure.innerHTML=`<summary>${esc(lead)}</summary><p>${esc(rest)}</p>`;story.replaceWith(disclosure);}
    this.profile=new CreatureView(this.root.querySelector('.dossier-art canvas'),record.scene);this.profile.greet(600);void loadPaintTiles(record.scene).then(()=>this.profile?.renderer.draw(this.profile.pose()));
    this.profileVisibility=new IntersectionObserver(entries=>this.profile?.setVisible(entries[0].isIntersecting),{threshold:.05});this.profileVisibility.observe(this.root.querySelector('.dossier-art'));
   }
  }
  decoratePaperTitles(this.root,{scene:route.type==='profile'?records.find(r=>r.id===route.id)?.scene:undefined});
  if(sameRoute){
   const target=focusId?this.root.querySelector(`[data-specimen="${CSS.escape(focusId)}"]`):focusAction?this.root.querySelector(`[data-collection-action="${CSS.escape(focusAction)}"]`):null;
   target?.focus({preventScroll:true});window.scrollTo({top:scroll,behavior:'instant'});
  }else{this.root.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 }
 release(){releaseLivingTitles(this.root);this.gallery?.destroy();this.gallery=null;this.profileVisibility?.disconnect();this.profileVisibility=null;this.profile?.destroy();this.profile=null;}
 close(){this.release();this.signature='';this.routeHash='';document.body.classList.remove('archive-page');this.root.hidden=true;this.root.replaceChildren();}
}
