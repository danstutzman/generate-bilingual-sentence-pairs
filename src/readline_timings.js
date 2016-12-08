var fs = require('fs')

function question(prompt) {
  var charTimings = []

  process.stdin.pause()
  var fdR = fs.openSync('/dev/tty', 'r')
  var fdW = process.stdout.fd
  var ttyR = process.stdin._handle
  var buffer = Buffer.alloc(1)
  var reqSize = 1
  if (ttyR.setRawMode(true) !== 0) { throw new Error("Non-zero from setRawMode") }

  fs.writeSync(fdW, prompt)

  var startTime = process.hrtime()
  var gotNewline = false
  while (!gotNewline) {

    fs.readSync(fdR, buffer, 0, reqSize)
    var diff = process.hrtime(startTime)
    charTimings.push([buffer.toString(), diff[0] + diff[1] / 1000000000])

    var charCode = buffer.toString().charCodeAt(0)
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
      fs.writeSync(fdW, buffer.toString())
    }
  }
  return charTimings
}

module.exports = { question }
