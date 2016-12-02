// @flow

const RegularConjugation = require('./RegularConjugation')
const { UniqueConjugation } = require('./unique_conjugation_table')

export type Conjugation = RegularConjugation | UniqueConjugation
