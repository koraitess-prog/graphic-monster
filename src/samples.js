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
