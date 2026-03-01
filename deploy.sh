#!/bin/bash
# Eddie+ Deploy Script
# Run this from the eddie-plus directory after cloning

echo "🎬 Deploying Eddie+..."

# Check wrangler is installed
if ! command -v wrangler &> /dev/null; then
  echo "Installing Wrangler..."
  npm install -g wrangler
fi

# Login check
echo "Checking Cloudflare login..."
wrangler whoami || wrangler login

# Deploy
echo "Deploying worker..."
wrangler deploy

echo ""
echo "✅ Eddie+ deployed!"
echo ""
echo "Next steps:"
echo "1. Note your worker URL above"
echo "2. Sign up for an account at your URL"
echo "3. Make yourself admin by running:"
echo "   wrangler d1 execute eddie-plus-db --command \"UPDATE users SET role='admin' WHERE email='YOUR_EMAIL'\""
echo ""
