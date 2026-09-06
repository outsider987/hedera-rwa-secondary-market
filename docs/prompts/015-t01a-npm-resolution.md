# T01a npm resolution diagnosis — September 6, 2026

Victor replied “go” after the proposed next step: investigate the previous protobuf dependency-resolution failure, use existing failing tests to validate a repair, and retain SDK/VC gates. This authorizes a bounded diagnostic follow-up; no wallet, SDK integration, VC or NOVA work.

Base: `2dfeff659419c18bac14d8e01f7046ba1af98d6a`. Follow Ponytail: reuse npm's installed Arborist and the existing Node decoder diagnostic. Keep Node 24.19.0, npm 11.17.0, ATS 8.0.0 and all other app pins unchanged.

First reproduce the qualified-override failure in disposable directories and trace npm's edge/placement logic. Test a minimal resolution strategy under the same four parent selectors. Do not delete or hand-edit the application lock, upgrade SDK/npm, approve install scripts or regenerate/vend upstream code. An isolated candidate is evidence, not an accepted application repair. Review actual graph and unrelated-version changes before proposing retention. A passing resolution gate alone does not prove safe generated decoders.

Exact repository files: new `docs/evidence/013-t01a-npm-resolution.md`, `.json`, `.test.mjs`; this prompt; `docs/ai-usage/019-t01a-npm-resolution.md`; AI_USAGE, HANDOFF, plan authorization/status, ATTRIBUTION if new sources are used. Scratch experiments may copy public manifests/locks into temporary directories, always with install scripts disabled. Historical evidence and the working application remain unchanged. Commit the diagnostic result with its reproducible tests and next boundary; no automatic push/merge.
