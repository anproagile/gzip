// @ts-check
/* global LIB */
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

//(function (LIB) {
// "use strict";

import {
  undef,
  // LIB
} from "./lib.js";
import {
  merge
} from "./lib.utils.js";

import {
  Event
} from "./lib.event.js";

import "./lib.event.pseudo.once.js";

/**
 * legacy srcset support
 * @param {HTMLImageElement} image
 * @returns {Function} update
 */
function rspimages(image) {
  let mq;

  const mqs = image
    .getAttribute("sizes")
    .replace(/\)\s[^,$]+/g, ")")
    .split(",");
  const images = image.dataset.srcset.split(",").map(function (src) {
    return src.split(" ")[0];
  });

  if (typeof window.CustomEvent != "function") {
    function CustomEvent(event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      const evt = document.createEvent("CustomEvent");
      evt.initCustomEvent(
        event,
        params.bubbles,
        params.cancelable,
        params.detail
      );
      return evt;
    }

    CustomEvent.prototype = window.Event.prototype;
  }

  function createEvent(name, params) {
    try {
      return new CustomEvent(name, params);
    } catch (e) {}

    const evt = document.createEvent("CustomEvent");
    evt.initEvent(
      name,
      params && params.bubbles,
      params == undef || (params && params.cancelable),
      params && params.details
    );

    return evt;
  }

  function update() {
    let i = 0;
    const j = mqs.length;

    for (; i < j; i++) {
      if (matchMedia(mqs[i]).matches) {
        if (mqs[i] != mq) {
          mq = mqs[i];
          image.src = images[i];
          image.dispatchEvent(createEvent("sourcechange"));
        }

        break;
      }
    }
  }

  window.addEventListener("resize", update, false);
  update();

  return update;
}

function load(oldImage, observer) {
  const img = new Image();

  img.src = oldImage.dataset.src != undef ? oldImage.dataset.src : oldImage.src;

  if (oldImage.dataset.srcset != undef && window.matchMedia) {
    if (!("srcset" in img)) {
      if (oldImage.dataset.srcset != undef) {
        img.dataset.srcset = oldImage.dataset.srcset;
      }
      if (oldImage.hasAttribute("sizes")) {
        img.setAttribute("sizes", oldImage.getAttribute("sizes"));

        const update = rspimages(img);

        img.addEventListener(
          "load",
          function () {
            window.removeEventListener("resize", update, false);
            rspimages(oldImage);
          },
          false
        );
      }
    } else {
      if (oldImage.dataset.srcset != undef) {
        img.srcset = oldImage.dataset.srcset;
      } else {}
    }
  }

  observer.trigger("preload", img, oldImage);

  if (img.decode != undef) {
    img
      .decode()
      .then(function () {
        observer.trigger("load", img, oldImage);
      })
      .catch(function (error) {
        observer.trigger("error", error, img, oldImage);
      });
  } else {
    img.onerror = function (error) {
      observer.trigger("error", error, img, oldImage);
    };

    if (img.height > 0 && img.width > 0) {
      observer.trigger("load", img, oldImage);
    } else {
      img.onload = function () {
        observer.trigger("load", img, oldImage);
      };
    }
  }
}

function complete() {
  this.trigger("complete");
}

export const images = merge(Object.create(null), {
  /**
   *
   * @param string selector
   * @param object options
   */
  lazy(selector, options) {
    const images = [].slice.apply(
      ((options && options.container) || document).querySelectorAll(selector)
    );
    const observer = merge(true, Object.create(null), Event);
    const io = new IntersectionObserver(function (entries) {
      let i = entries.length,
        index,
        entry;

      while (i--) {
        entry = entries[i];

        if (entry.isIntersecting) {
          io.unobserve(entry.target);

          index = images.indexOf(entry.target);
          if (index != -1) {
            images.splice(index, 1);
          }

          if (images.length == 0) {
            observer.on({
              "load:once": complete,
              "fail:once": complete
            });
          }

          load(entry.target, observer);
        }
      }
    }, options);

    let i = images.length;

    while (i--) {
      io.observe(images[i]);
    }

    return observer;
  }
});
//})(LIB);