import {ARCHIVE_VERSION} from './archive.js';
import {QUESTIONS,encodeDNA} from './dna.js';

// Only public project credentials belong here. Never use a service-role key.
export function validPublicRecord(r){
 const points=p=>Array.isArray(p)&&p.length>0&&p.length<=2048&&p.every(v=>Array.isArray(v)&&v.length===2&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<10000));
 return r?.version===ARCHIVE_VERSION&&typeof r.id==='string'&&typeof r.name==='string'&&r.name.length<=48&&
  /^[0-4][01]{4}$/.test(r.code)&&Number.isFinite(r.createdAt)&&typeof r.story?.text==='string'&&
  QUESTIONS.every(q=>q.options.some(o=>o[0]===r.answers?.[q.key]))&&encodeDNA(r.answers)===r.code&&
  Array.isArray(r.scene?.shapes)&&r.scene.shapes.length<=1500&&r.scene.shapes.some(s=>s?.id==='body')&&
  r.scene.shapes.every(s=>typeof s?.id==='string'&&points(s.points))&&
  Array.isArray(r.scene.lines)&&r.scene.lines.length<1500&&r.scene.lines.every(s=>points(s?.points))&&
  Array.isArray(r.scene.eyes)&&r.scene.eyes.length<=100&&r.scene.eyes.every(e=>e&&[e.x,e.y,e.r,e.ry].every(Number.isFinite)&&Array.isArray(e.gaze)&&e.gaze.length===2&&e.gaze.every(Number.isFinite));
}
export function combineArchives(local,shared){
 // A published snapshot is authoritative; local legacy scenes remain untouched.
 return [...new Map([...local,...shared].map(r=>[r.id,r])).values()].sort((a,b)=>b.createdAt-a.createdAt);
}
export class SharedArchive{
 constructor(config,{fetcher=globalThis.fetch.bind(globalThis),storage}={}){
  if(storage===undefined)try{storage=globalThis.localStorage;}catch{storage=null;}
  this.config=config;this.fetcher=fetcher;this.storage=storage;this.key='graphic-monster:shared-session:v1';this.pending=null;
 }
 async request(path,options={}){
  const response=await this.fetcher(`${this.config.url}${path}`,{...options,headers:{apikey:this.config.publicKey,'Content-Type':'application/json',...options.headers},signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error(`Shared archive request failed (${response.status})`);
  return response.status===204||options.headers?.Prefer==='return=minimal'?null:response.json();
 }
 async session(){
  if(this.pending)return this.pending;
  this.pending=this.getSession();try{return await this.pending;}finally{this.pending=null;}
 }
 async getSession(){
  if(this.currentSession?.expires_at>Date.now()/1000+60)return this.currentSession;
  let saved;try{saved=JSON.parse(this.storage?.getItem(this.key)??'null');}catch{}
  if(saved?.access_token&&saved.expires_at>Date.now()/1000+60)return saved;
  // A failed refresh must never silently create a new owner for existing records.
  const session=await this.request(saved?.refresh_token?'/auth/v1/token?grant_type=refresh_token':'/auth/v1/signup',{method:'POST',body:JSON.stringify(saved?.refresh_token?{refresh_token:saved.refresh_token}:{})});
  if(!session?.access_token||!session.user?.id)throw new Error('Shared archive sign-in unavailable');
  session.expires_at??=Date.now()/1000+session.expires_in;
  try{this.storage?.setItem(this.key,JSON.stringify(session));}catch{}
  this.currentSession=session;return session;
 }
 async list(){
  const records=[];
  for(let offset=0;;offset+=100){
   const page=await this.request(`/rest/v1/creatures?select=record&order=published_at.desc,id.asc&limit=100&offset=${offset}`);
   if(!Array.isArray(page))throw new Error('Invalid shared archive response');
   records.push(...page.map(row=>row.record).filter(validPublicRecord));
   if(page.length<100)return records;
  }
 }
 async save(record){
  if(!validPublicRecord(record))throw new Error('Invalid specimen');
  if(record.createdAt<this.config.enabledAt)return false;
  const session=await this.session(),headers={Authorization:`Bearer ${session.access_token}`,Prefer:'return=minimal'};
  // Look up an existing public id before writing, preserving its first illustration.
  const existing=await this.request(`/rest/v1/creatures?select=record&id=eq.${encodeURIComponent(record.id)}`);
  if(existing.length){
   const stable={...existing[0].record,story:record.story};
   if(JSON.stringify(existing[0].record.story)===JSON.stringify(record.story))return true;
   const updated=await this.request(`/rest/v1/creatures?id=eq.${encodeURIComponent(record.id)}&select=record`,{method:'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify({record:stable})});
   if(!updated?.length)throw new Error('Only the original creator may change this description');
  }else await this.request('/rest/v1/creatures',{method:'POST',headers,body:JSON.stringify({id:record.id,record})});
  return true;
 }
}
