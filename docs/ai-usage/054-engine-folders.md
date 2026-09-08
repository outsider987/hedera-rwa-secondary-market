# Engine package organization

September 9, 2026. Baseb6f60027a2fd8f002e741a8725f5be82428a11bf.
User:「egine 同樣的也要分類下」. Codex continued active Ponytail rules and
[bounded plan008](../plans/008-engine-folders.md).

The pure order book and its tests move to internal/matching. API, auth,
PostgreSQL and settlement files and tests move to internal/service; cmd/api
wires that package. Embedded SQL lives in service/migrations and the contract
artifact in service/data. CI points fuzzing at matching; the artifact build
script writes/checks the new path. Architecture links and folder guide updated.

Seven production modules compare equal after normalizing package/import
qualification and the shared canonical-address predicate. JSON and both SQL
migrations are byte-identical. Matching exposes its existing address check as
ValidAddress for service callers. Two small test helpers are local to each
package instead of creating a production test utility package. Initial compile
checks identified those previously shared test helpers; they were restored before
validation. No API payload, migration, dependency, storage or signing change.

Validation: Go1.27.1 passed22 test/subcase results with no skips against real
PostgreSQL18.6; race, vet, fuzz (56,734 executions) and both normal/static API
builds passed. npm ci,114 app+36 protobuf tests, typecheck, app/showcase builds
and settlement artifact --check passed. [Raw engine results](../evidence/045-engine-folders.json)
retain package outcomes, fuzz and race output. Existing dependency, bundle and
Solidity lint warnings remain. Four isolated dev/preview desktop/mobile browser regression cases passed;
[results](../evidence/045-engine-browser.json) and
[harness](../evidence/045-engine-browser.mjs) preserve the checks without duplicate
screenshots for an unchanged UI. The PostgreSQL container created for this work uses an
isolated disposable holdbook_test database and existing explicit verifier doubles.
The running API and its database are not restarted or modified. Frontend browser
fixtures are separate smoke checks, not validation of a deployed new API binary.
No wallet signing, chain submission, push, merge or publication. Stop locally;
no next ticket or additional files authorized.
