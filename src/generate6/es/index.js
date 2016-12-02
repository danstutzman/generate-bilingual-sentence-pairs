// @flow
import type { Tense, PreferredPronouns } from './types'
import type { Ref } from '../types'
import type { EsNounPhrase } from './noun_phrases'

const { IClause } = require('../uni/iclause')
const { raise } = require('../raise')
const RegularConjugation = require('./RegularConjugation')
const regular_conjugation_pattern_table = require('./regular_conjugation_pattern_table')
const { RegularConjugationPattern } = regular_conjugation_pattern_table
const { join } = require('./join')
const Pronoun = require('./Pronoun')
const Pronouns = require('./Pronouns')
const { NameNoun, EsNounClause, translateNounPhrase } = require('./noun_phrases')
const { expectString } = require('../types')

class IClauseOrder {
  question:        Pronoun|void
  agent:           EsNounPhrase
  indirectPronoun: Pronoun|void
  directPronoun:   Pronoun|void
  conjugation:     RegularConjugation
  indirect:        EsNounPhrase|void
  direct:          EsNounPhrase

  constructor(args:{|
    question?:        Pronoun|void,
    agent:            EsNounPhrase,
    indirectPronoun?: Pronoun|void,
    directPronoun?:   Pronoun|void,
    conjugation:      RegularConjugation,
    indirect?:        EsNounPhrase|void,
    direct:           EsNounPhrase,
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
      .concat(!(this.direct instanceof EsNounClause) ? this.direct.words() : [])
      .concat(this.indirect !== undefined && !this.indirect.omit ?
        ['a'].concat(this.indirect.words()) : [])
      .concat(this.direct instanceof EsNounClause ? this.direct.words() : [])
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
    tell: 'decir',
  }[iclause.verb] || raise("Can't find infinitive for verb " + iclause.verb)

  let person
  let number
  let isAgentSpecific
  if (typeof iclause.agent === 'string') {
    [person, number, isAgentSpecific] = pronouns.lookupAgent(iclause.agent,
      refToPreferredPronouns)
  } else {
    [person, number, isAgentSpecific] = [3, 1, false]
  }

  const pattern = regular_conjugation_pattern_table.find(
    infinitive, tense, person, number)

  let indirectPronoun
  let isIndirectPronounSpecific = false
  if (typeof iclause.indirect === 'string') {
    [indirectPronoun, isIndirectPronounSpecific] =
      pronouns.lookupIndirectObj(iclause.indirect,
        typeof iclause.agent === 'string' ? iclause.agent : undefined,
        refToPreferredPronouns)
  }

  let [directPronoun, isDirectPronounSpecific] = [undefined, false]
  if (iclause.question !== iclause.direct &&
      typeof iclause.direct === 'string') {
    [directPronoun, isDirectPronounSpecific] =
      pronouns.lookupDirectObj(iclause.direct,
        typeof iclause.agent === 'string' ? iclause.agent : undefined,
        refToPreferredPronouns)
  }

  const question = (iclause.question === undefined) ? undefined :
    (iclause.question === 'What') ? new Pronoun('qué') :
    raise("Unknown question type " + iclause.question)

  return new IClauseOrder({
    agent:       translateNounPhrase(iclause.agent).setOmit(isAgentSpecific),
    conjugation: new RegularConjugation({ infinitive, pattern }),
    indirect:    iclause.indirect === undefined ? undefined :
                   translateNounPhrase(iclause.indirect)
                     .setOmit(isIndirectPronounSpecific),
    direct:      translateNounPhrase(iclause.direct).setOmit(isDirectPronounSpecific ||
                     iclause.question === iclause.direct),
    question, indirectPronoun, directPronoun,
  })
}

module.exports = {
  IClauseOrder,
  NameNoun,
  Pronouns,
  RegularConjugation,
  RegularConjugationPattern,
  join,
  translate,
}
