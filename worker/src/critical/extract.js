import {hash} from '../crypto/hash';
import {ready} from "../utils/ready";

ready(() => {

    let dimension;

    if (!"{CRITICAL_MATCHED_VIEWPORTS}".some(dimension => window.matchMedia('(min-width: ' + dimension.split('x', 1)[0] + 'px)').matches)) {

        for (dimension of "{CRITICAL_DIMENSIONS}") {

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
                    critical.extract({fonts: true}).then(async (result) => {

                        console.info(`ended critical extraction in ${((performance.now() - start) / 1000).toFixed(3)}s`);
                        console.info(JSON.stringify({stats: result.stats}, null, 1));
                        console.info({result});

                        const extracted = {
                            url: "{CRITICAL_URL}",
                            dimension,
                            fonts: result.fonts,
                            css: result.styles.join('\n')
                        }

                        const key = "{CRITICAL_HASH}";
                        await fetch("{CRITICAL_POST_URL}", {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8',
                                'X-Signature': `${key}.${await hash(key + JSON.stringify(extracted), 'SHA-256')}`
                            },
                            body: JSON.stringify(extracted)
                        })
                    });

                }, 250);

                break;
            }
        }
    }
})