const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function revealImmediately(elements) {
  elements.forEach((element) => element.classList.add("is-visible"));
}

export function initMotion() {
  const elements = [...document.querySelectorAll("[data-reveal]")];
  if (elements.length === 0) return;

  if (reducedMotionQuery.matches || !("IntersectionObserver" in window)) {
    revealImmediately(elements);
    return;
  }

  document.documentElement.classList.add("motion-ready");

  const observer = new IntersectionObserver((entries) => {
    const entering = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);
    const groupCounts = new Map();

    entering.forEach((entry) => {
      const group = entry.target.closest("[data-reveal-group]");
      const groupIndex = group ? (groupCounts.get(group) ?? 0) : 0;
      if (group) groupCounts.set(group, groupIndex + 1);

      entry.target.style.setProperty("--reveal-delay", `${Math.min(groupIndex, 4) * 70}ms`);
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -8%",
    threshold: 0.08
  });

  elements.forEach((element) => observer.observe(element));
}
