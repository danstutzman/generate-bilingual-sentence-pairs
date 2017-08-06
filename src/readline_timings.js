var fs = require('fs')
var BYTES_IN_LONGEST_UTF8_CHARACTER = 4

function question(prompt) {
  var charTimings = []

  process.stdin.pause()
  var fdR = fs.openSync('/dev/tty', 'r')
  var fdW = process.stdout.fd
  var ttyR = process.stdin._handle
  var buffer = Buffer.alloc(BYTES_IN_LONGEST_UTF8_CHARACTER)
  if (ttyR.setRawMode(true) !== 0) { throw new Error("Non-zero from setRawMode") }

  fs.writeSync(fdW, prompt)

  var startTime = process.hrtime()
  var gotNewline = false
  while (!gotNewline) {

    var numBytesRead = fs.readSync(fdR, buffer, 0, BYTES_IN_LONGEST_UTF8_CHARACTER)
    var bytesRead = buffer.toString('utf-8', 0, numBytesRead)
    var diff = process.hrtime(startTime)
    charTimings.push([bytesRead, diff[0] + diff[1] / 1000000000])

    var charCode = bytesRead.charCodeAt(0)
    if (charCode === 3) { // if Ctrl-C
      console.log('^C')
      process.kill(process.pid, 'SIGINT')
    } else if (charCode === 4) { // if Ctrl-D (EOF)
      console.log('^D')
      process.kill(process.pid, 'SIGINT')
    } else if (charCode === 13) { // if CR (enter key)
      fs.writeSync(fdW, "\n")
      gotNewline = true
    } else if (charCode === 127) {
      charTimings.pop() // pop the backspace
      if (charTimings.length > 0) {
        fs.writeSync(fdW, "\b \b")
        charTimings.pop() // pop the character before
      }
    } else {
      fs.writeSync(fdW, bytesRead)
    }
  }
  charTimings.string = charTimings.map((c) => { return c[0] }).join('').trim()
  return charTimings
}

module.exports = { question }
