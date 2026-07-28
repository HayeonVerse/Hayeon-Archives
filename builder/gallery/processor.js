const fs = require("fs");
const path = require("path");

const CONFIG = require("./config");

const {

    isImage,

    isVideo,

    isText,

    pickCover,

    validateAlbum,

    writeJson

} = require("./utils");

/**
 * Read every URL from txt files.
 *
 * @param {Array} files
 * @returns {string[]}
 */
function readLinks(files) {

    const links = [];

    for (const file of files) {

        const content = fs.readFileSync(
            file.full,
            "utf8"
        );

        content
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean)
            .forEach(link => {

                if (!links.includes(link)) {

                    links.push(link);

                }

            });

    }

    return links;

}

/**
 * Process one scanned album.
 *
 * @param {Object} album
 * @returns {Object}
 */
function processAlbum(album) {

    const warnings =
        validateAlbum(album.files);

const files = [];

const video = [];

    for (const file of album.files) {

if (

    isImage(file.name) ||

    isVideo(file.name)

) {

    files.push(file.name);

    continue;

}

if (isText(file.name)) {

    video.push(file);

}

    }

const day =
    album.folder.split("-")[0].trim();

const title =
    album.folder.includes("-")
        ? album.folder
            .split("-")
            .slice(1)
            .join("-")
            .trim()
        : album.folder;

const info = {

    title,

    date: `${album.month} ${day}`,

    source: CONFIG.SOURCE,

    tags: [],

    video: [],

    cover: pickCover(
        album.files
    ),

    files

};

info.video = readLinks(video);

const infoPath = path.join(
    album.fullPath,
    "info.json"
);

const infoChanged = writeJson(
    infoPath,
    info
);

return {

    path: album.path,

    info,

    infoChanged,

    warnings

};

}

module.exports = {

    processAlbum

};