/* =========================================================
   LOCALLINK
   Dashboard JavaScript
   HTML + CSS + JavaScript version
   Prototype data source:
   data/thane/*.csv
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const LOCALLINK_DASHBOARD_CONFIG = {
    region: "Thane",

    categories: {
        educational: {
            name: "Educational",
            file: "data/thane/educational.csv",
            page: "educational.html"
        },

        community: {
            name: "Community",
            file: "data/thane/community.csv",
            page: "community.html"
        },

        internships_skills: {
            name: "Internships & Skills",
            file: "data/thane/internships_skills.csv",
            page: "internships-skills.html"
        },

        local: {
            name: "Local",
            file: "data/thane/local.csv",
            page: "local.html"
        },

        events: {
            name: "Events",
            file: "data/thane/events.csv",
            page: "events.html"
        },

        emergencies: {
            name: "Emergencies",
            file: "data/thane/emergencies.csv",
            page: "emergencies.html"
        }
    }
};


/* =========================================================
   2. DASHBOARD START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeDashboard();
    }
);


async function initializeDashboard() {

    const dashboardPage =
        document.getElementById(
            "dashboardPage"
        );

    /*
       If dashboardPage does not exist, do not run.
       This keeps the script safe if it is accidentally
       loaded on another page.
    */

    if (
        !dashboardPage &&
        !document.querySelector(
            ".dashboard-page, .dashboard-header"
        )
    ) {
        return;
    }


    initializeDashboardAreaSelector();

    displayDashboardUser();

    initializeQuickAccess();

    await loadDashboardData();
}


/* =========================================================
   3. DISPLAY USER DETAILS
   ========================================================= */

function displayDashboardUser() {

    const user =
        typeof getStoredUser === "function"
            ? getStoredUser()
            : getDashboardUserFallback();


    if (!user) {
        return;
    }


    const welcomeUser =
        document.getElementById(
            "welcomeUser"
        );

    if (welcomeUser) {
        welcomeUser.textContent =
            user.name || "User";
    }


    const dashboardRegion =
        document.getElementById(
            "dashboardRegion"
        );

    if (dashboardRegion) {
        dashboardRegion.textContent =
            user.region || "Thane";
    }


    const dashboardSelectedArea =
        document.getElementById(
            "selectedAreaDisplay"
        );

    if (dashboardSelectedArea) {
        dashboardSelectedArea.textContent =
            user.area || "All Areas";
    }
}


function getDashboardUserFallback() {

    const data =
        localStorage.getItem(
            "locallink_user"
        );

    if (!data) {
        return null;
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        console.error(
            "Unable to read LocalLink user:",
            error
        );

        return null;
    }
}


/* =========================================================
   4. AREA SELECTOR
   ========================================================= */

function initializeDashboardAreaSelector() {

    const areaSelector =
        document.getElementById(
            "dashboardArea"
        );

    if (!areaSelector) {
        return;
    }


    const user =
        getDashboardUserFallback();


    if (user && user.area) {

        areaSelector.value =
            user.area;
    }


    areaSelector.addEventListener(
        "change",
        async (event) => {

            const selectedArea =
                event.target.value;


            if (
                typeof saveLocalArea ===
                "function"
            ) {

                saveLocalArea(
                    selectedArea
                );

            } else {

                saveAreaFallback(
                    selectedArea
                );
            }


            updateDashboardAreaText(
                selectedArea
            );


            await loadDashboardData();
        }
    );
}


function saveAreaFallback(area) {

    localStorage.setItem(
        "locallink_area",
        area
    );


    const user =
        getDashboardUserFallback();


    if (user) {

        user.area =
            area;

        localStorage.setItem(
            "locallink_user",
            JSON.stringify(user)
        );
    }
}


function updateDashboardAreaText(area) {

    const areaElements =
        document.querySelectorAll(
            "#selectedAreaDisplay, #selectedAreaName, #navArea"
        );


    areaElements.forEach(
        (element) => {

            element.textContent =
                area || "All Areas";
        }
    );
}


/* =========================================================
   5. LOAD ALL DASHBOARD DATA
   ========================================================= */

async function loadDashboardData() {

    showDashboardLoading();


    try {

        const categoryEntries =
            Object.entries(
                LOCALLINK_DASHBOARD_CONFIG.categories
            );


        const results =
            await Promise.all(
                categoryEntries.map(
                    async ([key, category]) => {

                        const records =
                            await loadCategoryRecords(
                                category.file
                            );

                        return {
                            key,
                            category,
                            records
                        };
                    }
                )
            );


        const allRecords =
            results.flatMap(
                (result) =>
                    result.records.map(
                        (record) => ({
                            ...record,

                            dashboardCategory:
                                result.key,

                            dashboardCategoryName:
                                result.category.name,

                            dashboardPage:
                                result.category.page
                        })
                    )
            );


        const filteredRecords =
            filterBySelectedArea(
                allRecords
            );


        const recordsWithStatus =
            filteredRecords.map(
                calculateRecordStatus
            );


        updateCategoryCards(
            results,
            recordsWithStatus
        );


        updateSummaryCards(
            recordsWithStatus
        );


        updateImportantInformation(
            recordsWithStatus
        );


        updateUpcomingInformation(
            recordsWithStatus
        );


        updateRecentInformation(
            recordsWithStatus
        );


        updateNotificationPanel(
            recordsWithStatus
        );


        updateDashboardDate();


        hideDashboardLoading();

    } catch (error) {

        console.error(
            "Dashboard data loading failed:",
            error
        );


        hideDashboardLoading();

        showDashboardError(
            "Unable to load LocalLink information. Make sure you are running the project using Live Server."
        );
    }
}


/* =========================================================
   6. LOAD CATEGORY RECORDS
   ========================================================= */

async function loadCategoryRecords(
    filePath
) {

    /*
       Preferred method:
       Use csvReader.js if it provides a CSV loader.
    */

    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV
            .loadCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV
            .loadCSV(filePath);
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV
            .readCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV
            .readCSV(filePath);
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV
            .fetchCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV
            .fetchCSV(filePath);
    }


    /*
       Fallback loader.
       This keeps dashboard.js functional even before
       csvReader.js is implemented.
    */

    const response =
        await fetch(filePath);


    if (!response.ok) {

        throw new Error(
            `Unable to load CSV: ${filePath}`
        );
    }


    const text =
        await response.text();


    return parseDashboardCSV(
        text
    );
}


/* =========================================================
   7. SIMPLE CSV PARSER FALLBACK
   ========================================================= */

function parseDashboardCSV(csvText) {

    const rows = [];

    let row = [];

    let value = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < csvText.length;
        i++
    ) {

        const char =
            csvText[i];

        const nextChar =
            csvText[i + 1];


        if (
            char === '"' &&
            nextChar === '"'
        ) {

            value += '"';

            i++;

            continue;
        }


        if (char === '"') {

            insideQuotes =
                !insideQuotes;

            continue;
        }


        if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(
                value.trim()
            );

            value = "";

            continue;
        }


        if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                nextChar === "\n"
            ) {
                i++;
            }


            row.push(
                value.trim()
            );

            value = "";


            if (
                row.some(
                    (cell) =>
                        cell !== ""
                )
            ) {

                rows.push(
                    row
                );
            }


            row = [];

            continue;
        }


        value += char;
    }


    if (
        value !== "" ||
        row.length > 0
    ) {

        row.push(
            value.trim()
        );

        if (
            row.some(
                (cell) =>
                    cell !== ""
            )
        ) {

            rows.push(row);
        }
    }


    if (rows.length < 2) {
        return [];
    }


    const headers =
        rows[0].map(
            (header) =>
                header
                    .trim()
                    .toLowerCase()
        );


    return rows
        .slice(1)
        .map((cells) => {

            const object = {};

            headers.forEach(
                (
                    header,
                    index
                ) => {

                    object[header] =
                        cells[index] !==
                            undefined
                            ? cells[index]
                            : "";
                }
            );


            return object;
        });
}


/* =========================================================
   8. AREA FILTERING
   ========================================================= */

function filterBySelectedArea(
    records
) {

    const areaSelector =
        document.getElementById(
            "dashboardArea"
        );


    const selectedArea =
        areaSelector
            ? areaSelector.value
            : getStoredArea();


    if (
        !selectedArea ||
        selectedArea === "All Areas"
    ) {

        return records;
    }


    return records.filter(
        (record) =>
            normalizeValue(
                record.local_area
            ) ===
            normalizeValue(
                selectedArea
            )
    );
}


function getStoredArea() {

    const storedArea =
        localStorage.getItem(
            "locallink_area"
        );


    if (storedArea) {
        return storedArea;
    }


    const user =
        getDashboardUserFallback();


    return (
        user?.area ||
        "All Areas"
    );
}


/* =========================================================
   9. CALCULATE STATUS
   ========================================================= */

function calculateRecordStatus(
    record
) {

    const normalizedStatus =
        normalizeValue(
            record.status
        );


    /*
       Preserve RESOLVED when supplied by dataset.
    */

    if (
        normalizedStatus ===
        "resolved"
    ) {

        return {
            ...record,
            calculated_status:
                "RESOLVED"
        };
    }


    if (
        normalizedStatus ===
        "expired"
    ) {

        return {
            ...record,
            calculated_status:
                "EXPIRED"
        };
    }


    const relevantDate =
        getRecordRelevantDate(
            record
        );


    if (!relevantDate) {

        return {
            ...record,
            calculated_status:
                formatStatus(
                    record.status ||
                    "ACTIVE"
                )
        };
    }


    const today =
        startOfToday();


    const recordDate =
        startOfDay(
            relevantDate
        );


    if (
        recordDate.getTime() <
        today.getTime()
    ) {

        /*
           Only mark as expired automatically when
           the dataset has a deadline/event date that
           has already passed.
        */

        if (
            normalizedStatus !==
                "active" &&
            normalizedStatus !==
                "upcoming"
        ) {

            return {
                ...record,
                calculated_status:
                    "EXPIRED"
            };
        }


        if (
            isDeadlinePassed(record)
        ) {

            return {
                ...record,
                calculated_status:
                    "EXPIRED"
            };
        }
    }


    if (
        recordDate.getTime() >
        today.getTime()
    ) {

        return {
            ...record,
            calculated_status:
                "UPCOMING"
        };
    }


    return {
        ...record,
        calculated_status:
            formatStatus(
                record.status ||
                "ACTIVE"
            )
    };
}


function getRecordRelevantDate(
    record
) {

    const dateValue =
        record.event_date ||
        record.deadline;


    if (!dateValue) {
        return null;
    }


    const date =
        new Date(
            `${dateValue}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        const alternative =
            new Date(
                dateValue
            );


        if (
            Number.isNaN(
                alternative.getTime()
            )
        ) {

            return null;
        }


        return alternative;
    }


    return date;
}


function isDeadlinePassed(
    record
) {

    if (!record.deadline) {
        return false;
    }


    const deadline =
        new Date(
            `${record.deadline}T23:59:59`
        );


    if (
        Number.isNaN(
            deadline.getTime()
        )
    ) {

        return false;
    }


    return new Date() >
        deadline;
}


function formatStatus(status) {

    const value =
        normalizeValue(
            status
        );


    if (
        value ===
        "upcoming"
    ) {
        return "UPCOMING";
    }


    if (
        value ===
        "expired"
    ) {
        return "EXPIRED";
    }


    if (
        value ===
        "resolved"
    ) {
        return "RESOLVED";
    }


    return "ACTIVE";
}


/* =========================================================
   10. CATEGORY CARD COUNTS
   ========================================================= */

function updateCategoryCards(
    results,
    allRecords
) {

    const counts = {
        educational: 0,
        community: 0,
        internships_skills: 0,
        local: 0,
        events: 0,
        emergencies: 0
    };


    allRecords.forEach(
        (record) => {

            if (
                Object.prototype.hasOwnProperty.call(
                    counts,
                    record.dashboardCategory
                )
            ) {

                counts[
                    record.dashboardCategory
                ]++;
            }
        }
    );


    /*
       Expected dashboard HTML IDs
       */

    setText(
        [
            "educationalCount",
            "countEducational",
            "educationCount"
        ],
        counts.educational
    );


    setText(
        [
            "communityCount",
            "countCommunity"
        ],
        counts.community
    );


    setText(
        [
            "internshipsCount",
            "internshipsSkillsCount",
            "countInternships"
        ],
        counts.internships_skills
    );


    setText(
        [
            "localCount",
            "countLocal"
        ],
        counts.local
    );


    setText(
        [
            "eventsCount",
            "countEvents"
        ],
        counts.events
    );


    setText(
        [
            "emergenciesCount",
            "countEmergencies"
        ],
        counts.emergencies
    );
}


/* =========================================================
   11. SUMMARY COUNTS
   ========================================================= */

function updateSummaryCards(
    records
) {

    const summary = {
        active: 0,
        upcoming: 0,
        expired: 0,
        resolved: 0
    };


    records.forEach(
        (record) => {

            const status =
                record.calculated_status;


            if (
                status ===
                "ACTIVE"
            ) {

                summary.active++;

            } else if (
                status ===
                "UPCOMING"
            ) {

                summary.upcoming++;

            } else if (
                status ===
                "EXPIRED"
            ) {

                summary.expired++;

            } else if (
                status ===
                "RESOLVED"
            ) {

                summary.resolved++;
            }
        }
    );


    setText(
        [
            "activeCount",
            "summaryActive",
            "totalActive"
        ],
        summary.active
    );


    setText(
        [
            "upcomingCount",
            "summaryUpcoming",
            "totalUpcoming"
        ],
        summary.upcoming
    );


    setText(
        [
            "expiredCount",
            "summaryExpired",
            "totalExpired"
        ],
        summary.expired
    );


    setText(
        [
            "resolvedCount",
            "summaryResolved",
            "totalResolved"
        ],
        summary.resolved
    );


    setText(
        [
            "totalInformation",
            "totalCount"
        ],
        records.length
    );
}


/* =========================================================
   12. IMPORTANT INFORMATION
   ========================================================= */

function updateImportantInformation(
    records
) {

    const container =
        document.getElementById(
            "importantInformation"
        );


    if (!container) {
        return;
    }


    const important =
        records
            .filter(
                (record) =>
                    normalizeValue(
                        record.priority
                    ) ===
                    "high"
            )
            .sort(
                compareRecordsByDate
            )
            .slice(0, 5);


    container.innerHTML = "";


    if (important.length === 0) {

        container.innerHTML =
            createSmallEmptyState(
                "No high-priority information for the selected area."
            );

        return;
    }


    important.forEach(
        (record) => {

            container.insertAdjacentHTML(
                "beforeend",
                createDashboardInformationCard(
                    record
                )
            );
        }
    );
}


/* =========================================================
   13. UPCOMING INFORMATION
   ========================================================= */

function updateUpcomingInformation(
    records
) {

    const container =
        document.getElementById(
            "upcomingInformation"
        );


    if (!container) {
        return;
    }


    const upcoming =
        records
            .filter(
                (record) =>
                    record.calculated_status ===
                    "UPCOMING"
            )
            .sort(
                compareRecordsByDate
            )
            .slice(0, 5);


    container.innerHTML = "";


    if (upcoming.length === 0) {

        container.innerHTML =
            createSmallEmptyState(
                "No upcoming information for the selected area."
            );

        return;
    }


    upcoming.forEach(
        (record) => {

            container.insertAdjacentHTML(
                "beforeend",
                createDashboardInformationCard(
                    record
                )
            );
        }
    );
}


/* =========================================================
   14. RECENT INFORMATION
   ========================================================= */

function updateRecentInformation(
    records
) {

    const container =
        document.getElementById(
            "recentInformation"
        );


    if (!container) {
        return;
    }


    const recent =
        [...records]
            .sort(
                compareRecordsByDate
            )
            .slice(0, 6);


    container.innerHTML = "";


    if (recent.length === 0) {

        container.innerHTML =
            createSmallEmptyState(
                "No information is available."
            );

        return;
    }


    recent.forEach(
        (record) => {

            container.insertAdjacentHTML(
                "beforeend",
                createDashboardInformationCard(
                    record
                )
            );
        }
    );
}


/* =========================================================
   15. DASHBOARD INFORMATION CARD
   ========================================================= */

function createDashboardInformationCard(
    record
) {

    const category =
        record.dashboardCategoryName ||
        record.category ||
        "Information";


    const status =
        record.calculated_status ||
        "ACTIVE";


    const priority =
        formatPriority(
            record.priority
        );


    const dateText =
        formatInformationDate(
            record
        );


    const area =
        record.local_area ||
        "All Areas";


    const description =
        record.description ||
        "No description available.";


    const page =
        record.dashboardPage ||
        getCategoryPage(
            record.category
        );


    return `
        <article class="information-card dashboard-information-card">

            <div class="information-card-top">

                <span class="information-card-category">
                    <span class="category-dot"></span>
                    ${escapeHTML(category)}
                </span>

                <span class="status-badge ${getStatusClass(status)}">
                    ${escapeHTML(status)}
                </span>

            </div>


            <div class="information-card-title-row">

                <h3 class="information-card-title">
                    ${escapeHTML(
                        record.title ||
                        "Untitled Information"
                    )}
                </h3>

                ${
                    priority
                        ? `
                            <span class="priority-badge ${getPriorityClass(priority)}">
                                ${escapeHTML(priority)}
                            </span>
                          `
                        : ""
                }

            </div>


            ${
                record.subcategory
                    ? `
                        <div class="information-subcategory">
                            ${escapeHTML(
                                record.subcategory
                            )}
                        </div>
                      `
                    : ""
            }


            <p class="information-card-description">
                ${escapeHTML(description)}
            </p>


            <div class="information-card-meta">

                <span class="information-meta-item">
                    📍 ${escapeHTML(area)}
                </span>

                ${
                    dateText
                        ? `
                            <span class="information-meta-item">
                                📅 ${escapeHTML(dateText)}
                            </span>
                          `
                        : ""
                }

            </div>


            <div class="information-card-footer">

                <span class="information-source">
                    ${escapeHTML(
                        record.source_type ||
                        "Local Information"
                    )}
                </span>

                <a
                    href="${escapeHTML(page)}"
                    class="category-link"
                >
                    View Details →
                </a>

            </div>

        </article>
    `;
}


/* =========================================================
   16. NOTIFICATION PANEL
   ========================================================= */

function updateNotificationPanel(
    records
) {

    const container =
        document.getElementById(
            "dashboardNotifications"
        ) ||
        document.getElementById(
            "notificationDashboardPanel"
        );


    if (!container) {
        return;
    }


    const importantRecords =
        records
            .filter(
                (record) =>
                    normalizeValue(
                        record.priority
                    ) === "high"
            )
            .slice(0, 4);


    container.innerHTML = "";


    if (
        importantRecords.length ===
        0
    ) {

        container.innerHTML = `
            <div class="notification-status">
                <strong>You're all caught up.</strong>
                <span>No high-priority notifications for the selected area.</span>
            </div>
        `;

        return;
    }


    importantRecords.forEach(
        (record) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "notification-status";


            item.innerHTML = `
                <strong>
                    ${escapeHTML(
                        record.title ||
                        "Important Information"
                    )}
                </strong>

                <span>
                    ${
                        record.notification_days_before
                            ? `Reminder: ${escapeHTML(
                                record.notification_days_before
                            )} day(s) before`
                            : "High-priority local information"
                    }
                </span>
            `;


            container.appendChild(
                item
            );
        }
    );
}


/* =========================================================
   17. QUICK ACCESS
   ========================================================= */

function initializeQuickAccess() {

    const quickAccessCards =
        document.querySelectorAll(
            "[data-category-page]"
        );


    quickAccessCards.forEach(
        (card) => {

            card.addEventListener(
                "click",
                () => {

                    const target =
                        card.dataset.categoryPage;


                    if (target) {
                        window.location.href =
                            target;
                    }

                }
            );

        }
    );
}


/* =========================================================
   18. DASHBOARD DATE
   ========================================================= */

function updateDashboardDate() {

    const dateElement =
        document.getElementById(
            "dashboardToday"
        );


    if (!dateElement) {
        return;
    }


    const today =
        new Date();


    dateElement.textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday:
                    "long",

                day:
                    "numeric",

                month:
                    "long",

                year:
                    "numeric"
            }
        );
}


/* =========================================================
   19. DATE SORTING
   ========================================================= */

function compareRecordsByDate(
    first,
    second
) {

    const firstDate =
        getRecordRelevantDate(
            first
        );

    const secondDate =
        getRecordRelevantDate(
            second
        );


    if (!firstDate) {
        return 1;
    }


    if (!secondDate) {
        return -1;
    }


    return (
        firstDate.getTime() -
        secondDate.getTime()
    );
}


/* =========================================================
   20. FORMAT DATE
   ========================================================= */

function formatInformationDate(
    record
) {

    const date =
        getRecordRelevantDate(
            record
        );


    if (!date) {
        return "";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"
        }
    );
}


/* =========================================================
   21. STATUS CSS
   ========================================================= */

function getStatusClass(
    status
) {

    switch (
        status
    ) {

        case "ACTIVE":
            return "status-active";

        case "UPCOMING":
            return "status-upcoming";

        case "EXPIRED":
            return "status-expired";

        case "RESOLVED":
            return "status-resolved";

        default:
            return "status-active";
    }
}


/* =========================================================
   22. PRIORITY
   ========================================================= */

function formatPriority(
    priority
) {

    if (!priority) {
        return "";
    }


    return String(
        priority
    )
        .trim()
        .toUpperCase();
}


function getPriorityClass(
    priority
) {

    switch (
        priority
    ) {

        case "HIGH":
            return "priority-high";

        case "MEDIUM":
            return "priority-medium";

        case "LOW":
            return "priority-low";

        default:
            return "";
    }
}


/* =========================================================
   23. CATEGORY PAGE
   ========================================================= */

function getCategoryPage(
    category
) {

    const value =
        normalizeValue(
            category
        );


    const mapping = {

        educational:
            "educational.html",

        community:
            "community.html",

        "internships & skills":
            "internships-skills.html",

        internships:
            "internships-skills.html",

        "internships skills":
            "internships-skills.html",

        local:
            "local.html",

        events:
            "events.html",

        emergencies:
            "emergencies.html"
    };


    return (
        mapping[value] ||
        "dashboard.html"
    );
}


/* =========================================================
   24. LOADING STATE
   ========================================================= */

function showDashboardLoading() {

    const message =
        document.getElementById(
            "dashboardMessage"
        );


    if (!message) {
        return;
    }


    message.hidden = false;

    message.className =
        "dashboard-message";

    message.innerHTML = `
        <div class="loading-spinner"></div>
        <span>Loading local information...</span>
    `;
}


function hideDashboardLoading() {

    const message =
        document.getElementById(
            "dashboardMessage"
        );


    if (!message) {
        return;
    }


    message.hidden = true;

    message.innerHTML = "";
}


/* =========================================================
   25. ERROR STATE
   ========================================================= */

function showDashboardError(
    message
) {

    const element =
        document.getElementById(
            "dashboardMessage"
        );


    if (!element) {
        return;
    }


    element.hidden = false;

    element.className =
        "error-box";

    element.textContent =
        message;
}


/* =========================================================
   26. EMPTY STATE
   ========================================================= */

function createSmallEmptyState(
    message
) {

    return `
        <div class="empty-state small-empty-state">
            <div class="empty-icon">📭</div>
            <p>${escapeHTML(message)}</p>
        </div>
    `;
}


/* =========================================================
   27. HELPER FUNCTIONS
   ========================================================= */

function setText(
    ids,
    value
) {

    ids.forEach(
        (id) => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {
                element.textContent =
                    String(value);
            }
        }
    );
}


function normalizeValue(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();
}


function startOfToday() {

    const date =
        new Date();

    date.setHours(
        0,
        0,
        0,
        0
    );

    return date;
}


function startOfDay(
    date
) {

    const result =
        new Date(date);

    result.setHours(
        0,
        0,
        0,
        0
    );

    return result;
}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================================================
   28. EXTERNAL EVENT
   ========================================================= */

/*
   If the selected area is changed from another script,
   reload the dashboard automatically.
*/

window.addEventListener(
    "locallinkAreaChanged",
    async (event) => {

        const area =
            event.detail?.area ||
            "All Areas";


        updateDashboardAreaText(
            area
        );


        await loadDashboardData();
    }
);


/* =========================================================
   29. PUBLIC API
   ========================================================= */

window.LocalLinkDashboard = {

    loadDashboardData,

    loadCategoryRecords,

    filterBySelectedArea,

    calculateRecordStatus
};