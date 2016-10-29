#!/bin/bash -ex
node_modules/.bin/flow
JS_FILES=`find src -name '*.js'`
JS_FILES="$JS_FILES `find test -name *.js`"
grep ";$" $JS_FILES && exit 1 # don't allow lines to end with semicolons
rm -rf build
node_modules/.bin/flow-remove-types --out-dir build $JS_FILES
node_modules/.bin/jshint `find build -name '*.js'`
node_modules/.bin/mocha build/test
