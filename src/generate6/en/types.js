// @flow
const { raise } = require('../raise')

export type Tense = "pres" | "past"

export type Person = 1 | 2 | 3

export type Number = 1 | 2

export type Gender = "M" | "F" | "N"

export type PreferredPronouns = "I/he" | "I/she" | "I/it" | "we/they"
function preferenceToGenderNumber(pronouns:PreferredPronouns): [Gender, Number] {
  return {
    "I/he":    ['M', 1],
    "I/she":   ['F', 1],
    "I/it":    ['N', 1],
    "we/they": ['N', 2],
  }[pronouns] || raise("Unknown preferred pronouns " + pronouns)
}

module.exports = { preferenceToGenderNumber }
