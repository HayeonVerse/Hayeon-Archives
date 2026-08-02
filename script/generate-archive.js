const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../assets/fromm");
const OUTPUT = path.join(ROOT, "archive.json");
const DATA_OUTPUT = path.join(ROOT, "archive-data.json");

function generateArchive() {
    const archive = [];
    const archiveData = [];

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

    const info = JSON.parse(
        fs.readFileSync(infoPath, "utf8")
    );

    const messages = info.messages || [];

    archive.push({

        folder: `${year}/${month}/${day}`,

        date: info.date,

        messages: messages.length,

        images: messages.filter(m => m.image).length,

        videos: messages.filter(m => m.video).length,

        voices: messages.filter(m => m.voice).length,

        stickers: messages.filter(m => m.sticker).length

    });

archiveData.push({

    folder: `${year}/${month}/${day}`,

    ...info

});

}
            }
        }
    }

    archive.sort((a, b) => b.folder.localeCompare(a.folder));

archiveData.sort((a, b) => b.folder.localeCompare(a.folder));

    fs.writeFileSync(
        OUTPUT,
        JSON.stringify(archive, null, 4) + "\n"
    );

fs.writeFileSync(
    DATA_OUTPUT,
    JSON.stringify(archiveData, null, 4) + "\n"
);

    console.log(
    `✓ archive.json generated (${archive.length} conversations)`
);

console.log(
    `✓ archive-data.json generated (${archiveData.length} conversations)`
);
}

generateArchive();