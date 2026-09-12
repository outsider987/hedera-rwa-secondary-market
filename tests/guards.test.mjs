import assert from 'node:assert/strict';
import { test } from 'node:test';
test('one shared operation lease excludes siblings and stale release cannot unlock another',async()=>{
  const g=await import('../src/lib/guards.ts');let events=0;const unsub=g.subscribeOperation(()=>events++);
  const one=g.acquireOperation();assert.equal(g.getOperationBusy(),true);assert.throws(()=>g.acquireOperation(),/pending/);
  g.assertOperation(one);assert.throws(()=>g.assertOperation(Symbol()),/operation/);
  g.releaseOperation(one);const two=g.acquireOperation();g.releaseOperation(one);
  assert.equal(g.getOperationBusy(),true);g.releaseOperation(two);assert.equal(g.getOperationBusy(),false);
  assert.equal(events,4);unsub();g.assertSession(2,2);assert.throws(()=>g.assertSession(2,3),/Session changed/);
});
