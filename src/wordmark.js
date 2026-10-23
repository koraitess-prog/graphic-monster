import {rng} from './anidoodle-kit.js';
import {C} from './illustrations.js';
let master;
export function drawWordmark(canvas,canvasFactory){
 const factory=canvasFactory??((w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;});
 if(!master){
  const w=1100,h=440,mask=factory(w,h),m=mask.getContext('2d');let size=186;
  do{m.font=`900 ${size}px Georgia, serif`;if(m.measureText('MONSTER').width<1016)break;size--;}while(size>130);
  m.fillStyle='#000';m.fillText('GRAPHIC',32,185);m.fillText('MONSTER',28,387);
  const pixels=m.getImageData(0,0,w,h).data,alpha=(x,y)=>pixels[(Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x)))*4+3];
  master=factory(w,h);const ctx=master.getContext('2d');ctx.fillStyle=C.ink;ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0);ctx.globalCompositeOperation='source-over';
  const r=rng(822);ctx.lineCap='round';
  // Sample actual glyph contours. Hairs grow outward along their local normals,
  // including the counters, rather than forming a rectangular texture overlay.
  for(let y=15;y<h-15;y+=3)for(let x=15;x<w-15;x+=3){
   if(alpha(x,y)<180)continue;
   const nx=alpha(x-3,y)-alpha(x+3,y),ny=alpha(x,y-3)-alpha(x,y+3),d=Math.hypot(nx,ny);
   if(d<140||r()>.82)continue;const length=5+r()*11,ux=nx/d,uy=ny/d;
   ctx.strokeStyle=r()>.22?C.ink:'#626572';ctx.lineWidth=.7+r()*1.1;ctx.beginPath();ctx.moveTo(x-ux*3,y-uy*3);ctx.quadraticCurveTo(x+ux*length*.6-uy*2,y+uy*length*.6+ux*2,x+ux*length,y+uy*length);ctx.stroke();
  }
  const grain=factory(w,h),g=grain.getContext('2d');g.lineCap='round';
  for(let i=0;i<3400;i++){const x=r()*w,y=r()*h;g.strokeStyle=i%4?'#858697':C.cream;g.globalAlpha=.1+r()*.2;g.lineWidth=.45+r()*.8;g.beginPath();g.moveTo(x,y);g.lineTo(x+1+r()*2,y+3+r()*12);g.stroke();}
  g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0);ctx.drawImage(grain,0,0);
 }
 canvas.width=1100;canvas.height=440;canvas.getContext('2d').drawImage(master,0,0);
}
