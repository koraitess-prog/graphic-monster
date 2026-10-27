// Seeded paper choreography: several intertwined currents, never a rigid disk.
import {rng} from './anidoodle-kit.js';
export const vortexHash=s=>[...s].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
const clamp=t=>Math.max(0,Math.min(1,t));
export function vortexPose(id,index,total,traits,seconds=0,energy=0,kind='paper'){
 const random=rng(vortexHash(id)),phase=random()*Math.PI*2,lane=index%3,individual=random(),outer=lane===2;
 const speed=(traits.playful?.84:.54)*(traits.ordered?.83:1)*(outer?.63:1.18)+(traits.ordered?0:individual*.23);
 const turn=(traits.ordered?index*2.39996:phase)+seconds*speed+energy*(.65+individual)*1.5;
 const breath=Math.sin(seconds*.81+phase)*10;
 const radius=(lane===0?59:lane===1?118:180)+(traits.ordered?0:individual*22)+breath+energy*18;
 const z=Math.sin(turn+phase*.2),depth=.62+(z+1)*.27;
 let x=300+Math.cos(turn)*radius,y=362+Math.sin(turn)*radius*.75;
 x+=Math.sin(seconds*1.13+phase*2)*10;y+=Math.sin(seconds*.57+phase)*13;
 if(traits.expressive){x+=(index%2?8:-8);y+=Math.sin(phase)*7;}
 const limb=kind==='limb',eye=kind==='eye',mouth=kind==='mouth',material=kind==='material';
 const base=material?170:eye?62:limb?96:mouth?73:outer?25:lane===1?42:54;
 const size=base*(.7+individual*.6)*depth*(traits.language==='texture'?.85:1)*(1+energy*.13);
 return {x,y,angle:turn*(index%4===0?-1.1:.63)+Math.sin(seconds*1.7+phase)*.24,size:Math.min(material?190:145,size),depth:z,fold:.52+.48*Math.abs(Math.cos(seconds*(.65+individual)+phase)),alpha:outer?.66+depth*.25:1};
}
export function stirAt(impulse,now){
 if(!impulse)return {energy:0,turn:0};
 const t=Math.max(0,(now-impulse.at)/1000),energy=clamp(impulse.energy??.3);
 return {energy:energy*(1-Math.exp(-t*12))*Math.exp(-t*1.05),turn:(impulse.spin??1)*energy*1.35*(1-Math.exp(-t*1.5))};
}
// All contours stay inside a normalized source crop; they are clipped from printed stock.
export function shredContour(index){
 const contours=[
 [[0,.12],[.83,0],[1,.26],[.52,.51],[.88,1],[.16,.86]],
 [[.13,0],[.5,.12],[.43,.51],[1,.78],[.75,1],[.08,.59]],
 [[0,0],[1,.16],[.18,1]],
 [[0,.16],[.93,0],[1,.78],[.68,1],[.6,.55],[.26,.89]],
 [[.09,0],[.39,.04],[.66,.35],[.46,.55],[1,.88],[.68,1],[.14,.59]],
 [[0,.11],[1,0],[.97,.26],[.2,.4],[.14,.82],[0,1]],
 [[0,.2],[.23,0],[1,.6],[.84,1],[.49,.65],[.41,.87]],
 [[.15,0],[.95,.11],[1,.48],[.65,.6],[.94,.9],[.31,1],[0,.45]],
 [[0,.19],[.9,0],[1,.2],[.75,.35],[.98,.52],[.73,.68],[.94,.92],[0,1]],
 [[.05,0],[.82,.13],[1,.45],[.63,.94],[.15,1],[.26,.46]],
 [[0,.27],[.73,0],[1,.12],[.82,.39],[.38,.5],[.24,1],[0,.86]],
 [[.11,0],[.58,.12],[.41,.55],[.94,.76],[1,1],[.32,.85],[0,.32]]
 ];return contours[index%contours.length].map(p=>p.slice());
}
