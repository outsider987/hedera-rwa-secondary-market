// Public source verification only. Never signs, deploys or sends a chain transaction.
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdirSync, realpathSync} from 'node:fs';
import {resolve, dirname, sep} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {keccak256, toUtf8Bytes} from 'ethers';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const SERVER='https://sourcify.dev/server';
const TARGETS={
  settlement:{name:'NovaSettlement',address:'0xa90da61f67c37473f38000e70623a77ad277304c',creationTransactionHash:'0xf0448adc0a4d1f76777cec55f0151c8a86e7bcb6b8b58de7a94f9179dbc6d0d0'},
  swap:{name:'NovaHbarSwap',address:'0xf6fc50413cd10d0e82a2f3c30b5bf6878a45f158',creationTransactionHash:'0xd9d9f59e4b91e0f6483585e698f5325c8079ad4112a11807100708a61183faa4'},
};

export function allowedSource(name) {
  assert.equal(typeof name,'string');
  assert.ok(!name.split('/').includes('..') && !name.includes('\\'));
  assert.ok(/^contracts\/Nova(?:Settlement|HbarSwap)\.sol$/.test(name)
    || /^node_modules\/@hashgraph\/asset-tokenization-contracts\/contracts\/[A-Za-z0-9_/-]+\.sol$/.test(name)
    || /^node_modules\/@openzeppelin\/contracts\/[A-Za-z0-9_/-]+\.sol$/.test(name), 'Non-public source path rejected');
  return name;
}

export function maskImmutable(code, references={}) {
  assert.match(code,/^0x(?:[0-9a-fA-F]{2})+$/);
  let result=code.slice(2).toLowerCase();
  for(const ref of Object.values(references).flat()) {
    assert.ok(Number.isSafeInteger(ref.start) && ref.start>=0 && ref.length===32);
    const begin=ref.start*2,end=begin+ref.length*2;
    assert.ok(end<=result.length);
    result=result.slice(0,begin)+'0'.repeat(ref.length*2)+result.slice(end);
  }
  return result;
}

export function makePayload(artifact,target,readSource) {
  const metadata=typeof artifact.metadata==='string'?JSON.parse(artifact.metadata):artifact.metadata;
  assert.match(metadata.compiler.version,/^0\.8\.36\+commit\./);
  assert.equal(metadata.settings.evmVersion,'paris');
  assert.deepEqual(metadata.settings.compilationTarget,{[`contracts/${target.name}.sol`]:target.name});
  assert.deepEqual(metadata.settings.optimizer,{enabled:true,runs:200});
  assert.equal(metadata.settings.metadata.bytecodeHash,'none');
  assert.equal(metadata.settings.metadata.appendCBOR,false);
  const sources={};
  for(const [name,details] of Object.entries(metadata.sources)) {
    const content=readSource(allowedSource(name));
    assert.equal(keccak256(toUtf8Bytes(content)),details.keccak256,`Source hash mismatch: ${name}`);
    sources[name]=content;
  }
  return {sources,metadata,creationTransactionHash:target.creationTransactionHash};
}

async function jsonRequest(url,options={}) {
  const response=await fetch(url,{...options,redirect:'error',signal:AbortSignal.timeout(45000)});
  assert.match(response.headers.get('content-type')??'',/application\/json/,'Expected JSON');
  return {status:response.status,body:await response.json()};
}

async function rpc(method,params) {
  assert.ok(['eth_chainId','eth_getCode'].includes(method),'Mutation RPC prohibited');
  const r=await jsonRequest('https://testnet.hashio.io/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
  assert.equal(r.status,200); assert.ok(!r.body.error,'Read-only RPC failed');
  return r.body.result;
}

async function main() {
  const args=process.argv.slice(2),key=args[0],target=TARGETS[key];
  assert.ok(target,'Choose settlement or swap');
  const outIndex=args.indexOf('--out-dir');
  assert.ok(outIndex>=0 && args[outIndex+1],'Explicit scratch output directory required');
  const out=resolve(args[outIndex+1]); mkdirSync(out,{recursive:true});
  const artifact=JSON.parse(readFileSync(resolve(ROOT,`.artifacts/swap/out/${target.name}.sol/${target.name}.json`),'utf8'));
  const payload=makePayload(artifact,target,name=>{
    const path=realpathSync(resolve(ROOT,name));
    assert.ok(path.startsWith(ROOT+sep),'Source outside repository rejected');
    return readFileSync(path,'utf8');
  });
  assert.equal(await rpc('eth_chainId',[]),'0x128');
  const runtime=await rpc('eth_getCode',[target.address,'latest']);
  assert.equal(maskImmutable(runtime,artifact.deployedBytecode.immutableReferences),maskImmutable(artifact.deployedBytecode.object,artifact.deployedBytecode.immutableReferences),'Deployed runtime mismatch');
  const requestText=JSON.stringify(payload);
  writeFileSync(resolve(out,`${key}-request.json`),requestText+'\n');
  const record={recordedAt:new Date().toISOString(),chainId:296,...target,compiler:payload.metadata.compiler.version,sourceFiles:Object.keys(payload.sources),payloadSha256:createHash('sha256').update(requestText).digest('hex'),runtimeMatchWithDeclaredImmutables:true,sourceHashesVerified:true,submitted:false};
  const save=()=>writeFileSync(resolve(out,`${key}-result.json`),JSON.stringify(record,null,2)+'\n');
  save();
  record.lookupBefore=await jsonRequest(`${SERVER}/v2/contract/296/${target.address}`); save();
  if(args.includes('--submit') && !record.lookupBefore.body.runtimeMatch) {
    record.submission=await jsonRequest(`${SERVER}/v2/verify/metadata/296/${target.address}`,{method:'POST',headers:{'Content-Type':'application/json'},body:requestText});
    record.submitted=true; save();
    console.log(JSON.stringify({target:key,status:record.submission.status,response:record.submission.body}));
    const id=record.submission.body.verificationId;
    if(id) {
      assert.match(id,/^[a-zA-Z0-9-]+$/);
      record.jobId=id;
      for(let attempt=0;attempt<24;attempt++) {
        await new Promise(resolve=>setTimeout(resolve,5000));
        record.job=await jsonRequest(`${SERVER}/v2/verify/${id}`); save();
        if(record.job.body.isJobCompleted===true || record.job.body.status==='completed') break;
      }
    }
  }
  record.lookupAfter=await jsonRequest(`${SERVER}/v2/contract/296/${target.address}`); save();
  console.log(JSON.stringify(record,null,2));
  if(args.includes('--submit')) assert.ok(record.lookupAfter.body.runtimeMatch,'Source verification is not confirmed');
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
