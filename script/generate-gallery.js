const fs = require("fs");
const path = require("path");

const GALLERY = "./assets/gallery";

const IMAGE_EXT = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".mp4"
];

const albums = [];

function scan(dir) {
    const entries = fs.readdirSync(dir, {
        withFileTypes: true
    });

    const files = entries.filter(e => e.isFile());
    const folders = entries.filter(e => e.isDirectory());

const media = [];
let youtube = null;

files.forEach(file => {
    const ext =
        path.extname(file.name)
        .toLowerCase();

    if (
        IMAGE_EXT.includes(ext)
    ) {
        media.push(file.name);
    }

if (
    path.extname(
        file.name
    )
    === ".txt"
) {
        youtube =
        fs.readFileSync(
            path.join(
                dir,
                file.name
            ),
            "utf8"
        ).trim();
    }
});

    const rel = path.relative(GALLERY, dir);

    const parts = rel.split(path.sep);

if (
    parts.length === 3 &&
    (
        media.length ||
        youtube
    )
) {
const [year, month, folder] = parts;

const day =
folder.split("-")[0].trim();

const title =
folder.includes("-")
? folder.split("-").slice(1).join("-").trim()
: folder;

        const info = {
            title,
            date: `${month} ${day}`,
            source: "Archive",
            tags: [],
            video: youtube,
            cover: media[0] || null,
            files: media
        };

        fs.writeFileSync(
            path.join(dir, "info.json"),
            JSON.stringify(info, null, 4)
        );

        albums.push({
            path: rel.replace(/\\/g, "/")
        });

        console.log("Generated:", rel);
    }

    folders.forEach(f =>
        scan(path.join(dir, f.name))
    );
}

scan(GALLERY);

fs.writeFileSync(
    `${GALLERY}/albums.json`,
    JSON.stringify(albums, null, 4)
);

console.log("Done.");