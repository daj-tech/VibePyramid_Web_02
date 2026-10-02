/* =========================================================
   LOCALLINK
   Calendar JavaScript
   HTML + CSS + JavaScript version
   Data Source:
   data/thane/*.csv
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const CALENDAR_CONFIG = {

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
   2. CALENDAR STATE
   ========================================================= */

let calendarCurrentDate =
    new Date();

let calendarSelectedDate =
    null;

let calendarAllRecords = [];

let calendarFilteredRecords = [];

let calendarActiveCategory =
    "all";


/* =========================================================
   3. PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeCalendarPage();
    }
);


async function initializeCalendarPage() {

    initializeCalendarControls();

    initializeCalendarCategoryFilters();

    initializeCalendarAreaListener();

    updateCalendarAreaDisplay();

    await loadCalendarInformation();
}


/* =========================================================
   4. CALENDAR CONTROLS
   ========================================================= */

function initializeCalendarControls() {

    const previousButton =
        document.getElementById(
            "calendarPrevious"
        ) ||
        document.getElementById(
            "previousMonth"
        ) ||
        document.querySelector(
            "[data-calendar-action='previous']"
        );


    const nextButton =
        document.getElementById(
            "calendarNext"
        ) ||
        document.getElementById(
            "nextMonth"
        ) ||
        document.querySelector(
            "[data-calendar-action='next']"
        );


    const todayButton =
        document.getElementById(
            "calendarToday"
        ) ||
        document.getElementById(
            "todayButton"
        ) ||
        document.querySelector(
            "[data-calendar-action='today']"
        );


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                calendarCurrentDate =
                    new Date(
                        calendarCurrentDate.getFullYear(),
                        calendarCurrentDate.getMonth() - 1,
                        1
                    );

                renderCalendar();

            }
        );
    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                calendarCurrentDate =
                    new Date(
                        calendarCurrentDate.getFullYear(),
                        calendarCurrentDate.getMonth() + 1,
                        1
                    );

                renderCalendar();

            }
        );
    }


    if (todayButton) {

        todayButton.addEventListener(
            "click",
            () => {

                calendarCurrentDate =
                    new Date();

                calendarSelectedDate =
                    new Date();

                renderCalendar();

                showSelectedCalendarDate(
                    calendarSelectedDate
                );

            }
        );
    }
}


/* =========================================================
   5. CATEGORY FILTERS
   ========================================================= */

function initializeCalendarCategoryFilters() {

    const filterButtons =
        document.querySelectorAll(
            ".calendar-category-filter, .filter-button"
        );


    filterButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    /*
                       Only handle buttons that belong
                       to the calendar section.
                    */

                    const filter =
                        button.dataset.category ||
                        button.dataset.filter;


                    if (!filter) {
                        return;
                    }


                    calendarActiveCategory =
                        normalizeCalendarValue(
                            filter
                        );


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


                    applyCalendarCategoryFilter();

                    renderCalendar();

                }
            );

        }
    );
}


/* =========================================================
   6. AREA CHANGE LISTENER
   ========================================================= */

function initializeCalendarAreaListener() {

    window.addEventListener(
        "locallinkAreaChanged",
        async (event) => {

            const area =
                event.detail?.area ||
                "All Areas";


            updateCalendarAreaDisplay(
                area
            );


            await loadCalendarInformation();
        }
    );
}


/* =========================================================
   7. GET SELECTED AREA
   ========================================================= */

function getSelectedCalendarArea() {

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
   8. AREA DISPLAY
   ========================================================= */

function updateCalendarAreaDisplay(
    area = null
) {

    const selectedArea =
        area ||
        getSelectedCalendarArea();


    const elements =
        document.querySelectorAll(
            "#selectedAreaDisplay, #selectedAreaName, #navArea"
        );


    elements.forEach(
        (element) => {

            element.textContent =
                selectedArea;
        }
    );
}


/* =========================================================
   9. LOAD ALL CALENDAR DATA
   ========================================================= */

async function loadCalendarInformation() {

    showCalendarLoading();


    try {

        const categoryEntries =
            Object.entries(
                CALENDAR_CONFIG.categories
            );


        const results =
            await Promise.all(
                categoryEntries.map(
                    async ([key, category]) => {

                        const records =
                            await loadCalendarCSV(
                                category.file
                            );


                        return records.map(
                            (record) => {

                                return {
                                    ...record,

                                    calendarCategory:
                                        key,

                                    calendarCategoryName:
                                        category.name,

                                    calendarPage:
                                        category.page
                                };

                            }
                        );

                    }
                )
            );


        calendarAllRecords =
            results.flat();


        calendarAllRecords =
            calendarAllRecords.map(
                calculateCalendarStatus
            );


        applyCalendarAreaFilter();

        applyCalendarCategoryFilter();

        renderCalendar();

        updateUpcomingInformation();

        updateCalendarReminderPanel();

        updateCalendarRecordCount();

        hideCalendarLoading();

    } catch (error) {

        console.error(
            "Calendar data loading failed:",
            error
        );


        hideCalendarLoading();


        showCalendarError(
            "Unable to load calendar information. Please run LocalLink using Live Server."
        );
    }
}


/* =========================================================
   10. LOAD INDIVIDUAL CSV
   ========================================================= */

async function loadCalendarCSV(
    filePath
) {

    /*
       Use common csvReader.js if available.
    */

    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.loadCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.loadCSV(
            filePath
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.readCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.readCSV(
            filePath
        );
    }


    if (
        window.LocalLinkCSV &&
        typeof window.LocalLinkCSV.fetchCSV ===
            "function"
    ) {

        return await window.LocalLinkCSV.fetchCSV(
            filePath
        );
    }


    /*
       Fallback.
    */

    const response =
        await fetch(
            filePath
        );


    if (!response.ok) {

        throw new Error(
            `Unable to load ${filePath}`
        );
    }


    const text =
        await response.text();


    return parseCalendarCSV(
        text
    );
}


/* =========================================================
   11. FALLBACK CSV PARSER
   ========================================================= */

function parseCalendarCSV(
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


        if (
            char === '"' &&
            nextChar === '"'
        ) {

            currentValue += '"';

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

            currentRow.push(
                currentValue.trim()
            );

            currentValue = "";

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
                normalizeCalendarValue(
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
   12. CALCULATE RECORD STATUS
   ========================================================= */

function calculateCalendarStatus(
    record
) {

    const suppliedStatus =
        normalizeCalendarValue(
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


    const date =
        getCalendarRecordDate(
            record
        );


    if (!date) {

        return {
            ...record,
            calculated_status:
                formatCalendarStatus(
                    record.status
                )
        };
    }


    const today =
        calendarStartOfToday();


    const recordDay =
        calendarStartOfDay(
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


    if (
        record.deadline &&
        isCalendarDeadlinePassed(
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


/* =========================================================
   13. AREA FILTER
   ========================================================= */

function applyCalendarAreaFilter() {

    const selectedArea =
        getSelectedCalendarArea();


    if (
        !selectedArea ||
        selectedArea ===
            "All Areas"
    ) {

        calendarFilteredRecords =
            [...calendarAllRecords];

        return;
    }


    calendarFilteredRecords =
        calendarAllRecords.filter(
            (record) => {

                return (
                    normalizeCalendarValue(
                        record.local_area
                    ) ===
                    normalizeCalendarValue(
                        selectedArea
                    )
                );
            }
        );
}


/* =========================================================
   14. CATEGORY FILTER
   ========================================================= */

function applyCalendarCategoryFilter() {

    if (
        !calendarActiveCategory ||
        calendarActiveCategory ===
            "all"
    ) {

        /*
           Area filtering was already applied.
        */

        return;
    }


    const normalizedCategory =
        normalizeCalendarValue(
            calendarActiveCategory
        );


    calendarFilteredRecords =
        calendarFilteredRecords.filter(
            (record) => {

                const category =
                    normalizeCalendarValue(
                        record.calendarCategory
                    );


                const categoryName =
                    normalizeCalendarValue(
                        record.calendarCategoryName
                    );


                return (
                    category ===
                        normalizedCategory ||
                    categoryName ===
                        normalizedCategory
                );

            }
        );
}


/* =========================================================
   15. RENDER CALENDAR
   ========================================================= */

function renderCalendar() {

    const calendarGrid =
        document.getElementById(
            "calendarGrid"
        );


    if (!calendarGrid) {
        return;
    }


    const year =
        calendarCurrentDate.getFullYear();


    const month =
        calendarCurrentDate.getMonth();


    updateCalendarMonthTitle(
        year,
        month
    );


    calendarGrid.innerHTML = "";


    /*
       Weekday headings.
    */

    const weekdays = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];


    weekdays.forEach(
        (day) => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "calendar-weekday";


            element.textContent =
                day;


            calendarGrid.appendChild(
                element
            );
        }
    );


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /*
       Empty cells before first day.
    */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const emptyCell =
            document.createElement(
                "div"
            );


        emptyCell.className =
            "calendar-day calendar-day-empty";


        calendarGrid.appendChild(
            emptyCell
        );
    }


    /*
       Actual month days.
    */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dayElement =
            document.createElement(
                "button"
            );


        dayElement.type =
            "button";


        dayElement.className =
            "calendar-day";


        const date =
            new Date(
                year,
                month,
                day
            );


        const dateKey =
            formatDateKey(
                date
            );


        const todayKey =
            formatDateKey(
                new Date()
            );


        if (
            dateKey ===
            todayKey
        ) {

            dayElement.classList.add(
                "calendar-day-today"
            );
        }


        if (
            calendarSelectedDate &&
            dateKey ===
                formatDateKey(
                    calendarSelectedDate
                )
        ) {

            dayElement.classList.add(
                "calendar-day-selected"
            );
        }


        const dayRecords =
            getRecordsForDate(
                date
            );


        if (dayRecords.length > 0) {

            dayElement.classList.add(
                "calendar-day-has-events"
            );
        }


        dayElement.innerHTML = `
            <span class="calendar-day-number">
                ${day}
            </span>

            <span class="calendar-event-dots">
                ${createCalendarEventDots(
                    dayRecords
                )}
            </span>
        `;


        dayElement.addEventListener(
            "click",
            () => {

                calendarSelectedDate =
                    new Date(
                        date
                    );


                renderCalendar();

                showSelectedCalendarDate(
                    calendarSelectedDate
                );

            }
        );


        calendarGrid.appendChild(
            dayElement
        );
    }


    /*
       Automatically show today's date
       on first render when nothing is selected.
    */

    if (!calendarSelectedDate) {

        const today =
            new Date();


        if (
            today.getFullYear() ===
                year &&
            today.getMonth() ===
                month
        ) {

            calendarSelectedDate =
                today;

            showSelectedCalendarDate(
                today
            );
        }
    }
}


/* =========================================================
   16. MONTH TITLE
   ========================================================= */

function updateCalendarMonthTitle(
    year,
    month
) {

    const title =
        document.getElementById(
            "calendarMonthTitle"
        ) ||
        document.getElementById(
            "calendarCurrentMonth"
        ) ||
        document.querySelector(
            ".calendar-month-title"
        );


    if (!title) {
        return;
    }


    title.textContent =
        new Date(
            year,
            month,
            1
        ).toLocaleDateString(
            "en-IN",
            {
                month:
                    "long",

                year:
                    "numeric"
            }
        );
}


/* =========================================================
   17. GET RECORDS FOR DATE
   ========================================================= */

function getRecordsForDate(
    date
) {

    const dateKey =
        formatDateKey(
            date
        );


    return calendarFilteredRecords.filter(
        (record) => {

            const recordDate =
                getCalendarRecordDate(
                    record
                );


            if (!recordDate) {
                return false;
            }


            return (
                formatDateKey(
                    recordDate
                ) ===
                dateKey
            );
        }
    );
}


/* =========================================================
   18. EVENT DOTS
   ========================================================= */

function createCalendarEventDots(
    records
) {

    if (
        !records ||
        records.length === 0
    ) {

        return "";
    }


    const displayedRecords =
        records.slice(
            0,
            4
        );


    return displayedRecords
        .map(
            (record) => {

                return `
                    <span
                        class="calendar-event-dot"
                        title="${escapeCalendarHTML(
                            record.title ||
                            "Information"
                        )}"
                    ></span>
                `;
            }
        )
        .join("");
}


/* =========================================================
   19. SELECTED DATE PANEL
   ========================================================= */

function showSelectedCalendarDate(
    date
) {

    const title =
        document.getElementById(
            "selectedDateTitle"
        ) ||
        document.getElementById(
            "selectedDate"
        );


    const container =
        document.getElementById(
            "selectedDateInformation"
        ) ||
        document.getElementById(
            "selectedDatePanel"
        );


    if (title) {

        title.textContent =
            date.toLocaleDateString(
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


    if (!container) {
        return;
    }


    const records =
        getRecordsForDate(
            date
        );


    /*
       Do not destroy the outer selected date panel.
       Find a dedicated list when possible.
    */

    const list =
        container.querySelector(
            ".selected-date-list"
        ) ||
        document.getElementById(
            "selectedDateList"
        );


    if (list) {

        list.innerHTML = "";


        if (records.length === 0) {

            list.innerHTML = `
                <div class="empty-state small-empty-state">

                    <div class="empty-icon">
                        📭
                    </div>

                    <p>
                        No information scheduled for this date.
                    </p>

                </div>
            `;

            return;
        }


        records.forEach(
            (record) => {

                list.insertAdjacentHTML(
                    "beforeend",
                    createCalendarUpcomingCard(
                        record
                    )
                );
            }
        );

        return;
    }


    /*
       Fallback if the HTML uses the entire panel
       as the dynamic container.
    */

    container.innerHTML = `
        <div class="selected-date-panel-inner">

            <h3>
                ${escapeCalendarHTML(
                    date.toLocaleDateString(
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
                    )
                )}
            </h3>

            <div class="selected-date-list">

                ${
                    records.length === 0
                        ? `
                            <div class="empty-state small-empty-state">

                                <div class="empty-icon">
                                    📭
                                </div>

                                <p>
                                    No information scheduled for this date.
                                </p>

                            </div>
                          `
                        : records
                            .map(
                                createCalendarUpcomingCard
                            )
                            .join("")
                }

            </div>

        </div>
    `;
}


/* =========================================================
   20. CALENDAR INFORMATION CARD
   ========================================================= */

function createCalendarUpcomingCard(
    record
) {

    const status =
        record.calculated_status ||
        "ACTIVE";


    const category =
        record.calendarCategoryName ||
        "Information";


    const area =
        record.local_area ||
        "All Areas";


    const date =
        formatCalendarRecordDate(
            record
        );


    return `
        <article class="upcoming-card">

            <div class="upcoming-card-top">

                <span>
                    ${escapeCalendarHTML(
                        category
                    )}
                </span>

                <span class="status-badge ${getCalendarStatusClass(status)}">
                    ${escapeCalendarHTML(
                        status
                    )}
                </span>

            </div>


            <h4>
                ${escapeCalendarHTML(
                    record.title ||
                    "Local Information"
                )}
            </h4>


            ${
                record.subcategory
                    ? `
                        <p>
                            ${escapeCalendarHTML(
                                record.subcategory
                            )}
                        </p>
                      `
                    : ""
            }


            <div class="information-card-meta">

                <span class="information-meta-item">
                    📍 ${escapeCalendarHTML(
                        area
                    )}
                </span>


                ${
                    date
                        ? `
                            <span class="information-meta-item">
                                📅 ${escapeCalendarHTML(
                                    date
                                )}
                            </span>
                          `
                        : ""
                }


                ${
                    record.start_time
                        ? `
                            <span class="information-meta-item">
                                🕒 ${escapeCalendarHTML(
                                    record.start_time
                                )}
                            </span>
                          `
                        : ""
                }

            </div>

        </article>
    `;
}


/* =========================================================
   21. UPCOMING INFORMATION
   ========================================================= */

function updateUpcomingInformation() {

    const container =
        document.getElementById(
            "upcomingInformation"
        ) ||
        document.getElementById(
            "upcomingList"
        );


    if (!container) {
        return;
    }


    const today =
        calendarStartOfToday();


    const upcoming =
        calendarFilteredRecords
            .filter(
                (record) => {

                    const date =
                        getCalendarRecordDate(
                            record
                        );


                    if (!date) {
                        return false;
                    }


                    return (
                        date.getTime() >=
                        today.getTime()
                    );
                }
            )
            .sort(
                compareCalendarDates
            )
            .slice(
                0,
                8
            );


    container.innerHTML = "";


    if (upcoming.length === 0) {

        container.innerHTML = `
            <div class="empty-state small-empty-state">

                <div class="empty-icon">
                    📅
                </div>

                <p>
                    No upcoming information found.
                </p>

            </div>
        `;

        return;
    }


    upcoming.forEach(
        (record) => {

            container.insertAdjacentHTML(
                "beforeend",
                createCalendarUpcomingCard(
                    record
                )
            );
        }
    );
}


/* =========================================================
   22. REMINDER PANEL
   ========================================================= */

function updateCalendarReminderPanel() {

    const container =
        document.getElementById(
            "calendarReminderPanel"
        ) ||
        document.getElementById(
            "reminderPanel"
        );


    if (!container) {
        return;
    }


    const notificationSetting =
        localStorage.getItem(
            "locallink_notifications"
        );


    const enabled =
        notificationSetting ===
        "true";


    const notificationText =
        enabled
            ? "Notifications are enabled."
            : "Notifications are currently disabled.";


    container.innerHTML = `
        <div class="calendar-reminder-content">

            <div class="calendar-reminder-icon">
                🔔
            </div>

            <div>

                <strong>
                    LocalLink Reminders
                </strong>

                <p>
                    ${escapeCalendarHTML(
                        notificationText
                    )}
                </p>

                <p>
                    Information can be reviewed
                    before important dates and deadlines.
                </p>

            </div>

        </div>
    `;
}


/* =========================================================
   23. RECORD COUNT
   ========================================================= */

function updateCalendarRecordCount() {

    const elements =
        document.querySelectorAll(
            "#calendarRecordCount, #recordCount, #calendarResultCount"
        );


    elements.forEach(
        (element) => {

            element.textContent =
                String(
                    calendarFilteredRecords.length
                );

        }
    );
}


/* =========================================================
   24. DATE HELPERS
   ========================================================= */

function getCalendarRecordDate(
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


function formatCalendarRecordDate(
    record
) {

    const date =
        getCalendarRecordDate(
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


function formatDateKey(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


function calendarStartOfToday() {

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


function calendarStartOfDay(
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


function isCalendarDeadlinePassed(
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


/* =========================================================
   25. STATUS HELPERS
   ========================================================= */

function formatCalendarStatus(
    status
) {

    const normalized =
        normalizeCalendarValue(
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


function getCalendarStatusClass(
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
   26. DATE COMPARISON
   ========================================================= */

function compareCalendarDates(
    first,
    second
) {

    const firstDate =
        getCalendarRecordDate(
            first
        );


    const secondDate =
        getCalendarRecordDate(
            second
        );


    if (!firstDate && !secondDate) {
        return 0;
    }


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
   27. LOADING STATE
   ========================================================= */

function showCalendarLoading() {

    const loading =
        document.getElementById(
            "calendarLoading"
        );


    if (loading) {

        loading.hidden =
            false;
    }


    const error =
        document.getElementById(
            "calendarError"
        );


    if (error) {

        error.hidden =
            true;
    }
}


function hideCalendarLoading() {

    const loading =
        document.getElementById(
            "calendarLoading"
        );


    if (loading) {

        loading.hidden =
            true;
    }
}


/* =========================================================
   28. ERROR STATE
   ========================================================= */

function showCalendarError(
    message
) {

    const error =
        document.getElementById(
            "calendarError"
        );


    if (error) {

        error.hidden =
            false;

        error.textContent =
            message;

        return;
    }


    const grid =
        document.getElementById(
            "calendarGrid"
        );


    if (grid) {

        grid.innerHTML = `
            <div class="error-box">
                ${escapeCalendarHTML(
                    message
                )}
            </div>
        `;
    }
}


/* =========================================================
   29. NORMALIZE VALUE
   ========================================================= */

function normalizeCalendarValue(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();
}


/* =========================================================
   30. HTML ESCAPING
   ========================================================= */

function escapeCalendarHTML(
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
   31. PUBLIC API
   ========================================================= */

window.LocalLinkCalendar = {

    loadCalendarInformation,

    renderCalendar,

    showSelectedCalendarDate,

    getRecordsForDate,

    updateUpcomingInformation
};