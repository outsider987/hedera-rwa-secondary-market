# B2 isolated dependency trial — September 6, 2026

**The candidate passes the exercised security, caller and browser checks.
B2 is not fully cleared: native BBS binary compatibility remains unverified.
Repository application dependencies are unchanged.**

Victor activated this trial, then requested the existing work be pushed first.
Origin was verified at `9d9f62f` on `diagnostic/t01b-4-sdk-config`.
[Prompt](../prompts/022-b2-dependency-trial.md) · [Raw results](020-b2-dependency-trial.json).

| Check | Result |
| --- | --- |
| Security/caller TDD | Baseline: 8 pass / 7 fail; candidate: **15 pass / 0 fail** |
| Full audit | **80 → 62** entries; critical **1 → 0**; no new advisory IDs |
| Terminal3 closure | 196 → 192 package locations; affected entries **19 → 0** |
| Clean installation | Passed with unchanged script approvals; lock stable; retained repairs reproduced |
| Existing checks | 89 Node tests, typecheck and build passed in candidate |
| SDK browsers | 16 controlled + 4 live dev/preview desktop/mobile cases passed; all live payloads `1` |
| VC browsers | Four cases loaded public Terminal3 and rejected four unsigned negative fixtures each; no wallet access or external request |

Only the six proposed parent-scoped overrides were applied in disposable copies:
tar 7.5.22, toml 4.2.0, tmp 0.2.7, Undici 6.28.0 and UUID 11.1.1 at two parents.
Normal lock-only install with nested placement yields **22 changed lock
locations**, confined to these dependencies and their descendants. An initial
`npm update` also changed an unrelated UUID resolution; that result was rejected.
No lock entry was hand-edited, package upgraded outside scope or verifier patched.

Checks cover bounded tar traversal/link/depth/PAX/decompression fixtures, the
node-pre-gyp packaging/extraction APIs, neon Cargo parsing, TOML recursion and
prototype protection, temporary-file escape/cleanup, UUID bounds, and
http-client Agent/Undici behavior over local HTTP. Fixtures derive from the
maintainers' [tar](https://github.com/isaacs/node-tar/security/advisories/GHSA-r292-9mhp-454m),
[TOML](https://github.com/advisories/GHSA-v5mp-jgw5-2x6j),
[tmp](https://github.com/advisories/GHSA-ph9p-34f9-6g65),
[UUID](https://github.com/advisories/GHSA-w5hq-g745-h8pq) and
[Undici](https://github.com/advisories/GHSA-v3r7-h72x-cjcm) findings.
The first TOML test expected SyntaxError; its bounded, positioned Error is now
accepted while the baseline stack overflow still fails. No gate was waived.

The app bundle retains 359 package locations; only two bundled UUID versions
change. All 146 tested assets match the candidate build. Initial JavaScript
remains 562,314 bytes; SDK/Terminal3 loading stays manual. Desktop/mobile
screenshots were inspected. Large-chunk warnings and two existing peer problems
remain. Native BBS/neon license texts and iniparser's MIT README were verified;
tar's proposed license changes ISC → BlueOak-1.0.0. Existing dfns gaps remain.

Native-source tests used an install with scripts disabled. After normal ci,
95 optional closure locations, including the native binary package, are absent.
That does not prove native compatibility. The remaining 62 findings are not
waived. No valid signature, Admin-signed VC, real KYC or NOVA was created.
Human VC acceptance and mentor guidance on native support remain required.

Reproduction commands, hashes and complete comparisons are in the JSON.
The [runner](020-b2-dependency-trial.mjs) creates isolated copies;
the [Node checks](020-b2-dependency-trial.test.mjs) never instantiate a signer.
