/* ============================================
   Hayeon Archive Gallery v2
   Part 1
============================================ */

const galleryContainer = document.getElementById("gallery-container");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxVideo = document.getElementById("lightbox-video");
const closeButton = document.getElementById("close-lightbox");

let currentAlbum = null;

/* ============================================
   LOAD GALLERY
============================================ */

async function loadGallery(){

    try{

        const response = await fetch("assets/gallery/albums.json");

        const albums = await response.json();

        galleryContainer.innerHTML = "";

        for(const album of albums){

            await loadAlbum(album.path);

        }

    }

    catch(error){

        console.error(error);

        galleryContainer.innerHTML = `

            <div class="error">

                Unable to load gallery.

            </div>

        `;

    }

}

/* ============================================
   LOAD ONE ALBUM
============================================ */

async function loadAlbum(path){

    const response = await fetch(

        `assets/gallery/${path}/info.json`

    );

    const info = await response.json();

    createAlbum(path,info);

}

/* ============================================
   CREATE ALBUM
============================================ */

function createAlbum(path,info){

    const wrapper = document.createElement("section");

    wrapper.className="album-wrapper";

    const card=document.createElement("div");

    card.className="album-card";

    card.innerHTML=`

        <img

            src="assets/gallery/${path}/${info.cover}"

            alt="${info.title}"

        >

        <div class="album-info">

            <h2>${info.title}</h2>

            <p>${info.date}</p>

        </div>

    `;

    const media=document.createElement("div");

    media.className="media-grid";

    media.style.display="none";

    info.files.forEach(file=>{

        const extension=file

            .split(".")

            .pop()

            .toLowerCase();

        const fullPath=

            `assets/gallery/${path}/${file}`;

        if(

            [

                "jpg",

                "jpeg",

                "png",

                "gif",

                "webp"

            ].includes(extension)

        ){

            const image=document.createElement("img");

            image.src=fullPath;

            image.loading="lazy";

            image.onclick=(event)=>{

                event.stopPropagation();

                openImage(fullPath);

            };

            media.appendChild(image);

        }

        else{

            const video=document.createElement("video");

            video.src=fullPath;

            video.controls=true;

            video.preload="metadata";

            video.onclick=(event)=>{

                event.stopPropagation();

                openVideo(fullPath);

            };

            media.appendChild(video);

        }

    });

    card.onclick=()=>{

        toggleAlbum(media);

    };

    wrapper.appendChild(card);

    wrapper.appendChild(media);

    galleryContainer.appendChild(wrapper);

}
/* ============================================
   Hayeon Archive Gallery v2
   Part 2
============================================ */

/* ============================================
   TOGGLE ALBUM
============================================ */

function toggleAlbum(selectedGrid){

    const allGrids=document.querySelectorAll(".media-grid");

    allGrids.forEach(grid=>{

        if(grid!==selectedGrid){

            grid.style.display="none";

            grid.classList.remove("open");

        }

    });

    if(selectedGrid.style.display==="grid"){

        selectedGrid.style.display="none";

        selectedGrid.classList.remove("open");

        return;

    }

    selectedGrid.style.display="grid";

    requestAnimationFrame(()=>{

        selectedGrid.classList.add("open");

    });

}

/* ============================================
   IMAGE LIGHTBOX
============================================ */

function openImage(src){

    currentAlbum="image";

    lightbox.style.display="flex";

    lightboxImage.style.display="block";

    lightboxVideo.style.display="none";

    lightboxImage.src=src;

}

/* ============================================
   VIDEO LIGHTBOX
============================================ */

function openVideo(src){

    currentAlbum="video";

    lightbox.style.display="flex";

    lightboxImage.style.display="none";

    lightboxVideo.style.display="block";

    lightboxVideo.src=src;

    lightboxVideo.currentTime=0;

    lightboxVideo.play();

}

/* ============================================
   CLOSE LIGHTBOX
============================================ */

function closeLightbox(){

    lightbox.style.display="none";

    lightboxImage.src="";

    lightboxVideo.pause();

    lightboxVideo.src="";

}

/* ============================================
   CLOSE BUTTON
============================================ */

closeButton.addEventListener(

    "click",

    closeLightbox

);

/* ============================================
   CLICK OUTSIDE IMAGE
============================================ */

lightbox.addEventListener("click", function(event){

    if(
        event.target === lightbox ||
        event.target.classList.contains("lightbox-content")
    ){

        closeLightbox();

    }

});
/* ============================================
   Hayeon Archive Gallery v2
   Part 3
============================================ */

/* ============================================
   ESC KEY
============================================ */

document.addEventListener("keydown",(event)=>{

    if(event.key==="Escape"){

        closeLightbox();

    }

});

/* ============================================
   PREVENT PAGE SCROLL
============================================ */

const observer = new MutationObserver(()=>{

    if(lightbox.style.display==="flex"){

        document.body.style.overflow="hidden";

    }

    else{

        document.body.style.overflow="auto";

    }

});

observer.observe(lightbox,{

    attributes:true,

    attributeFilter:["style"]

});

/* ============================================
   IMAGE LOADING ANIMATION
============================================ */

document.addEventListener("load",(event)=>{

    if(event.target.tagName==="IMG"){

        event.target.classList.add("loaded");

    }

},true);

/* ============================================
   ALBUM ANIMATION
============================================ */

document.addEventListener("click",(event)=>{

    const card=event.target.closest(".album-card");

    if(!card) return;

    card.classList.toggle("active");

});

/* ============================================
   SCROLL TO OPEN ALBUM
============================================ */

function scrollToAlbum(element){

    setTimeout(()=>{

        element.scrollIntoView({

            behavior:"smooth",

            block:"start"

        });

    },150);

}

/* ============================================
   UPDATE TOGGLE FUNCTION
============================================ */

const originalToggleAlbum = toggleAlbum;

toggleAlbum = function(selectedGrid){

    originalToggleAlbum(selectedGrid);

    if(selectedGrid.style.display==="grid"){

        scrollToAlbum(selectedGrid);

    }

};

/* ============================================
   ERROR IMAGE PLACEHOLDER
============================================ */

document.addEventListener("error",(event)=>{

    if(event.target.tagName==="IMG"){

        event.target.src="assets/images/placeholder.png";

    }

},true);

/* ============================================
   START GALLERY
============================================ */
let touchStartY = 0;

lightbox.addEventListener("touchstart", (e) => {

    touchStartY = e.touches[0].clientY;

});

lightbox.addEventListener("touchend", (e) => {

    const touchEndY = e.changedTouches[0].clientY;

    if (touchEndY - touchStartY > 100) {

        closeLightbox();

    }

});
window.addEventListener("DOMContentLoaded",()=>{

    loadGallery();

});