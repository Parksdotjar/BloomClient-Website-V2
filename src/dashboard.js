import { addAnotherAccount, authClient, getAccount, getAuthConfig, getSavedAccounts, safeAvatar, signOutCurrentAccount } from "./auth-client.js";
import { notify } from "./notification-bar.js";
import { initializeDashboardTickets } from "./dashboard-tickets.js";

const providerNames = { google: "Google", github: "GitHub" };
const views = [...document.querySelectorAll("[data-dashboard-view]")];
const viewTriggers = [...document.querySelectorAll("[data-view-target]")];
const sidebarTabs = [...document.querySelectorAll(".dashboard-sidebar nav [data-view-target]")];
const validViews = new Set(views.map((view) => view.dataset.dashboardView));
const connectionHelp = document.querySelector("[data-connection-help]");
const connectionHelpPopover = document.querySelector("[data-connection-help-popover]");
let account;

const closeConnectionHelp = () => {
  connectionHelpPopover.hidden = true;
  connectionHelp.setAttribute("aria-expanded", "false");
};

const setView = (requestedView) => {
  const name = validViews.has(requestedView) ? requestedView : "overview";
  for (const view of views) view.hidden = view.dataset.dashboardView !== name;
  for (const item of sidebarTabs) {
    const active = item.dataset.viewTarget === name;
    item.classList.toggle("active", active);
    item.setAttribute("aria-current", active ? "page" : "false");
  }
  history.replaceState(null, "", `#${name}`);
  document.querySelector(`[data-dashboard-view="${name}"] h1`)?.focus({ preventScroll: true });
  closeConnectionHelp();
};

const renderIdentity = () => {
  const { user } = account;
  document.querySelectorAll("[data-user-name]").forEach((item) => { item.textContent = user.name || "Bloom account"; });
  document.querySelectorAll("[data-user-email]").forEach((item) => { item.textContent = user.email; });
  document.querySelectorAll("[data-user-avatar]").forEach((item) => item.replaceChildren(safeAvatar(user.image, user.name, user.email, "dashboard-avatar-image")));
  document.querySelector("#display-name").value = user.name || "";
};

const updateProviderSummary = () => {
  const connected = ["google", "github"].filter((provider) => account.accounts.some((item) => item.providerId === provider));
  const summary = connected.length === 2 ? "Google and GitHub connected" : connected.length === 1 ? `${providerNames[connected[0]]} connected` : "No providers connected";
  document.querySelectorAll("[data-provider-summary]").forEach((item) => { item.textContent = summary; });
};

const renderConnections = async () => {
  const config = await getAuthConfig();
  const list = document.querySelector("[data-connection-list]");
  list.replaceChildren();
  updateProviderSummary();
  for (const provider of ["google", "github"]) {
    const linked = account.accounts.find((item) => item.providerId === provider);
    const row = document.createElement("div");
    row.className = "connection-row";
    row.innerHTML = `<span class="provider-mark" aria-hidden="true"><img src="/${provider}-mark.svg" alt="" /></span><div><strong>${providerNames[provider]}</strong><span>${linked ? "Connected to this Bloom account" : "Not connected"}</span></div>`;
    const action = document.createElement("button");
    action.type = "button";
    if (linked) {
      action.textContent = "Disconnect";
      action.disabled = account.accounts.length <= 1;
      if (action.disabled) action.title = "Connect another provider before disconnecting your only sign-in method.";
      action.addEventListener("click", async () => {
        action.disabled = true;
        notify(`Disconnecting ${providerNames[provider]}…`, "info");
        const result = await authClient.unlinkAccount({ accountId: linked.id });
        if (result.error) {
          action.disabled = false;
          notify(result.error.message || "The account could not be disconnected.", "error");
          return;
        }
        account.accounts = account.accounts.filter((item) => item.id !== linked.id);
        notify(`${providerNames[provider]} disconnected.`, "success");
        await renderConnections();
      });
    } else {
      action.textContent = "Connect";
      action.disabled = !config.providers.includes(provider);
      if (action.disabled) action.title = `${providerNames[provider]} is not configured on this server.`;
      action.addEventListener("click", () => {
        notify(`Opening ${providerNames[provider]}…`, "info");
        authClient.linkSocial({ provider, callbackURL: "/dashboard/#connections", errorCallbackURL: "/dashboard/#connections" });
      });
    }
    row.append(action);
    list.append(row);
  }
};

const renderSavedAccounts = async () => {
  const list = document.querySelector("[data-device-account-list]");
  const sessions = await getSavedAccounts();
  list.replaceChildren();
  document.querySelectorAll("[data-saved-account-summary]").forEach((item) => { item.textContent = `${sessions.length} ${sessions.length === 1 ? "account" : "accounts"} available in this browser`; });
  for (const entry of sessions) {
    const row = document.createElement("div");
    row.className = "device-account-row";
    const isCurrent = entry.user.id === account.user.id;
    if (isCurrent) row.dataset.active = "true";
    row.append(safeAvatar(entry.user.image, entry.user.name, entry.user.email, "dashboard-avatar-image"));
    const identity = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = entry.user.name || "Bloom account";
    const email = document.createElement("span");
    email.textContent = entry.user.email;
    identity.append(name, email);
    const action = document.createElement("button");
    action.type = "button";
    if (isCurrent) {
      action.textContent = "Current";
      action.disabled = true;
    } else {
      action.textContent = "Switch";
      action.addEventListener("click", async () => {
        action.disabled = true;
        notify(`Opening ${entry.user.name || entry.user.email}…`, "info");
        const result = await authClient.multiSession.setActive({ sessionToken: entry.session.token });
        if (result.error) {
          action.disabled = false;
          notify(result.error.message || "That account could not be opened.", "error");
        } else {
          sessionStorage.setItem("bloom-dashboard-notice", "Account switched.");
          location.reload();
        }
      });
    }
    row.append(identity, action);
    list.append(row);
  }
};

async function initialize() {
  try { account = await getAccount(); } catch (error) { notify(error.message || "The Bloom account service is unavailable.", "error"); return; }
  if (!account) { location.replace(`/signin/?return=${encodeURIComponent("/dashboard/")}`); return; }
  renderIdentity();
  initializeDashboardTickets({ notify });
  setView(location.hash.slice(1));
  try {
    await Promise.all([renderConnections(), renderSavedAccounts()]);
  } catch {
    notify("Some account details could not be loaded.", "error");
  }
  const queuedNotice = sessionStorage.getItem("bloom-dashboard-notice");
  if (queuedNotice) {
    sessionStorage.removeItem("bloom-dashboard-notice");
    notify(queuedNotice, "success");
  }
}

for (const item of viewTriggers) item.addEventListener("click", () => setView(item.dataset.viewTarget));
window.addEventListener("hashchange", () => setView(location.hash.slice(1)));

connectionHelp.addEventListener("click", () => {
  const open = connectionHelpPopover.hidden;
  connectionHelpPopover.hidden = !open;
  connectionHelp.setAttribute("aria-expanded", String(open));
});

document.addEventListener("click", (event) => {
  if (!connectionHelpPopover.contains(event.target) && !connectionHelp.contains(event.target)) closeConnectionHelp();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeConnectionHelp();
});

document.querySelector("[data-save-profile]").addEventListener("click", async () => {
  const button = document.querySelector("[data-save-profile]");
  const name = document.querySelector("#display-name").value.trim();
  if (name.length < 2 || name.length > 64) { notify("Display name must be between 2 and 64 characters.", "error"); return; }
  button.disabled = true;
  notify("Saving profile…", "info");
  const result = await authClient.updateUser({ name });
  button.disabled = false;
  if (result.error) notify(result.error.message || "Profile could not be updated.", "error");
  else { account.user.name = name; renderIdentity(); notify("Profile saved.", "success"); }
});

document.querySelector("[data-revoke-sessions]").addEventListener("click", async () => {
  notify("Signing out other sessions…", "info");
  const result = await authClient.revokeOtherSessions();
  notify(result.error ? result.error.message : "Other sessions signed out.", result.error ? "error" : "success");
});

document.querySelectorAll("[data-switch-account]").forEach((button) => button.addEventListener("click", () => {
  button.disabled = true;
  notify("Opening account sign-in…", "info");
  addAnotherAccount();
}));

document.querySelector("[data-sign-out]").addEventListener("click", async () => {
  notify("Signing out…", "info");
  await signOutCurrentAccount(account.user.id);
  location.assign("/");
});

document.querySelector("[data-delete-account]").addEventListener("click", async () => {
  if (!confirm("Permanently delete this Bloom account and disconnect its sign-in providers?")) return;
  notify("Deleting account…", "info");
  const result = await authClient.deleteUser({ callbackURL: "/" });
  if (result.error) notify(result.error.message || "Account could not be deleted. Sign in again and retry.", "error");
});

initialize();
