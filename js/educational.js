/* =========================================================
   LOCALLINK
   Educational Category JavaScript
   HTML + CSS + JavaScript version
   Data Source:
   data/thane/educational.csv
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const EDUCATIONAL_CONFIG = {
    region: "Thane",
    file: "data/thane/educational.csv"
};


/* =========================================================
   2. PAGE START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeEducationalPage();
    }
);


async function initializeEducationalPage() {

    /*
       Make sure the page contains the educational
       category container before running the script.
    */

    const pageElement =
        document.querySelector(
            ".educational-page"
        ) ||
        document.querySelector(
            "[data-category='educational']"
        ) ||
        document.getElementById(
            "educationalPage"
        );

    /*
       If no specific page marker exists, continue anyway
       because the actual HTML may use only the result IDs.
    */

    initializeEducationalFilters();

    initializeEducationalArea();

    await loadEducationalInformation();
}


/* =========================================================
   3. INITIALIZE AREA
   ========================================================= */

function initializeEducationalArea() {

    const areaDisplay =
        document.getElementById(
            "selectedAreaDisplay"
        );


    const areaName =
        document.getElementById(
            "selectedAreaName"
        );


    const selectedArea =
        getSelectedEducationalArea();


    if (areaDisplay) {

        areaDisplay.textContent =
            selectedArea;
    }


    if (areaName) {

        areaName.textContent =
            selectedArea;
    }


    /*
       Listen for area changes coming from
       main.js / other LocalLink pages.
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


            await loadEducationalInformation();
        }
    );
}


function getSelectedEducationalArea() {

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

function initializeEducationalFilters() {

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
                        (item) =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    const filter =
                        button.dataset.filter ||
                        button.textContent.trim();


                    await loadEducationalInformation(
                        filter
                    );
                }
            );

        }
    );
}


/* =========================================================
   5. LOAD EDUCATIONAL DATA
   ========================================================= */

async function loadEducationalInformation(
    selectedFilter = null
) {

    showEducationalLoading();


    try {

        const records =
            await loadEducationalCSV();


        const areaFilteredRecords =
            filterEducationalByArea(
                records
            );


        const statusRecords =
            areaFilteredRecords.map(
                calculateEducationalStatus
            );


        const activeFilter =
            selectedFilter ||
            getActiveEducationalFilter();


        const filteredRecords =
            applyEducationalFilter(
                statusRecords,
                activeFilter
            );


        updateEducationalSummary(
            statusRecords
        );


        updateEducationalResults(
            filteredRecords
        );


        updateEducationalResultCount(
            filteredRecords.length
        );


        updateEducationalAreaDisplay();


        hideEducationalLoading();

    } catch (error) {

        console.error(
            "Educational data loading failed:",
            error
        );


        hideEducationalLoading();

        showEducationalError(
            "Unable to load educational information. Please run LocalLink using Live Server."
        );
    }
}


/* =========================================================
   6. CSV LOADER
   ========================================================= */

async function loadEducationalCSV() {

    /*
       Use csvReader.js when available.
    */

    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.loadCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.loadCSV(
            EDUCATIONAL_CONFIG.file
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.readCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.readCSV(
            EDUCATIONAL_CONFIG.file
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.fetchCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.fetchCSV(
            EDUCATIONAL_CONFIG.file
        );
    }


    /*
       Fallback fetch.
    */

    const response =
        await fetch(
            EDUCATIONAL_CONFIG.file
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load ${EDUCATIONAL_CONFIG.file}`
        );
    }


    const csvText =
        await response.text();


    return parseEducationalCSV(
        csvText
    );
}


/* =========================================================
   7. FALLBACK CSV PARSER
   ========================================================= */

function parseEducationalCSV(
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
           Escaped quote
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
           Start/end quotation
        */

        if (char === '"') {

            insideQuotes =
                !insideQuotes;

            continue;
        }


        /*
           New column
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
           New row
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
       Last row
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
                normalizeEducationalValue(
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

function filterEducationalByArea(
    records
) {

    const selectedArea =
        getSelectedEducationalArea();


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
                normalizeEducationalValue(
                    record.local_area
                ) ===
                normalizeEducationalValue(
                    selectedArea
                )
            );
        }
    );
}


/* =========================================================
   9. GET ACTIVE FILTER
   ========================================================= */

function getActiveEducationalFilter() {

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
   10. APPLY CATEGORY FILTER
   ========================================================= */

function applyEducationalFilter(
    records,
    filter
) {

    if (
        !filter ||
        normalizeEducationalValue(
            filter
        ) === "all"
    ) {

        return records;
    }


    const normalizedFilter =
        normalizeEducationalValue(
            filter
        );


    return records.filter(
        (record) => {

            const subcategory =
                normalizeEducationalValue(
                    record.subcategory
                );


            const title =
                normalizeEducationalValue(
                    record.title
                );


            /*
               Match the selected filter against
               both subcategory and title.
            */

            return (
                subcategory.includes(
                    normalizedFilter
                ) ||
                title.includes(
                    normalizedFilter
                )
            );
        }
    );
}


/* =========================================================
   11. STATUS CALCULATION
   ========================================================= */

function calculateEducationalStatus(
    record
) {

    const suppliedStatus =
        normalizeEducationalValue(
            record.status
        );


    /*
       RESOLVED should remain RESOLVED.
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
       Explicitly expired.
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


    const date =
        getEducationalRelevantDate(
            record
        );


    /*
       No usable date.
    */

    if (!date) {

        return {
            ...record,
            calculated_status:
                formatEducationalStatus(
                    record.status
                )
        };
    }


    const today =
        getEducationalStartOfToday();


    const recordDay =
        getEducationalStartOfDay(
            date
        );


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
       If deadline has passed, mark as expired.
    */

    if (
        record.deadline &&
        isEducationalDeadlinePassed(
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
       Otherwise retain active state.
    */

    return {
        ...record,
        calculated_status:
            "ACTIVE"
    };
}


function getEducationalRelevantDate(
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


function isEducationalDeadlinePassed(
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


function formatEducationalStatus(
    status
) {

    const normalized =
        normalizeEducationalValue(
            status
        );


    if (
        normalized ===
        "upcoming"
    ) {
        return "UPCOMING";
    }


    if (
        normalized ===
        "expired"
    ) {
        return "EXPIRED";
    }


    if (
        normalized ===
        "resolved"
    ) {
        return "RESOLVED";
    }


    return "ACTIVE";
}


/* =========================================================
   12. UPDATE SUMMARY CARDS
   ========================================================= */

function updateEducationalSummary(
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


    setEducationalText(
        [
            "educationalTotalCount",
            "totalEducationalCount",
            "totalCount"
        ],
        summary.total
    );


    setEducationalText(
        [
            "educationalActiveCount",
            "activeEducationalCount",
            "activeCount"
        ],
        summary.active
    );


    setEducationalText(
        [
            "educationalUpcomingCount",
            "upcomingEducationalCount",
            "upcomingCount"
        ],
        summary.upcoming
    );


    setEducationalText(
        [
            "educationalExpiredCount",
            "expiredEducationalCount",
            "expiredCount"
        ],
        summary.expired
    );


    setEducationalText(
        [
            "educationalResolvedCount",
            "resolvedEducationalCount",
            "resolvedCount"
        ],
        summary.resolved
    );
}


/* =========================================================
   13. UPDATE RESULT COUNT
   ========================================================= */

function updateEducationalResultCount(
    count
) {

    setEducationalText(
        [
            "educationalResultCount",
            "resultCount",
            "contentResultCount"
        ],
        count
    );
}


/* =========================================================
   14. DISPLAY RESULTS
   ========================================================= */

function updateEducationalResults(
    records
) {

    const container =
        document.getElementById(
            "educationalResults"
        ) ||
        document.getElementById(
            "informationResults"
        ) ||
        document.getElementById(
            "educationalInformation"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (records.length === 0) {

        const emptyState =
            document.getElementById(
                "educationalEmpty"
            );


        if (emptyState) {

            emptyState.hidden =
                false;

            /*
               Do not append the same node
               into another parent.
            */

            container.appendChild(
                emptyState
            );

        } else {

            container.innerHTML =
                createEducationalEmptyState();

        }


        return;
    }


    const sortedRecords =
        sortEducationalRecords(
            records
        );


    sortedRecords.forEach(
        (record) => {

            container.insertAdjacentHTML(
                "beforeend",
                createEducationalCard(
                    record
                )
            );
        }
    );
}


/* =========================================================
   15. EDUCATIONAL INFORMATION CARD
   ========================================================= */

function createEducationalCard(
    record
) {

    const status =
        record.calculated_status ||
        "ACTIVE";


    const priority =
        formatEducationalPriority(
            record.priority
        );


    const dateText =
        formatEducationalDate(
            record
        );


    const area =
        record.local_area ||
        "All Areas";


    const subcategory =
        record.subcategory ||
        "Educational Information";


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


    return `
        <article class="information-card">

            <div class="information-card-top">

                <span class="information-card-category">
                    <span
                        class="category-dot"
                        style="background:#2563EB;"
                    ></span>

                    Educational
                </span>


                <span class="status-badge ${getEducationalStatusClass(status)}">
                    ${escapeEducationalHTML(status)}
                </span>

            </div>


            <div class="information-card-title-row">

                <h3 class="information-card-title">
                    ${escapeEducationalHTML(
                        record.title ||
                        "Educational Information"
                    )}
                </h3>


                ${
                    priority
                        ? `
                            <span class="priority-badge ${getEducationalPriorityClass(priority)}">
                                ${escapeEducationalHTML(priority)}
                            </span>
                          `
                        : ""
                }

            </div>


            <div class="information-subcategory">
                ${escapeEducationalHTML(
                    subcategory
                )}
            </div>


            <p class="information-card-description">
                ${escapeEducationalHTML(
                    description
                )}
            </p>


            <div class="information-card-meta">

                <span class="information-meta-item">
                    📍 ${escapeEducationalHTML(
                        area
                    )}
                </span>


                ${
                    dateText
                        ? `
                            <span class="information-meta-item">
                                📅 ${escapeEducationalHTML(
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
                                🕒 ${escapeEducationalHTML(
                                    record.start_time
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
                            ${escapeEducationalHTML(
                                contact
                            )}
                        </div>
                      `
                    : ""
            }


            <div class="information-card-footer">

                <span class="information-source">
                    ${escapeEducationalHTML(
                        sourceType
                    )}

                    ${
                        sourceReference
                            ? `
                                · ${escapeEducationalHTML(
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
   16. SORT RESULTS
   ========================================================= */

function sortEducationalRecords(
    records
) {

    return [...records].sort(
        (a, b) => {

            /*
               Priority first.
            */

            const priorityDifference =
                getPriorityNumber(
                    a.priority
                ) -
                getPriorityNumber(
                    b.priority
                );


            if (
                priorityDifference !==
                0
            ) {

                return priorityDifference;
            }


            /*
               Then sort by date.
            */

            const aDate =
                getEducationalRelevantDate(
                    a
                );


            const bDate =
                getEducationalRelevantDate(
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


function getPriorityNumber(
    priority
) {

    const value =
        normalizeEducationalValue(
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
   17. FORMAT DATE
   ========================================================= */

function formatEducationalDate(
    record
) {

    const date =
        getEducationalRelevantDate(
            record
        );


    if (!date) {
        return "";
    }


    let formatted =
        date.toLocaleDateString(
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


    if (
        record.deadline &&
        !record.event_date
    ) {

        formatted =
            `Deadline: ${formatted}`;
    }


    return formatted;
}


/* =========================================================
   18. STATUS CSS CLASS
   ========================================================= */

function getEducationalStatusClass(
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
   19. PRIORITY
   ========================================================= */

function formatEducationalPriority(
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


function getEducationalPriorityClass(
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
   20. AREA DISPLAY UPDATE
   ========================================================= */

function updateEducationalAreaDisplay() {

    const area =
        getSelectedEducationalArea();


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
   21. LOADING STATE
   ========================================================= */

function showEducationalLoading() {

    const loading =
        document.getElementById(
            "educationalLoading"
        );


    if (loading) {

        loading.hidden =
            false;

    }


    const error =
        document.getElementById(
            "educationalError"
        );


    if (error) {

        error.hidden =
            true;
    }
}


function hideEducationalLoading() {

    const loading =
        document.getElementById(
            "educationalLoading"
        );


    if (loading) {

        loading.hidden =
            true;
    }
}


/* =========================================================
   22. ERROR STATE
   ========================================================= */

function showEducationalError(
    message
) {

    const error =
        document.getElementById(
            "educationalError"
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
            "educationalResults"
        );


    if (container) {

        container.innerHTML = `
            <div class="error-box">
                ${escapeEducationalHTML(
                    message
                )}
            </div>
        `;
    }
}


/* =========================================================
   23. EMPTY STATE
   ========================================================= */

function createEducationalEmptyState() {

    return `
        <div class="empty-state">

            <div class="empty-icon">
                🎓
            </div>

            <h3>
                No educational information found
            </h3>

            <p>
                There is currently no educational information
                matching the selected area and filter.
            </p>

        </div>
    `;
}


/* =========================================================
   24. TEXT HELPER
   ========================================================= */

function setEducationalText(
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
   25. NORMALIZE VALUE
   ========================================================= */

function normalizeEducationalValue(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();
}


/* =========================================================
   26. DATE HELPERS
   ========================================================= */

function getEducationalStartOfToday() {

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


function getEducationalStartOfDay(
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
   27. HTML ESCAPING
   ========================================================= */

function escapeEducationalHTML(
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
   28. PUBLIC API
   ========================================================= */

window.LocalLinkEducational = {

    loadEducationalInformation,

    filterEducationalByArea,

    applyEducationalFilter,

    calculateEducationalStatus
};