/* do not edit! */
/**
 * Service worker browser client
 * @package     GZip Plugin
 * @copyright   Copyright (C) 2005 - 2018 Thierry Bela.
 *
 * dual licensed
 *
 * @license     LGPL v3
 * @license     MIT License
 */
// @ts-check
// build 7688586 2018-07-12 15:06:21-04:00
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("{scope}worker{debug}.js", {
        scope: "{scope}"
    }).catch(function(error) {
        //	console.log(error);
        console.error("😭", error);
    });
}