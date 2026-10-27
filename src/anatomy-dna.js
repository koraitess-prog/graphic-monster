// Version-seven anatomy is a consequence of answers, never of the random seed.
// These coefficients also map the motion rig, keeping every joint attached.
export const ANSWER_FAMILIES=Object.freeze({
 typography:{order:'typography',experiment:'crane'},
 grid:{order:'grid',experiment:'accordion'},
 color:{order:'color',experiment:'knot'},
 shape:{order:'shape',experiment:'crane'},
 texture:{order:'texture',experiment:'knot'}
});
export function anatomyFromAnswers(a){return ANSWER_FAMILIES[a.principle][a.organization];}
export function designParameters(a){
 return {width:({typography:.86,grid:1.02,color:1.12,shape:.96,texture:1.06}[a.principle])*(a.gaze==='expression'?1.07:.96),lean:a.organization==='experiment'?.048:-.008,top:a.density==='rich'?66:101,hip:490+(a.attitude==='playful'?-49:20)+(a.density==='rich'?-10:7),fitX:1,fitY:1,offsetX:0,offsetY:0};
}
export function mapDesignPoint([x,y],p){
 const yy=y<490?p.top+(y-60)*(p.hip-p.top)/430:p.hip+(y-490)*(668-p.hip)/178;
 return [(300+(x-300)*p.width+(668-y)*p.lean)*p.fitX+p.offsetX,yy*p.fitY+p.offsetY];
}
export function fitDesignParameters(scene,parameters){
 // Carriers are authored anatomy. Printed cuts may vary, but never set the fit.
 const carriers=scene.shapes.filter(s=>s.carrier),points=(carriers.length?carriers:scene.shapes).flatMap(s=>s.points).map(p=>mapDesignPoint(p,parameters));
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const fitX=Math.min(1,508/(maxX-minX)),fitY=Math.min(1,615/(maxY-minY));
 const offsetX=300-(minX+maxX)/2*fitX;
 const offsetY=minY*fitY<65?65-minY*fitY:maxY*fitY>682?682-maxY*fitY:0;
 return {...parameters,fitX,fitY,offsetX,offsetY};
}
