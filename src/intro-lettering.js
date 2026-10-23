// Illustrated lettering: Anidoodle's seeded contour vocabulary, printed with
// the same pigment plates and torn edges as the paper creatures. No font masks.
import {rng, sample, limb} from './anidoodle-kit.js';
import {tornContour} from './paper-library.js';
import {engravingTile} from './engraving.js';

const P=s=>s.split(' ').map(p=>p.split(',').map(Number));
const ring=(rx,ry,cx=40,cy=50)=>sample(Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return[cx+Math.cos(a)*rx,cy+Math.sin(a)*ry];}),true,3);
const curve=limb([[68,17],[39,10],[14,28],[13,68],[36,89],[67,83]],[10,13,12,11]);
const glyphs={
 G:{w:80,contours:[P('76,15 57,0 23,2 3,24 0,73 20,98 57,100 78,82 78,49 42,49 42,67 58,67 57,80 32,81 22,67 23,31 34,20 56,20 65,29')]},
 R:{w:80,contours:[P('2,100 2,0 52,1 75,17 77,42 59,60 80,100 54,100 35,65 23,65 24,100'),P('24,19 24,46 46,45 55,37 54,26 45,19')]},
 A:{w:84,contours:[P('0,100 27,0 53,0 84,100 60,100 53,76 27,77 21,100'),P('32,59 49,59 40,24')]},
 P:{w:77,contours:[P('2,100 2,0 49,0 73,18 77,42 62,64 24,67 24,100'),P('24,20 24,48 45,47 54,38 52,26 44,20')]},
 H:{w:78,contours:[P('1,0 25,0 24,38 54,39 55,0 77,0 77,100 53,100 54,61 24,60 25,100 1,100')]},
 I:{w:43,contours:[P('0,0 43,0 43,13 33,17 32,83 43,87 43,100 0,100 0,87 10,83 11,17 0,13')]},
 C:{w:78,contours:[curve]},
 M:{w:100,contours:[P('0,100 3,0 26,0 50,43 74,0 97,0 100,100 76,100 74,37 51,75 47,75 26,38 24,100')]},
 O:{w:82,contours:[ring(40,50,41,50),ring(17,29,41,50)]},
 N:{w:81,contours:[P('1,100 1,0 23,0 58,61 57,0 80,0 80,100 58,100 23,40 24,100')]},
 S:{w:78,contours:[P('76,10 55,0 22,0 3,18 0,42 16,58 48,65 56,73 52,82 28,82 8,71 0,91 23,100 57,99 76,81 77,59 61,43 30,36 23,28 29,18 51,18 67,27')]},
 T:{w:80,contours:[P('0,0 80,0 80,24 52,21 52,100 28,100 28,21 0,24')]},
 E:{w:73,contours:[P('1,0 73,0 72,20 25,20 25,39 64,39 64,59 24,59 24,80 73,80 73,100 1,100')]}
};
const colors=['#519f7d','#e8ddba','#f05226','#d6a333','#5765c4','#e8ddba','#ce6587'];
function contour(g,points,seed,rough=.65){const ps=tornContour(points,seed,rough);g.moveTo(...ps[0]);for(const p of ps.slice(1))g.lineTo(...p);g.closePath();}

export function drawIntroLettering(g,factory){
 const random=rng(731914),plates=new Map();
 const pigment=(color,phase,pattern)=>{const key=[color,phase,pattern].join('/');if(!plates.has(key)){const {tile}=engravingTile(factory,{color,texture:.82,printRevision:3,grainPhase:phase,paperPattern:pattern});const p=g.createPattern(tile,'repeat');p.setTransform({a:.30,b:0,c:0,d:.30,e:phase*19,f:phase*31});plates.set(key,p);}return plates.get(key);};
 ['GRAPHIC','MONSTER'].forEach((word,row)=>{
  const scale=row?1.70:1.62,gap=11,total=[...word].reduce((n,c)=>n+glyphs[c].w,0)+gap*6;
  let x=(1280-total*scale)/2;
  [...word].forEach((char,i)=>{
   const shape=glyphs[char],seed=100+row*70+i,base=colors[(i+row*3)%7],assembled=[0,2,4,6].includes(i);
   g.save();g.translate(x,row?211:13);g.scale(scale,scale);
   g.beginPath();shape.contours.forEach((p,j)=>contour(g,p,seed+j));
   // A sliver of exposed fibre is visible around each cut, never a card.
   g.strokeStyle='#b9af92';g.lineWidth=.48;g.stroke();g.clip('evenodd');
   g.fillStyle=pigment(base,row*7+i,undefined);g.fillRect(-10,-10,125,125);
   if(assembled){
    const seam=34+random()*18;
    g.beginPath();contour(g,[[-8,seam+18],[shape.w+8,seam-10],[shape.w+8,105],[-8,105]],seed+20,.85);
    g.fillStyle=pigment(colors[(i+row*3+2)%7],i+2,i===4?'newsprint':undefined);g.fill();
    // A second folded triangular scrap makes the construction legible.
    g.beginPath();contour(g,[[shape.w*.42,-5],[shape.w+6,8],[shape.w*.76,43]],seed+40,.7);
    g.fillStyle=pigment('#151a1b',i+4,undefined);g.fill();
    g.beginPath();g.moveTo(-4,seam+19);g.lineTo(shape.w+5,seam-9);g.strokeStyle='#e8ddba';g.globalAlpha=.48;g.lineWidth=.65;g.stroke();g.globalAlpha=1;
   }
   // Sparse dry fibres: stable irregular marks, not animated surface noise.
   for(let k=0;k<35;k++){const px=random()*shape.w,py=random()*100;g.strokeStyle=k%4?'#151a1b':'#e8ddba';g.globalAlpha=.20+random()*.2;g.lineWidth=.18+random()*.45;g.beginPath();g.moveTo(px,py);g.lineTo(px+1+random()*3,py-2-random()*12);g.stroke();}
   g.restore();x+=(shape.w+gap)*scale;
  });
 });
}

let titleObserver;
export function mountIntroLettering(title){
 titleObserver?.disconnect();
 title.dataset.paperLetters='true';title.classList.add('illustrated-title');title.setAttribute('aria-label','GRAPHIC MONSTER');
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');title.replaceChildren(canvas);
 const factory=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const paint=()=>{const width=Math.round(title.clientWidth),dpr=Math.min(window.devicePixelRatio||1,2);if(!width)return;canvas.width=Math.round(width*dpr);canvas.height=Math.round(width*400/1280*dpr);const g=canvas.getContext('2d');g.scale(canvas.width/1280,canvas.height/400);drawIntroLettering(g,factory);};
 paint();titleObserver=new ResizeObserver(()=>{if(!title.isConnected){titleObserver.disconnect();return;}paint();});titleObserver.observe(title);
}
