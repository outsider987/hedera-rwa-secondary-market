# Retained ECDSA dependency repair — September 6, 2026

**The six scoped repairs are retained for desktop Chrome + MetaMask ECDSA.
Native BBS is excluded from support and is not claimed binary-compatible.**
[Authorization](../prompts/023-vc-nova-implementation.md) ·
[Raw checks / complete audit](021-b2-retained-repair.json) ·
[Exact lock comparison](021-b2-retained-repair-lock.json) ·
[SDK browser / bundle inventory](021-b2-retained-repair-browser.json).

All **22 package-location changes match evidence 020 exactly**. The only
additional lock change is two root direct pins: Terminal3 vc_core 0.0.19 and
verify_vc 0.0.20. Ethers remains 6.17.0. Clean npm ci reproduces both existing
repairs and leaves the lock stable. No native install scripts were approved.

The unchanged 15 security/caller tests pass in a scripts-disabled copy; normal
installation passes 54 app tests + 36 proto tests, typecheck and build. Twenty
SDK browser cases pass across dev/preview desktop/mobile, including four live
payloads of 1. Four separate browser cases run genuine Terminal3 and reject
unsigned negative fixtures without wallet access or external requests. These
checks do not establish positive VC acceptance or native binary compatibility.

Full audit remains **62 (21 low, 25 moderate, 16 high, zero critical)**, with no
Terminal3-closure entries. Compared with the trial audit, four dependency
`effects` lists differ; advisory IDs, ranges, severity and affected paths do not.
The complete closure and bundle inventories are retained. TypeScript/Base peer
incompatibilities, large deferred chunks and the two dfns license gaps persist.
Tar is BlueOak-1.0.0; other changed targets are MIT. Prior verified native/Neon
notices and iniparser README license text remain applicable without a native
support claim. All upstream notices remain installed.

The user explicitly resolves the support decision for desktop ECDSA, clearing
this bounded dependency prerequisite for VC implementation. Remaining T01
human checks, a genuinely Admin-signed Seller VC and one preview NOVA deployment
remain Pending. No signature or transaction occurred in these checks.

The unchanged wallet harness also passes 20 cases after restarting the repo's
Vite servers following ci. Its first attempt found no rendered skip link; that
failed attempt is retained in the raw limitations. No app change was needed.
