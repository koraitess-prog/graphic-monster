import {rng} from './anidoodle-kit.js';
import {materialSpring,materialEase} from './tactile-motion.js';
import {introScrapPoints} from './intro-scraps.js';
import {engravingTile} from './engraving.js';
import {creatureNamePapers,paintCreatureName} from './creature-lettering.js?v=arrival1';
import {ARRIVAL_IMPACT_AT,ARRIVAL_GESTURE_AT,ARRIVAL_DISTANCE} from './arrival.js?v=arrival2';

const clamp=t=>Math.max(0,Math.min(1,t)),smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
export function burstLayout(seed,width,height,count=40){
 const random=rng(seed),cx=width*.5,cy=height*.44;
 return Array.from({length:count},(_,i)=>{
  const pick=random(),edge=pick<.42?0:pick<.83?1:pick<.93?2:3;
  const pocket=[.19,.48,.79][Math.floor(random()*3)],t=Math.max(.04,Math.min(.96,pocket+(random()-.5)*.27)),inset=.008+random()*.029;
  const x=edge===0?width*inset:edge===1?width*(1-inset):width*t;
  const y=edge===2?height*inset:edge===3?height*(1-inset):height*t;
  return {x,y,startX:cx+(random()-.5)*90,startY:cy+(random()-.5)*110,angle:(random()-.5)*2.5,spin:(random()-.5)*6,size:16+random()**1.8*(width<650?56:84),delay:random()*.22,kind:i%8,
   release:.72+(i%3)*.19+random()*.55,omega:4.5+random()*4.5,damping:.82+random()*.15,arc:(random()-.5)*Math.min(width*.26,125),phase:random()*Math.PI*2,flutter:9+random()*9,aspect:.42+random()*.68};
 });
}
// Burst coordinates belong to the original upper screen.
export function burstPose(piece,progress){
 const t=clamp((progress-piece.delay)/(1-piece.delay)),e=1-(1-t)**3;
 return {x:piece.startX+(piece.x-piece.startX)*e,y:piece.startY+(piece.y-piece.startY)*e,angle:piece.angle+piece.spin*(1-e),scale:.12+.88*e};
}
export function upperPaperPose(piece,progress,scrollY=0){
 const pose=burstPose(piece,progress);return {...pose,y:pose.y-scrollY};
}
export function materialPaperPose(piece,seconds,scrollY=0){
 const t=seconds-piece.release;
 if(t<=0)return {x:piece.startX,y:piece.startY-scrollY,angle:piece.angle+piece.spin,scale:.6,alpha:0,fold:1};
 const reach=materialSpring(t,0,1,.3,piece.omega,piece.damping),travel=Math.max(.01,Math.hypot(piece.x-piece.startX,piece.y-piece.startY));
 const envelope=(1-Math.exp(-t*9))*Math.exp(-t*2.2),curl=piece.arc*envelope,flutter=Math.sin(piece.phase+t*piece.flutter)*envelope;
 return {x:piece.startX+(piece.x-piece.startX)*reach-(piece.y-piece.startY)/travel*curl,
  y:piece.startY+(piece.y-piece.startY)*reach+(piece.x-piece.startX)/travel*curl+flutter*4-scrollY,
  angle:piece.angle+piece.spin*(1-reach)+flutter*.27,scale:.6+.4*materialEase(t/.24),alpha:materialEase(t/.075),fold:1-Math.abs(flutter)*.43};
}
export function fallingLetterPose(index,count,width,height,beat,progress){
 const targetX=width*.5+(index-(count-1)/2)*Math.min(25,Math.max(7,(width-48)/Math.max(1,count)));
 const settle=smooth((progress-ARRIVAL_IMPACT_AT)/(ARRIVAL_GESTURE_AT-ARRIVAL_IMPACT_AT)),scatter=Math.sin(index*12.7)*Math.min(110,width*.2);
 return {x:targetX+scatter*(1-settle),y:36+(height*.14+Math.sin(index*4.8)*40+(beat.drop-beat.camera)*height*ARRIVAL_DISTANCE)*(1-settle),angle:Math.sin(index*7.1)*.65*(1-settle)};
}

// Anidoodle bake-once/composite-on-frame: the print moves inside every scrap.
// The host supplies the clock; these plates never modify the creature snapshot.
export function createRevealPapers({scene,name,reduced,manual=false}){
 if(reduced.matches||document.hidden)return {flight(){},finish(){}};
 const width=innerWidth,height=innerHeight,dpr=Math.min(2,devicePixelRatio||1),canvas=document.createElement('canvas');
 canvas.className='reveal-paper-theatre';canvas.setAttribute('aria-hidden','true');canvas.width=width*dpr;canvas.height=height*dpr;
 document.body.append(canvas);const g=canvas.getContext('2d'),factory=(w,h)=>{const c=document.createElement('canvas');c.width=Math.ceil(w);c.height=Math.ceil(h);return c;};
 const papers=creatureNamePapers(scene),pieces=burstLayout(scene.seed,width,height),stocks=papers.length?papers.slice(0,8).map(p=>p.style):[{color:'#e8ddba',texture:.4,printRevision:3}];
 const plates=Array.from({length:width<650?8:12},(_,i)=>{
  const c=factory(140,140),p=c.getContext('2d'),points=introScrapPoints(i,140,140),{tile,transform}=engravingTile(factory,stocks[i%stocks.length]);
  const pattern=p.createPattern(tile,'repeat');pattern.setTransform(transform);p.fillStyle=pattern;p.beginPath();points.forEach((q,j)=>j?p.lineTo(...q):p.moveTo(...q));p.closePath();p.fill();return c;
 });
 const chars=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(name)].map(p=>p.segment):Array.from(name);
 const letters=chars.map(char=>{if(!char.trim())return null;const c=factory(1,1);paintCreatureName(c,char,{scene});return c;});
 let raf=0,closed=false,flightStarted=false,flightElapsed=0,lastCamera=0,lastAssembly=0,handoffAt=null,lastBeat={drop:0,camera:0},start=performance.now();
 const draw=(assembly,elapsed,beat,scrollY=0)=>{
  g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,width,height);
  const fade=flightStarted?1-smooth((elapsed-ARRIVAL_GESTURE_AT)/1300):1;
  for(let i=0;i<pieces.length;i++){
   const p=pieces[i],pose=materialPaperPose(p,assembly/1000,scrollY);if(!pose.alpha)continue;
   g.save();g.globalAlpha=fade*pose.alpha;g.translate(pose.x,pose.y);g.rotate(pose.angle);g.scale(pose.fold,1);const size=p.size*pose.scale;g.drawImage(plates[i%plates.length],-size/2,-size*p.aspect/2,size,size*p.aspect);g.restore();
  }
  const alpha=flightStarted?1:smooth((assembly-1350)/500),count=letters.length;
  letters.forEach((plate,i)=>{if(!plate)return;const p=fallingLetterPose(i,count,width,height,beat,flightStarted?elapsed:0),h=Math.min(31,Math.max(16,(width-48)/Math.max(1,count)*1.2)),w=h*plate.width/plate.height;g.save();g.globalAlpha=alpha;g.translate(p.x,p.y);g.rotate(p.angle);g.drawImage(plate,-w/2,-h/2,w,h);g.restore();});
 };
 const frame=now=>{if(closed)return;lastAssembly=now-start;draw(lastAssembly,flightElapsed,lastBeat,lastCamera);if(!flightStarted)raf=requestAnimationFrame(frame);};if(!manual)raf=requestAnimationFrame(frame);
 return {
  assembly(elapsed){if(!closed){lastAssembly=elapsed;draw(elapsed,0,{drop:0,camera:0});}},
  flight(elapsed,beat,scrollY=beat.camera*Math.max(600,height*ARRIVAL_DISTANCE)){if(closed)return;handoffAt??=manual?lastAssembly:Math.max(lastAssembly,performance.now()-start);flightStarted=true;cancelAnimationFrame(raf);flightElapsed=elapsed;lastBeat=beat;lastCamera=scrollY;draw(handoffAt+elapsed,elapsed,beat,scrollY);},
  finish(){closed=true;cancelAnimationFrame(raf);canvas.remove();}
 };
}
