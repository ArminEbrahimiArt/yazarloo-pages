import { initAboutModal } from "./modules/about-modal.js";
import { initFiltering } from "./modules/filtering.js";
import { initLoadMore } from "./modules/load-more.js";
import { initMedia } from "./modules/media.js";
import { initMotion } from "./modules/motion.js";
import { initNavigation } from "./modules/navigation.js";
import { initRoleSequence } from "./modules/role-sequence.js";

initMotion();
initNavigation();
initRoleSequence();
initMedia();
initAboutModal();

const projectIndex = document.querySelector("[data-project-index]");
const loadMoreButton = document.querySelector("[data-load-more]");

if (projectIndex && loadMoreButton) {
  const loadMore = initLoadMore({ projectIndex, loadMoreButton, batchSize: 4 });
  initFiltering({ projectIndex, onFilterChange: loadMore.setFilter });
}

