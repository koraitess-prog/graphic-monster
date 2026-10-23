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
export function openArchive(databaseName='graphic-monster-archive'){
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(databaseName,1);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('creatures'))db.createObjectStore('creatures',{keyPath:'id'});};
  request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('Archive is open in an older tab.'));
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();resolve({
   list:()=>new Promise((yes,no)=>{const tx=db.transaction('creatures','readonly'),req=tx.objectStore('creatures').getAll();req.onsuccess=()=>yes(req.result.filter(r=>r.version===ARCHIVE_VERSION&&r.scene?.shapes?.some(s=>s.id==='body')).sort((a,b)=>b.createdAt-a.createdAt));req.onerror=()=>no(req.error);}),
   save:record=>new Promise((yes,no)=>{const tx=db.transaction('creatures','readwrite'),store=tx.objectStore('creatures'),req=store.get(record.id);let saved;
    req.onsuccess=()=>{try{saved=mergeRecord(req.result,record);store.put(saved);}catch(error){tx.abort();no(error);}};
    tx.oncomplete=()=>yes(saved);tx.onerror=()=>no(tx.error);tx.onabort=()=>no(tx.error??new Error('Archive write stopped.'));
   })
  });};
 });
}
