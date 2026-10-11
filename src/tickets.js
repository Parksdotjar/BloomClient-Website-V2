import { getAccount } from "./auth-client.js";
import { createTicket, formatTicketDate, listTickets, ticketStatus } from "./tickets-api.js";
import { notify } from "./notification-bar.js";

const categories = {
  technical: "Technical problem",
  launcher: "Launcher or update",
  cosmetics: "Locker or cosmetics",
  account: "Bloom account",
  other: "Something else",
};

const issues = {
  technical: ["Bloom crashes or will not open", "A control does not work", "Performance or Java problem", "Mod, resource pack, or shader problem", "Something else technical"],
  launcher: ["Install failed", "Update failed", "An instance will not launch", "A game version or loader is missing", "Release file question"],
  cosmetics: ["Cape or cloak is missing", "Skin import problem", "Locker item will not equip", "Cosmetic texture problem", "Bloom badge or presence problem"],
  account: ["Cannot sign in", "Google or GitHub connection", "Switching accounts", "Profile or session problem", "Privacy or deletion request"],
  other: ["Question about Bloom", "Feedback or suggestion", "Community issue", "Something not listed"],
};

const loading = document.querySelector("[data-tickets-loading]");
const signedOut = document.querySelector("[data-tickets-signed-out]");
const home = document.querySelector("[data-tickets-home]");
const create = document.querySelector("[data-tickets-create]");
const sent = document.querySelector("[data-tickets-sent]");
const list = document.querySelector("[data-public-ticket-list]");
const form = document.querySelector("[data-public-ticket-form]");
const category = form.elements.category;
const issue = form.elements.issue;
let authenticated = false;

const show = (panel) => {
  for (const item of [loading, signedOut, home, create, sent]) item.hidden = item !== panel;
  panel.querySelector("h1, h2, select, input")?.focus({ preventScroll: true });
};

const makeStatus = (value) => {
  const status = document.createElement("span");
  status.className = "ticket-status";
  status.dataset.status = value;
  status.textContent = ticketStatus[value] || value;
  return status;
};

const renderTickets = async () => {
  const result = await listTickets();
  list.replaceChildren();
  if (!result.tickets.length) {
    const state = document.createElement("div");
    state.className = "public-ticket-empty";
    const image = document.createElement("img");
    image.src = "/bloom-ticket-bunny.png";
    image.alt = "Bloom's rabbit mascot working at a laptop";
    const title = document.createElement("h3");
    title.textContent = "No ticket history";
    const copy = document.createElement("p");
    copy.textContent = "When something needs a closer look, send it directly to Bloom.";
    const action = document.createElement("button");
    action.type = "button";
    action.textContent = "Submit your first ticket";
    action.addEventListener("click", startTicket);
    state.append(image, title, copy, action);
    list.append(state);
    return;
  }

  for (const ticket of result.tickets) {
    const row = document.createElement("a");
    row.className = "public-ticket-row";
    row.href = "/dashboard/#tickets";
    const icon = document.createElement("span");
    icon.className = "public-ticket-icon";
    icon.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 4h14v5a3 3 0 0 0 0 6v5H5v-5a3 3 0 0 0 0-6V4Z"/><path d="M12 7v2m0 3v2m0 3v1"/></svg>';
    const details = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = ticket.subject;
    const meta = document.createElement("small");
    meta.textContent = `${categories[ticket.category] || "Ticket"} · Updated ${formatTicketDate(ticket.updatedAt)}`;
    details.append(title, meta);
    const chevron = document.createElement("svg");
    chevron.classList.add("public-ticket-chevron");
    chevron.setAttribute("aria-hidden", "true");
    chevron.setAttribute("viewBox", "0 0 24 24");
    chevron.innerHTML = '<path d="m9 18 6-6-6-6"/>';
    row.append(icon, details, makeStatus(ticket.status), chevron);
    list.append(row);
  }
};

function startTicket() {
  form.reset();
  issue.replaceChildren(new Option("Select an issue", ""));
  issue.disabled = true;
  document.querySelector('[data-form-step="issue"]').hidden = true;
  document.querySelector('[data-form-step="details"]').hidden = true;
  show(create);
}

category.addEventListener("change", () => {
  issue.replaceChildren(new Option("Select an issue", ""));
  for (const name of issues[category.value] || []) issue.add(new Option(name, name));
  issue.disabled = !category.value;
  document.querySelector('[data-form-step="issue"]').hidden = !category.value;
  document.querySelector('[data-form-step="details"]').hidden = true;
  if (category.value) issue.focus();
});

issue.addEventListener("change", () => {
  const details = document.querySelector('[data-form-step="details"]');
  details.hidden = !issue.value;
  if (issue.value) form.elements.subject.focus();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  const data = new FormData(form);
  button.disabled = true;
  notify("Sending your ticket…", "info");
  try {
    await createTicket({
      category: data.get("category"),
      subject: data.get("subject"),
      message: `Issue: ${data.get("issue")}\n\n${data.get("message")}`,
    });
    notify("Ticket sent.", "success");
    show(sent);
  } catch (error) {
    notify(error.status === 429 ? "You have opened several tickets recently. Please wait before creating another." : "Your ticket could not be sent.", "error");
  } finally {
    button.disabled = false;
  }
});

document.querySelectorAll("[data-start-ticket]").forEach((button) => button.addEventListener("click", startTicket));
document.querySelector("[data-cancel-ticket]").addEventListener("click", () => show(home));
document.querySelector("[data-return-tickets]").addEventListener("click", async () => { await renderTickets(); show(home); });

try {
  authenticated = Boolean(await getAccount());
  if (!authenticated) show(signedOut);
  else {
    await renderTickets();
    show(home);
  }
} catch {
  loading.textContent = "Tickets are unavailable right now. Please try again shortly.";
}
