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

        output.sort((a, b) => {

        return b.path.localeCompare(

            a.path,

            undefined,

            {

                numeric: true,

                sensitivity: "base"

            }

        );

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