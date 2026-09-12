# HoldBook licensing

On September 12, 2026, Victor selected the [MIT License](../LICENSE) after an
explanation that it permits commercial reuse and closed-source derivatives,
subject to retaining the required copyright and permission notices. Earlier
dated records of an undecided license describe the state before this decision.

## Scope

Project-original source code, smart contracts, tests, scripts and associated
software documentation are MIT-licensed to the extent of the rights held by
their contributors. This does not claim exclusive copyright in AI-generated
material or a complete legal clearance of every dependency.

Third-party code and incorporated materials retain their own licenses and
notices. ATS SDK/contracts retain Apache-2.0 terms; OpenZeppelin and other
dependencies retain their respective terms. Do not replace upstream notices
with the project's MIT header. Existing missing upstream license metadata and
other limitations remain disclosed in [ATTRIBUTION](ATTRIBUTION.md).

This software-license decision does not grant additional rights in Victor's
recorded video, voice or likeness, trademarks, or external/third-party assets.
Presentation artwork provenance remains documented in ATTRIBUTION; no exclusive
ownership or independently verified rights clearance is asserted for AI output.

## Existing contracts and source verification

Only the SPDX header changes in NovaSettlement, NovaHbarSwap and their tests.
The pinned artifact generators update each project's sourceSha256 accordingly.
Checks confirmed identical ABI, creation/runtime bytecode, immutable
references and all other artifact fields compared with the pre-license base.
The license update neither authorizes nor requires a new deployment or trade.

The earlier Sourcify/HashScan verification snapshot may still show the original
`UNLICENSED` metadata. It records the exact source used for that verification,
not the current repository's license decision. We retain that historical evidence
and separately publish this dated MIT grant; no metadata snapshot or earlier
transaction is rewritten. See [verification](SOURCE_VERIFICATION.md) and
[licensing checks](evidence/058-mit-license.md).

## References

The license text follows the [Open Source Initiative MIT text](https://opensource.org/license/mit).
The [Apache 2.0 redistribution conditions](https://www.apache.org/licenses/LICENSE-2.0)
continue to apply to the relevant upstream material. This license selection is
not an organizer eligibility ruling, a security audit or a legal opinion.
