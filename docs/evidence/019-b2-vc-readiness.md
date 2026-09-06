# B2 VC dependency readiness — September 6, 2026

**Research complete; B2 remains open. A scoped dependency trial is defined,
but no compatible repair or accepted VC is claimed.** [Prompt](../prompts/021-b2-vc-readiness.md).

The inspection covers all **196** Terminal3 dependency/optional/peer locations:
98 installed, 98 lock-only, 19 audit entries; 48 appeared in the previous lazy
bundle. The full audit remains **80** findings with unchanged advisory ranges.
[Inventory, source hashes and registry snapshots](019-b2-vc-readiness.json).

| Path / concern | Proposed trial target; not installed |
| --- | --- |
| BBS 1.4.0 → native 0.18.1 → node-pre-gyp 1.0.11 → tar 6.2.1 | Scope tar **7.5.22** to node-pre-gyp |
| Native → neon-cli 0.10.1 → toml 3.0.0 | Scope toml **4.2.0** to neon-cli |
| neon-cli → inquirer → external-editor 3.1.0 → tmp 0.0.33 | Scope tmp **0.2.7** to external-editor |
| JSON-LD → http-client 3.4.1 → undici 5.29.0 | Scope undici **6.28.0** to http-client |
| vc_core 0.0.19 and bbs_vc 0.2.18 → uuid 10.0.0 | Scope uuid **11.1.1** to both parents |

All cross parent ranges; clean-install, API and security tests are mandatory.
Tar changes ISC to BlueOak-1.0.0; other candidates declare MIT. Native/neon
and iniparser license files need inspection before any native installation;
iniparser lacks lock license metadata. Existing dfns license/peer issues remain.
No optional scripts were newly approved. No blanket override or audit force-fix.
The [tar](https://github.com/isaacs/node-tar/security/advisories/GHSA-r292-9mhp-454m),
[toml](https://github.com/advisories/GHSA-82x6-q7mm-w9cf),
[tmp](https://github.com/advisories/GHSA-ph9p-34f9-6g65),
[uuid](https://github.com/advisories/GHSA-w5hq-g745-h8pq) and
[Undici](https://github.com/nodejs/undici/security/advisories) records inform the
candidate versions; the JSON retains every applicable audit advisory.

Latest Terminal3 still depends on BBS 1.x/uuid 10; even BBS 2.0's native package
retains node-pre-gyp 1.0.11. Upgrading these alone is not a complete remedy.
Tar-only repair leaves toml/tmp/Undici/uuid. Skipping optional installs does not
repair the lock or prove cross-platform safety.

The pinned verifier dispatches ECDSA to the genuine Terminal3 implementation.
It hashes JSON, then verifies the hash's **UTF-8 string**; ethers **6.17.0** is
within every Terminal3 ethers range. Keep it for the trial; 6.15.0 has no
demonstrated advantage. VC runtime compatibility is still untested. Later UI
must enforce expected issuer/subject, finite ordered dates and fixed claims:
generic signature verification alone does not enforce these application rules.
Never use the upstream private-key issuer. ATS verifies before converting dates
and checking the target; pass a copy of the signed payload in future integration.

Actual checks: ci, 89 Node tests, typecheck/build, inspection assertions and
four unchanged-app browser smoke cases (dev/preview, desktop/mobile) passed.
These use controlled reads, not VC signatures. Manifest/lock/repairs are
unchanged. The user's screenshot proves one displayed SDK payload `1`; the
remaining human checklist persists. [Next trial scope](../HANDOFF.md#next-action--exact-allowed-files).
