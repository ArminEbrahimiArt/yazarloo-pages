export function initFiltering({ projectIndex, onFilterChange }) {
  const filterButtons = document.querySelectorAll("[data-filter]");
  if (filterButtons.length === 0) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((candidate) => {
        candidate.setAttribute("aria-pressed", String(candidate === button));
      });

      projectIndex.dataset.activeFilter = button.dataset.filter;
      onFilterChange(button.dataset.filter);
    });
  });
}

