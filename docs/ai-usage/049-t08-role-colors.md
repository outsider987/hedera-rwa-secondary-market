# T08 connected role colors

September 8, 2026. Base `a4cb2ec2422ca5676f8552573bb5d77495577334`
verified Git HEAD; prior handoff base a1d5066 is an ancestor. Clean starting tree.
User requested “我們不同角色連結時顏色要不一樣的”; prior instruction to use
installed Tailwind remains effective. Codex applied Ponytail and Impeccable.

Header now colors the pinned opaque surface and explicit role label: Admin
purple, Seller amber, Buyer blue using Tailwind 50 backgrounds and 900 text.
Roles still come from the existing pinned account lookup in App; colors identify
accounts, not match buy/sell sides or transaction success. Disconnected state
clears role color even if a stale role prop exists. Connected accounts without a
known role display Unassigned account and neutral colors. Wallet callbacks,
operation locks and chain behavior are unchanged. No new dependencies or assets;
existing Tailwind attribution remains in docs/ATTRIBUTION.md.

Affected: src/Header.tsx, tests/shell.test.mjs, DESIGN.md, spec004, HANDOFF,
AI_USAGE, this entry, evidence041 browser harness/JSON/desktop/mobile captures.
Checks: initial npm ci was terminated with SIGTERM; retry with
`npm ci --prefer-offline --no-audit` passed using the unchanged lockfile and
required project postinstall repairs. npm test passed 113 app +36 protobuf tests;
typecheck and application/showcase builds passed. Four isolated Chrome cases
(dev5173/preview4173 ×1440/390px) passed all three role colors, account switching,
unknown-account and disconnect neutral reset, sticky positioning and no overflow.
Measured role-label contrast: Admin10.23:1, Seller8.73:1, Buyer9.53:1. Both
preview captures visually inspected. Impeccable detector found no issues in Header.
Existing optional install-script restrictions and chunk-size warnings remain;
this retry skipped a fresh dependency audit, not application validation.

[Browser harness](../evidence/041-t08-role-colors.mjs),
[raw results](../evidence/041-t08-role-colors.json),
[Admin desktop](../evidence/041-t08-role-colors-desktop.png),
[Seller mobile](../evidence/041-t08-role-colors-mobile.png).
Harness accepts the installed Playwright module path. It uses an isolated
read-only provider double and blocked API/RPC reads, not a real MetaMask profile;
the screenshots' lookup errors are controlled unavailable-data states.

Remaining T08 work is unchanged: Victor browser reload confirmation, final static
showcase and documentation/checks. Four chain cases and API persistence were
already verified in the prior handoff. No next ticket, human review, real wallet
signature, transaction, push, merge or publication is claimed for this change.
