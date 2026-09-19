const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const emphasisDuration = 1800;

export function initRoleSequence() {
  const sequence = document.querySelector("[data-role-sequence]");
  if (!sequence) return;

  const roles = [...sequence.querySelectorAll("[data-role-item]")];
  if (roles.length === 0) return;

  let activeIndex = 0;
  let timer = 0;

  const stop = () => {
    window.clearInterval(timer);
    timer = 0;
    sequence.classList.remove("is-role-sequence-ready");
    roles.forEach((role) => role.classList.remove("is-active"));
  };

  const emphasize = (index) => {
    roles.forEach((role, roleIndex) => {
      role.classList.toggle("is-active", roleIndex === index);
    });
  };

  const start = () => {
    stop();
    if (reducedMotionQuery.matches || document.hidden) return;

    activeIndex = 0;
    sequence.classList.add("is-role-sequence-ready");
    emphasize(activeIndex);
    timer = window.setInterval(() => {
      activeIndex = (activeIndex + 1) % roles.length;
      emphasize(activeIndex);
    }, emphasisDuration);
  };

  reducedMotionQuery.addEventListener("change", start);
  document.addEventListener("visibilitychange", start);
  start();
}
