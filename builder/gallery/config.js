const path = require("path");

module.exports = {

    VERSION: 2,

    ROOT: path.resolve("assets/gallery"),

    OUTPUT: path.resolve(
        "assets/gallery/albums.json"
    ),

    CACHE: path.resolve(
        "builder/gallery/cache/gallery-cache.json"
    ),

    SOURCE: "Archive",

    IMAGE_EXTENSIONS: new Set([
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ]),

    VIDEO_EXTENSIONS: new Set([
        ".mp4"
    ]),

    TEXT_EXTENSION: ".txt",

    MONTHS: new Set([
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]),

    JSON_INDENT: 4,

    TMP_EXTENSION: ".tmp"

};