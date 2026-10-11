const filterButtons = [...document.querySelectorAll("[data-filter]")];
const changeGroups = [...document.querySelectorAll("[data-change-type]")];
const releases = [...document.querySelectorAll("[data-release]")];
const status = document.querySelector(".filter-status");

const categoryIcons = {
  new: '<path d="M12 5v14M5 12h14"/>',
  improved: '<path d="M12 19V5m-6 6 6-6 6 6"/>',
  fixed: '<path d="M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-2.4 2.4-3-3 2.4-2.4Z"/>',
};

for (const group of changeGroups) {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.classList.add("change-symbol");
  icon.innerHTML = categoryIcons[group.dataset.changeType];
  group.prepend(icon);
}

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    for (const item of filterButtons) {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    }

    for (const group of changeGroups) {
      group.hidden = filter !== "all" && group.dataset.changeType !== filter;
    }

    for (const release of releases) {
      release.hidden = !release.querySelector("[data-change-type]:not([hidden])");
    }

    status.textContent = filter === "all" ? "Showing all changes" : `Showing ${filter} changes`;
  });
}
