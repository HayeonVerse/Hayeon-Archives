/**
 * ===========================================
 * Fromm Archive Generator
 * cli.js
 * ===========================================
 */

const fs = require("fs");
const path = require("path");

const { readInput } = require("./reader");
const { parseConversation } = require("./parser");
const { validate } = require("./validator");
const { buildConversation } = require("./generator");
const { writeJSON } = require("./fs");

const INPUT_DIR = path.join(__dirname, "pending");

function getConversationFolders() {

    if (!fs.existsSync(INPUT_DIR)) {

        return [];

    }

    return fs.readdirSync(INPUT_DIR)
        .filter(name => {

            const full =
                path.join(INPUT_DIR, name);

            return fs.statSync(full).isDirectory();

        });

}

function run() {

    const folders =
        getConversationFolders();

    if (!folders.length) {

        console.log(
            "No conversations found."
        );

        return;

    }

    console.log("");

    console.log(
        "Found",
        folders.length,
        "conversation(s)."
    );

    console.log("");

folders.forEach(folder => {

    console.log("Processing:", folder);

    try {

        const folderPath = path.join(INPUT_DIR, folder);

        // Read input.txt
        const input = readInput(folderPath);

        // Parse Korean conversation
        const parsedMessages = parseConversation(input.korean);

        // Parse translations
const parsedTranslations =
    parseConversation(input.translation);

    console.log(
    "Korean messages:",
    parsedMessages.length
);

console.log(
    "English messages:",
    parsedTranslations.length
);
for (
    let i = 0;
    i < Math.max(parsedMessages.length, parsedTranslations.length);
    i++
) {
    console.log("-----", i + 1);

    console.log(
        "KO:",
        parsedMessages[i]?.text ||
        parsedMessages[i]?.mediaType ||
        "(none)"
    );

    console.log(
        "EN:",
        parsedTranslations[i]?.text ||
        parsedTranslations[i]?.mediaType ||
        "(none)"
    );
}
        // Validate
const errors = validate(
    parsedMessages,
    parsedTranslations
);

        if (errors.length) {

            console.log("");
            console.log("Validation failed:");

            errors.forEach(error => {

                console.log(" -", error);

            });

            return;

        }

        // Generate info.json object
const conversation = buildConversation(
    input.date,
    parsedMessages,
    parsedTranslations
);

        // Save output
const [year, month, day] = input.date.split("-");

const outputFile = path.join(
    __dirname,
    "..",
    "..",
    "assets",
    "fromm",
    year,
    month,
    day,
    "info.json"
);

        writeJSON(
            outputFile,
            conversation
        );

console.log(
    `✓ Created assets/fromm/${year}/${month}/${day}/info.json`
);
    } catch (error) {

        console.error(error.message);

    }

});

}

run();