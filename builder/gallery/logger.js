const symbols = {
    info: "ℹ",
    success: "✓",
    warn: "⚠",
    error: "✖"
};

function line() {
    console.log(
        "────────────────────────────────────────"
    );
}

function header(title) {

    console.log();

    line();

    console.log(title);

    line();

}

function info(message) {
    console.log(
        `${symbols.info} ${message}`
    );
}

function success(message) {
    console.log(
        `${symbols.success} ${message}`
    );
}

function warn(message) {
    console.log(
        `${symbols.warn} ${message}`
    );
}

function error(message) {
    console.log(
        `${symbols.error} ${message}`
    );
}

function summary(stats) {

    line();

    console.log(
        `Albums       : ${stats.albums}`
    );

    console.log(
        `Updated      : ${stats.updated}`
    );

    console.log(
        `Skipped      : ${stats.skipped}`
    );

    console.log(
        `Removed      : ${stats.removed}`
    );

    console.log(
        `Info Updated : ${stats.infoUpdated}`
    );

    if (stats.warnings !== undefined) {

        console.log(
            `Warnings     : ${stats.warnings}`
        );

    }

    if (stats.time !== undefined) {

        console.log(
            `Time         : ${stats.time} ms`
        );

    }

    line();

}

module.exports = {

    header,

    info,

    success,

    warn,

    error,

    summary

};