// Two independent decisions: form language and surface treatment.
export const MATERIAL_QUESTIONS=[
 {key:'construction',title:'Choose a form language',options:[['form-type','Letterforms',''],['form-grid','Built structure',''],['form-shape','Free contour','']]},
 {key:'surface',title:'Choose a surface',options:[['pigment','Color fields',''],['grain','Printed texture','']]}
];
export function materialQuestion(answers={}){return MATERIAL_QUESTIONS[answers.construction?1:0];}
export function materialPrinciple(construction,surface){
 const map={'form-type':{pigment:'typography',grain:'typography'},'form-grid':{pigment:'color',grain:'grid'},'form-shape':{pigment:'shape',grain:'texture'}};
 return map[construction]?.[surface]??null;
}
export function materialHashSuffix(a){return a.construction&&a.surface?'&form='+a.construction+'&surface='+a.surface:'';}
// Compatibility with discarded group-navigation drafts.
export function nextMaterialRoute(){return null;}
export function restoreMaterialRoute(){return [];}
