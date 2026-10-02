/* =========================================================
   LOCALLINK
   Internships & Skills Category JavaScript
   HTML + CSS + JavaScript version
   Data Source:
   data/thane/internships_skills.csv
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const INTERNSHIPS_SKILLS_CONFIG = {
    region: "Thane",
    file: "data/thane/internships_skills.csv"
};


/* =========================================================
   2. PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeInternshipsSkillsPage();
    }
);


async function initializeInternshipsSkillsPage() {

    initializeInternshipsSkillsFilters();

    initializeInternshipsSkillsArea();

    await loadInternshipsSkillsInformation();
}


/* =========================================================
   3. AREA INITIALIZATION
   ========================================================= */

function initializeInternshipsSkillsArea() {

    const selectedArea =
        getSelectedInternshipsSkillsArea();


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
       or another LocalLink page/script.
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


            await loadInternshipsSkillsInformation();
        }
    );
}


function getSelectedInternshipsSkillsArea() {

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

function initializeInternshipsSkillsFilters() {

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


                    await loadInternshipsSkillsInformation(
                        filter
                    );
                }
            );

        }
    );
}


/* =========================================================
   5. LOAD INFORMATION
   ========================================================= */

async function loadInternshipsSkillsInformation(
    selectedFilter = null
) {

    showInternshipsSkillsLoading();


    try {

        const records =
            await loadInternshipsSkillsCSV();


        const areaFilteredRecords =
            filterInternshipsSkillsByArea(
                records
            );


        const statusRecords =
            areaFilteredRecords.map(
                calculateInternshipsSkillsStatus
            );


        const activeFilter =
            selectedFilter ||
            getActiveInternshipsSkillsFilter();


        const filteredRecords =
            applyInternshipsSkillsFilter(
                statusRecords,
                activeFilter
            );


        updateInternshipsSkillsSummary(
            statusRecords
        );


        updateInternshipsSkillsResultCount(
            filteredRecords.length
        );


        updateInternshipsSkillsResults(
            filteredRecords
        );


        updateInternshipsSkillsAreaDisplay();


        hideInternshipsSkillsLoading();

    } catch (error) {

        console.error(
            "Internships & Skills data loading failed:",
            error
        );


        hideInternshipsSkillsLoading();


        showInternshipsSkillsError(
            "Unable to load internships and skills information. Please run LocalLink using Live Server."
        );
    }
}


/* =========================================================
   6. LOAD CSV
   ========================================================= */

async function loadInternshipsSkillsCSV() {

    /*
       Prefer common csvReader.js.
    */

    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.loadCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.loadCSV(
            INTERNSHIPS_SKILLS_CONFIG.file
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.readCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.readCSV(
            INTERNSHIPS_SKILLS_CONFIG.file
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.fetchCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.fetchCSV(
            INTERNSHIPS_SKILLS_CONFIG.file
        );
    }


    /*
       Fallback direct fetch.
    */

    const response =
        await fetch(
            INTERNSHIPS_SKILLS_CONFIG.file
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load ${INTERNSHIPS_SKILLS_CONFIG.file}`
        );
    }


    const csvText =
        await response.text();


    return parseInternshipsSkillsCSV(
        csvText
    );
}


/* =========================================================
   7. FALLBACK CSV PARSER
   ========================================================= */

function parseInternshipsSkillsCSV(
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
       Last row.
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
                normalizeInternshipsSkillsValue(
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

function filterInternshipsSkillsByArea(
    records
) {

    const selectedArea =
        getSelectedInternshipsSkillsArea();


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
                normalizeInternshipsSkillsValue(
                    record.local_area
                ) ===
                normalizeInternshipsSkillsValue(
                    selectedArea
                )
            );
        }
    );
}


/* =========================================================
   9. GET ACTIVE FILTER
   ========================================================= */

function getActiveInternshipsSkillsFilter() {

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
   10. APPLY FILTER
   ========================================================= */

function applyInternshipsSkillsFilter(
    records,
    filter
) {

    if (
        !filter ||
        normalizeInternshipsSkillsValue(
            filter
        ) === "all"
    ) {

        return records;
    }


    const normalizedFilter =
        normalizeInternshipsSkillsValue(
            filter
        );


    return records.filter(
        (record) => {

            const title =
                normalizeInternshipsSkillsValue(
                    record.title
                );


            const subcategory =
                normalizeInternshipsSkillsValue(
                    record.subcategory
                );


            const description =
                normalizeInternshipsSkillsValue(
                    record.description
                );


            return (
                title.includes(
                    normalizedFilter
                ) ||
                subcategory.includes(
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

function calculateInternshipsSkillsStatus(
    record
) {

    const suppliedStatus =
        normalizeInternshipsSkillsValue(
            record.status
        );


    /*
       Preserve RESOLVED.
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
       Preserve EXPIRED.
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
        getInternshipsSkillsRelevantDate(
            record
        );


    if (!relevantDate) {

        return {
            ...record,
            calculated_status:
                formatInternshipsSkillsStatus(
                    record.status
                )
        };
    }


    const today =
        internshipsSkillsStartOfToday();


    const recordDay =
        internshipsSkillsStartOfDay(
            relevantDate
        );


    /*
       Future event/deadline.
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
       Expired deadline.
    */

    if (
        record.deadline &&
        isInternshipsSkillsDeadlinePassed(
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


function getInternshipsSkillsRelevantDate(
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


function isInternshipsSkillsDeadlinePassed(
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


function formatInternshipsSkillsStatus(
    status
) {

    const value =
        normalizeInternshipsSkillsValue(
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

function updateInternshipsSkillsSummary(
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


    setInternshipsSkillsText(
        [
            "internshipsSkillsTotalCount",
            "totalInternshipsSkillsCount",
            "totalCount"
        ],
        summary.total
    );


    setInternshipsSkillsText(
        [
            "internshipsSkillsActiveCount",
            "activeInternshipsSkillsCount",
            "activeCount"
        ],
        summary.active
    );


    setInternshipsSkillsText(
        [
            "internshipsSkillsUpcomingCount",
            "upcomingInternshipsSkillsCount",
            "upcomingCount"
        ],
        summary.upcoming
    );


    setInternshipsSkillsText(
        [
            "internshipsSkillsExpiredCount",
            "expiredInternshipsSkillsCount",
            "expiredCount"
        ],
        summary.expired
    );


    setInternshipsSkillsText(
        [
            "internshipsSkillsResolvedCount",
            "resolvedInternshipsSkillsCount",
            "resolvedCount"
        ],
        summary.resolved
    );
}


/* =========================================================
   13. RESULT COUNT
   ========================================================= */

function updateInternshipsSkillsResultCount(
    count
) {

    setInternshipsSkillsText(
        [
            "internshipsSkillsResultCount",
            "resultCount",
            "contentResultCount"
        ],
        count
    );
}


/* =========================================================
   14. DISPLAY RESULTS
   ========================================================= */

function updateInternshipsSkillsResults(records) {

    const container =
        document.getElementById(
            "internshipsSkillsResults"
        ) ||
        document.getElementById(
            "informationResults"
        ) ||
        document.getElementById(
            "internshipsSkillsInformation"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (records.length === 0) {

        container.innerHTML =
            createInternshipsSkillsEmptyState();

        return;
    }


    const sortedRecords =
        sortInternshipsSkillsRecords(
            records
        );


    sortedRecords.forEach(
        (record) => {

            container.insertAdjacentHTML(
                "beforeend",
                createInternshipsSkillsCard(
                    record
                )
            );
        }
    );
}


/* =========================================================
   15. INFORMATION CARD
   ========================================================= */

function createInternshipsSkillsCard(
    record
) {

    const status =
        record.calculated_status ||
        "ACTIVE";


    const priority =
        formatInternshipsSkillsPriority(
            record.priority
        );


    const dateText =
        formatInternshipsSkillsDate(
            record
        );


    const area =
        record.local_area ||
        "All Areas";


    const subcategory =
        record.subcategory ||
        "Internships & Skills";


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
        <article class="information-card internships-skills-information-card">

            <div class="information-card-top">

                <span class="information-card-category">

                    <span
                        class="category-dot"
                        style="background:#7C3AED;"
                    ></span>

                    Internships &amp; Skills

                </span>


                <span class="status-badge ${getInternshipsSkillsStatusClass(status)}">
                    ${escapeInternshipsSkillsHTML(
                        status
                    )}
                </span>

            </div>


            <div class="information-card-title-row">

                <h3 class="information-card-title">
                    ${escapeInternshipsSkillsHTML(
                        record.title ||
                        "Internship or Skill Opportunity"
                    )}
                </h3>


                ${
                    priority
                        ? `
                            <span class="priority-badge ${getInternshipsSkillsPriorityClass(priority)}">
                                ${escapeInternshipsSkillsHTML(
                                    priority
                                )}
                            </span>
                          `
                        : ""
                }

            </div>


            <div class="information-subcategory">
                ${escapeInternshipsSkillsHTML(
                    subcategory
                )}
            </div>


            <p class="information-card-description">
                ${escapeInternshipsSkillsHTML(
                    description
                )}
            </p>


            <div class="information-card-meta">

                <span class="information-meta-item">
                    📍 ${escapeInternshipsSkillsHTML(
                        area
                    )}
                </span>


                ${
                    dateText
                        ? `
                            <span class="information-meta-item">
                                📅 ${escapeInternshipsSkillsHTML(
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
                                🕒 ${escapeInternshipsSkillsHTML(
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
                            ${escapeInternshipsSkillsHTML(
                                contact
                            )}
                        </div>
                      `
                    : ""
            }


            <div class="information-card-footer">

                <span class="information-source">
                    ${escapeInternshipsSkillsHTML(
                        sourceType
                    )}

                    ${
                        sourceReference
                            ? `
                                · ${escapeInternshipsSkillsHTML(
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
   16. SORT RECORDS
   ========================================================= */

function sortInternshipsSkillsRecords(
    records
) {

    return [...records].sort(
        (a, b) => {

            /*
               High priority information first.
            */

            const priorityDifference =
                getInternshipsSkillsPriorityNumber(
                    a.priority
                ) -
                getInternshipsSkillsPriorityNumber(
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
                getInternshipsSkillsRelevantDate(
                    a
                );


            const bDate =
                getInternshipsSkillsRelevantDate(
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


function getInternshipsSkillsPriorityNumber(
    priority
) {

    const value =
        normalizeInternshipsSkillsValue(
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

function formatInternshipsSkillsDate(
    record
) {

    const date =
        getInternshipsSkillsRelevantDate(
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

function getInternshipsSkillsStatusClass(
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

function formatInternshipsSkillsPriority(
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


function getInternshipsSkillsPriorityClass(
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

function updateInternshipsSkillsAreaDisplay() {

    const area =
        getSelectedInternshipsSkillsArea();


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

function showInternshipsSkillsLoading() {

    const loading =
        document.getElementById(
            "internshipsSkillsLoading"
        );


    if (loading) {

        loading.hidden =
            false;
    }


    const error =
        document.getElementById(
            "internshipsSkillsError"
        );


    if (error) {

        error.hidden =
            true;
    }
}


function hideInternshipsSkillsLoading() {

    const loading =
        document.getElementById(
            "internshipsSkillsLoading"
        );


    if (loading) {

        loading.hidden =
            true;
    }
}


/* =========================================================
   22. ERROR STATE
   ========================================================= */

function showInternshipsSkillsError(
    message
) {

    const error =
        document.getElementById(
            "internshipsSkillsError"
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
            "internshipsSkillsResults"
        );


    if (container) {

        container.innerHTML = `
            <div class="error-box">
                ${escapeInternshipsSkillsHTML(
                    message
                )}
            </div>
        `;
    }
}


/* =========================================================
   23. EMPTY STATE
   ========================================================= */

function createInternshipsSkillsEmptyState() {

    return `
        <div class="empty-state">

            <div class="empty-icon">
                💼
            </div>

            <h3>
                No opportunities found
            </h3>

            <p>
                There is currently no internship or skills
                information matching the selected area and filter.
            </p>

        </div>
    `;
}


/* =========================================================
   24. TEXT HELPER
   ========================================================= */

function setInternshipsSkillsText(
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

function normalizeInternshipsSkillsValue(
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

function internshipsSkillsStartOfToday() {

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


function internshipsSkillsStartOfDay(
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

function escapeInternshipsSkillsHTML(
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

window.LocalLinkInternshipsSkills = {

    loadInternshipsSkillsInformation,

    filterInternshipsSkillsByArea,

    applyInternshipsSkillsFilter,

    calculateInternshipsSkillsStatus
};