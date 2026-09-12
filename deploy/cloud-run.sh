#!/usr/bin/env bash
set -euo pipefail
# Inputs are public identifiers, never secret values. Execute from repository root.
: "${PROJECT_ID:?Set the approved Google Cloud project ID}"
: "${REGION:?Set a Cloud Run region near the Neon database}"
: "${DATABASE_SECRET:?Set the Secret Manager secret name containing DATABASE_URL}"
: "${SERVICE_ACCOUNT:?Set the dedicated runtime service account email}"
PUBLIC_ORIGIN=https://outsider987.github.io
SERVICE=holdbook-api
# A new service rejects requests until its assigned hostname is configured.
existing_url=$(gcloud run services list --filter="metadata.name=$SERVICE" --project="$PROJECT_ID" --region="$REGION" --format='value(status.url)')
api_host=${existing_url#https://}
if [[ -z "$api_host" ]]; then api_host=bootstrap.invalid; fi
gcloud run deploy "$SERVICE" --project="$PROJECT_ID" --region="$REGION" \
  --source=engine --service-account="$SERVICE_ACCOUNT" \
  --port=8080 --cpu=1 --memory=512Mi --concurrency=20 --timeout=190 \
  --min=0 --max=2 --allow-unauthenticated \
  --set-env-vars="PUBLIC_ORIGIN=$PUBLIC_ORIGIN,API_HOST=$api_host" \
  --update-secrets="DATABASE_URL=$DATABASE_SECRET:latest"
api_url=$(gcloud run services describe "$SERVICE" --project="$PROJECT_ID" --region="$REGION" --format='value(status.url)')
if [[ "$api_host" == bootstrap.invalid ]]; then
  gcloud run services update "$SERVICE" --project="$PROJECT_ID" --region="$REGION" \
    --update-env-vars="API_HOST=${api_url#https://}"
fi
printf 'Cloud Run API: %s\n' "$api_url"
curl --fail --silent --show-error "$api_url/api/health"
