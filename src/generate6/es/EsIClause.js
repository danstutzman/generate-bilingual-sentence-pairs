// @flow
import type { EsNounPhrase } from './noun_phrases'
import type { Conjugation } from './conjugation'

const EsPronoun        = require('./EsPronoun')
const { EsNounClause } = require('./noun_phrases')

class EsIClause {
  question:        EsPronoun|void
  agent:           EsNounPhrase
  indirectPronoun: EsPronoun|void
  directPronoun:   EsPronoun|void
  conjugation:     Conjugation
  indirect:        EsNounPhrase|void
  direct:          EsNounPhrase

  constructor(args:{|
    question?:        EsPronoun|void,
    agent:            EsNounPhrase,
    indirectPronoun?: EsPronoun|void,
    directPronoun?:   EsPronoun|void,
    conjugation:      Conjugation,
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

module.exports = EsIClause
