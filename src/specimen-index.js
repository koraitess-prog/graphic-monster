import {MonsterRenderer} from './renderer.js?v=laboratory1';
import {loadPaintTiles} from './paint-cache.js?v=laboratory1';

// Quiet navigation specimens: no greetings, one focused moving organism only.
export class SpecimenIndex{
 constructor(root,records){
  this.items=new Map();this.observer=new IntersectionObserver(entries=>{
   for(const entry of entries){const item=this.items.get(entry.target);if(!item)continue;item.visible=entry.isIntersecting;
    if(item.visible){item.renderer??=new MonsterRenderer(item.canvas,{scale:.35,background:'#202426'});item.renderer.resize(.35);item.renderer.draw(item.record.scene);void loadPaintTiles(item.record.scene).then(()=>{if(item.visible)item.renderer?.draw(item.record.scene);});}
    else item.renderer?.resize(.002);
   }
  },{root,rootMargin:'0px 100px',threshold:.01});
  root.querySelectorAll('[data-specimen]').forEach((button,i)=>{this.items.set(button,{record:records[i],canvas:button.querySelector('canvas'),visible:false});this.observer.observe(button);});
 }
 destroy(){this.observer.disconnect();for(const item of this.items.values()){item.visible=false;item.canvas.width=1;item.canvas.height=1;item.renderer?.patterns.clear();}this.items.clear();}
}
