const clamp=t=>Math.max(0,Math.min(1,t)),ease=t=>{t=clamp(t);return t*t*(3-2*t);};
export const ARRIVAL_FALL_AT=500,ARRIVAL_IMPACT_AT=5000,ARRIVAL_HEAP_AT=5480,ARRIVAL_RECOVER_AT=6480,ARRIVAL_GESTURE_AT=8380,ARRIVAL_DISTANCE=2.2;
// Pure choreography: the browser supplies elapsed time, never the drawing code.
export function arrivalBeat(ms,gesture='greet',gestureDuration=3000){
 if(ms<ARRIVAL_FALL_AT){const t=clamp(ms/ARRIVAL_FALL_AT);return {phase:'suspended',drop:-.035*Math.sin(t*Math.PI/2),camera:0,tilt:0,action:'fall',pose:0,collapse:0,shadow:0};}
 if(ms<ARRIVAL_IMPACT_AT){const t=clamp((ms-ARRIVAL_FALL_AT)/(ARRIVAL_IMPACT_AT-ARRIVAL_FALL_AT)),drop=t*t-.035*(1-t);return {phase:'falling',drop,camera:Math.max(0,drop-.095*Math.sin(Math.PI*t)),tilt:Math.sin(t*17)*2.7*Math.sin(Math.PI*t),action:'fall',pose:t,collapse:0,shadow:ease((t-.85)/.15)};}
 if(ms<ARRIVAL_HEAP_AT){const t=clamp((ms-ARRIVAL_IMPACT_AT)/(ARRIVAL_HEAP_AT-ARRIVAL_IMPACT_AT)),collapse=ease(t/.55)-.09*Math.sin(clamp((t-.55)/.45)*Math.PI);return {phase:'impact',drop:1,camera:1,tilt:Math.sin(t*Math.PI*2)*3*(1-t),action:'breathe',pose:0,collapse,shadow:1};}
 if(ms<ARRIVAL_RECOVER_AT)return {phase:'heap',drop:1,camera:1,tilt:0,action:'breathe',pose:0,collapse:1,shadow:1};
 if(ms<ARRIVAL_GESTURE_AT){const t=clamp((ms-ARRIVAL_RECOVER_AT)/(ARRIVAL_GESTURE_AT-ARRIVAL_RECOVER_AT));return {phase:'recovering',drop:1,camera:1,tilt:Math.sin(t*Math.PI*3)*3.5*Math.sin(t*Math.PI),action:'breathe',pose:0,collapse:1-ease(t),shadow:1};}
 const t=clamp((ms-ARRIVAL_GESTURE_AT)/gestureDuration);
 return {phase:t<1?'gesture':'complete',drop:1,camera:1,tilt:0,action:gesture,pose:t,collapse:0,shadow:1};
}
