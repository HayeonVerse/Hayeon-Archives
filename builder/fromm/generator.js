/**
 * ===========================================
 * Fromm Archive Builder
 * builder.js
 * ===========================================
 */

const {
    getMediaFilename
} = require("./media");

function buildConversation(date, parsedMessages, translations = []) {

    const messages = [];

    let translationIndex = 0;

    for (const message of parsedMessages) {

        // -----------------------------
        // TEXT MESSAGE
        // -----------------------------

        if (message.type === "text") {

const translation =
    translations[translationIndex++];

messages.push({

    type:
        message.sender === "idol"
            ? "hayeon"
            : "fan",

    ko: message.text,

    en:
        translation?.text ?? ""

});

            continue;

        }

        // -----------------------------
        // MEDIA MESSAGE
        // -----------------------------

if (message.type === "media") {

    const translation =
        translations[translationIndex];

    // Consume the matching media marker
    if (
        translation &&
        translation.type === "media" &&
        translation.mediaType === message.mediaType
    ) {
        translationIndex++;
    }

    const media = {

        type:
            message.sender === "idol"
                ? "hayeon"
                : "fan"

    };

    switch (message.mediaType) {

        case "image":

            media.image =
                getMediaFilename(
                    "image",
                    message.index
                );

            break;

        case "voice":

            media.voice =
                getMediaFilename(
                    "voice",
                    message.index
                );

            break;

        case "video":

            media.video =
                getMediaFilename(
                    "video",
                    message.index
                );

            break;

    }

    messages.push(media);

    continue;

}

    }

    return {

        date,

        messages

    };

}

module.exports = {

    buildConversation

};