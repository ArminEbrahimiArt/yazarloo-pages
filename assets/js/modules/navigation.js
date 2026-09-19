const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let activeScrollFrame = 0;

function targetForUrl(url) {
  if (!url.hash || url.hash === "#top") return document.querySelector("#top");

  try {
    return document.getElementById(decodeURIComponent(url.hash.slice(1)));
  } catch {
    return null;
  }
}

function targetScrollPosition(target) {
  if (!target || target.id === "top") return 0;
  const offset = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
}

function sectionForTarget(target) {
  if (target?.id === "about" || target?.id === "contact") return target.id;
  return "home";
}

function sectionForHash() {
  const section = window.location.hash.slice(1);
  return section === "about" || section === "contact" ? section : "home";
}

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - ((-2 * progress + 2) ** 3) / 2;
}

export function scrollToTarget(target, {
  updateHistory = false,
  url = null,
  onComplete = null
} = {}) {
  cancelAnimationFrame(activeScrollFrame);
  activeScrollFrame = 0;
  const destination = targetScrollPosition(target);

  const finish = () => {
    activeScrollFrame = 0;
    window.scrollTo(0, destination);

    if (updateHistory && url) {
      const nextLocation = `${url.pathname}${url.search}${url.hash}`;
      const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (nextLocation !== currentLocation) {
        history.pushState({ navigationTarget: target?.id || "top" }, "", nextLocation);
      }
    }

    onComplete?.();
  };

  if (reducedMotionQuery.matches) {
    finish();
    return;
  }

  const start = window.scrollY;
  const distance = destination - start;
  if (Math.abs(distance) < 2) {
    finish();
    return;
  }

  const duration = Math.min(1050, Math.max(480, 520 + Math.abs(distance) * 0.22));
  const startedAt = performance.now();

  const step = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    window.scrollTo(0, start + distance * easeInOutCubic(progress));

    if (progress < 1) {
      activeScrollFrame = requestAnimationFrame(step);
      return;
    }

    finish();
  };

  activeScrollFrame = requestAnimationFrame(step);
}

function alignTarget(target) {
  if (target) window.scrollTo(0, targetScrollPosition(target));
}

export function initNavigation() {
  const header = document.querySelector(".site-header");
  const navLinks = [...document.querySelectorAll("[data-nav-section]")];
  const isHomePage = document.body.dataset.page === "home";
  const aboutSection = document.querySelector("#about");
  const contactSection = document.querySelector("#contact");
  let programmedSection = null;
  let scrollStateFrame = 0;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = isHomePage ? "manual" : "auto";
  }

  function setActiveNav(section) {
    navLinks.forEach((link) => {
      if (!isHomePage || link.dataset.navSection !== section) {
        link.removeAttribute("aria-current");
        return;
      }

      link.setAttribute("aria-current", "location");
    });
  }

  function sectionFromGeometry() {
    if (!aboutSection || !contactSection) return "home";

    const atDocumentEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (atDocumentEnd) return "contact";

    const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
    const probe = headerBottom + Math.min(window.innerHeight * 0.22, 180);

    if (contactSection.getBoundingClientRect().top <= probe) return "contact";
    if (aboutSection.getBoundingClientRect().top <= probe) return "about";
    return "home";
  }

  function updateScrollState() {
    scrollStateFrame = 0;
    header?.classList.toggle("is-scrolled", window.scrollY > 12);

    if (isHomePage && !programmedSection) {
      setActiveNav(sectionFromGeometry());
    }
  }

  function scheduleScrollStateUpdate() {
    if (scrollStateFrame) return;
    scrollStateFrame = requestAnimationFrame(updateScrollState);
  }

  function alignHistoryTarget(event = null) {
    const stateTarget = event?.state?.navigationTarget;
    const target = stateTarget
      ? document.getElementById(stateTarget)
      : window.location.hash
        ? targetForUrl(new URL(window.location.href))
        : event?.type === "popstate"
          ? document.querySelector("#top")
          : null;

    if (isHomePage) {
      programmedSection = target ? sectionForTarget(target) : sectionForHash();
      setActiveNav(programmedSection);
    }

    requestAnimationFrame(() => {
      alignTarget(target);
      programmedSection = null;
      updateScrollState();
    });
  }

  if (isHomePage && (window.location.hash === "#about" || window.location.hash === "#contact")) {
    programmedSection = sectionForHash();
  }

  setActiveNav(isHomePage ? sectionForHash() : null);
  updateScrollState();

  window.addEventListener("scroll", scheduleScrollStateUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollStateUpdate, { passive: true });

  document.querySelectorAll("[data-scroll-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const url = new URL(link.href, window.location.href);
      const isSameDocument = url.origin === window.location.origin
        && url.pathname === window.location.pathname
        && url.search === window.location.search;
      if (!isSameDocument) return;

      const target = targetForUrl(url);
      if (!target) return;

      event.preventDefault();
      const targetSection = sectionForTarget(target);

      if (isHomePage) {
        programmedSection = targetSection;
        setActiveNav(targetSection);
      }

      scrollToTarget(target, {
        updateHistory: true,
        url,
        onComplete() {
          if (!isHomePage || programmedSection !== targetSection) return;
          programmedSection = null;
          updateScrollState();
        }
      });
    });
  });

  requestAnimationFrame(() => requestAnimationFrame(() => alignHistoryTarget()));
  window.addEventListener("load", () => alignHistoryTarget(), { once: true });
  window.addEventListener("popstate", alignHistoryTarget);
}
