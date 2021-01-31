(function () {
  'use strict';

  // @ts-check
  /**
   * lazy image loader
   * @package     GZip Plugin
   * @copyright   Copyright (C) 2005 - 2018 Thierry Bela.
   *
   * dual licensed
   *
   * @license     LGPL v3
   * @license     MIT License
   */

  const preamble = "/* do not edit this file! */";

  const compress = {
    // ecma: 5,
    // keep_fnames: true,
    passes: 3,
    toplevel: true,
    unsafe_proto: true,
    pure_funcs: ["console.log", "console.info"]
  };

  const mangle = {
    keep_fnames: true
  };

  const output = {
    // output options
    preamble,
    beautify: true,
    //  ecma: 5, // specify one of: 5, 6, 7 or 8
    comments: true
  };

  const minify = {

    ecma: 8, // specify one of: 5, 6, 7 or 8
    warnings: true,
    compress,
    mangle,
    output: {
      // output options
      ...output,
      preamble: '',
      beautify: false,
      //  ecma: 5, // specify one of: 5, 6, 7 or 8
      comments: false
    }
  };

  const imagesOverride = {

    compress: {

      ...compress,
      toplevel: false
    }
  };

  const imageLoader = {
    input: "./imagesloader.es6",
    output: "./imagesloader.js",
    config: {
      //  ie8: true,
      ecma: 5,
      output,
      warnings: true
    }
  };

  const bgStyles = {
    input: "./bgstyles.es6",
    output: "./bgstyles.js",
    config: {
      //  ie8: true,
      ecma: 5,
      output,
      warnings: true
    }
  };

  const intersectionObserver = {
    input: "./js/lib/intersection-observer.js",
    output: "./js/dist/intersection-observer.js",
    config: {
      //  ie8: true,
      ecma: 5,
      output,
      warnings: true
    }
  };

  const imageLoaderMin = {
    input: "./imagesloader.js",
    output: "./imagesloader.min.js",
    config: {
      ...minify,
      //  ie8: true,
      ecma: 5 // specify one of: 5, 6, 7 or 8
    }
  };

  const bgStylesMin = {
    input: "./bgstyles.js",
    output: "./bgstyles.min.js",
    config: {
      ...minify,
      //  ie8: true,
      ecma: 5 // specify one of: 5, 6, 7 or 8
    }
  };

  const loaderMin = {
    input: "./loader.js",
    output: "./loader.min.js",
    config: {
      ...minify,
      //  ie8: true,
      ecma: 5 // specify one of: 5, 6, 7 or 8
    }
  };

  const libReadyMin = {
    input: "./js/dist/lib.ready.js",
    output: "./js/dist//lib.ready.min.js",
    config: {
      ...minify,
      ...imagesOverride,
      ecma: 5
    }
  };

  const libImageMin = {
    input: "./js/dist/lib.images.js",
    output: "./js/dist//lib.images.min.js",
    config: {
      ...minify,
      ...imagesOverride,
      ecma: 5
    }
  };

  const intersectionObserverMin = {
    input: "./js/dist/intersection-observer.js",
    output: "./js/dist/intersection-observer.min.js",
    config: {
      ...minify,
      ecma: 5
    }
  };

  const syncMin = {
    input: "./worker/dist/sync.fallback.js",
    output: "./worker/dist/sync.fallback.min.js",
    config: {
      ...minify,
      ecma: 5
    }
  };

  const browserPrefetchMin = {
    input: "./worker/dist/browser.prefetch.js",
    output: "./worker/dist/browser.prefetch.min.js",
    config: {
      ...minify,
      ecma: 5
    }
  };

  const serviceWorkerMin = {
    input: "./worker/dist/serviceworker.js",
    output: "./worker/dist/serviceworker.min.js",
    config: {
      ...minify,
      ecma: 8
    }
  };

  const serviceWorkerAdminMin = {
    input: "./worker/dist/serviceworker.administrator.js",
    output: "./worker/dist/serviceworker.administrator.min.js",
    config: {
      ...minify,
      ecma: 8
    }
  };

  const browserMin = {
    input: "./worker/dist/browser.js",
    output: "./worker/dist/browser.min.js",
    config: {
      ...minify,
      ecma: 5
    }
  };

  const browserAdminMin = {
    input: "./worker/dist/browser.administrator.js",
    output: "./worker/dist/browser.administrator.min.js",
    config: {
      ...minify,
      ecma: 5
    }
  };

  const browserSyncMin = {
    input: "./worker/dist/browser.sync.js",
    output: "./worker/dist/browser.sync.min.js",
    config: {
      ...minify,
      ecma: 5
    }
  };

  const browserUninstallMin = {
    input: "./worker/dist/browser.uninstall.js",
    output: "./worker/dist/browser.uninstall.min.js",
    config: {
      ...minify,
      ecma: 5
    }
  };

  var config = /*#__PURE__*/Object.freeze({
    __proto__: null,
    imageLoader: imageLoader,
    bgStyles: bgStyles,
    intersectionObserver: intersectionObserver,
    imageLoaderMin: imageLoaderMin,
    bgStylesMin: bgStylesMin,
    loaderMin: loaderMin,
    libReadyMin: libReadyMin,
    libImageMin: libImageMin,
    intersectionObserverMin: intersectionObserverMin,
    syncMin: syncMin,
    browserPrefetchMin: browserPrefetchMin,
    serviceWorkerMin: serviceWorkerMin,
    serviceWorkerAdminMin: serviceWorkerAdminMin,
    browserMin: browserMin,
    browserAdminMin: browserAdminMin,
    browserSyncMin: browserSyncMin,
    browserUninstallMin: browserUninstallMin
  });

  // @ts-check

  const fs = require("fs");
  const Terser = require("terser");

  for (let name in config) {
    (async function (config, name) {
      try {
        // create a bundle
        console.log('build ' + config.input + ' > ' + config.output + ' ...');
        const result = Terser.minify(
          fs.readFileSync(config.input, "utf8"),
          Object.assign({}, config.config)
        );

        fs.writeFileSync(config.output, result.code);

      } catch (error) {
        console.log({
          name,
          error
        });
      }
    })(config[name], name);
  }

}());
