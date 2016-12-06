// @flow
import type { Skill } from '../types'
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
  direct:          EsNP|void
  negative:        bool|void
  verbFirst:       bool

  constructor(args:{|
    agent:            EsNP,
    indirectPronoun?: EsPronoun|void,
    directPronoun?:   EsPronoun|void,
    conjugation:      Conjugation,
    indirect?:        EsNP|void,
    direct?:          EsNP|void,
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
      .concat(this.direct !== undefined && !(this.direct instanceof EsNClause) ?
        this.direct.words() : [])
      .concat(this.indirect !== undefined && !this.indirect.omit ?
        ['a'].concat(this.indirect.words()) : [])
      .concat(this.direct instanceof EsNClause ? this.direct.words() : [])
  }
  skills(): Array<[Skill,string]> {
    return []
      .concat(!this.verbFirst ? this.agent.skills() : [])
      .concat(this.negative ? [['iclause-orderof-no', 'no']] : [])
      .concat(this.indirectPronoun !== undefined ?
        [['iclause-orderof-io-pro', '']].concat(this.indirectPronoun.skills()) : [])
      .concat(this.directPronoun !== undefined ?
        [['iclause-orderof-do-pro', '']].concat(this.directPronoun.skills()) : [])
      .concat(this.conjugation.skills())
      .concat(this.verbFirst ? this.agent.skills() : [])
      .concat(this.direct !== undefined && !(this.direct instanceof EsNClause) ?
        this.direct.skills() : [])
      .concat(this.indirect !== undefined && !this.indirect.omit ?
        [['iclause-orderof-io-a', 'a']].concat(this.indirect.words()) : [])
      .concat(this.direct instanceof EsNClause ? this.direct.skills() : [])
  }
}

module.exports = EsIClause
