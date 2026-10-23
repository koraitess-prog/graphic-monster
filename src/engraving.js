import {printPaperPattern} from './paper-patterns.js';
// A deterministic ink-loss plate: broad worn islands and long carved fibers.
// The plate is independent of pigment so every color shares the same print process.
const plates=new Map();
function hash(x,y,seed){let n=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(seed,1274126177);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function noise(x,y,seed){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);const a=hash(ix,iy,seed),b=hash(ix+1,iy,seed),c=hash(ix,iy+1,seed),d=hash(ix+1,iy+1,seed);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function plate(dense,phase){
 const key=`${dense}/${phase}`;if(plates.has(key))return plates.get(key);
 const size=384,data=new Uint8ClampedArray(size*size*4),seed=phase*97+912;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const cloud=noise(x/83,y/107,seed)*.54+noise(x/26,y/41,seed+1)*.30+noise(x/6,y/9,seed+2)*.16;
  const fiber=noise((x+noise(x/39,y/79,seed+3)*21)/2.1,y/39,seed+4);
  const grit=hash(x,y,seed+5),threshold=dense?.49:.54;
  let alpha=0;
  if(cloud>threshold){
   const depth=Math.min(1,(cloud-threshold)*9);
   if(fiber>.30+depth*.10&&grit>.14)alpha=110+depth*140;
   else if(grit>.78)alpha=170;
  }else if(fiber>.69&&grit>.24)alpha=145;
  else if(grit>.975)alpha=190;
  data[(y*size+x)*4+3]=alpha;
 }
 const result={size,data};plates.set(key,result);return result;
}
export function engravingTile(factory,style){
 const {size,data}=plate(style.texture>.5,style.grainPhase??0);
 const mask=factory(size,size),m=mask.getContext('2d'),pixels=m.createImageData(size,size);pixels.data.set(data);m.putImageData(pixels,0,0);
 const resolution=style.printRevision>=3?1:2;
 const tile=factory(size*resolution,size*resolution),g=tile.getContext('2d');g.scale(resolution,resolution);g.fillStyle=style.color;g.fillRect(0,0,size,size);
 const dark=style.color==='#151a1b';
 printPaperPattern(g,style.paperPattern,dark);
 if(dark){m.globalCompositeOperation='source-in';m.fillStyle='#e8ddba';m.fillRect(0,0,size,size);g.globalAlpha=.22;}
 if(style.printRevision>=3&&!dark)g.globalAlpha=.48;
 g.drawImage(mask,0,0);g.globalAlpha=1;
 // Splintered brayer tracks cut across the plate in coherent bundles.
 let n=8413+(style.grainPhase??0)*93;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
 g.fillStyle=dark?'#e8ddba':'#151a1b';
 for(let bundle=0;bundle<15;bundle++){
  const bx=random()*size,by=random()*size,lean=(random()-.5)*.9,length=35+random()*95;
  for(let j=0;j<9;j++){
   const x=bx+j*1.8+random()*1.5,y=by+random()*22,w=.25+random()*1.8,l=length*(.45+random()*.6);
   g.globalAlpha=(dark?.18:.35+random()*.55)*(style.printRevision>=3?.58:1);g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y-4);g.lineTo(x+lean*l+w*.3,y-l);g.lineTo(x+lean*l-w*.3,y-l*.84);g.closePath();g.fill();
  }
 }
 // Rotate pigment grain per paper fragment; anatomy itself never rotates with it.
 const angle=(style.grainAngle??0)*Math.PI/180;
 const unit=1/resolution;
 return {tile,transform:{a:unit*Math.cos(angle),b:unit*Math.sin(angle),c:-unit*Math.sin(angle),d:unit*Math.cos(angle),e:(style.grainPhase??0)*47,f:(style.grainPhase??0)*31}};
}
