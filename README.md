# Guacblock Diary

Desk-style personal diary for Matthew — greeting note, in-tray, bot stickies, and coming-up calendar.

Standalone Vite + React app. Deployed separately from Greenlight / Nashdash.

- Railway project: **Guacblock Diary** (`a132d78d-111d-4ab3-b1c4-ff6d9196d3ee`)
- Public: https://diary-production-68b6.up.railway.app
- Custom domains (pending DNS): https://guacblock.com.au · https://www.guacblock.com.au

## Local

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm start
```

Railway builds with `npm run build` and starts with `npm start` (static `serve` of `dist`) once this repo is connected. Until then the live service may run as a Railway Function with the same desk UI.
