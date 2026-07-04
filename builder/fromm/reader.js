/**
 * ===========================================
 * Fromm Archive Generator
 * reader.js
 * ===========================================
 */

const fs = require("fs");
const path = require("path");

function readInput(folder) {

    const file = path.join(folder, "input.txt");

    const content = fs.readFileSync(file, "utf8");

    return parseInput(content);

}

function parseInput(content) {

    const marker =
        /^=+\s*TRANSLATION\s*=+$/im;

    const parts = content.split(marker);

    if (parts.length !== 2) {

        throw new Error(
            "TRANSLATION section not found."
        );

    }

    const metadataAndKorean = parts[0].trim();

    const translation = parts[1].trim();

    const date =
        metadataAndKorean.match(
            /^Date:\s*(.+)$/im
        )?.[1]?.trim() || "";

    const member =
        metadataAndKorean.match(
            /^Member:\s*(.+)$/im
        )?.[1]?.trim() || "";

    const platform =
        metadataAndKorean.match(
            /^Platform:\s*(.+)$/im
        )?.[1]?.trim() || "";

    const translator =
        metadataAndKorean.match(
            /^Translator:\s*(.+)$/im
        )?.[1]?.trim() || "";

    const korean =
        metadataAndKorean
            .split(/^=+\s*KOREAN\s*=+$/im)[1]
            ?.trim() || "";

    return {

        date,

        member,

        platform,

        translator,

        korean,

        translation

    };

}

module.exports = {

    readInput

};