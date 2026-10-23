const stocks=['#e6ddc5','#c9bb9b','#d6a333','#dcd3bc','#b7a4b8','#e6ddc5'];
function constructedLetter(letter,index){
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 100 115');svg.setAttribute('aria-hidden','true');
 const id='paper-glyph-'+index,colors=['#252c29','#bd5737','#ac913f','#3e7869'];
 const safe=letter.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 svg.innerHTML=`<defs><clipPath id="${id}"><text x="50" y="100" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="110">${safe}</text></clipPath></defs><g clip-path="url(#${id})"><path d="M0 0H100V44L76 39 49 46 23 40 0 47Z" fill="${colors[index%4]}"/><path d="M0 46 24 41 49 48 77 41 100 46V80L64 75 30 82 0 76Z" fill="${colors[(index+1)%4]}"/><path d="M0 79 30 85 65 78 100 83V115H0Z" fill="${colors[(index+2)%4]}"/><path d="M8 20 38 8M13 27 57 10M45 72 91 52M8 101 57 80M34 109 86 88" stroke="#eee3c7" stroke-width="1.4" opacity=".32"/></g>`;
 return svg;
}
export function decoratePaperTitles(root=document){
 for(const title of root.querySelectorAll('h1:not([data-paper-letters])')){
  if(title.querySelector('canvas'))continue;
  const count=title.querySelector('.collection-count'),badge=count?.cloneNode(true);
  const clone=title.cloneNode(true);clone.querySelector('.collection-count')?.remove();clone.querySelectorAll('br').forEach(br=>br.replaceWith(' '));
  const text=clone.textContent.replace(/\s+/g,' ').trim();if(!text)continue;
  title.dataset.paperLetters='true';title.classList.add('cut-title');title.setAttribute('aria-label',text);title.replaceChildren();
  let index=0;
  for(const word of text.split(' ')){
   const group=document.createElement('span');group.className='cut-word';group.setAttribute('aria-hidden','true');
   const letters=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(word)].map(s=>s.segment):Array.from(word);
   for(const letter of letters){
    const span=document.createElement('span');span.className='cut-letter';span.textContent=letter;
    span.style.setProperty('--cut-stock',stocks[index%stocks.length]);span.style.setProperty('--cut-angle',`${Math.sin(index*7.3)*3.2}deg`);span.style.setProperty('--cut-rise',`${Math.cos(index*3.7)*.025}em`);span.dataset.cut=String(index%4);group.append(span);index++;
    if(title.classList.contains('intro-title')){
     span.dataset.treatment=['constructed','whole','tile'][index%3];
     if(span.dataset.treatment==='constructed')span.replaceChildren(constructedLetter(letter,index));
    }
   }
   title.append(group,document.createTextNode(' '));
  }
  if(badge)title.append(badge);
 }
}
