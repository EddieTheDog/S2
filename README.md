# 🎬 EDDIE+

A fully custom streaming platform — built on Cloudflare Workers + D1 + GitHub.

---

## Features

- **Sign In / Sign Up** — Free accounts, no credit card
- **Multi-Profile** — Up to 5 profiles per account, with Kids Mode
- **Hero Carousel** — Auto-rotating featured content with custom per-title fonts, colors, and play icons
- **Content Types** — Movies, TV Shows, Shorts, Documentaries, Special Events
- **Full Video Player** — Scrubber, skip 10s, mute, fullscreen
- **Search** — Real-time search across all titles, descriptions, tags
- **Collections** — Curated groups of content
- **Watchlist (My List)** — Per-profile watchlist
- **Watch History** — Progress tracking per profile
- **Admin Panel** — Full CMS to manage all content, episodes, collections, users
- **Scheduling** — Set a future date/time to release content automatically
- **Custom Badges** — New, 4K, HDR, Dolby, Coming Soon, Event, and custom labels per title
- **Per-Title Customization** — Custom fonts, title colors, play button icons, progress bar styles
- **Custom Tabs** — Add any tab (Schedule, Soundtrack, Behind the Scenes) to any title page
- **JSON Templates** — Copy template, fill in details, upload to add content instantly

---

## Setup

### 1. Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/): `npm install -g wrangler`
- Cloudflare account (free tier works)

### 2. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/eddie-plus.git
cd eddie-plus
npm install
```

### 3. Login to Cloudflare

```bash
wrangler login
```

### 4. Deploy

```bash
npm run deploy
```

Your platform will be live at `https://eddie-plus.YOUR_SUBDOMAIN.workers.dev`

### 5. Create Your Admin Account

1. Open your Eddie+ URL
2. Click **Sign In** → **Create a free account**
3. Sign up with your email
4. Your first account is a regular user — to make yourself admin, go to your Cloudflare D1 dashboard and run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Or use the Wrangler CLI:
```bash
wrangler d1 execute eddie-plus-db --command "UPDATE users SET role='admin' WHERE email='your@email.com'"
```

5. Sign out and back in — you'll see **Admin Panel** in the nav

---

## Adding Content

### Method 1: Admin Panel (Easiest)

1. Go to `https://your-url/` and sign in as admin
2. Click your profile → **Admin Panel**
3. Click **+ Add Content**
4. Fill in the form with all content details
5. Save

### Method 2: JSON Templates + Upload CLI

1. Copy a template from `content-templates/movies/TEMPLATE.json`
2. Fill it in
3. Upload:

```bash
node upload-content.js my-movie.json \
  --api https://eddie-plus.YOUR_SUBDOMAIN.workers.dev \
  --token YOUR_SESSION_TOKEN
```

To get your session token: open browser dev tools → Application → Local Storage → `eddie_token`

### Method 3: Bulk Upload Folder

Create multiple JSON files in a folder and upload them all at once with a shell script:

```bash
for f in content-templates/movies/*.json; do
  node upload-content.js "$f" --api https://your-url.workers.dev --token YOUR_TOKEN
done
```

---

## Content Template Fields

| Field | Description |
|-------|-------------|
| `type` | `movie`, `show`, `short`, `documentary`, `event` |
| `title` | Display title |
| `slug` | URL slug (auto-generated if blank) |
| `status` | `published`, `draft`, `scheduled`, `coming_soon` |
| `scheduled_release` | ISO datetime — content goes live automatically |
| `logo_url` | Transparent PNG/SVG logo replaces the text title |
| `poster_url` | 2:3 ratio poster image |
| `backdrop_url` | 16:9 wide backdrop for hero/detail |
| `trailer_url` | Trailer video URL |
| `teaser_url` | Teaser video URL |
| `video_url` | Full video URL |
| `custom_font` | Google Fonts name (e.g. `Orbitron`, `Playfair Display`) |
| `custom_color` | Hex color for the title (e.g. `#00f5ff`) |
| `play_icon` | `""`, `fire`, `star`, or `thunder` |
| `progress_bar_style` | `default`, `gold`, `blue`, `gradient` |
| `custom_tabs` | Array of `{label, content}` for extra tabs on detail page |
| `badges` | `event`, `featured`, or any custom string |
| `is_new` | Shows "New" badge |
| `is_4k` | Shows "4K" badge |
| `is_hdr` | Shows "HDR" badge |
| `is_dolby` | Shows "Dolby" badge |
| `featured` | Appears in hero carousel |
| `featured_order` | Order in carousel (0 = first) |

---

## Custom Tabs Example

```json
"custom_tabs": [
  {
    "label": "Behind the Scenes",
    "content": "<p>Behind the scenes content here. <strong>HTML is supported.</strong></p>"
  },
  {
    "label": "Soundtrack",
    "content": "<p>Soundtrack info here.</p>"
  },
  {
    "label": "Special Event Info",
    "content": "<ul><li>8:00 PM - Opening</li><li>9:00 PM - Main Feature</li></ul>"
  }
]
```

---

## File Structure

```
eddie-plus/
├── src/
│   └── worker.js              # Cloudflare Worker backend (API)
├── public/
│   └── index.html             # Full frontend SPA
├── content-templates/
│   ├── movies/
│   │   ├── TEMPLATE.json      # Copy this for each movie
│   │   └── neon-horizon-example.json
│   ├── shows/
│   │   └── TEMPLATE.json
│   ├── events/
│   │   └── TEMPLATE.json
│   └── collections/
│       └── TEMPLATE.json
├── upload-content.js          # CLI upload tool
├── wrangler.toml              # Cloudflare config
└── package.json
```

---

## Database (Cloudflare D1)

Database ID: `6555cd30-a7bf-4e9c-9a33-ab5754927712`  
Database Name: `eddie-plus-db`

To query directly:
```bash
wrangler d1 execute eddie-plus-db --command "SELECT * FROM content ORDER BY created_at DESC LIMIT 10"
```

---

## Custom Domains

1. Go to Cloudflare Dashboard → Workers & Pages → eddie-plus → Settings → Custom Domains
2. Add your domain (e.g. `watch.yourdomain.com`)

---

## License

MIT — built for Eddie+
