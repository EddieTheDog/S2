#!/usr/bin/env node
// Eddie+ Content Upload CLI
// Usage: node upload-content.js <file.json> --token YOUR_ADMIN_TOKEN --api https://your-worker.workers.dev

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const file = args[0];

let apiBase = 'http://localhost:8787';
let token = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--api') apiBase = args[i + 1];
  if (args[i] === '--token') token = args[i + 1];
}

if (!file) {
  console.log(`
Eddie+ Content Upload CLI
--------------------------
Usage: node upload-content.js <content.json> [--api https://your-worker.workers.dev] [--token ADMIN_TOKEN]

Examples:
  node upload-content.js content-templates/movies/neon-horizon-example.json --token mytoken
  node upload-content.js content-templates/shows/TEMPLATE.json --api https://eddie-plus.workers.dev --token mytoken

The JSON file should follow the template format in content-templates/
  `);
  process.exit(0);
}

async function upload() {
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(file, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch(e) {
    console.error('Invalid JSON:', e.message);
    process.exit(1);
  }

  // Remove template-only fields
  delete data._note;
  delete data._seasons_note;
  delete data._seasons;

  console.log(`Uploading: "${data.title}" (${data.type})`);
  console.log(`API: ${apiBase}`);

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${apiBase}/api/admin/content`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (res.ok) {
    console.log(`✅ Success! Content ID: ${result.id}, Slug: ${result.slug}`);
    console.log(`   View at: ${apiBase}/#/detail/${result.slug}`);
  } else {
    console.error(`❌ Error: ${result.error}`);
    process.exit(1);
  }
}

upload().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
