import {registerPaintTiles} from './renderer.js?v=arrival1';
const pending=new Map();let manifest;
function bounded(promise,ms){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Paint download timed out')),ms);})]).finally(()=>clearTimeout(timer));}
export function scenePaintKeys(scene){
 if(!scene)return null;
 const keys=new Set(scene.shapes.filter(s=>!s.opening).map(s=>`${s.color}/${s.texture??.7}/${s.flow??1.35}/${!!s.soft}`));
 if(scene.eyes.length)keys.add('#f4e9ce/0.3/1.35/false');return keys;
}
// Paint is an optional enhancement: never gate the interface on image downloads.
// Only the current anatomy's swatches are requested; cached promises share work.
export async function loadPaintTiles(scene,{timeoutMs=5000}={}){
 if(scene?.medium==='cut-paper')return;
 const base=new URL('../assets/paint/',import.meta.url);
 try{
  manifest??=bounded(fetch(new URL('manifest.json',base)).then(r=>{if(!r.ok)throw new Error('Paint manifest unavailable');return r.json();}),timeoutMs).catch(error=>{manifest=null;throw error;});
  const keys=scenePaintKeys(scene),entries=(await manifest).filter(entry=>!keys||keys.has(entry.key));
  await Promise.allSettled(entries.map(({key,file})=>{
   if(!pending.has(key))pending.set(key,(async()=>{
    const image=new Image();image.src=new URL(file,base).href;await bounded(image.decode(),timeoutMs);registerPaintTiles([[key,image]]);
   })().catch(()=>{pending.delete(key);}));
   return pending.get(key);
  }));
 }catch{/* The original deterministic paint renderer remains available offline. */}
}
