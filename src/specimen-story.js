import {rng} from './anidoodle-kit.js';
import {normalizeAnswers,encodeDNA} from './dna.js';
const acts={
 typography:['nests in the missing strokes of abandoned alphabets','keeps the names of things it has quietly displaced','listens for a word that nobody remembers speaking','occupies the narrow space inside an unfinished letter','repeats a borrowed name until its meaning comes loose','collects the silences left between badly written warnings'],
 grid:['counts the empty rooms before choosing one to occupy','moves its sleeping place whenever a corner is measured','keeps an exact inventory of things that have vanished','rearranges the same small territory every waking hour','waits at the wrong intersection of two familiar paths','measures visitors against a pattern it refuses to explain'],
 color:['absorbs the faded colors of places left unoccupied','waits beneath the yellow light of an empty stairwell','stores the bruised reflections that other surfaces reject','changes its shade whenever it suspects an observer','follows a stain slowly spreading across an unfamiliar wall','hoards the last warmth of objects that no longer move'],
 shape:['fits its body into gaps that appear too narrow','leaves an unfamiliar outline where its shadow should be','crouches beside doorways that nobody remembers building','folds itself around an absence it carefully protects','waits until a familiar silhouette begins to look wrong','slips through the negative space between two sleeping objects'],
 texture:['cultivates small colonies in the creases of its skin','listens through the crust of surfaces nobody has touched','rubs the same patch until a buried pattern emerges','carries an old terrain beneath its uneven outer coat','collects the dry remains of places it has occupied','sleeps until a disturbance travels through its clustered markings']
};
const order={
 order:['It returns each object to a precise, inexplicable position','It patrols its boundary in an exact, repeating sequence','It guards a ritual whose purpose has outlasted its memory','It arranges its findings with a patient, territorial precision','It permits no interruption while counting its smallest possessions'],
 experiment:['It changes direction before its limbs receive the instruction','It abandons a familiar ritual halfway through each repetition','It relocates its boundaries whenever the surrounding room falls silent','It follows a private sequence that never quite repeats itself','It keeps several incompatible arrangements alive at the same time']
};
const gaze={
 clarity:['One fixed stare follows the smallest disturbance','Its attention settles on one detail for an uncomfortable interval','A heavy eyelid conceals an unusually patient calculation','It watches one empty place as though expecting an arrival','Its gaze arrives before the rest of its body responds'],
 expression:['Its unequal eyes appear to disagree about the observer','Each eye completes its inspection at a different pace','Several small stares continue long after the largest turns away','Its scattered attention catches movements from incompatible directions','One eye remains awake while the others slowly withdraw']
};
const surface={
 minimal:['The vacant skin reveals almost nothing of its habits','A few isolated marks are the only evidence of activity','Most of its surface remains disconcertingly bare and quiet','A sparse set of marks interrupts an otherwise dormant surface','Its empty patches seem more deliberate than its visible markings'],
 rich:['Dense colonies of marks gather around strangely vacant patches','Its crowded surface records a long history of unexplained occupation','Repeated markings cluster as though competing for the same territory','The layered skin resembles a map repeatedly revised from memory','Its dense outer markings continue where a sensible pattern would stop']
};
const ending={
 precise:['It closes the inspection with a barely perceptible recoil','It resumes its watch without acknowledging the interruption','It returns to stillness one careful joint at a time','It waits for everything nearby to become motionless again','It completes the same small movement with an ancient patience'],
 playful:['A brief twitch breaks the stillness several moments too late','Its last limb responds after the encounter appears to have ended','A crooked movement suggests an intention it immediately abandons','It turns away, then checks the observer once more','It holds an awkward pose until the moment feels wrong']
};
export function specimenStory(input,seed=0){
 const a=normalizeAnswers(input);let hash=seed^0x793f71;for(const ch of encodeDNA(a))hash=Math.imul(hash^ch.charCodeAt(0),16777619);
 const random=rng(hash),pick=list=>list[Math.floor(random()*list.length)];
 return `It ${pick(acts[a.principle])}. ${pick(order[a.organization])}. ${pick(gaze[a.gaze])}. ${pick(surface[a.density])}. ${pick(ending[a.attitude])}.`;
}
