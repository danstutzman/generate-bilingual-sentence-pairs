// @flow
import type { Ref } from './types'
import type { EnIdentity } from './en/types'
import type { EsIdentity } from './es/types'

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

const esRefToPreferredPronouns: {[ref:Ref]:EsIdentity} = {
  'A':['M',1,[]], 'AA':['M',2,['A']], 'B':['M',1,[]], 'BB':['M',2,['B']],
  'C':['M',1,[]], 'Libro':['M',1,[]], 'Libros':['M',2,[]], 'Pluma':['F',1,[]],
  'What':['M',1,[]],
}
const enRefToIdentity: {[ref:Ref]:EnIdentity} = {
  'A':['M',1,[]], 'B':['M',1,[]], 'C':['N',1,[]], 'BB':['N',2,['B']],
}

function askQuestion(questioner, speechActs, numSpeechAct) {
  if (numSpeechAct >= speechActs.length) {
    questioner.pause() // so program can exit
    return
  }

  const speechAct = speechActs[numSpeechAct]

  const enPronouns = new EnPronouns({ me:speechAct.speaker, you:speechAct.audience })
  const enTranslated = new EnTranslator('pres', enPronouns, enRefToIdentity)
    .translateSpeechAct(speechAct)
  const enJoined = join(enTranslated.words())

  const question = "Please translate the following:\n  " + enJoined + "\n> "
  questioner.question(question, function(answer:string) {
    const esPronouns = new EsPronouns({ yo:speechAct.speaker, tu:speechAct.audience })
    const esTranslated = new EsTranslator('pres', esPronouns, esRefToPreferredPronouns)
      .translateSpeechAct(speechAct)
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
