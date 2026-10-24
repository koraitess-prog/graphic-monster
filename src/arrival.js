import {materialSpring,arrivalMaterial} from './tactile-motion.js';
const clamp=t=>Math.max(0,Math.min(1,t)),ease=t=>{t=clamp(t);return t*t*(3-2*t);};
export const ARRIVAL_FALL_AT=900,ARRIVAL_IMPACT_AT=5400,ARRIVAL_HEAP_AT=5880,ARRIVAL_RECOVER_AT=6880,ARRIVAL_GESTURE_AT=8780,ARRIVAL_DISTANCE=2.2;
// Pure choreography: the browser supplies elapsed time, never the drawing code.
export function arrivalBeat(ms,gesture='greet',gestureDuration=3000,scene){
 const p=arrivalMaterial(scene),heavy=['grid','accordion','knot'].includes(scene?.anatomy);
 const impactSeconds=Math.max(0,(ms-ARRIVAL_IMPACT_AT)/1000),camera=ms>=ARRIVAL_IMPACT_AT?Math.min(1,materialSpring(impactSeconds,.965,1,2/4.5,14,1)+(1-materialSpring(impactSeconds,.965,1,2/4.5,14,1))*ease((impactSeconds-.3)/.4)):0;
 if(ms<ARRIVAL_FALL_AT){const t=clamp(ms/ARRIVAL_FALL_AT);return {phase:'suspended',drop:-.025*Math.sin(t*Math.PI/2),camera:0,tilt:Math.sin(t*Math.PI)*1.6*p.roll,drift:-Math.sin(t*Math.PI)*.006*p.roll,action:'look',pose:t*.45,collapse:0,shadow:0};}
 if(ms<ARRIVAL_IMPACT_AT){const t=clamp((ms-ARRIVAL_FALL_AT)/(ARRIVAL_IMPACT_AT-ARRIVAL_FALL_AT)),drop=t*t-.025*(1-t),lag=.125*p.lag*Math.sin(Math.PI*t)**1.2+.035*ease(t),pulse=materialSpring(t*4.5-.24,0,0,10,3.8,.56)+materialSpring(t*4.5-1.9,0,0,-7,4.2,.6);return {phase:'falling',drop,camera:Math.max(0,drop-lag),tilt:pulse*2.4*p.roll,drift:pulse*.009*p.roll,action:'fall',pose:t,collapse:0,shadow:ease((t-.85)/.15)};}
 if(ms<ARRIVAL_HEAP_AT){const t=clamp((ms-ARRIVAL_IMPACT_AT)/(ARRIVAL_HEAP_AT-ARRIVAL_IMPACT_AT)),collapse=clamp(materialSpring(t*.48,0,1,0,heavy?19:15,.79));return {phase:'impact',drop:1,camera,tilt:materialSpring(impactSeconds,0,0,heavy?28:19,14,.64),drift:0,action:'breathe',pose:0,collapse,shadow:1};}
 if(ms<ARRIVAL_RECOVER_AT){const t=(ms-ARRIVAL_HEAP_AT)/(ARRIVAL_RECOVER_AT-ARRIVAL_HEAP_AT);return {phase:'heap',drop:1,camera,tilt:0,drift:0,action:'breathe',pose:0,collapse:1-.008*Math.sin(t*Math.PI)**2,shadow:1};}
 if(ms<ARRIVAL_GESTURE_AT){const t=clamp((ms-ARRIVAL_RECOVER_AT)/(ARRIVAL_GESTURE_AT-ARRIVAL_RECOVER_AT)),rise=heavy?(t<.38?.22*ease(t/.38):t<.52?.22-.06*ease((t-.38)/.14):.16+.84*ease((t-.52)/.48)):materialSpring(t*1.9,0,1,0,3.8,1)/materialSpring(1.9,0,1,0,3.8,1);return {phase:'recovering',drop:1,camera,tilt:p.roll*(heavy?-1:1)*Math.sin(t*Math.PI)*2,drift:0,action:'breathe',pose:0,collapse:1-rise,shadow:1};}
 const t=clamp((ms-ARRIVAL_GESTURE_AT)/gestureDuration);
 return {phase:t<1?'gesture':'complete',drop:1,camera:1,tilt:0,drift:0,action:gesture,pose:t,collapse:0,shadow:1};
}
