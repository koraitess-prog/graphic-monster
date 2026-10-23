import {generateMonster,QUESTIONS} from './dna.js';
import {ANATOMIES} from './paper-dna.js';
import {CreatureView,MonsterRenderer} from './renderer.js?v=mobile2';
import {decoratePaperTitles} from './paper-titles.js';
const names={typography:'Rift',grid:'Scuttle',color:'Sallow',shape:'Crook',texture:'Bristle',accordion:'Pleat',crane:'Stilt',knot:'Tangle'};
const selector=document.querySelector('#anatomy'),motion=document.querySelector('#motion'),root=document.querySelector('.comparisons'),canvas=document.querySelector('#specimen');
const requestedBody=new URLSearchParams(location.search).get('body');
selector.innerHTML=ANATOMIES.map(a=>`<option value="${a}">${names[a]}</option>`).join('');selector.value=ANATOMIES.includes(requestedBody)?requestedBody:'typography';
const answers={principle:'typography',organization:'experiment',gaze:'clarity',density:'rich',attitude:'precise'};let eyeVariant='central';
const eyes=document.createElement('fieldset');eyes.className='toggle';eyes.setAttribute('aria-label','Pleat eyes');eyes.hidden=true;eyes.innerHTML='<button data-eye="central" aria-pressed="true">One eye</button><button data-eye="side" aria-pressed="false">Side eyes</button>';document.querySelector('.tools').append(eyes);
const build=(principle=answers.principle)=>generateMonster({...answers,principle,anatomy:selector.value,...(selector.value==='accordion'?{eyeVariant}:{})},6);
const view=new CreatureView(canvas,build()),staging=document.createElement('canvas'),renderer=new MonsterRenderer(staging,{scale:1,background:'#202426'});
document.querySelector('.languages').innerHTML=QUESTIONS[0].options.map(([v,label])=>`<button data-language="${v}" aria-pressed="${v===answers.principle}">${label}</button>`).join('');
for(const [v,label]of QUESTIONS[0].options){const f=document.createElement('figure');f.innerHTML=`<canvas role="img" aria-label="${label} paper construction"></canvas><figcaption>${label}</figcaption>`;f.dataset.language=v;root.append(f);}
function update({thumbnails=false}={}){
 eyes.hidden=selector.value!=='accordion';eyes.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.eye===eyeVariant)));
 const scene=build();view.update(scene,{immediate:!motion.checked});canvas.setAttribute('aria-label',`${names[scene.anatomy]}, ${answers.principle} paper`);
 document.querySelector('#dna-status').textContent=`${scene.code} · ${names[scene.anatomy]} · ${scene.shapes.filter(s=>s.paperPiece&&!s.carrier&&s.vocabulary!=='neutral').length} cuts`;
 document.querySelectorAll('[data-language][aria-pressed]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===answers.principle)));
 document.querySelectorAll('[data-density]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.density===answers.density)));
 if(thumbnails)for(const f of root.children){renderer.draw(build(f.dataset.language));const c=f.querySelector('canvas');c.width=300;c.height=380;c.getContext('2d').drawImage(staging,0,0,300,380);}
}
document.querySelector('.languages').addEventListener('click',event=>{const button=event.target.closest('[data-language]');if(button){answers.principle=button.dataset.language;update();}});
document.querySelector('.toggle').addEventListener('click',event=>{const button=event.target.closest('[data-density]');if(button){answers.density=button.dataset.density;update({thumbnails:true});}});
selector.addEventListener('change',()=>update({thumbnails:true}));motion.addEventListener('change',()=>view.setVisible(motion.checked));
eyes.addEventListener('click',event=>{const b=event.target.closest('[data-eye]');if(b){eyeVariant=b.dataset.eye;update({thumbnails:true});}});
decoratePaperTitles();
update({thumbnails:true});
