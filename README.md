# Netflix TV Clone

A pixel-perfect Netflix TV UI clone — navigable via keyboard, remote, or gamepad.

## Files

```
├── index.html          # Main app (all screens in one file)
├── js/
│   ├── data.js         # All content data — profiles, rows, hero content
│   └── app.js          # Navigation engine, screen logic, gamepad support
└── README.md
```

## Screens Included

1. **Profile Selection** — Pick who's watching, up to 5 profiles
2. **Profile Lock (PIN)** — 4-digit PIN numpad for locked profiles
3. **Browse / Home** — Hero banner with auto-rotation + content rows
4. **Content Detail Overlay** — Full info modal with play/list/like
5. **Search** — On-screen keyboard + live search results
6. **My List** — Grid of saved titles
7. **Video Player** — Simulated player with controls

## Navigation

| Input | Action |
|---|---|
| Arrow Keys | Navigate focus |
| Enter / Space | Select |
| Escape / Backspace | Go back |
| Gamepad D-pad | Navigate |
| Gamepad A / Cross | Select |
| Gamepad B / Circle | Back |

## Deploy to Cloudflare Pages

### Option A: GitHub + Cloudflare Pages (Recommended)

1. Push this folder to a GitHub repo
2. Go to https://pages.cloudflare.com/
3. Create a new project -> Connect to GitHub
4. Select your repo
5. Build settings:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: / (root)
6. Click Save and Deploy

Your site will be live at https://your-project.pages.dev

### Option B: Direct Upload

1. Go to Cloudflare Pages -> Create a project -> Upload assets
2. Drag and drop this entire folder
3. Done!

## Customizing Content

Edit js/data.js to:
- Add/edit profiles in PROFILES array
- Change hero content in HERO_CONTENT array
- Add content rows in CONTENT_ROWS array
- Replace thumb and bg image URLs with your own CDN links
