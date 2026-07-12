# House Inventory

iPad-friendly house map (GitHub Pages). Dad taps rooms and category lists — no typing. You manage those lists in **Admin**.

## Dev

```bash
npm install
npm run dev
```

Open `http://localhost:5277`.

## GitHub Pages

Live site: **https://walterfarrar.github.io/HouseHunt/**

Pushes to `main` auto-deploy via GitHub Actions. You can still deploy manually:

```bash
npm run build
npx gh-pages -d dist
```

Repo: https://github.com/walterfarrar/HouseHunt

Shared item lists live in [`public/catalog.json`](public/catalog.json) and are copied into the build.

### Admin

1. Open **Admin** (or `#admin`)
2. Unlock with the admin password (`changeme` by default, or set `VITE_ADMIN_PASSWORD` in `.env` before build)
3. Edit categories / items / spots — every category and item can have an emoji **icon**. Defaults ship with sensible icons, new items auto-pick a matching one, and you can tap any icon to choose from the palette or paste your own emoji (any emoji from your phone/tablet keyboard works)
4. **Publish to live site** with a fine-grained PAT (Contents read/write). The token is saved in this browser. Publish updates both the repo and the live GitHub Pages site — refresh Dad’s iPad, no separate deploy step.

## Hunt mode

- Tap a room → **I found something** → category → item → spot
- Search finds items already logged on that device
