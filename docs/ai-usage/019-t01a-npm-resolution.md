# T01a npm resolution diagnosis — September 6, 2026

- Human decision: Victor replied “go” to investigating the protobuf resolution blocker with TDD. [Prompt and scope](../prompts/015-t01a-npm-resolution.md).
- Codex used Ponytail guidance, existing npm 11.17.0 Arborist source, the existing decoder diagnostic and isolated public manifest/lock copies. No subagents or external reviewers were used.
- Diagnosed hoisting KEEP plus override-set mismatch preventing pruning; a targeted nested update passes the actual graph and clean-install gates. No working application dependencies/source changed, no decoder regenerated, no install script approved.
- Checks: offline and full-graph red/green tests; ci with scripts disabled; targeted npm ls; all lock changes and audit inventories compared; existing decoder tests 17/17 before and 22/12 after; 50 app tests, typecheck/build and four isolated browser smoke checks passed. Emitted assets are identical. Details and actual limits: [evidence](../evidence/013-t01a-npm-resolution.md).
- Files: evidence 013 MD/JSON/Node test, prompt 015, this record, AI_USAGE, HANDOFF, plan and ATTRIBUTION. Historical evidence preserved. Base `2dfeff659419c18bac14d8e01f7046ba1af98d6a`; previous handoff base verified as an ancestor.
- B1 is not resolved by the graph workaround; 12 static decoder security failures remain. B2, SDK/VC integration, remaining manual acceptance and event eligibility questions remain. No chain request, wallet, signature, transaction, mentor message, push or merge.
