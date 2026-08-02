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

searchMatches: {},

searchIndex: [],

searchSuggestions: [],

selectedSuggestion: -1,

previewYears: null,
previewMonths: null,

expandedYears: new Set(),

expandedMonths: new Set(),

search: "",

    loading: false,

    currentVoice: null,

    archive: [],

    conversations: [],

    conversationCache: new Map(),

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

    searchResults: null,

    searchClear: null,

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

App.initBackToTop = function () {

    const btn = document.createElement("button");

    btn.className = "back-to-top";

    btn.innerHTML = "↑";

    document.body.appendChild(btn);

btn.onclick = () => {

    if (window.matchMedia("(max-width:768px)").matches) {

document.querySelector(".conversation-header")
    ?.scrollIntoView({

        behavior:"smooth",

        block:"start"

    });

    } else {

const header = App.cache.viewer.querySelector(".conversation-header");

if (App.cache.viewer) {
    App.cache.viewer.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

    }

};

const update = () => {

    let scrollTop;

    if (window.matchMedia("(max-width:768px)").matches) {

        scrollTop = window.scrollY;

    } else {

        scrollTop = App.cache.viewer.scrollTop;

    }

    btn.classList.toggle(
        "show",
        scrollTop > 350
    );

};

    App.cache.viewer.addEventListener(

        "scroll",

        update

    );

    window.addEventListener(

        "scroll",

        update

    );

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

App.cache.searchClear =
    $("#search-clear");

App.cache.searchResults =
    $("#search-results");

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

document.addEventListener("click", (event) => {

    const search = App.cache.search;
    const results = App.cache.searchResults;

    if (
        !search.contains(event.target) &&
        !results.contains(event.target)
    ) {

results.classList.add("hidden");

App.state.selectedSuggestion = -1;

App.restoreTimelinePreview();

    }

});

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

App.fetchJSON = async function (url, retries = 3) {

    for (let attempt = 1; attempt <= retries; attempt++) {

        try {

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status} ${response.statusText}`
                );
            }

            return await response.json();

        } catch (error) {

            console.warn(
                `Fetch failed (${attempt}/${retries}) for ${url}`,
                error
            );

            if (attempt === retries) {
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

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

App.getConversation = async function (folder) {

    if (App.state.conversationCache.has(folder)) {

        return App.state.conversationCache.get(folder);

    }

    const conversation = await App.loadConversation(folder);

    App.state.conversationCache.set(folder, conversation);

    return conversation;

};

/* ============================================
   LOAD EVERYTHING
============================================ */

App.loadArchive = async function () {

    try {

        App.setLoading(true);

        const index =
            await App.loadIndex();

App.state.archive = index;

const loading = document.getElementById("timeline-list");

loading.innerHTML = `
    <div class="timeline-loading">
        Loading conversations...
    </div>
`;

const conversations =
    await App.fetchJSON(
        `${App.config.dataRoot}archive-data.json`
    );

App.state.conversations = conversations;

App.state.filtered = [...conversations];

App.buildSearchIndex();

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

    App.state.expandedYears.clear();

} else {

    App.state.expandedYears = new Set([year]);

    App.state.expandedMonths.clear();

}

App.buildTimeline();
App.saveUIState();

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

    App.state.expandedMonths.clear();

} else {

    App.state.expandedMonths = new Set([monthKey]);

}

App.buildTimeline();
App.saveUIState();

                };

                monthDiv.appendChild(monthTitle);

                if (App.state.expandedMonths.has(monthKey)) {

                    archive[year][month].forEach(conv => {

const btn = document.createElement("button");

btn.className = "timeline-date";

const date =
    App.utils.create(
        "div",
        "timeline-date-title"
    );

date.textContent =
    App.utils.formatDate(conv.date);

btn.appendChild(date);

const count =
    App.state.searchMatches[
        conv.date
    ];

if (count) {

    const badge =
        App.utils.create(
            "div",
            "timeline-match-count"
        );

    badge.textContent =
        `${count} match${count > 1 ? "es" : ""}`;

    btn.appendChild(badge);

}

                        if (
                            App.state.selectedConversation &&
                            App.state.selectedConversation.date === conv.date
                        ) {

                            btn.classList.add("active");

                        }

btn.onclick = () => {

    App.showConversation(conv);

    if (window.matchMedia("(max-width:768px)").matches){

        document.getElementById("fromm-container")
            ?.scrollIntoView({

                behavior:"instant",

                block:"start"

            });

    }

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


App.cache.searchResults.classList.add("hidden");
App.state.selectedSuggestion = -1;

const url = new URL(window.location);

url.searchParams.set("date", conversation.date);

history.replaceState({}, "", url);

const year =
    App.utils.getYear(conversation.date);

const month =
    `${year}-${App.utils.getMonth(conversation.date)}`;

App.state.expandedYears =
    new Set([year]);

App.state.expandedMonths =
    new Set([month]);

App.buildTimeline();

App.saveUIState();

App.saveLastConversation(conversation);

document
    .querySelectorAll(".timeline-date")
    .forEach(button => {

button.classList.remove("active")

        button.classList.toggle(

            "active",

button.querySelector(
    ".timeline-date-title"
)?.textContent ===
App.utils.formatDate(
    conversation.date
)


            
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
    index < App.state.filtered.length - 1
        ? App.state.filtered[index + 1]
        : null;

const next =
    index > 0
        ? App.state.filtered[index - 1]
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

const shareBtn =
    App.utils.create(
        "button",
        "nav-btn share-btn"
    );

shareBtn.textContent = "📋 Copy Link";

shareBtn.onclick = async () => {

    const url = window.location.href;

    try {

        await navigator.clipboard.writeText(url);

        shareBtn.textContent = "✅ Copied!";

        setTimeout(() => {

            shareBtn.textContent = "📋 Copy Link";

        }, 2000);

    } catch {

        prompt("Copy this link:", url);

    }

};

const closeBtn =
    App.utils.create(
        "button",
        "nav-btn"
    );

closeBtn.textContent = "✕ Close";

closeBtn.onclick = () => {

    App.state.selectedConversation = null;

    localStorage.removeItem("fromm-last-conversation");

    App.saveUIState();

    const url = new URL(window.location);

    url.searchParams.delete("date");

    history.replaceState({}, "", url);

    App.render();

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

nav.append(
    prevBtn,
    shareBtn,
    closeBtn,
    nextBtn
);

header.append(title, info);

if (window.innerWidth <= 768) {

    const original =
        document.querySelector(
            ".language-filter"
        );

    if (original) {

        const mobile =
            original.cloneNode(true);

        mobile.classList.remove(
            "language-filter"
        );

        mobile.classList.add(
            "mobile-language-filter"
        );

        mobile.querySelectorAll(".lang-btn")
            .forEach(btn => {

                if (
                    btn.dataset.lang ===
                    App.state.language
                ) {

                    btn.classList.add(
                        "active"
                    );

                } else {

                    btn.classList.remove(
                        "active"
                    );

                }

                btn.onclick = () => {

                    App.setLanguage(
                        btn.dataset.lang
                    );

                };

            });

        header.appendChild(mobile);

    }

}

header.appendChild(nav);

container.appendChild(header);


container.appendChild(

    App.renderConversationBody(conversation)

);

const bottomNav = App.utils.create(
    "div",
    "conversation-nav conversation-nav-bottom"
);

const bottomPrev = prevBtn.cloneNode(true);

const bottomNext = nextBtn.cloneNode(true);
bottomPrev.onclick = () => {
    if (!previous) return;

    App.showConversation(previous);

    requestAnimationFrame(() => {
        document.querySelector(".conversation-header")
            ?.scrollIntoView({
                behavior: "instant",
                block: "start"
            });
    });
};

bottomNext.onclick = () => {
    if (!next) return;

    App.showConversation(next);

    requestAnimationFrame(() => {
        document.querySelector(".conversation-header")
            ?.scrollIntoView({
                behavior: "instant",
                block: "start"
            });
    });
};

bottomNav.append(bottomPrev, bottomNext);

container.appendChild(bottomNav);
    
};



/* ============================================
   BUILD SEARCH INDEX
============================================ */

App.buildSearchIndex = function () {

    App.state.searchIndex = App.state.conversations.map(conversation => {

        const date = new Date(conversation.date);

        const keywords = new Set();

        // Date formats
        keywords.add(conversation.date);

        keywords.add(String(date.getFullYear()));

        keywords.add(
            date.toLocaleString("en-US", {
                month: "long"
            }).toLowerCase()
        );

        keywords.add(
            date.toLocaleString("en-US", {
                month: "short"
            }).toLowerCase()
        );

        keywords.add(String(date.getMonth() + 1));
        keywords.add(String(date.getMonth() + 1).padStart(2, "0"));

        keywords.add(String(date.getDate()));
        keywords.add(String(date.getDate()).padStart(2, "0"));

        keywords.add(
            App.utils
                .formatDate(conversation.date)
                .toLowerCase()
        );

        // Message contents
if (conversation.messages) {

    conversation.messages.forEach(message => {

        if (message.ko)
            keywords.add(message.ko.toLowerCase());

        if (message.en)
            keywords.add(message.en.toLowerCase());

        if (message.image || message.images?.length)
            keywords.add("photo");

        if (message.video || message.videos?.length)
            keywords.add("video");

        if (message.voice || message.voices?.length)
            keywords.add("voice");

    });

}

        return {

            conversation,

            keywords: [...keywords]

        };

    });

};

/* ============================================
   INITIALIZE
============================================ */

App.init = async function () {

    if (

        App.state.initialized

    ) return;

cacheDOM();

App.initBackToTop();

await App.loadArchive();

const params = new URLSearchParams(window.location.search);

const requestedDate = params.get("date");

if (requestedDate) {

    const conversation =
        App.state.conversations.find(
            c => c.date === requestedDate
        );

    if (conversation) {

        App.state.selectedConversation = conversation;

    }

}

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

App.saveUIState = function () {

    localStorage.setItem(

        "fromm-ui",

        JSON.stringify({

            conversation:
                App.state.selectedConversation
                    ?.date ?? null,

            years:
                [...App.state.expandedYears],

            months:
                [...App.state.expandedMonths]

        })

    );

};

App.loadUIState = function () {

    try{

        return JSON.parse(

            localStorage.getItem("fromm-ui")

        ) || {};

    }

    catch{

        return {};

    }

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

    const archive = App.state.archive;

    const stats = {

        conversations: archive.length,

        messages: archive.reduce((sum, item) => sum + (item.messages || 0), 0),

        images: archive.reduce((sum, item) => sum + (item.images || 0), 0),

        videos: archive.reduce((sum, item) => sum + (item.videos || 0), 0),

        voices: archive.reduce((sum, item) => sum + (item.voices || 0), 0),

        years: new Set(
            archive.map(item => item.date.slice(0, 4))
        ).size

    };

    App.state.statistics = stats;

    if (App.cache.stats.conversations)
        App.cache.stats.conversations.textContent = stats.conversations;

    if (App.cache.stats.messages)
        App.cache.stats.messages.textContent = stats.messages;

    if (App.cache.stats.images)
        App.cache.stats.images.textContent = stats.images;

    if (App.cache.stats.videos)
        App.cache.stats.videos.textContent = stats.videos;

    if (App.cache.stats.voices)
        App.cache.stats.voices.textContent = stats.voices;

    if (App.cache.stats.years)
        App.cache.stats.years.textContent = stats.years;

};



/* ============================================
   ARCHIVE NOTICE
============================================ */

App.renderArchiveNotice = function (notice) {

    const card = App.utils.create(
        "div",
        `archive-notice ${notice.type || "info"}`
    );

    if (notice.icon) {
        const icon = App.utils.create(
            "span",
            "archive-notice-icon"
        );

        icon.textContent = notice.icon;
        card.appendChild(icon);
    }

    const content = App.utils.create(
        "div",
        "archive-notice-content"
    );

    if (notice.title) {
        const title = App.utils.create(
            "div",
            "archive-notice-title"
        );

        title.textContent = notice.title;
        content.appendChild(title);
    }

    // NEW: notice image
    if (notice.image) {

        const [year, month, day] = notice._conversation.date.split("-");

        const img = App.utils.create("img");
        img.className = "archive-notice-image";
        img.src = `${App.config.dataRoot}${year}/${month}/${day}/${notice.image}`;
        img.alt = "Notice image";
        img.loading = "lazy";

        img.addEventListener("click", () => {
            App.openImage(img.src);
        });

        content.appendChild(img);
    }

    const text = App.utils.create(
        "div",
        "archive-notice-text"
    );

    text.textContent = notice.text;
    content.appendChild(text);

    card.appendChild(content);

    return card;
};

App.renderWelcomeMessage = function (message) {

    const card = App.utils.create(
        "div",
        "welcome-message"
    );

    const badge = App.utils.create(
        "div",
        "welcome-badge"
    );

    badge.textContent =
        message.label || "💌 Welcome Message";

    const body = App.utils.create(
        "div",
        "welcome-body"
    );

    body.appendChild(
        App.renderMessageBody(message)
    );

    card.append(
        badge,
        body
    );

    return card;

};

/* ============================================
   PLACEHOLDER RENDER
============================================ */

App.renderConversationBody = function (conversation) {

    
    const container = App.utils.create(
        "article",
        "fromm-conversation"
    );

    if (!conversation.messages?.length) {
        return container;
    }

    const notices = [...(conversation.notices || [])]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    let noticeIndex = 0;
    let currentGroup = null;
    let currentSender = null;

    conversation.messages.forEach((message, index) => {

while (
    noticeIndex < notices.length &&
    notices[noticeIndex].position === index
) {

    notices[noticeIndex]._conversation = conversation;

    container.appendChild(
        App.renderArchiveNotice(notices[noticeIndex])
    );

    // Start a new sender group after a notice
    currentGroup = null;
    currentSender = null;

    noticeIndex++;
}

if (message.type === "welcome") {

    container.appendChild(
        App.renderWelcomeMessage(message)
    );

    currentGroup = null;
    currentSender = null;

    return;

}

        message._conversation = conversation;

        if (message.type !== currentSender) {

            currentSender = message.type;

            currentGroup = App.renderSenderGroup(message.type);

            container.appendChild(currentGroup);

        }

        const bubble = App.renderMessage(message);

        const messages =
            currentGroup.querySelector(".group-messages");

        messages.appendChild(bubble);

        App.updateBubbleClasses(messages);

    });

while (noticeIndex < notices.length) {

    notices[noticeIndex]._conversation = conversation;

    container.appendChild(
        App.renderArchiveNotice(notices[noticeIndex])
    );

    noticeIndex++;
}

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
        ? ""
        : "";

const name =
    groupType === "idol"
        ? "하연이❤️"
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
    App.renderSticker,
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

App.renderSticker = function(message){

    const stickers = App.utils.getMediaList(
        message,
        "sticker",
        "stickers"
    );

    if(!stickers.length) return null;

    const wrapper = App.createMediaWrapper("message-sticker");

    stickers.forEach(file=>{

        const img = App.utils.create("img");

        img.loading = "lazy";

        img.src = App.utils.resolveMediaPath(
            {
                ...message,
                sticker:file
            },
            "sticker"
        );

        img.alt = "Sticker";

        wrapper.appendChild(img);

    });

    return wrapper;

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

const ui = App.loadUIState();

// Only auto-open a conversation on the first page load.
if (
    !App.state.initialized &&
    !App.state.selectedConversation
) {

    const rememberedDate =
        App.loadLastConversation();

    if (rememberedDate) {

        const remembered =
            App.state.filtered.find(
                c => c.date === rememberedDate
            );

        if (remembered) {
            App.state.selectedConversation = remembered;
        }

    }

    if (
        !App.state.selectedConversation &&
        App.state.filtered.length
    ) {
        App.state.selectedConversation =
            App.state.filtered[0];
    }
}

if (!App.state.expandedYears.size && ui.years) {

    App.state.expandedYears =
        new Set(ui.years);

}

if (!App.state.expandedMonths.size && ui.months) {

    App.state.expandedMonths =
        new Set(ui.months);

}

App.updateStatistics();

App.buildTimeline();

if (App.state.selectedConversation) {

    App.showConversation(App.state.selectedConversation);

} else {

    App.buildTimeline();

    App.cache.container.innerHTML = `
         
    `;
}

};

App.matchConversation = function (entry, query) {

    const tokens = query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

    let matches = 0;

    for (const keyword of entry.keywords) {

        const text = keyword.toLowerCase();

        if (tokens.every(token => text.includes(token))) {
            matches++;
        }

    }

    return matches;

};

App.findSearchResults = function (query) {

    const results = [];

    App.state.searchIndex.forEach(entry => {

        const matches =
            App.matchConversation(entry, query);

        if (!matches) return;

        results.push({

            conversation: entry.conversation,

            matches

        });

    });

    results.sort((a, b) => {

        if (b.matches !== a.matches)
            return b.matches - a.matches;

        return new Date(b.conversation.date) -
               new Date(a.conversation.date);

    });

    return results;

};


App.previewConversation = function (conversation) {

    if (!conversation) return;

App.focusTimeline(conversation);

};

App.focusTimeline = function (conversation) {

    if (!conversation) return;

    const year = App.utils.getYear(conversation.date);
    const month = `${year}-${App.utils.getMonth(conversation.date)}`;

    App.state.expandedYears = new Set([year]);
    App.state.expandedMonths = new Set([month]);

    App.buildTimeline();

};

App.restoreTimelinePreview = function () {

    if (!App.state.previewYears) return;

    App.state.expandedYears =
        App.state.previewYears;

    App.state.expandedMonths =
        App.state.previewMonths;

    App.state.previewYears = null;
    App.state.previewMonths = null;

    App.buildTimeline();

};

/* ============================================
   SEARCH
============================================ */

App.search = function (query) {

    query = query.trim().toLowerCase();

    App.state.search = query;

App.cache.searchClear?.classList.toggle(
    "hidden",
    !query
);

    App.state.searchMatches = {};

    if (!query) {

        App.state.filtered =
            [...App.state.conversations];

App.restoreTimelinePreview();

        App.render();

App.cache.searchResults.classList.add("hidden");

App.state.searchSuggestions = [];
App.state.selectedSuggestion = -1;

        return;

    }

    const results =
        App.findSearchResults(query);

App.state.searchSuggestions = results;
App.state.selectedSuggestion = -1;



    App.state.filtered =
        results.map(r => r.conversation);

    results.forEach(result => {

        App.state.searchMatches[
            result.conversation.date
        ] = result.matches;

    });

    if (results.length === 1) {

        App.showConversation(
            results[0].conversation
        );

        return;

    }

    App.render();

    App.renderSearchSuggestions(results);
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

App.cache.search.addEventListener("focus", () => {

    if (
        App.cache.search.value.trim() &&
        App.state.searchSuggestions.length
    ) {
        App.renderSearchSuggestions(
            App.state.searchSuggestions
        );
    }

});

if (App.cache.searchClear) {

    App.cache.searchClear.addEventListener("click", () => {

        App.cache.search.value = "";

        App.search("");

        App.cache.search.focus();

    });

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

const latestBtn =
    document.getElementById(
        "timeline-latest"
    );

latestBtn?.addEventListener(
    "click",
    () => {

        if (!App.state.filtered.length)
            return;

        App.showConversation(
            App.state.filtered[0]
        );

    }
);

};

/* ============================================
   MOBILE TIMELINE
============================================ */

App.bindMobileTimeline = function () {

    const toggle =
        document.getElementById(
            "timeline-toggle"
        );

    const content =
        document.getElementById(
            "timeline-content"
        );

    const icon =
        document.getElementById(
            "timeline-toggle-icon"
        );

    if (!toggle || !content || !icon) {

        return;

    }

    if (window.innerWidth <= 768) {

content.classList.add("collapsed");

document
    .getElementById("fromm-sidebar")
    .classList.add("collapsed");

        icon.textContent = "▶";

    }

    toggle.addEventListener("click", () => {

        if (window.innerWidth > 768) {

            return;

        }

content.classList.toggle("collapsed");

document
    .getElementById("fromm-sidebar")
    .classList.toggle("collapsed");

        icon.textContent =
            content.classList.contains(
                "collapsed"
            )
            ? "▶"
            : "▼";

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

if (
    document.activeElement === App.cache.search &&
    App.state.searchSuggestions.length
) {

    if (event.key === "ArrowDown") {

        event.preventDefault();

        App.state.selectedSuggestion = Math.min(
            App.state.selectedSuggestion + 1,
            App.state.searchSuggestions.length - 1
        );

        App.previewConversation(
            App.state.searchSuggestions[
                App.state.selectedSuggestion
            ].conversation
        );

        return;
    }

    if (event.key === "ArrowUp") {

        event.preventDefault();

        App.state.selectedSuggestion = Math.max(
            App.state.selectedSuggestion - 1,
            0
        );

        App.previewConversation(
            App.state.searchSuggestions[
                App.state.selectedSuggestion
            ].conversation
        );

        return;
    }

    if (event.key === "Enter") {

        event.preventDefault();

        const selected =
            App.state.searchSuggestions[
                App.state.selectedSuggestion
            ];

        if (selected) {

            App.cache.searchResults.classList.add("hidden");

App.restoreTimelinePreview();

            App.showConversation(selected.conversation);

App.cache.searchResults.classList.add("hidden");

App.state.searchSuggestions = [];
App.state.selectedSuggestion = -1;

        }

        return;
    }
}

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

App.cache.searchResults.classList.add("hidden");

App.state.searchSuggestions = [];
App.state.selectedSuggestion = -1;

App.restoreTimelinePreview();

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

App.bindMobileTimeline();

console.log(
    "✅ Frommm Archive v2 initialized."
);

    }

);

App.renderSearchSuggestions = function(results){

    const box = App.cache.searchResults;

    if(!box) return;

    box.innerHTML="";

    if(!results.length){

        box.classList.add("hidden");

        return;

    }

box.onmouseleave = () => {

    App.state.selectedSuggestion = -1;

    App.restoreTimelinePreview();

};

    results.forEach((result,index)=>{

        const item=document.createElement("div");

        item.className="search-result";

if (index === App.state.selectedSuggestion) {
    item.classList.add("active");
}

        item.innerHTML=`

            <div>

                📅 ${App.utils.formatDate(result.conversation.date)}

            </div>

            <small>

                ${result.conversation.messages.length} messages

            </small>

        `;

item.onmouseenter = () => {

    App.state.selectedSuggestion = index;

    App.previewConversation(result.conversation);

};

item.onclick = ()=>{

    box.classList.add("hidden");

App.restoreTimelinePreview();

    App.showConversation(result.conversation);

    if (window.matchMedia("(max-width:768px)").matches){

        document.getElementById("fromm-container")
            ?.scrollIntoView({

                behavior:"instant",

                block:"start"

            });

    }

};

        box.appendChild(item);

    });

    box.classList.remove("hidden");

}

