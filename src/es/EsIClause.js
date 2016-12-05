// @flow
import type { EsNP } from './noun_phrases'
import type { Conjugation } from './verbs'

const EsPronoun        = require('./EsPronoun')
const { EsNClause } = require('./noun_phrases')

class EsIClause {
  agent:           EsNP
  indirectPronoun: EsPronoun|void
  directPronoun:   EsPronoun|void
  conjugation:     Conjugation
  indirect:        EsNP|void
  direct:          EsNP
  negative:        bool|void
  verbFirst:       bool

  constructor(args:{|
    agent:            EsNP,
    indirectPronoun?: EsPronoun|void,
    directPronoun?:   EsPronoun|void,
    conjugation:      Conjugation,
    indirect?:        EsNP|void,
    direct:           EsNP,
    negative?:        bool,
  |}) {
    this.agent           = args.agent
    this.indirectPronoun = args.indirectPronoun
    this.directPronoun   = args.directPronoun
    this.conjugation     = args.conjugation
    this.indirect        = args.indirect
    this.direct          = args.direct
    this.negative        = args.negative
  }

  setVerbFirst(verbFirst:bool): EsIClause {
    this.verbFirst = verbFirst
    return this
  }

  words(): Array<string> {
    return []
      .concat(!this.verbFirst ? this.agent.words() : [])
      .concat(this.negative ? ['no'] : [])
      .concat(this.indirectPronoun !== undefined ? this.indirectPronoun.words() : [])
      .concat(this.directPronoun !== undefined ? this.directPronoun.words() : [])
      .concat(this.conjugation.words())
      .concat(this.verbFirst ? this.agent.words() : [])
      .concat(!(this.direct instanceof EsNClause) ? this.direct.words() : [])
      .concat(this.indirect !== undefined && !this.indirect.omit ?
        ['a'].concat(this.indirect.words()) : [])
      .concat(this.direct instanceof EsNClause ? this.direct.words() : [])
  }
  skills(): Array<[string,string]> {
    return []
      .concat(!this.verbFirst ? this.agent.skills() : [])
      .concat(this.negative ? [['prod-ic-no', 'no']] : [])
      .concat(this.indirectPronoun !== undefined ?
        [['prod-ic-pos-iopro', '']].concat(this.indirectPronoun.skills()) : [])
      .concat(this.directPronoun !== undefined ?
        [['prod-ic-pos-dopro', '']].concat(this.directPronoun.skills()) : [])
      .concat(this.conjugation.skills())
      .concat(this.verbFirst ?
        [['prod-ic-pos-agent','']].concat(this.agent.skills()) : [])
      .concat(!(this.direct instanceof EsNClause) ? this.direct.skills() : [])
      .concat(this.indirect !== undefined && !this.indirect.omit ?
        [['prod-ic-aforio', 'a']].concat(this.indirect.words()) : [])
      .concat(this.direct instanceof EsNClause ? this.direct.skills() : [])
  }
}

module.exports = EsIClause
