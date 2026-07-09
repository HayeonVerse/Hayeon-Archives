const fs = require("fs");
const path = require("path");

const FROMM_ROOT = path.join(__dirname, "..", "assets", "fromm");
const ARCHIVE_FILE = path.join(FROMM_ROOT, "archive.json");

const archive = [];

function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scan(full);
            continue;
        }

        if (entry.name !== "info.json") continue;

        try {
            const json = JSON.parse(fs.readFileSync(full, "utf8"));

            if (!json.date) {
                console.warn(`Missing date: ${full}`);
                continue;
            }

            // date: YYYY-MM-DD
            const parts = json.date.split("-");

            if (parts.length !== 3) {
                console.warn(`Invalid date: ${full}`);
                continue;
            }

            archive.push(parts.join("/"));
        } catch (err) {
            console.warn(`Failed to read ${full}`);
            console.warn(err.message);
        }
    }
}

scan(FROMM_ROOT);

// newest first
archive.sort((a, b) => b.localeCompare(a));

fs.writeFileSync(
    ARCHIVE_FILE,
    JSON.stringify(archive, null, 2)
);

console.log(`✓ archive.json rebuilt (${archive.length} conversations)`);