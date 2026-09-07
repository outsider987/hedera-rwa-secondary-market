# T02 manual acceptance and Mirror sender repair — September 7, 2026

Base: `b526a75c2c089a735baa5dd7ecfdc331533a36cc`, existing diagnostic branch.
Victor supplied public screenshots/exports of dev and preview Seller VC
verification, checked retained T01 attestations, reviewed fixed settings and
manually approved the one preview NOVA transaction. Chrome/MetaMask versions
are operator-entered. Screenshots do not independently reproduce each checkbox
procedure; full credentials/signatures were not retained or replayed.

Codex inspected the supplied public exports and performed read-only recovery
using the real application's ABI/RPC/Mirror path. Receipt, event and current
getters matched. Mirror's numeric sender form caused a false alias mismatch;
live lookups established that both forms resolve to active Admin 0.0.10389090.
The handoff recorded this bounded Prompt 023 repair scope before editing.
Ponytail was used to reuse strict account validation without another abstraction,
dependency, SDK patch or transaction. No delegation was used for this repair.

Affected files: `src/nova.ts`, `tests/nova.test.mjs`, evidence 024's summary,
public JSON and original-image HTML/hash manifest, this record, HANDOFF, plan,
ATTRIBUTION and AI_USAGE. Prior evidence was preserved. The regression failed
before the fix and passed afterward; npm ci, 65 app + 36 proto tests,
typecheck/build passed. Four live read-only browser queries passed on dev/preview at desktop/mobile
widths, each with all 56 comparisons. The initial dev wait timeout came from a
stale optimizer import after ci; restarting dev resolved it. Both outcomes are
recorded in evidence 024. The dependency lock and retained patches are unchanged.

Independent live readback passes all 56 comparisons for security 0.0.10402368.
Only one approved creation hash was checked; no global uniqueness audit is
claimed. Cap 1000, supply 0, config 1 and Admin management role match. T02 stops
here. No KYC grant, issuance, Hold, second signature/transaction, push or merge.
Native BBS exclusion, 62 audit findings, peers, dfns license omissions and
eligibility questions remain. Victor may query/export the same hash after
reload to display the repaired result; no fresh VC is required for querying.

See [evidence 024](../evidence/024-vc-nova-manual.md),
[effective authorization](../prompts/023-vc-nova-implementation.md) and
[current handoff](../HANDOFF.md).
