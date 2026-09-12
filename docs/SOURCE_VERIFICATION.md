# Deployed source verification

Subsequent license update, September 12, 2026: Victor selected MIT for the
project-original software. The current contract SPDX headers follow that choice;
the original verifier metadata below is retained as a historical snapshot.
See [LICENSING](LICENSING.md) and [artifact equivalence checks](evidence/058-mit-license.md).

September 12, 2026. This page distinguishes public source matching from the
application's own runtime/receipt checks. It is not a security audit or legal
license grant, and does not deploy or transact with a contract.

| Contract | Existing Testnet address | Verification |
| --- | --- | --- |
| T08 NovaSettlement | `0xa90da61f67c37473f38000e70623a77ad277304c` / `0.0.10419889` | Creation and runtime **match**, 07:11:01 UTC · [Source](https://repo.sourcify.dev/296/0xa90da61f67c37473f38000e70623a77ad277304c) |
| Historical T05 NovaHbarSwap | `0xf6fc50413cd10d0e82a2f3c30b5bf6878a45f158` | Creation and runtime **match**, 07:11:02 UTC · [Source](https://repo.sourcify.dev/296/0xf6fc50413cd10d0e82a2f3c30b5bf6878a45f158) |
| ATS-created NOVA | `0x261ce349df182988fa25d00868cf6cf434220c24` / `0.0.10402368` | Creation and runtime **exact_match**, 07:13:33 UTC · [Source](https://repo.sourcify.dev/296/0x261ce349df182988fa25d00868cf6cf434220c24) |

The original custom contracts use Solidity 0.8.36, Paris EVM, optimizer 200,
with CBOR metadata disabled. Sources preserve their existing license notices.
No bytecode, account, asset parameter, constructor or existing transaction changes.
The custom contracts' service status is `match`, not `exact_match`; the absence
of embedded metadata is preserved, not rewritten to obtain a stronger label.

For NOVA, the published ATS package referenced a build-info file that was not
included. The official Sourcify similarity endpoint instead reused existing
public compilation inputs and performed its normal verification; both creation
and runtime returned `exact_match`. No missing metadata was invented. This
verifies the deployed proxy source, not all possible resolver facets or a
security audit of the entire ATS system.

HashScan links: [T08](https://hashscan.io/testnet/contract/0.0.10419889),
[NOVA](https://hashscan.io/testnet/contract/0.0.10402368),
[T05](https://hashscan.io/testnet/contract/0xf6fc50413cd10d0e82a2f3c30b5bf6878a45f158).
Fresh isolated public HashScan pages were also inspected: all three display
`VERIFIED`; the custom contracts display `Partial Match`, and NOVA's ResolverProxy
displays `Full Match`. The deep-link HTTP shells returned 404 before the client
routes rendered the correct contract identities and verification states; the
actual status and rendered observations are preserved in the evidence. No
wallet connection or re-verification button was used.

`scripts/verify-public-contracts.mjs` accepts only the two fixed custom targets,
declared Solidity source paths and their exact metadata hashes. It confirms
Testnet 296 and deployed runtime (masking only declared immutable spans for the
old swap) before preparing a request. Only `eth_chainId` and `eth_getCode` are
used for RPC. Publication requires an explicit `--submit`; no signer exists.

After pinned artifact checks, an authorized operator may run:

```sh
node scripts/verify-public-contracts.mjs settlement --out-dir /path/to/scratch
node scripts/verify-public-contracts.mjs settlement --out-dir /path/to/scratch --submit
```

Public responses and actual result are recorded in
[verification evidence](evidence/057-contract-verification.json), not inferred
from a queued job. A failed/unknown response is not a successful verification.

Sources: [Sourcify API](https://docs.sourcify.dev/docs/api/),
[similarity verification](https://docs.sourcify.dev/docs/similarity-verification/),
[Hedera metadata verification](https://docs.hedera.com/api-reference/verify-contracts/verify-contract-using-solidity-metadatajson),
[HashScan/Sourcify integration](https://hedera.com/blog/smart-contract-verification-sourcify-dev-now-supported/).
