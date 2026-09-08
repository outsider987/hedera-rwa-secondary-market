# Authorized T04 integration — September 8, 2026

Base: `b1212e6b80b6f52f15be7e526aa6b3ddf0a3b994`. Victor explicitly requested
“好推送合併吧” after completed T04 acceptance. This authorizes pushing the
current branch and merging it into main after CI passes, superseding the
previous local-only boundary for this integration.

Codex checked AGENTS, HANDOFF, the plan, acceptance summary, Git history and
clean status. Fetched main remains `61c411d70235ce7d882a8b4c84150e9b3c636d8c`;
there was no existing T04 PR. The documented repair base is an ancestor of HEAD.
Only this record, AI_USAGE, HANDOFF and the main plan change for integration.
No application, dependency, patch or evidence changes are needed.

Evidence [028](../evidence/028-t04-implementation.md) and
[029](../evidence/029-t04-manual.md) retain actual implementation, browser and
manual checks, including npm ci, 87 app + 36 proto tests, typecheck and build.
The PR workflow repeats pinned installation, npm ci, tests, typecheck and build.
Merge only after success on the final PR head; retain a merge commit and verify
remote main includes that head. GitHub PR/check history supplies the actual CI
outcome and merge hash without predicting them in this pre-merge record.

T04 stays complete: Seller 94, Buyer 6, both held 0 at acceptance block 40241114.
No further chain mutation/signature or next ticket is activated. Native BBS,
audit/peer/license and eligibility limitations remain disclosed in evidence 029.
