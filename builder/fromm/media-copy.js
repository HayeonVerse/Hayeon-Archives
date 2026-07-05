const fs = require("fs");
const path = require("path");

function copyMedia(sourceFolder, destinationFolder) {

    if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder, { recursive: true });
    }

    const files = fs.readdirSync(sourceFolder);

    for (const file of files) {

        if (file === "input.txt") continue;

        const source = path.join(sourceFolder, file);
        const destination = path.join(destinationFolder, file);

        if (!fs.statSync(source).isFile()) continue;

        fs.copyFileSync(source, destination);

    }

}

module.exports = {
    copyMedia
};