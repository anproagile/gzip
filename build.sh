#!/bin/sh -x
## you need to install uglify-es
# npm install -g uglify-es
## before you run uglify on WSL, you need to install it there
DIR=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
cd $DIR
#
#
#
./node_modules/uglify-es/bin/uglifyjs --warn --comments all --ecma=5 --beautify beautify=true,preamble='"/* do not edit this file! */"' --output ./imagesloader.js -- ./imagesloader.es6
./node_modules/uglify-es/bin/uglifyjs --warn --comments all --ecma=5 --beautify beautify=true,preamble='"/* do not edit this file! */"' --output ./imagesnojs.js -- ./imagesnojs.es6
#
#
./node_modules/uglify-es/bin/uglifyjs  --ecma=8 --compress passes=3,unsafe_proto=true,warnings=true,pure_funcs=["console.log","console.info"]\
  --warn --mangle --keep-fnames --output ./loader.min.js -- ./loader.js
./node_modules/uglify-es/bin/uglifyjs  --ecma=8 --compress passes=3,unsafe_proto=true,warnings=true,pure_funcs=["console.log","console.info"]\
  --warn --mangle --keep-fnames --output ./cssloader.min.js -- ./cssloader.js
./node_modules/uglify-es/bin/uglifyjs  --ecma=8 --compress passes=3,unsafe_proto=true,warnings=true,pure_funcs=["console.log","console.info"]\
  --warn --mangle --keep-fnames --output ./imagesloader.min.js -- ./imagesloader.js
./node_modules/uglify-es/bin/uglifyjs  --ecma=8 --compress passes=3,unsafe_proto=true,warnings=true,pure_funcs=["console.log","console.info"]\
  --warn --mangle --keep-fnames --output ./imagesnojs.min.js -- ./imagesnojs.js
#
#
#
cd ./js
# client side javascript
../node_modules/uglify-es/bin/uglifyjs --warn --comments all --beautify beautify=true,preamble='"/* do not edit this file! */"' --output ./dist/lib.js -- ./lib/lib.js ./lib/lib.ready.js\
  ./lib/lib.utils.js ./lib/lib.event.js ./lib/lib.options.js
../node_modules/uglify-es/bin/uglifyjs --warn --comments all --beautify beautify=true,preamble='"/* do not edit this file! */"' --output ./dist/lib.images.js --  ./lib/lib.images.js
../node_modules/uglify-es/bin/uglifyjs --warn --comments all --beautify beautify=true,preamble='"/* do not edit this file! */"' --output ./dist/intersection-observer.js --  ./lib/intersection-observer.js
# ./lib/lib.sw.js
#./localforage-all.js
../node_modules/uglify-es/bin/uglifyjs --compress unsafe=true,passes=3,ecma=8,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true --warn --mangle  -- ./dist/lib.js > ./dist/lib.min.js
../node_modules/uglify-es/bin/uglifyjs --compress unsafe=true,passes=3,ecma=8,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true --warn --mangle  -- ./dist/lib.images.js > ./dist/lib.images.min.js
../node_modules/uglify-es/bin/uglifyjs --compress unsafe=true,passes=3,ecma=8,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true --warn --mangle  -- ./dist/intersection-observer.js > ./dist/intersection-observer.min.js
# echo "/* do not edit! */" > ./localforage-all.js
#----- ./node_modules/uglify-es/bin/uglifyjs --warn --comments all --beautify beautify=true,preamble='"/* do not edit this file! */"' --output ./dist/localforage.js -- ./localforage/localforage.js ./localforage/localforage-getitems.js\
#-----  ./localforage/localforage-setitems.js ./localforage/localforage-removeitems.js
#----- ./node_modules/uglify-es/bin/uglifyjs --compress unsafe=true,passes=3,ecma=8,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true --warn --mangle  -- ./dist/localforage.js > ./dist/localforage.min.js
# rm ./localforage-all.js
cd ..
#
#
#
#
#
#./node_modules/webpack-cli/bin/cli.js --config webpack.config.js
./node_modules/rollup/bin/rollup -f iife -n gzip worker/src/index.js > worker/dist/serviceworker.js
./node_modules/rollup/bin/rollup -f iife -n gzip worker/src/administrator/index.js > worker/dist/serviceworker.administrator.js
#
#
./node_modules/rollup/bin/rollup -f iife -- worker/src/sync/sw.sync.fallback.js | ./node_modules/uglify-es/bin/uglifyjs --warn --comments all --beautify beautify=true,preamble='"/* do not edit this file! */"' > worker/dist/sync.fallback.js
#| node ../../node_modules/browserify/bin/cmd.js -t babelify > ../dist/sync.fallback.js
./node_modules/uglify-es/bin/uglifyjs --compress unsafe=true,passes=3,ecma=8,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true --warn --mangle  -- worker/dist/sync.fallback.js > worker/dist/sync.fallback.min.js
#
#
cat worker/dist/serviceworker.js | sed "s/build-date/$(date '+%F %H:%M:%S%:z')/g" | sed "s/build-id/$(git rev-parse --short HEAD)/g" > worker/dist/serviceworker.js
#
#
./node_modules/uglify-es/bin/uglifyjs --ecma=8 --compress passes=3,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true,pure_funcs=["console.log","console.info"]\
  --warn --mangle toplevel=true -- worker/dist/serviceworker.js > worker/dist/serviceworker.min.js
#
#
./node_modules/uglify-es/bin/uglifyjs --ecma=8 --compress passes=3,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true,pure_funcs=["console.log","console.info"]\
  --warn --mangle toplevel=true -- worker/dist/serviceworker.administrator.js > worker/dist/serviceworker.administrator.min.js
#
#
./node_modules/uglify-es/bin/uglifyjs --warn --comments all --beautify beautify=true,preamble='"/* do not edit! */"' --ecma=8\
 -- worker/src/browser.js | sed "s/build-date/$(date '+%F %H:%M:%S%:z')/g" | sed "s/build-id/$(git rev-parse --short HEAD)/g" > worker/dist/browser.js
#
#
./node_modules/uglify-es/bin/uglifyjs --warn --comments all --beautify beautify=true,preamble='"/* do not edit! */"' --ecma=8\
 -- worker/src/browser.administrator.js | sed "s/build-date/$(date '+%F %H:%M:%S%:z')/g" | sed "s/build-id/$(git rev-parse --short HEAD)/g" > worker/dist/browser.administrator.js
#
#
./node_modules/uglify-es/bin/uglifyjs --warn --comments all --beautify beautify=true,preamble='"/* do not edit! */"' --ecma=8\
 -- worker/src/browser.sync.js | sed "s/build-date/$(date '+%F %H:%M:%S%:z')/g" | sed "s/build-id/$(git rev-parse --short HEAD)/g" > worker/dist/browser.sync.js
#
./node_modules/uglify-es/bin/uglifyjs --ecma=8 --compress passes=3,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true,pure_funcs=["console.log","console.info"]\
  --warn --mangle toplevel=true -- worker/dist/browser.js > worker/dist/browser.min.js
#
./node_modules/uglify-es/bin/uglifyjs --ecma=8 --compress passes=3,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true,pure_funcs=["console.log","console.info"]\
  --warn --mangle toplevel=true -- worker/dist/browser.administrator.js > worker/dist/browser.administrator.min.js
#
./node_modules/uglify-es/bin/uglifyjs --ecma=8 --compress passes=3,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true,pure_funcs=["console.log","console.info"]\
  --warn --mangle toplevel=true -- worker/dist/browser.sync.js > worker/dist/browser.sync.min.js
#
#
./node_modules/uglify-es/bin/uglifyjs --warn --comments all --beautify beautify=true,preamble='"/* do not edit! */"' --ecma=8\
 -- worker/src/browser.uninstall.js | sed "s/build-date/$(date '+%F %H:%M:%S%:z')/g" | sed "s/build-id/$(git rev-parse --short HEAD)/g" > worker/dist/browser.uninstall.js
#
#
./node_modules/uglify-es/bin/uglifyjs --ecma=8 --compress passes=3,toplevel=true,unsafe_comps=true,unsafe_proto=true,warnings=true,pure_funcs=["console.log","console.info"]\
  --warn --mangle toplevel=true -- worker/dist/browser.uninstall.js > worker/dist/browser.uninstall.min.js
#
#
sha1sum worker/dist/serviceworker.js | awk '{print $1;}' > ./worker_version