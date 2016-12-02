// @flow
import type { Tense } from './types'
import type { Noun } from '../types'

const { IClause } = require('../uni/iclause')
const { raise } = require('../raise')
const RegularConjugation = require('./RegularConjugation')
const regular_conjugation_pattern_table = require('./regular_conjugation_pattern_table')
const { RegularConjugationPattern } = regular_conjugation_pattern_table
const { join } = require('./join')

class NameNoun {
  noun: Noun

  constructor(noun: Noun) {
    this.noun = noun
  }
  words(): Array<string> {
    return [this.noun]
  }
}

class IClauseOrder {
  agent:       NameNoun
  conjugation: RegularConjugation
  direct:      NameNoun

  constructor(args:{|
    agent:       NameNoun,
    conjugation: RegularConjugation,
    direct:      NameNoun,
  |}) {
    this.agent       = args.agent
    this.conjugation = args.conjugation
    this.direct      = args.direct
  }

  words(): Array<string> {
    return []
      .concat(this.agent.words())
      .concat(this.conjugation.words())
      .concat(this.direct.words())
  }
}

function translate(iclause:IClause, tense:Tense) {
  const infinitive = {
    want: 'querer',
    need: 'necesitar',
    have: 'tener',
  }[iclause.verb] || raise("Can't find infinitive for verb " + iclause.verb)

  const pattern = regular_conjugation_pattern_table.find(infinitive, tense, 3, 1)

  return new IClauseOrder({
    agent:       new NameNoun(iclause.agent),
    conjugation: new RegularConjugation({ infinitive, pattern }),
    direct:      new NameNoun(iclause.direct),
  })
}

module.exports = {
  IClauseOrder,
  NameNoun,
  RegularConjugation,
  RegularConjugationPattern,
  join,
  translate,
}
