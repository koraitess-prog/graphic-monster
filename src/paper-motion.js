// Material coordinates stay on the authored paper, rather than on the canvas.
export function paperAffine(a,b,indices){
 const [i,j,k]=indices,p=a[i],q=a[j],r=a[k],u=b[i],v=b[j],w=b[k];
 const x=q[0]-p[0],y=q[1]-p[1],z=r[0]-p[0],h=r[1]-p[1],det=x*h-y*z;
 if(Math.abs(det)<1e-8)return null;
 const A=((v[0]-u[0])*h-(w[0]-u[0])*y)/det,B=((v[1]-u[1])*h-(w[1]-u[1])*y)/det;
 const C=((w[0]-u[0])*x-(v[0]-u[0])*z)/det,D=((w[1]-u[1])*x-(v[1]-u[1])*z)/det;
 return [A,B,C,D,u[0]-A*p[0]-C*p[1],u[1]-B*p[0]-D*p[1]];
}
export const paperPoint=([a,b,c,d,e,f],[x,y])=>[a*x+c*y+e,b*x+d*y+f];
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const meshes=new WeakMap();
export function paperBasis(points){
 let j=1,k=2;
 for(let i=1;i<points.length;i++)if(Math.hypot(points[i][0]-points[0][0],points[i][1]-points[0][1])>Math.hypot(points[j][0]-points[0][0],points[j][1]-points[0][1]))j=i;
 for(let i=1;i<points.length;i++)if(Math.abs(cross(points[0],points[j],points[i]))>Math.abs(cross(points[0],points[j],points[k])))k=i;
 return [0,j,k];
}
// A regular material grid also covers folded/self-overlapping paper contours.
export function paperGrid(points){
 if(meshes.has(points))return meshes.get(points);
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.min(...xs)-1,y=Math.min(...ys)-1;
 const cols=Math.ceil((Math.max(...xs)-x+1)/20),rows=Math.ceil((Math.max(...ys)-y+1)/20),rest=[],triangles=[];
 for(let v=0;v<=rows;v++)for(let u=0;u<=cols;u++)rest.push([x+u*20,y+v*20]);
 for(let v=0;v<rows;v++)for(let u=0;u<cols;u++){const i=v*(cols+1)+u;triangles.push([i,i+1,i+cols+2],[i,i+cols+2,i+cols+1]);}
 const grid={rest,triangles};meshes.set(points,grid);return grid;
}
