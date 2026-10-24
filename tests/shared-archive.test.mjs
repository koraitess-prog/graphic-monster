import test from 'node:test';
import assert from 'node:assert/strict';
import {SharedArchive,combineArchives,validPublicRecord} from '../src/shared-archive.js';
import {decodeDNA,generateMonster,combinations,encodeDNA} from '../src/dna.js';
const answers=decodeDNA('00000');
const record={version:1,id:'00000000-0000-4000-8000-000000000001',name:'Watch',code:'00000',answers,createdAt:100,story:{text:'Waiting.'},scene:generateMonster({...answers,seed:1},6)};
const config={url:'https://example.test',publicKey:'public-only',enabledAt:50};
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};};
test('published snapshots win without mutating legacy local creatures',()=>{
 const old=structuredClone(record),published={...record,story:{text:'Observed.'}};
 assert.deepEqual(combineArchives([old],[published]),[published]);assert.equal(old.story.text,'Waiting.');
 assert.equal(validPublicRecord({...record,scene:{shapes:[]}}),false);
});
test('all existing answer combinations pass public snapshot validation',()=>{
 for(const answers of combinations())assert.equal(validPublicRecord({...record,answers,code:encodeDNA(answers),scene:generateMonster({...answers,seed:17},6)}),true);
 assert.equal(validPublicRecord({...record,scene:{...record.scene,shapes:[null]}}),false);
});
test('public collection pages are read without signing visitors in',async()=>{
 let calls=0;
 const api=new SharedArchive(config,{storage:memory(),fetcher:async(url,options)=>{
  assert.ok(!url.includes('/auth/'));assert.equal(options.headers.apikey,'public-only');
  return {ok:true,status:200,json:async()=>++calls===1?Array.from({length:100},()=>({record})):[{record:{bad:true}}]};
 }});
 assert.equal((await api.list()).length,100);assert.equal(calls,2);
});
test('old private specimens are never automatically published',async()=>{
 const api=new SharedArchive(config,{storage:memory(),fetcher:()=>{throw new Error('Must not connect');}});
 assert.equal(await api.save({...record,createdAt:49}),false);
});
test('creating and updating a specimen uses one anonymous owner and keeps its anatomy',async()=>{
 let saved=null,signins=0;
 const api=new SharedArchive(config,{storage:memory(),fetcher:async(url,options)=>{
  let value;
  if(url.includes('/auth/')){signins++;value={access_token:'visitor',expires_in:3600,user:{id:'owner'}};}
  else if(options.method==='POST'){saved=JSON.parse(options.body).record;return {ok:true,status:201};}
  else if(options.method==='PATCH'){
   const incoming=JSON.parse(options.body).record;assert.deepEqual(incoming.scene,record.scene);
   assert.equal(options.headers.Authorization,'Bearer visitor');saved=incoming;value=[{record:saved}];
  }else value=saved?[{record:saved}]:[];
  return {ok:true,status:200,json:async()=>value};
 }});
 await api.save(record);await api.save({...record,scene:{...record.scene,shapes:record.scene.shapes.map(s=>({...s,changed:true}))},story:{text:'Awake.'}});
 assert.equal(signins,1);assert.equal(saved.story.text,'Awake.');assert.deepEqual(saved.scene,record.scene);
});
test('failed refresh and denied writes are reported, never treated as published',async()=>{
 const storage=memory();storage.setItem('graphic-monster:shared-session:v1',JSON.stringify({refresh_token:'expired',expires_at:0}));
 const api=new SharedArchive(config,{storage,fetcher:async(url)=>{assert.ok(url.includes('refresh_token'));return {ok:false,status:401};}});
 await assert.rejects(api.session(),/401/);
 const denied=new SharedArchive(config,{storage:memory(),fetcher:async()=>({ok:false,status:403})});
 await assert.rejects(denied.list(),/403/);
});
