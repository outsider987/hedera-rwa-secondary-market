# B2 isolated dependency trial — September 6, 2026

Victor said “開始吧”, activating the exact isolated trial in HANDOFF, then
“對了,先推送吧”. The latter authorizes pushing existing committed work first.
Base: `9d9f62f8fd1a4aa2b24069937540a8f5da4579fa`.

The existing branch was pushed to origin and the remote ref verified at that
base before the trial. No merge or public deployment is requested. Continue
the trial afterward; this push does not authorize automatic future pushes.

Test only the six parent-scoped overrides in evidence 019, in disposable
copies. Keep all retained pins/repairs and script approvals. Run meaningful
baseline/candidate security and caller compatibility checks, then clean-install,
audit/graph/license, Node, build and browser checks. No signer, key fixture,
VC signature, chain mutation or claimed positive VC acceptance.

Allowed repository files: evidence 020 MJS/test MJS/MD/JSON, this prompt,
work item 026, HANDOFF, plan, ATTRIBUTION and AI_USAGE. Application, root
manifest/lock and retained patches stay unchanged. Record any failed gate;
do not silently widen versions or clear native compatibility based on absence.
Commit records together at the boundary; a retained repair is a separate ticket.
