(function () {
    'use strict';

    /**
     *
     * @param {string} message
     * @param {string} hash
     * @returns {Promise<string>}
     */
    async function hash(message, hash = 'SHA-256') {
        // encode as UTF-8
        const msgBuffer = new TextEncoder().encode(message);
        // hash the message
        const hashBuffer = await crypto.subtle.digest(hash, msgBuffer);
        // convert ArrayBuffer to Array
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        // convert bytes to hex string
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    (function () {

        let dimension;

        for (dimension of "{CRITICAL_MATCHED_VIEWPORTS}") {

            if (window.matchMedia('(min-width: ' + dimension.split('x', 1)[0] + 'px)').matches) {

                console.info(`matched viewport "${dimension}" skipped`);
                return
            }
        }

        for(dimension of "{CRITICAL_DIMENSIONS}") {

            if (window.matchMedia('(min-width: ' + dimension.split('x', 1)[0] + 'px)').matches) {

                console.info({
                    dimension,
                    matches: true
                });

                const timeout = setInterval(function () {

                    // wait for stylesheets to load
                    if (document.querySelector('link[data-media]')) {

                        return
                    }

                    clearInterval(timeout);

                    const start = performance.now();
                    critical.extract().then(async (result) => {

                        console.info(`ended in ${((performance.now() - start) / 1000).toFixed(3)}s`);

                        console.log({result});

                        const extracted = {
                            url: "{CRITICAL_URL}",
                            dimension,
                            fonts: result.fonts,
                            css: result.styles.join('\n')
                        };

                        const key = "{CRITICAL_HASH}";

                        await fetch("{CRITICAL_POST_URL}", {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8',
                                'X-Signature': `${key}.${await hash(key + JSON.stringify(extracted), 'SHA-256')}`
                            },
                            body: JSON.stringify(extracted)
                        });
                    });

                }, 2500);

                break;
            }
        }
    })();

}());
