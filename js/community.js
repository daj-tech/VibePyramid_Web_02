/* =========================================================
   LOCALLINK
   Community Category JavaScript
   HTML + CSS + JavaScript version
   Data Source:
   data/thane/community.csv
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const COMMUNITY_CONFIG = {
    region: "Thane",
    file: "data/thane/community.csv"
};


/* =========================================================
   2. PAGE START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeCommunityPage();
    }
);


async function initializeCommunityPage() {

    initializeCommunityFilters();

    initializeCommunityArea();

    await loadCommunityInformation();
}


/* =========================================================
   3. INITIALIZE AREA
   ========================================================= */

function initializeCommunityArea() {

    const selectedArea =
        getSelectedCommunityArea();


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


            await loadCommunityInformation();
        }
    );
}


function getSelectedCommunityArea() {

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

function initializeCommunityFilters() {

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


                    await loadCommunityInformation(
                        filter
                    );
                }
            );

        }
    );
}


/* =========================================================
   5. LOAD COMMUNITY INFORMATION
   ========================================================= */

async function loadCommunityInformation(
    selectedFilter = null
) {

    showCommunityLoading();


    try {

        const records =
            await loadCommunityCSV();


        const areaFilteredRecords =
            filterCommunityByArea(
                records
            );


        const statusRecords =
            areaFilteredRecords.map(
                calculateCommunityStatus
            );


        const activeFilter =
            selectedFilter ||
            getActiveCommunityFilter();


        const filteredRecords =
            applyCommunityFilter(
                statusRecords,
                activeFilter
            );


        updateCommunitySummary(
            statusRecords
        );


        updateCommunityResultCount(
            filteredRecords.length
        );


        updateCommunityResults(
            filteredRecords
        );


        updateCommunityAreaDisplay();


        hideCommunityLoading();

    } catch (error) {

        console.error(
            "Community data loading failed:",
            error
        );


        hideCommunityLoading();


        showCommunityError(
            "Unable to load community information. Please run LocalLink using Live Server."
        );
    }
}


/* =========================================================
   6. LOAD COMMUNITY CSV
   ========================================================= */

async function loadCommunityCSV() {

    /*
       Use the common csvReader.js first.
    */

    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.loadCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.loadCSV(
            COMMUNITY_CONFIG.file
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.readCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.readCSV(
            COMMUNITY_CONFIG.file
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.fetchCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.fetchCSV(
            COMMUNITY_CONFIG.file
        );
    }


    /*
       Fallback direct fetch.
    */

    const response =
        await fetch(
            COMMUNITY_CONFIG.file
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load ${COMMUNITY_CONFIG.file}`
        );
    }


    const csvText =
        await response.text();


    return parseCommunityCSV(
        csvText
    );
}


/* =========================================================
   7. FALLBACK CSV PARSER
   ========================================================= */

function parseCommunityCSV(
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
           Escaped quotation mark
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
           Quotation boundary
        */

        if (char === '"') {

            insideQuotes =
                !insideQuotes;

            continue;
        }


        /*
           Column separator
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
           Row separator
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
       Add last row
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
                normalizeCommunityValue(
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

function filterCommunityByArea(
    records
) {

    const selectedArea =
        getSelectedCommunityArea();


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
                normalizeCommunityValue(
                    record.local_area
                ) ===
                normalizeCommunityValue(
                    selectedArea
                )
            );
        }
    );
}


/* =========================================================
   9. ACTIVE FILTER
   ========================================================= */

function getActiveCommunityFilter() {

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
   10. COMMUNITY FILTER
   ========================================================= */

function applyCommunityFilter(
    records,
    filter
) {

    if (
        !filter ||
        normalizeCommunityValue(
            filter
        ) === "all"
    ) {

        return records;
    }


    const normalizedFilter =
        normalizeCommunityValue(
            filter
        );


    return records.filter(
        (record) => {

            const subcategory =
                normalizeCommunityValue(
                    record.subcategory
                );


            const title =
                normalizeCommunityValue(
                    record.title
                );


            const description =
                normalizeCommunityValue(
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

function calculateCommunityStatus(
    record
) {

    const suppliedStatus =
        normalizeCommunityValue(
            record.status
        );


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
        getCommunityRelevantDate(
            record
        );


    /*
       Records without a usable date retain
       their supplied status.
    */

    if (!relevantDate) {

        return {
            ...record,
            calculated_status:
                formatCommunityStatus(
                    record.status
                )
        };
    }


    const today =
        communityStartOfToday();


    const recordDay =
        communityStartOfDay(
            relevantDate
        );


    /*
       Future-dated information is upcoming.
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
       Deadline-based information can expire.
    */

    if (
        record.deadline &&
        isCommunityDeadlinePassed(
            record
        )
    ) {

        return {
            ...record,
            calculated_status:
                "EXPIRED"
        };
    }


    return {
        ...record,
        calculated_status:
            "ACTIVE"
    };
}


function getCommunityRelevantDate(
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


function isCommunityDeadlinePassed(
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


function formatCommunityStatus(
    status
) {

    const value =
        normalizeCommunityValue(
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

function updateCommunitySummary(
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


    setCommunityText(
        [
            "communityTotalCount",
            "totalCommunityCount",
            "totalCount"
        ],
        summary.total
    );


    setCommunityText(
        [
            "communityActiveCount",
            "activeCommunityCount",
            "activeCount"
        ],
        summary.active
    );


    setCommunityText(
        [
            "communityUpcomingCount",
            "upcomingCommunityCount",
            "upcomingCount"
        ],
        summary.upcoming
    );


    setCommunityText(
        [
            "communityExpiredCount",
            "expiredCommunityCount",
            "expiredCount"
        ],
        summary.expired
    );


    setCommunityText(
        [
            "communityResolvedCount",
            "resolvedCommunityCount",
            "resolvedCount"
        ],
        summary.resolved
    );
}


/* =========================================================
   13. RESULT COUNT
   ========================================================= */

function updateCommunityResultCount(
    count
) {

    setCommunityText(
        [
            "communityResultCount",
            "resultCount",
            "contentResultCount"
        ],
        count
    );
}


/* =========================================================
   14. DISPLAY RESULTS
   ========================================================= */

function updateCommunityResults(
    records
) {

    const container =
        document.getElementById(
            "communityResults"
        ) ||
        document.getElementById(
            "informationResults"
        ) ||
        document.getElementById(
            "communityInformation"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (records.length === 0) {

        container.innerHTML =
            createCommunityEmptyState();

        return;
    }


    const sortedRecords =
        sortCommunityRecords(
            records
        );


    sortedRecords.forEach(
        (record) => {

            container.insertAdjacentHTML(
                "beforeend",
                createCommunityCard(
                    record
                )
            );
        }
    );
}


/* =========================================================
   15. COMMUNITY INFORMATION CARD
   ========================================================= */

function createCommunityCard(
    record
) {

    const status =
        record.calculated_status ||
        "ACTIVE";


    const priority =
        formatCommunityPriority(
            record.priority
        );


    const dateText =
        formatCommunityDate(
            record
        );


    const area =
        record.local_area ||
        "All Areas";


    const subcategory =
        record.subcategory ||
        "Community Information";


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
        <article class="information-card community-information-card">

            <div class="information-card-top">

                <span class="information-card-category">

                    <span
                        class="category-dot"
                        style="background:#0F766E;"
                    ></span>

                    Community

                </span>


                <span class="status-badge ${getCommunityStatusClass(status)}">
                    ${escapeCommunityHTML(status)}
                </span>

            </div>


            <div class="information-card-title-row">

                <h3 class="information-card-title">
                    ${escapeCommunityHTML(
                        record.title ||
                        "Community Information"
                    )}
                </h3>


                ${
                    priority
                        ? `
                            <span class="priority-badge ${getCommunityPriorityClass(priority)}">
                                ${escapeCommunityHTML(priority)}
                            </span>
                          `
                        : ""
                }

            </div>


            <div class="information-subcategory">
                ${escapeCommunityHTML(
                    subcategory
                )}
            </div>


            <p class="information-card-description">
                ${escapeCommunityHTML(
                    description
                )}
            </p>


            <div class="information-card-meta">

                <span class="information-meta-item">
                    📍 ${escapeCommunityHTML(
                        area
                    )}
                </span>


                ${
                    dateText
                        ? `
                            <span class="information-meta-item">
                                📅 ${escapeCommunityHTML(
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
                                🕒 ${escapeCommunityHTML(
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
                            ${escapeCommunityHTML(
                                contact
                            )}
                        </div>
                      `
                    : ""
            }


            <div class="information-card-footer">

                <span class="information-source">
                    ${escapeCommunityHTML(
                        sourceType
                    )}

                    ${
                        sourceReference
                            ? `
                                · ${escapeCommunityHTML(
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
   16. SORT COMMUNITY RECORDS
   ========================================================= */

function sortCommunityRecords(
    records
) {

    return [...records].sort(
        (a, b) => {

            const priorityDifference =
                getCommunityPriorityNumber(
                    a.priority
                ) -
                getCommunityPriorityNumber(
                    b.priority
                );


            if (
                priorityDifference !==
                0
            ) {

                return priorityDifference;
            }


            const aDate =
                getCommunityRelevantDate(
                    a
                );


            const bDate =
                getCommunityRelevantDate(
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


function getCommunityPriorityNumber(
    priority
) {

    const value =
        normalizeCommunityValue(
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

function formatCommunityDate(
    record
) {

    const date =
        getCommunityRelevantDate(
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
   18. STATUS CLASS
   ========================================================= */

function getCommunityStatusClass(
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
   19. PRIORITY CLASS
   ========================================================= */

function formatCommunityPriority(
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


function getCommunityPriorityClass(
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
   20. AREA DISPLAY
   ========================================================= */

function updateCommunityAreaDisplay() {

    const area =
        getSelectedCommunityArea();


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

function showCommunityLoading() {

    const loading =
        document.getElementById(
            "communityLoading"
        );


    if (loading) {

        loading.hidden =
            false;
    }


    const error =
        document.getElementById(
            "communityError"
        );


    if (error) {

        error.hidden =
            true;
    }
}


function hideCommunityLoading() {

    const loading =
        document.getElementById(
            "communityLoading"
        );


    if (loading) {

        loading.hidden =
            true;
    }
}


/* =========================================================
   22. ERROR STATE
   ========================================================= */

function showCommunityError(
    message
) {

    const error =
        document.getElementById(
            "communityError"
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
            "communityResults"
        );


    if (container) {

        container.innerHTML = `
            <div class="error-box">
                ${escapeCommunityHTML(
                    message
                )}
            </div>
        `;
    }
}


/* =========================================================
   23. EMPTY STATE
   ========================================================= */

function createCommunityEmptyState() {

    return `
        <div class="empty-state">

            <div class="empty-icon">
                👥
            </div>

            <h3>
                No community information found
            </h3>

            <p>
                There is currently no community information
                matching the selected area and filter.
            </p>

        </div>
    `;
}


/* =========================================================
   24. TEXT HELPER
   ========================================================= */

function setCommunityText(
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

function normalizeCommunityValue(
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

function communityStartOfToday() {

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


function communityStartOfDay(
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

function escapeCommunityHTML(
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

window.LocalLinkCommunity = {

    loadCommunityInformation,

    filterCommunityByArea,

    applyCommunityFilter,

    calculateCommunityStatus
};