/* =========================================================
   LOCALLINK
   Settings JavaScript
   HTML + CSS + JavaScript version
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const SETTINGS_CONFIG = {

    defaultRegion: "Thane",

    defaultArea: "All Areas",

    defaultNotificationState: false,

    defaultReminderDays: "3",

    storageKeys: {
        user: "locallink_user",
        region: "locallink_region",
        area: "locallink_area",
        notifications: "locallink_notifications",
        reminderDays: "locallink_reminder_days"
    }
};


/* =========================================================
   2. PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeSettingsPage();
    }
);


function initializeSettingsPage() {

    loadSettingsProfile();

    initializeRegionSelector();

    initializeAreaSelector();

    initializeNotificationToggle();

    initializeReminderSelector();

    initializeTestNotification();

    initializePWAInstallButton();

    initializeSettingsLogout();

    updateNotificationStatus();

    updatePWAStatus();

    updateSettingsUserDetails();
}


/* =========================================================
   3. LOAD PROFILE
   ========================================================= */

function loadSettingsProfile() {

    const user =
        getSettingsUser();


    if (!user) {
        return;
    }


    const profileName =
        document.getElementById(
            "profileName"
        );


    if (profileName) {

        profileName.textContent =
            user.name ||
            "User";
    }


    const profileUsername =
        document.getElementById(
            "profileUsername"
        );


    if (profileUsername) {

        const username =
            user.username ||
            "user";


        profileUsername.textContent =
            username.startsWith("@")
                ? username
                : `@${username}`;
    }


    const profileRegion =
        document.getElementById(
            "profileRegion"
        );


    if (profileRegion) {

        profileRegion.textContent =
            user.region ||
            SETTINGS_CONFIG.defaultRegion;
    }


    const profileArea =
        document.getElementById(
            "profileArea"
        );


    if (profileArea) {

        profileArea.textContent =
            user.area ||
            SETTINGS_CONFIG.defaultArea;
    }
}


/* =========================================================
   4. GET CURRENT USER
   ========================================================= */

function getSettingsUser() {

    const userData =
        localStorage.getItem(
            SETTINGS_CONFIG.storageKeys.user
        );


    if (!userData) {
        return null;
    }


    try {

        return JSON.parse(
            userData
        );

    } catch (error) {

        console.error(
            "Unable to read LocalLink user:",
            error
        );

        return null;
    }
}


/* =========================================================
   5. UPDATE USER DETAILS
   ========================================================= */

function updateSettingsUserDetails() {

    const user =
        getSettingsUser();


    if (!user) {
        return;
    }


    const avatar =
        document.getElementById(
            "navAvatar"
        );


    if (avatar) {

        const name =
            user.name ||
            user.username ||
            "U";


        avatar.textContent =
            name
                .charAt(0)
                .toUpperCase();
    }


    const navUserName =
        document.getElementById(
            "navUserName"
        );


    if (navUserName) {

        navUserName.textContent =
            user.name ||
            "User";
    }


    const navUsername =
        document.getElementById(
            "navUsername"
        );


    if (navUsername) {

        const username =
            user.username ||
            "user";


        navUsername.textContent =
            username.startsWith("@")
                ? username
                : `@${username}`;
    }


    const navRegion =
        document.getElementById(
            "navRegion"
        );


    if (navRegion) {

        navRegion.textContent =
            user.region ||
            SETTINGS_CONFIG.defaultRegion;
    }


    const navArea =
        document.getElementById(
            "navArea"
        );


    if (navArea) {

        navArea.textContent =
            user.area ||
            SETTINGS_CONFIG.defaultArea;
    }
}


/* =========================================================
   6. REGION SELECTOR
   ========================================================= */

function initializeRegionSelector() {

    const regionSelect =
        document.getElementById(
            "settingsRegion"
        );


    if (!regionSelect) {
        return;
    }


    const user =
        getSettingsUser();


    const storedRegion =
        localStorage.getItem(
            SETTINGS_CONFIG.storageKeys.region
        );


    regionSelect.value =
        storedRegion ||
        user?.region ||
        SETTINGS_CONFIG.defaultRegion;


    regionSelect.addEventListener(
        "change",
        () => {

            const region =
                regionSelect.value;


            if (!region) {
                return;
            }


            saveSettingsRegion(
                region
            );


            showSettingsMessage(
                "Region updated successfully.",
                "success"
            );
        }
    );
}


/* =========================================================
   7. SAVE REGION
   ========================================================= */

function saveSettingsRegion(
    region
) {

    localStorage.setItem(
        SETTINGS_CONFIG.storageKeys.region,
        region
    );


    const user =
        getSettingsUser();


    if (user) {

        user.region =
            region;


        localStorage.setItem(
            SETTINGS_CONFIG.storageKeys.user,
            JSON.stringify(user)
        );
    }


    /*
       Use main.js helper when available.
    */

    if (
        typeof saveRegion ===
        "function"
    ) {

        saveRegion(
            region
        );

    } else {

        const elements =
            document.querySelectorAll(
                "#navRegion, #profileRegion"
            );


        elements.forEach(
            (element) => {

                element.textContent =
                    region;
            }
        );
    }
}


/* =========================================================
   8. AREA SELECTOR
   ========================================================= */

function initializeAreaSelector() {

    const areaSelect =
        document.getElementById(
            "settingsArea"
        );


    if (!areaSelect) {
        return;
    }


    const user =
        getSettingsUser();


    const storedArea =
        localStorage.getItem(
            SETTINGS_CONFIG.storageKeys.area
        );


    areaSelect.value =
        storedArea ||
        user?.area ||
        SETTINGS_CONFIG.defaultArea;


    areaSelect.addEventListener(
        "change",
        () => {

            const area =
                areaSelect.value;


            if (!area) {
                return;
            }


            saveSettingsArea(
                area
            );


            showSettingsMessage(
                "Local area updated successfully.",
                "success"
            );


            window.dispatchEvent(
                new CustomEvent(
                    "locallinkAreaChanged",
                    {
                        detail: {
                            area
                        }
                    }
                )
            );
        }
    );
}


/* =========================================================
   9. SAVE AREA
   ========================================================= */

function saveSettingsArea(
    area
) {

    localStorage.setItem(
        SETTINGS_CONFIG.storageKeys.area,
        area
    );


    const user =
        getSettingsUser();


    if (user) {

        user.area =
            area;


        localStorage.setItem(
            SETTINGS_CONFIG.storageKeys.user,
            JSON.stringify(user)
        );
    }


    /*
       Use main.js helper when available.
    */

    if (
        typeof saveLocalArea ===
        "function"
    ) {

        saveLocalArea(
            area
        );

    } else {

        const elements =
            document.querySelectorAll(
                "#navArea, #selectedAreaDisplay, #selectedAreaName, #profileArea"
            );


        elements.forEach(
            (element) => {

                element.textContent =
                    area;
            }
        );
    }
}


/* =========================================================
   10. NOTIFICATION TOGGLE
   ========================================================= */

function initializeNotificationToggle() {

    const toggle =
        document.getElementById(
            "notificationToggle"
        );


    if (!toggle) {
        return;
    }


    const savedValue =
        localStorage.getItem(
            SETTINGS_CONFIG.storageKeys.notifications
        );


    const enabled =
        savedValue ===
        "true";


    setNotificationToggleState(
        toggle,
        enabled
    );


    toggle.addEventListener(
        "click",
        async () => {

            const currentlyEnabled =
                toggle.dataset.enabled ===
                "true";


            if (currentlyEnabled) {

                disableSettingsNotifications(
                    toggle
                );

            } else {

                await enableSettingsNotifications(
                    toggle
                );
            }
        }
    );
}


/* =========================================================
   11. ENABLE NOTIFICATIONS
   ========================================================= */

async function enableSettingsNotifications(
    toggle
) {

    if (
        !("Notification" in window)
    ) {

        showSettingsMessage(
            "This browser does not support notifications.",
            "error"
        );

        return;
    }


    try {

        const permission =
            await Notification.requestPermission();


        if (
            permission !==
            "granted"
        ) {

            localStorage.setItem(
                SETTINGS_CONFIG.storageKeys.notifications,
                "false"
            );


            setNotificationToggleState(
                toggle,
                false
            );


            showSettingsMessage(
                "Notification permission was not granted.",
                "error"
            );

            return;
        }


        localStorage.setItem(
            SETTINGS_CONFIG.storageKeys.notifications,
            "true"
        );


        setNotificationToggleState(
            toggle,
            true
        );


        updateNotificationStatus();


        showSettingsMessage(
            "Notifications enabled successfully.",
            "success"
        );


        /*
           Use notifications.js when available.
        */

        if (
            window.LocalLinkNotifications &&
            typeof window.LocalLinkNotifications
                .showTestNotification ===
                "function"
        ) {

            window.LocalLinkNotifications
                .showTestNotification();

        } else if (
            typeof showTestNotification ===
            "function"
        ) {

            showTestNotification();

        } else {

            showSimpleBrowserNotification();
        }

    } catch (error) {

        console.error(
            "Unable to enable notifications:",
            error
        );


        showSettingsMessage(
            "Unable to enable notifications.",
            "error"
        );
    }
}


/* =========================================================
   12. DISABLE NOTIFICATIONS
   ========================================================= */

function disableSettingsNotifications(
    toggle
) {

    localStorage.setItem(
        SETTINGS_CONFIG.storageKeys.notifications,
        "false"
    );


    setNotificationToggleState(
        toggle,
        false
    );


    updateNotificationStatus();


    showSettingsMessage(
        "LocalLink reminders are disabled.",
        "success"
    );
}


/* =========================================================
   13. TOGGLE UI
   ========================================================= */

function setNotificationToggleState(
    toggle,
    enabled
) {

    toggle.dataset.enabled =
        enabled
            ? "true"
            : "false";


    toggle.setAttribute(
        "aria-pressed",
        enabled
            ? "true"
            : "false"
    );


    toggle.classList.toggle(
        "active",
        enabled
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


    const status =
        toggle.parentElement?.querySelector(
            ".notification-status"
        );


    if (status) {

        status.textContent =
            enabled
                ? "Notifications enabled"
                : "Notifications disabled";
    }
}


/* =========================================================
   14. NOTIFICATION STATUS
   ========================================================= */

function updateNotificationStatus() {

    const statusElements =
        document.querySelectorAll(
            "#notificationStatus, .notification-status"
        );


    const savedValue =
        localStorage.getItem(
            SETTINGS_CONFIG.storageKeys.notifications
        );


    const enabled =
        savedValue ===
        "true";


    statusElements.forEach(
        (element) => {

            /*
               Avoid overwriting complex notification
               status containers unnecessarily.
            */

            if (
                element.id ===
                "notificationStatus"
            ) {

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

        setNotificationToggleState(
            toggle,
            enabled
        );
    }
}


/* =========================================================
   15. REMINDER SELECTOR
   ========================================================= */

function initializeReminderSelector() {

    const reminderSelect =
        document.getElementById(
            "reminderDays"
        ) ||
        document.getElementById(
            "notificationDays"
        ) ||
        document.getElementById(
            "reminderTiming"
        );


    if (!reminderSelect) {
        return;
    }


    const savedValue =
        localStorage.getItem(
            SETTINGS_CONFIG.storageKeys.reminderDays
        );


    reminderSelect.value =
        savedValue ||
        SETTINGS_CONFIG.defaultReminderDays;


    reminderSelect.addEventListener(
        "change",
        () => {

            const value =
                reminderSelect.value;


            localStorage.setItem(
                SETTINGS_CONFIG.storageKeys.reminderDays,
                value
            );


            showSettingsMessage(
                "Reminder timing updated successfully.",
                "success"
            );
        }
    );
}


/* =========================================================
   16. TEST NOTIFICATION BUTTON
   ========================================================= */

function initializeTestNotification() {

    const button =
        document.getElementById(
            "testNotificationButton"
        ) ||
        document.getElementById(
            "sendTestNotification"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            await handleTestNotification();
        }
    );
}


/* =========================================================
   17. HANDLE TEST NOTIFICATION
   ========================================================= */

async function handleTestNotification() {

    if (
        !("Notification" in window)
    ) {

        showSettingsMessage(
            "Your browser does not support notifications.",
            "error"
        );

        return;
    }


    if (
        Notification.permission !==
        "granted"
    ) {

        const permission =
            await Notification.requestPermission();


        if (
            permission !==
            "granted"
        ) {

            showSettingsMessage(
                "Please allow browser notifications first.",
                "error"
            );

            return;
        }


        localStorage.setItem(
            SETTINGS_CONFIG.storageKeys.notifications,
            "true"
        );


        updateNotificationStatus();
    }


    /*
       Prefer notifications.js implementation.
    */

    if (
        window.LocalLinkNotifications &&
        typeof window.LocalLinkNotifications
            .showTestNotification ===
            "function"
    ) {

        window.LocalLinkNotifications
            .showTestNotification();

    } else if (
        typeof showTestNotification ===
        "function"
    ) {

        showTestNotification();

    } else {

        showSimpleBrowserNotification();
    }


    showSettingsMessage(
        "Test notification sent.",
        "success"
    );
}


/* =========================================================
   18. SIMPLE BROWSER NOTIFICATION
   ========================================================= */

function showSimpleBrowserNotification() {

    if (
        !("Notification" in window) ||
        Notification.permission !==
            "granted"
    ) {

        return;
    }


    try {

        new Notification(
            "LocalLink",
            {
                body:
                    "This is a test notification from LocalLink.",

                icon:
                    "assets/icons/icon-192.png"
            }
        );

    } catch (error) {

        console.error(
            "Unable to display notification:",
            error
        );
    }
}


/* =========================================================
   19. PWA INSTALL BUTTON
   ========================================================= */

function initializePWAInstallButton() {

    const installButton =
        document.getElementById(
            "installAppButton"
        );


    if (!installButton) {
        return;
    }


    /*
       main.js handles the actual beforeinstallprompt
       event and installation process.
    */

    installButton.addEventListener(
        "click",
        () => {

            if (
                typeof installLocalLink ===
                "function"
            ) {

                installLocalLink();

            } else if (
                window.LocalLink &&
                typeof window.LocalLink.installLocalLink ===
                "function"
            ) {

                window.LocalLink
                    .installLocalLink();

            } else {

                showSettingsMessage(
                    "The LocalLink installation prompt is not currently available.",
                    "error"
                );
            }
        }
    );


    /*
       Browser-specific installation prompt state.
    */

    window.addEventListener(
        "beforeinstallprompt",
        () => {

            installButton.hidden =
                false;

            updatePWAStatus(
                "Install available"
            );
        }
    );


    window.addEventListener(
        "appinstalled",
        () => {

            installButton.hidden =
                true;

            updatePWAStatus(
                "Installed"
            );

            showSettingsMessage(
                "LocalLink has been installed.",
                "success"
            );
        }
    );


    updatePWAStatus();
}


/* =========================================================
   20. PWA STATUS
   ========================================================= */

function updatePWAStatus(
    customStatus = null
) {

    const status =
        document.getElementById(
            "pwaStatus"
        );


    if (!status) {
        return;
    }


    if (customStatus) {

        status.textContent =
            customStatus;

        return;
    }


    const isStandalone =
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches ||
        window.navigator.standalone === true;


    if (isStandalone) {

        status.textContent =
            "Installed";

        return;
    }


    status.textContent =
        "Available for installation";
}


/* =========================================================
   21. LOGOUT
   ========================================================= */

function initializeSettingsLogout() {

    const logoutButtons =
        document.querySelectorAll(
            "#settingsLogoutButton, #logoutButton"
        );


    logoutButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    performSettingsLogout();

                }
            );

        }
    );
}


function performSettingsLogout() {

    /*
       Remove authentication/session data.
       Keep notification and area preferences.
    */

    localStorage.removeItem(
        "locallink_authenticated"
    );


    sessionStorage.removeItem(
        "locallink_authenticated"
    );


    localStorage.removeItem(
        SETTINGS_CONFIG.storageKeys.user
    );


    showSettingsMessage(
        "Logging out...",
        "success"
    );


    window.setTimeout(
        () => {

            window.location.href =
                "index.html";

        },
        300
    );
}


/* =========================================================
   22. SETTINGS MESSAGE
   ========================================================= */

function showSettingsMessage(
    message,
    type = "success"
) {

    /*
       Prefer main.js message function.
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
            "settingsMessage"
        );


    if (!messageElement) {

        messageElement =
            document.createElement(
                "div"
            );


        messageElement.id =
            "settingsMessage";


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
        showSettingsMessage.timeout
    );


    showSettingsMessage.timeout =
        window.setTimeout(
            () => {

                messageElement.remove();

            },
            4000
        );
}


/* =========================================================
   23. UPDATE SETTINGS WHEN AREA CHANGES
   ========================================================= */

window.addEventListener(
    "locallinkAreaChanged",
    (event) => {

        const area =
            event.detail?.area ||
            "All Areas";


        const profileArea =
            document.getElementById(
                "profileArea"
            );


        if (profileArea) {

            profileArea.textContent =
                area;
        }


        const settingsArea =
            document.getElementById(
                "settingsArea"
            );


        if (settingsArea) {

            settingsArea.value =
                area;
        }
    }
);


/* =========================================================
   24. PUBLIC API
   ========================================================= */

window.LocalLinkSettings = {

    getSettingsUser,

    saveSettingsRegion,

    saveSettingsArea,

    updateNotificationStatus,

    handleTestNotification,

    performSettingsLogout
};