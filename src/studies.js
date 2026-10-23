import {specimens,drawMonster} from './illustrations.js';
const gallery=document.querySelector('#gallery'),dialog=document.querySelector('#specimen');
let selectedButton;
gallery.innerHTML=specimens.map((s,i)=>`<article class="card"><button class="art-button" data-index="${i}" aria-label="Look closer at ${s.name}"><span class="study-number">STUDY / 0${i+1}</span><canvas role="img" aria-label="${s.name}, ${s.subtitle}. Original gouache, pencil and ink monster illustration."></canvas><span class="enlarge" aria-hidden="true">↗</span></button><div class="caption"><div class="name-row"><h3>${s.name}</h3><span class="mono">SEED ${s.seed}</span></div><div class="subtitle">${s.subtitle}</div><p class="description">${s.description}</p><div class="material">${s.principles.texture.toUpperCase()}</div></div></article>`).join('');
gallery.querySelectorAll('canvas').forEach((canvas,i)=>drawMonster(canvas,specimens[i]));
gallery.addEventListener('click',event=>{
 const button=event.target.closest('.art-button');if(!button)return;selectedButton=button;
 const s=specimens[Number(button.dataset.index)];
 document.querySelector('#specimen-content').innerHTML=`<div class="detail"><canvas role="img" aria-label="${s.name}, enlarged illustration"></canvas><div><span class="mono">ILLUSTRATION STUDY / SEED ${s.seed}</span><h2>${s.name}</h2><div class="subtitle">${s.subtitle}</div><p>${s.description}</p><dl>${Object.entries(s.principles).map(([key,value])=>`<dt>${key[0].toUpperCase()+key.slice(1)}</dt><dd>${value}</dd>`).join('')}</dl></div></div>`;
 drawMonster(document.querySelector('.detail canvas'),s,{scale:2});dialog.showModal();
});
document.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>selectedButton?.focus());
