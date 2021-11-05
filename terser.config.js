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
  const ECMA_VERSION = 6;

  const compress = {
    // ecma: ECMA_VERSION,
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
    //  ecma: ECMA_VERSION, // specify one of: 5, 6, 7 or 8
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
      //  ecma: ECMA_VERSION, // specify one of: 5, 6, 7 or 8
      comments: false
    }
  };

  const topLevelCompress = {

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
      ecma: ECMA_VERSION,
      output,
      warnings: true
    }
  };

  const bgStyles = {
    input: "./bgstyles.es6",
    output: "./bgstyles.js",
    config: {
      //  ie8: true,
      ecma: ECMA_VERSION,
      output,
      warnings: true
    }
  };

  const intersectionObserver = {
    input: "./js/lib/intersection-observer.js",
    output: "./js/dist/intersection-observer.js",
    config: {
      //  ie8: true,
      ecma: ECMA_VERSION,
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
      ecma: ECMA_VERSION // specify one of: 5, 6, 7 or 8
    }
  };

  const criticalMin = {
    input: "./worker/dist/critical.js",
    output: "./worker/dist/critical.min.js",
    config: {
      ...minify,
      ...topLevelCompress,
      //  ie8: true,
      ecma: ECMA_VERSION // specify one of: 5, 6, 7 or 8
    }
  };

  const criticalFontLoader = {
    input: "./worker/src/critical/fontloader.js",
    output:"./worker/dist/fontloader.js",
    config: {
      //  ie8: true,
      ecma: ECMA_VERSION,
      output,
      warnings: true
    }
  };

  const criticalFontLoaderMin = {
    input: "./worker/dist/fontloader.js",
    output:"./worker/dist/fontloader.min.js",
    config: {
      ...minify,
      //  ie8: true,
      ecma: ECMA_VERSION // specify one of: 5, 6, 7 or 8
    }
  };

  const criticalExtractMin = {
    input: "./worker/dist/critical-extract.js",
    output: "./worker/dist/critical-extract.min.js",
    config: {
      ...minify,
      //  ie8: true,
      ecma: ECMA_VERSION // specify one of: 5, 6, 7 or 8
    }
  };

  const bgStylesMin = {
    input: "./bgstyles.js",
    output: "./bgstyles.min.js",
    config: {
      ...minify,
      //  ie8: true,
      ecma: ECMA_VERSION // specify one of: 5, 6, 7 or 8
    }
  };

  const loaderMin = {
    input: "./loader.js",
    output: "./loader.min.js",
    config: {
      ...minify,
      //  ie8: true,
      ecma: ECMA_VERSION // specify one of: 5, 6, 7 or 8
    }
  };

  const libReadyMin = {
    input: "./js/dist/lib.ready.js",
    output: "./js/dist//lib.ready.min.js",
    config: {
      ...minify,
      ...topLevelCompress,
      ecma: ECMA_VERSION
    }
  };

  const libImageMin = {
    input: "./js/dist/lib.images.js",
    output: "./js/dist//lib.images.min.js",
    config: {
      ...minify,
      ...topLevelCompress,
      ecma: ECMA_VERSION
    }
  };

  const intersectionObserverMin = {
    input: "./js/dist/intersection-observer.js",
    output: "./js/dist/intersection-observer.min.js",
    config: {
      ...minify,
      ecma: ECMA_VERSION
    }
  };

  const oneSignalMin = {
    input: "./worker/dist/onesignal.js",
    output: "./worker/dist/onesignal.min.js",
    config: {
      ...minify,
      ecma: ECMA_VERSION
    }
  };

  const syncMin = {
    input: "./worker/dist/sync.fallback.js",
    output: "./worker/dist/sync.fallback.min.js",
    config: {
      ...minify,
      ecma: ECMA_VERSION
    }
  };

  const browserPrefetchMin = {
    input: "./worker/dist/browser.prefetch.js",
    output: "./worker/dist/browser.prefetch.min.js",
    config: {
      ...minify,
      ...topLevelCompress,
      ecma: ECMA_VERSION
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
      ecma: ECMA_VERSION
    }
  };

  const browserAdminMin = {
    input: "./worker/dist/browser.administrator.js",
    output: "./worker/dist/browser.administrator.min.js",
    config: {
      ...minify,
      ecma: ECMA_VERSION
    }
  };

  const browserSyncMin = {
    input: "./worker/dist/browser.sync.js",
    output: "./worker/dist/browser.sync.min.js",
    config: {
      ...minify,
      ecma: ECMA_VERSION
    }
  };

  const browserUninstallMin = {
    input: "./worker/dist/browser.uninstall.js",
    output: "./worker/dist/browser.uninstall.min.js",
    config: {
      ...minify,
      ecma: ECMA_VERSION
    }
  };

  var config = /*#__PURE__*/Object.freeze({
    __proto__: null,
    imageLoader: imageLoader,
    bgStyles: bgStyles,
    intersectionObserver: intersectionObserver,
    imageLoaderMin: imageLoaderMin,
    criticalMin: criticalMin,
    criticalFontLoader: criticalFontLoader,
    criticalFontLoaderMin: criticalFontLoaderMin,
    criticalExtractMin: criticalExtractMin,
    bgStylesMin: bgStylesMin,
    loaderMin: loaderMin,
    libReadyMin: libReadyMin,
    libImageMin: libImageMin,
    intersectionObserverMin: intersectionObserverMin,
    oneSignalMin: oneSignalMin,
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
        const result = Terser.minify({[config.input]: fs.readFileSync(config.input, "utf8")},
          Object.assign({}, config.config)
        );

        if (result.error) {

          console.error('build failed ...');
          console.error(JSON.stringify({result}, null, 1));

        }
        else {

          fs.writeFileSync(config.output, result.code);
        }

      } catch (error) {
        console.error({
          name,
          error
        });
      }
    })(config[name], name);
  }

}());
