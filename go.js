#!/usr/local/bin/node
const chokidar        = require('chokidar')
const flowRemoveTypes = require('flow-remove-types')
const fs              = require('fs')
const { spawn, exec } = require('child_process')
const { JSHINT }      = require('jshint')
const chalk           = require('chalk')
const process         = require('process')
const kexec           = require('kexec')

const JSHINT_OPTIONS = { "asi": true, "esversion": 6 }
const CHOKIDAR_OPTIONS = {'ignored':/[\/\\]\./, 'ignoreInitial':true}

// argv[0] is node
// argv[1] is path to script
// argv[2] is optional 'main' or 'test'
if (process.argv.length > 3) {
  throw new Error("Too many command-line arguments")
} else if (process.argv.length === 3) {
  if (process.argv[2] === 'main') {
    kexec('node', ['./build/src/main.js'])
  } else if (process.argv[2] === 'test') {
    kexec('node_modules/.bin/mocha', ['build/test'])
  } else {
    throw new Error("Unknown argv[2]")
  }
}

const spawned = spawn('/bin/bash', ['-c', `echo Running flow &&
  node_modules/.bin/flow &&
  JS_FILES="$(find src -name '*.js') $(find test -name '*.js')" &&
  grep ';$' $JS_FILES
  if [ "$?" == "0" ]; then exit 1; fi &&
  rm -rf build &&
  node_modules/.bin/flow-remove-types --out-dir build $JS_FILES &&
  echo Running jshint &&
  node_modules/.bin/jshint $(find build -name '*.js')`])
spawned.stdout.on('data', (data) => { console.log(data.toString().trim()) })
spawned.stderr.on('data', (data) => { console.log(data.toString().trim()) })
spawned.on('close', (code) => {
  if (code !== 0) { process.exit(1) }
  console.log('Build done')
  exec('afplay /System/Library/Sounds/Pop.aiff') // success sound
})

// Every time a file is edited, build that file
chokidar.watch(['src', 'test'], CHOKIDAR_OPTIONS).on('all', (event, path) => {
  console.log(chalk.gray(`Detected ${event} of ${path}`))
  if ((event === 'change' || event === 'add') && path.endsWith('.js')) {
    const spawned = spawn('node_modules/.bin/flow')
    spawned.stdout.on('data', (data) => { console.log(data.toString().trim()) })
    spawned.stderr.on('data', (data) => { console.log(data.toString().trim()) })
    spawned.on('close', (code) => {
      if (code !== 0) {
        console.error(`Got non-zero code ${code} from spawn node_modules/.bin/flow`)
        exec("afplay /System/Library/Sounds/Funk.aiff")
        return
      }

      const flowSource = fs.readFileSync(path, 'utf8')
      for (const line of flowSource.split('\n')) {
        if (line.endsWith(';')) {
          console.error(`Line ends with semicolon: ${line}`)
          exec("afplay /System/Library/Sounds/Funk.aiff")
          return
        }
      }

      let flowRemovedSource
      try {
        flowRemovedSource = flowRemoveTypes(flowSource)
      } catch (e) {
        console.error(e)
        exec("afplay /System/Library/Sounds/Funk.aiff")
        return
      }
      fs.writeFileSync(`build/${path}`, flowRemovedSource)

      JSHINT(flowRemovedSource.toString(), JSHINT_OPTIONS, {})
      if (JSHINT.errors.length > 0) {
        console.error(JSHINT.errors)
        exec("afplay /System/Library/Sounds/Funk.aiff")
        return
      }

      exec('afplay /System/Library/Sounds/Pop.aiff') // success sound
    })
  }
})

//echo "Browserify..."
//node_modules/.bin/browserify build/src/test.js -o build/browserified.js
//echo "Google Closure Compiler..."
//java -jar node_modules/google-closure-compiler//compiler.jar \
//  --compilation_level ADVANCED_OPTIMIZATIONS --js build/browserified.js \
//  > build/browserified.min.js
