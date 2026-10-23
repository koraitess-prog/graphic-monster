import {generateMonster,encodeDNA} from './dna.js';
export const ARCHIVE_VERSION=1;
export const shortStatement=story=>String(story?.text??story??'').split(/(?<=[.!?])\s+/u)[0];
export function makeRecord(state){
 if(state.screen!=='reveal'||!state.creationId||!state.story?.text)throw new Error('Only completed, identified creatures can be archived.');
 const scene=generateMonster(state.answers);
 return {version:ARCHIVE_VERSION,visualVersion:2,id:state.creationId,createdAt:state.createdAt??0,name:state.name,answers:structuredClone(state.answers),code:encodeDNA(state.answers),seed:scene.seed,story:structuredClone(state.story),originalStory:structuredClone(state.story),scene};
}
export function mergeRecord(existing,incoming){
 if(!existing)return incoming;
 if(existing.version!==ARCHIVE_VERSION||existing.code!==incoming.code||existing.name!==incoming.name)throw new Error('An archived creature cannot be replaced.');
 return {...existing,story:incoming.story};
}
export function openArchive(databaseName='graphic-monster-archive',timeoutMs=2000){
 return new Promise((resolve,reject)=>{
  let settled=false;const timer=setTimeout(()=>{settled=true;reject(new Error('Archive unavailable'));},timeoutMs);
  const request=indexedDB.open(databaseName,1);
  const fail=error=>{clearTimeout(timer);settled=true;reject(error);};
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('creatures'))db.createObjectStore('creatures',{keyPath:'id'});};
  request.onerror=()=>fail(request.error);request.onblocked=()=>fail(new Error('Archive is open in an older tab.'));
  request.onsuccess=()=>{const db=request.result;if(settled){db.close();return;}settled=true;clearTimeout(timer);db.onversionchange=()=>db.close();resolve({
   list:()=>new Promise((yes,no)=>{const tx=db.transaction('creatures','readonly'),deadline=setTimeout(()=>{no(new Error('Archive read timed out'));tx.abort();},timeoutMs),req=tx.objectStore('creatures').getAll();req.onsuccess=()=>{clearTimeout(deadline);yes(req.result.filter(r=>r.version===ARCHIVE_VERSION&&r.scene?.shapes?.some(s=>s.id==='body')).sort((a,b)=>b.createdAt-a.createdAt));};req.onerror=()=>{clearTimeout(deadline);no(req.error);};}),
   save:record=>new Promise((yes,no)=>{const tx=db.transaction('creatures','readwrite'),store=tx.objectStore('creatures'),req=store.get(record.id);let saved;
    req.onsuccess=()=>{try{saved=mergeRecord(req.result,record);store.put(saved);}catch(error){tx.abort();no(error);}};
    tx.oncomplete=()=>yes(saved);tx.onerror=()=>no(tx.error);tx.onabort=()=>no(tx.error??new Error('Archive write stopped.'));
   })
  });};
 });
}
