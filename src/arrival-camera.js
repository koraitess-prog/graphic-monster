const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function centeredFormationCamera(scene,width,height){
 const points=scene.shapes.filter(p=>!p.opening).flatMap(p=>p.points),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),scale=Math.min(1.1,width*.74/(x1-x0),height*.72/(y1-y0));
 return {scale,x:width*.5-(x0+x1)*.5*scale,y:height*.47-(y0+y1)*.5*scale};
}
export function formationStartCamera(rect,camera){const scale=Math.max(rect.width/600,rect.height/760);return {scale:scale*camera,x:rect.left+(rect.width-600*scale)/2+300*scale*(1-camera),y:rect.top+(rect.height-760*scale)/2+362*scale*(1-camera)};}
export function interpolateArrivalCamera(a,b,t){const u=ease(t);return Object.fromEntries(['scale','x','y'].map(k=>[k,a[k]+(b[k]-a[k])*u]));}
export function flightViewport(position,beat,origin,landing){const c=interpolateArrivalCamera(origin,landing,beat.drop);return {...c,y:c.y+position.worldY-position.scrollY};}
export function flightViewportMatrix(camera,degrees=0,drift=0){
 const s=camera.scale;if(!degrees)return[s,0,0,s,camera.x+drift,camera.y];
 const a=degrees*Math.PI/180,c=Math.cos(a)*s,n=Math.sin(a)*s;
 return[c,n,-n,c,camera.x+drift+300*s-c*300+n*654,camera.y+654*s-n*300-c*654];
}
export function installArrivalCanvas(renderer,camera){
 const c=renderer.canvas;const origin={camera,style:c.getAttribute?.('style')??null,viewport:renderer.viewport,transparent:renderer.transparent};renderer.arrivalOrigin=origin;
 Object.assign(c.style,{position:'fixed',inset:'auto',left:'0px',top:'0px',width:`${innerWidth}px`,height:`${innerHeight}px`,maxWidth:'none',zIndex:'9',transform:'none'});return origin;
}
export function restoreArrivalCanvas(renderer){
 const origin=renderer.arrivalOrigin;if(!origin)return;
 if(origin.style===null)renderer.canvas.removeAttribute?.('style');else renderer.canvas.setAttribute?.('style',origin.style);
 renderer.viewport=origin.viewport;renderer.transparent=origin.transparent;renderer.arrivalOrigin=null;renderer.resize(renderer.scale);
}
