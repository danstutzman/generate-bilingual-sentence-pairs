// @flow
import type { Ref } from './types'
import type { EnIdentity } from './en/types'
import type { EsIdentity } from './es/types'

const fs                     = require('fs')
const readlineSync           = require('readline-sync')
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

const speechActs = []
for (const line of fs.readFileSync('curriculum_ideas/GAME2').toString().split("\n")) {
  if (line !== '' && line.charAt(0) !== '#') {
    speechActs.push(interpretSpeechAct(parseLine(line)))
  }
}

for (const speechAct of speechActs) {
  const enPronouns = new EnPronouns({ me:speechAct.speaker, you:speechAct.audience })
  const enTranslated = new EnTranslator('past', enPronouns, enRefToIdentity)
    .translateSpeechAct(speechAct)
  const enJoined = join(enTranslated.words())

  const answer:string = readlineSync.question(
    "Please translate the following:\n  " + enJoined + "\n> ")
  const esPronouns = new EsPronouns({ yo:speechAct.speaker, tu:speechAct.audience })
  const esTranslated = new EsTranslator('pret', esPronouns, esRefToPreferredPronouns)
    .translateSpeechAct(speechAct)
  const esJoined = join(esTranslated.words())
  console.log(chalk.green(esJoined))
  console.log(esTranslated.skills())

  // use styles.red.open and close so user's input is colored too
  readlineSync.question(chalk.styles.red.open +
      'Which skills did you get wrong, if any? (separate with spaces) ')
  console.log(chalk.styles.red.close)
}
