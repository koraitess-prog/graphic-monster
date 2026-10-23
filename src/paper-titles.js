import {mountIntroLettering} from './intro-lettering.js';
const stocks=['#e6ddc5','#c9bb9b','#d6a333','#dcd3bc','#b7a4b8','#e6ddc5'];
export function decoratePaperTitles(root=document){
 for(const title of root.querySelectorAll('h1:not([data-paper-letters])')){
  if(title.querySelector('canvas'))continue;
  if(title.classList.contains('intro-title')){mountIntroLettering(title);
   const support=document.createElement('p');support.className='intro-caption';support.textContent='Your design, alive.';title.after(support);continue;}
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

   }
   title.append(group,document.createTextNode(' '));
  }
  if(badge)title.append(badge);
 }
}
