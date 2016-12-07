// @flow
import type { Ref, Skill } from './types'
import type { EnIdentity } from './en/types'
import type { EsIdentity, KindOfVerb, Tense, Person, Number } from './es/types'

const chalk        = require('chalk')
const readlineSync = require('readline-sync')

const EnPronouns             = require('./en/EnPronouns')
const EsPronouns             = require('./es/EsPronouns')
const EnTranslator           = require('./en/Translator')
const EsTranslator           = require('./es/Translator')
const { join, joinSkills }   = require('./join')
const { translateInfinitiveToEn, pickInfinitivePairForRegularConjugation } =
  require('./es/verbs')
const regular_conjugation_pattern_table =
  require('./es/verbs/regular_conjugation_pattern_table')
const { toKindOfVerb, toTense, toNumber, toPerson } = require('./es/types')
const { UniNClause }         = require('./uni/noun_phrases')
const { UniIClause }         = require('./uni/uni_iclause')

const esRefToIdentity: {[ref:Ref]:EsIdentity} = {
  'I':['M',1,[]], 'U':['M',1,[]], 'A':['M',1,[]],
}
const enRefToIdentity: {[ref:Ref]:EnIdentity} = {
  'I':['M',1,[]], 'U':['M',1,[]], 'A':['M',1,[]],
}

function practiceInfinitive(skill:Skill, esInfinitive:string) {
  const enVerb = translateInfinitiveToEn(esInfinitive)
  const attempt = readlineSync.question(
    "Please provide the Spanish infinitive for the following:\n  " + enVerb + "\n> ")
}

function practiceRegularSuffix(skill:Skill, kindOfVerb:KindOfVerb, tense:Tense,
    person:Person, number:Number) {
  const infinitivePair = pickInfinitivePairForRegularConjugation(
    tense, person, number)
  const patterns = regular_conjugation_pattern_table.find01(
    infinitivePair.es, tense, person, number, false)
  if (patterns.length === 0) {
    throw new Error("Found no patterns")
  }
  const pattern = patterns[0]
  const iclause = new UniIClause({
    agent:(person === 1 ? 'I' : (person === 2 ? 'U' : 'A')),
    verb:infinitivePair.en,
  })

  let didGenerateSkill = false
  const esTranslator = new EsTranslator(tense, new EsPronouns({yo:'I', tu:'U'}),
    esRefToIdentity)
  const generatedSkills = esTranslator.translateIClause(iclause).skills()
  for (const generatedSkill of generatedSkills) {
    didGenerateSkill = didGenerateSkill || (generatedSkill[0] === skill)
  }
  if (!didGenerateSkill) {
    throw new Error(`No skill ${skill} in ${JSON.stringify(iclause)}`)
  }

  const enTranslator = new EnTranslator(
    {'pres':'pres', 'pret':'past'}[tense], new EnPronouns({me:'I', you:'U'}),
    enRefToIdentity)
  const enTranslated = join(enTranslator.translateIClause(iclause, false).words())
  const attempt = readlineSync.question(
    "Translate the following as one Spanish word:\n  " + enTranslated + "\n> ")
  console.log('Expected answer was', chalk.green(joinSkills(generatedSkills)))
}

function practice(skill:Skill) {
  let match: Array<string> | null | void
  if (false && (match = skill.match(/^v-inf-(.*)$/))) {
    const [_, esInfinitive] = match
    practiceInfinitive(skill, esInfinitive)
  } else if ((match = skill.match(/^v-suffix-([^-]+)-(pres|pret)([123])([12])$/))) {
    const [_, kindOfVerb, tenseStr, personStr, numberStr] = match
    if (kindOfVerb !== 'stempret') {
      practiceRegularSuffix(skill, toKindOfVerb(kindOfVerb), toTense(tenseStr),
        toPerson(personStr), toNumber(numberStr))
    }
  }
}

module.exports = { practice }
