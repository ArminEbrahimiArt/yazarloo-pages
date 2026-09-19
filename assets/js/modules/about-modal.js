export function initAboutModal() {
  const dialog = document.querySelector("#about-dialog");
  const openButtons = document.querySelectorAll("[data-about-open]");
  const closeButton = dialog?.querySelector("[data-about-close]");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let returnFocus = null;
  let closeFallback = 0;

  if (!(dialog instanceof HTMLDialogElement) || openButtons.length === 0 || !closeButton) return;

  function finishClose() {
    window.clearTimeout(closeFallback);
    dialog.classList.remove("is-open", "is-closing");
    if (dialog.open) dialog.close();
  }

  function closeDialog() {
    if (!dialog.open) return;
    if (reducedMotionQuery.matches) {
      finishClose();
      return;
    }

    dialog.classList.remove("is-open");
    dialog.classList.add("is-closing");
    closeFallback = window.setTimeout(finishClose, 400);
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      returnFocus = button;
      dialog.showModal();
      document.body.classList.add("modal-open");
      requestAnimationFrame(() => dialog.classList.add("is-open"));
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", closeDialog);

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });

  dialog.addEventListener("transitionend", (event) => {
    if (event.target === dialog && event.propertyName === "opacity" && dialog.classList.contains("is-closing")) {
      finishClose();
    }
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  dialog.addEventListener("close", () => {
    window.clearTimeout(closeFallback);
    dialog.classList.remove("is-open", "is-closing");
    document.body.classList.remove("modal-open");
    returnFocus?.focus();
    returnFocus = null;
  });
}
