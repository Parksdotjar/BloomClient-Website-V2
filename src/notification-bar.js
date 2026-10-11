let hideTimer;
let finishTimer;

const getBar = () => {
  let bar = document.querySelector("[data-site-notification]");
  if (bar) return bar;
  bar = document.createElement("div");
  bar.className = "site-notification";
  bar.dataset.siteNotification = "";
  bar.hidden = true;
  bar.append(document.createElement("span"));
  document.body.append(bar);
  return bar;
};

export function notify(message, kind = "info", duration = 3000) {
  const bar = getBar();
  clearTimeout(hideTimer);
  clearTimeout(finishTimer);
  bar.classList.remove("is-visible", "is-leaving");
  bar.dataset.kind = ["success", "error"].includes(kind) ? kind : "info";
  bar.setAttribute("role", kind === "error" ? "alert" : "status");
  bar.setAttribute("aria-live", kind === "error" ? "assertive" : "polite");
  bar.querySelector("span").textContent = message;
  bar.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.add("is-visible")));
  hideTimer = setTimeout(() => {
    bar.classList.remove("is-visible");
    bar.classList.add("is-leaving");
    finishTimer = setTimeout(() => {
      bar.hidden = true;
      bar.classList.remove("is-leaving");
    }, 420);
  }, duration);
}
