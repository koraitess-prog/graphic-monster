import {engravingTile} from './engraving.js';
import {introScrapPoints} from './intro-scraps.js';

// Material studies, not decorative icons. Each pair uses the same stock;
// only the decision being asked changes its composition.
const cache=new Map(),cream='#e8ddba',ochre='#d6a333',ink='#151a1b';
const factory=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
export function paintQuestionPaper(canvas,value){
 canvas.width=400;canvas.height=240;const target=canvas.getContext('2d');
 if(cache.has(value)){target.drawImage(cache.get(value),0,0);return;}
 const plate=factory(400,240),g=plate.getContext('2d');g.scale(2,2);
 const stock=(kind,x,y,w,h,color=cream,pattern,angle=0)=>{
  g.save();g.translate(x,y);g.rotate(angle);const points=introScrapPoints(kind,w,h),{tile,transform}=engravingTile(factory,{color,texture:.22,printRevision:3,grainPhase:1,grainAngle:-7,paperPattern:pattern});
  const fill=g.createPattern(tile,'repeat');fill.setTransform(transform);g.fillStyle=fill;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0]-w/2,p[1]-h/2):g.moveTo(p[0]-w/2,p[1]-h/2));g.closePath();g.fill();g.restore();
 };
 if(value==='typography'){stock(0,100,60,125,105,cream,'newsprint');g.fillStyle=ink;g.font='900 73px Georgia';g.textAlign='center';g.fillText('Aa',100,84);}
 if(['grid','order','experiment'].includes(value)){
  const loose=value==='experiment';for(let i=0;i<9;i++)stock(5,66+i%3*34+(loose?Math.sin(i*9)*9:0),27+Math.floor(i/3)*33+(loose?Math.cos(i*7)*7:0),36,35,i===4?ochre:cream,undefined,loose?Math.sin(i*3)*.22:0);
 }
 if(value==='color'){stock(0,75,51,89,83,'#f05226');stock(2,124,59,90,96,'#519f7d');stock(1,92,86,96,63,ochre);}
 if(value==='shape')stock(4,100,60,147,111,cream);
 if(value==='texture')stock(0,100,60,143,110,cream,'stripes-wave');
 if(value==='clarity'||value==='expression'){
  const sizes=value==='clarity'?[91,30,30]:[59,59,59];for(let i=0;i<3;i++)stock(2,[76,138,135][i],[61,33,88][i],sizes[i],sizes[i],i?cream:ochre);
 }
 if(value==='minimal'||value==='rich'){
  stock(0,100,60,145,111,cream);g.fillStyle=ink;for(let i=0;i<(value==='rich'?18:3);i++){const x=54+(i%6)*18,y=35+Math.floor(i/6)*23;g.fillRect(x,y,4,16);}
 }
 if(value==='precise'||value==='playful')for(let i=0;i<3;i++)stock(value==='precise'?6:3,61+i*39,60,35,112,i===1?ochre:cream,undefined,value==='playful'?Math.sin(i*5)*.18:0);
 cache.set(value,plate);target.drawImage(plate,0,0);
}
export function mountQuestionPapers(root){for(const c of root.querySelectorAll('canvas[data-paper-choice]'))paintQuestionPaper(c,c.dataset.paperChoice);}
