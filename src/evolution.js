import {generateMonster,resample,QUESTIONS} from './dna.js';
import {sample} from './anidoodle-kit.js';
import {C} from './illustrations.js';

export function amorphousScene(){
 const points=resample(sample([[292,241],[352,234],[381,275],[369,321],[416,358],[405,410],[365,429],[340,480],[287,467],[246,489],[208,451],[220,405],[187,375],[198,328],[240,306],[252,263]],true,10));
 const body={id:'body',points,color:C.violet,seed:1042,texture:.9,flow:1.35,body:true,furry:.45};
 const patch=(id,pts,color)=>({id,points:resample(sample(pts,true,8)),color,seed:1042,texture:.8,flow:1.35,clip:'body',soft:true});
 return {shapes:[body,patch('color-mass-left',[[221,301],[280,275],[311,320],[290,382],[224,391],[205,353]],C.coral),patch('color-mass-right',[[345,334],[398,351],[409,399],[363,438],[325,414],[323,371]],C.teal),patch('belly-wash',[[254,394],[292,372],[329,417],[322,470],[275,461],[245,440]],C.ochre)],lines:[],eyes:[],attachments:[],body:points,answers:{},code:'unformed',seed:1042,tooth:.9,family:'unformed',stage:0};
}

// Projection, not five separate drawings: stable anatomy IDs survive each stage.
// Missing decisions never leak their default finished anatomy into the preview.
export function evolutionScene(answers={}){
 let stage=0;for(const q of QUESTIONS){if(!answers[q.key])break;stage++;}
 if(!stage)return amorphousScene();
 const scene=generateMonster(answers);
 const structural=id=>id==='body'||id==='counter'||id==='belly-wash'||id.startsWith('color-mass')||id.startsWith('module-');
 scene.shapes=scene.shapes.filter(s=>structural(s.id)||(stage>=3&&s.stalk)||(stage>=4&&s.pattern)||stage===5);
 scene.lines=scene.lines.filter(s=>s.id==='counter-edge'||s.id.startsWith('grid-seam')||(stage>=4&&s.pattern)||stage===5);
 if(stage<3)scene.eyes=[];
 scene.attachments=scene.attachments.filter(a=>stage===5||(stage>=3&&a.id==='eye-stalk'));
 return {...scene,stage};
}
