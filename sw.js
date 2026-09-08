const CACHE_NAME = "obsidian-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];


self.addEventListener(
    "install",
    function (event) {

        event.waitUntil(

            caches.open(CACHE_NAME)
                .then(function (cache) {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                })

        );

        self.skipWaiting();
    }
);


self.addEventListener(
    "activate",
    function (event) {

        event.waitUntil(

            caches.keys()
                .then(function (cacheNames) {

                    return Promise.all(

                        cacheNames
                            .filter(function (cacheName) {

                                return cacheName !==
                                    CACHE_NAME;

                            })

                            .map(function (cacheName) {

                                return caches.delete(
                                    cacheName
                                );

                            })

                    );

                })

        );

        self.clients.claim();
    }
);


self.addEventListener(
    "fetch",
    function (event) {

        event.respondWith(

            fetch(event.request)
                .then(function (response) {

                    return response;

                })
                .catch(function () {

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);
