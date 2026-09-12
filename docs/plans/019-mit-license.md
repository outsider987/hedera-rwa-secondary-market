# MIT licensing — September 12, 2026

Base: `1497e62a70d503b34d30d00866678c0cf2f245c2`, verified main HEAD and clean tree.
After the explanation of commercial and closed-source reuse, Victor explicitly
selected `MIT`. This supersedes the earlier license-undecided/no-selection
boundary for this task. The existing authorization to finish and publish the
submission preparation covers normal publication of this selected license.

## Exact scope

- Add the unmodified MIT license text, using the existing Git author identity
  Victor Chang and 2026. Apply it to project-original software and associated
  software documentation only to the extent of rights held; preserve third-party
  terms, notices and known gaps. No additional rights to footage, likenesses,
  trademarks or third-party assets are inferred.
- Set root package/lock metadata to MIT with no dependency resolution change.
- Change only the SPDX line in the two custom contracts and their two tests.
  Regenerate the three existing artifacts with the pinned scripts. Require that
  only sourceSha256 changes: ABI, creation/runtime bytecode, immutable references
  and all other artifact fields must be identical to the approved base.
- Update current submission materials and add a dated licensing explanation.
  Preserve earlier evidence and the public verifier's original metadata snapshot.
  No source-verification resubmission, deployment, wallet or chain action.

Allowed files: LICENSE; package.json; package-lock.json;
contracts/NovaSettlement.sol; contracts/NovaHbarSwap.sol;
contracts/test/NovaSettlement.t.sol; contracts/test/NovaHbarSwap.t.sol;
src/data/settlement-artifact.json; src/data/swap-artifact.json;
engine/internal/service/data/settlement-artifact.json; README.md;
docs/LICENSING.md; docs/SUBMISSION.md; docs/SUBMISSION_FIELDS.md;
docs/SOURCE_VERIFICATION.md; docs/ATTRIBUTION.md; docs/HANDOFF.md; AI_USAGE.md;
this plan; docs/ai-usage/074-mit-license.md;
docs/evidence/058-mit-license.md; docs/evidence/058-mit-license.json.
Scratch outputs stay in the current Codex task's work/licensing/ directory.
Update its outputs/HoldBook_English_Submission.md and
outputs/ETHGlobal_提交完成進度.md to resolve the license decision; do not edit video.

## Checks and boundary

Run pinned npm ci, npm test, typecheck, both builds, artifact checks and Foundry
tests; verify SPDX/license consistency, no dependency changes and exact
non-hash artifact equality. Check dev/preview read-only pages, local links and
diff hygiene. Record actual checks before commit, then normal push to main,
wait for CI/Pages and confirm public license detection and read-only entry points.
No force push or failed-check bypass. No API restart, database reset, dependency
upgrade, ETHGlobal final submission or unrelated ticket. Next ticket: none.
