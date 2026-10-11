const searchForm = document.querySelector(".support-search");
const searchInput = document.querySelector("#support-search-input");
const searchableItems = [...document.querySelectorAll("[data-searchable]")];
const emptyState = document.querySelector(".support-search-empty");

searchForm.addEventListener("submit", (event) => event.preventDefault());

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLocaleLowerCase();
  let visibleItems = 0;

  for (const item of searchableItems) {
    const isVisible = !query || item.textContent.toLocaleLowerCase().includes(query);
    item.hidden = !isVisible;
    if (isVisible) visibleItems += 1;
  }

  emptyState.hidden = visibleItems !== 0;
});
