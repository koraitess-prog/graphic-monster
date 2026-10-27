// Presentation-only decision tree. Leaves are the existing five DNA values.
const option=(value,label)=>[value,label,''];
export function materialQuestion(route=[]){
 const common={key:'principle',title:'Choose a material',chapter:'Paper language'};
 if(route[0]==='built')return {...common,options:[option('typography','Letter fragments'),option('grid','Woven strips')]};
 if(route[0]==='sensory'&&route[1]==='marks')return {...common,options:[option('shape','Open contour'),option('texture','Dry rubbing')]};
 if(route[0]==='sensory')return {...common,options:[option('color','Overprinted color'),option('route-marks','Contour and grain')]};
 return {...common,options:[option('route-built','Letters and structure'),option('route-sensory','Pigment and surface')]};
}
export function nextMaterialRoute(route,value){
 if(value==='route-built'&&!route.length)return ['built'];
 if(value==='route-sensory'&&!route.length)return ['sensory'];
 if(value==='route-marks'&&route[0]==='sensory'&&route.length===1)return ['sensory','marks'];
 return null;
}
export function restoreMaterialRoute(raw){try{const v=JSON.parse(raw);if(JSON.stringify(v)==='["built"]'||JSON.stringify(v)==='["sensory"]'||JSON.stringify(v)==='["sensory","marks"]')return v;}catch{}return [];}
