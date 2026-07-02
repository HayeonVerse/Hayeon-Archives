/* ============================================
   Hayeon Archive
   Fromm Archive v2.0
   Module 1A
   Core Foundation
============================================ */

"use strict";

/* ============================================
   CONFIG
============================================ */

const App = {

    config: {

        dataRoot: "assets/fromm/",

        indexFile: "index.json",

        defaultLanguage: "both",

        animationSpeed: 250,

        searchDelay: 200,

        months: [

            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"

        ]

    },

/* ============================================
   APPLICATION STATE
============================================ */

    state: {

        initialized: false,

        language: "both",

        groupedMessages: true,

        search: "",
openedYears: new Set(),

openedMonths: new Set(),
        loading: false,

        archive: {},

        conversations: [],

        filtered: [],

        statistics: {

            conversations: 0,

            messages: 0,

            images: 0,

            years: 0

        }

    },

/* ============================================
   DOM CACHE
============================================ */

    cache: {

        container: null,

        search: null,

        languageButtons: [],

        stats: {

            conversations: null,

            messages: null,

            images: null,

            years: null

        }

    },

/* ============================================
   UTILITIES
============================================ */

    utils: {}

};

/* ============================================
   SHORTCUTS
============================================ */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

/* ============================================
   DOM CACHE
============================================ */

function cacheDOM() {

    App.cache.container =
        $("#fromm-container");

    App.cache.search =
        $("#search-input");

    App.cache.languageButtons =
        $$(".lang-btn");

    App.cache.stats.conversations =
        $("#conversation-count");

    App.cache.stats.messages =
        $("#message-count");

    App.cache.stats.images =
        $("#photo-count");

    App.cache.stats.years =
        $("#year-count");

}

/* ============================================
   BASIC HELPERS
============================================ */

App.utils.clear = function(element){

    if(!element) return;

    element.innerHTML = "";

};

App.utils.create = function(tag, className=""){

    const el = document.createElement(tag);

    if(className){

        el.className = className;

    }

    return el;

};

App.utils.text = function(text){

    return document.createTextNode(text);

};

App.utils.fragment = function(){

    return document.createDocumentFragment();

};

App.utils.clone = function(template){

    return template.content.cloneNode(true);

};

/* ============================================
   MODULE 1B
   STATE • LOADER • EVENTS
============================================ */

/* ============================================
   SIMPLE EVENT BUS
============================================ */

App.events = {

    listeners: {},

    on(event, callback) {

        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        this.listeners[event].push(callback);

    },

    emit(event, data = null) {

        if (!this.listeners[event]) return;

        this.listeners[event].forEach(callback => {
            callback(data);
        });

    }

};

/* ============================================
   LOADING STATE
============================================ */

App.setLoading = function (loading) {

    App.state.loading = loading;

    document.body.classList.toggle(
        "fromm-loading",
        loading
    );

};

/* ============================================
   FETCH JSON
============================================ */

App.fetchJSON = async function (url) {

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(

            `Unable to load ${url}`

        );

    }

    return await response.json();

};

/* ============================================
   LOAD INDEX
============================================ */

App.loadIndex = async function () {

    const url =
        App.config.dataRoot +
        App.config.indexFile;

    return await App.fetchJSON(url);

};

/* ============================================
   LOAD CONVERSATION
============================================ */

App.loadConversation = async function (file) {

    return await App.fetchJSON(

        App.config.dataRoot + file

    );

};

/* ============================================
   LOAD EVERYTHING
============================================ */

App.loadArchive = async function () {

    try {

        App.setLoading(true);

        const index =
            await App.loadIndex();

        const conversations =
            await Promise.all(

                index.map(item =>

                    App.loadConversation(
                        item.file
                    )

                )

            );

        App.state.conversations =
            conversations;

        App.state.filtered =
            [...conversations];

        App.events.emit(

            "archiveLoaded",

            conversations

        );

    }

    catch (error) {

        console.error(error);

    }

    finally {

        App.setLoading(false);

    }

};

/* ============================================
   CACHE IMAGES
============================================ */

App.cache.images = new Map();

App.preloadImage = function (src) {

    if (

        App.cache.images.has(src)

    ) return;

    const image = new Image();

    image.src = src;

    App.cache.images.set(

        src,

        image

    );

};

/* ============================================
   INITIALIZE
============================================ */

App.init = async function () {

    if (

        App.state.initialized

    ) return;

    cacheDOM();

    await App.loadArchive();

    App.state.initialized = true;

    App.events.emit(

        "ready"

    );

};

document.addEventListener(

    "DOMContentLoaded",

    App.init

);

/* ============================================
   MODULE 1C
   COMMON UTILITIES
============================================ */

/* ============================================
   CLEAR ELEMENT
============================================ */

App.utils.clear = function (element) {

    if (!element) return;

    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

};

/* ============================================
   DOCUMENT FRAGMENT
============================================ */

App.utils.fragment = function () {

    return document.createDocumentFragment();

};

/* ============================================
   ESCAPE HTML
============================================ */

App.utils.escapeHTML = function (text = "") {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

};

/* ============================================
   DEBOUNCE
============================================ */

App.utils.debounce = function (callback, delay = 250) {

    let timeout;

    return (...args) => {

        clearTimeout(timeout);

        timeout = setTimeout(() => {

            callback(...args);

        }, delay);

    };

};

/* ============================================
   THROTTLE
============================================ */

App.utils.throttle = function (callback, limit = 150) {

    let waiting = false;

    return (...args) => {

        if (waiting) return;

        callback(...args);

        waiting = true;

        setTimeout(() => {

            waiting = false;

        }, limit);

    };

};

/* ============================================
   FORMAT DATE
============================================ */

App.utils.formatDate = function (dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {

        year: "numeric",

        month: "long",

        day: "numeric"

    });

};

/* ============================================
   GET YEAR
============================================ */

App.utils.getYear = function (dateString) {

    return new Date(dateString)
        .getFullYear()
        .toString();

};

/* ============================================
   GET MONTH
============================================ */

App.utils.getMonth = function (dateString) {

    return new Date(dateString)
        .toLocaleString("en-US", {

            month: "long"

        });

};

/* ============================================
   SORT BY DATE
============================================ */

App.utils.sortNewest = function (list) {

    return [...list].sort((a, b) => {

        return new Date(b.date) - new Date(a.date);

    });

};

/* ============================================
   GROUP ARCHIVE
============================================ */

App.utils.groupArchive = function (conversations) {

    const archive = {};

    conversations.forEach(conversation => {

        const year =
            App.utils.getYear(conversation.date);

        const month =
            App.utils.getMonth(conversation.date);

        if (!archive[year]) {

            archive[year] = {};

        }

        if (!archive[year][month]) {

            archive[year][month] = [];

        }

        archive[year][month].push(conversation);

    });

    return archive;

};

/* ============================================
   SEARCH HIGHLIGHT
============================================ */

App.utils.highlight = function (
    text,
    keyword
) {

    if (!keyword) return text;

    const escaped =
        keyword.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

    const regex =
        new RegExp(
            `(${escaped})`,
            "gi"
        );

    return text.replace(
        regex,
        "<mark>$1</mark>"
    );

};

/* ============================================
   CREATE ID
============================================ */

App.utils.uuid = function () {

    return crypto.randomUUID();

};

/* ============================================
   SCROLL TO ELEMENT
============================================ */

App.utils.scrollTo = function (element) {

    if (!element) return;

    element.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

};

/* ============================================
   MODULE 1D
   EVENTS • PIPELINE • STATISTICS
============================================ */

/* ============================================
   UPDATE STATISTICS
============================================ */

App.updateStatistics = function () {

    const stats = {
        conversations: App.state.filtered.length,
        messages: 0,
        images: 0,
        years: new Set()
    };

    App.state.filtered.forEach(conversation => {

        stats.years.add(
            App.utils.getYear(conversation.date)
        );

        if (!conversation.messages) return;

        stats.messages += conversation.messages.length;

        conversation.messages.forEach(message => {

            if (message.image) {
                stats.images++;
            }

        });

    });

    App.state.statistics = {

        conversations: stats.conversations,

        messages: stats.messages,

        images: stats.images,

        years: stats.years.size

    };

    if (App.cache.stats.conversations)
        App.cache.stats.conversations.textContent =
            stats.conversations;

    if (App.cache.stats.messages)
        App.cache.stats.messages.textContent =
            stats.messages;

    if (App.cache.stats.images)
        App.cache.stats.images.textContent =
            stats.images;

    if (App.cache.stats.years)
        App.cache.stats.years.textContent =
            stats.years.size;

};

/* ============================================
   PLACEHOLDER RENDER
============================================ */

App.renderConversation = function (conversation) {

    const container =
        App.utils.create(
            "article",
            "fromm-conversation"
        );

    if (!conversation.messages?.length) {

        return container;

    }

    let currentGroup = null;

    let currentSender = null;

    conversation.messages.forEach(message => {

        if (message.sender !== currentSender) {

            currentSender = message.sender;

            currentGroup =
                App.renderSenderGroup(
                    message.sender,
                    message.time
                );

            container.appendChild(
                currentGroup
            );

        }

const bubble =
    App.renderMessage(message);

const messages =
    currentGroup.querySelector(
        ".group-messages"
    );

messages.appendChild(bubble);

App.updateBubbleClasses(messages);

    });

    return container;

};



/* ============================================
   RENDER YEAR
============================================ */

App.renderYear = function (year, months) {

    const yearCard =
        App.utils.create("div", "fromm-year");

    const header =
        App.utils.create("div", "fromm-year-header");

    header.innerHTML = `
        <h2>${year}</h2>
        <span>▼</span>
    `;

const content =
    App.utils.create(
        "div",
        "fromm-year-content"
    );

if (

    App.state.openedYears.has(year)

) {

    content.classList.add("open");

}

    Object.keys(months)
        .sort((a, b) => {

            return App.config.months.indexOf(b)
                - App.config.months.indexOf(a);

        })
        .forEach(month => {

            content.appendChild(

                App.renderMonth(

                    month,

                    months[month]

                )

            );

        });

header.addEventListener("click", () => {

    App.toggleSection(content);

    if (

        content.classList.contains("open")

    ) {

        App.state.openedYears.add(year);

    }

    else {

        App.state.openedYears.delete(year);

    }

});

    yearCard.appendChild(header);

    yearCard.appendChild(content);

    return yearCard;

};
/* ============================================
   RENDER MONTH
============================================ */

App.renderMonth = function (month, conversations) {

    const monthCard =
        App.utils.create("div", "fromm-month");

    const header =
        App.utils.create("div", "fromm-month-header");

    header.innerHTML = `
        <h3>${month}</h3>
        <span>${conversations.length} Conversation${conversations.length !== 1 ? "s" : ""}</span>
    `;

    const content =
        App.utils.create(
            "div",
            "fromm-month-content open"
        );

    let currentDate = "";

    App.utils
        .sortNewest(conversations)
        .forEach(conversation => {

            const formattedDate =
                App.utils.formatDate(
                    conversation.date
                );

            if (formattedDate !== currentDate) {

                currentDate = formattedDate;

                content.appendChild(

                    App.renderDateSeparator(
                        formattedDate
                    )

                );

            }

            content.appendChild(

                App.renderConversation(
                    conversation
                )

            );

        });

    header.addEventListener("click", () => {

        App.toggleSection(content);

    });

    monthCard.appendChild(header);

    monthCard.appendChild(content);

    return monthCard;

};
/* ============================================
   UPDATE BUBBLE CLASSES
============================================ */

App.updateBubbleClasses = function (container) {

    const bubbles =
        [...container.children];

    bubbles.forEach(bubble => {

        bubble.classList.remove(

            "first",

            "middle",

            "last",

            "single"

        );

    });

    if (bubbles.length === 1) {

        bubbles[0].classList.add("single");

        return;

    }

    bubbles.forEach((bubble, index) => {

        if (index === 0) {

            bubble.classList.add("first");

        }

        else if (

            index === bubbles.length - 1

        ) {

            bubble.classList.add("last");

        }

        else {

            bubble.classList.add("middle");

        }

    });

};
/* ============================================
   SENDER GROUP
============================================ */

App.renderSenderGroup = function (sender, time) {

    const group =
        App.utils.create(
            "section",
            "sender-group"
        );

const groupType =
    sender.toLowerCase() === "hayeon"
        ? "idol"
        : "fan";

group.classList.add(groupType);

const info =
    App.utils.create(
        "div",
        "sender-info"
    );

const avatar =
    App.utils.create(
        "div",
        "sender-avatar"
    );

const meta =
    App.utils.create(
        "div",
        "sender-meta"
    );

const header =
    App.utils.create(
        "div",
        "sender-header"
    );

const icon =
    groupType === "idol"
        ? "🦔"
        : "🫡";

header.innerHTML = `
    <span class="sender-name">
        ${icon} ${sender}
    </span>

    <span class="sender-time">
        ${time || ""}
    </span>
`;

meta.appendChild(header);

info.appendChild(avatar);

info.appendChild(meta);

const messages =
    App.utils.create(
        "div",
        "group-messages"
    );

group.appendChild(info);

group.appendChild(messages);

return group;

};
/* ============================================
   DATE SEPARATOR
============================================ */

App.renderDateSeparator = function (date) {

    const separator =
        App.utils.create(
            "div",
            "fromm-date-separator"
        );

    separator.innerHTML = `
        <span>${date}</span>
    `;

    return separator;

};

/* ============================================
   RENDER MESSAGE
============================================ */


App.renderMessage = function (message) {

    const bubble =
        App.utils.create("div", "message");

const messageType =
    message.type ||
    (
        message.sender?.toLowerCase() === "hayeon"
            ? "idol"
            : "fan"
    );

bubble.classList.add(messageType);

if (!App.state.groupedMessages) {

    bubble.appendChild(

        App.renderMessageHeader(message)

    );

}

    bubble.appendChild(

        App.renderMessageBody(message)

    );

    const media =

        App.renderMessageMedia(message);

    if (media) {

        bubble.appendChild(media);

    }

    return bubble;

};
/* ============================================
   MESSAGE HEADER
============================================ */

App.renderMessageHeader = function (message) {

    const header =
        App.utils.create(
            "div",
            "message-header"
        );

    const sender =
        App.utils.create(
            "span",
            "sender"
        );

    sender.textContent =
        message.sender || "";

    const time =
        App.utils.create(
            "span",
            "time"
        );

    time.textContent =
        message.time || "";

    header.appendChild(sender);
    header.appendChild(time);

    return header;

};
/* ============================================
   MESSAGE BODY
============================================ */

App.renderMessageBody = function (message) {

const wrapper =
    App.utils.create(
        "div",
        "message-content"
    );

    if (

        App.state.language === "both" ||

        App.state.language === "ko"

    ) {

        const korean =
            App.utils.create(
                "div",
                "message-ko"
            );

        korean.innerHTML =
            App.utils.highlight(

                App.utils.escapeHTML(

                    message.ko || ""

                ),

                App.state.search

            );

        wrapper.appendChild(korean);

    }

    if (

        App.state.language === "both" ||

        App.state.language === "en"

    ) {

        const english =
            App.utils.create(
                "div",
                "message-en"
            );

        english.innerHTML =
            App.utils.highlight(

                App.utils.escapeHTML(

                    message.en || ""

                ),

                App.state.search

            );

        wrapper.appendChild(english);

    }

    return wrapper;

};
/* ============================================
   MESSAGE MEDIA
============================================ */

App.renderMessageMedia = function (message) {

    const wrapper =
        App.utils.create(
            "div",
            "message-media"
        );

    let hasMedia = false;

    const image =
        App.renderImage(message);

    if (image) {

        wrapper.appendChild(image);

        hasMedia = true;

    }

    const video =
        App.renderVideo(message);

    if (video) {

        wrapper.appendChild(video);

        hasMedia = true;

    }

    return hasMedia
        ? wrapper
        : null;

};
/* ============================================
   IMAGE
============================================ */

App.renderImage = function (message) {

    if (!message.image) {

        return null;

    }

    const wrapper =
        App.utils.create(
            "div",
            "message-image"
        );

    const image =
        App.utils.create("img");

    image.loading = "lazy";

    image.src = message.image;

    image.alt = "Fromm Image";

    image.addEventListener("click", () => {

        App.openImage(message.image);

    });

    wrapper.appendChild(image);

    return wrapper;

};
/* ============================================
   VIDEO
============================================ */

App.renderVideo = function (message) {

    if (!message.video) {

        return null;

    }

    const wrapper =
        App.utils.create(
            "div",
            "message-video"
        );

    const video =
        App.utils.create("video");

    video.controls = true;

    video.preload = "metadata";

    video.src = message.video;

    wrapper.appendChild(video);

    return wrapper;

};

/* ============================================
   IMAGE LIGHTBOX
============================================ */

App.openImage = function (src) {

    let overlay = document.getElementById("fromm-lightbox");

    if (!overlay) {

        overlay = document.createElement("div");

        overlay.id = "fromm-lightbox";

        overlay.innerHTML = `
            <img>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener("click", () => {

            overlay.classList.remove("open");

        });

    }

    overlay.querySelector("img").src = src;

    overlay.classList.add("open");

};

/* ============================================
   TOGGLE SECTION
============================================ */

App.toggleSection = function (section) {

    if (!section) return;

    section.classList.toggle("open");

};
/* ============================================
   SEARCH
============================================ */

App.search = function (keyword = "") {

    App.state.search =
        keyword.trim().toLowerCase();

    if (!App.state.search) {

        App.state.filtered = [

            ...App.state.conversations

        ];

    }

    else {

        App.state.filtered =
            App.state.conversations.filter(conversation => {

                if (

                    conversation.date
                        .toLowerCase()
                        .includes(App.state.search)

                ) return true;

                return conversation.messages.some(message =>

                    (message.ko || "")
                        .toLowerCase()
                        .includes(App.state.search)

                    ||

                    (message.en || "")
                        .toLowerCase()
                        .includes(App.state.search)

                );

            });

    }

    App.render();

};

/* ============================================
   LANGUAGE
============================================ */

App.setLanguage = function (language) {

    App.state.language = language;

    App.cache.languageButtons
        .forEach(button => {

            button.classList.toggle(

                "active",

                button.dataset.lang === language

            );

        });

    App.render();

};

/* ============================================
   BIND EVENTS
============================================ */

App.bindEvents = function () {

    if (App.cache.search) {

        App.cache.search.addEventListener(

            "input",

            App.utils.debounce(event => {

                App.search(
                    event.target.value
                );

            },

            App.config.searchDelay)

        );

    }

    App.cache.languageButtons.forEach(button => {

        button.addEventListener(

            "click",

            () => {

                App.setLanguage(

                    button.dataset.lang

                );

            }

        );

    });

};

/* ============================================
   READY EVENT
============================================ */

App.events.on(

    "archiveLoaded",

    () => {

        App.state.archive =

            App.utils.groupArchive(

                App.state.conversations

            );

        App.render();

    }

);

/* ============================================
   FINAL INITIALIZATION
============================================ */

App.events.on(

    "ready",

    () => {

        App.bindEvents();

        console.log(

            "✅ Fromm Archive v2 initialized."

        );

    }

);