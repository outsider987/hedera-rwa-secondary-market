import { getAddress, keccak256, stringToHex } from 'viem';
import type { CredentialPayload, SignedCredential } from '@terminal3/vc_core';
import { acquireOperation, releaseOperation } from './guards';

export type WalletProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
export type PreparedCredential = { payload: CredentialPayload; digest: string; preparedAt: number };
export type CredentialResult = { verified: boolean; verifier: boolean; rules: boolean; negatives?: { expired: boolean; tampered: boolean; wrongSubject: boolean } };
const digest = (payload: CredentialPayload) => keccak256(stringToHex(JSON.stringify(payload)));

export async function prepareSellerCredential(admin: string, seller: string, now = Date.now()): Promise<PreparedCredential> {
  if (!Number.isFinite(now) || getAddress(admin) === getAddress(seller)) throw new Error('Use distinct Admin and Seller accounts.');
  const { prepareCredentialPayload, DID } = await import('@terminal3/vc_core');
  const payload = await prepareCredentialPayload(['SyntheticKyc'], new DID('ethr', getAddress(admin)),
    new DID('ethr', getAddress(seller)), { passed: true }, new Date(now - 300_000), new Date(now + 7 * 86400_000));
  return { payload, digest: digest(payload), preparedAt: now };
}

export function credentialProblem(value: unknown, expected: PreparedCredential, now = Date.now()): string | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Invalid credential.';
  const { proof: _proof, ...data } = value as SignedCredential;
  const from = Date.parse(data.validFrom ?? ''), until = Date.parse(data.validUntil ?? '');
  if (!Number.isFinite(now) || !Number.isFinite(from) || !Number.isFinite(until) || from > now || until <= now
    || from !== expected.preparedAt - 300_000 || until !== expected.preparedAt + 7 * 86400_000) return 'Credential dates do not match this preparation or have expired.';
  if (data.issuer !== expected.payload.issuer || data.credentialSubject?.id !== expected.payload.credentialSubject.id) return 'Credential issuer or subject does not match.';
  if (JSON.stringify(data.credentialSubject) !== JSON.stringify(expected.payload.credentialSubject)
    || (data.credentialSubject as unknown as { passed?: unknown }).passed !== true || data.credentialStatus !== undefined) return 'Credential claims or revocation settings do not match.';
  if (digest(data) !== expected.digest) return 'Credential digest does not match this review.';
}

export async function verifySellerCredential(value: unknown, expected: PreparedCredential): Promise<CredentialResult> {
  let verifier = false;
  const rules = credentialProblem(value, expected) === undefined;
  // Always use the genuine verifier; never replace a rejected signature with app checks.
  try {
    const { verifyVc } = await import('@terminal3/verify_vc');
    verifier = (await verifyVc(structuredClone(value) as SignedCredential)).isValid === true;
  } catch { /* Missing/malformed proof is a negative result, never public error data. */ }
  return { verified: verifier && rules, verifier, rules };
}

export async function signSellerCredential(prepared: PreparedCredential, provider: WalletProvider,
  checkCurrent: () => Promise<void>): Promise<CredentialResult & { credential?: SignedCredential }> {
  const lease = acquireOperation();
  try {
    if (credentialProblem(prepared.payload, prepared)) throw new Error('Credential review expired or changed. Prepare again.');
    await checkCurrent();
    if (credentialProblem(prepared.payload, prepared)) throw new Error('Credential review expired or changed. Prepare again.');
    let signature: unknown;
    try {
      // personal_sign expects hex-encoded UTF-8 of the hash STRING, not raw hash bytes.
      signature = await provider.request({ method: 'personal_sign', params: [stringToHex(prepared.digest), prepared.payload.issuer.slice('did:ethr:'.length)] });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 4001) throw new Error('Signature rejected. No transaction was created.');
      throw new Error('Signature request did not complete. Check MetaMask before preparing again.');
    }
    await checkCurrent();
    if (typeof signature !== 'string') throw new Error('MetaMask returned an invalid signature.');
    const credential: SignedCredential = { ...structuredClone(prepared.payload), proof: {
      type: 'EcdsaSecp256k1Signature2019', proofPurpose: 'assertionMethod',
      verificationMethod: prepared.payload.issuer + '#key-1', created: new Date().toISOString(), proofValue: signature,
    } };
    const result = await verifySellerCredential(credential, prepared);
    await checkCurrent();
    if (!result.verified) return result;
    const expired = { ...structuredClone(credential), validUntil: new Date(Date.now() - 86400_000).toISOString() };
    const tampered = { ...structuredClone(credential), credentialSubject: { ...credential.credentialSubject, passed: false } };
    // The original valid signature with a different expected subject tests app binding separately.
    const wrong = { ...prepared, payload: { ...prepared.payload, credentialSubject: { ...prepared.payload.credentialSubject, id: prepared.payload.issuer } } };
    const [expiry, tamper, subject] = await Promise.all([verifySellerCredential(expired, prepared), verifySellerCredential(tampered, prepared), verifySellerCredential(credential, wrong)]);
    await checkCurrent();
    const negatives = { expired: !expiry.verified && !expiry.verifier, tampered: !tamper.verified && !tamper.verifier, wrongSubject: !subject.verified && subject.verifier };
    return { ...result, verified: Object.values(negatives).every(Boolean), negatives,
      ...(Object.values(negatives).every(Boolean) ? { credential } : {}) };
  } finally { releaseOperation(lease); }
}
