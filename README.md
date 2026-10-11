# Bloom Client Website V2

New standalone Bloom Client website. This folder does not modify the older `BloomClient-Website` project.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:4176`.

## Verify

```powershell
npm test
npm run build
```

## Hosting with the existing backend

Build output is written to `dist/`. Caddy on the existing Bloom VPS should serve that folder for the final Bloom website hostname and continue reverse-proxying API and future account routes to the Node service on `127.0.0.1:8110`.

The future account routes are `/auth/*`, `/v1/account/*`, and `/v1/social/*`. They should not be exposed in the website navigation until Google/GitHub OAuth, Delight sessions, provider linking, and the account page work end to end.
