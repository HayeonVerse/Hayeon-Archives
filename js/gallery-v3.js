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

let currentAlbum = [];
let currentAlbumPath = "";
let currentMediaIndex = 0;

let loadedAlbums = [];
let ytFrame = null;

/* -----------------------------
   YOUTUBE EMBED
----------------------------- */
function getYoutubeEmbed(url) {
    if (!url) return "";

    if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${id}`;
    }

    if (url.includes("watch?v=")) {
        return url.replace("watch?v=", "embed/").split("&")[0];
    }

    if (url.includes("/shorts/")) {
        return url.replace("/shorts/", "/embed/");
    }

    return url;
}

/* -----------------------------
   LOAD GALLERY
----------------------------- */
async function loadGallery() {
    try {
        const res = await fetch("assets/gallery/albums.json");
        const albums = await res.json();

        loadedAlbums = await Promise.all(
            albums.map(async a => {
                const r = await fetch(`assets/gallery/${a.path}/info.json`);
                const info = await r.json();
                return { path: a.path, info };
            })
        );

        buildArchive(loadedAlbums);

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

    albums.forEach(album => {
        const [year, month, day] = album.path.split("/");

        if (!archive[year]) archive[year] = {};
        if (!archive[year][month]) archive[year][month] = [];

        let entry = archive[year][month].find(x => x.day === day);

        if (!entry) {
            entry = { day, albums: [] };
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
        "January","February","March","April",
        "May","June","July","August",
        "September","October","November","December"
    ];

    Object.keys(archive).sort((a,b)=>b-a).forEach(year => {

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

        let yearOpen = false;

yearHeader.onclick = () => {

    const isOpen = yearContent.classList.contains("open");

    // close other years
    document.querySelectorAll(".archive-year .archive-content.open")
        .forEach(el => {
            if (el !== yearContent) {
                el.classList.remove("open");

                const h = el.previousElementSibling;
                const t = h.querySelector(".archive-year-title");
                if (t) t.textContent = `▶ ${t.textContent.replace("▼ ","").replace("▶ ","")}`;
            }
        });

    // toggle current year
    yearContent.classList.toggle("open", !isOpen);

    yearHeader.querySelector(".archive-year-title").textContent =
        !isOpen ? `▼ ${year}` : `▶ ${year}`;
};

        monthOrder.forEach(month => {

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

            let loaded = false;
            let open = false;

monthHeader.onclick = () => {

    const isOpen = monthContent.classList.contains("open");

    // CLOSE if already open
    if (isOpen) {
        monthContent.classList.remove("open");
        monthContent.innerHTML = "";
        loaded = false;

        monthHeader.querySelector(".archive-month-title").textContent =
            `▶ ${month}`;

        return;
    }

    // 🔥 CLOSE ALL OTHER MONTHS (IMPORTANT)
    yearContent
        .querySelectorAll(".archive-month .archive-content.open")
        .forEach(el => {
            el.classList.remove("open");
            el.innerHTML = "";

            const h = el.previousElementSibling;
            if (h) {
                const t = h.querySelector(".archive-month-title");
                if (t) t.textContent = `▶ ${t.textContent.replace("▼ ","").replace("▶ ","")}`;
            }
        });

    // OPEN CURRENT MONTH
    monthContent.classList.add("open");

    monthHeader.querySelector(".archive-month-title").textContent =
        `▼ ${month}`;

    // LAZY LOAD
    if (!loaded) {
        loaded = true;

        const dayGrid = document.createElement("div");
        dayGrid.className = "archive-days";

        const days = archive[year][month]
            .sort((a,b)=>Number(b.day)-Number(a.day));

        for (const dayGroup of days) {
            dayGrid.appendChild(createDay(dayGroup));
        }

        monthContent.appendChild(dayGrid);
    }

    // scroll into view (your old behavior)
    setTimeout(() => {
        monthHeader.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 50);
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

    const files = dayGroup.albums.flatMap(a => a.info.files);

    let photos = 0, videos = 0;

    files.forEach(f => {
        const ext = f.split(".").pop().toLowerCase();
        if (["jpg","jpeg","png","gif","webp"].includes(ext)) photos++;
        else videos++;
    });

    header.innerHTML = `
        <div class="archive-date">${dayGroup.albums[0].info.date}</div>
        <div class="archive-day-count">
            ${photos ? `📷 ${photos}` : ""}
            ${photos && videos ? " • " : ""}
            ${videos ? `🎥 ${videos}` : ""}
        </div>
    `;

    dayGroup.albums.forEach(album => {

        album.info.files.forEach((file, index) => {

            const ext = file.split(".").pop().toLowerCase();
            const src = `assets/gallery/${album.path}/${file}`;

            if (["jpg","jpeg","png","gif","webp"].includes(ext)) {

                const img = document.createElement("img");
                img.src = src;
                img.loading = "lazy";

                img.onclick = e => {
                    e.stopPropagation();
                    openAlbum(album.path, index);
                };

                grid.appendChild(img);

            } else {

                const vid = document.createElement("video");
                vid.src = src;
                vid.muted = true;

                vid.onclick = e => {
                    e.stopPropagation();
                    openAlbum(album.path, index);
                };

                grid.appendChild(vid);
            }
        });

        if (album.info.video) {

            const iframe = document.createElement("iframe");
            iframe.className = "youtube-player";
            iframe.src = getYoutubeEmbed(album.info.video);
            iframe.allowFullscreen = true;

            iframe.onclick = e => {
                e.stopPropagation();
                openYoutube(album.info.video);
            };

            grid.appendChild(iframe);
        }
    });

    media.appendChild(grid);
    box.appendChild(header);
    box.appendChild(media);

    return box;
}

/* -----------------------------
   LIGHTBOX
----------------------------- */
function openImage(src) {
    clearYT();

    lightbox.style.display = "flex";
    lightboxImage.style.display = "block";
    lightboxVideo.style.display = "none";

    lightboxImage.src = src;
}

function openVideo(src) {
    clearYT();

    lightbox.style.display = "flex";
    lightboxImage.style.display = "none";
    lightboxVideo.style.display = "block";

    lightboxVideo.src = src;
    lightboxVideo.play();
}

function openYoutube(url) {
    lightbox.style.display = "flex";
    lightboxImage.style.display = "none";
    lightboxVideo.style.display = "none";

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
    return loadedAlbums.find(a => a.path === path);
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
    const ext = file.split(".").pop().toLowerCase();

    if (["jpg","jpeg","png","gif","webp"].includes(ext)) {
        openImage(src);
    } else {
        openVideo(src);
    }
}

/* -----------------------------
   INIT
----------------------------- */
closeButton.addEventListener("click", closeLightbox);
window.addEventListener("DOMContentLoaded", loadGallery);