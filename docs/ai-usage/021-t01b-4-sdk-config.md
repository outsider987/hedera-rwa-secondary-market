# T01b-4 official SDK config — September 6, 2026

- Human decision: Victor's “Go” activated the bounded public SDK config slice after the protobuf repair. [Prompt 017](../prompts/017-t01b-4-sdk-config.md) preserves scope and the stop condition.
- Codex used Ponytail guidance, pinned public SDK/package source and the existing external Playwright installation. No subagents or external reviewers were used.
- The intended public-only initialization fails: `SetNetworkRequest` is not exported; plain objects fail request validation. The separate transport limitations are source findings only. No fake validator, deep import, transaction-adapter initialization or dependency change was retained.
- Actual checks and limitations are in [evidence 015](../evidence/015-t01b-4-sdk-config.md): public-entry browser gate remains red, existing viem live preflight succeeds, and npm ci, 86 existing tests, typecheck/build and unchanged-app browser checks pass. No SDK config payload or VC result is claimed.
- Files: new evidence 015 MJS/MD/JSON, prompt 017, this work record, HANDOFF, plan, ATTRIBUTION and AI_USAGE. Application source, package manifest/lock and historical evidence remain unchanged. Base `938aeb71838c6e65e18bb82d499d12c78698cbda`; prior handoff base verified as an ancestor.
- This is a diagnostic boundary commit, not completed integration. B2 and remaining human/SDK/VC requirements persist. No wallet/profile, signature, transaction, mentor message, push or merge. The next research scope remains unactivated.
