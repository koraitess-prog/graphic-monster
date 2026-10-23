// Every paper fragment shares its carrier's motion, including the printed grain.
export function paperLivingPose(scene,t,event=0){
 if(t<=0||t>=1)return scene;
 const envelope=Math.sin(Math.PI*t)**2,direction=(scene.seed+event)%2?1:-1;
 const profile={crane:[.006,-1.7],color:[-.004,1.5],grid:[.003,-.4],accordion:[-.004,1.2],shape:[.005,-.8],texture:[-.003,.7],knot:[.006,.6]}[scene.anatomy]??[.003,0];
 const angle=profile[0]*envelope*direction,c=Math.cos(angle),s=Math.sin(angle),stretch=scene.anatomy==='accordion'?1+.007*envelope:1;
 const move=([x,y])=>{const u=x-300,v=(y-655)*stretch;return [300+u*c-v*s,655+u*s+v*c+profile[1]*envelope];};
 const part=p=>({...p,paperRestPoints:p.points,points:p.points.map(move)}),shapes=scene.shapes.map(part);
 return {...scene,shapes,lines:scene.lines.map(part),body:shapes.find(p=>p.id==='body').points,attachments:scene.attachments.map(a=>({...a,root:move(a.root)})),eyes:scene.eyes.map((e,i)=>{const [x,y]=move([e.x,e.y]),at=.26+(i*.137+event*.071)%.56;return {...e,x,y,angle:(e.angle??0)+angle,blink:Math.max(0,1-Math.abs(t-at)/(i?.035:.10)),gaze:[e.gaze[0]+envelope*direction,e.gaze[1]]};})};
}
