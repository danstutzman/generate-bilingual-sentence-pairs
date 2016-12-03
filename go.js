#!/usr/local/bin/node
const chokidar        = require('chokidar')
const flowRemoveTypes = require('flow-remove-types')
const fs              = require('fs')
const { spawn, exec } = require('child_process')
const { JSHINT }      = require('jshint')
const chalk           = require('chalk')

const JSHINT_OPTIONS = { "asi": true, "esversion": 6 }
const CHOKIDAR_OPTIONS = {'ignored':/[\/\\]\./, 'ignoreInitial':true}

// Build all files when watch.js is first run
const process = spawn('/bin/bash', ['-c', `echo Running flow &&
  node_modules/.bin/flow &&
  JS_FILES=$(find src -name '*.js') &&
  grep ';$' $JS_FILES
  if [ "$?" == "0" ]; then exit 1; fi &&
  rm -rf build &&
  node_modules/.bin/flow-remove-types --out-dir build $JS_FILES &&
  echo Running jshint &&
  node_modules/.bin/jshint $(find build -name '*.js')`])
process.stdout.on('data', (data) => { console.log(data.toString().trim()) })
process.stderr.on('data', (data) => { console.log(data.toString().trim()) })
process.on('close', (code) => {
  if (code !== 0) { process.exit(1) }
  console.log('Build done')
  exec('afplay /System/Library/Sounds/Pop.aiff') // success sound
})

// Every time a file is edited, build that file
chokidar.watch('src', CHOKIDAR_OPTIONS).on('all', (event, path) => {
  console.log(chalk.gray(`Detected ${event} of ${path}`))
  if ((event === 'change' || event === 'add') && path.endsWith('.js')) {
    const flowSource = fs.readFileSync(path, 'utf8')
    for (const line of flowSource.split('\n')) {
      if (line.endsWith(';')) {
        exec("/usr/bin/say 'semicolon'")
        return
      }
    }

    const flowRemovedSource = flowRemoveTypes(flowSource)
    try {
      fs.writeFileSync(`build/${path}`, flowRemovedSource)
    } catch (e) {
      exec("/usr/bin/say 'flow type error'")
      return
    }

    JSHINT(flowRemovedSource, JSHINT_OPTIONS, {})
    if (JSHINT.errors.length > 0) {
      console.error(JSHINT.errors)
      exec("/usr/bin/say 'j s hint error'")
      return
    }

    exec('afplay /System/Library/Sounds/Pop.aiff') // success sound
  }
})

//echo "Browserify..."
//node_modules/.bin/browserify build/src/generate6/test.js -o build/browserified.js
//echo "Google Closure Compiler..."
//java -jar node_modules/google-closure-compiler//compiler.jar \
//  --compilation_level ADVANCED_OPTIMIZATIONS --js build/browserified.js \
//  > build/browserified.min.js
