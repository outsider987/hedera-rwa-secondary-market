import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
test('showcase retains exact observed T05 evidence and never calls planned T08 cases verified',()=>{
 const v=JSON.parse(readFileSync(new URL('../src/showcase.json',import.meta.url))),actual=JSON.parse(readFileSync(new URL('../docs/evidence/032-t05-manual.json',import.meta.url)));
 assert.equal(v.recordedAt,actual.finalAcceptance.recordedAt);assert.equal(v.historical.block,actual.finalAcceptance.finalBlock);
 assert.deepEqual(v.historical.timeline.map(t=>t.hash),['deployment','lock','settlement'].map(k=>actual[k].transactionHash));
 assert.equal(v.cases.length,4);for(const c of v.cases){assert.equal(c.status,'Pending manual acceptance');assert.deepEqual(c.timeline,[]);assert.deepEqual(Object.keys(c).sort(),['id','quantity','status','timeline','title','unitPriceHBAR']);}
 const source=readFileSync(new URL('../src/showcase.tsx',import.meta.url),'utf8');assert.doesNotMatch(source,/fetch\(|ethereum|wagmi|\.\/wallet|\.\/settlement|\/api\//);
});
