// Optional local QA/export utility. The website itself has zero dependencies.
// Pass a node_modules directory containing @napi-rs/canvas as the first argument.
import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {specimens,drawMonster,PAPER,C} from '../src/illustrations.js';
if(!process.argv[2])throw new Error('Pass the local node_modules directory for the optional canvas renderer.');
const require=createRequire(path.join(path.resolve(process.argv[2]),'qa-loader.cjs'));
const {createCanvas,Path2D}=require('@napi-rs/canvas');
globalThis.Path2D=Path2D;
const out=new URL('../qa/',import.meta.url);
await mkdir(out,{recursive:true});
const sheet=createCanvas(1800,1130),ctx=sheet.getContext('2d');
ctx.fillStyle=PAPER;ctx.fillRect(0,0,1800,1130);
ctx.fillStyle=C.ink;ctx.font='15px Arial';ctx.fillText('DESIGN MONSTERS / ILLUSTRATION STUDY 02',65,55);
ctx.font='57px Georgia';ctx.fillText('Three personalities. The same hand.',65,130);
for(const [i,s]of specimens.entries()){
 const canvas=createCanvas(1200,1520);drawMonster(canvas,s,{scale:2});
 const bytes=canvas.toBuffer('image/png');
 const repeat=createCanvas(1200,1520);drawMonster(repeat,structuredClone(s),{scale:2});
 const hash=b=>createHash('sha256').update(b).digest('hex');
 if(hash(bytes)!==hash(repeat.toBuffer('image/png')))throw new Error(`Non-deterministic render: ${s.name}`);
 await writeFile(new URL(`study-0${i+1}.png`,out),bytes);
 const x=35+i*585;
 ctx.drawImage(canvas,x,165,560,709.33);
 ctx.strokeStyle='#dcd9ce';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+30,902);ctx.lineTo(x+535,902);ctx.stroke();
 ctx.fillStyle=C.ink;ctx.font='39px Georgia';ctx.fillText(s.name,x+30,956);
 ctx.font='16px Arial';ctx.fillStyle='#b56852';ctx.fillText(s.subtitle,x+30,988);
 ctx.fillStyle='#7b7c78';ctx.font='12px Arial';ctx.fillText(`${s.principles.texture.toUpperCase()}  /  SEED ${s.seed}`,x+30,1020);
 console.log(`${s.name}: reproducible ${hash(bytes).slice(0,16)} (${canvas.width}×${canvas.height})`);
}
ctx.fillStyle='#7b7c78';ctx.font='12px Arial';ctx.fillText('TYPOGRAPHY / GRID / COLOR / SHAPE / TEXTURE',65,1090);
await writeFile(new URL('illustration-studies.png',out),sheet.toBuffer('image/png'));
