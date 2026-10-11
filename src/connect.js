import { authClient, getAccount, getSavedAccounts, safeAvatar } from "./auth-client.js";

const params = new URLSearchParams(location.search);
const challenge = params.get("challenge") || "";
const state = params.get("state") || "";
const portValue = params.get("port");
const port = portValue === null ? null : Number(portValue);
const currentPath = `${location.pathname}${location.search}`;
const accounts = document.querySelector("[data-connect-accounts]");
const approve = document.querySelector("[data-connect-approve]");
const cancel = document.querySelector("[data-connect-cancel]");
const status = document.querySelector("[data-connect-status]");
let activeAccount = null;

const callbackFor = (error) => {
  const callback = new URL(`http://127.0.0.1:${port}/callback`);
  callback.searchParams.set("error", error);
  callback.searchParams.set("state", state);
  return callback.href;
};

function renderAccount(entry, selected) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "connect-account";
  button.dataset.selected = String(selected);
  button.append(safeAvatar(entry.user.image, entry.user.name, entry.user.email, "connect-avatar"));
  const copy = document.createElement("span");
  const name = document.createElement("strong");
  name.textContent = entry.user.name || "Bloom account";
  const email = document.createElement("small");
  email.textContent = entry.user.email || "";
  copy.append(name, email);
  const marker = document.createElement("i");
  marker.setAttribute("aria-hidden", "true");
  button.append(copy, marker);
  button.setAttribute("aria-pressed", String(selected));
  button.addEventListener("click", async () => {
    if (entry.user.id === activeAccount.user.id) return;
    for (const item of accounts.querySelectorAll("button")) item.disabled = true;
    status.textContent = `Switching to ${entry.user.name || entry.user.email}…`;
    const result = await authClient.multiSession.setActive({ sessionToken: entry.session.token });
    if (result.error) {
      status.textContent = result.error.message || "That account could not be selected.";
      for (const item of accounts.querySelectorAll("button")) item.disabled = false;
      return;
    }
    location.reload();
  });
  return button;
}

async function initialize() {
  if (!challenge || !state || (port !== null && (!Number.isInteger(port) || port < 1024 || port > 65535))) {
    approve.disabled = true;
    cancel.disabled = true;
    status.textContent = "This connection request is invalid. Return to Bloom Client and try again.";
    return;
  }
  const account = await getAccount().catch(() => null);
  if (!account) {
    location.replace(`/signin/?returnTo=${encodeURIComponent(currentPath)}`);
    return;
  }
  const saved = await getSavedAccounts().catch(() => []);
  const available = saved.length ? saved : [{ user: account.user, session: null }];
  activeAccount = available.find((entry) => entry.user.id === account.user.id) || available[0];
  accounts.replaceChildren(...available.map((entry) => renderAccount(entry, entry.user.id === activeAccount.user.id)));
}

approve.addEventListener("click", async () => {
  approve.disabled = true;
  cancel.disabled = true;
  status.textContent = "Connecting…";
  try {
    const response = await fetch("/v1/social/native/approve", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ challenge, state, ...(port === null ? {} : { port }) }),
    });
    if (response.status === 401) { location.replace(`/signin/?returnTo=${encodeURIComponent(currentPath)}`); return; }
    const result = await response.json();
    if (!response.ok || !result.approved) throw new Error("Bloom could not approve this connection.");
    if (result.callbackUrl) {
      // Compatibility for older clients. A top-level navigation is the standard
      // loopback OAuth flow and avoids private-network fetch restrictions.
      location.replace(result.callbackUrl);
      return;
    }
    location.replace("/connect/connected/");
  } catch (error) {
    approve.disabled = false;
    cancel.disabled = false;
    status.textContent = error.message || "Bloom could not approve this connection.";
  }
});

cancel.addEventListener("click", async () => {
  cancel.disabled = true;
  approve.disabled = true;
  if (port !== null) {
    location.replace(callbackFor("access_denied"));
    return;
  }
  try {
    await fetch("/v1/social/native/cancel", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ challenge, state }),
    });
    status.textContent = "Connection cancelled. You can close this tab.";
    cancel.textContent = "Cancelled";
  } catch {
    status.textContent = "Return to Bloom Client and cancel the connection there.";
    cancel.disabled = false;
  }
});
initialize();
