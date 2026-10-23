import {generateMonster} from './dna.js';
import {CreatureView} from './renderer.js?v=mobile2';
const answers={principle:'typography',organization:'experiment',gaze:'clarity',density:'rich',attitude:'precise'};
const variants=[['rift-original','double'],['rift-single','single']];
const checkbox=document.querySelector('#rift-motion'),buttons=[...document.querySelectorAll('[data-rift-action]')],status=document.querySelector('#rift-status');
const media=matchMedia('(prefers-reduced-motion: reduce)');let requestedMotion=true;
const entries=variants.map(([id,eyeVariant])=>{const canvas=document.getElementById(id),scene=generateMonster({...answers,eyeVariant},5),view=new CreatureView(canvas,scene);return {canvas,view,visible:true};});
function synchronize(){
 checkbox.checked=requestedMotion&&!media.matches;checkbox.disabled=media.matches;
 buttons.forEach(button=>button.disabled=!checkbox.checked);
 entries.forEach(entry=>entry.view.setVisible(checkbox.checked&&entry.visible));
}
const observer=new IntersectionObserver(observed=>{for(const item of observed){const entry=entries.find(e=>e.canvas===item.target);entry.visible=item.isIntersecting;}synchronize();},{threshold:.1});
entries.forEach(entry=>observer.observe(entry.canvas));
checkbox.addEventListener('change',()=>{requestedMotion=checkbox.checked;synchronize();});media.addEventListener('change',synchronize);
buttons.forEach(button=>button.addEventListener('click',()=>{const event=button.dataset.riftAction==='jump'?0:1;entries.forEach(entry=>entry.view.play(event));status.textContent=event===0?'Rift jumps.':'Rift waves hello.';}));
synchronize();entries.forEach(entry=>entry.view.greet(350));
