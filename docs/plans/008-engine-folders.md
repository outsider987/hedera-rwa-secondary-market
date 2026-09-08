# Engine package organization

September 9, 2026. Baseb6f60027a2fd8f002e741a8725f5be82428a11bf.
User requests the same folder organization for engine. Extract the pure book into
internal/matching; keep coupled API, PostgreSQL, authentication and settlement
implementation in internal/service; cmd/api remains the entrypoint. Tests stay
beside their package. Service owns embedded migrations and data. No dependency,
SQL, HTTP contract, matching policy, signing or chain behavior changes.
Allowed: engine relocation/package imports and address validation boundary;
scripts/build-settlement.mjs artifact path; .github/workflows/ci.yml fuzz path;
README.md/docs/ARCHITECTURE.md current paths and folder guide; this plan,
AI_USAGE.md, docs/HANDOFF.md, docs/ai-usage/054-engine-folders.md;
docs/evidence/045-engine-folders.json/.md and 045-engine-browser.mjs/.json.
Checks: Go test/race/vet/fuzz and binary build with pinned Go, dedicated disposable
PostgreSQL only; npm ci/test/typecheck/both builds and artifact --check;
isolated dev/preview browser smoke. No running API restart or live DB mutation.
Stop at local commit, no subsequent ticket or publication.
