// @flow
import type { Tense, Person, Number } from './types'

const conjugation_pattern_table = require('./conjugation_pattern_table')
const idiosyncratic_verb_conjugation_table =
  require('./idiosyncratic_verb_conjugation_table')
const infinitive_pair_table = require('./infinitive_pair_table')
const stem_change_table = require('./stem_change_table')

const ConjugationPattern = conjugation_pattern_table.ConjugationPattern
const InfinitivePair = infinitive_pair_table.InfinitivePair
const IdiosyncraticVerbConjugation =
  idiosyncratic_verb_conjugation_table.IdiosyncraticVerbConjugation
const StemChange = stem_change_table.StemChange

class VerbPairIdiosyncratic {
  idiosyncraticVerbConjugation: IdiosyncraticVerbConjugation
  infinitivePair: InfinitivePair

  constructor(idiosyncraticVerbConjugation:IdiosyncraticVerbConjugation,
      infinitivePair:InfinitivePair) {
    this.idiosyncraticVerbConjugation = idiosyncraticVerbConjugation
    this.infinitivePair               = infinitivePair
  }
  l1():string {
    return this.infinitivePair.l1
  }
  tense_person_number() : [Tense, Person, Number] {
    return this.idiosyncraticVerbConjugation.tense_person_number()
  }
}

class VerbPairRegular {
  conjugationPattern: ConjugationPattern
  infinitivePair: InfinitivePair

  constructor(conjugationPattern:ConjugationPattern, infinitivePair:InfinitivePair) {
    this.conjugationPattern = conjugationPattern
    this.infinitivePair     = infinitivePair
  }
  l1():string {
    return this.infinitivePair.l1
  }
  tense_person_number() : [Tense, Person, Number] {
    return this.conjugationPattern.tense_person_number()
  }
}

class VerbPairStemChange {
  conjugationPattern: ConjugationPattern
  stemChange: StemChange
  infinitivePair: InfinitivePair

  constructor(conjugationPattern:ConjugationPattern,
      stemChange:StemChange, infinitivePair:InfinitivePair) {
    this.conjugationPattern = conjugationPattern
    this.stemChange         = stemChange
    this.infinitivePair     = infinitivePair
  }
  l1():string {
    return this.stemChange.stem + this.conjugationPattern.suffix
  }
  tense_person_number() : [Tense, Person, Number] {
    return this.conjugationPattern.tense_person_number()
  }
}

export type VerbPair = VerbPairIdiosyncratic | VerbPairRegular | VerbPairStemChange

const only = function<T>(things:Array<T>) : T {
  if (things.length === 0) {
    throw new Error("Unexpected empty list")
  } else if (things.length > 1) {
    throw new Error("Unexpected list greater than size 1")
  } else {
    return things[0]
  }
}

// returns [infinitive] or [] if not applicable
const guessInfinitiveFromPattern = function(l2:string, pattern:ConjugationPattern)
    : Array<string> {
  const suffix = pattern.suffix.substring(1) // remove hyphen
  if (!l2.endsWith(suffix)) {
    throw new Error("Assert l2 " + l2 + " endsWith " + suffix)
  }
  const base = l2.substring(0, l2.length - suffix.length)

  if (base === '') {
    return [] // don't guess the infinitive 'ir', since it's irregular
  } else {
    switch (pattern.kindOfVerb) {
      case "-ar verbs": return [base + "ar"]
      case "-er verbs": return [base + "er"]
      case "-ir verbs": return [base + "ir"]
      case "-er and -ir verbs": return [base + "er", base + "ir"]
      case "stem change pret": return []
      default: throw new Error("Unknown kindOfVerb " + pattern.kindOfVerb)
    }
  }
}

const doesStemChangeMatchPattern = function(stemChange: StemChange,
    pattern:ConjugationPattern) {
  if (stemChange.tense === pattern.tense) {
    const stemNoHyphen = stemChange.stem.substring(0, stemChange.stem.length - 1)
    const infinitive = stemChange.infinitive
    switch (pattern.kindOfVerb) {
      case "-ar verbs": return infinitive.endsWith('ar')
      case "-er verbs": return infinitive.endsWith('er')
      case "-ir verbs": return infinitive.endsWith('ir')
      case "-er and -ir verbs":
        return infinitive.endsWith('er') || infinitive.endsWith('ir')
      case "stem change pret": return stemChange.tense == 'pret'
      default: throw new Error("Unknown kindOfVerb " + pattern.kindOfVerb)
    }
  } else {
    return false
  }
}

const lookupByL2 = function(l2:string) : Array<VerbPair> {
  const verbPairs = []

  const conjugations = idiosyncratic_verb_conjugation_table.lookupByL2(l2)
  for (const conjugation of conjugations) {
    const infinitivePair =
      only(infinitive_pair_table.lookupByL2(conjugation.infinitive))
    verbPairs.push(new VerbPairIdiosyncratic(conjugation, infinitivePair))
  }

  const patterns = conjugation_pattern_table.lookupByL2(l2)
  const stemChanges = stem_change_table.lookupByL2Prefix(l2)
  for (const pattern of patterns) {
    let infinitives
    if (stemChanges.length === 0) {
      infinitives = guessInfinitiveFromPattern(l2, pattern)
    } else if (stemChanges.length === 1) {
      const stemChange = stemChanges[0]
      infinitives = doesStemChangeMatchPattern(stemChange, pattern) ?
        [stemChange.infinitive] : []
    } else {
      throw new Error("Too many stem changes match '" + l2 + "' ")
    }

    for (const infinitive of infinitives) { // infinitives might be []
      const infinitivePairs = infinitive_pair_table.lookupByL2(infinitive) // maybe []
      for (const infinitivePair of infinitivePairs) {
        verbPairs.push(new VerbPairRegular(pattern, infinitivePair))
      }
    }
  }

  return verbPairs
}

module.exports = {
  lookupByL2:            lookupByL2,
  VerbPairIdiosyncratic: VerbPairIdiosyncratic,
  VerbPairRegular:       VerbPairRegular,
}
