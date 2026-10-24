// Bake the exact interactive title for the first HTML paint. No alternate font.
// Usage: node scripts/bake-intro.mjs <node_modules containing @napi-rs/canvas>
import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {drawIntroLettering} from '../src/intro-lettering.js';
if(!process.argv[2])throw new Error('Pass a node_modules directory containing @napi-rs/canvas.');
const require=createRequire(path.join(path.resolve(process.argv[2]),'loader.cjs'));
const {createCanvas}=require('@napi-rs/canvas');
const render=()=>{const canvas=createCanvas(1920,600),g=canvas.getContext('2d');g.scale(1.5,1.5);drawIntroLettering(g,createCanvas);return canvas.toBuffer('image/webp',88);};
const bytes=render(),again=render(),hash=data=>createHash('sha256').update(data).digest('hex');
if(hash(bytes)!==hash(again))throw new Error('Intro title is not reproducible.');
await writeFile(new URL('../assets/intro-title.webp',import.meta.url),bytes);
console.log(`Intro first paint: reproducible ${hash(bytes).slice(0,16)}, ${bytes.length} bytes`);
