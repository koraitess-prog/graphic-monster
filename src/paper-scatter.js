// Small deterministic physics kernel shared by mouse and touch input.
export function scatterImpulse(paper,pointer,velocity){
 const dx=paper.x-pointer.x,dy=paper.y-pointer.y,radius=Math.max(100,Math.min(190,paper.w*.66)),distance=Math.hypot(dx,dy);
 if(distance>radius)return false;
 const strength=1-distance/radius,n=distance||1;
 paper.vx+=dx/n*(7+strength*11)+velocity.x*.35;paper.vy+=dy/n*(7+strength*11)+velocity.y*.35-3;
 paper.spin+=(dx>=0?1:-1)*(.025+strength*.065);paper.awake=true;return true;
}
export function advancePaper(paper,step,width,height,reduced=false){
 if(!paper.awake||paper.gone)return;
 if(reduced){paper.x+=paper.vx*16;paper.y+=paper.vy*16;}else{
  paper.vx*=.993**step;paper.vy+=.12*step;paper.x+=paper.vx*step;paper.y+=paper.vy*step;paper.angle+=paper.spin*step;paper.spin*=.996**step;
 }
 const margin=Math.max(paper.w,paper.h)*.8;
 if(paper.x<-margin||paper.x>width+margin||paper.y<-margin||paper.y>height+margin)paper.gone=true;
}
