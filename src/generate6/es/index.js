// @flow
import type { Tense } from './types'
import type { Ref } from '../types'

const { IClause } = require('../uni/iclause')
const { raise } = require('../raise')
const RegularConjugation = require('./RegularConjugation')
const regular_conjugation_pattern_table = require('./regular_conjugation_pattern_table')
const { RegularConjugationPattern } = regular_conjugation_pattern_table
const { join } = require('./join')
const Pronoun = require('./Pronoun')
const Pronouns = require('./Pronouns')

class OmittedNoun {
  ref: Ref

  constructor(ref:Ref) {
    this.ref = ref
  }
  words(): Array<string> {
    return ['(' + this.ref + ')']
  }
}

class NameNoun {
  ref: Ref

  constructor(ref:Ref) {
    this.ref = ref
  }
  words(): Array<string> {
    return [this.ref]
  }
}

type Noun = OmittedNoun | NameNoun

class IClauseOrder {
  agent:         Noun
  directPronoun: Pronoun|void
  conjugation:   RegularConjugation
  direct:        NameNoun

  constructor(args:{|
    agent:          Noun,
    directPronoun?: Pronoun|void,
    conjugation:    RegularConjugation,
    direct:         NameNoun,
  |}) {
    this.agent         = args.agent
    this.directPronoun = args.directPronoun
    this.conjugation   = args.conjugation
    this.direct        = args.direct
  }

  words(): Array<string> {
    return []
      .concat(this.agent.words())
      .concat(this.directPronoun !== undefined ? this.directPronoun.words() : [])
      .concat(this.conjugation.words())
      .concat(this.direct.words())
  }
}

function translate(iclause:IClause, tense:Tense, pronouns:Pronouns) {
  const infinitive = {
    want: 'querer',
    need: 'necesitar',
    have: 'tener',
  }[iclause.verb] || raise("Can't find infinitive for verb " + iclause.verb)

  const [person, number, isAgentSpecific] = pronouns.lookupAgent(iclause.agent)

  const pattern = regular_conjugation_pattern_table.find(infinitive, tense, person, number)

  const [directPronoun, isDirectPronounSpecific] =
    pronouns.lookupDirectObj(iclause.direct, iclause.agent)

  return new IClauseOrder({
    agent:         isAgentSpecific ?
                     new OmittedNoun(iclause.agent) : new NameNoun(iclause.agent),
    directPronoun: directPronoun,
    conjugation:   new RegularConjugation({ infinitive, pattern }),
    direct:        isDirectPronounSpecific ?
                     new OmittedNoun(iclause.direct) : new NameNoun(iclause.direct),
  })
}

module.exports = {
  IClauseOrder,
  NameNoun,
  OmittedNoun,
  Pronouns,
  RegularConjugation,
  RegularConjugationPattern,
  join,
  translate,
}
