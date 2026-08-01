const {

    processAlbum

} = require("./processor");

const {

    changed,

    fingerprint,

    get,

    set

} = require("./cache");

/**
 * Rebuild gallery.
 *
 * @param {Object[]} albums
 * @param {Object} cache
 *
 * @returns {Object}
 */
function rebuildAlbums(
    albums,
    cache
) {

    const start = Date.now();

    const output = [];

    let updated = 0;

    let skipped = 0;

    let infoUpdated = 0;

    let warnings = 0;

        for (const album of albums) {

        if (!changed(
            cache,
            album
        )) {

            const cached = get(
                cache,
                album.path
            );

            output.push(
                cached.album
            );

            skipped++;

            continue;

        }

                const result = processAlbum(
            album
        );

        const albumData = {

            path: result.path,

            info: result.info

        };

        output.push(
            albumData
        );

        const fp = fingerprint(
            album
        );

        set(

            cache,

            album.path,

            fp,

            albumData

        );

        updated++;

        if (result.infoChanged) {

            infoUpdated++;

        }

        warnings +=
            result.warnings.length;

    }

const MONTH_INDEX = {

    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11

};

output.sort((a, b) => {

    const parse = (album) => {

        const [year, month, folder] = album.path.split("/");

        const day = Number(
            folder.split("-")[0].trim()
        );

        return new Date(
            Number(year),
            MONTH_INDEX[month],
            day
        );

    };

    return parse(b) - parse(a);

});

        return {

        output,

        updated,

        skipped,

        infoUpdated,

        warnings,

        time:

            Date.now() - start

    };

}

module.exports = {

    rebuildAlbums

};