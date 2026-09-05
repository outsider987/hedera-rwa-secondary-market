# Documentation navigation authorization — 2026-09-05

User request, verbatim:

> AI_USAGE 是不是可以變成一個folder 然後sitemap 未來要查看相關會更容易點? 我們討論看看這樣有沒有比較好 以免未來我們load context 太多 ?

The assistant inspected the repository and proposed a folder of work-item
records, keeping AI_USAGE.md as a short Markdown index; a separate current
third-party attribution list; and AGENTS/HANDOFF reading rules that require
current constraints while loading historical records and large evidence only
as needed. Original history would be moved intact. No website generator or
automatic indexing was proposed. The discussion made no file changes.

User implementation approval, verbatim: **“go”**.

## Scope / boundary

- Documentation maintenance only, starting at clean
  `09d8d3bda397da0810f144884f32dcbe5d779874` on the diagnostic branch.
- Allowed: `AGENTS.md` (reading/attribution workflow only), `AI_USAGE.md`,
  `README.md`, `docs/ATTRIBUTION.md`, `docs/HANDOFF.md`,
  `docs/plans/001-ats-first.md` (navigation and preserved deferred scope only),
  `docs/ai-usage/000-t00.md`, `001-t01a-triage.md`, `002-t01a-sdk-load.md`,
  `003-t01a-research.md`, `004-t01a-remediation.md`, `005-docs-navigation.md`
  under that directory, and this prompt record.
- Preserve all old AI usage section bodies, prompts, evidence, safety rules,
  asset parameters and effective authorizations. Keep the old source table as
  a historical snapshot; make current attribution explicit in its new file.
- Check exact historical-content preservation, local links/anchors, default
  reading routes, unchanged code/lock/evidence, and diff whitespace. No new
  application testing or indexing framework is needed for this move.
- Save one new AI usage entry and handoff with the work; English boundary
  commit, clean worktree. The maintenance task ends here; T01a remains blocked
  on security and T01b is inactive. No new repair, override or wallet authority.
