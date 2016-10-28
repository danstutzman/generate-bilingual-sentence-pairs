#!/bin/bash -ex
node_modules/.bin/flow
rm -rf build
node_modules/.bin/flow-remove-types --out-dir build `find src -name '*.js'` `find test -name '*.js'`
node_modules/.bin/mocha build/test
