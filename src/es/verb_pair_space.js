// @flow
import type { Tense, Person, Number } from './types'

var conjugation_pattern_table = require('./conjugation_pattern_table')
var idiosyncratic_verb_conjugation_table =
  require('./idiosyncratic_verb_conjugation_table')
var infinitive_pair_table = require('./infinitive_pair_table')
var stem_change_table = require('./stem_change_table')

var ConjugationPattern = conjugation_pattern_table.ConjugationPattern
var InfinitivePair = infinitive_pair_table.InfinitivePair
var IdiosyncraticVerbConjugation =
  idiosyncratic_verb_conjugation_table.IdiosyncraticVerbConjugation
var StemChange = stem_change_table.StemChange

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

var only = function<T>(things:Array<T>) : T {
  if (things.length === 0) {
    throw new Error("Unexpected empty list")
  } else if (things.length > 1) {
    throw new Error("Unexpected list greater than size 1")
  } else {
    return things[0]
  }
}

// returns [infinitive] or [] if not applicable
var guessInfinitiveFromPattern = function(l2:string, pattern:ConjugationPattern)
    : Array<string> {
  var suffix = pattern.suffix.substring(1) // remove hyphen
  if (!l2.endsWith(suffix)) {
    throw new Error("Assert l2 " + l2 + " endsWith " + suffix)
  }
  var base = l2.substring(0, l2.length - suffix.length)

  switch (pattern.kindOfVerb) {
    case "-ar verbs": return [base + "ar"]
    case "-er verbs": return [base + "er"]
    case "-ir verbs": return [base + "ir"]
    case "-er and -ir verbs": return [base + "er", base + "ir"]
    case "stem change pret": return []
    default: throw new Error("Unknown kindOfVerb " + pattern.kindOfVerb)
  }
}

var doesStemChangeMatchPattern = function(stemChange: StemChange,
    pattern:ConjugationPattern) {
  if (stemChange.tense === pattern.tense) {
    var stemNoHyphen = stemChange.stem.substring(0, stemChange.stem.length - 1)
    var infinitive = stemChange.infinitive
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

var lookupByL2 = function(l2:string) : Array<VerbPair> {
  var verbPairs = []

  var conjugations = idiosyncratic_verb_conjugation_table.lookupByL2(l2)
  for (var i = 0; i < conjugations.length; i++) {
    var conjugation = conjugations[i]
    var infinitivePair = only(infinitive_pair_table.lookupByL2(conjugation.infinitive))
    verbPairs.push(new VerbPairIdiosyncratic(conjugation, infinitivePair))
  }

  var patterns = conjugation_pattern_table.lookupByL2(l2)
  var stemChanges = stem_change_table.lookupByL2Prefix(l2)
  for (var i = 0; i < patterns.length; i++) {
    var pattern = patterns[i]

    var infinitives
    if (stemChanges.length === 0) {
      infinitives = guessInfinitiveFromPattern(l2, pattern)
    } else if (stemChanges.length === 1) {
      var stemChange = stemChanges[0]
      infinitives = doesStemChangeMatchPattern(stemChange, pattern) ?
        [stemChange.infinitive] : []
    } else {
      throw new Error("Too many stem changes match '" + l2 + "' ")
    }

    for (var j = 0; j < infinitives.length; j++) { // infinitives might be []
      var infinitive = infinitives[j]
      var infinitivePairs = infinitive_pair_table.lookupByL2(infinitive) // maybe []
      for (var k = 0; k < infinitivePairs.length; k++) {
        var infinitivePair = infinitivePairs[k]
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
