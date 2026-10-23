import {createRequire} from 'node:module';import path from 'node:path';import {writeFile} from 'node:fs/promises';import {generateMonster} from '../src/dna.js';import {MonsterRenderer} from '../src/renderer.js';
const require=createRequire(path.join(process.argv[2],'loader.cjs'));const {createCanvas,Path2D}=require('@napi-rs/canvas');globalThis.Path2D=Path2D;
const rows=[['Pleat','color','order','expression','precise'],['Stilt','shape','order','clarity','precise'],['Tangle','texture','experiment','clarity','playful']];
const out=createCanvas(1800,900),ctx=out.getContext('2d');ctx.fillStyle='#202426';ctx.fillRect(0,0,1800,900);
const art=createCanvas(1,1),renderer=new MonsterRenderer(art,{scale:2,canvasFactory:createCanvas,background:'#202426'});
rows.forEach(([name,principle,organization,gaze,attitude],i)=>{renderer.draw(generateMonster({principle,organization,gaze,density:'rich',attitude},5));ctx.drawImage(art,i*600,20,600,760);ctx.fillStyle='#e8ddba';ctx.font='18px Georgia';ctx.fillText(name,i*600+35,830);});await writeFile('qa/collage/additional-three.png',out.toBuffer('image/png'));

const {createPoster}=await import('../src/poster.js');const {generateStory}=await import('../src/story.js');
for(const [name,principle,organization,gaze,attitude]of rows){const answers={principle,organization,gaze,density:'rich',attitude},scene=generateMonster(answers,5),story={text:generateStory(answers,47,5)},poster=createPoster({name,answers,scene,story},createCanvas);if(poster.layout.descriptionBottom>2400||poster.canvas.width!==1800||poster.canvas.height!==2520)throw new Error('Export layout failed: '+name);await writeFile('qa/collage/'+name.toLowerCase()+'-poster.png',poster.canvas.toBuffer('image/png'));}
console.log('Three additional bodies and their 1800x2520 exports verified.');
