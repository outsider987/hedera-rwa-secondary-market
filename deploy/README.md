# HoldBook hackathon deployment

Target: GitHub Pages → Cloud Run Go API → Neon PostgreSQL. No Cloudflare service
or R2 bucket is needed for this slice. The existing NOVA illustration ships with
the frontend. Transactions remain manual, Hedera Testnet296 only, and only the
original public accounts can trade. This is not a public account onboarding flow.

## Resource inputs

Supply the Google Cloud project ID, chosen Cloud Run/Neon region, dedicated
runtime service account email and Secret Manager secret **name**. Credentials
belong in the cloud consoles, never chat, Git, Vite variables or build logs.
The current gcloud project is not automatically the approved deployment target.

In the chosen project, enable Cloud Run, Cloud Build, Artifact Registry and
Secret Manager. Use a dedicated runtime service account; grant it Secret Accessor
on the single database secret only. The build principal separately needs source
build/deployment permissions. Set the secret's value in Secret Manager to the
Neon connection URI with `sslmode=require` or `verify-full`. For this small demo,
a direct Neon connection is sufficient: each API instance has at most4 connections,
minimum0 and one-minute idle expiry; initial Cloud Run max instances is2.

## Preserve the market before cutover

An empty Neon database generates a new market salt and does not contain the
verified deployed settlement contract. Do not enable trading on that empty state.
Before cutover, resolve any outstanding wallet operation, pause local order
submissions, and migrate the current PostgreSQL database to the selected empty
Neon database using PostgreSQL dump/restore with a direct TLS connection.
Run credential-bearing commands in the owner's secure environment, without shell
tracing. Keep the private backup outside Git and public artifacts.

Preserve markets/salt, commands, orders, matches, settlements, settlement_operations,
settlement_events and settlement_deployment. Verify counts, salt and deployed
contract against the local source. Do not run local and cloud writers in parallel
against different copies. Do not redeploy a chain contract to compensate for a
missing database record. Browser localStorage is origin-specific: before switching
from localhost, finish/recover pending operations and retain their public IDs/hash.

## Cloud Run

From repository root, set only public identifiers:

```sh
PROJECT_ID=your-approved-project \
REGION=your-selected-region \
DATABASE_SECRET=holdbook-database-url \
SERVICE_ACCOUNT=holdbook-api@your-approved-project.iam.gserviceaccount.com \
./deploy/cloud-run.sh
```

The script uploads engine source, builds its existing Dockerfile, deploys with
PORT8080, CPU1/RAM512Mi, concurrency20, request timeout190s, min0/max2, and
Secret Manager injection. On first deployment it temporarily rejects HTTP hosts
until the assigned run.app hostname is configured. It prints the public API URL
and checks `/api/health`; it does not read the database secret.

Cloud Run is publicly reachable because browsers invoke it directly. Go validates
the exact API host and permits CORS only from `https://outsider987.github.io`,
GET/POST and Content-Type. CORS is a browser boundary, not account authorization;
existing signature and transaction checks still enforce the trading accounts.
Remote instances do not rely on a background ticker: normal store requests expire
stale orders. Server and Neon can cold-start; unknown operations remain pending
and are queried by original ID/hash, never automatically resubmitted.

## GitHub Pages

Expected frontend: `https://outsider987.github.io/hedera-rwa-secondary-market/`.
Enable Pages with GitHub Actions as the build source. Set the repository variable
`HOLDBOOK_API_ORIGIN` to the verified Cloud Run HTTPS origin (no trailing slash).
This is public configuration, not a secret. `.github/workflows/pages.yml` builds
on main or feat/t08-settlement pushes after that variable exists; it can also be
run manually once registered. The github-pages environment must permit the
selected deployment branch. It does not merge that branch into main.

The build uses `--base=/hedera-rwa-secondary-market/`, public API origin and Pages
origin; certificate URLs use BASE_URL. Existing hash navigation needs no server
routing. The workflow tests/typechecks before uploading only dist. GitHub Pages
hosts no database credentials. Do not set DATABASE_URL as a VITE variable.

## Acceptance and rollback

Check Pages images/tabs at desktop/mobile sizes, Cloud Run health, exact CORS
preflight/rejection, original market salt/counts/deployment, account/network
guards and cold-start recovery. A real signature or transaction requires Victor's
manual approval; browser fixtures are not live acceptance. Record deployed URLs,
Cloud Run revision, Pages commit and public readback before calling deployment done.
For rollback, route Cloud Run back to the last verified revision and redeploy the
previous Pages build; retain the same Neon data and original pending intents.

Sources: [Cloud Run contract](https://cloud.google.com/run/docs/container-contract),
[secret injection](https://cloud.google.com/run/docs/configuring/services/secrets),
[Neon connection pooling](https://neon.com/docs/connect/connection-pooling),
[Vite Pages deployment](https://vite.dev/guide/static-deploy.html#github-pages),
[Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Provisioned resources — September 9, 2026

- Google Cloud project: `holdbook-hackathon-2026`; region: `asia-southeast1`.
- Cloud Run service: `holdbook-api`; canonical API origin:
  `https://holdbook-api-6t7fccf54a-as.a.run.app`. Use this exact hostname; the
  alternate numeric Cloud Run URL is outside the application's host allowlist.
- Runtime identity: `holdbook-api@holdbook-hackathon-2026.iam.gserviceaccount.com`.
- Database secret name: `holdbook-database-url` (runtime injection only).
- Neon project: `round-darkness-20660180`, AWS Singapore, PostgreSQL18;
  database: `holdbook`, role: `holdbook_owner`, compute:0.25CU.
- Local `holdbook-market-api-1` is stopped after migration. Keep it stopped:
  its original database is preserved as the cutover source, not a second writer.

[Live deployment record](../docs/ai-usage/057-live-deployment.md) tracks public
acceptance and remaining manual wallet checks.
