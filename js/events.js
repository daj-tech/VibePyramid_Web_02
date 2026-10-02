/* =========================================================
   LOCALLINK
   Events Category JavaScript
   HTML + CSS + JavaScript version
   Data Source:
   data/thane/events.csv
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const EVENTS_CONFIG = {
    region: "Thane",
    file: "data/thane/events.csv"
};


/* =========================================================
   2. PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeEventsPage();
    }
);


async function initializeEventsPage() {

    initializeEventsFilters();

    initializeEventsArea();

    await loadEventsInformation();
}


/* =========================================================
   3. AREA INITIALIZATION
   ========================================================= */

function initializeEventsArea() {

    const selectedArea =
        getSelectedEventsArea();


    const areaDisplay =
        document.getElementById(
            "selectedAreaDisplay"
        );


    const areaName =
        document.getElementById(
            "selectedAreaName"
        );


    if (areaDisplay) {

        areaDisplay.textContent =
            selectedArea;
    }


    if (areaName) {

        areaName.textContent =
            selectedArea;
    }


    /*
       Listen for area changes from the dashboard
       or another LocalLink page.
    */

    window.addEventListener(
        "locallinkAreaChanged",
        async (event) => {

            const area =
                event.detail?.area ||
                "All Areas";


            if (areaDisplay) {

                areaDisplay.textContent =
                    area;
            }


            if (areaName) {

                areaName.textContent =
                    area;
            }


            await loadEventsInformation();
        }
    );
}


function getSelectedEventsArea() {

    const storedArea =
        localStorage.getItem(
            "locallink_area"
        );


    if (storedArea) {
        return storedArea;
    }


    const userData =
        localStorage.getItem(
            "locallink_user"
        );


    if (userData) {

        try {

            const user =
                JSON.parse(
                    userData
                );


            return (
                user.area ||
                "All Areas"
            );

        } catch (error) {

            console.error(
                "Unable to read LocalLink user:",
                error
            );
        }
    }


    return "All Areas";
}


/* =========================================================
   4. FILTER INITIALIZATION
   ========================================================= */

function initializeEventsFilters() {

    const filterButtons =
        document.querySelectorAll(
            ".filter-button"
        );


    filterButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                async () => {

                    filterButtons.forEach(
                        (item) => {
                            item.classList.remove(
                                "active"
                            );
                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    const filter =
                        button.dataset.filter ||
                        button.textContent.trim();


                    await loadEventsInformation(
                        filter
                    );
                }
            );

        }
    );
}


/* =========================================================
   5. LOAD EVENTS INFORMATION
   ========================================================= */

async function loadEventsInformation(
    selectedFilter = null
) {

    showEventsLoading();


    try {

        const records =
            await loadEventsCSV();


        const areaFilteredRecords =
            filterEventsByArea(
                records
            );


        const statusRecords =
            areaFilteredRecords.map(
                calculateEventsStatus
            );


        const activeFilter =
            selectedFilter ||
            getActiveEventsFilter();


        const filteredRecords =
            applyEventsFilter(
                statusRecords,
                activeFilter
            );


        updateEventsSummary(
            statusRecords
        );


        updateEventsResultCount(
            filteredRecords.length
        );


        updateEventsResults(
            filteredRecords
        );


        updateEventsAreaDisplay();


        hideEventsLoading();

    } catch (error) {

        console.error(
            "Events data loading failed:",
            error
        );


        hideEventsLoading();


        showEventsError(
            "Unable to load event information. Please run LocalLink using Live Server."
        );
    }
}


/* =========================================================
   6. LOAD EVENTS CSV
   ========================================================= */

async function loadEventsCSV() {

    /*
       Prefer the common csvReader.js.
    */

    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.loadCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.loadCSV(
            EVENTS_CONFIG.file
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.readCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.readCSV(
            EVENTS_CONFIG.file
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.fetchCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.fetchCSV(
            EVENTS_CONFIG.file
        );
    }


    /*
       Fallback direct fetch.
    */

    const response =
        await fetch(
            EVENTS_CONFIG.file
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load ${EVENTS_CONFIG.file}`
        );
    }


    const csvText =
        await response.text();


    return parseEventsCSV(
        csvText
    );
}


/* =========================================================
   7. FALLBACK CSV PARSER
   ========================================================= */

function parseEventsCSV(
    csvText
) {

    const rows = [];

    let currentRow = [];

    let currentValue = "";

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


        /*
           Escaped quotes.
        */

        if (
            char === '"' &&
            nextChar === '"'
        ) {

            currentValue += '"';

            i++;

            continue;
        }


        /*
           Quotation boundary.
        */

        if (char === '"') {

            insideQuotes =
                !insideQuotes;

            continue;
        }


        /*
           Column separator.
        */

        if (
            char === "," &&
            !insideQuotes
        ) {

            currentRow.push(
                currentValue.trim()
            );

            currentValue = "";

            continue;
        }


        /*
           Row separator.
        */

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


            currentRow.push(
                currentValue.trim()
            );

            currentValue = "";


            if (
                currentRow.some(
                    (cell) =>
                        cell !== ""
                )
            ) {

                rows.push(
                    currentRow
                );
            }


            currentRow = [];

            continue;
        }


        currentValue += char;
    }


    /*
       Add final row.
    */

    if (
        currentValue !== "" ||
        currentRow.length > 0
    ) {

        currentRow.push(
            currentValue.trim()
        );


        if (
            currentRow.some(
                (cell) =>
                    cell !== ""
            )
        ) {

            rows.push(
                currentRow
            );
        }
    }


    if (rows.length < 2) {
        return [];
    }


    const headers =
        rows[0].map(
            (header) =>
                normalizeEventsValue(
                    header
                )
        );


    return rows
        .slice(1)
        .map(
            (row) => {

                const record = {};


                headers.forEach(
                    (
                        header,
                        index
                    ) => {

                        record[header] =
                            row[index] ??
                            "";
                    }
                );


                return record;
            }
        );
}


/* =========================================================
   8. AREA FILTER
   ========================================================= */

function filterEventsByArea(
    records
) {

    const selectedArea =
        getSelectedEventsArea();


    if (
        !selectedArea ||
        selectedArea ===
            "All Areas"
    ) {

        return records;
    }


    return records.filter(
        (record) => {

            return (
                normalizeEventsValue(
                    record.local_area
                ) ===
                normalizeEventsValue(
                    selectedArea
                )
            );
        }
    );
}


/* =========================================================
   9. GET ACTIVE FILTER
   ========================================================= */

function getActiveEventsFilter() {

    const activeButton =
        document.querySelector(
            ".filter-button.active"
        );


    if (!activeButton) {
        return "All";
    }


    return (
        activeButton.dataset.filter ||
        activeButton.textContent.trim()
    );
}


/* =========================================================
   10. APPLY EVENTS FILTER
   ========================================================= */

function applyEventsFilter(
    records,
    filter
) {

    if (
        !filter ||
        normalizeEventsValue(
            filter
        ) === "all"
    ) {

        return records;
    }


    const normalizedFilter =
        normalizeEventsValue(
            filter
        );


    return records.filter(
        (record) => {

            const title =
                normalizeEventsValue(
                    record.title
                );


            const subcategory =
                normalizeEventsValue(
                    record.subcategory
                );


            const description =
                normalizeEventsValue(
                    record.description
                );


            return (
                subcategory.includes(
                    normalizedFilter
                ) ||
                title.includes(
                    normalizedFilter
                ) ||
                description.includes(
                    normalizedFilter
                )
            );
        }
    );
}


/* =========================================================
   11. STATUS CALCULATION
   ========================================================= */

function calculateEventsStatus(
    record
) {

    const suppliedStatus =
        normalizeEventsValue(
            record.status
        );


    /*
       RESOLVED stays RESOLVED.
    */

    if (
        suppliedStatus ===
        "resolved"
    ) {

        return {
            ...record,
            calculated_status:
                "RESOLVED"
        };
    }


    /*
       EXPIRED stays EXPIRED.
    */

    if (
        suppliedStatus ===
        "expired"
    ) {

        return {
            ...record,
            calculated_status:
                "EXPIRED"
        };
    }


    const relevantDate =
        getEventsRelevantDate(
            record
        );


    /*
       No usable date.
    */

    if (!relevantDate) {

        return {
            ...record,
            calculated_status:
                formatEventsStatus(
                    record.status
                )
        };
    }


    const today =
        eventsStartOfToday();


    const eventDay =
        eventsStartOfDay(
            relevantDate
        );


    /*
       Future event = UPCOMING.
    */

    if (
        eventDay.getTime() >
        today.getTime()
    ) {

        return {
            ...record,
            calculated_status:
                "UPCOMING"
        };
    }


    /*
       Deadline expired.
    */

    if (
        record.deadline &&
        isEventsDeadlinePassed(
            record
        )
    ) {

        return {
            ...record,
            calculated_status:
                "EXPIRED"
        };
    }


    /*
       Event date is today or status is active.
    */

    return {
        ...record,
        calculated_status:
            "ACTIVE"
    };
}


function getEventsRelevantDate(
    record
) {

    const value =
        record.event_date ||
        record.deadline;


    if (!value) {
        return null;
    }


    let date =
        new Date(
            `${value}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        date =
            new Date(
                value
            );
    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;
    }


    return date;
}


function isEventsDeadlinePassed(
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


    return (
        new Date().getTime() >
        deadline.getTime()
    );
}


function formatEventsStatus(
    status
) {

    const value =
        normalizeEventsValue(
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
   12. SUMMARY
   ========================================================= */

function updateEventsSummary(
    records
) {

    const summary = {
        total: records.length,
        active: 0,
        upcoming: 0,
        expired: 0,
        resolved: 0
    };


    records.forEach(
        (record) => {

            switch (
                record.calculated_status
            ) {

                case "ACTIVE":
                    summary.active++;
                    break;

                case "UPCOMING":
                    summary.upcoming++;
                    break;

                case "EXPIRED":
                    summary.expired++;
                    break;

                case "RESOLVED":
                    summary.resolved++;
                    break;
            }
        }
    );


    setEventsText(
        [
            "eventsTotalCount",
            "totalEventsCount",
            "totalCount"
        ],
        summary.total
    );


    setEventsText(
        [
            "eventsActiveCount",
            "activeEventsCount",
            "activeCount"
        ],
        summary.active
    );


    setEventsText(
        [
            "eventsUpcomingCount",
            "upcomingEventsCount",
            "upcomingCount"
        ],
        summary.upcoming
    );


    setEventsText(
        [
            "eventsExpiredCount",
            "expiredEventsCount",
            "expiredCount"
        ],
        summary.expired
    );


    setEventsText(
        [
            "eventsResolvedCount",
            "resolvedEventsCount",
            "resolvedCount"
        ],
        summary.resolved
    );
}


/* =========================================================
   13. RESULT COUNT
   ========================================================= */

function updateEventsResultCount(
    count
) {

    setEventsText(
        [
            "eventsResultCount",
            "resultCount",
            "contentResultCount"
        ],
        count
    );
}


/* =========================================================
   14. DISPLAY RESULTS
   ========================================================= */

function updateEventsResults(
    records
) {

    const container =
        document.getElementById(
            "eventsResults"
        ) ||
        document.getElementById(
            "informationResults"
        ) ||
        document.getElementById(
            "eventsInformation"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (records.length === 0) {

        container.innerHTML =
            createEventsEmptyState();

        return;
    }


    const sortedRecords =
        sortEventsRecords(
            records
        );


    sortedRecords.forEach(
        (record) => {

            container.insertAdjacentHTML(
                "beforeend",
                createEventCard(
                    record
                )
            );
        }
    );
}


/* =========================================================
   15. EVENT INFORMATION CARD
   ========================================================= */

function createEventCard(
    record
) {

    const status =
        record.calculated_status ||
        "ACTIVE";


    const priority =
        formatEventsPriority(
            record.priority
        );


    const dateText =
        formatEventsDate(
            record
        );


    const area =
        record.local_area ||
        "All Areas";


    const subcategory =
        record.subcategory ||
        "Community Event";


    const description =
        record.description ||
        "No description available.";


    const sourceType =
        record.source_type ||
        "Local Information";


    const sourceReference =
        record.source_reference ||
        "";


    const contact =
        record.contact_info ||
        "";


    const icon =
        getEventIcon(
            subcategory,
            record.title
        );


    return `
        <article class="information-card event-information-card">

            <div class="information-card-top">

                <span class="information-card-category">

                    <span
                        class="category-dot"
                        style="background:#EA580C;"
                    ></span>

                    Events

                </span>


                <span class="status-badge ${getEventsStatusClass(status)}">
                    ${escapeEventsHTML(status)}
                </span>

            </div>


            <div class="information-card-title-row">

                <h3 class="information-card-title">
                    ${icon}
                    ${escapeEventsHTML(
                        record.title ||
                        "Community Event"
                    )}
                </h3>


                ${
                    priority
                        ? `
                            <span class="priority-badge ${getEventsPriorityClass(priority)}">
                                ${escapeEventsHTML(
                                    priority
                                )}
                            </span>
                          `
                        : ""
                }

            </div>


            <div class="information-subcategory">
                ${escapeEventsHTML(
                    subcategory
                )}
            </div>


            <p class="information-card-description">
                ${escapeEventsHTML(
                    description
                )}
            </p>


            <div class="information-card-meta">

                <span class="information-meta-item">
                    📍 ${escapeEventsHTML(
                        area
                    )}
                </span>


                ${
                    dateText
                        ? `
                            <span class="information-meta-item">
                                📅 ${escapeEventsHTML(
                                    dateText
                                )}
                            </span>
                          `
                        : ""
                }


                ${
                    record.start_time
                        ? `
                            <span class="information-meta-item">
                                🕒 ${escapeEventsHTML(
                                    record.start_time
                                )}
                            </span>
                          `
                        : ""
                }


                ${
                    record.end_time
                        ? `
                            <span class="information-meta-item">
                                → ${escapeEventsHTML(
                                    record.end_time
                                )}
                            </span>
                          `
                        : ""
                }

            </div>


            ${
                contact
                    ? `
                        <div class="information-contact">
                            <strong>Contact:</strong>
                            ${escapeEventsHTML(
                                contact
                            )}
                        </div>
                      `
                    : ""
            }


            <div class="information-card-footer">

                <span class="information-source">

                    ${escapeEventsHTML(
                        sourceType
                    )}

                    ${
                        sourceReference
                            ? `
                                · ${escapeEventsHTML(
                                    sourceReference
                                )}
                              `
                            : ""
                    }

                </span>

            </div>

        </article>
    `;
}


/* =========================================================
   16. EVENT ICON
   ========================================================= */

function getEventIcon(
    subcategory,
    title
) {

    const text =
        normalizeEventsValue(
            `${subcategory} ${title}`
        );


    if (
        text.includes(
            "workshop"
        )
    ) {

        return "🛠️";
    }


    if (
        text.includes(
            "clean"
        )
    ) {

        return "🧹";
    }


    if (
        text.includes(
            "seminar"
        )
    ) {

        return "🎤";
    }


    if (
        text.includes(
            "awareness"
        )
    ) {

        return "📢";
    }


    if (
        text.includes(
            "community"
        )
    ) {

        return "🤝";
    }


    return "📅";
}


/* =========================================================
   17. SORT EVENT RECORDS
   ========================================================= */

function sortEventsRecords(
    records
) {

    return [...records].sort(
        (a, b) => {

            /*
               Upcoming events first.
            */

            const aStatus =
                a.calculated_status;


            const bStatus =
                b.calculated_status;


            const aStatusOrder =
                getEventStatusOrder(
                    aStatus
                );


            const bStatusOrder =
                getEventStatusOrder(
                    bStatus
                );


            if (
                aStatusOrder !==
                bStatusOrder
            ) {

                return (
                    aStatusOrder -
                    bStatusOrder
                );
            }


            /*
               High priority first.
            */

            const priorityDifference =
                getEventsPriorityNumber(
                    a.priority
                ) -
                getEventsPriorityNumber(
                    b.priority
                );


            if (
                priorityDifference !==
                0
            ) {

                return priorityDifference;
            }


            /*
               Then by event date.
            */

            const aDate =
                getEventsRelevantDate(
                    a
                );


            const bDate =
                getEventsRelevantDate(
                    b
                );


            if (!aDate && !bDate) {
                return 0;
            }


            if (!aDate) {
                return 1;
            }


            if (!bDate) {
                return -1;
            }


            return (
                aDate.getTime() -
                bDate.getTime()
            );
        }
    );
}


function getEventStatusOrder(
    status
) {

    switch (
        status
    ) {

        case "UPCOMING":
            return 1;

        case "ACTIVE":
            return 2;

        case "RESOLVED":
            return 3;

        case "EXPIRED":
            return 4;

        default:
            return 5;
    }
}


/* =========================================================
   18. PRIORITY
   ========================================================= */

function formatEventsPriority(
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


function getEventsPriorityNumber(
    priority
) {

    const value =
        normalizeEventsValue(
            priority
        );


    if (value === "high") {
        return 1;
    }


    if (value === "medium") {
        return 2;
    }


    if (value === "low") {
        return 3;
    }


    return 4;
}


function getEventsPriorityClass(
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
   19. FORMAT DATE
   ========================================================= */

function formatEventsDate(
    record
) {

    const date =
        getEventsRelevantDate(
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
   20. STATUS CLASS
   ========================================================= */

function getEventsStatusClass(
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
   21. AREA DISPLAY
   ========================================================= */

function updateEventsAreaDisplay() {

    const area =
        getSelectedEventsArea();


    const elements =
        document.querySelectorAll(
            "#selectedAreaDisplay, #selectedAreaName, #navArea"
        );


    elements.forEach(
        (element) => {

            element.textContent =
                area;
        }
    );
}


/* =========================================================
   22. LOADING STATE
   ========================================================= */

function showEventsLoading() {

    const loading =
        document.getElementById(
            "eventsLoading"
        );


    if (loading) {

        loading.hidden =
            false;
    }


    const error =
        document.getElementById(
            "eventsError"
        );


    if (error) {

        error.hidden =
            true;
    }
}


function hideEventsLoading() {

    const loading =
        document.getElementById(
            "eventsLoading"
        );


    if (loading) {

        loading.hidden =
            true;
    }
}


/* =========================================================
   23. ERROR STATE
   ========================================================= */

function showEventsError(
    message
) {

    const error =
        document.getElementById(
            "eventsError"
        );


    if (error) {

        error.hidden =
            false;

        error.textContent =
            message;

        return;
    }


    const container =
        document.getElementById(
            "eventsResults"
        );


    if (container) {

        container.innerHTML = `
            <div class="error-box">
                ${escapeEventsHTML(
                    message
                )}
            </div>
        `;
    }
}


/* =========================================================
   24. EMPTY STATE
   ========================================================= */

function createEventsEmptyState() {

    return `
        <div class="empty-state">

            <div class="empty-icon">
                📅
            </div>

            <h3>
                No events found
            </h3>

            <p>
                There are currently no events matching
                the selected area and filter.
            </p>

        </div>
    `;
}


/* =========================================================
   25. TEXT HELPER
   ========================================================= */

function setEventsText(
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


/* =========================================================
   26. NORMALIZE VALUE
   ========================================================= */

function normalizeEventsValue(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();
}


/* =========================================================
   27. DATE HELPERS
   ========================================================= */

function eventsStartOfToday() {

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


function eventsStartOfDay(
    date
) {

    const result =
        new Date(
            date
        );


    result.setHours(
        0,
        0,
        0,
        0
    );


    return result;
}


/* =========================================================
   28. HTML ESCAPING
   ========================================================= */

function escapeEventsHTML(
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
   29. PUBLIC API
   ========================================================= */

window.LocalLinkEvents = {

    loadEventsInformation,

    filterEventsByArea,

    applyEventsFilter,

    calculateEventsStatus
};