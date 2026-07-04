/**
 * ===========================================
 * Fromm Archive Generator
 * validator.js
 * ===========================================
 */

function validateConversation(messages) {

    const errors = [];

    if (!Array.isArray(messages)) {

        errors.push(
            "Conversation is not an array."
        );

        return errors;

    }

    if (messages.length === 0) {

        errors.push(
            "Conversation contains no messages."
        );

    }

    return errors;

}

function validateTranslations(messages, translations) {

    const errors = [];

    const koreanTextCount =
        messages.filter(
            message => message.type === "text"
        ).length;

    const englishTextCount =
        translations.filter(
            message => message.type === "text"
        ).length;

    if (koreanTextCount !== englishTextCount) {

        errors.push(

            `Translation count mismatch. Expected ${koreanTextCount}, found ${englishTextCount}.`

        );

    }

    return errors;

}

function validateMediaMarkers(messages) {

    const errors = [];

    const counters = {

        image: 0,
        voice: 0,
        video: 0

    };

    for (const message of messages) {

        if (message.type !== "media") {

            continue;

        }

        counters[message.mediaType]++;

        if (message.index !== counters[message.mediaType]) {

            errors.push(

                `${message.mediaType} numbering is incorrect. Expected #${counters[message.mediaType]}, found #${message.index}.`

            );

        }

    }

    return errors;

}

function validate(messages, translations) {

    return [

        ...validateConversation(
            messages
        ),

        ...validateTranslations(
            messages,
            translations
        ),

        ...validateMediaMarkers(
            messages
        )

    ];

}

module.exports = {

    validate

};