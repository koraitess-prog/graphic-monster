import {createRequire} from 'node:module';import path from 'node:path';import {writeFile} from 'node:fs/promises';import {generateMonster} from '../src/dna.js';import {MonsterRenderer} from '../src/renderer.js';
const require=createRequire(path.join(process.argv[2],'loader.cjs'));const {createCanvas,Path2D}=require('@napi-rs/canvas');globalThis.Path2D=Path2D;
const out=createCanvas(3000,900),ctx=out.getContext('2d');ctx.fillStyle='#202426';ctx.fillRect(0,0,3000,900);
const rows=[['typography','experiment','clarity','precise'],['grid','order','expression','precise'],['color','experiment','expression','precise'],['shape','experiment','clarity','playful'],['texture','order','expression','playful']];
rows.forEach(([principle,organization,gaze,attitude],i)=>{const scene=generateMonster({principle,organization,gaze,density:'rich',attitude},4),art=createCanvas(1,1);new MonsterRenderer(art,{scale:2,canvasFactory:createCanvas,background:'#202426'}).draw(scene);ctx.drawImage(art,i*600,35,600,760);});await writeFile('qa/collage/concepts.png',out.toBuffer('image/png'));

const {createPoster}=await import('../src/poster.js');const {generateStory}=await import('../src/story.js');
const a={principle:'typography',organization:'experiment',gaze:'clarity',density:'rich',attitude:'precise'},scene=generateMonster(a,4),story={text:generateStory(a,23,4)};
const poster=createPoster({answers:a,name:'Rift',story,scene},createCanvas);if(poster.canvas.width!==1800||poster.canvas.height!==2520||poster.layout.descriptionBottom>2400)throw new Error('Poster layout failed');await writeFile('qa/collage/poster.png',poster.canvas.toBuffer('image/png'));console.log('Cut-paper concepts and 1800x2520 export verified.');
