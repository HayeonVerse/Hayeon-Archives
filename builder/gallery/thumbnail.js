const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function generateVideoThumbnail(folder, videoFile) {

    const output = path.join(
        folder,
        "cover.webp"
    );

    if (fs.existsSync(output)) {

        return "cover.webp";

    }

    try {

        execFileSync(

            "ffmpeg",

            [
                "-y",

                "-i",
                path.join(folder, videoFile),

                "-frames:v",
                "1",

                "-vf",
                "scale=800:-1",

                output

            ],

            {
                stdio: "ignore"
            }

        );

        return "cover.webp";

    }

catch (error) {

    console.error(error);

    return null;

}

}

module.exports = {

    generateVideoThumbnail

};