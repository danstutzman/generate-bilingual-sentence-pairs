// @flow
import type { EsNounPhrase } from './noun_phrases'
import type { Conjugation } from './verbs'

const EsPronoun        = require('./EsPronoun')
const { EsNounClause } = require('./noun_phrases')

class EsIClause {
  agent:           EsNounPhrase
  indirectPronoun: EsPronoun|void
  directPronoun:   EsPronoun|void
  conjugation:     Conjugation
  indirect:        EsNounPhrase|void
  direct:          EsNounPhrase
  negative:        bool

  constructor(args:{|
    agent:            EsNounPhrase,
    indirectPronoun?: EsPronoun|void,
    directPronoun?:   EsPronoun|void,
    conjugation:      Conjugation,
    indirect?:        EsNounPhrase|void,
    direct:           EsNounPhrase,
    negative:         bool,
  |}) {
    this.agent           = args.agent
    this.indirectPronoun = args.indirectPronoun
    this.directPronoun   = args.directPronoun
    this.conjugation     = args.conjugation
    this.indirect        = args.indirect
    this.direct          = args.direct
    this.negative        = args.negative
  }

  words(): Array<string> {
    return []
      .concat(this.negative ? ['no'] : [])
      .concat(this.agent.words())
      .concat(this.indirectPronoun !== undefined ? this.indirectPronoun.words() : [])
      .concat(this.directPronoun !== undefined ? this.directPronoun.words() : [])
      .concat(this.conjugation.words())
      .concat(!(this.direct instanceof EsNounClause) ? this.direct.words() : [])
      .concat(this.indirect !== undefined && !this.indirect.omit ?
        ['a'].concat(this.indirect.words()) : [])
      .concat(this.direct instanceof EsNounClause ? this.direct.words() : [])
  }
}

module.exports = EsIClause
