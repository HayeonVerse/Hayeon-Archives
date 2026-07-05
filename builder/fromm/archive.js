const fs = require("fs");
const path = require("path");

const ARCHIVE_FILE = path.join(
    __dirname,
    "..",
    "..",
    "assets",
    "fromm",
    "archive.json"
);

function updateArchive(date) {

    let archive = [];

    if (fs.existsSync(ARCHIVE_FILE)) {

        archive = JSON.parse(
            fs.readFileSync(
                ARCHIVE_FILE,
                "utf8"
            )
        );

    }

    const formatted =
        date.replace(/-/g, "/");

    if (!archive.includes(formatted)) {

        archive.push(formatted);

    }

    archive.sort((a, b) => b.localeCompare(a));

    fs.writeFileSync(

        ARCHIVE_FILE,

        JSON.stringify(
            archive,
            null,
            4
        )

    );

}

module.exports = {

    updateArchive

};