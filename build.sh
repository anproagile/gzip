#!/bin/sh -x
# npm install -g uglify-js
# npm install -g google-closure-compiler-js
DIR=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
cd $DIR
cd ./js
# client side javascript
# echo "/* do not edit! */" > ./lib-all.js
cat ./lib/lib.js >> ./lib-all.js
cat ./lib/lib.ready.js >> ./lib-all.js
cat ./lib/lib.utils.js >> ./lib-all.js
cat ./lib/lib.event.js >> ./lib-all.js
cat ./lib/lib.options.js >> ./lib-all.js
cat ./lib/lib.sw.js >> ./lib-all.js
#cat ./lib/lib.sw.cache.js >> ./lib-all.js
#
#
# echo "/* do not edit! */" > ./localforage-all.js
cat ./localforage/localforage.js >> ./localforage-all.js
cat ./localforage/localforage-getitems.js >> ./localforage-all.js
cat ./localforage/localforage-setitems.js >> ./localforage-all.js
cat ./localforage/localforage-removeitems.js >> ./localforage-all.js
#
#
uglifyjs --warn --comments all --beautify beautify=true,preamble='"/* do not edit this file! */"' --output ./dist/bundle.js -- ./lib-all.js ./localforage-all.js
uglifyjs --compress unsafe=true,passes=3,ecma=6,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true --warn --mangle  -- ./dist/bundle.js > ./dist/bundle.min.js
google-closure-compiler-js --compilationLevel=SIMPLE --languageOut=ES6 ./dist/bundle.min.js > ./dist/bundle.g.min.js
rm ./lib-all.js
rm ./localforage-all.js
#
#
#
cd ../worker
uglifyjs --warn --comments all --beautify beautify=true,preamble='"/* do not edit! */"' --output ./dist/browser.js -- ./browser.js
uglifyjs --compress unsafe=true,passes=3,ecma=6,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true --warn --mangle toplevel=true -- ./dist/browser.js > ./dist/browser.min.js
# google-closure-compiler-js --compilationLevel=ADVANCED --assumeFunctionWrapper=false --languageOut=ES6 ./dist/browser.js > ./dist/browser.g.min.js
#
#
uglifyjs --warn --comments all --beautify beautify=true,preamble='"/* do not edit! */"' --output ./dist/serviceworker.js -- ./serviceworker.js ./network/sw.strategies.js ./network/sw.strategies.network_first.js ./network/sw.strategies.cache_first.js ./network/sw.strategies.cache_network.js ./network/sw.strategies.network_only.js ./network/sw.strategies.cache_only.js
uglifyjs --compress unsafe=true,passes=3,ecma=6,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true --warn --mangle toplevel=true -- ./dist/serviceworker.js > ./dist/serviceworker.min.js
google-closure-compiler-js --compilationLevel=ADVANCED --assumeFunctionWrapper=true --languageOut=ES6 ./dist/serviceworker.min.js > ./dist/serviceworker.g.min.js
#php -r "echo hash_file('crc32', 'load-worker.js');" > worker.checksum
#php -r "echo hash_file('crc32', 'load-worker.min.js');" > worker.min.checksum
#php -r "echo 'sha256-'.base64_encode(hash_file('sha256', 'localforage-all.min.js', true));" > integrity.checksum