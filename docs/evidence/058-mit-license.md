# MIT licensing checks — September 12, 2026

Base `1497e62a70d503b34d30d00866678c0cf2f245c2`; Victor explicitly chose MIT.
The change is limited to license text/metadata, four original Solidity SPDX
headers, their generated source hashes and associated documents.

Pinned npm ci, 132 application tests, 36 protobuf tests, typecheck, main/showcase
builds, both artifact checks and 31 Foundry tests passed. All four original
Solidity files differ only in their SPDX line. Root package/lock JSON differ
only in the new MIT metadata; dependency resolution is identical to the base.

All three regenerated artifacts differ only in sourceSha256. ABI, creation and
runtime bytecode, immutable references and every other field are byte-for-byte
or structurally identical to the base. The source hashes match the MIT-header
files. Read-only Testnet runtime checks passed for both custom contracts;
Sourcify still returns their original successful matches. No verification upload
was sent. The original evidence057 and third-party notice text are unchanged.

Five isolated dev/preview browser cases passed, covering desktop/390px tabs,
image decoding, overflow/error checks and all four standalone outcomes. Public
API GET snapshots are replayed locally; this is not a new wallet or chain test.
All 61 initially checked local document links exist; git diff --check passed.
[Exact hashes and observations](058-mit-license.json).

Normal publication follows the user's standing submission authorization. Its
actual CI/Pages and GitHub license-detection outcome is reported through Actions
for the containing commit and the delivered completion checklist; this record
does not invent a future commit hash or deployment result.

Third-party licenses/notices and earlier source-verification evidence are retained.
Existing dependency audit findings (62: 21 low, 25 moderate, 16 high), install,
build, compiler and upstream-license limitations remain. No wallet or chain action,
backend redeployment, original API restart, database reset or event submission.
Licensing scope and external text references: [LICENSING](../LICENSING.md).
