import {registerPaintTiles} from './renderer.js';

// These are the existing renderer's seeded pigment swatches, baked locally. No
// creature images: contours, patterns, eyes and every moving joint remain live.
export async function loadPaintTiles(){
 try{
  const base=new URL('../assets/paint/',import.meta.url),manifest=await fetch(new URL('manifest.json',base)).then(r=>r.json());
  const entries=await Promise.all(manifest.map(async({key,file})=>{
   const image=new Image();image.src=new URL(file,base).href;await image.decode();return [key,image];
  }));registerPaintTiles(entries);
 }catch(error){console.warn('Using the procedural paint fallback.',error);}
}
