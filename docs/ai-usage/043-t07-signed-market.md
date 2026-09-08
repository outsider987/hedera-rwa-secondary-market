# T07 signed unfunded market — September 8, 2026

Base `a485afb2c703ba632c83f205b1d9dcaf289173e0` is the independent tested T06
commit. The user explicitly authorized continuing T07 in the supplied plan;
[prompt 030](../prompts/030-t07-signed-market.md) and effective
[spec 003](../plans/003-matching-engine.md) preserve the intent and exact files.

Codex implemented Go EIP-712 recovery, transactional PostgreSQL state, HTTP API,
Compose and CI; React Market integration, strict amounts, wallet review/lease/
Web Lock reuse, public intent recovery and whitelisted evidence. No npm lock,
T05 contract/artifact, SDK patch or original transaction evidence changed.
Affected implementation files: engine go.mod/go.sum, auth/store/http and tests,
migration/entrypoint/Dockerfile; compose.yaml, CI, src market/MarketPanel/App/
styles, Vite proxy, market/shell tests. Documentation: spec/HANDOFF/main plan,
README/PRODUCT/DESIGN/DEMO/ARCHITECTURE/ATTRIBUTION, this usage/index, prompt030,
evidence034 and pending manual035. Market export lives in market.ts; the existing
transaction evidence module remains unchanged.

Used ponytail for minimal standard-library implementation and impeccable within
the user's fixed visual brief. Its bounded finish reviewer identified one live-
region issue; Codex fixed it and the reviewer scored that fix resolved after
final captures. A bounded documenter updated only PRODUCT/DESIGN. No human review
or model identity is inferred from these AI checks.

[Evidence 034](../evidence/034-t07-implementation.md) records actual Go test/race/
vet/fuzz, public crypto vector, real PostgreSQL with explicit verifier doubles,
104 app + 36 protobuf tests, typecheck/build, 16 Foundry checks and four browser
cases. Real API restart and database stop/start were checked. WSL socket/proxy,
stale Vite and harness coordination failures are disclosed with corrected results.
New static API runtime notices are retained in the image; sources and exact
module versions/licenses are in ATTRIBUTION and validation JSON.

Victor actions remain the six manual MetaMask signatures and actual exported
observations/captures. The real book is empty and human acceptance remains Pending.
No agent generated a private signer, signed an order, submitted a chain transaction,
reserved funds or ran T08. Local commits only; no push or merge.

## First manual order — September 8, 2026

Base e7e97db1aef5a5e1c3a06d1af6f79107f9bb20d8. Victor supplied public export
and screenshot; Codex compared the public API original request/order, whitelisted
fields, independently recomputed EIP-712 digest, owner/amount/time/conservation.
First Seller Sell4@0.09 is accepted, remaining4, no matches; 1/6 signatures
observed. Raw signature was not read/exported and no agent signed or transacted.
Changed only manual035 report/JSON/orders capture, HANDOFF, this usage/index and
main-plan progress. No application suite rerun for unchanged code. Next Seller
Sell5@0.10; overall acceptance Pending, existing file boundary retained.
