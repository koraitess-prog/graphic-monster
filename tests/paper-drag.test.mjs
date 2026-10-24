import test from 'node:test';
import assert from 'node:assert/strict';
import {inPaperVortex} from '../src/paper-drag.js';

test('paper is accepted only inside the visible central vortex, on phone and desktop',()=>{
 for(const rect of [{left:16,top:135,width:343,height:360},{left:382,top:79,width:500,height:382}]){
  const x=rect.left+rect.width/2,y=rect.top+rect.height/2;
  assert.equal(inPaperVortex(x,y,rect),true);
  assert.equal(inPaperVortex(rect.left,rect.top,rect),false);
  assert.equal(inPaperVortex(x,rect.top+rect.height+100,rect),false);
  assert.equal(inPaperVortex(rect.left+rect.width+50,y,rect),false);
 }
});
