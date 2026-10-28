import {QUESTIONS,normalizeAnswers,encodeDNA} from './dna.js';
import {generateStory,wordCount} from './story.js';
import {materialQuestion,materialPrinciple} from './material-flow.js';
export const initialState=()=>({screen:'intro',rulesVersion:7,step:0,answers:{},name:'',storySeed:0,visualSeed:null,story:null,creationId:null,createdAt:null});
export const normalizeName=value=>Array.from(String(value??'').replace(/[\u0000-\u001f\u007f]/g,'').replace(/\s+/gu,' ').trim()).slice(0,48).join('');
const complete=s=>QUESTIONS.every(q=>s.answers[q.key]);
function withStory(state){
 if(!complete(state))return state;
 const code=encodeDNA(state.answers),seed=state.storySeed>>>0;
 if(!state.creationId)state={...state,creationId:`legacy-${seed}-${code}-${Array.from(state.name).map(c=>c.codePointAt(0).toString(36)).join('')}`,createdAt:state.createdAt??0};
 if(state.story?.code===code&&state.story.seed===seed)return state;
 return{...state,story:{code,seed,text:generateStory(state.answers,seed,state.rulesVersion??2)}};
}
export function reducer(state,event){
 if(state.screen==='reveal'&&!['RESET','REGENERATE','REVEAL'].includes(event.type))return state;
 switch(event.type){
  case 'START':{
   const name=normalizeName(event.name??state.name);if(!name)return state;
   const next={...state,name,storySeed:event.seed>>>0,...(state.rulesVersion>=6?{visualSeed:state.visualSeed??event.seed>>>0}:{}),story:null,creationId:state.creationId??event.id??`creature-${event.seed>>>0}-${Array.from(name).map(c=>c.codePointAt(0).toString(36)).join('')}`,createdAt:state.createdAt??event.createdAt??0};
   const first=QUESTIONS.findIndex(q=>!state.answers[q.key]);
   return first<0?withStory({...next,screen:'reveal',step:4}):{...next,screen:'question',step:first};
  }
  case 'NAME':{const name=normalizeName(event.name);return name||state.screen==='intro'?{...state,name}:state;}
  case 'HOME':return{...state,screen:'intro'};
  case 'SELECT':{
   if(state.screen!=='question')return state;
   if(state.step===0){const m=materialQuestion(state.answers);if(m.options.some(o=>o[0]===event.value)){
    const answers={...state.answers,[m.key]:event.value},principle=materialPrinciple(answers.construction,answers.surface);
    if(principle)answers.principle=principle;
    return {...state,answers,story:null};
   }}
   const q=QUESTIONS[state.step];if(!q.options.some(o=>o[0]===event.value))return state;if(state.answers[q.key]===event.value)return state;return{...state,answers:{...state.answers,[q.key]:event.value},story:null};
  }
  case 'ADVANCE':{if(!state.answers[QUESTIONS[state.step].key])return state;if(state.step===4)return withStory({...state,screen:'reveal'});return{...state,step:state.step+1};}
  case 'REVEAL':return complete(state)&&state.name?withStory({...state,screen:'reveal'}):state;
  case 'BACK':return state.screen==='reveal'?{...state,screen:'question',step:4}:state.step>0?{...state,step:state.step-1}:{...state,screen:'intro'};
  case 'GO':{const step=event.step;if(!Number.isInteger(step)||step<0||step>4||QUESTIONS.slice(0,step).some(q=>!state.answers[q.key]))return state;return{...state,screen:'question',step};}
  case 'REGENERATE':{
   if(!complete(state)||!state.name)return state;
   let seed=event.seed>>>0,next;for(let i=0;i<32;i++){next=withStory({...state,storySeed:seed,story:null});if(next.story.text!==state.story?.text)return next;seed=(seed+0x9e3779b9)>>>0;}return next;
  }
  case 'RESET':return initialState();
  default:return state;
 }
}
export function restoreState(raw){
 try{
  const s=JSON.parse(raw);if(!s||!['intro','question','reveal'].includes(s.screen)||!Number.isInteger(s.step)||s.step<0||s.step>4)throw new Error();
  normalizeAnswers(s.answers);const answers={};for(const q of [...QUESTIONS,{key:'construction'},{key:'surface'}])if(s.answers[q.key])answers[q.key]=s.answers[q.key];
  if(answers.surface&&materialPrinciple(answers.construction,answers.surface)!==answers.principle)throw new Error();
  if(s.screen==='reveal'&&!QUESTIONS.every(q=>answers[q.key]))throw new Error();
  if(s.screen==='question'&&QUESTIONS.slice(0,s.step).some(q=>!answers[q.key]))throw new Error();
  const name=normalizeName(s.name),seed=Number.isInteger(s.storySeed)?s.storySeed>>>0:0;
  const rulesVersion=!Object.keys(answers).length?7:[3,4,5,6,7].includes(s.rulesVersion)?s.rulesVersion:2;
  let state={rulesVersion,screen:name?s.screen:'intro',step:s.step,answers,name,storySeed:seed,visualSeed:Number.isInteger(s.visualSeed)?s.visualSeed>>>0:rulesVersion>=6&&Object.keys(answers).length?seed:null,story:null,creationId:typeof s.creationId==='string'?s.creationId:null,createdAt:Number.isFinite(s.createdAt)?s.createdAt:null};
  if(s.story&&complete(state)&&s.story.code===encodeDNA(answers)&&s.story.seed===seed&&typeof s.story.text==='string'&&wordCount(s.story.text)>=35&&wordCount(s.story.text)<=55&&s.story.text===generateStory(answers,seed,rulesVersion))state.story=s.story;
  return state.screen==='reveal'?withStory(state):state;
 }catch{return initialState();}
}
