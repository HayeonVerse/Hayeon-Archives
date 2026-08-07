/* ============================================
   Hayeon Archive Gallery v3 (FIXED STABLE VERSION)
============================================ */

/* -----------------------------
   GLOBAL STATE
----------------------------- */
const galleryContainer = document.getElementById("gallery-container");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxVideo = document.getElementById("lightbox-video");
const closeButton = document.getElementById("close-lightbox");

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);
const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/;

function isImageFile(fileName) {
  if (!fileName) return false;
  const ext = fileName.split(".").pop().toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

function normalizeVideoList(videoList) {
  if (!Array.isArray(videoList)) return [];
  return videoList.filter(Boolean);
}

function getYoutubeVideoId(url) {
  if (!url) return null;
  const match = url.match(YOUTUBE_ID_PATTERN);
  return match ? match[1] : null;
}

function setLightboxMediaState(type, isVisible) {
  if (lightboxImage) {
    lightboxImage.style.display =
      type === "image" && isVisible ? "block" : "none";
  }

  if (lightboxVideo) {
    lightboxVideo.style.display =
      type === "video" && isVisible ? "block" : "none";
  }
}

let currentAlbum = [];
let currentAlbumPath = "";
let currentMediaIndex = 0;

let loadedAlbums = [];
let ytFrame = null;

let currentFilter = "all";

let sortOrder = localStorage.getItem("gallery-sort") || "desc";

const sortSelect = document.getElementById("sort-select");

sortSelect.value = sortOrder;

sortSelect.addEventListener("change", () => {
  sortOrder = sortSelect.value;

  localStorage.setItem("gallery-sort", sortOrder);

  buildArchive(filterAlbums(loadedAlbums));
});

function updateStats() {
  let albums = loadedAlbums.length;
  let photos = 0;
  let videos = 0;
  let youtube = 0;

  loadedAlbums.forEach((album) => {
    // Count local files
    album.info.files.forEach((file) => {
      if (isImageFile(file)) {
        photos++;
      } else {
        videos++;
      }
    });

    const youtubeVideos = normalizeVideoList(album.info.video);
    youtube += youtubeVideos.length;
  });

  document.getElementById("gallery-albums").textContent = albums;
  document.getElementById("gallery-photos").textContent = photos;
  document.getElementById("gallery-videos").textContent = videos;
  document.getElementById("gallery-youtube").textContent = youtube;
}

function filterAlbums(albums) {
  if (currentFilter === "all") {
    return albums;
  }

  return albums.filter((album) => {
    const files = album.info.files || [];

    const hasImage = files.some(isImageFile);
    const hasVideo = files.some((file) => !isImageFile(file));
    const hasYoutube = normalizeVideoList(album.info.video).length > 0;

    switch (currentFilter) {
      case "image":
        return hasImage;

      case "video":
        return hasVideo;

      case "youtube":
        return hasYoutube;

      default:
        return true;
    }
  });
}

/* -----------------------------
   YOUTUBE EMBED
----------------------------- */
function getYoutubeEmbed(url) {
  if (!url) return "";

  const id = getYoutubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : url;
}

function getYoutubeThumbnail(url) {
  if (!url) return "";

  const id = getYoutubeVideoId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

/* -----------------------------
   LOAD GALLERY
----------------------------- */
async function loadGallery() {
  try {
    const res = await fetch("assets/gallery/albums.json");
    const albums = await res.json();

    loadedAlbums = albums;

    updateStats();

    buildArchive(filterAlbums(loadedAlbums));
  } catch (err) {
    console.error(err);

    galleryContainer.innerHTML =
      "<h2 style='text-align:center'>Unable to load gallery</h2>";
  }
}

/* -----------------------------
   BUILD ARCHIVE STRUCTURE
----------------------------- */
function buildArchive(albums) {
  const archive = {};

  albums.forEach((album) => {
    const [year, month, folder] = album.path.split("/");

    const [day, ...titleParts] = folder.split("-");
    const title = titleParts.join("-") || "";

    if (!archive[year]) archive[year] = {};
    if (!archive[year][month]) archive[year][month] = [];

    let entry = archive[year][month].find(
      (x) => x.day === day && x.title === title,
    );

    if (!entry) {
      entry = { day, title, albums: [] };
      archive[year][month].push(entry);
    }

    entry.albums.push(album);
  });

  renderArchive(archive);
}

/* -----------------------------
   RENDER ARCHIVE (LAZY MONTH LOAD)
----------------------------- */
function renderArchive(archive) {
  galleryContainer.innerHTML = "";

  const monthOrder = [
    "December",
    "November",
    "October",
    "September",
    "August",
    "July",
    "June",
    "May",
    "April",
    "March",
    "February",
    "January",
  ];

  Object.keys(archive)
    .sort((a, b) => (sortOrder === "desc" ? b - a : a - b))
    .forEach((year) => {
      const yearBox = document.createElement("div");
      yearBox.className = "archive-year";

      const yearHeader = document.createElement("div");
      const yearContent = document.createElement("div");

      yearHeader.className = "archive-year-header";
      yearContent.className = "archive-content";

      yearHeader.innerHTML = `
            <div class="archive-year-title">▶ ${year}</div>
            <div class="archive-count">
                ${Object.values(archive[year]).flat().length} Albums
            </div>
        `;


      yearHeader.onclick = () => {
        const isOpen = yearContent.classList.contains("open");

        // close other years
        document
          .querySelectorAll(".archive-year .archive-content.open")
          .forEach((el) => {
            if (el !== yearContent) {
              el.classList.remove("open");

              const h = el.previousElementSibling;
              const t = h.querySelector(".archive-year-title");
              if (t)
                t.textContent = `▶ ${t.textContent.replace("▼ ", "").replace("▶ ", "")}`;
            }
          });

        // toggle current year
        yearContent.classList.toggle("open", !isOpen);

        yearHeader.querySelector(".archive-year-title").textContent = !isOpen
          ? `▼ ${year}`
          : `▶ ${year}`;
      };

      const months =
        sortOrder === "desc" ? monthOrder : [...monthOrder].reverse();

      months.forEach((month) => {
        if (!archive[year][month]) return;

        const monthBox = document.createElement("div");
        const monthHeader = document.createElement("div");
        const monthContent = document.createElement("div");

        monthBox.className = "archive-month";
        monthHeader.className = "archive-month-header";
        monthContent.className = "archive-content";

        monthHeader.innerHTML = `
                <div class="archive-month-title">▶ ${month}</div>
                <div class="archive-count">${archive[year][month].length}</div>
            `;


        monthHeader.onclick = () => {
          const isOpen = monthContent.classList.contains("open");

          // CLOSE MONTH
          if (isOpen) {
            monthContent.classList.remove("open");

            monthHeader.querySelector(".archive-month-title").textContent =
              `▶ ${month}`;

            // ONLY remove DOM, DO NOT reset loaded flag here
            monthContent.innerHTML = "";

            return;
          }

          // CLOSE OTHER MONTHS
          yearContent
            .querySelectorAll(".archive-month .archive-content.open")
            .forEach((el) => {
              el.classList.remove("open");
              el.innerHTML = "";

              const h = el.previousElementSibling;
              if (h) {
                const t = h.querySelector(".archive-month-title");
                if (t)
                  t.textContent = `▶ ${t.textContent.replace("▼ ", "").replace("▶ ", "")}`;
              }
            });

          // OPEN MONTH
          monthContent.classList.add("open");

          monthHeader.querySelector(".archive-month-title").textContent =
            `▼ ${month}`;

          // ALWAYS rebuild if empty (FIX FOR YOUR BUG)
          if (monthContent.children.length === 0) {
            const dayGrid = document.createElement("div");
            dayGrid.className = "archive-days";
            monthContent.appendChild(dayGrid);

            const days = archive[year][month].sort((a, b) =>
              sortOrder === "desc"
                ? Number(b.day) - Number(a.day)
                : Number(a.day) - Number(b.day),
            );

            let dayIndex = 0;

            function renderNextBatch() {
              const fragment = document.createDocumentFragment();
              const endIndex = Math.min(dayIndex + 2, days.length);

              while (dayIndex < endIndex) {
                fragment.appendChild(createDay(days[dayIndex]));
                dayIndex++;
              }

              dayGrid.appendChild(fragment);

              if (dayIndex < days.length) {
                requestAnimationFrame(renderNextBatch);
              }
            }

            requestAnimationFrame(renderNextBatch);
          }
        };

        monthBox.appendChild(monthHeader);
        monthBox.appendChild(monthContent);
        yearContent.appendChild(monthBox);
      });

      yearBox.appendChild(yearHeader);
      yearBox.appendChild(yearContent);
      galleryContainer.appendChild(yearBox);
    });
}

/* -----------------------------
   CREATE DAY (MEDIA RENDER)
----------------------------- */
function createDay(dayGroup) {
  const box = document.createElement("div");
  box.className = "archive-day";

  const header = document.createElement("div");
  header.className = "archive-day-header";

  const media = document.createElement("div");
  const grid = document.createElement("div");
  grid.className = "media-grid";

  grid.albumData = dayGroup.albums;

  const files = dayGroup.albums.flatMap((a) => a.info.files);

  let photos = 0,
    videos = 0;

  files.forEach((f) => {
    if (isImageFile(f)) photos++;
    else videos++;
  });

  header.innerHTML = `
    <div class="archive-date">${dayGroup.albums[0].info.date}</div>

    ${
      dayGroup.title
        ? `<div class="archive-album-title">${dayGroup.title}</div>`
        : ""
    }

    <div class="archive-day-count">
        ${photos ? `📷 ${photos}` : ""}
        ${photos && videos ? " • " : ""}
        ${videos ? `🎥 ${videos}` : ""}
    </div>
`;

  dayGroup.albums.forEach((album) => {
    album.previewLoaded = false;

    const previewFiles = album.info.files.slice(0, 4);
    const previewFragment = document.createDocumentFragment();

    previewFiles.forEach((file, index) => {
      const src = `assets/gallery/${album.path}/${file}`;

      if (isImageFile(file)) {
        const img = document.createElement("img");

        img.src = src;
        img.loading = "lazy";

        img.onclick = (e) => {
          e.stopPropagation();
          openAlbum(album.path, index);
        };

        previewFragment.appendChild(img);
      } else {
        const vid = document.createElement("video");

        vid.src = src;
        vid.muted = true;
        vid.preload = "metadata";
        vid.playsInline = true;
        vid.disablePictureInPicture = true;

        vid.onclick = (e) => {
          e.stopPropagation();
          openAlbum(album.path, index);
        };

        previewFragment.appendChild(vid);
      }
    });

    const videos = normalizeVideoList(
      Array.isArray(album.info.video)
        ? album.info.video
        : album.info.video
        ? [album.info.video]
        : [],
    );

    videos.forEach((videoUrl) => {
      const wrapper = document.createElement("div");

      wrapper.className = "youtube-preview";

      const img = document.createElement("img");

      img.src = getYoutubeThumbnail(videoUrl);

      img.loading = "lazy";

      img.alt = "YouTube";

      const play = document.createElement("div");

      play.className = "youtube-play";

      play.innerHTML = "▶";

      wrapper.appendChild(img);

      wrapper.appendChild(play);

      wrapper.onclick = (e) => {
        e.stopPropagation();

        openYoutube(videoUrl);
      };

      previewFragment.appendChild(wrapper);
    });

    grid.appendChild(previewFragment);
  });

  media.appendChild(grid);
  box.appendChild(header);
  box.appendChild(media);

  let hoverTimer;

  box.addEventListener("mouseenter", () => {
    hoverTimer = setTimeout(() => {
      box.classList.add("expanded");
      loadRemainingPreview(box, grid);
    }, 300);
  });

  box.addEventListener("mouseleave", () => {
    clearTimeout(hoverTimer);

    box.classList.remove("expanded");
  });

  return box;
}

function loadRemainingPreview(box, grid) {
  if (box.dataset.previewLoaded) return;

  box.dataset.previewLoaded = "true";
  const albums = Array.from(grid.albumData || []);
  let albumIndex = 0;

  function processNextAlbum() {
    if (albumIndex >= albums.length) return;

    const album = albums[albumIndex++];
    const remainingFiles = album.info.files.slice(4);
    const extraFragment = document.createDocumentFragment();

    remainingFiles.forEach((file, index) => {
      const src = `assets/gallery/${album.path}/${file}`;

      if (isImageFile(file)) {
        const img = document.createElement("img");
        img.src = src;
        img.loading = "lazy";
        img.onclick = (e) => {
          e.stopPropagation();
          openAlbum(album.path, index + 4);
        };
        extraFragment.appendChild(img);
      } else {
        const vid = document.createElement("video");
        vid.src = src;
        vid.muted = true;
        vid.preload = "metadata";
        vid.playsInline = true;
        vid.disablePictureInPicture = true;
        vid.onclick = (e) => {
          e.stopPropagation();
          openAlbum(album.path, index + 4);
        };
        extraFragment.appendChild(vid);
      }
    });

    grid.appendChild(extraFragment);
    requestAnimationFrame(processNextAlbum);
  }

  requestAnimationFrame(processNextAlbum);
}

/* -----------------------------
   LIGHTBOX
----------------------------- */
function openImage(src) {
  clearYT();

  lightbox.style.display = "flex";
  setLightboxMediaState("image", true);

  lightboxImage.src = src;
}

function openVideo(src) {
  clearYT();

  lightbox.style.display = "flex";
  setLightboxMediaState("video", true);

  lightboxVideo.pause();

  lightboxVideo.removeAttribute("src");

  lightboxVideo.load();

  lightboxVideo.src = src;

  lightboxVideo.currentTime = 0;

  lightboxVideo.load();

  lightboxVideo.play();
}

function openYoutube(url) {
  lightbox.style.display = "flex";
  setLightboxMediaState("image", false);
  setLightboxMediaState("video", false);

  clearYT();

  ytFrame = document.createElement("iframe");
  ytFrame.width = "100%";
  ytFrame.height = "100%";
  ytFrame.frameBorder = "0";
  ytFrame.allowFullscreen = true;
  ytFrame.src = getYoutubeEmbed(url);

  lightbox.appendChild(ytFrame);
}

function clearYT() {
  if (ytFrame) {
    ytFrame.remove();
    ytFrame = null;
  }
}

/* -----------------------------
   CLOSE LIGHTBOX
----------------------------- */
function closeLightbox() {
  lightbox.style.display = "none";
  lightboxImage.src = "";
  lightboxVideo.pause();
  lightboxVideo.src = "";
  clearYT();
}

/* -----------------------------
   MEDIA NAV
----------------------------- */
function findAlbum(path) {
  return loadedAlbums.find((a) => a.path === path);
}

function openAlbum(path, index) {
  const album = findAlbum(path);
  if (!album) return;

  currentAlbumPath = path;
  currentAlbum = album.info.files;
  currentMediaIndex = index;

  openCurrentMedia();
}

function openCurrentMedia() {
  const file = currentAlbum[currentMediaIndex];
  const src = `assets/gallery/${currentAlbumPath}/${file}`;

  if (isImageFile(file)) {
    openImage(src);
  } else {
    openVideo(src);
  }
}

/* -----------------------------
   INIT
----------------------------- */
closeButton.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

function previousMedia() {
  if (!currentAlbum.length) return;

  currentMediaIndex--;

  if (currentMediaIndex < 0) {
    currentMediaIndex = currentAlbum.length - 1;
  }

  openCurrentMedia();
}

function nextMedia() {
  if (!currentAlbum.length) return;

  currentMediaIndex++;

  if (currentMediaIndex >= currentAlbum.length) {
    currentMediaIndex = 0;
  }

  openCurrentMedia();
}
document.addEventListener("keydown", (e) => {
  if (lightbox.style.display !== "flex") return;

  switch (e.key) {
    case "Escape":
      closeLightbox();
      break;

    case "ArrowLeft":
      previousMedia();
      break;

    case "ArrowRight":
      nextMedia();
      break;
  }
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;

    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    buildArchive(filterAlbums(loadedAlbums));
  });
});

window.addEventListener("DOMContentLoaded", loadGallery);
