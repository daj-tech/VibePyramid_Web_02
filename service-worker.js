/* =========================================================
   LOCALLINK
   Service Worker
   PWA Offline Cache + Notifications
   ========================================================= */


/* =========================================================
   1. CACHE CONFIGURATION
   ========================================================= */

const CACHE_NAME =
    "locallink-v1";


const APP_SHELL = [

    "./",

    "./index.html",
    "./about.html",
    "./login.html",
    "./register.html",

    "./dashboard.html",
    "./educational.html",
    "./community.html",
    "./internships-skills.html",
    "./local.html",
    "./events.html",
    "./emergencies.html",
    "./calendar.html",
    "./settings.html",

    "./css/style.css",

    "./js/main.js",
    "./js/auth.js",
    "./js/dashboard.js",
    "./js/educational.js",
    "./js/community.js",
    "./js/internships-skills.js",
    "./js/local.js",
    "./js/events.js",
    "./js/emergencies.js",
    "./js/calendar.js",
    "./js/settings.js",
    "./js/csvReader.js",
    "./js/notifications.js",
    "./js/navbar.js",

    "./manifest.json",

    "./assets/icons/icon-192.png",
    "./assets/icons/icon-512.png"
];


/* =========================================================
   2. INSTALL EVENT
   ========================================================= */

self.addEventListener(
    "install",
    (event) => {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            )
            .then(
                (cache) => {

                    console.log(
                        "LocalLink: caching app shell..."
                    );


                    return cache.addAll(
                        APP_SHELL
                    );
                }
            )
            .then(
                () => {

                    /*
                       Activate the new service worker
                       immediately.
                    */

                    return self.skipWaiting();
                }
            )
            .catch(
                (error) => {

                    console.error(
                        "LocalLink cache installation failed:",
                        error
                    );
                }
            )

        );

    }
);


/* =========================================================
   3. ACTIVATE EVENT
   ========================================================= */

self.addEventListener(
    "activate",
    (event) => {

        event.waitUntil(

            caches.keys()
                .then(
                    (cacheNames) => {

                        return Promise.all(

                            cacheNames
                                .filter(
                                    (cacheName) =>
                                        cacheName !==
                                        CACHE_NAME
                                )
                                .map(
                                    (cacheName) => {

                                        console.log(
                                            "LocalLink: deleting old cache:",
                                            cacheName
                                        );


                                        return caches.delete(
                                            cacheName
                                        );
                                    }
                                )

                        );

                    }
                )
                .then(
                    () => {

                        /*
                           Take control of currently
                           open LocalLink pages.
                        */

                        return self.clients.claim();
                    }
                )

        );

    }
);


/* =========================================================
   4. FETCH EVENT
   ========================================================= */

self.addEventListener(
    "fetch",
    (event) => {

        const request =
            event.request;


        /*
           Only handle GET requests.
        */

        if (
            request.method !==
            "GET"
        ) {

            return;
        }


        const url =
            new URL(
                request.url
            );


        /*
           Only handle same-origin requests.
        */

        if (
            url.origin !==
            self.location.origin
        ) {

            return;
        }


        /*
           CSV files use NETWORK-FIRST.
           This allows newer demo data to be loaded
           whenever the local server is available.
        */

        if (
            url.pathname.endsWith(
                ".csv"
            )
        ) {

            event.respondWith(
                networkFirst(
                    request
                )
            );

            return;
        }


        /*
           HTML, CSS, JS, images and other app-shell
           resources use CACHE-FIRST.
        */

        event.respondWith(
            cacheFirst(
                request
            )
        );
    }
);


/* =========================================================
   5. CACHE-FIRST STRATEGY
   ========================================================= */

async function cacheFirst(
    request
) {

    const cachedResponse =
        await caches.match(
            request
        );


    if (cachedResponse) {

        return cachedResponse;
    }


    try {

        const networkResponse =
            await fetch(
                request
            );


        /*
           Cache successful same-origin responses.
        */

        if (
            networkResponse &&
            networkResponse.ok
        ) {

            const cache =
                await caches.open(
                    CACHE_NAME
                );


            cache.put(
                request,
                networkResponse.clone()
            );
        }


        return networkResponse;

    } catch (error) {

        console.error(
            "LocalLink network request failed:",
            error
        );


        /*
           Fallback to the main page for navigation
           when offline.
        */

        if (
            request.mode ===
            "navigate"
        ) {

            const fallback =
                await caches.match(
                    "./index.html"
                );


            if (fallback) {

                return fallback;
            }
        }


        return new Response(
            "LocalLink is currently offline.",
            {
                status:
                    503,

                statusText:
                    "Service Unavailable",

                headers: {
                    "Content-Type":
                        "text/plain; charset=utf-8"
                }
            }
        );
    }
}


/* =========================================================
   6. NETWORK-FIRST STRATEGY
   ========================================================= */

async function networkFirst(
    request
) {

    try {

        const networkResponse =
            await fetch(
                request
            );


        if (
            networkResponse &&
            networkResponse.ok
        ) {

            const cache =
                await caches.open(
                    CACHE_NAME
                );


            cache.put(
                request,
                networkResponse.clone()
            );
        }


        return networkResponse;

    } catch (error) {

        console.warn(
            "LocalLink network unavailable. Using cached CSV:",
            request.url
        );


        const cachedResponse =
            await caches.match(
                request
            );


        if (cachedResponse) {

            return cachedResponse;
        }


        return new Response(
            "",
            {
                status:
                    503,

                statusText:
                    "CSV Unavailable"
            }
        );
    }
}


/* =========================================================
   7. PUSH EVENT
   ========================================================= */

/*
   This prepares LocalLink for future Web Push
   notifications.

   The current prototype can still use normal
   browser/service-worker notifications without
   a push server.
*/

self.addEventListener(
    "push",
    (event) => {

        let data = {};


        try {

            if (
                event.data
            ) {

                data =
                    event.data.json();
            }

        } catch (error) {

            console.error(
                "Unable to read push data:",
                error
            );
        }


        const title =
            data.title ||
            "LocalLink";


        const options = {

            body:
                data.body ||
                "You have a new LocalLink notification.",

            icon:
                data.icon ||
                "./assets/icons/icon-192.png",

            badge:
                data.badge ||
                "./assets/icons/icon-192.png",

            tag:
                data.tag ||
                "locallink-notification",

            data: {
                url:
                    data.url ||
                    "./dashboard.html"
            }
        };


        event.waitUntil(

            self.registration
                .showNotification(
                    title,
                    options
                )

        );
    }
);


/* =========================================================
   8. NOTIFICATION CLICK
   ========================================================= */

self.addEventListener(
    "notificationclick",
    (event) => {

        event.notification.close();


        const targetURL =
            event.notification
                .data?.url ||
            "./dashboard.html";


        event.waitUntil(

            clients.matchAll(
                {
                    type:
                        "window",
                    includeUncontrolled:
                        true
                }
            )
            .then(
                (clientList) => {

                    /*
                       If LocalLink is already open,
                       focus the existing tab.
                    */

                    for (
                        const client
                        of clientList
                    ) {

                        if (
                            "focus" in
                            client
                        ) {

                            return client
                                .focus()
                                .then(
                                    () =>
                                        client
                                            .navigate(
                                                targetURL
                                            )
                                );
                        }
                    }


                    /*
                       Otherwise open a new window.
                    */

                    if (
                        clients.openWindow
                    ) {

                        return clients.openWindow(
                            targetURL
                        );
                    }

                }
            )

        );
    }
);


/* =========================================================
   9. MESSAGE EVENT
   ========================================================= */

self.addEventListener(
    "message",
    (event) => {

        if (
            event.data?.type ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();
        }
    }
);


/* =========================================================
   10. SERVICE WORKER READY
   ========================================================= */

console.log(
    "LocalLink Service Worker loaded."
);