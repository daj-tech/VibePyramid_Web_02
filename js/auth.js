/* =========================================================
   LOCALLINK
   Authentication JavaScript
   HTML + CSS + JavaScript version
   ========================================================= */


/* =========================================================
   1. DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeLoginForm();
    initializeRegisterForm();
    initializePasswordToggles();
    initializeLogoutButtons();

    protectDashboardPage();
    updateAuthenticationUI();
});


/* =========================================================
   2. STORAGE KEYS
   ========================================================= */

const AUTH_KEY = "locallink_authenticated";
const USER_KEY = "locallink_user";


/* =========================================================
   3. LOGIN FORM
   ========================================================= */

function initializeLoginForm() {
    const loginForm =
        document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener(
        "submit",
        handleLogin
    );
}


function handleLogin(event) {
    event.preventDefault();

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    const rememberMe =
        document.getElementById("rememberMe");

    const message =
        document.getElementById("loginMessage");

    const loginButton =
        document.getElementById("loginButton");

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;

    const remembered =
        rememberMe
            ? rememberMe.checked
            : false;


    clearAuthMessage(message);


    /* -----------------------------------------
       Validation
       ----------------------------------------- */

    if (!username) {
        showAuthMessage(
            message,
            "Please enter your username.",
            "error"
        );

        usernameInput.focus();

        return;
    }


    if (!password) {
        showAuthMessage(
            message,
            "Please enter your password.",
            "error"
        );

        passwordInput.focus();

        return;
    }


    /* -----------------------------------------
       Get registered users
       ----------------------------------------- */

    const users =
        getRegisteredUsers();

    const user =
        users.find(
            (item) =>
                item.username.toLowerCase() ===
                username.toLowerCase()
        );


    if (!user) {
        showAuthMessage(
            message,
            "Account not found. Please check your username or register first.",
            "error"
        );

        return;
    }


    /* -----------------------------------------
       Check password
       ----------------------------------------- */

    if (user.password !== password) {
        showAuthMessage(
            message,
            "Incorrect password. Please try again.",
            "error"
        );

        return;
    }


    /* -----------------------------------------
       Login successful
       ----------------------------------------- */

    if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";
    }


    const sessionUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        region: user.region || "Thane",
        area: user.area || "All Areas"
    };


    localStorage.setItem(
        USER_KEY,
        JSON.stringify(sessionUser)
    );


    if (remembered) {
        localStorage.setItem(
            AUTH_KEY,
            "true"
        );
    } else {
        sessionStorage.setItem(
            AUTH_KEY,
            "true"
        );
    }


    showAuthMessage(
        message,
        "Login successful. Redirecting...",
        "success"
    );


    window.setTimeout(() => {
        window.location.href =
            "dashboard.html";
    }, 700);
}


/* =========================================================
   4. REGISTER FORM
   ========================================================= */

function initializeRegisterForm() {
    const registerForm =
        document.getElementById(
            "registerForm"
        );

    if (!registerForm) {
        return;
    }

    registerForm.addEventListener(
        "submit",
        handleRegister
    );
}


function handleRegister(event) {
    event.preventDefault();

    const nameInput =
        document.getElementById("name");

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById(
            "confirmPassword"
        );

    const regionInput =
        document.getElementById("region");

    const areaInput =
        document.getElementById("area");

    const termsInput =
        document.getElementById("terms");

    const message =
        document.getElementById(
            "registerMessage"
        );

    const registerButton =
        document.getElementById(
            "registerButton"
        );


    const name =
        nameInput.value.trim();

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;

    const region =
        regionInput.value;

    const area =
        areaInput.value;


    clearAuthMessage(message);


    /* -----------------------------------------
       Validation
       ----------------------------------------- */

    if (!name) {
        showAuthMessage(
            message,
            "Please enter your full name.",
            "error"
        );

        nameInput.focus();

        return;
    }


    if (name.length < 2) {
        showAuthMessage(
            message,
            "Please enter a valid name.",
            "error"
        );

        nameInput.focus();

        return;
    }


    if (!username) {
        showAuthMessage(
            message,
            "Please choose a username.",
            "error"
        );

        usernameInput.focus();

        return;
    }


    if (username.length < 3) {
        showAuthMessage(
            message,
            "Username must contain at least 3 characters.",
            "error"
        );

        usernameInput.focus();

        return;
    }


    const usernamePattern =
        /^[A-Za-z0-9_]+$/;


    if (
        !usernamePattern.test(
            username
        )
    ) {
        showAuthMessage(
            message,
            "Username can contain only letters, numbers and underscores.",
            "error"
        );

        usernameInput.focus();

        return;
    }


    if (!password) {
        showAuthMessage(
            message,
            "Please create a password.",
            "error"
        );

        passwordInput.focus();

        return;
    }


    if (password.length < 6) {
        showAuthMessage(
            message,
            "Password must contain at least 6 characters.",
            "error"
        );

        passwordInput.focus();

        return;
    }


    if (
        password !==
        confirmPassword
    ) {
        showAuthMessage(
            message,
            "Passwords do not match.",
            "error"
        );

        confirmPasswordInput.focus();

        return;
    }


    if (!region) {
        showAuthMessage(
            message,
            "Please select your region.",
            "error"
        );

        regionInput.focus();

        return;
    }


    if (!area) {
        showAuthMessage(
            message,
            "Please select your local area.",
            "error"
        );

        areaInput.focus();

        return;
    }


    if (
        termsInput &&
        !termsInput.checked
    ) {
        showAuthMessage(
            message,
            "Please accept the LocalLink information notice.",
            "error"
        );

        return;
    }


    /* -----------------------------------------
       Check existing username
       ----------------------------------------- */

    const users =
        getRegisteredUsers();


    const usernameExists =
        users.some(
            (item) =>
                item.username.toLowerCase() ===
                username.toLowerCase()
        );


    if (usernameExists) {
        showAuthMessage(
            message,
            "This username is already registered.",
            "error"
        );

        usernameInput.focus();

        return;
    }


    /* -----------------------------------------
       Create new user
       ----------------------------------------- */

    const newUser = {
        id:
            "USR-" +
            Date.now(),

        name,
        username,
        password,
        region,
        area,

        createdAt:
            new Date().toISOString()
    };


    users.push(newUser);


    localStorage.setItem(
        "locallink_users",
        JSON.stringify(users)
    );


    /* -----------------------------------------
       Prepare login
       ----------------------------------------- */

    if (registerButton) {
        registerButton.disabled =
            true;

        registerButton.textContent =
            "Account Created";
    }


    showAuthMessage(
        message,
        "Account created successfully. Redirecting to login...",
        "success"
    );


    window.setTimeout(() => {
        window.location.href =
            "login.html";
    }, 900);
}


/* =========================================================
   5. GET REGISTERED USERS
   ========================================================= */

function getRegisteredUsers() {
    const users =
        localStorage.getItem(
            "locallink_users"
        );

    if (!users) {
        return [];
    }

    try {
        const parsed =
            JSON.parse(users);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Unable to read registered users:",
            error
        );

        return [];
    }
}


/* =========================================================
   6. AUTHENTICATION CHECK
   ========================================================= */

function isAuthenticated() {
    const localAuth =
        localStorage.getItem(
            AUTH_KEY
        );

    const sessionAuth =
        sessionStorage.getItem(
            AUTH_KEY
        );

    return (
        localAuth === "true" ||
        sessionAuth === "true"
    );
}


/* =========================================================
   7. GET CURRENT USER
   ========================================================= */

function getCurrentUser() {
    const userData =
        localStorage.getItem(
            USER_KEY
        );

    if (!userData) {
        return null;
    }

    try {
        return JSON.parse(userData);

    } catch (error) {

        console.error(
            "Unable to read current user:",
            error
        );

        return null;
    }
}


/* =========================================================
   8. PROTECT DASHBOARD PAGES
   ========================================================= */

function protectDashboardPage() {
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


    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    if (
        protectedPages.includes(
            currentPage
        )
    ) {

        if (!isAuthenticated()) {

            window.location.href =
                "login.html";

            return;
        }
    }


    /* -----------------------------------------
       Prevent logged-in user from opening
       login/register unnecessarily
       ----------------------------------------- */

    if (
        (
            currentPage ===
                "login.html" ||
            currentPage ===
                "register.html"
        ) &&
        isAuthenticated()
    ) {

        window.location.href =
            "dashboard.html";
    }
}


/* =========================================================
   9. UPDATE AUTH UI
   ========================================================= */

function updateAuthenticationUI() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }


    /* -----------------------------------------
       Name
       ----------------------------------------- */

    const nameElements =
        document.querySelectorAll(
            "#navUserName, #welcomeUser, #profileName"
        );


    nameElements.forEach(
        (element) => {

            element.textContent =
                user.name || "User";

        }
    );


    /* -----------------------------------------
       Username
       ----------------------------------------- */

    const usernameElements =
        document.querySelectorAll(
            "#navUsername, #profileUsername"
        );


    usernameElements.forEach(
        (element) => {

            const username =
                user.username ||
                "user";

            element.textContent =
                username.startsWith("@")
                    ? username
                    : `@${username}`;

        }
    );


    /* -----------------------------------------
       Avatar
       ----------------------------------------- */

    const avatar =
        document.getElementById(
            "navAvatar"
        );


    if (avatar) {

        const displayName =
            user.name ||
            user.username ||
            "U";

        avatar.textContent =
            displayName
                .charAt(0)
                .toUpperCase();
    }


    /* -----------------------------------------
       Region
       ----------------------------------------- */

    const regionElements =
        document.querySelectorAll(
            "#navRegion, #profileRegion"
        );


    regionElements.forEach(
        (element) => {

            element.textContent =
                user.region || "Thane";

        }
    );


    /* -----------------------------------------
       Area
       ----------------------------------------- */

    const areaElements =
        document.querySelectorAll(
            "#navArea, #selectedAreaDisplay, #profileArea, #selectedAreaName"
        );


    areaElements.forEach(
        (element) => {

            element.textContent =
                user.area || "All Areas";

        }
    );


    /* -----------------------------------------
       Dashboard area selector
       ----------------------------------------- */

    const dashboardArea =
        document.getElementById(
            "dashboardArea"
        );


    if (
        dashboardArea &&
        user.area
    ) {

        dashboardArea.value =
            user.area;
    }


    /* -----------------------------------------
       Settings fields
       ----------------------------------------- */

    const settingsArea =
        document.getElementById(
            "settingsArea"
        );


    if (
        settingsArea &&
        user.area
    ) {

        settingsArea.value =
            user.area;
    }


    const settingsRegion =
        document.getElementById(
            "settingsRegion"
        );


    if (
        settingsRegion &&
        user.region
    ) {

        settingsRegion.value =
            user.region;
    }
}


/* =========================================================
   10. LOGOUT
   ========================================================= */

function initializeLogoutButtons() {

    const logoutButtons =
        document.querySelectorAll(
            "#logoutButton, #settingsLogoutButton"
        );


    logoutButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                handleLogout
            );

        }
    );
}


function handleLogout() {

    localStorage.removeItem(
        AUTH_KEY
    );

    sessionStorage.removeItem(
        AUTH_KEY
    );

    localStorage.removeItem(
        USER_KEY
    );


    window.location.href =
        "index.html";
}


/* =========================================================
   11. PASSWORD TOGGLES
   ========================================================= */

function initializePasswordToggles() {

    setupPasswordToggle(
        "togglePassword",
        "password"
    );


    setupPasswordToggle(
        "toggleConfirmPassword",
        "confirmPassword"
    );
}


function setupPasswordToggle(
    buttonId,
    inputId
) {

    const button =
        document.getElementById(
            buttonId
        );

    const input =
        document.getElementById(
            inputId
        );


    if (
        !button ||
        !input
    ) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            if (
                input.type ===
                "password"
            ) {

                input.type =
                    "text";

                button.textContent =
                    "Hide";

                button.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                input.type =
                    "password";

                button.textContent =
                    "Show";

                button.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }

        }
    );
}


/* =========================================================
   12. AUTH MESSAGE
   ========================================================= */

function showAuthMessage(
    element,
    message,
    type
) {

    if (!element) {
        return;
    }


    element.hidden = false;

    element.textContent =
        message;


    if (type === "error") {

        element.className =
            "auth-message error";

    } else {

        element.className =
            "auth-message success";
    }
}


function clearAuthMessage(element) {

    if (!element) {
        return;
    }

    element.hidden = true;

    element.textContent = "";

    element.className =
        "auth-message";
}


/* =========================================================
   13. EXPORT GLOBAL AUTH OBJECT
   ========================================================= */

window.LocalLinkAuth = {

    isAuthenticated,

    getCurrentUser,

    getRegisteredUsers,

    handleLogout
};