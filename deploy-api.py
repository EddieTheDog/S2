#!/usr/bin/env python3
"""
Eddie+ Deploy Script - Uses Cloudflare REST API directly
No wrangler needed. Just Python 3 + your CF API token.

Usage:
  python3 deploy-api.py --token CF_API_TOKEN --account ACCOUNT_ID

Get your API token at: https://dash.cloudflare.com/profile/api-tokens
  (Create token > Edit Cloudflare Workers template)
Get your Account ID from the Cloudflare dashboard right sidebar.
"""

import sys, os, json, urllib.request, urllib.parse, argparse

WORKER_NAME = "eddie-plus"
DB_ID = "6555cd30-a7bf-4e9c-9a33-ab5754927712"
DB_NAME = "eddie-plus-db"
COMPAT_DATE = "2024-01-01"
SCRIPT_FILE = os.path.join(os.path.dirname(__file__), "src", "worker.js")

def cf_request(method, path, token, body=None, content_type="application/json"):
    url = f"https://api.cloudflare.com/client/v4{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", content_type)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

def upload_worker(token, account_id, script_content):
    """Upload worker using multipart form data"""
    import email.mime.multipart, io
    
    boundary = "eddie-plus-boundary-12345"
    
    metadata = json.dumps({
        "main_module": "worker.js",
        "bindings": [
            {
                "type": "d1",
                "name": "DB",
                "id": DB_ID
            }
        ],
        "compatibility_date": COMPAT_DATE
    })
    
    body = (
        f"--{boundary}\r\n"
        f"Content-Disposition: form-data; name=\"metadata\"\r\n"
        f"Content-Type: application/json\r\n\r\n"
        f"{metadata}\r\n"
        f"--{boundary}\r\n"
        f"Content-Disposition: form-data; name=\"worker.js\"; filename=\"worker.js\"\r\n"
        f"Content-Type: application/javascript+module\r\n\r\n"
        f"{script_content}\r\n"
        f"--{boundary}--\r\n"
    ).encode('utf-8')
    
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts/{WORKER_NAME}"
    req = urllib.request.Request(url, data=body, method="PUT")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err = e.read()
        try: return json.loads(err)
        except: return {"success": False, "error": err.decode()}

def main():
    parser = argparse.ArgumentParser(description="Deploy Eddie+ to Cloudflare Workers")
    parser.add_argument("--token", required=True, help="Cloudflare API token")
    parser.add_argument("--account", required=True, help="Cloudflare Account ID")
    args = parser.parse_args()
    
    print("🎬 Eddie+ Deploy Script")
    print("=" * 40)
    
    # Read worker script
    print(f"Reading {SCRIPT_FILE}...")
    with open(SCRIPT_FILE, 'r') as f:
        script_content = f.read()
    print(f"Script size: {len(script_content):,} chars")
    
    # Deploy
    print(f"\nDeploying worker '{WORKER_NAME}'...")
    result = upload_worker(args.token, args.account, script_content)
    
    if result.get("success"):
        print(f"✅ Worker deployed!")
        print(f"\n🌐 Your Eddie+ URL:")
        print(f"   https://{WORKER_NAME}.{args.account[:8]}.workers.dev")
        print(f"\nNext: Make yourself admin:")
        print(f"   Sign up at your URL, then run:")
        print(f"   Go to https://dash.cloudflare.com → D1 → {DB_NAME} → Console")
        print(f"   Run: UPDATE users SET role='admin' WHERE email='your@email.com';")
    else:
        print(f"❌ Deploy failed:")
        print(json.dumps(result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
