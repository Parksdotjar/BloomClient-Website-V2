import { addAnotherAccount, getAccount, getCachedAccountPreview, safeAvatar, signOutCurrentAccount } from "./auth-client.js";
import { getAccountCapabilities } from "./tickets-api.js";

const control = document.querySelector("[data-account-control]");

const renderSignIn = () => {
  const signIn = document.createElement("a");
  signIn.className = "header-signin";
  signIn.href = "/signin/";
  signIn.textContent = "Sign in";
  control.className = "header-auth";
  control.replaceChildren(signIn);
  control.dataset.accountReady = "";
};

const cachedPreview = getCachedAccountPreview();
if (control && cachedPreview) {
  const preview = document.createElement("span");
  preview.className = "account-trigger account-trigger-preview";
  preview.append(safeAvatar(cachedPreview.image, cachedPreview.name));
  control.className = "header-account header-account-placeholder";
  control.replaceChildren(preview);
  control.dataset.accountReady = "";
}

const icon = (path) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = path;
  return svg;
};

async function renderAccountControl() {
  if (!control) return;
  let account = null;
  try { account = await getAccount(); } catch { control.dataset.unavailable = "true"; control.dataset.accountReady = ""; return; }
  if (!account) { renderSignIn(); return; }

  const { user } = account;
  control.replaceChildren();
  control.className = "header-account";
  control.dataset.accountReady = "";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "account-trigger";
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-label", `Open account menu for ${user.name || user.email}`);
  trigger.append(safeAvatar(user.image, user.name, user.email));

  const menu = document.createElement("div");
  menu.className = "account-menu";
  menu.hidden = true;
  menu.setAttribute("role", "menu");

  const identity = document.createElement("div");
  identity.className = "account-menu-identity";
  const name = document.createElement("strong");
  name.textContent = user.name || "Bloom account";
  const email = document.createElement("span");
  email.textContent = user.email;
  identity.append(name, email);

  const dashboard = document.createElement("a");
  dashboard.href = "/dashboard/";
  dashboard.setAttribute("role", "menuitem");
  dashboard.append(icon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'), "Dashboard");

  const capabilities = await getAccountCapabilities().catch(() => ({ owner: false }));
  const ownerDashboard = document.createElement("a");
  ownerDashboard.href = "/owner/";
  ownerDashboard.setAttribute("role", "menuitem");
  ownerDashboard.append(icon('<path d="M12 3 4 7v5c0 5 3.4 8.2 8 9 4.6-.8 8-4 8-9V7l-8-4Z"/><path d="M9 12h6M12 9v6"/>'), "Owner dashboard");

  const switchAccount = document.createElement("button");
  switchAccount.type = "button";
  switchAccount.setAttribute("role", "menuitem");
  switchAccount.append(icon('<path d="M7 7h11l-3-3m3 3-3 3M17 17H6l3 3m-3-3 3-3"/>'), "Switch account");
  switchAccount.addEventListener("click", addAnotherAccount);

  const signOut = document.createElement("button");
  signOut.type = "button";
  signOut.setAttribute("role", "menuitem");
  signOut.append(icon('<path d="M10 17l5-5-5-5m5 5H3m12-9h5v18h-5"/>'), "Sign out");
  signOut.addEventListener("click", async () => {
    signOut.disabled = true;
    await signOutCurrentAccount(user.id);
    location.assign("/");
  });

  menu.append(identity, dashboard);
  if (capabilities.owner) menu.append(ownerDashboard);
  menu.append(switchAccount, signOut);
  control.append(trigger, menu);

  const close = () => { menu.hidden = true; trigger.setAttribute("aria-expanded", "false"); };
  trigger.addEventListener("click", () => {
    const open = menu.hidden;
    menu.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (event) => { if (!control.contains(event.target)) close(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { close(); trigger.focus(); } });
}

renderAccountControl();
