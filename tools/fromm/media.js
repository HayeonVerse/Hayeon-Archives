/**
 * ===========================================
 * Fromm Archive Builder
 * media.js
 * ===========================================
 */

function pad(number) {

    return String(number).padStart(2, "0");

}

function getMediaFilename(mediaType, index) {

    switch (mediaType) {

        case "image":
            return `image-${pad(index)}.webp`;

        case "voice":
            return `voice-${pad(index)}.mp3`;

        case "video":
            return `video-${pad(index)}.mov`;

        default:
            throw new Error(
                `Unknown media type: ${mediaType}`
            );

    }

}

module.exports = {

    getMediaFilename

};