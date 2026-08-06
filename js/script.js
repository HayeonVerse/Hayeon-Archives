const b = document.getElementById("mode");

function updateThemeButton() {
  const dark = document.documentElement.classList.contains("dark");

  b.textContent = dark ? "☀️" : "🌙";
}

if (localStorage.theme === "dark") {
  document.documentElement.classList.add("dark");
}

updateThemeButton();

b.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");

  localStorage.theme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

  b.classList.add("spin");

  updateThemeButton();

  setTimeout(() => {
    b.classList.remove("spin");
  }, 400);
});

/* ==========================================
   HOME - LATEST GALLERY
========================================== */

async function loadLatestGallery() {
  const container = document.getElementById("latest-gallery");

  if (!container) return;

  try {
    const response = await fetch("assets/gallery/albums.json");

    const albums = await response.json();

    container.innerHTML = albums
      .slice(0, 3)
      .map((album) => {
        const cover = album.info.cover || "";

        const isVideo = cover.toLowerCase().endsWith(".mp4");

        const mediaCount = album.info.files.length + album.info.video.length;

        return `

<article class="home-album-card">

    ${
      isVideo
        ? `<video
    muted
    playsinline
    preload="metadata"
>
    <source
        src="assets/gallery/${album.path}/${cover}"
        type="video/mp4">
</video>`
        : `<img
    src="assets/gallery/${album.path}/${cover}"
    alt="${album.info.title}"
>`
    }

    <div class="home-album-overlay">

        <h3>

            ${album.info.title}

        </h3>

        <p>

            ${mediaCount} Item${mediaCount > 1 ? "s" : ""} • ${album.info.date}

        </p>

    </div>

</article>

`;
      })
      .join("");
  } catch (error) {
    console.error(error);
  }
}

loadLatestGallery();

/* ==========================================
   HOME - LATEST fromm
========================================== */

async function loadLatestfromm() {
  const container = document.getElementById("latest-fromm");

  if (!container) return;

  try {
    const response = await fetch("assets/fromm/archive.json");

    const archive = await response.json();

    if (!archive.length) {
      container.textContent = "No conversations found.";

      return;
    }

    const latest = archive[0];

    const date = latest.folder.replace(/\//g, ".");

    container.innerHTML = `

<div class="latest-fromm-left">

    <span class="latest-fromm-tag">

        🦔 Latest Translation

    </span>

    <div class="latest-fromm-date">

        ${date}

    </div>

    <div class="latest-fromm-description">

        Read the newest translated Cosmo Talk conversation.

    </div>

    <div class="latest-fromm-actions">

<a
    href="fromm.html?date=${latest.date}"
    class="hero-btn hero-primary">

    Read Now

</a>

<a
    href="fromm.html"
    class="hero-btn hero-secondary">

    Browse Archive

</a>

    </div>

</div>

`;
  } catch (error) {
    console.error(error);
  }
}

loadLatestfromm();

/* ==========================================
   HERO SLIDESHOW
========================================== */

let heroItems = [];

let currentHero = 0;

let showingA = true;

async function loadHero() {
  try {
    const response = await fetch("data/featured.json");

    heroItems = await response.json();

    if (!heroItems.length) return;

    const imageA = document.getElementById("hero-image-a");

    const imageB = document.getElementById("hero-image-b");

    const title = document.getElementById("hero-title");

    const date = document.getElementById("hero-date");

    imageA.src = heroItems[0].image;

    imageA.classList.add("active");

    title.textContent = heroItems[0].title;

    date.textContent = heroItems[0].date;

    setInterval(changeHero, 6000);
  } catch (error) {
    console.error(error);
  }
}

function changeHero() {
  if (heroItems.length < 2) return;

  currentHero = (currentHero + 1) % heroItems.length;

  const hero = heroItems[currentHero];

  const imageA = document.getElementById("hero-image-a");

  const imageB = document.getElementById("hero-image-b");

  const title = document.getElementById("hero-title");

  const date = document.getElementById("hero-date");

  const nextImage = showingA ? imageB : imageA;

  const currentImage = showingA ? imageA : imageB;

  nextImage.src = hero.image;

  nextImage.onload = () => {
    nextImage.classList.add("active");

    currentImage.classList.remove("active");

    title.textContent = hero.title;

    date.textContent = hero.date;

    showingA = !showingA;
  };
}

loadHero();
