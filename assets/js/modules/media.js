export function initMedia() {
  document.querySelectorAll("video").forEach((video) => {
    video.setAttribute("playsinline", "");
  });
}

