/* ============================================
   Hayeon Archive Gallery v3
============================================ */

const galleryContainer = document.getElementById("gallery-container");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxVideo = document.getElementById("lightbox-video");
const closeButton = document.getElementById("close-lightbox");
let currentAlbum = [];
let currentAlbumPath = "";
let currentMediaIndex = 0;
let touchStartX = 0;
let touchEndX = 0;
let loadedAlbums = [];
function getYoutubeEmbed(url) {

    if (url.includes("youtu.be/")) {

        const id = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${id}`;

    }

    if (url.includes("watch?v=")) {

        return url.replace("watch?v=", "embed/").split("&")[0];

    }

    return url;

}
async function loadGallery() {

    try {

        const response = await fetch("assets/gallery/albums.json");

        const albums = await response.json();

        loadedAlbums = await Promise.all(

            albums.map(async album => {

                const infoResponse = await fetch(
                    `assets/gallery/${album.path}/info.json`
                );

                const info = await infoResponse.json();

                return {

                    path: album.path,

                    info

                };

            })

        );

        buildArchive(loadedAlbums);

    }

    catch (error) {

        console.error(error);

        galleryContainer.innerHTML = `
            <h2 style="text-align:center">
                Unable to load gallery.
            </h2>
        `;

    }

}
function buildArchive(albums) {

    const archive = {};

    albums.forEach(album => {

        const parts = album.path.split("/");

        const year = parts[0];
        const month = parts[1];
        const day = parts[2];

        if (!archive[year]) {

            archive[year] = {};

        }

        if (!archive[year][month]) {

            archive[year][month] = [];

        }

const existing =
    archive[year][month]
        .find(
            x => x.day === day
        );

if(existing){

    existing.albums.push({

        path: album.path,

        info: album.info

    });

}else{

    archive[year][month].push({

        day,

        albums:[

            {

                path: album.path,

                info: album.info

            }

        ]

    });

}

    });

    renderArchive(archive);

}
function renderArchive(archive){

    galleryContainer.innerHTML="";

    const monthOrder=[
        "January","February","March","April",
        "May","June","July","August",
        "September","October","November","December"
    ];

    Object.keys(archive)
        .sort((a,b)=>b-a)
        .forEach(year=>{

            const yearBox=document.createElement("div");
            yearBox.className="archive-year";

            const yearHeader=document.createElement("div");
            yearHeader.className="archive-year-header";

            yearHeader.innerHTML=`
                <div class="archive-year-title">
                    ▶ ${year}
                </div>

                <div class="archive-count">
                    ${
                        Object.values(archive[year]).flat().length
                    } Albums
                </div>
            `;

            const yearContent=document.createElement("div");
            yearContent.className="archive-content";

            /* ---------- MONTHS ---------- */

            monthOrder.forEach(month=>{

                if(!archive[year][month]) return;

                const monthBox=document.createElement("div");
                monthBox.className="archive-month";

                const monthHeader=document.createElement("div");
                monthHeader.className="archive-month-header";

                monthHeader.innerHTML=`
                    <div class="archive-month-title">
                        ▶ ${month}
                    </div>

                    <div class="archive-count">
                        ${archive[year][month].length}
                    </div>
                `;

                const monthContent=document.createElement("div");
                monthContent.className="archive-content";
const dayGrid = document.createElement("div");

dayGrid.className = "archive-days";
                /* ---------- DAYS ---------- */

                archive[year][month]
                    .sort((a,b)=>Number(b.day)-Number(a.day))
                    .forEach(dayGroup=>{
const allFiles =
    dayGroup.albums.flatMap(
        a => a.info.files
    );

const photoCount =
    allFiles.filter(file=>{

        const ext =
            file
            .split(".")
            .pop()
            .toLowerCase();

        return [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "webp"
        ].includes(ext);

    }).length;

const videoCount =
    allFiles.length -
    photoCount;
                        const dayBox=document.createElement("div");
                        dayBox.className="archive-day";

                        const dayHeader = document.createElement("div");

dayHeader.className = "archive-day-header";

dayHeader.innerHTML = `

    <div class="archive-date">

        ${dayGroup.albums[0].info.date}

    </div>

    <div class="archive-day-count">

        ${photoCount ? `📷 ${photoCount} ${photoCount === 1 ? "Photo" : "Photos"}` : ""}

        ${photoCount && videoCount ? " • " : ""}

        ${videoCount ? `🎥 ${videoCount} ${videoCount === 1 ? "Video" : "Videos"}` : ""}

    </div>
`;

                        const media=document.createElement("div");
                        media.className="archive-content";

const mediaGrid=document.createElement("div");
mediaGrid.className="media-grid";

dayGroup.albums.forEach(album=>{

const maxPreview =
    album.info.video
        ? 4
        : 999;

album.info.files
    .slice(0, maxPreview)
    .forEach((file, index) => {

    const extension = file.split(".").pop().toLowerCase();

    const fullPath = `assets/gallery/${album.path}/${file}`;

    if(["jpg","jpeg","png","gif","webp"].includes(extension)){

        const image = document.createElement("img");

        image.src = fullPath;

        image.loading = "lazy";

        image.onclick = (event)=>{

            event.stopPropagation();

            openAlbum(album.path,index);

        };

if(
    index === 3 &&
    album.info.files.length > 4
){

            image.classList.add("preview-last");

const totalItems =
    album.info.files.length +
    (album.info.video ? 1 : 0);

image.dataset.more =
    "+" + (totalItems - (maxPreview + 1));

        }

        mediaGrid.appendChild(image);

    }

    else{

        const video = document.createElement("video");

        video.src = fullPath;

        video.preload = "metadata";

        video.muted = true;

        video.onclick = (event)=>{

            event.stopPropagation();

            openAlbum(album.path,index);

        };

        if(
            index === maxPreview-1 &&
            album.info.files.length > maxPreview
        ){

            video.classList.add("preview-last");

            video.dataset.more =
                "+"+(album.info.files.length-maxPreview);

        }

mediaGrid.appendChild(video);

}

});

if (album.info.video) {

    const iframe =
        document.createElement("iframe");

iframe.src =
album.info.video.includes("/shorts/")
? album.info.video.replace(
    "/shorts/",
    "/embed/"
)
: album.info.video.includes("youtu.be/")
? `https://www.youtube.com/embed/${
    album.info.video
        .split("youtu.be/")[1]
        .split("?")[0]
}`
: album.info.video.replace(
    "watch?v=",
    "embed/"
);

iframe.style.width = "100%";

iframe.style.aspectRatio = "16 / 9";

iframe.style.borderRadius = "12px";

iframe.style.cursor = "pointer";

    iframe.allowFullscreen = true;

    iframe.className =
        "youtube-player";
iframe.onclick = (event)=>{

    event.stopPropagation();

    openYoutube(
        album.info.video
    );

};
    mediaGrid.appendChild(
        iframe
    );

}
});
media.appendChild(mediaGrid);
dayGroup.albums.forEach(album=>{

const albumTitle =
document.createElement("div");

albumTitle.className =
"archive-album-title";

albumTitle.textContent =
album.info.title;

media.appendChild(
    albumTitle
);

});
media.style.display = "block";

                        dayBox.appendChild(dayHeader);
                        dayBox.appendChild(media);

                        dayGrid.appendChild(dayBox);

                    });

monthHeader.onclick = () => {

const wasOpen =
    monthContent.classList.contains(
        "open"
    );

/* close others */

document.querySelectorAll(
".archive-month > .archive-content.open"
)
.forEach(content=>{

if(content!==monthContent){

content.classList.remove(
"open"
);

const header =
content.previousElementSibling;

const title =
header.querySelector(
".archive-month-title"
);

title.innerHTML=
`▶ ${
title.textContent
.replace("▼ ","")
.replace("▶ ","")
}`;

}

});

/* open current */

monthContent.classList.toggle(
"open",
!wasOpen
);

monthHeader.querySelector(
".archive-month-title"
).innerHTML=
!wasOpen
?`▼ ${month}`
:`▶ ${month}`;

/* keep month visible */

if(!wasOpen){

setTimeout(()=>{

monthHeader.scrollIntoView({

behavior:"smooth",

block:"start"

});

},50);

}

};

monthContent.appendChild(dayGrid);

monthBox.appendChild(monthHeader);
monthBox.appendChild(monthContent);

                yearContent.appendChild(monthBox);

            });

            yearHeader.onclick=()=>{

                yearContent.classList.toggle("open");

                yearHeader.querySelector(".archive-year-title").innerHTML=
                    yearContent.classList.contains("open")
                    ?`▼ ${year}`
                    :`▶ ${year}`;

            };

            yearBox.appendChild(yearHeader);
            yearBox.appendChild(yearContent);

            galleryContainer.appendChild(yearBox);

        });

}
function openImage(src){

    lightbox.style.display="flex";

    lightboxImage.style.display="block";

    lightboxVideo.style.display="none";

    lightboxImage.src=src;

}

function openVideo(src){

    lightbox.style.display="flex";

    lightboxImage.style.display="none";

    lightboxVideo.style.display="block";

    lightboxVideo.src=src;

    lightboxVideo.currentTime=0;

    lightboxVideo.play();

}
function openYoutube(url){

    lightbox.style.display="flex";

    lightboxImage.style.display="none";

    lightboxVideo.style.display="block";

    lightboxVideo.pause();

    lightboxVideo.removeAttribute(
        "src"
    );

    lightboxVideo.innerHTML = `
        <iframe
src="${
url.includes("/shorts/")
? url.replace(
    "/shorts/",
    "/embed/"
)
: url.includes("youtu.be/")
? `https://www.youtube.com/embed/${
    url
        .split("youtu.be/")[1]
        .split("?")[0]
}`
: url.replace(
    "watch?v=",
    "embed/"
)
}"
            width="100%"
            height="100%"
            frameborder="0"
            allowfullscreen>
        </iframe>
    `;

}
function findAlbum(path){

    return loadedAlbums.find(album => album.path === path);

}
function openAlbum(path,index){

    currentAlbumPath = path;

    const album = findAlbum(path);

    currentAlbum = album.info.files;

    currentMediaIndex = index;

    openCurrentMedia();

}
function openCurrentMedia(){

    const file = currentAlbum[currentMediaIndex];

    const src = `assets/gallery/${currentAlbumPath}/${file}`;

    const extension = file.split(".").pop().toLowerCase();

    if(["jpg","jpeg","png","gif","webp"].includes(extension)){

        openImage(src);

    }else{

        openVideo(src);

    }

}
function nextMedia(){

    if(currentAlbum.length <= 1) return;

    currentMediaIndex++;

    if(currentMediaIndex >= currentAlbum.length){

        currentMediaIndex = 0;

    }

    openCurrentMedia();

}

function previousMedia(){

    if(currentAlbum.length <= 1) return;

    currentMediaIndex--;

    if(currentMediaIndex < 0){

        currentMediaIndex = currentAlbum.length - 1;

    }

    openCurrentMedia();

}
function closeLightbox(){

    lightbox.style.display="none";

    lightboxImage.src="";

    lightboxVideo.pause();

    lightboxVideo.src="";
lightboxVideo.innerHTML="";
}

closeButton.addEventListener("click",closeLightbox);

document.addEventListener("keydown",(event)=>{

    if(lightbox.style.display !== "flex") return;

    switch(event.key){

        case "ArrowLeft":
            previousMedia();
            break;

        case "ArrowRight":
            nextMedia();
            break;

        case "Escape":
            closeLightbox();
            break;

    }

});

lightbox.addEventListener("click", (event) => {

    // Don't close when clicking the image or video itself
    if (
        event.target === lightbox ||
        event.target === document.querySelector(".lightbox-content")
    ) {
        closeLightbox();
    }

});
lightbox.addEventListener("touchstart", (event) => {

    touchStartX = event.changedTouches[0].screenX;

});
lightbox.addEventListener("touchend", (event) => {

    touchEndX = event.changedTouches[0].screenX;

    const distance = touchEndX - touchStartX;

    // Swipe Right
    if(distance > 50){

        previousMedia();

    }

    // Swipe Left
    else if(distance < -50){

        nextMedia();

    }

});
window.addEventListener(

    "DOMContentLoaded",

    loadGallery

);
document.addEventListener("click", (event) => {

    const day = event.target.closest(".archive-day");

    if (!day) return;

    // Don't trigger when opening media
    if (
        event.target.closest("img") ||
        event.target.closest("video") ||
        event.target.closest("iframe")
    ) {
        return;
    }

    // Close every other album
    document.querySelectorAll(".archive-day.expanded")
        .forEach(item => {

            if (item !== day) {

                item.classList.remove("expanded");

            }

        });

    day.classList.toggle("expanded");

});