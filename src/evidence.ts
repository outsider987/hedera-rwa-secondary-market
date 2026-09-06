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
export function downloadEvidence(value: ReturnType<typeof credentialEvidence>) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2) + '\n'], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'holdbook-public-evidence.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
