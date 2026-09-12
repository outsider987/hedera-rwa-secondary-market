import assert from 'node:assert/strict';
import {test} from 'node:test';
import {isTradingOrigin} from '../src/lib/runtime.ts';
test('trading requires a production build at the exact configured HTTPS origin',()=>{
 for(const [origin,production,configured,expected] of [
  ['http://127.0.0.1:4173',true,undefined,true],['http://127.0.0.1:5173',false,undefined,false],
  ['https://holdbook.example',true,'https://holdbook.example',true],
  ['https://preview.example',true,'https://holdbook.example',false],
  ['https://holdbook.example',false,'https://holdbook.example',false],
  ['http://holdbook.example',true,'http://holdbook.example',false],
  ['https://holdbook.example/',true,'https://holdbook.example/',false],
  ['invalid',true,'invalid',false],
 ]) assert.equal(isTradingOrigin(origin,production,configured),expected);
});

test('API URLs retain the local proxy or use an explicit HTTPS origin',async()=>{
 const {apiURL}=await import('../src/lib/runtime.ts');
 assert.equal(apiURL('market',''),'/api/market');
 assert.equal(apiURL('market','https://holdbook.run.app'),'https://holdbook.run.app/api/market');
 for(const invalid of ['http://holdbook.run.app','https://holdbook.run.app/','https://u:p@holdbook.run.app'])assert.throws(()=>apiURL('market',invalid));
});
