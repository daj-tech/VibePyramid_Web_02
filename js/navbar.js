/* =========================================================
   LOCALLINK
   Navbar JavaScript
   HTML + CSS + JavaScript version
   ========================================================= */


/* =========================================================
   1. PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeNavbar();
    }
);


function initializeNavbar() {

    setActiveNavbarLink();

    loadNavbarUserDetails();

    initializeNavbarLogout();

    initializeNavbarLocation();

    initializeNavbarMobileMenu();

    initializeNavbarNotifications();

    initializeNavbarLinks();
}


/* =========================================================
   2. ACTIVE NAVIGATION LINK
   ========================================================= */

function setActiveNavbarLink() {

    const currentPage =
        getNavbarCurrentPage();


    const links =
        document.querySelectorAll(
            ".nav-link, .nav-button"
        );


    links.forEach(
        (link) => {

            const href =
                link.getAttribute(
                    "href"
                );


            if (!href) {
                return;
            }


            const linkPage =
                href
                    .split("/")
                    .pop();


            if (
                linkPage ===
                currentPage
            ) {

                link.classList.add(
                    "active"
                );

            } else {

                link.classList.remove(
                    "active"
                );
            }
        }
    );
}


/* =========================================================
   3. CURRENT PAGE
   ========================================================= */

function getNavbarCurrentPage() {

    const path =
        window.location.pathname;


    const page =
        path
            .split("/")
            .pop();


    if (
        !page ||
        page === ""
    ) {

        return "index.html";
    }


    return page;
}


/* =========================================================
   4. LOAD USER DETAILS
   ========================================================= */

function loadNavbarUserDetails() {

    const user =
        getNavbarUser();


    if (!user) {

        hideNavbarUserSection();

        return;
    }


    const userName =
        document.getElementById(
            "navUserName"
        );


    if (userName) {

        userName.textContent =
            user.name ||
            "User";
    }


    const username =
        document.getElementById(
            "navUsername"
        );


    if (username) {

        const value =
            user.username ||
            "user";


        username.textContent =
            value.startsWith("@")
                ? value
                : `@${value}`;
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


    const region =
        document.getElementById(
            "navRegion"
        );


    if (region) {

        region.textContent =
            user.region ||
            "Thane";
    }


    const area =
        document.getElementById(
            "navArea"
        );


    if (area) {

        area.textContent =
            user.area ||
            "All Areas";
    }


    showNavbarUserSection();
}


function getNavbarUser() {

    /*
       Prefer main.js function when available.
    */

    if (
        typeof getStoredUser ===
        "function"
    ) {

        return getStoredUser();
    }


    const userData =
        localStorage.getItem(
            "locallink_user"
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
   5. USER SECTION VISIBILITY
   ========================================================= */

function showNavbarUserSection() {

    const elements =
        document.querySelectorAll(
            "#navbarUser, .navbar-user"
        );


    elements.forEach(
        (element) => {

            element.hidden =
                false;
        }
    );
}


function hideNavbarUserSection() {

    const elements =
        document.querySelectorAll(
            "#navbarUser, .navbar-user"
        );


    elements.forEach(
        (element) => {

            /*
               Keep the navbar structure visible on
               public pages. Only hide elements explicitly
               marked as requiring authentication.
            */

            if (
                element.dataset.authRequired ===
                "true"
            ) {

                element.hidden =
                    true;
            }
        }
    );
}


/* =========================================================
   6. LOGOUT
   ========================================================= */

function initializeNavbarLogout() {

    const logoutButtons =
        document.querySelectorAll(
            "#logoutButton, #navbarLogout, #navLogout"
        );


    logoutButtons.forEach(
        (button) => {

            /*
               Prevent duplicate event listeners.
            */

            if (
                button.dataset
                    .locallinkLogoutBound ===
                "true"
            ) {

                return;
            }


            button.dataset
                .locallinkLogoutBound =
                "true";


            button.addEventListener(
                "click",
                handleNavbarLogout
            );
        }
    );
}


function handleNavbarLogout() {

    localStorage.removeItem(
        "locallink_authenticated"
    );


    sessionStorage.removeItem(
        "locallink_authenticated"
    );


    localStorage.removeItem(
        "locallink_user"
    );


    /*
       Keep area, region and notification preferences.
    */

    window.location.href =
        "index.html";
}


/* =========================================================
   7. NAVBAR LOCATION
   ========================================================= */

function initializeNavbarLocation() {

    const locationButtons =
        document.querySelectorAll(
            "#navbarLocation, #locationButton, .navbar-location"
        );


    locationButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    /*
                       On the current prototype,
                       location/area is selected from
                       the dashboard or settings.

                       Therefore the navbar button takes
                       the user to the dashboard.
                    */

                    if (
                        isNavbarAuthenticated()
                    ) {

                        window.location.href =
                            "dashboard.html";

                    } else {

                        window.location.href =
                            "login.html";
                    }
                }
            );

        }
    );
}


/* =========================================================
   8. AUTHENTICATION CHECK
   ========================================================= */

function isNavbarAuthenticated() {

    const localAuth =
        localStorage.getItem(
            "locallink_authenticated"
        );


    const sessionAuth =
        sessionStorage.getItem(
            "locallink_authenticated"
        );


    return (
        localAuth === "true" ||
        sessionAuth === "true"
    );
}


/* =========================================================
   9. MOBILE MENU
   ========================================================= */

function initializeNavbarMobileMenu() {

    const menuButton =
        document.getElementById(
            "mobileMenuButton"
        ) ||
        document.getElementById(
            "navbarMenuButton"
        );


    const navigation =
        document.querySelector(
            ".navbar-nav"
        );


    if (
        !menuButton ||
        !navigation
    ) {

        return;
    }


    menuButton.addEventListener(
        "click",
        () => {

            const isOpen =
                navigation.classList.toggle(
                    "mobile-open"
                );


            menuButton.setAttribute(
                "aria-expanded",
                isOpen
                    ? "true"
                    : "false"
            );
        }
    );


    /*
       Close mobile menu when a link is clicked.
    */

    const links =
        navigation.querySelectorAll(
            "a"
        );


    links.forEach(
        (link) => {

            link.addEventListener(
                "click",
                () => {

                    navigation.classList.remove(
                        "mobile-open"
                    );


                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            );

        }
    );
}


/* =========================================================
   10. NOTIFICATION BUTTON
   ========================================================= */

function initializeNavbarNotifications() {

    const notificationButtons =
        document.querySelectorAll(
            "#notificationButton, #navbarNotificationButton"
        );


    notificationButtons.forEach(
        (button) => {

            /*
               notifications.js or main.js may already
               handle the actual permission request.
               This handler only redirects to settings
               when there is no notification functionality
               attached elsewhere.
            */

            if (
                button.dataset
                    .locallinkNotificationBound ===
                "true"
            ) {

                return;
            }


            /*
               Do not attach a competing notification
               handler when notifications.js is loaded.
            */

            if (
                window.LocalLinkNotifications
            ) {

                return;
            }


            button.addEventListener(
                "click",
                async () => {

                    await requestNavbarNotifications();

                }
            );
        }
    );
}


async function requestNavbarNotifications() {

    if (
        !("Notification" in window)
    ) {

        showNavbarMessage(
            "Your browser does not support notifications.",
            "error"
        );


        return;
    }


    try {

        const permission =
            await Notification.requestPermission();


        if (
            permission ===
            "granted"
        ) {

            localStorage.setItem(
                "locallink_notifications",
                "true"
            );


            showNavbarMessage(
                "LocalLink notifications are enabled.",
                "success"
            );

        } else {

            showNavbarMessage(
                "Notification permission was not granted.",
                "error"
            );
        }

    } catch (error) {

        console.error(
            "Navbar notification error:",
            error
        );


        showNavbarMessage(
            "Unable to enable notifications.",
            "error"
        );
    }
}


/* =========================================================
   11. NAVBAR LINKS
   ========================================================= */

function initializeNavbarLinks() {

    const protectedPages = [
        "dashboard.html",
        "educational.html",
        "community.html",
        "internships-skills.html",
        "local.html",
        "events.html",
        "emergencies.html",
        "calendar.html",
        "settings.html"
    ];


    const links =
        document.querySelectorAll(
            "a[href]"
        );


    links.forEach(
        (link) => {

            const href =
                link.getAttribute(
                    "href"
                );


            if (
                !href ||
                href.startsWith(
                    "http"
                ) ||
                href.startsWith(
                    "#"
                )
            ) {

                return;
            }


            const targetPage =
                href
                    .split("/")
                    .pop();


            if (
                protectedPages.includes(
                    targetPage
                )
            ) {

                link.addEventListener(
                    "click",
                    (event) => {

                        if (
                            !isNavbarAuthenticated()
                        ) {

                            event.preventDefault();


                            window.location.href =
                                "login.html";
                        }
                    }
                );
            }
        }
    );
}


/* =========================================================
   12. UPDATE AREA
   ========================================================= */

function updateNavbarArea(
    area
) {

    const selectedArea =
        area ||
        "All Areas";


    const elements =
        document.querySelectorAll(
            "#navArea, #selectedAreaDisplay, #selectedAreaName"
        );


    elements.forEach(
        (element) => {

            element.textContent =
                selectedArea;
        }
    );
}


/* =========================================================
   13. UPDATE REGION
   ========================================================= */

function updateNavbarRegion(
    region
) {

    const selectedRegion =
        region ||
        "Thane";


    const elements =
        document.querySelectorAll(
            "#navRegion, #profileRegion"
        );


    elements.forEach(
        (element) => {

            element.textContent =
                selectedRegion;
        }
    );
}


/* =========================================================
   14. LISTEN FOR AREA CHANGES
   ========================================================= */

window.addEventListener(
    "locallinkAreaChanged",
    (event) => {

        const area =
            event.detail?.area ||
            "All Areas";


        updateNavbarArea(
            area
        );
    }
);


/* =========================================================
   15. LISTEN FOR USER UPDATES
   ========================================================= */

window.addEventListener(
    "locallinkUserUpdated",
    () => {

        loadNavbarUserDetails();
    }
);


/* =========================================================
   16. NAVBAR MESSAGE
   ========================================================= */

function showNavbarMessage(
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
            "navbarMessage"
        );


    if (!messageElement) {

        messageElement =
            document.createElement(
                "div"
            );


        messageElement.id =
            "navbarMessage";


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
        showNavbarMessage.timeout
    );


    showNavbarMessage.timeout =
        window.setTimeout(
            () => {

                messageElement.remove();

            },
            4000
        );
}


/* =========================================================
   17. PUBLIC API
   ========================================================= */

window.LocalLinkNavbar = {

    getNavbarUser,

    isNavbarAuthenticated,

    handleNavbarLogout,

    updateNavbarArea,

    updateNavbarRegion,

    setActiveNavbarLink
};