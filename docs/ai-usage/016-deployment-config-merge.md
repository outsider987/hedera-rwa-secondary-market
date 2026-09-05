# Deployment/config integration — 2026-09-05

- User request: 「合併推送」. Authorizes pushing `feat/t01b-3-config-check` and merging its T01b-2/T01b-3 work into main, preserving both feature commits.
- Clean integration base: `54452080fca81051f41f9dd422d98f6a1e82b9ae`; fetched origin/main was `66dea387a64ef385e5e84d3f7eb0f62699ed69cf`. Previous handoff base is an ancestor; no conflicting upstream commits were found.
- Codex updates only this record, AI_USAGE, HANDOFF and the plan authorization. Verify the latest PR head passes GitHub CI before using a merge commit; synchronize local main afterward. Actual PR/merge status is available in repository history and GitHub.
- Existing [local evidence](../evidence/010-t01b-3-config.md) includes 50 Node tests, 28 browser scenarios and live config version 1. Unchanged local application checks are not repeated for these documentation edits; PR CI runs ci/test/typecheck/build on the integration head.
- Real MetaMask remains Pending for September 6. T01a security, SDK integration and VC verification remain open. No public deployment, wallet operation, signature, transaction, force push or new human review is claimed. Future manual work uses AI record 017; no manual requirement is removed.
