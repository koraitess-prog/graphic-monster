import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
import {combinations,generateMonster,validateScene,describeMonster} from '../src/dna.js';
import {MonsterRenderer,interpolateScene} from '../src/renderer.js';
import {PAPER,C} from '../src/illustrations.js';
if(!process.argv[2])throw new Error('Pass a node_modules directory containing @napi-rs/canvas');
const require=createRequire(path.join(path.resolve(process.argv[2]),'qa-loader.cjs'));
const {createCanvas,Path2D,loadImage}=require('@napi-rs/canvas');globalThis.Path2D=Path2D;
const factory=(w,h)=>createCanvas(w,h),canvas=createCanvas(600,760),renderer=new MonsterRenderer(canvas,{scale:1,canvasFactory:factory});
const out=new URL('../qa/system/',import.meta.url);await mkdir(out,{recursive:true});
const hashes=new Set(),report=[];const all=combinations();
const hash=b=>createHash('sha256').update(b).digest('hex');
for(let family=0;family<5;family++){
 const sheet=createCanvas(1440,1920),ctx=sheet.getContext('2d');ctx.fillStyle=PAPER;ctx.fillRect(0,0,1440,1920);
 for(let i=0;i<16;i++){
  const answers=all[family*16+i],scene=generateMonster(answers);assert.deepEqual(validateScene(scene),[],scene.code);renderer.draw(scene);const bytes=canvas.toBuffer('image/png'),a=hash(bytes);renderer.draw(generateMonster(structuredClone(answers)));assert.equal(a,hash(canvas.toBuffer('image/png')),scene.code);assert.ok(!hashes.has(a),'duplicate image');hashes.add(a);
  const x=i%4*360,y=Math.floor(i/4)*480;ctx.drawImage(await loadImage(bytes),x,y,360,456);ctx.font='12px Arial';ctx.fillStyle=C.ink;ctx.fillText(`${scene.code} / ${describeMonster(answers).name}`,x+24,y+463);
  await writeFile(new URL(`${scene.code}.png`,out),bytes);report.push({code:scene.code,valid:true,sha256:a,eyes:scene.eyes.length,parts:scene.shapes.length});
 }
 await writeFile(new URL(`family-${family}.png`,out),sheet.toBuffer('image/png'));
}
// Render actual intermediate frames too; this catches renderer-only interpolation errors.
const strip=createCanvas(1800,760),sc=strip.getContext('2d'),from=generateMonster(all[0]),to=generateMonster(all[79]);
for(let i=0;i<6;i++){renderer.draw(interpolateScene(from,to,i/5));sc.drawImage(await loadImage(canvas.toBuffer('image/png')),i*300,0,300,380);}
await writeFile(new URL('morph-strip.png',out),strip.toBuffer('image/png'));
await writeFile(new URL('report.json',out),JSON.stringify({tested:80,unique:hashes.size,deterministic:true,results:report},null,2));
console.log(`80/80 valid, ${hashes.size} distinct images, every render reproduced byte-for-byte. 5 contact sheets and a morph strip saved.`);
