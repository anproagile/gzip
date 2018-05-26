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
/* global SW, CACHE_NAME */
/* eslint wrap-iife: 0 */

SW.strategies.add(
	"nf",
	async event => {
		"use strict;";

		try {
			const response = await fetch(event.request);

			//	.then(response => {
			if (response == undef) {
				throw new Error("Network error");
			}

			if (SW.strategies.isCacheableRequest(event.request, response)) {
				const cloned = response.clone();
				caches
					.open(CACHE_NAME)
					.then(cache => cache.put(event.request, cloned));
			}

			return response;
			//	})
		} catch (e) {}

		return caches.match(event.request, {cacheName: CACHE_NAME});
	},
	"Network fallback to Cache"
);
