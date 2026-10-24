import {familyPose,supportsFamilyMotion} from './family-motion.js?v=paperfall2';

// Presentation deformation only: original anatomy and paper snapshots stay intact.
export function arrivalPose(scene,beat,elapsed=0){
 if(!beat.collapse)return supportsFamilyMotion(scene)?familyPose(scene,beat.action,beat.pose,elapsed/1000):scene;
 const c=beat.collapse,sx=1+.08*c,sy=1-.76*c,shear=.08*c,floor=668;
 const matrix=[sx,0,shear,sy,300*(1-sx)-floor*shear,floor*(1-sy)];
 const move=([x,y])=>[matrix[0]*x+matrix[2]*y+matrix[4],matrix[3]*y+matrix[5]];
 const part=p=>({...p,points:p.points.map(move),paperRestPoints:p.points,paperTextureOrigin:p.points,paperTextureTransform:matrix,...(p.anchor?{anchor:move(p.anchor)}:{})});
 const shapes=scene.shapes.map(part);
 return {...scene,shapes,lines:scene.lines.map(part),body:shapes.find(p=>p.id==='body').points,
  eyes:scene.eyes.map(e=>{const [x,y]=move([e.x,e.y]);return {...e,x,y,r:e.r*sx,ry:Math.max(2,e.ry*sy),gaze:[0,0],blink:c*.55};}),
  attachments:scene.attachments.map(a=>({...a,root:move(a.root)})),faceFrame:{source:scene,mapPoint:move,cue:{}}};
}
