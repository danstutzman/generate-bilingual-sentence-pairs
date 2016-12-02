// @flow
import type { Ref } from '../types'
import type { NounPhrase } from '../uni/noun_phrases'

const { NounClause } = require('../uni/noun_phrases')
const EsIClause = require('./EsIClause')

class NameNoun {
  ref:  Ref
  omit: bool

  constructor(ref:Ref) {
    this.ref = ref
  }
  setOmit(omit:bool): NameNoun {
    this.omit = omit
    return this
  }
  words(): Array<string> {
    return this.omit ? [] : [this.ref]
  }
}

class EsNounClause {
  iclause: EsIClause
  omit:    bool

  constructor(iclause:EsIClause) {
    this.iclause = iclause
  }
  setOmit(omit:bool): EsNounClause {
    this.omit = omit
    return this
  }
  words(): Array<string> {
    return ['que'].concat(this.iclause.words())
  }
}

export type EsNounPhrase = NameNoun | EsNounClause

module.exports = { NameNoun, EsNounClause }
