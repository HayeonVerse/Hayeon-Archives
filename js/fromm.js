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

    selectedConversation: null,

expandedYears: new Set(),

expandedMonths: new Set(),

    search: "",

    loading: false,

    currentVoice: null,

    conversations: [],

    filtered: [],

    statistics: {

        conversations: 0,

        messages: 0,

        images: 0,

        videos: 0,

        voices: 0,

        years: 0

    }

},
/* ============================================
   DOM CACHE
============================================ */

    cache: {

        container: null,

sidebar: null,
viewer: null,

        search: null,

        languageButtons: [],

        stats: {

            conversations: null,

            messages: null,

            images: null,

            videos: null,

            voices: null,

            years: null

        }

    },

/* ============================================
   UTILITIES
============================================ */

    utils: {},

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

App.cache.sidebar =
    $("#fromm-sidebar");

App.cache.viewer =
    $(".fromm-viewer");

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

App.cache.stats.videos =
    $("#video-count");

App.cache.stats.voices =
    $("#voice-count");

    App.cache.stats.years =
        $("#year-count");

}

/* ============================================
   BASIC HELPERS
============================================ */

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

App.buildTimeline = function () {

    const sidebar = document.getElementById("timeline-list");

    if (!sidebar) return;

    sidebar.innerHTML = "";

    const archive = App.utils.groupArchive(App.state.filtered);

    document.getElementById("timeline-count").textContent =
        App.state.filtered.length;

    Object.keys(archive)
        .sort((a, b) => b.localeCompare(a))
        .forEach(year => {

            const yearDiv = document.createElement("div");
            yearDiv.className = "timeline-year";

            const yearTitle = document.createElement("div");
            yearTitle.className = "timeline-year-title";

            yearTitle.innerHTML = `
                <span class="timeline-arrow">
                    ${App.state.expandedYears.has(year) ? "▼" : "▶"}
                </span>
                ${year}
            `;

yearTitle.onclick = () => {

    if (App.state.expandedYears.has(year)) {

        App.state.expandedYears.delete(year);

    } else {

        App.state.expandedYears.add(year);

    }

    App.buildTimeline();

};

            yearDiv.appendChild(yearTitle);

if (!App.state.expandedYears.has(year)) {

    sidebar.appendChild(yearDiv);

    return;

}

            Object.keys(archive[year]).forEach(month => {

                const monthKey = `${year}-${month}`;

                const monthDiv = document.createElement("div");
                monthDiv.className = "timeline-month";

                const monthTitle = document.createElement("div");
                monthTitle.className = "timeline-month-title";

                monthTitle.innerHTML = `
                    <span class="timeline-arrow">
                        ${App.state.expandedMonths.has(monthKey) ? "▼" : "▶"}
                    </span>
                    ${month}
                `;

                monthTitle.onclick = (e) => {

                    e.stopPropagation();

if (App.state.expandedMonths.has(monthKey)) {

    App.state.expandedMonths.delete(monthKey);

} else {

    App.state.expandedMonths.add(monthKey);

}

                    App.buildTimeline();

                };

                monthDiv.appendChild(monthTitle);

                if (App.state.expandedMonths.has(monthKey)) {

                    archive[year][month].forEach(conv => {

                        const btn = document.createElement("button");

                        btn.className = "timeline-date";

                        btn.textContent =
                            App.utils.formatDate(conv.date);

                        if (
                            App.state.selectedConversation &&
                            App.state.selectedConversation.date === conv.date
                        ) {

                            btn.classList.add("active");

                        }

                        btn.onclick = () => {

                            App.showConversation(conv);

                        };

                        monthDiv.appendChild(btn);

                    });

                }

                yearDiv.appendChild(monthDiv);

            });

            sidebar.appendChild(yearDiv);

        });

};

App.getConversationIndex = function (conversation) {

    return App.state.filtered.findIndex(
        c => c.date === conversation.date
    );

};

App.showConversation = function (conversation) {

    App.state.selectedConversation = conversation;

App.saveLastConversation(conversation);

document
    .querySelectorAll(".timeline-date")
    .forEach(button => {

        button.classList.toggle(

            "active",

            button.textContent ===
            App.utils.formatDate(conversation.date)

        );

    });

    const container = App.cache.container;

const viewer = App.cache.viewer;

if (viewer) {

    viewer.scrollTop = 0;

}
    
    App.utils.clear(container);

    const media = App.utils.countMedia(conversation);

const index =
    App.getConversationIndex(conversation);

const previous =
    index > 0
        ? App.state.filtered[index - 1]
        : null;

const next =
    index < App.state.filtered.length - 1
        ? App.state.filtered[index + 1]
        : null;

    const header = App.utils.create(
        "div",
        "conversation-header"
    );

    const title = App.utils.create("h2");

    title.textContent =
        App.utils.formatDate(conversation.date);

    const info = App.utils.create(
        "p",
        "viewer-info"
    );

    const parts = [];

    parts.push(`${conversation.messages.length} Messages`);

    if (media.images)
        parts.push(`📷 ${media.images}`);

    if (media.videos)
        parts.push(`🎥 ${media.videos}`);

    if (media.voices)
        parts.push(`🎤 ${media.voices}`);

    info.textContent = parts.join(" • ");

    const nav =
    App.utils.create(
        "div",
        "conversation-nav"
    );

const prevBtn =
    App.utils.create(
        "button",
        "nav-btn"
    );

prevBtn.textContent = "← Previous";

prevBtn.disabled = !previous;

prevBtn.onclick = () => {

    if (previous)
        App.showConversation(previous);

};

const nextBtn =
    App.utils.create(
        "button",
        "nav-btn"
    );

nextBtn.textContent = "Next →";

nextBtn.disabled = !next;

nextBtn.onclick = () => {

    if (next)
        App.showConversation(next);

};

nav.append(prevBtn, nextBtn);

header.append(title, info, nav);

    container.appendChild(header);

    container.appendChild(

        App.renderConversationBody(conversation)

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

App.saveLastConversation = function (conversation) {

    if (!conversation) return;

    localStorage.setItem(
        "fromm-last-conversation",
        conversation.date
    );

};

App.loadLastConversation = function () {

    return localStorage.getItem(
        "fromm-last-conversation"
    );

};

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
        videos: 0,
        voices: 0,
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

    stats.videos += App.utils.getMediaList(
        message,
        "video",
        "videos"
    ).length;

    stats.voices += App.utils.getMediaList(
        message,
        "voice",
        "voices"
    ).length;

});

    });

App.state.statistics = {

    conversations: stats.conversations,

    messages: stats.messages,

    images: stats.images,

    videos: stats.videos,

    voices: stats.voices,

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

if (App.cache.stats.videos)
    App.cache.stats.videos.textContent =
        stats.videos;

if (App.cache.stats.voices)
    App.cache.stats.voices.textContent =
        stats.voices;

if (App.cache.stats.years)
    App.cache.stats.years.textContent =
        stats.years.size;

};

/* ============================================
   PLACEHOLDER RENDER
============================================ */

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
   MASTER RENDER
============================================ */

App.render = function () {

    App.updateStatistics();

    App.buildTimeline();

const lastDate = App.loadLastConversation();

if (!App.state.selectedConversation && lastDate) {

    const remembered = App.state.filtered.find(

        c => c.date === lastDate

    );

    if (remembered) {

        App.state.selectedConversation = remembered;

    }

}

if (App.state.selectedConversation) {

    App.showConversation(
        App.state.selectedConversation
    );

} else {

    App.cache.container.innerHTML = `
        <div class="viewer-placeholder">

            <h2>Select a conversation</h2>

            <p>
                Choose a conversation from the timeline.
            </p>

        </div>
    `;

}

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

    if (
    App.state.selectedConversation &&
    !App.state.filtered.some(
        c => c.date === App.state.selectedConversation.date
    )
) {
    App.state.selectedConversation = null;
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
   KEYBOARD SHORTCUTS
============================================ */

App.bindKeyboard = function () {

    document.addEventListener("keydown", event => {

        const tag = document.activeElement.tagName;

        const typing =
            tag === "INPUT" ||
            tag === "TEXTAREA";

        if (typing && event.key !== "Escape") {

            return;

        }

        switch (event.key) {

            case "/":

                event.preventDefault();

                App.cache.search.focus();

                break;

            case "Escape":

                if (document.activeElement === App.cache.search) {

                    App.cache.search.value = "";

                    App.search("");

                    App.cache.search.blur();

                }

                break;

            case "ArrowUp":

                event.preventDefault();

                App.navigateConversation(-1);

                break;

            case "ArrowDown":

                event.preventDefault();

                App.navigateConversation(1);

                break;

            case "Home":

                event.preventDefault();

                App.openFirstConversation();

                break;

            case "End":

                event.preventDefault();

                App.openLastConversation();

                break;

        }

    });

};

App.navigateConversation = function (direction) {

    if (!App.state.selectedConversation) return;

    const index =
        App.getConversationIndex(
            App.state.selectedConversation
        );

    const next =
        index + direction;

    if (
        next < 0 ||
        next >= App.state.filtered.length
    ) {
        return;
    }

    App.showConversation(
        App.state.filtered[next]
    );

};

App.openFirstConversation = function () {

    if (!App.state.filtered.length) return;

    App.showConversation(
        App.state.filtered[0]
    );

};

App.openLastConversation = function () {

    if (!App.state.filtered.length) return;

    App.showConversation(
        App.state.filtered[
            App.state.filtered.length - 1
        ]
    );

};

/* ============================================
   READY EVENT
============================================ */

App.events.on(

    "archiveLoaded",

    () => {


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

App.bindKeyboard();

console.log(
    "✅ Frommm Archive v2 initialized."
);

    }

);