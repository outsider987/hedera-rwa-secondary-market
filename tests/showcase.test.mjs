import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
test('showcase retains exact observed T05 evidence and binds all four verified T08 timelines to recorded proofs',()=>{
 const v=JSON.parse(readFileSync(new URL('../src/showcase.json',import.meta.url))),actual=JSON.parse(readFileSync(new URL('../docs/evidence/032-t05-manual.json',import.meta.url)));
 assert.equal(v.historical.recordedAt,actual.finalAcceptance.recordedAt);assert.equal(v.historical.block,actual.finalAcceptance.finalBlock);
 assert.deepEqual(v.historical.timeline.map(t=>t.hash),['deployment','lock','settlement'].map(k=>actual[k].transactionHash));
 const manual=JSON.parse(readFileSync(new URL('../docs/evidence/038-t08-manual.json',import.meta.url)));
 assert.equal(v.recordedAt,manual.recordedAt);assert.equal(v.cases.length,4);
 for(const c of v.cases){const evidence=manual.cases.find(a=>a.id===c.id);assert.equal(c.status,evidence.status);assert.equal(c.matchId,evidence.settlement.id);assert.equal(c.timeline.length,3);for(const t of c.timeline){const proof=evidence.evidence.find(e=>e.hash===t.hash);assert.ok(proof);for(const [k,val] of Object.entries(t))assert.deepEqual(val,proof[k]);assert.deepEqual(Object.keys(t).sort(),['action','after','before','block','feeTinybars','hash','principalTinybars','timestamp']);}}
 const source=readFileSync(new URL('../src/showcase.tsx',import.meta.url),'utf8');assert.doesNotMatch(source,/fetch\(|ethereum|wagmi|\.\/wallet|\.\/settlement|\/api\//);
});
