# Bloom website and account deployment

The production website and account API use the same public origin so browsers can keep the Bloom session in a first-party, secure cookie.

## OAuth registrations

Create two production web applications and keep their secrets only in `/etc/bloom-api.env` on the VPS.

Google OAuth web client:

- Authorized JavaScript origin: `https://bloomclient.org`
- Authorized redirect URI: `https://bloomclient.org/api/auth/callback/google`
- Scopes: `openid`, `email`, and `profile` only

GitHub OAuth App:

- Homepage URL: `https://bloomclient.org`
- Authorization callback URL: `https://bloomclient.org/api/auth/callback/github`
- No repository or organization scopes

The required environment names are documented in the client repository at `backend/.env.example`. The real values must never be copied into either repository.

## VPS paths

- Website build: `/opt/bloom-website/dist`
- Account database: `/var/lib/bloom/accounts/accounts.sqlite`
- Private service environment: `/etc/bloom-api.env` (mode `0600`)
- API container: `127.0.0.1:8110`

Build the website with `npm ci && npm run build`, copy only `dist/` into `/opt/bloom-website/dist`, and install the supplied Caddy configuration after backing up and validating the existing file. Run `caddy validate --config /etc/caddy/Caddyfile` before reloading Caddy.

Back up `/var/lib/bloom/accounts` off the VPS daily. SQLite runs in WAL mode; use SQLite's online backup command or stop the API briefly before copying all database, WAL, and shared-memory files together.

## Activation check

1. `https://bloomclient.org/v1/account/config` returns both providers.
2. Google sign-in returns to `/dashboard/` and the header displays the Google avatar.
3. Connect GitHub from Dashboard → Connections.
4. Sign out and sign back in with GitHub; the same Bloom account opens.
5. Switch account and verify the provider account chooser opens.
6. Revoke other sessions and confirm a second browser is signed out.
7. Disconnect one provider; the final provider must remain protected from removal.
