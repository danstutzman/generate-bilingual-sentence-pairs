// @flow
import type { Person, Tense, Number } from '../types'

const RegularConjugation = require('./RegularConjugation')
const regular_conjugation_pattern_table = require('./regular_conjugation_pattern_table')
const unique_conjugation_table = require('./unique_conjugation_table')
const stem_change_table = require('./stem_change_table')

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
  if (stemChanges.length === 1 && !(person === 1 && number === 2)) {
    const patterns = regular_conjugation_pattern_table.find01(
      infinitive, tense, person, number, true)
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

module.exports = { conjugate }
