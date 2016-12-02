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
  question:        Pronoun|void
  agent:           Noun
  indirectPronoun: Pronoun|void
  directPronoun:   Pronoun|void
  conjugation:     RegularConjugation
  indirect:        NameNoun|void
  direct:          NameNoun

  constructor(args:{|
    question?:        Pronoun|void,
    agent:            Noun,
    indirectPronoun?: Pronoun|void,
    directPronoun?:   Pronoun|void,
    conjugation:      RegularConjugation,
    indirect?:        NameNoun|void,
    direct:           NameNoun,
  |}) {
    this.question        = args.question
    this.agent           = args.agent
    this.indirectPronoun = args.indirectPronoun
    this.directPronoun   = args.directPronoun
    this.conjugation     = args.conjugation
    this.indirect        = args.indirect
    this.direct          = args.direct
  }

  words(): Array<string> {
    return []
      .concat(this.question !== undefined ? ['¿']: [])
      .concat(this.question !== undefined ? this.question.words() : [])
      .concat(this.agent.words())
      .concat(this.indirectPronoun !== undefined ? this.indirectPronoun.words() : [])
      .concat(this.directPronoun !== undefined ? this.directPronoun.words() : [])
      .concat(this.conjugation.words())
      .concat(this.direct.words())
      .concat(this.indirect !== undefined ? ['a'].concat(this.indirect.words()) : [])
      .concat(this.question !== undefined ? ['?']: [])
  }
}

function translate(iclause:IClause, tense:Tense, pronouns:Pronouns,
    refToPreferredPronouns:{[ref: string]: PreferredPronouns}) {
  const infinitive = {
    want: 'querer',
    need: 'necesitar',
    have: 'tener',
    give: 'dar',
  }[iclause.verb] || raise("Can't find infinitive for verb " + iclause.verb)

  const [person, number, isAgentSpecific] = pronouns.lookupAgent(iclause.agent,
    refToPreferredPronouns)

  const pattern = regular_conjugation_pattern_table.find(
    infinitive, tense, person, number)

  const [indirectPronoun, isIndirectPronounSpecific] =
    pronouns.lookupIndirectObj(iclause.indirect, iclause.agent, refToPreferredPronouns)

  let [directPronoun, isDirectPronounSpecific] = [undefined, false]
  if (iclause.question !== iclause.direct) {
    [directPronoun, isDirectPronounSpecific] =
      pronouns.lookupDirectObj(iclause.direct, iclause.agent, refToPreferredPronouns)
  }

  const question = (iclause.question === undefined) ? undefined :
    (iclause.question === 'What') ? new Pronoun('qué') :
    raise("Unknown question type " + iclause.question)

  return new IClauseOrder({
    agent:       isAgentSpecific ?
                   new OmittedNoun(iclause.agent) : new NameNoun(iclause.agent),
    conjugation: new RegularConjugation({ infinitive, pattern }),
    indirect:    !isIndirectPronounSpecific && iclause.indirect !== undefined ?
                   new NameNoun(iclause.indirect) : undefined,
    direct:      isDirectPronounSpecific || iclause.question === iclause.direct ?
                   new OmittedNoun(iclause.direct) : new NameNoun(iclause.direct),
    question, indirectPronoun, directPronoun,
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
