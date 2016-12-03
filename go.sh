#!/bin/bash -e
node_modules/.bin/flow
JS_FILES=`find src -name '*.js'`
JS_FILES="$JS_FILES `find test -name *.js`"
grep ";$" $JS_FILES && exit 1 # don't allow lines to end with semicolons
rm -rf build
node_modules/.bin/flow-remove-types --out-dir build $JS_FILES
node_modules/.bin/jshint `find build -name '*.js'`

# Generate popular_verbs.txt
#OLD_PWD=$PWD
#pushd ../measure-spanish-word-frequency
#PYTHONIOENCODING=utf_8 python ppm.py | grep V > $OLD_PWD/popular_verbs.txt
#pushd

#echo '-------'
#node build/src/es/quiz_popular_verbs.js
#node_modules/.bin/mocha build/test
#node build/src/generate.js
#node build/src/generate2.js
#node build/src/generate3.js
node build/src/generate6/main.js
#node_modules/.bin/mocha build/test --grep generate6

#echo "Browserify..."
#node_modules/.bin/browserify build/src/generate6/test.js -o build/browserified.js
#echo "Google Closure Compiler..."
#java -jar node_modules/google-closure-compiler//compiler.jar \
#  --compilation_level ADVANCED_OPTIMIZATIONS --js build/browserified.js \
#  > build/browserified.min.js
