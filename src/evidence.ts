export type CredentialEvidenceInput = { digest: string; issuer: string; subject: string;
  validFrom: string; validUntil: string; verified: boolean; verifier: boolean;
  negatives?: { expired: boolean; tampered: boolean; wrongSubject: boolean } };
export function credentialEvidence(input: CredentialEvidenceInput) {
  if (!/^0x[\da-f]{64}$/i.test(input.digest)
    || ![input.issuer, input.subject].every(did => /^did:ethr:0x[\da-f]{40}$/i.test(did))
    || ![input.validFrom, input.validUntil].every(date => Number.isFinite(Date.parse(date)))
    || typeof input.verified !== 'boolean' || typeof input.verifier !== 'boolean') throw new Error('Invalid public credential evidence.');
  return { schemaVersion: 1, kind: 'credential-verification' as const, chainId: 296,
    checkedAt: new Date().toISOString(), digest: input.digest, issuer: input.issuer, subject: input.subject,
    validFrom: input.validFrom, validUntil: input.validUntil, verified: input.verified, verifier: input.verifier,
    ...(input.negatives ? { negatives: { expired: input.negatives.expired === true,
      tampered: input.negatives.tampered === true, wrongSubject: input.negatives.wrongSubject === true } } : {}) };
}
export function downloadEvidence(value: ReturnType<typeof credentialEvidence> | NovaRecord | LifecycleRecord | HoldRecord | TradeRecord) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value.kind === 't05-transaction' || value.kind === 't05-simulation' ? tradeEvidence(value) : value.kind === 't04-transaction' || value.kind === 't04-simulation' ? holdEvidence(value) : value.kind === 't03' ? lifecycleEvidence(value) : value.kind === 'nova-create' ? novaEvidence(value) : credentialEvidence(value), null, 2) + '\n'], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'holdbook-public-evidence.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const novaStatuses = ['awaiting-signature', 'rejected', 'pending', 'unknown', 'confirmed', 'mirror-pending', 'mismatch', 'complete'] as const;
export type NovaStatus = typeof novaStatuses[number];
export type Comparison = { field: string; expected: string; actual: string; source: string; matches: boolean };
export type NovaRecord = { schemaVersion: 1; kind: 'nova-create'; chainId: 296; operationId: string; startedAt: string;
  admin: string; configVersion: number; calldataDigest: string; status: NovaStatus; credentialDigest?: string;
  transactionHash?: string; securityAddress?: string; securityId?: string; transactionId?: string;
  consensusTimestamp?: string; readBlock?: string; hashScanLink?: string; comparisons?: Comparison[] };
export function novaEvidence(value: NovaRecord): NovaRecord {
  if (!value || value.schemaVersion !== 1 || value.kind !== 'nova-create' || value.chainId !== 296
    || !novaStatuses.includes(value.status) || !/^0x[\da-f]{40}$/i.test(value.admin)
    || !/^0x[\da-f]{64}$/i.test(value.calldataDigest) || !Number.isSafeInteger(value.configVersion) || value.configVersion < 1
    || typeof value.operationId !== 'string' || !/^[\w-]{1,100}$/.test(value.operationId)
    || !Number.isFinite(Date.parse(value.startedAt))) throw new Error('Invalid saved NOVA operation. Check MetaMask and recover by hash.');
  const result: NovaRecord = { schemaVersion: 1, kind: 'nova-create', chainId: 296, operationId: value.operationId,
    startedAt: value.startedAt, admin: value.admin.toLowerCase(), configVersion: value.configVersion,
    calldataDigest: value.calldataDigest, status: value.status };
  for (const [key, pattern] of Object.entries({ credentialDigest: /^0x[\da-f]{64}$/i, transactionHash: /^0x[\da-f]{64}$/i,
    securityAddress: /^0x[\da-f]{40}$/i, securityId: /^0\.0\.[1-9]\d*$/, transactionId: /^0\.0\.[1-9]\d*-\d+-\d+$/,
    consensusTimestamp: /^\d+\.\d{9}$/, readBlock: /^\d+$/ })) {
    const field = key as keyof NovaRecord, item = value[field];
    if (item !== undefined) {
      if (typeof item !== 'string' || !pattern.test(item)) throw new Error('Invalid public NOVA evidence field.');
      Object.assign(result, { [key]: item });
    }
  }
  if (value.comparisons) result.comparisons = value.comparisons.map(row => {
    if (![row.field, row.expected, row.actual, row.source].every(text => typeof text === 'string' && text.length <= 1000)
      || typeof row.matches !== 'boolean') throw new Error('Invalid public comparison.');
    return { field: row.field, expected: row.expected, actual: row.actual, source: row.source, matches: row.matches };
  });
  if (result.transactionHash) result.hashScanLink = 'https://hashscan.io/testnet/transaction/' + result.transactionHash;
  return result;
}

export const lifecycleActions = ['issuer-role', 'ssi-role', 'kyc-role', 'register-issuer', 'seller-kyc', 'issue'] as const;
export type LifecycleAction = typeof lifecycleActions[number];
export type KycState = { status: number; vcId: string; issuer: string; validFrom: string; validTo: string };
export type LifecycleState = { block: string; timestamp: string; roles: boolean[]; issuer: boolean;
  supply: string; sellerBalance: string; buyerBalance: string; sellerHeld: string; buyerHeld: string;
  sellerKyc: KycState; buyerKyc: KycState };
export type KycInput = { vcId: string; issuer: string; validFrom: string; validTo: string; digest?: string };
export type LifecycleRecord = { schemaVersion: 1; kind: 't03'; chainId: 296; operationId: string; startedAt: string;
  action: LifecycleAction; status: NovaStatus | 'failed'; admin: string; securityAddress: string; calldataDigest: string;
  kyc?: KycInput; before?: LifecycleState; after?: LifecycleState; transactionHash?: string; transactionId?: string;
  consensusTimestamp?: string; hashScanLink?: string };
const decimal = (value: unknown): string => { if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new Error('Invalid public number.'); return value; };
const address = (value: unknown): string => { if (typeof value !== 'string' || !/^0x[\da-f]{40}$/i.test(value)) throw new Error('Invalid public address.'); return value.toLowerCase(); };
const vcId = (value: unknown): string => { if (typeof value !== 'string' || value.length > 200 || !/^[\w:.-]*$/.test(value)) throw new Error('Invalid public VC ID.'); return value; };
export function lifecycleStateEvidence(s: LifecycleState): LifecycleState {
  const kyc = (k: KycState): KycState => {
    if (![0, 1].includes(k.status)) throw new Error('Invalid KYC status.');
    return { status: k.status, vcId: vcId(k.vcId), issuer: address(k.issuer), validFrom: decimal(k.validFrom), validTo: decimal(k.validTo) };
  };
  if (!Array.isArray(s.roles) || s.roles.length !== 3 || s.roles.some(r => typeof r !== 'boolean') || typeof s.issuer !== 'boolean') throw new Error('Invalid role state.');
  return { block: decimal(s.block), timestamp: decimal(s.timestamp), roles: [...s.roles], issuer: s.issuer,
    supply: decimal(s.supply), sellerBalance: decimal(s.sellerBalance), buyerBalance: decimal(s.buyerBalance),
    sellerHeld: decimal(s.sellerHeld), buyerHeld: decimal(s.buyerHeld), sellerKyc: kyc(s.sellerKyc), buyerKyc: kyc(s.buyerKyc) };
}
export function lifecycleEvidence(r: LifecycleRecord): LifecycleRecord {
  if (!r || r.schemaVersion !== 1 || r.kind !== 't03' || r.chainId !== 296 || !lifecycleActions.includes(r.action)
    || !(r.status === 'failed' || novaStatuses.includes(r.status)) || !/^[\w-]{1,100}$/.test(r.operationId) || !Number.isFinite(Date.parse(r.startedAt))
    || !/^0x[\da-f]{64}$/i.test(r.calldataDigest)) throw new Error('Invalid T03 operation. Recover the existing hash.');
  const result: LifecycleRecord = { schemaVersion: 1, kind: 't03', chainId: 296, operationId: r.operationId, startedAt: r.startedAt,
    action: r.action, status: r.status, admin: address(r.admin), securityAddress: address(r.securityAddress), calldataDigest: r.calldataDigest };
  if (r.kyc) {
    if (r.kyc.digest !== undefined && !/^0x[\da-f]{64}$/i.test(r.kyc.digest)) throw new Error('Invalid VC digest.');
    result.kyc = { vcId: vcId(r.kyc.vcId), issuer: address(r.kyc.issuer), validFrom: decimal(r.kyc.validFrom), validTo: decimal(r.kyc.validTo), ...(r.kyc.digest ? { digest: r.kyc.digest } : {}) };
  }
  for (const [key, pattern] of Object.entries({ transactionHash: /^0x[\da-f]{64}$/i, transactionId: /^0\.0\.[1-9]\d*-\d+-\d+$/, consensusTimestamp: /^\d+\.\d{9}$/ })) {
    const value = r[key as keyof LifecycleRecord];
    if (value !== undefined) { if (typeof value !== 'string' || !pattern.test(value)) throw new Error('Invalid public transaction field.'); Object.assign(result, { [key]: value }); }
  }
  if (r.before) result.before = lifecycleStateEvidence(r.before);
  if (r.after) result.after = lifecycleStateEvidence(r.after);
  if (result.transactionHash) result.hashScanLink = 'https://hashscan.io/testnet/transaction/' + result.transactionHash;
  return result;
}

export const holdActions = ['create-hold', 'kyc-negative', 'buyer-kyc', 'permission-negative', 'execute', 'release'] as const;
export type HoldAction = typeof holdActions[number];
export type HoldInput = { securityId: string; securityAddress: string; partition: string; holder: string; escrow: string;
  destination: string; baseBlock: string; baseTimestamp: string; expirationTimestamp: string; holdId?: string };
export type HoldDetails = { id: string; amount: string; expirationTimestamp: string; escrow: string; destination: string;
  data: string; operatorData: string; thirdPartyType: number };
export type HoldState = LifecycleState & { sellerHoldIds: string[]; buyerHoldIds: string[]; hold?: HoldDetails };
export type SimulationCase = { check: 'kyc-negative' | 'non-escrow' | 'over-amount'; from: string; amount: '6' | '11';
  calldata: string; revert: 'KycIsNotGranted' | 'InvalidKycStatus' | 'IsNotEscrow' | 'InsufficientHoldBalance'; block: string; afterBlock: string;
  revertData: string; sdkRejection?: 'AccountNotKycd' };
type HoldRecordBase = { schemaVersion: 1; chainId: 296; operationId: string; startedAt: string; input: HoldInput;
  before?: HoldState; after?: HoldState };
export type HoldTransaction = HoldRecordBase & { kind: 't04-transaction'; action: 'create-hold' | 'buyer-kyc' | 'execute' | 'release';
  status: NovaStatus | 'failed'; calldataDigest: string; signerRole: 'Seller' | 'Admin'; kyc?: KycInput;
  transactionHash?: string; transactionId?: string; consensusTimestamp?: string; hashScanLink?: string };
export type HoldSimulation = HoldRecordBase & { kind: 't04-simulation'; action: 'kyc-negative' | 'permission-negative';
  status: 'complete'; cases: SimulationCase[] };
export type HoldRecord = HoldTransaction | HoldSimulation;
export function holdInputEvidence(i: HoldInput): HoldInput {
  if (!/^0\.0\.[1-9]\d*$/.test(i.securityId) || !/^0x[\da-f]{64}$/i.test(i.partition)) throw new Error('Invalid Hold identity.');
  return { securityId: i.securityId, securityAddress: address(i.securityAddress), partition: i.partition.toLowerCase(),
    holder: address(i.holder), escrow: address(i.escrow), destination: address(i.destination), baseBlock: decimal(i.baseBlock),
    baseTimestamp: decimal(i.baseTimestamp), expirationTimestamp: decimal(i.expirationTimestamp), ...(i.holdId !== undefined ? { holdId: decimal(i.holdId) } : {}) };
}
export function holdStateEvidence(s: HoldState): HoldState {
  if (![s.sellerHoldIds,s.buyerHoldIds].every(ids => Array.isArray(ids) && ids.length <= 1)) throw new Error('Unexpected active Holds. Stop and recover existing evidence.');
  const result: HoldState = { ...lifecycleStateEvidence(s), sellerHoldIds: s.sellerHoldIds.map(decimal), buyerHoldIds: s.buyerHoldIds.map(decimal) };
  if (s.hold) {
    const h = s.hold;
    if (h.data !== '0x' || h.operatorData !== '0x' || h.thirdPartyType !== 0) throw new Error('Unexpected Hold data or operator type.');
    result.hold = { id: decimal(h.id), amount: decimal(h.amount), expirationTimestamp: decimal(h.expirationTimestamp),
      escrow: address(h.escrow), destination: address(h.destination), data: '0x', operatorData: '0x', thirdPartyType: 0 };
  }
  return result;
}
export function holdEvidence(r: HoldRecord): HoldRecord {
  if (!r || r.schemaVersion !== 1 || r.chainId !== 296 || !/^[\w-]{1,100}$/.test(r.operationId) || !Number.isFinite(Date.parse(r.startedAt))) throw new Error('Invalid T04 evidence. Recover the original hash.');
  const base: HoldRecordBase = { schemaVersion: 1, chainId: 296, operationId: r.operationId, startedAt: r.startedAt,
    input: holdInputEvidence(r.input), ...(r.before ? { before: holdStateEvidence(r.before) } : {}), ...(r.after ? { after: holdStateEvidence(r.after) } : {}) };
  if (r.kind === 't04-simulation') {
    const expected = r.action === 'kyc-negative' ? ['kyc-negative'] : r.action === 'permission-negative' ? ['non-escrow','over-amount'] : [];
    if (r.status !== 'complete' || !expected.length || !Array.isArray(r.cases) || r.cases.length !== expected.length) throw new Error('Invalid simulation evidence.');
    const cases = r.cases.map((c,i): SimulationCase => {
      const revert = c.check === 'kyc-negative' ? c.revert : c.check === 'non-escrow' ? 'IsNotEscrow' : 'InsufficientHoldBalance';
      if (c.check !== expected[i] || (c.check === 'kyc-negative' && !['KycIsNotGranted','InvalidKycStatus'].includes(c.revert)) || c.revert !== revert || c.amount !== (c.check === 'over-amount' ? '11' : '6')
        || !/^0x(?:[\da-f]{2})+$/i.test(c.revertData) || c.revertData.length > 138 || !/^0x(?:[\da-f]{2})+$/i.test(c.calldata) || (c.check === 'kyc-negative' && c.sdkRejection !== 'AccountNotKycd')) throw new Error('Invalid negative verification.');
      return { check: c.check, from: address(c.from), amount: c.amount, calldata: c.calldata, revert, revertData: c.revertData, block: decimal(c.block), afterBlock: decimal(c.afterBlock),
        ...(c.check === 'kyc-negative' ? { sdkRejection: 'AccountNotKycd' as const } : {}) };
    });
    return { ...base, kind: 't04-simulation', action: r.action, status: 'complete', cases };
  }
  if (r.kind !== 't04-transaction' || !['create-hold','buyer-kyc','execute','release'].includes(r.action)
    || !(r.status === 'failed' || novaStatuses.includes(r.status)) || !/^0x[\da-f]{64}$/i.test(r.calldataDigest)
    || r.signerRole !== (r.action === 'create-hold' ? 'Seller' : 'Admin')) throw new Error('Invalid T04 transaction.');
  const result: HoldTransaction = { ...base, kind: 't04-transaction', action: r.action, status: r.status, calldataDigest: r.calldataDigest, signerRole: r.signerRole };
  // Reuse the existing public KYC and transaction-field validators, then copy only those fields.
  const fields = lifecycleEvidence({ schemaVersion: 1, kind: 't03', chainId: 296, operationId: r.operationId, startedAt: r.startedAt,
    action: 'seller-kyc', status: r.status, admin: r.input.escrow, securityAddress: r.input.securityAddress, calldataDigest: r.calldataDigest,
    kyc: r.kyc, transactionHash: r.transactionHash, transactionId: r.transactionId, consensusTimestamp: r.consensusTimestamp });
  if (fields.kyc) result.kyc = fields.kyc;
  if (fields.transactionHash) { result.transactionHash = fields.transactionHash; result.hashScanLink = fields.hashScanLink; }
  if (fields.transactionId) result.transactionId = fields.transactionId;
  if (fields.consensusTimestamp) result.consensusTimestamp = fields.consensusTimestamp;
  return result;
}

export const tradeActions = ['deploy','lock','settle','cancel','reclaim'] as const;
export type TradeAction = typeof tradeActions[number];
export type TradeTransaction = HoldRecordBase & { kind: 't05-transaction'; action: TradeAction; status: NovaStatus | 'failed';
  signerRole: 'Admin' | 'Seller' | 'Buyer'; calldata: string; calldataDigest: string; walletValueWeibars: string;
  transactionHash?: string; transactionId?: string; consensusTimestamp?: string; hashScanLink?: string;
  runtimeDigest?: string; readBlock?: string; swapState?: number;
  payment?: { sellerAccountId: string; buyerAccountId: string; sellerCreditTinybars: string; principalTinybars: string; feeTinybars: string } };
export type TradeSimulation = HoldRecordBase & { kind: 't05-simulation'; action: 'purchase-negative' | 'duplicate-negative'; status: 'complete';
  cases: { check: 'wrong-buyer' | 'wrong-payment' | 'duplicate'; from: string; walletValueWeibars: string; calldata: string;
    block: string; afterBlock: string; revertData: string }[] };
export type TradeRecord = TradeTransaction | TradeSimulation;
const publicHex = (v: unknown, max: number) => {
  if (typeof v !== 'string' || v.length > max || !/^0x(?:[\da-f]{2})+$/i.test(v)) throw new Error('Invalid public hex data.');
  return v.toLowerCase();
};
export function tradeEvidence(r: TradeRecord): TradeRecord {
  if (!r || r.schemaVersion !== 1 || r.chainId !== 296 || !/^[\w-]{1,100}$/.test(r.operationId) || !Number.isFinite(Date.parse(r.startedAt))) throw new Error('Invalid T05 evidence. Recover the original operation.');
  const base: HoldRecordBase = { schemaVersion:1, chainId:296, operationId:r.operationId, startedAt:r.startedAt, input:holdInputEvidence(r.input),
    ...(r.before ? {before:holdStateEvidence(r.before)} : {}), ...(r.after ? {after:holdStateEvidence(r.after)} : {}) };
  if (r.kind === 't05-simulation') {
    const expected = r.action === 'purchase-negative' ? ['wrong-buyer','wrong-payment'] : r.action === 'duplicate-negative' ? ['duplicate'] : [];
    if (!expected.length || r.status !== 'complete' || !Array.isArray(r.cases) || r.cases.length !== expected.length) throw new Error('Invalid T05 simulation.');
    const cases = r.cases.map((c,i) => {
      if (c.check !== expected[i]) throw new Error('Wrong simulation sequence.');
      return {check:c.check,from:address(c.from),walletValueWeibars:decimal(c.walletValueWeibars),calldata:publicHex(c.calldata,1000),
        block:decimal(c.block),afterBlock:decimal(c.afterBlock),revertData:publicHex(c.revertData,10)};
    });
    return {...base,kind:r.kind,action:r.action,status:'complete',cases};
  }
  if (r.kind !== 't05-transaction' || !tradeActions.includes(r.action) || !(r.status === 'failed' || novaStatuses.includes(r.status))
    || r.signerRole !== (r.action === 'deploy' ? 'Admin' : r.action === 'settle' ? 'Buyer' : 'Seller')
    || !/^0x[\da-f]{64}$/i.test(r.calldataDigest) || r.walletValueWeibars !== (r.action === 'settle' ? '1000000000000000000' : '0')) throw new Error('Invalid T05 transaction.');
  const result: TradeTransaction = {...base,kind:r.kind,action:r.action,status:r.status,signerRole:r.signerRole,
    calldata:publicHex(r.calldata,50000),calldataDigest:r.calldataDigest,walletValueWeibars:r.walletValueWeibars};
  for (const [key, pattern] of Object.entries({transactionHash:/^0x[\da-f]{64}$/i,transactionId:/^0\.0\.[1-9]\d*-\d+-\d+$/,
    consensusTimestamp:/^\d+\.\d{9}$/,runtimeDigest:/^0x[\da-f]{64}$/i,readBlock:/^[1-9]\d*$/})) {
    const value = r[key as keyof TradeTransaction];
    if (value !== undefined) { if (typeof value !== 'string' || !pattern.test(value)) throw new Error('Invalid T05 public field.'); Object.assign(result,{[key]:value}); }
  }
  if (r.swapState !== undefined) { if (![0,1,2,3].includes(r.swapState)) throw new Error('Invalid swap state.'); result.swapState=r.swapState; }
  if (r.payment) {
    const p=r.payment;
    if (r.action !== 'settle' || ![p.sellerAccountId,p.buyerAccountId].every(a=>/^0\.0\.[1-9]\d*$/.test(a))) throw new Error('Invalid payment evidence.');
    result.payment={sellerAccountId:p.sellerAccountId,buyerAccountId:p.buyerAccountId,sellerCreditTinybars:decimal(p.sellerCreditTinybars),principalTinybars:decimal(p.principalTinybars),feeTinybars:decimal(p.feeTinybars)};
  }
  if (result.transactionHash) result.hashScanLink='https://hashscan.io/testnet/transaction/'+result.transactionHash;
  return result;
}
