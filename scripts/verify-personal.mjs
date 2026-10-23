import {createRequire} from 'node:module';
import path from 'node:path';
import {existsSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createPoster,wrapText} from '../src/poster.js';
import {decodeDNA} from '../src/dna.js';
import {generateStory} from '../src/story.js';
const require=createRequire(path.join(path.resolve(process.argv[2]),'qa-loader.cjs'));
const {createCanvas,Path2D,GlobalFonts}=require('@napi-rs/canvas');globalThis.Path2D=Path2D;
for(const file of ['georgia.ttf','georgiab.ttf','georgiai.ttf','times.ttf','timesbd.ttf','arial.ttf','arialbd.ttf','msyh.ttc','msyhbd.ttc']){const font=path.join(process.env.WINDIR??'C:/Windows','Fonts',file);if(existsSync(font))GlobalFonts.registerFromPath(font);}
const factory=(w,h)=>createCanvas(w,h),out=new URL('../qa/personal/',import.meta.url);await mkdir(out,{recursive:true});
for(const [i,name]of ['Juniper Moss','W'.repeat(48),'יצור קטן עם שם ארוך במיוחד שאוהב סיפורים','漢'.repeat(48)].entries()){
 const answers=decodeDNA(i%2?'21111':'01110'),story={text:generateStory(answers,42+i)};
 const {canvas,layout}=createPoster({answers,name,story},factory);
 assert.equal(canvas.width,1800);assert.equal(canvas.height,2520);assert.ok(layout.nameLines.length<=2);assert.ok(layout.nameBottom<layout.descriptionBottom);assert.ok(layout.descriptionBottom<2370);
 const ctx=canvas.getContext('2d');ctx.font=`900 ${layout.fontSize}px ${layout.fontFamily}`;for(const line of layout.nameLines)assert.ok(ctx.measureText(line).width<=1481);ctx.font='35px Georgia, serif';for(const line of layout.descriptionLines)assert.ok(ctx.measureText(line).width<=1481);
 assert.equal(layout.descriptionLines.join(' '),story.text);
 await writeFile(new URL(`poster-${i}.png`,out),canvas.toBuffer('image/png'));
 console.log(JSON.stringify({name,nameLines:layout.nameLines.length,descriptionLines:layout.descriptionLines.length,descriptionBottom:layout.descriptionBottom,fontSize:layout.fontSize}));
}
