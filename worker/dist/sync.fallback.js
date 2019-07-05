/* do not edit this file! */
(function() {
    "use strict";
    /* LICENSE: MIT LICENSE | https://github.com/msandrini/minimal-indexed-db */
    /* global window */
    /**
	 * @typedef DBType
	 * @function count
	 * @function getEntry
	 * @function getAll
	 * @function put
	 * @function delete
	 * @function flush
	 * @function then
	 * @function catch
	 */
    /**
	 *
	 * @var {DBType} DB
	 * */    async function DB(dbName, key = "id", indexes = []) {
        return new Promise((resolve, reject) => {
            const openDBRequest = indexedDB.open(dbName, 1);
            const storeName = `${dbName}_store`;
            let db;
            const _upgrade = () => {
                db = openDBRequest.result;
                const store = db.createObjectStore(storeName, {
                    keyPath: key
                });
                let index;
                for (index of indexes) {
                    store.createIndex(index.name, index.key, index.options);
                }
            };
            const _query = (method, readOnly, param = null, index = null) => new Promise((resolveQuery, rejectQuery) => {
                const permission = readOnly ? "readonly" : "readwrite";
                if (db.objectStoreNames.contains(storeName)) {
                    const transaction = db.transaction(storeName, permission);
                    const store = transaction.objectStore(storeName);
                    const isMultiplePut = method === "put" && param && typeof param.length !== "undefined";
                    let listener;
                    if (isMultiplePut) {
                        listener = transaction;
                        param.forEach(entry => {
                            store.put(entry);
                        });
                    } else {
                        if (index) {
                            store.index(index);
                        }
                        listener = store[method](param);
                    }
                    listener.oncomplete = (event => {
                        resolveQuery(event.target.result);
                    });
                    listener.onsuccess = (event => {
                        resolveQuery(event.target.result);
                    });
                    listener.onerror = (event => {
                        rejectQuery(event);
                    });
                } else {
                    rejectQuery(new Error("Store not found"));
                }
            });
            const methods = {
                count: () => _query("count", true, keyToUse),
                get: (keyToUse, index) => _query("get", true, keyToUse, index),
                getAll: (keyToUse, index) => _query("getAll", true, keyToUse, index),
                put: entryData => _query("put", false, entryData),
                delete: keyToUse => _query("delete", false, keyToUse),
                clear: () => _query("clear", false),
                deleteDatabase: () => new Promise(function(resolve, reject) {
                    const result = indexedDB.deleteDatabase;
                    result.onerror = reject;
                    result.onsuccess = resolve;
                })
            };
            const _successOnBuild = () => {
                db = openDBRequest.result;
                resolve(methods);
            };
            const _errorOnBuild = e => {
                reject(new Error(e.originalTarget && e.originalTarget.error || e));
            };
            openDBRequest.onupgradeneeded = _upgrade.bind(this);
            openDBRequest.onsuccess = _successOnBuild.bind(this);
            openDBRequest.onerror = _errorOnBuild.bind(this);
        });
    }
    /**
	 *
	 * @package     GZip Plugin
	 * @copyright   Copyright (C) 2005 - 2018 Thierry Bela.
	 *
	 * dual licensed
	 *
	 * @license     LGPL v3
	 * @license     MIT License
	 */
    // @ts-check
    /* eslint wrap-iife: 0 */    function hashCode(string) {
        var hash = 0, i, chr;
        if (string.length === 0) return hash;
        for (i = 0; i < string.length; i++) {
            chr = string.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0;
 // Convert to 32bit integer
                }
        return Number(hash).toString(16);
    }
    /**
	 *
	 * @package     GZip Plugin
	 * @copyright   Copyright (C) 2005 - 2018 Thierry Bela.
	 *
	 * dual licensed
	 *
	 * @license     LGPL v3
	 * @license     MIT License
	 */
    // @ts-check
    /* eslint wrap-iife: 0 */    const isCacheableRequest = (request, response) => response instanceof Response && ("cors" == response.type || new URL(request.url, self.origin).origin == self.origin) && request.method == "GET" && response.ok && [ "default", "cors", "basic", "navigate" ].includes(response.type) && !response.bodyUsed;
    /**
	 *
	 * @package     GZip Plugin
	 * @copyright   Copyright (C) 2005 - 2018 Thierry Bela.
	 *
	 * dual licensed
	 *
	 * @license     LGPL v3
	 * @license     MIT License
	 */    const cacheName = "{CACHE_NAME}";
    let undef = null;
    const serializableProperties = [ "method", "referrer", "referrerPolicy", "mode", "credentials", "cache", "redirect", "integrity", "keepalive" ];
    /*
	function nextRetry(n, max = 1000 * 60 * 60) {

	    // 1 hour
	    return Math.min(max, 1 / 2 * (2 ** n - 1));
	}
	*/
    // store and replay syncs
        class SyncManager {
        /**
	     * 
	     * @param {Request} request 
	     */
        async push(request) {
            const data = await this.cloneRequestData(request);
            const db = await this.getDB();
            await db.put({
                id: hashCode(request.url + serializableProperties.map(async name => {
                    let value = data[name];
                    if (value == undef) {
                        return "";
                    }
                    if (name == "headers") {
                        if (value instanceof Headers) {
                            return [ ...value.values() ].filter(value => value != undef).join("");
                        }
                        return Object.values(value).map(value => data[name][value] != undef ? data[name][value] : "").join("");
                    }
                    if (name == "body") {
                        return await value.text();
                    }
                    return value;
                }).join("")),
                //    retry: 0,
                lastRetry: Date.now() + 1e3 * 60 * 60 * 24,
                url: request.url,
                request: data
            });
            return this;
        }
        /**
	     * 
	     * @param {Request} request 
	     */        async cloneRequestData(request) {
            const requestData = {
                headers: {}
            };
            // Set the body if present.
                        if (request.method !== "GET") {
                // Use ArrayBuffer to support non-text request bodies.
                // NOTE: we can't use Blobs because Safari doesn't support storing
                // Blobs in IndexedDB in some cases:
                // https://github.com/dfahlander/Dexie.js/issues/618#issuecomment-398348457
                requestData.body = await request.clone().arrayBuffer();
            }
            // Convert the headers from an iterable to an object.
                        for (const [key, value] of request.headers.entries()) {
                requestData.headers[key] = value;
            }
            // Add all other serializable request properties
                        for (const prop of serializableProperties) {
                if (request[prop] !== undefined) {
                    requestData[prop] = request[prop];
                }
            }
            // If the request's mode is `navigate`, convert it to `same-origin` since
            // navigation requests can't be constructed via script.
                        if (requestData.mode === "navigate") {
                requestData.mode = "same-origin";
            }
            return requestData;
        }
        /**
	     * @returns {Promise<DBType>}
	     */        async getDB() {
            if (this.db == undef) {
                this.db = await DB("gzip_sw_worker_sync_requests", "id");
            }
            return this.db;
        }
        async replay(tag) {
            if (tag != "{SYNC_API_TAG}") {
                return;
            }
            const db = await this.getDB();
            const requests = await db.getAll();
            if (requests.length > 0) {
                console.info("attempting to sync background requests ...");
            }
            const cache = await caches.open(cacheName);
            for (const data of requests) {
                let remove = false;
                try {
                    console.info("attempting to replay background requests: [" + data.request.method + "] " + data.url);
                    const request = new Request(data.url, data.request);
                    let response = await cache.match(request);
                    remove = response != undef;
                    if (!remove) {
                        response = await fetch(request.clone());
                        remove = response != undef && response.ok;
                        if (remove && isCacheableRequest(request, response)) {
                            await cache.put(request, response);
                        }
                    }
                } catch (e) {}
                if (remove || data.lastRetry <= Date.now()) {
                    await db.delete(data.id);
                }
            }
        }
    }
    /**
	 *
	 * @package     GZip Plugin
	 * @copyright   Copyright (C) 2005 - 2018 Thierry Bela.
	 *
	 * dual licensed
	 *
	 * @license     LGPL v3
	 * @license     MIT License
	 */
    // @ts-check
        const manager = new SyncManager();
    let timeout = 0;
    // retry using back off algorithm
    // - 0
    // - 1 minute
    // - 2 minutes
    // - 4 minutes
    // - 8 minutes
    // - 16 minutes
    // - 32 minutes
    // - 60 minutes ...
        function nextRetry(n, max = 1e3 * 60 * 60) {
        // 1 hour max
        return 6e4 * Math.min(max, 1 / 2 * (2 ** n - 1));
    }
    async function replay() {
        await manager.replay("{SYNC_API_TAG}");
        setTimeout(replay, nextRetry(++timeout));
    }
    setTimeout(replay, nextRetry(timeout));
})();
