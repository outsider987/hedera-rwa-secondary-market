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
export function downloadEvidence(value: ReturnType<typeof credentialEvidence> | NovaRecord | LifecycleRecord) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value.kind === 't03' ? lifecycleEvidence(value) : value.kind === 'nova-create' ? novaEvidence(value) : credentialEvidence(value), null, 2) + '\n'], { type: 'application/json' }));
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
