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
async function loadGallery() {

    try {

        const response = await fetch("assets/gallery/albums.json");

        const albums = await response.json();

        const loadedAlbums = await Promise.all(

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

        archive[year][month].push({

            day,

            path: album.path,

            info: album.info

        });

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

                /* ---------- DAYS ---------- */

                archive[year][month]
                    .sort((a,b)=>Number(b.day)-Number(a.day))
                    .forEach(album=>{
const photoCount = album.info.files.filter(file => {

    const ext = file.split(".").pop().toLowerCase();

    return ["jpg","jpeg","png","gif","webp"].includes(ext);

}).length;

const videoCount = album.info.files.length - photoCount;
                        const dayBox=document.createElement("div");
                        dayBox.className="archive-day";

                        const dayHeader=document.createElement("div");
                        dayHeader.className="archive-day-header";

                        dayHeader.innerHTML=`
                            <div class="archive-day-title">
                                ▶ ${album.info.date}
                            </div>

                            <div class="archive-day-subtitle">
                                ${album.info.title}
                            </div>
                        `;

                        const media=document.createElement("div");
                        media.className="archive-content";

const mediaGrid=document.createElement("div");
mediaGrid.className="media-grid";

album.info.files.forEach(file=>{

    const extension=file.split(".").pop().toLowerCase();

    const fullPath=`assets/gallery/${album.path}/${file}`;

    if(["jpg","jpeg","png","gif","webp"].includes(extension)){

        const image=document.createElement("img");

        image.src=fullPath;

        image.loading="lazy";

image.onclick=(event)=>{

    event.stopPropagation();

    currentAlbum = album.info.files;
    currentAlbumPath = album.path;
    currentMediaIndex = album.info.files.indexOf(file);

    openCurrentMedia();

};

        mediaGrid.appendChild(image);

    }

    else{

        const video=document.createElement("video");

        video.src=fullPath;

        video.preload="metadata";

        video.muted=true;

video.onclick=(event)=>{

    event.stopPropagation();

    currentAlbum = album.info.files;
    currentAlbumPath = album.path;
    currentMediaIndex = album.info.files.indexOf(file);

    openCurrentMedia();

};

        mediaGrid.appendChild(video);

    }

});

media.appendChild(mediaGrid);

                        dayHeader.onclick=()=>{

                            media.classList.toggle("open");

                            dayHeader.querySelector(".archive-day-title").innerHTML=
                                media.classList.contains("open")
                                ?`▼ ${album.info.date}`
                                :`▶ ${album.info.date}`;

                        };

                        dayBox.appendChild(dayHeader);
                        dayBox.appendChild(media);

                        monthContent.appendChild(dayBox);

                    });

                monthHeader.onclick=()=>{

                    monthContent.classList.toggle("open");

                    monthHeader.querySelector(".archive-month-title").innerHTML=
                        monthContent.classList.contains("open")
                        ?`▼ ${month}`
                        :`▶ ${month}`;

                };

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