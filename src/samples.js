import {rng} from './anidoodle-kit.js';
import {tornContour,paperCutout} from './paper-library.js';
// One optical size and a shared palette for every abstract answer symbol.
const ink='currentColor',coral='#cf7866',teal='#658d87',ochre='#c7a14e';
const rect=(x,y,w,h,fill=ink)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const circle=(x,y,r,fill=ink)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const path=(d,fill=ink)=>`<path d="${d}" fill="${fill}"/>`;
const stroke=(d,w=3)=>`<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="square" stroke-linejoin="round"/>`;
const modules=(positions)=>positions.map(([x,y],i)=>rect(x,y,16,16,i===3?coral:ink)).join('');
export function visualSample(value){
 let art='';
 switch(value){
 case 'typography':art=path('M10 48h7L30 13h5l14 35h5v4H33v-4h6l-3-9H23l-3 9h6v4H10Zm15-14h9l-5-13Z');break;
 case 'grid':art=modules([[12,12],[36,12],[12,36],[36,36]]);break;
 case 'color':art=circle(25,26,16,ochre)+circle(40,26,16,coral)+circle(32,40,16,teal);break;
 case 'shape':art=path('M19 13C29 5 43 10 46 21C49 30 58 32 53 43C49 55 35 57 25 51C16 46 7 46 9 34C11 26 10 20 19 13Z',teal);break;
 case 'texture':art=`<defs><clipPath id="symbol-texture"><rect x="12" y="12" width="40" height="40"/></clipPath></defs><g clip-path="url(#symbol-texture)">${[-24,-12,0,12,24,36,48].map(x=>stroke(`M${x} 56l48-48`,3)).join('')}</g>`;break;
 case 'order':art=modules([[12,12],[36,12],[12,36],[36,36]]);break;
 case 'experiment':art=modules([[10,14],[35,9],[15,39],[40,34]]);break;
 case 'clarity':art=circle(32,32,20)+circle(32,32,7,'#f7f4ec');break;
 case 'expression':art=circle(22,24,12)+circle(45,22,9,coral)+circle(36,45,13);break;
 case 'minimal':art=rect(12,22,40,4)+rect(12,38,25,4);break;
 case 'rich':art=[14,22,30,38,46].map((y,i)=>rect(12,y,i%2?29:40,3,i===2?coral:ink)).join('');break;
 case 'precise':art=stroke('M12 49L32 15l20 34',4);break;
 case 'playful':art=stroke('M12 44C7 17 32 11 32 31S57 50 52 18',4);break;
 }
 return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${art}</svg>`;
}

// Large comparison studies, separate from the compact metadata symbols.
export function visualChoice(value){
 const pair={experiment:'order',expression:'clarity',rich:'minimal',playful:'precise'},material=pair[value]??value;
 const seed=[...material].reduce((s,c)=>s+c.charCodeAt(0),0),random=rng(seed),palette=['#e8ddba','#d6a333','#519f7d','#ce6587','#5765c4','#f05226'];let n=0;
 const scrap=(points,color,pattern=false)=>{const id=`study-${value}-${n++}`,ps=tornContour(points,seed+n,1.1).map(p=>p.join(',')).join(' '),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),left=Math.min(...xs),top=Math.min(...ys),w=Math.max(...xs)-left,h=Math.max(...ys)-top;return `<g><defs><clipPath id="${id}"><polygon points="${ps}"/></clipPath></defs><polygon points="${ps}" fill="${color}"/><g clip-path="url(#${id})" opacity=".43" stroke="#151a1b" stroke-width=".55">${Array.from({length:65},(_,i)=>{const x=left+random()*w,y=top+random()*h;return i%4?`<path d="M${x} ${y}l${2+random()*5} ${-4-random()*22}"/>`:`<path d="M${x} ${y}l3 -1 -1 4 -3 2Z" fill="#151a1b"/>`;}).join('')}${pattern?Array.from({length:9},(_,i)=>`<path d="M0 ${i*13}h160" stroke-width="3"/>`).join(''):''}</g></g>`;};
 const cut=(family,i,x,y,w,h,color,angle=0)=>scrap(paperCutout(family,i,{x,y,width:w,height:h,angle}).points,color,value==='texture');
 let art='';
 if(value==='typography')art=cut('typography',1,42,61,29,91,palette[0])+cut('typography',2,97,40,76,67,palette[3])+cut('typography',6,104,94,28,33,palette[1]);
 if(value==='grid'||value==='order'||value==='experiment')for(let i=0;i<9;i++){
  const x=33+i%3*46,y=20+Math.floor(i/3)*40;
  const fragment=cut('grid',0,x,y,34,28,palette[i===4?1:0]);
  art+=value==='experiment'?`<g transform="translate(${[5,-8,4,-7,6,0,7,-5,-6][i]} ${[9,0,-3,2,5,-2,-2,3,-4][i]}) rotate(${[-17,11,21,7,-23,-9,18,4,-15][i]} ${x} ${y})">${fragment}</g>`:fragment;
 }
 if(value==='color')art=cut('color',0,55,45,83,72,palette[5])+cut('color',2,101,72,84,77,palette[2])+cut('color',1,58,86,67,40,palette[1]);
 if(value==='shape')art=cut('shape',1,69,59,105,104,palette[2])+cut('shape',8,121,78,33,66,palette[0]);
 if(value==='texture')art=cut('grid',0,80,60,111,92,palette[0]);
 if(value==='clarity'||value==='expression'){
  const sizes=value==='clarity'?[76,27,27]:[51,51,51];
  for(let i=0;i<3;i++)art+=cut('shape',8,[48,111,113][i],[55,33,87][i],sizes[i],sizes[i],palette[i===0?1:0]);
 }
 if(value==='minimal'||value==='rich'){
  const positions=value==='minimal'?[[80,60]]:Array.from({length:15},(_,i)=>[23+i%5*29,23+Math.floor(i/5)*37]);
  for(const [x,y] of positions)art+=cut('shape',8,x,y,21,29,palette[0]);
 }
 if(value==='precise'||value==='playful')for(let i=0;i<3;i++)art+=`<g class="study-gesture study-${value}" style="--piece:${i}">${cut('grid',3,38+i*42,60,29,62,palette[i===1?1:0])}</g>`;
 return `<svg viewBox="0 0 160 120" aria-hidden="true" focusable="false">${art}</svg>`;
}
