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
const { interpretIClause, interpretSpeechAct } = require('./uni/interpret_sexp')
const { raise }              = require('./raise')
const { translateInfinitiveToEn, pickInfinitivePairForRegularConjugation } =
  require('./es/verbs')
const regular_conjugation_pattern_table =
  require('./es/verbs/regular_conjugation_pattern_table')
const { toTense, toNumber, toPerson } = require('./es/types')
const { UniNClause }         = require('./uni/noun_phrases')
const { UniIClause }         = require('./uni/uni_iclause')

const esRefToIdentity: {[ref:Ref]:EsIdentity} = {
  'A':['M',1,[]], 'AA':['M',2,['A']], 'B':['M',1,[]], 'BB':['M',2,['B']],
  'C':['M',1,[]], 'Libro':['M',1,[]], 'Libros':['M',2,[]],
  'Me':['M',1,[]], 'Pluma':['F',1,[]], 'What':['M',1,[]], 'You':['M',1,[]],
}
const enRefToIdentity: {[ref:Ref]:EnIdentity} = {
  'A':['M',1,[]], 'B':['M',1,[]], 'C':['N',1,[]], 'BB':['N',2,['B']],
  'Me':['M',1,[]], 'You':['M',1,[]],
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
    const esTranslator = new EsTranslator('pret', esPronouns, esRefToIdentity)
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
  let match: Array<string> | null | void
  if (false && (match = skill.match(/^v-inf-(.*)$/))) {
    const esInfinitive = match[1]
    const enVerb = translateInfinitiveToEn(esInfinitive)
    const attempt = readlineSync.question(
      "Please provide the Spanish infinitive for the following:\n  " + enVerb + "\n> ")
  } else if ((match = skill.match(/^v-suffix-([^-]+)-(pres|pret)([123])([12])$/))) {
    const [_, kindOfVerb, tenseStr, personStr, numberStr] = match
    const tense  = toTense(tenseStr)
    const person = toPerson(personStr)
    const number = toNumber(numberStr)
    console.log(kindOfVerb, tense, person, number)
    if (kindOfVerb !== 'stempret') {
      const infinitivePair = pickInfinitivePairForRegularConjugation(
        tense, person, number)
      const patterns = regular_conjugation_pattern_table.find01(
        infinitivePair.es, tense, person, number, false)
      if (patterns.length === 0) {
        throw new Error("Found no patterns")
      }
      const pattern = patterns[0]
      const iclause = new UniIClause({
        agent:(person === 1 ? 'Me' : (person === 2 ? 'You' : 'A')),
        verb:infinitivePair.en,
      })

      let didGenerateSkill = false
      const esTranslator = new EsTranslator(tense, new EsPronouns({yo:'Me', tu:'You'}),
        esRefToIdentity)
      const generatedSkills = esTranslator.translateIClause(iclause).skills()
      for (const generatedSkill of generatedSkills) {
        didGenerateSkill = didGenerateSkill || (generatedSkill[0] === skill)
      }
      if (!didGenerateSkill) {
        throw new Error(`No skill ${skill} in ${JSON.stringify(iclause)}`)
      }

      const enTranslator = new EnTranslator(
        {'pres':'pres', 'pret':'past'}[tense], new EnPronouns({me:'Me', you:'You'}),
        enRefToIdentity)
      const enTranslated = join(enTranslator.translateIClause(iclause, false).words())
      const attempt = readlineSync.question(
        "Translate the following as one Spanish word:\n  " + enTranslated + "\n> ")
      console.log('Expected answer was', chalk.green(joinSkills(generatedSkills)))
    }
  }

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
