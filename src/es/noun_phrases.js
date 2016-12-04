// @flow
import type { Ref } from '../types'

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

class EsNClause {
  headWords: Array<string>
  iclause:   EsIClause
  omit:      bool

  constructor(headWords:Array<string>, iclause:EsIClause) {
    this.headWords = headWords
    this.iclause   = iclause
  }
  setOmit(omit:bool): EsNClause {
    this.omit = omit
    return this
  }
  words(): Array<string> {
    return this.headWords.concat(this.iclause.words())
  }
}

export type EsNP = NameNoun | EsNClause

module.exports = { NameNoun, EsNClause }
