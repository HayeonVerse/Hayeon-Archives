const fs = require("fs");
const path = require("path");

const CONFIG = require("./config");
const {
    isMedia,
    isText
} = require("./utils");

/**
 * Scan the gallery folder and return every album.
 *
 * @returns {Array}
 */
function scanGallery() {

    const albums = [];

    const years = fs.readdirSync(
        CONFIG.ROOT,
        {
            withFileTypes: true
        }
    );

    for (const year of years) {

        if (!year.isDirectory())
            continue;

        if (!/^\d{4}$/.test(year.name))
            continue;

        const yearPath = path.join(
            CONFIG.ROOT,
            year.name
        );

        const months = fs.readdirSync(
            yearPath,
            {
                withFileTypes: true
            }
        );

        for (const month of months) {

            if (!month.isDirectory())
                continue;

            if (!CONFIG.MONTHS.has(month.name))
                continue;

            scanMonth(

                albums,

                year.name,

                month.name,

                path.join(
                    yearPath,
                    month.name
                )

            );

        }

    }

    return albums;

}

/**
 * Scan every album inside one month.
 *
 * @param {Array} albums
 * @param {string} year
 * @param {string} month
 * @param {string} monthPath
 */
function scanMonth(
    albums,
    year,
    month,
    monthPath
) {

    const folders = fs.readdirSync(
        monthPath,
        {
            withFileTypes: true
        }
    );

    for (const folder of folders) {

        if (!folder.isDirectory())
            continue;

        const fullPath = path.join(
            monthPath,
            folder.name
        );

        const files = scanAlbum(
            fullPath
        );

        albums.push({

            year,

            month,

            folder: folder.name,

            path:
                `${year}/${month}/${folder.name}`,

            fullPath,

            files

        });

    }

}

/**
 * Scan one album folder.
 *
 * @param {string} folder
 * @returns {Array}
 */
function scanAlbum(folder) {

    const entries = fs.readdirSync(
        folder,
        {
            withFileTypes: true
        }
    );

    const files = [];

    for (const entry of entries) {

        if (!entry.isFile())
            continue;

        if (
            !isMedia(entry.name) &&
            !isText(entry.name)
        ) {
            continue;

        }

        const full = path.join(
            folder,
            entry.name
        );

        const stat = fs.statSync(full);

        files.push({

            name: entry.name,

            full,

            size: stat.size,

            mtime: stat.mtimeMs

        });

    }

    files.sort((a, b) =>
        a.name.localeCompare(
            b.name,
            undefined,
            {
                numeric: true,
                sensitivity: "base"
            }
        )
    );

    return files;

}

/**
 * Count every supported media file
 * inside the scanned albums.
 *
 * @param {Array} albums
 * @returns {Object}
 */
function getStatistics(albums) {

    let images = 0;
    let videos = 0;
    let links = 0;

    for (const album of albums) {

        for (const file of album.files) {

            if (isMedia(file.name)) {

                if (CONFIG.IMAGE_EXTENSIONS.has(
                    path.extname(file.name).toLowerCase()
                )) {

                    images++;

                } else {

                    videos++;

                }

            } else if (isText(file.name)) {

                links++;

            }

        }

    }

    return {

        albums: albums.length,

        images,

        videos,

        links

    };

}

module.exports = {

    scanGallery,

    getStatistics

};