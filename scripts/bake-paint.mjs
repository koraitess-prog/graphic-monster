import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {generateMonster,combinations} from '../src/dna.js';
import {amorphousScene} from '../src/evolution.js';
import {MonsterRenderer} from '../src/renderer.js';
const require=createRequire(path.join(path.resolve(process.argv[2]),'qa-loader.cjs'));
const {createCanvas,Path2D}=require('@napi-rs/canvas');globalThis.Path2D=Path2D;
const canvas=createCanvas(1,1),renderer=new MonsterRenderer(canvas,{canvasFactory:createCanvas}),styles=new Map();
for(const scene of [amorphousScene(),...combinations().map(generateMonster)]){
 for(const part of scene.shapes){if(part.opening)continue;const style={color:part.color,texture:part.texture??.7,flow:part.flow??1.35,soft:!!part.soft};styles.set(`${style.color}/${style.texture}/${style.flow}/${style.soft}`,style);}
 if(scene.eyes.length)styles.set('#f4e9ce/0.3/1.35/false',{color:'#f4e9ce',texture:.3,flow:1.35,soft:false});
}
const folder=new URL('../assets/paint/',import.meta.url);await mkdir(folder,{recursive:true});const manifest=[];
// The factory intercepts the very same canvases used by renderer.pattern().
let swatch;renderer.factory=(w,h)=>(swatch=createCanvas(w,h));
for(const [key,style]of styles){renderer.pattern(style);const file=`paint-${manifest.length}.png`;await writeFile(new URL(file,folder),swatch.toBuffer('image/png'));manifest.push({key,file});}
await writeFile(new URL('manifest.json',folder),JSON.stringify(manifest));console.log(`Baked ${manifest.length} reusable seeded paint tiles.`);
