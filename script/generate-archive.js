const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../assets/fromm");
const OUTPUT = path.join(ROOT, "archive.json");

function generateArchive() {
    const archive = [];

    if (!fs.existsSync(ROOT)) {
        throw new Error(`Folder not found: ${ROOT}`);
    }

    for (const year of fs.readdirSync(ROOT)) {
        if (!/^\d{4}$/.test(year)) continue;

        const yearPath = path.join(ROOT, year);

        for (const month of fs.readdirSync(yearPath)) {
            if (!/^\d{2}$/.test(month)) continue;

            const monthPath = path.join(yearPath, month);

            for (const day of fs.readdirSync(monthPath)) {
                if (!/^\d{2}$/.test(day)) continue;

                const infoPath = path.join(monthPath, day, "info.json");

                if (fs.existsSync(infoPath)) {
                    archive.push(`${year}/${month}/${day}`);
                }
            }
        }
    }

    archive.sort((a, b) => b.localeCompare(a));

    fs.writeFileSync(
        OUTPUT,
        JSON.stringify(archive, null, 4) + "\n"
    );

    console.log(`✓ archive.json generated (${archive.length} conversations)`);
}

generateArchive();