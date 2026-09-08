# T08 matched settlement — milestone 1

September 8, 2026. Base: `3088cb9e19abffdc3c6ed58e698c62a11d88f79e`.
User authorized [spec 004](../plans/004-matched-settlement.md) and local commits;
[prompt record](../prompts/031-t08-settlement.md). Codex with ponytail assistance
implemented contracts/NovaSettlement.sol and its tests, exact artifact builder,
Go settlement service/migration/verification tests, runtime CA support, public
shared vector and dependency pins. Package sources/licenses are recorded in
[attribution](../ATTRIBUTION.md). No private-key signer is instantiated.

31 Foundry tests, reproducible T05/T08 artifact checks, real PostgreSQL test/race,
vet and conservation fuzz (35,717 executions) passed. API rebuild/restart and actual
database outage/recovery preserve the nine historical orders and five matches;
offline API returns503. Before/after commit faults and duplicate evidence are
covered in dedicated holdbook_test, never by deleting operator data.

UI/snapshot and its final evidence are the next authorized milestone. Manual
MetaMask deployment and four live acceptance cases remain pending. No push,
merge, public deployment, human review or event eligibility is claimed.
