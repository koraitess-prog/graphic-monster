// Scalar adaptation of Anidoodle 0.9.6 input.ts evalSeg (Apache-2.0).
// Closed form: the same time/seed gives the same pose, independent of frame rate.
export function materialSpring(seconds,from=0,to=1,velocity=0,omega=10,zeta=.86){
 if(seconds<=0)return from;
 const a=from-to;
 if(zeta<1){const wd=omega*Math.sqrt(1-zeta*zeta),b=(velocity+zeta*omega*a)/wd;return to+Math.exp(-zeta*omega*seconds)*(a*Math.cos(wd*seconds)+b*Math.sin(wd*seconds));}
 return to+(a+(velocity+omega*a)*seconds)*Math.exp(-omega*seconds);
}
export const clampMaterial=t=>Math.max(0,Math.min(1,t));
export const materialEase=t=>{t=clampMaterial(t);return t*t*(3-2*t);};

// Authored weight and recoil, not eight replacement anatomies.
export const ARRIVAL_MATERIALS=Object.freeze({
 crane:{roll:1.5,lag:1.12,shear:-.12,omega:7.8,delay:.27,leg:20},
 color:{roll:.8,lag:.86,shear:.08,omega:11,delay:.13,leg:10},
 grid:{roll:.5,lag:.74,shear:.04,omega:12.5,delay:.11,leg:7},
 accordion:{roll:.9,lag:.84,shear:-.11,omega:8.4,delay:.22,leg:11},
 typography:{roll:1.35,lag:1.08,shear:.13,omega:8.1,delay:.3,leg:23},
 shape:{roll:1.1,lag:1,shear:.1,omega:9.6,delay:.17,leg:17},
 texture:{roll:1.2,lag:.95,shear:-.08,omega:12,delay:.09,leg:15},
 knot:{roll:1.05,lag:1.04,shear:.15,omega:8.8,delay:.24,leg:13}
});
export const arrivalMaterial=scene=>ARRIVAL_MATERIALS[scene?.anatomy]??ARRIVAL_MATERIALS.shape;
export function fallingMaterial(scene,seconds){
 const p=arrivalMaterial(scene),individual=((scene.seed>>>0)%17)/100,t=seconds;
 const impulse=(at,v,w=10)=>materialSpring(t-at,0,0,v,w,.5);
 return {
  arms:Array.from({length:Math.max(2,scene.attachments?.length??2)},(_,i)=>{
   const delay=.08+(i%2)*p.delay+individual,catchAt=t-delay;
   const lift=clampMaterial(materialSpring(catchAt,0,1,0,p.omega,.86));
   const reflex=impulse(.62+i*.17,5,p.omega)+impulse(1.86+i*.22,-3.5,p.omega*.8)+impulse(3.35+i*.11,2.8,p.omega);
   return {lift,flap:reflex,roll:reflex*.42};
  }),
  legLift:p.leg*materialEase((t-.25)/.7)*(1-.2*materialEase((t-3.4)/.8)),
  legSwing:impulse(.5,5,5)*p.leg*.22
 };
}
