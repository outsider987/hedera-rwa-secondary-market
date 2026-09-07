# Manual Seller VC and one NOVA creation — September 6, 2026

The user supplied an implementation plan and explicitly asked to implement and
verify it in a fresh context. Base: `2001f13` on the existing diagnostic branch.
No automatic push, merge or public deployment. This supersedes historical
research-only, no-direct-Terminal3 and no-VC/T02 activation boundaries.

Execute dependency repair → VC signing/verification → NOVA creation/readback,
committing each implementation stage with its evidence and handoff. Stop at T02;
no on-chain KYC grant, issuance, Hold or later ticket. Automated/UI work may
precede human acceptance. Actual creation requires all retained T01 manual
checks and is permitted once, only at `http://127.0.0.1:4173`. Dev supports VC
and existing-asset reads. Every signature/transaction requires Victor's manual
MetaMask approval; no private keys, signers from keys, native scripts or mocks
that pretend to be successful VC/SDK acceptance.

Supported environment: desktop Chrome + MetaMask ECDSA VC. Native BBS is
excluded and not claimed verified. Retain evidence 020's six scoped overrides
and verify its 22 changed lock locations. Pin the already installed Terminal3
vc_core 0.0.19 and verify_vc 0.0.20 directly; retain ethers 6.17.0, superseding
the old 6.15.0 proposal. Repeat security/caller, audit, peer/license, clean-install
and browser compatibility checks; preserve remaining findings and limitations.

Prepare Seller VC → Review → Sign in MetaMask → Verify. Use genuine Terminal3
payload/proof, checksum EVM DIDs, Admin issuer, Seller subject, fixed synthetic
KYC passed claim, preparation time minus five minutes / plus seven days. Show
issuer, subject, claims, dates and digest. Request personal_sign through the
current wagmi provider over the hash's UTF-8 string, never its raw hash bytes.
Run genuine verifyVc plus expected issuer/subject, fixed claims, date and this
preparation's digest checks. Reject expired, tampered and wrong-subject VCs.
Keep full VC/signature in memory; invalidate on account/network/role/reload.
No personal data or revocation registry; public evidence is whitelisted.

Reuse wagmi as sole connection/session owner; share one operation lock across
VC, SDK and creation. Add a separate ATS 8.0.0 version/hash-protected local
patch for public Network.connect(request, { provider }), RPC adapter, MetaMask
service and genuine SetConfigurationRequest export. Preserve validation,
Equity.create and existing proto/read-only repairs. Managed SDK connection
must not discover providers, reconnect or register wallet events; release its
provider on completion. Disclose the adaptation and retain upstream notices.

NOVA uses every fixed value in plan section 2, including rights, regulation,
lists, Admin owner, cap 1000 and initial supply 0. Requery all three Mirror
accounts, chain, deployment and integer SDK config immediately before creation;
use genuine CreateEquityRequest. Changed accounts/config require new review.
At eth_sendTransaction enforce fresh Admin/chain 296, expected Factory, exact
deployEquity calldata and zero value. No other signing/transaction methods,
automatic switch or resubmission.

Persist public intent before opening MetaMask and hash immediately on return,
before SDK completion. Preview requires same-origin Web Locks and durable
storage; unavailable storage/locking disables creation only. Distinguish awaiting
signature, rejected, pending receipt, unknown, confirmed, Mirror pending,
configuration mismatch and complete. Submitted/unknown state survives switches,
timeouts and reload. Unknown permits query/recovery only. Dev/preview accept a
public hash for verified recovery, never treating local records as success.

Verify successful receipt, Factory EquityDeployed event/address, Mirror security
ID, metadata, cap/supply/config, Admin management roles and queryable flags.
ATS 8 Equity getter omits rights: compare confirmed event values and label their
source. Mismatch means created but verification failed; never create another.
Export hash, Hedera transaction ID, consensus timestamp, HashScan and comparisons.

Use Node built-in TDD for VC rules, shared operation/session guards, calldata,
recovery and whitelist. Browser automation uses genuine wagmi/Terminal3/ATS
with controlled provider/network boundaries, no keys or fake valid credentials.
Cover rejection, double clicks, switches while signing, late replies, timeout
after submission, Mirror delay, reload and cross-tab exclusion. Run npm ci,
npm test, typecheck/build and dev/preview desktop/mobile browser checks,
lazy loading and external request bounds. Human VC/T01/NOVA stays Pending
until observed, with screenshots in offline HTML and public JSON evidence.

Exact stage files:

- Dependency: package.json, package-lock.json, tests/dependencies.test.mjs;
  docs/evidence/021-b2-retained-repair.{mjs,md,json}, associated JSON evidence.
- VC: src/credentials.ts, src/evidence.ts, src/App.tsx, src/styles.css,
  src/wallet.ts, src/guards.ts, src/ats.ts; tests/{credentials,evidence,guards,
  wallet,ats,shell}.test.mjs; docs/evidence/022-vc-*.
- NOVA: src/nova.ts and the VC integration files; scripts/patch-ats-wallet.mjs,
  package.json (postinstall only), tests/{nova,ats,guards,evidence,shell}.test.mjs;
  docs/evidence/023-nova-*.
- Each stage: this prompt, docs/HANDOFF.md, docs/plans/001-ats-first.md,
  docs/ATTRIBUTION.md, AI_USAGE.md, one docs/ai-usage work item (027–029).

Completion is an actually Admin-signed, accepted Seller VC and exactly one
confirmed NOVA deployment with matching readback. An unsigned simulation with
config version 1 is prior user-reported read-only evidence, not a transaction;
repeat the preflight before any creation.
