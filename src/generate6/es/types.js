// @flow

export type KindOfVerb =
  "-ar verbs" |
  "-er verbs" |
  "-ir verbs" |
  "-er and -ir verbs" |
  "stem change pret"

export type Tense = "pres" | "pret"

export type Person = 1 | 2 | 3

export type Number = 1 | 2

export type Gender = "M" | "F" | "?"

function isInfinitiveKindOfVerb(infinitive:string, kindOfVerb:KindOfVerb): bool {
  switch (kindOfVerb) {
    case "-ar verbs": return infinitive.endsWith('ar')
    case "-er verbs": return infinitive.endsWith('er')
    case "-ir verbs": return infinitive.endsWith('ir')
    case "-er and -ir verbs": return infinitive.endsWith('er') || infinitive.endsWith('ir')
    case "stem change pret": return false
    default: throw new Error("Unknown kindOfVerb " + kindOfVerb)
  }
}

module.exports = { isInfinitiveKindOfVerb }
