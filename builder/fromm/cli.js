/**
 * ===========================================
 * Fromm Archive Generator
 * cli.js
 * ===========================================
 */

const fs = require("fs");
const path = require("path");

const { parseConversation } = require("./parser");
const { validate } = require("./validator");
const { buildConversation } = require("./generator");

const INPUT_DIR =
    path.join(__dirname, "input");

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

        console.log(
            "Processing:",
            folder
        );

    });

}

run();