# GitHub Pages / Cloud Run / Neon deployment preparation

September 9, 2026. Base87a72d1c821d22eae22d71d4730c71ef6b1d3e55.
User selected Cloudflare/Cloud Run/Neon, then replaced the frontend with GitHub
Pages and explicitly requested starting deployment for the hackathon. [Plan009](../plans/009-cloud-deployment.md)
records the current scope. Codex used active Ponytail rules and official platform
documentation; the temporary uncommitted Cloudflare Worker files were removed.

Go reads PORT, DATABASE_URL, PUBLIC_ORIGIN and API_HOST, preserving Compose defaults.
Remote configuration requires TLS for PostgreSQL and exact HTTPS origin/host.
CORS allows only the approved origin, GET/POST and Content-Type; no cookies or
forwarded-host trust. Database connections are capped at4 per instance and idle
connections expire; cloud instances use request-driven expiry instead of relying
on background CPU. Local ticking and all signature/receipt checks remain intact.
Only current market/settlement origin guards are configurable; closed historical
issuance and lifecycle mutation restrictions are unchanged.

Frontend API URL and production origin are explicit public build settings.
Certificate assets respect the GitHub Pages base path. Pages workflow runs tests
and typecheck before publishing; it waits for HOLDBOOK_API_ORIGIN. The Cloud Run
script takes only public resource identifiers and references a Secret Manager
secret. No database secret was requested, read or printed. [Deployment guide](../../deploy/README.md)
documents migration of the existing market and pending-intent origin boundaries.

Validation: npm ci,116 app+36 protobuf tests, typecheck, app/showcase builds and
Pages subpath build passed. Go integration tests on disposable PostgreSQL, race,
vet and static API build passed. Shell syntax passed. Browser results are in
[local regression](../evidence/046-cloud-local.json) and
[Pages build checks](../evidence/046-cloud-pages.json); fixtures use isolated
wallets and synthetic API data, never signatures or chain submissions. A first
Pages harness assumed Playwright routing would expose automatic preflight; its
mock bypasses it, so automatic/live CORS is not claimed. Exact preflight policy
is covered by the Go HTTP tests. Existing build/dependency warnings remain.
The disposable test database was removed; the live local API/database are unchanged.

External progress: enabled GitHub Pages with workflow builds on the repository,
and allowed feat/t08-settlement alongside the existing main deployment branch.
The assigned URL is https://outsider987.github.io/hedera-rwa-secondary-market/;
no Pages artifact has been deployed yet. The active gcloud account points to a
work project; it was not used for deployment. The user must identify the approved
Google Cloud project and Neon target/access path. Backend deployment, data
migration, HOLDBOOK_API_ORIGIN, Pages publishing and live readback remain pending.
No merge, cloud resource spending or chain action occurred. This ticket remains
active at that configuration boundary; do not describe preparation as live deployment.
