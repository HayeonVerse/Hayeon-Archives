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

        indexFile: "archive.json",

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

currentVoice: null,

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

App.loadConversation = async function (folder) {

    return await App.fetchJSON(

        `${App.config.dataRoot}${folder}/info.json`

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

        index.map(folder =>

            App.loadConversation(folder)

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
   RESOLVE MEDIA PATH
============================================ */

App.utils.resolveMediaPath = function (message, key) {

    if (!message?.[key]) {

        return "";

    }

    const [year, month, day] =
        message._conversation.date.split("-");

    return `${App.config.dataRoot}${year}/${month}/${day}/${message[key]}`;

};

App.utils.countMedia = function (conversation) {

    let images = 0;
    let videos = 0;
    let voices = 0;

    conversation.messages.forEach(message => {

        images += App.utils.getMediaList(
            message,
            "image",
            "images"
        ).length;

        videos += App.utils.getMediaList(
            message,
            "video",
            "videos"
        ).length;

        voices += App.utils.getMediaList(
            message,
            "voice",
            "voices"
        ).length;

    });

    return {

        images,
        videos,
        voices

    };

};

/* ============================================
   NORMALIZE MEDIA
============================================ */

App.utils.getMediaList = function (message, singular, plural) {

    if (Array.isArray(message[plural])) {

        return message[plural];

    }

    if (message[singular]) {

        return [message[singular]];

    }

    return [];

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

    stats.images += App.utils.getMediaList(
        message,
        "image",
        "images"
    ).length;

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
   CONVERSATION CARD
============================================ */

App.renderConversationCard = function (conversation) {

    const card =
        App.utils.create(
            "section",
            "fromm-conversation-card"
        );
card.dataset.date =
    conversation.date;
    const header =
        App.utils.create(
            "div",
            "fromm-conversation-header"
        );
const arrow =
    App.utils.create(
        "span",
        "archive-arrow"
    );

arrow.textContent = "❯";
    const body =
        App.utils.create(
            "div",
            "fromm-conversation-body"
        );

    const messageCount =
        
    conversation.messages
            ? conversation.messages.length
            : 0;
const media =
    App.utils.countMedia(conversation);
header.innerHTML = `
    <div class="conversation-info">

        <strong>
            ${App.utils.formatDate(conversation.date)}
        </strong>

        <small>
            💬 ${messageCount} Message${messageCount !== 1 ? "s" : ""}
        </small>

        <div class="conversation-media">

            ${media.images ? `📷 ${media.images}` : ""}

            ${media.videos ? `🎥 ${media.videos}` : ""}

            ${media.voices ? `🎤 ${media.voices}` : ""}

        </div>

    </div>
`;

header.appendChild(arrow);

    // Temporary:
    // We still render immediately.
let rendered = false;

header.addEventListener("click", () => {

    const alreadyOpen =
        body.classList.contains("open");

    // Close every other conversation
    document.querySelectorAll(".fromm-conversation-body.open")
        .forEach(section => {

            if (section !== body) {

section.classList.remove("open");

setTimeout(() => {

    section.innerHTML = "";

}, App.config.animationSpeed);

                const card =
                    section.closest(".fromm-conversation-card");

                if (card) {

                    const otherArrow =
                        card.querySelector(".archive-arrow");

                    if (otherArrow) {

                        otherArrow.classList.remove("open");

                    }

                }

            }

        });

if (alreadyOpen) {

    body.classList.remove("open");

    arrow.classList.remove("open");

    setTimeout(() => {

        body.innerHTML = "";

        rendered = false;

    }, App.config.animationSpeed);

    return;

}

    if (!rendered) {

        body.appendChild(
            App.renderConversationBody(conversation)
        );

        rendered = true;

    }

    body.classList.add("open");
    setTimeout(() => {

    card.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}, 50);
body.scrollTop = 0;
requestAnimationFrame(() => {

    body.scrollIntoView({

        behavior: "smooth",

        block: "nearest"

    });

});
    arrow.classList.add("open");

});

    card.appendChild(header);
    card.appendChild(body);

    return card;

};
/* ============================================
   PLACEHOLDER RENDER
============================================ */

App.renderConversation = function (conversation) {

    return App.renderConversationBody(conversation);

};
App.renderConversationBody = function (conversation) {

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
message._conversation = conversation;
if (message.type !== currentSender) {

    currentSender = message.type;

    currentGroup =
        App.renderSenderGroup(
            message.type
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

App.renderSidebar = function () {

    const sidebar =
        document.getElementById("fromm-sidebar");

    if (!sidebar) return;

    App.utils.clear(sidebar);

    const fragment =
        App.utils.fragment();

    // -----------------------
    // Title
    // -----------------------

    const title =
        App.utils.create("h3");

    title.textContent =
        "📅 Archive Timeline";

    fragment.appendChild(title);

    // -----------------------
    // Timeline
    // -----------------------

    const archive =
        App.state.archive;

    Object.keys(archive)
        .sort((a, b) => b.localeCompare(a))
        .forEach(year => {

fragment.appendChild(

    App.renderSidebarYear(year)

);

Object.keys(archive[year])
    .sort((a, b) => {

        return App.config.months.indexOf(b)
            - App.config.months.indexOf(a);

    })
    .forEach(month => {

        fragment.appendChild(

            App.renderSidebarMonth(

                month,

                archive[year][month]

            )

        );

    });

        });

    sidebar.appendChild(fragment);

};

/* ============================================
   SIDEBAR DATE
============================================ */

App.renderSidebarDate = function (conversation) {

    const item =
        App.utils.create(
            "div",
            "timeline-date"
        );

item.textContent =
    App.utils.formatDate(
        conversation.date
    );

item.dataset.date =
    conversation.date;

item.addEventListener("click", () => {

    App.navigateToConversation(

        conversation.date

    );

});

return item;

};
/* ============================================
   SIDEBAR YEAR
============================================ */

App.renderSidebarYear = function (year) {

    const item =
        App.utils.create(
            "div",
            "timeline-year"
        );

    item.textContent = year;

    item.dataset.year = year;

    item.addEventListener("click", () => {

        App.navigateToYear(year);

    });

    return item;

};
/* ============================================
   OPEN CONVERSATION CARD
============================================ */

App.openConversationCard = function (card) {

    if (!card) return;

    const header =
        card.querySelector(
            ".fromm-conversation-header"
        );

    if (!header) return;

    header.click();

    card.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

};
/* ============================================
   NAVIGATE CONVERSATION
============================================ */

App.navigateToConversation = function (date) {

    const year =
        App.utils.getYear(date);

    const month =
        App.utils.getMonth(date);

    App.navigateToMonth(

        year,

        month

    );

    setTimeout(() => {

        const card = document.querySelector(

            `.fromm-conversation-card[data-date="${date}"]`

        );

        if (!card) return;

App.openConversationCard(card);

    }, App.config.animationSpeed + 50);

};
/* ============================================
   SIDEBAR MONTH
============================================ */

App.renderSidebarMonth = function (
    month,
    conversations
) {

    const wrapper =
        App.utils.fragment();

    const monthItem =
        App.utils.create(
            "div",
            "timeline-month"
        );

    monthItem.textContent = month;

    wrapper.appendChild(monthItem);

    App.utils
        .sortNewest(conversations)
        .forEach(conversation => {

            wrapper.appendChild(

                App.renderSidebarDate(
                    conversation
                )

            );

        });

    return wrapper;

};
/* ============================================
   RENDER YEAR
============================================ */

App.renderYear = function (year, months) {

    const yearCard =
        App.utils.create("div", "fromm-year");
yearCard.dataset.year = year;
    const header =
        App.utils.create("div", "fromm-year-header");

header.innerHTML = `
    <h2>${year}</h2>
`;

const arrow =
    App.utils.create(
        "span",
        "archive-arrow"
    );

arrow.textContent = "❯";

header.appendChild(arrow);

const content =
    App.utils.create(
        "div",
        "fromm-year-content"
    );

if (

    App.state.openedYears.has(year)

) {

    content.classList.add("open");
arrow.classList.add("open");
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

    const alreadyOpen =
        content.classList.contains("open");

    // Close every year
    document.querySelectorAll(".fromm-year-content.open")
        .forEach(section => {

            section.classList.remove("open");

        });

    document.querySelectorAll(".fromm-year-header .archive-arrow.open")
        .forEach(arrow => {

            arrow.classList.remove("open");

        });

    App.state.openedYears.clear();

    // Reopen this one
    if (!alreadyOpen) {

        content.classList.add("open");

        arrow.classList.add("open");

        App.state.openedYears.add(year);

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
monthCard.dataset.year =
    App.utils.getYear(conversations[0].date);

monthCard.dataset.month =
    month;
    const header =
        App.utils.create("div", "fromm-month-header");

const arrow =
    App.utils.create(
        "span",
        "archive-arrow"
    );

arrow.textContent = "❯";

const left =
    App.utils.create("div");

left.style.display = "flex";
left.style.alignItems = "center";
left.style.gap = "12px";

const title =
    document.createElement("h3");

title.textContent = month;

left.appendChild(arrow);
left.appendChild(title);

const count =
    document.createElement("span");

count.textContent =
    `${conversations.length} Conversation${conversations.length !== 1 ? "s" : ""}`;

header.appendChild(left);
header.appendChild(count);

const content =
    App.utils.create(
        "div",
        "fromm-month-content"
    );
const monthKey = `${App.utils.getYear(conversations[0].date)}-${month}`;

if (App.state.openedMonths.has(monthKey)) {

    content.classList.add("open");

    arrow.classList.add("open");

}
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

    App.renderConversationCard(
        conversation
    )

);

        });

header.addEventListener("click", () => {

    const alreadyOpen =
        content.classList.contains("open");

    // Close every open month
    document.querySelectorAll(".fromm-month-content.open")
        .forEach(section => {

            section.classList.remove("open");

        });

    document.querySelectorAll(".fromm-month-header .archive-arrow.open")
        .forEach(arrow => {

            arrow.classList.remove("open");

        });

    App.state.openedMonths.clear();

    // Reopen this one
    if (!alreadyOpen) {

        content.classList.add("open");

        arrow.classList.add("open");

        App.state.openedMonths.add(monthKey);

    }

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

App.renderSenderGroup = function (type) {

    const group =
        App.utils.create(
            "section",
            "sender-group"
        );

const groupType =
    type === "hayeon"
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

const name =
    groupType === "idol"
        ? "Hayeon"
        : "Fan";

header.innerHTML = `
    <span class="sender-name">
        ${icon} ${name}
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
    message.type === "hayeon"
        ? "idol"
        : "fan";

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
   CREATE MEDIA WRAPPER
============================================ */

App.createMediaWrapper = function (className) {

    return App.utils.create(
        "div",
        className
    );

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

const renderers = [

    App.renderImage,
    App.renderVideo,
    App.renderVoice

];

renderers.forEach(renderer => {

    const media = renderer(message);

    if (!media) return;

    wrapper.appendChild(media);

    hasMedia = true;

});
    return hasMedia
        ? wrapper
        : null;

};
/* ============================================
   IMAGE
============================================ */

App.renderImage = function (message) {

    const images =
        App.utils.getMediaList(
            message,
            "image",
            "images"
        );

    if (!images.length) {

        return null;

    }

    const wrapper =
        App.createMediaWrapper(
            "message-image"
        );

    images.forEach(file => {

        const image =
            App.utils.create("img");

        image.loading = "lazy";

        image.src =
            App.utils.resolveMediaPath(
                {
                    ...message,
                    image: file
                },
                "image"
            );

        image.alt = "Fromm Image";

        image.addEventListener("click", () => {

            App.openImage(image.src);

        });

        wrapper.appendChild(image);

    });

    return wrapper;

};
/* ============================================
   VIDEO
============================================ */

App.renderVideo = function (message) {

    const videos =
        App.utils.getMediaList(
            message,
            "video",
            "videos"
        );

    if (!videos.length) {

        return null;

    }

    const wrapper =
        App.createMediaWrapper(
            "message-video"
        );

    videos.forEach(file => {

        const video =
            App.utils.create("video");

        video.controls = true;

        video.preload = "metadata";

        video.src =
            App.utils.resolveMediaPath(
                {
                    ...message,
                    video: file
                },
                "video"
            );

        wrapper.appendChild(video);

    });

    return wrapper;

};

/* ============================================
   CREATE VOICE PLAYER
============================================ */

App.createVoicePlayer = function () {

    const wrapper =
        App.createMediaWrapper(
            "message-voice"
        );

    const play =
        App.utils.create(
            "button",
            "voice-play"
        );

    play.type = "button";
    play.textContent = "▶";

    const progress =
        App.utils.create(
            "input",
            "voice-progress"
        );

    progress.type = "range";
    progress.min = 0;
    progress.max = 100;
    progress.value = 0;

    const time =
        App.utils.create(
            "span",
            "voice-time"
        );

    time.textContent = "00:00";

    const audio =
        App.utils.create("audio");

wrapper.append(
    play,
    progress,
    time,
    audio
);

play.addEventListener("click", () => {

    if (audio.paused) {

        if (

            App.state.currentVoice &&

            App.state.currentVoice !== audio

        ) {

            App.state.currentVoice.pause();

        }

audio.play()
    .then(() => {
        App.state.currentVoice = audio;
    })
    .catch(error => {
        console.error("Voice playback failed:", error);
    });

    }

    else {

        audio.pause();

    }

});

audio.addEventListener("play", () => {

    play.textContent = "⏸";

});

audio.addEventListener("pause", () => {

    play.textContent = "▶";

    if (App.state.currentVoice === audio) {

        App.state.currentVoice = null;

    }

});
audio.addEventListener("timeupdate", () => {

    if (!audio.duration) return;

    progress.value =
        (audio.currentTime / audio.duration) * 100;

    const minutes =
        Math.floor(audio.currentTime / 60);

    const seconds =
        Math.floor(audio.currentTime % 60);

    time.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

});
progress.addEventListener("input", () => {

    if (!audio.duration) return;

    audio.currentTime =
        (progress.value / 100) * audio.duration;

});

audio.addEventListener("ended", () => {

    play.textContent = "▶";

    progress.value = 0;

    time.textContent = "00:00";
    if (App.state.currentVoice === audio) {

    App.state.currentVoice = null;

}

});
return {
    wrapper,
    play,
    progress,
    time,
    audio
};

};
/* ============================================
   VOICE
============================================ */

App.renderVoice = function (message) {

    const voices =
        App.utils.getMediaList(
            message,
            "voice",
            "voices"
        );

    if (!voices.length) {

        return null;

    }

    const wrapper =
        App.createMediaWrapper(
            "message-voice-group"
        );

    voices.forEach(file => {

        const player =
            App.createVoicePlayer();

        player.audio.src =
            App.utils.resolveMediaPath(
                {
                    ...message,
                    voice: file
                },
                "voice"
            );

        wrapper.appendChild(
            player.wrapper
        );

    });

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
   MASTER RENDER
============================================ */

App.render = function () {

    if (!App.cache.container) return;

    App.utils.clear(App.cache.container);

    const fragment = App.utils.fragment();

    const archive = App.utils.groupArchive(
        App.state.filtered
    );

    const years = Object.keys(archive)
        .sort((a, b) => b.localeCompare(a));

    years.forEach(year => {

        fragment.appendChild(

            App.renderYear(

                year,

                archive[year]

            )

        );

    });

App.cache.container.appendChild(fragment);

App.renderSidebar();

App.updateStatistics();

};
/* ============================================
   NAVIGATE YEAR
============================================ */

App.navigateToYear = function (year) {

    const header = [...document.querySelectorAll(".fromm-year-header")]

        .find(header =>

            header.querySelector("h2")?.textContent === year

        );

    if (!header) return;

    header.click();

    header.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

};
/* ============================================
   NAVIGATE MONTH
============================================ */

App.navigateToMonth = function (year, month) {

    // Ensure year is open first
    App.navigateToYear(year);

const monthCard = document.querySelector(

    `.fromm-month[data-year="${year}"][data-month="${month}"]`

);

if (!monthCard) return;

const header =
    monthCard.querySelector(".fromm-month-header");

    if (!header) return;

    header.click();

    header.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

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