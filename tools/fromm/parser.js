/**
 * ===========================================
 * Fromm Archive Builder
 * parser.js
 * ===========================================
 */

function parseConversation(text) {

    const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    const messages = [];

    for (const line of lines) {

        // Fan
        if (line.startsWith("🫡")) {

            messages.push({
                sender: "fan",
                type: "text",
                text: line.replace(/^🫡\s*/, "")
            });

            continue;

        }

        // Idol
        if (line.startsWith("🦔")) {

            messages.push({
                sender: "idol",
                type: "text",
                text: line.replace(/^🦔\s*/, "")
            });

            continue;

        }

        // Photo
        const photo = line.match(/^\*\*\(Photo #(\d+)\)\*\*$/i);

        if (photo) {

            messages.push({
                sender: "idol",
                type: "media",
                mediaType: "image",
                index: Number(photo[1])
            });

            continue;

        }

        // Audio
        const audio = line.match(/^\*\*\(Audio #(\d+)\)\*\*$/i);

        if (audio) {

            messages.push({
                sender: "idol",
                type: "media",
                mediaType: "voice",
                index: Number(audio[1])
            });

            continue;

        }

        // Video
        const video = line.match(/^\[video (\d+)\]$/i);

        if (video) {

            messages.push({
                sender: "idol",
                type: "media",
                mediaType: "video",
                index: Number(video[1])
            });

            continue;

        }

        // Normal idol text
        messages.push({
            sender: "idol",
            type: "text",
            text: line
        });

    }

    return messages;

}

module.exports = {

    parseConversation

};