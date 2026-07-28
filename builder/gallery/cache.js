const fs = require("fs");
const crypto = require("crypto");

const CONFIG = require("./config");
const {
    readJson,
    writeJson
} = require("./utils");

/**
 * Load gallery cache.
 *
 * @returns {Object}
 */
function loadCache() {

const cache = readJson(
    CONFIG.CACHE,
    null
);

if (

    cache &&

    cache.version === CONFIG.VERSION

) {

    return cache;

}

return {

    version: CONFIG.VERSION,

    albums: {}

};

}

/**
 * Save gallery cache.
 *
 * @param {Object} cache
 */
function saveCache(cache) {

    fs.mkdirSync(

        CONFIG.CACHE.replace(
            /[\\/][^\\/]+$/,
            ""
        ),

        {
            recursive: true
        }

    );

    writeJson(
        CONFIG.CACHE,
        cache
    );

}

/**
 * Build a fingerprint for one album.
 *
 * The fingerprint changes whenever:
 * - a file is added
 * - removed
 * - renamed
 * - modified
 *
 * @param {Object} album
 * @returns {string}
 */
function fingerprint(album) {

    const hash =
        crypto.createHash("sha1");

    for (const file of album.files) {

        hash.update(file.name);

        hash.update(
            String(file.size)
        );

        hash.update(
            String(file.mtime)
        );

    }

    return hash.digest("hex");

}

/**
 * Return cached album.
 *
 * @param {Object} cache
 * @param {string} path
 * @returns {*}
 */
function get(cache, path) {

    return cache.albums[path] ?? null;

}

/**
 * Update cache entry.
 *
 * @param {Object} cache
 * @param {string} path
 * @param {string} fingerprint
 * @param {Object} info
 */
function set(
    cache,
    path,
    fingerprint,
    album
) {

cache.albums[path] = {

    fingerprint,

    album,

    updated: Date.now()

};

}

/**
 * Remove cache entries
 * that no longer exist.
 *
 * @param {Object} cache
 * @param {Array} albums
 *
 * @returns {number}
 */
function prune(cache, albums) {

    const existing = new Set(

        albums.map(
            album => album.path
        )

    );

    let removed = 0;

    for (const path of Object.keys(cache.albums)) {

        if (existing.has(path))
            continue;

        delete cache.albums[path];

        removed++;

    }

    return removed;

}

/**
 * Returns true if
 * the album has changed.
 *
 * @param {Object} cache
 * @param {Object} album
 */
function changed(cache, album) {

    const fp = fingerprint(album);

    const cached = get(
        cache,
        album.path
    );

    if (!cached)
        return true;

    return cached.fingerprint !== fp;

}

module.exports = {

    loadCache,

    saveCache,

    fingerprint,

    get,

    set,

    prune,

    changed

};