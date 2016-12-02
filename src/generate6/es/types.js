// @flow
const { raise } = require('../raise')

export type KindOfVerb =
  "-ar verbs" |
  "-er verbs" |
  "-ir verbs" |
  "-er and -ir verbs" |
  "stem change pret"

export type Tense = "pres" | "pret"

export type Person = 1 | 2 | 3

export type Number = 1 | 2

export type Gender = "M" | "F"

function isInfinitiveKindOfVerb(infinitive:string, kindOfVerb:KindOfVerb,
    isStemChange:bool): bool {
  switch (kindOfVerb) {
    case "-ar verbs": return infinitive.endsWith('ar')
    case "-er verbs": return infinitive.endsWith('er')
    case "-ir verbs": return infinitive.endsWith('ir')
    case "-er and -ir verbs":
      return infinitive.endsWith('er') || infinitive.endsWith('ir')
    case "stem change pret": return isStemChange
    default: throw new Error("Unknown kindOfVerb " + kindOfVerb)
  }
}

export type PreferredPronouns = "yo/él" | "yo/ella" | "nosotros/ellos" | "nosotras/ellas"
function preferenceToGenderNumber(pronouns:PreferredPronouns): [Gender, Number] {
  return {
    "yo/él":          ['M', 1],
    "yo/ella":        ['F', 1],
    "nosotros/ellos": ['M', 2],
    "nosotras/ellas": ['F', 2],
  }[pronouns] || raise("Unknown preferred pronouns " + pronouns)
}

module.exports = { isInfinitiveKindOfVerb, preferenceToGenderNumber }
