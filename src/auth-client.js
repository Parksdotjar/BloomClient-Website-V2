import { createAuthClient } from "better-auth/client";
import { multiSessionClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({ plugins: [multiSessionClient()] });

const ACCOUNT_PREVIEW_KEY = "bloom.account-preview.v1";

export function getCachedAccountPreview() {
  try {
    const value = JSON.parse(localStorage.getItem(ACCOUNT_PREVIEW_KEY) || "null");
    return value && typeof value === "object" ? value : null;
  } catch { return null; }
}

export function cacheAccountPreview(user) {
  try { localStorage.setItem(ACCOUNT_PREVIEW_KEY, JSON.stringify({ name: user.name || "Bloom account", image: user.image || "" })); } catch { /* Storage can be unavailable in private contexts. */ }
}

export function clearAccountPreview() {
  try { localStorage.removeItem(ACCOUNT_PREVIEW_KEY); } catch { /* Storage can be unavailable in private contexts. */ }
}

export async function getAccount() {
  const response = await fetch("/v1/account/me", { credentials: "same-origin", headers: { Accept: "application/json" } });
  if (response.status === 401) { clearAccountPreview(); return null; }
  if (!response.ok) throw new Error("Bloom account service is unavailable.");
  const account = await response.json();
  cacheAccountPreview(account.user);
  return account;
}

export async function getAuthConfig() {
  const response = await fetch("/v1/account/config", { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Bloom account service is unavailable.");
  return response.json();
}

export async function getSavedAccounts() {
  const result = await authClient.multiSession.listDeviceSessions();
  if (result.error) throw new Error(result.error.message || "Saved accounts could not be loaded.");
  return result.data || [];
}

export function addAnotherAccount() {
  location.assign("/signin/?switch=1");
}

export async function signOutCurrentAccount(userId) {
  const sessions = await getSavedAccounts().catch(() => []);
  const active = sessions.find((entry) => entry.user.id === userId);
  if (active) {
    const result = await authClient.multiSession.revoke({ sessionToken: active.session.token });
    if (!result.error) { clearAccountPreview(); return; }
  }
  await authClient.signOut();
  clearAccountPreview();
}

export const initials = (name, email) => (name || email || "B")
  .split(/\s+/)
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

export function safeAvatar(image, name, email, className = "account-avatar") {
  if (image) {
    const avatar = document.createElement("img");
    avatar.className = className;
    avatar.src = image;
    avatar.alt = "";
    avatar.referrerPolicy = "no-referrer";
    return avatar;
  }
  const fallback = document.createElement("span");
  fallback.className = `${className} avatar-fallback`;
  fallback.textContent = initials(name, email);
  fallback.setAttribute("aria-hidden", "true");
  return fallback;
}
