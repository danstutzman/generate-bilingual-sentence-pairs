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
const { translateInfinitiveToEn, pickInfinitivePairForRegularConjugation,
  pickInfinitivePairForStemChangePret, InfinitivePair } = require('./es/verbs')
const regular_conjugation_pattern_table =
  require('./es/verbs/regular_conjugation_pattern_table')
const unique_conjugation_table = require('./es/verbs/unique_conjugation_table')
const { listInfinitivesWithPretStemChange } = require('./es/verbs/stem_change_table')
const { toKindOfVerb, toTense, toNumber, toPerson } = require('./es/types')
const { UniNClause }         = require('./uni/noun_phrases')
const { UniIClause }         = require('./uni/uni_iclause')
const { raise }              = require('./raise')

const esRefToIdentity: {[ref:Ref]:EsIdentity} = {
  'I':['M',1,[]], 'We':['M',2,['I']], 'U':['M',1,[]], 'A':['M',1,[]], 'AA':['M',2,[]],
}
const enRefToIdentity: {[ref:Ref]:EnIdentity} = {
  'I':['M',1,[]], 'We':['M',2,['I']], 'U':['M',1,[]], 'A':['M',1,[]], 'AA':['M',2,[]],
}

function practiceInfinitive(skill:Skill, esInfinitive:string) {
  const enVerb = translateInfinitiveToEn(esInfinitive)
  const attempt = readlineSync.question(
    "Please provide the Spanish infinitive for the following:\n  " + enVerb + "\n> ")
}

function assertGeneratedSkill(skill:Skill, iclause:UniIClause,
    generatedSkills:Array<[Skill,string]>) {
  let didGenerateSkill = false
  for (const generatedSkill of generatedSkills) {
    didGenerateSkill = didGenerateSkill || (generatedSkill[0] === skill)
  }
  if (!didGenerateSkill) {
    throw new Error(`No skill ${skill} in ${JSON.stringify(iclause)}`)
  }
}

function practiceIClause(skill:Skill, iclause:UniIClause, tense:Tense) {
  const esTranslator = new EsTranslator(tense, new EsPronouns({yo:'I', tu:'U'}),
    esRefToIdentity)
  const generatedSkills = esTranslator.translateIClause(iclause).skills()
  assertGeneratedSkill(skill, iclause, generatedSkills)

  const enTranslator = new EnTranslator(
    {'pres':'pres', 'pret':'past'}[tense], new EnPronouns({me:'I', you:'U'}),
    enRefToIdentity)
  const enTranslated = join(enTranslator.translateIClause(iclause, false).words())
  const attempt = readlineSync.question(
    "Translate the following as one Spanish word:\n  " + enTranslated + "\n> ")
  console.log('Expected answer was', chalk.green(joinSkills(generatedSkills)))
}

function practiceRegularSuffix(skill:Skill, kindOfVerb:KindOfVerb, tense:Tense,
    person:Person, number:Number) {
  let infinitivePair: InfinitivePair
  if (kindOfVerb === 'stempret') {
    infinitivePair = pickInfinitivePairForStemChangePret(person, number)
  } else {
    infinitivePair =
      pickInfinitivePairForRegularConjugation(tense, person, number)
  }
  if (infinitivePair === undefined) {
    throw new Error(`No infinitivePairs for ${JSON.stringify(kindOfVerb)},${tense
      },${person},${number}`)
  }
  const patterns = regular_conjugation_pattern_table.find01(
    infinitivePair.es, tense, person, number, kindOfVerb === 'stempret')
  if (patterns.length === 0) {
    throw new Error("Found no patterns")
  }
  const pattern = patterns[0]
  const iclause = new UniIClause({
    agent:{'11':'I', '21':'U', '31':'A', '12':'We', '32':'AA'}['' + person + number
      ] || raise(`Can't find agent for ${person}+${number}`),
    verb:infinitivePair.en,
  })
  practiceIClause(skill, iclause, tense)
}

function practiceUniqSuffix(skill:Skill, esInfinitive:string, tense:Tense,
    person:Person, number:Number) {
  const iclause = new UniIClause({
    agent:{'11':'I', '21':'U', '31':'A', '12':'We', '32':'AA'}['' + person + number
      ] || raise(`Can't find agent for ${person}+${number}`),
    verb:translateInfinitiveToEn(esInfinitive),
  })
  practiceIClause(skill, iclause, tense)
}

function practiceStemChange(skill:Skill, tense:Tense, esInfinitive:string) {
  let possibleChoices: Array<[Person,Number]>
  if (tense === 'pret') {
    possibleChoices = [[1,1], [2,1], [3,1], [1,2], [3,2]]
  } else if (tense === 'pres') {
    possibleChoices = [[1,1], [2,1], [3,1], [3,2]]
  } else {
    throw new Error(`Can't handle tense ${tense}`)
  }

  let choices: Array<[Person,Number]> = []
  for (const [person, number] of possibleChoices) {
    if (unique_conjugation_table.find01(esInfinitive, tense, person, number
      ).length === 1) {
      // skip infinitive that has UniqueConjugations for this tense/person/num
    } else {
      choices.push([person, number])
    }
  }

  const [person, number] = choices[Math.floor(Math.random() * choices.length)]
  const iclause = new UniIClause({
    agent:{'11':'I', '21':'U', '31':'A', '12':'We', '32':'AA'}['' + person + number
      ] || raise(`Can't find agent for ${person}+${number}`),
    verb:translateInfinitiveToEn(esInfinitive),
  })
  practiceIClause(skill, iclause, tense)
}

function practice(skill:Skill) {
  let match: Array<string> | null | void
  if ((match = skill.match(/^v-inf-(.*)$/))) {
    practiceInfinitive(skill, match[1])
  } else if ((match = skill.match(/^v-suffix-([^-]+)-(pres|pret)([123])([12])$/))) {
    practiceRegularSuffix(skill, toKindOfVerb(match[1]), toTense(match[2]),
      toPerson(match[3]), toNumber(match[4]))
  } else if ((match = skill.match(/^v-uniq-([^-]+)-(pres|pret)([123])([12])$/))) {
    practiceUniqSuffix(skill, match[1], toTense(match[2]), toPerson(match[3]),
      toNumber(match[4]))
  } else if ((match = skill.match(/^v-stem-(pres|pret)-([^-]+)$/))) {
    practiceStemChange(skill, toTense(match[1]), match[2])
  }
}

module.exports = { practice }
