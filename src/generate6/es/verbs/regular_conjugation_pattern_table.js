// @flow
import type { KindOfVerb, Tense, Person, Number } from "../types"

const { isInfinitiveKindOfVerb } = require('../types')

class RegularConjugationPattern {
  kindOfVerb: KindOfVerb
  tense:      Tense
  person:     Person
  number:     Number
  suffix:     string

  constructor(kindOfVerb:KindOfVerb, tense:Tense, person:Person, number:Number,
      suffix:string) {
    this.kindOfVerb = kindOfVerb
    this.tense      = tense
    this.person     = person
    this.number     = number
    this.suffix     = suffix
  }
}

const table : Array<RegularConjugationPattern> = [
  new RegularConjugationPattern("-ar verbs",         "pres", 1, 1, "-o"),
  new RegularConjugationPattern("-ar verbs",         "pres", 2, 1, "-as"),
  new RegularConjugationPattern("-ar verbs",         "pres", 3, 1, "-a"),
  new RegularConjugationPattern("-ar verbs",         "pres", 1, 2, "-amos"),
  new RegularConjugationPattern("-ar verbs",         "pres", 3, 2, "-an"),
  new RegularConjugationPattern("-ar verbs",         "pret", 1, 1, "-é"),
  new RegularConjugationPattern("-ar verbs",         "pret", 2, 1, "-aste"),
  new RegularConjugationPattern("-ar verbs",         "pret", 3, 1, "-ó"),
  new RegularConjugationPattern("-ar verbs",         "pret", 1, 2, "-amos"),
  new RegularConjugationPattern("-ar verbs",         "pret", 3, 2, "-aron"),
  new RegularConjugationPattern("-er and -ir verbs", "pres", 1, 1, "-o"),
  new RegularConjugationPattern("-er and -ir verbs", "pres", 2, 1, "-es"),
  new RegularConjugationPattern("-er and -ir verbs", "pres", 3, 1, "-e"),
  new RegularConjugationPattern("-er and -ir verbs", "pres", 3, 2, "-en"),
  new RegularConjugationPattern("-er and -ir verbs", "pret", 1, 1, "-í"),
  new RegularConjugationPattern("-er and -ir verbs", "pret", 2, 1, "-iste"),
  new RegularConjugationPattern("-er and -ir verbs", "pret", 3, 1, "-ió"),
  new RegularConjugationPattern("-er and -ir verbs", "pret", 1, 2, "-imos"),
  new RegularConjugationPattern("-er and -ir verbs", "pret", 3, 2, "-ieron"),
  new RegularConjugationPattern("-er verbs",         "pres", 1, 2, "-emos"),
  new RegularConjugationPattern("-ir verbs",         "pres", 1, 2, "-imos"),
  new RegularConjugationPattern("stem change pret",  "pret", 1, 1, "-e"),
  new RegularConjugationPattern("stem change pret",  "pret", 2, 1, "-iste"),
  new RegularConjugationPattern("stem change pret",  "pret", 3, 1, "-o"),
  new RegularConjugationPattern("stem change pret",  "pret", 1, 2, "-imos"),
  new RegularConjugationPattern("stem change pret",  "pret", 3, 2, "-ieron"),
]

function find01(infinitive:string, tense:Tense, person:Person,
    number:Number, isStemChange:bool): Array<RegularConjugationPattern> {
  const patterns = []
  for (const pattern of table) {
    if (isInfinitiveKindOfVerb(infinitive, pattern.kindOfVerb, isStemChange) &&
        pattern.tense === tense &&
        pattern.person === person &&
        pattern.number === number) {
      patterns.push(pattern)
    }
  }
  if (patterns.length > 1) {
    throw new Error(
      `Found >1 RegularConjugationPattern for ${tense}${person}${number}`)
  }
  return patterns
}

module.exports = { RegularConjugationPattern, find01 }
