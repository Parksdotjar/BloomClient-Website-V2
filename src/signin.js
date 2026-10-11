import { authClient, getAccount, getAuthConfig } from "./auth-client.js";
import { notify } from "./notification-bar.js";

const buttons = [...document.querySelectorAll("[data-provider]")];
const params = new URLSearchParams(location.search);
const requestedReturn = params.get("returnTo");
const callbackURL = requestedReturn?.startsWith("/") && !requestedReturn.startsWith("//") ? requestedReturn : "/dashboard/";

const messages = {
  account_not_linked: "That provider uses the same email as another Bloom account. Sign in with the original provider, then connect this one from the dashboard.",
  account_already_linked_to_different_user: "That provider is already connected to another Bloom account.",
  access_denied: "Sign-in was cancelled.",
};

async function initialize() {
  const existing = await getAccount().catch(() => null);
  if (existing && !params.has("switch")) {
    location.replace(callbackURL);
    return;
  }

  const error = params.get("error");
  if (error) notify(messages[error] || "Bloom could not complete that sign-in. Please try again.", "error");

  try {
    const { providers } = await getAuthConfig();
    for (const button of buttons) {
      const available = providers.includes(button.dataset.provider);
      button.disabled = !available;
      if (!available) button.title = `${button.dataset.provider === "google" ? "Google" : "GitHub"} sign-in is not configured on this server yet.`;
    }
    if (!providers.length) notify("Google and GitHub sign-in is currently unavailable.", "error");
  } catch {
    for (const button of buttons) button.disabled = true;
    notify("The Bloom account service is unavailable.", "error");
  }
}

for (const button of buttons) {
  button.addEventListener("click", async () => {
    for (const item of buttons) item.disabled = true;
    notify(`Opening ${button.dataset.provider === "google" ? "Google" : "GitHub"}…`, "info");
    const result = await authClient.signIn.social({ provider: button.dataset.provider, callbackURL, errorCallbackURL: "/signin/" });
    if (result?.error) {
      for (const item of buttons) item.disabled = false;
      notify(result.error.message || "Sign-in could not be started.", "error");
    }
  });
}

initialize();
