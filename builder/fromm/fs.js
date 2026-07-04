/**
 * ===========================================
 * Fromm Archive Generator
 * fs.js
 * ===========================================
 */

const fs = require("fs");
const path = require("path");

function ensureDirectory(directory) {

    fs.mkdirSync(directory, {
        recursive: true
    });

}

function writeJSON(filepath, data) {

    ensureDirectory(
        path.dirname(filepath)
    );

    fs.writeFileSync(
        filepath,
        JSON.stringify(
            data,
            null,
            2
        ),
        "utf8"
    );

}

module.exports = {

    ensureDirectory,
    writeJSON

};