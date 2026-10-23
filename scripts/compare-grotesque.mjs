import {createRequire} from 'node:module';
import path from 'node:path';
import {writeFile,mkdir} from 'node:fs/promises';
import {generateMonster} from '../src/dna.js';
import {MonsterRenderer} from '../src/renderer.js';
const require=createRequire(path.join(process.argv[2],'loader.cjs'));
const {createCanvas,Path2D}=require('@napi-rs/canvas');globalThis.Path2D=Path2D;
const out=createCanvas(1500,850),ctx=out.getContext('2d');ctx.fillStyle='#202426';ctx.fillRect(0,0,1500,850);ctx.fillStyle='#e2ddcb';ctx.font='16px Georgia';
for(const [i,principle]of ['typography','grid','color','shape','texture'].entries())for(const version of [2,3]){
 const a={principle,organization:i%2?'order':'experiment',gaze:i===3?'clarity':'expression',density:'rich',attitude:'playful'},scene=generateMonster(a,version),canvas=createCanvas(1,1);new MonsterRenderer(canvas,{scale:1,canvasFactory:createCanvas,background:"#202426"}).draw(scene);
 const y=version===3?20:440;ctx.drawImage(canvas,i*300,y,300,380);ctx.fillStyle='#e2ddcb';ctx.fillText(`${principle} / v${version}`,i*300+24,y+396);
}
await mkdir('qa/grotesque',{recursive:true});await writeFile('qa/grotesque/comparison.png',out.toBuffer('image/png'));
