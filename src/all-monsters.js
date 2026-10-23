import {QUESTIONS,combinations,generateMonster,encodeDNA} from './dna.js';
import {LivingArchive} from './archive-gallery.js';
import {MonsterRenderer} from './renderer.js?v=mobile2';
import {decoratePaperTitles} from './paper-titles.js';
decoratePaperTitles();

const dimensions=['Language','Organization','Gaze','Surface','Gesture'];
const records=combinations().map(answers=>{const scene=generateMonster(answers,6);return {code:encodeDNA(answers),answers,scene,seed:scene.seed};});
const byCode=new Map(records.map(record=>[record.code,record]));
const filters=document.querySelector('#atlas-filters'),root=document.querySelector('#all-creatures');
const selected=new Set(),dialog=document.querySelector('#creature-comparison'),bar=document.querySelector('.compare-bar');
const status=document.querySelector('#gallery-status');
const staging=document.createElement('canvas'),renderer=new MonsterRenderer(staging,{scale:1,background:'#202426'});
const answerLabel=(q,value)=>q.options.find(option=>option[0]===value)[1];
const answerList=record=>`<div class="answer-list">${QUESTIONS.map((q,i)=>`<span><small>${dimensions[i]}</small>${answerLabel(q,record.answers[q.key])}</span>`).join('')}</div>`;
const label=record=>QUESTIONS.map(q=>answerLabel(q,record.answers[q.key])).join(', ');

filters.innerHTML=QUESTIONS.map((q,i)=>`<label>${dimensions[i]}<select name="${q.key}"><option value="">All</option>${q.options.map(([value,text])=>`<option value="${value}">${text}</option>`).join('')}</select></label>`).join('');
for(const [family,name] of QUESTIONS[0].options){
 const section=document.createElement('section');section.className='creature-family';section.dataset.family=family;
 const familyRecords=records.filter(r=>r.answers.principle===family);
 section.innerHTML=`<header class="family-heading"><h2>${name}</h2><span class="family-count">16</span></header><div class="possibility-grid">${familyRecords.map(record=>`<article class="possibility" data-code="${record.code}" data-anatomy="${record.scene.anatomy}" data-selected="false"><button class="possibility-art" type="button" data-specimen="${record.code}" data-inspect="${record.code}" aria-label="View creature ${record.code}: ${label(record)}"><canvas width="1" height="1" aria-hidden="true"></canvas></button><div class="possibility-copy"><div class="possibility-id"><h3>${record.code}</h3><button class="select-creature" type="button" data-select="${record.code}" aria-pressed="false" aria-label="Compare creature ${record.code}">Compare</button></div>${answerList(record)}</div></article>`).join('')}</div>`;
 root.append(section);
}

// A single staging renderer shares its print textures across every thumbnail.
// Only nearby cards allocate backing pixels; the full set never runs 80 animations.
const cards=new Map([...root.querySelectorAll('.possibility')].map(card=>[card.dataset.code,card]));
function drawTo(canvas,record,width=420){
 renderer.draw(record.scene);canvas.width=width;canvas.height=Math.round(width*760/600);
 canvas.getContext('2d').drawImage(staging,0,0,canvas.width,canvas.height);
}
const gallery=new LivingArchive(root,records);

function applyFilters(){
 const query=new URLSearchParams();let count=0;
 for(const record of records){const matches=QUESTIONS.every(q=>!filters.elements[q.key].value||record.answers[q.key]===filters.elements[q.key].value),card=cards.get(record.code);card.hidden=!matches;
  if(matches)count++;
 }
 for(const section of root.children){const count=[...section.querySelectorAll('.possibility')].filter(card=>!card.hidden).length;section.hidden=!count;section.querySelector('.family-count').textContent=count;}
 for(const q of QUESTIONS)if(filters.elements[q.key].value)query.set(q.key,filters.elements[q.key].value);
 history.replaceState(null,'',location.pathname+(query.size?'?'+query.toString():''));
 document.querySelector('#result-count').textContent=`${count} / 80`;
 window.scrollTo({top:0,behavior:'instant'});
}
const initialQuery=new URLSearchParams(location.search);
for(const q of QUESTIONS){const value=initialQuery.get(q.key);if(q.options.some(option=>option[0]===value))filters.elements[q.key].value=value;}
filters.addEventListener('change',applyFilters);filters.addEventListener('submit',event=>event.preventDefault());
document.querySelector('#reset-filters').addEventListener('click',()=>{filters.reset();applyFilters();});

function updateSelection(){
 for(const [code,card]of cards){card.dataset.selected=String(selected.has(code));card.querySelector('[data-select]').setAttribute('aria-pressed',String(selected.has(code)));}
 bar.hidden=selected.size===0;document.querySelector('#selected-count').textContent=`${selected.size} / 4 selected`;
 document.querySelector('#compare-selected').disabled=selected.size<2;
}
function showComparison(codes){
 const content=document.querySelector('#comparison-content');content.style.setProperty('--comparison-columns',Math.min(codes.length,4));
 document.querySelector('#comparison-title').textContent=codes.length===1?'Creature '+codes[0]:'Side by side';
 content.innerHTML=codes.map(code=>{const record=byCode.get(code);return `<figure class="comparison-specimen"><canvas role="img" aria-label="Creature ${code}: ${label(record)}"></canvas><figcaption><h3>${answerLabel(QUESTIONS[0],record.answers.principle)} / ${code}</h3>${answerList(record)}<p class="specimen-seed">SEED ${record.scene.seed} · CUT PAPER V6</p></figcaption></figure>`;}).join('');
 renderer.resize(2);content.querySelectorAll('canvas').forEach((canvas,i)=>drawTo(canvas,byCode.get(codes[i]),900));renderer.resize(1);
 dialog.showModal();
}
root.addEventListener('click',event=>{
 const inspect=event.target.closest('[data-inspect]');if(inspect){showComparison([inspect.dataset.inspect]);return;}
 const button=event.target.closest('[data-select]');if(!button)return;const code=button.dataset.select;
 if(selected.has(code))selected.delete(code);else if(selected.size<4)selected.add(code);else{status.textContent='Four selected. Remove one to compare a different creature.';return;}
 status.textContent=`${selected.size} creatures selected.`;updateSelection();
});
document.querySelector('#clear-selection').addEventListener('click',()=>{selected.clear();updateSelection();});
document.querySelector('#compare-selected').addEventListener('click',()=>showComparison([...selected]));
document.querySelector('#close-comparison').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>document.querySelector('#comparison-content').replaceChildren());
applyFilters();
