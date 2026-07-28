const fs = require("fs");

const CONFIG = require("./config");

const logger = require("./logger");

const {
    scanGallery,
    getStatistics
} = require("./scanner");

const {
    loadCache,
    saveCache,
    prune
} = require("./cache");

const {
    rebuildAlbums
} = require("./rebuild");

const {
    writeJson
} = require("./utils");

function main() {

    logger.header(
        "Gallery Builder v2"
    );

    const cache = loadCache();

    const albums = scanGallery();

    const removed = prune(
        cache,
        albums
    );

    const result = rebuildAlbums(
        albums,
        cache
    );

    saveCache(
        cache
    );

    writeJson(
        CONFIG.OUTPUT,
        result.output
    );

    const stats = getStatistics(
        albums
    );

    logger.summary({

        albums: stats.albums,

        updated: result.updated,

        skipped: result.skipped,

        removed,

        infoUpdated: result.infoUpdated,

        warnings: result.warnings,

        time: result.time

    });

}

try {

    main();

} catch (error) {

    logger.error(
        error.stack || error.message
    );

    process.exit(1);

}

