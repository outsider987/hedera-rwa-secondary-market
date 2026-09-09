# Cloud deployment preparation

September 9, 2026. Base87a72d1c821d22eae22d71d4730c71ef6b1d3e55.
User selected GitHub Pages frontend, Cloud Run Go API and Neon PostgreSQL,
and asked to deploy this project. Prepare reviewable configuration and code;
actual resource targets depend on the user's project/domain choices. Do not
infer authorization to deploy to the currently selected work gcloud project.
Never expose connection credentials. Runtime loads DATABASE_URL via Secret Manager.

Scope: engine/cmd/api configuration/tests; service HTTP host/origin configuration
and tests, bounded connection pool and tick behavior; src/lib/runtime.ts and
market/settlement plus their components' production-origin guards; tests/runtime;
GitHub Pages workflow, Vite base path and illustration URLs; deploy documentation
and Cloud Run commands; tests/runtime and CORS checks;
compose.yaml explicit local configuration if needed; docs/ATTRIBUTION.md,
docs/HANDOFF.md, AI_USAGE.md, docs/ai-usage/056-cloud-deployment.md;
docs/evidence/046-cloud-deployment results/harness. Existing pinning, asset,
accounts, closed historical mutations and manual signing persist.

The frontend calls the explicit HTTPS API origin; CORS permits only the Pages
origin, GET/POST and Content-Type preflight, without cookies. Cloud Run listens on PORT on all
interfaces; explicit production origin and API host are required remotely.
Neon stores durable data, never container disk. Preserve current market salt,
orders and verified deployment during data migration before enabling live use;
a fresh empty database is not an equivalent continuation of the current market.
R2 is deferred until a real upload requirement; bundled illustration stays static.

Checks: Go tests/race/vet with disposable PostgreSQL, frontend npm ci/test/typecheck
and builds, CORS boundary tests, isolated local browser regression.
No real wallet signing or automatic chain transaction. Do not claim cloud deployed
without remote verification. Record target/access blockers if user input is absent.

## CLI provisioning authorized — September 9

User requested a different Google Cloud project, CLI access for Neon, completed
browser authentication, and said “go” to creation and deployment. Dedicated
project holdbook-hackathon-2026 uses the authenticated personal account's existing
active billing account. Neon project round-darkness-20660180 is dedicated to
HoldBook in organization Outsider987, AWS Singapore; Cloud Run is asia-southeast1.
Scope also includes deployment provenance057 and public evidence047.
