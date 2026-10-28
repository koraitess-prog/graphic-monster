// Design interpretation for display; archived scenes and stored stories stay intact.
export function describeCreature(scene){
 const a=scene.answers??{};
 const language={'form-type':'Letterforms','form-grid':'Modular structure','form-shape':'Free contours'}[a.construction]??{typography:'Typography',grid:'Modular repetition',color:'Contrasting color fields',shape:'Angular forms and open counters',texture:'Repeated surface marks'}[a.principle]??'Cut-paper forms';
 const composition=a.organization==='experiment'?'An asymmetric composition':'An ordered composition';
 const focus=a.gaze==='clarity'?'A clear focal point':'Multiple focal points';
 const surface=a.surface?`${a.density==='rich'?'layered':'sparse'} ${a.surface==='grain'?'printed textures':'color fields'}`:a.density==='rich'?'layered textures':'generous negative space';
 const gesture=a.attitude==='playful'?'Loose, irregular gestures create a playful rhythm.':'Controlled gestures keep the rhythm precise.';
 return `${composition} emphasizes ${language.toLowerCase()}. ${focus} and ${surface} shape the visual hierarchy. ${gesture}`;
}
