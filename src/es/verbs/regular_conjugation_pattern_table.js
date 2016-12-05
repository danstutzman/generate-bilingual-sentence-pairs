// @flow
import type { Skill } from "../../types"
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
  skills(): Array<[Skill,string]> {
    return [
      [`prod-v-suffix-${this.kindOfVerb}-${this.tense}${this.person}${this.number}`,
       this.suffix]]
  }
}

const table : Array<RegularConjugationPattern> = [
  new RegularConjugationPattern("ar",       "pres", 1, 1, "-o"),
  new RegularConjugationPattern("ar",       "pres", 2, 1, "-as"),
  new RegularConjugationPattern("ar",       "pres", 3, 1, "-a"),
  new RegularConjugationPattern("ar",       "pres", 1, 2, "-amos"),
  new RegularConjugationPattern("ar",       "pres", 3, 2, "-an"),
  new RegularConjugationPattern("ar",       "pret", 1, 1, "-é"),
  new RegularConjugationPattern("ar",       "pret", 2, 1, "-aste"),
  new RegularConjugationPattern("ar",       "pret", 3, 1, "-ó"),
  new RegularConjugationPattern("ar",       "pret", 1, 2, "-amos"),
  new RegularConjugationPattern("ar",       "pret", 3, 2, "-aron"),
  new RegularConjugationPattern("erir",     "pres", 1, 1, "-o"),
  new RegularConjugationPattern("erir",     "pres", 2, 1, "-es"),
  new RegularConjugationPattern("erir",     "pres", 3, 1, "-e"),
  new RegularConjugationPattern("erir",     "pres", 3, 2, "-en"),
  new RegularConjugationPattern("erir",     "pret", 1, 1, "-í"),
  new RegularConjugationPattern("erir",     "pret", 2, 1, "-iste"),
  new RegularConjugationPattern("erir",     "pret", 3, 1, "-ió"),
  new RegularConjugationPattern("erir",     "pret", 1, 2, "-imos"),
  new RegularConjugationPattern("erir",     "pret", 3, 2, "-ieron"),
  new RegularConjugationPattern("er",       "pres", 1, 2, "-emos"),
  new RegularConjugationPattern("ir",       "pres", 1, 2, "-imos"),
  new RegularConjugationPattern("stempret", "pret", 1, 1, "-e"),
  new RegularConjugationPattern("stempret", "pret", 2, 1, "-iste"),
  new RegularConjugationPattern("stempret", "pret", 3, 1, "-o"),
  new RegularConjugationPattern("stempret", "pret", 1, 2, "-imos"),
  new RegularConjugationPattern("stempret", "pret", 3, 2, "-ieron"),
]

function find01(infinitive:string, tense:Tense, person:Person,
    number:Number, isStemChangePret:bool): Array<RegularConjugationPattern> {
  const patterns = []
  for (const pattern of table) {
    if (isInfinitiveKindOfVerb(infinitive, pattern.kindOfVerb, isStemChangePret) &&
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
