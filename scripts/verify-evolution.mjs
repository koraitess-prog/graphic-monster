import {createRequire} from 'node:module';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {generateMonster,decodeDNA,QUESTIONS} from '../src/dna.js';
import {evolutionScene,amorphousScene} from '../src/evolution.js';
import {idlePose} from '../src/motion.js';
import {MonsterRenderer,interpolateScene} from '../src/renderer.js';
import {PAPER,C} from '../src/illustrations.js';
const require=createRequire(path.join(path.resolve(process.argv[2]),'qa-loader.cjs'));
const {createCanvas,Path2D,loadImage}=require('@napi-rs/canvas');globalThis.Path2D=Path2D;
const canvas=createCanvas(600,760),renderer=new MonsterRenderer(canvas,{scale:1,canvasFactory:createCanvas});
const out=new URL('../qa/evolution/',import.meta.url);await mkdir(out,{recursive:true});
const composite=createCanvas(1800,2500),cc=composite.getContext('2d');cc.fillStyle=PAPER;cc.fillRect(0,0,1800,2500);
async function sheet(name,scenes,labels,width=360){
 const result=createCanvas(width*scenes.length,500),ctx=result.getContext('2d');ctx.fillStyle=PAPER;ctx.fillRect(0,0,result.width,500);
 for(let i=0;i<scenes.length;i++){renderer.draw(scenes[i]);ctx.drawImage(await loadImage(canvas.toBuffer('image/png')),i*width,0,width,width*760/600);ctx.fillStyle=C.ink;ctx.font='14px Georgia';ctx.fillText(labels[i],i*width+24,478);}
 const bytes=result.toBuffer('image/png');await writeFile(new URL(name+'.png',out),bytes);return loadImage(bytes);
}
const report=[];
for(let i=0;i<5;i++){
 const q=QUESTIONS[i],base=decodeDNA(i===2?'31111':i===3?'21111':'01111');
 const scenes=q.options.map(o=>generateMonster({...base,[q.key]:o[0]}));
 const pic=await sheet(`question-${i+1}`,scenes,q.options.map(o=>o[1]));cc.drawImage(pic,0,i*500);
 report.push({question:q.key,heldConstant:Object.fromEntries(Object.entries(base).filter(([k])=>k!==q.key)),compared:scenes.map(s=>s.code)});
}
await writeFile(new URL('answer-comparisons.png',out),composite.toBuffer('image/png'));
const a=decodeDNA('31011'),stages=[amorphousScene()];let partial={};
for(const q of QUESTIONS){partial[q.key]=a[q.key];stages.push(evolutionScene(partial));}
await sheet('six-stages',stages,['Unformed','Body','Structure','Eyes','Surface','Personality'],300);
for(let i=1;i<6;i++)await sheet(`transition-${i}`,[0,.2,.4,.6,.8,1].map(t=>interpolateScene(stages[i-1],stages[i],t)),[0,.2,.4,.6,.8,1].map(t=>`${Math.round(t*100)}%`),300);
await sheet('stalk-motion',[0,.2,.4,.6,.8,1].map(t=>idlePose(stages[5],t)),['Rest','Flex','Look / blink','Settle','Return','Rest'],300);
for(let i=0;i<5;i++){const s=generateMonster(decodeDNA(`${i}1111`));await sheet(`idle-${s.family}`,[0,.2,.4,.6,.8,1].map(t=>idlePose(s,t)),['Rest','Anticipation','Gesture','Release','Settle','Rest'],300);}
await writeFile(new URL('comparisons.json',out),JSON.stringify(report,null,2));
console.log('Rendered five controlled answer comparisons, all six stages, five six-frame morph strips, stalk range and five idle families.');
