const fs = require("fs");
const path = require("path");

const CONFIG = require("./config");

/**
 * Get file extension in lowercase.
 *
 * @param {string} file
 * @returns {string}
 */
function extension(file) {

    return path.extname(file).toLowerCase();

}

/**
 * Returns true if file is a supported image.
 *
 * @param {string} file
 * @returns {boolean}
 */
function isImage(file) {

    return CONFIG.IMAGE_EXTENSIONS.has(
        extension(file)
    );

}

/**
 * Returns true if file is a supported video.
 *
 * @param {string} file
 * @returns {boolean}
 */
function isVideo(file) {

    return CONFIG.VIDEO_EXTENSIONS.has(
        extension(file)
    );

}

/**
 * Returns true if file is a txt file.
 *
 * @param {string} file
 * @returns {boolean}
 */
function isText(file) {

    return extension(file) ===
        CONFIG.TEXT_EXTENSION;

}

/**
 * Returns true if file is media.
 *
 * @param {string} file
 * @returns {boolean}
 */
function isMedia(file) {

    return (
        isImage(file) ||
        isVideo(file)
    );

}


/**
 * Pick the album cover.
 *
 * First image.
 * Otherwise first video.
 * Otherwise null.
 *
 * @param {Object[]} files
 * @returns {string|null}
 */
function pickCover(files) {

    const image = files.find(
        file => isImage(file.name)
    );

    if (image)
        return image.name;

    const video = files.find(
        file => isVideo(file.name)
    );

    if (video)
        return video.name;

    return null;

}

function writeJson(file, data) {

    const json = JSON.stringify(
        data,
        null,
        CONFIG.JSON_INDENT
    );

    if (fs.existsSync(file)) {

        const current = fs.readFileSync(
            file,
            "utf8"
        );

        if (current === json) {

            return false;

        }

    }

    fs.mkdirSync(
        path.dirname(file),
        {
            recursive: true
        }
    );

    const tmp =
        file + CONFIG.TMP_EXTENSION;

    fs.writeFileSync(
        tmp,
        json
    );

    fs.renameSync(
        tmp,
        file
    );

    return true;

}

/**
 * Read JSON safely.
 *
 * @param {string} file
 * @param {*} fallback
 * @returns {*}
 */
function readJson(file, fallback = null) {

    if (!fs.existsSync(file))
        return fallback;

    try {

        return JSON.parse(
            fs.readFileSync(
                file,
                "utf8"
            )
        );

    } catch {

        return fallback;

    }

}

/**
 * Validate scanned album files.
 *
 * @param {Object[]} files
 * @returns {string[]}
 */
function validateAlbum(files) {

    const warnings = [];

    if (!Array.isArray(files)) {

        warnings.push(
            "Invalid album."
        );

        return warnings;

    }

    if (files.length === 0) {

        warnings.push(
            "Album contains no supported media."
        );

    }

    return warnings;

}


module.exports = {

    extension,

    isImage,

    isVideo,

    isText,

    isMedia,

    pickCover,

    writeJson,

    readJson,

    validateAlbum

};