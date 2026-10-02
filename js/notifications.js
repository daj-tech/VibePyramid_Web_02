/* =========================================================
   LOCALLINK
   Notifications JavaScript
   HTML + CSS + JavaScript version
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const NOTIFICATIONS_CONFIG = {

    storageKeys: {

        enabled:
            "locallink_notifications",

        reminderDays:
            "locallink_reminder_days",

        area:
            "locallink_area",

        user:
            "locallink_user"
    },

    defaultReminderDays: 3,

    icon:
        "assets/icons/icon-192.png"
};


/* =========================================================
   2. NOTIFICATION INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeNotifications();
    }
);


function initializeNotifications() {

    initializeNotificationButtons();

    updateNotificationUI();

    registerNotificationServiceWorker();
}


/* =========================================================
   3. NOTIFICATION BUTTONS
   ========================================================= */

function initializeNotificationButtons() {

    const enableButtons =
        document.querySelectorAll(
            "#notificationButton, #enableNotificationsButton"
        );


    enableButtons.forEach(
        (button) => {

            /*
               Avoid duplicate listeners if main.js
               has already attached one.
            */

            if (
                button.dataset
                    .locallinkNotificationBound ===
                "true"
            ) {

                return;
            }


            button.dataset
                .locallinkNotificationBound =
                "true";


            button.addEventListener(
                "click",
                async () => {

                    await enableNotifications();

                }
            );
        }
    );


    const testButtons =
        document.querySelectorAll(
            "#testNotificationButton, #sendTestNotification"
        );


    testButtons.forEach(
        (button) => {

            if (
                button.dataset
                    .locallinkTestNotificationBound ===
                "true"
            ) {

                return;
            }


            button.dataset
                .locallinkTestNotificationBound =
                "true";


            button.addEventListener(
                "click",
                async () => {

                    await showTestNotification();

                }
            );
        }
    );
}


/* =========================================================
   4. CHECK SUPPORT
   ========================================================= */

function notificationsSupported() {

    return (
        "Notification" in window
    );
}


/* =========================================================
   5. GET PERMISSION
   ========================================================= */

function getNotificationPermission() {

    if (
        !notificationsSupported()
    ) {

        return "unsupported";
    }


    return Notification.permission;
}


/* =========================================================
   6. GET ENABLED STATE
   ========================================================= */

function areNotificationsEnabled() {

    return (
        localStorage.getItem(
            NOTIFICATIONS_CONFIG
                .storageKeys.enabled
        ) === "true"
    );
}


/* =========================================================
   7. ENABLE NOTIFICATIONS
   ========================================================= */

async function enableNotifications() {

    if (
        !notificationsSupported()
    ) {

        showNotificationMessage(
            "This browser does not support notifications.",
            "error"
        );

        return false;
    }


    try {

        let permission =
            Notification.permission;


        if (
            permission !==
            "granted"
        ) {

            permission =
                await Notification.requestPermission();
        }


        if (
            permission !==
            "granted"
        ) {

            localStorage.setItem(
                NOTIFICATIONS_CONFIG
                    .storageKeys.enabled,
                "false"
            );


            updateNotificationUI();


            showNotificationMessage(
                "Notification permission was not granted.",
                "error"
            );


            return false;
        }


        localStorage.setItem(
            NOTIFICATIONS_CONFIG
                .storageKeys.enabled,
            "true"
        );


        updateNotificationUI();


        showNotificationMessage(
            "LocalLink notifications are enabled.",
            "success"
        );


        return true;

    } catch (error) {

        console.error(
            "Notification permission error:",
            error
        );


        showNotificationMessage(
            "Unable to enable notifications.",
            "error"
        );


        return false;
    }
}


/* =========================================================
   8. DISABLE NOTIFICATIONS
   ========================================================= */

function disableNotifications() {

    localStorage.setItem(
        NOTIFICATIONS_CONFIG
            .storageKeys.enabled,
        "false"
    );


    updateNotificationUI();


    showNotificationMessage(
        "LocalLink notifications are disabled.",
        "success"
    );
}


/* =========================================================
   9. TOGGLE NOTIFICATIONS
   ========================================================= */

async function toggleNotifications() {

    if (
        areNotificationsEnabled()
    ) {

        disableNotifications();

        return false;
    }


    return await enableNotifications();
}


/* =========================================================
   10. SHOW TEST NOTIFICATION
   ========================================================= */

async function showTestNotification() {

    if (
        !notificationsSupported()
    ) {

        showNotificationMessage(
            "Your browser does not support notifications.",
            "error"
        );

        return false;
    }


    /*
       Ask for permission when needed.
    */

    if (
        Notification.permission !==
        "granted"
    ) {

        const enabled =
            await enableNotifications();


        if (!enabled) {
            return false;
        }
    }


    try {

        /*
           Use service worker notification when
           possible, which is more suitable for PWA.
        */

        if (
            "serviceWorker" in
            navigator
        ) {

            const registration =
                await navigator
                    .serviceWorker
                    .getRegistration();


            if (
                registration &&
                typeof registration.showNotification ===
                    "function"
            ) {

                await registration
                    .showNotification(
                        "LocalLink",
                        {
                            body:
                                "This is a test notification from LocalLink.",

                            icon:
                                NOTIFICATIONS_CONFIG
                                    .icon,

                            badge:
                                NOTIFICATIONS_CONFIG
                                    .icon,

                            tag:
                                "locallink-test",

                            data: {
                                url:
                                    "dashboard.html"
                            }
                        }
                    );


                return true;
            }
        }


        /*
           Browser fallback.
        */

        new Notification(
            "LocalLink",
            {
                body:
                    "This is a test notification from LocalLink.",

                icon:
                    NOTIFICATIONS_CONFIG
                        .icon,

                tag:
                    "locallink-test"
            }
        );


        return true;

    } catch (error) {

        console.error(
            "Unable to show test notification:",
            error
        );


        showNotificationMessage(
            "Unable to display the test notification.",
            "error"
        );


        return false;
    }
}


/* =========================================================
   11. SHOW LOCAL INFORMATION NOTIFICATION
   ========================================================= */

async function showInformationNotification(
    record
) {

    if (
        !record
    ) {

        return false;
    }


    if (
        !notificationsSupported()
    ) {

        return false;
    }


    /*
       Notifications must be allowed first.
    */

    if (
        Notification.permission !==
        "granted"
    ) {

        return false;
    }


    const title =
        record.title ||
        "LocalLink Information";


    const category =
        record.category ||
        "Local Information";


    const area =
        record.local_area ||
        "All Areas";


    const eventDate =
        record.event_date ||
        record.deadline ||
        "";


    const bodyParts = [];


    bodyParts.push(
        `${category} • ${area}`
    );


    if (eventDate) {

        bodyParts.push(
            `Date: ${eventDate}`
        );
    }


    if (
        record.description
    ) {

        bodyParts.push(
            record.description
        );
    }


    const body =
        bodyParts.join(
            " | "
        );


    try {

        if (
            "serviceWorker" in
            navigator
        ) {

            const registration =
                await navigator
                    .serviceWorker
                    .getRegistration();


            if (
                registration &&
                typeof registration.showNotification ===
                    "function"
            ) {

                await registration.showNotification(
                    title,
                    {
                        body,

                        icon:
                            NOTIFICATIONS_CONFIG
                                .icon,

                        badge:
                            NOTIFICATIONS_CONFIG
                                .icon,

                        tag:
                            `locallink-${record.id || Date.now()}`,

                        data: {
                            url:
                                getNotificationRecordURL(
                                    record
                                )
                        }
                    }
                );


                return true;
            }
        }


        new Notification(
            title,
            {
                body,

                icon:
                    NOTIFICATIONS_CONFIG
                        .icon,

                tag:
                    `locallink-${record.id || Date.now()}`
            }
        );


        return true;

    } catch (error) {

        console.error(
            "Unable to show information notification:",
            error
        );


        return false;
    }
}


/* =========================================================
   12. RECORD URL
   ========================================================= */

function getNotificationRecordURL(
    record
) {

    const category =
        normalizeNotificationValue(
            record.category
        );


    switch (
        category
    ) {

        case "educational":
            return "educational.html";

        case "community":
            return "community.html";

        case "internships":
        case "internships & skills":
        case "internships skills":
            return "internships-skills.html";

        case "local":
            return "local.html";

        case "events":
            return "events.html";

        case "emergencies":
        case "emergency":
            return "emergencies.html";

        default:
            return "dashboard.html";
    }
}


/* =========================================================
   13. LOAD REMINDER DAYS
   ========================================================= */

function getReminderDays() {

    const value =
        localStorage.getItem(
            NOTIFICATIONS_CONFIG
                .storageKeys.reminderDays
        );


    const number =
        Number(
            value
        );


    if (
        Number.isNaN(number) ||
        number < 0
    ) {

        return NOTIFICATIONS_CONFIG
            .defaultReminderDays;
    }


    return number;
}


/* =========================================================
   14. SAVE REMINDER DAYS
   ========================================================= */

function saveReminderDays(
    days
) {

    const number =
        Number(
            days
        );


    if (
        Number.isNaN(number) ||
        number < 0
    ) {

        return false;
    }


    localStorage.setItem(
        NOTIFICATIONS_CONFIG
            .storageKeys.reminderDays,
        String(number)
    );


    showNotificationMessage(
        `Reminder timing set to ${number} day(s) before.`,
        "success"
    );


    return true;
}


/* =========================================================
   15. CHECK RECORD REMINDER
   ========================================================= */

function shouldNotifyForRecord(
    record,
    today = new Date()
) {

    if (
        !record ||
        !areNotificationsEnabled()
    ) {

        return false;
    }


    if (
        !notificationsSupported() ||
        Notification.permission !==
            "granted"
    ) {

        return false;
    }


    const reminderDays =
        getReminderDays();


    const recordDate =
        getNotificationRecordDate(
            record
        );


    if (!recordDate) {
        return false;
    }


    const targetDate =
        notificationStartOfDay(
            recordDate
        );


    const currentDate =
        notificationStartOfDay(
            today
        );


    const difference =
        Math.round(
            (
                targetDate.getTime() -
                currentDate.getTime()
            ) /
            86400000
        );


    /*
       Notify at the configured number of days
       before the event/deadline.
    */

    if (
        difference !==
        reminderDays
    ) {

        return false;
    }


    /*
       If the CSV provides notification_days_before,
       respect it when possible.
    */

    if (
        record.notification_days_before
    ) {

        const datasetDays =
            Number(
                record.notification_days_before
            );


        if (
            !Number.isNaN(
                datasetDays
            ) &&
            datasetDays !==
                reminderDays
        ) {

            return false;
        }
    }


    return true;
}


/* =========================================================
   16. PROCESS REMINDERS
   ========================================================= */

async function processRecordReminders(
    records
) {

    if (
        !Array.isArray(
            records
        )
    ) {

        return 0;
    }


    if (
        !areNotificationsEnabled()
    ) {

        return 0;
    }


    let sentCount = 0;


    const today =
        new Date();


    for (
        const record of records
    ) {

        if (
            shouldNotifyForRecord(
                record,
                today
            )
        ) {

            const alreadyShown =
                hasReminderBeenShown(
                    record,
                    today
                );


            if (
                alreadyShown
            ) {

                continue;
            }


            const sent =
                await showInformationNotification(
                    record
                );


            if (sent) {

                rememberReminder(
                    record,
                    today
                );


                sentCount++;
            }
        }
    }


    return sentCount;
}


/* =========================================================
   17. REMINDER STORAGE
   ========================================================= */

const REMINDER_HISTORY_KEY =
    "locallink_reminder_history";


function getReminderHistory() {

    const data =
        localStorage.getItem(
            REMINDER_HISTORY_KEY
        );


    if (!data) {
        return {};
    }


    try {

        const parsed =
            JSON.parse(
                data
            );


        return (
            parsed &&
            typeof parsed === "object"
                ? parsed
                : {}
        );

    } catch (error) {

        console.error(
            "Unable to read reminder history:",
            error
        );


        return {};
    }
}


function getReminderIdentifier(
    record
) {

    return (
        record.id ||
        `${record.title || "information"}-${record.event_date || record.deadline || ""}`
    );
}


function getReminderDateKey(
    date
) {

    return date
        .toISOString()
        .split("T")[0];
}


function hasReminderBeenShown(
    record,
    date
) {

    const history =
        getReminderHistory();


    const recordId =
        getReminderIdentifier(
            record
        );


    const dateKey =
        getReminderDateKey(
            date
        );


    return Boolean(
        history[
            `${recordId}-${dateKey}`
        ]
    );
}


function rememberReminder(
    record,
    date
) {

    const history =
        getReminderHistory();


    const recordId =
        getReminderIdentifier(
            record
        );


    const dateKey =
        getReminderDateKey(
            date
        );


    history[
        `${recordId}-${dateKey}`
    ] = {
        shownAt:
            new Date().toISOString()
    };


    /*
       Keep history from becoming unnecessarily large.
    */

    const entries =
        Object.entries(
            history
        );


    if (
        entries.length >
        200
    ) {

        entries
            .slice(
                0,
                entries.length - 200
            )
            .forEach(
                ([key]) => {

                    delete history[key];

                }
            );
    }


    localStorage.setItem(
        REMINDER_HISTORY_KEY,
        JSON.stringify(
            history
        )
    );
}


/* =========================================================
   18. GET RECORD DATE
   ========================================================= */

function getNotificationRecordDate(
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


/* =========================================================
   19. DATE HELPER
   ========================================================= */

function notificationStartOfDay(
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
   20. SERVICE WORKER
   ========================================================= */

async function registerNotificationServiceWorker() {

    if (
        !("serviceWorker" in
            navigator)
    ) {

        return null;
    }


    try {

        const registration =
            await navigator
                .serviceWorker
                .register(
                    "service-worker.js"
                );


        console.log(
            "LocalLink notification service worker registered:",
            registration.scope
        );


        return registration;

    } catch (error) {

        console.error(
            "Notification service worker registration failed:",
            error
        );


        return null;
    }
}


/* =========================================================
   21. UPDATE NOTIFICATION UI
   ========================================================= */

function updateNotificationUI() {

    const enabled =
        areNotificationsEnabled();


    const permission =
        getNotificationPermission();


    const statusElements =
        document.querySelectorAll(
            "#notificationStatus, #notificationPermission, [data-notification-status]"
        );


    statusElements.forEach(
        (element) => {

            if (
                element.id ===
                "notificationPermission"
            ) {

                element.textContent =
                    permission;
            } else {

                element.textContent =
                    enabled
                        ? "Notifications are enabled."
                        : "Notifications are disabled.";
            }
        }
    );


    const toggle =
        document.getElementById(
            "notificationToggle"
        );


    if (toggle) {

        toggle.dataset.enabled =
            enabled
                ? "true"
                : "false";


        toggle.classList.toggle(
            "active",
            enabled
        );


        toggle.setAttribute(
            "aria-pressed",
            enabled
                ? "true"
                : "false"
        );


        const circle =
            toggle.querySelector(
                ".toggle-circle"
            );


        if (circle) {

            circle.textContent =
                enabled
                    ? "✓"
                    : "";
        }


        const label =
            toggle.querySelector(
                ".toggle-label"
            );


        if (label) {

            label.textContent =
                enabled
                    ? "Enabled"
                    : "Disabled";
        }
    }


    const enableButton =
        document.getElementById(
            "enableNotificationsButton"
        );


    if (enableButton) {

        enableButton.textContent =
            enabled
                ? "Notifications Enabled"
                : "Enable Notifications";
    }
}


/* =========================================================
   22. MESSAGE HELPER
   ========================================================= */

function showNotificationMessage(
    message,
    type = "success"
) {

    /*
       Use main.js helper when available.
    */

    if (
        typeof showMainMessage ===
        "function"
    ) {

        showMainMessage(
            message,
            type
        );


        return;
    }


    let messageElement =
        document.getElementById(
            "notificationMessage"
        );


    if (!messageElement) {

        messageElement =
            document.createElement(
                "div"
            );


        messageElement.id =
            "notificationMessage";


        document.body.appendChild(
            messageElement
        );
    }


    messageElement.className =
        type === "error"
            ? "error-box"
            : "success-box";


    messageElement.textContent =
        message;


    messageElement.style.position =
        "fixed";


    messageElement.style.top =
        "90px";


    messageElement.style.right =
        "20px";


    messageElement.style.zIndex =
        "9999";


    messageElement.style.maxWidth =
        "360px";


    window.clearTimeout(
        showNotificationMessage.timeout
    );


    showNotificationMessage.timeout =
        window.setTimeout(
            () => {

                messageElement.remove();

            },
            4000
        );
}


/* =========================================================
   23. TEXT NORMALIZATION
   ========================================================= */

function normalizeNotificationValue(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();
}


/* =========================================================
   24. PUBLIC API
   ========================================================= */

window.LocalLinkNotifications = {

    notificationsSupported,

    getNotificationPermission,

    areNotificationsEnabled,

    enableNotifications,

    disableNotifications,

    toggleNotifications,

    showTestNotification,

    showInformationNotification,

    getReminderDays,

    saveReminderDays,

    shouldNotifyForRecord,

    processRecordReminders,

    registerNotificationServiceWorker,

    updateNotificationUI
};