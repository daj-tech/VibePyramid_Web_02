/* =========================================================
   LOCALLINK
   Local Category JavaScript
   HTML + CSS + JavaScript version
   Data Source:
   data/thane/local.csv
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const LOCAL_CONFIG = {
    region: "Thane",
    file: "data/thane/local.csv"
};


/* =========================================================
   2. PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeLocalPage();
    }
);


async function initializeLocalPage() {

    initializeLocalFilters();

    initializeLocalArea();

    await loadLocalInformation();
}


/* =========================================================
   3. AREA INITIALIZATION
   ========================================================= */

function initializeLocalArea() {

    const selectedArea =
        getSelectedLocalArea();


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


            await loadLocalInformation();
        }
    );
}


function getSelectedLocalArea() {

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

function initializeLocalFilters() {

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


                    await loadLocalInformation(
                        filter
                    );
                }
            );

        }
    );
}


/* =========================================================
   5. LOAD LOCAL INFORMATION
   ========================================================= */

async function loadLocalInformation(
    selectedFilter = null
) {

    showLocalLoading();


    try {

        const records =
            await loadLocalCSV();


        const areaFilteredRecords =
            filterLocalByArea(
                records
            );


        const statusRecords =
            areaFilteredRecords.map(
                calculateLocalStatus
            );


        const activeFilter =
            selectedFilter ||
            getActiveLocalFilter();


        const filteredRecords =
            applyLocalFilter(
                statusRecords,
                activeFilter
            );


        updateLocalSummary(
            statusRecords
        );


        updateLocalResultCount(
            filteredRecords.length
        );


        updateLocalResults(
            filteredRecords
        );


        updateLocalAreaDisplay();


        hideLocalLoading();

    } catch (error) {

        console.error(
            "Local information loading failed:",
            error
        );


        hideLocalLoading();


        showLocalError(
            "Unable to load local information. Please run LocalLink using Live Server."
        );
    }
}


/* =========================================================
   6. LOAD LOCAL CSV
   ========================================================= */

async function loadLocalCSV() {

    /*
       Use the common csvReader.js when available.
    */

    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.loadCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.loadCSV(
            LOCAL_CONFIG.file
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.readCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.readCSV(
            LOCAL_CONFIG.file
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.fetchCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.fetchCSV(
            LOCAL_CONFIG.file
        );
    }


    /*
       Fallback direct fetch.
    */

    const response =
        await fetch(
            LOCAL_CONFIG.file
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load ${LOCAL_CONFIG.file}`
        );
    }


    const csvText =
        await response.text();


    return parseLocalCSV(
        csvText
    );
}


/* =========================================================
   7. FALLBACK CSV PARSER
   ========================================================= */

function parseLocalCSV(
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
                normalizeLocalValue(
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

function filterLocalByArea(
    records
) {

    const selectedArea =
        getSelectedLocalArea();


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
                normalizeLocalValue(
                    record.local_area
                ) ===
                normalizeLocalValue(
                    selectedArea
                )
            );
        }
    );
}


/* =========================================================
   9. ACTIVE FILTER
   ========================================================= */

function getActiveLocalFilter() {

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
   10. APPLY LOCAL FILTER
   ========================================================= */

function applyLocalFilter(
    records,
    filter
) {

    if (
        !filter ||
        normalizeLocalValue(
            filter
        ) === "all"
    ) {

        return records;
    }


    const normalizedFilter =
        normalizeLocalValue(
            filter
        );


    return records.filter(
        (record) => {

            const title =
                normalizeLocalValue(
                    record.title
                );


            const subcategory =
                normalizeLocalValue(
                    record.subcategory
                );


            const description =
                normalizeLocalValue(
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

function calculateLocalStatus(
    record
) {

    const suppliedStatus =
        normalizeLocalValue(
            record.status
        );


    /*
       RESOLVED remains RESOLVED.
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
       EXPIRED remains EXPIRED.
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
        getLocalRelevantDate(
            record
        );


    /*
       No usable date.
    */

    if (!relevantDate) {

        return {
            ...record,
            calculated_status:
                formatLocalStatus(
                    record.status
                )
        };
    }


    const today =
        localStartOfToday();


    const recordDay =
        localStartOfDay(
            relevantDate
        );


    /*
       Future-dated local issue is upcoming.
    */

    if (
        recordDay.getTime() >
        today.getTime()
    ) {

        return {
            ...record,
            calculated_status:
                "UPCOMING"
        };
    }


    /*
       Deadline/validity ended.
    */

    if (
        record.deadline &&
        isLocalDeadlinePassed(
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
       Current local issue/event.
    */

    return {
        ...record,
        calculated_status:
            "ACTIVE"
    };
}


function getLocalRelevantDate(
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


function isLocalDeadlinePassed(
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


function formatLocalStatus(
    status
) {

    const value =
        normalizeLocalValue(
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

function updateLocalSummary(
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


    setLocalText(
        [
            "localTotalCount",
            "totalLocalCount",
            "totalCount"
        ],
        summary.total
    );


    setLocalText(
        [
            "localActiveCount",
            "activeLocalCount",
            "activeCount"
        ],
        summary.active
    );


    setLocalText(
        [
            "localUpcomingCount",
            "upcomingLocalCount",
            "upcomingCount"
        ],
        summary.upcoming
    );


    setLocalText(
        [
            "localExpiredCount",
            "expiredLocalCount",
            "expiredCount"
        ],
        summary.expired
    );


    setLocalText(
        [
            "localResolvedCount",
            "resolvedLocalCount",
            "resolvedCount"
        ],
        summary.resolved
    );
}


/* =========================================================
   13. RESULT COUNT
   ========================================================= */

function updateLocalResultCount(
    count
) {

    setLocalText(
        [
            "localResultCount",
            "resultCount",
            "contentResultCount"
        ],
        count
    );
}


/* =========================================================
   14. DISPLAY RESULTS
   ========================================================= */

function updateLocalResults(
    records
) {

    const container =
        document.getElementById(
            "localResults"
        ) ||
        document.getElementById(
            "informationResults"
        ) ||
        document.getElementById(
            "localInformation"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (records.length === 0) {

        container.innerHTML =
            createLocalEmptyState();

        return;
    }


    const sortedRecords =
        sortLocalRecords(
            records
        );


    sortedRecords.forEach(
        (record) => {

            container.insertAdjacentHTML(
                "beforeend",
                createLocalCard(
                    record
                )
            );
        }
    );
}


/* =========================================================
   15. LOCAL INFORMATION CARD
   ========================================================= */

function createLocalCard(
    record
) {

    const status =
        record.calculated_status ||
        "ACTIVE";


    const priority =
        formatLocalPriority(
            record.priority
        );


    const dateText =
        formatLocalDate(
            record
        );


    const area =
        record.local_area ||
        "All Areas";


    const subcategory =
        record.subcategory ||
        "Local Issue";


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


    /*
       Choose an icon based on local issue type.
    */

    const icon =
        getLocalCategoryIcon(
            subcategory,
            record.title
        );


    return `
        <article class="information-card local-information-card">

            <div class="information-card-top">

                <span class="information-card-category">

                    <span
                        class="category-dot"
                        style="background:#0891B2;"
                    ></span>

                    Local

                </span>


                <span class="status-badge ${getLocalStatusClass(status)}">
                    ${escapeLocalHTML(status)}
                </span>

            </div>


            <div class="information-card-title-row">

                <h3 class="information-card-title">
                    ${icon}
                    ${escapeLocalHTML(
                        record.title ||
                        "Local Information"
                    )}
                </h3>


                ${
                    priority
                        ? `
                            <span class="priority-badge ${getLocalPriorityClass(priority)}">
                                ${escapeLocalHTML(
                                    priority
                                )}
                            </span>
                          `
                        : ""
                }

            </div>


            <div class="information-subcategory">
                ${escapeLocalHTML(
                    subcategory
                )}
            </div>


            <p class="information-card-description">
                ${escapeLocalHTML(
                    description
                )}
            </p>


            <div class="information-card-meta">

                <span class="information-meta-item">
                    📍 ${escapeLocalHTML(
                        area
                    )}
                </span>


                ${
                    dateText
                        ? `
                            <span class="information-meta-item">
                                📅 ${escapeLocalHTML(
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
                                🕒 ${escapeLocalHTML(
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
                                → ${escapeLocalHTML(
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
                            ${escapeLocalHTML(
                                contact
                            )}
                        </div>
                      `
                    : ""
            }


            <div class="information-card-footer">

                <span class="information-source">
                    ${escapeLocalHTML(
                        sourceType
                    )}

                    ${
                        sourceReference
                            ? `
                                · ${escapeLocalHTML(
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
   16. LOCAL ISSUE ICON
   ========================================================= */

function getLocalCategoryIcon(
    subcategory,
    title
) {

    const text =
        normalizeLocalValue(
            `${subcategory} ${title}`
        );


    if (
        text.includes(
            "lost"
        ) ||
        text.includes(
            "found"
        )
    ) {

        return "🔎";
    }


    if (
        text.includes(
            "water"
        )
    ) {

        return "💧";
    }


    if (
        text.includes(
            "electric"
        ) ||
        text.includes(
            "power"
        )
    ) {

        return "⚡";
    }


    if (
        text.includes(
            "road"
        )
    ) {

        return "🚧";
    }


    return "📍";
}


/* =========================================================
   17. SORT LOCAL RECORDS
   ========================================================= */

function sortLocalRecords(
    records
) {

    return [...records].sort(
        (a, b) => {

            /*
               High priority first.
            */

            const priorityDifference =
                getLocalPriorityNumber(
                    a.priority
                ) -
                getLocalPriorityNumber(
                    b.priority
                );


            if (
                priorityDifference !==
                0
            ) {

                return priorityDifference;
            }


            /*
               Then by date.
            */

            const aDate =
                getLocalRelevantDate(
                    a
                );


            const bDate =
                getLocalRelevantDate(
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


function getLocalPriorityNumber(
    priority
) {

    const value =
        normalizeLocalValue(
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


/* =========================================================
   18. FORMAT DATE
   ========================================================= */

function formatLocalDate(
    record
) {

    const date =
        getLocalRelevantDate(
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
   19. STATUS CLASS
   ========================================================= */

function getLocalStatusClass(
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
   20. PRIORITY
   ========================================================= */

function formatLocalPriority(
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


function getLocalPriorityClass(
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
   21. AREA DISPLAY
   ========================================================= */

function updateLocalAreaDisplay() {

    const area =
        getSelectedLocalArea();


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

function showLocalLoading() {

    const loading =
        document.getElementById(
            "localLoading"
        );


    if (loading) {

        loading.hidden =
            false;
    }


    const error =
        document.getElementById(
            "localError"
        );


    if (error) {

        error.hidden =
            true;
    }
}


function hideLocalLoading() {

    const loading =
        document.getElementById(
            "localLoading"
        );


    if (loading) {

        loading.hidden =
            true;
    }
}


/* =========================================================
   23. ERROR STATE
   ========================================================= */

function showLocalError(
    message
) {

    const error =
        document.getElementById(
            "localError"
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
            "localResults"
        );


    if (container) {

        container.innerHTML = `
            <div class="error-box">
                ${escapeLocalHTML(
                    message
                )}
            </div>
        `;
    }
}


/* =========================================================
   24. EMPTY STATE
   ========================================================= */

function createLocalEmptyState() {

    return `
        <div class="empty-state">

            <div class="empty-icon">
                📍
            </div>

            <h3>
                No local information found
            </h3>

            <p>
                There is currently no local information
                matching the selected area and filter.
            </p>

        </div>
    `;
}


/* =========================================================
   25. TEXT HELPER
   ========================================================= */

function setLocalText(
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

function normalizeLocalValue(
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

function localStartOfToday() {

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


function localStartOfDay(
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

function escapeLocalHTML(
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

window.LocalLinkLocal = {

    loadLocalInformation,

    filterLocalByArea,

    applyLocalFilter,

    calculateLocalStatus
};