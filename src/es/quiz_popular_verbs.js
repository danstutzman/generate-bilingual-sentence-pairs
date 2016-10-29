// @flow
const readline        = require('readline')
const verb_pair_space = require('./verb_pair_space')

const readFromStdin = function(done: (words: Array<string>) => void) {
  const reader = readline.createInterface({ input: process.stdin })
  const words: Array<string> = []
  reader.on('line', function(line: string) {
    const values = line.split(/ +/)
    const word = values[0]
    words.push(word.toLowerCase())
  })
  reader.on('close', function() {
    done(words)
  })
}
readFromStdin(function(words: Array<string>) {
  for (const word of words) {
    const verbPairs = verb_pair_space.lookupByL2(word)
    console.log(verbPairs)
  }
})
