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

## Second manual order discrepancy — September 8, 2026

Base 2af1f72878bc2238aac546c8e423069a6a309998. Victor supplied a second
public export and two screenshots. Codex verified two distinct accepted Sell4@0.09
commands, unchanged first order and no matches against the public API. Whitelist,
independent EIP-712 digest, deadlines and conservation pass. Backend verification
is reported without raw signature access. Only one planned step is complete.
Next: manual cancellation of sequence2, then correct Sell5@0.10; no Buyer yet.
Updated manual035 JSON/report, HANDOFF, this usage/index and main-plan status;
original capture/checkpoint retained, new attachment hashes recorded. No code
changes or application suites rerun. JSON assertions and git diff checks passed.
No agent signature, order mutation, push, merge or T08.

## Manual recovery, reverse match and persistence — September 8, 2026

Base 0ab0909f119ca3ff4a2f2236bd48ebbe6f8f02c4. Codex checked Victor's exports
2–8 against the public whitelist, independent viem digest and original API
commands. Reload export equality and real API container restart state equality
passed. Nine commands, seven orders, four matches, 0.96 HBAR intent, no open
quantity. Seller partial cancellation remains pending; Buyer cancellation is
not credited as that step. Changed manual035 JSON/report/matches capture,
HANDOFF, usage/index and main-plan status only. No code suites rerun; JSON
checks and diff whitespace check passed. No raw signature access or agent
order mutation. All matches remain unsettled.

## Final manual acceptance — September 8, 2026

Base 6e3a47d80b5ac80a0375f563a866ef1a210988f6. Victor supplied final Seller
cancellation and reload captures/exports11–12. Codex compared public exports,
all twelve accepted original commands and independent EIP-712 digests/deadlines.
The actual API container restart after export11 and operator reload export12
preserve nine orders/five matches/domain/version. Seller matched2/cancelled3
now passes. Original six-signature scenario deviations remain explicit.
Changed manual035 report/JSON and two final captures, status documentation
(README, PRODUCT, DESIGN, DEMO, ARCHITECTURE, spec003/main plan/HANDOFF) and this
usage/index. No implementation changes or unchanged suites rerun; final JSON
assertions and diff checks passed. Raw signatures not accessed; backend reports
verification, independent digest is not independent signer recovery. No agent
signer, order mutation, chain transaction, push, merge or T08.
