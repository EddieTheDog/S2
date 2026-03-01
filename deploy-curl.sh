#!/bin/bash
# Eddie+ Quick Deploy with curl
# Usage: CF_TOKEN=xxx CF_ACCOUNT=xxx bash deploy-curl.sh

CF_TOKEN="${CF_TOKEN:-$1}"
CF_ACCOUNT="${CF_ACCOUNT:-$2}"
WORKER_NAME="eddie-plus"
DB_ID="6555cd30-a7bf-4e9c-9a33-ab5754927712"

if [ -z "$CF_TOKEN" ] || [ -z "$CF_ACCOUNT" ]; then
  echo "Usage: CF_TOKEN=<token> CF_ACCOUNT=<account_id> bash deploy-curl.sh"
  echo "  OR:  bash deploy-curl.sh <token> <account_id>"
  echo ""
  echo "Get your API token at: https://dash.cloudflare.com/profile/api-tokens"
  echo "Get your Account ID from Cloudflare dashboard sidebar"
  exit 1
fi

SCRIPT_PATH="$(dirname "$0")/src/worker.js"
echo "🎬 Deploying Eddie+ to Cloudflare Workers..."
echo "Worker: $WORKER_NAME"
echo "Account: $CF_ACCOUNT"
echo ""

RESULT=$(curl -s -X PUT \
  "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT/workers/scripts/$WORKER_NAME" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -F "metadata={
    \"main_module\": \"worker.js\",
    \"bindings\": [{
      \"type\": \"d1\",
      \"name\": \"DB\",
      \"id\": \"$DB_ID\"
    }],
    \"compatibility_date\": \"2024-01-01\"
  };type=application/json" \
  -F "worker.js=@$SCRIPT_PATH;filename=worker.js;type=application/javascript+module")

SUCCESS=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success','false'))" 2>/dev/null)

if [ "$SUCCESS" = "True" ] || [ "$SUCCESS" = "true" ]; then
  echo "✅ Eddie+ deployed successfully!"
  echo ""
  echo "🌐 Visit: https://$WORKER_NAME.workers.dev"
  echo ""
  echo "To make yourself admin, go to:"
  echo "https://dash.cloudflare.com → Workers & Pages → D1 → eddie-plus-db → Console"
  echo "Run: UPDATE users SET role='admin' WHERE email='your@email.com';"
else
  echo "❌ Deploy failed. Response:"
  echo "$RESULT" | python3 -m json.tool 2>/dev/null || echo "$RESULT"
  exit 1
fi
