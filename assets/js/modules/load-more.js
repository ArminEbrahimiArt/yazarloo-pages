export function initLoadMore({ projectIndex, loadMoreButton, batchSize }) {
  const cards = [...projectIndex.querySelectorAll("[data-project-card]")];
  let activeFilter = "all";
  let visibleCount = batchSize;

  function matchingCards() {
    return cards.filter((card) => {
      const categories = card.dataset.categories.split(/\s+/);
      return activeFilter === "all" || categories.includes(activeFilter);
    });
  }

  function render() {
    const matches = matchingCards();
    const visibleCards = new Set(matches.slice(0, visibleCount));
    const teaserCard = matches[visibleCount] ?? null;

    cards.forEach((card) => {
      const isTeaser = card === teaserCard;
      card.hidden = !visibleCards.has(card) && !isTeaser;
      card.classList.toggle("is-project-teaser", isTeaser);
      card.toggleAttribute("inert", isTeaser);

      if (isTeaser) card.setAttribute("aria-hidden", "true");
      else card.removeAttribute("aria-hidden");
    });

    loadMoreButton.hidden = !teaserCard;
  }

  loadMoreButton.addEventListener("click", () => {
    visibleCount += batchSize;
    render();
  });

  render();

  return {
    setFilter(filter) {
      activeFilter = filter;
      visibleCount = batchSize;
      render();
    }
  };
}

