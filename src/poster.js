import {displayFamily} from './typography.js';
import {MonsterRenderer} from './renderer.js?v=mobile2';
import {generateMonster} from './dna.js';
import {PAPER,C} from './illustrations.js';

export function wrapText(ctx,text,maxWidth){
 const lines=[];let current='';
 for(const word of text.trim().split(/\s+/u)){
   if(ctx.measureText(word).width>maxWidth){
     if(current){lines.push(current);current='';}
     for(const letter of Array.from(word)){if(ctx.measureText(current+letter).width>maxWidth&&current){lines.push(current);current='';}current+=letter;}
   }else if(current&&ctx.measureText(current+' '+word).width>maxWidth){lines.push(current);current=word;}
   else current+=(current?' ':'')+word;
 }
 if(current)lines.push(current);return lines;
}
// Crop only empty paper. All actual anatomy, including elevated eyes, is retained.
export function artBounds(scene){
 const points=[...scene.shapes,...scene.lines].flatMap(s=>s.points);
 for(const e of scene.eyes)points.push([e.x-e.r-10,e.y-e.ry-10],[e.x+e.r+10,e.y+e.ry+10]);
 const left=Math.max(0,Math.min(...points.map(p=>p[0]))-18),top=Math.max(0,Math.min(...points.map(p=>p[1]))-18);
 return {x:left,y:top,w:Math.min(600,Math.max(...points.map(p=>p[0]))+18)-left,h:Math.min(760,Math.max(680,...points.map(p=>p[1]))+18)-top};
}
export function createPoster({answers,name,story,scene},canvasFactory){
 const factory=canvasFactory??((w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;});
 scene=scene??generateMonster(answers);
 const art=factory(1800,2280);new MonsterRenderer(art,{scale:3,canvasFactory:factory}).draw(scene);
 const poster=factory(1800,2520),ctx=poster.getContext('2d');ctx.fillStyle=PAPER;ctx.fillRect(0,0,1800,2520);
 const maxWidth=1480,fontFamily=displayFamily(name);let fontSize=180,nameLines;
 do{ctx.font=`900 ${fontSize}px ${fontFamily}`;nameLines=wrapText(ctx,name,maxWidth);if(nameLines.length<=2)break;fontSize-=4;}while(fontSize>=46);
 ctx.fillStyle=C.ink;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.direction=/[\u0590-\u08ff]/u.test(name)?'rtl':'ltr';
 const nameY=225,nameBottom=nameY+(nameLines.length-1)*fontSize*1.05;
 nameLines.forEach((line,i)=>ctx.fillText(line,160,nameY+i*fontSize*1.05));
 const bounds=artBounds(scene),artY=Math.max(340,nameBottom+85),availableH=1985-artY,k=Math.min(1480/bounds.w,availableH/bounds.h),dw=bounds.w*k,dh=bounds.h*k;
 ctx.drawImage(art,bounds.x*3,bounds.y*3,bounds.w*3,bounds.h*3,(1800-dw)/2,artY+(availableH-dh)/2,dw,dh);
 ctx.direction='ltr';ctx.font='35px Georgia, serif';ctx.fillStyle='#666a68';const descriptionLines=wrapText(ctx,story.text,maxWidth),descriptionY=2115;
 descriptionLines.forEach((line,i)=>ctx.fillText(line,160,descriptionY+i*49));
 ctx.font='900 22px Georgia, serif';ctx.fillStyle=C.ink;ctx.fillText('GRAPHIC MONSTER',160,2440);
 return {canvas:poster,layout:{nameLines,descriptionLines,fontSize,fontFamily,nameBottom,descriptionBottom:descriptionY+(descriptionLines.length-1)*49,artBounds:bounds,artTop:artY,artBottom:artY+availableH}};
}
