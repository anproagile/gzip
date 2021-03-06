/**
 *
 * @package     GZip Plugin
 * @subpackage  System.Gzip
 * @copyright   Copyright (C) 2005 - 2018 Thierry Bela.
 *
 * dual licensed
 *
 * @license     LGPL v3
 * @license     MIT License
 */

// @ts-check
/* eslint wrap-iife: 0 */

/**
 *
 */
//SW.strategies = (function() {

const map = new Map();
//const undef = null;
import {
	undef
} from '../serviceworker.js';
import {
	isCacheableRequest
} from "./sw.iscacheable.js";

export const strategies = {
	/**
	 *
	 * @param {string} key
	 * @param {routerHandle} handle
	 */
	add: (key, handle, name) =>
		map.set(key, {
			key,
			name: name == undef ? key : name,
			handle: async event => {
				const response = await handle(event);

				if (response != undef) {

					/*
					console.info({
						clientId: event.clientId,
						strategy: name == undef ? key : name,
						responseMode: response.type,
						requestMode: event.request.mode,
						ok: response.ok,
						bodyUsed: response.bodyUsed,
						responseType: response && response.type,
						isCacheableRequest: strategies.isCacheableRequest(
							event.request,
							response
						),
						request: event.request.url,
						response: response && response.url
					});
					*/
				}

				return response;
			}
		}),
	/**
	 *
	 * @returns {IterableIterator<string>}
	 */
	keys: () => map.keys(),
	/**
	 *
	 * @returns {IterableIterator<routerHandleObject>}
	 */
	values: () => map.values(),
	/**
	 *
	 * @returns {IterableIterator<[function]>}
	 */
	entries: () => map.entries(),
	/**
	 *
	 * @param {string} name
	 * @returns {routerHandleObject}
	 */
	get: name => map.get(name),
	/**
	 *
	 * @param {String} name
	 * @returns {boolean}
	 */
	has: name => map.has(name),
	/**
	 *
	 * @param {String} name
	 * @returns {boolean}
	 */
	delete: name => map.delete(name),
	/**
	 *
	 * @param {Request} request
	 * @param {Response} response
	 */
	// https://www.w3.org/TR/SRI/#h-note6
	isCacheableRequest
};

// if opaque response <- crossorigin? you should use cache.addAll instead of cache.put dude <- stop it!
// if http response != 200 <- hmmm don't want to cache this <- stop it!
// if auth != basic <- are you private? <- stop it!

strategies[Symbol.iterator] = () => map[Symbol.iterator]();
Object.defineProperty(strategies, "size", {
	get: () => map.size
});