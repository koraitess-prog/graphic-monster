import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {amorphousScene} from '../src/evolution.js';
import {openArchive} from '../src/archive.js';
test('the intro downloads its four swatches rather than all 31 textures',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../assets/paint/manifest.json',import.meta.url),'utf8'));
 const originalFetch=globalThis.fetch,originalImage=globalThis.Image,requested=[];
 try{
  globalThis.fetch=async()=>({ok:true,json:async()=>manifest});
  globalThis.Image=class{set src(url){requested.push(url);}decode(){return Promise.resolve();}};
  const {loadPaintTiles}=await import('../src/paint-cache.js?test=selected');
  await loadPaintTiles(amorphousScene());assert.equal(requested.length,4);assert.equal(new Set(requested).size,4);
  await loadPaintTiles(amorphousScene());assert.equal(requested.length,4);
 }finally{globalThis.fetch=originalFetch;globalThis.Image=originalImage;}
});
test('a stalled texture manifest cannot hang the loading task',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=()=>new Promise(()=>{});const {loadPaintTiles}=await import('../src/paint-cache.js?test=stalled');await loadPaintTiles(amorphousScene(),{timeoutMs:15});}
 finally{globalThis.fetch=original;}
});
test('an unavailable local database cannot indefinitely block startup',async()=>{
 const original=globalThis.indexedDB;try{globalThis.indexedDB={open:()=>({})};await assert.rejects(openArchive('timeout-test',15),/Archive unavailable/);}
 finally{globalThis.indexedDB=original;}
});
