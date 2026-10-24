import {familyPose,supportsFamilyMotion} from './family-motion.js?v=paperfall2';
import {arrivalMaterial,fallingMaterial,materialEase} from './tactile-motion.js';
import {ARRIVAL_FALL_AT,ARRIVAL_IMPACT_AT} from './arrival.js?v=arrival2';

// Presentation deformation only: original anatomy and paper snapshots stay intact.
export function arrivalPose(scene,beat,elapsed=0){
 let source=scene;
 if(beat.phase==='impact'&&supportsFamilyMotion(scene)){
  // Hands and feet keep their momentum into the crumple, then relax. They do
  // not snap from their airborne pose to the standing pose at contact.
  const residual=1-materialEase((elapsed-ARRIVAL_IMPACT_AT)/420),live=fallingMaterial(scene,(ARRIVAL_IMPACT_AT-ARRIVAL_FALL_AT)/1000);
  live.arms=live.arms.map(a=>({...a,lift:a.lift*residual,flap:a.flap*residual,roll:a.roll*residual}));live.legLift*=residual;live.legSwing*=residual;
  source=familyPose(scene,'fall',1,elapsed/1000,1,live);
 }
 if(!beat.collapse)return source!==scene?source:supportsFamilyMotion(scene)?familyPose(scene,beat.action,beat.pose,elapsed/1000,1,beat.action==='fall'?fallingMaterial(scene,(elapsed-ARRIVAL_FALL_AT)/1000):undefined):scene;
 const c=beat.collapse,sx=1+.065*c,sy=1-.76*c,shear=arrivalMaterial(scene).shear*c,floor=668;
 const matrix=[sx,0,shear,sy,300*(1-sx)-floor*shear,floor*(1-sy)];
 const move=([x,y])=>[matrix[0]*x+matrix[2]*y+matrix[4],matrix[3]*y+matrix[5]];
 const part=p=>({...p,points:p.points.map(move),paperOuterSource:p,paperOuterTransform:matrix,...(p.anchor?{anchor:move(p.anchor)}:{})});
 const shapes=source.shapes.map(part);
 return {...source,shapes,lines:source.lines.map(part),body:shapes.find(p=>p.id==='body').points,
  eyes:source.eyes.map(e=>{const [x,y]=move([e.x,e.y]);return {...e,x,y,r:e.r*sx,ry:Math.max(2,e.ry*sy),gaze:[0,0],blink:c*.55};}),
  attachments:source.attachments.map(a=>({...a,root:move(a.root)})),faceFrame:{source:scene,mapPoint:(q,id)=>move(source.faceFrame?.mapPoint(q,id)??q),cue:{}}};
}
