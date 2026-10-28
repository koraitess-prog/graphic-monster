// A design personality, derived from answers. Saved artwork and original stories stay intact.
export function describeCreature(scene){
 const a=scene.answers??{},playful=a.attitude==='playful',rich=a.density==='rich';
 const kind={'form-type':'typographic','form-grid':'modular','form-shape':'angular'}[a.construction]??{typography:'typographic',grid:'modular',color:'chromatic',shape:'angular',texture:'ink-stained'}[a.principle]??'paper';
 const printed=a.surface==='grain'||(!a.surface&&a.principle!=='color');
 const skin=printed?(rich?'wearing layers of printed scratches':'wearing a few stubborn ink marks'):(rich?'stitched from overlapping color patches':'cut from bold, quiet color planes');
 const gaze=a.gaze==='clarity'?'a fixed stare':'wandering eyes';
 const habit=a.organization==='experiment'?'keeps rearranging its lopsided silhouette':'guards every alignment';
 const personality=playful?(rich?'It hoards details and never stays inside the margins.':'It saves its empty space for sudden mischief.'):(rich?'Every scratch belongs to an obsessive little system.':'It leaves nothing extra, including a spare gesture.');
 return `A ${playful?'restless':'watchful'} ${kind} creature ${skin}. With ${gaze}, it ${habit}. ${personality}`;
}
