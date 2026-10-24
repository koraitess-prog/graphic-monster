// Companion optical size for the intro's Anidoodle paper lettering. The name is
// never normalized or uppercased. A text mask retains Unicode shaping and spelling;
// only the pigment inside the letterforms is constructed from printed scraps.
import {rng} from './anidoodle-kit.js';
import {tornContour} from './paper-library.js';
import {engravingTile} from './engraving.js';
const stocks=['#e8ddba','#d6a333','#519f7d','#ce6587','#5765c4'];
export const CREATURE_LETTER_FONT='900 112px Georgia, "Times New Roman", serif';
export function nameLines(text,limit=16){
 const lines=[];let line='';
 for(const word of text.split(' ')){
  if(line&&Array.from(line+' '+word).length>limit){lines.push(line);line='';}
  if(Array.from(word).length>limit){if(line){lines.push(line);line='';}const chars=Array.from(word);while(chars.length>limit)lines.push(chars.splice(0,limit).join(''));line=chars.join('');}
  else line+=(line?' ':'')+word;
 }
 if(line)lines.push(line);return lines;
}
// Read the saved artwork, never regenerate its DNA. Invisible rigging, sockets,
// and seam backing are not paper stock. Area keeps small accents subordinate.
export function creatureNamePapers(scene){
 const papers=new Map();
 for(const part of scene?.shapes??[]){
  if(part.carrier||part.opening||part.mouth||part.paperRole==='backing'||(part.alpha??1)<=0)continue;
  const points=part.points??[],area=Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2;
  for(const layer of part.styles??[{style:part,weight:1}]){
   const s=layer.style;if(!/^#[a-f\d]{6}$/i.test(s.color??''))continue;
   const rgb=s.color.slice(1).match(/../g).map(v=>parseInt(v,16));if(Math.max(...rgb)<65)continue;
   const style={color:s.color,texture:s.texture??.7,flow:s.flow??1.35,soft:!!s.soft,printRevision:s.printRevision??3,grainPhase:s.grainPhase??0,grainAngle:s.grainAngle??0,...(s.paperPattern?{paperPattern:s.paperPattern}:{})};
   const key=JSON.stringify(style),old=papers.get(key);papers.set(key,{style,area:(old?.area??0)+area*(layer.weight??1)});
  }
 }
 return [...papers.values()].sort((a,b)=>b.area-a.area);
}
export function paintCreatureName(canvas,text,{align='left',texturePhase=0,scene}={}){
 const factory=(w,h)=>{const c=document.createElement('canvas');c.width=Math.ceil(w);c.height=Math.ceil(h);return c;};
 const lines=nameLines(text),font=CREATURE_LETTER_FONT,measure=canvas.getContext('2d');measure.font=font;
 const widths=lines.map(l=>measure.measureText(l).width),width=Math.ceil(Math.max(1,...widths)+20),height=lines.length*138;
 canvas.width=width;canvas.height=height;canvas.style.aspectRatio=`${width}/${height}`;
 const g=canvas.getContext('2d'),random=rng([...text].reduce((n,c)=>Math.imul(n,31)+c.codePointAt(0)|0,817)),plates=new Map();
 const materials=creatureNamePapers(scene),total=materials.reduce((sum,p)=>sum+p.area,0);
 const materialAt=t=>{let weight=t*total;return materials.find(p=>(weight-=p.area)<=0)?.style??materials[0]?.style;};
 const patterns=['newsprint','checks','stripes-wave','magazine-type','dots-large'];
 const pigment=(i,pattern)=>{const print=texturePhase?patterns[(i+texturePhase-1)%patterns.length]:pattern,material=materials.length?materialAt((i%100)/100):null,key=material?JSON.stringify(material):`${i}/${print}`;if(!plates.has(key)){const {tile,transform}=engravingTile(factory,material??{color:stocks[i%stocks.length],texture:.8,printRevision:3,grainPhase:(i+texturePhase*3)%12,grainAngle:texturePhase*13,paperPattern:print});const p=g.createPattern(tile,'repeat');p.setTransform(material?Object.fromEntries(Object.entries(transform).map(([k,v])=>[k,v*.45])):{a:.4,b:0,c:0,d:.4,e:i*13+texturePhase*31,f:i*17-texturePhase*23});plates.set(key,p);}return plates.get(key);};
 lines.forEach((line,row)=>{
  const origin=align==='center'?(width-widths[row])/2:10;
  const mask=factory(width,138),m=mask.getContext('2d');m.font=font;m.textBaseline='alphabetic';m.fillStyle='#fff';m.fillText(line,origin,111);
  const paint=factory(width,138),p=paint.getContext('2d');p.fillStyle=pigment(row);p.fillRect(0,0,width,138);
  // Unequal seams across the lettering, with whole letters between constructions.
  let x=origin;for(const char of Array.from(line)){
   m.font=font;const w=m.measureText(char).width,assembled=random()>.43,index=Math.floor(random()*(materials.length?100:5));
   p.fillStyle=pigment(index);p.fillRect(x,0,w,138);
   if(assembled){const y=37+random()*29,ps=tornContour([[x-1,y+17],[x+w+1,y],[x+w+1,128],[x-1,128]],index+row,.7);p.beginPath();ps.forEach((q,i)=>i?p.lineTo(...q):p.moveTo(...q));p.closePath();p.fillStyle=pigment(materials.length?(index+37)%100:(index+2)%5,index===2?'newsprint':undefined);p.fill();}
   x+=w;
  }
  p.globalCompositeOperation='destination-in';p.drawImage(mask,0,0);
  // Dry torn fibres nibble the ink contour without replacing the letter silhouette.
  p.globalCompositeOperation='destination-out';p.globalAlpha=.45;p.fillStyle='#000';for(let i=0;i<width*1.2;i++){const x=random()*width,y=random()*128;p.fillRect(x,y,.5+random(),1+random()*3);}
  g.drawImage(paint,0,row*138);
 });
}
export function mountCreatureName(title,options={}){
 const text=title.textContent;if(!text.trim())return;title.dataset.paperLetters='true';title.classList.add('creature-lettering');
 const accessible=document.createElement('span');accessible.className='sr-only';accessible.textContent=text;
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');title.replaceChildren(accessible,canvas);paintCreatureName(canvas,text,options);
}
