# AI usage / attribution

## 2026-09-05 — T00-min guardrails

- Tool: Codex coding assistant. The exact runtime model identifier is not
  recorded here; model names discussed during planning are not proof of it.
- Human direction: Victor supplied the earlier ATS-first handoff, requested
  review and replanning, selected an ATS-only first slice, three accounts,
  a localhost English console, synthetic MetaMask-signed VCs, and then requested
  implementation of the approved plan.
- AI assistance: reviewed public npm package metadata and ATS/Terminal3 source;
  authored repository rules, README, the approved plan, prompt/decision record,
  and handoff. No chain calls were signed or submitted.
- Files: `AGENTS.md`, `.gitignore`, `README.md`, `AI_USAGE.md`,
  `docs/plans/001-ats-first.md`, `docs/prompts/001-planning-record.md`,
  `docs/HANDOFF.md`.
- Checks: confirmed the local directory had no Git repository or source files;
  confirmed the GitHub login is `outsider987` and the target repository was not
  yet present; queried npm for the pinned versions. Build/browser checks are
  not applicable until the shell is added.
- Human code review, event eligibility approval, MetaMask testing, and Testnet
  execution have not been evidenced. Do not infer them from this entry.

## Third-party sources

| Material | Use / license |
| --- | --- |
| React / React DOM 19.2.8 | UI library; MIT; https://github.com/facebook/react |
| Vite 8.2.2 | Dev/build tooling; MIT; https://github.com/vitejs/vite |
| TypeScript 7.0.2 | Type checking; Apache-2.0; https://github.com/microsoft/TypeScript |
| ATS SDK 8.0.0 | Pinned for T01, not yet integrated; Apache-2.0; https://github.com/hashgraph/asset-tokenization-studio |
| DefinitelyTyped React types | Type declarations; MIT; https://github.com/DefinitelyTyped/DefinitelyTyped |
| Node.js / npm | Runtime/package manager; their upstream licenses apply |
| GitHub checkout / setup-node actions | CI tooling; MIT; https://github.com/actions |
| Terminal3 published package sources | Planning reference only in T00; no VC code copied into the app |
| Ponytail / Impeccable skills | AI workflow guidance, not application code or bundled assets; the approved minimal-shell scope overrides branding/animation workflows |

No logos, stock images, starter application, or pre-event master-plan file were
copied into this repository. The prior user-supplied planning text was used and
is disclosed separately; it must not be presented as newly discovered work.

## 2026-09-05 — T00-min shell / validation

- AI authored the static English React shell, native CSS, HTML entry, exact npm
  manifest/runtime pins, TypeScript configuration, Node built-in smoke test,
  read-only-permission GitHub CI, PRODUCT record, setup instructions and evidence.
- Files: `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `index.html`,
  `package.json`, `package-lock.json` (npm-generated), `.npmrc`, `.nvmrc`,
  `tsconfig.json`, `tests/shell.test.mjs`, `.github/workflows/ci.yml`,
  `PRODUCT.md`, `README.md`, `docs/evidence/000-t00-validation.md`, handoff,
  this file and the appended original imported planning text.
- Checks: clean npm ci, 1 Node smoke test, typecheck, production build;
  four isolated Chrome dev/preview desktop/mobile scenarios. Fixed a favicon
  404 discovered by browser validation. The static detector returned no findings.
- A separately spawned read-only Impeccable finish reviewer inspected source
  and all four captures and returned **ship** for the minimal T00 shell. No
  branding, generated imagery, animation or design-system work was introduced.
- Playwright 1.63.0 was an ephemeral diagnostic tool only (Apache-2.0,
  https://github.com/microsoft/playwright), not a new project dependency.
- npm audit warnings are preserved in the evidence; they were NOT fixed or
  waived. ATS was pinned but never imported or connected.
- GitHub repo creation and incremental commits/pushes follow the user's
  explicit approved plan. No private keys, wallet profiles or signatures used.
- Human code review, event eligibility approval and MetaMask/chain testing
  remain unevidenced. Remote CI is recorded separately after its actual run.
