// @flow
import type { Ref, Skill } from './types'
import type { EnIdentity } from './en/types'
import type { EsIdentity } from './es/types'

const chalk        = require('chalk')
const fs           = require('fs')
const readlineSync = require('readline-sync')
const yaml         = require('js-yaml')

const { parseLine }          = require('./uni/parse_line')
const EnPronouns             = require('./en/EnPronouns')
const EsPronouns             = require('./es/EsPronouns')
const EnTranslator           = require('./en/Translator')
const EsTranslator           = require('./es/Translator')
const { join, joinSkills }   = require('./join')
const { UniSpeechAct }       = require('./uni/uni_speech_act')
const { interpretSpeechAct } = require('./uni/interpret_sexp')
const { raise }              = require('./raise')
const { practice }           = require('./practice')

const esRefToIdentity: {[ref:Ref]:EsIdentity} = {
  'A':['M',1,[]], 'AA':['M',2,['A']], 'B':['M',1,[]], 'BB':['M',2,['B']],
  'C':['M',1,[]], 'Libro':['M',1,[]], 'Libros':['M',2,[]],
  'Pluma':['F',1,[]], 'What':['M',1,[]],
}
const enRefToIdentity: {[ref:Ref]:EnIdentity} = {
  'A':['M',1,[]], 'B':['M',1,[]], 'C':['N',1,[]], 'BB':['N',2,['B']],
}

const nestedSexps = yaml.safeLoad(fs.readFileSync('curriculum_ideas/GAME2', 'utf8'))
const sexpToSpeechAct: Map<string, UniSpeechAct> = new Map()
const sexpToEnJoined: Map<string, string> = new Map()
const sexpToEsJoined: Map<string, string> = new Map()
const sexpToSkills: Map<string, Array<[Skill,string]>> = new Map()
function flattenNestedSexps(sexpOrSexps) {
  if (Array.isArray(sexpOrSexps)) {
    for (const sexp of sexpOrSexps) {
      flattenNestedSexps(sexp)
    }
  } else if (typeof sexpOrSexps === 'string') {
    const speechAct: UniSpeechAct = interpretSpeechAct(parseLine(sexpOrSexps))
    sexpToSpeechAct.set(sexpOrSexps, speechAct)

    const enPronouns = new EnPronouns({ me:speechAct.speaker, you:speechAct.audience })
    const enTranslated = new EnTranslator('past', enPronouns, enRefToIdentity)
      .translateSpeechAct(speechAct)
    sexpToEnJoined.set(sexpOrSexps, join(enTranslated.words()))

    const esPronouns = new EsPronouns({ yo:speechAct.speaker, tu:speechAct.audience })
    const esTranslator = new EsTranslator('pres', esPronouns, esRefToIdentity)
    const esTranslated = esTranslator.translateSpeechAct(speechAct)
    sexpToEsJoined.set(sexpOrSexps, joinSkills(esTranslated.skills()))
    sexpToSkills.set(sexpOrSexps, esTranslated.skills())
  } else {
    throw new Error(`Unexpected sexpOrSexps '${JSON.stringify(sexpOrSexps)}'`)
  }
}
flattenNestedSexps(nestedSexps)

const skillToImportance: Map<Skill, number> = new Map()
for (var [sexp, skills] of sexpToSkills) {
  for (var [skill, _] of skills) {
    if (skill !== '') {
      skillToImportance.set(skill, (skillToImportance.get(skill) || 0) + 1)
    }
  }
}

const skillsByImportance: Array<[Skill, number]> = []
for (var [skill, importance] of skillToImportance) {
  skillsByImportance.push([skill, importance])
}
// TODO: subtract skills that are well known, so only poor/unknown skills remain
skillsByImportance.sort(function([_1, i1], [_2, i2]) { return i2 - i1 })
console.log(skillsByImportance)

for (var [skill, _] of skillsByImportance) {
  practice(skill)
}

// for each unknown/bad skill:
//   look at prefix to build a "production" task/game
// later: look at prefix to build a "recognition" card (just demo how skill is used)

for (var [sexp, skills] of sexpToSkills) {
  const enJoined:string = sexpToEnJoined.get(sexp) || raise(`Can't find ${sexp}`)
  const esJoined:string = sexpToEsJoined.get(sexp) || raise(`Can't find ${sexp}`)
  const attempt:string = readlineSync.question(
    "Please translate the following:\n  " + enJoined + "\n> ")
  console.log(chalk.green(esJoined))
  console.log(skills)

  // use styles.red.open and close so user's input is colored too
  readlineSync.question(chalk.styles.red.open +
      'Which skills did you get wrong, if any? (separate with spaces) ')
  console.log(chalk.styles.red.close)
}
