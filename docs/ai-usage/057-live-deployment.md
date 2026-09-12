# CLI cloud provisioning and deployment

September 9, 2026. Base871518f9d6b83fa3ff5b52bc09787aabd9d1dbce.
User requested another Google project and Neon CLI, completed browser login,
then said “go”. Codex used native gcloud/gh, pinned ephemeral neonctl4.14.5,
and existing deployment code under plan009. No application dependency changed.

Created holdbook-hackathon-2026 under the authenticated personal Google account
and linked its existing active billing account. Enabled Cloud Run, Cloud Build,
Artifact Registry and Secret Manager. Dedicated runtime service account can
access only the database secret; the build identity has Cloud Run Builder.
Neon round-darkness-20660180 uses PostgreSQL18, 0.25CU in AWS Singapore.
Credentials passed directly from Neon CLI into Secret Manager through a pipe;
no credential value was displayed or stored in Git. Version2 strips CLI newline.

Stopped the local API before streaming the PostgreSQL dump directly into Neon
in one transaction. The original local database remains intact and the local API
remains stopped to prevent divergent writers. Eight table counts and complete
row digests match:24 orders,10 matches,45 commands,5 settlements,16 operations,
21 events, one market and one deployment. No prepared/pending settlement operation
existed at cutover. [Migration evidence](../evidence/047-cloud-migration.json).
No wallet, signature, chain mutation, contract deployment or merge was performed.

Cloud Build9959c453-a839-4e8f-9a62-9963e32be785 succeeded using the unchanged
engine Dockerfile. Cloud Run holdbook-api-00002-lx4 serves100% traffic at
https://holdbook-api-6t7fccf54a-as.a.run.app. Health verifies a real database ping.
Live approved preflight204, rejected foreign origin403, rejected DELETE preflight403
and malformed POST400 passed; malformed JSON is rejected before a command is
prepared. Public API reports24 orders/10 matches. [API evidence](../evidence/047-cloud-api.json).

Pages workflow [34334461814](https://github.com/outsider987/hedera-rwa-secondary-market/actions/runs/34334461814)
deployed source871518f9d6b83fa3ff5b52bc09787aabd9d1dbce after npm ci,152 combined
app/protobuf tests, typecheck and Pages build passed. The earlier dispatch before
setting the API variable was skipped as designed. Official CLI npm metadata
confirms neonctl Apache-2.0. Existing Actions Node20 deprecation annotation remains.

Live https://outsider987.github.io/hedera-rwa-secondary-market/ passed isolated
Chrome1440/390 viewport checks: image, all four tabs, no horizontal overflow,
no page errors, and real browser cross-origin health/market/deployment readback.
[Runnable browser check and results](../evidence/047-live-deployment.mjs),
[public JSON](../evidence/047-live-deployment.json). No wallet was connected.
Both fresh revisions started successfully; a timed scale-to-zero/resume cycle
and actual MetaMask use from the new origin are not claimed. Local storage is
origin-specific; users reconnect/bind the original roles on the deployed site.

Changes after the deployed source are documentation/evidence only. Syntax and
git diff checks passed; no application change calls for repeating the already
passing Go integration/race/vet and local frontend checks in usage056. The final
documentation commit uses [skip ci] to retain this verified deployed artifact.
Deployment is delivered; next ticket and allowed implementation files: none
until separately requested. Any future chain action still requires Victor.

