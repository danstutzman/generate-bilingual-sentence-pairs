// @flow
const fs              = require('fs')
const readline        = require('readline')
const verb_pair_space = require('./verb_pair_space')
const sprintf         = require('sprintf-js').sprintf

const readFromStdin = function(done: (words: Array<string>) => void) {
  const reader = readline.createInterface({
    input: fs.createReadStream('popular_verbs.txt'),
  })
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

const answers: {[expectedL2: string]: string|void} =
  JSON.parse(fs.readFileSync('quiz_popular_words_answers.json', 'utf8'))
const writeNewAnswer = function(expectedL2:string, givenL2:string) {
  answers[expectedL2] = givenL2
  fs.writeFileSync('quiz_popular_words_answers.json', JSON.stringify(answers))
}

const askQuestion = function(reader:any, l2Words:Array<string>, numWord:number) {
  if (numWord >= l2Words.length) {
    reader.pause() // so program can exit
    return
  }

  let l2 = l2Words[numWord]
  const verbPairs = verb_pair_space.lookupByL2(l2)

  if (verbPairs.length === 0 || answers[l2] !== undefined) {
    return askQuestion(reader, l2Words, numWord + 1)
  }
  const l1:string = verbPairs.map(function(verbPair) {
    return verbPair.l1()
  }).join(' or ')

  const question = "Please translate the following:\n  " + l1 + "\n> "
  reader.question(question, function(answer:string) {
    if (answer === l2) {
      console.log('Correct!')
    } else {
      console.log('Incorrect!')
    }
    writeNewAnswer(l2, answer)
    askQuestion(reader, l2Words, numWord + 1)
  })
}

/*
readFromStdin(function(l2Words: Array<string>) {
  l2Words.reverse()

  const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  askQuestion(reader, l2Words, 0)
})
*/

for (const expectedL2 in answers) {
  const givenL2 = answers[expectedL2]
  const verbPairs = verb_pair_space.lookupByL2(expectedL2)
  if (expectedL2 !== givenL2) {
    console.log(sprintf('%20s -> %-20s not %-20s',
      verbPairs[0].l1(), expectedL2, givenL2))
  }
}
