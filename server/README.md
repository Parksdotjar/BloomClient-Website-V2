# Bloom support service

`support/tickets.mjs` is loaded by Bloom's existing account API. It stores tickets and messages in the same protected SQLite database as Bloom accounts, while keeping authorization tied to immutable account IDs.

Production owners are configured with `BLOOM_SUPPORT_OWNER_USER_IDS`. The browser never decides who is an owner; every owner endpoint checks that server-side role before returning ticket data.
