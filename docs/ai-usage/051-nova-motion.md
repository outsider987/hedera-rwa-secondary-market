# NOVA transaction and issuance illustration

September 8, 2026. Base4cd15380676f3f69e34b229edb6c985c8ab1b655.
User:「在交易的過程我想要有動畫 是可以像是這物品在交易 或是鑄造中然後對應資訊要顯示」
This authorizes the bounded animation extension in [plan006](../plans/006-nova-motion.md).
Codex used the animate skill and active Ponytail rules. No new image or dependency;
the existing generated certificate retains [usage050](050-nova-overview.md) provenance.

Delivered: reusable NovaFlow uses CSS transform transitions to move the certificate
between selling account, ATS Hold and buying account. HBAR moves in the opposite
direction only after verified settlement. Pending/rejection/expiry retain the
last verified NOVA position; no timer or signature response simulates success.
Accessible text states quantity, location and payment; the settlement detail adds
unit price and shows no required actor after completion. Busy copy distinguishes
preparation, manual MetaMask approval and original-transaction verification.
Overview has six manually selected illustration stages, including a finite mint
appearance, with explicit no-transaction labeling. Historical issuance stays closed.
Reduced motion removes movement while retaining all stage information. Switching
matches mounts a fresh visual so unrelated matches never animate into each other.
Unprepared amounts are explicitly not confirmed balances.

Affected source: src/NovaFlow.tsx, AssetLifecycle.tsx, SettlementPanel.tsx,
styles.css. Documentation: plan006, this entry, AI_USAGE.md and HANDOFF.md;
[reproducible browser harness](../evidence/043-nova-motion.mjs) and its captures/results.

Validation: npm ci --prefer-offline --no-audit;114 application and36 protobuf tests;
typecheck, application build and standalone showcase build passed. Existing
optional install-script, upstream eval and large-chunk warnings remain.
All four dev/preview1440/390 browser cases pass: six manual demo stages,
seven verified NOVA positions, HBAR transform endpoints, pending/rejected/expiry
and offline retention, reduced motion and no overflow. Desktop/mobile overview,
delivery and expiry captures were reviewed. Expanded harness attempts encountered
state/offline wait timeouts; the final run uses a foreground page and explicit
HTTP503 offline fixture and passes. Browser validation results are recorded in [raw evidence](../evidence/043-nova-motion.json).
Synthetic API snapshots and an isolated read-only wallet exercise visual states;
they do not establish fresh MetaMask or chain execution. No actual signature,
transaction, backend/contract change, new dependency, push, merge or deployment.
