# House Hunt

iPad-friendly house map (GitHub Pages). Dad taps rooms and category lists — no typing. You manage those lists in **Admin**.

## Dev

```bash
npm install
npm run dev
```

Open `http://localhost:5277`.

## GitHub Pages

```bash
npm run build
```

Publish the `dist/` folder to GitHub Pages (or use Actions). `base` is `./` so project sites work.

Shared item lists live in [`public/catalog.json`](public/catalog.json) and are copied into the build.

### Admin

1. Open **Admin** (or `#admin`)
2. Unlock with the admin password (`changeme` by default, or set `VITE_ADMIN_PASSWORD` in `.env` before build)
3. Edit categories / items / spots
4. Either:
   - **Download JSON** and commit it as `public/catalog.json`, or
   - **Publish to GitHub** with a fine-grained PAT (Contents read/write) so Pages rebuilds and Dad’s iPad gets the lists on refresh

## Hunt mode

- Tap a room → **I found something** → category → item → spot
- Search finds items already logged on that device
