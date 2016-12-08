// @flow
import type { Ref, Skill } from './types'
import type { EnIdentity } from './en/types'
import type { EsIdentity, KindOfVerb, Tense, Person, Number } from './es/types'

const chalk           = require('chalk')

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
const { toKindOfVerb, toTense, toNumber, toPerson } = require('./es/types')
const { UniNClause }         = require('./uni/noun_phrases')
const { UniIClause }         = require('./uni/uni_iclause')
const { raise }              = require('./raise')
const readlineTimings        = require('./readline_timings')

const esRefToIdentity: {[ref:Ref]:EsIdentity} = {
  'I':['M',1,[]], 'We':['M',2,['I']], 'U':['M',1,[]], 'A':['M',1,[]], 'AA':['M',2,[]],
}
const enRefToIdentity: {[ref:Ref]:EnIdentity} = {
  'I':['M',1,[]], 'We':['M',2,['I']], 'U':['M',1,[]], 'A':['M',1,[]], 'AA':['M',2,[]],
}

class Card {
  instruction: string
  skills: Array<[Skill,string]>
  enJoined: string

  constructor(instruction:string, skills:Array<[Skill,string]>, enJoined:string) {
    this.instruction = instruction
    this.skills      = skills
    this.enJoined    = enJoined
  }

  assertContainsTargetSkill(skill:Skill) {
    let didGenerateSkill = false
    for (const generatedSkill of this.skills) {
      didGenerateSkill = didGenerateSkill || (generatedSkill[0] === skill)
    }
    if (!didGenerateSkill) {
      throw new Error(`No skill ${skill} in ${JSON.stringify(this.skills)}`)
    }
  }

  questionEsGivenEn(): {[skill:Skill]: bool} {
    const newSkillToGoodness: {[skill:Skill]: bool} = {}
    for (const [newSkill, _] of this.skills) {
      newSkillToGoodness[newSkill] = true
    }

    const attempt = readlineTimings.question(
      this.instruction + "\n  " + this.enJoined + "\n> ")
    const attemptStr = attempt.map((c) => { return c[0] }).join('').trim()
    if (attemptStr.toLowerCase() === joinSkills(this.skills).toLowerCase()) {
      console.log(chalk.green('Correct!'))
    } else {
      console.log(chalk.styles.red.open, "Expected " + joinSkills(this.skills))
      console.log(this.skills)
      let badSkillsStr = ''
      while (badSkillsStr === '') {
        const badSkills = readlineTimings.question(
          'Which skills did you get wrong, if any? (separate with spaces) ' +
          chalk.styles.red.close).string
        badSkillsStr = attempt.map((c) => { return c[0] }).join('').trim()
      }
      for (const badSkill of badSkillsStr.split(' ')) {
        this.assertSkillInSkills(badSkill)
        newSkillToGoodness[badSkill] = true
      }
    }
    return newSkillToGoodness
  }
  assertSkillInSkills(needleSkill:Skill) {
    for (const [skill, _] of this.skills) {
      if (skill === needleSkill) {
        return
      }
    }
    throw new Error(`Can't find ${needleSkill} in ${JSON.stringify(this.skills)}`)
  }
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

function makeCardForInfinitive(skill:Skill, esInfinitive:string): Card {
  return new Card('Please provide the Spanish infinitive for the following:',
    [[`v-inf-${esInfinitive}`, esInfinitive]], translateInfinitiveToEn(esInfinitive))
}

function makeCardForIClause(skill:Skill, iclause:UniIClause, tense:Tense): Card {
  const esTranslator = new EsTranslator(tense, new EsPronouns({yo:'I', tu:'U'}),
    esRefToIdentity)
  const generatedSkills = esTranslator.translateIClause(iclause).skills()
  const enTranslator = new EnTranslator(
    {'pres':'pres', 'pret':'past'}[tense], new EnPronouns({me:'I', you:'U'}),
    enRefToIdentity)
  return new Card('Translate the following as one Spanish word:',
    generatedSkills, join(enTranslator.translateIClause(iclause, false).words()))
}

function practiceRegularSuffix(skill:Skill, kindOfVerb:KindOfVerb, tense:Tense,
    person:Person, number:Number): Card {
  let infinitivePair: InfinitivePair
  if (kindOfVerb === 'stempret') {
    infinitivePair = pickInfinitivePairForStemChangePret(person, number)
  } else {
    infinitivePair = pickInfinitivePairForRegularConjugation(
      kindOfVerb, tense, person, number)
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
  return makeCardForIClause(skill, iclause, tense)
}

function practiceUniqSuffix(skill:Skill, esInfinitive:string, tense:Tense,
    person:Person, number:Number): Card {
  const iclause = new UniIClause({
    agent:{'11':'I', '21':'U', '31':'A', '12':'We', '32':'AA'}['' + person + number
      ] || raise(`Can't find agent for ${person}+${number}`),
    verb:translateInfinitiveToEn(esInfinitive),
  })
  return makeCardForIClause(skill, iclause, tense)
}

function practiceStemChange(skill:Skill, tense:Tense, esInfinitive:string): Card {
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
  return makeCardForIClause(skill, iclause, tense)
}

function makeCardForSkill(skill:Skill): Card {
  let match: Array<string> | null | void
  if ((match = skill.match(/^v-inf-(.*)$/))) {
    return makeCardForInfinitive(skill, match[1])
  } else if ((match = skill.match(/^v-suffix-([^-]+)-(pres|pret)([123])([12])$/))) {
    return practiceRegularSuffix(skill, toKindOfVerb(match[1]), toTense(match[2]),
      toPerson(match[3]), toNumber(match[4]))
  } else if ((match = skill.match(/^v-uniq-([^-]+)-(pres|pret)([123])([12])$/))) {
    return practiceUniqSuffix(skill, match[1], toTense(match[2]), toPerson(match[3]),
      toNumber(match[4]))
  } else if ((match = skill.match(/^v-stem-(pres|pret)-([^-]+)$/))) {
    return practiceStemChange(skill, toTense(match[1]), match[2])
  } else {
    throw new Error("Can't make card for skill " + skill)
  }
}

module.exports = { Card, makeCardForSkill }
