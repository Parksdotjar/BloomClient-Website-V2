import { createTicket, formatTicketDate, getTicket, listTickets, replyToTicket, ticketStatus } from "./tickets-api.js";

const categoryNames = { technical: "Technical issue", launcher: "Launcher or update", cosmetics: "Locker or cosmetics", account: "Account", other: "Other" };

export function initializeDashboardTickets({ notify }) {
  const home = document.querySelector("[data-ticket-home]");
  const list = document.querySelector("[data-ticket-list]");
  const compose = document.querySelector("[data-ticket-compose]");
  const thread = document.querySelector("[data-ticket-thread]");
  const createForm = document.querySelector("[data-ticket-create-form]");
  const replyForm = document.querySelector("[data-ticket-reply-form]");
  let openTicketId = null;
  let pollTimer = null;

  const show = (panel) => {
    home.hidden = panel !== home;
    compose.hidden = panel !== compose;
    thread.hidden = panel !== thread;
  };

  const makeStatus = (status) => {
    const item = document.createElement("span");
    item.className = "ticket-status";
    item.dataset.status = status;
    item.textContent = ticketStatus[status] || status;
    return item;
  };

  const renderList = async () => {
    try {
      const result = await listTickets();
      list.replaceChildren();
      if (!result.tickets.length) {
        const empty = document.createElement("div");
        empty.className = "ticket-empty-state";
        const mark = document.createElement("span");
        mark.textContent = "✦";
        const title = document.createElement("strong");
        title.textContent = "No ticket history";
        const copy = document.createElement("p");
        copy.textContent = "When you need help, start a private conversation with Bloom support.";
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Create your first ticket";
        button.addEventListener("click", () => show(compose));
        empty.append(mark, title, copy, button);
        list.append(empty);
        return;
      }
      for (const ticket of result.tickets) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "ticket-row";
        const copy = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = ticket.subject;
        const meta = document.createElement("small");
        meta.textContent = `${categoryNames[ticket.category] || "Support"} · Updated ${formatTicketDate(ticket.updatedAt)}`;
        copy.append(title, meta);
        const arrow = document.createElement("span");
        arrow.className = "ticket-row-arrow";
        arrow.textContent = "›";
        button.append(copy, makeStatus(ticket.status), arrow);
        button.addEventListener("click", () => openThread(ticket.id));
        list.append(button);
      }
    } catch {
      list.innerHTML = '<p class="ticket-empty">Your tickets could not be loaded. Try again shortly.</p>';
    }
  };

  const renderThread = (result) => {
    document.querySelector("[data-ticket-subject]").textContent = result.ticket.subject;
    document.querySelector("[data-ticket-category]").textContent = categoryNames[result.ticket.category] || "Support";
    const status = document.querySelector("[data-ticket-status]");
    status.dataset.status = result.ticket.status;
    status.textContent = ticketStatus[result.ticket.status] || result.ticket.status;
    const messages = document.querySelector("[data-ticket-messages]");
    messages.replaceChildren();
    for (const message of result.messages) {
      const article = document.createElement("article");
      article.className = "ticket-message";
      article.dataset.author = message.authorRole;
      const label = document.createElement("div");
      const author = document.createElement("strong");
      author.textContent = message.authorRole === "owner" ? "Bloom Support" : "You";
      const time = document.createElement("time");
      time.dateTime = new Date(message.createdAt).toISOString();
      time.textContent = formatTicketDate(message.createdAt);
      const body = document.createElement("p");
      body.textContent = message.body;
      label.append(author, time);
      article.append(label, body);
      messages.append(article);
    }
    messages.scrollTop = messages.scrollHeight;
  };

  const refreshThread = async ({ quiet = false } = {}) => {
    if (!openTicketId) return;
    try { renderThread(await getTicket(openTicketId)); }
    catch { if (!quiet) notify("This ticket could not be loaded.", "error"); }
  };

  const openThread = async (id) => {
    openTicketId = id;
    show(thread);
    document.querySelector("[data-ticket-messages]").innerHTML = '<p class="ticket-empty">Loading conversation…</p>';
    await refreshThread();
    clearInterval(pollTimer);
    pollTimer = setInterval(() => {
      if (location.hash === "#tickets" && !thread.hidden) refreshThread({ quiet: true });
    }, 10_000);
  };

  document.querySelector("[data-new-ticket]").addEventListener("click", () => show(compose));
  document.querySelector("[data-close-compose]").addEventListener("click", () => show(home));
  document.querySelector("[data-ticket-back]").addEventListener("click", async () => { openTicketId = null; clearInterval(pollTimer); show(home); await renderList(); });

  createForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = createForm.querySelector("button[type=submit]");
    const data = new FormData(createForm);
    button.disabled = true;
    notify("Sending your ticket…", "info");
    try {
      const result = await createTicket({ category: data.get("category"), subject: data.get("subject"), message: data.get("message") });
      createForm.reset();
      notify("Ticket sent to Bloom Support.", "success");
      await openThread(result.ticket.id);
    } catch (error) {
      notify(error.status === 429 ? "You have opened several tickets recently. Please wait before creating another." : "Your ticket could not be sent.", "error");
    } finally { button.disabled = false; }
  });

  replyForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = replyForm.elements.message;
    const message = input.value.trim();
    if (!message || !openTicketId) return;
    const button = replyForm.querySelector("button");
    button.disabled = true;
    try {
      await replyToTicket(openTicketId, message);
      input.value = "";
      notify("Reply sent.", "success");
      await refreshThread();
    } catch { notify("Your reply could not be sent.", "error"); }
    finally { button.disabled = false; }
  });

  renderList();
  return { refresh: renderList };
}
