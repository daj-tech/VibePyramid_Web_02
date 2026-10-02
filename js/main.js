/* =========================================================
   LOCALLINK
   Main JavaScript
   Common functions used across all pages
   ========================================================= */


/* =========================================================
   1. DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeNavigation();
    initializeUserDetails();
    initializeNotificationButton();
    initializeServiceWorker();
    initializePWAInstall();
});


/* =========================================================
   2. NAVIGATION
   ========================================================= */

function initializeNavigation() {
    const currentPage = getCurrentPage();

    const navLinks = document.querySelectorAll(
        ".nav-link, .nav-button, .navbar-icon-button"
    );

    navLinks.forEach((link) => {
        const href = link.getAttribute("href");

        if (!href) {
            return;
        }

        const linkPage = href.split("/").pop();

        if (
            linkPage &&
            linkPage === currentPage
        ) {
            link.classList.add("active");
        }
    });
}


function getCurrentPage() {
    const path = window.location.pathname;

    const page = path.split("/").pop();

    if (!page || page === "") {
        return "index.html";
    }

    return page;
}


/* =========================================================
   3. USER INFORMATION
   ========================================================= */

function initializeUserDetails() {
    const user = getStoredUser();

    if (!user) {
        return;
    }

    const userNameElements = document.querySelectorAll(
        "#navUserName, #welcomeUser, #profileName"
    );

    userNameElements.forEach((element) => {
        if (user.name) {
            element.textContent = user.name;
        }
    });


    const usernameElements = document.querySelectorAll(
        "#navUsername, #profileUsername"
    );

    usernameElements.forEach((element) => {
        if (user.username) {
            element.textContent =
                user.username.startsWith("@")
                    ? user.username
                    : `@${user.username}`;
        }
    });


    const avatar = document.getElementById(
        "navAvatar"
    );

    if (avatar) {
        const name =
            user.name ||
            user.username ||
            "U";

        avatar.textContent = name
            .charAt(0)
            .toUpperCase();
    }


    const regionElements = document.querySelectorAll(
        "#navRegion, #profileRegion"
    );

    regionElements.forEach((element) => {
        element.textContent =
            user.region || "Thane";
    });


    const areaElements = document.querySelectorAll(
        "#navArea, #selectedAreaDisplay, #profileArea"
    );

    areaElements.forEach((element) => {
        element.textContent =
            user.area || "All Areas";
    });


    const dashboardArea =
        document.getElementById(
            "dashboardArea"
        );

    if (
        dashboardArea &&
        user.area
    ) {
        dashboardArea.value = user.area;
    }


    const settingsArea =
        document.getElementById(
            "settingsArea"
        );

    if (
        settingsArea &&
        user.area
    ) {
        settingsArea.value = user.area;
    }


    const settingsRegion =
        document.getElementById(
            "settingsRegion"
        );

    if (
        settingsRegion &&
        user.region
    ) {
        settingsRegion.value = user.region;
    }
}


function getStoredUser() {
    const userData =
        localStorage.getItem(
            "locallink_user"
        );

    if (!userData) {
        return null;
    }

    try {
        return JSON.parse(userData);
    } catch (error) {
        console.error(
            "Unable to read LocalLink user data:",
            error
        );

        return null;
    }
}


/* =========================================================
   4. NOTIFICATION BUTTON
   ========================================================= */

function initializeNotificationButton() {
    const notificationButton =
        document.getElementById(
            "notificationButton"
        );

    if (!notificationButton) {
        return;
    }

    notificationButton.addEventListener(
        "click",
        handleNotificationRequest
    );
}


async function handleNotificationRequest() {
    if (
        !("Notification" in window)
    ) {
        showMainMessage(
            "Your browser does not support notifications.",
            "error"
        );

        return;
    }

    try {
        const permission =
            await Notification.requestPermission();

        if (permission === "granted") {
            localStorage.setItem(
                "locallink_notifications",
                "true"
            );

            showMainMessage(
                "LocalLink notifications are enabled.",
                "success"
            );

            showTestNotification();
        } else if (
            permission === "denied"
        ) {
            localStorage.setItem(
                "locallink_notifications",
                "false"
            );

            showMainMessage(
                "Notification permission was not granted.",
                "error"
            );
        } else {
            showMainMessage(
                "Notification permission is still pending.",
                "error"
            );
        }
    } catch (error) {
        console.error(
            "Notification error:",
            error
        );

        showMainMessage(
            "Unable to enable notifications.",
            "error"
        );
    }
}


function showTestNotification() {
    if (
        !("Notification" in window) ||
        Notification.permission !== "granted"
    ) {
        return;
    }

    try {
        new Notification(
            "LocalLink",
            {
                body:
                    "Notifications are now enabled for LocalLink.",
                icon:
                    "assets/icons/icon-192.png"
            }
        );
    } catch (error) {
        console.error(
            "Unable to show notification:",
            error
        );
    }
}


/* =========================================================
   5. SERVICE WORKER
   ========================================================= */

function initializeServiceWorker() {
    if (
        !("serviceWorker" in navigator)
    ) {
        return;
    }

    window.addEventListener(
        "load",
        () => {
            navigator.serviceWorker
                .register(
                    "service-worker.js"
                )
                .then((registration) => {
                    console.log(
                        "LocalLink service worker registered.",
                        registration.scope
                    );
                })
                .catch((error) => {
                    console.error(
                        "Service worker registration failed:",
                        error
                    );
                });
        }
    );
}


/* =========================================================
   6. PWA INSTALL
   ========================================================= */

let deferredInstallPrompt = null;


function initializePWAInstall() {
    const installButton =
        document.getElementById(
            "installAppButton"
        );

    window.addEventListener(
        "beforeinstallprompt",
        (event) => {
            event.preventDefault();

            deferredInstallPrompt = event;

            if (installButton) {
                installButton.hidden = false;
            }
        }
    );

    if (installButton) {
        installButton.addEventListener(
            "click",
            installLocalLink
        );
    }

    window.addEventListener(
        "appinstalled",
        () => {
            deferredInstallPrompt = null;

            if (installButton) {
                installButton.hidden = true;
            }

            showMainMessage(
                "LocalLink has been installed.",
                "success"
            );
        }
    );
}


async function installLocalLink() {
    if (!deferredInstallPrompt) {
        showMainMessage(
            "The LocalLink installation prompt is not currently available.",
            "error"
        );

        return;
    }

    deferredInstallPrompt.prompt();

    try {
        await deferredInstallPrompt.userChoice;
    } catch (error) {
        console.error(
            "PWA installation error:",
            error
        );
    }

    deferredInstallPrompt = null;

    const installButton =
        document.getElementById(
            "installAppButton"
        );

    if (installButton) {
        installButton.hidden = true;
    }
}


/* =========================================================
   7. COMMON MESSAGE
   ========================================================= */

function showMainMessage(
    message,
    type = "success"
) {
    let messageElement =
        document.getElementById(
            "mainMessage"
        );

    if (!messageElement) {
        messageElement =
            document.createElement("div");

        messageElement.id =
            "mainMessage";

        messageElement.className =
            "success-box";

        messageElement.setAttribute(
            "role",
            "status"
        );

        messageElement.setAttribute(
            "aria-live",
            "polite"
        );

        document.body.prepend(
            messageElement
        );
    }

    messageElement.textContent =
        message;

    messageElement.className =
        type === "error"
            ? "error-box"
            : "success-box";

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
        showMainMessage.timeout
    );

    showMainMessage.timeout =
        window.setTimeout(() => {
            messageElement.remove();
        }, 4000);
}


/* =========================================================
   8. LOCAL AREA STORAGE
   ========================================================= */

function saveLocalArea(area) {
    if (!area) {
        return;
    }

    localStorage.setItem(
        "locallink_area",
        area
    );

    const user =
        getStoredUser();

    if (user) {
        user.area = area;

        localStorage.setItem(
            "locallink_user",
            JSON.stringify(user)
        );
    }

    updateAreaDisplay(area);
}


function updateAreaDisplay(area) {
    const areaElements =
        document.querySelectorAll(
            "#navArea, #selectedAreaDisplay, #profileArea, #selectedAreaName"
        );

    areaElements.forEach((element) => {
        element.textContent =
            area || "All Areas";
    });
}


/* =========================================================
   9. LOCAL REGION STORAGE
   ========================================================= */

function saveRegion(region) {
    if (!region) {
        return;
    }

    localStorage.setItem(
        "locallink_region",
        region
    );

    const user =
        getStoredUser();

    if (user) {
        user.region = region;

        localStorage.setItem(
            "locallink_user",
            JSON.stringify(user)
        );
    }

    const regionElements =
        document.querySelectorAll(
            "#navRegion, #profileRegion"
        );

    regionElements.forEach((element) => {
        element.textContent =
            region;
    });
}


/* =========================================================
   10. DASHBOARD AREA SELECTOR
   ========================================================= */

const dashboardArea =
    document.getElementById(
        "dashboardArea"
    );

if (dashboardArea) {
    dashboardArea.addEventListener(
        "change",
        (event) => {
            const area =
                event.target.value;

            saveLocalArea(area);

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
   11. PAGE VISIBILITY
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {
        if (
            document.visibilityState ===
            "visible"
        ) {
            initializeUserDetails();
        }
    }
);


/* =========================================================
   12. GLOBAL HELPERS
   ========================================================= */

window.LocalLink = {
    getStoredUser,
    saveLocalArea,
    saveRegion,
    updateAreaDisplay,
    showMainMessage
};