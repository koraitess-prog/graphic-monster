// Short factual display copy. Stored stories remain untouched backups.
export function describeCreature(scene){
 const a=scene.answers??{},legs=scene.shapes.filter(p=>/^(?:extra-)?leg-[^~]+$/.test(p.id)).length,eyes=scene.eyes.length;
 const words=['No','One','Two','Three','Four','Five','Six'];
 const material={typography:'Letter-shaped cuts',grid:'Woven paper',color:'Overlapping color fields',shape:'Open, angular cuts',texture:'Patterned paper'}[a.principle]??'Cut paper';
 return `${words[legs]??legs} legs and ${eyes===1?'one focused eye':eyes+' eyes'}. ${material} with ${a.organization==='experiment'?'asymmetric':'ordered'} proportions. ${a.density==='rich'?'Layered marks':'Sparse marks'} and ${a.attitude==='playful'?'restless':'deliberate'} movements.`;
}
