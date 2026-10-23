import {specimenStory} from './specimen-story.js';
import {normalizeAnswers,encodeDNA} from './dna.js';
import {rng} from './anidoodle-kit.js';

// Small, edited narrative units have grammatical roles, rather than adjective slots.
// The five design decisions each supply a different part of the creature's life.
const family={
 typography:{acts:['collects the secret doorways tucked inside ordinary letters','rescues unfinished letters from the corners of old notebooks','listens for the tiny pauses between two handwritten words','builds little shelters from loops nobody remembered to close','keeps the missing pieces of an alphabet under its pillow','finds a new hiding place in every lowercase letter'],places:['between the loops of an unfinished letter','in the margins of a handwritten note','beside a doorway shaped like a lowercase letter'],objects:['a small alphabet of secret doors','a half-finished letter with somewhere to hide','a pocketful of loops from forgotten handwriting']},
 grid:{acts:['arranges fallen pebbles into streets for imaginary visitors','builds tiny neighborhoods for things that have lost their place','measures the distance between a doorstep and a daydream','keeps a little map of where everything might belong','moves small objects until the spaces between them feel right','makes a home for every stray square of paper'],places:['where two imaginary streets happen to meet','beside a carefully arranged village of pebbles','among the rooms of a miniature paper town'],objects:['a tiny map with room for another street','a pebble waiting for its own little address','a folded plan for an impossible neighborhood']},
 color:{acts:['borrows the last warm color from a passing afternoon','keeps a collection of colors that nearly went unnoticed','trades tiny pieces of sunset for interesting new company','follows a trail of reflected color across ordinary rooms','mixes the colors of two places it has never visited','saves the bright edges of otherwise uneventful days'],places:['at the warm edge of a passing afternoon','where two reflected colors quietly meet','beside a puddle holding the afternoon sky'],objects:['a little piece of an unclaimed sunset','a pocketful of colors borrowed from yesterday','a warm reflection looking for somewhere to land']},
 shape:{acts:['follows unfamiliar outlines to see where they might lead','keeps the odd shapes left behind by ordinary shadows','finds tiny shortcuts through the gaps everyone steps over','collects the spaces between things instead of the things themselves','turns a curious corner just to meet its other side','makes small discoveries where a straight path changes its mind'],places:['around the corner of an unfamiliar shadow','in the gap between two ordinary objects','where a straight path quietly changes direction'],objects:['a peculiar shadow waiting to be understood','a little shortcut through an unlikely opening','a new corner in an otherwise familiar room']},
 texture:{acts:['reads the little scratches on things other creatures overlook','keeps a record of places in rubbings and pencil dust','finds old stories in the worn corners of familiar objects','listens to the soft rustle of unfinished pencil marks','collects traces of the hands that have passed this way','follows the grain of a surface like a tiny footpath'],places:['along the grain of a well-loved wooden table','among the soft traces of an unfinished drawing','at the worn corner of a familiar object'],objects:['a little history written in pencil dust','a rubbing of somewhere it hopes to return','a faint scratch with a whole story inside']}
};
const organization={
 order:['gives each discovery a place to come home to','sets its findings down in a patient little rhythm','puts the day’s small surprises into a careful arrangement','makes a quiet plan before taking the next step','returns everything to a place that feels just right'],
 experiment:['rearranges its discoveries whenever a better accident comes along','takes the unlikely route and leaves the map slightly crooked','lets one small detour rearrange the rest of its day','tries the arrangement nobody thought to put together','changes its plans when an interesting accident wanders past']
};
const gaze={
 clarity:['following one bright clue through the noise','keeping its attention on a single small discovery','letting one clear detail lead the way','watching one thing until its secret becomes visible','noticing the exact moment an idea comes into focus'],
 expression:['watching several small mysteries unfold at once','looking at the same discovery from several unlikely angles','letting each eye follow a different possibility','keeping several curious points of view in conversation','spotting a different story in every direction']
};
const surface={
 minimal:['With most of its notebook left beautifully empty','With just a few marks to remember the day','Leaving plenty of silence between its small discoveries','Keeping only the traces it really wants to remember','With a little breathing room around every finding'],
 rich:['With a notebook full of overlapping little traces','Carrying a pocketful of scratches, patterns, and remembered places','With every page wearing the marks of another discovery','Leaving layers of tiny observations wherever it settles','With a rich trail of pencil marks behind it']
};
const attitude={
 precise:['it closes the day with a small, deliberate nod','it puts the final mark exactly where it belongs','it finishes with a quiet gesture that leaves nothing loose','it takes one measured step toward tomorrow’s first discovery','it folds the last corner with particular care'],
 playful:['it waves at the next idea before it arrives','it signs off with a crooked grin and an extravagant wave','it gives the smallest discovery a wonderfully oversized welcome','it takes a bow that almost turns into a dance','it greets tomorrow as though they share a private joke']
};
export const wordCount=text=>text.trim().split(/\s+/u).length;
export function generateLegacyStory(input,seed=0){
 const a=normalizeAnswers(input),code=encodeDNA(a);let hash=(seed>>>0)^0x9e3779b9;for(const ch of code)hash=Math.imul(hash^ch.charCodeAt(0),16777619);
 const random=rng(hash),pick=list=>list[Math.floor(random()*list.length)],f=family[a.principle];
 const act=pick(f.acts),place=pick(f.places),object=pick(f.objects),order=pick(organization[a.organization]),look=pick(gaze[a.gaze]),marks=pick(surface[a.density]),gesture=pick(attitude[a.attitude]);
 const structures=[
  ()=>`It ${act}. It ${order}, ${look}. ${marks}, ${gesture}.`,
  ()=>`Usually found ${place}, this creature ${order}. It ${act}, ${look}. ${marks}, ${gesture}.`,
  ()=>`This creature never leaves home without ${object}. It ${order}, ${look}. ${marks}, ${gesture}.`,
  ()=>`It ${act}. ${marks}, this creature ${order}. You might catch it ${look}, before ${gesture}.`
 ];
 const start=Math.floor(random()*structures.length);
 for(let i=0;i<structures.length;i++){const text=structures[(start+i)%structures.length]();if(wordCount(text)>=35&&wordCount(text)<=55)return text;}
 // Shortest structure is bounded by the edited vocabulary, even for the longest units.
 return structures[0]();
}

export function generateStory(input,seed=0,version=3){return version>=3?specimenStory(input,seed):generateLegacyStory(input,seed);}
