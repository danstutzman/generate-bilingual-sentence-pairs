// @flow
import type { Tense, PreferredPronouns } from './types'
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
    return []
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
  question:      Pronoun|void
  agent:         Noun
  directPronoun: Pronoun|void
  conjugation:   RegularConjugation
  direct:        NameNoun

  constructor(args:{|
    question?:      Pronoun|void,
    agent:          Noun,
    directPronoun?: Pronoun|void,
    conjugation:    RegularConjugation,
    direct:         NameNoun,
  |}) {
    this.question      = args.question
    this.agent         = args.agent
    this.directPronoun = args.directPronoun
    this.conjugation   = args.conjugation
    this.direct        = args.direct
  }

  words(): Array<string> {
    return []
      .concat(this.question !== undefined ? ['¿']: [])
      .concat(this.question !== undefined ? this.question.words() : [])
      .concat(this.agent.words())
      .concat(this.directPronoun !== undefined ? this.directPronoun.words() : [])
      .concat(this.conjugation.words())
      .concat(this.direct.words())
      .concat(this.question !== undefined ? ['?']: [])
  }
}

function translate(iclause:IClause, tense:Tense, pronouns:Pronouns,
    refToPreferredPronouns:{[ref: string]: PreferredPronouns}) {
  const infinitive = {
    want: 'querer',
    need: 'necesitar',
    have: 'tener',
  }[iclause.verb] || raise("Can't find infinitive for verb " + iclause.verb)

  const [person, number, isAgentSpecific] = pronouns.lookupAgent(iclause.agent,
    refToPreferredPronouns)

  const pattern = regular_conjugation_pattern_table.find(
    infinitive, tense, person, number)

  let [directPronoun, isDirectPronounSpecific] = [undefined, false]
  if (iclause.question !== iclause.direct) {
    [directPronoun, isDirectPronounSpecific] =
      pronouns.lookupDirectObj(iclause.direct, iclause.agent, refToPreferredPronouns)
  }

  const question = (iclause.question === undefined) ? undefined :
    (iclause.question === 'What') ? new Pronoun('qué') :
    raise("Unknown question type " + iclause.question)

  return new IClauseOrder({
    question:      question,
    agent:         isAgentSpecific ?
                     new OmittedNoun(iclause.agent) : new NameNoun(iclause.agent),
    directPronoun: directPronoun,
    conjugation:   new RegularConjugation({ infinitive, pattern }),
    direct:        isDirectPronounSpecific || iclause.question === iclause.direct ?
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
