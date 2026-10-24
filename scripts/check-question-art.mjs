import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {drawQuestionObject} from '../src/question-papers.js';
import {QUESTIONS} from '../src/dna.js';
const require=createRequire(path.join(path.resolve(process.argv[2]),'loader.cjs'));
const {createCanvas}=require('@napi-rs/canvas');
const hashes=new Set();
for(const q of QUESTIONS)for(const[value]of q.options){
 const render=()=>{const c=createCanvas(600,360),g=c.getContext('2d');g.scale(3,3);drawQuestionObject(g,value,createCanvas);return c;};
 const c=render(),bytes=c.toBuffer('image/png'),hash=b=>createHash('sha256').update(b).digest('hex');
 if(hash(bytes)!==hash(render().toBuffer('image/png')))throw Error(value+' not reproducible');
 if(hashes.has(hash(bytes)))throw Error(value+' duplicates another choice');hashes.add(hash(bytes));
 const data=c.getContext('2d').getImageData(0,0,600,360).data;let count=0,edge=0;
 for(let y=0;y<360;y++)for(let x=0;x<600;x++)if(data[(y*600+x)*4+3]>20){count++;if(x<3||y<3||x>596||y>356)edge++;}
 if(count<1000||edge)throw Error(value+' empty or clipped');
 console.log(value+': distinct, reproducible, within canvas');
}
