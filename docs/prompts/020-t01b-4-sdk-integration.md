# T01b-4 app SDK config integration — September 6, 2026

Victor replied **“接吧”** to integrating the verified SDK config path into the main page. Base: `95b00f958e5487a1680e3e277c49397d4ff79947`; the previous handoff base is an ancestor. This activates the exact next ticket in HANDOFF. No push/merge, VC or NOVA creation is included.

Keep the existing viem deployment/config preflight and ATS load diagnostic. Add explicit manual SDK preparation and config checking using the patched public entry and caller-owned ethers provider from evidence 017. Distinguish viem results from SDK payloads. Reuse installed libraries and existing styles; no manifest, lock or patch changes.

Allowed source/tests: `src/ats.ts`, `src/App.tsx`, `src/deployment.ts`; `tests/ats.test.mjs`, `tests/deployment.test.mjs`, `tests/shell.test.mjs`. New evidence: `018-t01b-4-sdk-integration.mjs/.md/.json`; this prompt; work record `024-t01b-4-sdk-integration.md`; HANDOFF, plan, ATTRIBUTION and AI_USAGE. Preserve historical evidence, wallet behavior and approved asset parameters.

Use TDD. Verify RPC chain 296 and the fixed contracts before feeding the fresh Resolver EVM address into the SDK. Accept only safe integer payload >= 1. Share one native cancellation/deadline across preflight, SDK fetch and body consumption; serialize pending work and destroy providers. Invalidate old results on cancellation, relevant wallet transitions and reload. No automatic retries, redirects, CCIP gateway, unapproved request, wallet initialization, signature or transaction.

Run npm ci/test/typecheck/build, actual SDK dev/preview desktop/mobile browsers with controlled responses and separate live reads, and full rendered dependency accounting. Cover invalid payloads, deadlines including delayed body, cancellation, late results, duplicate clicks, reload, manual retry, HTTP/RPC errors and forbidden transports. Recheck existing wallet/deployment behavior. Keep evidence summaries about one page, in English. B2, VC and remaining human checks remain open. Commit work and documents together at this boundary; do not start the next ticket automatically.
