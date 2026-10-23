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
 const seed=[...value].reduce((s,c)=>s+c.charCodeAt(0),0),random=rng(seed),palette=['#e8ddba','#d6a333','#519f7d','#ce6587','#5765c4','#f05226'];let n=0;
 const scrap=(points,color,pattern=false)=>{const id=`study-${value}-${n++}`,ps=tornContour(points,seed+n,1.1).map(p=>p.join(',')).join(' '),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),left=Math.min(...xs),top=Math.min(...ys),w=Math.max(...xs)-left,h=Math.max(...ys)-top;return `<g><defs><clipPath id="${id}"><polygon points="${ps}"/></clipPath></defs><polygon points="${ps}" fill="${color}"/><g clip-path="url(#${id})" opacity=".43" stroke="#151a1b" stroke-width=".55">${Array.from({length:65},(_,i)=>{const x=left+random()*w,y=top+random()*h;return i%4?`<path d="M${x} ${y}l${2+random()*5} ${-4-random()*22}"/>`:`<path d="M${x} ${y}l3 -1 -1 4 -3 2Z" fill="#151a1b"/>`;}).join('')}${pattern?Array.from({length:9},(_,i)=>`<path d="M0 ${i*13}h160" stroke-width="3"/>`).join(''):''}</g></g>`;};
 const cut=(family,i,x,y,w,h,color,angle=0)=>scrap(paperCutout(family,i,{x,y,width:w,height:h,angle}).points,color,value==='texture');
 let art='';
 if(value==='typography')art=cut('typography',1,42,61,29,91,palette[0])+cut('typography',2,97,40,76,67,palette[3])+cut('typography',6,104,94,28,33,palette[1]);
 if(value==='grid'||value==='order')for(let i=0;i<9;i++)art+=cut('grid',0,33+i%3*46,20+Math.floor(i/3)*40,34,28,palette[(i===4?1:0)]);
 if(value==='color')art=cut('color',0,55,45,83,72,palette[5])+cut('color',2,101,72,84,77,palette[2])+cut('color',1,58,86,67,40,palette[1]);
 if(value==='shape')art=cut('shape',1,69,59,105,104,palette[2])+cut('shape',8,121,78,33,66,palette[0]);
 if(value==='texture')for(let i=0;i<12;i++)art+=cut('grid',0,24+i%4*37,20+Math.floor(i/4)*40,25,31,palette[i%3===0?3:0]);
 if(value==='experiment')for(let i=0;i<8;i++)art+=cut('grid',i,27+random()*105,16+random()*88,28+random()*28,22+random()*29,palette[i%4],(random()-.5)*1.1);
 if(value==='clarity')art=cut('shape',8,78,59,105,104,palette[1])+cut('typography',7,134,94,8,29,palette[0]);
 if(value==='expression')art=cut('shape',0,45,45,76,67,palette[3])+cut('typography',2,94,43,72,65,palette[1])+cut('shape',8,93,88,91,53,palette[4]);
 if(value==='minimal')art=cut('shape',8,72,58,88,95,palette[0]);
 if(value==='rich')for(let i=0;i<17;i++)art+=cut(i%2?'typography':'shape',i,26+random()*110,12+random()*95,22+random()*46,20+random()*43,palette[i%6],(random()-.5)*1.3);
 if(value==='precise')for(let i=0;i<4;i++)art+=cut('grid',1,28+i*35,59,19,83-i*10,palette[i%2?0:2]);
 if(value==='playful')art=cut('shape',1,56,64,88,92,palette[3],-.4)+cut('typography',2,113,48,66,64,palette[1],.4)+cut('shape',8,120,103,33,24,palette[0]);
 return `<svg viewBox="0 0 160 120" aria-hidden="true" focusable="false">${art}</svg>`;
}
