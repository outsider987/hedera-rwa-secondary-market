# B2 isolated dependency trial — September 6, 2026

- Victor's “開始吧” activated the exact trial; “對了,先推送吧” then authorized
  pushing existing committed work first. Origin was verified at base
  `9d9f62f8fd1a4aa2b24069937540a8f5da4579fa`; no merge or future push implied.
  [Prompt 022](../prompts/022-b2-dependency-trial.md). Prior handoff base is an ancestor.
- Codex used Ponytail, published caller source, maintainer advisories, native
  Node tests, npm and external Playwright. No subagents or mentor messages.
- Implemented disposable-copy orchestration, 15 bounded security/caller tests
  and unsigned negative public-verifier browser checks. No app, repository
  manifest/lock, retained patch or cryptographic implementation changed.
- TDD: final baseline 8 pass / 7 fail; same candidate checks 15/15 pass.
  Initial fixtures were strengthened to exercise actual TMP/TOML/Undici
  advisories. The initial TOML depth oracle wrongly required SyntaxError;
  source inspection established a bounded Error with line/column. The corrected
  oracle still rejects baseline RangeError. Initial npm update caused unrelated
  UUID drift; a fresh lock-only install avoided it without hand-editing the lock.
- [Evidence 020](../evidence/020-b2-dependency-trial.md): clean install, 89 app/proto
  tests, typecheck/build, 20 SDK browser cases (four live payloads 1), four VC
  browser cases, full audit/lock/bundle/license comparisons. No signature accepted.
  Native BBS binary compatibility and full B2 remain open despite zero audit
  entries in the candidate Terminal3 closure. Full audit still has 62 entries.
- Files: evidence 020 runner/tests/MD/JSON; prompt 022; this entry; HANDOFF,
  plan, ATTRIBUTION and AI_USAGE. Disposable artifacts were removed after their
  public results were saved. Existing app servers and historical evidence remain.
  Commit trial records locally; no automatic retained repair or additional push.
