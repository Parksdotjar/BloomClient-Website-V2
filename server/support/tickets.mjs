import crypto from "node:crypto";
import { fromNodeHeaders } from "better-auth/node";

const CATEGORIES = new Set(["technical", "account", "launcher", "cosmetics", "other"]);
const STATUSES = new Set(["waiting_on_support", "waiting_on_user", "closed"]);
const MAX_BODY_BYTES = 16_384;

const sendJson = (response, status, body) => {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
  });
  response.end(payload);
};

const readJson = (request) => new Promise((resolve, reject) => {
  let size = 0;
  const chunks = [];
  request.on("data", (chunk) => {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      reject(Object.assign(new Error("request_too_large"), { status: 413 }));
      request.destroy();
      return;
    }
    chunks.push(chunk);
  });
  request.on("end", () => {
    try {
      const raw = Buffer.concat(chunks).toString("utf8");
      resolve(raw ? JSON.parse(raw) : {});
    } catch {
      reject(Object.assign(new Error("invalid_json"), { status: 400 }));
    }
  });
  request.on("error", reject);
});

const cleanText = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";
const serializeTicket = (row) => ({
  id: row.id,
  subject: row.subject,
  category: row.category,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  lastMessageAt: row.last_message_at,
  ...(row.user_name !== undefined ? { user: { name: row.user_name, email: row.user_email } } : {}),
});
const serializeMessage = (row) => ({
  id: row.id,
  authorRole: row.author_role,
  body: row.body,
  createdAt: row.created_at,
});

export function createSupportApi({ auth, database, siteOrigin, env = process.env }) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS support_staff (
      user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('owner')),
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('waiting_on_support', 'waiting_on_user', 'closed')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_message_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS support_tickets_user_updated ON support_tickets(user_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS support_tickets_status_updated ON support_tickets(status, updated_at DESC);
    CREATE TABLE IF NOT EXISTS support_messages (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
      author_user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      author_role TEXT NOT NULL CHECK (author_role IN ('user', 'owner')),
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS support_messages_ticket_created ON support_messages(ticket_id, created_at ASC);
  `);

  const ownerIds = new Set((env.BLOOM_SUPPORT_OWNER_USER_IDS || "").split(",").map((value) => value.trim()).filter(Boolean));
  const insertStaff = database.prepare("INSERT OR IGNORE INTO support_staff (user_id, role, created_at) VALUES (?, 'owner', ?)");
  for (const userId of ownerIds) insertStaff.run(userId, Date.now());

  const sessionFor = (request) => auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
  const isOwner = (userId) => Boolean(database.prepare("SELECT 1 FROM support_staff WHERE user_id = ? AND role = 'owner'").get(userId));
  const sameOrigin = (request) => request.headers.origin === siteOrigin;
  const requireSession = async (request, response) => {
    const session = await sessionFor(request);
    if (!session) sendJson(response, 401, { error: "not_authenticated" });
    return session;
  };
  const requireMutation = (request, response) => {
    if (!sameOrigin(request)) {
      sendJson(response, 403, { error: "invalid_origin" });
      return false;
    }
    const contentType = String(request.headers["content-type"] || "").toLowerCase();
    if (!contentType.startsWith("application/json")) {
      sendJson(response, 415, { error: "json_required" });
      return false;
    }
    return true;
  };
  const ticketFor = (ticketId) => database.prepare("SELECT * FROM support_tickets WHERE id = ?").get(ticketId);
  const canRead = (ticket, userId, owner) => ticket && (owner || ticket.user_id === userId);

  return {
    async handle(request, response, pathname, url) {
      if (!pathname.startsWith("/v1/tickets") && !pathname.startsWith("/v1/owner/") && pathname !== "/v1/account/capabilities") return false;
      try {
        const session = await requireSession(request, response);
        if (!session) return true;
        const owner = isOwner(session.user.id);

        if (pathname === "/v1/account/capabilities" && request.method === "GET") {
          sendJson(response, 200, { owner });
          return true;
        }

        if (pathname === "/v1/tickets" && request.method === "GET") {
          const rows = database.prepare("SELECT * FROM support_tickets WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100").all(session.user.id);
          sendJson(response, 200, { tickets: rows.map(serializeTicket) });
          return true;
        }

        if (pathname === "/v1/tickets" && request.method === "POST") {
          if (!requireMutation(request, response)) return true;
          const recent = database.prepare("SELECT COUNT(*) AS count FROM support_tickets WHERE user_id = ? AND created_at > ?").get(session.user.id, Date.now() - 3_600_000).count;
          if (recent >= 5) {
            sendJson(response, 429, { error: "ticket_rate_limited" });
            return true;
          }
          const body = await readJson(request);
          const subject = cleanText(body.subject, 100);
          const message = cleanText(body.message, 5_000);
          const category = CATEGORIES.has(body.category) ? body.category : "other";
          if (subject.length < 4 || message.length < 10) {
            sendJson(response, 400, { error: "invalid_ticket" });
            return true;
          }
          const now = Date.now();
          const ticketId = crypto.randomUUID();
          const messageId = crypto.randomUUID();
          database.exec("BEGIN IMMEDIATE");
          try {
            database.prepare("INSERT INTO support_tickets (id, user_id, subject, category, status, created_at, updated_at, last_message_at) VALUES (?, ?, ?, ?, 'waiting_on_support', ?, ?, ?)").run(ticketId, session.user.id, subject, category, now, now, now);
            database.prepare("INSERT INTO support_messages (id, ticket_id, author_user_id, author_role, body, created_at) VALUES (?, ?, ?, 'user', ?, ?)").run(messageId, ticketId, session.user.id, message, now);
            database.exec("COMMIT");
          } catch (error) {
            database.exec("ROLLBACK");
            throw error;
          }
          sendJson(response, 201, { ticket: serializeTicket(ticketFor(ticketId)) });
          return true;
        }

        const ticketMatch = pathname.match(/^\/v1\/tickets\/([0-9a-f-]{36})$/i);
        if (ticketMatch && request.method === "GET") {
          const ticket = ticketFor(ticketMatch[1]);
          if (!canRead(ticket, session.user.id, owner)) {
            sendJson(response, 404, { error: "ticket_not_found" });
            return true;
          }
          const messages = database.prepare("SELECT * FROM support_messages WHERE ticket_id = ? ORDER BY created_at ASC, rowid ASC").all(ticket.id);
          sendJson(response, 200, { ticket: serializeTicket(ticket), messages: messages.map(serializeMessage) });
          return true;
        }

        const messageMatch = pathname.match(/^\/v1\/tickets\/([0-9a-f-]{36})\/messages$/i);
        if (messageMatch && request.method === "POST") {
          if (!requireMutation(request, response)) return true;
          const ticket = ticketFor(messageMatch[1]);
          if (!canRead(ticket, session.user.id, owner)) {
            sendJson(response, 404, { error: "ticket_not_found" });
            return true;
          }
          const body = await readJson(request);
          const message = cleanText(body.message, 5_000);
          if (message.length < 1) {
            sendJson(response, 400, { error: "invalid_message" });
            return true;
          }
          const now = Date.now();
          const role = owner ? "owner" : "user";
          const nextStatus = owner ? "waiting_on_user" : "waiting_on_support";
          database.exec("BEGIN IMMEDIATE");
          try {
            database.prepare("INSERT INTO support_messages (id, ticket_id, author_user_id, author_role, body, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(crypto.randomUUID(), ticket.id, session.user.id, role, message, now);
            database.prepare("UPDATE support_tickets SET status = ?, updated_at = ?, last_message_at = ? WHERE id = ?").run(nextStatus, now, now, ticket.id);
            database.exec("COMMIT");
          } catch (error) {
            database.exec("ROLLBACK");
            throw error;
          }
          sendJson(response, 201, { ok: true, status: nextStatus });
          return true;
        }

        if (pathname === "/v1/owner/tickets" && request.method === "GET") {
          if (!owner) {
            sendJson(response, 403, { error: "owner_required" });
            return true;
          }
          const requestedStatus = url.searchParams.get("status") || "";
          const rows = requestedStatus && STATUSES.has(requestedStatus)
            ? database.prepare('SELECT t.*, u.name AS user_name, u.email AS user_email FROM support_tickets t JOIN "user" u ON u.id = t.user_id WHERE t.status = ? ORDER BY t.updated_at DESC LIMIT 200').all(requestedStatus)
            : database.prepare('SELECT t.*, u.name AS user_name, u.email AS user_email FROM support_tickets t JOIN "user" u ON u.id = t.user_id ORDER BY CASE WHEN t.status = \'waiting_on_support\' THEN 0 WHEN t.status = \'waiting_on_user\' THEN 1 ELSE 2 END, t.updated_at DESC LIMIT 200').all();
          sendJson(response, 200, { tickets: rows.map(serializeTicket) });
          return true;
        }

        const ownerTicketMatch = pathname.match(/^\/v1\/owner\/tickets\/([0-9a-f-]{36})$/i);
        if (ownerTicketMatch && request.method === "PATCH") {
          if (!owner) {
            sendJson(response, 403, { error: "owner_required" });
            return true;
          }
          if (!requireMutation(request, response)) return true;
          const body = await readJson(request);
          if (!STATUSES.has(body.status)) {
            sendJson(response, 400, { error: "invalid_status" });
            return true;
          }
          const result = database.prepare("UPDATE support_tickets SET status = ?, updated_at = ? WHERE id = ?").run(body.status, Date.now(), ownerTicketMatch[1]);
          if (!result.changes) sendJson(response, 404, { error: "ticket_not_found" });
          else sendJson(response, 200, { ok: true, status: body.status });
          return true;
        }

        sendJson(response, 405, { error: "method_not_allowed" });
        return true;
      } catch (error) {
        console.error("support_api_error", error);
        sendJson(response, error.status || 500, { error: error.message === "invalid_json" ? "invalid_json" : error.message === "request_too_large" ? "request_too_large" : "support_unavailable" });
        return true;
      }
    },
  };
}
