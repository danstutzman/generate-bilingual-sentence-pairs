// @flow
const fs                     = require('fs')
const readline               = require('readline')
const chalk                  = require('chalk')
const { parseLine }          = require('./uni/parse_line')
const EnPronouns             = require('./en/EnPronouns')
const EsPronouns             = require('./es/EsPronouns')
const EnTranslator           = require('./en/Translator')
const EsTranslator           = require('./es/Translator')
const { join }               = require('./join')
const { UniSpeechAct }       = require('./uni/uni_speech_act')
const { interpretIClause, interpretSpeechAct } = require('./uni/interpret_sexp')

const esRefToPreferredPronouns = {
  'A':'yo/él', 'AA':'nosotros/ellos', 'B':'yo/él', 'Libro':'yo/él',
  'Libros':'nosotros/ellos', 'Pluma':'yo/ella', 'What':'yo/él', 'C':'yo/él',
  'BB':'nosotros/ellos',
}
const enRefToPreferredPronouns = {
  'A':'I/he', 'B':'I/he', 'C':'I/it', 'BB':'we/they',
}

function askQuestion(questioner, speechActs, numSpeechAct) {
  const speechAct = speechActs[numSpeechAct]

  const enTranslated = new EnTranslator('pres', new EnPronouns({}),
    enRefToPreferredPronouns).translateSpeechAct(speechAct)
  const enJoined = join(enTranslated.words())

  const question = "Please translate the following:\n  " + enJoined + "\n> "
  questioner.question(question, function(answer:string) {
    const esTranslated = new EsTranslator('pres', new EsPronouns({}),
      esRefToPreferredPronouns).translateSpeechAct(speechAct)
    const esJoined = join(esTranslated.words())
    console.log(chalk.green(esJoined))

    askQuestion(questioner, speechActs, numSpeechAct + 1)
  })
}

function quiz(speechActs: Array<UniSpeechAct>) {
  const questioner = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  askQuestion(questioner, speechActs, 0)
}

const speechActs = []
readline.createInterface({
  input: fs.createReadStream('curriculum_ideas/GAME2'),
}).on('line', (line) => {
  if (line !== '' && line.charAt(0) !== '#') {
    speechActs.push(interpretSpeechAct(parseLine(line)))
  }
}).on('close', () => {
  quiz(speechActs)
})
