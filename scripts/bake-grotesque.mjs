import {createRequire} from 'node:module';
import path from 'node:path';
import {readFile,writeFile} from 'node:fs/promises';
import {combinations,generateMonster} from '../src/dna.js';
import {MonsterRenderer} from '../src/renderer.js';
const require=createRequire(path.join(process.argv[2],'loader.cjs'));
const {createCanvas,Path2D}=require('@napi-rs/canvas');globalThis.Path2D=Path2D;
const folder=new URL('../assets/paint/',import.meta.url),manifest=JSON.parse(await readFile(new URL('manifest.json',folder),'utf8')),existing=new Set(manifest.map(p=>p.key)),styles=new Map();
for(const answers of combinations())for(const p of generateMonster(answers).shapes){if(p.opening)continue;const s={color:p.color,texture:p.texture??.7,flow:p.flow??1.35,soft:!!p.soft},key=`${s.color}/${s.texture}/${s.flow}/${s.soft}`;if(!existing.has(key))styles.set(key,s);}
let swatch;const renderer=new MonsterRenderer(createCanvas(1,1),{canvasFactory:(w,h)=>(swatch=createCanvas(w,h))});
for(const [key,s] of styles){renderer.pattern(s);const file=`grotesque-${manifest.filter(p=>p.file.startsWith('grotesque')).length}.png`;await writeFile(new URL(file,folder),swatch.toBuffer('image/png'));manifest.push({key,file});}
await writeFile(new URL('manifest.json',folder),JSON.stringify(manifest));console.log(`Added ${styles.size} swatches; retained ${existing.size} legacy swatches.`);
