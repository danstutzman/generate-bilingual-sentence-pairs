// @flow
import type { KindOfVerb, Tense, Person, Number } from "./types"

class ConjugationPattern {
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
  tense_person_number() : [Tense, Person, Number] {
    return [this.tense, this.person, this.number]
  }
}

var table : Array<ConjugationPattern> = [
  new ConjugationPattern("-ar verbs",         "pres", 1, 1, "-o"),
  new ConjugationPattern("-ar verbs",         "pres", 2, 1, "-as"),
  new ConjugationPattern("-ar verbs",         "pres", 3, 1, "-a"),
  new ConjugationPattern("-ar verbs",         "pres", 1, 2, "-amos"),
  new ConjugationPattern("-ar verbs",         "pres", 3, 2, "-an"),
  new ConjugationPattern("-ar verbs",         "pret", 1, 1, "-é"),
  new ConjugationPattern("-ar verbs",         "pret", 2, 1, "-aste"),
  new ConjugationPattern("-ar verbs",         "pret", 3, 1, "-ó"),
  new ConjugationPattern("-ar verbs",         "pret", 1, 2, "-amos"),
  new ConjugationPattern("-ar verbs",         "pret", 3, 2, "-aron"),
  new ConjugationPattern("-er and -ir verbs", "pres", 1, 1, "-o"),
  new ConjugationPattern("-er and -ir verbs", "pres", 2, 1, "-es"),
  new ConjugationPattern("-er and -ir verbs", "pres", 3, 1, "-e"),
  new ConjugationPattern("-er and -ir verbs", "pres", 3, 2, "-en"),
  new ConjugationPattern("-er and -ir verbs", "pret", 1, 1, "-í"),
  new ConjugationPattern("-er and -ir verbs", "pret", 2, 1, "-iste"),
  new ConjugationPattern("-er and -ir verbs", "pret", 3, 1, "-ió"),
  new ConjugationPattern("-er and -ir verbs", "pret", 1, 2, "-imos"),
  new ConjugationPattern("-er and -ir verbs", "pret", 3, 2, "-ieron"),
  new ConjugationPattern("-er verbs",         "pres", 1, 2, "-emos"),
  new ConjugationPattern("-ir verbs",         "pres", 1, 2, "-imos"),
  new ConjugationPattern("stem change pret",  "pret", 1, 1, "-e"),
  new ConjugationPattern("stem change pret",  "pret", 2, 1, "-iste"),
  new ConjugationPattern("stem change pret",  "pret", 3, 1, "-o"),
  new ConjugationPattern("stem change pret",  "pret", 1, 2, "-imos"),
  new ConjugationPattern("stem change pret",  "pret", 3, 2, "-ieron"),
]

var lookupByL2 = function(l2:string) : Array<ConjugationPattern> {
  var patterns = []
  for (var i = 0; i < table.length; i++) {
    var pattern = table[i]
    var suffix = pattern.suffix.substring(1) // remove initial hyphen
    if (l2.endsWith(suffix)) {
      patterns.push(pattern)
    }
  }
  return patterns
}

module.exports = {
  ConjugationPattern: ConjugationPattern,
  lookupByL2:         lookupByL2,
}
