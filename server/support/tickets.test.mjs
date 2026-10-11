import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { createSupportApi } from "./tickets.mjs";

const users = {
  owner: { id: "owner-id", name: "Parks", email: "owner@example.test" },
  first: { id: "first-id", name: "First", email: "first@example.test" },
  second: { id: "second-id", name: "Second", email: "second@example.test" },
};

function setup() {
  const database = new DatabaseSync(":memory:");
  database.exec('PRAGMA foreign_keys=ON; CREATE TABLE "user" (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL);');
  const insert = database.prepare('INSERT INTO "user" (id, name, email) VALUES (?, ?, ?)');
  for (const user of Object.values(users)) insert.run(user.id, user.name, user.email);
  const auth = { api: { getSession: async ({ headers }) => {
    const key = headers.get("x-test-user");
    return key && users[key] ? { user: users[key] } : null;
  } } };
  return createSupportApi({ auth, database, siteOrigin: "https://bloomclient.org", env: { BLOOM_SUPPORT_OWNER_USER_IDS: users.owner.id } });
}

async function call(api, { user, method = "GET", path, body }) {
  const request = new PassThrough();
  request.method = method;
  request.url = path;
  request.headers = { "x-test-user": user, ...(body ? { origin: "https://bloomclient.org", "content-type": "application/json" } : {}) };
  const result = { status: 0, headers: {}, raw: "" };
  const response = {
    writeHead(status, headers) { result.status = status; result.headers = headers; },
    end(value = "") { result.raw += value.toString(); },
  };
  const handled = api.handle(request, response, path, new URL(path, "https://bloomclient.org"));
  request.end(body ? JSON.stringify(body) : undefined);
  await handled;
  return { ...result, body: result.raw ? JSON.parse(result.raw) : {} };
}

test("ticket ownership stays private while the configured owner can review and reply", async () => {
  const api = setup();
  const created = await call(api, { user: "first", method: "POST", path: "/v1/tickets", body: { subject: "Launcher will not start", category: "launcher", message: "The launcher closes after I press Play." } });
  assert.equal(created.status, 201);
  const ticketId = created.body.ticket.id;

  const stranger = await call(api, { user: "second", path: `/v1/tickets/${ticketId}` });
  assert.equal(stranger.status, 404);

  const queue = await call(api, { user: "owner", path: "/v1/owner/tickets" });
  assert.equal(queue.status, 200);
  assert.equal(queue.body.tickets[0].user.email, users.first.email);

  const reply = await call(api, { user: "owner", method: "POST", path: `/v1/tickets/${ticketId}/messages`, body: { message: "Thanks. Please send the latest Bloom log." } });
  assert.equal(reply.status, 201);
  assert.equal(reply.body.status, "waiting_on_user");

  const thread = await call(api, { user: "first", path: `/v1/tickets/${ticketId}` });
  assert.equal(thread.body.messages.length, 2);
  assert.equal(thread.body.messages[1].authorRole, "owner");
});

test("owner capabilities and mutation origin checks are server enforced", async () => {
  const api = setup();
  assert.deepEqual((await call(api, { user: "owner", path: "/v1/account/capabilities" })).body, { owner: true });
  assert.deepEqual((await call(api, { user: "first", path: "/v1/account/capabilities" })).body, { owner: false });
  const request = new PassThrough();
  request.method = "POST";
  request.url = "/v1/tickets";
  request.headers = { "x-test-user": "first", origin: "https://evil.example", "content-type": "application/json" };
  let status;
  const response = { writeHead(value) { status = value; }, end() {} };
  const handled = api.handle(request, response, request.url, new URL(request.url, "https://bloomclient.org"));
  request.end(JSON.stringify({ subject: "Valid subject", category: "other", message: "This should not be accepted." }));
  await handled;
  assert.equal(status, 403);
});
