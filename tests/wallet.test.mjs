import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bindingProblem, loadRoles, rolesStorageKey, saveRoles, validateMirrorAccount } from '../src/guards.ts';

// Synthetic public addresses only. No signer, real account or chain request.
const a = `0x${'a'.repeat(40)}`;
const b = `0x${'b'.repeat(40)}`;
const record = { evm_address: a, account: '0.0.101', deleted: false };
const current = validateMirrorAccount(a, record);

test('Mirror accepts only a matching EVM address, canonical Hedera ID and explicitly live account', () => {
  assert.deepEqual(validateMirrorAccount(a.toUpperCase(), { ...record, ignored: 'not exported' }), current);
  assert.deepEqual(Object.keys(current), ['address', 'accountId']);
  for (const value of [null, [], {}, { ...record, evm_address: b }, { ...record, deleted: true },
    { ...record, deleted: undefined }, ...['0.0.0', '0.0.01', '1.0.101', '0.0.-1', '0.0.1.2', '0.0.1\n', 101].map(account => ({ ...record, account }))]) {
    assert.throws(() => validateMirrorAccount(a, value));
  }
  assert.throws(() => validateMirrorAccount('not-an-address', record));
  assert.equal(validateMirrorAccount(a, { ...record, account: '0.0.9007199254740993' }).accountId, '0.0.9007199254740993');
});

test('role binding rejects replacement, duplicate address/ID and unverified saved accounts', () => {
  const roles = { Admin: a };
  const verified = new Map([[a, current]]);
  assert.match(bindingProblem('Admin', current, roles, verified), /Clear/);
  assert.match(bindingProblem('Seller', undefined, roles, verified), /Verify/);
  assert.match(bindingProblem('Seller', { ...current, address: a.toUpperCase() }, roles, verified), /already assigned/);
  assert.match(bindingProblem('Seller', { ...current, address: b }, roles, verified), /Hedera ID/);
  assert.match(bindingProblem('Seller', { address: b, accountId: '0.0.102' }, roles, new Map()), /Wait/);
  assert.equal(bindingProblem('Seller', { address: b, accountId: '0.0.102' }, roles, verified), undefined);
  assert.match(bindingProblem('Buyer', { address: `0x${'c'.repeat(40)}`, accountId: '0.0.103' },
    { Admin: a, Seller: b }, new Map([[a, current], [b, { ...current, address: b }]])), /Saved roles share/);
});

test('storage failures stay in memory; persisted payload contains only role addresses', () => {
  let text = null;
  const storage = { getItem: key => { assert.equal(key, rolesStorageKey); return text; },
    setItem: (key, value) => { assert.equal(key, rolesStorageKey); text = value; } };
  assert.deepEqual(loadRoles(() => storage), { roles: {}, warning: '' });
  assert.equal(saveRoles({ Admin: a, Seller: b, wallet: { private: 'synthetic excluded field' } }, () => storage), true);
  assert.deepEqual(JSON.parse(text), { Admin: a, Seller: b });
  assert.deepEqual(loadRoles(() => storage), { roles: { Admin: a, Seller: b }, warning: '' });
  assert.equal(saveRoles({}, () => storage), true);
  assert.equal(text, '{}');
  for (const invalid of ['{', 'null', '[]', '{"Admin":"bad"}', JSON.stringify({ Admin: a, Seller: a.toUpperCase() }), JSON.stringify({ unknown: a })]) {
    text = invalid;
    const result = loadRoles(() => storage);
    assert.deepEqual(result.roles, {});
    assert.match(result.warning, /Storage unavailable or invalid/);
  }
  const denied = () => { throw new Error('synthetic storage denial'); };
  assert.deepEqual(loadRoles(denied).roles, {});
  assert.equal(saveRoles({ Admin: a }, denied), false);
  assert.equal(saveRoles({ Admin: a }, () => ({ setItem: denied })), false);
  assert.match(loadRoles(() => ({ getItem: denied })).warning, /Storage unavailable/);
});

test('wallet review binds explicit Seller or Admin signer in both wagmi and provider',async(t)=>{
 const {registerHooks}=await import('node:module');const hook=registerHooks({resolve(s,c,n){return n(s.startsWith('./')&&c.parentURL?.includes('/src/')&&!s.endsWith('.ts')?new URL(s+'.ts',c.parentURL).href:s,c)}});t.after(()=>hook.deregister());
 const w=await import('../src/wallet.ts');const roles={Admin:a,Seller:b,Buyer:'0x'+'c'.repeat(40)};let selected=b,chain='0x128';
 const provider={isMetaMask:true,request:async({method})=>method==='eth_accounts'?[selected]:method==='eth_chainId'?chain:Promise.reject(Error('Unexpected wallet method'))};
 const original=w.walletConfig.state;t.after(()=>w.walletConfig.setState(original));
 const select=(address,id=296)=>w.walletConfig.setState({...w.walletConfig.state,status:'connected',current:'synthetic',connections:new Map([['synthetic',{accounts:[address],chainId:id,connector:{getProvider:async()=>provider}}]])});select(b);
 t.mock.method(globalThis,'fetch',async(url)=>{const address=String(url).split('/accounts/')[1].split('?')[0];return Response.json({evm_address:address,account:'0.0.'+(Object.values(roles).indexOf(address)+101),deleted:false})});
 const review=await w.reviewWallet(roles,new AbortController().signal,'Seller');assert.equal(review.expectedRole,'Seller');await w.checkWalletReview(review);
 await assert.rejects(w.reviewWallet(roles,new AbortController().signal),/Admin/);
 selected=a;await assert.rejects(w.checkWalletReview(review),/changed/);selected=b;chain='0x1';await assert.rejects(w.checkWalletReview(review),/changed/);
 chain='0x128';select(a);await assert.rejects(w.checkWalletReview(review),/Session changed/);selected=a;
 const admin=await w.reviewWallet(roles,new AbortController().signal);assert.equal(admin.expectedRole,'Admin');await w.checkWalletReview(admin);
 await assert.rejects(w.checkWalletReview({...admin,expectedRole:'Seller'}),/Seller/);await assert.rejects(w.checkWalletReview({...admin,expectedRole:'other'}),/Invalid/);
 select(a,1);await assert.rejects(w.checkWalletReview(admin),/Session changed/);
});
