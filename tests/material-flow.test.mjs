import test from 'node:test';
import assert from 'node:assert/strict';
import {materialQuestion,nextMaterialRoute,restoreMaterialRoute} from '../src/material-flow.js';
import {encodeDNA,decodeDNA} from '../src/dna.js';
test('binary material exploration reaches each original DNA value once',()=>{
 const leaves=[],visit=route=>{const q=materialQuestion(route);assert.equal(q.options.length,2);for(const[value]of q.options){const next=nextMaterialRoute(route,value);if(next)visit(next);else leaves.push(value);}};visit([]);
 assert.deepEqual(leaves,['typography','grid','color','shape','texture']);
 for(const principle of leaves){const code=encodeDNA({principle});assert.equal(decodeDNA(code).principle,principle);}
});
test('route resume accepts only valid branches and leaves saved DNA untouched',()=>{
 for(const route of [[],['built'],['sensory'],['sensory','marks']])assert.deepEqual(restoreMaterialRoute(JSON.stringify(route)),route);
 assert.deepEqual(restoreMaterialRoute('["bad"]'),[]);assert.deepEqual(restoreMaterialRoute('broken'),[]);
});
