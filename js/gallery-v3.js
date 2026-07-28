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

let currentFilter = "all";

function updateStats() {

    let albums = loadedAlbums.length;
    let photos = 0;
    let videos = 0;
    let youtube = 0;


    
    loadedAlbums.forEach(album => {

        // Count local files
        album.info.files.forEach(file => {

            const ext = file.split(".").pop().toLowerCase();

            if (["jpg","jpeg","png","gif","webp"].includes(ext)) {
                photos++;
            } else {
                videos++;
            }

        });

        // Count YouTube links
        if (album.info.video) {

            if (Array.isArray(album.info.video)) {
                youtube += album.info.video.length;
            } else {
                youtube++;
            }

        }

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

    return albums.filter(album => {

        const files = album.info.files || [];

        const hasImage = files.some(file => {
            const ext = file.split(".").pop().toLowerCase();
            return ["jpg","jpeg","png","gif","webp"].includes(ext);
        });

        const hasVideo = files.some(file => {
            const ext = file.split(".").pop().toLowerCase();
            return !["jpg","jpeg","png","gif","webp"].includes(ext);
        });

        const hasYoutube =
            album.info.video &&
            (
                Array.isArray(album.info.video)
                    ? album.info.video.length
                    : true
            );

        switch(currentFilter){

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

function getYoutubeThumbnail(url) {
    if (!url) return "";

    let id = "";

    if (url.includes("youtu.be/")) {
        id = url.split("youtu.be/")[1].split("?")[0];
    }
    else if (url.includes("watch?v=")) {
        id = url.split("watch?v=")[1].split("&")[0];
    }
    else if (url.includes("/shorts/")) {
        id = url.split("/shorts/")[1].split("?")[0];
    }

    return id
        ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
        : "";
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

    albums.forEach(album => {
        const [year, month, folder] = album.path.split("/");

const [day, ...titleParts] = folder.split("-");
const title = titleParts.join("-") || "";

        if (!archive[year]) archive[year] = {};
        if (!archive[year][month]) archive[year][month] = [];

       let entry = archive[year][month].find(x => x.day === day && x.title === title);

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
        .forEach(el => {
            el.classList.remove("open");
            el.innerHTML = "";

            const h = el.previousElementSibling;
            if (h) {
                const t = h.querySelector(".archive-month-title");
                if (t) t.textContent = `▶ ${t.textContent.replace("▼ ","").replace("▶ ","")}`;
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

const fragment = document.createDocumentFragment();

const days = archive[year][month]
    .sort((a,b)=>Number(b.day)-Number(a.day));

for (const dayGroup of days) {
    fragment.appendChild(createDay(dayGroup));
}

dayGrid.appendChild(fragment);
monthContent.appendChild(dayGrid);
    }

    // scroll
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

grid.albumData = dayGroup.albums;

    const files = dayGroup.albums.flatMap(a => a.info.files);

    let photos = 0, videos = 0;

    files.forEach(f => {
        const ext = f.split(".").pop().toLowerCase();
        if (["jpg","jpeg","png","gif","webp"].includes(ext)) photos++;
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

    dayGroup.albums.forEach(album => {

album.previewLoaded = false;

const previewFiles = album.info.files.slice(0, 4);

const hiddenCount = album.info.files.length - 4;

previewFiles.forEach((file, index) => {

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
        vid.preload = "metadata";
        vid.playsInline = true;
        vid.disablePictureInPicture = true;

        vid.onclick = e => {
            e.stopPropagation();
            openAlbum(album.path, index);
        };

grid.appendChild(vid);

    }


});

const videos = Array.isArray(album.info.video)
    ? album.info.video
    : album.info.video
        ? [album.info.video]
        : [];

videos.forEach(videoUrl => {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "youtube-preview";

    const img =
        document.createElement("img");

    img.src =
        getYoutubeThumbnail(videoUrl);

    img.loading = "lazy";

    img.alt = "YouTube";

    const play =
        document.createElement("div");

    play.className =
        "youtube-play";

    play.innerHTML = "▶";

    wrapper.appendChild(img);

    wrapper.appendChild(play);

    wrapper.onclick = e => {

        e.stopPropagation();

        openYoutube(videoUrl);

    };

    grid.appendChild(wrapper);

});
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

    grid.albumData.forEach(album => {

        const remainingFiles = album.info.files.slice(4);

        remainingFiles.forEach((file, index) => {

            const ext = file.split(".").pop().toLowerCase();

            const src = `assets/gallery/${album.path}/${file}`;

            if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {

                const img = document.createElement("img");

                img.src = src;
                img.loading = "lazy";

                img.onclick = e => {

                    e.stopPropagation();

                    openAlbum(album.path, index + 4);

                };

                grid.appendChild(img);

            } else {

                const vid = document.createElement("video");

                vid.src = src;
                vid.muted = true;
                vid.preload = "metadata";
                vid.playsInline = true;
                vid.disablePictureInPicture = true;

                vid.onclick = e => {

                    e.stopPropagation();

                    openAlbum(album.path, index + 4);

                };

                grid.appendChild(vid);

            }

        });

    });

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

document.querySelectorAll(".filter-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        currentFilter = btn.dataset.filter;

        document.querySelectorAll(".filter-btn").forEach(b =>
            b.classList.remove("active")
        );

        btn.classList.add("active");

        buildArchive(filterAlbums(loadedAlbums));

    });

});

window.addEventListener("DOMContentLoaded", loadGallery);