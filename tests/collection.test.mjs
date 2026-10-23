import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCollectionRoute,identityTraits,windowMarkup} from '../src/collection-screen.js';
import {generateMonster} from '../src/dna.js';
const answers={principle:'shape',organization:'experiment',gaze:'expression',density:'rich',attitude:'playful'};
test('collection routes preserve encoded identities and reject malformed escapes',()=>{
 assert.equal(parseCollectionRoute('#dna=01110'),null);
 assert.equal(parseCollectionRoute('#archive').type,'archive');
 assert.equal(parseCollectionRoute('#creature='+encodeURIComponent('odd / שלום')).id,'odd / שלום');
 assert.equal(parseCollectionRoute('#creature=%').type,'missing');
});
test('profile identity and window rendering preserve saved records and escape names',()=>{
 const record={id:'original-1',name:'<Moss & friends>',answers,scene:generateMonster(answers),story:{text:'Original story.'}};
 const before=structuredClone(record),traits=identityTraits(record),markup=windowMarkup([record]);
 assert.deepEqual(traits.map(t=>t.label),['Shape','Experiment','Expression','Rich','Playful']);
 assert.match(markup,/&lt;Moss &amp; friends&gt;/);assert.equal((markup.match(/<canvas /g)||[]).length,1);
 assert.equal((markup.match(/data-specimen=/g)||[]).length,1);assert.deepEqual(record,before);
});
