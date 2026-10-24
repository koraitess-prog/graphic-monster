const clamp=t=>Math.max(0,Math.min(1,t)),ease=t=>{t=clamp(t);return t*t*(3-2*t);};
export const ARRIVAL_GESTURE_AT=2350;
// Pure choreography: the browser supplies elapsed time, never the drawing code.
export function arrivalBeat(ms,gesture='greet',gestureDuration=3000){
 if(ms<350){const t=clamp(ms/350);return {phase:'suspended',drop:-.035*Math.sin(t*Math.PI/2),camera:0,tilt:0,action:'jump',pose:.27+.12*t,shadow:0};}
 if(ms<1250){const t=clamp((ms-350)/900),drop=t*t-.035*(1-t);return {phase:'falling',drop,camera:Math.max(0,drop)*ease((t-.30)/.70),tilt:Math.sin(t*Math.PI)*-3,action:'jump',pose:.39+.29*t,shadow:ease((t-.7)/.3)};}
 if(ms<1550){const t=clamp((ms-1250)/300);return {phase:'impact',drop:1,camera:1,tilt:Math.sin(t*Math.PI)*8+3*t,action:'jump',pose:.68+.11*t,shadow:1};}
 if(ms<ARRIVAL_GESTURE_AT){const t=clamp((ms-1550)/800);return {phase:'recovering',drop:1,camera:1,tilt:3*(1-ease(t))+Math.sin(t*Math.PI*2)*1.8*(1-t),action:'jump',pose:.79+.21*ease(t),shadow:1};}
 const t=clamp((ms-ARRIVAL_GESTURE_AT)/gestureDuration);
 return {phase:t<1?'gesture':'complete',drop:1,camera:1,tilt:0,action:gesture,pose:t,shadow:1};
}
