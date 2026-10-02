/* =========================================================
   LOCALLINK
   Emergencies Category JavaScript
   HTML + CSS + JavaScript version
   Data Source:
   data/thane/emergencies.csv
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const EMERGENCIES_CONFIG = {
    region: "Thane",
    file: "data/thane/emergencies.csv"
};


/* =========================================================
   2. PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeEmergenciesPage();
    }
);


async function initializeEmergenciesPage() {

    initializeEmergencyFilters();

    initializeEmergencyArea();

    await loadEmergencyInformation();
}


/* =========================================================
   3. AREA INITIALIZATION
   ========================================================= */

function initializeEmergencyArea() {

    const selectedArea =
        getSelectedEmergencyArea();


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


            await loadEmergencyInformation();
        }
    );
}


function getSelectedEmergencyArea() {

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

function initializeEmergencyFilters() {

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


                    await loadEmergencyInformation(
                        filter
                    );
                }
            );

        }
    );
}


/* =========================================================
   5. LOAD EMERGENCY INFORMATION
   ========================================================= */

async function loadEmergencyInformation(
    selectedFilter = null
) {

    showEmergencyLoading();


    try {

        const records =
            await loadEmergenciesCSV();


        const areaFilteredRecords =
            filterEmergenciesByArea(
                records
            );


        const statusRecords =
            areaFilteredRecords.map(
                calculateEmergencyStatus
            );


        const activeFilter =
            selectedFilter ||
            getActiveEmergencyFilter();


        const filteredRecords =
            applyEmergencyFilter(
                statusRecords,
                activeFilter
            );


        updateEmergencySummary(
            statusRecords
        );


        updateEmergencyResultCount(
            filteredRecords.length
        );


        updateEmergencyResults(
            filteredRecords
        );


        updateEmergencyAreaDisplay();


        hideEmergencyLoading();

    } catch (error) {

        console.error(
            "Emergency data loading failed:",
            error
        );


        hideEmergencyLoading();


        showEmergencyError(
            "Unable to load emergency information. Please run LocalLink using Live Server."
        );
    }
}


/* =========================================================
   6. LOAD EMERGENCIES CSV
   ========================================================= */

async function loadEmergenciesCSV() {

    /*
       Prefer the common csvReader.js.
    */

    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.loadCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.loadCSV(
            EMERGENCIES_CONFIG.file
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.readCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.readCSV(
            EMERGENCIES_CONFIG.file
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.fetchCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.fetchCSV(
            EMERGENCIES_CONFIG.file
        );
    }


    /*
       Fallback direct fetch.
    */

    const response =
        await fetch(
            EMERGENCIES_CONFIG.file
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load ${EMERGENCIES_CONFIG.file}`
        );
    }


    const csvText =
        await response.text();


    return parseEmergenciesCSV(
        csvText
    );
}


/* =========================================================
   7. FALLBACK CSV PARSER
   ========================================================= */

function parseEmergenciesCSV(
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
                normalizeEmergencyValue(
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

function filterEmergenciesByArea(
    records
) {

    const selectedArea =
        getSelectedEmergencyArea();


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
                normalizeEmergencyValue(
                    record.local_area
                ) ===
                normalizeEmergencyValue(
                    selectedArea
                )
            );
        }
    );
}


/* =========================================================
   9. GET ACTIVE FILTER
   ========================================================= */

function getActiveEmergencyFilter() {

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
   10. APPLY EMERGENCY FILTER
   ========================================================= */

function applyEmergencyFilter(
    records,
    filter
) {

    if (
        !filter ||
        normalizeEmergencyValue(
            filter
        ) === "all"
    ) {

        return records;
    }


    const normalizedFilter =
        normalizeEmergencyValue(
            filter
        );


    return records.filter(
        (record) => {

            const title =
                normalizeEmergencyValue(
                    record.title
                );


            const subcategory =
                normalizeEmergencyValue(
                    record.subcategory
                );


            const description =
                normalizeEmergencyValue(
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

function calculateEmergencyStatus(
    record
) {

    const suppliedStatus =
        normalizeEmergencyValue(
            record.status
        );


    /*
       Resolved remains RESOLVED.
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
       Expired remains EXPIRED.
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
        getEmergencyRelevantDate(
            record
        );


    /*
       Records without dates retain their
       supplied/default status.
    */

    if (!relevantDate) {

        return {
            ...record,
            calculated_status:
                formatEmergencyStatus(
                    record.status
                )
        };
    }


    const today =
        emergencyStartOfToday();


    const recordDay =
        emergencyStartOfDay(
            relevantDate
        );


    /*
       Future emergency information is upcoming.
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
       If a deadline exists and has passed,
       mark the information expired.
    */

    if (
        record.deadline &&
        isEmergencyDeadlinePassed(
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
       Current emergency information.
    */

    return {
        ...record,
        calculated_status:
            "ACTIVE"
    };
}


function getEmergencyRelevantDate(
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


function isEmergencyDeadlinePassed(
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


function formatEmergencyStatus(
    status
) {

    const value =
        normalizeEmergencyValue(
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

function updateEmergencySummary(
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


    setEmergencyText(
        [
            "emergenciesTotalCount",
            "totalEmergenciesCount",
            "totalCount"
        ],
        summary.total
    );


    setEmergencyText(
        [
            "emergenciesActiveCount",
            "activeEmergenciesCount",
            "activeCount"
        ],
        summary.active
    );


    setEmergencyText(
        [
            "emergenciesUpcomingCount",
            "upcomingEmergenciesCount",
            "upcomingCount"
        ],
        summary.upcoming
    );


    setEmergencyText(
        [
            "emergenciesExpiredCount",
            "expiredEmergenciesCount",
            "expiredCount"
        ],
        summary.expired
    );


    setEmergencyText(
        [
            "emergenciesResolvedCount",
            "resolvedEmergenciesCount",
            "resolvedCount"
        ],
        summary.resolved
    );
}


/* =========================================================
   13. RESULT COUNT
   ========================================================= */

function updateEmergencyResultCount(
    count
) {

    setEmergencyText(
        [
            "emergencyResultCount",
            "resultCount",
            "contentResultCount"
        ],
        count
    );
}


/* =========================================================
   14. DISPLAY RESULTS
   ========================================================= */

function updateEmergencyResults(
    records
) {

    const container =
        document.getElementById(
            "emergenciesResults"
        ) ||
        document.getElementById(
            "emergencyResults"
        ) ||
        document.getElementById(
            "informationResults"
        ) ||
        document.getElementById(
            "emergencyInformation"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (records.length === 0) {

        container.innerHTML =
            createEmergencyEmptyState();

        return;
    }


    const sortedRecords =
        sortEmergencyRecords(
            records
        );


    sortedRecords.forEach(
        (record) => {

            container.insertAdjacentHTML(
                "beforeend",
                createEmergencyCard(
                    record
                )
            );
        }
    );
}


/* =========================================================
   15. EMERGENCY INFORMATION CARD
   ========================================================= */

function createEmergencyCard(
    record
) {

    const status =
        record.calculated_status ||
        "ACTIVE";


    const priority =
        formatEmergencyPriority(
            record.priority
        );


    const dateText =
        formatEmergencyDate(
            record
        );


    const area =
        record.local_area ||
        "All Areas";


    const subcategory =
        record.subcategory ||
        "Emergency Information";


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
        getEmergencyIcon(
            subcategory,
            record.title
        );


    return `
        <article class="information-card emergency-information-card">

            <div class="information-card-top">

                <span class="information-card-category">

                    <span
                        class="category-dot"
                        style="background:#DC2626;"
                    ></span>

                    Emergencies

                </span>


                <span class="status-badge ${getEmergencyStatusClass(status)}">
                    ${escapeEmergencyHTML(status)}
                </span>

            </div>


            <div class="information-card-title-row">

                <h3 class="information-card-title">

                    ${icon}

                    ${escapeEmergencyHTML(
                        record.title ||
                        "Emergency Information"
                    )}

                </h3>


                ${
                    priority
                        ? `
                            <span class="priority-badge ${getEmergencyPriorityClass(priority)}">
                                ${escapeEmergencyHTML(
                                    priority
                                )}
                            </span>
                          `
                        : ""
                }

            </div>


            <div class="information-subcategory">
                ${escapeEmergencyHTML(
                    subcategory
                )}
            </div>


            <p class="information-card-description">
                ${escapeEmergencyHTML(
                    description
                )}
            </p>


            <div class="information-card-meta">

                <span class="information-meta-item">
                    📍 ${escapeEmergencyHTML(
                        area
                    )}
                </span>


                ${
                    dateText
                        ? `
                            <span class="information-meta-item">
                                📅 ${escapeEmergencyHTML(
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
                                🕒 ${escapeEmergencyHTML(
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
                                → ${escapeEmergencyHTML(
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
                        <div class="information-contact emergency-contact">

                            <strong>
                                Contact / Guidance:
                            </strong>

                            <span>
                                ${escapeEmergencyHTML(
                                    contact
                                )}
                            </span>

                        </div>
                      `
                    : ""
            }


            <div class="information-card-footer">

                <span class="information-source">

                    ${escapeEmergencyHTML(
                        sourceType
                    )}

                    ${
                        sourceReference
                            ? `
                                · ${escapeEmergencyHTML(
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
   16. EMERGENCY ICON
   ========================================================= */

function getEmergencyIcon(
    subcategory,
    title
) {

    const text =
        normalizeEmergencyValue(
            `${subcategory} ${title}`
        );


    if (
        text.includes(
            "police"
        )
    ) {

        return "👮";
    }


    if (
        text.includes(
            "hospital"
        )
    ) {

        return "🏥";
    }


    if (
        text.includes(
            "ambulance"
        )
    )
    {

        return "🚑";
    }


    if (
        text.includes(
            "medical"
        )
    ) {

        return "🩺";
    }


    if (
        text.includes(
            "fire"
        )
    ) {

        return "🚒";
    }


    return "🚨";
}


/* =========================================================
   17. SORT EMERGENCY RECORDS
   ========================================================= */

function sortEmergencyRecords(
    records
) {

    return [...records].sort(
        (a, b) => {

            /*
               High priority emergency information first.
            */

            const priorityDifference =
                getEmergencyPriorityNumber(
                    a.priority
                ) -
                getEmergencyPriorityNumber(
                    b.priority
                );


            if (
                priorityDifference !==
                0
            ) {

                return priorityDifference;
            }


            /*
               Active/upcoming emergency records
               before resolved/expired records.
            */

            const statusDifference =
                getEmergencyStatusOrder(
                    a.calculated_status
                ) -
                getEmergencyStatusOrder(
                    b.calculated_status
                );


            if (
                statusDifference !==
                0
            ) {

                return statusDifference;
            }


            /*
               Finally sort by date.
            */

            const aDate =
                getEmergencyRelevantDate(
                    a
                );


            const bDate =
                getEmergencyRelevantDate(
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


function getEmergencyStatusOrder(
    status
) {

    switch (
        status
    ) {

        case "ACTIVE":
            return 1;

        case "UPCOMING":
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

function formatEmergencyPriority(
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


function getEmergencyPriorityNumber(
    priority
) {

    const value =
        normalizeEmergencyValue(
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


function getEmergencyPriorityClass(
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

function formatEmergencyDate(
    record
) {

    const date =
        getEmergencyRelevantDate(
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

function getEmergencyStatusClass(
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

function updateEmergencyAreaDisplay() {

    const area =
        getSelectedEmergencyArea();


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

function showEmergencyLoading() {

    const loading =
        document.getElementById(
            "emergenciesLoading"
        ) ||
        document.getElementById(
            "emergencyLoading"
        );


    if (loading) {

        loading.hidden =
            false;
    }


    const error =
        document.getElementById(
            "emergenciesError"
        ) ||
        document.getElementById(
            "emergencyError"
        );


    if (error) {

        error.hidden =
            true;
    }
}


function hideEmergencyLoading() {

    const loading =
        document.getElementById(
            "emergenciesLoading"
        ) ||
        document.getElementById(
            "emergencyLoading"
        );


    if (loading) {

        loading.hidden =
            true;
    }
}


/* =========================================================
   23. ERROR STATE
   ========================================================= */

function showEmergencyError(
    message
) {

    const error =
        document.getElementById(
            "emergenciesError"
        ) ||
        document.getElementById(
            "emergencyError"
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
            "emergenciesResults"
        ) ||
        document.getElementById(
            "emergencyResults"
        );


    if (container) {

        container.innerHTML = `
            <div class="error-box">

                ${escapeEmergencyHTML(
                    message
                )}

            </div>
        `;
    }
}


/* =========================================================
   24. EMPTY STATE
   ========================================================= */

function createEmergencyEmptyState() {

    return `
        <div class="empty-state">

            <div class="empty-icon">
                🚨
            </div>

            <h3>
                No emergency information found
            </h3>

            <p>
                There is currently no emergency information
                matching the selected area and filter.
            </p>

        </div>
    `;
}


/* =========================================================
   25. TEXT HELPER
   ========================================================= */

function setEmergencyText(
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

function normalizeEmergencyValue(
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

function emergencyStartOfToday() {

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


function emergencyStartOfDay(
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

function escapeEmergencyHTML(
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

window.LocalLinkEmergencies = {

    loadEmergencyInformation,

    filterEmergenciesByArea,

    applyEmergencyFilter,

    calculateEmergencyStatus
};