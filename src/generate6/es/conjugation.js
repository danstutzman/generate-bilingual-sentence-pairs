// @flow

const RegularConjugation = require('./RegularConjugation')
const { UniqueConjugation } = require('./unique_conjugation_table')
const { StemChangeConjugation } = require('./stem_change_table')

export type Conjugation = RegularConjugation | UniqueConjugation | StemChangeConjugation
