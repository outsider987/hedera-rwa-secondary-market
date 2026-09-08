# Judge presentation documentation — September 8, 2026

Base: `f50cc999402b6ec7e6dbe8a0888fe5bf2062d2e1` (T04 PR #5 merge); branch
`docs/judge-demo`. Victor requested short, readable English operating guidance,
a demo script and report entry points using completed evidence. His exact
request is retained in [prompt 026](../prompts/026-judge-demo.md).

Codex rewrote the stale T01a README as the judge entry, added the two-minute
DEMO script and corrected PRODUCT's T00-only status. The script follows actual
Hold 10, Buyer KYC, execute 6 and release 4 records, including three contract
rejections in two read-only simulation records. Balances and KYC validity are
explicitly historical. The original README/product state remains in Git.

Changed files: `README.md`, `PRODUCT.md`, `docs/DEMO.md`,
`docs/prompts/026-judge-demo.md`, `docs/evidence/030-judge-demo.md`,
`docs/evidence/030-judge-demo.json`, this record, `AI_USAGE.md`,
`docs/HANDOFF.md`, `docs/plans/001-ats-first.md`.

[Evidence 030](../evidence/030-judge-demo.md) records actual checks and the
browser harness correction. Existing evidence 028/029, code, tests, dependency
pins and patches are unchanged. No transaction/signature, new screenshot,
new dependency, public deployment or eligibility claim. The recorded acceptance
is reused; there was no new human acceptance or recorded presentation.
Commit locally; new push/merge and further implementation are not activated.
