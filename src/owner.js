import { getAccount } from "./auth-client.js";
import { notify } from "./notification-bar.js";
import { formatTicketDate, getAccountCapabilities, getTicket, listOwnerTickets, replyToTicket, setTicketStatus, ticketStatus } from "./tickets-api.js";

const panels = [...document.querySelectorAll("[data-owner-panel]")];
const viewButtons = [...document.querySelectorAll("[data-owner-view]")];
const categoryNames = { technical: "Technical", launcher: "Launcher", cosmetics: "Cosmetics", account: "Account", other: "Other" };
let allTickets = [];
let selectedTicketId = null;
let pollTimer = null;

const setView = (name) => {
  for (const panel of panels) panel.hidden = panel.dataset.ownerPanel !== name;
  for (const button of viewButtons) button.classList.toggle("active", button.dataset.ownerView === name);
  document.querySelector(`[data-owner-panel="${name}"] h1`)?.focus({ preventScroll: true });
};

const statusNode = (value) => {
  const span = document.createElement("span");
  span.className = "ticket-status";
  span.dataset.status = value;
  span.textContent = ticketStatus[value] || value;
  return span;
};

const makeTicketRow = (ticket, onClick) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ticket-row owner-ticket-row";
  if (ticket.id === selectedTicketId) button.dataset.selected = "true";
  const copy = document.createElement("span");
  const subject = document.createElement("strong");
  subject.textContent = ticket.subject;
  const meta = document.createElement("small");
  meta.textContent = `${ticket.user?.name || ticket.user?.email || "Bloom user"} · ${formatTicketDate(ticket.updatedAt)}`;
  copy.append(subject, meta);
  button.append(copy, statusNode(ticket.status));
  button.addEventListener("click", onClick);
  return button;
};

const renderCounts = () => {
  const counts = Object.fromEntries(["waiting_on_support", "waiting_on_user", "closed"].map((status) => [status, allTickets.filter((ticket) => ticket.status === status).length]));
  document.querySelector("[data-stat-open]").textContent = counts.waiting_on_support;
  document.querySelector("[data-stat-pending]").textContent = counts.waiting_on_user;
  document.querySelector("[data-stat-closed]").textContent = counts.closed;
  const badge = document.querySelector("[data-open-count]");
  badge.hidden = !counts.waiting_on_support;
  badge.textContent = counts.waiting_on_support;
};

const renderRecent = () => {
  const container = document.querySelector("[data-owner-recent-list]");
  container.replaceChildren();
  if (!allTickets.length) { container.innerHTML = '<p class="ticket-empty">No support tickets yet.</p>'; return; }
  for (const ticket of allTickets.slice(0, 5)) container.append(makeTicketRow(ticket, () => { setView("tickets"); openTicket(ticket.id); }));
};

const renderQueue = () => {
  const filter = document.querySelector("[data-owner-filter]").value;
  const tickets = filter ? allTickets.filter((ticket) => ticket.status === filter) : allTickets;
  const container = document.querySelector("[data-owner-ticket-list]");
  document.querySelector("[data-owner-queue-summary]").textContent = `${tickets.length} ${tickets.length === 1 ? "conversation" : "conversations"}`;
  container.replaceChildren();
  if (!tickets.length) { container.innerHTML = '<p class="ticket-empty">Nothing in this queue.</p>'; return; }
  for (const ticket of tickets) container.append(makeTicketRow(ticket, () => openTicket(ticket.id)));
};

const loadQueue = async () => {
  const result = await listOwnerTickets();
  allTickets = result.tickets;
  renderCounts(); renderRecent(); renderQueue();
};

const renderOwnerThread = (result) => {
  const ticket = allTickets.find((item) => item.id === result.ticket.id) || result.ticket;
  const panel = document.querySelector("[data-owner-thread]");
  panel.replaceChildren();
  const header = document.createElement("header");
  const heading = document.createElement("div");
  const title = document.createElement("h2"); title.textContent = result.ticket.subject;
  const info = document.createElement("p"); info.textContent = `${ticket.user?.name || "Bloom user"} · ${ticket.user?.email || ""} · ${categoryNames[result.ticket.category] || "Support"}`;
  heading.append(title, info);
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Ticket status");
  for (const [value, label] of Object.entries(ticketStatus)) { const option = document.createElement("option"); option.value = value; option.textContent = label; option.selected = value === result.ticket.status; select.append(option); }
  select.addEventListener("change", async () => { try { await setTicketStatus(result.ticket.id, select.value); notify("Ticket status updated.", "success"); await loadQueue(); await refreshOpenTicket(); } catch { notify("Status could not be updated.", "error"); } });
  header.append(heading, select);
  const messages = document.createElement("div"); messages.className = "ticket-messages owner-ticket-messages";
  for (const message of result.messages) {
    const article = document.createElement("article"); article.className = "ticket-message"; article.dataset.author = message.authorRole;
    const label = document.createElement("div"); const author = document.createElement("strong"); author.textContent = message.authorRole === "owner" ? "You · Bloom Support" : ticket.user?.name || "User";
    const time = document.createElement("time"); time.textContent = formatTicketDate(message.createdAt);
    const body = document.createElement("p"); body.textContent = message.body;
    label.append(author, time); article.append(label, body); messages.append(article);
  }
  const form = document.createElement("form"); form.className = "ticket-reply owner-ticket-reply";
  const input = document.createElement("textarea"); input.name = "message"; input.maxLength = 5000; input.required = true; input.rows = 1; input.placeholder = "Reply as Bloom Support…";
  const send = document.createElement("button"); send.type = "submit"; send.setAttribute("aria-label", "Send reply"); send.title = "Send reply"; send.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m21 3-7.6 18-3.2-7.2L3 10.6 21 3Z"/><path d="m10.2 13.8 4.5-4.5"/></svg>';
  form.append(input, send);
  form.addEventListener("submit", async (event) => { event.preventDefault(); const message = input.value.trim(); if (!message) return; send.disabled = true; try { await replyToTicket(result.ticket.id, message); input.value = ""; notify("Reply sent.", "success"); await loadQueue(); await refreshOpenTicket(); } catch { notify("Reply could not be sent.", "error"); } finally { send.disabled = false; } });
  panel.append(header, messages, form);
  messages.scrollTop = messages.scrollHeight;
};

const refreshOpenTicket = async () => { if (selectedTicketId) renderOwnerThread(await getTicket(selectedTicketId)); };
const openTicket = async (id) => { selectedTicketId = id; renderQueue(); document.querySelector("[data-owner-thread]").innerHTML = '<p class="ticket-empty">Loading conversation…</p>'; try { await refreshOpenTicket(); } catch { notify("Ticket could not be loaded.", "error"); } };

for (const button of viewButtons) button.addEventListener("click", () => setView(button.dataset.ownerView));
for (const button of document.querySelectorAll("[data-owner-open-filter]")) button.addEventListener("click", () => { document.querySelector("[data-owner-filter]").value = button.dataset.ownerOpenFilter; setView("tickets"); renderQueue(); });
document.querySelector("[data-owner-filter]").addEventListener("change", renderQueue);

async function initialize() {
  const account = await getAccount().catch(() => null);
  if (!account) { location.replace(`/signin/?return=${encodeURIComponent("/owner/")}`); return; }
  const capabilities = await getAccountCapabilities().catch(() => ({ owner: false }));
  if (!capabilities.owner) { sessionStorage.setItem("bloom-dashboard-notice", "Owner access is required."); location.replace("/dashboard/"); return; }
  try { await loadQueue(); } catch { notify("The support queue could not be loaded.", "error"); }
  pollTimer = setInterval(async () => { if (!document.hidden) { try { await loadQueue(); await refreshOpenTicket(); } catch {} } }, 12_000);
}

window.addEventListener("beforeunload", () => clearInterval(pollTimer));
initialize();
