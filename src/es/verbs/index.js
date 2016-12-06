// @flow
import type { Person, Tense, Number, KindOfVerb } from '../types'

const RegularConjugation = require('./RegularConjugation')
const regular_conjugation_pattern_table = require('./regular_conjugation_pattern_table')
const unique_conjugation_table = require('./unique_conjugation_table')
const stem_change_table = require('./stem_change_table')
const { isInfinitiveKindOfVerb } = require('../types')

export type Conjugation = RegularConjugation |
  unique_conjugation_table.UniqueConjugation |
  stem_change_table.StemChangeConjugation

function conjugate(infinitive:string, tense:Tense, person:Person, number:Number):
    Conjugation {
  const uniqueConjugations = unique_conjugation_table.find01(
    infinitive, tense, person, number)
  if (uniqueConjugations.length === 1) {
    return uniqueConjugations[0]
  }

  const stemChanges = stem_change_table.find01(infinitive, tense)
  if (stemChanges.length === 1 &&
      !(tense === 'pres' && person === 1 && number === 2)) {
    const patterns = regular_conjugation_pattern_table.find01(
      infinitive, tense, person, number, tense === 'pret')
    if (patterns.length === 1) {
      return new stem_change_table.StemChangeConjugation(infinitive, stemChanges[0],
        patterns[0])
    } else {
      throw new Error(`Can't find RegularConjugationPattern for stem-changing
        ${infinitive}.${tense}.${person}.${number}`)
    }
  }

  const regularPatterns = regular_conjugation_pattern_table.find01(
    infinitive, tense, person, number, false)
  if (regularPatterns.length === 1) {
    return new RegularConjugation({ infinitive, pattern:regularPatterns[0] })
  } else {
    throw new Error(`Can't find UniqueConjugation or RegularConjugation for
      ${infinitive}.${tense}.${person}.${number}`)
  }
}

class InfinitivePair {
  en: string
  es: string

  constructor(en:string, es:string) {
    this.en = en
    this.es = es
  }
}

const table = [
  new InfinitivePair('want', 'querer'),
  new InfinitivePair('need', 'necesitar'),
  new InfinitivePair('have', 'tener'),
  new InfinitivePair('give', 'dar'),
  new InfinitivePair('tell', 'decir'),
  new InfinitivePair('ask', 'preguntar'),
  new InfinitivePair('command', 'ordenar'),
]

function findInfinitiveByKindOfVerb(kindOfVerb:KindOfVerb): InfinitivePair {
  for (const pair of table) {
    if (isInfinitiveKindOfVerb(pair.es, kindOfVerb, false)) {
      return pair
    }
  }
  throw new Error("Can't find InfinitivePair for kindOfVerb " + kindOfVerb)
}

function translateInfinitiveFromEn(en:string): string {
  for (const pair of table) {
    if (pair.en === en) {
      return pair.es
    }
  }
  throw new Error("Can't find InfinitivePair for verb " + en)
}

function translateInfinitiveToEn(es:string): string {
  for (const pair of table) {
    if (pair.es === es) {
      return pair.en
    }
  }
  throw new Error("Can't find InfinitivePair for verb " + es)
}

function pickInfinitivePairForRegularConjugation(tense:Tense, person:Person,
    number:Number): InfinitivePair {
  const pairs: Array<InfinitivePair> = []
  for (const pair of table) {
    if (unique_conjugation_table.find01(pair.es, tense, person, number).length === 1) {
      // skip infinitive that has UniqueConjugations for this tense/person/num
    } else if (stem_change_table.find01(pair.es, tense).length === 1) {
      // skip infinitive that has a stem change
    } else {
      pairs.push(pair)
    }
  }

  const pair = pairs[Math.floor(Math.random() * pairs.length)]
  return pair
}

module.exports = { conjugate, translateInfinitiveFromEn, translateInfinitiveToEn,
  pickInfinitivePairForRegularConjugation }
